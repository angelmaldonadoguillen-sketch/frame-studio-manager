const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 2: Vista previa, Publicar y Compartir/Retirar
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();
    const publish=page.locator('.fp-publish-button'),save=page.getByRole('button',{name:'Guardar borrador',exact:true});

    // Sin insignia repetida: el estado lo dice el botón
    assert.equal(await page.locator('.fp-badge').count(),0);

    // Vista previa: Escape vuelve al editor
    await page.getByRole('button',{name:'Vista previa',exact:true}).click();
    assert.equal(await page.locator('.fp-sidebar').isHidden(),true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.fp-editor').getAttribute('data-preview'),'false');

    // Un enlace mal escrito no deja Publicar mudo: dice qué pasa y lleva al bloque
    await page.locator('.fp-site-contact .fp-site-item').first().click();
    await page.getByLabel(/^Enlace/).fill('esto no es un enlace');
    await page.locator('.fp-tree-select').first().click();
    assert.equal(await publish.isDisabled(),false);
    await publish.click();
    await page.getByText('Corregí el campo marcado en rojo para continuar.').waitFor();
    assert.equal(await page.getByLabel(/^Enlace/).inputValue(),'esto no es un enlace','abre el bloque con el problema');
    assert.equal(await page.evaluate(()=>localStorage.getItem('frame_portfolio_v1_demo-full_local_published')),null);
    await page.getByLabel(/^Enlace/).fill('mailto:estudio@example.com');
    await page.getByRole('button',{name:'Cerrar aviso',exact:true}).click();

    // Publicar guarda lo pendiente antes de publicar
    assert.equal(await save.innerText(),'Guardar');
    await publish.click();
    await page.getByRole('button',{name:'Publicado',exact:true}).waitFor();
    assert.equal(await save.innerText(),'Guardado');
    const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local')));
    assert.equal(stored.sections.find(s=>s.type==='contact').content.items[0].link,'mailto:estudio@example.com');

    // Compartir: el globo cabe en pantalla, Escape lo cierra sin salir de nada más
    await page.getByRole('button',{name:'Compartir enlace',exact:true}).click();
    const pop=await page.locator('.fp-share-pop').boundingBox();
    assert.ok(pop.x>=0&&pop.x+pop.width<=1440);
    const publicUrl=await page.locator('#fp-public-url').inputValue();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.fp-share-pop').count(),0);

    // La vista «Móvil» del editor es igual a la página publicada en un teléfono
    await page.getByRole('button',{name:'Móvil',exact:true}).click();
    await page.getByRole('button',{name:'Vista previa',exact:true}).click();
    const measure=()=>[...document.querySelectorAll('.fp-site-section')].map(section=>{
      const page=section.closest('.frame-portfolio-page').getBoundingClientRect(),box=section.getBoundingClientRect(),title=section.querySelector('h2,h1'),style=getComputedStyle(section);
      const item=section.querySelector('.fp-site-item');
      return {type:section.dataset.module,padLeft:style.paddingLeft,padTop:style.paddingTop,title:title?getComputedStyle(title).fontSize:null,
        width:Math.round(box.width),item:item?Math.round(item.getBoundingClientRect().width):null,overflow:section.scrollWidth>section.clientWidth+1||box.right>page.right+1};
    });
    const frameWidth=await page.locator('.fp-browser-frame .frame-portfolio-page').evaluate(e=>Math.round(e.getBoundingClientRect().width));
    const inEditor=await page.evaluate(measure);
    const phone=await context.newPage();await phone.setViewportSize({width:frameWidth,height:844});
    await phone.goto(publicUrl);await phone.locator('.fp-site-section').first().waitFor();
    assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'la página publicada no se desborda');
    const onPhone=await phone.evaluate(measure);
    assert.equal(inEditor.length,onPhone.length);
    inEditor.forEach((section,index)=>{
      assert.deepEqual(section,onPhone[index],'la sección '+section.type+' se ve igual en la vista Móvil y en el teléfono');
      assert.equal(section.overflow,false,section.type+' no se sale de la pantalla');
    });
    assert.ok(parseFloat(inEditor[0].padLeft)<30,'márgenes de teléfono, no de pantalla grande: '+inEditor[0].padLeft);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Escritorio',exact:true}).click();

    // Ocultar todo: Publicar explica por qué no puede
    await page.locator('.fp-site-hero h2.fp-inline').click();await page.keyboard.press('End');await page.keyboard.type(' ya');await page.keyboard.press('Escape');
    while(await page.locator('.fp-eye[aria-pressed="false"]').count())await page.locator('.fp-eye[aria-pressed="false"]').first().click();
    assert.equal(await publish.innerText(),'Actualizar');
    await publish.click();
    await page.getByText('Mostrá al menos una sección antes de publicar.').waitFor();
    await page.getByRole('button',{name:'Cerrar aviso',exact:true}).click();
    await page.getByRole('button',{name:'Deshacer',exact:true}).click();

    // Retirar desde el menú, con confirmación propia
    await page.getByLabel('Más opciones',{exact:true}).click();
    await page.getByRole('button',{name:'Retirar página',exact:true}).click();
    await page.getByRole('button',{name:'Retirar',exact:true}).click();
    await page.locator('.fp-toast').getByText('Página retirada').waitFor();
    assert.equal(await page.getByRole('button',{name:'Compartir enlace',exact:true}).count(),0);
    assert.equal(await publish.innerText(),'Publicar');

    assert.deepEqual(errors,[]);
    console.log('Portfolio preview: Escape exits preview, invalid link explained, publish saves first, share popover, mobile preview equals published phone page, hidden-all message, unpublish OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
