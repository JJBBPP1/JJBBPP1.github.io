import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const ADMIN_EMAILS = ['javierbravopintado06@gmail.com'];

export async function checkAdminAccess() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('No user logged in');
        resolve(false);
        return;
      }

      // Verificar si el email está en la lista de admins
      if (ADMIN_EMAILS.includes(user.email)) {
        console.log(`Admin access granted for ${user.email}`);
        resolve(true);
        return;
      }

      // Verificar el rol en Firestore como respaldo
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          console.log(`Admin access granted (Firestore role) for ${user.email}`);
          resolve(true);
          return;
        }
      } catch (error) {
        console.warn('Error checking Firestore role:', error);
      }

      console.log(`Access denied for ${user.email}`);
      resolve(false);
    });
  });
}

export function redirectIfNotAdmin() {
  checkAdminAccess().then(isAdmin => {
    if (!isAdmin) {
      alert('Acceso denegado. Solo administradores pueden acceder a este panel.');
      window.location.href = './plan-empresa.html';
    }
  });
}

export function showAdminPanel(user) {
  const adminLink = document.getElementById('admin-only-link');
  if (adminLink && ADMIN_EMAILS.includes(user.email)) {
    adminLink.classList.remove('hidden');
  }
}
