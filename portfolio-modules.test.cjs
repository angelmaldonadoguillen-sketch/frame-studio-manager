const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Módulos: cada control que se ofrece hace algo, y los módulos se comportan de forma coherente
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1400,height:900}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/?demo=full');await page.locator('.fp-editor').waitFor();
    await page.locator('.fp-publish-button').click();await page.getByRole('button',{name:'Publicado',exact:true}).waitFor();

    // 1 · Ningún control sin efecto: se dibuja cada módulo en cada variante con cada valor
    const noOps=await page.evaluate(async()=>{
      const draft=JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local_published')),byType={};
      draft.sections.forEach(section=>{byType[section.type]=byType[section.type]||section;});
      const image=byType.gallery.content.items[0].image;
      const host=document.createElement('div');host.className='frame-portfolio-page';
      Object.assign(host.style,{position:'absolute',left:'0',top:'0',width:'1200px',zIndex:-1});
      Object.entries(FramePortfolio.pageStyle(draft)).forEach(([key,value])=>key.startsWith('--')?host.style.setProperty(key,value):host.style[key]=value);
      document.body.appendChild(host);
      const root=ReactDOM.createRoot(host);
      const render=section=>new Promise(resolve=>{root.render(React.createElement(PortfolioModule,{section,loadingMode:'static'}));setTimeout(resolve,20);});
      const textLeft=e=>{const node=[...e.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!node)return '';const range=document.createRange();range.selectNodeContents(node);return Math.round(range.getBoundingClientRect().left);};
      const signature=()=>{const base=host.getBoundingClientRect();return [...host.querySelectorAll('*')].map(e=>{const b=e.getBoundingClientRect(),c=getComputedStyle(e);return [e.tagName,Math.round(b.left-base.left),Math.round(b.top-base.top),Math.round(b.width),Math.round(b.height),textLeft(e),c.borderRadius,c.backgroundColor,c.color,c.boxShadow].join(',');}).join('|');};
      const problems=[];
      for(const module of FramePortfolio.modules){
        const base=JSON.parse(JSON.stringify(byType[module.type]));
        if(!base.content.items.length)base.content.items=[FramePortfolio.item()];
        while(base.content.items.length<4){const copy=JSON.parse(JSON.stringify(base.content.items[0]));copy.id=crypto.randomUUID();base.content.items.push(copy);}
        if(['gallery','hero','image-text','services'].includes(module.type))base.content.items.forEach(item=>{item.image=item.image||image;});
        for(const variant of module.variants){
          const controls=FramePortfolio.designControls(module.type,variant);
          const offered=[['tone',['none','soft','contrast']],['spacing',['compact','normal','airy']]];
          if(controls.align)offered.push(['align',['left','center','right']]);
          if(controls.size)offered.push(['size',['small','medium','large']]);
          if(controls.columns)offered.push(['columns',[1,2,3,4]]);
          if(controls.radius)offered.push(['imageRadius',[0,8,16]]);
          if(controls.ratio)offered.push(['imageRatio',['original','wide','landscape','square','social','portrait','story']]);
          for(const [key,values] of offered){
            const seen=new Map();
            for(const value of values){
              const section=JSON.parse(JSON.stringify(base));section.variant=variant;
              section.design={align:variant==='center'?'center':'left',spacing:'normal',[key]:value};
              await render(section);const sig=signature();seen.set(sig,[...(seen.get(sig)||[]),value]);
            }
            [...seen.values()].filter(group=>group.length>1).forEach(group=>problems.push(module.type+' · '+variant+' · '+key+': '+group.join(' = ')));
          }
        }
      }
      root.unmount();host.remove();return problems;
    });
    assert.deepEqual(noOps,[],'controles que no cambian nada');

    // 2 · Coherencia de lo que ofrece el panel
    const controls=await page.evaluate(()=>({nav:FramePortfolio.designControls('navigation','left'),table:FramePortfolio.designControls('prices','table'),video:FramePortfolio.designControls('video','wide'),footer:FramePortfolio.designControls('footer','columns'),banner:FramePortfolio.designControls('contact','banner')}));
    assert.equal(controls.nav.align,false,'la navegación se alinea con su composición');
    assert.equal(controls.nav.size||controls.footer.size,false,'las barras de la página siguen su ancho');
    assert.equal(controls.video.size&&controls.table.size&&controls.banner.size,true,'el resto de las secciones eligen tamaño');
    assert.equal(controls.table.columns,false,'la comparación pone un plan por columna');
    assert.equal(controls.video.radius&&controls.video.motion,true,'el video tiene esquinas y animación como los demás');
    assert.equal(controls.footer.columns,true);
    assert.equal(controls.banner.radius&&controls.banner.motion,true);
    await page.locator('.fp-tree-select').nth(0).click();await page.getByRole('button',{name:'Diseño',exact:true}).click();
    assert.equal(await page.getByRole('group',{name:'Alineación'}).count(),0);
    assert.equal(await page.getByRole('group',{name:'Fondo'}).count(),1);
    assert.equal(await page.getByRole('group',{name:'Tamaño'}).count(),0,'la navegación no elige tamaño');

    // 3 · Miniaturas: cada módulo con su propia silueta
    await page.getByRole('button',{name:'Agregar sección',exact:true}).first().click();
    const thumbs=await page.locator('.fp-inserter-grid .fp-thumb').evaluateAll(list=>list.map(svg=>svg.innerHTML));
    assert.equal(thumbs.length,10);assert.equal(new Set(thumbs).size,10);
    await page.keyboard.press('Escape');

    // 4 · Página publicada con todas las variantes
    await page.evaluate(()=>{
      const base=JSON.parse(localStorage.getItem('frame_portfolio_v1_demo-full_local_published')),byType={};
      base.sections.forEach(section=>{byType[section.type]=byType[section.type]||section;});
      const sections=[];
      FramePortfolio.modules.forEach(module=>module.variants.forEach(variant=>{
        const section=JSON.parse(JSON.stringify(byType[module.type]));section.id=crypto.randomUUID();section.variant=variant;delete section.design;
        while(['gallery','services','prices','footer','contact'].includes(module.type)&&section.content.items.length<3){const copy=JSON.parse(JSON.stringify(section.content.items[0]));copy.id=crypto.randomUUID();section.content.items.push(copy);}
        if(module.type==='services')section.content.items.forEach((item,n)=>{item.image=n===0?byType.gallery.content.items[1].image:'';});
        if(module.type==='services'&&variant==='cards')section.design={align:'left',spacing:'normal',tone:'soft'};
        if(module.type==='prices'&&variant==='cards')section.design={align:'left',spacing:'normal',tone:'contrast'};
        sections.push(section);
      }));
      localStorage.setItem('frame_portfolio_v1_modules_local_published',JSON.stringify(FramePortfolio.encodePublication({...base,loadingMode:'static',sections}).draft));
    });
    const site=await context.newPage();site.on('pageerror',error=>errors.push(error.message));
    await site.goto(origin+'/?view=published&source=modules_local');await site.locator('.fp-site-section').first().waitFor();
    const at=(module,variant)=>site.locator(`.fp-site-section[data-module="${module}"][data-variant="${variant}"]`);

    // Carrusel: flechas en computadora, que mueven y se apagan en los extremos
    const carousel=at('gallery','carousel');
    const previous=carousel.getByRole('button',{name:'Anterior',exact:true}),next=carousel.getByRole('button',{name:'Siguiente',exact:true});
    await carousel.scrollIntoViewIfNeeded();
    assert.equal(await previous.isDisabled(),true);
    await next.click();
    await site.waitForFunction(()=>document.querySelector('.fp-variant-carousel .fp-site-items').scrollLeft>100);
    await site.waitForFunction(()=>!document.querySelector('.fp-variant-carousel .fp-carousel-nav button').disabled);

    // Mosaico: el primero ocupa toda la fila
    const mosaic=await at('gallery','mosaic').evaluate(section=>{const items=section.querySelector('.fp-site-items').getBoundingClientRect(),first=section.querySelector('.fp-site-item').getBoundingClientRect();return Math.round(first.width)===Math.round(items.width);});
    assert.equal(mosaic,true);

    // Precios en tarjetas y comparación: los botones alineados abajo
    for(const variant of ['cards','table']){
      const tops=await at('prices',variant).locator('.fp-site-link').evaluateAll(links=>links.map(link=>Math.round(link.getBoundingClientRect().top)));
      assert.equal(new Set(tops).size,1,'precios '+variant+': botones a la misma altura '+tops);
    }
    // Precios en lista: mismas columnas en todas las filas
    const listColumns=await at('prices','list').locator('.fp-site-item ul').evaluateAll(lists=>lists.map(list=>Math.round(list.getBoundingClientRect().left)));
    assert.equal(new Set(listColumns).size,1);
    // Servicios en lista: la imagen es miniatura y los textos arrancan a la misma altura
    const services=await at('services','list').evaluate(section=>({image:section.querySelector('img').getBoundingClientRect().width/section.getBoundingClientRect().width,copies:[...section.querySelectorAll('.fp-site-item-copy')].map(copy=>Math.round(copy.getBoundingClientRect().left))}));
    assert.ok(services.image<.3,'miniatura, no a todo el ancho');
    assert.equal(new Set(services.copies).size,1);
    // Pie simple y en columnas se ven distintos
    const footerHeight=async variant=>{const section=at('footer',variant);await section.scrollIntoViewIfNeeded();return section.evaluate(async section=>{await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));return Math.round(section.getBoundingClientRect().height);});};
    const simpleHeight=await footerHeight('simple'),columnsHeight=await footerHeight('columns');
    assert.ok(simpleHeight<columnsHeight,'pie simple '+simpleHeight+' vs columnas '+columnsHeight);
    // Enlaces de correo con su ícono, sin abrir pestaña nueva
    const mail=at('prices','list').locator('.fp-site-link').first();
    assert.equal(await mail.getAttribute('target'),null);
    assert.equal(await mail.locator('path').getAttribute('d'),'M3 5h18v14H3zM3 5l9 8 9-8');
    // Video: tipografía de la página
    const videoFont=await at('video','wide').evaluate(section=>[getComputedStyle(section).fontFamily,getComputedStyle(section.querySelector('.fp-video-cover')).fontFamily]);
    assert.equal(videoFont[1],videoFont[0]);
    // Fondos: suave con color de tarjetas; contraste invierte texto y fondo
    const tones=await site.evaluate(()=>{const page=getComputedStyle(document.querySelector('.frame-portfolio-page'));
      const soft=getComputedStyle(document.querySelector('[data-tone="soft"]')),contrast=getComputedStyle(document.querySelector('[data-tone="contrast"]'));
      return {page:[page.backgroundColor,page.color],soft:soft.backgroundColor,contrast:[contrast.backgroundColor,contrast.color]};});
    assert.notEqual(tones.soft,tones.page[0]);
    assert.equal(tones.contrast[0],tones.page[1]);assert.equal(tones.contrast[1],tones.page[0]);
    // Navegación sin enlace: el nombre se ve igual
    await site.setViewportSize({width:390,height:844});
    assert.equal(await site.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await carousel.locator('.fp-carousel-nav').isVisible(),true,'en pantalla angosta con mouse siguen');

    assert.deepEqual(errors,[]);
    console.log('Portfolio modules: every offered control has an effect in all 24 variants, coherent controls per module, unique thumbnails, carousel arrows, mosaic, aligned price actions and columns, service thumbnails, distinct footers, mail links, video type, section backgrounds OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
