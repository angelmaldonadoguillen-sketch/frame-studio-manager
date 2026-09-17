const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 3: lista de secciones, reordenar y agregar sección
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();
    const names=()=>page.locator('.fp-tree-select').allInnerTexts();

    // Solo la sección elegida muestra sus bloques: la lista entra en pantalla
    assert.equal(await page.locator('.fp-tree-child').count(),1);
    assert.ok(await page.locator('.fp-tree').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'la lista cabe sin desplazarse');
    const gallery=page.locator('.fp-tree-section').nth(2);
    const expand=gallery.locator('.fp-collapse');
    assert.equal(await expand.getAttribute('aria-expanded'),'false');
    assert.equal(await expand.locator('path').getAttribute('d'),'m10 6 6 6-6 6','cerrada apunta hacia adelante');
    await expand.click();
    assert.equal(await gallery.locator('.fp-tree-child').count(),4);
    assert.equal(await expand.locator('path').getAttribute('d'),'m6 9 6 6 6-6');
    await page.locator('.fp-tree-select').nth(5).click();
    assert.equal(await gallery.locator('.fp-tree-child').count(),4,'la que abriste a mano sigue abierta');
    assert.ok(await page.locator('.fp-tree-section').nth(5).locator('.fp-tree-child').count()>0,'la elegida se abre');
    assert.equal(await page.locator('.fp-tree-section').nth(0).locator('.fp-tree-child').count(),0,'la anterior se cierra');

    // Arrastrar marca dónde cae y se limpia al soltar
    const before=await names();
    const transfer=await page.evaluateHandle(()=>new DataTransfer());
    await page.locator('.fp-grip').nth(1).dispatchEvent('dragstart',{dataTransfer:transfer});
    await page.locator('.fp-tree-section').nth(3).dispatchEvent('dragover',{dataTransfer:transfer});
    assert.equal(await page.locator('.fp-tree-section').nth(3).getAttribute('data-drop'),'after');
    await page.locator('.fp-tree-section').nth(0).dispatchEvent('dragover',{dataTransfer:transfer});
    assert.equal(await page.locator('.fp-tree-section').nth(0).getAttribute('data-drop'),'before');
    assert.equal(await page.locator('[data-drop]').count(),1,'una sola marca a la vez');
    await page.locator('.fp-tree-section').nth(3).dispatchEvent('dragover',{dataTransfer:transfer});
    await page.locator('.fp-tree-section').nth(3).dispatchEvent('drop',{dataTransfer:transfer});
    await page.locator('.fp-grip').nth(3).dispatchEvent('dragend',{dataTransfer:transfer});
    assert.equal(await page.locator('[data-drop]').count(),0);
    const moved=await names();
    assert.equal(moved[3],before[1]);
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.deepEqual(await names(),before);

    // Teclado: flechas sobre el asa, el foco no se pierde
    await page.locator('.fp-grip').nth(1).focus();
    await page.keyboard.press('ArrowDown');
    assert.equal((await names())[2],before[1]);
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Arrastrar '+before[1]);
    await page.keyboard.press('ArrowUp');
    assert.deepEqual(await names(),before);

    // Catálogo: la vista previa sigue a la búsqueda y Enter agrega lo que se ve
    await page.locator('.fp-add-section').click();
    await page.getByLabel('Buscar módulos').fill('precios');
    assert.equal(await page.locator('.fp-catalog-preview h3').innerText(),'Precios y paquetes');
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.fp-catalog').evaluate(e=>e.open),false);
    assert.equal((await names()).at(-1),'Precios y paquetes');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    // Sin resultados no se puede agregar nada; el fondo cierra
    await page.locator('.fp-add-section').click();
    await page.getByLabel('Buscar módulos').fill('zzz');
    assert.equal(await page.getByRole('button',{name:'Agregar a la página',exact:true}).isDisabled(),true);
    assert.equal(await page.locator('.fp-catalog-preview h3').count(),0);
    await page.mouse.click(20,450);
    assert.equal(await page.locator('.fp-catalog').evaluate(e=>e.open),false);

    // "+": abrir otro cierra el anterior y queda uno solo, en el lugar nuevo
    await page.locator('.fp-insert-line > button').nth(1).click();
    assert.equal(await page.locator('.fp-inserter').count(),1);
    await page.locator('.fp-insert-line > button').nth(3).click();
    assert.equal(await page.locator('.fp-inserter').count(),1);
    await page.locator('.fp-inserter').getByRole('button',{name:'Texto',exact:true}).click();
    assert.equal((await names())[4],'Texto');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();

    // Todo oculto: un solo «Agregar sección» en el lienzo
    while(await page.locator('.fp-eye[aria-pressed="false"]').count())await page.locator('.fp-eye[aria-pressed="false"]').first().click();
    assert.equal(await page.locator('.fp-stage').getByText('Agregar sección').count(),1);

    assert.deepEqual(errors,[]);
    console.log('Portfolio structure: focused tree, collapse arrows, drop marker, keyboard reorder, catalog search/Enter/empty/backdrop, single inserter, single empty-page add OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
