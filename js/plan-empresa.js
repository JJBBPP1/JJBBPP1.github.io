import { saveSelectedPlan } from '../js/auth-handlers.js';

// Precios base por plan
const planPrices = {
  starter: 4.99,
  professional: 9.99,
  enterprise: 24.99,
  personalizado: 0
};

// Función para calcular precio dinámico
function calculateDynamicPrice() {
  const ram = parseInt(document.getElementById('server-ram').value) || 4;
  const storage = parseInt(document.getElementById('server-storage').value) || 50;
  const players = parseInt(document.getElementById('server-players').value) || 50;
  const supportLevel = document.getElementById('server-support').value;

  // Precio base según RAM y storage
  let basePrice = 4.99;
  basePrice += (ram - 2) * 0.5; // €0.50 por GB de RAM adicional
  basePrice += (storage - 20) * 0.08; // €0.08 por GB de storage adicional

  // Incremento por soporte
  const supportAddons = {
    'standard': 0,
    'premium': 3,
    '24-7': 10
  };
  basePrice += supportAddons[supportLevel] || 0;

  // Características adicionales
  let addonsPrice = 0;
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const selectedServices = [];

  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      const price = parseFloat(checkbox.getAttribute('data-price')) || 0;
      addonsPrice += price;
      selectedServices.push({
        name: checkbox.parentElement.textContent.trim(),
        price: price
      });
    }
  });

  const totalPrice = basePrice + addonsPrice;

  // Actualizar displays
  document.getElementById('estimated-price').textContent = totalPrice.toFixed(2);

  // Generar desglose
  let breakdown = `<strong>Desglose:</strong><br>`;
  breakdown += `Base (RAM + Storage): €${basePrice.toFixed(2)}<br>`;
  if (addonsPrice > 0) {
    breakdown += `Servicios: €${addonsPrice.toFixed(2)}<br>`;
    selectedServices.forEach(service => {
      breakdown += `&nbsp;&nbsp;• ${service.name.split('(')[0].trim()}: €${service.price.toFixed(2)}<br>`;
    });
  }
  breakdown += `<strong>Total: €${totalPrice.toFixed(2)}/mes</strong>`;

  document.getElementById('price-breakdown').innerHTML = breakdown;
}

// Event listeners para actualizar precio
const priceInputs = [
  'server-ram',
  'server-storage',
  'server-players',
  'server-support'
];

priceInputs.forEach(id => {
  const element = document.getElementById(id);
  if (element) {
    element.addEventListener('change', calculateDynamicPrice);
    element.addEventListener('input', calculateDynamicPrice);
  }
});

// Event listeners para checkboxes
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', calculateDynamicPrice);
});

// Calcular precio inicial
calculateDynamicPrice();

// Smooth scroll navigation with history
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

// Plan selection with visual feedback
document.querySelectorAll('.btn-plan-select').forEach(button => {
  button.addEventListener('click', function() {
    const plan = this.dataset.plan;
    if (plan === 'personalizado') {
      document.getElementById('custom-server-form').classList.add('visible');
      document.getElementById('custom-server-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
      calculateDynamicPrice();
    } else {
      document.getElementById('custom-server-form').classList.remove('visible');
      saveSelectedPlan(plan);
    }
  });
});

// Real-time slider updates
const ramEl = document.getElementById('server-ram');
if (ramEl) ramEl.addEventListener('input', (e) => {
  const el = document.getElementById('ram-value');
  if (el) el.textContent = e.target.value + ' GB';
});

const storageEl = document.getElementById('server-storage');
if (storageEl) storageEl.addEventListener('input', (e) => {
  const el = document.getElementById('storage-value');
  if (el) el.textContent = e.target.value + ' GB';
});

// Custom form submission with validation
const customForm = document.getElementById('custom-form');
if (customForm) {
  customForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const serverName = document.getElementById('server-name').value;
    const serverGame = document.getElementById('server-game').value;

    if (!serverName || !serverGame) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    const msg = document.getElementById('custom-form-message');
    msg.innerHTML = '✓ Solicitud enviada correctamente. Nuestro equipo te contactará en 24 horas.';
    msg.classList.add('visible');
    e.target.reset();
    calculateDynamicPrice();

    setTimeout(() => {
      msg.classList.remove('visible');
    }, 5000);
  });
}

// Intersection Observer para animaciones al scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, observerOptions);

document.querySelectorAll('.feature-card, .pricing-card, .contact-card').forEach(el => {
  observer.observe(el);
});
