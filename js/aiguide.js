// ============================================================
// ASISTENTE IA - Aplicaciones Web
// Versión profesional con event listeners y manejo de DOM
// ============================================================

class ChatAssistant {
  constructor() {
    this.chatEl = document.getElementById('chat');
    this.inputEl = document.getElementById('mensaje');
    this.btnEnviarEl = document.getElementById('btnEnviar');
    this.messages = [];
    this.isWaiting = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.showWelcomeMessage();
  }

  setupEventListeners() {
    // Botón Enviar
    this.btnEnviarEl.addEventListener('click', () => this.enviarMensaje());

    // Tecla Enter en input
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.enviarMensaje();
      }
    });

    // Limpiar estado de espera si el usuario escribe
    this.inputEl.addEventListener('input', () => {
      if (this.isWaiting) {
        this.isWaiting = false;
        this.btnEnviarEl.disabled = false;
      }
    });
  }

  showWelcomeMessage() {
    this.addMessage(
      'ia',
      '¡Hola! Soy tu asistente IA educativo. Puedo ayudarte con preguntas sobre aplicaciones web, programación y tecnología. ¿Qué deseas saber?'
    );
  }

  async enviarMensaje() {
    const texto = this.inputEl.value.trim();

    if (!texto || this.isWaiting) return;

    // Agregar mensaje del usuario
    this.addMessage('user', texto);

    // Limpiar input
    this.inputEl.value = '';
    this.inputEl.focus();

    // Desactivar botón mientras se procesa
    this.isWaiting = true;
    this.btnEnviarEl.disabled = true;

    // Mostrar indicador de escritura
    this.showTypingIndicator();

    try {
      // Hacer petición a la API de chat
      const respuesta = await this.consultarIA(texto);
      this.removeTypingIndicator();
      this.addMessage('ia', respuesta);
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage('ia', `Error: ${error.message}. Usando respuesta local.`);
      const respuestaLocal = this.generarRespuesta(texto);
      this.addMessage('ia', respuestaLocal);
    }

    // Reactivar botón
    this.isWaiting = false;
    this.btnEnviarEl.disabled = false;
  }

  async consultarIA(pregunta) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: 'Eres un asistente educativo especializado en aplicaciones web, HTML, CSS, JavaScript y desarrollo web. Responde de forma clara, concisa y educativa en español.',
        messages: this.messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.texto
        }))
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  showTypingIndicator() {
    const typingEl = document.createElement('div');
    typingEl.className = 'message ia typing-indicator';
    typingEl.id = 'typing-indicator';
    
    const dotsEl = document.createElement('div');
    dotsEl.className = 'typing-dots';
    dotsEl.innerHTML = '<span></span><span></span><span></span>';
    
    typingEl.appendChild(dotsEl);
    this.chatEl.appendChild(typingEl);
    this.chatEl.scrollTop = this.chatEl.scrollHeight;
  }

  removeTypingIndicator() {
    const typingEl = document.getElementById('typing-indicator');
    if (typingEl) {
      typingEl.remove();
    }
  }

  addMessage(role, texto) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${role}`;

    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.textContent = texto;

    messageEl.appendChild(contentEl);
    this.chatEl.appendChild(messageEl);

    // Scroll al final
    this.chatEl.scrollTop = this.chatEl.scrollHeight;

    // Guardar en historial
    this.messages.push({ role, texto, timestamp: new Date() });
  }

  generarRespuesta(pregunta) {
    const respuestas = {
      html: 'HTML es el lenguaje de marcado estándar para crear páginas web. Define la estructura del contenido usando etiquetas como <h1>, <p>, <div>, etc.',
      css: 'CSS es un lenguaje de hojas de estilo que te permite diseñar y dar formato a elementos HTML. Controla colores, tamaños, posiciones y efectos visuales.',
      javascript: 'JavaScript es un lenguaje de programación que añade interactividad a las páginas web. Permite manipular el DOM, manejar eventos y crear experiencias dinámicas.',
      'dom': 'El DOM (Document Object Model) es una representación en árbol de la estructura HTML que permite a JavaScript acceder y modificar elementos de la página.',
      'eventos': 'Los eventos son acciones que el usuario realiza (clic, tecla, scroll). Con addEventListener puedes capturar estos eventos y ejecutar código en respuesta.',
      'aplicacion web': 'Una aplicación web es un software que funciona en el navegador. Combina HTML (estructura), CSS (estilos) y JavaScript (lógica).',
      'responsive': 'El diseño responsivo (responsive design) adapta la interfaz a diferentes tamaños de pantalla usando CSS media queries y layout flexible.',
      'api': 'Una API es una interfaz que permite que dos aplicaciones se comuniquen. En web, usamos APIs REST para obtener datos de servidores.',
      'fetch': 'Fetch es una API moderna de JavaScript para hacer peticiones HTTP a servidores. Es el método estándar para enviar/recibir datos.',
      'json': 'JSON es un formato de texto para intercambiar datos. Es legible, ligero y ampliamente usado en aplicaciones web modernas.',
    };

    const preguntaLower = pregunta.toLowerCase();

    // Buscar coincidencias
    for (const [palabra, respuesta] of Object.entries(respuestas)) {
      if (preguntaLower.includes(palabra)) {
        return respuesta;
      }
    }

    // Respuesta por defecto
    return 'Esa es una pregunta interesante. Puedo ayudarte con temas como HTML, CSS, JavaScript, DOM, eventos, aplicaciones web, diseño responsivo, APIs, Fetch y JSON. ¿Hay algún tema específico que quieras explorar?';
  }

  // Método para limpiar el chat
  limpiarChat() {
    this.chatEl.innerHTML = '';
    this.messages = [];
    this.showWelcomeMessage();
  }

  // Método para exportar conversación
  exportarConversacion() {
    const texto = this.messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.texto}`)
      .join('\n');
    console.log(texto);
    return texto;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const chat = new ChatAssistant();

  // Exponer globalmente para acceso desde consola (desarrollo)
  window.chatAssistant = chat;
});
