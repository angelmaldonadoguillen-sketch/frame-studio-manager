// Entorno exclusivo de pruebas: no sirve index.html ni incluye Firebase.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const deps=process.env.FRAME_TEST_DEPS||'C:/Users/ANGEL M/Documents/TOONED-OS/node_modules';
const babel=require(path.join(deps,'@babel/standalone'));
function createServer(){
  return http.createServer((req,res)=>{
    res.setHeader('Cache-Control','no-store');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; connect-src 'self'; object-src 'none'; worker-src 'none'");
    const url=new URL(req.url,'http://localhost');
    if(req.method!=='GET'){res.writeHead(405);return res.end();}
    const assets={'/react.js':path.join(deps,'react/umd/react.production.min.js'),'/react-dom.js':path.join(deps,'react-dom/umd/react-dom.production.min.js'),'/model.js':path.join(root,'portfolio-model.js'),'/style.css':path.join(root,'frame.css')};
    if(assets[url.pathname]){res.setHeader('Content-Type',url.pathname.endsWith('css')?'text/css':'text/javascript');return res.end(fs.readFileSync(assets[url.pathname]));}
    if(url.pathname==='/editor.js'){
      res.setHeader('Content-Type','text/javascript');
      const mount=`
        const params=new URLSearchParams(location.search);
        const accountMode=params.has('account');
        if(accountMode){
          const records=new Map(),writes=[];
          const makeDoc=path=>({path,get:async()=>({exists:records.has(path),data:()=>records.get(path)}),collection:name=>makeCollection(path+'/'+name),onSnapshot:(next)=>{next({exists:records.has(path),data:()=>records.get(path)});return()=>{};},update:async patch=>records.set(path,{...(records.get(path)||{}),...patch})});
          const makeCollection=path=>({doc:id=>makeDoc(path+'/'+id)});
          window.__frameRecords=records;
          window.db={collection:makeCollection,batch:()=>({set:(ref,data)=>writes.push(['set',ref.path,data]),delete:ref=>writes.push(['delete',ref.path]),commit:async()=>{writes.splice(0).forEach(([kind,path,data])=>kind==='set'?records.set(path,data):records.delete(path));}})};
          window.firebase={firestore:{FieldValue:{serverTimestamp:()=>({seconds:1})}}};
          window.functions={httpsCallable:()=>async()=>({data:{assetId:'a'.repeat(32),path:'frame-portfolios/account-user/'+'a'.repeat(32)}})};
        }
        if(params.get('view')==='published'){
          const source=(params.get('source')||'test_local').replace(/[^A-Za-z0-9_-]/g,'');
          let draft=null;try{draft=JSON.parse(localStorage.getItem('frame_portfolio_v1_'+source+'_published'));}catch(_){}
          const leadingNavigation=draft?.sections[0]?.type==='navigation'?draft.sections[0]:null;
          ReactDOM.createRoot(document.getElementById('root')).render(draft&&FramePortfolio.valid(draft)?<div style={{height:'100dvh',overflow:'auto'}}><PortfolioFontLoader draft={draft}/><p>Copia publicada de prueba · solo este navegador</p><div className="frame-portfolio-page" style={FramePortfolio.pageStyle(draft)}>{leadingNavigation?null:<PortfolioBrand draft={draft}/>} {draft.sections.map(s=><PortfolioModule key={s.id} section={s} brandDraft={s.id===leadingNavigation?.id?draft:null} loadingMode={draft.loadingMode||'progressive'}/>)}</div></div>:<p>No hay una copia publicada de prueba.</p>);
        }else {
          let example;
          if(params.has('demo')) {
            const art=(word,bg,ink)=>{const c=document.createElement('canvas');c.width=700;c.height=550;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,700,550);x.strokeStyle=ink;x.lineWidth=2;for(let n=0;n<6;n++){x.beginPath();x.arc(470,270,80+n*24,0,Math.PI*2);x.stroke();}x.fillStyle=ink;x.font='bold 78px Arial';x.fillText(word,40,430);x.font='14px Arial';x.fillText('ESTUDIO FORMA / PROYECTO DE EJEMPLO',40,45);return c.toDataURL('image/jpeg',.8);};
            const hero=FramePortfolio.make('hero');hero.variant='center';hero.content.title='Ideas que toman forma.';hero.content.text='Identidad, dirección de arte y experiencias visuales.\\nUn espacio para mostrar lo que imaginamos y creamos.';
            const gallery=FramePortfolio.make('gallery');gallery.content.title='Trabajo seleccionado';gallery.content.text='Una mirada a nuestros proyectos.';gallery.content.items=[['FORMA','Identidad visual','#e1e8dd','#304738'],['OBJETO','Dirección de arte','#d8b8a0','#533827'],['RITMO','Diseño editorial','#c3c8e1','#393e5c']].map(([title,text,bg,ink])=>({...FramePortfolio.item(),title,text,image:art(title,bg,ink)}));
            const services=FramePortfolio.make('services');services.content.title='De la idea a la entrega.';services.content.items=[['Identidad visual','Sistemas que expresan quién sos.'],['Dirección de arte','Una mirada consistente en cada detalle.']].map(([title,text])=>({...FramePortfolio.item(),title,text}));
            const contact=FramePortfolio.make('contact');contact.content.title='Hagamos algo juntos.';contact.content.text='Contanos qué tenés en mente.';
            example={version:1,title:'Estudio Forma · Ejemplo',theme:'paper',sections:[hero,gallery,services,contact]};
            if(params.get('demo')==='full') {
              const section=(type,title,text,variant)=>{const s=FramePortfolio.make(type);s.content.title=title;s.content.text=text||'';if(variant)s.variant=variant;return s;};
              const block=(title,text,extra={})=>({...FramePortfolio.item(),title,text,...extra});
              const design=(extra={})=>({align:'left',spacing:'normal',...extra});
              const navigation=section('navigation','FORMA / estudio creativo','Portfolio de prueba · contenido y precios ficticios','left');
              navigation.content.items=[block('Escribinos','',{link:'mailto:hola@example.com'})];
              hero.design=design({align:'center',spacing:'airy',animation:'rise',motionSpeed:'smooth'});
              gallery.variant='mosaic';gallery.design=design({columns:3,imageRatio:'landscape',imageRadius:8,animation:'stagger',motionSpeed:'smooth'});
              gallery.content.items.push(block('TRAMA','Packaging · colección de ejemplo',{image:art('TRAMA','#d5e4e8','#224759')}));
              const story=section('image-text','Una marca que se reconoce sin decir su nombre.','Caso ficticio · FORMA, identidad para un taller de objetos.','right');
              story.design=design({spacing:'airy',imageRatio:'square',imageRadius:16,animation:'fade'});
              story.content.items=[block('Del concepto al sistema','Exploramos proporciones, tipografía y materiales para construir una identidad consistente en etiquetas, piezas impresas y medios digitales.',{image:art('FORMA','#e1e8dd','#304738')})];
              const text=section('text','Cómo trabajamos','Primero escuchamos: contexto, audiencia y objetivos. Después exploramos rutas visuales y elegimos una dirección juntos.\\n\\nLa entrega incluye archivos organizados y una guía para que el sistema siga funcionando después del lanzamiento.','columns');
              services.content.items.push(block('Contenido digital','Piezas de campaña adaptadas a redes, web y lanzamiento.'));
              services.design=design({columns:3,animation:'stagger'});
              const prices=section('prices','Elegí el punto de partida.','Precios ilustrativos en USD. No representan una oferta comercial.','cards');
              prices.content.items=[block('Esencial','Para una marca que está empezando.',{price:'350',from:true,inclusions:'Brief y dirección visual\\nLogotipo principal\\nPaleta y tipografía',link:'mailto:hola@example.com?subject=Consulta%20Esencial'}),block('Identidad completa','Un sistema preparado para crecer.',{price:'850',featured:true,inclusions:'Todo lo de Esencial\\nSistema gráfico\\nGuía de marca\\n6 aplicaciones',link:'mailto:hola@example.com?subject=Consulta%20Identidad'}),block('Campaña','Una idea llevada a varios formatos.',{price:'1400',from:true,inclusions:'Concepto de campaña\\nDirección de arte\\n12 piezas digitales',link:'mailto:hola@example.com?subject=Consulta%20Campana'})];
              const video=section('video','Movimiento con intención.','Video externo de demostración. Se carga únicamente al pulsar reproducir en Vista previa.','with-text');
              video.content.items=[block('Reproductor de prueba','Enlace de muestra de Vimeo; podés reemplazarlo por tu video.',{video:'https://vimeo.com/76979871',image:art('PLAY','#c3c8e1','#393e5c')})];
              const quote=section('text','Nuestra forma de pensar','Una buena identidad no solo se ve bien: ayuda a entender quién sos y por qué elegirte.','quote');
              contact.content.text='Estos enlaces de contacto son de ejemplo; no envían mensajes desde FRAME.';
              contact.content.items=[block('Contanos tu idea','Respuesta de ejemplo: 1–2 días hábiles.',{link:'mailto:hola@example.com'})];
              const footer=section('footer','FORMA / estudio creativo','Demo ficticia para probar FRAME Portfolio.','columns');
              footer.content.items=[block('Tegucigalpa · remoto','Identidad, diseño y dirección de arte.'),block('Probá el editor','Reordená bloques, cambiá la paleta y probá las animaciones.'),block('Contacto de ejemplo','No hay una bandeja real conectada.',{link:'mailto:hola@example.com'})];
              example={version:1,title:'Estudio Forma · Demo completa',theme:'paper',colors:{background:'#F7F9FA',text:'#20323D',surface:'#FFFFFF',accent:'#285C76'},sections:[navigation,hero,gallery,story,text,services,prices,video,quote,contact,footer]};
            }
          }
          const editorUser=accountMode?'account-user':example?(params.get('demo')==='full'?'demo-full':'demo'):'test';
          ReactDOM.createRoot(document.getElementById('root')).render(<PortfolioEditor userId={editorUser} workspaceId="local" profileName={accountMode?'Ana Creativa':''} initialDraft={example} localPreview={!accountMode}/>);
        }
      `;
      return res.end(babel.transform(fs.readFileSync(path.join(root,'portfolio.jsx'),'utf8')+mount,{presets:['react']}).code);
    }
    if(url.pathname!=='/'){res.writeHead(404);return res.end();}
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.end('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FRAME Portfolio — Pruebas</title><link rel="stylesheet" href="/style.css"><style>body{margin:0}button{cursor:pointer}[hidden]{display:none!important}</style></head><body><div id="root"></div><script src="/react.js"></script><script src="/react-dom.js"></script><script src="/model.js"></script><script src="/editor.js"></script></body></html>');
  });
}
if(require.main===module)createServer().listen(4185,'127.0.0.1',()=>console.log('Portfolio local listo: http://127.0.0.1:4185'));
module.exports={createServer};
