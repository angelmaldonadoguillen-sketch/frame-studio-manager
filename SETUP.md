# FRAME Studio Manager — Guía de instalación

## Lo que necesitás

Solo un proyecto Firebase gratuito (plan Spark, sin tarjeta de crédito).

---

## Paso 1 — Crear el proyecto Firebase

1. Abrí [console.firebase.google.com](https://console.firebase.google.com)
2. Clic en **"Agregar proyecto"**
3. Ponele un nombre (ej: `frame-mi-estudio`)
4. Desactivá Google Analytics si no lo necesitás → **Crear proyecto**

---

## Paso 2 — Activar los tres servicios

Dentro de tu proyecto Firebase:

### Authentication
- Menú lateral → **Build → Authentication** → **Comenzar**
- Pestaña **Sign-in method** → habilitá **Google**

### Firestore Database
- Menú lateral → **Build → Firestore Database** → **Crear base de datos**
- Elegí **Modo de producción** → seleccioná la región más cercana → **Listo**
- Cuando te pida las **reglas**, copiá esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage
- Menú lateral → **Build → Storage** → **Comenzar**
- Elegí la misma región → **Listo**
- En **Reglas**, copiá esto:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Paso 3 — Obtener tu configuración

1. En la consola Firebase: ⚙️ (esquina superior izquierda) → **Configuración del proyecto**
2. Bajá hasta **"Tus apps"** → clic en el ícono **`</>`** (Web)
3. Registrá la app con cualquier nombre → te van a mostrar un objeto `firebaseConfig`

---

## Paso 4 — Configurar el código

1. Copiá el archivo `firebase.config.example.js` y renombralo a `firebase.config.js`
2. Reemplazá los valores de `TU_...` con los de tu `firebaseConfig`

```js
window.FIREBASE_CONFIG = {
  apiKey:            "AIza...",
  authDomain:        "mi-proyecto.firebaseapp.com",
  projectId:         "mi-proyecto",
  storageBucket:     "mi-proyecto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};
```

---

## Paso 5 — Abrir el app

Abrí `index.html` directamente en el navegador (o con Live Server si tenés VS Code).

Iniciá sesión con Google → el primer usuario queda pendiente de aprobación.

Para aprobarte a vos mismo como admin: en Firestore, abrí la colección `frame_users`, buscá tu documento y cambiá `status` de `"pending"` a `"active"`.

---

¡Listo! Todos los datos van a tu propio Firebase y son completamente tuyos.
