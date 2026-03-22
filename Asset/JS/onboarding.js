/*
  Calendar by Shortcut™ — Onboarding & Settings
  © 2026 Ogust'1
*/

function _obSave(d)  { localStorage.setItem('shortcut_config', JSON.stringify(d)); }
function _obLoad()   { try { return JSON.parse(localStorage.getItem('shortcut_config')||'null')||{}; } catch(e){ return {}; } }

var _obStep = 0;

function showOnboarding() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 0;
  var el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML = [
    '<div id="ob-sheet">',
    '<div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>',
    '<div id="ob-content"></div>',
    '<div id="ob-bottom"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obRender(); });
}

function showSettings() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 1;
  var el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML = [
    '<div id="ob-sheet">',
    '<div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>',
    '<div id="ob-content"></div>',
    '<div id="ob-bottom"></div>',
    '<button class="ob-x" onclick="document.getElementById(\'ob-overlay\').remove()">×</button>',
    '</div>'
  ].join('');
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obRender(); });
}

function _obRender() {
  var con = document.getElementById('ob-content');
  var bot = document.getElementById('ob-bottom');
  if (!con||!bot) return;
  con.classList.remove('ob-slide');
  var steps = [_s0, _s1, _s2, _s3];
  var r = steps[_obStep]();
  con.innerHTML = r.c; bot.innerHTML = r.b;
  void con.offsetWidth; con.classList.add('ob-slide');
  setTimeout(function(){ var i=con.querySelector('input'); if(i) i.focus(); }, 300);
}

function _obNext() {
  if (!_obValidate()) return;
  if (_obStep < 3) { _obStep++; _obRender(); }
}
function _obBack() {
  if (_obStep > 0) { _obStep--; _obRender(); }
}

// Step 0 — Welcome
function _s0() {
  return {
    c: '<div class="ob-hero">' +
       '<div class="ob-logo-wrap"><svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="13" fill="url(#og)"/><path d="M28 9L17 26h11L19 39l15-19H23L28 9z" fill="white" opacity=".95"/><defs><linearGradient id="og" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg></div>' +
       '<h1 class="ob-h1">Calendar<br><em>by Shortcut™</em></h1>' +
       '<p class="ob-p">Your ECAM schedule, always with you. Set up in 2 minutes — your data stays on your device.</p>' +
       '<div class="ob-feats">' +
         '<div class="ob-feat"><span>📅</span>Agenda &amp; day grid</div>' +
         '<div class="ob-feat"><span>🔔</span>Live class tracking</div>' +
         '<div class="ob-feat"><span>🔒</span>Keys stored locally</div>' +
         '<div class="ob-feat"><span>📴</span>Works offline</div>' +
       '</div></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obNext()">Set up · 2 min <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
       '<p class="ob-legal">No data is sent to our servers.</p>'
  };
}

// Step 1 — API Key
function _s1() {
  var saved = _obLoad().apiKey || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-badge">Step 1 of 2</div>' +
       '<h2 class="ob-h2">Google Calendar<br>API Key</h2>' +
       '<p class="ob-p2">You need a Google API key to access your calendars.</p>' +
       '<div class="ob-field"><label class="ob-lbl">API KEY</label>' +
       '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy…" value="'+_obEsc(saved)+'" autocomplete="off" spellcheck="false"/>' +
       '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg></button>' +
       '</div><div class="ob-err" id="ob-apikey-err"></div></div>' +
       '<div class="ob-hint"><div class="ob-hint-t">💡 How to get an API key</div><ol class="ob-hint-l">' +
       '<li>Go to <strong>console.cloud.google.com</strong></li>' +
       '<li>Create project → APIs &amp; Services → Credentials</li>' +
       '<li>Create API Key → restrict to <em>Google Calendar API</em></li>' +
       '</ol></div></div>',
    b: '<div class="ob-row">' +
       '<button class="ob-btn-g" onclick="_obBack()"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button>' +
       '<button class="ob-btn-p" onclick="_obNext()">Next <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
       '</div>'
  };
}

// Step 2 — Calendars
function _s2() {
  var saved = _obLoad();
  var c0 = (saved.calendars&&saved.calendars[0])||'';
  var c1 = (saved.calendars&&saved.calendars[1])||'';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-badge">Step 2 of 2</div>' +
       '<h2 class="ob-h2">Your Google<br>Calendars</h2>' +
       '<p class="ob-p2">Add your main calendar ID. A second one is optional.</p>' +
       '<div class="ob-field"><label class="ob-lbl">PRIMARY CALENDAR <span style="color:var(--red)">*</span></label>' +
       '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc(c0)+'" autocomplete="off" spellcheck="false"/>' +
       '<div class="ob-err" id="ob-cal0-err"></div></div>' +
       '<div class="ob-field" style="margin-top:12px"><label class="ob-lbl">SECONDARY CALENDAR <span style="color:var(--faint);font-size:10px">optional</span></label>' +
       '<input type="text" id="ob-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc(c1)+'" autocomplete="off" spellcheck="false"/>' +
       '</div>' +
       '<div class="ob-hint"><div class="ob-hint-t">💡 Where to find the Calendar ID</div><ol class="ob-hint-l">' +
       '<li>Open <strong>Google Calendar</strong> on desktop</li>' +
       '<li>⚙️ Settings → your calendar → <em>Integrate calendar</em></li>' +
       '<li>Copy the <strong>Calendar ID</strong></li>' +
       '</ol></div></div>',
    b: '<div class="ob-row">' +
       '<button class="ob-btn-g" onclick="_obBack()"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Back</button>' +
       '<button class="ob-btn-p" onclick="_obNext()">Finish <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
       '</div>'
  };
}

// Step 3 — Done
function _s3() {
  return {
    c: '<div class="ob-done">' +
       '<div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div>' +
       '<div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
       '<h2 class="ob-done-h">You\'re all set!</h2>' +
       '<p class="ob-p2">Your calendar is loading now.</p></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obFinish()">Open Calendar <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
  };
}

function _obValidate() {
  if (_obStep===0) return true;
  if (_obStep===1) {
    var v = (document.getElementById('ob-apikey')||{}).value||'';
    v = v.trim();
    var e = document.getElementById('ob-apikey-err');
    if (!v)                { _obErr(e,'API key is required.'); return false; }
    if (!v.startsWith('AIza')) { _obErr(e,'Invalid format — should start with "AIza".'); return false; }
    _obClear(e);
    var d=_obLoad(); d.apiKey=v; _obSave(d);
    return true;
  }
  if (_obStep===2) {
    var v0El=document.getElementById('ob-cal0');
    var v1El=document.getElementById('ob-cal1');
    var v0=v0El?v0El.value.trim():'', v1=v1El?v1El.value.trim():'';
    var e0=document.getElementById('ob-cal0-err');
    if (!v0)          { _obErr(e0,'Primary calendar ID is required.'); return false; }
    if (!v0.includes('@')){ _obErr(e0,'Invalid — must contain an @.'); return false; }
    _obClear(e0);
    var d=_obLoad(); d.calendars=[v0]; if(v1&&v1.includes('@')) d.calendars.push(v1);
    _obSave(d);
    return true;
  }
  return true;
}

function _obErr(el,msg)  { if(!el)return; el.textContent=msg; el.classList.add('ob-err-show'); var i=el.closest&&el.closest('.ob-field')?el.closest('.ob-field').querySelector('input'):null; if(i)i.style.borderColor='#ff453a'; }
function _obClear(el)    { if(!el)return; el.classList.remove('ob-err-show'); var i=el.closest&&el.closest('.ob-field')?el.closest('.ob-field').querySelector('input'):null; if(i)i.style.borderColor=''; }
function _obEsc(s)       { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function _obToggleEye(id,btn) {
  var i=document.getElementById(id); if(!i)return;
  i.type=i.type==='password'?'text':'password';
  btn.innerHTML=i.type==='text'
    ?'<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    :'<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
}

function _obFinish() {
  var o=document.getElementById('ob-overlay');
  if(o){ o.classList.add('ob-out'); setTimeout(function(){ o.remove(); },400); }
  setTimeout(function(){ if(typeof awInit==='function') awInit(); },300);
}

// Inject CSS
(function(){
  if(document.getElementById('ob-css')) return;
  var s=document.createElement('style'); s.id='ob-css';
  s.textContent=`
#ob-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;
  background:rgba(0,0,0,.5);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
  opacity:0;transition:opacity .28s}
#ob-overlay.ob-in{opacity:1}
#ob-overlay.ob-out{opacity:0;pointer-events:none}
#ob-sheet{position:relative;width:100%;
  background:#0d1017;border-radius:28px 28px 0 0;
  border-top:1px solid rgba(255,255,255,.12);
  min-height:70vh;max-height:96dvh;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 -20px 60px rgba(0,0,0,.7);
  transform:translateY(50px);transition:transform .4s cubic-bezier(.32,1.2,.45,1)}
#ob-overlay.ob-in #ob-sheet{transform:translateY(0)}
@media(prefers-color-scheme:light){#ob-sheet{background:#f2f2f7;border-top-color:rgba(255,255,255,.9)}}
.ob-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:inherit}
.ob-orb1,.ob-orb2{position:absolute;border-radius:50%;filter:blur(70px);opacity:.2}
.ob-orb1{width:280px;height:280px;background:#3b82f6;top:-60px;right:-40px;animation:orb 9s ease-in-out infinite}
.ob-orb2{width:200px;height:200px;background:#6366f1;bottom:40px;left:-30px;animation:orb 12s ease-in-out infinite reverse}
@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(15px,12px)}}
@media(prefers-color-scheme:light){.ob-orb1,.ob-orb2{opacity:.07}}
#ob-content{flex:1;overflow-y:auto;padding:28px 22px 8px;-webkit-overflow-scrolling:touch;position:relative;z-index:1}
#ob-bottom{padding:12px 22px 0;position:relative;z-index:1;flex-shrink:0}
.ob-slide{animation:slide .28s cubic-bezier(.25,.8,.25,1) both}
@keyframes slide{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
.ob-x{position:absolute;top:14px;right:14px;z-index:10;width:28px;height:28px;border-radius:50%;
  background:rgba(255,255,255,.08);border:none;cursor:pointer;color:rgba(255,255,255,.5);
  display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;transition:background .15s}
.ob-x:hover{background:rgba(255,255,255,.14)}
@media(prefers-color-scheme:light){.ob-x{background:rgba(0,0,0,.06);color:rgba(0,0,0,.4)}}

/* Hero */
.ob-hero{display:flex;flex-direction:column;align-items:flex-start}
.ob-logo-wrap{width:48px;height:48px;border-radius:13px;overflow:hidden;margin-bottom:20px;box-shadow:0 4px 16px rgba(59,130,246,.4)}
.ob-logo-wrap svg{width:100%;height:100%;display:block}
.ob-h1{font-size:36px;font-weight:800;line-height:1.1;letter-spacing:-.04em;color:rgba(255,255,255,.92);margin:0 0 12px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-h1 em{font-style:normal;background:linear-gradient(135deg,#60a5fa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
@media(prefers-color-scheme:light){.ob-h1{color:rgba(0,0,0,.88)}}
.ob-p{font-size:15px;color:rgba(255,255,255,.48);margin:0 0 24px;line-height:1.55}
@media(prefers-color-scheme:light){.ob-p{color:rgba(0,0,0,.50)}}
.ob-feats{display:flex;flex-direction:column;gap:9px}
.ob-feat{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,.65)}
.ob-feat span{font-size:18px;width:26px;text-align:center;flex-shrink:0}
@media(prefers-color-scheme:light){.ob-feat{color:rgba(0,0,0,.65)}}

/* Form */
.ob-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
  color:#60a5fa;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.25);
  padding:3px 9px;border-radius:99px;margin-bottom:14px}
.ob-h2{font-size:28px;font-weight:800;line-height:1.15;letter-spacing:-.03em;color:rgba(255,255,255,.92);margin:0 0 8px;font-family:-apple-system,"SF Pro Display",sans-serif}
@media(prefers-color-scheme:light){.ob-h2{color:rgba(0,0,0,.88)}}
.ob-p2{font-size:14px;color:rgba(255,255,255,.45);margin:0 0 20px}
@media(prefers-color-scheme:light){.ob-p2{color:rgba(0,0,0,.50)}}
.ob-field{display:flex;flex-direction:column;gap:5px}
.ob-lbl{font-size:11px;font-weight:600;letter-spacing:.05em;color:rgba(255,255,255,.38)}
@media(prefers-color-scheme:light){.ob-lbl{color:rgba(0,0,0,.40)}}
.ob-inp-wrap{position:relative;display:flex;align-items:center}
.ob-inp{width:100%;padding:13px 44px 13px 14px;background:rgba(255,255,255,.07);
  border:1.5px solid rgba(255,255,255,.11);border-radius:12px;
  color:rgba(255,255,255,.88);font-size:15px;font-family:inherit;outline:none;
  -webkit-appearance:none;box-sizing:border-box;
  user-select:text;-webkit-user-select:text;
  transition:border-color .18s,background .18s,box-shadow .18s}
.ob-inp:focus{border-color:#60a5fa;background:rgba(96,165,250,.08);box-shadow:0 0 0 3px rgba(96,165,250,.15)}
.ob-field>.ob-inp{padding:13px 14px}
.ob-mono{font-family:"SF Mono",ui-monospace,monospace;font-size:12.5px}
.ob-inp::placeholder{color:rgba(255,255,255,.22)}
@media(prefers-color-scheme:light){
  .ob-inp{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1);color:rgba(0,0,0,.88)}
  .ob-inp::placeholder{color:rgba(0,0,0,.25)}
  .ob-inp:focus{background:rgba(0,122,255,.06);border-color:#007aff;box-shadow:0 0 0 3px rgba(0,122,255,.12)}}
.ob-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);padding:4px;display:flex;align-items:center;transition:color .15s}
.ob-eye:hover{color:rgba(255,255,255,.65)}
.ob-err{font-size:12px;color:#ff453a;max-height:0;overflow:hidden;transition:max-height .2s}
.ob-err.ob-err-show{max-height:36px;margin-top:3px}
.ob-hint{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px;margin-top:16px}
@media(prefers-color-scheme:light){.ob-hint{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.07)}}
.ob-hint-t{font-size:12.5px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:6px}
@media(prefers-color-scheme:light){.ob-hint-t{color:rgba(0,0,0,.55)}}
.ob-hint-l{margin:0;padding-left:16px;color:rgba(255,255,255,.42);font-size:12px;line-height:1.8}
.ob-hint-l strong{color:rgba(255,255,255,.65)}
.ob-hint-l em{color:rgba(96,165,250,.85);font-style:normal}
@media(prefers-color-scheme:light){.ob-hint-l{color:rgba(0,0,0,.45)}.ob-hint-l strong{color:rgba(0,0,0,.7)}}

/* Done */
.ob-done{display:flex;flex-direction:column;align-items:center;padding:24px 0}
.ob-check-wrap{position:relative;width:88px;height:88px;margin-bottom:24px}
.ob-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(99,102,241,.4);animation:ring 2.5s ease-out infinite}
.ob-ring.r2{animation-delay:.5s;border-color:rgba(59,130,246,.3)}
@keyframes ring{0%{transform:scale(.9);opacity:.7}100%{transform:scale(1.5);opacity:0}}
.ob-check-circle{position:absolute;inset:10px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 24px rgba(99,102,241,.5)}
.ob-check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:draw .5s .2s ease forwards}
@keyframes draw{to{stroke-dashoffset:0}}
.ob-done-h{font-size:26px;font-weight:800;letter-spacing:-.03em;color:rgba(255,255,255,.92);margin:0 0 6px}
@media(prefers-color-scheme:light){.ob-done-h{color:rgba(0,0,0,.88)}}

/* Buttons */
.ob-btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:14px 22px;border-radius:14px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;box-shadow:0 4px 16px rgba(99,102,241,.35);flex:1;-webkit-tap-highlight-color:transparent;transition:transform .1s,box-shadow .15s;user-select:none;-webkit-user-select:none}
.ob-btn-p:active{transform:scale(.97)}
.ob-btn-p.ob-btn-full{width:100%}
.ob-btn-g{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:14px 18px;border-radius:14px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:inherit;background:rgba(255,255,255,.07);color:rgba(255,255,255,.65);flex-shrink:0;-webkit-tap-highlight-color:transparent;transition:transform .1s;user-select:none;-webkit-user-select:none}
.ob-btn-g:active{transform:scale(.97)}
@media(prefers-color-scheme:light){.ob-btn-g{background:rgba(0,0,0,.07);color:rgba(0,0,0,.6)}}
.ob-row{display:flex;gap:10px}
.ob-legal{font-size:11.5px;color:rgba(255,255,255,.25);text-align:center;margin:10px 0 0}
@media(prefers-color-scheme:light){.ob-legal{color:rgba(0,0,0,.28)}}
`;
  document.head.appendChild(s);
})();
