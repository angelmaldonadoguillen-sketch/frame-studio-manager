# Auditoría de seguridad — FRAME Studio Manager

Fecha: 2026-08-12 · Proyecto Firebase: `frame-studio-3a18f`

Modelo de amenaza usado: **una persona con la consola del navegador abierta**.
Todo el JavaScript que se sirve es suyo — puede leerlo, modificarlo y llamar a
Firestore directamente saltándose la interfaz entera. La única frontera real
son las reglas de Firestore y de Storage.

---

## Lo que está bien

Vale decirlo primero, porque acota dónde hay que mirar.

- **Sin sesión no se lee nada.** Comprobado contra el proyecto vivo: las ocho
  colecciones responden HTTP 403 a una petición sin autenticar.
- **Nadie se puede auto-promover.** El alta obliga `status:'pending'` y
  `platformAdmin:false`, y la edición del propio perfil no puede tocar ninguno
  de los dos. El cliente nunca escribe `platformAdmin`.
- **El límite de 3 personas se cumple en el servidor**, no en la interfaz.
- **Aislamiento entre tableros.** `update` exige pertenencia al tablero de
  origen *y* al de destino, así que no se puede mudar un documento a un tablero
  ajeno cambiándole el `workspaceId`.
- **Historial inmutable.** `activity` no admite update ni delete.
- **`localStorage` sólo guarda preferencias de interfaz.** Ningún token, ningún
  dato personal.
- **Una sola inyección de HTML** en todo el código (`modal.jsx:1569`) y pasa por
  el sanitizador.

---

## Hallazgos

### 1 — Las invitaciones confían en un correo que nadie verificó · GRAVE

`firestore.rules.v2:135`

```
exists(/databases/$(database)/documents/frame_invites/$(wsId + '__' + request.auth.token.email))
```

Firebase **nunca verifica el correo** en este proyecto: no se llama a
`sendEmailVerification` en ningún lado, y ni las reglas ni el código consultan
`email_verified`. Cualquiera se registra escribiendo el correo que quiera —
incluido uno que no es suyo.

Si invitás a `rocio@gmail.com`, quien tenga una cuenta con ese correo declarado
entra al tablero y lee todos los proyectos, clientes y archivos de adentro. El
id de la invitación es predecible (`workspaceId + '__' + correo`), así que no
hay que adivinar nada.

**Lo que lo contiene:** esa rama exige `approved()`, o sea que la persona ya
tiene que estar aprobada por vos en la plataforma. No es un ataque desde la
calle: es alguien a quien ya dejaste entrar quedándose con una invitación
ajena.

**Arreglo:** agregar `&& request.auth.token.email_verified == true` a la rama de
invitación, y llamar a `sendEmailVerification()` después del registro.

### 2 — Los archivos de Storage son públicos para quien tenga el enlace · GRAVE

`storage.rules` protege la lectura con `allow read: if projectMember(projectId)`.
Esa regla **no gobierna** las URLs que genera `getDownloadURL()`
(`modal.jsx:420`, `1396`, `1673`).

Esas URLs llevan un `?token=` que las hace legibles por cualquiera, sin sesión,
para siempre. Y se guardan en Firestore en el campo `url` de cada entregable,
cada portada y cada imagen pegada en una descripción.

O sea: la regla de lectura de Storage es, en la práctica, decorativa para todo
lo que ya se subió. Si una de esas URLs se filtra —se la pasás a un cliente por
WhatsApp, queda en un historial, la copia alguien del equipo— el archivo queda
accesible aunque después saques a esa persona del tablero.

**Arreglo:** no hay uno cómodo. Las opciones reales son (a) asumirlo y tratar
esas URLs como enlaces secretos, (b) revocar el token del archivo desde la
consola cuando haga falta cortar el acceso, o (c) servir los archivos por una
Cloud Function que compruebe pertenencia. Lo importante es no creer que la
regla te está protegiendo, porque no lo hace.

### 3 — No está confirmado qué reglas están publicadas · GRAVE (a verificar)

`firebase.json` apunta a `firestore.rules.v2`, pero ese archivo arranca con
**"NO PUBLICAR TODAVÍA"** en la cabecera. El otro archivo, `firestore.rules`,
es el del proyecto viejo compartido con TOONED-OS y ahí dice:

```
allow update, delete: if activeMember();   // sobre frame_users
```

Con esa regla viva, **cualquier usuario aprobado puede aprobar, degradar o
borrar a cualquier otro**, vos incluido.

La evidencia dice que lo publicado se parece a v2: las reglas viejas no
mencionan `frame_workspaces` en ninguna parte, así que los tableros no
cargarían — y cargan. Pero no lo puedo confirmar desde afuera sin una sesión.

**Acción:** abrir la consola de Firebase → Firestore → Reglas y comparar contra
`firestore.rules.v2`. Si no coinciden, publicar. Y borrar `firestore.rules`,
que ya no corresponde a este proyecto y sólo genera esta duda.

### 4 — Un miembro puede reescribir la ficha de otro · MODERADO

`firestore.rules.v2:111-124`

La regla de update fija `ownerId`, `kind` y `memberIds`, pero **no toca
`members`** — el array denormalizado con nombre, correo y rol de cada
integrante (`memberCard` en `data.jsx`).

Cualquier miembro del tablero, no sólo el dueño, puede reescribir ese array
entero desde la consola: ponerse tu nombre, cambiar el correo que se muestra de
otro, cambiarle el rol. No gana permisos —`memberIds` sí está protegido— pero sí
puede hacerse pasar por otro dentro del tablero.

**Arreglo:** exigir que `members` sólo lo cambie el dueño, o que cada quien sólo
pueda tocar su propia ficha.

### 5 — Cero validación de contenido en proyectos, clientes y papelera · MODERADO

```
match /frame_projects/{doc} {
  allow read, delete: if memberOfExisting();
  allow create:       if memberOfIncoming();
  allow update:       if memberOfExisting() && memberOfIncoming();
}
```

No hay un solo control de tipo ni de tamaño. Un miembro puede guardar un título
de un megabyte, campos inventados, o tipos equivocados que revientan la interfaz
del resto (`p.tags.some(...)` sobre algo que no es array). Lo mismo en
`frame_clients` y `frame_trash`.

El daño queda encerrado en su propio tablero, y en un equipo de tres personas
que vos elegís el riesgo es bajo. Pero comparado con `comments` y `activity` —que
sí validan tipo y largo— acá no hay nada.

### 6 — Quien se registre con un correo ajeno puede leer la invitación · MENOR

`firestore.rules.v2:170` pide sólo `signedIn()`, no `approved()`. Alguien sin
aprobar, registrado con un correo que no es suyo, ve que existe una invitación
y a qué tablero. No entra —eso pide `approved()`— pero se entera.

### 7 — Sin App Check · MENOR

Nada impide que alguien use la configuración pública para golpear la API desde
fuera de la app: quemar cuota de lectura, o probar contraseñas contra
Authentication. El registro además está abierto a internet, así que se puede
llenar `frame_users` de documentos pendientes.

---

## Dos cosas que NO son problemas

Las anoto porque parecen serlo y cuestan trabajo perseguirlas.

**La clave de Firebase en `index.html` no es un secreto.** La tarea pendiente
"Fase 0.3 — mover credenciales fuera del HTML público" parte de una confusión.
La configuración web de Firebase (`apiKey`, `appId`, `projectId`) es **pública
por diseño**: es un identificador de proyecto, no una credencial. Está en el
HTML de toda app Firebase del mundo. Esconderla no aporta nada — el que quiera
la saca del tráfico de red en diez segundos. Lo que de verdad protege son las
reglas y App Check. **Sugiero cerrar esa tarea como "no aplica"** en vez de
gastar tiempo en ella.

**`window.db` y `window.storage` en la consola no cambian nada.** Sí, cualquiera
escribe `window.db.collection('frame_projects').get()` y ve qué pasa. Pero no
necesita tu página para eso: con la configuración pública carga el SDK por su
cuenta y hace lo mismo. Quitar esos globales no cierra ninguna puerta, sólo
alarga el camino tres minutos.

---

## Orden sugerido

| # | Qué | Por qué primero |
|---|-----|-----------------|
| 3 | Verificar qué reglas están publicadas | Si están las viejas, todo lo demás sobra |
| 1 | `email_verified` en invitaciones + envío de verificación | Es la única escalación real que queda |
| 4 | Proteger el array `members` | Barato, una línea |
| 2 | Decidir qué hacer con las URLs de Storage | Necesita una decisión tuya, no sólo código |
| 5 | Validar tipos y tamaños | Mejora la robustez más que la seguridad |
| 7 | App Check | Cuando pases a servidor propio |

Nada de esto se toca sin tu visto bueno: publicar reglas es una operación sobre
producción.
