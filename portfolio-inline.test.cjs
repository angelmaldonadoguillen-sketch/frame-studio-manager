const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:820}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');
    // El título de la portada se edita escribiendo sobre la página
    const heading=page.locator('.fp-site-hero h2.fp-inline');
    await heading.click();
    assert.equal(await heading.evaluate(e=>document.activeElement===e),true,'el foco se queda en el texto');
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Otra portada');
    assert.equal(await page.getByLabel('Título',{exact:true}).inputValue(),'Otra portada');
    await page.keyboard.press('Enter');
    assert.equal(await heading.innerText(),'Otra portada','Enter no agrega saltos al título');
    assert.equal(await heading.evaluate(e=>document.activeElement===e),false,'Enter cierra la edición');
    // Lo escrito en el panel también llega al lienzo
    await page.getByLabel('Título',{exact:true}).fill('Desde el panel');
    assert.equal(await heading.innerText(),'Desde el panel');
    // Deshacer vuelve atrás de a grupos, no letra por letra
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.equal(await heading.innerText(),'Otra portada');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.equal(await heading.innerText(),'Ideas que toman forma.');
    // Un bloque: el texto de un ítem se edita en su lugar y selecciona ese bloque
    const itemTitle=page.locator('.fp-site-gallery .fp-site-item h3.fp-inline').first();
    await itemTitle.click();await page.keyboard.press('End');await page.keyboard.type(' 2');
    assert.equal(await page.getByLabel('Nombre',{exact:true}).inputValue(),'FORMA 2');
    // "+" entre secciones: un clic en la miniatura la inserta ahí y deja escribiendo el título
    const before=await page.locator('.fp-tree-select').count();
    await page.locator('.fp-insert-line > button').nth(2).hover();
    await page.getByRole('button',{name:'Agregar sección aquí'}).nth(2).click();
    const inserter=page.getByRole('dialog',{name:'Agregar sección aquí'});
    assert.equal(await inserter.locator('.fp-inserter-grid > button').count(),10);
    await inserter.getByRole('button',{name:'Servicios',exact:true}).click();
    assert.equal(await inserter.count(),0);
    assert.equal(await page.locator('.fp-tree-select').count(),before+1);
    await page.waitForFunction(()=>document.activeElement?.classList.contains('fp-inline')&&getSelection().toString()==='Servicios');
    await page.keyboard.type('Lo que hacemos');
    assert.equal(await page.locator('.fp-tree-select').nth(2).innerText(),'Lo que hacemos');
    assert.equal(await page.getByLabel('Título',{exact:true}).inputValue(),'Lo que hacemos');
    // Escape cierra el selector sin agregar nada
    await page.locator('.fp-canvas-add').click();
    await page.keyboard.press('Escape');
    assert.equal(await inserter.count(),0);
    assert.equal(await page.locator('.fp-tree-select').count(),before+1);
    // La vista previa no deja nada editable
    await page.getByRole('button',{name:'Vista previa',exact:true}).click();
    assert.equal(await page.locator('[contenteditable]').count(),0);
    assert.deepEqual(errors,[]);
    console.log('Portfolio inline: canvas typing, panel sync, Enter, grouped undo, block text and clean preview OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
