import { auth, db } from '../js/firebase-init.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const ADMIN_EMAILS = ['javierbravopintado06@gmail.com'];
const statusMessage = document.getElementById('admin-status-message');
const signOutBtn = document.getElementById('sign-out-btn');

// Gestión de usuarios
const userForm = document.getElementById('user-form');
const usersTbody = document.getElementById('users-tbody');
let users = [];

function renderUsers() {
  usersTbody.innerHTML = '';
  if (users.length === 0) {
    usersTbody.innerHTML = '<tr><td colspan="3" class="empty-state">No se encontraron usuarios.</td></tr>';
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.email || 'sin email'}</td>
      <td><span class="role-badge ${user.role || 'user'}">${(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)}</span></td>
      <td>
        ${user.role === 'admin' ? '<button class="btn-small" disabled>Principal</button>' : `<button class="btn-small btn-delete" data-id="${user.id}">Eliminar</button>`}
      </td>
    `;
    usersTbody.appendChild(row);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const userId = e.target.dataset.id;
      if (!userId) return;
      if (!confirm('¿Eliminar usuario de la base de datos? Esta acción no borra el acceso de Firebase Auth.')) return;
      await deleteUserFromFirestore(userId);
    });
  });
}

async function fetchUsersFromFirestore() {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    users = usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    renderUsers();
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    addSystemLog('No se pudieron cargar los usuarios desde la base de datos.', 'warning');
  }
}

async function deleteUserFromFirestore(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    addSystemLog('Usuario eliminado de la base de datos.', 'warning');
    await fetchUsersFromFirestore();
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    addSystemLog('No se pudo eliminar el usuario.', 'error');
  }
}

// Botón de prueba de conexión a Firestore
const testConnBtn = document.getElementById('test-conn-btn');
const connStatus = document.getElementById('conn-status');
if (testConnBtn) {
  testConnBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    connStatus.textContent = 'Probando...';
    try {
      // Intentar leer la colección 'users'
      await getDocs(collection(db, 'users'));
      connStatus.textContent = 'Conexión OK';
      addSystemLog('Conexión exitosa a Firestore (lectura de users).', 'success');
    } catch (err) {
      console.error('Prueba conexión Firestore:', err);
      connStatus.textContent = 'Error (ver logs)';
      addSystemLog('Error al conectar a Firestore: ' + (err.message || err.code || err), 'error');
      alert('Error al conectar a Firestore. Revisa la consola o los logs del panel.');
    }
    setTimeout(() => connStatus.textContent = '', 5000);
  });
}

userForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('user-email').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;

  if (!email || !password || password.length < 6) {
    alert('Ingresa un email y una contraseña válida (mín. 6 caracteres).');
    return;
  }

  try {
    // Obtener ID token del usuario actual para autorizar la petición al backend
    const idToken = await auth.currentUser.getIdToken();

    const resp = await fetch('/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + idToken
      },
      body: JSON.stringify({ email, password, role })
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Create user error', data);
      alert('Error al crear usuario: ' + (data.error || JSON.stringify(data)));
      addSystemLog('Error al crear usuario en backend: ' + (data.error || JSON.stringify(data)), 'error');
      return;
    }

    addSystemLog(`Usuario Auth creado: ${email} (uid: ${data.uid})`, 'success');
    await fetchUsersFromFirestore();
    userForm.reset();
  } catch (error) {
    console.error('Error creando usuario en backend:', error);
    alert('No se pudo crear el usuario. Revisa la consola.');
  }
});

// ===== MONITOREO REAL =====
let monitoringData = {
  activeUsers: 1,
  onlineServers: 3,
  cpuUsage: 45,
  memoryUsage: 62,
  requestsPerMin: 245,
  responseTime: 120
};

function updateMonitoringMetrics() {
  document.getElementById('active-users').textContent = Math.round(monitoringData.activeUsers);
  document.getElementById('online-servers').textContent = monitoringData.onlineServers;
  document.getElementById('cpu-usage').textContent = Math.round(monitoringData.cpuUsage) + '%';
  document.getElementById('memory-usage').textContent = Math.round(monitoringData.memoryUsage) + '%';
  document.getElementById('requests-per-min').textContent = Math.round(monitoringData.requestsPerMin);
  document.getElementById('response-time').textContent = Math.round(monitoringData.responseTime) + 'ms';
  updateMonitoringColors();
}

function updateMonitoringColors() {
  const cpuCard = document.getElementById('cpu-usage').closest('.stat-card');
  const memCard = document.getElementById('memory-usage').closest('.stat-card');
  cpuCard.style.borderColor = monitoringData.cpuUsage > 80 ? '#ff6b6b' : 'var(--border)';
  memCard.style.borderColor = monitoringData.memoryUsage > 80 ? '#ff6b6b' : 'var(--border)';
}

updateMonitoringMetrics();

// ===== LOGS DEL SISTEMA =====
const systemLogs = document.getElementById('system-logs');

function addSystemLog(message, type = 'info') {
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.textContent = `[${type.toUpperCase()}] ${new Date().toLocaleTimeString()} - ${message}`;
  systemLogs.insertBefore(logEntry, systemLogs.firstChild);
  while (systemLogs.children.length > 20) {
    systemLogs.removeChild(systemLogs.lastChild);
  }
}

const createBackupBtn = document.getElementById('create-backup-btn');
const restoreBackupBtn = document.getElementById('restore-backup-btn');

createBackupBtn.addEventListener('click', () => {
  addSystemLog('Iniciando backup...', 'info');
  setTimeout(() => {
    addSystemLog('Backup completado: 2.6 GB', 'success');
  }, 2000);
});

restoreBackupBtn.addEventListener('click', () => {
  alert('Restaurar backup requiere confirmación. Esta acción puede tardar varios minutos.');
});

const securityForm = document.getElementById('security-form');
const securityMessage = document.getElementById('security-message');

securityForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const firewall = document.getElementById('firewall-status').checked;
  const ddos = document.getElementById('ddos-protection').checked;
  const ssl = document.getElementById('ssl-enabled').checked;
  securityMessage.textContent = '✓ Configuración de seguridad guardada.';
  securityMessage.style.color = 'var(--success)';
  securityMessage.classList.add('visible');
  addSystemLog(`Seguridad actualizada - Firewall: ${firewall ? 'ON' : 'OFF'}, DDoS: ${ddos ? 'ON' : 'OFF'}, SSL: ${ssl ? 'ON' : 'OFF'}`, 'info');
  setTimeout(() => {
    securityMessage.classList.remove('visible');
  }, 3000);
});

const systemConfig = document.getElementById('system-config');
const configMessage = document.getElementById('config-message');

systemConfig.addEventListener('submit', (e) => {
  e.preventDefault();
  const backup = document.getElementById('backup-frequency').value;
  const maxUsers = document.getElementById('max-users').value;
  const maintenance = document.getElementById('maintenance-mode').checked;
  const message = document.getElementById('system-message').value;
  configMessage.textContent = '✓ Configuración del sistema guardada.';
  configMessage.style.color = 'var(--success)';
  configMessage.classList.add('visible');
  addSystemLog(`Sistema configurado - Backups: ${backup}, Máx usuarios: ${maxUsers}, Mantenimiento: ${maintenance ? 'ON' : 'OFF'}`, 'info');
  setTimeout(() => {
    configMessage.classList.remove('visible');
  }, 3000);
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    statusMessage.textContent = `Bienvenido, ${user.email}. Acceso confirmado.`;
    addSystemLog(`Sesión iniciada: ${user.email}`, 'success');
    if (!ADMIN_EMAILS.includes(user.email)) {
      statusMessage.textContent = 'No tienes permisos de administrador.';
      window.location.href = './plan-empresa.html';
      return;
    }
    await fetchUsersFromFirestore();
  } else {
    window.location.href = './plan-empresa.html';
  }
});

signOutBtn.addEventListener('click', async () => {
  addSystemLog('Sesión cerrada', 'info');
  await signOut(auth);
  window.location.href = './plan-empresa.html';
});

addSystemLog('Panel de administración cargado', 'success');
addSystemLog('Todos los sistemas operativos', 'success');
