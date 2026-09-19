const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 5: composición, alineación y espaciado de cada sección
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=1');await page.locator('.fp-editor').waitFor();
    const pad=selector=>page.locator(selector).evaluate(e=>parseFloat(getComputedStyle(e).paddingTop));
    const design=async index=>{await page.locator('.fp-tree-select').nth(index).click();await page.getByRole('button',{name:'Diseño',exact:true}).click();};
    const pressed=group=>page.getByRole('group',{name:group}).locator('[aria-pressed="true"]');

    // Tamaño: cambian las piezas, no el lugar de la sección
    await design(1);
    const galeria=()=>page.locator('.fp-site-gallery').evaluate(section=>{
      const izquierda=e=>Math.round(e.getBoundingClientRect().left);
      return {titulo:izquierda(section.querySelector('h2')),pieza:Math.round(section.querySelector('.fp-site-item').getBoundingClientRect().width),bloque:izquierda(section.querySelector('.fp-site-items'))};
    });
    // Se mide el primer hijo del encabezado, no la caja más su relleno: con el
    // lienzo a escala, el rectángulo viene en píxeles de pantalla y el relleno en
    // píxeles CSS, y sumarlos mezclaba dos reglas distintas.
    const rail=await page.locator('.fp-site-brand > *').first().evaluate(e=>Math.round(e.getBoundingClientRect().left));
    assert.equal(await pressed('Tamaño').innerText(),'Mediano','la galería arranca en Mediano');
    const mediano=await galeria();
    assert.equal(mediano.titulo,rail,'la galería arranca donde arranca la portada');
    await page.getByRole('group',{name:'Tamaño'}).getByRole('button',{name:'Pequeño',exact:true}).click();
    const pequeno=await galeria();
    assert.ok(pequeno.pieza<mediano.pieza,'Pequeño achica las piezas: '+JSON.stringify(pequeno));
    assert.equal(pequeno.titulo,rail,'y no corre el título de lugar');
    assert.equal(pequeno.bloque,mediano.bloque,'las piezas siguen empezando en la misma línea');
    await page.getByRole('group',{name:'Tamaño'}).getByRole('button',{name:'Grande',exact:true}).click();
    const grande=await galeria();
    assert.ok(grande.pieza>mediano.pieza,'Grande las agranda: '+JSON.stringify(grande));
    assert.equal(grande.titulo,rail,'el título sigue en su lugar');
    assert.ok(grande.bloque<mediano.bloque,'y las piezas se estiran hacia el borde');
    await page.getByRole('group',{name:'Tamaño'}).getByRole('button',{name:'Mediano',exact:true}).click();
    assert.deepEqual(await galeria(),mediano,'volver a Mediano la deja como estaba');

    // Portada sin tocar: «Normal» es su espacio de siempre; tocar la alineación no lo cambia
    await design(0);
    const hero=await pad('.fp-site-hero');
    assert.equal(await pressed('Espaciado').innerText(),'Normal');
    await page.getByRole('button',{name:'Izquierda',exact:true}).click();
    assert.equal(await pad('.fp-site-hero'),hero,'alinear no cambia el alto');
    await page.getByRole('button',{name:'Normal',exact:true}).click();
    assert.equal(await pad('.fp-site-hero'),hero,'Normal no achica la portada');
    await page.getByRole('button',{name:'Compacto',exact:true}).click();
    assert.equal(await pad('.fp-site-hero'),hero*.5);
    await page.getByRole('button',{name:'Amplio',exact:true}).click();
    assert.ok(Math.abs(await pad('.fp-site-hero')-hero*1.6)<.5,'Amplio es más que Normal');

    // A la izquierda, título y texto empiezan en el mismo borde
    const edges=()=>page.locator('.fp-site-hero').evaluate(section=>{const title=section.querySelector('h2').getBoundingClientRect(),copy=section.querySelector('.fp-site-copy').getBoundingClientRect(),box=section.getBoundingClientRect();
      return {titleLeft:Math.round(title.left),copyLeft:Math.round(copy.left),titleRight:Math.round(title.right),copyRight:Math.round(copy.right),titleCenter:Math.round(title.left+title.width/2),center:Math.round(box.left+box.width/2),align:getComputedStyle(section.querySelector('h2')).textAlign};});
    await page.getByRole('button',{name:'Izquierda',exact:true}).click();
    let e=await edges();
    assert.equal(e.titleLeft,e.copyLeft,'el título no queda centrado mientras el texto va a la izquierda');
    assert.equal(e.align,'left');
    await page.getByRole('button',{name:'Derecha',exact:true}).click();
    e=await edges();
    assert.ok(Math.abs(e.titleRight-e.copyRight)<=1,'a la derecha terminan en el mismo borde');

    // Elegir la composición «Centrada» trae el centrado
    await page.locator('.fp-variant-options button').filter({hasText:'Dividida'}).click();
    assert.equal(await pressed('Alineación').getAttribute('aria-label'),'Izquierda');
    await page.locator('.fp-variant-options button').filter({hasText:'Centrada'}).click();
    assert.equal(await pressed('Alineación').getAttribute('aria-label'),'Centro');
    e=await edges();
    assert.equal(e.align,'center');
    assert.ok(Math.abs(e.titleCenter-e.center)<=2,'el título queda al centro');

    // Galería: Amplio usa la escala sobre su espacio normal
    await design(1);
    await page.getByRole('button',{name:'Normal',exact:true}).click();
    const gallery=await pad('.fp-site-gallery');
    await page.getByRole('button',{name:'Amplio',exact:true}).click();
    assert.equal(await pad('.fp-site-gallery'),gallery*1.6);

    assert.deepEqual(errors,[]);
    console.log('Portfolio design: Normal keeps module spacing, compact/airy scale, alignment moves title and copy together, composition brings its alignment OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
