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
  assert.equal(await page.locator('link[data-frame-portfolio-fonts]').count(),0);
  await page.getByRole('button',{name:'Tema',exact:true}).click();
  const width=name=>page.getByRole('group',{name:'Ancho del contenido'}).getByRole('button',{name,exact:true});
  await width('Angosto').click();
  await page.getByLabel('Fuente de títulos').selectOption('fraunces');
  await page.getByLabel('Fuente de texto').selectOption('inter');
  assert.equal(await page.locator('.fp-site-section').first().evaluate(e=>getComputedStyle(e).maxWidth),'760px');
  assert.match(await page.locator('.fp-site-section h2').first().evaluate(e=>getComputedStyle(e).fontFamily),/Fraunces/);
  assert.match(await page.locator('.frame-portfolio-page').evaluate(e=>getComputedStyle(e).fontFamily),/Inter/);
  const fontLink=page.locator('link[data-frame-portfolio-fonts]');assert.equal(await fontLink.count(),1);
  const href=await fontLink.getAttribute('href');assert.match(href,/family=Fraunces/);assert.match(href,/family=Inter/);assert.match(href,/display=swap/);
  await page.getByRole('button',{name:'Móvil',exact:true}).click();
  assert.ok(await page.locator('.fp-site-section').first().evaluate(e=>e.offsetWidth)<=390);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();await page.reload();
  await page.getByRole('button',{name:'Tema',exact:true}).click();
  assert.equal(await width('Angosto').getAttribute('aria-pressed'),'true');
  assert.equal(await page.getByLabel('Fuente de títulos').inputValue(),'fraunces');
  assert.equal(await page.getByLabel('Fuente de texto').inputValue(),'inter');
  await page.getByRole('button',{name:'Restablecer tipografía y ancho',exact:true}).click();
  assert.equal(await width('Normal').getAttribute('aria-pressed'),'true');assert.equal(await fontLink.count(),0);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();assert.equal(await width('Angosto').getAttribute('aria-pressed'),'true');
  assert.deepEqual(errors,[]);
  console.log('Portfolio theme style: content width, heading/body Google Fonts, single dynamic request, mobile fit, persistence, reset and undo OK');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
