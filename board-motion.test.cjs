const {createServer}=require('./board-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Las tarjetas viajan hasta su lugar nuevo en vez de aparecer ahí de golpe
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1280,height:820}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const abrir=async vista=>{
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      await page.goto(origin+'?vista='+vista);await page.locator('[data-card-id]').first().waitFor();
      await page.waitForTimeout(150);return page;
    };
    const tarjeta=(page,id)=>page.locator(`#root [data-card-id="${id}"]`);
    const posicion=(page,id)=>tarjeta(page,id).evaluate(card=>{const box=card.getBoundingClientRect();return {x:Math.round(box.left),y:Math.round(box.top)};});
    const volando=page=>page.locator('[data-card-flight]').count();
    const animando=(page,id)=>tarjeta(page,id).evaluate(card=>card.getAnimations().length);

    // 1 · Tablero: de una columna a otra vuela una copia por encima
    const tablero=await abrir('tablero');
    const antes=await posicion(tablero,'p1');
    await tablero.evaluate(()=>window.__moverEstado('p1','producing'));
    await tablero.waitForTimeout(60);
    assert.equal(await volando(tablero),1,'una copia en vuelo');
    assert.equal(await tarjeta(tablero,'p1').evaluate(card=>getComputedStyle(card).visibility),'hidden','la original espera escondida');
    const enVuelo=await tablero.evaluate(()=>{const clon=document.querySelector('[data-card-flight]'),box=clon.getBoundingClientRect();return {x:Math.round(box.left),y:Math.round(box.top),salida:Math.round(parseFloat(clon.style.left)),animaciones:clon.getAnimations().length};});
    assert.equal(enVuelo.animaciones,1);
    // La tarjeta que se corre para ocupar el hueco también se desliza
    assert.ok(await animando(tablero,'p2')>0,'la vecina acompaña el movimiento');
    await tablero.waitForTimeout(600);
    assert.equal(await volando(tablero),0,'la copia se retira al aterrizar');
    const despues=await posicion(tablero,'p1');
    assert.equal(await tarjeta(tablero,'p1').evaluate(card=>card.style.visibility),'','la original vuelve a verse');
    assert.notEqual(despues.x,antes.x,'quedó en otra columna');
    // El vuelo sale de donde estaba y termina donde quedó
    assert.ok(Math.abs(enVuelo.salida-antes.x)<=2,'el vuelo arranca donde estaba la tarjeta: '+enVuelo.salida+' vs '+antes.x);

    // 2 · Reordenar dentro de la misma columna: se desliza, sin copia
    await tablero.evaluate(()=>window.__reordenar(['p2','p1','p3','p4']));
    await tablero.waitForTimeout(50);
    assert.equal(await volando(tablero),0,'dentro de la misma lista no hace falta volar');

    // 3 · Calendario: de un día a otro también vuela
    const calendario=await abrir('calendario');
    const dia=await calendario.evaluate(()=>{const d=new Date();d.setDate(d.getDate()+5);return localISO(d);});
    await calendario.evaluate(fecha=>window.__moverFecha('p1',fecha),dia);
    await calendario.waitForTimeout(60);
    assert.equal(await volando(calendario),1);
    await calendario.waitForTimeout(600);
    assert.equal(await volando(calendario),0);

    // 4 · Galería y lista: al reordenarse, las tarjetas se deslizan
    for(const vista of ['galeria','lista']){
      const page=await abrir(vista);
      await page.evaluate(()=>window.__reordenar(['p4','p3','p2','p1']));
      await page.waitForTimeout(40);
      assert.ok(await animando(page,'p1')>0,vista+': la tarjeta se desliza a su lugar');
      await page.close();
    }

    // 5 · Con «reducir movimiento» no se anima nada
    const quieto=await context.newPage();quieto.on('pageerror',error=>errors.push(error.message));
    await quieto.emulateMedia({reducedMotion:'reduce'});
    await quieto.goto(origin+'?vista=tablero');await quieto.locator('[data-card-id]').first().waitFor();await quieto.waitForTimeout(150);
    await quieto.evaluate(()=>window.__moverEstado('p1','producing'));
    await quieto.waitForTimeout(60);
    assert.equal(await volando(quieto),0,'sin copias en vuelo');
    assert.equal(await animando(quieto,'p1'),0,'sin animaciones');
    assert.equal(await tarjeta(quieto,'p1').evaluate(card=>getComputedStyle(card).visibility),'visible');

    // 6 · La tarjeta que se arrastra se marca como hueco
    const tomada=await tarjeta(tablero,'p1').evaluate(card=>{
      card.dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:new DataTransfer()}));
      return true;
    });
    assert.equal(tomada,true);
    await tablero.waitForTimeout(80);
    const hueco=await tarjeta(tablero,'p1').evaluate(card=>({clase:card.className.includes('dragging'),opacidad:getComputedStyle(card).opacity,cursor:getComputedStyle(card).cursor}));
    assert.equal(hueco.clase,true);
    assert.ok(parseFloat(hueco.opacidad)<1);
    assert.equal(hueco.cursor,'grabbing');

    assert.deepEqual(errors,[]);
    console.log('Board motion: cards fly between columns and days, neighbours slide, gallery and list reorder smoothly, reduced motion stays still, dragged card reads as a gap');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
