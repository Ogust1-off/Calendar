/*
  Calendar by Shortcut™ — Onboarding & Settings
  © 2026 Ogust'1
*/

function _obSave(d)  { localStorage.setItem('shortcut_config', JSON.stringify(d)); }
function _obLoad()   { try { return JSON.parse(localStorage.getItem('shortcut_config')||'null')||{}; } catch(e){ return {}; } }

var _obStep = 0;
var _obIsSettings = false;

function showOnboarding() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 0; _obIsSettings = false;
  _obOpen();
}

function showSettings() {
  if (document.getElementById('ob-overlay')) return;
  _obStep = 1; _obIsSettings = true;
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
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obRender(); _obInitDrag(el); });
}

function _obInitDrag(overlay) {
  var sheet = overlay.querySelector('#ob-sheet');
  var handleZone = overlay.querySelector('#ob-handle-zone');
  if (!sheet || !handleZone) return;
  var startY = 0, curY = 0, dragging = false;
  var THRESHOLD = 120;

  function onStart(e) {
    dragging = true;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    curY = 0;
    sheet.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    var dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
    if (dy < 0) dy = 0;
    curY = dy;
    sheet.style.transform = 'translateY(' + dy + 'px)';
    var pct = Math.min(dy / THRESHOLD, 1);
    overlay.style.background = 'rgba(0,0,0,' + (0.52 * (1 - pct * 0.7)) + ')';
    if (e.cancelable) e.preventDefault();
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;
    sheet.style.transition = '';
    if (curY >= THRESHOLD) {
      sheet.style.transform = 'translateY(110%)';
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .25s';
      setTimeout(function() {
        overlay.remove();
        if (!_obIsSettings) {
          var cfg = _obLoad();
          if (!(cfg.apiKey && cfg.calendars && cfg.calendars[0])) {
            _obShowUnconfigured();
          }
        }
      }, 280);
    } else {
      sheet.style.transform = '';
      overlay.style.background = '';
    }
  }

  handleZone.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd, { passive: true });
  handleZone.addEventListener('mousedown', onStart);
  document.addEventListener('mousemove', function(e){ if(dragging) onMove(e); });
  document.addEventListener('mouseup', onEnd);
}

function _obClose() {
  var o = document.getElementById('ob-overlay');
  if (o) { o.classList.add('ob-out'); setTimeout(function(){ o.remove(); }, 380); }
}

function _obShowUnconfigured() {
  var c = document.getElementById('aw-compact');
  if (!c) return;
  var cfg = _obLoad ? _obLoad() : {};
  var lang = cfg.lang || 'en';
  var msg = lang === 'fr' ? "L\u2019agenda n\u2019est pas configur\u00e9." : 'Calendar not configured.';
  var btnTxt = lang === 'fr' ? 'Configurer' : 'Set up';
  c.innerHTML =
    '<div class="aw-state" style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:52px 24px">' +
    '<div style="font-size:48px;line-height:1">&#x1F4C5;</div>' +
    '<div style="font-size:16px;font-weight:600;color:var(--text);text-align:center">' + msg + '</div>' +
    '<button onclick="showOnboarding()" style="padding:13px 32px;border-radius:14px;border:none;cursor:pointer;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;font-size:15px;font-weight:600;font-family:inherit;box-shadow:0 4px 16px rgba(99,102,241,.35);">' + btnTxt + '</button>' +
    '</div>';
}

// Steps: 0=welcome, 1=API key, 2=calendars, 3=profile (optional), 4=done
var _OB_STEPS = 5;

function _obRender() {
  var con = document.getElementById('ob-content');
  var bot = document.getElementById('ob-bottom');
  if (!con || !bot) return;
  con.classList.remove('ob-slide');
  var fns = [_s0, _s1, _s2, _s3, _s4];
  var r = fns[_obStep]();
  con.innerHTML = r.c; bot.innerHTML = r.b;
  void con.offsetWidth; con.classList.add('ob-slide');
  setTimeout(function(){ var i = con.querySelector('input[type="text"],input[type="password"]'); if(i) i.focus(); }, 320);
}

function _obNext() {
  if (!_obValidate()) return;
  if (_obStep < _OB_STEPS - 1) { _obStep++; _obRender(); }
}
function _obBack() {
  if (_obStep > (_obIsSettings ? 1 : 0)) { _obStep--; _obRender(); }
}

// ── Step 0: Welcome ───────────────────────────────────────────────────────────
function _s0() {
  return {
    c: '<div class="ob-hero">' +
       '<div class="ob-logo-wrap"><svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="13" fill="url(#og)"/><path d="M28 9L17 26h11L19 39l15-19H23L28 9z" fill="white" opacity=".95"/><defs><linearGradient id="og" x1="0" y1="0" x2="48" y2="48"><stop stop-color="#3b82f6"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs></svg></div>' +
       '<h1 class="ob-h1">Calendar<br><em>by Shortcut™</em></h1>' +
       '<p class="ob-p">Your ECAM schedule, always with you. Set up in 2 minutes.</p>' +
       '<div class="ob-feats">' +
         '<div class="ob-feat"><span>📅</span>Agenda &amp; time grid</div>' +
         '<div class="ob-feat"><span>🔔</span>Live class tracking</div>' +
         '<div class="ob-feat"><span>🔒</span>Keys stored on device</div>' +
         '<div class="ob-feat"><span>📴</span>Works offline</div>' +
       '</div></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obNext()">Get started' +
       '<svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
       '<p class="ob-legal">Your data never leaves this device.</p>'
  };
}

// ── Step 1: API Key ───────────────────────────────────────────────────────────
function _s1() {
  var saved = _obLoad().apiKey || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(1) + '</div></div>' +
       '<h2 class="ob-h2">API Key</h2>' +
       '<p class="ob-p2">A Google API key to read your calendar.</p>' +
       '<div class="ob-field"><label class="ob-lbl">GOOGLE API KEY</label>' +
       '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy…" value="' + _obEsc(saved) + '" autocomplete="off" spellcheck="false"/>' +
       '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">' + _eyeIcon(false) + '</button></div>' +
       '<div class="ob-err" id="ob-apikey-err"></div></div>' +
       '<details class="ob-details"><summary class="ob-hint-t">💡 How to get an API key</summary>' +
       '<ol class="ob-hint-l"><li>Go to <strong>console.cloud.google.com</strong></li>' +
       '<li>New project → APIs &amp; Services → Credentials</li>' +
       '<li>Create API Key → restrict to <em>Google Calendar API</em></li></ol></details>' +
       '</div>',
    b: _obNavRow(true)
  };
}

// ── Step 2: Calendars ─────────────────────────────────────────────────────────
function _s2() {
  var saved = _obLoad(); var c0 = (saved.calendars&&saved.calendars[0])||''; var c1 = (saved.calendars&&saved.calendars[1])||'';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div></div>' +
       '<h2 class="ob-h2">Calendars</h2>' +
       '<p class="ob-p2">Add your calendar IDs from Google Calendar.</p>' +
       '<div class="ob-field"><label class="ob-lbl">PRIMARY CALENDAR <span style="color:var(--red)">*</span></label>' +
       '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc(c0) + '" autocomplete="off" spellcheck="false"/>' +
       '<div class="ob-err" id="ob-cal0-err"></div></div>' +
       '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">SECONDARY <span class="ob-opt">optional</span></label>' +
       '<input type="text" id="ob-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc(c1) + '" autocomplete="off" spellcheck="false"/></div>' +
       '<details class="ob-details"><summary class="ob-hint-t">💡 Where to find the Calendar ID</summary>' +
       '<ol class="ob-hint-l"><li>Open <strong>Google Calendar</strong> on desktop</li>' +
       '<li>⚙️ Settings → your calendar → <em>Integrate calendar</em></li>' +
       '<li>Copy the <strong>Calendar ID</strong></li></ol></details>' +
       '</div>',
    b: _obNavRow(true)
  };
}

// ── Step 3: Profile photo (optional) ─────────────────────────────────────────
function _s3() {
  var saved = _obLoad();
  var photo = saved.photo || '';
  var name  = saved.displayName || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(3) + '</div>' +
       '<span class="ob-opt-badge">Optional</span></div>' +
       '<h2 class="ob-h2">Your Profile</h2>' +
       '<p class="ob-p2">Personalise the app with your photo and name.</p>' +

       // Avatar picker
       '<div class="ob-avatar-row">' +
       '<div class="ob-avatar-preview" id="ob-av-preview">' +
         (photo
           ? '<img id="ob-av-img" src="' + _obEsc(photo) + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>'
           : '<div id="ob-av-img" class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>') +
       '</div>' +
       '<div class="ob-avatar-btns">' +
       '<label class="ob-btn-av" for="ob-av-input">Choose photo</label>' +
       '<input type="file" id="ob-av-input" accept="image/*" style="display:none" onchange="_obPickPhoto(this)"/>' +
       (photo ? '<button class="ob-btn-av ob-btn-av-del" onclick="_obRemovePhoto()">Remove</button>' : '') +
       '</div></div>' +

       // Display name
       '<div class="ob-field" style="margin-top:16px"><label class="ob-lbl">DISPLAY NAME</label>' +
       '<input type="text" id="ob-displayname" class="ob-inp" placeholder="e.g. Augustin" value="' + _obEsc(name) + '" autocomplete="given-name" spellcheck="false"/>' +
       '</div></div>',
    b: _obNavRow(false)
  };
}

// ── Step 4: Done ──────────────────────────────────────────────────────────────
function _s4() {
  return {
    c: '<div class="ob-done">' +
       '<div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div>' +
       '<div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
       '<h2 class="ob-done-h">You\'re all set!</h2>' +
       '<p class="ob-p2">Loading your schedule now.</p></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obFinish()">Open Calendar' +
       '<svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
  };
}

// ── Dot progress indicator ────────────────────────────────────────────────────
function _obDots(current) { // steps 1–3 have dots
  var out = '';
  for (var i=1; i<=3; i++) {
    out += '<div class="ob-dot' + (i===current?' ob-dot-on':'') + '"></div>';
  }
  return out;
}

function _obNavRow(required) {
  var skipLabel = required ? null : 'Skip';
  var nextLabel = required ? 'Next' : 'Save';
  var back = '<button class="ob-btn-g" onclick="_obBack()"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</button>';
  var next = '<button class="ob-btn-p" onclick="_obNext()">' + nextLabel + '<svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  var skip = skipLabel ? '<button class="ob-btn-skip" onclick="_obSkip()">' + skipLabel + '</button>' : '';
  return '<div class="ob-row">' + back + '<div class="ob-row-right">' + skip + next + '</div></div>';
}

// ── Validation ────────────────────────────────────────────────────────────────
function _obValidate() {
  if (_obStep===0) return true;
  if (_obStep===1) {
    var v = ((document.getElementById('ob-apikey')||{}).value||'').trim();
    var e = document.getElementById('ob-apikey-err');
    if (!v)             { _obErr(e,'API key is required.'); return false; }
    if (!v.startsWith('AIza')) { _obErr(e,'Should start with "AIza".'); return false; }
    _obClear(e);
    var d=_obLoad(); d.apiKey=v; _obSave(d); return true;
  }
  if (_obStep===2) {
    var v0 = ((document.getElementById('ob-cal0')||{}).value||'').trim();
    var v1 = ((document.getElementById('ob-cal1')||{}).value||'').trim();
    var e0 = document.getElementById('ob-cal0-err');
    if (!v0)             { _obErr(e0,'Primary calendar ID is required.'); return false; }
    if (!v0.includes('@')){ _obErr(e0,'Must contain an @.'); return false; }
    _obClear(e0);
    var d=_obLoad(); d.calendars=[v0]; if(v1&&v1.includes('@')) d.calendars.push(v1);
    _obSave(d); return true;
  }
  if (_obStep===3) { _obSaveProfile(); return true; }
  return true;
}

function _obSkip() {
  // Skip profile step — advance without saving photo/name
  if (_obStep < _OB_STEPS-1) { _obStep++; _obRender(); }
}

function _obSaveProfile() {
  var name = ((document.getElementById('ob-displayname')||{}).value||'').trim();
  var d = _obLoad();
  if (name) d.displayName = name;
  // Photo already saved by _obPickPhoto
  _obSave(d);
}

// ── Photo picker ──────────────────────────────────────────────────────────────
function _obPickPhoto(input) {
  var file = input.files[0]; if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var dataUrl = e.target.result;
    // Show preview
    var wrap = document.getElementById('ob-av-preview');
    if (wrap) wrap.innerHTML = '<img id="ob-av-img" src="' + dataUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    // Add remove button if not present
    var btns = document.querySelector('.ob-avatar-btns');
    if (btns && !btns.querySelector('.ob-btn-av-del')) {
      var del = document.createElement('button');
      del.className='ob-btn-av ob-btn-av-del';
      del.textContent='Remove';
      del.onclick=_obRemovePhoto;
      btns.appendChild(del);
    }
    // Save to config
    var d=_obLoad(); d.photo=dataUrl; _obSave(d);
    // Live update navbar + account
    if (typeof _applyProfile==='function') _applyProfile();
  };
  reader.readAsDataURL(file);
}

function _obRemovePhoto() {
  var d=_obLoad(); delete d.photo; _obSave(d);
  var wrap=document.getElementById('ob-av-preview');
  if (wrap) wrap.innerHTML='<div id="ob-av-img" class="ob-av-placeholder"><svg viewBox="0 0 24 24" fill="none" width="28" height="28"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></div>';
  var del=document.querySelector('.ob-btn-av-del'); if(del) del.remove();
  if (typeof _applyProfile==='function') _applyProfile();
}

// ── Finish ────────────────────────────────────────────────────────────────────
function _obFinish() {
  _obClose();
  setTimeout(function(){ if(typeof awInit==='function') awInit(); }, 300);
  setTimeout(function(){ if(typeof _applyProfile==='function') _applyProfile(); }, 350);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function _eyeIcon(open) {
  return open
    ? '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
}

function _obErr(el,msg)  { if(!el)return; el.textContent=msg; el.classList.add('ob-err-show'); var i=el.closest&&el.closest('.ob-field')?el.closest('.ob-field').querySelector('input'):null; if(i)i.style.borderColor='#ff453a'; }
function _obClear(el)    { if(!el)return; el.classList.remove('ob-err-show'); var i=el.closest&&el.closest('.ob-field')?el.closest('.ob-field').querySelector('input'):null; if(i)i.style.borderColor=''; }
function _obEsc(s)       { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }
function _obToggleEye(id,btn) {
  var i=document.getElementById(id); if(!i)return;
  var open=i.type==='password';
  i.type=open?'text':'password';
  btn.innerHTML=_eyeIcon(open);
}

// ── Inject CSS ────────────────────────────────────────────────────────────────
(function(){
  if(document.getElementById('ob-css')) return;
  var s=document.createElement('style'); s.id='ob-css';
  s.textContent=`
#ob-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;
  background:rgba(0,0,0,.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
  opacity:0;transition:opacity .25s}
#ob-overlay.ob-in{opacity:1}
#ob-overlay.ob-out{opacity:0;pointer-events:none}
#ob-sheet{position:relative;width:100%;
  background:#0d1017;border-radius:26px 26px 0 0;
  border-top:1px solid rgba(255,255,255,.11);
  min-height:68vh;max-height:95dvh;
  display:flex;flex-direction:column;overflow:hidden;
  box-shadow:0 -20px 60px rgba(0,0,0,.7);
  transform:translateY(60px);transition:transform .38s cubic-bezier(.32,1.2,.45,1);will-change:transform;}
#ob-overlay.ob-in #ob-sheet{transform:translateY(0)}
@media(prefers-color-scheme:light){#ob-sheet{background:#f2f2f7;border-top-color:rgba(0,0,0,.06)}}

/* Handle bar */
#ob-handle-zone{
  width:100%;padding:10px 0 4px;cursor:grab;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;touch-action:none;
}
#ob-handle-zone:active{cursor:grabbing}
#ob-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.22);}
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

#ob-content{flex:1;overflow-y:auto;padding:20px 22px 4px;-webkit-overflow-scrolling:touch;position:relative;z-index:1}
#ob-bottom{padding:10px 22px calc(env(safe-area-inset-bottom,0px) + 12px);position:relative;z-index:1;flex-shrink:0}
.ob-slide{animation:obslide .24s cubic-bezier(.25,.8,.25,1) both}
@keyframes obslide{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

/* Step dots */
.ob-step-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ob-dots{display:flex;gap:5px;align-items:center}
.ob-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);transition:all .2s}
.ob-dot.ob-dot-on{width:18px;border-radius:3px;background:#3b82f6}
@media(prefers-color-scheme:light){.ob-dot{background:rgba(0,0,0,.14)}.ob-dot.ob-dot-on{background:#007aff}}
.ob-opt-badge{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:rgba(255,255,255,.4);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  padding:2px 8px;border-radius:99px}
@media(prefers-color-scheme:light){.ob-opt-badge{color:rgba(0,0,0,.4);background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.08)}}

/* Hero */
.ob-hero{display:flex;flex-direction:column;align-items:flex-start;padding-top:4px}
.ob-logo-wrap{width:52px;height:52px;border-radius:14px;overflow:hidden;margin-bottom:18px;
  box-shadow:0 4px 18px rgba(59,130,246,.4)}
.ob-logo-wrap svg{width:100%;height:100%;display:block}
.ob-h1{font-size:36px;font-weight:800;line-height:1.08;letter-spacing:-.04em;
  color:rgba(255,255,255,.92);margin:0 0 10px;font-family:-apple-system,"SF Pro Display",sans-serif}
.ob-h1 em{font-style:normal;background:linear-gradient(135deg,#60a5fa,#818cf8);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
@media(prefers-color-scheme:light){.ob-h1{color:rgba(0,0,0,.88)}}
.ob-p{font-size:15px;color:rgba(255,255,255,.46);margin:0 0 22px;line-height:1.55}
@media(prefers-color-scheme:light){.ob-p{color:rgba(0,0,0,.48)}}
.ob-feats{display:flex;flex-direction:column;gap:10px;width:100%}
.ob-feat{display:flex;align-items:center;gap:10px;font-size:14px;color:rgba(255,255,255,.62)}
.ob-feat span{font-size:18px;width:26px;text-align:center;flex-shrink:0}
@media(prefers-color-scheme:light){.ob-feat{color:rgba(0,0,0,.62)}}

/* Form */
.ob-h2{font-size:28px;font-weight:800;line-height:1.12;letter-spacing:-.035em;
  color:rgba(255,255,255,.92);margin:0 0 6px;font-family:-apple-system,"SF Pro Display",sans-serif}
@media(prefers-color-scheme:light){.ob-h2{color:rgba(0,0,0,.88)}}
.ob-p2{font-size:14px;color:rgba(255,255,255,.44);margin:0 0 18px;line-height:1.5}
@media(prefers-color-scheme:light){.ob-p2{color:rgba(0,0,0,.48)}}
.ob-field{display:flex;flex-direction:column;gap:5px}
.ob-lbl{font-size:11px;font-weight:600;letter-spacing:.05em;color:rgba(255,255,255,.35)}
@media(prefers-color-scheme:light){.ob-lbl{color:rgba(0,0,0,.38)}}
.ob-opt{font-size:10px;font-weight:400;letter-spacing:0;text-transform:none;color:rgba(255,255,255,.28)}
@media(prefers-color-scheme:light){.ob-opt{color:rgba(0,0,0,.30)}}
.ob-inp-wrap{position:relative;display:flex;align-items:center}
.ob-inp{width:100%;padding:13px 44px 13px 14px;
  background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.1);border-radius:12px;
  color:rgba(255,255,255,.88);font-size:15px;font-family:inherit;outline:none;
  -webkit-appearance:none;box-sizing:border-box;
  user-select:text;-webkit-user-select:text;
  transition:border-color .18s,background .18s,box-shadow .18s}
.ob-inp:focus{border-color:#60a5fa;background:rgba(96,165,250,.08);
  box-shadow:0 0 0 3px rgba(96,165,250,.14)}
.ob-field > .ob-inp{padding:13px 14px}
.ob-mono{font-family:"SF Mono",ui-monospace,monospace;font-size:12.5px}
.ob-inp::placeholder{color:rgba(255,255,255,.2)}
@media(prefers-color-scheme:light){
  .ob-inp{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1);color:rgba(0,0,0,.88)}
  .ob-inp::placeholder{color:rgba(0,0,0,.22)}
  .ob-inp:focus{background:rgba(0,122,255,.06);border-color:#007aff;
    box-shadow:0 0 0 3px rgba(0,122,255,.1)}}
.ob-eye{position:absolute;right:12px;background:none;border:none;cursor:pointer;
  color:rgba(255,255,255,.32);padding:4px;display:flex;align-items:center;transition:color .15s}
.ob-eye:hover{color:rgba(255,255,255,.62)}
.ob-err{font-size:12px;color:#ff453a;max-height:0;overflow:hidden;transition:max-height .2s}
.ob-err.ob-err-show{max-height:36px;margin-top:3px}
.ob-details{margin-top:14px;border-radius:11px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);overflow:hidden}
@media(prefers-color-scheme:light){.ob-details{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.06)}}
.ob-details summary.ob-hint-t{
  font-size:13px;font-weight:500;color:rgba(255,255,255,.55);padding:11px 14px;
  cursor:pointer;list-style:none;user-select:none}
.ob-details summary.ob-hint-t::-webkit-details-marker{display:none}
@media(prefers-color-scheme:light){.ob-details summary.ob-hint-t{color:rgba(0,0,0,.52)}}
.ob-hint-l{margin:0;padding:0 14px 12px 28px;color:rgba(255,255,255,.4);font-size:12.5px;line-height:1.9}
.ob-hint-l strong{color:rgba(255,255,255,.65)}
.ob-hint-l em{color:rgba(96,165,250,.9);font-style:normal}
@media(prefers-color-scheme:light){.ob-hint-l{color:rgba(0,0,0,.44)}.ob-hint-l strong{color:rgba(0,0,0,.72)}}

/* Avatar picker */
.ob-avatar-row{display:flex;align-items:center;gap:16px;margin-bottom:4px}
.ob-avatar-preview{width:72px;height:72px;border-radius:50%;flex-shrink:0;overflow:hidden;
  background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.1);
  display:flex;align-items:center;justify-content:center;
  transition:border-color .18s}
@media(prefers-color-scheme:light){.ob-avatar-preview{background:rgba(0,0,0,.05);border-color:rgba(0,0,0,.1)}}
.ob-av-placeholder{display:flex;align-items:center;justify-content:center;
  width:100%;height:100%;color:rgba(255,255,255,.3)}
@media(prefers-color-scheme:light){.ob-av-placeholder{color:rgba(0,0,0,.28)}}
.ob-avatar-btns{display:flex;flex-direction:column;gap:8px}
.ob-btn-av{display:inline-flex;align-items:center;justify-content:center;
  padding:9px 16px;border-radius:10px;border:none;cursor:pointer;
  font-size:13px;font-weight:500;font-family:inherit;
  background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);
  -webkit-tap-highlight-color:transparent;transition:background .15s}
.ob-btn-av:active{background:rgba(255,255,255,.14)}
.ob-btn-av-del{background:rgba(255,69,58,.12);color:#ff453a}
.ob-btn-av-del:active{background:rgba(255,69,58,.22)}
@media(prefers-color-scheme:light){
  .ob-btn-av{background:rgba(0,0,0,.06);color:rgba(0,0,0,.6)}
  .ob-btn-av-del{background:rgba(255,59,48,.1);color:#ff3b30}}

/* Done */
.ob-done{display:flex;flex-direction:column;align-items:center;padding:28px 0 16px}
.ob-check-wrap{position:relative;width:88px;height:88px;margin-bottom:24px}
.ob-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(99,102,241,.4);
  animation:ob-ring 2.5s ease-out infinite}
.ob-ring.r2{animation-delay:.55s;border-color:rgba(59,130,246,.3)}
@keyframes ob-ring{0%{transform:scale(.88);opacity:.7}100%{transform:scale(1.55);opacity:0}}
.ob-check-circle{position:absolute;inset:10px;border-radius:50%;
  background:linear-gradient(135deg,#3b82f6,#6366f1);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 24px rgba(99,102,241,.5)}
.ob-check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:ob-draw .5s .2s ease forwards}
@keyframes ob-draw{to{stroke-dashoffset:0}}
.ob-done-h{font-size:28px;font-weight:800;letter-spacing:-.035em;
  color:rgba(255,255,255,.92);margin:0 0 6px;font-family:-apple-system,"SF Pro Display",sans-serif}
@media(prefers-color-scheme:light){.ob-done-h{color:rgba(0,0,0,.88)}}

/* Buttons */
.ob-btn-p{display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:14px 22px;border-radius:13px;border:none;cursor:pointer;
  font-size:15px;font-weight:600;font-family:inherit;
  background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;
  box-shadow:0 4px 16px rgba(99,102,241,.3);flex:1;
  -webkit-tap-highlight-color:transparent;transition:transform .1s,opacity .15s;
  user-select:none;-webkit-user-select:none}
.ob-btn-p:active{transform:scale(.97)}
.ob-btn-p.ob-btn-full{width:100%}
.ob-btn-g{display:inline-flex;align-items:center;justify-content:center;gap:5px;
  padding:14px 16px;border-radius:13px;border:none;cursor:pointer;
  font-size:15px;font-weight:600;font-family:inherit;
  background:rgba(255,255,255,.08);color:rgba(255,255,255,.6);flex-shrink:0;
  -webkit-tap-highlight-color:transparent;transition:transform .1s;
  user-select:none;-webkit-user-select:none}
.ob-btn-g:active{transform:scale(.97)}
@media(prefers-color-scheme:light){.ob-btn-g{background:rgba(0,0,0,.07);color:rgba(0,0,0,.58)}}
.ob-btn-skip{background:none;border:none;cursor:pointer;
  font-size:14px;font-weight:500;color:rgba(255,255,255,.32);font-family:inherit;
  padding:14px 10px;-webkit-tap-highlight-color:transparent;transition:color .15s}
.ob-btn-skip:hover{color:rgba(255,255,255,.55)}
@media(prefers-color-scheme:light){.ob-btn-skip{color:rgba(0,0,0,.32)}.ob-btn-skip:hover{color:rgba(0,0,0,.55)}}
.ob-row{display:flex;align-items:center;gap:8px}
.ob-row-right{display:flex;align-items:center;gap:6px;margin-left:auto}
.ob-legal{font-size:11.5px;color:rgba(255,255,255,.22);text-align:center;margin:10px 0 0}
@media(prefers-color-scheme:light){.ob-legal{color:rgba(0,0,0,.26)}}
`;
  document.head.appendChild(s);
})();

// ── Dedicated Calendar Settings sheet (from Account tab) ──────────────────────
// A clean sheet showing only API key + calendars, with a close button.
function _obOpenCalSettings() {
  if (document.getElementById('ob-overlay')) return;
  var el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML =
    '<div id="ob-sheet">' +
    '<div class="ob-orbs"><div class="ob-orb1"></div><div class="ob-orb2"></div></div>' +
    '<button class="ob-x" onclick="_obCalClose()" aria-label="Close">\u00d7</button>' +
    '<div id="ob-cal-content"></div>' +
    '<div id="ob-cal-bottom"></div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obCalRender(0); });
}

var _obCalStep = 0; // 0=apikey, 1=calendars, 2=done

function _obCalRender(step) {
  _obCalStep = step;
  var con = document.getElementById('ob-cal-content');
  var bot = document.getElementById('ob-cal-bottom');
  if (!con || !bot) return;
  con.classList.remove('ob-slide');
  var r = step === 0 ? _sCalApi() : step === 1 ? _sCalIds() : _sCalDone();
  con.innerHTML = r.c; bot.innerHTML = r.b;
  void con.offsetWidth; con.classList.add('ob-slide');
  setTimeout(function(){ var i=con.querySelector('input'); if(i) i.focus(); },300);
}

function _sCalApi() {
  var saved = _obLoad().apiKey || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' +
       '<div class="ob-dot ob-dot-on"></div><div class="ob-dot"></div></div></div>' +
       '<h2 class="ob-h2">API Key</h2>' +
       '<p class="ob-p2">Your Google Calendar API key.</p>' +
       '<div class="ob-field"><label class="ob-lbl">API KEY</label>' +
       '<div class="ob-inp-wrap"><input type="password" id="ob-cs-api" class="ob-inp" placeholder="AIzaSy\u2026" value="'+_obEsc(saved)+'" autocomplete="off" spellcheck="false"/>' +
       '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-cs-api\',this)">'+_eyeIcon(false)+'</button></div>' +
       '<div class="ob-err" id="ob-cs-api-err"></div></div></div>',
    b: '<div class="ob-row"><div class="ob-row-right">' +
       '<button class="ob-btn-p" onclick="_obCalNext()">Next <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
       '</div></div>'
  };
}

function _sCalIds() {
  var saved = _obLoad(); var c0=(saved.calendars&&saved.calendars[0])||''; var c1=(saved.calendars&&saved.calendars[1])||'';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' +
       '<div class="ob-dot"></div><div class="ob-dot ob-dot-on"></div></div></div>' +
       '<h2 class="ob-h2">Calendars</h2>' +
       '<p class="ob-p2">Your Google Calendar IDs.</p>' +
       '<div class="ob-field"><label class="ob-lbl">PRIMARY <span style="color:var(--red)">*</span></label>' +
       '<input type="text" id="ob-cs-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc(c0)+'" autocomplete="off" spellcheck="false"/>' +
       '<div class="ob-err" id="ob-cs-cal0-err"></div></div>' +
       '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">SECONDARY <span class="ob-opt">optional</span></label>' +
       '<input type="text" id="ob-cs-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc(c1)+'" autocomplete="off" spellcheck="false"/></div></div>',
    b: '<div class="ob-row">' +
       '<button class="ob-btn-g" onclick="_obCalRender(0)"><svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Back</button>' +
       '<div class="ob-row-right"><button class="ob-btn-p" onclick="_obCalNext()">Save <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div></div>'
  };
}

function _sCalDone() {
  return {
    c: '<div class="ob-done">' +
       '<div class="ob-check-wrap"><div class="ob-ring r1"></div><div class="ob-ring r2"></div>' +
       '<div class="ob-check-circle"><svg viewBox="0 0 48 48" fill="none" width="40" height="40"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>' +
       '<h2 class="ob-done-h">Saved!</h2><p class="ob-p2">Your settings have been updated.</p></div>',
    b: '<button class="ob-btn-p ob-btn-full" onclick="_obCalFinish()">Done <svg viewBox="0 0 16 16" fill="none" width="14" height="14"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
  };
}

function _obCalNext() {
  if (_obCalStep === 0) {
    var v = ((document.getElementById('ob-cs-api')||{}).value||'').trim();
    var e = document.getElementById('ob-cs-api-err');
    if (!v) { _obErr(e,'API key required.'); return; }
    if (!v.startsWith('AIza')) { _obErr(e,'Should start with "AIza".'); return; }
    _obClear(e);
    var d=_obLoad(); d.apiKey=v; _obSave(d);
    _obCalRender(1);
  } else if (_obCalStep === 1) {
    var v0 = ((document.getElementById('ob-cs-cal0')||{}).value||'').trim();
    var v1 = ((document.getElementById('ob-cs-cal1')||{}).value||'').trim();
    var e0 = document.getElementById('ob-cs-cal0-err');
    if (!v0) { _obErr(e0,'Primary calendar required.'); return; }
    if (!v0.includes('@')) { _obErr(e0,'Must contain @.'); return; }
    _obClear(e0);
    var d=_obLoad(); d.calendars=[v0]; if(v1&&v1.includes('@')) d.calendars.push(v1);
    _obSave(d);
    _obCalRender(2);
  }
}

function _obCalClose() {
  var o=document.getElementById('ob-overlay');
  if(o){o.classList.add('ob-out');setTimeout(function(){o.remove();},380);}
}

function _obCalFinish() {
  _obCalClose();
  setTimeout(function(){if(typeof awInit==='function') awInit();},300);
}
