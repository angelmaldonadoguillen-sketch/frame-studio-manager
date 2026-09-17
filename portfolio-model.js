(function(root) {
  const modules = [
    {type:'text',label:'Texto',variants:['simple','columns','quote']},
    {type:'gallery',label:'Galería',variants:['grid','mosaic','carousel']},
    {type:'prices',label:'Precios y paquetes',variants:['cards','list','table']},
    {type:'video',label:'Video destacado',variants:['wide','vertical','with-text']},
    {type:'image-text',label:'Imagen + texto',variants:['left','right']},
    {type:'services',label:'Servicios',variants:['cards','list']},
    {type:'contact',label:'Contacto',variants:['banner','links']},
    {type:'hero',label:'Portada',variants:['center','split']},
    {type:'navigation',label:'Navegación',variants:['left','center']},
    {type:'footer',label:'Pie de página',variants:['simple','columns']}
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const make = type => {
    const definition = modules.find(m=>m.type===type);
    if (!definition) throw new Error('Módulo desconocido');
    return {id:root.crypto.randomUUID(),type,variant:definition.variants[0],hidden:false,content:{title:definition.label,text:'',items:[]}};
  };
  const create = () => ({version:1,title:'Mi portfolio',sections:[make('text')]});
  const duplicate = section => {const copy=clone(section);copy.id=root.crypto.randomUUID();copy.content.items=copy.content.items.map(i=>({...i,id:root.crypto.randomUUID()}));return copy;};
  const move = (sections,id,offset) => {
    const next = sections.slice(),from=next.findIndex(s=>s.id===id),to=from+offset;
    if(from<0 || to<0 || to>=next.length)return next;
    [next[from],next[to]]=[next[to],next[from]];
    return next;
  };
  const safeLink = value => {
    if (!value) return '';
    try { const url=new URL(value); return ['https:','http:','mailto:','tel:'].includes(url.protocol) ? url.href : ''; } catch (_) { return ''; }
  };
  const safeImage = value => {
    if (!value) return '';
    if (typeof value==='string' && value.length<=250000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
    try { const url=new URL(value); return url.protocol==='https:' ? url.href : ''; } catch (_) { return ''; }
  };
  const safeLogo = value => {
    if(safeImage(value))return value;
    if(typeof value!=='string' || value.length>250000 || !/^data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+$/.test(value))return '';
    try {
      const svg=root.atob(value.slice(value.indexOf(',')+1));
      return /^\s*<svg(?:\s|>)/i.test(svg) && !/(?:<!DOCTYPE|<!ENTITY|<\?xml-stylesheet)/i.test(svg) && !/<\s*(?:script|foreignObject|iframe|object|embed|audio|video|link|meta)\b/i.test(svg) && !/\bon[a-z]+\s*=/i.test(svg) && !/(?:javascript:|data:text\/html|@import|url\(\s*["']?(?!#))/i.test(svg) && !/\b(?:href|src)\s*=\s*["']\s*https?:/i.test(svg) ? value : '';
    } catch (_) { return ''; }
  };
  const item = () => ({id:root.crypto.randomUUID(),title:'Nuevo elemento',text:'',image:'',link:'',price:'',currency:'USD',from:false,featured:false,inclusions:''});
  const video = value => {
    try {
      const u=new URL(value);
      if(u.protocol!=='https:' || u.username || u.password)return '';
      if(['youtube.com','www.youtube.com','youtu.be','www.youtu.be'].includes(u.hostname)){
        const id=u.hostname.endsWith('youtu.be')?u.pathname.slice(1):u.searchParams.get('v') || u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1];
        return /^[A-Za-z0-9_-]{11}$/.test(id||'')?'https://www.youtube-nocookie.com/embed/'+id:'';
      }
      if(['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(u.hostname)){
        const match=u.pathname.match(/^\/(?:video\/)?(\d+)(?:\/([a-f0-9]+))?$/);
        if(match)return 'https://player.vimeo.com/video/'+match[1]+((match[2]||u.searchParams.get('h'))?'?h='+encodeURIComponent(match[2]||u.searchParams.get('h')):'');
      }
    }catch(_){}
    return '';
  };
  const motionOptions = type => ({hero:['fade','rise','zoom'],gallery:['fade','rise','stagger'],text:['fade','rise'],'image-text':['fade','rise','zoom'],services:['fade','rise','stagger'],prices:['fade','rise','stagger']}[type]||[]);
  const fontOptions = [
    {id:'inter',name:'Inter',category:'sans',family:"'Inter', sans-serif",query:'Inter'},
    {id:'manrope',name:'Manrope',category:'sans',family:"'Manrope', sans-serif",query:'Manrope'},
    {id:'dm-sans',name:'DM Sans',category:'sans',family:"'DM Sans', sans-serif",query:'DM+Sans'},
    {id:'work-sans',name:'Work Sans',category:'sans',family:"'Work Sans', sans-serif",query:'Work+Sans'},
    {id:'space-grotesk',name:'Space Grotesk',category:'sans',family:"'Space Grotesk', sans-serif",query:'Space+Grotesk'},
    {id:'outfit',name:'Outfit',category:'sans',family:"'Outfit', sans-serif",query:'Outfit'},
    {id:'lora',name:'Lora',category:'serif',family:"'Lora', serif",query:'Lora'},
    {id:'playfair',name:'Playfair Display',category:'serif',family:"'Playfair Display', serif",query:'Playfair+Display'},
    {id:'fraunces',name:'Fraunces',category:'serif',family:"'Fraunces', serif",query:'Fraunces'},
    {id:'cormorant',name:'Cormorant Garamond',category:'serif',family:"'Cormorant Garamond', serif",query:'Cormorant+Garamond'},
    {id:'libre-baskerville',name:'Libre Baskerville',category:'serif',family:"'Libre Baskerville', serif",query:'Libre+Baskerville'}
  ];
  const validDesign = design => design===undefined || (!!design && typeof design==='object' && !Array.isArray(design) &&
    ['left','center','right'].includes(design.align) && ['compact','normal','airy'].includes(design.spacing) &&
    (design.columns===undefined || [1,2,3,4].includes(design.columns)) &&
    (design.imageRatio===undefined || ['original','wide','landscape','square','social','portrait','story'].includes(design.imageRatio)) &&
    (design.imageRadius===undefined || [0,8,16].includes(design.imageRadius)) &&
    (design.animation===undefined || ['none','fade','rise','zoom','stagger'].includes(design.animation)) &&
    (design.motionSpeed===undefined || ['quick','smooth','slow'].includes(design.motionSpeed)));
  const valid = draft => {
    try {
      return !!draft && validSiteStyle(draft.siteStyle) && validLogo(draft.logo) && (draft.loadingMode===undefined || ['progressive','static'].includes(draft.loadingMode)) && validColors(draft.colors) && (draft.theme===undefined || ['paper','studio','sand'].includes(draft.theme)) && JSON.stringify(draft).length<=3000000 && draft.version===1 && typeof draft.title==='string' && draft.title.length<=200 && Array.isArray(draft.sections) && draft.sections.length<=50 &&
        new Set(draft.sections.map(s=>s.id)).size===draft.sections.length &&
        draft.sections.every(s=>s && validDesign(s.design) && (!s.design?.animation || s.design.animation==='none' || motionOptions(s.type).includes(s.design.animation)) && typeof s.id==='string' && modules.some(m=>m.type===s.type && m.variants.includes(s.variant)) && typeof s.hidden==='boolean' && typeof s.content?.title==='string' && typeof s.content?.text==='string' && s.content.text.length<=20000 && Array.isArray(s.content.items) && s.content.items.length<=100 &&
          new Set(s.content.items.map(i=>i.id)).size===s.content.items.length && s.content.items.every(i=>i && typeof i.id==='string' && typeof i.title==='string' && i.title.length<=200 && typeof i.text==='string' && i.text.length<=20000 && (i.inclusions===undefined || typeof i.inclusions==='string' && i.inclusions.length<=20000) && (i.currency===undefined || ['USD','HNL','EUR','MXN'].includes(i.currency)) && (i.from===undefined || typeof i.from==='boolean') && (i.featured===undefined || typeof i.featured==='boolean') && (!i.video || typeof i.video==='string' && !!video(i.video)) && (!i.image || !!safeImage(i.image)) && (!i.link || !!safeLink(i.link)) && (!i.price || typeof i.price==='string' && /^\d+(\.\d{1,2})?$/.test(i.price))));
    } catch (_) { return false; }
  };
  const themes={paper:{background:'#fafafa',color:'#20242a',fontFamily:'Georgia, serif'},studio:{background:'#182b34',color:'#eef4f7',fontFamily:'Arial, sans-serif'},sand:{background:'#f2e9db',color:'#34302b',fontFamily:'Georgia, serif'}};
  const normalizeHex = value => {
    if(typeof value!=='string')return '';
    const hex=value.trim().replace(/^#/,'');
    return /^[a-f\d]{6}$/i.test(hex)?'#'+hex.toUpperCase():/^[a-f\d]{3}$/i.test(hex)?'#'+hex.split('').map(c=>c+c).join('').toUpperCase():'';
  };
  const validColors = colors => colors===undefined || (!!colors && typeof colors==='object' && !Array.isArray(colors) && Object.entries(colors).every(([key,value])=>['background','text','surface','accent'].includes(key) && typeof value==='string' && /^#[a-f\d]{6}$/i.test(value)));
  const validLogo = logo => logo===undefined || (!!logo && typeof logo==='object' && !Array.isArray(logo) && Object.keys(logo).every(key=>['src','desktopWidth','mobileWidth'].includes(key)) && !!safeLogo(logo.src) && Number.isInteger(logo.desktopWidth) && logo.desktopWidth>=64 && logo.desktopWidth<=320 && Number.isInteger(logo.mobileWidth) && logo.mobileWidth>=48 && logo.mobileWidth<=240);
  const validSiteStyle = style => style===undefined || (!!style && typeof style==='object' && !Array.isArray(style) && Object.keys(style).every(key=>['maxWidth','headingFont','bodyFont'].includes(key)) && (style.maxWidth===undefined || Number.isInteger(style.maxWidth) && style.maxWidth>=640 && style.maxWidth<=1600) && (style.headingFont===undefined || style.headingFont==='theme' || fontOptions.some(font=>font.id===style.headingFont)) && (style.bodyFont===undefined || style.bodyFont==='theme' || fontOptions.some(font=>font.id===style.bodyFont)));
  const palette = draft => {
    const base=themes[draft.theme]||themes.paper;
    return {background:base.background,text:base.color,surface:base.background,accent:base.color,...(validColors(draft.colors)?draft.colors:{})};
  };
  const pageStyle = draft => {
    const colors=palette(draft),base=themes[draft.theme]||themes.paper,style=validSiteStyle(draft.siteStyle)?draft.siteStyle||{}:{};
    const font=id=>fontOptions.find(option=>option.id===id)?.family||base.fontFamily;
    return {...base,background:colors.background,color:colors.text,fontFamily:font(style.bodyFont),'--fp-font-heading':font(style.headingFont),'--fp-page-width':(style.maxWidth||1200)+'px','--fp-site-surface':colors.surface,'--fp-site-accent':colors.accent};
  };
  const fontUrl = draft => {
    const style=validSiteStyle(draft.siteStyle)?draft.siteStyle||{}:{},ids=[style.headingFont,style.bodyFont].filter(id=>id&&id!=='theme'),fonts=[...new Set(ids)].map(id=>fontOptions.find(font=>font.id===id)).filter(Boolean);
    return fonts.length?'https://fonts.googleapis.com/css2?'+fonts.map(font=>'family='+font.query+':wght@400;500;600;700').join('&')+'&display=swap':'';
  };
  const contrast = (a,b) => {
    const luminance = hex => {const rgb=normalizeHex(hex).slice(1).match(/../g).map(c=>parseInt(c,16)/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
    const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  };
  // Firestore limita cada documento a 1 MiB. La copia pública se codifica en
  // fragmentos ASCII de 400 kB para que logos e imágenes incrustadas no se
  // acerquen al límite y para poder actualizar todo en un único batch.
  const PUBLIC_CHUNK_SIZE=400000,PUBLIC_MAX_BYTES=3000000,PUBLIC_MAX_CHUNKS=10;
  const publicationDraft = draft => {
    if(!valid(draft))throw new Error('El portfolio contiene datos no válidos.');
    const published=clone(draft);published.sections=published.sections.filter(section=>!section.hidden);
    if(!published.sections.length)throw new Error('Mostrá al menos una sección antes de publicar.');
    return published;
  };
  const hashJSON = json => {
    let hash=2166136261;
    for(let i=0;i<json.length;i++){hash^=json.charCodeAt(i);hash=Math.imul(hash,16777619);}
    return (hash>>>0).toString(16).padStart(8,'0');
  };
  const publicationHash = value => hashJSON(typeof value==='string'?value:JSON.stringify(publicationDraft(value)));
  const draftHash = value => {
    const json=typeof value==='string'?value:JSON.stringify(value);
    if(typeof value!=='string'&&!valid(value))throw new Error('El portfolio contiene datos no válidos.');
    return hashJSON(json);
  };
  const encodeJSON = (json,errorMessage) => {
    const bytes=new TextEncoder().encode(json);
    if(bytes.length>PUBLIC_MAX_BYTES)throw new Error(errorMessage);
    let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
    const encoded=root.btoa(binary),payloads=[];
    for(let i=0;i<encoded.length;i+=PUBLIC_CHUNK_SIZE)payloads.push(encoded.slice(i,i+PUBLIC_CHUNK_SIZE));
    if(!payloads.length||payloads.length>PUBLIC_MAX_CHUNKS)throw new Error('La página no se pudo preparar para guardar.');
    return {payloads,bytes:bytes.length};
  };
  const decodeJSON = payloads => {
    if(!Array.isArray(payloads)||!payloads.length||payloads.length>PUBLIC_MAX_CHUNKS||payloads.some(value=>typeof value!=='string'||!value.length||value.length>PUBLIC_CHUNK_SIZE))throw new Error('El portfolio está incompleto.');
    const binary=root.atob(payloads.join('')),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
  };
  const encodePublication = draft => {
    const published=publicationDraft(draft),json=JSON.stringify(published),encoded=encodeJSON(json,'La página pública supera 3 MB. Reducí imágenes o usá enlaces externos.');
    return {...encoded,hash:publicationHash(json),draft:published};
  };
  const decodePublication = payloads => {
    if(!Array.isArray(payloads)||!payloads.length||payloads.length>PUBLIC_MAX_CHUNKS||payloads.some(value=>typeof value!=='string'||!value.length||value.length>PUBLIC_CHUNK_SIZE))throw new Error('La publicación está incompleta.');
    try {
      const draft=decodeJSON(payloads);
      if(!valid(draft)||draft.sections.some(section=>section.hidden))throw new Error('invalid');
      return draft;
    }catch(_){throw new Error('La publicación no se pudo verificar.');}
  };
  const encodeDraft = draft => {
    if(!valid(draft))throw new Error('El portfolio contiene datos no válidos.');
    const json=JSON.stringify(draft),encoded=encodeJSON(json,'El borrador supera 3 MB. Reducí imágenes incrustadas o usá archivos subidos.');
    return {...encoded,hash:draftHash(json),draft:clone(draft)};
  };
  const decodeDraft = payloads => {
    try {const draft=decodeJSON(payloads);if(!valid(draft))throw new Error('invalid');return draft;}
    catch(_){throw new Error('El borrador guardado no se pudo verificar.');}
  };
  const api={modules,create,make,duplicate,move,valid,item,safeLink,safeImage,safeLogo,video,themes,motionOptions,fontOptions,fontUrl,normalizeHex,palette,pageStyle,contrast,publicationDraft,publicationHash,draftHash,encodePublication,decodePublication,encodeDraft,decodeDraft,PUBLIC_CHUNK_SIZE,PUBLIC_MAX_CHUNKS,PUBLIC_MAX_BYTES};
  root.FramePortfolio=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);
