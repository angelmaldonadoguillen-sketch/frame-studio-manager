const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));
(async()=>{
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:940}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
    await page.goto(origin+'/?demo=1');
    await page.getByRole('button',{name:'Tema',exact:true}).click();
    const background=page.getByLabel('Hexadecimal: Fondo');
    // Restablecer y Deshacer cambian el fondo de la página en el acto, pero el
    // campo HEX se pone al día un render después (<100 ms). Leerlo en el mismo
    // instante del clic es una carrera: con Chrome solía ganarla y con Edge la
    // pierde, así que la prueba fallaba según la máquina aunque la app hiciera
    // lo correcto. Se espera a que el campo refleje el valor, con tope.
    const hexCuando=async(esperado,ms=2000)=>{
      const fin=Date.now()+ms;let valor;
      do{valor=await background.inputValue();if(valor.toLowerCase()===esperado.toLowerCase())return valor;await page.waitForTimeout(25);}while(Date.now()<fin);
      return valor;
    };
    await background.fill('abc');await background.press('Enter');
    assert.equal(await background.inputValue(),'#AABBCC');
    assert.equal(await page.locator('.frame-portfolio-page').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(170, 187, 204)');
    await background.fill('badHEX');await background.press('Tab');
    assert.equal(await background.getAttribute('aria-invalid'),'true');
    assert.equal(await page.locator('.frame-portfolio-page').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(170, 187, 204)');
    await background.press('Escape');
    await page.getByLabel('Espectro: Texto').fill('#aabbcc');
    assert.ok(await page.locator('.fp-color-warning').isVisible());
    await page.getByLabel('Espectro: Texto').fill('#112233');
    await page.getByLabel('Hexadecimal: Acento').fill('#224466');await page.getByLabel('Hexadecimal: Acento').press('Enter');
    await page.getByLabel('Espectro: Tarjetas').fill('#eeeeee');
    assert.equal(await page.locator('.fp-site-services .fp-site-item').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(238, 238, 238)');
    await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();
    await page.reload();await page.getByRole('button',{name:'Tema',exact:true}).click();
    assert.equal(await background.inputValue(),'#AABBCC');
    await page.getByRole('button',{name:/Estudio/}).click();
    assert.equal(await background.inputValue(),'#AABBCC');
    await page.getByRole('button',{name:'Vista previa',exact:true}).click();
    assert.equal(await page.locator('.frame-portfolio-page').evaluate(e=>getComputedStyle(e).color),'rgb(17, 34, 51)');
    await page.getByRole('button',{name:'Volver al editor',exact:true}).click();
    await page.getByRole('button',{name:'Restablecer colores del tema',exact:true}).click();
    assert.equal((await hexCuando('#182b34')).toLowerCase(),'#182b34');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.equal(await hexCuando('#AABBCC'),'#AABBCC');
    await page.screenshot({path:'test-results/portfolio-palette.png'});
    await page.setViewportSize({width:375,height:812});
    await page.getByRole('navigation',{name:'Paneles del editor'}).getByRole('button',{name:'Secciones',exact:true}).click();
    assert.ok(await background.isVisible());
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);
    console.log('Portfolio palette: HEX, spectrum input, invalid values, contrast warning, card rendering, persistence, theme preservation, preview, reset/undo and mobile OK');
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
