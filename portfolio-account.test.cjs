const {createServer}=require('./portfolio-preview-server.cjs');
const path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const origin='http://127.0.0.1:'+server.address().port;
    await page.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    await page.goto(origin+'/?account=1');
    await page.getByRole('heading',{name:'Abriendo tu editor'}).waitFor();
    await page.locator('.fp-editor').waitFor();
    await page.screenshot({path:'test-results/portfolio-account-beta.png',fullPage:true});
    assert.equal(await page.locator('.fp-document-name').innerText(),'Ana Creativa — Portfolio');
    await page.getByRole('button',{name:'Guardar borrador'}).click();
    await page.waitForFunction(()=>window.__frameRecords.has('frame_portfolio_drafts/account-user'));
    const root=await page.evaluate(()=>window.__frameRecords.get('frame_portfolio_drafts/account-user'));
    assert.equal(root.ownerId,'account-user');
    assert.ok(root.chunkCount>=1);
    assert.equal(await page.evaluate(()=>sessionStorage.getItem('frame_portfolio_v2_account-user_pending')),null);
    assert.equal(await page.evaluate(()=>window.__frameRecords.has('frame_portfolio_drafts/local')),false);
    await page.getByRole('button',{name:'Publicar',exact:true}).click();
    await page.getByRole('button',{name:'Publicar ahora'}).click();
    await page.waitForFunction(()=>window.__frameRecords.has('frame_portfolios/account-user'));
    assert.equal(await page.locator('#fp-public-url').inputValue(),origin+'/?portfolio=account-user');
    assert.deepEqual(errors,[]);
    console.log('Portfolio account: loading transition, profile ownership, cloud draft and user-scoped publication OK');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
