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

    assert.deepEqual(errors,[]);
    console.log('Portfolio theme: palette next to appearance, custom colors explained and releasable with undo, logo mobile width in mobile view OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
