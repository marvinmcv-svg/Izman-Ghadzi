// Small building blocks used by every screen.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const money = (n, d = 2) => '$' + Number(n || 0).toFixed(d);
export const fmt = n => Number(n || 0).toLocaleString('en-US');
export const short = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K' : String(n);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const wordsIn = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;

// ---------- icons (inline, stroke based) ----------
const P = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3.9V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  play: '<path d="M7 5l12 7-12 7z" fill="currentColor"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  skip: '<path d="M5 5l10 7-10 7z"/><path d="M19 5v14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  robot: '<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 16h6"/>',
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  send: '<path d="M21 3L3 11l7 3 3 7z"/><path d="M10 14l11-11"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  bolt: '<path d="M13 3L4 14h7l-1 7 9-11h-7z"/>',
  book: '<path d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M18 20V8M4 16a4 4 0 0 1 4-4h10"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 5.5 5"/>',
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M9 15l-3-3c2-6 7-9 14-9 0 7-3 12-9 14z"/><circle cx="15" cy="9" r="1.5"/>',
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-4 2.8"/><path d="M5 12v8h14v-8"/>',
  dot: '<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  grip: '<path d="M9 7l-4 5 4 5M15 7l4 5-4 5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>',
};
export function icon(name, extra = '') {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || P.dot}</svg>`;
}

// ---------- tool logos ----------
export const TOOLS = {
  claude: { name: 'Claude', color: '#d97757', letter: 'C' },
  apify: { name: 'Apify', color: '#24a148', letter: 'A' },
  higgsfield: { name: 'Higgsfield', color: '#111111', letter: 'H' },
  aiark: { name: 'AI Ark', color: '#1f6feb', letter: 'Ak' },
  instantly: { name: 'Instantly', color: '#2a6cf6', letter: 'In' },
  whop: { name: 'Whop', color: '#fa4616', letter: 'W' },
  nanobanana: { name: 'Nano Banana', color: '#e6b800', letter: 'N' },
  spaceship: { name: 'Spaceship', color: '#5b3cc4', letter: 'S' },
  scaledmail: { name: 'ScaledMail', color: '#0f9d58', letter: 'Sm' },
  local: { name: 'This computer', color: '#3a3a48', letter: 'PC' },
};
export function toolLogo(id, size = 22) {
  const t = TOOLS[id] || TOOLS.local;
  return `<span style="width:${size}px;height:${size}px;border-radius:${Math.round(size / 3.2)}px;background:${t.color};color:#fff;display:inline-grid;place-items:center;font:700 ${Math.round(size * 0.42)}px/1 var(--font);flex:none;letter-spacing:-.02em;border:1px solid rgba(255,255,255,.12)">${t.letter}</span>`;
}

// ---------- pieces ----------
export function pill(text, tone = '') { return `<span class="pill ${tone}">${esc(text)}</span>`; }

export function ring(value, max = 25, size = 66, color = 'var(--purple-2)') {
  const r = (size - 8) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, value / max));
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--card-3)" stroke-width="6" fill="none"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" style="transition:stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1)"/></svg>
    <div class="rv"><div>${value}<small>/${max}</small></div></div></div>`;
}
export function bar(value, max = 100, tone = '') {
  return `<div class="bar ${tone}"><i style="width:${Math.max(2, Math.min(100, (value / max) * 100))}%"></i></div>`;
}
export function stat(value, label, tone = '') {
  return `<div class="stat ${tone}"><b>${value}</b><span>${esc(label)}</span></div>`;
}
export function copyBtn(text, label = 'Copy', cls = 'sm') {
  return `<button class="btn ${cls}" data-copy="${esc(text)}">${icon('copy')}${esc(label)}</button>`;
}
export function seg(name, options, current, cls = '') {
  return `<div class="seg ${cls}" role="tablist">${options.map(([v, l]) => `<button class="${v === current ? 'on' : ''}" data-seg="${esc(name)}" data-val="${esc(v)}" role="tab" aria-selected="${v === current}">${esc(l)}</button>`).join('')}</div>`;
}
export function tabs(name, options, current) {
  return `<div class="tabs" role="tablist">${options.map(([v, l]) => `<button class="tab ${v === current ? 'on' : ''}" data-tab="${esc(name)}" data-val="${esc(v)}" role="tab">${esc(l)}</button>`).join('')}</div>`;
}
export function emptyState(ghostHtml, message, btnHtml) {
  return `<div class="empty"><div class="ghost" aria-hidden="true">${ghostHtml}</div><div class="over"><div><p>${esc(message)}</p>${btnHtml || ''}</div></div></div>`;
}
export function ghostRows(n = 4) {
  return Array.from({ length: n }, (_, i) => `<div class="ghost-bar" style="width:${90 - i * 12}%"></div>`).join('');
}

// Source numbers like [3] or [3, 12] become clickable links.
export function srcify(text) {
  return esc(text).replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, nums) =>
    '[' + nums.split(',').map(n => `<a class="src" data-src="${n.trim()}" href="#src-${n.trim()}">${n.trim()}</a>`).join(', ') + ']');
}

// ---------- toasts ----------
export function toast(text, kind = 'ok') {
  const root = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.innerHTML = icon(kind === 'err' ? 'info' : 'check') + `<span>${esc(text)}</span>`;
  root.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, 2600);
}

// ---------- modal / confirm ----------
export function modal(html, { wide = false, onClose } = {}) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `<div class="modal-scrim" role="dialog" aria-modal="true"><div class="modal ${wide ? 'wide' : ''}">${html}</div></div>`;
  const scrim = root.firstElementChild;
  const close = () => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); onClose && onClose(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  scrim.addEventListener('click', e => { if (e.target === scrim) close(); });
  setTimeout(() => scrim.querySelector('[data-autofocus], .btn.main, .btn.money')?.focus(), 30);
  return { el: scrim, close };
}

// confirm({ title, lines: [[what, value]], total, serious, yes, kind })
// Resolves true for yes, false for cancel. Shows the price in big orange numbers.
export function confirmBox({ title, intro = '', lines = [], total = null, totalLabel = 'Total, at most', serious = '', yes = 'Yes, go ahead', yesCls = 'main', input = null }) {
  return new Promise(resolve => {
    let done = false;
    const m = modal(`
      <h3>${esc(title)}</h3>
      ${intro ? `<p class="dim">${esc(intro)}</p>` : ''}
      ${lines.length ? `<div class="what">${lines.map(([a, b]) => `<div><span>${esc(a)}</span><span>${esc(b)}</span></div>`).join('')}</div>` : ''}
      ${total !== null ? `<div class="price"><span class="dim">${esc(totalLabel)}</span><b>${esc(typeof total === 'number' ? money(total) : total)}</b></div>` : ''}
      ${serious ? `<div class="serious">${esc(serious)}</div>` : ''}
      ${input ? `<label class="field mt12"><span class="label">${esc(input.label)}</span><input data-cin type="${input.type || 'text'}" placeholder="${esc(input.placeholder || '')}" data-autofocus></label>` : ''}
      <div class="foot"><button class="btn quiet" data-no>Cancel</button><button class="btn ${yesCls}" data-yes>${esc(yes)}</button></div>`,
    { onClose: () => { if (!done) { done = true; resolve(false); } } });
    m.el.querySelector('[data-no]').onclick = () => m.close();
    m.el.querySelector('[data-yes]').onclick = () => {
      const v = m.el.querySelector('[data-cin]')?.value;
      if (input && !String(v || '').trim()) { m.el.querySelector('[data-cin]').focus(); return; }
      done = true; m.close(); resolve(input ? v : true);
    };
  });
}

// ---------- copy and download ----------
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied'); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied'); } catch { toast('Could not copy. Select the text and copy it.', 'err'); }
    ta.remove();
  }
}
export function downloadText(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export function downloadDataUrl(name, url) {
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
export const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
