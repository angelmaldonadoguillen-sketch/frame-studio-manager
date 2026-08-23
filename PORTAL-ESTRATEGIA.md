# FRAME como garantía de trabajo — análisis del portal de cliente

Fecha: 2026-08-23 · Estado del portal: funcional, incompleto para el objetivo

## El objetivo, dicho como una promesa que se puede probar

El empresario que contrata a un creativo vive con tres preguntas sin
responder: **¿cuándo me entregás?**, **¿cómo va?**, **¿vamos en fecha?**

FRAME no le sirve a él —él no lo usa, ni quiere aprenderlo—. Le sirve al
creativo, como instrumento para responder esas tres preguntas **sin que se las
tengan que hacer**. Esa es la garantía: no "te doy acceso a mi tablero", sino
"no vas a tener que preguntarme".

Todo lo que sigue se mide contra eso.

---

## Qué hay hoy

Codex construyó una base sólida, y la parte difícil está bien resuelta:

- **Enlace sin cuenta.** `?portal=<48 caracteres al azar>`. El cliente no se
  registra, no instala, no aprende nada. Es la decisión correcta: cada paso de
  fricción es un cliente que no entra.
- **Proyección, no acceso.** El portal lee un documento espejo
  (`frame_client_portals/{token}`) con sólo los campos públicos. El visitante
  nunca toca `frame_projects`. Las reglas lo respaldan: `list` denegado, `get`
  sólo si está publicado, y la forma validada campo por campo. Esto está **bien
  hecho** y es lo que hace viable todo lo demás.
- **En vivo.** El portal escucha cambios; no hay que reenviar nada.
- **Muestra:** avance general en porcentaje, calendario mensual con las tareas,
  detalle con inicio y entrega, entregables marcados como listos, y un hilo de
  comentarios entre estudio y cliente.

---

## El diagnóstico central

**El portal responde una pregunta distinta de la que el cliente hace.**

Hoy, lo primero que ve al abrirlo desde el teléfono es: su nombre, un "Avance
general 54%", y la cabecera de un calendario mensual. Medido en una pantalla de
375px:

| | |
|---|---|
| Ancho del calendario | 1050px |
| Ancho visible | 315px |
| Hay que desplazar | 735px — **3,3 veces la pantalla** |
| Días visibles de golpe | ~2 de 7 |

En ningún lugar de esa primera pantalla dice **cuándo le entregan su cosa**.
Para averiguarlo tiene que arrastrar una grilla de un mes hacia los costados y
tocar una tarjeta.

Un calendario es la vista de quien **planifica** — el creativo. El cliente no
planifica: espera. Su vista natural es una lista corta ordenada por lo que
viene primero, con la fecha comprometida al frente.

---

## Lo que falta para que sea una garantía

Ordenado por cuánto acerca al objetivo, no por dificultad.

### 1. Fecha comprometida, y que se vea cuando cambia

**Es el hueco más grande, y es el corazón de la promesa.**

Hoy el portal muestra la fecha límite. Si el creativo la mueve, el cliente
simplemente ve otra fecha, sin rastro. Eso es exactamente lo que el empresario
teme: que la fecha se corra sola y en silencio.

Una garantía necesita un compromiso que no se pueda reescribir sin dejar marca:

- Una **fecha comprometida** aparte de la fecha de trabajo interna. La interna
  se mueve todo lo que haga falta; la comprometida se cambia a propósito y
  queda registrada.
- Cuando cambia: **motivo y fecha del cambio**, visibles en el portal.
  "Movida del 12 al 19 de agosto — esperando material del cliente."

Suena a que expone al creativo. Es al revés: **lo protege**. Un cambio
explicado es profesionalismo; una fecha que aparece distinta sin aviso es lo
que rompe la confianza.

### 2. Estado en el idioma del cliente

Hoy el avance sale del checklist. Dos problemas:

- Si el creativo no lleva checklist, el portal dice **0%** en una tarea que va
  por la mitad. El cliente lee abandono.
- 100% de checklist no es "entregado". Se puede llegar a 100% sin que el
  cliente haya recibido nada.

El cliente no entiende "8 de 13 tareas". Entiende **fases**: Briefing →
Grabación → Edición → Revisión → Entregado. Ya existen como estados del kanban;
falta proyectarlas como una barra de fases con la actual encendida.

### 3. Avisar, en vez de esperar a que entre

Hoy el portal es de sólo consulta: el cliente tiene que acordarse de abrir un
enlace. **Si no entra, el silencio se siente igual que antes** — y el problema
que estamos resolviendo es justamente el silencio.

Lo mínimo que cambia el juego: un aviso cuando hay algo que decir — entregable
listo, cambio de fecha, comentario del estudio. Un correo corto con un botón al
portal.

Sin esto, todo lo demás depende de que el cliente sea curioso.

### 4. Los hitos ya existen adentro y no se proyectan

El campo de hitos —con fecha y estado— se usa en cinco lugares del modal y
**cero veces en el portal**. Es la información más parecida a "cómo va
avanzando" que FRAME ya captura, y el cliente no la ve.

Es de lo más barato de esta lista: el dato existe, falta mandarlo.

### 5. Conformidad del cliente

No hay forma de que el cliente diga "recibido, conforme". El ciclo queda
abierto: el creativo entrega y nunca consta que entregó.

Un botón de **aceptar entrega**, con fecha y quién lo hizo, cierra el ciclo y
sirve a las dos partes. Para el creativo es prueba; para el cliente es control.
Es la pieza que convierte el portal en un documento y no en un tablero bonito.

### 6. Lo que el estudio espera del cliente

La causa más común de un retraso es que el cliente no mandó el material, no
aprobó el guion, no confirmó la locación. Hoy no hay dónde decirlo.

Un bloque de **"pendiente de tu lado"**, con desde cuándo, hace dos cosas a la
vez: apura al cliente y deja documentado por qué se movió la fecha. Es la
función más defensiva de toda la lista, y probablemente la que más discusiones
te ahorre.

### 7. Historial de cumplimiento

La garantía más fuerte que un creativo puede mostrar no es una promesa: es un
antecedente. **"De 24 entregas, 22 llegaron en fecha."**

Ese dato ya está en FRAME —fechas comprometidas contra fechas reales— y no se
calcula en ningún lado. Sería la única cifra del portal que habla del creativo
y no del proyecto. Es la que de verdad vende.

### 8. Que el portal se vea del estudio, no de FRAME

Hoy la cabecera es una "F" y el nombre del estudio en texto plano. El cliente
está viendo la marca de una herramienta ajena. Con logo, color y dominio
propio, el portal deja de ser "el link que me mandó" y pasa a ser parte de cómo
trabaja ese estudio. Es también la línea natural entre una versión gratis y una
de pago, si alguna vez lo vendés.

---

## Lo que no funciona bien hoy

Cosas concretas, verificadas en el código:

1. **El calendario en el teléfono.** 3,3 pantallas de ancho, 2 días de 7
   visibles. Y el teléfono es donde el cliente lo va a abrir.
2. **La primera pantalla no responde la pregunta.** Nombre, porcentaje y
   cabecera de mes. La fecha de entrega no aparece hasta tocar una tarjeta.
3. **El avance depende del checklist.** Tarea sin checklist, 0%.
4. **Un portal por cliente, no por proyecto.** Un cliente con seis trabajos ve
   todo mezclado en un solo calendario. Y hay tope de 100 tareas.
5. **Se reescribe el portal entero en cada edición.** El efecto que sincroniza
   depende de la lista completa de proyectos: cualquier cambio en cualquier
   tarea regenera y reescribe el documento de **todos** los clientes
   publicados. Hoy no se nota; con volumen es costo y ruido.
6. **El portal se congela si nadie tiene FRAME abierto.** La sincronización
   corre en el navegador del estudio. Lo que cambie del lado del servidor —el
   arrastre automático de tareas incompletas— no llega al portal hasta que
   alguien entre a la app.

---

## Lo que no haría

Para no diluir el foco:

- **No** convertir el portal en un segundo tablero. El cliente no quiere
  administrar; quiere saber.
- **No** pedirle cuenta al cliente. El enlace sin registro es una ventaja, no
  una deuda técnica.
- **No** mostrarle presupuesto, prioridad, responsables ni etiquetas. Hoy el
  portal no los proyecta, y está bien así.
- **No** sumar módulos internos hasta que el portal cumpla la promesa. Ahí está
  el diferencial; un gestor de tareas más no le importa a nadie.

---

## Por dónde arrancaría

| Fase | Qué | Por qué ahí |
|---|---|---|
| 1 | Dar vuelta la portada: próxima entrega, estado en fases, lista antes que calendario | Es lo que responde la pregunta, y no necesita datos nuevos |
| 2 | Proyectar los hitos que ya existen | El dato está; sólo falta mandarlo |
| 3 | Fecha comprometida con historial y motivo | El corazón de la garantía |
| 4 | Avisos por correo | Sin esto, todo depende de que el cliente entre |
| 5 | Conformidad del cliente y "pendiente de tu lado" | Cierra el ciclo y te cubre |
| 6 | Historial de cumplimiento y marca del estudio | Lo que se vende |

Las fases 1 y 2 se pueden hacer sin tocar reglas ni migrar datos. La 3 sí
cambia el modelo y conviene pensarla bien antes de escribir una línea.
