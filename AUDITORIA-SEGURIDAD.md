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
`members`** ni `roles` — el mapa denormalizado, con clave por uid, que guarda
nombre, correo y rol de cada integrante (`memberCard` en `data.jsx`).

Cualquier miembro del tablero, no sólo el dueño, puede reescribir ese mapa
entero desde la consola: ponerse tu nombre, cambiar el correo que se muestra de
otro, cambiarle el rol, o ascenderse en `roles`. No gana permisos de Firestore
—`memberIds` sí está protegido— pero sí puede hacerse pasar por otro dentro del
tablero.

**Arreglo:** es de una línea y sin riesgo, porque el código ya escribe
únicamente su propia clave (`members.${uid}`, `app.jsx:1698`). Basta con exigir
en la regla lo que el código ya hace:

```
request.resource.data.members.diff(resource.data.members).affectedKeys().hasOnly([myUid()])
```

más una excepción para que el dueño pueda quitar a alguien al expulsarlo.

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

---

# Plan de corrección

Regla de oro de todo el plan: **una regla mal publicada deja a FRAME sin acceso
a nada, y no hay forma de arreglarlo desde la app**. Por eso el orden no va de
más grave a menos grave — va de menos riesgoso a más riesgoso, y la red de
seguridad se construye antes de tocar la primera regla.

## Fase 0 — Saber qué hay publicado

Riesgo: **ninguno**, no se modifica nada.

- **0.1** Abrir consola de Firebase → Firestore → Reglas. Copiar lo que hay y
  compararlo contra `firestore.rules.v2`. Si difieren, se publica v2 (que es lo
  que el código de hoy espera).
- **0.2** Borrar `firestore.rules` del repo. Es del proyecto viejo compartido
  con TOONED-OS, ya no corresponde a `frame-studio-3a18f`, y su sola presencia
  es lo que hace que no se pueda saber qué está vivo mirando el repo.
- **0.3** Cerrar la tarea "Fase 0.3 — mover credenciales fuera del HTML" como
  **no aplica** (ver arriba: la config web de Firebase es pública por diseño).
- **0.4** Cerrar también "Fase 2.3 — race condition: dos personas
  registrándose se vuelven admin". Las reglas v2 ya lo impiden: el alta fuerza
  `platformAdmin:false` y nadie se puede promover a sí mismo.

**Cómo se comprueba:** entrás a FRAME y todo sigue igual. Si algo dejó de
cargar, es que lo publicado no era v2 y acabamos de descubrir el hallazgo 3 en
vivo.

## Fase 1 — Red de seguridad: probar las reglas antes de publicarlas

Riesgo: **ninguno**, es todo local.

Esto es lo que hace que el resto del plan no sea una apuesta. Hoy la única
forma de saber si una regla funciona es publicarla en producción y ver si la
app se cae — que es exactamente lo que querés evitar.

- **1.1** Instalar el emulador de Firestore y `@firebase/rules-unit-testing`.
- **1.2** Escribir un banco de pruebas de reglas que verifique, con usuarios
  falsos, lo que ya debería ser cierto hoy: que un extraño no lee nada, que un
  pendiente no lee nada, que un miembro lee su tablero y no el ajeno, que nadie
  se auto-aprueba, que el cuarto miembro es rechazado.
- **1.3** Correrlo contra `firestore.rules.v2` tal como está. Todo debe pasar
  **antes** de cambiar una sola línea. Si algo falla acá, encontramos un
  hallazgo que esta auditoría no vio.

A partir de acá, cada cambio de reglas se prueba primero y se publica después.

## Fase 2 — Los arreglos de una línea

Riesgo: **bajo**. Los dos aprietan permisos sobre cosas que el código ya
respeta, así que no le quitan nada a la app.

- **2.1** Hallazgo 4 — que cada quien sólo pueda tocar su propia ficha en
  `members` y `roles`, más la excepción del dueño para expulsar. El código ya
  escribe únicamente `members.${uid}`.
- **2.2** Hallazgo 6 — `frame_invites` en lectura pasa de `signedIn()` a
  `approved()`. Un usuario sin aprobar no debería enterarse de nada.
- **2.3** Prueba en el emulador + publicación.

**Cómo se comprueba:** aceptar una invitación de verdad con la segunda cuenta.
Es el único camino que toca esas dos reglas a la vez.

## Fase 3 — Verificación de correo (hallazgo 1)

Riesgo: **alto si se hace al revés**. Si primero se aprieta la regla, todo el
que no verificó su correo —vos incluido— deja de poder aceptar invitaciones,
sin ningún mensaje que explique por qué.

El orden importa más que el contenido:

- **3.1** *Primero el código.* Enviar `sendEmailVerification()` después del
  registro. Mostrar un aviso en la app cuando `emailVerified` es falso, con un
  botón para reenviar. Publicar esto solo, sin tocar reglas: no rompe nada
  porque todavía ninguna regla lo exige.
- **3.2** *Después las personas.* Que verifiquen su correo las cuentas que ya
  existen: la tuya, la de tu esposa, y los clientes que migres. Es un clic en
  un correo.
- **3.3** *Recién ahí la regla.* Agregar
  `request.auth.token.email_verified == true` a la rama de invitación. Probar
  en el emulador los dos casos —verificado entra, sin verificar no— y publicar.

**Cómo se comprueba:** con una cuenta sin verificar, aceptar una invitación
tiene que fallar; con la misma cuenta ya verificada, tiene que entrar.

## Fase 4 — Los archivos de Storage (hallazgo 2)

Riesgo: **depende de la opción**. Esta fase necesita una decisión tuya antes
que código.

No hay arreglo cómodo. Las tres opciones reales:

| Opción | Qué implica | Costo |
|---|---|---|
| **a. Asumirlo** | Tratar esas URLs como enlaces secretos y documentarlo. Las reglas de Storage siguen sirviendo para *subir*, no para *leer*. | Cero |
| **b. Revocar cuando haga falta** | Igual que (a), más el procedimiento para cortar el acceso a un archivo puntual desde la consola. | Cero, pero manual |
| **c. Servir por Cloud Function** | Los archivos dejan de tener URL pública; una función comprueba pertenencia y devuelve el archivo. Es el arreglo de verdad. | Alto: reescribir subida y visualización, y pagar tráfico |

**Mi recomendación:** (a) + (b) por ahora. Para un estudio de tres personas
donde los archivos son material de trabajo de clientes que ya los tienen, el
riesgo real es bajo, y (c) es desproporcionado para lo que hoy es FRAME. Vale
la pena reconsiderar (c) cuando entren clientes con material confidencial o
cuando pases a servidor propio.

Lo que **sí** hay que hacer en cualquier caso: dejarlo escrito, para que nadie
—vos incluido, en seis meses— crea que sacar a alguien del tablero le corta el
acceso a los archivos que ya vio.

## Fase 5 — Validación de tipos y tamaños (hallazgo 5)

Riesgo: **el más alto del plan**, y por eso va casi al final. Una regla que
valide de más rechaza los documentos que ya existen y rompe el guardado sin
aviso.

- **5.1** Mirar qué forma tienen de verdad los documentos actuales, incluidos
  los que se crearon con versiones viejas del esquema.
- **5.2** Escribir la validación **sólo sobre `request.resource`**, nunca sobre
  `resource`. Así un documento viejo con forma rara se puede seguir corrigiendo;
  si se valida el existente, queda congelado y sin forma de arreglarlo.
- **5.3** Empezar por `frame_projects` con lo mínimo: `workspaceId` es string,
  `title` es string y no pasa de N caracteres, `tags` es lista. Nada más.
- **5.4** Probar en el emulador contra copias de documentos reales, publicar,
  y recién entonces seguir con `frame_clients` y `frame_trash`.

## Fase 6 — App Check (hallazgo 7)

Riesgo: **alto si se activa de golpe** — deja fuera a cualquier cliente que no
mande el token, o sea a la app entera.

- **6.1** Registrar la app con reCAPTCHA v3 y activar App Check en modo
  **monitoreo**, que no bloquea nada y sólo reporta.
- **6.2** Mirar las métricas unos días hasta ver que el 100% del tráfico
  legítimo llega con token.
- **6.3** Recién ahí, activar el bloqueo.

---

## Resumen del orden

```
Fase 0  Saber qué hay publicado          riesgo cero      ← empezar acá
Fase 1  Emulador + pruebas de reglas     riesgo cero
Fase 2  Arreglos de una línea            riesgo bajo
Fase 3  Verificación de correo           código → gente → regla
Fase 4  Storage                          decisión tuya primero
Fase 5  Validación de tipos              riesgo alto, ir de a poco
Fase 6  App Check                        monitoreo antes que bloqueo
```

Nada se publica sin tu visto bueno: tocar reglas es una operación sobre
producción.
