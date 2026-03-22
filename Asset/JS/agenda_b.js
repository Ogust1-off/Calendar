/*Shortcut™ JS file for Agenda by Augustin de Chalendar
Copyright © 2026 Ogust'1. All rights reserved.
*/

// ── i18n ──────────────────────────────────────────────────────────────────────
const _I18N = {
  en: {
    loading: 'Loading…',
    allDay: _T('allDay'),
    inProgress: 'In progress',
    completed: 'COMPLETED',
    startingSoon: 'STARTING SOON',
    left: 'left',
    justUpdated: _T('justUpdated'),
    updatedSAgo: s => `Updated ${s}s ago`,
    updatedMAgo: m => `Updated ${m}min ago`,
    updatedM30Ago: m => `Updated ${m}min 30s ago`,
    offline: _T('offline'),
    updateFailed: _T('updateFailed'),
    configureMsg: _T('configureMsg'),
    unableLoad: e => `Unable to load.<br><small style="opacity:.5">${e}</small>`,
    noMoreToday: _T('noMoreToday'),
    noUpcoming: _T('noUpcoming'),
    enjoyBreak: _T('enjoyBreak'),
    haveGreatWe: _T('haveGreatWe'),
    nextClass: 'Next class',
    today: 'Today',
    locate: ''+_T('locate')+'',
    joinVideo: v => `↗ Join ${v}`,
    in: s => `in ${s}`,
    elapsed: p => `${p}% elapsed`,
  },
  fr: {
    loading: 'Chargement…',
    allDay: 'Toute la journée',
    inProgress: 'En cours',
    completed: 'TERMINÉ',
    startingSoon: 'BIENTÔT',
    left: 'restant',
    justUpdated: 'Mis à jour',
    updatedSAgo: s => `Mis à jour il y a ${s}s`,
    updatedMAgo: m => `Mis à jour il y a ${m}min`,
    updatedM30Ago: m => `Mis à jour il y a ${m}min 30s`,
    offline: 'Hors ligne',
    updateFailed: 'Échec de mise à jour',
    configureMsg: 'Veuillez configurer votre agenda dans les réglages.',
    unableLoad: e => `Impossible de charger.<br><small style="opacity:.5">${e}</small>`,
    noMoreToday: 'Plus de cours aujourd'hui',
    noUpcoming: 'Aucun cours à venir',
    enjoyBreak: 'Profitez-en !',
    haveGreatWe: 'Bon week-end !',
    nextClass: 'Prochain cours',
    today: 'Aujourd'hui',
    locate: '↗ Localiser',
    joinVideo: v => `↗ Rejoindre ${v}`,
    in: s => `dans ${s}`,
    elapsed: p => `${p}% écoulé`,
  }
};
function _getLang() {
  try { var d=JSON.parse(localStorage.getItem('shortcut_config')||'null'); return (d&&d.lang)||'en'; } catch(e){ return 'en'; }
}
function _T(key, ...args) {
  var lang = _getLang();
  var t = (_I18N[lang]||_I18N.en)[key];
  if (typeof t === 'function') return t(...args);
  return t || (_I18N.en[key] || key);
}

// ── Config from localStorage ──────────────────────────────────────────────────
function _getCfg() {
  try { return JSON.parse(localStorage.getItem('shortcut_config') || 'null'); } catch(e) { return null; }
}
function _loadCfg() {
  var c = _getCfg(); if (!c) return false;
  AW_API_KEY      = c.apiKey      || '';
  AW_CALENDAR_ID  = c.calendars && c.calendars[0] ? c.calendars[0] : '';
  AW_CALENDAR_ID_2= c.calendars && c.calendars[1] ? c.calendars[1] : '';
  AW_ICAL_URL     = c.icalUrl     || '';
  return !!(AW_API_KEY && AW_CALENDAR_ID);
}

let AW_API_KEY      = '';
let AW_CALENDAR_ID  = '';
let AW_CALENDAR_ID_2= '';
const AW_CAL2_COLOR = 'lime';
let AW_ICAL_URL     = '';
const AW_FETCH_DAYS  = 49;

// Grid config: 0–24h, px/hour set dynamically in awRenderDay
const AW_HOUR_START  = 0;
const AW_HOUR_END    = 24;
let   AW_PX_PER_HOUR = 60; // overridden per render

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
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
  const s = d.toLocaleDateString('en-EN', long
    ? { weekday: 'long', day: 'numeric', month: 'long' }
    : { weekday: 'short', day: 'numeric', month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function awWeekdayShort(dateStr) {
  return new Date(dateStr + 'T00:00:00')
    .toLocaleDateString('en-EN', { weekday: 'short' })
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
function awColorFor(name) {
  if (!name) return 'blue';
  const norm = awNorm(name);
  for (const entry of AW_COLOR_MAP) {
    if (norm.includes(awNorm(entry.match))) return entry.color;
  }
  const word = norm.split(/[\s\-\u2013]/)[0];
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) >>> 0;
  return AW_COLORS[h % AW_COLORS.length];
}

function awTimeToHours(iso) {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function awParseICal(text) {
  const events = [];
  const blocks = text.split('BEGIN:VEVENT');
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i];
    const get = (key) => {
      const m = block.match(new RegExp(`${key}(?:;[^:]*)?:([^\r\n]+)`));
      return m ? m[1].trim() : '';
    };
    const parseDate = (str) => {
      if (!str) return '';
      if (str.length === 8) return `${str.slice(0,4)}-${str.slice(4,6)}-${str.slice(6,8)}`;
      return new Date(
        str.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/, '$1-$2-$3T$4:$5:$6')
      ).toISOString();
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

async function awFetch() {
  const monday = awMondayOf(new Date());
  monday.setHours(0, 0, 0, 0);
  const tMin = monday.toISOString();
  const tMax = new Date(monday.getTime() + (AW_FETCH_DAYS + 7) * 86400000).toISOString();

  const buildUrl = (calId) =>
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events`
    + `?key=${AW_API_KEY}&timeMin=${encodeURIComponent(tMin)}&timeMax=${encodeURIComponent(tMax)}`
    + `&singleEvents=true&orderBy=startTime&maxResults=250`;

  const parseEvents = (data, cal2 = false) => (data.items || []).map(ev => ({
    summary:     ev.summary     || ev.title || '',
    location:    ev.location    || ev.place || '',
    description: ev.description || '',
    start:       ev.start?.dateTime || ev.start?.date || ev.start || '',
    end:         ev.end?.dateTime   || ev.end?.date   || ev.end   || '',
    cal2,
  }));

  const urls = [buildUrl(AW_CALENDAR_ID)];
  if (AW_CALENDAR_ID_2) urls.push(buildUrl(AW_CALENDAR_ID_2));

  const responses = await Promise.all(urls.map(u => fetch(u)));
  for (const res of responses) {
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e.error && e.error.message) || 'API ' + res.status); }
  }
  const datas = await Promise.all(responses.map(r => r.json()));
  const events = datas.flatMap((data, idx) => parseEvents(data, idx === 1));
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  if (AW_ICAL_URL) {
    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(AW_ICAL_URL)}`);
      const text = await res.text();
      events.push(...awParseICal(text));
      events.sort((a, b) => new Date(a.start) - new Date(b.start));
    } catch(e) { console.warn('iCal fetch failed:', e); }
  }
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
  const fullName  = ev.summary || '(No title)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const color     = ev.cal2 ? AW_CAL2_COLOR : awColorFor(shortName);

  const typeMatch  = fullName.match(/\b(CM|TD|TP|DS|Exam|Cours)\b/i);
  const typeBadge  = typeMatch ? typeMatch[0].toUpperCase() : '';
  const groupMatch = fullName.match(/(?:AB|CD|EF|GH|A&M\d[A-Z\s]*(?:S\d+)?)/i);
  const group      = groupMatch ? groupMatch[0].trim() : '';

  const colorHex = {
    blue:'#3b82f6', violet:'#8b5cf6', emerald:'#10b981',
    amber:'#f59e0b', rose:'#f43f5e', cyan:'#06b6d4', orange:'#f97316', grey:'#94a3b8',
    lime: AW_CAL2_COLOR_HEX,
  };
  const accent = colorHex[color] || '#3b82f6';

  const isLM = window.matchMedia('(prefers-color-scheme: light)').matches;

  const badges = [
    typeBadge ? `<span class="aw-row-badge" style="color:${accent};border-color:${accent}${isLM?'33':'44'};background:${accent}${isLM?'18':'22'}">${typeBadge}</span>` : '',
    group     ? `<span class="aw-row-badge aw-row-badge--group">${group}</span>` : '',
    now       ? `<span class="aw-now-badge" style="color:${accent};background:${accent}${isLM?'18':'22'};border-color:${accent}${isLM?'44':'55'}">'+_T('inProgress')+'</span>` : '',
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

  return `<div class="aw-event${now ? ' aw-event-now' : ''}${past ? ' aw-event-past' : ''}" data-ev="${idx}" style="${nowStyle}cursor:pointer;" onclick="awPopOpen(this,${idx})">
    <div class="aw-color-dot" data-color="${color}"></div>
    <div class="aw-body">
      <div class="aw-name">${shortName}${badges ? `<span class="aw-row-badges">${badges}</span>` : ''}</div>
      ${ev.location ? `<div class="aw-meta">${PIN}${ev.location}${mapUrl ? ' <a class="aw-map-link" href="' + mapUrl + '" target="_blank" rel="noopener">↗ Locate</a>' : ''}</div>` : ''}
      ${teacher     ? `<div class="aw-meta">${PERSON_SVG}${teacher}</div>` : ''}
      ${visioUrl    ? `<div class="aw-meta">${VISIO_SVG}<a class="aw-map-link" href="${visioUrl}" target="_blank" rel="noopener">'+_T('joinVideo',visioLabel)+'</a></div>` : ''}
      ${transport   ? `<div class="aw-meta">${TRAIN_SVG}${transport.url ? `<a class="aw-map-link" href="${transport.url}" target="_blank" rel="noopener">↗ ${transport.text}</a>` : transport.text}</div>` : ''}
      ${now         ? `<div class="aw-progress" style="background:${accent}${isLM?'18':'22'}"><div class="aw-progress-bar" data-ev-bar="${idx}" style="width:${pct}%;background:${accent}"></div></div>` : ''}
    </div>
    <div class="aw-time">
      ${allDay
        ? '<span class="aw-time-single">'+_T('allDay')+'</span>'
        : `<span class="aw-time-start">${awFmtTime(ev.start)}</span><span class="aw-time-end">${awFmtTime(ev.end)}${dur ? ` <span style="opacity:.4;font-size:9px">(${dur})</span>` : ''}</span>`
      }
      ${startsSoon ? `<div class="aw-dur" data-timer="soon" data-ev="${idx}" style="color:${accent};margin-top:2px">in ${awFmtRemaining(ev.start)}</div>` : ''}
      ${now        ? `<div class="aw-dur" data-timer="left" data-ev="${idx}" style="color:${accent};margin-top:2px">${awFmtRemaining(ev.end)} '+_T('left')+'</div>` : ''}
    </div>
  </div>`;
}

// Overlap layout
// Rules:
// - Sort by start time, longest first if same start
// - Start diff < 23min → side-by-side at same indent level
// - Start diff ≥ 23min → goes under the deepest active event
function awLayoutColumns(timedItems) {
  const THRESHOLD = 23 / 60;

  const items = timedItems.map(({ev, i}) => ({
    ev, i,
    s: awTimeToHours(ev.start),
    e: awTimeToHours(ev.end),
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
function awGridEvHtml(ev, idx, col = 0, totalCols = 1, sameStart = false, stackDepth = 0, isTopStacked = true, visibleHeight = null, nextCoverStart = null) {
  const now       = awIsNow(ev.start, ev.end);
  const past      = !now && awIsPast(ev.end);
  const fullName  = ev.summary || '(No title)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const loc       = ev.location ? ev.location.split(',')[0].trim() : '';
  const color     = ev.cal2 ? AW_CAL2_COLOR : awColorFor(shortName);

  const colorHex = {
    blue:'#3b82f6', violet:'#8b5cf6', emerald:'#10b981',
    amber:'#f59e0b', rose:'#f43f5e', cyan:'#06b6d4', orange:'#f97316', grey:'#94a3b8',
    lime: AW_CAL2_COLOR_HEX,
  };
  const accent = colorHex[color] || '#3b82f6';
  const isLM = window.matchMedia('(prefers-color-scheme: light)').matches;

  const bgAlpha    = isLM ? '33' : '44';
  const bg = `${accent}${bgAlpha}`;
  const glowColor = now ? `${accent}33` : 'transparent';
  const borderColor = accent;
  const textColor   = isLM ? 'rgba(10,20,40,0.88)' : 'rgba(255,255,255,0.92)';
  const timeColor   = isLM ? 'rgba(10,20,40,0.52)' : 'rgba(255,255,255,0.6)';
  const locColor    = isLM ? 'rgba(10,20,40,0.38)' : 'rgba(255,255,255,0.45)';

  const startH  = awTimeToHours(ev.start);
  const endH    = awTimeToHours(ev.end);
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
    onclick="awPopOpen(this,${idx})">
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
  const el = document.getElementById('aw-last-updated');
  if (!el || !awLastUpdated) return;
  const secs = Math.round((Date.now() - awLastUpdated) / 1000);
  const rounded = Math.round(secs / 30) * 30;
  const mins = Math.floor(rounded / 60);
  const remSecs = rounded % 60;
  el.textContent = secs < 10 ? 'Just updated'
    : secs < 60 ? _T('updatedSAgo', secs)
    : remSecs === 0 ? _T('updatedMAgo', mins)
    : _T('updatedM30Ago', mins);
}

function awPopOpen(el, idx) {
  awPopClose();

  const ev      = awEvCache[idx];
  if (!ev) return;

  const fullName  = ev.summary || '(No title)';
  const shortName = fullName.includes(' - ') ? fullName.split(' - ')[0].trim() : fullName;
  const typeMatch = fullName.match(/\b(CM|TD|TP|DS|Exam|Cours)\b/i);
  const typeBadge = typeMatch ? typeMatch[0].toUpperCase() : '';
  const groupMatch = fullName.match(/(?:AB|CD|EF|GH|A&M\d[A-Z\s]*(?:S\d+)?)/i);
  const group = groupMatch ? groupMatch[0].trim() : '';
  const now   = awIsNow(ev.start, ev.end);
  const past  = !now && awIsPast(ev.end);
  const color = ev.cal2 ? AW_CAL2_COLOR : awColorFor(shortName);
  const dur   = awFmtDuration(ev.start, ev.end);
  const pct   = now ? awProgress(ev.start, ev.end) : 0;
  const msTillStart = new Date(ev.start) - Date.now();
  const startsSoon  = !now && !past && msTillStart > 0 && msTillStart < 3600000;

  const { teacher, mapUrl, visioUrl, visioLabel, transport } = awParseDesc(ev.description || '');

  const colorHex = {
    blue:'#3b82f6', violet:'#8b5cf6', emerald:'#10b981',
    amber:'#f59e0b', rose:'#f43f5e', cyan:'#06b6d4', orange:'#f97316', grey:'#94a3b8',
    lime: AW_CAL2_COLOR_HEX,
  };
  const accent = colorHex[color] || '#3b82f6';

  const pop = document.createElement('div');
  pop.id = 'aw-pop';
  pop.className = 'aw-pop';
  const hexToRgb = h => { const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16); return `${r},${g},${b}`; };
  const accentRgb = hexToRgb(accent);
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (isLight) {
    // Light mode: white frosted glass with very subtle color tint
    pop.style.background = `linear-gradient(145deg, rgba(${accentRgb},0.08) 0%, rgba(255,255,255,0) 60%), rgba(255,255,255,0.92)`;
    pop.style.border = `1px solid rgba(${accentRgb},0.18)`;
  } else {
    // Dark mode: deep frosted glass with subtle color tint
    pop.style.background = `linear-gradient(145deg, rgba(${accentRgb},0.12) 0%, rgba(${accentRgb},0.04) 100%), rgba(22,26,40,0.92)`;
    pop.style.border = `1px solid rgba(${accentRgb},0.22)`;
  }
  pop.innerHTML = `
    <div class="aw-pop-accent" style="background:${accent}"></div>
    <button class="aw-pop-close" onclick="awPopClose()" aria-label="Close">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="aw-pop-body">
      <div class="aw-pop-title">${fullName}</div>
      <div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
        <span>${ev.start.length === 10 ? _T('allDay') : awFmtTime(ev.start) + ' \u2013 ' + awFmtTime(ev.end)}${dur ? ` <span class="aw-pop-muted">(${dur})</span>` : ''}</span>
      </div>
      ${ev.location ? `<div class="aw-pop-row">
        <svg class="aw-pop-icon" viewBox="0 0 16 16" fill="none"><path d="M8 1.5A4.5 4.5 0 0 1 12.5 6c0 3-4.5 8.5-4.5 8.5S3.5 9 3.5 6A4.5 4.5 0 0 1 8 1.5Z" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="6" r="1.5" stroke="currentColor" stroke-width="1.3"/></svg>
        <span>${ev.location.split(',')[0].trim()}${mapUrl ? ' <a class="aw-map-link" href="' + mapUrl + '" target="_blank" rel="noopener" style="color:var(--accent)" onmouseover="this.style.textDecoration=\'underline\'" onmouseout="this.style.textDecoration=\'none\'">\u2197 Locate</a>' : ''}</span>
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
        ${now       ? `<span class="aw-pop-tag aw-pop-tag-now" style="color:${accent};background:${accent}18;border-color:${accent}40">In progress</span>` : ''}
        ${past      ? `<span class="aw-pop-tag aw-pop-tag-past">'+_T('completed')+'</span>` : ''}
        ${startsSoon ? `<span class="aw-pop-tag">'+_T('startingSoon')+'</span>` : ''}
      </div>` : (now || past) ? `<div class="aw-pop-tags">
        ${now  ? `<span class="aw-pop-tag aw-pop-tag-now" style="color:${accent};background:${accent}18;border-color:${accent}40">In progress</span>` : ''}
        ${past ? `<span class="aw-pop-tag aw-pop-tag-past">'+_T('completed')+'</span>` : ''}
      </div>` : ''}
      ${startsSoon ? `
        <div class="aw-pop-progress-label" style="justify-content:flex-end;gap:4px">
        <span>In</span>
        <span id="aw-pop-soon-cnt" style="font-weight:600;color:${accent}">${awFmtRemainingLong(ev.start)}</span>
      </div>` : ''}
      ${now ? `<div class="aw-pop-progress-wrap">
        <div id="aw-pop-bar" class="aw-pop-progress-bar" style="width:${pct}%;background:${accent}"></div>
      </div>
      <div class="aw-pop-progress-label">
        <span id="aw-pop-pct">${pct}% elapsed</span>
        <span id="aw-pop-rem">${awFmtRemainingLong(ev.end)} left</span>
      </div>` : ''}
    </div>`;

  document.body.appendChild(pop);

  // Always fixed. On mobile: bottom sheet. On desktop: float near event.
  pop.style.position = 'fixed';
  pop.style.zIndex   = '9999';

  if (window.innerWidth < 600) {
    pop.style.left          = '10px';
    pop.style.right         = '10px';
    pop.style.bottom        = 'calc(49px + env(safe-area-inset-bottom,0px) + 10px)';
    pop.style.top           = 'auto';
    pop.style.width         = 'auto';
    pop.style.maxWidth      = 'none';
    pop.style.borderRadius  = '20px';
    pop.style.transformOrigin = 'bottom center';
  } else {
    const rect   = el.getBoundingClientRect();
    const popW   = 260, m = 10;
    // Prefer right side, fall back to left
    let left = rect.right + m;
    if (left + popW > window.innerWidth - m) left = rect.left - popW - m;
    if (left < m) left = m;
    // Align top with event, clamp to screen
    let top = rect.top;
    requestAnimationFrame(() => {
      const popH = pop.offsetHeight;
      if (top + popH > window.innerHeight - m) top = window.innerHeight - popH - m;
      if (top < m) top = m;
      pop.style.top = top + 'px';
    });
    pop.style.left = left + 'px';
    pop.style.top  = rect.top + 'px';
  }

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
        pctEl.textContent = p + '% elapsed';
        remEl.textContent = awFmtRemainingLong(ev.end) + ' left';
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

  setTimeout(() => {
    document.addEventListener('click', awPopOutside, { once: true });
  }, 10);
}

function awPopOutside(e) {
  const pop = document.getElementById('aw-pop');
  if (pop && !pop.contains(e.target)) awPopClose();
  else if (pop) document.addEventListener('click', awPopOutside, { once: true });
}

function awPopClose() {
  const pop = document.getElementById('aw-pop');
  if (!pop) return;
  if (window._awPopTimer) { clearInterval(window._awPopTimer); window._awPopTimer = null; }
  pop.classList.remove('visible');
  setTimeout(() => pop.remove(), 180);
}

// ── Compact view ──────────────────────────────────────────────────────────────

function awRenderCompact(byDay, today) {
  const compact = document.getElementById('aw-compact');
  if (!compact) return;
  const nowTs = Date.now();

  const base = new Date(today + 'T00:00:00');
  let targetDay = null;
  const skipped = [];

  for (let i = 0; i < AW_FETCH_DAYS; i++) {
    const d  = new Date(base); d.setDate(base.getDate() + i);
    const ds = awDateStr(d);
    const future = (byDay[ds] || []).filter(({ev}) =>
      ev.start.length === 10 ? ds >= today : new Date(ev.end) > nowTs
    );
    if (future.length > 0) { targetDay = { ds, items: future.map(({ev}) => ev) }; break; }
    else skipped.push(ds);
  }

  let html = '';
  const shown = skipped.slice(0, 6);
  if (shown.length > 0) {
    html += `<div class="aw-skipped-list">`;
    html += shown.map(ds => {
      const isToday = ds === today;
      const label   = awFmtDayLabel(ds, true);
      const msg     = 'No more events today';
      return `<div class="aw-skipped-row">
        <span class="aw-skipped-label${isToday ? ' today' : ''}">${label}${isToday ? ' <span class="aw-skipped-today-pill">Today</span>' : ''}</span>
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
        <div class="aw-empty-title">Bon week-end !</div>
        <div class="aw-empty-sub">Prochain cours : ${nextMonday}</div>
      </div>`;
    } else {
      html += `<div class="aw-empty-state">
        <div class="aw-empty-icon">\u2705</div>
        <div class="aw-empty-title">No upcoming classes</div>
        <div class="aw-empty-sub">Enjoy the break!</div>
      </div>`;
    }
    compact.innerHTML = html;
    return;
  }

  const isToday  = targetDay.ds === today;
  const dayLabel = awFmtDayLabel(targetDay.ds, true);

  html += `<div class="aw-compact-day-hd">
    <span class="aw-compact-day-label${isToday ? ' today' : ''}">${dayLabel}</span>
    ${isToday ? '<span class="aw-today-pill">'+_T('today')+'</span>' : ''}
  </div>`;

  html += targetDay.items.map((ev) => {
    const idx = awEvCache.indexOf(ev);
    return awRowHtml(ev, idx);
  }).join('');
  compact.innerHTML = html;
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
    const month0 = d0.toLocaleDateString('en-EN', { month: 'long' });
    const year0  = d0.getFullYear();
    if (d0.getMonth() === d6.getMonth()) {
      return `<strong>${month0}</strong> <span class="aw-cal-year">${year0}</span>`;
    }
    const month6 = d6.toLocaleDateString('en-EN', { month: 'short' });
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

    const laid = awLayoutColumns(timed);
    html += `<div class="aw-tcol${isToday ? ' today' : ''}${isWE ? ' we' : ''}${isPast && !isToday ? ' past' : ''}">`;
    html += laid.map(({ev, i, col, totalCols, sameStart, stackDepth, isTopStacked, visibleHeight, nextCoverStart}) => awGridEvHtml(ev, i, col, totalCols, sameStart, stackDepth, isTopStacked, visibleHeight, nextCoverStart)).join('');
    html += `</div>`;
  }
  html += `</div>`;

  html += `</div></div></div></div>`;

  full.innerHTML = html;
}

// Nombre de semaines complètes disponibles au-delà de la semaine courante
// AW_FETCH_DAYS couvre les jours chargés ; on soustrait 7 (semaine courante déjà incluse)
// puis on divise par 7 pour obtenir le nombre de semaines suivantes accessibles.
const AW_MAX_OFFSET = Math.floor(AW_FETCH_DAYS / 7); // ex: 49j → 7 semaines après la courante (offset 0 à 6)

function awCalPrev()    { if (awCalOffset > 0) { awCalOffset--; if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); } }
function awCalNext()    { if (awCalOffset < AW_MAX_OFFSET) { awCalOffset++; if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); } }
function awCalGoToday() { awCalOffset = 0;         if (window._awByDay) awRenderCalendar(window._awByDay, awToday()); }

// ── Main ──────────────────────────────────────────────────────────────────────

function awRender(events) {
  const today = awToday();
  const byDay = {};
  awEvCache = events;
  awLastUpdated = Date.now();
  awUpdateTimer();
  events.forEach((ev, i) => { const d = ev.start.slice(0, 10); (byDay[d] = byDay[d] || []).push({ ev, i }); });
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
    else {
      const c = document.getElementById('aw-compact');
      if (c) c.innerHTML = '<div class="aw-state">Please configure your calendar in Settings.</div>';
    }
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
    el.textContent = awFmtRemaining(ev.end) + ' left';
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
    el.textContent = 'in ' + awFmtRemaining(ev.start);
  });
}, 1000);

// ── ONE-DAY TIME GRID ─────────────────────────────────────────────────────────
// Renders a single-day version of the time grid.
// Uses AW_PX_PER_HOUR computed dynamically so 11 hours fit in the viewport.
function awRenderDay(ds, container) {
  if (!container) return;

  const byDay   = window._awByDay || {};
  const today   = awToday();
  const isToday = ds === today;

  // Compute px/hour so exactly 11 hours fit in the visible area
  const HOURS_VIS = 11;
  const availH = window.innerHeight
    - (document.getElementById('navbar')  ? document.getElementById('navbar').offsetHeight  : 56)
    - (document.getElementById('wk-nav')  ? document.getElementById('wk-nav').offsetHeight  : 76)
    - 49;  // tab bar
  AW_PX_PER_HOUR = Math.max(48, Math.round(availH / HOURS_VIS));

  const HOURS = 24;
  const gridH = HOURS * AW_PX_PER_HOUR;

  const items = byDay[ds] || [];
  const timed = items.filter(function(x){ return x.ev.start.length > 10; });
  const laid  = awLayoutColumns(timed);

  const now  = new Date();
  const nowH = now.getHours() + now.getMinutes() / 60;

  var html = '<div class="awd-grid" style="height:' + gridH + 'px">';

  // Hour gutter (skip 00:00 label)
  html += '<div class="awd-gutter">';
  for (var h = 1; h < HOURS; h++) {
    html += '<div class="awd-hour-lbl" style="top:' + (h * AW_PX_PER_HOUR) + 'px">'
          + (h < 10 ? '0' : '') + h + ':00</div>';
  }
  html += '</div>';

  // Day column
  html += '<div class="awd-col">';
  for (var h2 = 0; h2 <= HOURS; h2++) {
    var cls = (h2 % 6 === 0) ? 'awd-hline major' : 'awd-hline';
    html += '<div class="' + cls + '" style="top:' + (h2 * AW_PX_PER_HOUR) + 'px"></div>';
  }
  if (isToday) {
    html += '<div class="awd-now" style="top:' + (nowH * AW_PX_PER_HOUR) + 'px"><div class="awd-now-dot"></div></div>';
  }
  html += laid.map(function(item) {
    return awGridEvHtml(item.ev, item.i, item.col, item.totalCols,
      item.sameStart, item.stackDepth, item.isTopStacked,
      item.visibleHeight, item.nextCoverStart);
  }).join('');
  html += '</div></div>';

  container.innerHTML = html;

  // Initial scroll position
  var scrollTo;
  if (typeof window._wkScrollTop === 'number') {
    // Use the shared scroll position (set by user scrolling another day)
    scrollTo = window._wkScrollTop;
  } else if (isToday) {
    scrollTo = nowH * AW_PX_PER_HOUR - availH * 0.38;
    window._wkScrollTop = Math.max(0, scrollTo); // share as default
  } else if (timed.length > 0) {
    scrollTo = awTimeToHours(timed[0].ev.start) * AW_PX_PER_HOUR - availH * 0.25;
  } else {
    scrollTo = 7 * AW_PX_PER_HOUR;
  }
  container.scrollTop = Math.max(0, scrollTo);

  // When the user scrolls this day, sync ALL other rendered day pages immediately
  container.addEventListener('scroll', function() {
    var top = container.scrollTop;
    window._wkScrollTop = top;
    // Propagate to all other rendered .wk-grid-host elements
    var others = document.querySelectorAll('.wk-grid-host');
    others.forEach(function(host) {
      if (host !== container && host.children.length > 0) {
        host.scrollTop = top;
      }
    });
  }, { passive: true });
}
