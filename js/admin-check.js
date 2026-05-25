import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

export async function checkAdminAccess() {
  return Promise.resolve(true);
}

export function redirectIfNotAdmin() {
  // Sin restricciones
  console.log('Admin check disabled - free access');
}

export function showAdminPanel(user) {
  const adminLink = document.getElementById('admin-only-link');
  if (adminLink) {
    adminLink.classList.remove('hidden');
  }
}
