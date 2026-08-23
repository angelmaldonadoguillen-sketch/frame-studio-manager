# Comentarios entre creativo y cliente — auditoría

Fecha: 2026-08-23

## La dinámica real, y por qué el diseño la contradecía

Un chat y un comentario son dos cosas distintas, y no por la interfaz:

| | Chat | Comentario |
|---|---|---|
| Ritmo | inmediato, los dos presentes | diferido, cada uno cuando puede |
| Unidad | el mensaje corto | la observación completa |
| Vive en | la conversación | la cosa comentada |
| Sirve para | resolver ahora | dejar constancia |
| Se relee | casi nunca | cuando hay una discusión |

La relación creativo–cliente es lo segundo, siempre. El cliente escribe una
observación pensada sobre una entrega y sigue con su día; el creativo la lee
cuando sale de editar. Ninguno de los dos está esperando al otro con la
pantalla abierta.

El problema no era que la interfaz fuera fea. Era que **estaba construida con
los supuestos del chat**, y cada uno de esos supuestos hacía daño concreto:

---

## Lo que estaba mal

### 1. Enter enviaba · era el peor

Un cliente escribiendo tres renglones pensados los publicaba como **tres
comentarios sueltos**, cortados a la mitad de la idea. Y así quedaban en el
registro, para siempre.

Peor: el cartel que explicaba el atajo era `hidden sm:block` — o sea que en el
teléfono, que es donde el cliente escribe, **el atajo no se explicaba pero sí
funcionaba**. La peor combinación posible.

**Arreglado.** Enter hace salto de línea. Se envía con un botón que dice
"Comentar". El campo arranca en dos renglones, no en uno, porque se espera un
párrafo y no una línea.

### 2. Cada comentario del equipo llevaba la cara del dueño del tablero

`avatarFor()` devolvía `studioAvatar` para *cualquier* comentario del estudio.
`studioAvatar` es la foto del dueño del tablero. Resultado: si escribía Rocío,
el cliente veía **"Rocío Banegas" con la cara de Angel**.

En un registro entre dos partes, atribuir mal quién dijo qué no es un detalle
estético.

**Arreglado.** Sólo el comentario propio lleva foto; el resto va con las
iniciales del autor, que siempre son correctas. La foto del estudio se mudó a
la cabecera del portal, que es donde identifica a quien comparte y no a quien
escribe.

### 3. Las marcas de tiempo eran relativas

"hace 2 h" sirve mientras mirás. A los tres días no dice nada, y este hilo es
exactamente donde se va a buscar qué se acordó y cuándo.

**Arreglado.** Fecha y hora: `19 ago, 14:40`. El año aparece sólo si es otro.
La fecha completa queda en el `title` al pasar el mouse.

### 4. No se sabía quién era quién

Sólo estaba el nombre. El cliente no tiene por qué saber que "Rocío" es del
estudio y no de su propia empresa.

**Arreglado.** Cada comentario lleva su rol: `ESTUDIO` o `CLIENTE`.

### 5. Saltaba al final al abrir

Comportamiento de chat: te deja en el último mensaje. En un registro, entrar
por el final te deja sin saber dónde estás parado.

**Arreglado.** Se lee desde el principio. Baja al final sólo cuando llega un
comentario nuevo con el hilo ya abierto.

### 6. El lenguaje era de chat

La pestaña se llamaba **"Chat"**. El estado vacío decía "Iniciá la
conversación". El botón de enviar era una flecha hacia arriba.

**Arreglado.** La pestaña es "Comentarios". El vacío dice "Sin comentarios
todavía" — nombra lo que hay, no invita a charlar. El envío es un botón con
palabra.

---

## Lo que se arregló al fondo, y lo que sigue abierto

### El registro no es confiable · ARREGLADO

Las reglas de los comentarios del portal sólo pedían `isMember`, sin mirar de
quién era el comentario. En la práctica el estudio podía **reescribir o borrar
lo que había dicho el cliente**: la interfaz no lo ofrecía, pero desde la
consola del navegador se hacía en un minuto.

En una herramienta cuya promesa entera es servir de garantía, que la parte que
rinde cuentas pueda editar en silencio lo que dijo la otra vacía la promesa.

Ahora, en la regla y en la interfaz: **el estudio sólo toca lo que escribió el
estudio**, y toda edición queda marcada como editado. Lo que escribe el
cliente es inmutable para los dos lados — si se equivocó, escribe otro
comentario. Así funciona un registro.

Los botones de editar y eliminar ya no aparecen sobre un comentario del
cliente. El cambio de interfaz es compatible con las reglas viejas y con las
nuevas, así que publicarlas se puede hacer en cualquier momento sin romper
nada.

### No hay aviso de nada

Ni el creativo sabe que el cliente comentó, ni el cliente sabe que le
respondieron. Los dos tienen que acordarse de entrar. Es el mismo agujero que
el portal entero: sin aviso, el silencio se siente igual que antes.

### El comentario no se ancla a nada concreto

Un comentario sobre una entrega de 40 fotos dice "la tercera no me gusta". No
hay forma de señalar cuál. Anclar un comentario a un entregable —o a una
imagen— es lo que convierte esto en una herramienta de revisión y no en un
tablón de recados.

---

## Los emojis

El selector se quitó de los comentarios con el cliente. Los emojis siguen
funcionando: el campo es un `textarea` común, así que el teclado del teléfono
los aporta igual, y en computadora se pegan.

El chat interno con el equipo conserva su selector: ahí la informalidad no
tiene costo, y es una herramienta distinta con otro público.
