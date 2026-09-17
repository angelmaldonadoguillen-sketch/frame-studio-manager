const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:820}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?demo=full');
    await page.getByRole('button',{name:'Publicar prueba',exact:true}).click();
    const dialog=page.getByRole('dialog',{name:'Publicar portfolio'});
    await dialog.getByRole('button',{name:'Publicar prueba',exact:true}).click();
    await page.getByText('Publicado y actualizado',{exact:true}).waitFor();
    await page.screenshot({path:'test-results/portfolio-publish-dialog.png'});
    const url=await page.locator('#fp-public-url').inputValue();
    assert.match(url,/\?view=published&source=demo-full_local$/);
    assert.ok(await page.evaluate(()=>localStorage.getItem('frame_portfolio_v1_demo-full_local_published')));
    await page.goto(url);
    assert.equal(await page.locator('.fp-site-section').count(),11);
    assert.equal(await page.locator('.fp-editor').count(),0);
    await page.screenshot({path:'test-results/portfolio-public-desktop.png',fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'test-results/portfolio-public-mobile.png',fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('Portfolio publish: confirmation, stable link and public rendering OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
