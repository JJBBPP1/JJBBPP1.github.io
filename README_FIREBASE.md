Instrucciones rápidas para comprobar y arreglar el error de creación de usuarios en Firebase

1) Requisitos previos
- En Firebase Console -> Authentication -> Sign-in method habilita "Email/Password".
- En Firebase Console -> Firestore Database crea la base de datos y configura reglas.

2) Reglas recomendadas de Firestore (mínimas para `users/{uid}`)

Copiar y pegar en la pestaña Rules de Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Documento de perfil de usuario: solo el propio UID puede leer/escribir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Otras colecciones públicas/privadas según necesidad
    // match /public/{doc} { allow read: if true; }
  }
}
```

3) Verificar en consola del navegador
- Abre la página `pages/plan-empresa.html` en un navegador.
- Abre DevTools -> Console.
- Intenta registrarte con un email y contraseña (min 6 caracteres).
- Observa mensajes de error impresos por la página (ya añadimos logs `console.error`). Copia el `error.code` y `error.message` si aparece.

4) Casos comunes
- `auth/email-already-in-use`: El email ya está registrado en Firebase Auth.
- `auth/invalid-email`: Formato de correo inválido.
- `auth/weak-password`: Contraseña inferior a 6 caracteres.
- `permission-denied`: Reglas de Firestore impiden la escritura en `users/{uid}`.

5) Qué hacer según el error
- Si es `permission-denied`: actualiza las reglas (ver punto 2) y vuelve a probar.
- Si es `email-already-in-use`: intenta iniciar sesión o borrar ese usuario desde Firebase Console -> Authentication.
- Si es `weak-password` o `invalid-email`: informa al usuario (la UI ya lo hace).

6) Asignar rol admin
- En la colección `users` cambia manualmente el campo `role` a `admin` para el documento del UID del administrador.

7) Si necesitas ayuda
- Pega aquí el `error.code` y `error.message` que aparezcan en la consola y lo reviso.

---
Generado automáticamente para la depuración del proyecto.