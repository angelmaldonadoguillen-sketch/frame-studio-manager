const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 6: nombre y logo, apariencia y paleta, tipografía y carga
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fp-theme-'));
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();
    await page.getByRole('button',{name:'Tema',exact:true}).click();
    const background=()=>page.locator('.frame-portfolio-page').evaluate(e=>getComputedStyle(e).backgroundColor);

    // La paleta queda junto a Apariencia
    const headings=await page.locator('.fp-theme-panel h3').allInnerTexts();
    assert.equal(headings.indexOf('Paleta personalizada'),headings.indexOf('Apariencia')+1);

    // Con colores propios, elegir otra apariencia no cambia el fondo: se explica y se puede soltar
    const note=page.locator('.fp-theme-note');
    assert.equal(await note.count(),1);
    const custom=await background();
    await page.getByRole('button',{name:/Estudio/}).click();
    assert.equal(await background(),custom);
    await note.getByRole('button',{name:'Usar los del tema',exact:true}).click();
    assert.equal(await background(),'rgb(24, 43, 52)','ahora se ve la apariencia Estudio');
    assert.equal(await note.count(),0);
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.equal(await background(),custom);

    // Logo: el ancho de móvil se ve en la vista Móvil
    const svg=path.join(tmp,'logo.svg');
    fs.writeFileSync(svg,'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><rect width="200" height="60" fill="#285C76"/></svg>');
    await page.locator('.fp-logo-settings input[type=file]').setInputFiles(svg);
    await page.locator('.fp-toast').getByText('Logo listo').waitFor();
    await page.getByLabel('Tamaño del logo en móvil').fill('180');
    await page.getByRole('button',{name:'Móvil',exact:true}).click();
    assert.equal(await page.locator('.frame-portfolio-page .fp-site-logo').first().evaluate(e=>Math.round(e.getBoundingClientRect().width)),180);
    await page.getByRole('button',{name:'Escritorio',exact:true}).click();
    assert.equal(await page.locator('.frame-portfolio-page .fp-site-logo').first().evaluate(e=>Math.round(e.getBoundingClientRect().width)),140);

    // El área para subir el logo se ve (la regla general de botones le borraba borde y fondo)
    await page.getByRole('button',{name:'Quitar logo',exact:true}).click();
    const drop=await page.locator('.fp-logo-drop').evaluate(e=>{const style=getComputedStyle(e);return {border:style.borderTopStyle,width:style.borderTopWidth,background:style.backgroundColor};});
    assert.equal(drop.border,'dashed');assert.equal(drop.width,'1px');assert.notEqual(drop.background,'rgba(0, 0, 0, 0)');

    // Ancho del contenido en una laptop: la vista previa de escritorio muestra la página a 1440 reducida,
    // así Angosto, Normal y Amplio se notan aunque el lienzo mida menos
    await page.setViewportSize({width:1280,height:800});
    const width=name=>page.getByRole('group',{name:'Ancho del contenido'}).getByRole('button',{name,exact:true});
    const ratio=()=>page.evaluate(()=>{const page=document.querySelector('.frame-portfolio-page').getBoundingClientRect(),section=document.querySelectorAll('.fp-site-section')[2].getBoundingClientRect();return section.width/page.width;});
    for(const [name,expected] of [['Angosto',760/1440],['Normal',1200/1440],['Amplio',1]]){
      await width(name).click();
      await page.getByRole('button',{name:'Vista previa',exact:true}).click();
      assert.ok(Math.abs(await ratio()-expected)<.01,name+': ocupa '+(await ratio()).toFixed(2)+' de la página');
      await page.keyboard.press('Escape');
    }
    await page.getByRole('button',{name:'Vista previa',exact:true}).click();
    const desktop=await page.locator('.fp-browser-frame').evaluate(e=>({width:getComputedStyle(e).width,gutter:getComputedStyle(document.querySelectorAll('.fp-site-section')[2]).paddingLeft,fits:e.getBoundingClientRect().right<=document.querySelector('.fp-canvas-scroll').getBoundingClientRect().right+1}));
    assert.equal(desktop.width,'1440px');assert.ok(Math.abs(parseFloat(desktop.gutter)-86.4)<1,'márgenes de escritorio real: '+desktop.gutter);assert.equal(desktop.fits,true,'entra sin desplazarse de costado');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.fp-browser-frame').evaluate(e=>e.style.zoom||''),'','al editar el lienzo vuelve a tamaño real');

    // Errores de subida en español, no «internal»
    const account=await browser.newPage({viewport:{width:1440,height:900}});account.on('pageerror',error=>errors.push(error.message));
    await account.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await account.goto(origin+'/?account');await account.locator('.fp-editor').waitFor();
    await account.getByRole('button',{name:'Tema',exact:true}).click();
    for(const [code,message,shown] of [['functions/internal','internal','El servicio de archivos no está respondiendo. Tu borrador no se perdió; intentá de nuevo más tarde.'],['functions/resource-exhausted','quota','Alcanzaste el límite de 1 GB de tu portfolio.'],['functions/permission-denied','Tu perfil de FRAME no está habilitado para subir archivos.','Tu perfil de FRAME no está habilitado para subir archivos.']]){
      await account.evaluate(([code,message])=>{window.storage=window.storage||{ref:()=>({})};window.functions.httpsCallable=()=>async()=>{const error=new Error(message);error.code=code;throw error;};},[code,message]);
      await account.locator('.fp-logo-settings input[type=file]').setInputFiles(svg);
      await account.locator('.fp-logo-settings [role=alert]').getByText(shown).waitFor();
    }

    assert.deepEqual(errors,[]);
    console.log('Portfolio theme: palette next to appearance, custom colors explained and releasable with undo, logo mobile width, visible logo drop zone, real desktop preview for content width, upload errors in Spanish OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
