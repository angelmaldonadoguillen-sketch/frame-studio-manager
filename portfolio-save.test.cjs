const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 1: Guardar, Deshacer/Rehacer y Respaldo
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fp-save-'));
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const open=async(query,options={})=>{
      const context=await browser.newContext({viewport:{width:1440,height:900},acceptDownloads:true,...options});
      const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
      page.on('dialog',dialog=>dialog.accept());
      await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
      await page.goto(origin+query);await page.locator('.fp-editor').waitFor();return page;
    };
    const page=await open('/?demo=full');
    const save=page.getByRole('button',{name:'Guardar borrador',exact:true});
    const heading=page.locator('.fp-site-hero h2.fp-inline');

    // Abrir sin tocar nada no es un cambio pendiente
    assert.equal(await save.innerText(),'Guardado');
    assert.equal(await save.isDisabled(),true);
    assert.equal(await page.locator('.fp-save-status').count(),0);

    // Escribir en el lienzo habilita Guardar, y Ctrl+S funciona con el cursor ahí
    await heading.click();await page.keyboard.press('End');await page.keyboard.type(' ya');
    assert.equal(await save.innerText(),'Guardar');
    await page.keyboard.press('Control+s');
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local')||'null')?.sections[1].content.title==='Ideas que toman forma. ya');
    assert.equal(await save.innerText(),'Guardado');

    // Ctrl+Z dentro del texto usa el Deshacer del editor: lienzo y panel quedan iguales
    await page.keyboard.type(' otra');
    await page.keyboard.press('Control+z');
    assert.equal(await heading.innerText(),'Ideas que toman forma. ya');
    assert.equal(await page.getByLabel('Título',{exact:true}).inputValue(),'Ideas que toman forma. ya');
    assert.equal(await heading.evaluate(e=>document.activeElement===e),true,'el foco sigue en el texto');
    await page.keyboard.press('Control+y');
    assert.equal(await heading.innerText(),'Ideas que toman forma. ya otra');
    await page.keyboard.press('Control+Shift+z');// sin nada para rehacer no rompe
    assert.equal(await heading.innerText(),'Ideas que toman forma. ya otra');

    // Con el foco suelto en la página los atajos siguen andando
    await page.keyboard.press('Escape');
    await page.evaluate(()=>document.activeElement.blur());
    await page.keyboard.press('Control+z');
    assert.equal(await heading.innerText(),'Ideas que toman forma. ya');
    assert.equal(await page.locator('.fp-toast').count(),0,'Deshacer no deja aviso');

    // Menú ⋯: se cierra al exportar y al tocar afuera
    const more=page.locator('details.fp-more');
    await page.getByLabel('Más opciones',{exact:true}).click();
    const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar respaldo',exact:true}).click();
    const backup=path.join(tmp,'respaldo.json');await (await download).saveAs(backup);
    assert.equal(await more.evaluate(e=>e.open),false);
    await page.getByLabel('Más opciones',{exact:true}).click();
    await page.mouse.click(700,500);
    assert.equal(await more.evaluate(e=>e.open),false);
    await page.getByLabel('Más opciones',{exact:true}).click();
    await page.keyboard.press('Escape');
    assert.equal(await more.evaluate(e=>e.open),false);

    // Importar: un archivo roto avisa en español
    const broken=path.join(tmp,'roto.json');fs.writeFileSync(broken,'esto no es json');
    await page.locator('input[type=file][accept*=json]').setInputFiles(broken);
    await page.getByText('Ese archivo no es un respaldo de FRAME Portfolio.').waitFor();
    await page.getByRole('button',{name:'Cerrar aviso',exact:true}).click();

    // Importar un respaldo válido reemplaza y el aviso trae Deshacer
    const imported=JSON.parse(fs.readFileSync(backup,'utf8'));imported.sections[1].content.title='Desde el respaldo';
    const good=path.join(tmp,'bueno.json');fs.writeFileSync(good,JSON.stringify(imported));
    await page.locator('input[type=file][accept*=json]').setInputFiles(good);
    await page.locator('.fp-toast').getByText('Respaldo importado').waitFor();
    assert.equal(await heading.innerText(),'Desde el respaldo');
    await page.locator('.fp-toast').getByRole('button',{name:'Deshacer último cambio',exact:true}).click();
    assert.equal(await heading.innerText(),'Ideas que toman forma. ya');

    // Quitar una sección también ofrece Deshacer
    await page.locator('.fp-tree-select').nth(2).click();
    const sections=await page.locator('.fp-site-section').count();
    await page.getByRole('button',{name:'Quitar sección',exact:true}).click();
    assert.equal(await page.locator('.fp-site-section').count(),sections-1);
    await page.locator('.fp-toast').getByRole('button',{name:'Deshacer último cambio',exact:true}).click();
    assert.equal(await page.locator('.fp-site-section').count(),sections);

    // Teléfono: importar no cambia de panel
    const phone=await open('/?demo=full',{viewport:{width:375,height:812},hasTouch:true,isMobile:true});
    await phone.locator('input[type=file][accept*=json]').setInputFiles(good);
    await phone.locator('.fp-toast').getByText('Respaldo importado').waitFor();
    assert.equal(await phone.locator('.fp-editor').getAttribute('data-pane'),'preview');

    // Cuenta: si la nube falla, cerrar y volver no pisa lo escrito con la copia vieja
    const account=await open('/?account&persist');
    const accountSave=account.getByRole('button',{name:'Guardar borrador',exact:true});
    await account.getByRole('button',{name:'Tema',exact:true}).click();
    await account.getByLabel('Nombre del portfolio',{exact:true}).fill('Versión en la nube');
    await accountSave.click();await account.waitForFunction(()=>window.__frameRecords.has('frame_portfolio_drafts/account-user'));
    await account.getByLabel('Nombre del portfolio',{exact:true}).fill('Cambio sin subir');
    await account.evaluate(()=>{const batch=window.db.batch;window.db.batch=()=>({...batch(),commit:async()=>{throw new Error('offline');}});});
    await accountSave.click();
    await account.getByText('No se pudo sincronizar con tu cuenta.',{exact:false}).waitFor();
    await account.evaluate(()=>sessionStorage.clear());
    await account.reload();await account.locator('.fp-editor').waitFor();
    await account.getByText('Recuperamos cambios sin guardar').waitFor();
    assert.equal(await account.locator('.fp-document-name').innerText(),'Cambio sin subir');
    assert.equal(await accountSave.innerText(),'Guardar');
    await accountSave.click();
    await account.waitForFunction(()=>window.__frameRecords.get('frame_portfolio_drafts/account-user').title==='Cambio sin subir');
    assert.equal(await account.evaluate(()=>localStorage.getItem('frame_portfolio_v2_account-user_unsynced')),null);
    assert.equal(await accountSave.innerText(),'Guardado');

    assert.deepEqual(errors,[]);
    console.log('Portfolio save: clean start, Ctrl+S/Z/Y everywhere, synced undo in canvas text, menu closing, import errors and undo, phone import, unsynced cloud recovery OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
