const {createServer}=require('./portfolio-preview-server.cjs');
const P=require('./portfolio-model.js');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

const image='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+3x70WQAAAABJRU5ErkJggg==';
const sections=P.modules.flatMap(module=>module.variants.map(variant=>{
  const section=P.make(module.type);section.variant=variant;section.content.title=module.label+' · '+variant;
  section.content.text='Texto de prueba para revisar ancho de lectura, jerarquía, ritmo vertical y zona segura del módulo.';
  section.design={align:'left',spacing:'normal',columns:3,imageRatio:'landscape',imageRadius:8,animation:'none',motionSpeed:'smooth'};
  if(module.type!=='text')section.content.items=Array.from({length:['hero','image-text','video'].includes(module.type)?1:3},(_,index)=>({
    ...P.item(),title:'Elemento '+(index+1),text:'Descripción breve con contenido realista para comprobar márgenes y legibilidad.',
    image:['gallery','hero','image-text','services'].includes(module.type)?image:'',link:['navigation','footer','contact','prices'].includes(module.type)?'https://example.com':'',
    price:module.type==='prices'?String(250+index*100):'',currency:'USD',inclusions:module.type==='prices'?'Primera entrega\nArchivos finales':'',
    video:module.type==='video'?'https://vimeo.com/76979871':''
  }));
  return section;
}));
const draft={version:1,title:'Auditoría de módulos',theme:'paper',loadingMode:'static',sections};
assert.equal(P.valid(draft),true);

const readLayout=page=>page.locator('.fp-site-section').evaluateAll(nodes=>nodes.map(node=>{
  const rect=node.getBoundingClientRect(),heading=node.querySelector('h2')?.getBoundingClientRect(),introNode=node.querySelector(':scope > .fp-site-copy'),intro=introNode?.getBoundingClientRect(),items=node.querySelector('.fp-site-items'),item=node.querySelector('.fp-site-item'),itemRect=item?.getBoundingClientRect(),mediaRect=item?.querySelector(':scope > img')?.getBoundingClientRect(),copy=item?.querySelector('.fp-site-item-copy')?.getBoundingClientRect(),copyStart=item?.querySelector('.fp-site-item-copy > :is(h3,.fp-site-copy)')?.getBoundingClientRect(),link=item?.querySelector('a')?.getBoundingClientRect(),style=item?getComputedStyle(item):null;
  return {name:node.querySelector('h2')?.textContent,type:[...node.classList].find(value=>value.startsWith('fp-site-')&&value!=='fp-site-section'),variant:[...node.classList].find(value=>value.startsWith('fp-variant-')),section:{width:Math.round(rect.width),paddingLeft:parseFloat(getComputedStyle(node).paddingLeft),display:getComputedStyle(node).display},headingLeft:heading?Math.round(heading.left-rect.left):null,introWidth:intro?Math.round(intro.width):null,introFont:introNode?parseFloat(getComputedStyle(introNode).fontSize):null,itemsColumns:items?getComputedStyle(items).gridTemplateColumns:null,item:{background:style?.backgroundColor,borderTop:style?.borderTopWidth,leftInset:copy&&itemRect?Math.round(copy.left-itemRect.left):null,rightInset:copy&&itemRect?Math.round(itemRect.right-copy.right):null,width:itemRect?Math.round(itemRect.width):null,mediaGap:mediaRect&&copyStart?Math.round(copyStart.top-mediaRect.bottom):null,linkHeight:link?Math.round(link.height):null}};
}));

(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();
    const origin='http://127.0.0.1:'+server.address().port;await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin);await page.evaluate(value=>localStorage.setItem('frame_portfolio_v1_test_local_published',JSON.stringify(value)),draft);await page.goto(origin+'/?view=published&source=test_local');
    const desktop=await readLayout(page);
    for(const [module,variant] of [['services','cards'],['prices','list'],['prices','table'],['contact','banner'],['hero','split'],['footer','columns']])await page.locator(`[data-module="${module}"][data-variant="${variant}"]`).screenshot({path:`test-results/audit-${module}-${variant}-desktop.png`});
    await page.setViewportSize({width:375,height:812});const mobile=await readLayout(page);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.setViewportSize({width:812,height:375});const landscape=await readLayout(page);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const row=(rows,module,variant)=>rows.find(value=>value.type==='fp-site-'+module&&value.variant==='fp-variant-'+variant);
    assert.ok(row(desktop,'services','cards').item.leftInset>=18);
    assert.ok(row(desktop,'services','cards').item.mediaGap>=16);
    assert.equal(row(desktop,'prices','list').item.borderTop,'1px');
    assert.ok(row(desktop,'prices','cards').item.leftInset>=18);
    assert.ok(row(desktop,'video','wide').item.linkHeight>=44);
    assert.equal(row(desktop,'hero','split').section.display,'grid');
    assert.equal(row(desktop,'navigation','center').section.display,'flex');
    assert.equal(row(desktop,'contact','banner').section.display,'grid');
    assert.equal(row(mobile,'footer','columns').itemsColumns.trim().split(/\s+/).length,1);
    assert.ok(row(mobile,'text','simple').introFont>=16);
    assert.ok(row(mobile,'navigation','left').item.linkHeight>=44);
    assert.ok(row(mobile,'services','cards').item.mediaGap>=16);
    assert.ok(row(landscape,'navigation','left').item.linkHeight>=44);
    const summarize=rows=>rows.map(row=>({module:row.type.replace('fp-site-','')+'/'+row.variant.replace('fp-variant-',''),sectionPad:row.section.paddingLeft,introWidth:row.introWidth,itemInset:row.item.leftInset,itemBackground:row.item.background,linkHeight:row.item.linkHeight}));
    console.log(JSON.stringify({desktop:summarize(desktop),mobile:summarize(mobile)},null,2));
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
