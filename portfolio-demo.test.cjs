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
  assert.equal(await page.locator('.fp-site-section').count(),11);
  const save=page.getByRole('button',{name:'Guardar borrador',exact:true});
  await save.click();await page.waitForFunction(()=>document.querySelector('.fp-save-confirmed'));
  assert.equal(await save.innerText(),'Guardado');
  const draft=await page.evaluate(()=>JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local')));
  assert.equal(new Set(draft.sections.map(s=>s.type)).size,10);
  assert.equal(await page.evaluate(()=>localStorage.getItem('frame_portfolio_v1_demo_local')),null);
  assert.ok(draft.sections.find(s=>s.type==='prices').content.items.some(i=>i.featured));
  assert.ok(draft.colors.accent);
  await page.screenshot({path:'test-results/portfolio-demo-save.png'});
  await page.emulateMedia({reducedMotion:'reduce'});await save.click();
  assert.equal(await page.locator('.fp-save-feedback').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Quota','QuotaExceededError');};});
  await save.click();await page.waitForFunction(()=>!document.querySelector('.fp-save-confirmed'));
  assert.ok(await page.getByText('No se pudo crear la copia local.',{exact:false}).isVisible());
  await page.reload();assert.equal(await page.locator('.fp-site-section').count(),11);
  await page.getByRole('button',{name:'Vista previa',exact:true}).click();
  assert.equal(await page.locator('iframe').count(),0);
  await page.setViewportSize({width:375,height:812});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  console.log('Full demo: 10 module types, 11 sections, isolated storage, save confirmation, reduced motion, save failure, reload and mobile OK');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
