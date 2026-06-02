// =========================================================================
// CONFIGURACIÓN: CAMBIA ESTA URL POR LA QUE TE DÉ RENDER AL TERMINAR
// =========================================================================
const BACKEND_URL = 'https://jjbbpp1-github-io.onrender.com/chat';

// Cargar dinámicamente la librería Marked para procesar Markdown a HTML
const scriptMarked = document.createElement('script');
scriptMarked.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
document.head.appendChild(scriptMarked);

// Elementos del DOM
const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Array en memoria para mantener el hilo/contexto de la conversación actual
let conversationHistory = [];

// Mensaje de bienvenida cuando carga la página
window.addEventListener('DOMContentLoaded', () => {
    // Esperamos un momento corto a que Marked se cargue en el navegador
    setTimeout(() => {
        appendMessage('bot', '¡Hola! Bienvenido al asistente inteligente de mi web. Estoy entrenado para responderte sobre cualquiera de mis secciones:\n\n* **Mis ejercicios de JavaScript** y manipulación de DOM (incluyendo el acordeón interactivo).\n* **Mis apuntes de Servicios en Red** (DNS, DHCP, direccionamiento).\n* **El funcionamiento de mi calculadora** interactiva.\n* **Todo sobre mi proyecto de empresa NEXUS Gaming & Servers** y administración de servidores Minecraft.\n\n¿De qué te gustaría hablar hoy?');
    }, 500);
});

// Función para renderizar los mensajes en pantalla (¡Ahora con soporte Markdown!)
function appendMessage(role, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', role);
    
    // Si la librería Marked ya cargó, transformamos el Markdown en HTML limpio
    if (typeof marked !== 'undefined') {
        messageElement.innerHTML = marked.parse(text);
    } else {
        // Formato de respaldo por si acaso
        messageElement.innerHTML = text.replace(/\n/g, '<br>');
    }
    
    chatContainer.appendChild(messageElement);
    
    // Auto-scroll automático hacia abajo para ver la respuesta nueva
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Escuchador del envío del formulario (Enviar mensaje)
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // BLOQUEO INMEDIATO: Evita dobles clics o envíos repetidos por teclado
    userInput.disabled = true;
    sendBtn.disabled = true;

    // 1. Mostrar el mensaje del usuario en la pantalla
    appendMessage('user', messageText);
    userInput.value = ''; // Limpiar la caja de texto

    // 2. Guardar el mensaje en el historial contextual
    conversationHistory.push({ role: 'user', content: messageText });

    // 3. Crear indicador visual de "pensando..."
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'bot');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.textContent = 'Procesando consulta...';
    chatContainer.appendChild(typingIndicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // 4. Hacer la petición HTTP POST a tu backend de Render
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: conversationHistory })
        });

        if (!response.ok) {
            throw new Error('Respuesta incorrecta por parte del servidor.');
        }

        const data = await response.json();
        
        // Remover el indicador de carga si existe
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();

        // 5. Mostrar la respuesta de la IA procesada con mejores estilos
        appendMessage('bot', data.reply);

        // 6. Guardar la respuesta en el historial para el contexto continuo
        conversationHistory.push({ role: 'assistant', content: data.reply });

    } catch (error) {
        console.error('Error de conexión:', error);
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
        
        appendMessage('system-error', 'Nota del sistema: No se pudo conectar con el núcleo de IA. Si es la primera petición en un rato, el servidor gratuito de Render puede tardar unos 50 segundos en despertar. Por favor, reasienta tu duda en unos instantes.');
    } finally {
        // Reactivar el formulario de forma segura al terminar todo el flujo
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
});