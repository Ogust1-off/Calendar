/*
  Calendar by Shortcut™ — Onboarding & Settings
  © 2026 Ogust'1
*/

/* ─────────────────────────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────────────────────────── */
function obSave(data) {
  localStorage.setItem('shortcut_config', JSON.stringify(data));
}
function obLoad() {
  try { return JSON.parse(localStorage.getItem('shortcut_config')) || {}; } catch { return {}; }
}

/* ─────────────────────────────────────────────────────────────
   ONBOARDING OVERLAY
───────────────────────────────────────────────────────────── */
let obStep = 0;

function showOnboarding() {
  if (document.getElementById('ob-overlay')) return;
  obStep = 0;
  const el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML = obHTML();
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.add('ob-visible');
    obRenderStep();
  });
}

function obHTML() {
  return `
  <div class="ob-sheet" id="ob-sheet">
    <div class="ob-bg-orbs">
      <div class="ob-orb ob-orb-1"></div>
      <div class="ob-orb ob-orb-2"></div>
      <div class="ob-orb ob-orb-3"></div>
    </div>
    <div class="ob-content" id="ob-content"></div>
    <div class="ob-bottom" id="ob-bottom"></div>
  </div>`;
}

function obRenderStep(direction) {
  direction = direction || 'forward';
  const content = document.getElementById('ob-content');
  const bottom  = document.getElementById('ob-bottom');
  if (!content || !bottom) return;

  content.classList.remove('ob-slide-in','ob-slide-in-back');
  const steps = [obStepWelcome, obStepApiKey, obStepCalendars, obStepDone];
  const result = steps[obStep]();
  content.innerHTML = result.html;
  bottom.innerHTML  = result.bottomHTML;

  void content.offsetWidth;
  content.classList.add(direction === 'back' ? 'ob-slide-in-back' : 'ob-slide-in');

  setTimeout(function() {
    var inp = content.querySelector('input');
    if (inp) inp.focus();
  }, 320);
}

function obNext() {
  if (!obValidateStep()) return;
  if (obStep < 3) { obStep++; obRenderStep('forward'); }
}
function obBack() {
  if (obStep > 0) { obStep--; obRenderStep('back'); }
}

/* ─────────────────────────────────────────────────────────────
   STEPS
───────────────────────────────────────────────────────────── */
function obStepWelcome() {
  return {
    html: '<div class="ob-hero">' +
      '<div class="ob-logo">' +
        '<div class="ob-logo-icon">' +
          '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<rect width="48" height="48" rx="14" fill="url(#lg1)"/>' +
            '<path d="M28 10L18 26h10L20 38l14-18H24L28 10z" fill="white" opacity="0.95"/>' +
            '<defs><linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48">' +
              '<stop offset="0%" stop-color="#3b82f6"/><stop offset="100%" stop-color="#6366f1"/>' +
            '</linearGradient></defs>' +
          '</svg>' +
        '</div>' +
        '<div class="ob-logo-wordmark">Calendar <span class="ob-logo-sub">by Shortcut™</span></div>' +
      '</div>' +
      '<h1 class="ob-title">Ton agenda,<br>toujours <em>à portée.</em></h1>' +
      '<p class="ob-subtitle">Configure ton accès Google Calendar en 2 minutes. Tes données restent sur ton appareil.</p>' +
      '<div class="ob-feature-list">' +
        '<div class="ob-feature"><span class="ob-feat-icon">📅</span><span>Vue agenda &amp; grille hebdo</span></div>' +
        '<div class="ob-feature"><span class="ob-feat-icon">🔔</span><span>Cours en cours &amp; à venir</span></div>' +
        '<div class="ob-feature"><span class="ob-feat-icon">🔒</span><span>Clés stockées localement</span></div>' +
        '<div class="ob-feature"><span class="ob-feat-icon">📴</span><span>Fonctionne hors ligne</span></div>' +
      '</div>' +
    '</div>',
    bottomHTML:
      '<button class="ob-btn ob-btn-primary ob-btn-full" onclick="obNext()">' +
        'Configurer <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<p class="ob-legal">Aucune donnée n\'est envoyée à nos serveurs.</p>'
  };
}

function obStepApiKey() {
  var saved = obLoad().apiKey || '';
  return {
    html: '<div class="ob-form-step">' +
      '<div class="ob-step-badge">Étape 1 sur 2</div>' +
      '<h2 class="ob-form-title">Clé API<br>Google Calendar</h2>' +
      '<p class="ob-form-desc">Tu as besoin d\'une clé API Google pour accéder à tes calendriers.</p>' +
      '<div class="ob-input-group">' +
        '<label class="ob-label">Clé API</label>' +
        '<div class="ob-input-wrap">' +
          '<input type="password" id="ob-apikey" class="ob-input" placeholder="AIzaSy…" value="' + obEsc(saved) + '" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
          '<button class="ob-input-eye" onclick="obToggleEye(\'ob-apikey\',this)" type="button">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="ob-error" id="ob-apikey-err"></div>' +
      '</div>' +
      '<div class="ob-hint-card">' +
        '<div class="ob-hint-title">💡 Comment obtenir une clé API ?</div>' +
        '<ol class="ob-hint-steps">' +
          '<li>Va sur <strong>console.cloud.google.com</strong></li>' +
          '<li>Créer un projet → APIs &amp; Services → Credentials</li>' +
          '<li>Créer une clé API → restreindre à <em>Google Calendar API</em></li>' +
        '</ol>' +
      '</div>' +
    '</div>',
    bottomHTML:
      '<div class="ob-btn-row">' +
        '<button class="ob-btn ob-btn-ghost" onclick="obBack()"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Retour</button>' +
        '<button class="ob-btn ob-btn-primary" onclick="obNext()">Suivant <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '</div>'
  };
}

function obStepCalendars() {
  var saved = obLoad();
  var cal0 = (saved.calendars && saved.calendars[0]) || '';
  var cal1 = (saved.calendars && saved.calendars[1]) || '';
  return {
    html: '<div class="ob-form-step">' +
      '<div class="ob-step-badge">Étape 2 sur 2</div>' +
      '<h2 class="ob-form-title">Tes calendriers<br>Google</h2>' +
      '<p class="ob-form-desc">Ajoute l\'ID de ton calendrier principal. Le deuxième est optionnel.</p>' +
      '<div class="ob-input-group">' +
        '<label class="ob-label">Calendrier principal <span class="ob-required">*</span></label>' +
        '<input type="text" id="ob-cal0" class="ob-input ob-input-mono" placeholder="xxxx@group.calendar.google.com" value="' + obEsc(cal0) + '" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
        '<div class="ob-error" id="ob-cal0-err"></div>' +
      '</div>' +
      '<div class="ob-input-group" style="margin-top:14px">' +
        '<label class="ob-label">Calendrier secondaire <span class="ob-optional">optionnel</span></label>' +
        '<input type="text" id="ob-cal1" class="ob-input ob-input-mono" placeholder="xxxx@group.calendar.google.com" value="' + obEsc(cal1) + '" autocomplete="off" autocorrect="off" spellcheck="false"/>' +
      '</div>' +
      '<div class="ob-hint-card" style="margin-top:18px">' +
        '<div class="ob-hint-title">💡 Où trouver l\'ID de calendrier ?</div>' +
        '<ol class="ob-hint-steps">' +
          '<li>Ouvre <strong>Google Calendar</strong> sur ordi</li>' +
          '<li>⚙️ Paramètres → ton calendrier → <em>Intégrer le calendrier</em></li>' +
          '<li>Copie l\'<strong>ID de calendrier</strong></li>' +
        '</ol>' +
      '</div>' +
    '</div>',
    bottomHTML:
      '<div class="ob-btn-row">' +
        '<button class="ob-btn ob-btn-ghost" onclick="obBack()"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Retour</button>' +
        '<button class="ob-btn ob-btn-primary" onclick="obNext()">Terminer <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '</div>'
  };
}

function obStepDone() {
  return {
    html: '<div class="ob-done">' +
      '<div class="ob-done-anim">' +
        '<div class="ob-done-ring ob-ring-1"></div>' +
        '<div class="ob-done-ring ob-ring-2"></div>' +
        '<div class="ob-done-check">' +
          '<svg viewBox="0 0 48 48" fill="none"><path class="ob-check-path" d="M12 24l9 9 15-15" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
      '</div>' +
      '<h2 class="ob-done-title">C\'est prêt !</h2>' +
      '<p class="ob-done-sub">Calendar by Shortcut™ va se charger.</p>' +
    '</div>',
    bottomHTML:
      '<button class="ob-btn ob-btn-primary ob-btn-full" onclick="obFinish()">' +
        'Ouvrir Calendar <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</button>'
  };
}

/* ─────────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────────── */
function obValidateStep() {
  if (obStep === 0) return true;
  if (obStep === 1) {
    var val = (document.getElementById('ob-apikey') || {}).value;
    if (val) val = val.trim();
    var err = document.getElementById('ob-apikey-err');
    if (!val) { obShowErr(err, 'La clé API est requise.'); return false; }
    if (!val.startsWith('AIza')) { obShowErr(err, 'Format invalide — commence par « AIza ».'); return false; }
    obClearErr(err);
    var c = obLoad(); c.apiKey = val; obSave(c);
    return true;
  }
  if (obStep === 2) {
    var v0El = document.getElementById('ob-cal0');
    var v1El = document.getElementById('ob-cal1');
    var v0 = v0El ? v0El.value.trim() : '';
    var v1 = v1El ? v1El.value.trim() : '';
    var e0 = document.getElementById('ob-cal0-err');
    if (!v0) { obShowErr(e0, 'L\'ID du calendrier principal est requis.'); return false; }
    if (!v0.includes('@')) { obShowErr(e0, 'Format invalide — doit contenir un @.'); return false; }
    obClearErr(e0);
    var c2 = obLoad();
    c2.calendars = [v0];
    if (v1 && v1.includes('@')) c2.calendars.push(v1);
    obSave(c2);
    return true;
  }
  return true;
}

function obShowErr(el, msg) {
  if (!el) return;
  el.textContent = msg; el.classList.add('visible');
  var g = el.closest ? el.closest('.ob-input-group') : null;
  var inp = g ? g.querySelector('input') : null;
  if (inp) inp.classList.add('ob-input-error');
}
function obClearErr(el) {
  if (!el) return;
  el.classList.remove('visible');
  var g = el.closest ? el.closest('.ob-input-group') : null;
  var inp = g ? g.querySelector('input') : null;
  if (inp) inp.classList.remove('ob-input-error');
}

/* ─────────────────────────────────────────────────────────────
   FINISH
───────────────────────────────────────────────────────────── */
function obFinish() {
  var overlay = document.getElementById('ob-overlay');
  if (overlay) { overlay.classList.add('ob-exit'); setTimeout(function(){ overlay.remove(); }, 450); }
  setTimeout(function(){ if (typeof awInit === 'function') awInit(); }, 300);
}

/* ─────────────────────────────────────────────────────────────
   SETTINGS (accessible depuis l'agenda)
───────────────────────────────────────────────────────────── */
function showSettings() {
  if (document.getElementById('ob-overlay')) return;
  obStep = 1;
  var el = document.createElement('div');
  el.id = 'ob-overlay';
  el.innerHTML = obHTML();
  document.body.appendChild(el);

  // Ajoute un bouton "Fermer" en haut
  var sheet = el.querySelector('.ob-sheet');
  if (sheet) {
    var closeBtn = document.createElement('button');
    closeBtn.className = 'ob-close-btn';
    closeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    closeBtn.onclick = function() {
      el.classList.add('ob-exit');
      setTimeout(function(){ el.remove(); }, 450);
    };
    sheet.appendChild(closeBtn);
  }

  requestAnimationFrame(function() {
    el.classList.add('ob-visible');
    obRenderStep();
  });
}

/* ─────────────────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────────────────── */
function obEsc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}
function obToggleEye(inputId, btn) {
  var inp = document.getElementById(inputId);
  if (!inp) return;
  var show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>';
}

/* ─────────────────────────────────────────────────────────────
   CSS INJECTION
───────────────────────────────────────────────────────────── */
(function injectObCSS() {
  if (document.getElementById('ob-styles')) return;
  var s = document.createElement('style');
  s.id = 'ob-styles';
  s.textContent = [
    /* ── Overlay ── */
    '#ob-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-end;opacity:0;transition:opacity .3s ease;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}',
    '#ob-overlay.ob-visible{opacity:1}',
    '#ob-overlay.ob-exit{opacity:0;transition:opacity .4s ease}',
    /* BUG 3 FIX: use dvh + allow sheet to grow, remove overflow:hidden so content never clips */
    '.ob-sheet{position:relative;width:100%;background:rgba(10,14,26,0.82);backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);border-radius:30px 30px 0 0;border-top:1px solid rgba(255,255,255,0.13);padding:0 0 calc(28px + env(safe-area-inset-bottom));overflow:visible;min-height:min(72vh,72dvh);max-height:min(96vh,96dvh);display:flex;flex-direction:column;transform:translateY(60px);transition:transform .45s cubic-bezier(.32,1.2,.45,1);box-shadow:0 -24px 80px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,0.12)}',
    /* Clip only the decorative orbs, not the content */
    '.ob-sheet>:not(.ob-bg-orbs){position:relative;z-index:1}',
    '#ob-overlay.ob-visible .ob-sheet{transform:translateY(0)}',
    '.ob-bg-orbs{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:30px 30px 0 0;z-index:0}',
    '.ob-orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.18}',
    '.ob-orb-1{width:300px;height:300px;background:#3b82f6;top:-80px;right:-60px;animation:obOrb 8s ease-in-out infinite}',
    '.ob-orb-2{width:200px;height:200px;background:#6366f1;bottom:60px;left:-40px;animation:obOrb 11s ease-in-out infinite reverse}',
    '.ob-orb-3{width:160px;height:160px;background:#06b6d4;top:40%;left:50%;animation:obOrb 13s ease-in-out infinite 2s}',
    '@keyframes obOrb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(20px,15px) scale(1.1)}}',
    /* BUG 3 FIX: content area scrolls internally so bottom buttons always visible */
    '.ob-content{flex:1;overflow-y:auto;overflow-x:hidden;padding:32px 24px 8px;-webkit-overflow-scrolling:touch;min-height:0}',
    '.ob-bottom{padding:12px 24px 0;flex-shrink:0}',
    /* RESPONSIVE: smaller padding on small screens (iPhone SE = 375px) */
    '@media(max-width:390px){.ob-content{padding:22px 18px 8px}.ob-bottom{padding:10px 18px 0}.ob-title{font-size:32px}.ob-form-title{font-size:26px}}',
    '@keyframes obSlideIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}',
    '@keyframes obSlideInBack{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}',
    '.ob-slide-in{animation:obSlideIn .32s cubic-bezier(.25,.8,.25,1) both}',
    '.ob-slide-in-back{animation:obSlideInBack .32s cubic-bezier(.25,.8,.25,1) both}',
    '.ob-hero{display:flex;flex-direction:column;align-items:flex-start}',
    '.ob-logo{display:flex;align-items:center;gap:10px;margin-bottom:30px}',
    '.ob-logo-icon{width:42px;height:42px;border-radius:12px;overflow:hidden;flex-shrink:0}',
    '.ob-logo-icon svg{width:100%;height:100%;display:block}',
    '.ob-logo-wordmark{font-size:18px;font-weight:700;letter-spacing:-.03em;color:rgba(255,255,255,.92);font-family:-apple-system,"SF Pro Display",system-ui,sans-serif}',
    '.ob-logo-wordmark sup{font-size:10px;color:rgba(255,255,255,.4)}',
    '.ob-logo-sub{font-size:11px;font-weight:400;color:rgba(255,255,255,.38);letter-spacing:.01em}',
    '.ob-title{font-size:38px;font-weight:800;line-height:1.1;letter-spacing:-.04em;color:rgba(255,255,255,.92);margin:0 0 14px;font-family:-apple-system,"SF Pro Display",system-ui,sans-serif}',
    '.ob-title em{font-style:normal;background:linear-gradient(135deg,#60a5fa,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
    '.ob-subtitle{font-size:15px;color:rgba(255,255,255,.48);margin:0 0 30px;line-height:1.55}',
    '.ob-feature-list{display:flex;flex-direction:column;gap:10px;margin-top:4px}',
    '.ob-feature{display:flex;align-items:center;gap:12px;font-size:14px;color:rgba(255,255,255,.65)}',
    '.ob-feat-icon{font-size:18px;width:28px;text-align:center;flex-shrink:0}',
    '.ob-step-badge{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#60a5fa;background:rgba(96,165,250,.12);border:1px solid rgba(96,165,250,.25);padding:4px 10px;border-radius:99px;margin-bottom:18px}',
    '.ob-form-title{font-size:30px;font-weight:800;line-height:1.15;letter-spacing:-.035em;color:rgba(255,255,255,.92);margin:0 0 10px;font-family:-apple-system,"SF Pro Display",system-ui,sans-serif}',
    '.ob-form-desc{font-size:14px;color:rgba(255,255,255,.45);margin:0 0 26px;line-height:1.5}',
    '.ob-input-group{display:flex;flex-direction:column;gap:6px}',
    '.ob-label{font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.4)}',
    '.ob-required{color:#f43f5e}',
    '.ob-optional{color:rgba(255,255,255,.3);font-size:10px;font-weight:400;letter-spacing:0;text-transform:none}',
    '.ob-input-wrap{position:relative;display:flex;align-items:center}',
    '.ob-input-group>.ob-input{padding:14px 16px}',
    '.ob-input-mono{font-family:"SF Mono",ui-monospace,monospace;font-size:13px}',
    '.ob-input::placeholder{color:rgba(255,255,255,.22)}',
    '.ob-input:focus{border-color:#60a5fa;background:rgba(96,165,250,.08);box-shadow:0 0 0 3px rgba(96,165,250,.15)}',
    '.ob-input-error{border-color:#f43f5e!important}',
    '.ob-input-error:focus{box-shadow:0 0 0 3px rgba(244,63,94,.15)!important}',
    '.ob-input-eye{position:absolute;right:14px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,.35);padding:4px;display:flex;align-items:center;transition:color .15s}',
    '.ob-input-eye:hover{color:rgba(255,255,255,.65)}',
    '.ob-error{font-size:12px;color:#f43f5e;max-height:0;overflow:hidden;transition:max-height .2s ease,margin-top .2s}',
    '.ob-error.visible{max-height:40px;margin-top:2px}',
    '.ob-hint-card{background:rgba(255,255,255,.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:14px 16px;margin-top:20px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.07)}',
    '.ob-hint-title{font-size:13px;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:8px}',
    '.ob-hint-steps{margin:0;padding-left:18px;color:rgba(255,255,255,.42);font-size:12.5px;line-height:1.8}',
    '.ob-hint-steps strong{color:rgba(255,255,255,.65)}',
    '.ob-hint-steps em{color:rgba(96,165,250,.8);font-style:normal}',
    /* BUG 1 FIX: user-select:none only on buttons, NEVER on inputs */
    '.ob-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:15px 24px;border-radius:16px;border:none;cursor:pointer;font-size:15px;font-weight:600;font-family:-apple-system,"SF Pro Text",system-ui,sans-serif;transition:transform .12s,box-shadow .18s,opacity .18s;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}',
    /* Explicitly allow text selection in inputs (overrides any parent rules) */
    '.ob-input{user-select:text!important;-webkit-user-select:text!important;width:100%;padding:14px 46px 14px 16px;background:rgba(255,255,255,.08);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.14);border-radius:14px;color:rgba(255,255,255,.90);font-size:15px;font-family:-apple-system,"SF Pro Text",system-ui,sans-serif;outline:none;transition:border-color .18s,background .18s,box-shadow .18s;-webkit-appearance:none;box-sizing:border-box;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06)}',
    '.ob-btn:active{transform:scale(.97)}',
    '.ob-btn-primary{background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;box-shadow:0 4px 20px rgba(99,102,241,.35);flex:1}',
    '.ob-btn-primary:hover{box-shadow:0 6px 28px rgba(99,102,241,.5)}',
    '.ob-btn-ghost{background:rgba(255,255,255,.08);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.14);flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,0.1)}',
    '.ob-btn-ghost:hover{background:rgba(255,255,255,.11);color:rgba(255,255,255,.85)}',
    '.ob-btn-full{width:100%}',
    '.ob-btn-row{display:flex;gap:10px}',
    '.ob-legal{font-size:11.5px;color:rgba(255,255,255,.25);text-align:center;margin:12px 0 0}',
    '.ob-done{display:flex;flex-direction:column;align-items:center;padding:30px 0}',
    '.ob-done-anim{position:relative;width:96px;height:96px;margin-bottom:28px}',
    '.ob-done-ring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(99,102,241,.4);animation:obRingPulse 2.5s ease-out infinite}',
    '.ob-done-ring.ob-ring-2{animation-delay:.5s;border-color:rgba(59,130,246,.3)}',
    '.ob-done-check{position:absolute;inset:10px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 30px rgba(99,102,241,.5)}',
    '.ob-done-check svg{width:40px;height:40px}',
    '.ob-check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:obCheckDraw .5s .2s ease forwards}',
    '@keyframes obCheckDraw{to{stroke-dashoffset:0}}',
    '@keyframes obRingPulse{0%{transform:scale(.9);opacity:.7}100%{transform:scale(1.5);opacity:0}}',
    '.ob-done-title{font-size:28px;font-weight:800;letter-spacing:-.03em;color:rgba(255,255,255,.92);margin:0 0 8px}',
    '.ob-done-sub{font-size:14px;color:rgba(255,255,255,.45);text-align:center}',
    '.ob-close-btn{position:absolute;top:16px;right:16px;z-index:10;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.08);border:none;cursor:pointer;color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s}',
    '.ob-close-btn:hover{background:rgba(255,255,255,.14);color:rgba(255,255,255,.85)}',
    '@media(prefers-color-scheme:light){',
    ':root{--bg:#eef0f5;--border:rgba(0,0,0,.07);--border-hi:rgba(255,255,255,.95);--text:rgba(10,12,20,.88);--muted:rgba(10,12,20,.46);--faint:rgba(10,12,20,.28);--accent:#2563eb}',
    '.ob-sheet{background:rgba(240,244,252,0.85);backdrop-filter:blur(40px) saturate(200%);-webkit-backdrop-filter:blur(40px) saturate(200%);border-top:1px solid rgba(255,255,255,0.9);box-shadow:0 -20px 60px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,0.9)}',
    '.ob-title,.ob-form-title,.ob-done-title,.ob-logo-wordmark{color:rgba(10,15,30,.92)}',
    '.ob-subtitle,.ob-form-desc{color:rgba(10,15,30,.5)}',
    '.ob-feature{color:rgba(10,15,30,.65)}',
    '.ob-input{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.1);color:rgba(10,15,30,.88)}',
    '.ob-input::placeholder{color:rgba(10,15,30,.25)}',
    '.ob-input:focus{background:rgba(59,130,246,.06);border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.12)}',
    '.ob-input-eye{color:rgba(10,15,30,.35)}',
    '.ob-hint-card{background:rgba(0,0,0,.03);border-color:rgba(0,0,0,.07)}',
    '.ob-hint-title{color:rgba(10,15,30,.6)}',
    '.ob-hint-steps{color:rgba(10,15,30,.45)}',
    '.ob-hint-steps strong{color:rgba(10,15,30,.7)}',
    '.ob-btn-ghost{background:rgba(0,0,0,.06);color:rgba(10,15,30,.6);border-color:rgba(0,0,0,.1)}',
    '.ob-legal{color:rgba(10,15,30,.3)}',
    '.ob-done-sub{color:rgba(10,15,30,.45)}',
    '.ob-label{color:rgba(10,15,30,.45)}',
    '.ob-orb{opacity:.06}',
    '.ob-close-btn{background:rgba(0,0,0,.06);color:rgba(0,0,0,.4)}',
    '}'
  ].join('\n');
  document.head.appendChild(s);
})();
