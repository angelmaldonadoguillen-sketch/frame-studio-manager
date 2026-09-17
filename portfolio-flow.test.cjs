const {createServer}=require('./portfolio-preview-server.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const deps=process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules';
const {chromium}=require(path.join(deps,'playwright'));
(async()=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
  page.setDefaultTimeout(8000);page.on('pageerror',e=>errors.push(e.message));
  const origin='http://127.0.0.1:'+server.address().port;
  await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
  await page.goto(origin);
  await page.getByRole('button',{name:'Tema',exact:true}).click();
  await page.getByLabel('Nombre del portfolio',{exact:true}).fill('Mi estudio');
  await page.getByRole('button',{name:/Arena/}).click();
  await page.getByRole('button',{name:'Secciones',exact:true}).first().click();
  await page.locator('.fp-add-section').click();
  await page.locator('.fp-catalog-list').getByRole('button',{name:'Video destacado',exact:true}).click();
  await page.getByRole('button',{name:'Vertical',exact:true}).click();
  await page.getByRole('button',{name:'Agregar a la página',exact:true}).click();
  await page.locator('.fp-section-blocks').getByRole('button',{name:'Agregar bloque',exact:true}).click();
  await page.getByLabel('Enlace de YouTube o Vimeo').fill('https://youtu.be/dQw4w9WgXcQ');
  await page.getByLabel('Nombre',{exact:true}).fill('Mi proceso');
  // Local image upload persists alongside the video link.
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=16;c.height=16;const x=c.getContext('2d');x.fillStyle='teal';x.fillRect(0,0,16,16);return c.toDataURL().split(',')[1];});
  await page.locator('.fp-media-field input[type=file]').setInputFiles({name:'portada.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.querySelector('.fp-upload img')?.complete);
  assert.equal(await page.locator('iframe').count(),0);
  await page.getByRole('button',{name:'Vista previa',exact:true}).click();
  await page.getByRole('button',{name:'Reproducir Mi proceso',exact:true}).click();
  assert.equal(await page.locator('iframe').getAttribute('src'),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  assert.equal(await page.locator('iframe').evaluate(e=>getComputedStyle(e).aspectRatio),'9 / 16');
  await page.getByRole('button',{name:'Volver al editor',exact:true}).click();
  assert.equal(await page.locator('iframe').count(),0);
  await page.getByRole('button',{name:'Guardar borrador',exact:true}).click();
  await page.getByLabel('Más opciones',{exact:true}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Exportar respaldo',exact:true}).click();
  assert.equal((await download).suggestedFilename(),'frame-portfolio-borrador.json');
  await page.getByLabel('Más opciones',{exact:true}).click();
  await page.getByRole('button',{name:'Publicar prueba',exact:true}).click();
  const publishDialog=page.locator('.fp-publish-dialog');
  await publishDialog.getByRole('button',{name:'Publicar prueba',exact:true}).click();
  const publicUrl=await page.locator('#fp-public-url').inputValue(),published=await context.newPage();
  await published.goto(publicUrl);await published.waitForLoadState();
  await published.getByRole('heading',{name:'Mi estudio',exact:true}).waitFor();
  await publishDialog.getByRole('button',{name:'Retirar página',exact:true}).click();
  await published.reload();await published.getByText('No hay una copia publicada de prueba.').waitFor();
  await publishDialog.getByRole('button',{name:'Cerrar',exact:true}).click();
  // Pending work survives route unmount/reload without overwriting saved draft.
  await page.getByLabel('Más opciones',{exact:true}).click();
  await page.getByLabel('Nombre',{exact:true}).fill('Cambio pendiente');
  await page.reload();
  assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('frame_portfolio_v1_test_local_pending')).sections[1].content.items[0].title),'Cambio pendiente');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('frame_portfolio_v1_test_local')).sections[1].content.items[0].title),'Mi proceso');
  assert.deepEqual(errors,[]);
  console.log('Portfolio media: image upload, explicit preview playback, vertical video, export, local snapshot and pending recovery OK. External players blocked in tests.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
