/*
  Calendar by Shortcut™ — Onboarding & Settings
  © 2026 Ogust'1. Clean rewrite.
*/

'use strict';

// ── Storage helpers ───────────────────────────────────────────────────────────
function _obSave(d)  { localStorage.setItem('shortcut_config', JSON.stringify(d)); }
function _obLoad()   { try { return JSON.parse(localStorage.getItem('shortcut_config')||'null')||{}; } catch(e){ return {}; } }
function _obEsc(s)   { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

// ── State ─────────────────────────────────────────────────────────────────────
var _obStep = 0;
var _obIsSettings = false;
var _obCalSub = 0; // sub-step within calendar step

// ── Open / Close ──────────────────────────────────────────────────────────────
function showOnboarding() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 0; _obCalSub = 0; _obIsSettings = false;
  _obOpen();
}
function showSettings() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 1; _obCalSub = 0; _obIsSettings = true;
  _obOpen();
}

function _obOpen() {
  var el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML =
    '<div id="ob-sheet">' +
    '<div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>' +
    '<div id="ob-handle-zone"><div id="ob-handle"></div></div>' +
    (_obIsSettings ? '<button class="ob-x" onclick="_obClose()" aria-label="Close">\u00d7</button>' : '') +
    '<div id="ob-content"></div>' +
    '<div id="ob-bottom"></div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function() {
    el.classList.add('ob-in');
    _obRender();
    _obInitDrag(el);
  });
}

function _obClose() {
  var o = document.getElementById('ob-overlay');
  if (!o) return;
  o.classList.add('ob-out');
  setTimeout(function() { o.remove(); }, 380);
}

function _obShowUnconfigured() {
  var c = document.getElementById('aw-compact');
  if (!c) return;
  var d = _obLoad(), lang = d.lang||'en';
  var msg = lang==='fr' ? "L\u2019agenda n\u2019est pas configur\u00e9." : 'Calendar not configured.';
  var btn = lang==='fr' ? 'Configurer' : 'Set up';
  c.innerHTML = '<div class="aw-state" style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:52px 24px">' +
    '<div style="font-size:48px">&#128197;</div>' +
    '<div style="font-size:16px;font-weight:600;color:var(--text);text-align:center">' + msg + '</div>' +
    '<button onclick="showOnboarding()" style="padding:13px 32px;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:15px;font-weight:600;font-family:inherit;">' + btn + '</button>' +
    '</div>';
}

// ── Drag to dismiss ───────────────────────────────────────────────────────────
function _obInitDrag(overlay) {
  var sheet = overlay.querySelector('#ob-sheet');
  var zone  = overlay.querySelector('#ob-handle-zone');
  if (!sheet || !zone) return;
  var startY=0, curY=0, active=false;
  var THRESH = 120;
  function start(e) { active=true; startY=e.touches?e.touches[0].clientY:e.clientY; curY=0; sheet.style.transition='none'; }
  function move(e)  {
    if (!active) return;
    var dy = (e.touches?e.touches[0].clientY:e.clientY) - startY;
    if (dy<0) dy=0; curY=dy;
    sheet.style.transform='translateY('+dy+'px)';
    overlay.style.background='rgba(0,0,0,'+(0.52*(1-Math.min(dy/THRESH,1)*0.7))+')';
    if (e.cancelable) e.preventDefault();
  }
  function end() {
    if (!active) return; active=false; sheet.style.transition='';
    if (curY >= THRESH) {
      sheet.style.transform='translateY(110%)';
      overlay.style.opacity='0'; overlay.style.transition='opacity .25s';
      setTimeout(function() {
        overlay.remove();
        if (!_obIsSettings) {
          var cfg=_obLoad();
          if (!(cfg.apiKey||cfg.cal1Ical) || !((cfg.calendars&&cfg.calendars[0])||cfg.cal1Ical)) _obShowUnconfigured();
        }
      }, 280);
    } else {
      sheet.style.transform=''; overlay.style.background='';
    }
  }
  zone.addEventListener('touchstart', start, {passive:true});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end, {passive:true});
  zone.addEventListener('mousedown', start);
  document.addEventListener('mousemove', function(e){if(active)move(e);});
  document.addEventListener('mouseup', end);
}

// ── Steps: 0=welcome, 1=calendars(sub), 2=profile, 3=prefs, 4=done
var _OB_STEPS = 5;

function _obRender() {
  var con = document.getElementById('ob-content');
  var bot = document.getElementById('ob-bottom');
  if (!con || !bot) return;
  con.classList.remove('ob-slide');
  var fns = [_s0, _s1_cal, _s2, _s3, _s4];
  var r = fns[_obStep] ? fns[_obStep]() : {c:'',b:''};
  con.innerHTML = r.c; bot.innerHTML = r.b;
  void con.offsetWidth; con.classList.add('ob-slide');
  setTimeout(function(){ var i=con.querySelector('input[type="text"],input[type="password"],input[type="url"]'); if(i) i.focus(); }, 320);
}

function _obNext() {
  if (!_obValidate()) return;
  // Handle calendar sub-steps
  if (_obStep === 1) {
    var d = _obLoad(), src2 = d.calSource||'ical';
    var subMax = src2==='ical' ? 2 : 3; // ical: source+ids+style; api: source+ids+style+cal2color
    if (_obCalSub < subMax) { _obCalSub++; _obRender(); return; }
    _obCalSub=0; _obStep++; _obRender(); return;
  }
  if (_obStep < _OB_STEPS-1) { _obStep++; _obRender(); }
}

function _obBack() {
  if (_obStep === 1 && _obCalSub > 0) { _obCalSub--; _obRender(); return; }
  if (_obStep > (_obIsSettings?1:0)) { _obStep--; _obRender(); }
}

function _obSkip() {
  if (_obStep < _OB_STEPS-1) { _obStep++; _obRender(); }
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function _s0() {
  return {
    c: '<div class="ob-hero">' +
       '<div class="ob-logo-wrap"><svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="13" fill="url(#og)"/><path d="M28 9L17 26h11L19 39l15-19H23L28 9z" fill="white" opacity=".95"/><defs><linearGradient id="og" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg></div>' +
       '<h1 class="ob-h1">Calendar<br><em>by Shortcut&#8482;</em></h1>' +
       '<p class="ob-p">Your ECAM schedule, always with you.</p>' +
       '<div class="ob-feats">' +
         '<div class="ob-feat"><span>&#128197;</span>Agenda &amp; time grid</div>' +
         '<div class="ob-feat"><span>&#128276;</span>Live class tracking</div>' +
         '<div class="ob-feat"><span>&#128274;</span>Keys stored on device</div>' +
         '<div class="ob-feat"><span>&#128244;</span>Works offline</div>' +
       '</div></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obNext()">Get started <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
       '<p class="ob-legal">Your data never leaves this device.</p>'
  };
}

// ── Step 1: API Key (only if API source) ──────────────────────────────────────
function _s1() {
  var saved = _obLoad().apiKey || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(1,4) + '</div></div>' +
       '<h2 class="ob-h2">API Key</h2>' +
       '<p class="ob-p2">A Google API key to read your calendar.</p>' +
       '<div class="ob-field"><label class="ob-lbl">GOOGLE API KEY</label>' +
       '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy\u2026" value="' + _obEsc(saved) + '" autocomplete="off" spellcheck="false"/>' +
       '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">' + _eyeIcon(false) + '</button></div>' +
       '<div class="ob-err" id="ob-apikey-err"></div></div>' +
       '<details class="ob-details"><summary class="ob-hint-t">&#128161; How to get an API key</summary>' +
       '<ol class="ob-hint-l"><li>Go to <strong>console.cloud.google.com</strong></li>' +
       '<li>New project &#8594; APIs &amp; Services &#8594; Credentials</li>' +
       '<li>Create API Key &#8594; restrict to <em>Google Calendar API</em></li></ol></details>' +
       '</div>',
    b: _obNavRow(true, 'Next', true)
  };
}

// ── Step 2: Calendars (sub-stepped) ──────────────────────────────────────────
function _s1_cal() {
  var d = _obLoad(), src = d.calSource||'ical';
  if (_obCalSub === 0) return _s2a(d, src);
  if (_obCalSub === 1) return _s2b(d, src); // ids for both ical and api
  if (_obCalSub === 2) return _s2c(d);      // style/colours
  if (_obCalSub === 3) return _s2d(d);      // cal2 colour (api only, auto-skip if no cal2)
  return _s2a(d, src);
}

function _s2a(d, src) {
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2,4) + '</div></div>' +
       '<h2 class="ob-h2">Calendar Source</h2>' +
       '<p class="ob-p2">How should the app access your calendar?</p>' +
       '<div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">' +
         _srcBtn('api', src==='api', '&#128273;', 'Google Calendar API', 'API key + Calendar ID. Full control, real-time.') +
         _srcBtn('ical', src==='ical', '&#128241;', 'iPhone Calendar (iCal)', 'Paste an iCal link — no API key needed.') +
       '</div>' +
       '<div id="ob-ical-fields" style="' + (src==='ical'?'margin-top:14px':'display:none;margin-top:14px') + '">' +
         '<div class="ob-field"><label class="ob-lbl">ICAL URL — CALENDAR 1 <span style="color:var(--red)">*</span></label>' +
         '<input type="url" id="ob-ical0" class="ob-inp ob-mono" placeholder="webcal://\u2026 or https://\u2026" value="' + _obEsc(d.cal1Ical||'') + '" autocomplete="off" spellcheck="false"/>' +
         '<div class="ob-err" id="ob-ical0-err"></div></div>' +
         '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">ICAL URL — CALENDAR 2 <span class="ob-opt">optional</span></label>' +
         '<input type="url" id="ob-ical1" class="ob-inp ob-mono" placeholder="webcal://\u2026 or https://\u2026" value="' + _obEsc(d.cal2Ical||'') + '" autocomplete="off" spellcheck="false"/></div>' +
         '<details class="ob-details" style="margin-top:10px"><summary class="ob-hint-t">&#128161; Get iCal from iPhone or Google</summary>' +
         '<ol class="ob-hint-l"><li><strong>Google Calendar</strong>: Settings &#8594; your calendar &#8594; Integrate &#8594; iCal</li>' +
         '<li><strong>iPhone</strong>: Settings &#8594; Calendar &#8594; Accounts &#8594; your account</li>' +
         '<li>Copy the link starting with <strong>webcal://</strong></li></ol></details>' +
       '</div></div>',
    b: _obNavRow(true, 'Next', true)
  };
}

function _s2b(d, src) {
  src = src || d.calSource || 'ical';
  if (src === 'ical') {
    return {
      c: '<div class="ob-form">' +
         '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2,4) + '</div></div>' +
         '<h2 class="ob-h2">iCal Links</h2>' +
         '<p class="ob-p2">Paste the iCal links you copied from iPhone or Google.</p>' +
         '<div class="ob-field"><label class="ob-lbl">CALENDAR 1 <span style="color:var(--red)">*</span></label>' +
         '<input type="url" id="ob-ical0" class="ob-inp ob-mono" placeholder="webcal://p62-caldav.icloud.com/…" value="' + _obEsc(d.cal1Ical||'') + '" autocomplete="off" spellcheck="false"/>' +
         '<div class="ob-err" id="ob-ical0-err"></div></div>' +
         '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 2 <span class="ob-opt">optional</span></label>' +
         '<input type="url" id="ob-ical1" class="ob-inp ob-mono" placeholder="webcal://… or https://…" value="' + _obEsc(d.cal2Ical||'') + '" autocomplete="off" spellcheck="false"/></div>' +
         '</div>',
      b: _obNavRow(false, 'Next', true)
    };
  } else {
    // Google API
    return {
      c: '<div class="ob-form">' +
         '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2,4) + '</div></div>' +
         '<h2 class="ob-h2">Google API</h2>' +
         '<p class="ob-p2">Enter your API key and Calendar IDs.</p>' +
         '<div class="ob-field"><label class="ob-lbl">API KEY <span style="color:var(--red)">*</span></label>' +
         '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy…" value="' + _obEsc(d.apiKey||'') + '" autocomplete="off" spellcheck="false"/>' +
         '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">' + _eyeIcon(false) + '</button></div>' +
         '<div class="ob-err" id="ob-apikey-err"></div></div>' +
         '<div class="ob-field" style="margin-top:12px"><label class="ob-lbl">CALENDAR 1 <span style="color:var(--red)">*</span></label>' +
         '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc((d.calendars&&d.calendars[0])||'') + '" autocomplete="off" spellcheck="false"/>' +
         '<div class="ob-err" id="ob-cal0-err"></div></div>' +
         '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 2 <span class="ob-opt">optional</span></label>' +
         '<input type="text" id="ob-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc((d.calendars&&d.calendars[1])||'') + '" autocomplete="off" spellcheck="false"/></div>' +
         '<details class="ob-details"><summary class="ob-hint-t">&#128161; How to get a Calendar ID</summary>' +
         '<ol class="ob-hint-l"><li>Go to <strong>console.cloud.google.com</strong> → enable Calendar API</li>' +
         '<li>Create an API Key → restrict to Google Calendar API</li>' +
         '<li>In Google Calendar: Settings → your calendar → Integrate → copy Calendar ID</li></ol></details>' +
         '</div>',
      b: _obNavRow(false, 'Next', true)
    };
  }
}

function _s2c(d) {
  var preset = d.cal1Preset||'ecam', color = d.cal1Color||'blue', subs = d.cal1Subjects||[];
  var subjRows = '';
  var defaultSubs = [
    {match:'math',color:'blue',label:'Maths'},{match:'physique',color:'cyan',label:'Physique'},
    {match:'informatique',color:'violet',label:'Informatique'},{match:'sciences ind',color:'amber',label:'Sciences Ind.'},
    {match:'anglais',color:'emerald',label:'Anglais'},{match:'sport',color:'rose',label:'Sport'},
    {match:'culture',color:'orange',label:'Culture'},{match:'proj',color:'grey',label:'Projets'},
  ];
  var subjList = subs.length ? subs : defaultSubs;
  subjList.forEach(function(s,i){
    subjRows += '<div class="ob-subj-row" data-idx="'+i+'">' +
      '<input class="ob-inp ob-subj-inp" data-match="'+_obEsc(s.match||'')+'" value="'+_obEsc(s.label||s.match||'')+'" placeholder="Subject\u2026" style="flex:1;padding:8px 10px;font-size:13px" oninput="_obSubjChange()"/>' +
      _obColorGrid('ob-sc-'+i, s.color||'blue', '_obPickSubjColor') +
      '<button onclick="_obRemoveSubj(this)" style="background:none;border:none;color:#ff453a;font-size:20px;cursor:pointer;padding:0 4px;flex-shrink:0">\u00d7</button>' +
    '</div>';
  });
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2,4) + '</div></div>' +
       '<h2 class="ob-h2">Calendar 1 Style</h2>' +
       '<p class="ob-p2">How should event colours be assigned?</p>' +
       '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">' +
         _srcBtn2('ecam',   preset==='ecam',   '&#127979;', 'ECAM Preset',     'Auto-detects subjects and assigns colours.') +
         _srcBtn2('custom', preset==='custom', '&#127912;', 'Custom',          'Name your subjects and pick a colour each.') +
         _srcBtn2('none',   preset==='none',   '&#128288;', 'Single colour',   'All events in one colour.') +
       '</div>' +
       '<div id="ob-c1-color" style="' + (preset==='none'?'':'display:none') + '">' +
         '<label class="ob-lbl" style="display:block;margin-bottom:8px">COLOUR</label>' +
         _obColorGrid('ob-c1g', color, '_obPickCal1Color') +
       '</div>' +
       '<div id="ob-c1-subjs" style="' + (preset==='custom'?'':'display:none') + '">' +
         '<label class="ob-lbl" style="display:block;margin-bottom:8px">SUBJECTS &amp; COLOURS</label>' +
         subjRows +
         '<button class="ob-btn-g" style="width:100%;margin-top:8px;font-size:13px" onclick="_obAddSubj()">+ Add subject</button>' +
       '</div></div>',
    b: _obNavRow(false, 'Next', true)
  };
}

function _s2d(d) {
  var color = d.cal2Color||'lime';
  var hasCal2 = (d.calendars&&d.calendars[1]) || d.cal2Ical;
  if (!hasCal2) { setTimeout(function(){_obNext();},10); return {c:'<div class="ob-form"></div>',b:''}; }
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2,4) + '</div></div>' +
       '<h2 class="ob-h2">Calendar 2 Colour</h2>' +
       '<p class="ob-p2">Choose a colour for all events from Calendar 2.</p>' +
       _obColorGrid('ob-c2g', color, '_obPickCal2Color') +
       '</div>',
    b: _obNavRow(false, 'Save', true)
  };
}

// Source buttons helpers
function _srcBtn(val, active, ico, title, sub) {
  return '<button class="ob-src-btn'+(active?' ob-src-on':'')+'" onclick="_obPickSrc(\''+val+'\',this)">' +
    '<div class="ob-src-ico">'+ico+'</div><div class="ob-src-body"><div class="ob-src-title">'+title+'</div><div class="ob-src-sub">'+sub+'</div></div>' +
    '<div class="ob-src-chk">'+(active?'&#10003;':'')+'</div></button>';
}
function _srcBtn2(val, active, ico, title, sub) {
  return '<button class="ob-src-btn'+(active?' ob-src-on':'')+'" onclick="_obPickPreset(\''+val+'\',this)">' +
    '<div class="ob-src-ico">'+ico+'</div><div class="ob-src-body"><div class="ob-src-title">'+title+'</div><div class="ob-src-sub">'+sub+'</div></div>' +
    '<div class="ob-src-chk">'+(active?'&#10003;':'')+'</div></button>';
}

function _obPickSrc(val, btn) {
  document.querySelectorAll('#ob-content .ob-src-btn').forEach(function(b){b.classList.remove('ob-src-on');var c=b.querySelector('.ob-src-chk');if(c)c.textContent='';});
  btn.classList.add('ob-src-on'); var chk=btn.querySelector('.ob-src-chk');if(chk)chk.textContent='\u2713';
  var d=_obLoad(); d.calSource=val; _obSave(d);
  // Hide/show the iphone hint based on selection
  var hint=document.getElementById('ob-iphone-hint'); if(hint)hint.style.display=(val==='ical'?'':'');
  var f=document.getElementById('ob-ical-fields'); if(f)f.style.display=(val==='ical'?'':'none');
  if(val==='ical')f.style.marginTop='14px';
}
function _obPickPreset(val, btn) {
  document.querySelectorAll('#ob-content .ob-src-btn').forEach(function(b){b.classList.remove('ob-src-on');var c=b.querySelector('.ob-src-chk');if(c)c.textContent='';});
  btn.classList.add('ob-src-on'); var chk=btn.querySelector('.ob-src-chk');if(chk)chk.textContent='\u2713';
  var d=_obLoad(); d.cal1Preset=val; _obSave(d);
  var cr=document.getElementById('ob-c1-color'); if(cr)cr.style.display=(val==='none'?'':'none');
  var sr=document.getElementById('ob-c1-subjs'); if(sr)sr.style.display=(val==='custom'?'':'none');
}

// ── Colour grid ───────────────────────────────────────────────────────────────
var OB_COLORS = [
  {k:'blue',hex:'#3b82f6'},{k:'violet',hex:'#8b5cf6'},{k:'emerald',hex:'#10b981'},
  {k:'amber',hex:'#f59e0b'},{k:'rose',hex:'#f43f5e'},{k:'cyan',hex:'#06b6d4'},
  {k:'orange',hex:'#f97316'},{k:'grey',hex:'#94a3b8'},{k:'lime',hex:'#84cc16'},
];

function _obColorGrid(id, current, onchange) {
  var h = '<div class="ob-cg" id="'+id+'">';
  OB_COLORS.forEach(function(c) {
    var on = c.k===current;
    h += '<button class="ob-cb'+(on?' ob-cb-on':'')+'" data-color="'+c.k+'" style="background:'+c.hex+'" onclick="'+onchange+'(\''+c.k+'\',\''+id+'\')">' +
         (on?'<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>':'') + '</button>';
  });
  return h + '</div>';
}
function _obSelectColor(key, gridId) {
  var g=document.getElementById(gridId); if(!g)return;
  g.querySelectorAll('.ob-cb').forEach(function(b){
    var on=b.dataset.color===key; b.classList.toggle('ob-cb-on',on);
    b.innerHTML=on?'<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>':'';
  });
}
function _obPickCal1Color(k,g){ _obSelectColor(k,g); var d=_obLoad();d.cal1Color=k;_obSave(d); }
function _obPickCal2Color(k,g){ _obSelectColor(k,g); var d=_obLoad();d.cal2Color=k;_obSave(d); }
function _obPickSubjColor(k,g){ _obSelectColor(k,g); _obSaveSubjs(); }

// Subject management
function _obSaveSubjs() {
  var rows=document.querySelectorAll('#ob-c1-subjs .ob-subj-row');
  var subs=[];
  rows.forEach(function(row){
    var inp=row.querySelector('.ob-subj-inp'), onBtn=row.querySelector('.ob-cb.ob-cb-on');
    var label=(inp&&inp.value.trim())||'';
    var match=(inp&&inp.dataset.match)||label.toLowerCase();
    var color=(onBtn&&onBtn.dataset.color)||'blue';
    if(label) subs.push({match:match,color:color,label:label});
  });
  var d=_obLoad(); d.cal1Subjects=subs; _obSave(d);
}
function _obSubjChange(){ _obSaveSubjs(); }
function _obRemoveSubj(btn){ var r=btn.closest('.ob-subj-row');if(r)r.remove();_obSaveSubjs(); }
function _obAddSubj(){
  var cont=document.getElementById('ob-c1-subjs'); if(!cont)return;
  var i=cont.querySelectorAll('.ob-subj-row').length;
  var div=document.createElement('div'); div.className='ob-subj-row'; div.dataset.idx=i;
  div.innerHTML='<input class="ob-inp ob-subj-inp" placeholder="Subject\u2026" style="flex:1;padding:8px 10px;font-size:13px" oninput="_obSubjChange()"/>'+
    _obColorGrid('ob-sc-'+i,'blue','_obPickSubjColor')+
    '<button onclick="_obRemoveSubj(this)" style="background:none;border:none;color:#ff453a;font-size:20px;cursor:pointer;padding:0 4px;flex-shrink:0">\u00d7</button>';
  var addBtn=cont.querySelector('button.ob-btn-g'); if(addBtn)cont.insertBefore(div,addBtn); else cont.appendChild(div);
  _obSaveSubjs();
}

// ── Step 3: Profile (optional) ────────────────────────────────────────────────
function _s2() {
  var d=_obLoad(), photo=d.photo||'', name=d.displayName||'';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(3,4)+'</div><span class="ob-opt-badge">Optional</span></div>' +
       '<h2 class="ob-h2">Your Profile</h2><p class="ob-p2">Add a photo and display name.</p>' +
       '<div class="ob-avatar-row">' +
         '<div class="ob-avatar-preview" id="ob-av-preview">' +
           (photo?'<img id="ob-av-img" src="'+_obEsc(photo)+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>':
             '<div id="ob-av-img" class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>') +
         '</div>' +
         '<div class="ob-avatar-btns">' +
           '<label class="ob-btn-av" for="ob-av-input">Choose photo</label>' +
           '<input type="file" id="ob-av-input" accept="image/*" style="display:none" onchange="_obPickPhoto(this)"/>' +
           (photo?'<button class="ob-btn-av ob-btn-av-del" onclick="_obRemovePhoto()">Remove</button>':'') +
         '</div></div>' +
       '<div class="ob-field" style="margin-top:16px"><label class="ob-lbl">DISPLAY NAME</label>' +
       '<input type="text" id="ob-displayname" class="ob-inp" placeholder="e.g. Augustin" value="'+_obEsc(name)+'" autocomplete="given-name" spellcheck="false"/></div></div>',
    b: _obNavRow(false, 'Next', false)
  };
}

// ── Step 4: Preferences ───────────────────────────────────────────────────────
function _s3() {
  var d=_obLoad(), lang=d.lang||'en', theme=d.theme||'auto';
  function lb(v,lbl){ return '<button class="ob-pref-btn'+(lang===v?' ob-pref-on':'')+'" onclick="_obPickLang(\''+v+'\',this)">'+lbl+'</button>'; }
  function tb(v,lbl){ return '<button class="ob-pref-btn'+(theme===v?' ob-pref-on':'')+'" onclick="_obPickTheme(\''+v+'\',this)">'+lbl+'</button>'; }
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(4,4)+'</div></div>' +
       '<h2 class="ob-h2">Preferences</h2><p class="ob-p2">Language and display theme.</p>' +
       '<div class="ob-pref-row"><div class="ob-pref-ico">&#127760;</div><div class="ob-pref-label">Language</div>' +
         '<div class="ob-pref-btns" id="ob-lang-btns">'+lb('en','English')+lb('fr','Fran\u00e7ais')+'</div></div>' +
       '<div class="ob-pref-row" style="margin-top:12px"><div class="ob-pref-ico">&#127763;</div><div class="ob-pref-label">Theme</div>' +
         '<div class="ob-pref-btns" id="ob-theme-btns">'+tb('auto','Auto')+tb('dark','Dark')+tb('light','Light')+'</div></div>' +
       '</div>',
    b: _obNavRow(false, 'Next', false)
  };
}
function _obPickLang(v,btn){ document.querySelectorAll('#ob-lang-btns .ob-pref-btn').forEach(function(b){b.classList.remove('ob-pref-on');}); btn.classList.add('ob-pref-on'); var d=_obLoad();d.lang=v;_obSave(d); }
function _obPickTheme(v,btn){ document.querySelectorAll('#ob-theme-btns .ob-pref-btn').forEach(function(b){b.classList.remove('ob-pref-on');}); btn.classList.add('ob-pref-on'); var d=_obLoad();d.theme=v;_obSave(d); if(typeof _applyTheme==='function')_applyTheme(v); }

// ── Step 5: Done ──────────────────────────────────────────────────────────────
function _s4() {
  return {
    c: '<div class="ob-done">' +
       '<div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div>' +
       '<div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
       "<h2 class=\"ob-done-h\">You're all set!</h2><p class=\"ob-p2\">Loading your schedule now.</p></div>",
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obFinish()">Open Calendar <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>'
  };
}

// ── Validation ────────────────────────────────────────────────────────────────
function _obValidate() {
  if (_obStep===1) {
    var v=((document.getElementById('ob-apikey')||{}).value||'').trim();
    var e=document.getElementById('ob-apikey-err');
    if(!v){_obErr(e,'API key is required.');return false;}
    if(!v.startsWith('AIza')){_obErr(e,'Should start with "AIza".');return false;}
    _obClear(e); var d=_obLoad();d.apiKey=v;_obSave(d); return true;
  }
  if (_obStep===1) {
    var d2=_obLoad(), src=d2.calSource||'ical';
    if (_obCalSub===0) {
      // Source chosen — always valid, just save
      return true;
    }
    if (_obCalSub===1) {
      if (src==='ical') {
        var u=((document.getElementById('ob-ical0')||{}).value||'').trim();
        var eu=document.getElementById('ob-ical0-err');
        if(!u){_obErr(eu,'iCal URL is required.');return false;}
        _obClear(eu);
        var u2=((document.getElementById('ob-ical1')||{}).value||'').trim();
        d2.cal1Ical=u; if(u2)d2.cal2Ical=u2; _obSave(d2);
      } else {
        var vk=((document.getElementById('ob-apikey')||{}).value||'').trim();
        var ek=document.getElementById('ob-apikey-err');
        if(!vk){_obErr(ek,'API key required.');return false;}
        if(!vk.startsWith('AIza')){_obErr(ek,'Should start with "AIza".');return false;}
        _obClear(ek);
        var v0=((document.getElementById('ob-cal0')||{}).value||'').trim();
        var e0=document.getElementById('ob-cal0-err');
        if(!v0){_obErr(e0,'Calendar ID required.');return false;}
        if(!v0.includes('@')){_obErr(e0,'Must contain @.');return false;}
        _obClear(e0);
        d2.apiKey=vk; var v1=((document.getElementById('ob-cal1')||{}).value||'').trim();
        d2.calendars=[v0]; if(v1&&v1.includes('@'))d2.calendars.push(v1); _obSave(d2);
      }
    }
    if (_obCalSub===2) { _obSaveSubjs(); }
    return true;
  }
  if (_obStep===2) { _obSaveProfile(); return true; }
  return true;
}

// ── Profile helpers ───────────────────────────────────────────────────────────
function _obSaveProfile() {
  var name=((document.getElementById('ob-displayname')||{}).value||'').trim();
  var d=_obLoad(); if(name)d.displayName=name; _obSave(d);
}
function _obPickPhoto(input) {
  var file=input.files[0]; if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var url=e.target.result;
    var wrap=document.getElementById('ob-av-preview');
    if(wrap)wrap.innerHTML='<img id="ob-av-img" src="'+url+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    var btns=document.querySelector('.ob-avatar-btns');
    if(btns&&!btns.querySelector('.ob-btn-av-del')){var del=document.createElement('button');del.className='ob-btn-av ob-btn-av-del';del.textContent='Remove';del.onclick=_obRemovePhoto;btns.appendChild(del);}
    var d=_obLoad();d.photo=url;_obSave(d);
    if(typeof _applyProfile==='function')_applyProfile();
  };
  reader.readAsDataURL(file);
}
function _obRemovePhoto() {
  var d=_obLoad();delete d.photo;_obSave(d);
  var wrap=document.getElementById('ob-av-preview');
  if(wrap)wrap.innerHTML='<div id="ob-av-img" class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>';
  var del=document.querySelector('.ob-btn-av-del');if(del)del.remove();
  if(typeof _applyProfile==='function')_applyProfile();
}

// ── Finish ────────────────────────────────────────────────────────────────────
function _obFinish() {
  _obClose();
  setTimeout(function(){if(typeof awInit==='function')awInit();},300);
  setTimeout(function(){if(typeof _applyProfile==='function')_applyProfile();},350);
}

// ── Nav helpers ───────────────────────────────────────────────────────────────
function _obDots(current, total) {
  var h=''; for(var i=1;i<=total;i++) h+='<div class="ob-dot'+(i===current?' ob-dot-on':'')+'"></div>'; return h;
}
function _obNavRow(required, nextLabel, hasBack) {
  var back = hasBack ? '<button class="ob-btn-g" onclick="_obBack()"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</button>' : '';
  var next = '<button class="ob-btn-p" onclick="_obNext()">'+(nextLabel||'Next')+'<svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  var skip = !required ? '<button class="ob-btn-skip" onclick="_obSkip()">Skip</button>' : '';
  return '<div class="ob-row">'+back+'<div class="ob-row-right">'+skip+next+'</div></div>';
}

// ── Form helpers ──────────────────────────────────────────────────────────────
function _obErr(el,msg){ if(!el)return; el.textContent=msg; el.classList.add('ob-err-show'); }
function _obClear(el) { if(!el)return; el.classList.remove('ob-err-show'); }
function _eyeIcon(open) {
  return open
    ? '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
}
function _obToggleEye(id,btn){
  var i=document.getElementById(id); if(!i)return;
  var open=i.type==='password'; i.type=open?'text':'password'; btn.innerHTML=_eyeIcon(open);
}

// ── Calendar Settings sheet (from Account) ────────────────────────────────────
function _obOpenCalSettings() {
  if (document.getElementById('ob-overlay')) return;
  var el = document.createElement('div'); el.id='ob-overlay';
  el.innerHTML = '<div id="ob-sheet"><div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>' +
    '<div id="ob-handle-zone"><div id="ob-handle"></div></div>' +
    '<button class="ob-x" onclick="_obCalClose()">\u00d7</button>' +
    '<div id="ob-cal-content"></div><div id="ob-cal-bottom"></div></div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obCalRender(0); _obInitDrag(el); });
}
var _obCalSubStep=0;
function _obCalRender(s){ _obCalSubStep=s; var fns=[_sCalSrc,_sCalIds,_sCalStyle,_sCalDone]; var r=fns[s]&&fns[s](); if(!r)return; var con=document.getElementById('ob-cal-content'),bot=document.getElementById('ob-cal-bottom'); if(!con||!bot)return; con.classList.remove('ob-slide'); con.innerHTML=r.c;bot.innerHTML=r.b; void con.offsetWidth;con.classList.add('ob-slide'); }
function _sCalSrc(){ var d=_obLoad(),src=d.calSource||'api'; return {c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots"><div class="ob-dot ob-dot-on"></div><div class="ob-dot"></div><div class="ob-dot"></div></div></div><h2 class="ob-h2">Source</h2>'+_srcBtn('api',src==='api','&#128273;','Google API','API key + Calendar ID.')+_srcBtn('ical',src==='ical','&#128241;','iCal Link','No API key needed.')+'</div>', b:'<div class="ob-row"><div class="ob-row-right"><button class="ob-btn-p" onclick="_obCalNext()">Next <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'}; }
function _sCalIds(){ var d=_obLoad(),src=d.calSource||'api'; if(src==='ical'){return{c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots"><div class="ob-dot"></div><div class="ob-dot ob-dot-on"></div><div class="ob-dot"></div></div></div><h2 class="ob-h2">iCal URLs</h2><div class="ob-field"><label class="ob-lbl">CALENDAR 1 *</label><input type="url" id="ob-cs-ical0" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal1Ical||'')+'"/><div class="ob-err" id="ob-cs-ical0-err"></div></div><div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 2 <span class="ob-opt">optional</span></label><input type="url" id="ob-cs-ical1" class="ob-inp ob-mono" placeholder="webcal://\u2026" value="'+_obEsc(d.cal2Ical||'')+'"/></div></div>',b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obCalRender(0)"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Back</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obCalNext()">Next <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'};} var d2=_obLoad(); return{c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots"><div class="ob-dot"></div><div class="ob-dot ob-dot-on"></div><div class="ob-dot"></div></div></div><h2 class="ob-h2">Calendars</h2><div class="ob-field"><label class="ob-lbl">API KEY *</label><div class="ob-inp-wrap"><input type="password" id="ob-cs-api" class="ob-inp" placeholder="AIzaSy\u2026" value="'+_obEsc(d2.apiKey||'')+'"/><button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-cs-api\',this)">'+_eyeIcon(false)+'</button></div><div class="ob-err" id="ob-cs-api-err"></div></div><div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 1 *</label><input type="text" id="ob-cs-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d2.calendars&&d2.calendars[0])||'')+'"/><div class="ob-err" id="ob-cs-cal0-err"></div></div><div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 2 <span class="ob-opt">optional</span></label><input type="text" id="ob-cs-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d2.calendars&&d2.calendars[1])||'')+'"/></div></div>',b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obCalRender(0)"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Back</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obCalNext()">Next <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'}; }
function _sCalStyle(){ var d=_obLoad(),p=d.cal1Preset||'ecam',c=d.cal1Color||'blue',c2=d.cal2Color||'lime'; return{c:'<div class="ob-form"><div class="ob-step-row"><div class="ob-dots"><div class="ob-dot"></div><div class="ob-dot"></div><div class="ob-dot ob-dot-on"></div></div></div><h2 class="ob-h2">Colours</h2><p class="ob-p2">Calendar 1 style:</p>'+_srcBtn2('ecam',p==='ecam','&#127979;','ECAM Preset','Auto colour by subject.')+_srcBtn2('none',p==='none','&#128288;','Single colour','All events same colour.')+'<div id="ob-cs-col1" style="'+(p==='none'?'margin-top:10px':'display:none;margin-top:10px')+'"><label class="ob-lbl" style="display:block;margin-bottom:8px">CAL 1 COLOUR</label>'+_obColorGrid('ob-csg1',c,'_obPickCal1Color')+'</div><p class="ob-p2" style="margin-top:14px">Calendar 2 colour:</p>'+_obColorGrid('ob-csg2',c2,'_obPickCal2Color')+'</div>',b:'<div class="ob-row"><button class="ob-btn-g" onclick="_obCalRender(1)"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Back</button><div class="ob-row-right"><button class="ob-btn-p" onclick="_obCalNext()">Save <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></div></div>'}; }
function _sCalDone(){ return{c:'<div class="ob-done"><div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div><div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div><h2 class="ob-done-h">Saved!</h2><p class="ob-p2">Refreshing your calendar.</p></div>',b:'<button class="ob-btn-p ob-btn-full" onclick="_obCalFinish()">Done</button>'}; }
function _obCalNext(){
  var d=_obLoad(),src=d.calSource||'api';
  if(_obCalSubStep===0){_obCalRender(1);return;}
  if(_obCalSubStep===1){
    if(src==='ical'){var u=((document.getElementById('ob-cs-ical0')||{}).value||'').trim();var eu=document.getElementById('ob-cs-ical0-err');if(!u){_obErr(eu,'iCal URL required.');return;}_obClear(eu);d.cal1Ical=u;var u2=((document.getElementById('ob-cs-ical1')||{}).value||'').trim();if(u2)d.cal2Ical=u2;_obSave(d);}
    else{var vk=((document.getElementById('ob-cs-api')||{}).value||'').trim();var ek=document.getElementById('ob-cs-api-err');if(!vk){_obErr(ek,'API key required.');return;}if(!vk.startsWith('AIza')){_obErr(ek,'Should start with "AIza".');return;}_obClear(ek);var v0=((document.getElementById('ob-cs-cal0')||{}).value||'').trim();var e0=document.getElementById('ob-cs-cal0-err');if(!v0){_obErr(e0,'Calendar ID required.');return;}if(!v0.includes('@')){_obErr(e0,'Must contain @.');return;}_obClear(e0);d.apiKey=vk;d.calendars=[v0];var v1=((document.getElementById('ob-cs-cal1')||{}).value||'').trim();if(v1&&v1.includes('@'))d.calendars.push(v1);_obSave(d);}
    _obCalRender(2);return;
  }
  _obCalRender(3);
}
function _obCalClose(){var o=document.getElementById('ob-overlay');if(o){o.classList.add('ob-out');setTimeout(function(){o.remove();},380);}}
function _obCalFinish(){_obCalClose();setTimeout(function(){if(typeof awInit==='function')awInit();},300);}

// Also handle preset change in cal settings
var _origPickPreset = _obPickPreset;
(function(){
  var orig = _obPickPreset;
  _obPickPreset = function(val,btn){
    orig(val,btn);
    // Also update the cal settings sheet colour row if present
    var cs=document.getElementById('ob-cs-col1');if(cs)cs.style.display=(val==='none'?'':'none');
  };
})();

// ── Inject CSS ────────────────────────────────────────────────────────────────
(function(){
  if (document.getElementById('ob-css')) return;
  var s = document.createElement('style'); s.id = 'ob-css';
  s.textContent = `
#ob-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;
  background:rgba(0,0,0,.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity .25s}
#ob-overlay.ob-in{opacity:1}
#ob-overlay.ob-out{opacity:0;pointer-events:none}
#ob-sheet{position:relative;width:100%;background:#0d1017;border-radius:26px 26px 0 0;
  border-top:1px solid rgba(255,255,255,.11);min-height:65vh;max-height:95dvh;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 -20px 60px rgba(0,0,0,.7);
  transform:translateY(60px);transition:transform .38s cubic-bezier(.32,1.2,.45,1);will-change:transform}
#ob-overlay.ob-in #ob-sheet{transform:translateY(0)}
@media(prefers-color-scheme:light){#ob-sheet{background:#f2f2f7;border-top-color:rgba(0,0,0,.06)}}
#ob-handle-zone{width:100%;padding:10px 0 4px;cursor:grab;flex-shrink:0;display:flex;align-items:center;justify-content:center;touch-action:none}
#ob-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.22)}
@media(prefers-color-scheme:light){#ob-handle{background:rgba(0,0,0,.16)}}
.ob-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}
.ob-orb1,.ob-orb2{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18}
.ob-orb1{width:300px;height:300px;background:#3b82f6;top:-80px;right:-60px;animation:orb 9s ease-in-out infinite}
.ob-orb2{width:220px;height:220px;background:#6366f1;bottom:60px;left:-40px;animation:orb 13s ease-in-out infinite reverse}
@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(12px,10px)}}
@media(prefers-color-scheme:light){.ob-orb1,.ob-orb2{opacity:.06}}
.ob-x{position:absolute;top:18px;right:16px;z-index:10;width:28px;height:28px;border-radius:50%;
  background:rgba(255,255,255,.08);border:none;cursor:pointer;color:rgba(255,255,255,.45);
  display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;transition:background .15s}
.ob-x:hover{background:rgba(255,255,255,.14)}
@media(prefers-color-scheme:light){.ob-x{background:rgba(0,0,0,.06);color:rgba(0,0,0,.4)}}
#ob-content,#ob-cal-content{flex:1;overflow-y:auto;padding:20px 22px 4px;-webkit-overflow-scrolling:touch;position:relative;z-index:1}
#ob-bottom,#ob-cal-bottom{padding:10px 22px calc(env(safe-area-inset-bottom,0px) + 12px);position:relative;z-index:1;flex-shrink:0}
.ob-slide{animation:obslide .22s cubic-bezier(.25,.8,.25,1) both}
@keyframes obslide{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
.ob-step-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ob-dots{display:flex;gap:5px;align-items:center}
.ob-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .2s}
.ob-dot.ob-dot-on{width:18px;border-radius:3px;background:#3b82f6}
@media(prefers-color-scheme:light){.ob-dot{background:rgba(0,0,0,.14)}.ob-dot.ob-dot-on{background:#007aff}}
.ob-opt-badge{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(255,255,255,.4);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);padding:2px 8px;border-radius:99px}
@media(prefers-color-scheme:light){.ob-opt-badge{color:rgba(0,0,0,.4);background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.08)}}
.ob-hero{display:flex;flex-direction:column;align-items:flex-start;padding-top:4px}
.ob-logo-wrap{width:52px;height:52px;border-radius:14px;overflow:hidden;margin-bottom:18px;box-shadow:0 4px 18px rgba(59,130,246,.4)}
.ob-logo-wrap svg{width:100%;height:100%;display:block}
.ob-h1{font-size:34px;font-weight:800;line-height:1.1;letter-spacing:-.04em;color:rgba(255,255,255,.92);margin:0 0 10px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-h1 em{font-style:normal;background:linear-gradient(135deg,#60a5fa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
@media(prefers-color-scheme:light){.ob-h1{color:rgba(0,0,0,.88)}}
.ob-p{font-size:15px;color:rgba(255,255,255,.46);margin:0 0 22px;line-height:1.55}
@media(prefers-color-scheme:light){.ob-p{color:rgba(0,0,0,.48)}}
.ob-feats{display:flex;flex-direction:column;gap:10px;width:100%}
.ob-feat{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,.62)}
.ob-feat span{font-size:18px;width:26px;text-align:center;flex-shrink:0}
@media(prefers-color-scheme:light){.ob-feat{color:rgba(0,0,0,.62)}}
.ob-h2{font-size:26px;font-weight:800;line-height:1.12;letter-spacing:-.035em;color:rgba(255,255,255,.92);margin:0 0 6px;font-family:-apple-system,"SF Pro Display",sans-serif}
@media(prefers-color-scheme:light){.ob-h2{color:rgba(0,0,0,.88)}}
.ob-p2{font-size:14px;color:rgba(255,255,255,.44);margin:0 0 16px;line-height:1.5}
@media(prefers-color-scheme:light){.ob-p2{color:rgba(0,0,0,.48)}}
.ob-field{display:flex;flex-direction:column;gap:5px}
.ob-lbl{font-size:11px;font-weight:600;letter-spacing:.05em;color:rgba(255,255,255,.35)}
@media(prefers-color-scheme:light){.ob-lbl{color:rgba(0,0,0,.38)}}
.ob-opt{font-size:10px;font-weight:400;letter-spacing:0;text-transform:none;color:rgba(255,255,255,.28)}
.ob-inp-wrap{position:relative;display:flex;align-items:center}
.ob-inp{width:100%;padding:13px 44px 13px 14px;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.1);border-radius:12px;color:rgba(255,255,255,.88);
  font-size:15px;font-family:inherit;outline:none;-webkit-appearance:none;box-sizing:border-box;
  transition:border-color .18s,background .18s,box-shadow .18s}
.ob-inp:focus{border-color:#60a5fa;background:rgba(96,165,250,.08);box-shadow:0 0 0 3px rgba(96,165,250,.14)}
.ob-field>.ob-inp{padding:13px 14px}
.ob-mono{font-family:"SF Mono",ui-monospace,monospace;font-size:12.5px}
.ob-inp::placeholder{color:rgba(255,255,255,.2)}
@media(prefers-color-scheme:light){.ob-inp{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1);color:rgba(0,0,0,.88)}.ob-inp::placeholder{color:rgba(0,0,0,.22)}.ob-inp:focus{background:rgba(0,122,255,.06);border-color:#007aff;box-shadow:0 0 0 3px rgba(0,122,255,.1)}}
.ob-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.32);padding:4px;display:flex;align-items:center;transition:color .15s}
.ob-eye:hover{color:rgba(255,255,255,.62)}
.ob-err{font-size:12px;color:#ff453a;max-height:0;overflow:hidden;transition:max-height .2s}
.ob-err.ob-err-show{max-height:36px;margin-top:3px}
.ob-details{margin-top:14px;border-radius:11px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);overflow:hidden}
@media(prefers-color-scheme:light){.ob-details{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.06)}}
.ob-details summary.ob-hint-t{font-size:13px;font-weight:500;color:rgba(255,255,255,.55);padding:11px 14px;cursor:pointer;list-style:none;user-select:none}
.ob-details summary.ob-hint-t::-webkit-details-marker{display:none}
@media(prefers-color-scheme:light){.ob-details summary.ob-hint-t{color:rgba(0,0,0,.52)}}
.ob-hint-l{margin:0;padding:0 14px 12px 28px;color:rgba(255,255,255,.4);font-size:12.5px;line-height:1.9}
.ob-hint-l strong{color:rgba(255,255,255,.65)} .ob-hint-l em{color:rgba(96,165,250,.9);font-style:normal}
@media(prefers-color-scheme:light){.ob-hint-l{color:rgba(0,0,0,.44)}.ob-hint-l strong{color:rgba(0,0,0,.72)}}
/* Source / preset buttons */
.ob-src-btn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;
  border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);
  color:rgba(255,255,255,.85);font-family:inherit;cursor:pointer;text-align:left;width:100%;
  -webkit-tap-highlight-color:transparent;transition:all .15s;margin-bottom:8px}
.ob-src-btn:last-child{margin-bottom:0}
.ob-src-btn:active{transform:scale(.98)}
.ob-src-btn.ob-src-on{border-color:#3b82f6;background:rgba(59,130,246,.12)}
@media(prefers-color-scheme:light){.ob-src-btn{border-color:rgba(0,0,0,.1);background:rgba(0,0,0,.04);color:rgba(0,0,0,.8)}.ob-src-btn.ob-src-on{border-color:#007aff;background:rgba(0,122,255,.08)}}
.ob-src-ico{font-size:22px;flex-shrink:0;width:30px;text-align:center}
.ob-src-body{flex:1;min-width:0}
.ob-src-title{font-size:14px;font-weight:600;margin-bottom:2px}
.ob-src-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.4}
@media(prefers-color-scheme:light){.ob-src-sub{color:rgba(0,0,0,.45)}}
.ob-src-chk{font-size:15px;color:#3b82f6;font-weight:700;flex-shrink:0;width:20px;text-align:center}
/* Colour grid */
.ob-cg{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.ob-cb{width:30px;height:30px;border-radius:50%;border:2px solid transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  -webkit-tap-highlight-color:transparent;transition:transform .12s,border-color .12s}
.ob-cb:active{transform:scale(.88)}
.ob-cb.ob-cb-on{border-color:#fff;transform:scale(1.15)}
@media(prefers-color-scheme:light){.ob-cb.ob-cb-on{border-color:rgba(0,0,0,.5)}}
/* Subject rows */
.ob-subj-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
/* Avatar */
.ob-avatar-row{display:flex;align-items:center;gap:16px;margin-bottom:4px}
.ob-avatar-preview{width:72px;height:72px;border-radius:50%;flex-shrink:0;overflow:hidden;
  background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);
  display:flex;align-items:center;justify-content:center}
@media(prefers-color-scheme:light){.ob-avatar-preview{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1)}}
.ob-av-placeholder{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:rgba(255,255,255,.3)}
@media(prefers-color-scheme:light){.ob-av-placeholder{color:rgba(0,0,0,.28)}}
.ob-avatar-btns{display:flex;flex-direction:column;gap:8px}
.ob-btn-av{display:inline-flex;align-items:center;justify-content:center;padding:9px 16px;
  border-radius:10px;border:none;cursor:pointer;font-size:13px;font-weight:500;font-family:inherit;
  background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);-webkit-tap-highlight-color:transparent;transition:background .15s}
.ob-btn-av:active{background:rgba(255,255,255,.14)}
.ob-btn-av-del{background:rgba(255,69,58,.12);color:#ff453a}
@media(prefers-color-scheme:light){.ob-btn-av{background:rgba(0,0,0,.06);color:rgba(0,0,0,.6)}.ob-btn-av-del{background:rgba(255,59,48,.1);color:#ff3b30}}
/* Prefs */
.ob-pref-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid rgba(255,255,255,.08)}
.ob-pref-row:last-child{border-bottom:none}
.ob-pref-ico{font-size:22px;flex-shrink:0;width:30px;text-align:center}
.ob-pref-label{flex:1;font-size:15px;font-weight:500;color:rgba(255,255,255,.88)}
@media(prefers-color-scheme:light){.ob-pref-label{color:rgba(0,0,0,.8)}}
.ob-pref-btns{display:flex;gap:6px;flex-shrink:0}
.ob-pref-btn{padding:6px 14px;border-radius:99px;border:.5px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.07);color:rgba(255,255,255,.55);font-size:13px;font-weight:500;
  font-family:inherit;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent}
.ob-pref-btn.ob-pref-on{background:var(--tint,#0a84ff);border-color:transparent;color:#fff;box-shadow:0 2px 10px rgba(10,132,255,.4)}
/* Done */
.ob-done{display:flex;flex-direction:column;align-items:center;padding:28px 0 16px}
.ob-check-wrap{position:relative;width:88px;height:88px;margin-bottom:24px}
.ob-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(99,102,241,.4);animation:ob-ring 2.5s ease-out infinite}
.ob-ring.r2{animation-delay:.55s;border-color:rgba(59,130,246,.3)}
@keyframes ob-ring{0%{transform:scale(.88);opacity:.7}100%{transform:scale(1.55);opacity:0}}
.ob-check-circle{position:absolute;inset:10px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(99,102,241,.5)}
.ob-check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:ob-draw .5s .2s ease forwards}
@keyframes ob-draw{to{stroke-dashoffset:0}}
.ob-done-h{font-size:28px;font-weight:800;letter-spacing:-.035em;color:rgba(255,255,255,.92);margin:0 0 6px;font-family:-apple-system,"SF Pro Display",sans-serif}
@media(prefers-color-scheme:light){.ob-done-h{color:rgba(0,0,0,.88)}}
/* Buttons */
.ob-btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:14px 22px;
  border-radius:13px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;
  background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;box-shadow:0 4px 16px rgba(99,102,241,.3);
  flex:1;-webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .15s}
.ob-btn-p:active{transform:scale(.97)}
.ob-btn-p.ob-btn-full{width:100%}
.ob-btn-g{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:14px 16px;
  border-radius:13px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;
  background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);flex-shrink:0;
  -webkit-tap-highlight-color:transparent;transition:transform .1s}
.ob-btn-g:active{transform:scale(.97)}
@media(prefers-color-scheme:light){.ob-btn-g{background:rgba(0,0,0,.07);color:rgba(0,0,0,.58)}}
.ob-btn-skip{background:none;border:none;cursor:pointer;font-size:14px;font-weight:500;
  color:rgba(255,255,255,.32);font-family:inherit;padding:14px 10px;-webkit-tap-highlight-color:transparent;transition:color .15s}
.ob-btn-skip:hover{color:rgba(255,255,255,.55)}
@media(prefers-color-scheme:light){.ob-btn-skip{color:rgba(0,0,0,.32)}}
.ob-row{display:flex;align-items:center;gap:8px}
.ob-row-right{display:flex;align-items:center;gap:6px;margin-left:auto}
.ob-legal{font-size:11.5px;color:rgba(255,255,255,.22);text-align:center;margin:10px 0 0}
@media(prefers-color-scheme:light){.ob-legal{color:rgba(0,0,0,.26)}}
`;
  document.head.appendChild(s);
})();
