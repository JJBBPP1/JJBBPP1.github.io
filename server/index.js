const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

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

// health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Agenda backend listening on http://localhost:${PORT}`);
});
