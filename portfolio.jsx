// FRAME Portfolio — editor por secciones. El documento es independiente de las tareas.
const FP_LABELS = {simple:'Simple',columns:'Columnas',quote:'Cita',grid:'Cuadrícula',mosaic:'Mosaico',carousel:'Carrusel',cards:'Tarjetas',list:'Lista',table:'Comparación',wide:'Horizontal',vertical:'Vertical','with-text':'Video + texto',left:'A la izquierda',right:'A la derecha',banner:'Llamada a la acción',links:'Enlaces',center:'Centrada',split:'Dividida'};
const FP_META = {
  hero:['layout','Una primera impresión que presenta tu trabajo.'],
  gallery:['image','Tus proyectos, en una colección visual.'],
  text:['text','Tu historia, enfoque o proceso creativo.'],
  'image-text':['layout','Una imagen acompañada de su historia.'],
  video:['play','YouTube o Vimeo, con una portada propia.'],
  services:['grid','Lo que hacés y cómo podés ayudar.'],
  prices:['tag','Paquetes con precio y alcance claros.'],
  contact:['mail','El siguiente paso para trabajar juntos.'],
  navigation:['menu','Enlaces para recorrer tu sitio.'],
  footer:['layout','Un cierre con tu información y enlaces.']
};
// www.sitio.com → https://…, correo → mailto:, teléfono → tel:. Lo que no se reconoce queda igual.
const fpLink=value=>{const v=String(value||'').trim();if(!v||/^(https?:|mailto:|tel:)/i.test(v))return v;if(/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(v))return 'mailto:'+v;if(/^\+?[\d\s().-]{7,}$/.test(v))return 'tel:'+v.replace(/[^\d+]/g,'');if(/^(www\.)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(v))return 'https://'+v;return v;};
const fpHttps=value=>{const v=String(value||'').trim();if(/^http:\/\//i.test(v))return 'https://'+v.slice(7);if(v&&!/^[a-z]+:/i.test(v)&&/^(www\.)?[\w-]+(\.[\w-]+)+\//i.test(v))return 'https://'+v;return v;};
// $250 → 250 · 1,500 → 1500 · 250,50 → 250.50
const fpPrice=value=>{const raw=String(value||'').trim(),v=raw.replace(/USD|HNL|EUR|MXN|US\$|[$€\s]|^L\.?/gi,'');if(/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(v))return v.replace(/,/g,'');if(/^\d+,\d{1,2}$/.test(v))return v.replace(',','.');return /^\d+(\.\d{1,2})?$/.test(v)?v:raw;};
const FP_ORDER = ['hero','gallery','text','image-text','video','services','prices','contact','navigation','footer'];
const FPIcon=({name,size=18})=>{
  const paths={
    plus:'M12 5v14M5 12h14', close:'m6 6 12 12M6 18 18 6', back:'m14 6-6 6 6 6',
    down:'m6 9 6 6 6-6', up:'m6 15 6-6 6 6', forward:'m10 6 6 6-6 6', undo:'M8 4 3 9l5 5M3 9h11a6 6 0 0 1 0 12',
    redo:'m16 4 5 5-5 5m5-5H10a6 6 0 0 0 0 12', desktop:'M3 4h18v13H3zM8 21h8m-4-4v4',
    phone:'M7 2h10v20H7zM11 18h2', eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
    hidden:'m3 3 18 18M9 5a11 11 0 0 1 13 7 16 16 0 0 1-4 5M6 6a16 16 0 0 0-4 6s4 7 10 7a12 12 0 0 0 5-1',
    image:'M3 3h18v18H3zM3 16l6-6 4 4 3-3 5 5M16 7h.01', text:'M4 5h16M12 5v15M8 20h8',
    layout:'M3 3h18v18H3zM3 9h18M9 9v12', grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    play:'m8 4 12 8-12 8z', tag:'M3 3h9l9 9-9 9-9-9zM8 8h.01',
    mail:'M3 5h18v14H3zM3 5l9 8 9-8', menu:'M4 6h16M4 12h16M4 18h16',
    settings:'M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6',
    copy:'M9 9h12v12H9zM15 5V3H3v12h2', trash:'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7',
    grip:'M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01',
    check:'m5 12 4 4L19 6', search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
    upload:'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6', more:'M5 12h.01M12 12h.01M19 12h.01',
    external:'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
    share:'M12 3v12M8 7l4-4 4 4M5 12v8h14v-8',
    alignLeft:'M4 6h16M4 12h10M4 18h14', alignCenter:'M4 6h16M7 12h10M5 18h14', alignRight:'M4 6h16M10 12h10M6 18h14'
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]||paths.layout}/></svg>;
};
const FPButton=({icon,label,children,className='',...props})=><button type="button" className={'fp-button '+className} aria-label={label} title={label} {...props}>{icon&&<FPIcon name={icon}/>} {children}</button>;
const FPSaveButton=({revision,saved,saving=false,...props})=>{
  const [confirmed,setConfirmed]=React.useState(false);
  React.useEffect(()=>{if(!revision){setConfirmed(false);return;}setConfirmed(true);const timer=setTimeout(()=>setConfirmed(false),2200);return()=>clearTimeout(timer);},[revision]);
  const success=!saving&&confirmed&&saved,idle=saved&&!saving;
  return <FPButton {...props} className={'fp-save-button'+(idle?' fp-save-idle':' fp-primary')+(success?' fp-save-confirmed':'')} label={saving?'Guardando portfolio':'Guardar borrador'}><span key={saving?'saving':revision} className={success?'fp-save-feedback':''}>{idle&&<FPIcon name="check" size={16}/>}<span>{saving?'Guardando…':idle?'Guardado':'Guardar'}</span></span></FPButton>;
};
const FPShare=({url,title,onCopy})=>{
  const [open,setOpen]=React.useState(false),ref=React.useRef(null);
  React.useEffect(()=>{if(!open)return;
    const outside=e=>{if(!ref.current?.contains(e.target))setOpen(false);},esc=e=>{if(e.key==='Escape')setOpen(false);};
    document.addEventListener('mousedown',outside);document.addEventListener('keydown',esc);
    return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',esc);};
  },[open]);
  const share=async()=>{
    if(navigator.share&&window.matchMedia('(pointer: coarse)').matches){try{await navigator.share({title,url});}catch(_){}return;}
    setOpen(!open);
  };
  return <div className="fp-share" ref={ref}><FPButton icon="share" label="Compartir enlace" aria-expanded={open} onClick={share}><span className="fp-share-word">Compartir</span></FPButton>
    {open&&<div className="fp-share-pop" role="dialog" aria-label="Enlace público"><input id="fp-public-url" readOnly value={url} onFocus={e=>e.target.select()}/><div><FPButton icon="copy" onClick={()=>{onCopy();setOpen(false);}}>Copiar</FPButton><FPButton icon="external" onClick={()=>window.open(url,'_blank','noopener')}>Abrir</FPButton></div></div>}
  </div>;
};
const FPSegmented=({label,value,options,onChange})=><div className="fp-field" role="group" aria-label={label}><span>{label}</span><div className="fp-segmented">{options.map(([option,text,icon])=><button type="button" key={option} aria-label={icon?text:undefined} title={icon?text:undefined} aria-pressed={value===option} onClick={()=>onChange(option)}>{icon?<FPIcon name={icon} size={16}/>:text}</button>)}</div></div>;
const FPInline=({as:Tag='span',value,placeholder,multiline=false,maxLength,onChange,onFocus,className=''})=>{
  const ref=React.useRef(null);
  const caretToEnd=el=>{if(document.activeElement!==el)return;const range=document.createRange();range.selectNodeContents(el);range.collapse(false);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);};
  React.useLayoutEffect(()=>{const el=ref.current;if(!el||el.textContent===(value||''))return;el.textContent=value||'';caretToEnd(el);},[value]);
  return <Tag ref={ref} className={('fp-inline '+className).trim()} contentEditable="plaintext-only" suppressContentEditableWarning spellCheck aria-multiline={multiline} aria-placeholder={placeholder} data-placeholder={placeholder}
    onClick={e=>e.stopPropagation()} onFocus={onFocus}
    onKeyDown={e=>{if(e.key==='Escape'||(e.key==='Enter'&&!multiline)){e.preventDefault();e.currentTarget.blur();}}}
    onInput={e=>{const el=e.currentTarget;let text=el.textContent;if(!multiline&&text.includes('\n'))text=text.replace(/\n/g,' ');if(maxLength&&text.length>maxLength)text=text.slice(0,maxLength);if(text!==el.textContent){el.textContent=text;caretToEnd(el);}onChange(text);}}/>;
};
const FPInserter=({draft,onPick,onClose})=>{
  const ref=React.useRef(null),close=React.useRef(onClose);close.current=onClose;
  React.useEffect(()=>{
    const outside=e=>{if(!ref.current?.contains(e.target)&&!e.target.closest?.('.fp-insert-line,.fp-canvas-add'))close.current();},esc=e=>{if(e.key==='Escape'){e.preventDefault();close.current();}};
    document.addEventListener('mousedown',outside);document.addEventListener('keydown',esc);
    ref.current?.querySelector('button')?.focus({preventScroll:true});ref.current?.scrollIntoView({block:'nearest'});
    return()=>{document.removeEventListener('mousedown',outside);document.removeEventListener('keydown',esc);};
  },[]);
  const page=FramePortfolio.pageStyle(draft),tint={background:page.background,color:page.color,'--fp-site-accent':page['--fp-site-accent']};
  return <div className="fp-inserter" ref={ref} role="dialog" aria-label="Agregar sección aquí" onClick={e=>e.stopPropagation()}><div className="fp-inserter-grid">{FP_ORDER.map(type=>FramePortfolio.modules.find(m=>m.type===type)).map(m=><button type="button" key={m.type} disabled={draft.sections.length>=50} onClick={()=>onPick(m.type)}><span className="fp-inserter-thumb" style={tint}><FPThumb type={m.type} variant={m.variants[0]}/></span><span>{m.label}</span></button>)}</div></div>;
};
const FPImageLink=({value,onChange})=>{
  const isLink=!!value&&!value.startsWith('data:'),[open,setOpen]=React.useState(isLink);
  const invalid=isLink&&!FramePortfolio.safeImage(value);
  return <div className="fp-disclosure">{!open&&<button type="button" className="fp-disclosure-toggle" onClick={()=>setOpen(true)}>Usar un enlace de imagen</button>}{open&&<FPField label="Imagen (enlace HTTPS)"><input type="url" autoFocus={!isLink} value={isLink?value:''} placeholder="https://" aria-invalid={invalid} onChange={e=>onChange(e.target.value)} onBlur={e=>{const next=fpHttps(e.target.value);if(next!==e.target.value)onChange(next);}}/></FPField>}{invalid&&<p className="fp-field-error">Ingresá un enlace HTTPS a una imagen.</p>}</div>;
};
const FPField=({label,children,hint})=><label className="fp-field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;
const FPThumb=({type,variant})=><div className={'fp-thumb fp-thumb-'+type+' fp-thumb-'+variant} aria-hidden="true"><div className="fp-thumb-title"/><div className="fp-thumb-lines"><i/><i/></div><div className="fp-thumb-media">{[0,1,2].map(n=><span key={n}>{type==='video'?<FPIcon name="play" size={26}/>:<><i/><i/></>}</span>)}</div></div>;

const FPColor=({label,value,onChange})=>{
  const [hex,setHex]=React.useState(value);
  const id=React.useId();
  React.useEffect(()=>setHex(value),[value]);
  const invalid=!FramePortfolio.normalizeHex(hex);
  const commit=()=>{const color=FramePortfolio.normalizeHex(hex);if(color){setHex(color);onChange(color);}};
  return <div className="fp-color-field"><label htmlFor={id}>{label}</label><div className="fp-color-inputs"><input type="color" aria-label={'Espectro: '+label} value={value} onChange={e=>onChange(e.target.value.toUpperCase())}/><input id={id} aria-label={'Hexadecimal: '+label} value={hex} spellCheck={false} maxLength={7} aria-invalid={invalid} aria-describedby={invalid?id+'-error':undefined} onChange={e=>setHex(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')commit();if(e.key==='Escape')setHex(value);}}/></div>{invalid&&<small id={id+'-error'} role="status">Usá 3 o 6 dígitos hexadecimales, por ejemplo #336699.</small>}</div>;
};
const FPPalette=({draft,edit})=>{
  const colors=FramePortfolio.palette(draft);
  const warnings=[['Texto sobre fondo',colors.text,colors.background],['Texto sobre tarjetas',colors.text,colors.surface],['Acento sobre fondo',colors.accent,colors.background],['Acento sobre tarjetas',colors.accent,colors.surface]].filter(([,a,b])=>FramePortfolio.contrast(a,b)<4.5);
  return <div className="fp-palette"><h3>Paleta personalizada</h3>{[['background','Fondo'],['text','Texto'],['surface','Tarjetas'],['accent','Acento']].map(([key,label])=><FPColor key={key} label={label} value={colors[key]} onChange={color=>edit(d=>({...d,colors:{...d.colors,[key]:color}}),'color-'+key)}/>)}{warnings.length>0&&<div className="fp-color-warning" role="status">Contraste bajo: {warnings.map(([label])=>label.toLowerCase()).join(', ')}. Ajustá los colores para facilitar la lectura.</div>}<FPButton disabled={!draft.colors} onClick={()=>edit(d=>{const next={...d};delete next.colors;return next;})}>Restablecer colores del tema</FPButton></div>;
};
const PortfolioBrand=({draft})=><div className="fp-site-brand">{FramePortfolio.safeLogo(draft.logo?.src)?<><img className="fp-site-logo" src={draft.logo.src} alt="" style={{'--fp-logo-desktop':(draft.logo.desktopWidth||140)+'px','--fp-logo-mobile':(draft.logo.mobileWidth||104)+'px'}}/><h1 className="fp-site-title fp-visually-hidden">{draft.title||'Mi portfolio'}</h1></>:<h1 className="fp-site-title">{draft.title||'Mi portfolio'}</h1>}<span>Portfolio</span></div>;
const PortfolioNavigationBrand=({draft,label})=><div className="fp-navigation-brand">{FramePortfolio.safeLogo(draft.logo?.src)?<><img className="fp-site-logo" src={draft.logo.src} alt="" style={{'--fp-logo-desktop':(draft.logo.desktopWidth||140)+'px','--fp-logo-mobile':(draft.logo.mobileWidth||104)+'px'}}/><h1 className="fp-site-title fp-visually-hidden">{draft.title||'Mi portfolio'}</h1></>:<h1 className="fp-site-title">{label||draft.title||'Mi portfolio'}</h1>}</div>;
const FPLogoSettings=({draft,edit,busy,error,progress,inputRef,onUpload})=>{
  const logo=draft.logo,desktop=logo?.desktopWidth||140,mobile=logo?.mobileWidth||104;
  const pick=file=>{if(file)onUpload(file);};
  return <div className="fp-logo-settings" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files?.[0]);}}><h3>Logo</h3><button className="fp-logo-drop" disabled={busy} onClick={()=>inputRef.current?.click()}>{logo?<img src={logo.src} alt="Vista previa del logo"/>:<><FPIcon name="upload" size={22}/><strong>Subir logo</strong><span>o arrastralo aquí</span></>}</button><input hidden ref={inputRef} type="file" accept=".svg,.png,.jpg,.jpeg,.webp,.avif,image/svg+xml,image/png,image/jpeg,image/webp,image/avif" onChange={e=>{pick(e.target.files?.[0]);e.target.value='';}}/>{busy&&progress>0&&<div className="fp-upload-progress" role="progressbar" aria-label="Procesando logo" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}><span style={{width:progress+'%'}}/></div>}{busy&&<p className="fp-help" role="status">Procesando logo… {progress}%</p>}{error&&<p className="fp-field-error" role="alert">{error}</p>}{logo&&<><label className="fp-logo-size"><span>Ancho en escritorio <output>{desktop}px</output></span><input type="range" min="64" max="320" step="4" value={desktop} aria-label="Tamaño del logo en escritorio" onChange={e=>edit(d=>({...d,logo:{...d.logo,desktopWidth:Number(e.target.value)}}),'logo-desktop')}/></label><label className="fp-logo-size"><span>Ancho en móvil <output>{mobile}px</output></span><input type="range" min="48" max="240" step="4" value={mobile} aria-label="Tamaño del logo en móvil" onChange={e=>edit(d=>({...d,logo:{...d.logo,mobileWidth:Number(e.target.value)}}),'logo-mobile')}/></label><div className="fp-media-actions"><button disabled={busy} onClick={()=>inputRef.current?.click()}>Cambiar</button><button disabled={busy} onClick={()=>edit(d=>{const next={...d};delete next.logo;return next;})}>Quitar logo</button></div></>}</div>;
};
const PortfolioFontLoader=({draft})=>{
  const href=FramePortfolio.fontUrl(draft);
  React.useEffect(()=>{let link=document.querySelector('link[data-frame-portfolio-fonts]');if(!href){link?.remove();return;}if(!link){link=document.createElement('link');link.rel='stylesheet';link.dataset.framePortfolioFonts='';document.head.appendChild(link);}if(link.href!==href)link.href=href;},[href]);
  React.useEffect(()=>()=>document.querySelector('link[data-frame-portfolio-fonts]')?.remove(),[]);
  return null;
};
const FPFontSelect=({label,value,onChange})=><FPField label={label}><select value={value||'theme'} onChange={e=>onChange(e.target.value)}><option value="theme">Fuente del tema</option><optgroup label="Sans serif">{FramePortfolio.fontOptions.filter(font=>font.category==='sans').map(font=><option key={font.id} value={font.id}>{font.name}</option>)}</optgroup><optgroup label="Serif">{FramePortfolio.fontOptions.filter(font=>font.category==='serif').map(font=><option key={font.id} value={font.id}>{font.name}</option>)}</optgroup></select></FPField>;
const FPSiteStyleSettings=({draft,edit})=>{
  const style=draft.siteStyle||{},maxWidth=style.maxWidth||1200,previewStyle=FramePortfolio.pageStyle(draft);
  const width=FP_WIDTHS.reduce((best,option)=>Math.abs(option[0]-maxWidth)<Math.abs(best[0]-maxWidth)?option:best)[0];
  const update=patch=>edit(d=>({...d,siteStyle:{...d.siteStyle,...patch}}),Object.keys(patch)[0]);
  return <div className="fp-site-style-settings"><h3>Tipografía y ancho</h3><div className="fp-field" role="group" aria-label="Ancho del contenido"><span>Ancho del contenido</span><div className="fp-width-options">{FP_WIDTHS.map(([value,label])=><button type="button" key={value} aria-pressed={width===value} onClick={()=>update({maxWidth:value})}><span className="fp-width-thumb" aria-hidden="true"><i style={{width:Math.round(value/1600*100)+'%'}}/></span>{label}</button>)}</div></div><FPFontSelect label="Fuente de títulos" value={style.headingFont} onChange={headingFont=>update({headingFont})}/><FPFontSelect label="Fuente de texto" value={style.bodyFont} onChange={bodyFont=>update({bodyFont})}/><div className="fp-font-preview" style={previewStyle} aria-label="Vista previa de tipografías"><strong>Ideas que toman forma.</strong><span>Diseño, dirección de arte y experiencias visuales.</span></div><FPButton disabled={!draft.siteStyle} onClick={()=>edit(d=>{const next={...d};delete next.siteStyle;return next;})}>Restablecer tipografía y ancho</FPButton></div>;
};
const FP_WIDTHS=[[760,'Angosto'],[1200,'Normal'],[1440,'Amplio']];
const FP_STORAGE_LIMIT=1024*1024*1024;
// Errores de subida en palabras de persona. Los de la función ya vienen en español.
const fpUploadError=(err,fallback)=>{const code=String(err?.code||'');
  if(code==='functions/resource-exhausted')return 'Alcanzaste el límite de 1 GB de tu portfolio.';
  if(['functions/unauthenticated','functions/permission-denied','functions/invalid-argument'].includes(code)&&err.message)return err.message;
  if(code.startsWith('functions/')||code.startsWith('storage/'))return 'El servicio de archivos no está respondiendo. Tu borrador no se perdió; intentá de nuevo más tarde.';
  return err?.message||fallback;};
const fpBytes=value=>{const bytes=Math.max(0,Number(value)||0);if(bytes<1024)return bytes+' B';if(bytes<1024*1024)return (bytes/1024).toFixed(bytes<10240?1:0)+' KB';return (bytes/1024/1024).toFixed(bytes<104857600?1:0)+' MB';};
const PortfolioLoadingScreen=({profileName,onExit})=><main className="fp-entry-loading" aria-busy="true" aria-live="polite"><div className="fp-entry-mark" aria-hidden="true"><FrameMark size={40}/></div><div className="fp-entry-copy"><span>FRAME PORTFOLIO</span><h1>Abriendo tu editor</h1><p>{profileName?'Preparando el portfolio de '+profileName+'.':'Preparando tus módulos, estilos y recursos.'}</p><div className="fp-entry-progress"><i/></div></div>{onExit&&<button type="button" onClick={onExit}>Volver a FRAME</button>}</main>;
const PortfolioEditor=({userId,workspaceId:legacyWorkspaceId,onExit,localPreview=false,initialDraft,canPublish=true,profileName=''})=>{
  const key=localPreview?'frame_portfolio_v1_'+userId+'_'+legacyWorkspaceId:'frame_portfolio_v2_'+userId;
  const legacyKey='frame_portfolio_v1_'+userId+'_'+legacyWorkspaceId;
  const pendingAtEntry=React.useRef(false),baselineJSON=React.useRef(''),unsyncedAtEntry=React.useRef(false);
  const [draft,setDraft]=React.useState(()=>{
    let pending=null,value=null;try{pending=JSON.parse(sessionStorage.getItem(key+'_pending'));}catch(_){}try{value=JSON.parse(localStorage.getItem(key));unsyncedAtEntry.current=!localPreview&&localStorage.getItem(key+'_unsynced')==='1';}catch(_){}
    if(FramePortfolio.valid(pending)){pendingAtEntry.current=!FramePortfolio.valid(value)||JSON.stringify(pending)!==JSON.stringify(value);return pending;}
    if(FramePortfolio.valid(value)){if(unsyncedAtEntry.current)pendingAtEntry.current=true;return value;}
    try{if(!localPreview){const legacy=JSON.parse(localStorage.getItem(legacyKey));if(FramePortfolio.valid(legacy))return legacy;}}catch(_){}
    if(initialDraft&&FramePortfolio.valid(initialDraft)){baselineJSON.current=JSON.stringify(initialDraft);return initialDraft;}
    const fresh=FramePortfolio.create();if(profileName)fresh.title=profileName+' — Portfolio';baselineJSON.current=JSON.stringify(fresh);return fresh;
  });
  const draftRef=React.useRef(draft),past=React.useRef([]),future=React.useRef([]),group=React.useRef(null);
  const [savedJSON,setSavedJSON]=React.useState(()=>{try{return unsyncedAtEntry.current?'':localStorage.getItem(key)||baselineJSON.current;}catch(_){return baselineJSON.current;}});
  const saved=JSON.stringify(draft)===savedJSON;
  const [saveRevision,setSaveRevision]=React.useState(0),[saving,setSaving]=React.useState(false),[initializing,setInitializing]=React.useState(!localPreview);
  const [blocked,setBlocked]=React.useState(false),[error,setError]=React.useState(''),[notice,setNotice]=React.useState('');
  const [selected,setSelected]=React.useState(draft.sections[0]?.id),[itemId,setItemId]=React.useState(null);
  const [tab,setTab]=React.useState('content'),[rail,setRail]=React.useState('sections'),[pane,setPane]=React.useState('preview');
  const [preview,setPreview]=React.useState(false),[device,setDevice]=React.useState(()=>window.matchMedia('(max-width: 600px)').matches?'mobile':'desktop');
  const [collapsed,setCollapsed]=React.useState({}),[dragging,setDragging]=React.useState(null),[dropTarget,setDropTarget]=React.useState(null);
  const [dragBlock,setDragBlock]=React.useState(null);
  const [motionReplay,setMotionReplay]=React.useState({id:null,token:0});
  const [reducedMotion,setReducedMotion]=React.useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReducedMotion(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  const [insertAt,setInsertAt]=React.useState(null),[canvasZoom,setCanvasZoom]=React.useState(1);
  const [busy,setBusy]=React.useState(false),[uploadError,setUploadError]=React.useState(''),[uploadProgress,setUploadProgress]=React.useState(0);
  const [logoProgress,setLogoProgress]=React.useState(0),[logoError,setLogoError]=React.useState('');
  const [usage,setUsage]=React.useState({usedBytes:0,reservedBytes:0,loading:!localPreview});
  const [confirmUnpublish,setConfirmUnpublish]=React.useState(false),[publishing,setPublishing]=React.useState(false);
  const [publication,setPublication]=React.useState({loading:!localPreview&&canPublish,published:false,contentHash:'',updatedAt:null,error:''});
  const canvasRef=React.useRef(null),importRef=React.useRef(null),imageRef=React.useRef(null),logoRef=React.useRef(null),rootRef=React.useRef(null),mounted=React.useRef(true),uploadToken=React.useRef(0);
  const section=draft.sections.find(s=>s.id===selected),item=section?.content.items.find(i=>i.id===itemId);
  const definition=FramePortfolio.modules.find(m=>m.type===section?.type);
  React.useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;uploadToken.current++;};},[]);
  React.useEffect(()=>{
    try {const raw=localStorage.getItem(key);if(raw&&!FramePortfolio.valid(JSON.parse(raw))){setBlocked(true);setError('El archivo guardado no se puede leer. Exportá un respaldo o importá uno válido para recuperarlo.');}}
    catch(_){setBlocked(true);setError('No se pudo leer el archivo guardado. Podés exportar tu trabajo como respaldo.');}
  },[key]);
  React.useEffect(()=>{
    if(localPreview){setInitializing(false);return;}
    let active=true;const started=Date.now();
    const finish=()=>setTimeout(()=>{if(active)setInitializing(false);},Math.max(0,420-(Date.now()-started)));
    const load=async()=>{
      if(!window.db||!userId){if(active)setError('No se pudo conectar el portfolio con tu cuenta. Tu copia local sigue disponible.');finish();return;}
      try{
        const root=window.db.collection('frame_portfolio_drafts').doc(userId),snapshot=await root.get(),data=snapshot.exists?snapshot.data():null;
        if(data&&Number.isInteger(data.chunkCount)&&data.chunkCount>0&&data.chunkCount<=FramePortfolio.PUBLIC_MAX_CHUNKS){
          const chunks=await Promise.all(Array.from({length:data.chunkCount},(_,index)=>root.collection('chunks').doc(String(index).padStart(2,'0')).get()));
          if(chunks.some(chunk=>!chunk.exists||chunk.data().version!==data.version))throw new Error('incomplete');
          const cloud=FramePortfolio.decodeDraft(chunks.map(chunk=>chunk.data().payload));
          if(FramePortfolio.draftHash(cloud)!==data.contentHash)throw new Error('incomplete');
          if(active){setBlocked(false);setError('');}
          if(active&&!pendingAtEntry.current){draftRef.current=cloud;setDraft(cloud);setSavedJSON(JSON.stringify(cloud));setSelected(cloud.sections[0]?.id);try{localStorage.setItem(key,JSON.stringify(cloud));sessionStorage.removeItem(key+'_pending');}catch(_){}}
          else if(active&&pendingAtEntry.current)setNotice('Recuperamos cambios sin guardar');
        }
      }catch(err){if(active)setError(err?.code==='permission-denied'?'El guardado en tu cuenta todavía no está habilitado en Firebase. Tu borrador local no se perdió.':'No pudimos cargar la copia de tu cuenta. Podés continuar con el borrador de este dispositivo.');}
      finally{finish();}
    };
    load();return()=>{active=false;};
  },[key,localPreview,userId]);
  React.useEffect(()=>{if(FramePortfolio.valid(draft)){try{const json=JSON.stringify(draft);if(json===savedJSON)sessionStorage.removeItem(key+'_pending');else sessionStorage.setItem(key+'_pending',json);}catch(_){}}},[draft,key,savedJSON]);
  React.useEffect(()=>{if(itemId&&!item)setItemId(null);if(selected&&!section)setSelected(draft.sections[0]?.id);},[draft,itemId,selected]);
  React.useEffect(()=>{if(!initializing)requestAnimationFrame(()=>rootRef.current?.focus({preventScroll:true}));},[initializing]);
  React.useLayoutEffect(()=>{
    const el=canvasRef.current;if(!el||!preview||device!=='desktop'){setCanvasZoom(1);return;}
    const measure=()=>{const style=getComputedStyle(el);setCanvasZoom(Math.min(1,(el.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))/1440));};
    measure();const observer=new ResizeObserver(measure);observer.observe(el);return()=>observer.disconnect();
  },[preview,device]);
  React.useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),notice.undo?7000:4500);return()=>clearTimeout(timer);},[notice]);
  // El menú ⋯ se cierra al tocar afuera o con Escape
  React.useEffect(()=>{
    const close=e=>{if(e.type==='keydown'&&e.key!=='Escape')return;rootRef.current?.querySelectorAll('details.fp-more[open]').forEach(menu=>{if(e.type==='keydown'||!menu.contains(e.target))menu.open=false;});};
    document.addEventListener('mousedown',close);document.addEventListener('keydown',close);
    return()=>{document.removeEventListener('mousedown',close);document.removeEventListener('keydown',close);};
  },[]);
  React.useEffect(()=>{
    if(localPreview){try{const value=localStorage.getItem(key+'_published');setPublication({loading:false,published:!!value,contentHash:value?FramePortfolio.publicationHash(value):'',updatedAt:null,error:''});}catch(_){setPublication({loading:false,published:false,contentHash:'',updatedAt:null,error:''});}return;}
    if(!canPublish||!window.db||!userId){setPublication({loading:false,published:false,contentHash:'',updatedAt:null,error:''});return;}
    let active=true;setPublication(value=>({...value,loading:true,error:''}));
    window.db.collection('frame_portfolios').doc(userId).get().then(snapshot=>{
      if(!active)return;const data=snapshot.exists?snapshot.data():null;
      setPublication({loading:false,published:data?.published===true,contentHash:data?.contentHash||'',updatedAt:data?.updatedAt||null,error:''});
    }).catch(err=>{if(active)setPublication({loading:false,published:false,contentHash:'',updatedAt:null,error:err?.code==='permission-denied'?'La publicación aún no está habilitada en Firebase.':'No se pudo consultar la publicación.'});});
    return()=>{active=false;};
  },[key,localPreview,canPublish,userId]);
  React.useEffect(()=>{
    if(localPreview||!window.db||!userId){setUsage(value=>({...value,loading:false}));return;}
    return window.db.collection('frame_portfolio_usage').doc(userId).onSnapshot(snapshot=>{const data=snapshot.exists?snapshot.data():{};setUsage({usedBytes:Number(data.usedBytes)||0,reservedBytes:Number(data.reservedBytes)||0,loading:false});},()=>setUsage(value=>({...value,loading:false})));
  },[localPreview,userId]);
  const edit=(fn,field)=>{
    const before=draftRef.current,next=fn(before);if(JSON.stringify(before)===JSON.stringify(next))return;
    const now=Date.now();if(!field||group.current?.field!==field||now-group.current.time>800)past.current=[...past.current,before].slice(-30);
    group.current={field,time:now};future.current=[];draftRef.current=next;setDraft(next);
  };
  const choose=(id,child=null,fromCanvas=false)=>{
    setSelected(id);setItemId(child);setTab('content');setPane('properties');setUploadError('');
    if(fromCanvas)requestAnimationFrame(()=>rootRef.current?.querySelector('.fp-inspector-title')?.focus({preventScroll:true}));
    else requestAnimationFrame(()=>{const el=document.getElementById('fp-section-'+id);if(el&&window.innerWidth>1000)el.scrollIntoView({block:'nearest',behavior:'auto'});});
  };
  const updateSection=(patch,field)=>edit(d=>({...d,sections:d.sections.map(s=>s.id===selected?{...s,...patch}:s)}),field);
  const updateDesign=patch=>updateSection({design:{align:section.variant==='center'?'center':'left',spacing:'normal',...section.design,...patch}});
  const updateContent=(patch,field)=>edit(d=>({...d,sections:d.sections.map(s=>s.id===selected?{...s,content:{...s.content,...patch}}:s)}),field);
  const updateItem=(patch,field)=>edit(d=>({...d,sections:d.sections.map(s=>s.id===selected?{...s,content:{...s.content,items:s.content.items.map(i=>i.id===itemId?{...i,...patch}:i)}}:s)}),field);
  const travel=dir=>{
    const source=dir==='undo'?past:future,target=dir==='undo'?future:past;if(!source.current.length||busy)return;
    const next=source.current.pop();target.current=[...target.current,draftRef.current].slice(-30);group.current=null;
    draftRef.current=next;setDraft(next);setNotice('');
  };
  const firstInvalid=d=>{for(const s of d.sections)for(const i of s.content.items)if(!FramePortfolio.valid({...d,sections:[{...s,content:{...s.content,items:[i]}}]}))return [s.id,i.id];return null;};
  const save=async()=>{
    if(blocked||busy||saving)return false;
    if(saved){setSaveRevision(n=>n+1);return true;}
    if(!FramePortfolio.valid(draftRef.current)){const bad=firstInvalid(draftRef.current);if(bad){setSelected(bad[0]);setItemId(bad[1]);setTab('content');}setError(bad?'Corregí el campo marcado en rojo para continuar.':'El portfolio tiene datos que no se pueden guardar. Exportá un respaldo para no perderlos.');return false;}
    setSaving(true);setError('');group.current=null;const json=JSON.stringify(draftRef.current);
    try {localStorage.setItem(key,json);if(!localPreview)localStorage.setItem(key+'_unsynced','1');}
    catch(_){setSaveRevision(0);setError('No se pudo crear la copia local. Exportá un respaldo para conservar tu trabajo.');setSaving(false);return false;}
    if(localPreview){sessionStorage.removeItem(key+'_pending');setSavedJSON(json);setSaveRevision(n=>n+1);setSaving(false);return true;}
    try{
      if(!window.db||!userId)throw new Error('offline');
      const prepared=FramePortfolio.encodeDraft(draftRef.current),version=crypto.randomUUID().replaceAll('-',''),batch=window.db.batch(),root=window.db.collection('frame_portfolio_drafts').doc(userId);
      prepared.payloads.forEach((payload,index)=>batch.set(root.collection('chunks').doc(String(index).padStart(2,'0')),{ownerId:userId,index,version,payload}));
      for(let index=prepared.payloads.length;index<FramePortfolio.PUBLIC_MAX_CHUNKS;index++)batch.delete(root.collection('chunks').doc(String(index).padStart(2,'0')));
      batch.set(root,{ownerId:userId,title:prepared.draft.title||'Portfolio',chunkCount:prepared.payloads.length,version,contentHash:prepared.hash,schemaVersion:1,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      await batch.commit();try{localStorage.removeItem(key+'_unsynced');}catch(_){}sessionStorage.removeItem(key+'_pending');setSavedJSON(json);setSaveRevision(n=>n+1);return true;
    }catch(err){setSaveRevision(0);setError(err?.code==='permission-denied'?'Firebase todavía no permite guardar el portfolio en tu cuenta. Conservamos una copia local y los cambios pendientes.':'No se pudo sincronizar con tu cuenta. Conservamos una copia local para reintentar.');return false;}
    finally{setSaving(false);}
  };
  React.useEffect(()=>{
    const warn=e=>{if(!saved){e.preventDefault();e.returnValue='';}};
    const keyboard=e=>{
      const active=document.activeElement;
      if(e.key==='Escape'&&preview&&!e.defaultPrevented&&!rootRef.current?.querySelector('dialog[open],details[open],.fp-share-pop')){setPreview(false);return;}
      if(!(e.ctrlKey||e.metaKey)||e.altKey||(active&&active!==document.body&&!rootRef.current?.contains(active)))return;
      const k=e.key.toLowerCase();
      if(k==='s'){e.preventDefault();save();return;}
      if(e.target.closest?.('input,textarea,select'))return;
      if(k==='z'||k==='y'){e.preventDefault();travel(k==='y'||e.shiftKey?'redo':'undo');}
    };
    window.addEventListener('beforeunload',warn);window.addEventListener('keydown',keyboard);
    return()=>{window.removeEventListener('beforeunload',warn);window.removeEventListener('keydown',keyboard);};
  },[saved,blocked,busy,saving,draft,preview]);
  const exportDraft=()=>{
    let content=JSON.stringify(draftRef.current,null,2);try{if(blocked)content=localStorage.getItem(key)||content;}catch(_){}
    const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='frame-portfolio-borrador.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  const importDraft=async e=>{
    const file=e.target.files?.[0];e.target.value='';if(!file)return;
    try {if(file.size>3000000)throw new Error('El respaldo supera 3 MB.');let value;
      try{value=JSON.parse(await file.text());}catch(_){throw new Error('Ese archivo no es un respaldo de FRAME Portfolio.');}
      if(!FramePortfolio.valid(value))throw new Error('El respaldo no es compatible con esta versión del portfolio.');
      const original=localStorage.getItem(key);if(original)localStorage.setItem(key+'_recovery',original);
      uploadToken.current++;edit(()=>value);setSelected(value.sections[0]?.id);setItemId(null);setBlocked(false);setError('');setNotice({text:'Respaldo importado',undo:true});
    }catch(err){setError(err.message);}
  };
  const publishTest=()=>{
    try {if(blocked)throw new Error('Revisá el portfolio antes de crear la copia.');const prepared=FramePortfolio.encodePublication(draftRef.current),json=JSON.stringify(prepared.draft);
      localStorage.setItem(key+'_published',json);setPublication({loading:false,published:true,contentHash:prepared.hash,updatedAt:null,error:''});
      setNotice('Portfolio publicado');
    }catch(err){setError(err.message);}
  };
  const publicUrl=React.useMemo(()=>{const url=new URL(window.location.href);url.search='';url.hash='';if(localPreview){url.searchParams.set('view','published');url.searchParams.set('source',userId+'_'+legacyWorkspaceId);}else url.searchParams.set('portfolio',userId);return url.href;},[localPreview,userId,legacyWorkspaceId]);
  let currentHash='';try{currentHash=FramePortfolio.publicationHash(draft);}catch(_){}
  const publicationCurrent=publication.published&&publication.contentHash===currentHash;
  const publishRemote=async()=>{
    if(publishing||blocked||(!canPublish&&!localPreview))return;
    setPublishing(true);setError('');
    if(!saved&&!(await save())){setPublishing(false);return;}
    try{FramePortfolio.publicationDraft(draftRef.current);}catch(err){setError(err.message);setPublishing(false);return;}
    if(localPreview){publishTest();setPublishing(false);return;}
    if(!window.db){setError('No hay conexión con tu cuenta. Intentá publicar de nuevo en un momento.');setPublishing(false);return;}
    try {
      const prepared=FramePortfolio.encodePublication(draftRef.current),version=crypto.randomUUID().replaceAll('-',''),batch=window.db.batch(),root=window.db.collection('frame_portfolios').doc(userId);
      prepared.payloads.forEach((payload,index)=>batch.set(root.collection('chunks').doc(String(index).padStart(2,'0')),{ownerId:userId,index,version,payload}));
      for(let index=prepared.payloads.length;index<FramePortfolio.PUBLIC_MAX_CHUNKS;index++)batch.delete(root.collection('chunks').doc(String(index).padStart(2,'0')));
      batch.set(root,{ownerId:userId,title:prepared.draft.title||'Portfolio',published:true,chunkCount:prepared.payloads.length,version,contentHash:prepared.hash,schemaVersion:1,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});
      await batch.commit();
      setPublication({loading:false,published:true,contentHash:prepared.hash,updatedAt:new Date(),error:''});setNotice(publication.published?'Página pública actualizada':'Portfolio publicado');
    }catch(err){setError(err?.code==='permission-denied'?'Firebase rechazó la publicación. Hay que activar las reglas nuevas antes de usarla.':'No se pudo publicar. Revisá tu conexión e intentá nuevamente.');}
    finally{setPublishing(false);}
  };
  const unpublish=async()=>{
    if(localPreview){try{localStorage.removeItem(key+'_published');setPublication({loading:false,published:false,contentHash:'',updatedAt:null,error:''});setNotice('Página retirada');}catch(_){setError('No se pudo retirar la copia.');}return;}
    if(publishing||!canPublish||!window.db)return;
    setPublishing(true);setError('');
    try{await window.db.collection('frame_portfolios').doc(userId).update({published:false,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});setPublication(value=>({...value,published:false,updatedAt:new Date(),error:''}));setNotice('Página retirada');}
    catch(err){setError(err?.code==='permission-denied'?'No tenés permiso para retirar esta página.':'No se pudo retirar la página. Intentá nuevamente.');}
    finally{setPublishing(false);}
  };
  const copyPublicUrl=async()=>{try{await navigator.clipboard.writeText(publicUrl);setNotice('Enlace copiado');}catch(_){setError('No se pudo copiar automáticamente. Seleccioná el enlace y copialo.');}};
  const addAtEnd=()=>{setPreview(false);setPane('preview');setInsertAt(draftRef.current.sections.length);};
  const insertSection=(type,at)=>{
    if(draftRef.current.sections.length>=50)return;const s=FramePortfolio.make(type);
    edit(d=>{const list=d.sections.slice();list.splice(Math.min(at,list.length),0,s);return {...d,sections:list};});
    setInsertAt(null);setSelected(s.id);setItemId(null);setTab('content');setNotice('Sección agregada');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const el=document.getElementById('fp-section-'+s.id),title=el?.querySelector('.fp-inline');if(!el)return;
      el.scrollIntoView({block:'nearest'});if(!title)return;title.focus({preventScroll:true});
      const range=document.createRange();range.selectNodeContents(title);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    }));
  };
  const addItem=()=>{
    if(!section||section.content.items.length>=100)return;const next=FramePortfolio.item();next.title='';
    const sid=selected;updateContent({items:[...section.content.items,next]});choose(sid,next.id);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{const block=document.querySelector('#fp-section-'+sid+' .fp-site-item[data-selected="true"]');if(!block)return;block.scrollIntoView({block:'nearest'});block.querySelector('.fp-inline')?.focus({preventScroll:true});}));
  };
  const duplicate=()=>{
    if(!section)return;
    if(item){if(section.content.items.length>=100)return;const copy={...item,id:crypto.randomUUID()};updateContent({items:section.content.items.flatMap(i=>i.id===itemId?[i,copy]:[i])});choose(selected,copy.id);}
    else {if(draft.sections.length>=50)return;const copy=FramePortfolio.duplicate(section);edit(d=>({...d,sections:d.sections.flatMap(s=>s.id===selected?[s,copy]:[s])}));choose(copy.id);}
    setNotice('Copia agregada');
  };
  const remove=()=>{
    if(item){updateContent({items:section.content.items.filter(i=>i.id!==itemId)});setItemId(null);setNotice({text:'Bloque quitado',undo:true});}
    else if(section){const list=draftRef.current.sections,index=list.findIndex(s=>s.id===selected),neighbor=list[index+1]||list[index-1];edit(d=>({...d,sections:d.sections.filter(s=>s.id!==selected)}));setItemId(null);setSelected(neighbor?.id);setNotice({text:'Sección quitada',undo:true});}
  };
  const nudge=(e,sid,bid)=>{
    const offset={ArrowUp:-1,ArrowDown:1}[e.key];if(!offset)return;e.preventDefault();
    edit(d=>({...d,sections:bid?d.sections.map(s=>s.id!==sid?s:{...s,content:{...s.content,items:FramePortfolio.move(s.content.items,bid,offset)}}):FramePortfolio.move(d.sections,sid,offset)}));
  };
  const dropSection=(targetId)=>{
    setDropTarget(null);if(!dragging||dragging===targetId){setDragging(null);return;}
    edit(d=>{const list=d.sections.slice(),from=list.findIndex(s=>s.id===dragging),to=list.findIndex(s=>s.id===targetId);if(from<0||to<0)return d;const [entry]=list.splice(from,1);list.splice(to,0,entry);return {...d,sections:list};});setDragging(null);
  };
  const dropBlock=(sid,targetId)=>{
    setDropTarget(null);if(!dragBlock||dragBlock.sid!==sid||dragBlock.id===targetId){setDragBlock(null);return;}
    edit(d=>({...d,sections:d.sections.map(s=>{
      if(s.id!==sid)return s;
      const items=s.content.items.slice(),from=items.findIndex(i=>i.id===dragBlock.id),to=items.findIndex(i=>i.id===targetId);
      if(from<0||to<0)return s;
      const [entry]=items.splice(from,1);items.splice(to,0,entry);
      return {...s,content:{...s.content,items}};
    })}));setDragBlock(null);
  };
  const blobDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('No se pudo preparar el archivo.'));reader.readAsDataURL(blob);});
  const uploadAsset=async(blob,kind,token,onProgress)=>{
    if(localPreview)return blobDataUrl(blob);
    if(!window.functions||!window.storage||!userId)throw new Error('La carga de archivos todavía no está disponible. Guardá y reintentá cuando tengas conexión.');
    const reservation=await window.functions.httpsCallable('reservePortfolioAsset')({size:blob.size,contentType:blob.type,kind});
    const {path,assetId}=reservation.data||{};if(!path||!assetId)throw new Error('No se pudo reservar espacio para el archivo.');
    const task=window.storage.ref(path).put(blob,{contentType:blob.type,customMetadata:{ownerId:userId,assetId,kind}});
    const snapshot=await new Promise((resolve,reject)=>task.on('state_changed',state=>{if(mounted.current&&uploadToken.current===token&&state.totalBytes)onProgress(Math.min(98,Math.round(state.bytesTransferred/state.totalBytes*38)+60));},reject,()=>resolve(task.snapshot)));
    return snapshot.ref.getDownloadURL();
  };
  const uploadImage=async file=>{
    if(!file||!item||busy)return;const sid=selected,iid=itemId,token=++uploadToken.current;setBusy(true);setUploadError('');setUploadProgress(3);let url;
    try {
      if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('Elegí JPG, PNG o WebP de hasta 10 MB.');
      url=URL.createObjectURL(file);const img=new Image();
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('La imagen tardó demasiado. Intentá otra vez.')),15000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(new Error('No se pudo abrir la imagen. Elegí otro archivo.'));};img.src=url;});
      const scale=Math.min(1,1200/Math.max(img.width,img.height)),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);
      setUploadProgress(55);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.82));if(!blob)throw new Error('No se pudo optimizar la imagen.');
      const data=await uploadAsset(blob,'content',token,setUploadProgress);if(localPreview&&data.length>250000)throw new Error('Esta imagen es muy pesada para el borrador de prueba. Elegí una más pequeña o usá un enlace.');
      if(mounted.current&&uploadToken.current===token){setUploadProgress(100);edit(d=>({...d,sections:d.sections.map(s=>s.id===sid?{...s,content:{...s.content,items:s.content.items.map(i=>i.id===iid?{...i,image:data}:i)}}:s)}));setNotice('Imagen cargada');}
    }catch(err){if(mounted.current){setUploadProgress(0);setUploadError(fpUploadError(err,'No se pudo cargar la imagen.'));}}finally{if(url)URL.revokeObjectURL(url);if(mounted.current)setBusy(false);}
  };
  const uploadLogo=async file=>{
    if(!file||busy)return;const token=++uploadToken.current;setBusy(true);setLogoError('');setLogoProgress(2);let url;
    const read=(mode='data')=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onprogress=e=>{if(e.lengthComputable&&mounted.current&&token===uploadToken.current)setLogoProgress(Math.max(3,Math.round(e.loaded/e.total*55)));};reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('No se pudo leer el archivo. Intentá nuevamente.'));mode==='text'?reader.readAsText(file):reader.readAsDataURL(file);});
    try {
      const extension=file.name.split('.').pop().toLowerCase(),isSvg=file.type==='image/svg+xml'||extension==='svg',allowed=['image/png','image/jpeg','image/webp','image/avif'];
      if(file.size>10*1024*1024 || (!isSvg&&!allowed.includes(file.type)&&!['png','jpg','jpeg','webp','avif'].includes(extension)))throw new Error('Elegí un archivo SVG, PNG, JPG, WebP o AVIF de hasta 10 MB.');
      let data,blob;
      if(isSvg){
        if(file.size>500*1024)throw new Error('El SVG supera 500 KB. Simplificalo antes de subirlo.');
        const raw=await read('text');setLogoProgress(65);
        const parsed=new DOMParser().parseFromString(raw,'image/svg+xml'),svg=parsed.documentElement;
        if(parsed.querySelector('parsererror')||svg.localName.toLowerCase()!=='svg')throw new Error('El SVG no se pudo interpretar. Revisá el archivo.');
        svg.querySelectorAll('script,foreignObject,iframe,object,embed,audio,video,link,meta').forEach(node=>node.remove());
        svg.querySelectorAll('style').forEach(node=>{if(/@import|javascript:|url\(\s*["']?(?!#)/i.test(node.textContent))node.remove();});
        svg.querySelectorAll('*').forEach(node=>Array.from(node.attributes).forEach(attr=>{const name=attr.name.toLowerCase(),value=attr.value.trim();if(name.startsWith('on')||name==='src'||((name==='href'||name==='xlink:href')&&!value.startsWith('#'))||/javascript:|data:text\/html|url\(\s*["']?(?!#)/i.test(value))node.removeAttribute(attr.name);}));
        const clean=new XMLSerializer().serializeToString(svg);blob=new Blob([clean],{type:'image/svg+xml'});
      }else{
        const source=await read();setLogoProgress(62);url=source;const img=new Image();
        await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('El logo tardó demasiado en abrirse. Intentá otra vez.')),15000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(new Error('No se pudo abrir el logo. Elegí otro archivo.'));};img.src=url;});
        if(!img.width||!img.height||img.width*img.height>40000000)throw new Error('La imagen tiene dimensiones demasiado grandes.');
        setLogoProgress(58);const scale=Math.min(1,1600/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.88));if(!blob)throw new Error('No se pudo optimizar el logo.');
      }
      data=await uploadAsset(blob,'logo',token,setLogoProgress);if(!FramePortfolio.safeLogo(data))throw new Error('El logo no pasó la validación de seguridad.');
      if(mounted.current&&token===uploadToken.current){edit(d=>({...d,logo:{src:data,desktopWidth:d.logo?.desktopWidth||140,mobileWidth:d.logo?.mobileWidth||104}}));setLogoProgress(100);setNotice('Logo listo');}
    }catch(err){if(mounted.current){setLogoProgress(0);setLogoError(fpUploadError(err,'No se pudo cargar el logo.'));}}finally{if(url?.startsWith('blob:'))URL.revokeObjectURL(url);if(mounted.current)setBusy(false);}
  };
  if(initializing)return <PortfolioLoadingScreen profileName={profileName} onExit={onExit}/>;
  const total=item?section.content.items.length:draft.sections.length;
  const mediaType=section&&['gallery','image-text','hero','services','video'].includes(section.type);
  const visibleSections=draft.sections.filter(s=>!s.hidden),leadingNavigation=visibleSections[0]?.type==='navigation'?visibleSections[0]:null;
  return <section className="fp-editor" ref={rootRef} tabIndex="-1" aria-label="Editor de portfolio" data-preview={preview} data-pane={pane}>
    <PortfolioFontLoader draft={draft}/>
    <header className="fp-topbar">
      <div className="fp-brand-group">{onExit?<FPButton icon="back" label="Volver a FRAME" onClick={onExit}/>:<span className="fp-mark"><FrameMark size={24}/></span>}<div><span className="fp-brand"><FrameWordmark height={13} label="FRAME"/><span>Portfolio</span></span><span className="fp-document-name">{draft.title||'Sin título'}</span></div></div>
      <div className="fp-devices" aria-label="Tamaño de vista previa"><FPButton icon="desktop" label="Escritorio" aria-pressed={device==='desktop'} onClick={()=>setDevice('desktop')}/><FPButton icon="phone" label="Móvil" aria-pressed={device==='mobile'} onClick={()=>setDevice('mobile')}/></div>
      <div className="fp-top-actions">
        <div className="fp-history"><FPButton icon="undo" label="Deshacer" disabled={!past.current.length||busy} onClick={()=>travel('undo')}/><FPButton icon="redo" label="Rehacer" disabled={!future.current.length||busy} onClick={()=>travel('redo')}/></div>
        <FPButton icon={preview?'layout':'eye'} label={preview?'Volver al editor':'Vista previa'} aria-pressed={preview} onClick={()=>{setPreview(!preview);setPane('preview');}}><span className="fp-preview-word">{preview?'Editar':'Vista previa'}</span></FPButton>
        <FPSaveButton revision={saveRevision} saved={saved} saving={saving} onClick={save} disabled={blocked||busy||saving||saved}/>
        {publication.published&&<FPShare url={publicUrl} title={draft.title||'Portfolio'} onCopy={copyPublicUrl}/>}
        <FPButton icon={publicationCurrent?'check':'upload'} className={'fp-publish-button'+(publicationCurrent?' fp-published':'')} disabled={publication.loading||publishing||saving||publicationCurrent||blocked||(!canPublish&&!localPreview)} onClick={publishRemote}>{publication.loading?'Consultando…':publishing?(saving?'Guardando…':'Publicando…'):publication.published?(publicationCurrent?'Publicado':'Actualizar'):'Publicar'}</FPButton>
        <details className="fp-more" onToggle={e=>{if(!e.currentTarget.open)setConfirmUnpublish(false);}}><summary aria-label="Más opciones" title="Más opciones"><FPIcon name="more"/></summary><div><button className="fp-mobile-history" disabled={!past.current.length||busy} onClick={()=>travel('undo')}>Deshacer cambio</button><button className="fp-mobile-history" disabled={!future.current.length||busy} onClick={()=>travel('redo')}>Rehacer cambio</button><button onClick={e=>{e.currentTarget.closest('details').open=false;exportDraft();}}>Exportar respaldo</button><button onClick={e=>{e.currentTarget.closest('details').open=false;importRef.current.click();}}>Importar respaldo</button>{publication.published&&(confirmUnpublish?<div className="fp-more-confirm"><span>¿Retirar la página pública?</span><div><button onClick={()=>setConfirmUnpublish(false)}>Cancelar</button><button className="fp-danger" disabled={publishing} onClick={async e=>{const menu=e.currentTarget.closest('details');await unpublish();setConfirmUnpublish(false);if(menu)menu.open=false;}}>Retirar</button></div></div>:<button className="fp-danger" onClick={()=>setConfirmUnpublish(true)}>Retirar página</button>)}</div></details>
      </div>
    </header>
    <input hidden type="file" accept=".json,application/json" ref={importRef} onChange={importDraft}/>
    {!error&&publication.error&&<div className="fp-alert" role="alert">{publication.error}<FPButton icon="close" label="Cerrar aviso" onClick={()=>setPublication(value=>({...value,error:''}))}/></div>}
    {error&&<div className="fp-alert" role="alert">{error}<FPButton icon="close" label="Cerrar aviso" onClick={()=>setError('')}/></div>}
    <div className="fp-workspace">
      <aside className="fp-sidebar" aria-label="Estructura de la página">
        <div className="fp-rail-tabs"><button aria-pressed={rail==='sections'} onClick={()=>setRail('sections')}><FPIcon name="layout"/>Secciones</button><button aria-pressed={rail==='theme'} onClick={()=>setRail('theme')}><FPIcon name="settings"/>Tema</button></div>
        {rail==='theme'?<div className="fp-theme-panel">
          <h2>Identidad del sitio</h2>
          {!localPreview&&<div className="fp-account-storage"><div><span>Portfolio de {profileName||'tu cuenta'}</span><strong>{usage.loading?'Calculando…':fpBytes(usage.usedBytes+usage.reservedBytes)+' de 1 GB'}</strong></div><div role="progressbar" aria-label="Almacenamiento del portfolio" aria-valuemin="0" aria-valuemax={FP_STORAGE_LIMIT} aria-valuenow={Math.min(FP_STORAGE_LIMIT,usage.usedBytes+usage.reservedBytes)}><i style={{width:Math.min(100,(usage.usedBytes+usage.reservedBytes)/FP_STORAGE_LIMIT*100)+'%'}}/></div></div>}
          <FPField label="Nombre del portfolio"><input maxLength={200} value={draft.title} onChange={e=>edit(d=>({...d,title:e.target.value}),'site-title')}/></FPField>
          <FPLogoSettings draft={draft} edit={edit} busy={busy} error={logoError} progress={logoProgress} inputRef={logoRef} onUpload={uploadLogo}/>
          <h3>Apariencia</h3><div className="fp-theme-options">{[['paper','Editorial'],['studio','Estudio'],['sand','Arena']].map(([id,label])=><button key={id} aria-pressed={(draft.theme||'paper')===id} onClick={()=>edit(d=>({...d,theme:id}))}><span style={FramePortfolio.themes[id]}>Aa</span>{label}{(draft.theme||'paper')===id&&<FPIcon name="check" size={14}/>}</button>)}</div>
          {draft.colors&&<p className="fp-theme-note" role="status">Tus colores propios tienen prioridad sobre la apariencia. <button type="button" onClick={()=>edit(d=>{const next={...d};delete next.colors;return next;})}>Usar los del tema</button></p>}
          <FPPalette draft={draft} edit={edit}/>
          <FPSiteStyleSettings draft={draft} edit={edit}/>
          <h3>Comportamiento de la página</h3><FPSegmented label="Carga de módulos" value={draft.loadingMode||'progressive'} options={[['progressive','Progresiva'],['static','Estática']]} onChange={value=>edit(d=>({...d,loadingMode:value}))}/>
        </div>:<>
          <div className="fp-tree-heading"><span>Página de inicio</span><span>{draft.sections.length}</span></div>
          <div className="fp-tree" aria-label="Secciones">
            {draft.sections.map((s,sectionIndex)=>{const open=collapsed[s.id]===undefined?s.id===selected:!collapsed[s.id];return <div className="fp-tree-section" key={s.id} data-selected={s.id===selected} data-hidden={s.hidden} data-dragging={dragging===s.id} data-drop={dropTarget?.id===s.id?dropTarget.side:undefined} onDragOver={e=>{if(!dragging)return;e.preventDefault();e.dataTransfer.dropEffect='move';const side=dragging===s.id?null:sectionIndex>draft.sections.findIndex(x=>x.id===dragging)?'after':'before';if(dropTarget?.id!==s.id||dropTarget?.side!==side)setDropTarget(side?{id:s.id,side}:null);}} onDrop={e=>{e.preventDefault();dropSection(s.id);}}>
              <div className="fp-tree-row"><button className="fp-grip" draggable aria-label={'Arrastrar '+s.content.title} title="Arrastrar o usar ↑ ↓ para reordenar" aria-keyshortcuts="ArrowUp ArrowDown" onKeyDown={e=>nudge(e,s.id)} onDragStart={e=>{setDragging(s.id);e.dataTransfer.setData('text/plain',s.id);e.dataTransfer.effectAllowed='move';}} onDragEnd={()=>{setDragging(null);setDropTarget(null);}}><FPIcon name="grip" size={14}/></button><button className="fp-tree-select" aria-pressed={selected===s.id&&!itemId} onClick={()=>choose(s.id)}><FPIcon name={FP_META[s.type][0]} size={17}/><span>{s.content.title||FramePortfolio.modules.find(m=>m.type===s.type).label}</span></button><FPButton className="fp-eye" icon={s.hidden?'hidden':'eye'} label={(s.hidden?'Mostrar ':'Ocultar ')+(s.content.title||'sección')} aria-pressed={!!s.hidden} onClick={()=>edit(d=>({...d,sections:d.sections.map(x=>x.id===s.id?{...x,hidden:!x.hidden}:x)}))}/>{s.content.items.length>0&&<FPButton className="fp-collapse" icon={open?'down':'forward'} label={(open?'Plegar ':'Expandir ')+(s.content.title||'sección')} aria-expanded={open} onClick={()=>setCollapsed(c=>({...c,[s.id]:open}))}/>}</div>
              {open&&<div className="fp-tree-children">{s.content.items.map((i,n)=><div key={i.id} className="fp-tree-block-row" data-dragging={dragBlock?.id===i.id} data-drop={dropTarget?.id===i.id?dropTarget.side:undefined} onDragOver={e=>{if(!dragBlock)return;e.stopPropagation();if(dragBlock.sid!==s.id)return;e.preventDefault();const side=dragBlock.id===i.id?null:n>s.content.items.findIndex(x=>x.id===dragBlock.id)?'after':'before';if(dropTarget?.id!==i.id||dropTarget?.side!==side)setDropTarget(side?{id:i.id,side}:null);}} onDrop={e=>{if(dragBlock){e.stopPropagation();e.preventDefault();dropBlock(s.id,i.id);}}}><button className="fp-block-grip" draggable aria-label={'Arrastrar bloque '+(i.title||n+1)} title="Arrastrar o usar ↑ ↓ para reordenar" aria-keyshortcuts="ArrowUp ArrowDown" onKeyDown={e=>nudge(e,s.id,i.id)} onDragStart={e=>{e.stopPropagation();setDragBlock({sid:s.id,id:i.id});e.dataTransfer.setData('text/plain',i.id);e.dataTransfer.effectAllowed='move';}} onDragEnd={()=>{setDragBlock(null);setDropTarget(null);}}><FPIcon name="grip" size={12}/></button><button className="fp-tree-child" aria-label={'Seleccionar bloque '+(n+1)+' de '+s.content.title} aria-pressed={selected===s.id&&itemId===i.id} onClick={()=>choose(s.id,i.id)}><FPIcon name={['gallery','hero','image-text','video'].includes(s.type)?'image':'text'} size={14}/><span>{i.title||'Bloque '+(n+1)}</span></button></div>)}{s.id===selected&&s.type!=='text'&&<button className="fp-tree-add" disabled={s.content.items.length>=100} onClick={()=>{setItemId(null);addItem();}}><FPIcon name="plus" size={14}/>Agregar bloque</button>}</div>}
            </div>;})}
            <FPButton icon="plus" className="fp-add-section" disabled={draft.sections.length>=50} onClick={addAtEnd}>Agregar sección</FPButton>
          </div>
        </>}
      </aside>
      <main className="fp-stage" aria-label="Lienzo del portfolio">
        
        <div ref={canvasRef} className={'fp-canvas-scroll '+(device==='mobile'?'fp-device-mobile':'')}><div className="fp-browser-frame" style={preview&&device==='desktop'?{width:1440,maxWidth:'none',zoom:canvasZoom}:undefined}>
          <div className="frame-portfolio-page" style={FramePortfolio.pageStyle(draft)}>
            {leadingNavigation?null:<PortfolioBrand draft={draft}/>} 
            {visibleSections.map(s=>{const at=draft.sections.findIndex(x=>x.id===s.id);return <React.Fragment key={s.id}>
              {!preview&&(insertAt===at?<FPInserter draft={draft} onPick={type=>insertSection(type,at)} onClose={()=>setInsertAt(null)}/>:<div className="fp-insert-line"><button type="button" aria-label="Agregar sección aquí" title="Agregar sección aquí" disabled={draft.sections.length>=50} onClick={e=>{e.stopPropagation();setInsertAt(at);}}><span><FPIcon name="plus" size={14}/></span></button></div>)}
              <div id={'fp-section-'+s.id} className="fp-canvas-section" data-selected={!preview&&s.id===selected&&!itemId} role={preview?undefined:'button'} tabIndex={preview?undefined:0} aria-label={preview?undefined:'Editar sección '+s.content.title} onClick={preview?undefined:()=>choose(s.id,null,true)} onKeyDown={preview?undefined:e=>{if(e.target===e.currentTarget&&['Enter',' '].includes(e.key)){e.preventDefault();choose(s.id,null,true);}}}>
              {!preview&&<span className="fp-selection-label">{FramePortfolio.modules.find(m=>m.type===s.type).label}</span>}
              <PortfolioModule loadingMode={draft.loadingMode||'progressive'} section={s} brandDraft={s.id===leadingNavigation?.id?draft:null} mobile={device==='mobile'} editing={!preview} replayToken={motionReplay.id===s.id?motionReplay.token:0} selectedItem={s.id===selected?itemId:null} onSelectItem={preview?undefined:id=>choose(s.id,id,true)} active={!preview&&s.id===selected} onFocusText={id=>{setSelected(s.id);setItemId(id);setTab('content');}} onEditText={preview?undefined:(patch,id)=>edit(d=>({...d,sections:d.sections.map(x=>x.id!==s.id?x:{...x,content:id?{...x.content,items:x.content.items.map(i=>i.id===id?{...i,...patch}:i)}:{...x.content,...patch}})}),'inline-'+s.id+'-'+(id||'')+'-'+Object.keys(patch)[0])}/>
            </div></React.Fragment>;})}
            {!preview&&insertAt===draft.sections.length&&<FPInserter draft={draft} onPick={type=>insertSection(type,draft.sections.length)} onClose={()=>setInsertAt(null)}/>}
            {!draft.sections.some(s=>!s.hidden)&&<div className="fp-empty-page"><FPIcon name="layout" size={36}/><h2>Un espacio para tu trabajo.</h2>{!preview&&insertAt!==draft.sections.length&&<FPButton icon="plus" onClick={()=>setInsertAt(draft.sections.length)}>Agregar sección</FPButton>}</div>}
            {!preview&&insertAt!==draft.sections.length&&draft.sections.some(s=>!s.hidden)&&<button className="fp-canvas-add" disabled={draft.sections.length>=50} onClick={()=>setInsertAt(draft.sections.length)}><FPIcon name="plus" size={16}/>Agregar sección</button>}
          </div>
        </div></div>
      </main>
      <aside className="fp-inspector" aria-label="Ajustes de la selección">
        <div className="fp-inspector-head">{item&&<FPButton icon="back" label="Volver a la sección" onClick={()=>setItemId(null)}/>}<div><span>{item?'Bloque · '+definition.label:'Sección'}</span><h2 className="fp-inspector-title" tabIndex="-1">{item?(item.title||'Bloque sin título'):(section?.content.title||'Elegí una sección')}</h2></div><FPButton className="fp-close-panel" icon="close" label="Cerrar ajustes" onClick={()=>setPane('preview')}/></div>
        {section?<>
          {!item&&<div className="fp-inspector-tabs"><button aria-pressed={tab==='content'} onClick={()=>setTab('content')}>Contenido</button><button aria-pressed={tab==='design'} onClick={()=>setTab('design')}>Diseño</button></div>}
          <div className="fp-inspector-scroll" key={(itemId||selected)+':'+tab}>
            {item?<>
              {mediaType&&<div className="fp-media-field" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();uploadImage(e.dataTransfer.files?.[0]);}} onPaste={e=>{const file=Array.from(e.clipboardData.items).find(i=>i.type.startsWith('image/'))?.getAsFile();if(file){e.preventDefault();uploadImage(file);}}}>
                <span className="fp-field-title">{section.type==='video'?'Portada del video':'Imagen'}</span>
                <button className="fp-upload" disabled={busy} onClick={()=>imageRef.current.click()}>{FramePortfolio.safeImage(item.image)?<PortfolioImage src={item.image} title={item.title}/>:<><FPIcon name="image" size={28}/><strong>Seleccionar imagen</strong><span>o arrastrá y soltá aquí</span></>}{busy&&<span className="fp-upload-busy">{uploadProgress>=60&&!localPreview?'Subiendo '+uploadProgress+'%':'Procesando imagen…'}</span>}</button>
                <input hidden ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const file=e.target.files?.[0];e.target.value='';uploadImage(file);}}/>
                {busy&&uploadProgress>0&&<div className="fp-upload-progress" role="progressbar" aria-label="Progreso de la imagen" aria-valuemin="0" aria-valuemax="100" aria-valuenow={uploadProgress}><span style={{width:uploadProgress+'%'}}/></div>}
                {item.image&&<div className="fp-media-actions"><button onClick={()=>imageRef.current.click()} disabled={busy}>Cambiar</button><button onClick={()=>updateItem({image:''})}>Quitar imagen</button></div>}
                <FPImageLink value={item.image||''} onChange={image=>updateItem({image},'image-'+itemId)}/>
                {uploadError&&<p role="alert" className="fp-field-error">{uploadError}</p>}
              </div>}
              {section.type==='video'&&<FPField label="Enlace de YouTube o Vimeo"><input type="url" value={item.video||''} placeholder="https://vimeo.com/…" onChange={e=>updateItem({video:e.target.value},'video-'+itemId)} onBlur={e=>{const next=fpHttps(/^(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(e.target.value.trim())?'https://'+e.target.value.trim():e.target.value);if(next!==e.target.value)updateItem({video:next},'video-'+itemId);}}/>{item.video&&!FramePortfolio.video(item.video)&&<small className="fp-field-error">Usá un enlace original de YouTube o Vimeo.</small>}</FPField>}
              <FPField label="Nombre"><input maxLength={200} value={item.title} placeholder="Título del bloque" onChange={e=>updateItem({title:e.target.value},'item-title-'+itemId)}/></FPField>
              <FPField label="Descripción"><textarea maxLength={20000} rows="4" value={item.text} placeholder="Contá algo sobre este trabajo…" onChange={e=>updateItem({text:e.target.value},'item-text-'+itemId)}/></FPField>
              {section.type==='prices'&&<><FPField label="Precio"><input inputMode="decimal" value={item.price||''} placeholder="0.00" onChange={e=>updateItem({price:e.target.value},'price-'+itemId)} onBlur={e=>{const next=fpPrice(e.target.value);if(next!==e.target.value)updateItem({price:next},'price-'+itemId);}}/>{item.price&&!/^\d+(\.\d{1,2})?$/.test(item.price)&&<small className="fp-field-error">Usá un número, por ejemplo 250.00.</small>}</FPField><FPSegmented label="Moneda" value={item.currency||'USD'} options={['USD','HNL','EUR','MXN'].map(c=>[c,c])} onChange={currency=>updateItem({currency})}/><label className="fp-check"><input type="checkbox" role="switch" checked={!!item.from} onChange={e=>updateItem({from:e.target.checked})}/>Mostrar «Desde»</label><label className="fp-check"><input type="checkbox" role="switch" checked={!!item.featured} onChange={e=>updateItem({featured:e.target.checked})}/>Destacar paquete</label><FPField label="Inclusiones (una por línea)"><textarea rows="5" value={item.inclusions||''} onChange={e=>updateItem({inclusions:e.target.value},'inclusions-'+itemId)}/></FPField></>}
              <FPField label="Enlace"><input value={item.link||''} placeholder="https://" onChange={e=>updateItem({link:e.target.value},'link-'+itemId)} onBlur={e=>{const next=fpLink(e.target.value);if(next!==e.target.value)updateItem({link:next},'link-'+itemId);}}/>{item.link&&!FramePortfolio.safeLink(item.link)&&<small className="fp-field-error">Escribí una web, un correo o un teléfono.</small>}</FPField>
            </>:tab==='design'?<>
              <h3 className="fp-group-title">Composición</h3><div className="fp-variant-options">{definition.variants.map(v=><button key={v} aria-pressed={section.variant===v} onClick={()=>updateSection(section.design?{variant:v,design:{...section.design,align:v==='center'?'center':'left'}}:{variant:v})}><FPThumb type={section.type} variant={v}/><span>{FP_LABELS[v]}</span></button>)}</div>
              <FPSegmented label="Alineación" value={section.design?.align||(section.variant==='center'?'center':'left')} options={[['left','Izquierda','alignLeft'],['center','Centro','alignCenter'],['right','Derecha','alignRight']]} onChange={align=>updateDesign({align})}/>
              <FPSegmented label="Espaciado" value={section.design?.spacing||'normal'} options={[['compact','Compacto'],['normal','Normal'],['airy','Amplio']]} onChange={spacing=>updateDesign({spacing})}/>
              {['gallery','services','prices'].includes(section.type)&&!['carousel','list'].includes(section.variant)&&<FPField label="Columnas en escritorio"><div className="fp-segmented">{[1,2,3,4].map(n=><button key={n} aria-label={n+' columnas'} aria-pressed={(section.design?.columns||3)===n} onClick={()=>updateDesign({columns:n})}>{n}</button>)}</div></FPField>}
              {['gallery','hero','image-text','services'].includes(section.type)&&<><h3 className="fp-group-title">Imágenes</h3><FPField label="Relación de aspecto"><select aria-label="Relación de aspecto" value={section.design?.imageRatio||'landscape'} onChange={e=>updateDesign({imageRatio:e.target.value})}><option value="original">Original · sin recorte</option><option value="wide">Panorámica · 16:9</option><option value="landscape">Horizontal · 4:3</option><option value="square">Cuadrada · 1:1</option><option value="social">Retrato · 4:5</option><option value="portrait">Vertical · 3:4</option><option value="story">Historia · 9:16</option></select></FPField><FPField label="Esquinas"><div className="fp-segmented">{[[0,'Rectas'],[8,'Suaves'],[16,'Redondas']].map(([value,label])=><button key={value} aria-pressed={(section.design?.imageRadius||0)===value} onClick={()=>updateDesign({imageRadius:value})}>{label}</button>)}</div></FPField></>}
              {!!FramePortfolio.motionOptions(section.type).length&&<div className="fp-motion-settings"><h3 className="fp-group-title">Animación de entrada</h3><FPField label="Efecto"><select aria-label="Efecto de animación" value={section.design?.animation||'none'} onChange={e=>updateDesign({animation:e.target.value})}><option value="none">Sin animación</option>{FramePortfolio.motionOptions(section.type).map(effect=><option key={effect} value={effect}>{{fade:'Aparecer suavemente',rise:'Subir suavemente',zoom:'Acercamiento sutil',stagger:'Bloques en secuencia'}[effect]}</option>)}</select></FPField>{section.design?.animation&&section.design.animation!=='none'&&<><FPSegmented label="Velocidad" value={section.design.motionSpeed||'smooth'} options={[['quick','Rápida'],['smooth','Suave'],['slow','Pausada']]} onChange={motionSpeed=>updateDesign({motionSpeed})}/><FPButton icon="play" disabled={reducedMotion} onClick={()=>{document.getElementById('fp-section-'+selected)?.scrollIntoView({block:'start',behavior:'auto'});setMotionReplay(r=>({id:selected,token:r.token+1}));}}>Probar animación</FPButton></>}{reducedMotion&&<p className="fp-help">Reducir movimiento está activado en este dispositivo.</p>}</div>}
            </>:<>
              <FPField label="Título"><input maxLength={200} value={section.content.title} onChange={e=>updateContent({title:e.target.value},'title-'+selected)}/></FPField><FPField label="Texto"><textarea rows="5" maxLength={20000} value={section.content.text} placeholder={section.type==='hero'?'Presentá lo que hacés y para quién.':'Escribí el contenido de esta sección…'} onChange={e=>updateContent({text:e.target.value},'text-'+selected)}/></FPField>
              {section.type!=='text'&&<div className="fp-section-blocks"><h3>Bloques <span>{section.content.items.length}</span></h3>{section.content.items.map((i,n)=><button key={i.id} onClick={()=>choose(selected,i.id)}><FPIcon name={mediaType?'image':'text'} size={16}/><span>{i.title||'Bloque '+(n+1)}</span><FPIcon name="back" size={14}/></button>)}<FPButton icon="plus" disabled={section.content.items.length>=100} onClick={addItem}>Agregar bloque</FPButton></div>}
            </>}
          </div>
          <div className="fp-inspector-foot"><div><FPButton icon="copy" label={item?'Duplicar bloque':'Duplicar sección'} disabled={total>=(item?100:50)} onClick={duplicate}/><FPButton className="fp-danger" icon="trash" label={item?'Quitar bloque':'Quitar sección'} onClick={remove}/></div></div>
        </>:<div className="fp-inspector-empty"><FPIcon name="layout" size={30}/><FPButton icon="plus" onClick={addAtEnd}>Agregar sección</FPButton></div>}
      </aside>
    </div>
    {!preview&&<nav className="fp-mobile-nav" aria-label="Paneles del editor">{[['sections','layout','Secciones'],['preview','eye','Página'],['properties','settings','Ajustes']].map(([id,icon,label])=><button key={id} aria-pressed={pane===id} onClick={()=>setPane(id)}><FPIcon name={icon}/>{label}</button>)}</nav>}
    {notice&&<div className="fp-toast" role="status"><FPIcon name="check" size={16}/>{notice.text||notice}{notice.undo&&<button type="button" className="fp-toast-action" aria-label="Deshacer último cambio" onClick={()=>travel('undo')}>Deshacer</button>}</div>}
  </section>;
};

const PortfolioImage=({src,title,loading='lazy'})=>{
  const [failed,setFailed]=React.useState(false);React.useEffect(()=>setFailed(false),[src]);
  return failed?<div className="fp-image-error"><FPIcon name="image" size={24}/><span>No se pudo cargar la imagen</span><button onClick={e=>{e.stopPropagation();setFailed(false);}}>Reintentar</button></div>:<img src={FramePortfolio.safeImage(src)} alt={title||''} loading={loading} referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>;
};
const PortfolioVideo=({item,vertical,editing,loading='lazy'})=>{
  const [playing,setPlaying]=React.useState(false),src=FramePortfolio.video(item.video);
  React.useEffect(()=>setPlaying(false),[item.video,editing]);
  const cover=<>{FramePortfolio.safeImage(item.image)&&<PortfolioImage src={item.image} title="" loading={loading}/>}<span className="fp-play-mark"><FPIcon name="play" size={28}/></span><span>{src?'Reproducir video':'Agregá un enlace de YouTube o Vimeo'}</span></>;
  return <div className="fp-video-player" data-vertical={vertical}>{playing&&!editing?<iframe title={item.title||'Video del portfolio'} src={src} loading="lazy" allow="fullscreen; picture-in-picture" allowFullScreen/>:editing||!src?<div className="fp-video-cover">{cover}</div>:<button className="fp-video-cover" onClick={()=>setPlaying(true)} aria-label={'Reproducir '+(item.title||'video')}>{cover}</button>}{src&&!editing&&<a href={item.video} target="_blank" rel="noopener noreferrer">Ver en plataforma original</a>}</div>;
};
// No CSS oculta contenido: sin observador/animaciones disponibles, la página sigue visible.
const usePortfolioMotion=(ref,effect,speed,editing,replayToken)=>{
  const lastReplay=React.useRef(0);
  React.useEffect(()=>{
    const replay=replayToken>lastReplay.current;lastReplay.current=replayToken;
    const node=ref.current;
    if(!node||!node.animate||effect==='none'||(editing&&!replay))return;
    const media=window.matchMedia('(prefers-reduced-motion: reduce)');
    let animations=[],observer;
    const cancel=()=>{animations.forEach(a=>a.cancel());animations=[];};
    const changed=()=>{if(media.matches){cancel();observer?.disconnect();}};
    const play=()=>{
      if(media.matches)return;
      const items=Array.from(node.querySelectorAll(':scope > .fp-site-items > .fp-site-item'));
      const targets=effect==='stagger'&&items.length?items:[node];
      const duration={quick:320,smooth:550,slow:800}[speed]||550;
      const transform=effect==='zoom'?'scale(.98)':effect==='rise'||effect==='stagger'?'translateY(14px)':'none';
      animations=targets.map((target,index)=>target.animate([{opacity:0,transform},{opacity:1,transform:'none'}],{duration,delay:effect==='stagger'?Math.min(index*70,350):0,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'}));
    };
    media.addEventListener('change',changed);
    if(replay)play();
    else if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();play();}},{threshold:0});observer.observe(node);}
    else play();
    return()=>{observer?.disconnect();media.removeEventListener('change',changed);cancel();};
  },[effect,speed,editing,replayToken]);
};
const PortfolioModule=({section:s,brandDraft,mobile,editing=false,selectedItem,onSelectItem,active=false,onFocusText,onEditText,replayToken=0,loadingMode='progressive'})=>{
  const inline=editing&&!!onEditText;
  const title=(Tag,value,show,onChange,id)=>inline&&(value||show)?<FPInline as={Tag} value={value} placeholder="Título" maxLength={200} onChange={onChange} onFocus={()=>onFocusText?.(id)}/>:value&&<Tag>{value}</Tag>;
  const copy=(value,show,onChange,id,quote=false)=>inline&&(value||show)?(quote?<blockquote className="fp-site-copy"><FPInline as="p" multiline value={value} placeholder="Escribí aquí…" maxLength={20000} onChange={onChange} onFocus={()=>onFocusText?.(id)}/></blockquote>:<FPInline as="p" className="fp-site-copy" multiline value={value} placeholder="Escribí aquí…" maxLength={20000} onChange={onChange} onFocus={()=>onFocusText?.(id)}/>):value&&(quote?<blockquote className="fp-site-copy"><p>{value}</p></blockquote>:<p className="fp-site-copy">{value}</p>);
  const motionRef=React.useRef(null);
  const effect=FramePortfolio.motionOptions(s.type).includes(s.design?.animation)?s.design.animation:'none';
  usePortfolioMotion(motionRef,!editing&&loadingMode==='static'?'none':effect,s.design?.motionSpeed||'smooth',editing,replayToken);
  const media=['gallery','hero','image-text','services'].includes(s.type),Tag=s.type==='navigation'?'nav':s.type==='footer'?'footer':'section';
  const align=s.design?.align||(s.variant==='center'?'center':'left'),space={compact:.5,airy:1.6}[s.design?.spacing];
  return <Tag aria-label={s.type==='navigation'?(s.content.title||'Navegación del portfolio'):undefined} data-module={s.type} data-variant={s.variant} data-align={align} data-has-items={s.content.items.length>0} data-loading-mode={editing?'editor':loadingMode} ref={motionRef} className={'fp-site-section fp-site-'+s.type+' fp-variant-'+s.variant+(mobile?' fp-site-narrow':'')} style={{'--fp-columns':s.design?.columns,'--fp-image-ratio':{original:'auto',wide:'16/9',landscape:'4/3',square:'1',social:'4/5',portrait:'3/4',story:'9/16'}[s.design?.imageRatio],'--fp-image-radius':s.design?.imageRadius===undefined?undefined:s.design.imageRadius+'px','--fp-mosaic-span':s.design?.columns===1?1:2,'--fp-space':space,textAlign:align}}>
    {s.type==='contact'&&s.variant==='banner'?<div className="fp-contact-intro">
      {title('h2',s.content.title,active,v=>onEditText({title:v}),null)}
      {copy(s.content.text,active,v=>onEditText({text:v}),null)}
    </div>:<>
      {s.type==='navigation'&&brandDraft?<PortfolioNavigationBrand draft={brandDraft} label={s.content.title}/>:title('h2',s.content.title,active,v=>onEditText({title:v}),null)}
      {copy(s.content.text,active,v=>onEditText({text:v}),null,s.type==='text'&&s.variant==='quote')}
    </>}
    {editing&&!active&&!s.content.text&&!s.content.items.length&&<div className="fp-site-placeholder">{['gallery','hero','image-text','video'].includes(s.type)?<FPIcon name={FP_META[s.type][0]} size={32}/>:<FPIcon name={FP_META[s.type][0]} size={28}/>}</div>}
    {!!s.content.items.length&&<div className="fp-site-items" role={!editing&&s.variant==='carousel'?'region':undefined} aria-label={!editing&&s.variant==='carousel'?'Galería desplazable':undefined} tabIndex={!editing&&s.variant==='carousel'?0:undefined}>{s.content.items.map(i=><div key={i.id} className={'fp-site-item'+(i.featured?' fp-featured':'')} data-selected={editing&&selectedItem===i.id} role={editing?'button':undefined} tabIndex={editing?0:undefined} aria-label={editing?'Editar bloque '+(i.title||'sin título'):undefined} onClick={editing?e=>{e.stopPropagation();onSelectItem?.(i.id);}:undefined} onKeyDown={editing?e=>{if(e.target===e.currentTarget&&['Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();onSelectItem?.(i.id);}}:undefined}>
      {editing&&<span className="fp-block-label">Bloque</span>}
      {s.type==='video'&&<PortfolioVideo loading={loadingMode==='static'?'eager':'lazy'} item={i} vertical={s.variant==='vertical'} editing={editing}/>}
      {media&&(FramePortfolio.safeImage(i.image)?<PortfolioImage src={i.image} title={i.title} loading={loadingMode==='static'?'eager':'lazy'}/>:editing&&s.type!=='services'&&<div className="fp-media-placeholder"><FPIcon name="image" size={26}/><span>Agregar imagen</span></div>)}
      <div className="fp-site-item-copy">{title('h3',i.title,selectedItem===i.id,v=>onEditText({title:v},i.id),i.id)}{copy(i.text,selectedItem===i.id,v=>onEditText({text:v},i.id),i.id)}
      {s.type==='prices'&&<><strong className="fp-price">{i.price?(i.from?'Desde ':'')+(i.currency||'USD')+' '+i.price:'Consultar precio'}</strong><ul>{(i.inclusions||'').split('\n').filter(Boolean).map((line,n)=><li key={n}><FPIcon name="check" size={14}/>{line}</li>)}</ul></>}
      {FramePortfolio.safeLink(i.link)&&(editing?<span className="fp-site-link">{s.type==='prices'?'Solicitar cotización':i.title||'Ver más'} <FPIcon name="external" size={14}/></span>:<a className="fp-site-link" href={FramePortfolio.safeLink(i.link)} target="_blank" rel="noopener noreferrer">{s.type==='prices'?'Solicitar cotización':i.title||'Ver más'} <FPIcon name="external" size={14}/></a>)}</div>
    </div>)}</div>}
  </Tag>;
};

const PublishedPortfolioPage=({publicationId})=>{
  const [state,setState]=React.useState({loading:true,draft:null,error:''});
  React.useEffect(()=>{
    let active=true;
    const load=async()=>{
      if(!/^[A-Za-z0-9_-]{10,100}$/.test(publicationId||'')||!window.db){setState({loading:false,draft:null,error:'Esta página no está disponible.'});return;}
      try{
        const root=window.db.collection('frame_portfolios').doc(publicationId),snapshot=await root.get(),data=snapshot.exists?snapshot.data():null;
        if(!data||data.published!==true||!Number.isInteger(data.chunkCount)||data.chunkCount<1||data.chunkCount>FramePortfolio.PUBLIC_MAX_CHUNKS)throw new Error('unavailable');
        const chunks=await Promise.all(Array.from({length:data.chunkCount},(_,index)=>root.collection('chunks').doc(String(index).padStart(2,'0')).get()));
        if(chunks.some(chunk=>!chunk.exists||chunk.data().version!==data.version))throw new Error('incomplete');
        const draft=FramePortfolio.decodePublication(chunks.map(chunk=>chunk.data().payload));
        if(FramePortfolio.publicationHash(draft)!==data.contentHash)throw new Error('incomplete');
        if(active)setState({loading:false,draft,error:''});
      }catch(err){if(active)setState({loading:false,draft:null,error:err?.message==='incomplete'?'La página se está actualizando. Volvé a intentarlo en unos segundos.':'Esta página no está disponible.'});}
    };
    load();return()=>{active=false;};
  },[publicationId]);
  React.useEffect(()=>{if(!state.draft)return;const previous=document.title;document.title=state.draft.title+' — Portfolio';return()=>{document.title=previous;};},[state.draft]);
  if(state.loading)return <main className="fp-public-status" aria-live="polite"><span className="fp-public-loader"/><p>Cargando portfolio…</p></main>;
  if(!state.draft)return <main className="fp-public-status"><FPIcon name="layout" size={34}/><h1>Página no disponible</h1><p>{state.error}</p><button onClick={()=>window.location.reload()}>Intentar nuevamente</button></main>;
  const draft=state.draft,leadingNavigation=draft.sections[0]?.type==='navigation'?draft.sections[0]:null;
  return <main className="fp-public-shell" style={FramePortfolio.pageStyle(draft)}><PortfolioFontLoader draft={draft}/><div className="frame-portfolio-page" style={FramePortfolio.pageStyle(draft)}>{leadingNavigation?null:<PortfolioBrand draft={draft}/>} {draft.sections.map(section=><PortfolioModule key={section.id} section={section} brandDraft={section.id===leadingNavigation?.id?draft:null} loadingMode={draft.loadingMode||'progressive'}/>)}</div></main>;
};
