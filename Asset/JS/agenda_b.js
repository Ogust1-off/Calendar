
// Latin date formatting helpers
function _isLatinLang() { return typeof window._getLang==='function' && window._getLang()==='la'; }
function _laMonthShort(mon) {
  var s=['Ian','Feb','Mar','Apr','Mai','Iun','Iul','Aug','Sep','Oct','Nov','Dec'];
  return s[mon]||'';
}
function _laFmtShort(d) {
  var LA_D=['Dom','Lun','Mar','Mer','Iov','Ven','Sat'];
  return LA_D[d.getDay()]+' '+(window._toRoman?window._toRoman(d.getDate()):d.getDate())+' '+_laMonthShort(d.getMonth());
}
function _laFmtLong(d) {
  var LA_D=['Dominica','Lunae','Martis','Mercurii','Iovis','Veneris','Saturni'];
  var LA_M=window._LA_MONTHS||[];
  return LA_D[d.getDay()]+', '+(window._toRoman?window._toRoman(d.getDate()):d.getDate())+' '+( LA_M[d.getMonth()]||'')+(', '+(window._toRoman?window._toRoman(d.getFullYear()):d.getFullYear()));
}
function _laFmtMonthLong(d) {
  var LA_M=window._LA_MONTHS_NOM||[];
  return LA_M[d.getMonth()]||'';
}
function _laFmtMonthShort(d) { return _laMonthShort(d.getMonth()); }
/*Shortcut™ JS file for Agenda by Augustin de Chalendar
Copyright © 2026 Ogust'1. All rights reserved.
*/

function _getCfg() { try { return JSON.parse(localStorage.getItem('shortcut_config')||'null'); } catch(e){ return null; } }
function _loadCfg() {
  const c = _getCfg(); if (!c) return false;
  AW_API_KEY        = c.apiKey       || '';
  AW_CALENDAR_ID    = c.calendars && c.calendars[0] ? c.calendars[0] : '';
  AW_CALENDAR_ID_2  = c.calendars && c.calendars[1] ? c.calendars[1] : '';
  AW_ICAL_URL       = c.cal1Ical || c.icalUrl || '';
  AW_CAL2_ICAL      = c.cal2Ical || '';
  AW_EXTRA_CALS     = c.extraCals || [];
  AW_CAL1_PRESET    = c.cal1Preset   || 'ecam';
  AW_CAL1_COLOR_CFG = c.cal1Color    || 'blue';
  AW_CAL1_SUBJECTS  = c.cal1Subjects || [];
  AW_CAL2_COLOR_CFG = c.cal2Color    || 'lime';
  AW_CAL1_NAME      = c.cal1Name     || '';
  AW_CAL2_NAME      = c.cal2Name     || '';
  return !!(AW_API_KEY && AW_CALENDAR_ID) || !!(c.cal1Ical);
}
let AW_API_KEY = '', AW_CALENDAR_ID = '', AW_CALENDAR_ID_2 = '', AW_ICAL_URL = '', AW_CAL2_ICAL = '', AW_EXTRA_CALS = [];
let AW_CAL1_PRESET = 'ecam', AW_CAL1_COLOR_CFG = 'blue', AW_CAL1_SUBJECTS = [], AW_CAL2_COLOR_CFG = 'lime';
const AW_CAL2_COLOR = 'lime';
const AW_FETCH_DAYS = 84; // 12 semaines

// Grid config: show hours from AW_HOUR_START to AW_HOUR_END
const AW_HOUR_START=0, AW_HOUR_END=24; let AW_PX_PER_HOUR=60;

// ── 🎨 COULEURS PAR MATIÈRE ──────────────────────────────────────────────────
const AW_COLOR_MAP = [
  { match: 'math',         color: 'blue'    },
  { match: 'physique',     color: 'cyan'    },
  { match: 'informatique', color: 'violet'  },
  { match: 'sciences ind', color: 'amber'   },
  { match: 'anglais',      color: 'emerald' },
  { match: 'sport',        color: 'rose'    },
  { match: 'culture',      color: 'orange'  },
  { match: 'proj',         color: 'grey'    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const awPad = n => String(n).padStart(2, '0');

function awDateStr(d) {
  return `${d.getFullYear()}-${awPad(d.getMonth()+1)}-${awPad(d.getDate())}`;
}
function awToday() { return awDateStr(new Date()); }

function awFmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString((typeof window._appLocale==='function'?window._appLocale():(window._appLocale||'en-GB')), { hour: '2-digit', minute: '2-digit' });
}
function awFmtRemaining(end) {
  const ms = new Date(end) - Date.now();
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h   = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (h > 0)   return `${h}h${String(min).padStart(2,'0')}`;
  if (min > 0) return `${min}min`;
  return `${sec}s`;
}

function awFmtRemainingLong(end) {
  const ms = new Date(end) - Date.now();
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h   = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  if (h > 0)   return `${h}h${String(min).padStart(2,'0')}`;
  if (min > 0) return `${min}min ${String(sec).padStart(2,'0')}s`;
  return `${sec}s`;
}

function awFmtDuration(start, end) {
  if (!start || !end) return '';
  const ms = new Date(end) - new Date(start);
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${awPad(m)}`;
}
function awFmtDayLabel(dateStr, long = false) {
  const d = new Date(dateStr + 'T00:00:00');
  if (_isLatinLang()) return long ? _laFmtLong(d) : _laFmtShort(d);
  const s = d.toLocaleDateString((typeof window._appLocale==='function'?window._appLocale():(window._appLocale||'en-GB')), long
    ? { weekday: 'long', day: 'numeric', month: 'long' }
    : { weekday: 'short', day: 'numeric', month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function awWeekdayShort(dateStr) {
  const _dws = new Date(dateStr + 'T00:00:00');
  if (_isLatinLang()) { var _lad=['Lun','Mar','Mer','Iov','Ven','Sat','Dom']; return _lad[_dws.getDay()]||''; }
  return _dws
    .toLocaleDateString((typeof window._appLocale==='function'?window._appLocale():(window._appLocale||'en-GB')), { weekday: 'short' })
    .replace(/^./, c => c.toUpperCase());
}
function awDayNum(dateStr) { return new Date(dateStr + 'T00:00:00').getDate(); }
function awIsWeekend(dateStr) { const d = new Date(dateStr + 'T00:00:00').getDay(); return d === 0 || d === 6; }
function awIsNow(s, e) { const n = Date.now(); return new Date(s) <= n && new Date(e) >= n; }
function awIsPast(e) { return new Date(e) < Date.now(); }
function awProgress(s, e) {
  const n = Date.now();
  return Math.min(100, Math.max(0, Math.round((n - new Date(s)) / (new Date(e) - new Date(s)) * 100)));
}
function awMondayOf(date) {
  const d = new Date(date); const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}

const AW_COLORS = ['blue','violet','emerald','amber','rose','cyan','orange','grey'];
const AW_CAL2_COLOR_HEX = '#84cc16'; // lime-500
function awNorm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
const AW_COLOR_HEX = {
  blue:'#3b82f6',indigo:'#6366f1',violet:'#8b5cf6',
  fuchsia:'#d946ef',rose:'#f43f5e',red:'#ef4444',
  orange:'#f97316',amber:'#f59e0b',yellow:'#eab308',
  lime:'#84cc16',emerald:'#10b981',teal:'#14b8a6',
  cyan:'#06b6d4',sky:'#0ea5e9',slate:'#64748b',grey:'#94a3b8',
  white:'#f8f4ec',
};
window.AW_COLOR_HEX = AW_COLOR_HEX;
function awColorFor(name, isCal2) {
  if (!name) return 'blue';
  if (isCal2) return AW_CAL2_COLOR_CFG || 'lime';
  const preset = AW_CAL1_PRESET || 'ecam';
  if (preset === 'none') return AW_CAL1_COLOR_CFG || 'blue';
  const norm = awNorm(name);
  const map = preset === 'custom' ? AW_CAL1_SUBJECTS : AW_COLOR_MAP;
  for (const e of map) { if (norm.includes(awNorm(e.match||''))) return e.color||'blue'; }
  const word = norm.split(/[\s\-–]/)[0];
  let h = 0; for (let i=0;i<word.length;i++) h=(h*31+word.charCodeAt(i))>>>0;
  return AW_COLORS[h % AW_COLORS.length];
}

function _obEscText(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function awTimeToHours(iso, startIso) {
  if (!iso) return 0;
  const d = new Date(iso);
  let h = d.getHours() + d.getMinutes() / 60;
  // If exactly midnight (00:00:00) and different local date than start → treat as 24h (end of day)
  if (h === 0 && d.getSeconds() === 0) {
    if (!startIso) return 24;
    // Compare LOCAL date strings (YYYY-MM-DD)
    const startLocalDate = startIso.slice(0,10);
    const endLocalDate   = iso.slice(0,10);
    if (endLocalDate !== startLocalDate) return 24;
  }
  return h;
}

function awParseICal(text) {
  // RFC 5545 unfolding: continuation lines start with space/tab
  const unfolded = text.replace(/\r\n[ \t]/g, '').replace(/\r/g, '');
  // iCal unescape
  const unescape = (s) => s
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
  const events = [];
  const blocks = unfolded.split('BEGIN:VEVENT');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key) => {
      const m = block.match(new RegExp('^' + key + '(?:;[^:\\r\\n]*)?:([^\\r\\n]+)', 'm'));
      return m ? unescape(m[1].trim()) : '';
    };
    const parseDate = (str) => {
      if (!str) return '';
      // DATE only (all-day)
      if (/^\d{8}$/.test(str)) return str.slice(0,4)+'-'+str.slice(4,6)+'-'+str.slice(6,8);
      // UTC datetime (ends with Z) → convert to local ISO string to keep consistent with getHours()
      if (str.endsWith('Z') || str.endsWith('z')) {
        try {
          const d = new Date(str.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/i, '$1-$2-$3T$4:$5:$6Z'));
          // Keep as UTC ISO — getHours() will use local, but .slice(0,10) uses UTC date
          // Actually just use local padded string so both are consistent
          return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')
            +'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');
        } catch(e) { return ''; }
      }
      // Local datetime (no Z) — keep as local string: YYYYMMDDTHHMMSS → YYYY-MM-DDTHH:MM:SS
      const m = str.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
      if (m) return m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':'+m[6];
      return '';
    };
    const start = parseDate(get('DTSTART'));
    const end   = parseDate(get('DTEND'));
    if (!start) continue;
    events.push({
      summary:     get('SUMMARY'),
      location:    get('LOCATION'),
      description: get('DESCRIPTION'),
      start, end,
    });
  }
  return events;
}


// ── API ────────────────────────────────────────────────────────────────────────

async function _fetchWithTimeout(url, ms) {
  ms = ms || 10000;
  const ctrl = new AbortController();
  const timer = setTimeout(function(){ ctrl.abort(); }, ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    return r;
  } catch(e) { clearTimeout(timer); throw e; }
}
async function awFetch() {
  const monday = awMondayOf(new Date());
  monday.setHours(0, 0, 0, 0);
  // Fetch 4 weeks back + AW_FETCH_DAYS forward
  const fetchStart = new Date(monday);
  fetchStart.setDate(monday.getDate() - 28);
  const tMin = fetchStart.toISOString();
  const tMax = new Date(monday.getTime() + (AW_FETCH_DAYS + 7) * 86400000).toISOString();

  const buildUrl = (calId) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`
    + `?key=${AW_API_KEY}&timeMin=${encodeURIComponent(tMin)}&timeMax=${encodeURIComponent(tMax)}`
    + `&singleEvents=true&orderBy=startTime&maxResults=250`;

  const parseEvents = (data, cal2 = false, calName = '') => (data.items || []).map(ev => ({
    summary:     ev.summary     || ev.title || '',
    location:    ev.location    || ev.place || '',
    description: ev.description || '',
    start:       ev.start?.dateTime || ev.start?.date || ev.start || '',
    end:         ev.end?.dateTime   || ev.end?.date   || ev.end   || '',
    cal2,
    _calName: calName || '',
  }));

  const events = [];
  // Google Calendar API fetch (only if API key and calendar ID are set)
  if (AW_API_KEY && AW_CALENDAR_ID) {
    const urls = [buildUrl(AW_CALENDAR_ID)];
    if (AW_CALENDAR_ID_2) urls.push(buildUrl(AW_CALENDAR_ID_2));
    try {
      const responses = await Promise.all(urls.map(u => fetch(u)));
      for (const res of responses) {
        if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e.error && e.error.message) || 'API ' + res.status); }
      }
      const datas = await Promise.all(responses.map(r => r.json()));
      datas.forEach((data, idx) => events.push(...parseEvents(data, idx === 1, idx === 0 ? AW_CAL1_NAME : AW_CAL2_NAME)));
    } catch(e) {
      if (!AW_ICAL_URL) throw e; // Re-throw only if no iCal fallback
      console.warn('Google API failed, using iCal only:', e);
    }
  }
  // Fetch iCal sources
  const icalSources = [];
  if (AW_ICAL_URL) icalSources.push({ url: AW_ICAL_URL, cal2: false, color: null });
  if (AW_CAL2_ICAL) icalSources.push({ url: AW_CAL2_ICAL, cal2: true, color: AW_CAL2_COLOR_CFG });
  if (AW_EXTRA_CALS && AW_EXTRA_CALS.length) {
    AW_EXTRA_CALS.forEach(function(ec) {
      if (ec.type === 'ical' && ec.url) icalSources.push({ url: ec.url, cal2: true, color: ec.color || 'lime', extraColor: ec.color || 'lime', extraName: ec.name || '' });
    });
  }
  for (const src of icalSources) {
    try {
      const proxyUrl = src.url.replace(/^webcal:\/\//i,'https://');
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(proxyUrl)}`);
      const text = await res.text();
      const parsed = awParseICal(text).map(ev => ({ ...ev, cal2: src.cal2, _extraColor: src.extraColor || null, _calName: src.extraName || (src.cal2 ? (AW_CAL2_NAME||'') : (AW_CAL1_NAME||'')) }));
      events.push(...parsed);
    } catch(e) { console.warn('iCal fetch failed:', src.url, e); }
  }
  // Also fetch extra Google calendars
  if (AW_EXTRA_CALS && AW_EXTRA_CALS.length && AW_API_KEY) {
    const extraGoogleCals = AW_EXTRA_CALS.filter(ec => ec.type === 'google' && ec.url);
    for (const ec of extraGoogleCals) {
      try {
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(ec.url)}/events`
          + `?key=${AW_API_KEY}&timeMin=${encodeURIComponent(tMin)}&timeMax=${encodeURIComponent(tMax)}&singleEvents=true&orderBy=startTime&maxResults=250`;
        const res = await fetch(url);
        const data = await res.json();
        const parsed = parseEvents(data, true);
        // Apply custom color
        if (ec.color) parsed.forEach(ev => { ev._extraColor = ec.color; });
        events.push(...parsed);
      } catch(e) { console.warn('Extra Google cal failed:', ec.url, e); }
    }
  }
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  return events;
}

// ── HTML builders ─────────────────────────────────────────────────────────────

const PIN = `<svg class="aw-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`;

// Parse ECAM description: extract teacher, map link, visio link, transport info
function awParseDesc(raw) {
  if (!raw) return { teacher: '', mapUrl: '', visioUrl: '', visioLabel: '', transport: null };
  const text = raw.replace(/<[^>]*>/g, '').replace(/\\n/g, '\n');

  // ── Teacher ──────────────────────────────────────────────────────────────────
  let teacher = '';
  const formBlock = text.match(/Formateur[^:]*:([\s\S]*?)(?:Participants|---|-{3}|$)/i);
  if (formBlock) {
    const names = [...formBlock[1].matchAll(/[-\u2013\u2022]?\s*([A-Z\u00C0-\u017E]+(?:[\s\-][A-Z\u00C0-\u017E]+)*\s+[A-Z\u00C0-\u017E][a-z\u00C0-\u017E]+(?:[\-][A-Z\u00C0-\u017E][a-z\u00C0-\u017E]+)*(?:\s+[A-Z\u00C0-\u017E][a-z\u00C0-\u017E]+(?:[\-][A-Z\u00C0-\u017E][a-z\u00C0-\u017E]+)*)?)/g)]
      .map(m => m[1].trim())
      .filter(n => n.length > 2 && !n.includes('@'));
    teacher = names.join(', ');
  }

  // ── Map link ─────────────────────────────────────────────────────────────────
  const mapMatch = text.match(/https?:\/\/(?:www\.)?openstreetmap\.[^\s]+/i)
                || text.match(/https?:\/\/maps\.[^\s]+/i)
                || text.match(/https?:\/\/goo\.gl\/maps[^\s]*/i);
  const mapUrl = mapMatch ? mapMatch[0] : '';

  // ── Visio link ───────────────────────────────────────────────────────────────
  let visioUrl = '', visioLabel = '';
  const visioPatterns = [
    { re: /https?:\/\/[^\s]*zoom\.us\/[^\s]+/i,          label: 'Zoom' },
    { re: /https?:\/\/teams\.microsoft\.com\/[^\s]+/i,   label: 'Teams' },
    { re: /https?:\/\/meet\.google\.com\/[^\s]+/i,       label: 'Meet' },
    { re: /https?:\/\/[^\s]*webex\.com\/[^\s]+/i,        label: 'Webex' },
    { re: /https?:\/\/[^\s]*whereby\.com\/[^\s]+/i,      label: 'Whereby' },
    { re: /https?:\/\/[^\s]*jitsi[^\s]+/i,               label: 'Jitsi' },
    { re: /https?:\/\/[^\s]*discord\.gg\/[^\s]+/i,       label: 'Discord' },
    { re: /https?:\/\/[^\s]*bluejeans\.com\/[^\s]+/i,    label: 'BlueJeans' },
  ];
  for (const { re, label } of visioPatterns) {
    const m = text.match(re);
    if (m) { visioUrl = m[0]; visioLabel = label; break; }
  }

  // ── Transport info ────────────────────────────────────────────────────────────
  let transport = null;

  const trainNumMatch = text.match(/(?:TER|TGV|INOUI|OUIGO|INTERCIT[EÉ]S?|EUROSTAR|THALYS)\s*(?:N[°o]?\s*)?([\d]+)/i);
  const seatMatch     = text.match(/(?:voiture|voit\.?)\s*(\d+)[^\n]*(?:place|pl\.?)\s*(\d+)/i)
                     || text.match(/place\s*(\d+)[^\n]*voiture\s*(\d+)/i);
  const refMatch      = text.match(/r[eé]f[eé]rences?\s*[:]\s*([A-Z0-9]+)/i);
  const tripUrl       = text.match(/https?:\/\/sncf-connect\.com\/[^\s]+/i)
                     || text.match(/https?:\/\/[^\s]*\.sncf[^\s]*/i);

  // Only show transport if there's an actual train number or SNCF link — not for generic visio/Teams descriptions
  if (trainNumMatch) {
    const trainType = trainNumMatch[0].match(/TER|TGV|INOUI|OUIGO|INTERCIT[EÉ]|EUROSTAR|THALYS/i)?.[0]?.toUpperCase() || 'Train';
    let line = `${trainType} ${trainNumMatch[1]}`;
    if (seatMatch) line += ` — Voit. ${seatMatch[1]}, Pl. ${seatMatch[2]}`;
    if (refMatch)  line += ` — Réf: ${refMatch[1]}`;
    transport = { text: line, url: tripUrl ? tripUrl[0] : '' };
  } else if (tripUrl) {
    // SNCF link present but no train number — show route if available
    const routeMatch = text.match(/([A-ZÀ-Ö][a-zà-öA-ZÀ-Ö\s\-]+?)\s*->\s*([A-ZÀ-Ö][a-zà-öA-ZÀ-Ö\s\-]+)/);
    let line = routeMatch ? `${routeMatch[1].trim()} → ${routeMatch[2].trim()}` : 'Voir le voyage';
    if (refMatch) line += ` — Réf: ${refMatch[1]}`;
    transport = { text: line, url: tripUrl[0] };
  }

  return { teacher, mapUrl, visioUrl, visioLabel, transport };
}

// Compact list row
function awRowHtml(ev, idx = -1) {
  const allDay    = ev.start.length === 10;
  const now       = !allDay && awIsNow(ev.start, ev.end);
  const past      = !allDay && !now && awIsPast(ev.end);
  const pct       = now ? awProgress(ev.start, ev.end) : 0;
  const dur       = !allDay ? awFmtDuration(ev.start, ev.end) : '';
  const fullName  = ev.summary || '(Sans titre)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const color     = ev._extraColor || awColorFor(shortName, ev.cal2);

  const typeMatch  = fullName.match(/\b(CM|TD|TP|DS|Exam|Cours)\b/i);
  const typeBadge  = typeMatch ? typeMatch[0].toUpperCase() : '';
  const groupMatch = fullName.match(/(?:AB|CD|EF|GH|A&M\d[A-Z\s]*(?:S\d+)?)/i);
  const group      = groupMatch ? groupMatch[0].trim() : '';

  const colorHex = AW_COLOR_HEX;
  const accent = colorHex[color] || '#3b82f6';

  const _th=document.documentElement.dataset.theme;
  const isLM = _th==='light' ? true : _th==='dark' ? false : window.matchMedia('(prefers-color-scheme: light)').matches;

  const badges = [
    typeBadge ? `<span class="aw-row-badge" style="color:${accent};border-color:${accent}${isLM?'33':'44'};background:${accent}${isLM?'18':'22'}">${typeBadge}</span>` : '',
    group     ? `<span class="aw-row-badge aw-row-badge--group">${group}</span>` : '',
    now       ? `<span class="aw-now-badge" style="color:${accent};background:${accent}${isLM?'18':'22'};border-color:${accent}${isLM?'44':'55'}">${window._t?window._t('inProgress'):'In progress'}</span>` : '',
  ].filter(Boolean).join('');

  const { teacher, mapUrl, visioUrl, visioLabel, transport } = awParseDesc(ev.description || '');

  const PERSON_SVG  = `<svg class="aw-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`;
  const VISIO_SVG   = `<svg class="aw-icon" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="9" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 7l4-2v6l-4-2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
  const TRAIN_SVG   = `<svg class="aw-icon" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M3 8h10M6 11.5l-1.5 2.5M10 11.5l1.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5.5" cy="9.5" r=".8" fill="currentColor"/><circle cx="10.5" cy="9.5" r=".8" fill="currentColor"/></svg>`;

  const nowStyle = now
    ? `background:${accent}${isLM?'1a':'26'};border-left-color:${accent}${isLM?'dd':'bb'};`
    : '';

  const msTillStart  = new Date(ev.start) - Date.now();
  const startsSoon   = !now && !past && !allDay && msTillStart > 0 && msTillStart < 10800000;

  const CLOCK_SVG = `<svg style="display:inline;vertical-align:middle;margin-right:3px;opacity:.5" width="11" height="11" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;

  return `<div class="aw-event${now ? ' aw-event-now' : ''}${past ? ' aw-event-past' : ''}" data-ev="${idx}" onclick="awPopOpen(this,${idx})" style="${nowStyle}cursor:pointer;">
    <div class="aw-color-dot" data-color="${color}"></div>
    <div class="aw-body">
      <div class="aw-name">${shortName}${badges ? `<span class="aw-row-badges">${badges}</span>` : ''}</div>
      ${ev.location ? `<div class="aw-meta">${PIN}${ev.location}${mapUrl ? ' <a class="aw-map-link" href="' + mapUrl + '" target="_blank" rel="noopener">↗ Locate</a>' : ''}</div>` : ''}
      ${teacher     ? `<div class="aw-meta">${PERSON_SVG}${teacher}</div>` : ''}
      ${visioUrl    ? `<div class="aw-meta">${VISIO_SVG}<a class="aw-map-link" href="${visioUrl}" target="_blank" rel="noopener">↗ Join ${visioLabel}</a></div>` : ''}
      ${transport   ? `<div class="aw-meta">${TRAIN_SVG}${transport.url ? `<a class="aw-map-link" href="${transport.url}" target="_blank" rel="noopener">↗ ${transport.text}</a>` : transport.text}</div>` : ''}
      ${now         ? `<div class="aw-progress" style="background:${accent}${isLM?'18':'22'}"><div class="aw-progress-bar" data-ev-bar="${idx}" style="width:${pct}%;background:${accent}"></div></div>` : ''}
    </div>
    <div class="aw-time">
      ${allDay
        ? `<span class="aw-time-single">${(()=>{
            const locale=window._currentLocale||'en-GB';
            const sd=new Date(ev.start+'T00:00:00');
            const rawEnd=ev.end||ev.start;
            // iCal all-day end is exclusive — subtract 1 day
            const ed=new Date(rawEnd+'T00:00:00');
            const isMulti=(ed-sd)>86400000-1;
            if(!isMulti){return (window._getLang&&window._getLang()==='la'&&window._fmtDateLa)?window._fmtDateLa(sd,{noYear:true}):sd.toLocaleDateString(locale,{day:'numeric',month:'long'});}
            const edDisp=new Date(ed);edDisp.setDate(edDisp.getDate()-1);
            const days=Math.round((ed-sd)/86400000);
            const fmt=(d)=>(window._getLang&&window._getLang()==='la'&&window._fmtDateLa)?window._fmtDateLa(d,{noYear:true}):d.toLocaleDateString(locale,{day:'numeric',month:'long'});
            const dayWord=(window._getLang&&window._getLang()==='fr')?( days===1?'jour':'jours'):(days===1?'day':'days');
            return fmt(sd)+' – '+fmt(edDisp)+' ('+days+' '+dayWord+')';
          })()}</span>`
        : `<span class="aw-time-start">${awFmtTime(ev.start)}</span><span class="aw-time-end">${awFmtTime(ev.end)}${dur?` <span style="opacity:.4;font-size:9px">(${dur})</span>`:''}</span>`}
      ${startsSoon ? `<div class="aw-dur" data-timer="soon" data-ev="${idx}" style="color:${accent}">${window._t?window._t('in'):'in '}${awFmtRemaining(ev.start)}</div>` : ''}
      ${now        ? `<div class="aw-dur" data-timer="left" data-ev="${idx}" style="color:${accent}">${awFmtRemaining(ev.end)} ${window._t?window._t('left'):'left'}</div>` : ''}
    </div>
  </div>`;
}

// Overlap layout
// Rules:
// - Sort by start time, longest first if same start
// - Start diff < 23min → side-by-side at same indent level
// - Start diff ≥ 23min → goes under the deepest active event
// Clamp start/end hours for multi-day events to the displayed day [0..24]
function awClampStartH(ev, viewDs) {
  const startD = ev.start.slice(0,10);
  if (viewDs && startD !== viewDs) {
    // Event started before this day → starts at 0 (midnight)
    return 0;
  }
  return awTimeToHours(ev.start);
}
function awClampEndH(ev, viewDs) {
  const endD = ev.end ? ev.end.slice(0,10) : '';
  if (viewDs && endD && endD !== viewDs) {
    // Event ends after this day → show until 24 (midnight end of day)
    return 24;
  }
  return awTimeToHours(ev.end, ev.start);
}
function awLayoutColumns(timedItems, viewDs) {
  const THRESHOLD = 23 / 60;

  const items = timedItems.map(({ev, i}) => ({
    ev, i,
    s: awClampStartH(ev, viewDs),
    e: awClampEndH(ev, viewDs),
    col: 0, totalCols: 1, sameStart: false,
    stackDepth: 0, isTopStacked: true, visibleHeight: null,
  }));

  // Sort: start time asc, then longest duration first
  items.sort((a, b) => a.s - b.s || (b.e - b.s) - (a.e - a.s));

  // Assign stackDepth in order: depth = deepest active stacked item's depth + 1
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const activeStacked = items.slice(0, i).filter(p =>
      p.e > item.s &&                    // still active when item starts
      (item.s - p.s) >= THRESHOLD        // started >= 23min before
    );
    item.stackDepth = activeStacked.length > 0
      ? Math.max(...activeStacked.map(p => p.stackDepth)) + 1
      : 0;
  }

  // Find side-by-side clusters: pairwise overlap + same stackDepth + diff < threshold
  const assigned = new Set();
  for (const item of items) {
    if (assigned.has(item)) continue;

    const trueCluster = [item];
    for (const p of items) {
      if (p === item || assigned.has(p)) continue;
      if (
        p.stackDepth === item.stackDepth &&
        Math.abs(p.s - item.s) < THRESHOLD &&
        p.s < item.e && p.e > item.s &&
        trueCluster.every(q => p.s < q.e && p.e > q.s && Math.abs(p.s - q.s) < THRESHOLD)
      ) {
        trueCluster.push(p);
      }
    }

    if (trueCluster.length > 1) {
      trueCluster.sort((a, b) => a.s - b.s || (b.e - b.s) - (a.e - a.s));
      trueCluster.forEach((p, idx) => {
        p.col = idx; p.totalCols = trueCluster.length; p.sameStart = true;
        assigned.add(p);
      });
    } else {
      item.col = item.stackDepth; item.totalCols = 1; item.sameStart = false;
      assigned.add(item);
    }
  }

  // Mark top stacked, compute visible height, and nextCoverStart for all stacked
  for (const item of items) {
    if (item.sameStart) { item.isTopStacked = false; item.visibleHeight = null; item.nextCoverStart = null; continue; }
    const stackGroup = items.filter(p => !p.sameStart && p.s < item.e && p.e > item.s);
    const maxCol = Math.max(...stackGroup.map(p => p.col));
    item.isTopStacked = item.col === maxCol;

    // Find next event that starts after this one and has higher col (covers it)
    const covering = items.filter(p =>
      p !== item && p.s > item.s && p.s < item.e &&
      (p.sameStart ? p.stackDepth > item.col : p.col > item.col)
    );
    item.nextCoverStart = covering.length > 0 ? Math.min(...covering.map(p => p.s)) : null;

    if (!item.isTopStacked) {
      item.visibleHeight = item.nextCoverStart !== null
        ? Math.max((item.nextCoverStart - item.s) * AW_PX_PER_HOUR - 2, 18)
        : null;
    } else {
      item.visibleHeight = null;
    }
  }

  return items;
}

// Time-grid event block — true side-by-side only when same start time
function awGridEvHtml(ev, idx, col = 0, totalCols = 1, sameStart = false, stackDepth = 0, isTopStacked = true, visibleHeight = null, nextCoverStart = null, viewDs = null) {
  const now       = awIsNow(ev.start, ev.end);
  const past      = !now && awIsPast(ev.end);
  const fullName  = ev.summary || '(Sans titre)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const loc       = ev.location ? ev.location.split(',')[0].trim() : '';
  const color     = ev._extraColor || awColorFor(shortName, ev.cal2);

  const colorHex = AW_COLOR_HEX;
  const accent = colorHex[color] || '#3b82f6';
  const _th=document.documentElement.dataset.theme;
  const isLM = _th==='light' ? true : _th==='dark' ? false : window.matchMedia('(prefers-color-scheme: light)').matches;

  // Special case: white/liturgical color — always use parchment bg + dark text
  const isWhite = color === 'white';
  const bgAlpha    = isWhite ? 'ff' : isLM ? '33' : '44';
  const bg = isWhite ? accent : `${accent}${bgAlpha}`;
  const glowColor = now ? `${accent}33` : 'transparent';
  const borderColor = isWhite ? '#c8b89a' : accent;
  const textColor   = isWhite ? 'rgba(60,40,20,0.88)' : isLM ? 'rgba(10,20,40,0.88)' : 'rgba(255,255,255,0.92)';
  const timeColor   = isWhite ? 'rgba(60,40,20,0.55)' : isLM ? 'rgba(10,20,40,0.52)' : 'rgba(255,255,255,0.6)';
  const locColor    = isWhite ? 'rgba(60,40,20,0.42)' : isLM ? 'rgba(10,20,40,0.38)' : 'rgba(255,255,255,0.45)';

  const startH  = awClampStartH(ev, viewDs);
  const endH    = awClampEndH(ev, viewDs);
  const clampS  = Math.max(startH, AW_HOUR_START);
  const clampE  = Math.min(endH,   AW_HOUR_END);
  if (clampS >= clampE) return '';

  const top    = (clampS - AW_HOUR_START) * AW_PX_PER_HOUR;
  const height = Math.max((clampE - clampS) * AW_PX_PER_HOUR - 2, 18);
  const pct    = now ? awProgress(ev.start, ev.end) : 0;

  let leftStyle, rightStyle;

  if (sameStart && totalCols > 1) {
    const INDENT   = 12;
    const base     = stackDepth * INDENT + 2;
    const colWidth = `calc((100% - ${base}px) / ${totalCols})`;
    leftStyle  = `calc(${base}px + ${col} * ${colWidth})`;
    rightStyle = col < totalCols - 1
      ? `calc(${totalCols - col - 1} * ${colWidth})`
      : `2px`;
  } else {
    const INDENT = 12;
    leftStyle  = `${col * INDENT + 2}px`;
    rightStyle = `2px`;
  }

  const zIndex   = sameStart ? 2 + stackDepth : 2 + col;
  const HIDE_MIN = 45 / 60;
  const coveredSoon = nextCoverStart !== null && (nextCoverStart - awTimeToHours(ev.start)) < HIDE_MIN;
  const showTime = height >= 28 && (sameStart || isTopStacked) && !coveredSoon;
  const showLoc  = height >= 44 && loc && (sameStart || isTopStacked) && !coveredSoon;

  const { mapUrl } = awParseDesc(ev.description || '');

  const CLOCK_GEV = `<svg class="aw-gev-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
  const PIN_GEV   = `<svg class="aw-gev-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>`;

  return `<div class="aw-gev${now ? ' aw-gev-now' : ''}${past ? ' aw-gev-past' : ''}"
    data-color="${color}" data-ev="${idx}"
    style="top:${top}px;height:${height}px;left:${leftStyle};right:${rightStyle};z-index:${zIndex};cursor:pointer;background:${bg};${now ? `box-shadow:0 2px 10px ${glowColor};` : ''}"
    onclick="awPopOpen(this,${idx})"${isWhite?' data-white="1"':''}>
    <div class="aw-gev-accent" style="background:${borderColor}"></div>
    <div class="aw-gev-name">${shortName}</div>
    ${showTime ? `<div class="aw-gev-time">${CLOCK_GEV}${awFmtTime(ev.start)} \u2013 ${awFmtTime(ev.end)}</div>` : ''}
    ${showLoc  ? `<div class="aw-gev-loc">${PIN_GEV}${loc}</div>` : ''}
    ${now      ? `<div class="aw-gev-progress"><div class="aw-gev-progress-bar" style="width:${pct}%;background:${borderColor}"></div></div>` : ''}
  </div>`;
}


// ── Popover ───────────────────────────────────────────────────────────────────

let awEvCache = [];
let awLastUpdated = null;

function awUpdateTimer() {
  if (!awLastUpdated) return;
  const secs = Math.round((Date.now()-awLastUpdated)/1000);
  const mins = Math.floor(secs/60);
  const _lang=typeof window._getLang==='function'?window._getLang():'en';
  const fr=_lang==='fr', _la=_lang==='la';
  const txt=secs<10?(fr?'Mis à jour':_la?'Modo renovatum':'Just updated')
    :secs<60?(fr?`Mis à jour il y a ${secs}s`:_la?`Renovatum ${secs}s`:`Updated ${secs}s ago`)
    :secs<120?(fr?'Mis à jour il y a 1min':_la?'Renovatum 1min':'Updated 1min ago')
    :(fr?`Mis à jour il y a ${mins}min`:_la?`Renovatum ${mins}min`:`Updated ${mins}min ago`);
  ['aw-last-updated','nb-upd','acc-upd'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.textContent=txt;el.style.color='';}
  });
}

function awPopOpen(el, idx) {
  if(typeof _haptic==='function')_haptic('light');
  // Kill any pending remove timer and remove old pop immediately
  if (window._awPopRemoveTimer) { clearTimeout(window._awPopRemoveTimer); window._awPopRemoveTimer = null; }
  // Clean up previous outside listener before opening new pop
  if (window._awPopOutsideFn) { document.removeEventListener('click', window._awPopOutsideFn, true); window._awPopOutsideFn = null; }
  const oldPop = document.getElementById('aw-pop');
  if (oldPop) { if (window._awPopTimer) { clearInterval(window._awPopTimer); window._awPopTimer = null; } oldPop.remove(); }

  const ev      = awEvCache[idx];
  if (!ev) return;

  const fullName  = ev.summary || '(Sans titre)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const typeMatch = fullName.match(/\b(CM|TD|TP|DS|Exam|Cours)\b/i);
  const typeBadge = typeMatch ? typeMatch[0].toUpperCase() : '';
  const groupMatch = fullName.match(/(?:AB|CD|EF|GH|A&M\d[A-Z\s]*(?:S\d+)?)/i);
  const group = groupMatch ? groupMatch[0].trim() : '';
  const now   = awIsNow(ev.start, ev.end);
  const past  = !now && awIsPast(ev.end);
  const color = ev._extraColor || awColorFor(shortName, ev.cal2);
  const dur   = awFmtDuration(ev.start, ev.end);
  const pct   = now ? awProgress(ev.start, ev.end) : 0;
  const msTillStart = new Date(ev.start) - Date.now();
  const startsSoon  = !now && !past && msTillStart > 0 && msTillStart < 3600000;

  const { teacher, mapUrl, visioUrl, visioLabel, transport } = awParseDesc(ev.description || '');

  const colorHex = AW_COLOR_HEX;
  const accent = colorHex[color] || '#3b82f6';

  const pop = document.createElement('div');
  pop.id = 'aw-pop';
  pop.className = 'aw-pop';
  // Let CSS handle background via data-theme / prefers-color-scheme
  // Only set the accent color as a CSS custom property for the tint
  const hexToRgb = h => { const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); return `${r},${g},${b}`; };
  const accentRgb = hexToRgb(accent);
  pop.style.setProperty('--pop-accent-rgb', accentRgb);
  // No border-left — handled by CSS accent bar
  pop.innerHTML = `
    <div class="aw-pop-accent" style="background:${accent}"></div>
    <button class="aw-pop-close" onclick="awPopClose()" aria-label="Fermer">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="aw-pop-body">
      <div class="aw-pop-title">${fullName}</div>
      ${ev._calName ? `<div class="aw-pop-cal-name"><span class="aw-pop-cal-dot" style="background:${accent}"></span>${ev._calName}</div>` : ''}
      <div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span>${(()=>{
          if(ev.start.length!==10)return awFmtTime(ev.start)+' \u2013 '+awFmtTime(ev.end)+(dur?' <span class=\"aw-pop-muted\">('+dur+')</span>':'');
          const locale2=window._currentLocale||'en-GB';
          const isLa=window._getLang&&window._getLang()==='la';
          const sd2=new Date(ev.start+'T00:00:00');
          const rawEnd2=ev.end||ev.start;
          const ed2=new Date(rawEnd2+'T00:00:00');
          const isM=(ed2-sd2)>86400000-1;
          if(isLa)return window._fmtDateLa?window._fmtDateLa(sd2,isM?{}:{noYear:true})+(isM?(' – '+window._fmtDateLa(new Date(ed2.getTime()-86400000),{noYear:true})+' ('+Math.round((ed2-sd2)/86400000)+' dies)'):''): sd2.toLocaleDateString();
          if(!isM)return sd2.toLocaleDateString(locale2,{weekday:'long',day:'numeric',month:'long'});
          const edD=new Date(ed2);edD.setDate(edD.getDate()-1);
          const days2=Math.round((ed2-sd2)/86400000);
          const fmt2=(d)=>d.toLocaleDateString(locale2,{day:'numeric',month:'long'});
          const dw=(window._getLang&&window._getLang()==='fr')?(days2===1?'jour':'jours'):(days2===1?'day':'days');
          return fmt2(sd2)+' \u2013 '+fmt2(edD)+' ('+days2+'\u00a0'+dw+')';
        })()}</span>
      </div>
      ${ev.location ? `<div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
        <span>${ev.location.replace(/\\n/g,' · ').replace(/\n/g,' · ').split('\n')[0]}${mapUrl ? ' <a class="aw-map-link" href="' + mapUrl + '" target="_blank" rel="noopener" style="color:var(--accent)">\u2197 Locate</a>' : ''}</span>
      </div>` : ''}
      ${teacher ? `<div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span>${teacher}</span>
      </div>` : ''}
      ${visioUrl ? `<div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="9" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 7l4-2v6l-4-2" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
        <span><a class="aw-map-link" href="${visioUrl}" target="_blank" rel="noopener" style="color:var(--accent)" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">\u2197 Join ${visioLabel}</a></span>
      </div>` : ''}
      ${transport ? `<div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><rect x="3" y="2" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/><path d="M3 8h10M6 11.5l-1.5 2.5M10 11.5l1.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="5.5" cy="9.5" r=".8" fill="currentColor"/><circle cx="10.5" cy="9.5" r=".8" fill="currentColor"/></svg>
        <span>${transport.url ? `<a class="aw-map-link" href="${transport.url}" target="_blank" rel="noopener" style="color:var(--accent)" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">\u2197 ${transport.text}</a>` : transport.text}</span>
      </div>` : ''}
      ${typeBadge || group || startsSoon? `<div class="aw-pop-tags">
        ${typeBadge ? `<span class="aw-pop-tag" style="border-color:${accent};color:${accent}">${typeBadge}</span>` : ''}
        ${group     ? `<span class="aw-pop-tag">${group}</span>` : ''}
        ${now       ? `<span class="aw-pop-tag aw-pop-tag-now" style="color:${accent};background:${accent}18;border-color:${accent}40">${window._t?window._t('inProgress'):'In progress'}</span>` : ''}
        ${past      ? `<span class="aw-pop-tag aw-pop-tag-past">${window._t?window._t('completed'):'Done'}</span>` : ''}
        ${startsSoon ? `<span class="aw-pop-tag">${window._t?window._t("startingSoon"):"STARTING SOON"}</span>` : ''}
      </div>` : (now || past) ? `<div class="aw-pop-tags">
        ${now  ? `<span class="aw-pop-tag aw-pop-tag-now" style="color:${accent};background:${accent}18;border-color:${accent}40">${window._t?window._t('inProgress'):'In progress'}</span>` : ''}
        ${past ? `<span class="aw-pop-tag aw-pop-tag-past">${window._t?window._t('completed'):'Done'}</span>` : ''}
      </div>` : ''}
      ${startsSoon ? `
        <div class="aw-pop-progress-label" style="justify-content:flex-end;gap:4px">
        <span>${window._t?window._t('inLabel'):'In'}</span>
        <span id="aw-pop-soon-cnt" style="font-weight:600;color:${accent}">${awFmtRemainingLong(ev.start)}</span>
      </div>` : ''}
      ${now ? `<div class="aw-pop-progress-wrap">
        <div id="aw-pop-bar" class="aw-pop-progress-bar" style="width:${pct}%;background:${accent}"></div>
      </div>
      <div class="aw-pop-progress-label">
        <span id="aw-pop-pct">${pct}% elapsed</span>
        <span id="aw-pop-rem">${awFmtRemainingLong(ev.end)} left</span>
      </div>` : ''}
      ${ev.description ? `<details class="aw-pop-desc-details">
        <summary class="aw-pop-desc-summary">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4.5L6 7.5L10 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          Description
        </summary>
        <div class="aw-pop-desc-body">${ev.description.replace(/\\n/g,'\n').replace(/\n/g,'<br>').replace(/\\,/g,',')}</div>
      </details>` : ''}
    </div>`;

  document.body.appendChild(pop);
  // Position: above tab bar, horizontally centered, near the tapped event
  const TAB_H = 49 + 22; // --tb + margin
  const safeBot = parseFloat(getComputedStyle(document.documentElement)
    .getPropertyValue('--sab') || '0') || 0;
  const maxBot = TAB_H + safeBot;
  const popW = Math.min(340, window.innerWidth - 24);
  pop.style.width = popW + 'px';
  pop.style.maxWidth = 'none';
  // Center horizontally
  pop.style.left = Math.round((window.innerWidth - popW) / 2) + 'px';
  pop.style.right = 'auto';
  // Place above tab bar, anchored to bottom
  pop.style.bottom = maxBot + 'px';
  pop.style.top = 'auto';

  requestAnimationFrame(() => pop.classList.add('visible'));

  // Live update timer every second if event is ongoing or starting soon
  if (now || startsSoon) {
    window._awPopTimer = setInterval(() => {
      if (now) {
        const bar  = document.getElementById('aw-pop-bar');
        const pctEl = document.getElementById('aw-pop-pct');
        const remEl = document.getElementById('aw-pop-rem');
        if (!bar || !pctEl || !remEl) { clearInterval(window._awPopTimer); return; }
        const p = awProgress(ev.start, ev.end);
        bar.style.width = p + '%';
        pctEl.textContent = p + '% ' + (window._t?window._t('elapsed'):'elapsed');
        remEl.textContent = awFmtRemainingLong(ev.end) + ' ' + (window._t?window._t('left'):'left');
      }
      if (startsSoon) {
        const cntEl = document.getElementById('aw-pop-soon-cnt');
        if (!cntEl) { clearInterval(window._awPopTimer); return; }
        const msLeft = new Date(ev.start) - Date.now();
        if (msLeft <= 0) { clearInterval(window._awPopTimer); cntEl.textContent = 'now'; return; }
        cntEl.textContent = awFmtRemainingLong(ev.start);
      }
    }, 1000);
  }

  // Outside-click handler with timestamp guard (avoids closing on the same tap that opened)
  if (window._awPopOutsideFn) {
    document.removeEventListener('click', window._awPopOutsideFn, true);
    window._awPopOutsideFn = null;
  }
  const _popOpenedAt = Date.now();
  window._awPopOutsideFn = function _awOutside(e) {
    // Ignore if fired within 80ms of opening (same click event bubbling)
    if (Date.now() - _popOpenedAt < 80) return;
    const p = document.getElementById('aw-pop');
    if (!p) { document.removeEventListener('click', _awOutside, true); window._awPopOutsideFn = null; return; }
    // Click inside pop → keep open
    if (p.contains(e.target)) return;
    // Click on a calendar event → awPopOpen will handle it, don't double-close
    if (e.target.closest('.aw-event,.aw-gev,.awd-allday-pill')) return;
    // Anything else → close
    awPopClose();
  };
  document.addEventListener('click', window._awPopOutsideFn, true);
}

function awPopClose() {
  // Clean up outside listener
  if (window._awPopOutsideFn) {
    document.removeEventListener('click', window._awPopOutsideFn, true);
    window._awPopOutsideFn = null;
  }
  if (window._awPopRemoveTimer) { clearTimeout(window._awPopRemoveTimer); window._awPopRemoveTimer = null; }
  const pop = document.getElementById('aw-pop');
  if (!pop) return;
  if (window._awPopTimer) { clearInterval(window._awPopTimer); window._awPopTimer = null; }
  pop.classList.remove('visible');
  const el = pop;
  window._awPopRemoveTimer = setTimeout(() => { el.remove(); window._awPopRemoveTimer = null; }, 200);
}

// ── Compact view ──────────────────────────────────────────────────────────────

function awRenderCompact(byDay, today) {
  const compact = document.getElementById('aw-compact');
  if (!compact) return;
  const nowTs = Date.now();

  const base = new Date(today + 'T00:00:00');
  let targetDay = null;
  const skipped = [];

  // Walk forward from today to find the next day with upcoming events
  for (let i = 0; i < AW_FETCH_DAYS; i++) {
    const d  = new Date(base); d.setDate(base.getDate() + i);
    const ds = awDateStr(d);
    const future = (byDay[ds] || []).filter(({ev}) =>
      ev.start.length > 10 && new Date(ev.end) > nowTs
    );
    if (future.length > 0) {
      targetDay = { ds, items: future.map(({ev}) => ev) };
      break;
    } else {
      skipped.push(ds);
    }
  }

  let html = '';

  // Show skipped days (max 6) with "no more events today / no events"
  const shown = skipped.slice(0, 6);
  if (shown.length > 0) {
    html += `<div class="aw-skipped-list">`;
    html += shown.map(ds => {
      const isToday = ds === today;
      const label   = awFmtDayLabel(ds, true);
      const msg = window._t ? window._t('noMoreToday') : 'No more events today';
      return `<div class="aw-skipped-row">
        <span class="aw-skipped-label${isToday ? ' today' : ''}">${label}${isToday ? ` <span class="aw-skipped-today-pill">${window._t?window._t('today2'):'Today'}</span>` : ''}</span>
        <span class="aw-skipped-msg">${msg}</span>
      </div>`;
    }).join('');
    html += `</div>`;
  }

  if (!targetDay) {
    const isWE = awIsWeekend(today);
    const nextMonday = (() => {
      const d = new Date(today + 'T00:00:00');
      const dow = d.getDay();
      d.setDate(d.getDate() + (dow === 0 ? 1 : 8 - dow));
      return awFmtDayLabel(awDateStr(d), true);
    })();
    if (isWE) {
      html += `<div class="aw-empty-state">
        <div class="aw-empty-icon">\u{1F33F}</div>
        <div class="aw-empty-title">${window._t?window._t('haveGreatWe'):'Have a great weekend!'}</div>
        <div class="aw-empty-sub">${window._t?window._t('nextClass'):'Next class'}: ${nextMonday}</div>
      </div>`;
    } else {
      html += `<div class="aw-empty-state">
        <div class="aw-empty-icon">\u2705</div>
        <div class="aw-empty-title">${window._t?window._t('noUpcoming'):'No upcoming events'}</div>
        <div class="aw-empty-sub">${window._t?window._t('enjoyBreak'):'Enjoy the break!'}</div>
      </div>`;
    }
    compact.innerHTML = html;
    return;
  }

  const isToday  = targetDay.ds === today;
  const dayLabel = awFmtDayLabel(targetDay.ds, true);
  html += `<div class="aw-compact-day-hd">
    <span class="aw-compact-day-label${isToday ? ' today' : ''}">${dayLabel}</span>
    ${isToday ? `<span class="aw-today-pill">${window._t?window._t('today2'):'Today'}</span>` : ''}
  </div>`;
  html += targetDay.items.map(ev => awRowHtml(ev, awEvCache.indexOf(ev))).join('');
  compact.innerHTML = html;
  // Scroll to today's section or first in-progress event
  setTimeout(function() {
    const inProg = compact.querySelector('.aw-event-now');
    const todayHd = compact.querySelector('.aw-compact-day-hd');
    const target = inProg || todayHd;
    if (target) target.scrollIntoView({block:'start'});
  }, 50);
}

// ── Time-grid calendar view ───────────────────────────────────────────────────

let awCalOffset = 0;

function awRenderCalendar(byDay, today) {
  const full = document.getElementById('aw-full');
  if (!full) return;

  const baseMonday = awMondayOf(new Date());
  const monday     = new Date(baseMonday);
  monday.setDate(baseMonday.getDate() + awCalOffset * 7);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return awDateStr(d);
  });

  const d0 = new Date(weekDays[0] + 'T00:00:00');
  const d6 = new Date(weekDays[6] + 'T00:00:00');
  const isCurrentWeek  = awCalOffset === 0;
  const isLastWeek     = awCalOffset >= AW_MAX_OFFSET;

  // "March 2026" — if week spans two months show "Mar – Apr 2026"
  const monthLabel = (() => {
    const _isLa = _isLatinLang();
    const month0 = _isLa ? _laFmtMonthLong(d0) : d0.toLocaleDateString((typeof window._appLocale==='function'?window._appLocale():(window._appLocale||'en-GB')), { month: 'long' });
    const year0  = d0.getFullYear();
    const year0D = _isLa ? (window._toRoman?window._toRoman(year0):year0) : year0;
    if (d0.getMonth() === d6.getMonth()) {
      return `<strong>${month0}</strong> <span class="aw-cal-year">${year0D}</span>`;
    }
    const month6 = _isLa ? _laFmtMonthShort(d6) : d6.toLocaleDateString((typeof window._appLocale==='function'?window._appLocale():(window._appLocale||'en-GB')), { month: 'short' });
    const year6  = d6.getFullYear();
    const yearSuffix = year0 === year6 ? ` <span class="aw-cal-year">${year6}</span>` : ` <span class="aw-cal-year">${year0}</span> \u2013 <span class="aw-cal-year">${year6}</span>`;
    return `<strong>${month0.slice(0,3)} \u2013 ${month6}</strong>${yearSuffix}`;
  })();

  let html = `<div class="aw-cal-nav">
    <div class="aw-cal-nav-left">
      <span class="aw-cal-month-label">${monthLabel}</span>
      ${isCurrentWeek ? '<span class="aw-cal-this-week-pill">This Week</span>' : ''}
    </div>
    <div class="aw-cal-nav-right">
      <button class="aw-cal-nav-btn${isCurrentWeek ? ' disabled' : ''}" onclick="awCalPrev()" ${isCurrentWeek ? 'disabled' : ''} title="Previous week">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="aw-cal-today-btn${isCurrentWeek ? ' disabled' : ''}" onclick="awCalGoToday()" ${isCurrentWeek ? 'disabled' : ''} title="Go to current week">Today</button>
      <button class="aw-cal-nav-btn${isLastWeek ? ' disabled' : ''}" onclick="awCalNext()" ${isLastWeek ? 'disabled' : ''} title="Next week">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
  </div>`;

  const gridH = (AW_HOUR_END - AW_HOUR_START) * AW_PX_PER_HOUR;

  html += `<div class="aw-tgrid-scroll">`;
  html += `<div class="aw-tgrid" style="--grid-h:${gridH}px">`;

  // ISO week number
  const weekNum = (() => {
    const d = new Date(monday);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const w1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - w1) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  })();

  html += `<div class="aw-tgrid-top">`;
  html += `<div class="aw-tgutter-corner"><span class="aw-week-num">W${weekNum}</span></div>`;
  html += `<div class="aw-tdays-head-wrap">`;
  html += `<div class="aw-tday-heads">`;
  for (const ds of weekDays) {
    const isToday = ds === today;
    const isWE    = awIsWeekend(ds);
    html += `<div class="aw-tday-head${isToday ? ' today' : ''}${isWE ? ' we' : ''}">
      <span class="aw-tday-dow">${awWeekdayShort(ds)}</span>
      <span class="aw-tday-num${isToday ? ' today' : ''}">${awDayNum(ds)}</span>
    </div>`;
  }
  html += `</div></div></div>`;

  html += `<div class="aw-tgrid-bottom">`;

  html += `<div class="aw-tgutter">`;
  for (let h = AW_HOUR_START; h <= AW_HOUR_END; h++) {
    const top = (h - AW_HOUR_START) * AW_PX_PER_HOUR;
    html += `<div class="aw-thour" style="top:${top}px">${awPad(h)}:00</div>`;
  }
  html += `</div>`;

  html += `<div class="aw-tdays">`;
  html += `<div class="aw-tgrid-body" style="height:${gridH}px">`;

  html += `<div class="aw-hlines">`;
  for (let h = AW_HOUR_START; h <= AW_HOUR_END; h++) {
    const top = (h - AW_HOUR_START) * AW_PX_PER_HOUR;
    html += `<div class="aw-hline" style="top:${top}px"></div>`;
  }
  html += `</div>`;

  const now = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;
  if (awCalOffset === 0 && nowH >= AW_HOUR_START && nowH <= AW_HOUR_END) {
    const todayIdx = weekDays.indexOf(today);
    if (todayIdx !== -1) {
      const topNow = (nowH - AW_HOUR_START) * AW_PX_PER_HOUR;
      const leftPct = (todayIdx / 7) * 100;
      const widthPct = (1 / 7) * 100;
      html += `<div class="aw-now-line" style="top:${topNow}px;left:${leftPct}%;width:${widthPct}%">
        <div class="aw-now-dot"></div>
      </div>`;
    }
  }

  html += `<div class="aw-tcols" id="aw-tcols">`;

  for (const ds of weekDays) {
    const isToday = ds === today;
    const isWE    = awIsWeekend(ds);
    const isPast  = ds < today;
    const items   = byDay[ds] || [];
    const timed   = items.filter(({ev}) => ev.start.length > 10);

    const laid = awLayoutColumns(timed, ds);
    html += `<div class="aw-tcol${isToday ? ' today' : ''}${isWE ? ' we' : ''}${isPast && !isToday ? ' past' : ''}">`;
    html += laid.map(({ev, i, col, totalCols, sameStart, stackDepth, isTopStacked, visibleHeight, nextCoverStart}) => awGridEvHtml(ev, i, col, totalCols, sameStart, stackDepth, isTopStacked, visibleHeight, nextCoverStart, ds)).join('');
    html += `</div>`;
  }
  html += `</div>`;

  html += `</div></div></div></div>`;

  full.innerHTML = html;
}

// Nombre de semaines complètes disponibles au-delà de la semaine courante
// AW_FETCH_DAYS couvre les jours chargés ; on soustrait 7 (semaine courante déjà incluse)
// puis on divise par 7 pour obtenir le nombre de semaines suivantes accessibles.
const AW_MAX_OFFSET = Math.floor(AW_FETCH_DAYS / 7);

function awCalPrev()    { if (awCalOffset > 0) { awCalOffset--; if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); } }
function awCalNext()    { if (awCalOffset < AW_MAX_OFFSET) { awCalOffset++; if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); } }
function awCalGoToday() { awCalOffset = 0;         if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); }

// ── Main ──────────────────────────────────────────────────────────────────────

function awRender(events) {
  const today = awToday();
  const byDay = {};
  awEvCache = events;
  awLastUpdated = Date.now();
  if (typeof window._hideSplash === 'function') window._hideSplash();
  awUpdateTimer();
  events.forEach((ev, i) => {
    const startD = ev.start.slice(0, 10);
    const isAllDay = ev.start.length === 10;
    if (isAllDay) {
      // All-day event: end date in iCal is exclusive (day after last day)
      const rawEnd = ev.end ? ev.end.slice(0, 10) : startD;
      // Exclusive end: the event covers [startD, rawEnd)
      let cur = new Date(startD + 'T00:00:00');
      const endEx = new Date(rawEnd + 'T00:00:00');
      // If end <= start (malformed), just add to start
      if (endEx <= cur) {
        (byDay[startD] = byDay[startD] || []).push({ ev, i });
      } else {
        while (cur < endEx) {
          const ds = awDateStr(cur);
          (byDay[ds] = byDay[ds] || []).push({ ev, i });
          cur.setDate(cur.getDate() + 1);
        }
      }
      return;
    }
    // Timed events that span multiple days
    if (ev.start.length > 10 && ev.end.length > 10) {
      const endD = ev.end.slice(0, 10);
      if (endD !== startD) {
        let cur = new Date(startD + 'T00:00:00');
        const endDate = new Date(endD + 'T00:00:00');
        while (cur <= endDate) {
          const ds = awDateStr(cur);
          (byDay[ds] = byDay[ds] || []).push({ ev, i });
          cur.setDate(cur.getDate() + 1);
        }
        return;
      }
    }
    (byDay[startD] = byDay[startD] || []).push({ ev, i });
  });
  window._awByDay = byDay;

  awRenderCompact(byDay, today);
  awRenderCalendar(byDay, today);

  const btn = document.getElementById('aw-toggle-btn');
  if (btn) btn.style.display = 'flex';
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function awToggle() {
  const full    = document.getElementById('aw-full');
  const compact = document.getElementById('aw-compact');
  const btn     = document.getElementById('aw-toggle-btn');
  const open    = full.classList.contains('open');
  full.classList.toggle('open', !open);
  compact.style.display = open ? 'block' : 'none';
  btn.classList.toggle('open', !open);
  btn.querySelector('.aw-btn-label').textContent = open ? 'Calendar' : 'Show less';
}

// ── Init ──────────────────────────────────────────────────────────────────────

let awReloadTimer = null;
let awIsOnline = navigator.onLine;

async function awInit() {
  if (!_loadCfg()) {
    if (typeof showOnboarding === 'function') showOnboarding();
    return;
  }
  if (!navigator.onLine) { awScheduleReload(); return; }
  try {
    awRender(await awFetch());
    // Clear any offline error state
    const el = document.getElementById('aw-last-updated');
    if (el) el.style.color = '';
  } catch(e) {
    const c = document.getElementById('aw-compact');
    if (c && !awEvCache.length) {
      c.innerHTML = `<div class="aw-state">Unable to load agenda.<br><small style="opacity:.5">${e.message}</small></div>`;
    }
    // Show subtle error on last-updated label
    const el = document.getElementById('aw-last-updated');
    if (el) { el.textContent = 'Update failed'; el.style.color = 'var(--rose, #f43f5e)'; }
  }
  awScheduleReload();
}

function awScheduleReload() {
  if (awReloadTimer) clearTimeout(awReloadTimer);
  awReloadTimer = setTimeout(awInit, 30 * 1000);
}

// Reload immediately when tab becomes visible again
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Only reload if last update was more than 30s ago
    const stale = !awLastUpdated || (Date.now() - awLastUpdated) > 30 * 1000;
    if (stale) awInit();
  }
});

// Reload when connection comes back online
window.addEventListener('online', () => {
  awIsOnline = true;
  awInit();
});
window.addEventListener('offline', () => {
  awIsOnline = false;
  const el = document.getElementById('aw-last-updated');
  if (el) { el.textContent = 'Offline'; el.style.color = 'var(--amber, #f59e0b)'; }
});

awInit();
setInterval(awUpdateTimer, 10 * 1000);

// ── Live compact timers ───────────────────────────────────────────────────────
setInterval(() => {
  if (!awEvCache.length) return;

  // Detect event start or end → force reload
  for (const ev of awEvCache) {
    if (ev.start.length === 10) continue; // skip all-day
    const msTillStart = new Date(ev.start) - Date.now();
    const msTillEnd   = new Date(ev.end)   - Date.now();
    if ((msTillStart > -1000 && msTillStart <= 0) ||
        (msTillEnd   > -1000 && msTillEnd   <= 0)) {
      awInit();
      return;
    }
  }

  // Update "left" timers (ongoing events)
  document.querySelectorAll('[data-timer="left"]').forEach(el => {
    const idx = parseInt(el.dataset.ev);
    const ev  = awEvCache[idx];
    if (!ev) return;
    if (!awIsNow(ev.start, ev.end)) return;
    el.textContent = awFmtRemaining(ev.end) + ' ' + (window._t?window._t('left'):'left');
    // Update progress bar
    const bar = document.querySelector(`[data-ev-bar="${idx}"]`);
    if (bar) bar.style.width = awProgress(ev.start, ev.end) + '%';
  });

  // Update "soon" timers (upcoming events)
  document.querySelectorAll('[data-timer="soon"]').forEach(el => {
    const idx = parseInt(el.dataset.ev);
    const ev  = awEvCache[idx];
    if (!ev) return;
    const msTill = new Date(ev.start) - Date.now();
    if (msTill <= 0 || msTill >= 10800000) return;
    el.textContent = (window._t?window._t('in'):'in ') + awFmtRemaining(ev.start);
  });
}, 1000);
// ── DAY GRID (Week view) ──────────────────────────────────────────────────────
function awRenderDay(ds, container, preserveScroll) {
  if (!container) return;
  container.style.paddingTop = '0px'; // reset before recalculating allday height
  const byDay=window._awByDay||{}, today=awToday(), isToday=ds===today;
  const navH=(document.getElementById('nb')||{offsetHeight:56}).offsetHeight;
  const wkH=(document.getElementById('wk-hdr')||{offsetHeight:80}).offsetHeight;
  const availH=Math.max(200, window.innerHeight-navH-wkH-64);
  AW_PX_PER_HOUR=Math.max(48,Math.round(availH/11));
  const gridH=24*AW_PX_PER_HOUR;
  const items=byDay[ds]||[];
  // All-day events: render as top banner
  const allDay=items.filter(x=>x.ev.start.length===10);
  const timed=items.filter(x=>x.ev.start.length>10);
  const laid=awLayoutColumns(timed, ds);
  const now=new Date(), nowH=now.getHours()+now.getMinutes()/60;
  let html=`<div class="awd-grid" style="height:${gridH}px"><div class="awd-gutter">`;
  for(let h=1;h<24;h++) html+=`<div class="awd-hour-lbl" style="top:${h*AW_PX_PER_HOUR}px">${String(h).padStart(2,'0')}:00</div>`;
  html+=`</div><div class="awd-col">`;
  for(let h=0;h<=24;h++) html+=`<div class="${h%6===0?'awd-hline major':'awd-hline'}" style="top:${h*AW_PX_PER_HOUR}px"></div>`;
  if(isToday) html+=`<div class="awd-now" style="top:${nowH*AW_PX_PER_HOUR}px"><div class="awd-now-dot"></div></div>`;
  html+=laid.map(({ev,i,col,totalCols,sameStart,stackDepth,isTopStacked,visibleHeight,nextCoverStart})=>
    awGridEvHtml(ev,i,col,totalCols,sameStart,stackDepth,isTopStacked,visibleHeight,nextCoverStart,ds)).join('');
  html+='</div></div>';
  container.innerHTML=html;
  // All-day zone — Apple Calendar style, absolute overlay above grid
  var oldRow=container.parentElement&&container.parentElement.querySelector('.awd-allday-row');
  if(oldRow)oldRow.remove();
  var n=allDay.length;
  // Row height: same compact formula as Apple Calendar
  // PILL_H=22px, PILL_GAP=2px, V_PAD=5px each side
  var PILL_H=22,PILL_GAP=2,V_PAD=5;
  var COLS=2; // 2-column grid
  var pillRows=Math.ceil(n/COLS);
  var visRows=n===0?0:Math.min(pillRows,2); // max 2 rows visible (2.5 if >4)
  var rowH;
  if(n===0)       rowH=V_PAD+PILL_H+V_PAD; // same as 1 row so grids align
  else if(n<=4)   rowH=V_PAD + visRows*PILL_H + (visRows-1)*PILL_GAP + V_PAD;
  else            rowH=V_PAD + Math.round(2.5*PILL_H) + PILL_GAP + V_PAD; // 2.5 rows hint
  var allDayRow=document.createElement('div');
  allDayRow.className='awd-allday-row'+(n===0?' awd-allday-empty':'');
  allDayRow.style.height=rowH+'px';
  allDayRow.dataset.rowH=String(rowH);
  // Label
  // Gutter: full-height div that matches the time-gutter width + border
  var gutterEl=document.createElement('div');
  gutterEl.className='awd-allday-gutter';
  var labelEl=document.createElement('div');
  labelEl.className='awd-allday-label';
  labelEl.textContent=window._t?window._t('allDayLabel'):'all-day';
  gutterEl.appendChild(labelEl);
  allDayRow.appendChild(gutterEl);
  // Pills
  var pillsEl=document.createElement('div');
  pillsEl.className='awd-allday-pills'+(n>4?' awd-pills-scroll':'');
  if(n===0){
    var emptyEl=document.createElement('span');
    emptyEl.className='awd-empty-label';
    emptyEl.textContent=window._t?window._t('noAllDay'):'No all-day events';
    pillsEl.appendChild(emptyEl);
  } else {
    allDay.forEach(function(item){
      var ev=item.ev;
      var adColor=ev._extraColor||awColorFor((ev.summary||'').split(' - ')[0].trim(),ev.cal2);
      var adHex=AW_COLOR_HEX[adColor]||'#3b82f6';
      var isWhiteEv=(adColor==='white');
      var evIdx=awEvCache.indexOf(ev);
      var pill=document.createElement('button');
      pill.className='awd-allday-pill'+(isWhiteEv?' awd-pill-white':'');
      // Apple-style: subtle tinted background, colored text
      var _th=document.documentElement.dataset.theme;
      var _isDark=_th==='dark'?true:_th==='light'?false:window.matchMedia('(prefers-color-scheme:dark)').matches;
      // White liturgical: in dark mode use warm gold, in light use warm brown
      var pillColor=isWhiteEv?(_isDark?'#e8c97a':'rgba(100,70,20,0.9)'):adHex;
      pill.style.background=isWhiteEv?(adHex+'dd'):adHex+'22';
      pill.style.borderColor=isWhiteEv?'rgba(210,185,130,0.6)':adHex+'66';
      pill.style.color=pillColor;
      var dot=document.createElement('span');
      dot.className='awd-pill-dot';
      dot.style.background=pillColor;
      var name=document.createElement('span');
      name.className='awd-pill-name';
      name.textContent=ev.summary||'';
      pill.appendChild(dot);pill.appendChild(name);
      pill.onclick=(function(i){return function(){if(typeof awPopOpen==='function')awPopOpen(pill,i);};})(evIdx);
      pillsEl.appendChild(pill);
    });
  }
  allDayRow.appendChild(pillsEl);
  if(container.parentElement){
    container.parentElement.appendChild(allDayRow);
    container.style.paddingTop=rowH+'px';
    container.dataset.alldayH=String(rowH);
    // No neighbor sync — each day is full-screen, one visible at a time
  }
  // Scroll to show the relevant time — purely based on hour, no cross-day sync
  var targetH;
  // Centre the view: current time (today) or first event in the upper third
  var halfH=Math.round(window.innerHeight*0.38);
  // paddingTop offsets the grid content — must be included in scroll target
  var ptop=parseInt(container.style.paddingTop)||0;
  if(isToday){
    targetH=Math.max(0, ptop + nowH*AW_PX_PER_HOUR - halfH);
  } else if(timed.length>0){
    var firstH=awClampStartH(timed[0].ev,ds);
    targetH=Math.max(0, ptop + firstH*AW_PX_PER_HOUR - halfH);
  } else {
    targetH=Math.max(0, ptop + 7*AW_PX_PER_HOUR); // default: 07:00
  }
  // Apply scroll: use shared position if available, else compute from time
  var sharedTop=typeof window._wkScrollTop==='number'?window._wkScrollTop:-1;
  if(!preserveScroll){
    var finalTop=sharedTop>=0?sharedTop:targetH;
    requestAnimationFrame(function(){ container.scrollTop=finalTop; });
    if(sharedTop<0) window._wkScrollTop=targetH; // first day sets the shared position
  }
  // Sync: when user scrolls this day, copy to all other rendered days
  container.addEventListener('scroll',function(){
    var top=container.scrollTop;
    window._wkScrollTop=top;
    document.querySelectorAll('.wk-grid-host').forEach(function(h){
      if(h!==container&&h.children.length>0&&Math.abs(h.scrollTop-top)>1)h.scrollTop=top;
    });
  },{passive:true});
}
