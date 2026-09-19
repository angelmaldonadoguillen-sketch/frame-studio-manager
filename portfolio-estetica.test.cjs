const {createServer}=require('./portfolio-preview-server.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// La estética del personalizador, medida: una sola escala de alturas, radios,
// espaciados y tipografía; una acción principal a la vez; lo elegido se ve.
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    page.on('pageerror',error=>errors.push(error.message));
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();await page.waitForTimeout(300);
    await page.locator('.fp-tree-select').nth(1).click();await page.waitForTimeout(250);

    // Inventario de todo lo que se dibuja fuera del lienzo, en las tres pestañas
    const inventario=async()=>page.evaluate(()=>{
      const lienzo=document.querySelector('.fp-canvas-scroll'),filas=[];
      document.querySelectorAll('.fp-editor *').forEach(e=>{
        if(lienzo?.contains(e))return;
        const caja=e.getBoundingClientRect();if(!caja.width||!caja.height)return;
        const estilo=getComputedStyle(e),nombre=e.tagName.toLowerCase()+(e.className.toString().split(' ')[0]?'.'+e.className.toString().split(' ')[0]:'');
        // Las tarjetas —apariencias, anchos, composiciones, zona de subida— y un
        // enlace dentro de un párrafo crecen con su contenido: la escala de
        // alturas es para los controles, no para ellas.
        const tarjeta=e.closest('.fp-theme-options,.fp-width-options,.fp-variant-options,.fp-inserter-grid,.fp-theme-note')||e.matches('.fp-logo-drop,.fp-upload');
        filas.push({nombre,alto:Math.round(caja.height),
          muestra:!!e.closest('.fp-font-preview')||e.matches('.fp-theme-options button > span'),
          control:/^(button|input|select|summary)$/.test(e.tagName.toLowerCase())&&!tarjeta,
          texto:[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()),
          tamaño:Math.round(parseFloat(estilo.fontSize)),peso:estilo.fontWeight,
          radios:[estilo.borderTopLeftRadius,estilo.borderBottomRightRadius],
          espacios:[estilo.paddingTop,estilo.paddingRight,estilo.paddingBottom,estilo.paddingLeft,estilo.gap==='normal'?'0px':estilo.gap]});
      });
      return filas;
    });
    const todo=await inventario();
    for(const pestaña of ['Diseño','Tema']){
      await page.getByRole('button',{name:pestaña,exact:true}).first().click();await page.waitForTimeout(250);
      todo.push(...await inventario());
    }
    const raros=(lista,ok)=>[...new Set(lista.filter(x=>!ok(x.valor)).map(x=>x.nombre+' → '+x.valor))];

    // 1 · Tres alturas de control y nada más (24 ícono · 28 chico · 32 · 36)
    assert.deepEqual(raros(todo.filter(f=>f.control&&f.alto<60).map(f=>({nombre:f.nombre,valor:f.alto})),
      v=>[24,28,32,36].includes(v)),[],'alturas fuera de la escala');

    // 2 · Tres radios (4 interno · 7 control · 10 flotante), más el círculo
    assert.deepEqual(raros(todo.flatMap(f=>f.radios.map(valor=>({nombre:f.nombre,valor}))),
      v=>['0px','4px','7px','10px','50%'].includes(v)),[],'radios fuera de la escala');

    // 3 · Todo el espaciado en múltiplos de 4
    assert.deepEqual(raros(todo.flatMap(f=>f.espacios.map(valor=>({nombre:f.nombre,valor}))),
      v=>!v.endsWith('px')||parseFloat(v)%4===0),[],'espaciados fuera de la cuadrícula de 4');

    // 4 · Cuatro tamaños de letra con un trabajo cada uno, y tres pesos.
    // Las muestras de tipografía (la «Aa» de cada apariencia, la vista previa de
    // las fuentes) enseñan la letra de la página, no la de la interfaz.
    const interfaz=todo.filter(f=>f.texto&&!f.muestra);
    assert.deepEqual(raros(interfaz.map(f=>({nombre:f.nombre,valor:f.tamaño})),
      v=>[11,12,13,14].includes(v)),[],'tamaños de letra fuera de la escala');
    assert.deepEqual(raros(interfaz.map(f=>({nombre:f.nombre,valor:f.peso})),
      v=>['400','500','600'].includes(v)),[],'pesos fuera de la escala');

    // 5 · El título de grupo manda sobre sus etiquetas
    await page.getByRole('button',{name:'Diseño',exact:true}).first().click();await page.waitForTimeout(250);
    const jerarquia=await page.evaluate(()=>{
      const leer=e=>{const c=getComputedStyle(e);return {tamaño:parseFloat(c.fontSize),peso:+c.fontWeight,color:c.color};};
      return {titulo:leer(document.querySelector('.fp-inspector-title')),grupo:leer(document.querySelector('.fp-group-title')),etiqueta:leer(document.querySelector('.fp-field > span'))};
    });
    assert.ok(jerarquia.titulo.peso<=600&&jerarquia.grupo.peso<=jerarquia.titulo.peso,'el título del panel no puede pesar menos que un subtítulo');
    assert.ok(jerarquia.grupo.tamaño>jerarquia.etiqueta.tamaño&&jerarquia.grupo.peso>jerarquia.etiqueta.peso,'el grupo tiene que mandar sobre la etiqueta');
    assert.notEqual(jerarquia.grupo.color,jerarquia.etiqueta.color,'y distinguirse también por color');

    // 6 · Una sola acción principal, y se turnan
    const relleno=async()=>page.evaluate(()=>[...document.querySelectorAll('.fp-top-actions button')]
      .filter(b=>{const bg=getComputedStyle(b).backgroundColor;return bg!=='rgba(0, 0, 0, 0)'&&!bg.startsWith('rgba');})
      .map(b=>b.textContent.trim()));
    assert.deepEqual(await relleno(),['Publicar'],'sin cambios pendientes manda Publicar');
    await page.getByRole('button',{name:'Contenido',exact:true}).first().click();
    await page.locator('.fp-inspector input').first().fill('Ideas que toman forma!');await page.waitForTimeout(350);
    assert.deepEqual(await relleno(),['Guardar'],'con cambios sin guardar manda Guardar');

    // 7 · Lo elegido se ve sin comparar: fondo, barra y peso
    await page.getByRole('button',{name:'Secciones',exact:true}).first().click();await page.waitForTimeout(250);
    const fila=await page.evaluate(()=>{
      const elegida=document.querySelector('.fp-tree-section[data-selected="true"] > .fp-tree-row');
      const otra=[...document.querySelectorAll('.fp-tree-row')].find(r=>r!==elegida);
      const leer=r=>({fondo:getComputedStyle(r).backgroundColor,sombra:getComputedStyle(r).boxShadow,peso:getComputedStyle(r.querySelector('.fp-tree-select')).fontWeight});
      return {elegida:leer(elegida),otra:leer(otra)};
    });
    assert.notEqual(fila.elegida.fondo,fila.otra.fondo);
    assert.notEqual(fila.elegida.sombra,'none','la elegida lleva la barra del editor');
    assert.notEqual(fila.elegida.peso,fila.otra.peso,'y el nombre más pesado');

    // 8 · El mismo modo de decir «esto está elegido» en los tres controles visuales
    await page.getByRole('button',{name:'Tema',exact:true}).first().click();await page.waitForTimeout(300);
    const marcas=await page.evaluate(()=>['.fp-theme-options','.fp-width-options'].map(sel=>{
      const elegido=document.querySelector(sel+' button[aria-pressed="true"]');
      return {sel,tilde:!!elegido.querySelector('.fp-picked'),borde:getComputedStyle(elegido).borderTopColor,fondo:getComputedStyle(elegido).backgroundColor};
    }));
    await page.getByRole('button',{name:'Secciones',exact:true}).first().click();await page.waitForTimeout(250);
    await page.locator('.fp-tree-select').nth(1).click();
    await page.getByRole('button',{name:'Diseño',exact:true}).first().click();await page.waitForTimeout(250);
    marcas.push(await page.evaluate(()=>{const e=document.querySelector('.fp-variant-options button[aria-pressed="true"]');return {sel:'.fp-variant-options',tilde:!!e.querySelector('.fp-picked'),borde:getComputedStyle(e).borderTopColor,fondo:getComputedStyle(e).backgroundColor};}));
    marcas.forEach(m=>assert.equal(m.tilde,true,m.sel+' sin tilde'));
    assert.equal(new Set(marcas.map(m=>m.borde+'|'+m.fondo)).size,1,'tres maneras distintas de marcar lo elegido: '+JSON.stringify(marcas));

    // 9 · Ningún botón se parte entre el ícono y su palabra, y los de agregar
    // van centrados (Tailwind, que la app carga después, vuelve bloque cada svg)
    await page.getByRole('button',{name:'Secciones',exact:true}).first().click();await page.waitForTimeout(250);
    const botones=await page.evaluate(()=>{
      const lienzo=document.querySelector('.fp-canvas-scroll');
      return [...document.querySelectorAll('.fp-editor .fp-button')].filter(b=>!lienzo?.contains(b)&&b.querySelector('svg')&&[...b.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(b=>{
        const caja=b.getBoundingClientRect(),icono=b.querySelector('svg').getBoundingClientRect();
        const rango=document.createRange();rango.selectNodeContents([...b.childNodes].find(n=>n.nodeType===3&&n.textContent.trim()));
        const texto=rango.getBoundingClientRect();
        return {nombre:b.textContent.trim().slice(0,18),partido:Math.abs(icono.top-texto.top)>6,
          izquierda:Math.round(icono.left-caja.left),derecha:Math.round(caja.right-texto.right)};
      });
    });
    assert.deepEqual(botones.filter(b=>b.partido).map(b=>b.nombre),[],'botones partidos en dos renglones');
    const agregar=botones.find(b=>b.nombre.startsWith('Agregar sección'));
    assert.ok(agregar&&Math.abs(agregar.izquierda-agregar.derecha)<=2,'«Agregar sección» tiene que estar centrado: '+JSON.stringify(agregar));

    // 10 · El lienzo dibuja el ancho con el que se publica
    const lienzo=await page.locator('.fp-browser-frame').evaluate(e=>({ancho:Math.round(parseFloat(getComputedStyle(e).width)),zoom:parseFloat(e.style.zoom||1)}));
    assert.equal(lienzo.ancho,1200,'el lienzo dibuja el ancho de la página, no el que le sobra');
    assert.ok(lienzo.zoom<1,'achicado para que entre');

    // 11 · El color del editor vive en tokens y cambia con el tema
    const colores=async()=>page.evaluate(()=>{
      const e=document.querySelector('.fp-editor'),v=n=>getComputedStyle(e).getPropertyValue(n).trim();
      return {marca:v('--fp-edit-mark'),linea:v('--fp-edit-line'),sombra:v('--fp-frame-shadow')};
    });
    const oscuro=await colores();
    await page.evaluate(()=>document.documentElement.setAttribute('data-theme','light'));await page.waitForTimeout(200);
    const claro=await colores();
    assert.ok(oscuro.marca&&oscuro.linea&&oscuro.sombra,'el editor define sus colores');
    assert.notEqual(oscuro.marca,claro.marca,'y cambian con el tema');
    assert.notEqual(oscuro.sombra,claro.sombra,'la sombra del lienzo también');
    // Los azules sólo pueden aparecer definiendo el token, nunca sueltos en una regla
    const css=fs.readFileSync('frame.css','utf8').split(/\r?\n/);
    ['#345876','#6583a3'].forEach(color=>assert.deepEqual(
      css.filter(linea=>linea.includes(color)&&!/--fp-edit-[a-z]+:\s*#/.test(linea)).map(l=>l.trim().slice(0,60)),[],
      'quedó '+color+' escrito a mano'));

    assert.deepEqual(errors,[]);
    console.log('Portfolio estética: one scale for heights, radii, spacing and type; group titles outrank labels; a single primary action that takes turns; selection reads at a glance; one way to mark what is picked; icon buttons never split across lines and add buttons sit centred; canvas draws the published width; editor colours live in tokens');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
