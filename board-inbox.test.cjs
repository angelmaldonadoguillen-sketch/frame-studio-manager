const {createServer}=require('./board-preview-server.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(path.join(process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules','playwright'));

// Mi tablero es la bandeja: muestra las tarjetas de todos los tableros del
// usuario sin copiarlas ni sacarlas de donde viven.
(async()=>{
  const server=createServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    const origin='http://127.0.0.1:'+server.address().port,errors=[];
    const context=await browser.newContext({viewport:{width:1280,height:820}});
    await context.route('**/*',route=>route.request().url().startsWith(origin)?route.continue():route.abort());
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/?bandeja=1');await page.locator('[data-card-id]').first().waitFor();await page.waitForTimeout(200);

    // 1 · Qué junta cada tablero
    const reparto=await page.evaluate(()=>{
      const tarjetas=[
        {id:'mia',workspaceId:'wsA',workspaceIds:['wsA']},
        {id:'ajena',workspaceId:'wsB',workspaceIds:['wsB']},
        {id:'compartida',workspaceId:'wsB',workspaceIds:['wsB','wsA']},
        {id:'vieja',workspaceId:'wsB'},
      ];
      return {
        bandeja:boardProjects(tarjetas,'wsA',true).map(p=>p.id),
        equipo:boardProjects(tarjetas,'wsB',false).map(p=>p.id),
        soloMias:boardProjects(tarjetas,'wsA',false).map(p=>p.id),
      };
    });
    assert.deepEqual(reparto.bandeja,['mia','ajena','compartida','vieja'],'la bandeja junta todo');
    assert.deepEqual(reparto.equipo,['ajena','compartida','vieja'],'un tablero de equipo sigue mostrando lo suyo');
    assert.deepEqual(reparto.soloMias,['mia','compartida'],'sin bandeja, sólo lo de este tablero');

    // 2 · Una tarjeta ajena trae su columna, con nombre y tablero
    const columnas=await page.evaluate(()=>{
      const mias=[{id:'briefing',label:'Briefing'},{id:'editing',label:'Edición'}];
      const ajenas={wsB:[{id:'rodaje',label:'Rodaje',color:'#f5a524'}]};
      const salida=boardColumns(mias,[{status:'editing'},{status:'rodaje'},{status:'inventado'}],ajenas,{wsB:'Estudio Norte'});
      return salida.map(c=>({id:c.id,label:c.label,fromBoard:c.fromBoard||'',fromBoardId:c.fromBoardId||''}));
    });
    assert.deepEqual(columnas.slice(0,2).map(c=>c.id),['briefing','editing'],'las propias no se mueven de lugar');
    assert.deepEqual(columnas[2],{id:'rodaje',label:'Rodaje',fromBoard:'Estudio Norte',fromBoardId:'wsB'});
    assert.equal(columnas[3].fromBoard,'otro tablero','un estado sin dueño conocido igual se muestra');

    // 3 · Y sólo recibe tarjetas de su tablero
    const acepta=await page.evaluate(()=>{
      const prestada={id:'rodaje',fromBoardId:'wsB'},propia={id:'editing'};
      const mia={workspaceId:'wsA',workspaceIds:['wsA']},ajena={workspaceId:'wsB',workspaceIds:['wsB']};
      return {propiaConMia:columnAccepts(propia,mia),propiaConAjena:columnAccepts(propia,ajena),
        prestadaConMia:columnAccepts(prestada,mia),prestadaConAjena:columnAccepts(prestada,ajena)};
    });
    assert.deepEqual(acepta,{propiaConMia:true,propiaConAjena:true,prestadaConMia:false,prestadaConAjena:true});

    // 4 · En pantalla: la tarjeta de otro tablero está, y dice de dónde viene
    const enPantalla=await page.evaluate(()=>{
      const tarjeta=document.querySelector('[data-card-id="p6"]');
      const columnas=[...document.querySelectorAll('.flex-shrink-0 .text-\\[12px\\].font-semibold')].map(e=>e.textContent);
      return {existe:!!tarjeta,etiqueta:tarjeta?.textContent.includes('Estudio Norte'),
        propia:document.querySelector('[data-card-id="p1"]')?.textContent.includes('Estudio Norte'),columnas};
    });
    assert.equal(enPantalla.existe,true,'la tarjeta del otro tablero se ve en la bandeja');
    assert.equal(enPantalla.etiqueta,true,'y dice de qué tablero es');
    assert.equal(enPantalla.propia,false,'las de acá no llevan etiqueta');
    assert.ok(enPantalla.columnas.includes('Rodaje'),'la columna prestada aparece: '+enPantalla.columnas.join(', '));
    // Y con su nombre: sin la columna prestada, getStatus caía en la primera de
    // la lista y la tarjeta ajena decía «Briefing», que no es su estado.
    const estado=await page.locator('[data-card-id="p6"]').evaluate(card=>card.textContent);
    assert.ok(estado.includes('Rodaje')&&!estado.includes('Briefing'),'la tarjeta ajena muestra su estado real: '+estado.slice(0,60));

    // 5 · La columna prestada se ve pero no se administra desde acá
    const prestada=await page.evaluate(()=>{
      const titulo=[...document.querySelectorAll('.text-\\[12px\\].font-semibold')].find(e=>e.textContent==='Rodaje');
      const cabecera=titulo.closest('div[draggable]')||titulo.parentElement.parentElement;
      const propia=[...document.querySelectorAll('.text-\\[12px\\].font-semibold')].find(e=>e.textContent==='Briefing').closest('div[draggable]');
      return {dice:cabecera.textContent.includes('Estudio Norte'),arrastrable:cabecera.getAttribute('draggable'),
        menu:cabecera.querySelectorAll('button').length,menuPropia:propia?propia.querySelectorAll('button').length:0};
    });
    assert.equal(prestada.dice,true,'la columna dice de qué tablero es');
    assert.notEqual(prestada.arrastrable,'true','no se reordena desde acá');
    assert.equal(prestada.menu,0,'y no ofrece renombrarla ni borrarla');
    assert.ok(prestada.menuPropia>0,'la columna propia sí');

    // 6 · Soltar una tarjeta mía en la columna prestada no la mueve
    const avisos=[];await page.exposeFunction('__aviso',t=>avisos.push(t));
    await page.evaluate(()=>{window.frameToast=t=>window.__aviso(t);});
    const antes=await page.locator('[data-card-id="p1"]').evaluate(e=>e.closest('[class*="w-["],[class*="280"]')?.textContent.slice(0,40));
    // El arranque del arrastre pasa por el estado de React: hay que darle su
    // vuelta de reloj antes de soltar, o el tablero ni se entera.
    await page.evaluate(()=>document.querySelector('[data-card-id="p1"]')
      .dispatchEvent(new DragEvent('dragstart',{bubbles:true,dataTransfer:new DataTransfer()})));
    await page.waitForTimeout(120);
    await page.evaluate(()=>{
      const titulo=[...document.querySelectorAll('.text-\\[12px\\].font-semibold')].find(e=>e.textContent==='Rodaje');
      const columna=titulo.closest('div[draggable]').parentElement;
      columna.dispatchEvent(new DragEvent('dragover',{bubbles:true,dataTransfer:new DataTransfer()}));
      columna.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:new DataTransfer()}));
    });
    await page.waitForTimeout(250);
    const despues=await page.locator('[data-card-id="p1"]').evaluate(e=>e.closest('[class*="w-["],[class*="280"]')?.textContent.slice(0,40));
    assert.equal(despues,antes,'la tarjeta propia no se fue a la columna de otro tablero');
    assert.ok(avisos.some(t=>t.includes('Estudio Norte')),'y se avisa por qué: '+JSON.stringify(avisos));

    // 7 · El contrato del lado de app.jsx
    const app=fs.readFileSync('app.jsx','utf8');
    assert.match(app,/const inbox = activeWs\?\.kind === 'personal'/);
    assert.match(app,/if \(inbox \|\| \(project\.workspaceIds \|\| \[\]\)\.includes\(wsId\)\)/);
    assert.match(app,/\.where\('workspaceId', 'in', legacyIds\)/);
    assert.match(app,/buildClientPortalDocument\(client, boardProjects\(state\.projects, wsId, false\)/);
    assert.match(app,/const propias = newOrder\.filter\(column => !column\.fromBoard\)/);

    assert.deepEqual(errors,[]);
    console.log('Board inbox: the personal board gathers every board\'s cards, foreign cards say where they live, borrowed columns show up read-only and only take their own board\'s cards');
  }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
