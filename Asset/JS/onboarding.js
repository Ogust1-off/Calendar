/*
  Calendar by Shortcut™ — Onboarding & Settings
  © 2026 Ogust'1
*/
'use strict';
function _ot(key,fallback){return(typeof window._t==='function'&&window._t(key))||fallback;}

function _obSave(d){ localStorage.setItem('shortcut_config', JSON.stringify(d)); }
function _obLoad(){ try{ return JSON.parse(localStorage.getItem('shortcut_config')||'null')||{}; }catch(e){ return {}; } }
function _obEsc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

var _obStep=0, _obIsSettings=false, _obCalSub=0;

function showOnboarding(){
  if(document.getElementById('ob-overlay'))return;
  _obStep=0;_obCalSub=0;_obIsSettings=false;_obOpen();
}
function showSettings(){
  if(document.getElementById('ob-overlay'))return;
  _obStep=1;_obCalSub=0;_obIsSettings=true;_obOpen();
}
function _obOpen(){
  var el=document.createElement('div');el.id='ob-overlay';
  el.innerHTML='<div id="ob-sheet"><div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>'+
    '<div id="ob-handle-zone"><div id="ob-handle"></div></div>'+
    (_obIsSettings?'<button class="ob-x" onclick="_obClose()">\u00d7</button>':'')+
    '<div id="ob-content"></div><div id="ob-bottom"></div></div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){el.classList.add('ob-in');_obRender();_obInitDrag(el);});
}
function _obClose(){
  var o=document.getElementById('ob-overlay');if(!o)return;
  o.classList.add('ob-out');setTimeout(function(){o.remove();},380);
}
function _obShowUnconfigured(){
  var c=document.getElementById('aw-compact');if(!c)return;
  var d=_obLoad(),lang=d.lang||'en';
  var msg=lang==='fr'?"L\u2019agenda n\u2019est pas configur\u00e9.":'Calendar not configured.';
  var btn=lang==='fr'?'Configurer':'Set up';
  c.innerHTML='<div class="aw-state" style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:52px 24px">'+
    '<div style="font-size:48px">&#128197;</div>'+
    '<div style="font-size:16px;font-weight:600;color:var(--text);text-align:center">'+msg+'</div>'+
    '<button onclick="showOnboarding()" style="padding:13px 32px;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:15px;font-weight:600;font-family:inherit;">'+btn+'</button></div>';
}
function _obInitDrag(overlay){
  var sheet=overlay.querySelector('#ob-sheet'),zone=overlay.querySelector('#ob-handle-zone');
  if(!sheet||!zone)return;
  var sy=0,cy=0,on=false,T=120;
  function start(e){on=true;sy=e.touches?e.touches[0].clientY:e.clientY;cy=0;sheet.style.transition='none';}
  function move(e){
    if(!on)return;
    var dy=(e.touches?e.touches[0].clientY:e.clientY)-sy;
    if(dy<0)dy=0;cy=dy;
    sheet.style.transform='translateY('+dy+'px)';
    overlay.style.background='rgba(0,0,0,'+(0.52*(1-Math.min(dy/T,1)*0.7))+')';
    if(e.cancelable)e.preventDefault();
  }
  function end(){
    if(!on)return;on=false;sheet.style.transition='';
    if(cy>=T){
      sheet.style.transform='translateY(110%)';overlay.style.opacity='0';overlay.style.transition='opacity .25s';
      setTimeout(function(){overlay.remove();if(!_obIsSettings){var cfg=_obLoad();if(!(cfg.apiKey||cfg.cal1Ical)||!((cfg.calendars&&cfg.calendars[0])||cfg.cal1Ical))_obShowUnconfigured();}},280);
    }else{sheet.style.transform='';overlay.style.background='';}
  }
  zone.addEventListener('touchstart',start,{passive:true});
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',end,{passive:true});
  zone.addEventListener('mousedown',start);
  document.addEventListener('mousemove',function(e){if(on)move(e);});
  document.addEventListener('mouseup',end);
}

var _OB_STEPS=5;
function _obRender(){
  var con=document.getElementById('ob-content'),bot=document.getElementById('ob-bottom');
  if(!con||!bot)return;
  con.classList.remove('ob-slide');
  var r=[_s0,_s1cal,_s2,_s3,_s4][_obStep]();
  con.innerHTML=r.c;bot.innerHTML=r.b;
  void con.offsetWidth;con.classList.add('ob-slide');
  setTimeout(function(){var i=con.querySelector('input[type="text"],input[type="password"],input[type="url"]');if(i)i.focus();},320);
}
function _obNext(){
  if(!_obValidate())return;
  if(_obStep===1){
    var src=(_obLoad().calSource||'google');
    var max=src==='ical'?2:3;
    if(_obCalSub<max){_obCalSub++;_obRender();return;}
    _obCalSub=0;_obStep++;_obRender();return;
  }
  if(_obStep<_OB_STEPS-1){_obStep++;_obRender();}
}
function _obBack(){if(typeof _haptic==="function")_haptic("light");
  if(_obStep===1&&_obCalSub>0){_obCalSub--;_obRender();return;}
  if(_obStep>(_obIsSettings?1:0)){_obStep--;_obRender();}
}
function _obSkip(){if(_obStep<_OB_STEPS-1){_obStep++;_obRender();}}

// Step 0: Welcome
function _s0(){
  return {
    c:'<div class="ob-hero"><div class="ob-logo-wrap"><svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="13" fill="url(#og)"/><path d="M28 9L17 26h11L19 39l15-19H23L28 9z" fill="white" opacity=".95"/><defs><linearGradient id="og" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg></div>'+
      '<h1 class="ob-h1">Calendar<br><em>by Shortcut&#8482;</em></h1>'+
      +'<p class="ob-p">'+_ot('obWelcomeSub','Your ECAM agenda, always with you.')+'</p>'+
      '<div class="ob-feats">'+
        '<div class="ob-feat"><span>&#128197;</span>'+_ot('obFeat1','Schedule & week grid')+'</div>'+
        '<div class="ob-feat"><span>&#128276;</span>'+_ot('obFeat2','Real-time tracking')+'</div>'+
        '<div class="ob-feat"><span>&#128274;</span>'+_ot('obFeat3','Keys on device')+'</div>'+
        '<div class="ob-feat"><span>&#128244;</span>'+_ot('obFeat4','Offline')+'</div>'+
      '</div></div>',
    b:'<button class="ob-btn-p ob-btn-full" onclick="_obNext()">Commencer <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><p class="ob-legal">'+_ot('obLegal','Your data never leaves this device.')+'</p>'
  };
}

// Step 1: Calendriers (sous-\u00e9tapes selon source)
function _s1cal(){
  var d=_obLoad(),src=d.calSource||'google';
  if(_obCalSub===0) return _sCS(d,src);
  if(src==='google'){
    if(_obCalSub===1) return _sCAPI(d);
    if(_obCalSub===2) return _sCGIDs(d);
    if(_obCalSub===3) return _sCColors(d);
  } else if(src==='ical'){
    if(_obCalSub===1) return _sCIcal(d);
    if(_obCalSub===2) return _sCColors(d);
  } else {
    if(_obCalSub===1) return _sCAPI(d);
    if(_obCalSub===2) return _sCBoth(d);
    if(_obCalSub===3) return _sCColors(d);
  }
  return _sCS(d,src);
}

// Sous-\u00e9tape 0: Choix source
function _sCS(d,src){
  if(!d.calSource){d.calSource='google';_obSave(d);src='google';}
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(1,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obSrcTitle','Source')+'</h2><p class="ob-p2">'+_ot('obSrcSub','How to access your calendar?')+'</p>'+
      '<div class="ob-src-group">'+
        _srcBtn('google',src==='google','&#128273;',_ot('obSrcGoogle','Google Calendar'),_ot('obSrcGoogleSub','API key + ID. Recommended.'))+
        _srcBtn('ical',src==='ical','&#128241;',_ot('obSrcIcal','iCal Link'),_ot('obSrcIcalSub','From iPhone or Google. No API key.'))+
        _srcBtn('both',src==='both','&#128279;',_ot('obSrcBoth','Both'),_ot('obSrcBothSub','Cal 1 Google + Cal 2 iCal.'))+
      '</div></div>',
    b:'<div class="ob-row"><div class="ob-row-right"><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Sous-\u00e9tape: Cl\u00e9 API
function _sCAPI(d){
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(1,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obApiTitle','Google API Key')+'</h2><p class="ob-p2">'+_ot('obApiSub','To access your calendars.')+'</p>'+
      '<div class="ob-field"><label class="ob-lbl">CL\u00c9 API</label>'+
      '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy\u2026" value="'+_obEsc(d.apiKey||'')+'" autocomplete="off" spellcheck="false"/>'+
      '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">'+_eyeIcon(false)+'</button></div>'+
      '<div class="ob-err" id="ob-apikey-err"></div></div>'+
      '<details class="ob-details"><summary class="ob-hint-t">&#128161; Obtenir une cl\u00e9</summary>'+
      '<ol class="ob-hint-l"><li>console.cloud.google.com</li><li>APIs &amp; Services \u2192 Identifiants \u2192 Cr\u00e9er une cl\u00e9</li><li>Restreindre \u00e0 Google Calendar API</li></ol></details></div>',
    b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obBack()">'+_ot('btnBack','Back')+'</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Sous-\u00e9tape: IDs Google
function _sCGIDs(d){
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(2,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obGCalTitle','Google Calendars')+'</h2><p class="ob-p2">'+_ot('obGCalSub','IDs of your calendars.')+'</p>'+
      '<div class="ob-field"><label class="ob-lbl">CAL 1 \u2014 ID <span style="color:var(--red)">*</span></label>'+
      '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[0])||'')+'" autocomplete="off" spellcheck="false"/>'+
      '<div class="ob-err" id="ob-cal0-err"></div></div>'+
      '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CAL 2 \u2014 ID <span class="ob-opt">optionnel</span></label>'+
      '<input type="text" id="ob-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[1])||'')+'" autocomplete="off" spellcheck="false"/></div>'+
      '<details class="ob-details"><summary class="ob-hint-t">&#128161; Trouver l\u2019ID</summary>'+
      '<ol class="ob-hint-l"><li>Google Calendar \u2192 Param\u00e8tres \u2192 votre agenda</li><li>Int\u00e9grer l\u2019agenda \u2192 copier l\u2019<strong>ID de l\u2019agenda</strong></li></ol></details></div>',
    b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obBack()">'+_ot('btnBack','Back')+'</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Sous-\u00e9tape: Liens iCal
function _sCIcal(d){
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(1,3)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obIcalTitle','iCal Links')+'</h2><p class="ob-p2">'+_ot('obIcalSub','Copy from iPhone or Google Calendar.')+'</p>'+
      '<div class="ob-field"><label class="ob-lbl">CAL 1 <span style="color:var(--red)">*</span></label>'+
      '<input type="url" id="ob-ical0" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal1Ical||'')+'" autocomplete="off" spellcheck="false"/>'+
      '<div class="ob-err" id="ob-ical0-err"></div></div>'+
      '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CAL 2 <span class="ob-opt">optionnel</span></label>'+
      '<input type="url" id="ob-ical1" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal2Ical||'')+'" autocomplete="off" spellcheck="false"/></div>'+
      '<details class="ob-details"><summary class="ob-hint-t">&#128161; Lien iCal depuis iPhone</summary>'+
      '<ol class="ob-hint-l"><li>App Calendrier \u2192 Calendriers \u2192 &#9432; \u2192 Partager le calendrier</li><li>Activer Calendrier public \u2192 copier le lien</li><li>Ou Google Calendar : Param\u00e8tres \u2192 Int\u00e9grer \u2192 iCal</li></ol></details></div>',
    b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obBack()">'+_ot('btnBack','Back')+'</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Sous-\u00e9tape: Les deux (Cal1=Google, Cal2=iCal)
function _sCBoth(d){
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(2,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obBothTitle','Your calendars')+'</h2><p class="ob-p2">'+_ot('obBothSub','Cal 1 via Google, Cal 2 via iCal link.')+'</p>'+
      '<div class="ob-field"><label class="ob-lbl">CAL 1 \u2014 ID GOOGLE <span style="color:var(--red)">*</span></label>'+
      '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[0])||'')+'" autocomplete="off" spellcheck="false"/>'+
      '<div class="ob-err" id="ob-cal0-err"></div></div>'+
      '<div class="ob-field" style="margin-top:12px"><label class="ob-lbl">CAL 2 \u2014 LIEN ICAL <span class="ob-opt">optionnel</span></label>'+
      '<input type="url" id="ob-ical2" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal2Ical||'')+'" autocomplete="off" spellcheck="false"/>'+
      '<div class="ob-err" id="ob-ical2-err"></div></div></div>',
    b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obBack()">'+_ot('btnBack','Back')+'</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Sous-étape: Couleurs
function _sCColors(d){
  var src=d.calSource||'google';
  var c1=d.cal1Color||'blue',c2=d.cal2Color||'lime';
  var hasCal2=(d.calendars&&d.calendars[1])||d.cal2Ical;
  var nav='<div class="ob-row"><button class="ob-btn-g" onclick="_obBack()">'+_ot('btnBack','Back')+'</button><div class="ob-row-right"><button class="ob-btn-skip" onclick="_obSkip()">'+_ot('btnSkip','Skip')+'</button><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>';
  // iCal only: couleur simple uniquement (pas de preset par matière)
  if(src==='ical'){
    d.cal1Preset='none';_obSave(d);
    return {
      c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(2,3)+'</div></div>'+
        '<h2 class="ob-h2">'+_ot('obColTitle','Calendar colour')+'</h2>'+
        '<p class="ob-p2">'+_ot('obColSub','Choose the colour for events.')+'</p>'+
        '<label class="ob-lbl" style="display:block;margin-bottom:8px">CALENDRIER 1</label>'+
        _obColorGrid('ob-c1g',c1,'_obPickCal1Color')+
        (hasCal2?'<label class="ob-lbl" style="display:block;margin:16px 0 8px">CALENDRIER 2</label>'+_obColorGrid('ob-c2g',c2,'_obPickCal2Color'):'')+
        '</div>',
      b:nav
    };
  }
  // Google/both: preset complet
  var preset=d.cal1Preset||'ecam';
  var subs=d.cal1Subjects||[];
  var defaultSubs=[
    {match:'math',color:'blue',label:'Maths'},{match:'physique',color:'cyan',label:'Physique'},
    {match:'informatique',color:'violet',label:'Informatique'},{match:'sciences ind',color:'amber',label:'Sciences Ind.'},
    {match:'anglais',color:'emerald',label:'Anglais'},{match:'sport',color:'rose',label:'Sport'},
    {match:'culture',color:'orange',label:'Culture'},{match:'proj',color:'grey',label:'Projets'},
  ];
  var subjList=subs.length?subs:defaultSubs;
  var subjRows=subjList.map(function(s,i){return _obSubjRow(s,i);}).join('');
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(3,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obColsTitle','Colours')+'</h2>'+
      '<label class="ob-lbl" style="display:block;margin-bottom:10px">STYLE CALENDRIER 1</label>'+
      '<div class="ob-src-group" id="ob-preset-grp">'+
        _srcBtn2('ecam',preset==='ecam','&#127979;',_ot('obPresetEcam','ECAM Preset'),_ot('obPresetEcamSub','Auto-detects subjects.'))+
        _srcBtn2('custom',preset==='custom','&#127912;',_ot('obPresetCustom','Custom'),_ot('obPresetCustomSub','Your own subjects.'))+
        _srcBtn2('none',preset==='none','&#11036;',_ot('obPresetNone','Single colour'),_ot('obPresetNoneSub','All the same.'))+
      '</div>'+
      '<div id="ob-c1-color" style="'+(preset==='none'?'margin-top:12px':'display:none;margin-top:12px')+'">'+
        '<label class="ob-lbl" style="display:block;margin-bottom:8px">COULEUR</label>'+
        _obColorGrid('ob-c1g',c1,'_obPickCal1Color')+
      '</div>'+
      '<div id="ob-c1-subjs" style="'+(preset==='custom'?'margin-top:12px':'display:none;margin-top:12px')+';position:relative">'+
        '<label class="ob-lbl" style="display:block;margin-bottom:10px">MATI\u00c8RES &amp; COULEURS</label>'+
        '<div id="ob-subj-list">'+subjRows+'</div>'+
        '<button class="ob-btn-g" style="width:100%;margin-top:10px;font-size:13px" onclick="_obAddSubj()">'+_ot('btnAdd','+ Add')+'</button>'+
      '</div>'+
      (hasCal2?'<div style="margin-top:16px"><label class="ob-lbl" style="display:block;margin-bottom:8px">COULEUR CALENDRIER 2</label>'+_obColorGrid('ob-c2g',c2,'_obPickCal2Color')+'</div>':'')+
      '</div>',
    b:nav
  };
}


// Step 2: Profil
function _s2(){
  var d=_obLoad(),photo=d.photo||'',name=d.displayName||'';
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(3,4)+'</div><span class="ob-opt-badge">'+_ot('obOptBadge','Optional')+'</span></div>'+
      '<h2 class="ob-h2">'+_ot('obProfileTitle','Your profile')+'</h2><p class="ob-p2">'+_ot('obProfileSub','Photo and first name.')+'</p>'+
      '<div class="ob-avatar-row"><div class="ob-avatar-preview" id="ob-av-preview">'+
        (photo?'<img src="'+_obEsc(photo)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>':
          '<div class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>')+
      '</div><div class="ob-avatar-btns">'+
        '<label class="ob-btn-av" for="ob-av-input">Choisir une photo</label>'+
        '<input type="file" id="ob-av-input" accept="image/*" style="display:none" onchange="_obPickPhoto(this)"/>'+
        (photo?'<button class="ob-btn-av ob-btn-av-del" onclick="_obRemovePhoto()">Supprimer</button>':'')+
      '</div></div>'+
      '<div class="ob-field" style="margin-top:16px"><label class="ob-lbl">PR\u00c9NOM</label>'+
      '<input type="text" id="ob-displayname" class="ob-inp" placeholder="ex. Augustin" value="'+_obEsc(name)+'" autocomplete="given-name" spellcheck="false"/></div></div>',
    b:'<div class="ob-row"><div class="ob-row-right"><button class="ob-btn-skip" onclick="_obSkip()">'+_ot('btnSkip','Skip')+'</button><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}

// Step 3: Pr\u00e9f\u00e9rences
function _s3(){
  var d=_obLoad(),lang=d.lang||'en',theme=d.theme||'auto';
  function lb(v,lbl){return '<button class="ob-pref-btn'+(lang===v?' ob-pref-on':'')+'" onclick="_obPickLang(\''+v+'\',this)">'+lbl+'</button>';}
  function tb(v,lbl){return '<button class="ob-pref-btn'+(theme===v?' ob-pref-on':'')+'" onclick="_obPickTheme(\''+v+'\',this)">'+lbl+'</button>';}
  var thIco=theme==='dark'?'\u{1F319}':theme==='light'?'\u2600\uFE0F':'\u2728';
  return {
    c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots">'+_obDots(4,4)+'</div></div>'+
      '<h2 class="ob-h2">'+_ot('obPrefsTitle','Preferences')+'</h2><p class="ob-p2">'+_ot('obPrefsSub','Language and theme.')+'</p>'+
      '<div class="ob-pref-row"><div class="ob-pref-ico">&#127760;</div><div class="ob-pref-label">Langue</div>'+
        '<div class="ob-pref-btns" id="ob-lang-btns">'+lb('fr','Fran\u00e7ais')+lb('en','English')+'</div></div>'+
      '<div class="ob-pref-row" style="margin-top:12px"><div class="ob-pref-ico" id="ob-t-ico">'+thIco+'</div><div class="ob-pref-label">Th\u00e8me</div>'+
        '<div class="ob-pref-btns" id="ob-theme-btns">'+tb('auto','Auto')+tb('dark','\u{1F319}')+tb('light','\u2600\uFE0F')+'</div></div>'+
      '</div>',
    b:'<div class="ob-row"><div class="ob-row-right"><button class="ob-btn-skip" onclick="_obSkip()">'+_ot('btnSkip','Skip')+'</button><button class="ob-btn-p" onclick="_obNext()">'+_ot('btnNext','Next')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'
  };
}
function _obPickLang(v,btn){
  document.querySelectorAll('#ob-lang-btns .ob-pref-btn').forEach(function(b){b.classList.remove('ob-pref-on');});
  btn.classList.add('ob-pref-on');
  var d=_obLoad();d.lang=v;_obSave(d);
}
function _obPickTheme(v,btn){
  document.querySelectorAll('#ob-theme-btns .ob-pref-btn').forEach(function(b){b.classList.remove('ob-pref-on');});
  btn.classList.add('ob-pref-on');
  var d=_obLoad();d.theme=v;_obSave(d);
  var ico=document.getElementById('ob-t-ico');
  if(ico)ico.textContent=v==='dark'?'\u{1F319}':v==='light'?'\u2600\uFE0F':'\u2728';
  if(typeof _applyTheme==='function')_applyTheme(v);
}

// Step 4: Done
function _s4(){
  return {
    c:'<div class="ob-done"><div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div><div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg></div></div><h2 class="ob-done-h">C\u2019est pr\u00eat\u00a0!</h2><p class="ob-p2">Chargement de votre agenda.</p></div>',
    b:'<button class="ob-btn-p ob-btn-full" onclick="_obFinish()">'+_ot('btnOpen','Open Calendar')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
  };
}

// Validation
function _obValidate(){
  if(_obStep!==1)return true;
  var d=_obLoad(),src=d.calSource||'google';
  if(_obCalSub===0)return true;
  if(_obCalSub===1&&(src==='google'||src==='both')){
    var vk=((document.getElementById('ob-apikey')||{}).value||'').trim();
    var ek=document.getElementById('ob-apikey-err');
    if(!vk){_obErr(ek,'Cl\u00e9 API requise.');return false;}
    if(!vk.startsWith('AIza')){_obErr(ek,'Doit commencer par "AIza".');return false;}
    _obClear(ek);d.apiKey=vk;_obSave(d);
  }
  if(_obCalSub===1&&src==='ical'){
    var u=((document.getElementById('ob-ical0')||{}).value||'').trim();
    var eu=document.getElementById('ob-ical0-err');
    if(!u){_obErr(eu,'Lien iCal requis.');return false;}
    _obClear(eu);
    var u2=((document.getElementById('ob-ical1')||{}).value||'').trim();
    d.cal1Ical=u;if(u2)d.cal2Ical=u2;_obSave(d);
  }
  if(_obCalSub===2&&src==='google'){
    var v0=((document.getElementById('ob-cal0')||{}).value||'').trim();
    var e0=document.getElementById('ob-cal0-err');
    if(!v0){_obErr(e0,'ID requis.');return false;}
    if(!v0.includes('@')){_obErr(e0,'Doit contenir @.');return false;}
    _obClear(e0);
    var v1=((document.getElementById('ob-cal1')||{}).value||'').trim();
    d.calendars=[v0];if(v1&&v1.includes('@'))d.calendars.push(v1);_obSave(d);
  }
  if(_obCalSub===2&&src==='both'){
    var vg=((document.getElementById('ob-cal0')||{}).value||'').trim();
    var eg=document.getElementById('ob-cal0-err');
    if(!vg){_obErr(eg,'ID Cal 1 requis.');return false;}
    if(!vg.includes('@')){_obErr(eg,'Doit contenir @.');return false;}
    _obClear(eg);d.calendars=[vg];
    var vi=((document.getElementById('ob-ical2')||{}).value||'').trim();
    if(vi)d.cal2Ical=vi;_obSave(d);
  }
  if((src==='ical'&&_obCalSub===2)||(src!=='ical'&&_obCalSub===3))_obSaveSubjs();
  return true;
}

// Profile
function _obSaveProfile(){
  var name=((document.getElementById('ob-displayname')||{}).value||'').trim();
  var d=_obLoad();if(name)d.displayName=name;_obSave(d);
}
function _obPickPhoto(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var url=e.target.result;
    var wrap=document.getElementById('ob-av-preview');
    if(wrap)wrap.innerHTML='<img src="'+url+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    var btns=document.querySelector('.ob-avatar-btns');
    if(btns&&!btns.querySelector('.ob-btn-av-del')){var del=document.createElement('button');del.className='ob-btn-av ob-btn-av-del';del.textContent='Supprimer';del.onclick=_obRemovePhoto;btns.appendChild(del);}
    var d=_obLoad();d.photo=url;_obSave(d);
    if(typeof _applyProfile==='function')_applyProfile();
  };
  reader.readAsDataURL(file);
}
function _obRemovePhoto(){
  var d=_obLoad();delete d.photo;_obSave(d);
  var wrap=document.getElementById('ob-av-preview');
  if(wrap)wrap.innerHTML='<div class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>';
  var del=document.querySelector('.ob-btn-av-del');if(del)del.remove();
  if(typeof _applyProfile==='function')_applyProfile();
}
function _obFinish(){
  _obClose();
  var name=((document.getElementById('ob-displayname')||{}).value||'').trim();
  if(name){var d=_obLoad();d.displayName=name;_obSave(d);}
  setTimeout(function(){if(typeof awInit==='function')awInit();},300);
  setTimeout(function(){if(typeof _applyProfile==='function')_applyProfile();},350);
}

// Boutons radio source/preset
function _srcBtn(val,active,ico,title,sub){
  return '<button class="ob-src-btn'+(active?' ob-src-on':'')+'" onclick="_obPickSrc(\''+val+'\',this)">'+
    '<div class="ob-src-ico">'+ico+'</div><div class="ob-src-body"><div class="ob-src-title">'+title+'</div><div class="ob-src-sub">'+sub+'</div></div>'+
    '<div class="ob-src-chk">'+(active?'&#10003;':'')+'</div></button>';
}
function _srcBtn2(val,active,ico,title,sub){
  return '<button class="ob-preset-btn'+(active?' ob-preset-on':'')+'" onclick="_obPickPreset(\''+val+'\',this)">'+
    '<div class="ob-src-ico">'+ico+'</div><div class="ob-src-body"><div class="ob-src-title">'+title+'</div><div class="ob-src-sub">'+sub+'</div></div>'+
    '<div class="ob-src-chk">'+(active?'&#10003;':'')+'</div></button>';
}
function _obPickSrc(val,btn){if(typeof _haptic==="function")_haptic("selection");
  var parent=btn.parentElement;
  if(parent)parent.querySelectorAll('.ob-src-btn').forEach(function(b){b.classList.remove('ob-src-on');var c=b.querySelector('.ob-src-chk');if(c)c.textContent='';});
  btn.classList.add('ob-src-on');
  var chk=btn.querySelector('.ob-src-chk');if(chk)chk.textContent='\u2713';
  var d=_obLoad();d.calSource=val;_obSave(d);
}
function _obPickPreset(val,btn){if(typeof _haptic==="function")_haptic("selection");
  var parent=btn.parentElement;
  if(parent)parent.querySelectorAll('.ob-preset-btn').forEach(function(b){b.classList.remove('ob-preset-on');var c=b.querySelector('.ob-src-chk');if(c)c.textContent='';});
  btn.classList.add('ob-preset-on');
  var chk=btn.querySelector('.ob-src-chk');if(chk)chk.textContent='\u2713';
  var d=_obLoad();d.cal1Preset=val;_obSave(d);
  var c1=document.getElementById('ob-c1-color'),s1=document.getElementById('ob-c1-subjs');
  var c2=document.getElementById('ob-cs-col1'),s2=document.getElementById('ob-cs-subjs');
  if(c1)c1.style.display=val==='none'?'':'none';
  if(s1)s1.style.display=val==='custom'?'':'none';
  if(c2)c2.style.display=val==='none'?'':'none';
  if(s2)s2.style.display=val==='custom'?'':'none';
}

// Grille couleurs
var OB_COLORS=[
  {k:'blue',hex:'#3b82f6'},{k:'indigo',hex:'#6366f1'},{k:'violet',hex:'#8b5cf6'},
  {k:'fuchsia',hex:'#d946ef'},{k:'rose',hex:'#f43f5e'},{k:'red',hex:'#ef4444'},
  {k:'orange',hex:'#f97316'},{k:'amber',hex:'#f59e0b'},{k:'yellow',hex:'#eab308'},
  {k:'lime',hex:'#84cc16'},{k:'emerald',hex:'#10b981'},{k:'teal',hex:'#14b8a6'},
  {k:'cyan',hex:'#06b6d4'},{k:'sky',hex:'#0ea5e9'},{k:'slate',hex:'#64748b'},{k:'grey',hex:'#94a3b8'},{k:'white',hex:'#f8f4ec'},
];
var _ECAM_COLORS=['blue','cyan','violet','amber','emerald','rose','orange','grey'];
function _obColorGrid(id,cur,fn){
  var h='<div class="ob-cg" id="'+id+'">';
  OB_COLORS.forEach(function(c){
    var on=c.k===cur;
    var isEcam=_ECAM_COLORS.indexOf(c.k)>=0;
    var badgeHtml=isEcam?'<span class="ob-ecam-badge">E</span>':'';
    h+='<button class="ob-cb'+(on?' ob-cb-on':'')+(isEcam?' ob-cb-ecam':'')+'" data-color="'+c.k+'" style="background:'+c.hex+'" onclick="'+fn+'(\''+c.k+'\',\''+id+'\')">'+
      (on?'<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>':badgeHtml)+'</button>';
  });
  return h+'</div>';
}
function _obSelColor(key,gid){
  var g=document.getElementById(gid);if(!g)return;
  g.querySelectorAll('.ob-cb').forEach(function(b){
    var on=b.dataset.color===key;b.classList.toggle('ob-cb-on',on);
    b.innerHTML=on?'<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>':'';
  });
}
function _obPickCal1Color(k,g){if(typeof _haptic==="function")_haptic("light");_obSelColor(k,g);var d=_obLoad();d.cal1Color=k;_obSave(d);}
function _obPickCal2Color(k,g){if(typeof _haptic==="function")_haptic("light");_obSelColor(k,g);var d=_obLoad();d.cal2Color=k;_obSave(d);}
function _obPickSubjColor(k,g){_obSelColor(k,g);_obSaveSubjs();}

// Mati\u00e8res
function _obSubjRow(s,i){
  var hex=(OB_COLORS.find(function(c){return c.k===(s.color||'blue');})||OB_COLORS[0]).hex;
  return '<div class="ob-subj-row" data-idx="'+i+'">'+
    '<input class="ob-inp ob-subj-inp" data-match="'+_obEsc(s.match||s.label||'')+'" value="'+_obEsc(s.label||s.match||'')+'" placeholder="'+_ot('obSubjPlaceholder','Subject\u2026')+'" oninput="_obSubjChange()" style="flex:1;min-width:0;"/>'+
    '<button class="ob-color-dot-btn" data-color="'+(s.color||'blue')+'" style="background:'+hex+';" onclick="_obOpenColorPop(this,'+i+')" title="Couleur"></button>'+
    '<button onclick="_obRemoveSubj(this)" class="ob-subj-del">\u00d7</button>'+
  '</div>';
}
function _obOpenColorPop(btn,idx){
  var existing=document.getElementById('ob-color-pop');
  if(existing){existing.remove();if(existing.dataset.idx==idx)return;}
  var pop=document.createElement('div');pop.id='ob-color-pop';pop.dataset.idx=idx;
  pop.style.cssText='position:absolute;z-index:9999;background:var(--bg2,#1c1c1e);border:.5px solid var(--sep);border-radius:14px;padding:10px;display:flex;flex-wrap:wrap;gap:7px;width:224px;box-shadow:0 8px 32px rgba(0,0,0,.5);';
  var _EC=['blue','cyan','violet','amber','emerald','rose','orange','grey'];
  OB_COLORS.forEach(function(c){
    var cur=btn.dataset.color===c.k;
    var b=document.createElement('button');
    b.style.cssText='position:relative;width:28px;height:28px;border-radius:50%;background:'+c.hex+';border:'+(cur?'2.5px solid #fff':'2px solid transparent')+';cursor:pointer;display:flex;align-items:center;justify-content:center;';
    if(!cur&&_EC.indexOf(c.k)>=0){var bd=document.createElement('span');bd.textContent='E';bd.style.cssText='position:absolute;bottom:1px;right:1px;font-size:6px;font-weight:800;color:rgba(255,255,255,.85);pointer-events:none;text-shadow:0 0 2px rgba(0,0,0,.6)';b.appendChild(bd);}
    if(cur)b.innerHTML='<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
    b.onclick=function(e){e.stopPropagation();btn.style.background=c.hex;btn.dataset.color=c.k;pop.remove();_obSaveSubjs();};
    pop.appendChild(b);
  });
  var rect=btn.getBoundingClientRect();
  var sheet=document.getElementById('ob-sheet');
  var sr=sheet?sheet.getBoundingClientRect():{left:0,top:0,width:400};
  pop.style.top=(rect.bottom-sr.top+6)+'px';
  pop.style.left=Math.max(8,Math.min(rect.left-sr.left-90,sr.width-232))+'px';
  var content=document.querySelector('#ob-content,#ob-cal-content');if(content)content.appendChild(pop);
  setTimeout(function(){document.addEventListener('click',function cl(e){if(!pop.contains(e.target)&&e.target!==btn){pop.remove();document.removeEventListener('click',cl);}});},10);
}
function _obSaveSubjs(){
  var rows=document.querySelectorAll('#ob-subj-list .ob-subj-row,#ob-cs-subj-list .ob-subj-row');
  var subs=[];
  rows.forEach(function(row){
    var inp=row.querySelector('.ob-subj-inp'),dot=row.querySelector('.ob-color-dot-btn');
    var label=(inp&&inp.value.trim())||'',match=(inp&&inp.dataset.match)||label.toLowerCase(),color=(dot&&dot.dataset.color)||'blue';
    if(label)subs.push({match:match,color:color,label:label});
  });
  var d=_obLoad();d.cal1Subjects=subs;_obSave(d);
}
function _obSubjChange(){_obSaveSubjs();}
function _obRemoveSubj(btn){var r=btn.closest('.ob-subj-row');if(r)r.remove();_obSaveSubjs();}
function _obAddSubj(){
  var list=document.getElementById('ob-subj-list');if(!list)return;
  var i=list.querySelectorAll('.ob-subj-row').length;
  list.insertAdjacentHTML('beforeend',_obSubjRow({match:'',color:'blue',label:''},i));
}
function _obAddSubjCs(){
  var list=document.getElementById('ob-cs-subj-list');if(!list)return;
  var i=list.querySelectorAll('.ob-subj-row').length;
  list.insertAdjacentHTML('beforeend',_obSubjRow({match:'',color:'blue',label:''},i));
}

// Nav helpers
function _obDots(cur,tot){var h='';for(var i=1;i<=tot;i++)h+='<div class="ob-dot'+(i===cur?' ob-dot-on':'')+'"></div>';return h;}
function _obErr(el,msg){if(!el)return;el.textContent=msg;el.classList.add('ob-err-show');}
function _obClear(el){if(!el)return;el.classList.remove('ob-err-show');}
function _eyeIcon(open){
  return open?'<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>':
    '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
}
function _obToggleEye(id,btn){
  var i=document.getElementById(id);if(!i)return;
  var open=i.type==='password';i.type=open?'text':'password';btn.innerHTML=_eyeIcon(open);
}

// ── SHEETS DEPUIS L'ONGLET COMPTE ─────────────────────────────────────────────
function _obAccSheet(fillFn){
  var el=document.createElement('div');el.id='ob-overlay';
  el.innerHTML='<div id="ob-sheet"><div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>'+
    '<div id="ob-handle-zone"><div id="ob-handle"></div></div>'+
    '<button class="ob-x" onclick="_obClose()">\u00d7</button>'+
    '<div id="ob-cal-content"></div><div id="ob-cal-bottom"></div></div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){
    el.classList.add('ob-in');
    var con=el.querySelector('#ob-cal-content'),bot=el.querySelector('#ob-cal-bottom');
    fillFn(con,bot);_obInitDrag(el);
  });
}
function _obAccDone(msg,cb){
  var con=document.getElementById('ob-cal-content'),bot=document.getElementById('ob-cal-bottom');
  if(!con||!bot)return;
  con.innerHTML='<div class="ob-done"><div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div><div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg></div></div><h2 class="ob-done-h">'+msg+'</h2></div>';
  bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obClose()">'+_ot('btnClose','Close')+'</button>';
  if(cb)setTimeout(cb,400);
}

// Bouton 1: Source & API
function _obOpenCalSettings(){
  if(document.getElementById('ob-overlay'))return;
  _obAccSheet(function(con,bot){
    var d=_obLoad(),src=d.calSource||'google';
    con.innerHTML='<div class="ob-form"><h2 class="ob-h2">'+_ot('obSrcApiTitle','Source & API')+'</h2><p class="ob-p2">'+_ot('obSrcApiSub','Connect to your calendar.')+'</p>'+
      '<div class="ob-src-group" id="ob-acc-src">'+
        _srcBtn('google',src==='google','&#128273;',_ot('obSrcGoogle','Google Calendar'),_ot('obSrcGoogleSub','API key + ID.'))+
        _srcBtn('ical',src==='ical','&#128241;',_ot('obSrcIcal','iCal Link'),_ot('obSrcIcalSub','From iPhone or Google.'))+
        _srcBtn('both',src==='both','&#128279;',_ot('obSrcBoth','Both'),_ot('obSrcBothSub','Cal 1 Google + Cal 2 iCal.'))+
      '</div>'+
      '<div id="ob-acc-gf" style="'+(src==='google'||src==='both'?'margin-top:14px':'display:none;margin-top:14px')+'">'+
        '<div class="ob-field"><label class="ob-lbl">CL\u00c9 API</label><div class="ob-inp-wrap"><input type="password" id="ob-cs-api" class="ob-inp" placeholder="AIzaSy\u2026" value="'+_obEsc(d.apiKey||'')+'" autocomplete="off"/><button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-cs-api\',this)">'+_eyeIcon(false)+'</button></div><div class="ob-err" id="ob-cs-api-err"></div></div>'+
        '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CAL 1 \u2014 ID GOOGLE</label><input type="text" id="ob-cs-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[0])||'')+'" autocomplete="off"/><div class="ob-err" id="ob-cs-cal0-err"></div></div>'+
      '</div>'+
      '<div id="ob-acc-gf2" style="'+(src==='google'?'margin-top:10px':'display:none;margin-top:10px')+'">'+
        '<div class="ob-field"><label class="ob-lbl">CAL 2 \u2014 ID GOOGLE <span class="ob-opt">optionnel</span></label><input type="text" id="ob-cs-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[1])||'')+'" autocomplete="off"/></div>'+
      '</div>'+
      '<div id="ob-acc-if" style="'+(src==='ical'?'margin-top:14px':'display:none;margin-top:14px')+'">'+
        '<div class="ob-field"><label class="ob-lbl">CAL 1 \u2014 LIEN ICAL</label><input type="url" id="ob-cs-ical0" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal1Ical||'')+'" autocomplete="off"/><div class="ob-err" id="ob-cs-ical0-err"></div></div>'+
        '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CAL 2 \u2014 LIEN ICAL <span class="ob-opt">optionnel</span></label><input type="url" id="ob-cs-ical1" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal2Ical||'')+'" autocomplete="off"/></div>'+
      '</div>'+
      '<div id="ob-acc-bf" style="'+(src==='both'?'margin-top:10px':'display:none;margin-top:10px')+'">'+
        '<div class="ob-field"><label class="ob-lbl">CAL 2 \u2014 LIEN ICAL <span class="ob-opt">optionnel</span></label><input type="url" id="ob-cs-both-ical" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal2Ical||'')+'" autocomplete="off"/></div>'+
      '</div></div>';
    bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obAccSaveSrc()">'+_ot('btnSave','Save')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
    // Hook source buttons to show/hide fields
    setTimeout(function(){
      var grp=document.getElementById('ob-acc-src');if(!grp)return;
      grp.querySelectorAll('.ob-src-btn').forEach(function(b){
        b.addEventListener('click',function(){
          var s=_obLoad().calSource||'google';
          var gf=document.getElementById('ob-acc-gf'),gf2=document.getElementById('ob-acc-gf2'),iff=document.getElementById('ob-acc-if'),bf=document.getElementById('ob-acc-bf');
          if(gf)gf.style.display=(s==='google'||s==='both'?'':'none');
          if(gf2)gf2.style.display=(s==='google'?'':'none');
          if(iff)iff.style.display=(s==='ical'?'':'none');
          if(bf)bf.style.display=(s==='both'?'':'none');
        });
      });
    },50);
  });
}
function _obAccSaveSrc(){
  var d=_obLoad(),src=d.calSource||'google';
  if(src==='google'||src==='both'){
    var vk=((document.getElementById('ob-cs-api')||{}).value||'').trim();
    var ek=document.getElementById('ob-cs-api-err');
    if(vk){if(!vk.startsWith('AIza')){_obErr(ek,'Doit commencer par "AIza".');return;}_obClear(ek);d.apiKey=vk;}
    var v0=((document.getElementById('ob-cs-cal0')||{}).value||'').trim();
    var e0=document.getElementById('ob-cs-cal0-err');
    if(v0){if(!v0.includes('@')){_obErr(e0,'Doit contenir @.');return;}_obClear(e0);d.calendars=[v0];var v1=((document.getElementById('ob-cs-cal1')||{}).value||'').trim();if(v1&&v1.includes('@'))d.calendars.push(v1);}
  }
  if(src==='ical'){var u0=((document.getElementById('ob-cs-ical0')||{}).value||'').trim();if(u0)d.cal1Ical=u0;var u1=((document.getElementById('ob-cs-ical1')||{}).value||'').trim();if(u1)d.cal2Ical=u1;else delete d.cal2Ical;}
  if(src==='both'){var u2=((document.getElementById('ob-cs-both-ical')||{}).value||'').trim();if(u2)d.cal2Ical=u2;else delete d.cal2Ical;}
  _obSave(d);
  _obAccDone(_ot('obSaved','Saved!'),function(){if(typeof awInit==='function')awInit();if(typeof _applyProfile==='function')_applyProfile();});
}

// Bouton 2: Style Cal 1
function _obOpenCal1Style(){
  if(document.getElementById('ob-overlay'))return;
  _obAccSheet(function(con,bot){
    var d=_obLoad(),preset=d.cal1Preset||'ecam',c1=d.cal1Color||'blue';
    var subs=d.cal1Subjects||[];
    var defaultSubs=[{match:'math',color:'blue',label:'Maths'},{match:'physique',color:'cyan',label:'Physique'},{match:'informatique',color:'violet',label:'Informatique'},{match:'sciences ind',color:'amber',label:'Sciences Ind.'},{match:'anglais',color:'emerald',label:'Anglais'},{match:'sport',color:'rose',label:'Sport'},{match:'culture',color:'orange',label:'Culture'},{match:'proj',color:'grey',label:'Projets'}];
    var sl=subs.length?subs:defaultSubs;
    var sr=sl.map(function(s,i){return _obSubjRow(s,i);}).join('');
    con.innerHTML='<div class="ob-form"><h2 class="ob-h2">'+_ot('obStyleTitle','Style Cal 1')+'</h2><p class="ob-p2">'+_ot('obStyleSub','Assign colours to events.')+'</p>'+
      '<div class="ob-src-group" id="ob-cs-preset-grp">'+
        _srcBtn2('ecam',preset==='ecam','&#127979;',_ot('obPresetEcam','ECAM Preset'),_ot('obPresetEcamSub','Auto-detects subjects.'))+
        _srcBtn2('custom',preset==='custom','&#127912;',_ot('obPresetCustom','Custom'),_ot('obPresetCustomSub','Your own subjects.'))+
        _srcBtn2('none',preset==='none','&#11036;',_ot('obPresetNone','Single colour'),_ot('obPresetNoneSub','All the same.'))+
      '</div>'+
      '<div id="ob-cs-col1" style="'+(preset==='none'?'margin-top:12px':'display:none;margin-top:12px')+'"><label class="ob-lbl" style="display:block;margin-bottom:8px">COULEUR</label>'+_obColorGrid('ob-csg1',c1,'_obPickCal1Color')+'</div>'+
      '<div id="ob-cs-subjs" style="'+(preset==='custom'?'margin-top:12px':'display:none;margin-top:12px')+';position:relative"><label class="ob-lbl" style="display:block;margin-bottom:8px">MATI\u00c8RES &amp; COULEURS</label>'+
        '<div id="ob-cs-subj-list">'+sr+'</div>'+
        '<button class="ob-btn-g" style="width:100%;margin-top:8px;font-size:13px" onclick="_obAddSubjCs()">'+_ot('btnAdd','+ Add')+'</button>'+
      '</div></div>';
    bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obSaveSubjs();_obAccDone(\'Enregistr\u00e9\u00a0!\',null)">'+_ot('btnSave','Save')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
  });
}

// Bouton 3: Couleur Cal 2
function _obOpenCal2Color(){
  if(document.getElementById('ob-overlay'))return;
  _obAccSheet(function(con,bot){
    var d=_obLoad(),c2=d.cal2Color||'lime';
    var hasCal2=(d.calendars&&d.calendars[1])||d.cal2Ical;
    if(!hasCal2){con.innerHTML='<div class="ob-form"><h2 class="ob-h2">'+_ot('obCal2ColTitle','Colour Cal 2')+'</h2><p class="ob-p2">'+_ot('obNoCal2','No second calendar set up.')+'</p></div>';bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obClose()">'+_ot('btnClose','Close')+'</button>';return;}
    con.innerHTML='<div class="ob-form"><h2 class="ob-h2">'+_ot('obCal2ColTitle','Colour Cal 2')+'</h2><p class="ob-p2">'+_ot('obCal2ColSub','Colour for all Cal 2 events.')+'</p>'+_obColorGrid('ob-c2g-acc',c2,'_obPickCal2Color')+'</div>';
    bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obAccDone(\'Enregistr\u00e9\u00a0!\',null)">'+_ot('btnSave','Save')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
  });
}

// Option avanc\u00e9e: multi-calendriers
function _obOpenAdvanced(){
  if(document.getElementById('ob-overlay'))return;
  _obAccSheet(function(con,bot){_obFillAdvanced(con,bot);});
}
function _obFillAdvanced(con,bot){
  var d=_obLoad(),extras=d.extraCals||[];
  function rowHtml(cal,i){
    var hex=(OB_COLORS.find(function(c){return c.k===(cal.color||'blue');})||OB_COLORS[0]).hex;
    return '<div class="ob-extra-row" data-idx="'+i+'" style="border:.5px solid var(--sep);border-radius:12px;padding:12px;margin-bottom:10px">'+
      '<div style="display:flex;gap:6px;margin-bottom:8px">'+
        '<button class="ob-src-btn'+(cal.type==='google'?' ob-src-on':'')+'" onclick="_obExtraType('+i+',\'google\',this)" style="flex:1;padding:8px;font-size:12px;border-radius:10px">&#128273; Google</button>'+
        '<button class="ob-src-btn'+(cal.type!=='google'?' ob-src-on':'')+'" onclick="_obExtraType('+i+',\'ical\',this)" style="flex:1;padding:8px;font-size:12px;border-radius:10px">&#128241; iCal</button>'+
      '</div>'+
      '<input class="ob-inp ob-mono" placeholder="ID ou webcal://\u2026" value="'+_obEsc(cal.url||'')+'" oninput="_obExtraUrl('+i+',this)" style="font-size:12.5px;padding:9px 12px"/>'+
      '<div style="margin-top:8px"><input class="ob-inp" placeholder="'+_ot('obCalName','Calendar name (optional)')+'" value="'+_obEsc(cal.name||'')+'" oninput="_obExtraName('+i+',this)" style="font-size:12.5px;padding:9px 12px"/></div>'+
      '<div style="display:flex;align-items:center;gap:8px;margin-top:8px">'+
        '<label class="ob-lbl" style="margin:0;text-transform:none;letter-spacing:0;font-size:12px">'+_ot('obColor','Colour:')+' </label>'+
        '<button class="ob-color-dot-btn" data-color="'+(cal.color||'blue')+'" style="background:'+hex+';" onclick="_obExtraColorPop(this,'+i+')" title="Couleur"></button>'+
        '<button onclick="_obRemoveExtra('+i+')" style="background:none;border:none;color:#ff453a;font-size:18px;cursor:pointer;margin-left:auto;padding:0 4px">\u00d7</button>'+
      '</div></div>';
  }
  con.innerHTML='<div class="ob-form"><h2 class="ob-h2">'+_ot('obExtraTitle','Extra calendars')+'</h2><p class="ob-p2">'+_ot('obExtraSub','Add as many calendars as you want.')+'</p>'+
    '<div id="ob-extra-list">'+extras.map(function(c,i){return rowHtml(c,i);}).join('')+'</div>'+
    '<button class="ob-btn-g" style="width:100%;margin-top:6px;font-size:13px" onclick="_obAddExtra()">'+_ot('btnAddCal','+ Add calendar')+'</button></div>';
  bot.innerHTML='<button class="ob-btn-p ob-btn-full" onclick="_obAccDone(\'Enregistr\u00e9\u00a0!\',function(){if(typeof awInit===\'function\')awInit();})">'+_ot('btnSave','Save')+' <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>';
}
function _obAddExtra(){var d=_obLoad();var e=d.extraCals||[];e.push({type:'google',url:'',color:'blue'});d.extraCals=e;_obSave(d);var el=document.getElementById('ob-overlay');if(!el)return;var con=el.querySelector('#ob-cal-content'),bot=el.querySelector('#ob-cal-bottom');if(con&&bot)_obFillAdvanced(con,bot);}
function _obRemoveExtra(i){var d=_obLoad();var e=d.extraCals||[];e.splice(i,1);d.extraCals=e;_obSave(d);var el=document.getElementById('ob-overlay');if(!el)return;var con=el.querySelector('#ob-cal-content'),bot=el.querySelector('#ob-cal-bottom');if(con&&bot)_obFillAdvanced(con,bot);}
function _obExtraType(i,type,btn){var p=btn.parentElement;if(p)p.querySelectorAll('.ob-src-btn').forEach(function(b){b.classList.remove('ob-src-on');});btn.classList.add('ob-src-on');var d=_obLoad();var e=d.extraCals||[];if(e[i])e[i].type=type;d.extraCals=e;_obSave(d);}
function _obExtraUrl(i,inp){var d=_obLoad();var e=d.extraCals||[];if(e[i])e[i].url=inp.value.trim();d.extraCals=e;_obSave(d);}
function _obExtraName(i,inp){var d=_obLoad();var e=d.extraCals||[];if(e[i])e[i].name=inp.value.trim();d.extraCals=e;_obSave(d);}
function _obExtraColorPop(btn,i){
  var existing=document.getElementById('ob-color-pop');if(existing)existing.remove();
  var pop=document.createElement('div');pop.id='ob-color-pop';
  pop.style.cssText='position:absolute;z-index:9999;background:var(--bg2,#1c1c1e);border:.5px solid var(--sep);border-radius:14px;padding:10px;display:flex;flex-wrap:wrap;gap:7px;width:224px;box-shadow:0 8px 32px rgba(0,0,0,.5);';
  var _ECAM_C=['blue','cyan','violet','amber','emerald','rose','orange','grey'];
  OB_COLORS.forEach(function(c){
    var b=document.createElement('button');
    var isE=_ECAM_C.indexOf(c.k)>=0;
    b.style.cssText='position:relative;width:28px;height:28px;border-radius:50%;background:'+c.hex+';border:2px solid transparent;cursor:pointer;';
    if(isE){var badge=document.createElement('span');badge.textContent='E';badge.style.cssText='position:absolute;bottom:1px;right:1px;font-size:6px;font-weight:800;color:rgba(255,255,255,.85);pointer-events:none;text-shadow:0 0 2px rgba(0,0,0,.6)';b.appendChild(badge);}
    b.onclick=function(e){e.stopPropagation();btn.style.background=c.hex;btn.dataset.color=c.k;pop.remove();var d=_obLoad();var ex=d.extraCals||[];if(ex[i])ex[i].color=c.k;d.extraCals=ex;_obSave(d);};
    pop.appendChild(b);
  });
  var rect=btn.getBoundingClientRect();var sheet=document.getElementById('ob-sheet');var sr=sheet?sheet.getBoundingClientRect():{left:0,top:0,width:400};
  pop.style.top=(rect.bottom-sr.top+6)+'px';pop.style.left=Math.max(8,Math.min(rect.left-sr.left-90,sr.width-232))+'px';
  var content=document.querySelector('#ob-cal-content');if(content)content.appendChild(pop);
  setTimeout(function(){document.addEventListener('click',function cl(e){if(!pop.contains(e.target)){pop.remove();document.removeEventListener('click',cl);}});},10);
}

// CSS inject\u00e9
(function(){
  if(document.getElementById('ob-css'))return;
  var s=document.createElement('style');s.id='ob-css';
  s.textContent=`
#ob-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;
  background:rgba(0,0,0,.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity .25s}
#ob-overlay.ob-in{opacity:1}
#ob-overlay.ob-out{opacity:0;pointer-events:none}
#ob-sheet{position:relative;width:100%;background:var(--bg2,#1c1c1e);border-radius:26px 26px 0 0;
  border-top:1px solid var(--sep,rgba(255,255,255,.11));min-height:65dvh;max-height:95dvh;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 -20px 60px rgba(0,0,0,.7);
  transform:translateY(60px);transition:transform .38s cubic-bezier(.32,1.2,.45,1);will-change:transform}
#ob-overlay.ob-in #ob-sheet{transform:translateY(0)}
#ob-handle-zone{width:100%;padding:10px 0 4px;cursor:grab;flex-shrink:0;display:flex;align-items:center;justify-content:center;touch-action:none}
#ob-handle{width:36px;height:4px;border-radius:2px;background:var(--sep)}
.ob-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}
.ob-orb1,.ob-orb2{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18}
.ob-orb1{width:300px;height:300px;background:#3b82f6;top:-80px;right:-60px;animation:orb 9s ease-in-out infinite}
.ob-orb2{width:220px;height:220px;background:#6366f1;bottom:60px;left:-40px;animation:orb 13s ease-in-out infinite reverse}
@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(12px,10px)}}
.ob-x{position:absolute;top:18px;right:16px;z-index:10;width:28px;height:28px;border-radius:50%;
  background:var(--fill);border:none;cursor:pointer;color:var(--lbl2);
  display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1}
#ob-content,#ob-cal-content{flex:1;overflow-y:auto;padding:20px 20px 4px;-webkit-overflow-scrolling:touch;position:relative;z-index:1}
#ob-bottom,#ob-cal-bottom{display:block;padding:12px 20px calc(env(safe-area-inset-bottom,0px)+14px);position:relative;z-index:1;flex-shrink:0}
.ob-slide{animation:obslide .22s cubic-bezier(.25,.8,.25,1) both}
@keyframes obslide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
.ob-step-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ob-dots{display:flex;gap:5px;align-items:center}
.ob-dot{width:6px;height:6px;border-radius:50%;background:var(--sep);transition:all .2s}
.ob-dot.ob-dot-on{width:18px;border-radius:3px;background:var(--tint,#0a84ff)}
.ob-opt-badge{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--lbl3);background:var(--fill);border:1px solid var(--sep);padding:2px 8px;border-radius:99px}
.ob-hero{display:flex;flex-direction:column;align-items:flex-start;padding-top:4px}
.ob-logo-wrap{width:52px;height:52px;border-radius:14px;overflow:hidden;margin-bottom:18px;box-shadow:0 4px 18px rgba(59,130,246,.4)}
.ob-logo-wrap svg{width:100%;height:100%;display:block}
.ob-h1{font-size:34px;font-weight:800;line-height:1.1;letter-spacing:-.04em;color:var(--lbl);margin:0 0 10px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-h1 em{font-style:normal;background:linear-gradient(135deg,#60a5fa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ob-p{font-size:15px;color:var(--lbl2);margin:0 0 22px;line-height:1.55}
.ob-feats{display:flex;flex-direction:column;gap:10px;width:100%}
.ob-feat{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--lbl2)}
.ob-feat span{font-size:18px;width:26px;text-align:center;flex-shrink:0}
.ob-h2{font-size:24px;font-weight:800;line-height:1.12;letter-spacing:-.03em;color:var(--lbl);margin:0 0 8px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-p2{font-size:13.5px;color:var(--lbl2);margin:0 0 12px;line-height:1.5}
.ob-field{display:flex;flex-direction:column;gap:5px}
.ob-lbl{font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:var(--lbl3)}
.ob-opt{font-size:10px;font-weight:400;letter-spacing:0;text-transform:none;color:var(--lbl3)}
.ob-inp-wrap{position:relative;display:flex;align-items:center}
.ob-inp{width:100%;padding:13px 44px 13px 14px;background:var(--fill);
  border:1.5px solid var(--sep);border-radius:12px;color:var(--lbl);
  font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;appearance:none;box-sizing:border-box;
  transition:border-color .18s,box-shadow .18s}
.ob-inp:focus{border-color:var(--tint);box-shadow:0 0 0 3px rgba(10,132,255,.15)}
.ob-field>.ob-inp{padding:13px 14px}
.ob-mono{font-family:"SF Mono",ui-monospace,monospace;font-size:12.5px}
.ob-inp::placeholder{color:var(--lbl3)}
.ob-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:var(--lbl3);padding:4px;display:flex;align-items:center}
.ob-err{font-size:12px;color:#ff453a;max-height:0;overflow:hidden;transition:max-height .2s}
.ob-err.ob-err-show{max-height:36px;margin-top:3px}
.ob-details{margin-top:14px;border-radius:11px;background:var(--fill);border:1px solid var(--sep);overflow:hidden}
.ob-details summary.ob-hint-t{font-size:13px;font-weight:500;color:var(--lbl2);padding:11px 14px;cursor:pointer;list-style:none;user-select:none}
.ob-details summary.ob-hint-t::-webkit-details-marker{display:none}
.ob-hint-l{margin:0;padding:0 14px 12px 28px;color:var(--lbl2);font-size:12.5px;line-height:1.9}
.ob-hint-l strong{color:var(--lbl)}
.ob-src-group{display:flex;flex-direction:column;gap:6px;margin-bottom:4px}
.ob-src-btn,.ob-preset-btn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;
  border:1.5px solid var(--sep);background:var(--fill);
  color:var(--lbl);font-family:inherit;cursor:pointer;text-align:left;width:100%;
  -webkit-tap-highlight-color:transparent;transition:border-color .18s,background .18s,transform .1s;
  -webkit-appearance:none}
.ob-src-btn:active,.ob-preset-btn:active{transform:scale(.98)}
.ob-src-btn.ob-src-on,.ob-preset-btn.ob-preset-on{border-color:var(--tint);background:rgba(10,132,255,.1)}
.ob-src-ico{font-size:22px;flex-shrink:0;width:30px;text-align:center}
.ob-src-body{flex:1;min-width:0}
.ob-src-title{font-size:14px;font-weight:600;color:var(--lbl);margin-bottom:2px}
.ob-src-sub{font-size:12px;color:var(--lbl2);line-height:1.4}
.ob-src-chk{font-size:15px;color:var(--tint);font-weight:700;flex-shrink:0;width:20px;text-align:center}
.ob-cg{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.ob-cb{width:30px;height:30px;border-radius:50%;border:2px solid transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  -webkit-tap-highlight-color:transparent;transition:transform .12s,border-color .12s}
.ob-cb:active{transform:scale(.88)}
.ob-cb.ob-cb-on{border-color:var(--lbl);transform:scale(1.15)}
.ob-subj-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.ob-color-dot-btn{width:32px;height:32px;border-radius:50%;border:2px solid var(--sep);flex-shrink:0;cursor:pointer;transition:transform .12s}
.ob-color-dot-btn:active{transform:scale(.88)}
.ob-subj-del{background:none;border:none;color:#ff453a;font-size:20px;cursor:pointer;padding:0 4px;flex-shrink:0;line-height:1}
.ob-avatar-row{display:flex;align-items:center;gap:16px;margin-bottom:4px}
.ob-avatar-preview{width:72px;height:72px;border-radius:50%;flex-shrink:0;overflow:hidden;background:var(--fill);border:1.5px solid var(--sep);display:flex;align-items:center;justify-content:center}
.ob-av-placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--lbl3)}
.ob-avatar-btns{display:flex;flex-direction:column;gap:8px}
.ob-btn-av{display:inline-flex;align-items:center;justify-content:center;padding:9px 16px;border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;background:var(--fill);color:var(--lbl2)}
.ob-btn-av-del{color:#ff453a}
.ob-pref-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--sep)}
.ob-pref-row:last-child{border-bottom:none}
.ob-pref-ico{font-size:22px;flex-shrink:0;width:30px;text-align:center}
.ob-pref-label{flex:1;font-size:15px;font-weight:500;color:var(--lbl)}
.ob-pref-btns{display:flex;gap:6px;flex-shrink:0}
.ob-pref-btn{padding:6px 14px;border-radius:99px;border:.5px solid var(--sep);background:var(--fill);color:var(--lbl2);font-size:13px;font-weight:500;font-family:inherit;cursor:pointer;transition:all .15s}
.ob-pref-btn.ob-pref-on{background:var(--tint);border-color:transparent;color:#fff;box-shadow:0 2px 10px rgba(10,132,255,.4)}
.ob-done{display:flex;flex-direction:column;align-items:center;padding:28px 0 16px}
.ob-check-wrap{position:relative;width:88px;height:88px;margin-bottom:24px}
.ob-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(99,102,241,.4);animation:ob-ring 2.5s ease-out infinite}
.ob-ring.r2{animation-delay:.55s;border-color:rgba(59,130,246,.3)}
@keyframes ob-ring{0%{transform:scale(.88);opacity:.7}100%{transform:scale(1.55);opacity:0}}
.ob-check-circle{position:absolute;inset:10px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(99,102,241,.5)}
.ob-check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:ob-draw .5s .2s ease forwards}
@keyframes ob-draw{to{stroke-dashoffset:0}}
.ob-done-h{font-size:28px;font-weight:800;letter-spacing:-.035em;color:var(--lbl);margin:0 0 6px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:14px 20px;border-radius:14px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;box-shadow:0 4px 16px rgba(99,102,241,.3);-webkit-tap-highlight-color:transparent;transition:transform .12s;-webkit-appearance:none;appearance:none}
.ob-btn-p:active{transform:scale(.97)}
.ob-btn-p.ob-btn-full{width:100%;display:flex}
.ob-btn-g{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:14px 16px;border-radius:14px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;background:var(--fill);color:var(--lbl2);flex-shrink:0;-webkit-tap-highlight-color:transparent;-webkit-appearance:none;appearance:none}
.ob-btn-g:active{transform:scale(.97)}
.ob-btn-skip{background:none;border:none;cursor:pointer;font-size:14px;font-weight:500;color:var(--lbl3);font-family:inherit;padding:14px 10px}
.ob-row{display:flex;align-items:center;gap:8px}.ob-row .ob-btn-p{flex:1}
.ob-row-right{display:flex;align-items:center;gap:6px;margin-left:auto}
.ob-legal{font-size:11.5px;color:var(--lbl3);text-align:center;margin:10px 0 0}
.ob-ecam-badge{position:absolute;bottom:1px;right:1px;font-size:6px;font-weight:800;
  color:rgba(255,255,255,.85);line-height:1;pointer-events:none;letter-spacing:0;
  text-shadow:0 0 3px rgba(0,0,0,.5)}
.ob-cb{position:relative}

`;
  document.head.appendChild(s);
})();
