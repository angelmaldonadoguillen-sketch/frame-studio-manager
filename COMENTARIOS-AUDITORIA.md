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

## Lo que queda mal y necesita una decisión

### El registro no es confiable · GRAVE

`firestore.rules.v2`, comentarios del portal:

```
allow update: if isMember(portal().workspaceId) ...
allow delete: if isMember(portal().workspaceId);
```

La regla no comprueba de quién es el comentario. En la práctica:

- **El estudio puede editar un comentario del cliente.** Puede reescribir lo
  que el cliente dijo. La interfaz hoy no lo ofrece, pero la regla lo permite,
  y desde la consola del navegador se hace en un minuto.
- **El estudio puede borrar comentarios del cliente.**
- **El cliente no puede editar ni borrar los suyos**, ni siquiera para
  corregir un error de tipeo.

En una herramienta cuya promesa entera es *garantía*, la parte que rinde
cuentas puede reescribir en silencio lo que dijo la otra. Aunque vos nunca lo
harías, **el diseño no lo impide**, y eso es lo que vale cuando hay una
discusión.

**Lo que propongo**, y necesita que publiques reglas:

```
allow update: if isMember(portal().workspaceId)
              && resource.data.authorType == 'studio'   // sólo lo propio
              && ...
allow delete: if isMember(portal().workspaceId)
              && resource.data.authorType == 'studio';
```

Y del lado del cliente, permitirle editar y borrar **lo suyo** dentro de una
ventana corta. Eso exige identificar al visitante, que hoy no se hace: todos
los que entran con el enlace son "el cliente".

No lo apliqué porque tocar reglas te obliga a publicarlas, y si el código sale
antes que las reglas los botones empiezan a fallar en silencio.

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

## Lo que decidí no tocar

**El selector de emojis se queda.** Es lo que más se parece a un chat, pero no
es lo que rompía la formalidad: un 👍 del cliente cerrando un tema es una
respuesta perfectamente profesional, y quitar el selector no quita los emojis
—cualquier teclado de teléfono los tiene—. Lo que hacía ver informal esto era
el comportamiento, no los emojis. Si igual lo querés afuera, es un cambio de
diez minutos.
