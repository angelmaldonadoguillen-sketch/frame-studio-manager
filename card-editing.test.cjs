const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const dependencyRoot = process.env.FRAME_TEST_DEPS || 'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules';
const babel = require(path.join(dependencyRoot, '@babel/standalone'));
const { chromium } = require(path.join(dependencyRoot, 'playwright'));
const views = fs.readFileSync('views.jsx', 'utf8');
for (const file of ['app.jsx', 'views.jsx']) babel.transform(fs.readFileSync(file, 'utf8'), { presets: ['react'] });
const preview = fs.readFileSync('preview-ui.html', 'utf8');
for (const match of preview.matchAll(/<script type="text\/babel">([\s\S]*?)<\/script>/g)) babel.transform(match[1], { presets: ['react'] });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.route('**/*', route => route.abort());
    await page.setContent('<div id="root"></div>');
    await page.addScriptTag({ path: path.join(dependencyRoot, 'react/umd/react.production.min.js') });
    await page.addScriptTag({ path: path.join(dependencyRoot, 'react-dom/umd/react-dom.production.min.js') });
    await page.addStyleTag({ path: 'frame.css' });
    const source = views.slice(views.indexOf('const CardEditingContext'), views.indexOf('const ProjectCardMini'));
    const setup = "const PRIORITIES=[{id:'low',label:'Baja'},{id:'high',label:'Alta'}]; const isClosed=()=>false; const daysUntil=()=>NaN;";
    const mount = `
      window.testOpen = 0;
      function Harness() {
        const [p,setP]=React.useState({id:'p',title:'Prueba',deadline:'',sessionDate:'2026-09-10',status:'briefing',priority:'low',type:'other',tags:[],checklist:[{id:'c',text:'Revisar',done:false}]});
        window.testProject=p;
        return <CardEditingContext.Provider value={{columns:[{id:'briefing',label:'Briefing'}],types:[{id:'other',label:'Otro'}],members:[],shared:false,update:(id,patch)=>setP(x=>({...x,...patch}))}}>
          <div draggable onClick={()=>window.testOpen++}><CardQuickFields project={p}/></div>
        </CardEditingContext.Provider>;
      }
      window.emptyCounter=deliveryCounter({});
      ReactDOM.createRoot(document.getElementById('root')).render(<Harness/>);
    `;
    await page.addScriptTag({ content: babel.transform(setup + source + mount, { presets: ['react'] }).code });
    await page.getByLabel('Fecha de entrega').fill('2026-09-12');
    await page.getByLabel('Prioridad', {exact:true}).selectOption('high');
    await page.getByText('Checklist · 0 de 1', {exact:true}).click();
    await page.getByLabel('Revisar', {exact:true}).check();
    const result = await page.evaluate(() => ({ p:window.testProject, opens:window.testOpen, empty:window.emptyCounter.label }));
    assert.equal(result.p.deadline,'2026-09-12');
    assert.equal(result.p.sessionDate,'2026-09-10');
    assert.equal(result.p.priority,'high');
    assert.equal(result.p.checklist[0].done,true);
    assert.equal(result.opens,0);
    assert.equal(result.empty,'Sin fecha');
    assert.equal(await page.getByText('Responsables',{exact:true}).count(),0);
    fs.mkdirSync('test-results',{recursive:true});
    await page.screenshot({path:'test-results/card-editing.png'});
    console.log('Card editing: JSX, delivery/session separation, priority, checklist, click isolation and personal mode OK');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
