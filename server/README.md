# Backend de ejemplo para Agenda

Este directorio contiene un servidor Node+Express minimal que expone dos endpoints:

- `GET /tasks` — devuelve el arreglo de tareas (JSON).
- `PUT /tasks` — recibe un arreglo JSON y lo persiste.

Requisitos:
- Node.js 14+ y npm

Instalación y ejecución local:

```bash
cd server
npm install
npm start
# el servidor por defecto escucha en http://localhost:3000
```

El frontend (por ejemplo `pages/agenda.html`) puede apuntar a `http://localhost:3000` como `EXTERNAL_API_URL`.

Notas:
- Este backend usa un archivo simple `tasks.json` en el mismo directorio para persistencia. No es adecuado para producción — para producción usa una base de datos real o servicios como Firebase, Supabase, etc.
- Asegúrate de configurar CORS adecuadamente si despliegas en otro dominio.
