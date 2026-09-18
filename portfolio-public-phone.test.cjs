const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Grupo 7: la página publicada en el teléfono, con cada módulo en cada variante
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const editor=await context.newPage();editor.on('pageerror',error=>errors.push(error.message));
    await editor.goto(origin+'/?demo=full');await editor.locator('.fp-editor').waitFor();
    // Se arma una publicación de prueba: la sección del demo de cada tipo, en todas sus variantes
    await editor.locator('.fp-publish-button').click();await editor.getByRole('button',{name:'Publicado',exact:true}).waitFor();
    const total=await editor.evaluate(()=>{
      const base=JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local_published')),byType={};
      base.sections.forEach(section=>{byType[section.type]=byType[section.type]||section;});
      const sections=[];
      FramePortfolio.modules.forEach(module=>module.variants.forEach(variant=>{
        const section=JSON.parse(JSON.stringify(byType[module.type]));section.id=crypto.randomUUID();section.variant=variant;delete section.design;
        while(['gallery','services','prices','footer','navigation','contact'].includes(module.type)&&section.content.items.length<3){const copy=JSON.parse(JSON.stringify(section.content.items[0]));copy.id=crypto.randomUUID();copy.title+=' '+(section.content.items.length+1);section.content.items.push(copy);}
        sections.push(section);
      }));
      localStorage.setItem('frame_portfolio_v1_all-variants_local_published',JSON.stringify(FramePortfolio.encodePublication({...base,sections}).draft));
      return sections.length;
    });
    assert.equal(total,24);
    const url=origin+'/?view=published&source=all-variants_local';

    for(const width of [360,375,414]){
      const phone=await context.newPage();phone.on('pageerror',error=>errors.push(error.message));
      await phone.setViewportSize({width,height:800});await phone.goto(url);await phone.locator('.fp-site-section').first().waitFor();
      const report=await phone.evaluate(()=>{
        const viewport=document.documentElement.clientWidth,problems=[];
        if(document.documentElement.scrollWidth>viewport)problems.push('la página se desborda');
        document.querySelectorAll('.fp-site-section').forEach(section=>{
          const name=section.dataset.module+':'+section.dataset.variant,carousel=section.classList.contains('fp-variant-carousel');
          section.querySelectorAll('*').forEach(element=>{
            const box=element.getBoundingClientRect(),style=getComputedStyle(element);if(!box.width)return;
            if(!carousel&&(box.right>viewport+1||box.left<-1))problems.push(name+': se sale '+element.className);
            if([...element.childNodes].some(node=>node.nodeType===3&&node.textContent.trim())&&parseFloat(style.fontSize)<12)problems.push(name+': letra de '+style.fontSize);
            if(element.matches('a,button')&&box.height<44)problems.push(name+': toque de '+Math.round(box.height)+'px');
          });
        });
        const carouselItems=[...document.querySelectorAll('.fp-variant-carousel .fp-site-item')].map(item=>item.getBoundingClientRect().width);
        const track=document.querySelector('.fp-variant-carousel .fp-site-items');
        const banner=document.querySelector('.fp-site-contact.fp-variant-banner').getBoundingClientRect();
        const links=[...document.querySelectorAll('.fp-site-contact.fp-variant-links .fp-site-item')].map(item=>item.getBoundingClientRect());
        return {problems:[...new Set(problems)],viewport,carouselItems,scrolls:track.scrollWidth>track.clientWidth,bannerLeft:banner.left,bannerRight:viewport-banner.right,linkGap:links[1].top-links[0].bottom};
      });
      assert.deepEqual(report.problems,[],width+'px');
      // Lo primero de todo: la página tiene que desplazarse con el dedo. Se
      // prueba con la rueda y no con window.scrollTo, porque con overflow:hidden
      // el scroll por código igual funciona y taparía el problema.
      await phone.mouse.wheel(0,900);await phone.waitForTimeout(150);
      const desplazamiento=await phone.evaluate(()=>{const doc=document.documentElement;return {y:window.scrollY,alto:doc.scrollHeight,ventana:doc.clientHeight,overflow:getComputedStyle(document.body).overflow};});
      assert.ok(desplazamiento.alto>desplazamiento.ventana,width+'px: la página no es más alta que la ventana');
      assert.ok(desplazamiento.y>0,width+'px: la página publicada no hace scroll (body overflow: '+desplazamiento.overflow+')');
      await phone.evaluate(()=>window.scrollTo(0,0));await phone.waitForTimeout(100);
      // Carrusel: tarjetas grandes que se deslizan, no cuatro columnas apretadas
      report.carouselItems.forEach(itemWidth=>assert.ok(itemWidth>=report.viewport*.7,width+'px: tarjeta del carrusel de '+Math.round(itemWidth)+'px'));
      assert.equal(report.scrolls,true);
      // Contacto: el banner no pega contra los bordes; los enlaces tienen aire entre sí
      assert.ok(report.bannerLeft>=16&&report.bannerRight>=16,width+'px: banner a '+report.bannerLeft+'px del borde');
      assert.ok(report.linkGap>=20,width+'px: enlaces separados '+report.linkGap+'px');
      if(width===375)await phone.screenshot({path:'test-results/portfolio-public-phone.png',fullPage:true});
      await phone.close();
    }

    // En computadora el carrusel también desliza (antes las tarjetas se encogían)
    const desktop=await context.newPage();await desktop.goto(url);await desktop.locator('.fp-variant-carousel .fp-site-item').first().waitFor();
    // Y con el teclado se llega hasta el final de la página
    for(let intento=0;intento<4;intento++){await desktop.keyboard.press('End');await desktop.waitForTimeout(250);}
    const hastaElFinal=await desktop.evaluate(()=>{const doc=document.documentElement;return {y:Math.round(window.scrollY),tope:Math.round(doc.scrollHeight-doc.clientHeight)};});
    assert.ok(hastaElFinal.y>0&&hastaElFinal.y>=hastaElFinal.tope-2,'en computadora no se llega al final: '+hastaElFinal.y+' de '+hastaElFinal.tope);
    await desktop.evaluate(()=>window.scrollTo(0,0));await desktop.waitForTimeout(100);
    const trackWidth=await desktop.locator('.fp-variant-carousel .fp-site-items').evaluate(e=>e.clientWidth);
    assert.ok(await desktop.locator('.fp-variant-carousel .fp-site-item').first().evaluate(e=>e.getBoundingClientRect().width)>=trackWidth*.7);

    assert.deepEqual(errors,[]);
    console.log('Portfolio public phone: 24 module variants at 360/375/414 without overflow, readable text, 44px touch targets, sliding carousel, contact banner margins and link spacing OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
