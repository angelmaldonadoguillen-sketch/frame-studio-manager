# FRAME Studio Manager — Guía de instalación

## Lo que necesitás

Un proyecto Firebase con Authentication, Firestore y Storage. La consola puede
pedir facturación para crear o usar el bucket de Storage según la región y las
condiciones vigentes de Firebase.

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
- Publicá el contenido de `firestore.rules.v2`. No uses una regla comodín para
  usuarios autenticados: el registro es abierto y eso expondría todos los tableros.

### Storage
- Menú lateral → **Build → Storage** → **Comenzar**
- Elegí la misma región → **Listo**
- Confirmá que `storageBucket` en `firebase.config.js` sea exactamente el bucket
  creado para este mismo proyecto.
- Publicá el contenido de `storage.rules`. Sólo admite imágenes de hasta 10 MB
  bajo `frame-covers/{taskId}/` y `frame-descriptions/{taskId}/`, y exige que el
  usuario esté activo y pertenezca al workspace de la tarea.
- `firebase.json` ya referencia ambos archivos. Si usás Firebase CLI, verificá
  primero el proyecto seleccionado y publicá reglas antes que la nueva interfaz.

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
