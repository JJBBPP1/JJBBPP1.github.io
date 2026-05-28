import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const ADMIN_EMAILS = ['javierbravopintado06@gmail.com'];

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const authState = document.getElementById('auth-state');
const authEmail = document.getElementById('auth-email');
const signOutBtn = document.getElementById('sign-out-btn');
const planLinkMessage = document.getElementById('plan-link-message');

// Función reutilizable para alertas visuales dinámicas
function showMessage(element, text, success = true) {
  if (!element) return;
  element.textContent = text;
  element.classList.add('visible');
  element.style.color = success ? 'var(--success, #10b981)' : 'var(--error, #ef4444)';
  
  // Si es un elemento de formulario estándar, forzar que se vea
  if (element.classList.contains('form-message')) {
    element.style.display = 'block';
  }

  setTimeout(() => {
    element.classList.remove('visible');
    // Si queremos limpiar el texto tras ocultarlo, podemos descomentar la línea siguiente:
    // element.textContent = '';
  }, 6000);
}

async function updateUserProfile(data) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(doc(db, 'users', user.uid), data, { merge: true });
}

/**
 * Guarda un plan en la colección 'planes_usuarios' de Firestore
 */
export async function guardarPlanEnBaseDatos(tipoPlan, datosPlan) {
  const usuarioActual = auth.currentUser;
  
  // VERIFICACIÓN CRÍTICA: Si no hay usuario, abortamos y avisamos en pantalla
  if (!usuarioActual) {
    showMessage(planLinkMessage, '❌ Debes iniciar sesión en la sección "Mi Cuenta" para adquirir un plan.', false);
    document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
    return null;
  }

  try {
    const planDocumento = {
      usuarioUid: usuarioActual.uid,
      usuarioEmail: usuarioActual.email,
      tipoSolicitud: tipoPlan,
      detalles: datosPlan,
      fechaCreacion: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'planes_usuarios'), planDocumento);
    console.log('✓ Plan guardado con éxito en Firestore. ID:', docRef.id);
    showMessage(planLinkMessage, `¡Plan ${tipoPlan === 'seleccionado' ? datosPlan.nombre.toUpperCase() : 'Personalizado'} guardado con éxito!`);
    return docRef.id;
  } catch (error) {
    console.error('Error directo al escribir en Firestore:', error);
    showMessage(planLinkMessage, 'No se pudo guardar la solicitud en la base de datos. Revisa tus reglas de seguridad.', false);
    return null;
  }
}

// Funciones puente para llamadas desde listeners
export async function seleccionarPlanPredefinido(nombrePlan, precio = null) {
  const datos = { nombre: nombrePlan, precio: precio, personalizado: false };
  const docId = await guardarPlanEnBaseDatos('seleccionado', datos);
  
  if (docId && auth.currentUser) {
    try {
      await updateUserProfile({ selectedPlan: nombrePlan, planSavedAt: serverTimestamp() });
    } catch (err) {
      console.warn('Perfil actualizado parcialmente:', err);
    }
  }
}

export async function guardarPlanPersonalizado(configuracion) {
  await guardarPlanEnBaseDatos('personalizado', configuracion);
}

// Manejo unificado de interfaces basadas en autenticación
function showLoggedOutState() {
  if (authState) authState.classList.add('hidden');
  if (loginForm) loginForm.style.display = 'grid';
  if (registerForm) registerForm.style.display = 'none';
  if (authEmail) authEmail.textContent = '';
  const loginFooter = document.querySelector('.login-footer');
  const registerFooter = document.querySelector('.register-footer');
  if (loginFooter) loginFooter.style.display = 'block';
  if (registerFooter) registerFooter.style.display = 'none';
  
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
  
  // Verificar privilegios administrativos
  const isAdmin = ADMIN_EMAILS.includes(user.email);
  const adminButtons = document.getElementById('admin-buttons');
  const adminNavBtn = document.getElementById('admin-nav-btn');
  
  if (isAdmin) {
    if (adminButtons) adminButtons.classList.remove('hidden');
    if (adminNavBtn) adminNavBtn.classList.remove('hidden');
    console.log('Modo administrador activado para:', user.email);
  } else {
    if (adminButtons) adminButtons.classList.add('hidden');
    if (adminNavBtn) adminNavBtn.classList.add('hidden');
  }
  // Hide footer toggles when logged in
  const loginFooter = document.querySelector('.login-footer');
  const registerFooter = document.querySelector('.register-footer');
  if (loginFooter) loginFooter.style.display = 'none';
  if (registerFooter) registerFooter.style.display = 'none';
  
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data?.selectedPlan) {
        showMessage(planLinkMessage, `Tu plan activo: ${data.selectedPlan.toUpperCase()}`);
      }
    }
  } catch (error) {
    console.warn('El perfil de usuario no pudo ser leído de Firestore.', error);
  }
}

// Logouts activos
if (signOutBtn) {
  signOutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      showMessage(loginMessage, 'Sesión cerrada correctamente.', true);
    } catch (error) {
      showMessage(loginMessage, 'Error al cerrar sesión.', false);
      console.error(error);
    }
  });
}

// Logins activos
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showMessage(loginMessage, 'Por favor completa usuario y contraseña.', false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showMessage(loginMessage, '✓ Sesión iniciada correctamente.');
      // DEJAMOS QUE EL OBSERVADOR REACTIVO (onAuthStateChanged) MANEJE LA UI AUTOMÁTICAMENTE
    } catch (error) {
      console.error("Error de login:", error);
      showMessage(loginMessage, 'Error de inicio de sesión. Comprueba tus credenciales.', false);
    }
  });
}

// Registros de nuevas cuentas
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value.trim();
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

    // Verificar aceptación de política de privacidad
    const privacyAccepted = document.getElementById('register-privacy')?.checked;
    if (!privacyAccepted) {
      showMessage(registerMessage, 'Debes aceptar las políticas de privacidad.', false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
      
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        role: role,
        privacyAccepted: true,
        privacyAcceptedAt: serverTimestamp()
      });

      showMessage(registerMessage, '✓ Cuenta creada con éxito. Iniciando sesión...');
      registerForm.reset();
    } catch (error) {
      console.error('Registro Firebase error:', error.code, error.message);
      let errorText = 'Error al registrar usuario.';
      if (error.code === 'auth/email-already-in-use') {
        errorText = 'Este correo ya está en uso.';
      } else if (error.code === 'auth/invalid-email') {
        errorText = 'El formato del correo no es válido.';
      } else if (error.code === 'auth/weak-password') {
        errorText = 'La contraseña debe tener al menos 6 caracteres.';
      }
      showMessage(registerMessage, `${errorText}`, false);
    }
  });
}

// El único y verdadero motor de cambios de estado en Firebase
onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedInState(user);
  } else {
    showLoggedOutState();
  }
});

// --- CAPTURA DE EVENTOS DOM DE INTERFAZ ---
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Manejo de tarjetas predefinidas
  const botonesPlanes = document.querySelectorAll('.auth-plan-select');
  botonesPlanes.forEach(boton => {
    boton.addEventListener('click', async (e) => {
      e.preventDefault();
      const tipoPlan = boton.getAttribute('data-plan');
      if (tipoPlan === 'personalizado') return;

      const precioAttr = boton.getAttribute('data-price') || "0.00";
      const precioFormateado = `€${precioAttr}/mes`;

      if (!auth.currentUser) {
        showMessage(planLinkMessage, '❌ Por favor, inicia sesión para adquirir un plan.', false);
        document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      console.log(`Intentando guardar plan predefinido: ${tipoPlan} (${precioFormateado})`);

      try {
        boton.disabled = true;
        await seleccionarPlanPredefinido(tipoPlan, precioFormateado);
      } catch (err) {
        console.error('Error al tramitar plan predefinido:', err);
        showMessage(planLinkMessage, 'Hubo un error al procesar tu solicitud.', false);
      } finally {
        boton.disabled = false;
      }
    });
  });

  // 2. Formulario Personalizado Completo
  const formularioPersonalizado = document.querySelector('.auth-custom-form');
  if (formularioPersonalizado) {
    formularioPersonalizado.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!auth.currentUser) {
        const msgErr = document.getElementById('custom-form-message');
        showMessage(msgErr, '❌ Debes iniciar sesión en la plataforma para enviar propuestas.', false);
        document.getElementById('login')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const serverName = document.getElementById('server-name').value;
      const serverGame = document.getElementById('server-game').value;

      if (!serverName || !serverGame) {
        const msgErr = document.getElementById('custom-form-message');
        showMessage(msgErr, 'Por favor, rellena los campos obligatorios.', false);
        return;
      }

      const ram = document.getElementById('server-ram').value + ' GB';
      const storage = document.getElementById('server-storage').value + ' GB';
      const players = document.getElementById('server-players').value;
      const supportLevel = document.getElementById('server-support').value;
      const precioEstimadoElem = document.getElementById('estimated-price');
      const precioEstimado = precioEstimadoElem ? precioEstimadoElem.textContent : '0.00';

      const configuracionPlan = {
        nombreServidor: serverName,
        juego: serverGame,
        ram,
        almacenamiento: storage,
        jugadoresSimultaneos: players,
        nivelSoporte: supportLevel,
        precioFinalEstimado: `€${precioEstimado}/mes`,
        caracteristicasExtra: []
      };

      formularioPersonalizado.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        configuracionPlan.caracteristicasExtra.push({
          name: cb.name || cb.value,
          price: parseFloat(cb.getAttribute('data-price')) || 0
        });
      });

      try {
        const submitBtn = formularioPersonalizado.querySelector('button[type="submit"]');
        if(submitBtn) submitBtn.disabled = true;

        await guardarPlanPersonalizado(configuracionPlan);
        
        const msg = document.getElementById('custom-form-message');
        showMessage(msg, '✓ Solicitud de servidor personalizado enviada correctamente.');

        formularioPersonalizado.reset();

        // Forzar disparadores para que el script plan-empresa.js reajuste los sliders visualmente
        ['server-ram','server-storage','server-players','server-support'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.dispatchEvent(new Event('input', { bubbles: true }));
        });

      } catch (err) {
        console.error('Error enviando datos de formulario:', err);
        const msg = document.getElementById('custom-form-message');
        showMessage(msg, 'Error al procesar el envío de formulario.', false);
      } finally {
        const submitBtn = formularioPersonalizado.querySelector('button[type="submit"]');
        if(submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Toggle between login and register panels
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  function openRegister(e) {
    if (e) e.preventDefault();
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'grid';
    const el = document.getElementById('register-email');
    if (el) el.focus();
    if (loginMessage) loginMessage.classList.remove('visible');
    const loginFooter = document.querySelector('.login-footer');
    const registerFooter = document.querySelector('.register-footer');
    if (loginFooter) loginFooter.style.display = 'none';
    if (registerFooter) registerFooter.style.display = 'block';
  }

  function openLogin(e) {
    if (e) e.preventDefault();
    if (registerForm) registerForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'grid';
    const el = document.getElementById('email');
    if (el) el.focus();
    if (registerMessage) registerMessage.classList.remove('visible');
    const loginFooter = document.querySelector('.login-footer');
    const registerFooter = document.querySelector('.register-footer');
    if (loginFooter) loginFooter.style.display = 'block';
    if (registerFooter) registerFooter.style.display = 'none';
  }

  if (showRegisterLink) showRegisterLink.addEventListener('click', openRegister);
  if (showLoginLink) showLoginLink.addEventListener('click', openLogin);
});