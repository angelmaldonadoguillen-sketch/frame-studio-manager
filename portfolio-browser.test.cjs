const {createServer}=require('./portfolio-preview-server.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const deps=process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules';
const {chromium}=require(path.join(deps,'playwright'));
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try {
  browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:940}});
  page.setDefaultTimeout(8000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await page.goto(origin+'/?demo=1');
  await page.getByRole('button',{name:'Editar sección Ideas que toman forma.',exact:true}).waitFor();
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/portfolio-desktop.png'});
  // Selecting actual page content opens only the matching block.
  await page.getByRole('button',{name:'Editar bloque FORMA',exact:true}).click();
  assert.equal(await page.getByLabel('Nombre',{exact:true}).inputValue(),'FORMA');
  await page.getByLabel('Nombre',{exact:true}).fill('FORMA / Identidad');
  await page.getByRole('button',{name:'Duplicar bloque',exact:true}).click();
  const galleryBlocks=page.locator('.fp-tree-section').nth(1).locator('.fp-tree-child');
  assert.equal(await galleryBlocks.count(),4);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.equal(await galleryBlocks.count(),3);
  await page.getByRole('button',{name:'Rehacer',exact:true}).click();
  assert.equal(await galleryBlocks.count(),4);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  // Reordering via pointer, then history restoration.
  const blocksBefore=await page.locator('.fp-tree-section').nth(1).locator('.fp-tree-child').allTextContents();
  await page.locator('.fp-tree-section').nth(1).locator('.fp-block-grip').nth(0).dragTo(page.locator('.fp-tree-section').nth(1).locator('.fp-tree-block-row').nth(2));
  assert.equal((await page.locator('.fp-tree-section').nth(1).locator('.fp-tree-child').allTextContents())[2],blocksBefore[0]);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.deepEqual(await page.locator('.fp-tree-section').nth(1).locator('.fp-tree-child').allTextContents(),blocksBefore);
  const names=await page.locator('.fp-tree-select').allTextContents();
  await page.locator('.fp-grip').nth(0).dragTo(page.locator('.fp-tree-row').nth(1));
  const reordered=await page.locator('.fp-tree-select').allTextContents();
  assert.equal(reordered[1],names[0]);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.deepEqual(await page.locator('.fp-tree-select').allTextContents(),names);
  // Section design affects the same page that preview renders.
  await page.locator('.fp-tree-select').nth(1).click();
  await page.getByRole('button',{name:'Diseño',exact:true}).click();
  await page.getByRole('button',{name:'Amplio',exact:true}).click();
  assert.equal(await page.locator('.fp-site-gallery').evaluate(e=>getComputedStyle(e).paddingTop),'64px');
  await page.getByRole('button',{name:'2 columnas',exact:true}).click();
  await page.getByLabel('Relación de aspecto',{exact:true}).selectOption('portrait');
  await page.getByRole('button',{name:'Redondas',exact:true}).click();
  assert.equal(await page.locator('.fp-site-gallery .fp-site-items').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),2);
  assert.equal(await page.locator('.fp-site-gallery img').first().evaluate(e=>getComputedStyle(e).aspectRatio),'3 / 4');
  assert.equal(await page.locator('.fp-site-gallery img').first().evaluate(e=>getComputedStyle(e).borderRadius),'16px');
  for(const [value,ratio] of [['wide','16 / 9'],['landscape','4 / 3'],['square','1 / 1'],['social','4 / 5'],['portrait','3 / 4'],['story','9 / 16']]){
    await page.getByLabel('Relación de aspecto',{exact:true}).selectOption(value);
    assert.equal(await page.locator('.fp-site-gallery img').first().evaluate(e=>getComputedStyle(e).aspectRatio),ratio);
  }
  await page.getByLabel('Relación de aspecto',{exact:true}).selectOption('original');
  assert.equal(await page.locator('.fp-site-gallery img').first().evaluate(e=>getComputedStyle(e).aspectRatio),'auto');
  assert.equal(await page.locator('.fp-site-gallery img').first().evaluate(e=>Math.abs(e.getBoundingClientRect().width/e.getBoundingClientRect().height-e.naturalWidth/e.naturalHeight)<.01),true);
  await page.locator('.fp-tree-section').nth(1).getByRole('button',{name:/^Ocultar /}).click();
  assert.equal(await page.locator('.fp-site-gallery').count(),0);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.equal(await page.locator('.fp-site-gallery').count(),1);
  // Add from the sidebar (same inline picker as "+"), change variant, delete and recovery.
  await page.locator('.fp-add-section').click();
  await page.locator('.fp-inserter').getByRole('button',{name:'Precios y paquetes',exact:true}).click();
  await page.getByRole('button',{name:'Diseño',exact:true}).click();
  await page.locator('.fp-variant-options button').filter({hasText:'Comparación'}).click();
  await page.screenshot({path:'test-results/portfolio-add-section.png'});
  assert.equal(await page.locator('.fp-site-prices.fp-variant-table').count(),1);
  await page.getByRole('button',{name:'Quitar sección',exact:true}).click();
  assert.equal(await page.locator('.fp-site-prices').count(),0);
  await page.getByRole('button',{name:'Deshacer',exact:true}).click();
  assert.equal(await page.locator('.fp-site-prices').count(),1);
  // Save and restore persisted content; do not mix demo and actual keys.
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('frame_portfolio_v1_demo_local')).sections[1].content.items[0].title),'FORMA / Identidad');
  assert.equal(await page.evaluate(()=>localStorage.getItem('frame_portfolio_v1_test_local')),null);
  await page.reload();
  assert.ok((await page.locator('.fp-site-gallery h3').allTextContents()).includes('FORMA / Identidad'));
  await page.getByRole('button',{name:'Vista previa',exact:true}).click();
  assert.ok(!await page.locator('.fp-sidebar').isVisible());
  assert.equal(await page.locator('.fp-site-item[role="button"]').count(),0);
  await page.getByRole('button',{name:'Volver al editor',exact:true}).click();
  // Real scroll and responsive panels.
  await page.setViewportSize({width:1280,height:720});
  const stage=page.locator('.fp-canvas-scroll');
  await stage.hover();await page.mouse.wheel(0,600);
  await page.waitForFunction(()=>document.querySelector('.fp-canvas-scroll').scrollTop>0);
  assert.equal(await page.locator('.fp-tree').evaluate(e=>e.scrollTop),0);
  await page.setViewportSize({width:375,height:812});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Secciones',exact:true}).last().click();
  await page.locator('.fp-tree-select').nth(1).click();
  assert.ok(await page.locator('.fp-inspector').isVisible());
  await page.getByRole('button',{name:'Cerrar ajustes',exact:true}).click();
  assert.ok(!await page.locator('.fp-inspector').isVisible());
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'test-results/portfolio-mobile.png'});
  await page.getByRole('button',{name:'Secciones',exact:true}).last().click();
  await page.locator('.fp-add-section').click();
  assert.equal(await page.locator('.fp-inserter').count(),1);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.fp-inserter').count(),0);
  await page.setViewportSize({width:844,height:390});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.setViewportSize({width:1440,height:940});
  await page.evaluate(()=>{document.documentElement.classList.add('theme-switching');document.documentElement.dataset.theme='light';});
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.fp-sidebar')).backgroundColor==='rgb(255, 255, 255)');
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.screenshot({path:'test-results/portfolio-light.png'});
  // Invalid persisted file is preserved, not silently overwritten.
  await page.evaluate(()=>{sessionStorage.clear();localStorage.setItem('frame_portfolio_v1_test_local','invalid-json');});
  await page.goto(origin);
  await page.getByRole('alert').waitFor();
  assert.ok(await page.getByRole('button',{name:'Guardar borrador',exact:true}).isDisabled());
  assert.equal(await page.evaluate(()=>localStorage.getItem('frame_portfolio_v1_test_local')),'invalid-json');
  assert.deepEqual(errors,[]);
  console.log('Portfolio editor: selection, drag, undo/redo, design, hide, catalog, save/restore, preview, responsive panels and corrupt draft protection OK');
 } finally {if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
