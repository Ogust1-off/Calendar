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

// Steps: 0=welcome, 1=source+apikey, 2=calendars(sub-stepped), 3=profile, 4=prefs, 5=done
var _OB_STEPS = 6;

function _obRender() {
  var con = document.getElementById('ob-content');
  var bot = document.getElementById('ob-bottom');
  if (!con || !bot) return;
  con.classList.remove('ob-slide');
  var fns = [_s0, _s2a, _s2, _s3, _s3b, _s4];
  var r = fns[_obStep]();
  con.innerHTML = r.c; bot.innerHTML = r.b;
  void con.offsetWidth; con.classList.add('ob-slide');
  setTimeout(function(){ var i = con.querySelector('input[type="text"],input[type="password"]'); if(i) i.focus(); }, 320);
}

function _obNext() {
  if (!_obValidate()) return;
  // Calendar step (step 2) has sub-steps
  if (_obStep === 2) {
    var d = _obLoad();
    var src = d.calSource || 'api';
    // Sub-step navigation
    if (_OB_SUB === 0) {
      // source chosen — if ical, skip 2b (no api key needed), go to 2c
      if (src === 'ical') { _OB_SUB = 2; }
      else { _OB_SUB = 1; }
    } else if (_OB_SUB === 1) {
      _OB_SUB = 2; // api credentials → style
    } else if (_OB_SUB === 2) {
      _OB_SUB = 3; // style → cal2 color (may auto-skip)
    } else {
      // Done with cal sub-steps
      _obStep++; _OB_SUB = 0; _obRender(); return;
    }
    // Render next sub-step
    var r = _obCalSubRender();
    if (!r) { _obStep++; _OB_SUB = 0; _obRender(); return; }
    var con = document.getElementById('ob-content');
    var bot = document.getElementById('ob-bottom');
    if (!con || !bot) return;
    con.classList.remove('ob-slide');
    con.innerHTML = r.c; bot.innerHTML = r.b;
    void con.offsetWidth; con.classList.add('ob-slide');
    return;
  }
  if (_obStep < _OB_STEPS - 1) { _obStep++; _obRender(); }
}
function _obBack() {
  if (_obStep === 2 && _OB_SUB > 0) {
    var d = _obLoad();
    var src2 = d.calSource || 'api';
    _OB_SUB--;
    // If ical source, skip sub-step 1 (api ids)
    if (src2 === 'ical' && _OB_SUB === 1) _OB_SUB = 0;
    var r = _obCalSubRender();
    var con = document.getElementById('ob-content');
    var bot = document.getElementById('ob-bottom');
    if (con && bot && r) {
      con.classList.remove('ob-slide');
      con.innerHTML = r.c; bot.innerHTML = r.b;
      void con.offsetWidth; con.classList.add('ob-slide');
    }
    return;
  }
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
  // Route to the active calendar sub-step
  _OB_SUB = 0;
  return _obCalSubRender();
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
// ── Step 3b: Language & Theme ──────────────────────────────────────────────────
function _s3b() {
  var d = _obLoad();
  var lang = d.lang || 'en';
  var theme = d.theme || 'auto';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(4) + '</div></div>' +
       '<h2 class="ob-h2">Preferences</h2>' +
       '<p class="ob-p2">Choose your language and display theme.</p>' +

       // Language
       '<div class="ob-pref-row">' +
         '<div class="ob-pref-ico">&#127760;</div>' +
         '<div class="ob-pref-label">Language</div>' +
         '<div class="ob-pref-btns" id="ob-lang-btns">' +
           '<button class="ob-pref-btn' + (lang==='en'?' ob-pref-on':'') + '" onclick="_obPickLang(\'en\',this)">English</button>' +
           '<button class="ob-pref-btn' + (lang==='fr'?' ob-pref-on':'') + '" onclick="_obPickLang(\'fr\',this)">Fran\u00e7ais</button>' +
         '</div>' +
       '</div>' +

       // Theme
       '<div class="ob-pref-row" style="margin-top:14px">' +
         '<div class="ob-pref-ico">&#127763;</div>' +
         '<div class="ob-pref-label">Theme</div>' +
         '<div class="ob-pref-btns" id="ob-theme-btns">' +
           '<button class="ob-pref-btn' + (theme==='auto'?' ob-pref-on':'') + '" onclick="_obPickTheme(\'auto\',this)">Auto</button>' +
           '<button class="ob-pref-btn' + (theme==='dark'?' ob-pref-on':'') + '" onclick="_obPickTheme(\'dark\',this)">Dark</button>' +
           '<button class="ob-pref-btn' + (theme==='light'?' ob-pref-on':'') + '" onclick="_obPickTheme(\'light\',this)">Light</button>' +
         '</div>' +
       '</div>' +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obPickLang(val, btn) {
  document.querySelectorAll('#ob-lang-btns .ob-pref-btn').forEach(function(b){ b.classList.remove('ob-pref-on'); });
  btn.classList.add('ob-pref-on');
  var d=_obLoad(); d.lang=val; _obSave(d);
}
function _obPickTheme(val, btn) {
  document.querySelectorAll('#ob-theme-btns .ob-pref-btn').forEach(function(b){ b.classList.remove('ob-pref-on'); });
  btn.classList.add('ob-pref-on');
  var d=_obLoad(); d.theme=val; _obSave(d);
  // Live preview
  if(typeof _applyTheme==='function') _applyTheme(val);
}
function _obSaveLangTheme() {
  // Already saved live — nothing extra needed
}

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
function _obDots(current) { // steps 1–4 have dots
  var out = '';
  for (var i=1; i<=4; i++) {
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
    // Source step: validate API key only if mode=api
    var d=_obLoad();
    var mode = d.sourceMode||'api';
    if (mode==='api') {
      var v = ((document.getElementById('ob-apikey')||{}).value||'').trim();
      var e = document.getElementById('ob-apikey-err');
      if (!v)             { _obErr(e,'API key is required.'); return false; }
      if (!v.startsWith('AIza')) { _obErr(e,'Should start with "AIza".'); return false; }
      _obClear(e); d.apiKey=v; _obSave(d);
    }
    if (mode==='ical') {
      var url = ((document.getElementById('ob-ical-url')||{}).value||'').trim();
      var e2 = document.getElementById('ob-ical-err');
      if (!url) { _obErr(e2,'Please enter an iCal URL.'); return false; }
      _obClear(e2); d.cal1Ical=url.replace(/^webcal:\/\//,'https://'); _obSave(d);
    }
    return true;
  }
  if (_obStep===2) { return true; } // handled by _obVal2 in overridden _obNext
  if (_obStep===3) { _obSaveProfile(); return true; }
  if (_obStep===4) { _obSaveLangTheme(); return true; }
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
.ob-pref-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid rgba(255,255,255,.08)}
.ob-pref-row:last-child{border-bottom:none}
.ob-pref-ico{font-size:22px;flex-shrink:0;width:30px;text-align:center}
.ob-pref-label{flex:1;font-size:15px;font-weight:500;color:rgba(255,255,255,.88)}
.ob-pref-btns{display:flex;gap:6px;flex-shrink:0}
.ob-pref-btn{padding:6px 14px;border-radius:99px;border:.5px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.07);color:rgba(255,255,255,.55);font-size:13px;font-weight:500;
  font-family:inherit;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent}
.ob-pref-btn:active{transform:scale(.93)}
.ob-pref-btn.ob-pref-on{background:var(--tint,#0a84ff);border-color:transparent;color:#fff;
  box-shadow:0 2px 10px rgba(10,132,255,.4)}
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
/* Source / preset selector */
.ob-source-btn{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;
  border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);
  color:rgba(255,255,255,.85);font-family:inherit;cursor:pointer;text-align:left;width:100%;
  -webkit-tap-highlight-color:transparent;transition:all .15s}
.ob-source-btn:active{transform:scale(.98)}
.ob-source-btn.ob-source-on{border-color:#3b82f6;background:rgba(59,130,246,.12)}
@media(prefers-color-scheme:light){
  .ob-source-btn{border-color:rgba(0,0,0,.1);background:rgba(0,0,0,.04);color:rgba(0,0,0,.8)}
  .ob-source-btn.ob-source-on{border-color:#007aff;background:rgba(0,122,255,.08)}}
.ob-source-ico{font-size:24px;flex-shrink:0;width:32px;text-align:center}
.ob-source-body{flex:1;min-width:0}
.ob-source-title{font-size:14px;font-weight:600;margin-bottom:2px}
.ob-source-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.4}
@media(prefers-color-scheme:light){.ob-source-sub{color:rgba(0,0,0,.45)}}
.ob-source-check{font-size:16px;color:#3b82f6;font-weight:700;flex-shrink:0;width:20px;text-align:center}

/* Colour picker grid */
.ob-color-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
.ob-color-btn{width:32px;height:32px;border-radius:50%;border:2px solid transparent;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  -webkit-tap-highlight-color:transparent;transition:transform .12s,border-color .12s;flex-shrink:0}
.ob-color-btn:active{transform:scale(.88)}
.ob-color-btn.ob-color-on{border-color:#fff;transform:scale(1.15)}
@media(prefers-color-scheme:light){.ob-color-btn.ob-color-on{border-color:rgba(0,0,0,.5)}}

/* Subject rows */
.ob-subj-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.ob-subj-inp{border-radius:10px!important;flex:1}

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
    '<div id="ob-handle-zone"><div id="ob-handle"></div></div>' +
    '<button class="ob-x" onclick="_obCalClose()" aria-label="Close">\u00d7</button>' +
    '<div id="ob-cal-content"></div>' +
    '<div id="ob-cal-bottom"></div>' +
    '</div>';
  document.body.appendChild(el);
  requestAnimationFrame(function(){ el.classList.add('ob-in'); _obCalRender(0); _obInitDrag(el); });
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
  if(o){o.classList.add('ob-out');setTimeout(function(){
    o.remove();
    // If still no valid config, show unconfigured state
    var cfg=_obLoad();
    if(!(cfg.apiKey&&cfg.calendars&&cfg.calendars[0])){
      if(typeof _obShowUnconfigured==='function')_obShowUnconfigured();
    }
  },380);}
}

function _obCalFinish() {
  _obCalClose();
  setTimeout(function(){if(typeof awInit==='function') awInit();},300);
}

// ════════════════════════════════════════════════════════════════════════════
// CALENDAR SETUP — étapes 2a/2b/2c/2d remplacent l'ancienne _s2
// Flux: 2a (source) → 2b (IDs si API) → 2c (preset cal1) → 2d (couleur cal2)
// ════════════════════════════════════════════════════════════════════════════

// Couleurs disponibles (nom + hex)
var OB_COLORS = [
  {k:'blue',    hex:'#3b82f6', label:'Bleu'},
  {k:'violet',  hex:'#8b5cf6', label:'Violet'},
  {k:'emerald', hex:'#10b981', label:'Vert'},
  {k:'amber',   hex:'#f59e0b', label:'Ambre'},
  {k:'rose',    hex:'#f43f5e', label:'Rose'},
  {k:'cyan',    hex:'#06b6d4', label:'Cyan'},
  {k:'orange',  hex:'#f97316', label:'Orange'},
  {k:'grey',    hex:'#94a3b8', label:'Gris'},
  {k:'lime',    hex:'#84cc16', label:'Lime'},
];

// ECAM preset subjects (built-in)
var OB_ECAM_SUBJECTS = [
  {match:'math',         color:'blue',    label:'Mathématiques'},
  {match:'physique',     color:'cyan',    label:'Physique'},
  {match:'informatique', color:'violet',  label:'Informatique'},
  {match:'sciences ind', color:'amber',   label:'Sciences Industrielles'},
  {match:'anglais',      color:'emerald', label:'Anglais'},
  {match:'sport',        color:'rose',    label:'Sport'},
  {match:'culture',      color:'orange',  label:'Culture'},
  {match:'proj',         color:'grey',    label:'Projets'},
];

function _obColorDot(colorKey, size) {
  size = size || 20;
  var c = OB_COLORS.find(function(x){return x.k===colorKey;}) || OB_COLORS[0];
  return '<span style="display:inline-block;width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+c.hex+';flex-shrink:0;"></span>';
}

function _obColorPicker(fieldId, currentKey, onchange) {
  var html = '<div class="ob-color-grid" id="'+fieldId+'">';
  OB_COLORS.forEach(function(c) {
    var sel = currentKey === c.k ? ' ob-color-on' : '';
    html += '<button class="ob-color-btn'+sel+'" data-color="'+c.k+'" title="'+c.label+'" '+
            'style="background:'+c.hex+'" '+
            'onclick="'+onchange+'(\''+c.k+'\',\''+fieldId+'\')">' +
            (currentKey===c.k ? '<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '') +
            '</button>';
  });
  return html + '</div>';
}

// ── Step 2a: Calendar source ──────────────────────────────────────────────────
function _s2a() {
  var d = _obLoad();
  var src = d.calSource || 'api'; // 'api' | 'ical'
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(2)+'</div></div>' +
       '<h2 class="ob-h2">Calendar Source</h2>' +
       '<p class="ob-p2">How should the app access your calendars?</p>' +
       '<div style="display:flex;flex-direction:column;gap:10px;margin-top:4px">' +

       // Option: Google API
       '<button class="ob-source-btn'+(src==='api'?' ob-source-on':'')+'" onclick="_obPickSource(\'api\',this)" id="ob-src-api">'+
         '<div class="ob-source-ico">🔑</div>'+
         '<div class="ob-source-body"><div class="ob-source-title">Google Calendar API</div>'+
         '<div class="ob-source-sub">API key + Calendar ID. Full control, real-time sync.</div></div>'+
         '<div class="ob-source-check">'+(src==='api'?'✓':'')+'</div>'+
       '</button>' +

       // Option: iCal / iPhone
       '<button class="ob-source-btn'+(src==='ical'?' ob-source-on':'')+'" onclick="_obPickSource(\'ical\',this)" id="ob-src-ical">'+
         '<div class="ob-source-ico">📱</div>'+
         '<div class="ob-source-body"><div class="ob-source-title">iPhone Calendar (iCal)</div>'+
         '<div class="ob-source-sub">Copy iCal link from your iPhone or Google Calendar. No API key needed.</div></div>'+
         '<div class="ob-source-check">'+(src==='ical'?'✓':'')+'</div>'+
       '</button>' +

       // iCal URL field (shown only if ical selected)
       '<div id="ob-ical-fields" style="'+(src==='ical'?'':'display:none')+'">' +
         '<div class="ob-field"><label class="ob-lbl">ICAL URL — CALENDAR 1 <span style="color:var(--red)">*</span></label>' +
         '<input type="url" id="ob-ical0" class="ob-inp ob-mono" placeholder="webcal://…" value="'+_obEsc(d.cal1Ical||'')+'" autocomplete="off" spellcheck="false"/>' +
         '<div class="ob-err" id="ob-ical0-err"></div></div>' +
         '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">ICAL URL — CALENDAR 2 <span class="ob-opt">optional</span></label>' +
         '<input type="url" id="ob-ical1" class="ob-inp ob-mono" placeholder="webcal://…" value="'+_obEsc(d.cal2Ical||'')+'" autocomplete="off" spellcheck="false"/></div>' +
         '<details class="ob-details"><summary class="ob-hint-t">💡 Get the iCal link from iPhone</summary>' +
         '<ol class="ob-hint-l"><li>On iPhone: <strong>Settings → Calendar → Accounts</strong></li>' +
         '<li>Or from Google Calendar: ⚙️ → your calendar → <em>Integrate calendar</em> → iCal</li>' +
         '<li>Copy the link starting with <strong>webcal://</strong> or <strong>https://</strong></li></ol></details>' +
       '</div>' +
       '</div></div>',
    b: _obNavRow(true)
  };
}

function _obPickSource(val, btn) {
  document.querySelectorAll('.ob-source-btn').forEach(function(b){
    b.classList.remove('ob-source-on');
    var chk=b.querySelector('.ob-source-check');if(chk)chk.textContent='';
  });
  btn.classList.add('ob-source-on');
  var chk=btn.querySelector('.ob-source-check');if(chk)chk.textContent='✓';
  var d=_obLoad(); d.calSource=val; _obSave(d);
  var fields=document.getElementById('ob-ical-fields');
  if(fields)fields.style.display=(val==='ical'?'':'none');
}

// ── Step 2b: Google API key + Calendar IDs ────────────────────────────────────
function _s2b() {
  var d = _obLoad();
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(2)+'</div></div>' +
       '<h2 class="ob-h2">Google API</h2>' +
       '<p class="ob-p2">Enter your API key and Calendar IDs.</p>' +
       '<div class="ob-field"><label class="ob-lbl">GOOGLE API KEY <span style="color:var(--red)">*</span></label>' +
       '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy…" value="'+_obEsc(d.apiKey||'')+'" autocomplete="off" spellcheck="false"/>' +
       '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">'+_eyeIcon(false)+'</button></div>' +
       '<div class="ob-err" id="ob-apikey-err"></div></div>' +
       '<div class="ob-field" style="margin-top:12px"><label class="ob-lbl">CALENDAR 1 — PRIMARY <span style="color:var(--red)">*</span></label>' +
       '<input type="text" id="ob-cal0" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[0])||'')+'" autocomplete="off" spellcheck="false"/>' +
       '<div class="ob-err" id="ob-cal0-err"></div></div>' +
       '<div class="ob-field" style="margin-top:10px"><label class="ob-lbl">CALENDAR 2 <span class="ob-opt">optional</span></label>' +
       '<input type="text" id="ob-cal1" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="'+_obEsc((d.calendars&&d.calendars[1])||'')+'" autocomplete="off" spellcheck="false"/></div>' +
       '<details class="ob-details"><summary class="ob-hint-t">💡 How to get an API key & Calendar ID</summary>' +
       '<ol class="ob-hint-l"><li>Go to <strong>console.cloud.google.com</strong></li>' +
       '<li>APIs &amp; Services → Credentials → Create API Key → restrict to Calendar API</li>' +
       '<li>Calendar settings → <em>Integrate calendar</em> → copy Calendar ID</li></ol></details>' +
       '</div>',
    b: _obNavRow(true)
  };
}

// ── Step 2c: Cal 1 preset / color ─────────────────────────────────────────────
function _s2c() {
  var d = _obLoad();
  var preset = d.cal1Preset || 'ecam';
  var color  = d.cal1Color  || 'blue';
  var subs   = d.cal1Subjects || [];

  // Build custom subjects list
  var customRows = '';
  if (preset === 'custom') {
    OB_ECAM_SUBJECTS.forEach(function(s,i) {
      var savedColor = (subs.find(function(x){return x.match===s.match;})||{}).color || s.color;
      customRows += '<div class="ob-subj-row">' +
        '<input class="ob-inp ob-subj-inp" id="ob-subj-'+i+'" placeholder="'+s.label+'" value="'+_obEsc(s.label)+'" style="flex:1;padding:8px 10px;font-size:13px"/>' +
        _obColorPicker('ob-sc-'+i, savedColor, '_obPickSubjColor') +
        '</div>';
    });
  }

  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(2)+'</div></div>' +
       '<h2 class="ob-h2">Calendar 1 Style</h2>' +
       '<p class="ob-p2">How should event colours be assigned?</p>' +
       '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">' +

       // ECAM preset
       '<button class="ob-source-btn'+(preset==='ecam'?' ob-source-on':'')+'" onclick="_obPickPreset(\'ecam\',this)">'+
         '<div class="ob-source-ico">🎓</div>'+
         '<div class="ob-source-body"><div class="ob-source-title">ECAM Preset</div>'+
         '<div class="ob-source-sub">Auto-detects subjects, groups, teachers and assigns colours.</div></div>'+
         '<div class="ob-source-check">'+(preset==='ecam'?'✓':'')+'</div>'+
       '</button>' +

       // Custom
       '<button class="ob-source-btn'+(preset==='custom'?' ob-source-on':'')+'" onclick="_obPickPreset(\'custom\',this)">'+
         '<div class="ob-source-ico">🎨</div>'+
         '<div class="ob-source-body"><div class="ob-source-title">Advanced</div>'+
         '<div class="ob-source-sub">Name your subjects and pick a colour for each.</div></div>'+
         '<div class="ob-source-check">'+(preset==='custom'?'✓':'')+'</div>'+
       '</button>' +

       // None (single color)
       '<button class="ob-source-btn'+(preset==='none'?' ob-source-on':'')+'" onclick="_obPickPreset(\'none\',this)">'+
         '<div class="ob-source-ico">🟦</div>'+
         '<div class="ob-source-body"><div class="ob-source-title">Single colour</div>'+
         '<div class="ob-source-sub">All events in one colour.</div></div>'+
         '<div class="ob-source-check">'+(preset==='none'?'✓':'')+'</div>'+
       '</button>' +
       '</div>' +

       // Single color picker (preset=none)
       '<div id="ob-c1-color-row" style="'+(preset==='none'?'':'display:none')+'">' +
         '<label class="ob-lbl" style="margin-bottom:8px;display:block">COLOUR</label>' +
         _obColorPicker('ob-c1-color', color, '_obPickCal1Color') +
       '</div>' +

       // Custom subjects
       '<div id="ob-c1-subjects" style="'+(preset==='custom'?'':'display:none')+';margin-top:4px">' +
         '<label class="ob-lbl" style="margin-bottom:8px;display:block">SUBJECTS &amp; COLOURS</label>' +
         (customRows || _obBuildCustomRows(subs)) +
         '<button class="ob-btn-av" style="margin-top:10px;width:100%" onclick="_obAddSubject()">+ Add subject</button>' +
       '</div>' +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obBuildCustomRows(subs) {
  var html = '';
  var list = subs.length ? subs : OB_ECAM_SUBJECTS.map(function(s){return{match:s.match,color:s.color,label:s.label};});
  list.forEach(function(s,i) {
    html += '<div class="ob-subj-row" data-idx="'+i+'">' +
      '<input class="ob-inp ob-subj-inp" data-match="'+_obEsc(s.match||s.label||'')+'" placeholder="Subject name…" value="'+_obEsc(s.label||s.match||'')+'" style="flex:1;padding:8px 10px;font-size:13px" oninput="_obSubjNameChange(this)"/>' +
      _obColorPicker('ob-sc-'+i, s.color||'blue', '_obPickSubjColor') +
      '<button onclick="_obRemoveSubj(this)" style="background:none;border:none;color:#ff453a;font-size:18px;cursor:pointer;padding:0 4px;flex-shrink:0">×</button>' +
    '</div>';
  });
  return html;
}

function _obAddSubject() {
  var cont=document.getElementById('ob-c1-subjects');if(!cont)return;
  var rows=cont.querySelectorAll('.ob-subj-row');
  var i=rows.length;
  var div=document.createElement('div');div.className='ob-subj-row';div.dataset.idx=i;
  div.innerHTML='<input class="ob-inp ob-subj-inp" placeholder="Subject name…" style="flex:1;padding:8px 10px;font-size:13px" oninput="_obSubjNameChange(this)"/>'+
    _obColorPicker('ob-sc-'+i,'blue','_obPickSubjColor')+
    '<button onclick="_obRemoveSubj(this)" style="background:none;border:none;color:#ff453a;font-size:18px;cursor:pointer;padding:0 4px;flex-shrink:0">×</button>';
  cont.insertBefore(div,cont.querySelector('button.ob-btn-av'));
  _obSaveSubjects();
}
function _obRemoveSubj(btn){var r=btn.closest('.ob-subj-row');if(r)r.remove();_obSaveSubjects();}
function _obSubjNameChange(){_obSaveSubjects();}

function _obPickPreset(val, btn) {
  document.querySelectorAll('#ob-content .ob-source-btn').forEach(function(b){
    b.classList.remove('ob-source-on');
    var c=b.querySelector('.ob-source-check');if(c)c.textContent='';
  });
  btn.classList.add('ob-source-on');
  var chk=btn.querySelector('.ob-source-check');if(chk)chk.textContent='✓';
  var d=_obLoad(); d.cal1Preset=val; _obSave(d);
  var colorRow=document.getElementById('ob-c1-color-row');
  var subjsRow=document.getElementById('ob-c1-subjects');
  if(colorRow)colorRow.style.display=(val==='none'?'':'none');
  if(subjsRow)subjsRow.style.display=(val==='custom'?'':'none');
}

function _obPickCal1Color(colorKey, gridId) {
  _obSelectColorInGrid(colorKey, gridId);
  var d=_obLoad(); d.cal1Color=colorKey; _obSave(d);
}

function _obPickSubjColor(colorKey, gridId) {
  _obSelectColorInGrid(colorKey, gridId);
  _obSaveSubjects();
}

function _obSelectColorInGrid(colorKey, gridId) {
  var grid=document.getElementById(gridId);if(!grid)return;
  grid.querySelectorAll('.ob-color-btn').forEach(function(b){
    var on=b.dataset.color===colorKey;
    b.classList.toggle('ob-color-on',on);
    b.innerHTML=on?'<svg viewBox="0 0 16 16" fill="none" width="10" height="10"><path d="M3 8l4 4 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>':'';
  });
}

function _obSaveSubjects() {
  var rows=document.querySelectorAll('#ob-c1-subjects .ob-subj-row');
  var subs=[];
  rows.forEach(function(row) {
    var inp=row.querySelector('.ob-subj-inp');
    var onBtn=row.querySelector('.ob-color-btn.ob-color-on');
    var label=(inp&&inp.value.trim())||'';
    var match=(inp&&inp.dataset.match)||label.toLowerCase();
    var color=(onBtn&&onBtn.dataset.color)||'blue';
    if(label) subs.push({match:match,color:color,label:label});
  });
  var d=_obLoad(); d.cal1Subjects=subs; _obSave(d);
}

// ── Step 2d: Cal 2 colour ─────────────────────────────────────────────────────
function _s2d() {
  var d = _obLoad();
  var color = d.cal2Color || 'lime';
  // Only show if cal2 is set
  var hasCal2 = (d.calendars&&d.calendars[1]) || d.cal2Ical;
  if (!hasCal2) {
    // Skip this step — auto-advance
    return null; // signal to skip
  }
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">'+_obDots(2)+'</div></div>' +
       '<h2 class="ob-h2">Calendar 2 Colour</h2>' +
       '<p class="ob-p2">Choose a colour for all events from Calendar 2.</p>' +
       _obColorPicker('ob-c2-color', color, '_obPickCal2Color') +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obPickCal2Color(colorKey, gridId) {
  _obSelectColorInGrid(colorKey, gridId);
  var d=_obLoad(); d.cal2Color=colorKey; _obSave(d);
}

// ── Override _s2 to route through sub-steps ───────────────────────────────────
// New step indices: 0=welcome, 1=api/source, 2=cal-ids, 3=style, 4=cal2, 5=profile, 6=prefs, 7=done
// We keep _OB_STEPS and the fns array approach but now _s2 is split

// Replace the steps array by overriding _obRender logic
var _OB_SUB = 0; // sub-step within the calendar section (0=source, 1=ids, 2=style, 3=cal2color)

function _obCalSubRender() {
  var fns = [_s2a, _s2b, _s2c, _s2d];
  var fn = fns[_OB_SUB];
  if (!fn) return null;
  var r = fn();
  if (!r) {
    // skip this sub-step
    _OB_SUB++;
    return _obCalSubRender();
  }
  return r;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW CALENDAR SETUP — replaces _s2() for the full calendar config flow
// ═══════════════════════════════════════════════════════════════════════════════

// Override _s2 with richer calendar setup
// Steps within step 2: 2a=source, 2b=cal1 ID, 2c=cal1 preset, 2d=cal2 (opt)
var _obCalSub = 0; // 0=cal1-id, 1=cal1-preset, 2=cal1-custom(if custom), 3=cal2

function _s2() {
  _obCalSub = _obCalSub || 0;
  var fns = [_s2b, _s2c, _s2d, _s2e];
  return (fns[_obCalSub] || _s2b)();
}

// Override _obNext to handle sub-steps
var _obNextOrig = _obNext;
var _obBackOrig = _obBack;

function _obNext() {
  if (_obStep === 2) {
    if (!_obVal2()) return;
    var fns = [_s2b, _s2c, _s2d, _s2e];
    var isLast = (_obCalSub >= fns.length - 1) ||
                 (_obCalSub === 1 && true) || // after cal1-id go to preset
                 (_obCalSub === 2 && _obLoad().cal1Preset === 'none') || // skip custom
                 (_obCalSub === 2 && _obLoad().cal1Preset === 'ecam');   // skip custom
    // advance sub-step or go to next main step
    var next = _obCalSubNext();
    if (next === 'done') {
      _obStep++; _obCalSub = 0; _obRender();
    } else {
      _obCalSub = next; _obRender();
    }
    return;
  }
  if (!_obValidate()) return;
  if (_obStep < _OB_STEPS - 1) { _obStep++; _obRender(); }
}

function _obBack() {
  if (_obStep === 2) {
    var prev = _obCalSubPrev();
    if (prev < 0) { _obStep--; _obCalSub = 0; _obRender(); }
    else { _obCalSub = prev; _obRender(); }
    return;
  }
  if (_obStep > (_obIsSettings ? 1 : 0)) { _obStep--; _obRender(); }
}

function _obCalSubNext() {
  var d = _obLoad();
  if (_obCalSub === 0) return 1;         // cal1 id → preset choice
  if (_obCalSub === 1) {
    if (d.cal1Preset === 'custom') return 2; // preset → custom subjects
    return 3;                             // preset → cal2
  }
  if (_obCalSub === 2) return 3;         // custom subjects → cal2
  return 'done';                          // cal2 → done
}
function _obCalSubPrev() {
  var d = _obLoad();
  if (_obCalSub === 0) return -1;
  if (_obCalSub === 1) return 0;
  if (_obCalSub === 2) return 1;
  if (_obCalSub === 3) {
    if (d.cal1Preset === 'custom') return 2;
    return 1;
  }
  return _obCalSub - 1;
}

function _obVal2() {
  var d = _obLoad();
  if (_obCalSub === 0) {
    // cal1 id (only required if not ical mode)
    if (d.sourceMode === 'ical') return true;
    var v = ((document.getElementById('ob-cal1-id')||{}).value||'').trim();
    var e1 = document.getElementById('ob-cal1-err');
    if (!v) { _obErr(e1,'Calendar ID is required.'); return false; }
    if (!v.includes('@')) { _obErr(e1,'Must contain an @.'); return false; }
    _obClear(e1);
    d.calendars = d.calendars || [];
    d.calendars[0] = v;
    _obSave(d);
    return true;
  }
  if (_obCalSub === 1) {
    // preset: read selected button
    var sel = document.querySelector('.ob-preset-btn.ob-pref-on');
    if (sel) { d.cal1Preset = sel.dataset.preset; _obSave(d); }
    return true;
  }
  if (_obCalSub === 2) {
    // custom subjects: save them
    var rows = document.querySelectorAll('.ob-subj-row');
    var subjects = [];
    rows.forEach(function(row) {
      var m = (row.querySelector('.ob-subj-match')||{}).value||'';
      var c = (row.querySelector('.ob-subj-color')||{}).value||'blue';
      if (m.trim()) subjects.push({match: m.trim(), color: c});
    });
    d.cal1Subjects = subjects;
    _obSave(d);
    return true;
  }
  if (_obCalSub === 3) {
    // cal2: optional
    var v2 = ((document.getElementById('ob-cal2-id')||{}).value||'').trim();
    var c2 = (document.querySelector('#ob-cal2-color-btns .ob-pref-btn.ob-pref-on')||{}).dataset||{};
    d.cal2Color = c2.color || 'lime';
    if (v2 && v2.includes('@')) {
      d.calendars = d.calendars || [];
      d.calendars[1] = v2;
    }
    _obSave(d);
    return true;
  }
  return true;
}

// ── Step 2a: Data source ─────────────────────────────────────────────────────
function _s2a() {
  var d = _obLoad();
  var mode = d.sourceMode || 'api';
  var apiKey = d.apiKey || '';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div></div>' +
       '<h2 class="ob-h2">Calendar Source</h2>' +
       '<p class="ob-p2">How do you want to connect your calendar?</p>' +
       // Option 1: Google API
       '<label class="ob-src-card' + (mode==='api'?' ob-src-on':'') + '" onclick="_obSrcPick(\'api\',this)">' +
         '<input type="radio" name="cal-src" value="api"' + (mode==='api'?' checked':'') + ' style="display:none"/>' +
         '<div class="ob-src-ico">🔑</div>' +
         '<div class="ob-src-body">' +
           '<div class="ob-src-title">Google API Key</div>' +
           '<div class="ob-src-sub">Full control, real-time sync</div>' +
         '</div>' +
         '<div class="ob-src-check">' + (mode==='api'?'✓':'') + '</div>' +
       '</label>' +
       // Option 2: iCal from iPhone
       '<label class="ob-src-card' + (mode==='ical'?' ob-src-on':'') + '" style="margin-top:10px" onclick="_obSrcPick(\'ical\',this)">' +
         '<input type="radio" name="cal-src" value="ical"' + (mode==='ical'?' checked':'') + ' style="display:none"/>' +
         '<div class="ob-src-ico">📱</div>' +
         '<div class="ob-src-body">' +
           '<div class="ob-src-title">Copy from iPhone</div>' +
           '<div class="ob-src-sub">Paste the iCal link from iOS Settings</div>' +
         '</div>' +
         '<div class="ob-src-check">' + (mode==='ical'?'✓':'') + '</div>' +
       '</label>' +
       // iCal URL field (shown if ical selected)
       '<div id="ob-ical-wrap" style="margin-top:12px;' + (mode==='ical'?'':'display:none') + '">' +
         '<div class="ob-field"><label class="ob-lbl">ICAL URL</label>' +
         '<input type="text" id="ob-ical-url" class="ob-inp ob-mono" placeholder="https://p12-caldav.icloud.com/..." value="' + _obEsc(d.cal1Ical||'') + '" autocomplete="off" spellcheck="false"/>' +
         '<div class="ob-err" id="ob-ical-err"></div></div>' +
         '<details class="ob-details" style="margin-top:8px"><summary class="ob-hint-t">💡 How to get your iCal link</summary>' +
         '<ol class="ob-hint-l"><li>On iPhone: <strong>Settings → Calendar → Accounts → your account</strong></li>' +
         '<li>Tap your calendar → <em>Share Calendar</em></li>' +
         '<li>Copy the <strong>webcal://</strong> link and paste above</li>' +
         '<li>Or from Google Calendar: Settings → your calendar → <em>Secret address in iCal format</em></li></ol></details>' +
       '</div>' +
       // API key field (shown if api selected)
       '<div id="ob-api-wrap" style="margin-top:12px;' + (mode==='api'?'':'display:none') + '">' +
         '<div class="ob-field"><label class="ob-lbl">GOOGLE API KEY</label>' +
         '<div class="ob-inp-wrap"><input type="password" id="ob-apikey" class="ob-inp" placeholder="AIzaSy…" value="' + _obEsc(apiKey) + '" autocomplete="off" spellcheck="false"/>' +
         '<button class="ob-eye" type="button" onclick="_obToggleEye(\'ob-apikey\',this)">' + _eyeIcon(false) + '</button></div>' +
         '<div class="ob-err" id="ob-apikey-err"></div></div>' +
       '</div>' +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obSrcPick(val, label) {
  document.querySelectorAll('.ob-src-card').forEach(function(c){
    c.classList.remove('ob-src-on');
    c.querySelector('.ob-src-check').textContent='';
  });
  label.classList.add('ob-src-on');
  label.querySelector('.ob-src-check').textContent='✓';
  label.querySelector('input[type=radio]').checked=true;
  document.getElementById('ob-ical-wrap').style.display = val==='ical'?'':'none';
  document.getElementById('ob-api-wrap').style.display  = val==='api' ?'':'none';
  // Save API key live if entered
  if (val==='api') {
    var el=document.getElementById('ob-apikey'); if(el&&el.value.trim()){var d=_obLoad();d.apiKey=el.value.trim();_obSave(d);}
  }
}

// ── Step 2b: Cal1 ID ──────────────────────────────────────────────────────────
function _s2b() {
  var d = _obLoad();
  if (d.sourceMode === 'ical') { _obCalSub = 2; return _s2c(); } // skip if ical
  var c0 = (d.calendars&&d.calendars[0])||'';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div></div>' +
       '<h2 class="ob-h2">Main Calendar</h2>' +
       '<p class="ob-p2">Enter your primary Google Calendar ID.</p>' +
       '<div class="ob-field"><label class="ob-lbl">CALENDAR ID <span style="color:var(--red)">*</span></label>' +
       '<input type="text" id="ob-cal1-id" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc(c0) + '" autocomplete="off" spellcheck="false"/>' +
       '<div class="ob-err" id="ob-cal1-err"></div></div>' +
       '<details class="ob-details"><summary class="ob-hint-t">💡 Where to find the Calendar ID</summary>' +
       '<ol class="ob-hint-l"><li>Open <strong>Google Calendar</strong> on desktop</li>' +
       '<li>⚙️ Settings → your calendar → <em>Integrate calendar</em></li>' +
       '<li>Copy the <strong>Calendar ID</strong></li></ol></details>' +
       '</div>',
    b: _obNavRow(true)
  };
}

// ── Step 2c: Cal1 Preset ──────────────────────────────────────────────────────
function _s2c() {
  var d = _obLoad();
  var preset = d.cal1Preset || 'ecam';
  var COLOR_BTNS = _obColorBtns('ob-cal1-solo', d.cal1Color||'blue');
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div></div>' +
       '<h2 class="ob-h2">Calendar Style</h2>' +
       '<p class="ob-p2">How should events be coloured?</p>' +

       // ECAM preset
       '<div class="ob-preset-card' + (preset==='ecam'?' ob-src-on':'') + '" onclick="_obPresetPick(\'ecam\',this)" style="margin-bottom:10px">' +
         '<div class="ob-src-ico">🏫</div>' +
         '<div class="ob-src-body">' +
           '<div class="ob-src-title">ECAM Preset</div>' +
           '<div class="ob-src-sub">Auto-detects Maths, Physique, Info, Sport… by name</div>' +
           '<div class="ob-preset-pills">' +
             '<span style="background:#3b82f633;color:#3b82f6;border:.5px solid #3b82f644">Maths</span>' +
             '<span style="background:#8b5cf633;color:#8b5cf6;border:.5px solid #8b5cf644">Info</span>' +
             '<span style="background:#06b6d433;color:#06b6d4;border:.5px solid #06b6d444">Physique</span>' +
             '<span style="background:#f43f5e33;color:#f43f5e;border:.5px solid #f43f5e44">Sport</span>' +
           '</div>' +
         '</div>' +
         '<div class="ob-src-check">' + (preset==='ecam'?'✓':'') + '</div>' +
       '</div>' +

       // Custom
       '<div class="ob-preset-card' + (preset==='custom'?' ob-src-on':'') + '" onclick="_obPresetPick(\'custom\',this)" style="margin-bottom:10px">' +
         '<div class="ob-src-ico">🎨</div>' +
         '<div class="ob-src-body">' +
           '<div class="ob-src-title">Custom</div>' +
           '<div class="ob-src-sub">You define the subjects and pick their colour</div>' +
         '</div>' +
         '<div class="ob-src-check">' + (preset==='custom'?'✓':'') + '</div>' +
       '</div>' +

       // None / single color
       '<div class="ob-preset-card' + (preset==='none'?' ob-src-on':'') + '" onclick="_obPresetPick(\'none\',this)">' +
         '<div class="ob-src-ico">🎨</div>' +
         '<div class="ob-src-body">' +
           '<div class="ob-src-title">Single colour</div>' +
           '<div class="ob-src-sub">All events use one colour</div>' +
           '<div id="ob-cal1-solo-wrap" style="margin-top:8px;' + (preset==='none'?'':'display:none') + '">' + COLOR_BTNS + '</div>' +
         '</div>' +
         '<div class="ob-src-check">' + (preset==='none'?'✓':'') + '</div>' +
       '</div>' +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obPresetPick(val, card) {
  document.querySelectorAll('.ob-preset-card').forEach(function(c){
    c.classList.remove('ob-src-on');
    c.querySelector('.ob-src-check').textContent='';
  });
  card.classList.add('ob-src-on');
  card.querySelector('.ob-src-check').textContent='✓';
  var wrap=document.getElementById('ob-cal1-solo-wrap');
  if(wrap) wrap.style.display=(val==='none'?'':'none');
  var d=_obLoad(); d.cal1Preset=val; _obSave(d);
}

// ── Step 2d: Custom subjects ──────────────────────────────────────────────────
function _s2d() {
  var d = _obLoad();
  var subjects = d.cal1Subjects && d.cal1Subjects.length ? d.cal1Subjects : [
    {match:'Maths',color:'blue'},{match:'Physique',color:'cyan'},
    {match:'Info',color:'violet'},{match:'Sport',color:'rose'}
  ];
  var rows = subjects.map(function(s,i){
    return '<div class="ob-subj-row">' +
      '<input type="text" class="ob-inp ob-subj-match" placeholder="Subject name…" value="' + _obEsc(s.match) + '" style="flex:1;min-width:0"/>' +
      _obColorSelect('ob-subj-color-'+i, s.color) +
      '<button class="ob-btn-av ob-btn-av-del" style="flex-shrink:0;padding:8px 10px" onclick="this.closest(\'.ob-subj-row\').remove()">✕</button>' +
      '</div>';
  }).join('');
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div></div>' +
       '<h2 class="ob-h2">Subjects</h2>' +
       '<p class="ob-p2">Define keywords to match event names and assign colours.</p>' +
       '<div id="ob-subj-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">' + rows + '</div>' +
       '<button class="ob-btn-g" onclick="_obAddSubjRow()" style="width:100%;justify-content:center">+ Add subject</button>' +
       '</div>',
    b: _obNavRow(false)
  };
}

function _obColorSelect(id, selected) {
  var colors = ['blue','violet','emerald','amber','rose','cyan','orange','grey','lime'];
  var hexes  = {blue:'#3b82f6',violet:'#8b5cf6',emerald:'#10b981',amber:'#f59e0b',rose:'#f43f5e',cyan:'#06b6d4',orange:'#f97316',grey:'#94a3b8',lime:'#84cc16'};
  return '<select class="ob-subj-color" id="'+id+'" style="flex-shrink:0;background:rgba(255,255,255,.07);border:.5px solid rgba(255,255,255,.14);border-radius:8px;padding:8px 6px;color:rgba(255,255,255,.8);font-family:inherit;font-size:13px;outline:none;cursor:pointer">' +
    colors.map(function(c){ return '<option value="'+c+'"' + (c===selected?' selected':'') + '>'+c.charAt(0).toUpperCase()+c.slice(1)+'</option>'; }).join('') +
    '</select>';
}

function _obColorBtns(id, selected) {
  var colors = ['blue','violet','emerald','amber','rose','cyan','orange','grey','lime'];
  var hexes  = {blue:'#3b82f6',violet:'#8b5cf6',emerald:'#10b981',amber:'#f59e0b',rose:'#f43f5e',cyan:'#06b6d4',orange:'#f97316',grey:'#94a3b8',lime:'#84cc16'};
  return '<div class="ob-pref-btns" id="'+id+'-btns" style="flex-wrap:wrap;gap:6px">' +
    colors.map(function(c){
      var hex = hexes[c]||'#3b82f6';
      return '<button class="ob-pref-btn' + (c===selected?' ob-pref-on':'') + '" data-color="'+c+'" '+
        'onclick="_obPickColor(\''+id+'\',\''+c+'\',this)" '+
        'style="width:28px;height:28px;padding:0;background:'+hex+'33;border:.5px solid '+hex+'66;border-radius:50%">'+
        '<span style="display:block;width:14px;height:14px;border-radius:50%;background:'+hex+';margin:auto"></span>'+
        '</button>';
    }).join('') +
    '</div>';
}

function _obPickColor(id, val, btn) {
  document.querySelectorAll('#'+id+'-btns .ob-pref-btn').forEach(function(b){b.classList.remove('ob-pref-on');});
  btn.classList.add('ob-pref-on');
  var d=_obLoad(); d.cal1Color=val; _obSave(d);
}

function _obAddSubjRow() {
  var list=document.getElementById('ob-subj-list'); if(!list)return;
  var idx=list.children.length;
  var div=document.createElement('div'); div.className='ob-subj-row';
  div.innerHTML='<input type="text" class="ob-inp ob-subj-match" placeholder="Subject name…" style="flex:1;min-width:0"/>' +
    _obColorSelect('ob-subj-color-'+idx,'blue') +
    '<button class="ob-btn-av ob-btn-av-del" style="flex-shrink:0;padding:8px 10px" onclick="this.closest(\'.ob-subj-row\').remove()">✕</button>';
  list.appendChild(div);
}

// ── Step 2e: Cal 2 (optional) ─────────────────────────────────────────────────
function _s2e() {
  var d = _obLoad();
  var c2 = (d.calendars&&d.calendars[1])||'';
  var c2col = d.cal2Color||'lime';
  return {
    c: '<div class="ob-form">' +
       '<div class="ob-step-row"><div class="ob-dots">' + _obDots(2) + '</div>' +
       '<span class="ob-opt-badge">Optional</span></div>' +
       '<h2 class="ob-h2">Second Calendar</h2>' +
       '<p class="ob-p2">Add a second Google Calendar with its own colour.</p>' +
       '<div class="ob-field"><label class="ob-lbl">CALENDAR ID</label>' +
       '<input type="text" id="ob-cal2-id" class="ob-inp ob-mono" placeholder="xxxx@group.calendar.google.com" value="' + _obEsc(c2) + '" autocomplete="off" spellcheck="false"/></div>' +
       '<div style="margin-top:14px"><label class="ob-lbl" style="margin-bottom:8px;display:block">COLOUR</label>' +
       _obColorBtns('ob-cal2-color', c2col) + '</div>' +
       '</div>',
    b: _obNavRow(false)
  };
}

// Inject extra CSS for new calendar cards
(function(){
  var s=document.getElementById('ob-css'); if(!s)return;
  s.textContent += `
.ob-src-card,.ob-preset-card{display:flex;align-items:flex-start;gap:12px;padding:13px 14px;
  border-radius:14px;border:.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);
  cursor:pointer;transition:all .18s;-webkit-tap-highlight-color:transparent}
.ob-src-card:active,.ob-preset-card:active{background:rgba(255,255,255,.08)}
.ob-src-on{border-color:#3b82f6 !important;background:rgba(59,130,246,.1) !important}
.ob-src-ico{font-size:22px;flex-shrink:0;padding-top:2px}
.ob-src-body{flex:1;min-width:0}
.ob-src-title{font-size:15px;font-weight:600;color:rgba(255,255,255,.9);margin-bottom:2px}
.ob-src-sub{font-size:12px;color:rgba(255,255,255,.45);line-height:1.4}
.ob-src-check{font-size:14px;font-weight:700;color:#3b82f6;flex-shrink:0;min-width:16px;text-align:right}
.ob-preset-pills{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}
.ob-preset-pills span{font-size:11px;font-weight:600;padding:2px 8px;border-radius:99px}
.ob-subj-row{display:flex;align-items:center;gap:6px}
@media(prefers-color-scheme:light){
  .ob-src-card,.ob-preset-card{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.09)}
  .ob-src-on{background:rgba(0,122,255,.08) !important;border-color:#007aff !important}
  .ob-src-title{color:rgba(0,0,0,.88)}.ob-src-sub{color:rgba(0,0,0,.48)}
  .ob-src-check{color:#007aff}
  .ob-subj-color{background:rgba(0,0,0,.06) !important;border-color:rgba(0,0,0,.1) !important;color:rgba(0,0,0,.7) !important}
}
`;
})();
