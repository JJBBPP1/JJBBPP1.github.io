import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const ADMIN_EMAILS = ['javierbravopintado06@gmail.com'];

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const authState = document.getElementById('auth-state');
const authEmail = document.getElementById('auth-email');
const signOutBtn = document.getElementById('sign-out-btn');
const planLinkMessage = document.getElementById('plan-link-message');

function showMessage(element, text, success = true) {
  if (!element) return;
  element.textContent = text;
  element.classList.add('visible');
  element.style.color = success ? 'var(--success)' : 'var(--error)';
  setTimeout(() => {
    element.classList.remove('visible');
  }, 5000);
}

async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid), data, { merge: true });
}

export async function saveSelectedPlan(plan) {
  if (!auth.currentUser) {
    showMessage(loginMessage, 'Inicia sesión para guardar tu plan.', false);
    return;
  }
  try {
    await updateUserProfile({ selectedPlan: plan, planSavedAt: serverTimestamp() });
    showMessage(planLinkMessage, `Plan ${plan} vinculado a tu cuenta.`);
  } catch (error) {
    console.error(error);
    showMessage(planLinkMessage, 'No se pudo guardar el plan en la base de datos.', false);
  }
}

function showLoggedOutState() {
  if (authState) authState.classList.add('hidden');
  if (loginForm) loginForm.style.display = 'grid';
  if (registerForm) registerForm.style.display = 'grid';
  if (authEmail) authEmail.textContent = '';
  
  // Ocultar botones de admin
  const adminButtons = document.getElementById('admin-buttons');
  const adminNavBtn = document.getElementById('admin-nav-btn');
  if (adminButtons) adminButtons.classList.add('hidden');
  if (adminNavBtn) adminNavBtn.classList.add('hidden');
}

async function showLoggedInState(user) {
  if (authState) authState.classList.remove('hidden');
  if (authEmail) authEmail.textContent = user.email;
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  
  // Verificar si es admin
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const adminButtons = document.getElementById('admin-buttons');
  const adminNavBtn = document.getElementById('admin-nav-btn');
  
  if (isAdmin) {
    if (adminButtons) adminButtons.classList.remove('hidden');
    if (adminNavBtn) adminNavBtn.classList.remove('hidden');
    console.log('Admin buttons shown for', user.email);
  } else {
    if (adminButtons) adminButtons.classList.add('hidden');
    if (adminNavBtn) adminNavBtn.classList.add('hidden');
  }
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data?.selectedPlan) {
        showMessage(planLinkMessage, `Tu plan guardado: ${data.selectedPlan}`);
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar el perfil del usuario.', error);
  }
}

if (signOutBtn) {
  signOutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showMessage(loginMessage, 'Sesión cerrada correctamente.', true);
    } catch (error) {
      showMessage(loginMessage, 'Error al cerrar sesión. Revisa la consola.', false);
      console.error(error);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showMessage(loginMessage, 'Por favor completa usuario y contraseña.', false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage(loginMessage, '✓ Sesión iniciada correctamente.');
      // Actualizar estado local inmediatamente para mostrar botones de admin
      if (auth.currentUser) {
        try {
          // llamar a la función que actualiza el estado mostrada en la sesión
          const user = auth.currentUser;
          // si existe, invocar el manejador para UI
          if (typeof showLoggedInState === 'function') showLoggedInState(user);
        } catch (err) {
          console.warn('No se pudo actualizar el estado inmediatamente:', err);
        }
      }
    } catch (error) {
      console.error(error);
      showMessage(loginMessage, 'Error de inicio de sesión. Comprueba tus credenciales.', false);
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;

    if (!email || !password || !confirmPassword) {
      showMessage(registerMessage, 'Completa todos los campos para registrarte.', false);
      return;
    }

    if (password !== confirmPassword) {
      showMessage(registerMessage, 'Las contraseñas no coinciden.', false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Asignar rol admin si el email está en la lista de admins
      const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        role: role
      });
      showMessage(registerMessage, '✓ Usuario registrado y guardado en la base de datos. Ya puedes iniciar sesión.');
      registerForm.reset();
    } catch (error) {
      console.error('Registro Firebase error:', error.code, error.message);
      let errorText = 'Error al registrar usuario. Intenta de nuevo.';
      if (error.code === 'auth/email-already-in-use') {
        errorText = 'Este correo ya está en uso. Inicia sesión o usa otro email.';
      } else if (error.code === 'auth/invalid-email') {
        errorText = 'El correo no es válido. Usa un formato correcto.';
      } else if (error.code === 'auth/weak-password') {
        errorText = 'La contraseña es muy débil. Usa al menos 6 caracteres.';
      }
      showMessage(registerMessage, `${errorText} (${error.code})`, false);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInState(user);
  } else {
    showLoggedOutState();
  }
});
