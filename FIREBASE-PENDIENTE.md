# Firebase — lo que falta

Fecha: 2026-09-17 · Proyecto: **frame-studio-3a18f**

Todo lo que sigue son operaciones sobre producción: nada se toca sin tu visto
bueno, y cada paso trae cómo comprobar que salió bien y cómo volver atrás.

---

## Estado de hoy, comprobado desde acá

| Qué | Cómo se comprobó | Resultado |
|---|---|---|
| La función que reserva espacio para archivos | Llamada directa a `reservePortfolioAsset` | **Publicada pero bloqueada**: responde 403. Una función que no existe responde 404, así que está desplegada; lo que falta es el permiso de invocación |
| Reglas de Firestore en el repo | `firestore.rules.v2` | Cubre todo lo que usa el código: tableros, invitaciones, tareas, clientes, portal del cliente, papelera, usuarios, notificaciones y las cuatro colecciones del portfolio |
| Reglas de Storage en el repo | `storage.rules` | Cubre `frame-portfolios/{uid}/{assetId}` contra la reserva de la función |
| Reglas **publicadas** | No se puede leer desde afuera sin sesión | **Sin confirmar.** Los tableros cargan, así que lo publicado se parece a v2; lo que no se sabe es si incluye el portfolio, que se agregó el 16 de septiembre |

El archivo `firestore.rules` (del proyecto viejo compartido con TOONED-OS) se
borró del repo: ya no corresponde a este proyecto y su sola presencia hacía
imposible saber qué está vivo mirando el repo.

---

## 1 · Desbloquear la subida de archivos

**Síntoma:** al subir un logo o una imagen, el editor avisa que el servicio de
archivos no responde. La función existe y verifica sesión y perfil activo por
dentro; lo que falta es que Google Cloud acepte la llamada desde el navegador.

**Por qué pasa:** las funciones de segunda generación corren sobre Cloud Run, y
Cloud Run rechaza la llamada si el servicio no permite invocaciones sin
autenticar. Abrirlo es lo normal para una función `onCall`: la seguridad la
hace la función, que exige `request.auth.uid` y perfil `active`.

**Consola:** Google Cloud Console → Cloud Run → proyecto `frame-studio-3a18f` →
servicio `reserveportfolioasset` → pestaña **Seguridad** → **Permitir
invocaciones no autenticadas** → Guardar.

**Terminal:**

```bash
gcloud run services add-iam-policy-binding reserveportfolioasset --region=us-central1 --member=allUsers --role=roles/run.invoker --project=frame-studio-3a18f
```

**Cómo se comprueba:** avisame y lo verifico desde acá. La función tiene que
pasar de 403 a 401/400 (que es "te escucho, pero no mandaste sesión válida").
Después, subir un logo en el editor.

**Volver atrás:** quitar el mismo permiso (`remove-iam-policy-binding`).

---

## 2 · Publicar las reglas

**Síntoma si faltan:** al guardar avisa que Firebase todavía no permite guardar
el portfolio en tu cuenta; al publicar, que hay que activar las reglas nuevas.
Las tareas y el portal siguen funcionando porque esas reglas ya están vivas.

**Antes de publicar** (lo corro yo): las pruebas de contrato leen
`firestore.rules.v2` y verifican lo que tiene que decir.

**Camino A — consola:** Firebase Console → Firestore Database → Reglas → pegar
el contenido de `firestore.rules.v2` → Publicar. Repetir en Storage → Reglas
con `storage.rules`.

**Camino B — terminal** (si instalás `firebase-tools` e iniciás sesión una vez):

```bash
firebase deploy --only firestore:rules,storage --project frame-studio-3a18f
```

**Cómo se comprueba:** guardar el portfolio en el editor y publicarlo. Después
me pasás el enlace público y confirmo desde acá que se abre sin sesión.

**Volver atrás:** Firebase Console guarda el historial de reglas. Reglas →
pestaña de historial → elegir la versión anterior → publicar.

**Antes de pegar, fijate una cosa:** si lo que está publicado hoy **no** se
parece a `firestore.rules.v2`, no lo pises. Copiámelo y lo comparo: puede haber
algo vivo que el repo no tenga, y publicar encima deja la app sin acceso.

---

## 3 · Después: el plan de seguridad

Está escrito en `AUDITORIA-SEGURIDAD.md`. Del plan original:

- **Fase 0** — saber qué hay publicado: es el paso 2 de este documento.
  0.2 (borrar `firestore.rules`) ya está hecho.
- **Fase 1** — banco de pruebas de reglas con el emulador. Es la red de
  seguridad para todo lo demás: sin esto, cada cambio de reglas se prueba en
  producción. Necesita Java instalado en la máquina (hoy no está).
- **Fases 2 a 6** — arreglos de permisos, verificación de correo, decisión
  sobre los archivos de Storage, validación de tipos y App Check. Cada una
  después de la anterior, y ninguna sin la fase 1 andando.
