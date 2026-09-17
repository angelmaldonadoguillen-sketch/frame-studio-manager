const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),fs=require('node:fs'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 4: bloques, imagen, video, enlace y precio
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'fp-content-'));
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();
    const galleryTitles=()=>page.locator('.fp-site-gallery .fp-site-item h3').allInnerTexts();
    const field=label=>page.getByLabel(new RegExp('^'+label));

    // Agregar bloque deja el cursor en su título, sobre la página
    await page.locator('.fp-tree-select').nth(2).click();
    await page.locator('.fp-section-blocks').getByRole('button',{name:'Agregar bloque',exact:true}).click();
    await page.waitForFunction(()=>document.activeElement?.matches('.fp-site-gallery .fp-site-item[data-selected="true"] h3.fp-inline'));
    await page.keyboard.type('NUEVO');
    assert.equal(await field('Nombre').inputValue(),'NUEVO');
    assert.equal((await galleryTitles()).at(-1),'NUEVO');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    assert.deepEqual(await galleryTitles(),['FORMA','OBJETO','RITMO','TRAMA']);

    // Duplicar deja la copia al lado del original
    await page.locator('.fp-site-gallery .fp-site-item').nth(1).click();
    await page.getByRole('button',{name:'Duplicar bloque',exact:true}).click();
    assert.deepEqual(await galleryTitles(),['FORMA','OBJETO','OBJETO','RITMO','TRAMA']);
    assert.equal(await page.locator('.fp-site-gallery .fp-site-item').nth(2).getAttribute('data-selected'),'true','queda elegida la copia');
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();

    // Quitar una sección deja elegida la de al lado
    const names=await page.locator('.fp-tree-select').allInnerTexts();
    await page.locator('.fp-tree-select').nth(6).click();
    await page.getByRole('button',{name:'Quitar sección',exact:true}).click();
    assert.equal(await page.locator('.fp-tree-select[aria-pressed="true"]').innerText(),names[7]);
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();
    // …y si era la última, la anterior
    await page.locator('.fp-tree-select').last().click();
    await page.getByRole('button',{name:'Quitar sección',exact:true}).click();
    assert.equal(await page.locator('.fp-tree-select[aria-pressed="true"]').innerText(),names.at(-2));
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();

    // Enlaces como los escribe la gente
    await page.locator('.fp-site-contact .fp-site-item').first().click();
    for(const [typed,stored] of [['www.estudioforma.com','https://www.estudioforma.com'],['hola@estudioforma.com','mailto:hola@estudioforma.com'],['+504 9999-8888','tel:+50499998888'],['estudioforma.com/contacto','https://estudioforma.com/contacto']]){
      await field('Enlace').fill(typed);await field('Enlace').blur();
      assert.equal(await field('Enlace').inputValue(),stored);
      assert.equal(await page.locator('.fp-inspector .fp-field-error').count(),0,typed+' no marca error');
    }
    await field('Enlace').fill('hola que tal');await field('Enlace').blur();
    assert.equal(await page.getByText('Escribí una web, un correo o un teléfono.').count(),1);
    await field('Enlace').fill('mailto:hola@example.com');

    // Precios con símbolos o separadores
    await page.locator('.fp-site-prices .fp-site-item').first().click();
    for(const [typed,stored] of [['1,500','1500'],['$250','250'],['L. 1,250.50','1250.50'],['99,90','99.90']]){
      await field('Precio').fill(typed);await field('Precio').blur();
      assert.equal(await field('Precio').inputValue(),stored);
    }
    await field('Precio').fill('a consultar');await field('Precio').blur();
    assert.equal(await field('Precio').inputValue(),'a consultar','lo que no es un precio no se toca');
    assert.equal(await page.getByText('Usá un número, por ejemplo 250.00.').count(),1);
    await field('Precio').fill('250');

    // Video: sin https se completa solo
    await page.locator('.fp-site-video .fp-site-item').first().click();
    await field('Enlace de YouTube o Vimeo').fill('youtube.com/watch?v=dQw4w9WgXcQ');await field('Enlace de YouTube o Vimeo').blur();
    assert.equal(await field('Enlace de YouTube o Vimeo').inputValue(),'https://youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(await page.locator('.fp-inspector .fp-field-error').count(),0);

    // Imagen por enlace: http pasa a https; un enlace malo sigue a la vista al volver al bloque
    await page.locator('.fp-site-gallery .fp-site-item').nth(1).click();
    await page.getByRole('button',{name:'Usar un enlace de imagen',exact:true}).click();
    await page.getByLabel('Imagen (enlace HTTPS)').fill('http://ejemplo.com/foto.jpg');await page.getByLabel('Imagen (enlace HTTPS)').blur();
    assert.equal(await page.getByLabel('Imagen (enlace HTTPS)').inputValue(),'https://ejemplo.com/foto.jpg');
    await page.getByLabel('Imagen (enlace HTTPS)').fill('no es un enlace');
    await page.locator('.fp-site-gallery .fp-site-item').nth(0).click();
    await page.locator('.fp-site-gallery .fp-site-item').nth(1).click();
    assert.equal(await page.getByLabel('Imagen (enlace HTTPS)').isVisible(),true);
    assert.equal(await page.getByText('Ingresá un enlace HTTPS a una imagen.').isVisible(),true);

    // Subir una imagen la reemplaza en la página
    const png=path.join(tmp,'foto.png');
    fs.writeFileSync(png,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==','base64'));
    await page.locator('.fp-inspector input[type=file]').setInputFiles(png);
    await page.locator('.fp-toast').getByText('Imagen cargada').waitFor();
    assert.match(await page.locator('.fp-site-gallery .fp-site-item').nth(1).locator('img').getAttribute('src'),/^data:image\/webp/);
    assert.equal(await page.getByText('Ingresá un enlace HTTPS a una imagen.').count(),0);

    assert.deepEqual(errors,[]);
    console.log('Portfolio content: new block ready to type, duplicate next to original, neighbor after removal, link/price/video/image normalization, visible image-link error, upload OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));fs.rmSync(tmp,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
