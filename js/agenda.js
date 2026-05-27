import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDTslJvs8MrEYdrJhQD-ev19d06WSPSeTI",
  authDomain: "agenda-51723.firebaseapp.com",
  projectId: "agenda-51723",
  storageBucket: "agenda-51723.firebasestorage.app",
  messagingSenderId: "273930695051",
  appId: "1:273930695051:web:8ab3688c7263a3e689bf8e",
  measurementId: "G-RL47Y6PPJ8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const tasksDoc = doc(db, 'agenda', 'tasks');

let tasks = [];
let filter = 'all';
let selectedTag = '';
let saving = false;

const STORAGE_KEY = 'tasks_v1';
const FIREBASE_ENABLED = true;

async function storageGet(key) {
  if (FIREBASE_ENABLED) {
    try {
      const snapshot = await getDoc(tasksDoc);
      if (snapshot.exists()) {
        const data = snapshot.data();
        const tasksArray = Array.isArray(data.tasks) ? data.tasks : Object.values(data.tasks || {});
        return { value: JSON.stringify(tasksArray) };
      }
    } catch (e) {
      console.warn('Firebase read failed:', e);
    }
  }

  return { value: localStorage.getItem(key) };
}

async function storageSet(key, value) {
  if (FIREBASE_ENABLED) {
    try {
      const items = JSON.parse(value);
      await setDoc(tasksDoc, {
        tasks: Array.from(items),
        updatedAt: new Date().toISOString()
      });
      return;
    } catch (e) {
      console.warn('Firebase save failed:', e);
    }
  }

  localStorage.setItem(key, value);
}

async function loadTasks() {
  try {
    const result = await storageGet(STORAGE_KEY);
    if (result && result.value) {
      tasks = JSON.parse(result.value);
    }
  } catch (e) {
    tasks = [];
  }
  render();
}

async function saveTasks() {
  if (saving) return;
  saving = true;
  const status = document.getElementById('db-status');
  status.innerHTML = '<span class="db-dot" style="background:#BA7517"></span> Guardando en Firebase…';
  try {
    await storageSet(STORAGE_KEY, JSON.stringify(tasks));
    status.innerHTML = '<span class="db-dot"></span> Guardado en Firebase';
    setTimeout(() => { status.innerHTML = '<span class="db-dot"></span> Base de datos conectada'; }, 1200);
  } catch (e) {
    status.innerHTML = '<span class="db-dot" style="background:#E24B4A"></span> Error al guardar';
  }
  saving = false;
}

function selectTag(t) {
  selectedTag = t;
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('sel-work','sel-personal','sel-urgent','sel-none'));
  if (t) {
    const el = document.getElementById('tag-' + t);
    if (el) el.classList.add('sel-' + t);
  } else {
    const none = document.getElementById('tag-none');
    if (none) none.classList.add('sel-none');
  }
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('f-' + f);
  if (el) el.classList.add('active');
  render();
}

function addTask() {
  const newTaskInput = document.getElementById('new-task');
  const dateInput = document.getElementById('new-task-date');
  const text = newTaskInput.value.trim();
  const due = dateInput.value || null;
  if (!text) return;
  const task = { id: Date.now().toString(), text, due, tag: selectedTag, done: false };
  tasks.unshift(task);
  newTaskInput.value = '';
  render();
  saveTasks();
}

function toggleDone(id) {
  const t = tasks.find(x => x.id === id);
  if (t) t.done = !t.done;
  render();
  saveTasks();
}

function clearDone() {
  tasks = tasks.filter(t => !t.done);
  render();
  saveTasks();
}

function render() {
  const list = document.getElementById('todo-list');
  list.innerHTML = '';
  const visible = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  if (visible.length === 0) {
    list.innerHTML = '<div class="empty"><i class="ti ti-calendar"></i>No hay tareas aún</div>';
    document.getElementById('bulk-bar').style.display = 'none';
    document.getElementById('stat-total').textContent = tasks.length;
    document.getElementById('stat-pending').textContent = tasks.filter(t => !t.done).length;
    document.getElementById('stat-done').textContent = tasks.filter(t => t.done).length;
    return;
  }

  visible.forEach(task => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (task.done ? ' done' : '');
    item.innerHTML = `
      <div class="todo-check ${task.done ? 'checked' : ''}" tabindex="0" role="button" aria-pressed="${task.done}"></div>
      <div class="todo-text ${task.done ? 'done' : ''}">${task.text}</div>
      <div class="todo-meta">${task.due || ''}</div>
      <button class="todo-del" data-id="${task.id}">✕</button>
    `;
    list.appendChild(item);
    item.querySelector('.todo-check').addEventListener('click', () => toggleDone(task.id));
    item.querySelector('.todo-del').addEventListener('click', () => { tasks = tasks.filter(t => t.id !== task.id); render(); saveTasks(); });
  });

  document.getElementById('bulk-bar').style.display = tasks.some(t => t.done) ? 'flex' : 'none';
  document.getElementById('bulk-info').textContent = `${tasks.filter(t => t.done).length} completadas`;
  document.getElementById('stat-total').textContent = tasks.length;
  document.getElementById('stat-pending').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('stat-done').textContent = tasks.filter(t => t.done).length;
}

// Smooth scroll anchors
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, null, href);
      }
    }
  });
});

// initial setup
document.getElementById('new-task').addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });
document.getElementById('new-task').focus();
document.getElementById('tag-none').addEventListener('click', () => selectTag(''));
document.getElementById('tag-work').addEventListener('click', () => selectTag('work'));
document.getElementById('tag-personal').addEventListener('click', () => selectTag('personal'));
document.getElementById('tag-urgent').addEventListener('click', () => selectTag('urgent'));
document.getElementById('f-all').addEventListener('click', () => setFilter('all'));
document.getElementById('f-pending').addEventListener('click', () => setFilter('pending'));
document.getElementById('f-done').addEventListener('click', () => setFilter('done'));
document.getElementById('bulk-bar').querySelector('button').addEventListener('click', clearDone);

window.addTask = addTask;
window.selectTag = selectTag;
window.setFilter = setFilter;
window.clearDone = clearDone;

loadTasks();
