# FRAME Studio Manager — Contexto para Claude Code

## Qué es esto

FRAME es un gestor de proyectos para estudios audiovisuales. Permite gestionar proyectos de producción (Reels, Posts, Videos, etc.), clientes, equipo, calendario y rutina diaria. Toda la UI es en español.

## Stack técnico

- **React 18** vía CDN + **Babel Standalone** (sin bundler — no hay `npm install`, no hay build step)
- **Firebase 9.23.0 compat SDK** — Auth (Google), Firestore, Storage
- **Tailwind CSS** vía CDN (configuración inline en `index.html`)
- **GitHub Pages** para el deploy (rama `main`)

Todo corre abriendo `index.html` directamente en el navegador.

## Archivos principales

| Archivo | Qué contiene |
|---|---|
| `index.html` | Entry point, imports de CDN, CSS global, variables de tema |
| `app.jsx` | Componente raíz `<App>`, reducer, estado global, handlers de Firestore |
| `views.jsx` | Vistas: KanbanView, CalendarView (mes/semana/día), GalleryView, ListView |
| `modal.jsx` | Modal de detalle del proyecto, TypePill, StatusPill, componentes de formulario |
| `data.jsx` | Constantes (STATUSES, PROJECT_TYPES, PRIORITIES), helpers (getType, getStatus, fmtDate…) |
| `routine.jsx` | Widget flotante de rutina diaria |
| `icons.jsx` | Librería de iconos SVG inline |
| `clients.jsx` | Sección de clientes |
| `team.jsx` | Sección de equipo |
| `analytics.jsx` | Sección de analytics |
| `auth.jsx` | Pantalla de login con Google |
| `firebase.config.js` | **Tu configuración Firebase personal** (NO está en el repo — ver SETUP.md) |

## Globals importantes

```js
window.db                // firebase.firestore() — disponible en todos los archivos
window.storage           // firebase.storage()
window.FIREBASE_CONFIG   // definido en firebase.config.js
window.FRAME_CUSTOM_TYPES // tipos de proyecto personalizados (se carga desde Firestore)
window.__liveTeam        // equipo en tiempo real para getUser() / AvatarStack
window.pushNotif(uid, data) // helper global para crear notificaciones
```

## Colecciones Firestore que usa FRAME

```
frame_projects       — proyectos
frame_clients        — clientes
frame_users          — equipo / usuarios
frame_notifications  — notificaciones por usuario
frame_config         — configuración (kanban_columns, project_types, display_settings, daily_routine)
frame_trash          — papelera (auto-purge a los 5 días)
```

Storage: `frame-covers/` y `frame-avatars/`

## Convenciones del código

- Como no hay bundler, **todas las variables `const`/`var` de nivel superior son globales**. No uses `import`/`export`.
- Cada componente usa `React.useState`, `React.useEffect`, etc. (no desestructurado desde módulo).
- El helper `localISO(dt)` en `views.jsx` devuelve `YYYY-MM-DD` en hora local (no UTC) — usalo siempre para comparar fechas.
- `getType(id)` en `data.jsx` busca **primero en `window.FRAME_CUSTOM_TYPES`**, luego en el array estático `PROJECT_TYPES`. Nunca invertir ese orden.
- Los IDs de proyecto se generan como `'p' + Date.now()`.
- Las escrituras a Firestore siempre van acompañadas de un dispatch optimista al reducer antes de la llamada async.

## Cómo agregar algo nuevo

1. Editá el archivo `.jsx` correspondiente directamente.
2. Recargá `index.html` en el navegador — Babel compila en el navegador al vuelo.
3. No hay tests, no hay linter configurado.

## Primer uso / Setup

Ver `SETUP.md` para crear el proyecto Firebase y configurar `firebase.config.js`.

Después de crear la cuenta en la app, ir a Firestore → colección `frame_users` → tu documento → cambiar `status` de `"pending"` a `"active"` para aprobarte como administrador.
