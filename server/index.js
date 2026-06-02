const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Inicializar Firebase Admin si está disponible
let admin;
try {
  admin = require('firebase-admin');
  if (process.env.SERVICE_ACCOUNT_PATH) {
    const serviceAccount = require(process.env.SERVICE_ACCOUNT_PATH);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log('Firebase Admin inicializado con SERVICE_ACCOUNT_PATH');
  } else {
    // Si GOOGLE_APPLICATION_CREDENTIALS está en el entorno, admin SDK lo detectará automáticamente
    admin.initializeApp();
    console.log('Firebase Admin inicializado con credenciales del entorno');
  }
} catch (e) {
  console.warn('firebase-admin no disponible o no inicializado:', e.message || e);
}

async function readTasks() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeTasks(tasks) {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (e) {
    console.error('GET /tasks error', e);
    res.status(500).json({ error: 'failed to read tasks' });
  }
});

app.put('/tasks', async (req, res) => {
  const body = req.body;
  if (!Array.isArray(body)) {
    return res.status(400).json({ error: 'expected JSON array' });
  }
  try {
    await writeTasks(body);
    res.json({ ok: true });
  } catch (e) {
    console.error('PUT /tasks error', e);
    res.status(500).json({ error: 'failed to write tasks' });
  }
});

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY in server environment' });
  }

  const { model, max_tokens, system, messages } = req.body;
  if (!model || !system || !messages) {
    return res.status(400).json({ error: 'missing required body fields' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, max_tokens, system, messages })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (e) {
    console.error('POST /api/chat error', e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// Endpoint seguro para crear usuarios en Firebase Auth + Firestore
app.post('/admin/create-user', async (req, res) => {
  if (!admin) return res.status(500).json({ error: 'firebase-admin no inicializado en el servidor' });

  const idToken = (req.headers.authorization || '').replace('Bearer ', '').trim();
  if (!idToken) return res.status(401).json({ error: 'missing authorization token' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const callerEmail = decoded.email;
    // Lista de administradores permitidos (puedes ajustar a tu lógica)
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'javierbravopintado06@gmail.com').split(',');
    if (!ADMIN_EMAILS.includes(callerEmail)) {
      return res.status(403).json({ error: 'no autorizado' });
    }

    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({ email, password });

    // Guardar perfil en Firestore
    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: role || 'user',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerEmail
    });

    res.json({ ok: true, uid: userRecord.uid });
  } catch (err) {
    console.error('POST /admin/create-user error', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Agenda backend listening on http://localhost:${PORT}`);
});
