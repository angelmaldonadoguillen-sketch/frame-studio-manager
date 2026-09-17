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
  await page.getByRole('button',{name:'Estática',exact:true}).click();
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  await page.reload();await page.getByRole('button',{name:'Tema',exact:true}).click();
  assert.equal(await page.getByRole('button',{name:'Estática',exact:true}).getAttribute('aria-pressed'),'true');
  await page.getByRole('button',{name:'Vista previa',exact:true}).click();
  assert.equal(await page.locator('[data-module][data-loading-mode="static"]').count(),11);
  assert.equal(await page.locator('.fp-site-gallery img').first().getAttribute('loading'),'eager');
  assert.equal(await page.locator('.fp-site-hero').evaluate(e=>e.getAnimations().length),0);
  assert.equal(await page.locator('.fp-site-hero').evaluate(e=>getComputedStyle(e).contentVisibility),'visible');
  await page.getByRole('button',{name:'Volver al editor',exact:true}).click();
  await page.getByRole('button',{name:'Progresiva',exact:true}).click();
  await page.evaluate(()=>{window.motionStarts=[];const original=Element.prototype.animate;Element.prototype.animate=function(...args){window.motionStarts.push(this.closest('[data-module]')?.className);return original.apply(this,args);};});
  await page.getByRole('button',{name:'Vista previa',exact:true}).click();
  assert.equal(await page.locator('.fp-site-gallery img').first().getAttribute('loading'),'lazy');
  assert.equal(await page.locator('.fp-site-services').evaluate(e=>getComputedStyle(e).contentVisibility),'auto');
  assert.equal(await page.evaluate(()=>motionStarts.some(s=>s?.includes('fp-site-services'))),false);
  await page.locator('.fp-site-services').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>motionStarts.some(s=>s?.includes('fp-site-services')));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.fp-site-services').getAnimations({subtree:true}).length===0);
  assert.equal(await page.locator('iframe').count(),0);
  assert.deepEqual(errors,[]);
  console.log('Page loading: persisted modes, eager/static vs progressive rendering, scroll-triggered animation, reduced motion and click-to-play video OK');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
