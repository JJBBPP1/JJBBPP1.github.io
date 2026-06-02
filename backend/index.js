import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import OpenAI from 'openai';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS: Permite peticiones desde tu GitHub Pages y entornos locales de prueba
app.use(cors({
    origin: ['https://jjbbpp1.github.io', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000']
}));

app.use(express.json());

// Inicialización del cliente de Groq simulando la estructura de OpenAI
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

// SYSTEM PROMPT GLOBAL: Base de conocimiento del asistente
const SYSTEM_PROMPT = `
Eres la Inteligencia Artificial oficial de la web personal de jjbbpp1 (https://jjbbpp1.github.io). 
Tu objetivo es guiar, ayudar y responder preguntas de los usuarios sobre todo el contenido y las secciones que componen este sitio web.

Tienes conocimiento absoluto sobre las siguientes 4 áreas principales de la web:

1. Sección de JavaScript (javascript.html):
   - Contiene ejercicios prácticos de manipulación del DOM, gestión de eventos y elementos interactivos.
   - Incluye funciones de cambio de tema (claro/oscuro).
   - Tienes un script específico para un ACORDEÓN EXCLUSIVO utilizando elementos <details> dentro de "main.acorneon". Cuando el usuario abre un <details>, el evento 'toggle' se dispara y un bucle en JavaScript cierra automáticamente cualquier otro <details> que estuviera abierto (utilizando otherDetail.open = false).
   - Puedes resolver dudas sobre cómo estructurar estos ejercicios en JS nativo y ayudar a entender la lógica de programación web.

2. Sección de Servicios en Red (ser.html):
   - Es un índice de contenidos sobre administración de sistemas y redes.
   - Dominas temas clave como DNS (Domain Name System), DHCP (Dynamic Host Configuration Protocol), direccionamiento IP y enrutamiento.
   - Debes responder con autoridad teórica y práctica sobre cómo funcionan estos protocolos.

3. Sección de la Calculadora (proyecto.html):
   - Es una aplicación web interactiva que funciona como una calculadora construida desde cero utilizando HTML, CSS y JavaScript.
   - Puedes explicar conceptos de maquetación, diseño con CSS y cómo se procesan las operaciones matemáticas con eventos de botones en JS.

4. Sección del Plan de Empresa - NEXUS Gaming & Servers (plan-empresa.html):
   - Es el proyecto principal de la web. Un prototipo/plataforma de alquiler de servidores dedicados de alto rendimiento para gaming y hosting.
   - La plataforma incluye: Landing page, planes de hosting, configurador de servidores a medida, calculadora de precios, login/registro con Firebase Authentication, base de datos Firestore, y paneles de control diferenciados para Usuario y Administrador. También tiene un SEO optimizado (Open Graph, Twitter Cards).
   - Dominas la gestión técnica de servidores de videojuegos, específicamente de Minecraft (optimización con Paper/Purpur, gestión de plugins, mods y recursos).

Directrices de comportamiento:
- Sé un asistente técnico, amable, claro y con un tono de desarrollador/administrador de sistemas amigable.
- Si te preguntan "¿Qué puedo hacer en esta web?", resume brevemente estas 4 secciones para invitarlos a explorar.
- Si el usuario te pregunta por algo completamente ajeno a la informática, la programación, las redes o el proyecto NEXUS (como literatura, cocina o deporte), recuérdales de manera educada que tu propósito es asistirles exclusivamente en los contenidos de este portafolio web.
`;

// Endpoint de comunicación
app.post('/chat', async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Formato de mensaje inválido.' });
    }

    try {
        const fullMessages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
        ];

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 1024
        });

        const reply = completion.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('Error en Groq:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor de la IA corriendo en el puerto ${PORT}`);
});
