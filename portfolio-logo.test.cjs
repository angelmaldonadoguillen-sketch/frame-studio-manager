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
  await page.goto(origin+'/?demo=full');
  await page.getByRole('button',{name:'Tema',exact:true}).click();
  const file=page.locator('.fp-logo-settings input[type=file]');
  assert.match(await file.getAttribute('accept'),/svg/);assert.match(await file.getAttribute('accept'),/avif/);
  const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80"><rect width="260" height="80" rx="12" fill="#20323d"/><text x="24" y="53" font-family="Arial" font-size="36" fill="white">FORMA</text></svg>';
  await file.setInputFiles({name:'forma.svg',mimeType:'image/svg+xml',buffer:Buffer.from(svg)});
  await page.waitForFunction(()=>document.querySelector('.fp-site-logo'));
  assert.equal(await page.locator('.fp-site-logo').getAttribute('alt'),'');
  assert.equal(await page.locator('.fp-navigation-brand h1').innerText(),'Estudio Forma · Demo completa');
  assert.equal(await page.getByLabel('Tamaño del logo en escritorio').inputValue(),'140');
  await page.getByLabel('Tamaño del logo en escritorio').fill('220');
  await page.getByLabel('Tamaño del logo en móvil').fill('76');
  // El lienzo va a escala: se mide en píxeles del diseño, no de la pantalla.
  const anchoLogo=()=>page.locator('.fp-site-logo').evaluate(e=>Math.round(parseFloat(getComputedStyle(e).width)));
  assert.equal(await anchoLogo(),220);
  await page.getByRole('button',{name:'Móvil',exact:true}).click();
  assert.equal(await anchoLogo(),76);
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();await page.reload();
  await page.getByRole('button',{name:'Tema',exact:true}).click();
  assert.equal(await page.getByLabel('Tamaño del logo en escritorio').inputValue(),'220');
  assert.equal(await page.getByLabel('Tamaño del logo en móvil').inputValue(),'76');
  await page.getByRole('button',{name:'Quitar logo',exact:true}).click();
  assert.equal(await page.locator('.fp-site-logo').count(),0);assert.ok(await page.locator('.fp-site-title').isVisible());
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await page.locator('.fp-site-logo').count(),1);
  await file.setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script></svg>')});
  await page.waitForFunction(()=>document.querySelector('.fp-logo-settings [role=alert]'));
  assert.match(await page.locator('.fp-logo-settings [role=alert]').innerText(),/validación de seguridad/);
  assert.equal(await page.locator('.fp-site-logo').count(),1,'Invalid upload keeps the previous logo');
  assert.deepEqual(errors,[]);
  console.log('Portfolio logo: SVG upload, safe validation, responsive desktop/mobile sizing, save/reload, remove/undo and invalid-file recovery OK');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
