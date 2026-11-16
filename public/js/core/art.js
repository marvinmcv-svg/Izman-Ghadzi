// Drawn stand ins for demo pictures, so nothing ever shows as broken.
// Everything here is generated on this computer. No outside calls.

import { esc } from './ui.js';

function rng(seed) {
  let s = (typeof seed === 'number' ? seed : [...String(seed)].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
}

// ---------- book covers ----------
export function coverSVG({ title = 'The Small Appetite Protein Plan', subtitle = 'Eat enough protein on GLP-1 shots, one small plate at a time', author = 'Product Suite (demo)', kicker = '', variant = 'purple' } = {}) {
  const pal = variant === 'creator'
    ? ['#2b1406', '#ff6a1f', '#ffd3b5', '#fff4ec']
    : variant === 'course' ? ['#071a14', '#2fd287', '#c8f5e2', '#effff8']
    : variant === 'coaching' ? ['#0c1430', '#5b8cff', '#cfdcff', '#f1f5ff']
    : ['#140a33', '#5B2EE8', '#cbbcff', '#f5f2ff'];
  const words = title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 15) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) lines.push(cur.trim());
  const sub = [];
  cur = '';
  for (const w of subtitle.split(' ')) { if ((cur + ' ' + w).trim().length > 30) { sub.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) sub.push(cur.trim());
  const id = 'c' + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(title)} cover">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pal[0]}"/><stop offset="1" stop-color="${pal[1]}" stop-opacity=".55"/></linearGradient>
    <radialGradient id="${id}r" cx=".7" cy=".72" r=".5"><stop offset="0" stop-color="${pal[1]}" stop-opacity=".9"/><stop offset="1" stop-color="${pal[1]}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="400" height="600" fill="${pal[0]}"/>
  <rect width="400" height="600" fill="url(#${id}g)"/>
  <circle cx="280" cy="430" r="190" fill="url(#${id}r)"/>
  <g transform="translate(270 440)">
    <ellipse rx="96" ry="30" cy="34" fill="#000" opacity=".25"/>
    <circle r="92" fill="${pal[3]}"/><circle r="70" fill="none" stroke="${pal[2]}" stroke-width="2" opacity=".7"/>
    <ellipse cx="-22" cy="-6" rx="30" ry="20" fill="#f2c79b"/><ellipse cx="-22" cy="-10" rx="22" ry="11" fill="#fbe2c3"/>
    <circle cx="22" cy="-18" r="15" fill="#7cc36b"/><circle cx="34" cy="-4" r="12" fill="#5aa84a"/><circle cx="16" cy="2" r="10" fill="#8fd17c"/>
    <ellipse cx="14" cy="30" rx="26" ry="14" fill="#ffffff"/><ellipse cx="14" cy="28" rx="20" ry="9" fill="#f6f1e8"/>
    <circle cx="-40" cy="26" r="9" fill="#e85d4a"/><circle cx="-28" cy="34" r="7" fill="#f07c63"/>
  </g>
  ${kicker ? `<text x="34" y="66" fill="${pal[2]}" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="700" letter-spacing="2.5">${esc(kicker.toUpperCase())}</text>` : ''}
  ${lines.map((l, i) => `<text x="32" y="${(kicker ? 122 : 96) + i * 46}" fill="#ffffff" font-family="Geist,Inter,system-ui,sans-serif" font-size="42" font-weight="800" letter-spacing="-1.5">${esc(l)}</text>`).join('')}
  ${sub.map((l, i) => `<text x="34" y="${(kicker ? 122 : 96) + lines.length * 46 + 12 + i * 22}" fill="${pal[2]}" font-family="Inter,system-ui,sans-serif" font-size="16" font-weight="500">${esc(l)}</text>`).join('')}
  <rect x="32" y="548" width="40" height="3" fill="${pal[1]}"/>
  <text x="32" y="574" fill="#ffffff" opacity=".85" font-family="Inter,system-ui,sans-serif" font-size="14" font-weight="600">${esc(author)}</text>
</svg>`;
}

// ---------- small food pictures (creator posts, chapter art) ----------
export function foodSVG(seed = 1, { w = 180, h = 280, label = '' } = {}) {
  const r = rng(seed);
  const bgs = [['#3a2214', '#7a4a2a'], ['#1d2a1f', '#3f6b45'], ['#2a1d33', '#6d4a8a'], ['#30261a', '#a07a43'], ['#1b2433', '#43648f'], ['#3a1a1a', '#8f4a43']];
  const [a, b] = bgs[Math.floor(r() * bgs.length)];
  const items = [];
  const n = 3 + Math.floor(r() * 4);
  const cols = ['#f2c79b', '#7cc36b', '#e85d4a', '#ffffff', '#f5d76e', '#c98b5a', '#9fd8ef', '#b8e08a'];
  for (let i = 0; i < n; i++) {
    const ang = r() * Math.PI * 2, dist = 10 + r() * 34;
    items.push(`<ellipse cx="${w / 2 + Math.cos(ang) * dist}" cy="${h * 0.55 + Math.sin(ang) * dist * 0.7}" rx="${10 + r() * 16}" ry="${8 + r() * 11}" fill="${cols[Math.floor(r() * cols.length)]}"/>`);
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="f${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#f${seed})"/>
    <ellipse cx="${w / 2}" cy="${h * 0.58}" rx="${w * 0.42}" ry="${w * 0.3}" fill="#000" opacity=".25"/>
    <ellipse cx="${w / 2}" cy="${h * 0.55}" rx="${w * 0.4}" ry="${w * 0.28}" fill="#f7f3ee"/>
    <ellipse cx="${w / 2}" cy="${h * 0.55}" rx="${w * 0.31}" ry="${w * 0.21}" fill="none" stroke="#e7dfd4" stroke-width="2"/>
    ${items.join('')}
    ${label ? `<text x="10" y="24" fill="#fff" font-family="Inter,system-ui" font-size="13" font-weight="700">${esc(label)}</text>` : ''}
  </svg>`;
}

export function chapterArt(i) {
  return foodSVG(100 + i * 7, { w: 600, h: 180 });
}

// ---------- rooms (Airbnb listing photos) ----------
// Draws a bright, clean room. "Before" pictures are made from it by darkening, warming,
// lowering contrast and tilting, so the before and after are always the same room.
export function drawRoom(ctx, W, H, seed = 1, kind = 'living') {
  const r = rng(seed);
  const walls = ['#eef0f2', '#f2ede6', '#e9eef0', '#f3efe9', '#e6ebe7'];
  const sofas = ['#5a7184', '#8a6f5a', '#6f8a73', '#4f5b7a', '#9a8a7a'];
  const wall = walls[Math.floor(r() * walls.length)];
  const sofa = sofas[Math.floor(r() * sofas.length)];
  const floorY = H * 0.68;
  // wall
  const wg = ctx.createLinearGradient(0, 0, 0, floorY);
  wg.addColorStop(0, wall); wg.addColorStop(1, shade(wall, -8));
  ctx.fillStyle = wg; ctx.fillRect(0, 0, W, floorY);
  // ceiling line and skirting
  ctx.fillStyle = shade(wall, -14); ctx.fillRect(0, floorY - 8, W, 8);
  // floor planks
  const fg = ctx.createLinearGradient(0, floorY, 0, H);
  fg.addColorStop(0, '#c9a27a'); fg.addColorStop(1, '#a87f58');
  ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H - floorY);
  ctx.strokeStyle = 'rgba(80,50,25,.18)'; ctx.lineWidth = 2;
  for (let x = -W; x < W * 2; x += 70) { ctx.beginPath(); ctx.moveTo(W / 2 + (x - W / 2) * 0.35, floorY); ctx.lineTo(x, H); ctx.stroke(); }
  // window with view
  const wx = W * 0.07, wy = H * 0.12, ww = W * 0.26, wh = H * 0.42;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(wx - 10, wy - 10, ww + 20, wh + 20);
  const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sky.addColorStop(0, '#8fc7ef'); sky.addColorStop(1, '#d7ecf7');
  ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#6aa35a';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(wx + ww * (0.1 + i * 0.22), wy + wh * 0.85, ww * (0.12 + r() * 0.06), 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#7a9c6a'; ctx.fillRect(wx, wy + wh * 0.88, ww, wh * 0.12);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(wx + ww / 2 - 4, wy, 8, wh); ctx.fillRect(wx, wy + wh / 2 - 4, ww, 8);
  // light patch on floor from window
  ctx.fillStyle = 'rgba(255,250,235,.22)';
  ctx.beginPath(); ctx.moveTo(wx + ww * 0.2, floorY); ctx.lineTo(wx + ww * 1.2, floorY); ctx.lineTo(wx + ww * 1.9, H); ctx.lineTo(wx + ww * 0.5, H); ctx.fill();
  // art on wall
  const ax = W * 0.52, ay = H * 0.16, aw = W * 0.2, ah = H * 0.2;
  ctx.fillStyle = '#2f2f33'; ctx.fillRect(ax - 6, ay - 6, aw + 12, ah + 12);
  const ag = ctx.createLinearGradient(ax, ay, ax + aw, ay + ah);
  ag.addColorStop(0, '#f0b37e'); ag.addColorStop(1, '#5b7fa3');
  ctx.fillStyle = ag; ctx.fillRect(ax, ay, aw, ah);
  ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(ax + aw * 0.7, ay + ah * 0.35, ah * 0.18, 0, Math.PI * 2); ctx.fill();
  if (kind === 'bedroom') {
    // bed
    ctx.fillStyle = '#6b5440'; ctx.fillRect(W * 0.4, H * 0.36, W * 0.44, H * 0.18);
    ctx.fillStyle = '#ffffff'; roundRect(ctx, W * 0.38, H * 0.5, W * 0.48, H * 0.22, 14); ctx.fill();
    ctx.fillStyle = sofa; roundRect(ctx, W * 0.38, H * 0.6, W * 0.48, H * 0.12, 10); ctx.fill();
    ctx.fillStyle = '#f4f1ec'; roundRect(ctx, W * 0.42, H * 0.44, W * 0.17, H * 0.09, 12); ctx.fill(); roundRect(ctx, W * 0.63, H * 0.44, W * 0.17, H * 0.09, 12); ctx.fill();
  } else if (kind === 'kitchen') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(W * 0.38, H * 0.08, W * 0.58, H * 0.2);
    ctx.fillStyle = '#e8e3dc'; ctx.fillRect(W * 0.38, H * 0.42, W * 0.58, H * 0.3);
    ctx.fillStyle = '#3b3b40'; ctx.fillRect(W * 0.38, H * 0.4, W * 0.58, H * 0.03);
    ctx.strokeStyle = '#cfc8be'; for (let i = 0; i < 5; i++) { ctx.strokeRect(W * (0.39 + i * 0.115), H * 0.45, W * 0.105, H * 0.25); ctx.strokeRect(W * (0.39 + i * 0.115), H * 0.1, W * 0.105, H * 0.16); }
    ctx.fillStyle = '#7cc36b'; ctx.beginPath(); ctx.arc(W * 0.5, H * 0.36, 16, 0, Math.PI * 2); ctx.fill();
  } else {
    // rug
    ctx.fillStyle = '#e9e1d4'; ctx.beginPath(); ctx.ellipse(W * 0.58, H * 0.86, W * 0.3, H * 0.09, 0, 0, Math.PI * 2); ctx.fill();
    // sofa
    ctx.fillStyle = shade(sofa, -15); roundRect(ctx, W * 0.4, H * 0.42, W * 0.46, H * 0.16, 18); ctx.fill();
    ctx.fillStyle = sofa; roundRect(ctx, W * 0.38, H * 0.53, W * 0.5, H * 0.14, 16); ctx.fill();
    ctx.fillStyle = shade(sofa, -25); ctx.fillRect(W * 0.41, H * 0.67, 10, H * 0.04); ctx.fillRect(W * 0.84, H * 0.67, 10, H * 0.04);
    ctx.fillStyle = '#f2ece2'; roundRect(ctx, W * 0.43, H * 0.45, W * 0.08, H * 0.09, 10); ctx.fill();
    ctx.fillStyle = '#e0a96d'; roundRect(ctx, W * 0.75, H * 0.45, W * 0.08, H * 0.09, 10); ctx.fill();
    // coffee table
    ctx.fillStyle = '#8a6440'; roundRect(ctx, W * 0.48, H * 0.76, W * 0.2, H * 0.035, 6); ctx.fill();
    ctx.fillStyle = '#6f4f32'; ctx.fillRect(W * 0.5, H * 0.79, 6, H * 0.06); ctx.fillRect(W * 0.66, H * 0.79, 6, H * 0.06);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(W * 0.56, H * 0.755, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
  }
  // lamp
  ctx.fillStyle = '#2f2f33'; ctx.fillRect(W * 0.92, H * 0.3, 4, H * 0.4);
  ctx.fillStyle = '#f7efe0'; ctx.beginPath(); ctx.moveTo(W * 0.9, H * 0.3); ctx.lineTo(W * 0.96, H * 0.3); ctx.lineTo(W * 0.975, H * 0.22); ctx.lineTo(W * 0.885, H * 0.22); ctx.fill();
  // plant
  ctx.fillStyle = '#c4703e'; roundRect(ctx, W * 0.34, H * 0.6, W * 0.05, H * 0.08, 4); ctx.fill();
  ctx.fillStyle = '#4f8f4a';
  for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(W * 0.365 + (r() - 0.5) * 40, H * 0.55 - r() * 50, 9, 22, (r() - 0.5) * 1.6, 0, Math.PI * 2); ctx.fill(); }
}

function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, v + amt));
  return '#' + ((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0');
}

// Turn a clean room into a dark, yellowish, slightly crooked, soft "before" photo.
export function makeBefore(src, { dark = 0.5, warm = 1, tilt = 1.8, blur = 1.1 } = {}) {
  const W = src.width, H = src.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.rotate(tilt * Math.PI / 180); ctx.scale(1.07, 1.07);
  try { ctx.filter = `blur(${blur}px)`; } catch { /* old browser */ }
  ctx.drawImage(src, -W / 2, -H / 2);
  ctx.restore();
  try { ctx.filter = 'none'; } catch { /* fine */ }
  const img = ctx.getImageData(0, 0, W, H); const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];
    // lower contrast around a dim middle, then darken and warm
    r = 70 + (r - 128) * 0.62; g = 70 + (g - 128) * 0.62; b = 70 + (b - 128) * 0.62;
    d[i] = Math.max(0, Math.min(255, r * (0.62 + 0.4 * (1 - dark)) * (1 + 0.16 * warm)));
    d[i + 1] = Math.max(0, Math.min(255, g * (0.6 + 0.4 * (1 - dark)) * (1 + 0.05 * warm)));
    d[i + 2] = Math.max(0, Math.min(255, b * (0.5 + 0.4 * (1 - dark)) * (1 - 0.18 * warm)));
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function roomCanvas(seed, kind = 'living', W = 900, H = 600) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  drawRoom(c.getContext('2d'), W, H, seed, kind);
  return c;
}

const photoCache = new Map();
// A listing photo as a data URL. quality 0 (very weak) to 10 (great).
export function listingPhoto(seed, kind, quality) {
  const k = seed + kind + quality;
  if (photoCache.has(k)) return photoCache.get(k);
  const base = roomCanvas(seed, kind, 480, 320);
  const weak = Math.max(0, Math.min(1, (10 - quality) / 10));
  const out = weak > 0.25 ? makeBefore(base, { dark: weak, warm: weak, tilt: weak * 2.2 * (seed % 2 ? 1 : -1), blur: weak * 1.2 }) : base;
  const url = out.toDataURL('image/jpeg', 0.82);
  photoCache.set(k, url);
  return url;
}

// Real measurements on the pixels: brightness (0 to 255), contrast (spread), sharpness, pixels changed.
export function measure(canvas) {
  const ctx = canvas.getContext('2d');
  const { width: W, height: H } = canvas;
  const d = ctx.getImageData(0, 0, W, H).data;
  let sum = 0, sum2 = 0, n = 0;
  const lum = new Float32Array(W * H);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; lum[p] = l; sum += l; sum2 += l * l; n++; }
  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
  let lap = 0, ln = 0;
  for (let y = 1; y < H - 1; y += 2) for (let x = 1; x < W - 1; x += 2) {
    const p = y * W + x;
    const v = 4 * lum[p] - lum[p - 1] - lum[p + 1] - lum[p - W] - lum[p + W];
    lap += v * v; ln++;
  }
  return { brightness: Math.round(mean), contrast: Math.round(std), sharpness: Math.round(Math.sqrt(lap / ln) * 10) / 10, lum };
}
export function changedPct(a, b) {
  const n = Math.min(a.lum.length, b.lum.length);
  let c = 0;
  for (let i = 0; i < n; i++) if (Math.abs(a.lum[i] - b.lum[i]) > 12) c++;
  return Math.round((c / n) * 100);
}
// A 0 to 10 photo score from measurements (no AI).
export function photoScore(m) {
  const b = Math.max(0, 1 - Math.abs(m.brightness - 150) / 110);
  const c = Math.min(1, m.contrast / 60);
  const s = Math.min(1, m.sharpness / 9);
  return Math.round((b * 0.5 + c * 0.3 + s * 0.2) * 100) / 10;
}

// ---------- ads ----------
// One scene per angle. No words in the picture: the headline is drawn on top as clean text later.
export function drawAdScene(ctx, S, angle = 'pain', seed = 3) {
  const r = rng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, S * 0.7);
  if (angle === 'pain') { sky.addColorStop(0, '#2b3442'); sky.addColorStop(1, '#5b6676'); }
  else if (angle === 'offer') { sky.addColorStop(0, '#f6b77a'); sky.addColorStop(1, '#fde3c4'); }
  else if (angle === 'today') { sky.addColorStop(0, '#9aa3ab'); sky.addColorStop(1, '#c9ced2'); }
  else { sky.addColorStop(0, '#5ea8e6'); sky.addColorStop(1, '#cfe7f8'); }
  ctx.fillStyle = sky; ctx.fillRect(0, 0, S, S);
  if (angle === 'pain') {
    ctx.fillStyle = 'rgba(30,35,45,.7)';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(r() * S, S * (0.08 + r() * 0.15), S * 0.2, S * 0.07, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(200,215,230,.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 80; i++) { const x = r() * S, y = r() * S * 0.7; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 26); ctx.stroke(); }
  } else if (angle !== 'today') {
    ctx.fillStyle = angle === 'offer' ? '#fff4d6' : '#fff8e0';
    ctx.beginPath(); ctx.arc(S * 0.8, S * 0.18, S * 0.08, 0, Math.PI * 2); ctx.fill();
  }
  // ground and trees
  ctx.fillStyle = angle === 'pain' ? '#3d4d3a' : '#6ea05a'; ctx.fillRect(0, S * 0.72, S, S * 0.28);
  ctx.fillStyle = angle === 'pain' ? '#2c3a2b' : '#4f8a45';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(S * (0.05 + i * 0.3), S * 0.66, S * 0.08, 0, Math.PI * 2); ctx.fill(); }
  // house
  const hx = S * 0.18, hy = S * 0.45, hw = S * 0.64, hh = S * 0.3;
  ctx.fillStyle = angle === 'pain' ? '#b9b2a6' : '#efe7da'; ctx.fillRect(hx, hy, hw, hh);
  ctx.fillStyle = angle === 'pain' ? '#3a3f47' : angle === 'proof' ? '#3e4a5c' : '#55606f';
  ctx.beginPath(); ctx.moveTo(hx - S * 0.05, hy + 4); ctx.lineTo(S * 0.5, S * 0.2); ctx.lineTo(hx + hw + S * 0.05, hy + 4); ctx.closePath(); ctx.fill();
  // shingles
  ctx.strokeStyle = angle === 'proof' ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.2)'; ctx.lineWidth = 2;
  for (let y = S * 0.24; y < hy; y += S * 0.03) { const t = (y - S * 0.2) / (hy - S * 0.2); ctx.beginPath(); ctx.moveTo(S * 0.5 - t * (hw / 2 + S * 0.05), y); ctx.lineTo(S * 0.5 + t * (hw / 2 + S * 0.05), y); ctx.stroke(); }
  if (angle === 'pain') {
    ctx.fillStyle = '#2f6fd6'; ctx.beginPath(); ctx.moveTo(S * 0.36, S * 0.33); ctx.lineTo(S * 0.52, S * 0.29); ctx.lineTo(S * 0.56, S * 0.38); ctx.lineTo(S * 0.38, S * 0.42); ctx.fill();
    ctx.fillStyle = 'rgba(60,90,140,.55)'; ctx.beginPath(); ctx.ellipse(S * 0.45, S * 0.72, S * 0.12, S * 0.02, 0, 0, Math.PI * 2); ctx.fill();
  }
  // windows and door
  ctx.fillStyle = angle === 'pain' ? '#e8c46a' : '#a9d3f0';
  [[0.26, 0.52], [0.62, 0.52]].forEach(([x, y]) => { ctx.fillRect(S * x, S * y, S * 0.1, S * 0.08); });
  ctx.fillStyle = '#6b4a2f'; ctx.fillRect(S * 0.46, S * 0.58, S * 0.08, S * 0.17);
  if (angle === 'offer') {
    // roofer with clipboard on a ladder
    ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(S * 0.84, S * 0.75); ctx.lineTo(S * 0.74, S * 0.4); ctx.moveTo(S * 0.88, S * 0.75); ctx.lineTo(S * 0.78, S * 0.4); ctx.stroke();
    ctx.fillStyle = '#ff6a1f'; ctx.fillRect(S * 0.75, S * 0.4, S * 0.05, S * 0.09);
    ctx.fillStyle = '#f0c8a0'; ctx.beginPath(); ctx.arc(S * 0.775, S * 0.37, S * 0.022, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.fillRect(S * 0.752, S * 0.342, S * 0.046, S * 0.014);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(S * 0.8, S * 0.42, S * 0.03, S * 0.04);
  }
  if (angle === 'proof') {
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(S * 0.42, S * 0.24); ctx.lineTo(S * 0.47, S * 0.22); ctx.lineTo(S * 0.36, S * 0.42); ctx.lineTo(S * 0.31, S * 0.42); ctx.fill();
  }
}

function wrapText(ctx, text, maxW) {
  const words = String(text).split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  return lines;
}

// A finished ad: picture, then clean headline text and an orange button drawn on top.
export function adCanvas({ angle = 'pain', headline = '', button = '', seed = 3, size = 1080, plain = false }) {
  const c = document.createElement('canvas'); c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  drawAdScene(ctx, size, plain ? 'today' : angle, seed);
  if (plain) return c;
  const g = ctx.createLinearGradient(0, 0, 0, size * 0.42);
  g.addColorStop(0, 'rgba(10,10,16,.78)'); g.addColorStop(1, 'rgba(10,10,16,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size * 0.42);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.round(size * 0.062)}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, headline, size * 0.86);
  lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, size * 0.07, size * 0.07 + i * size * 0.075));
  if (button) {
    ctx.font = `700 ${Math.round(size * 0.036)}px Inter, system-ui, sans-serif`;
    const tw = ctx.measureText(button).width;
    const bw = tw + size * 0.08, bh = size * 0.085, bx = size * 0.07, by = size * 0.86;
    ctx.fillStyle = '#FF6A1F'; roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fill();
    ctx.fillStyle = '#1d0c02'; ctx.textBaseline = 'middle'; ctx.fillText(button, bx + size * 0.04, by + bh / 2 + 1);
  }
  return c;
}

// ---------- Shorts clips (animated, play on hover) ----------
export function clipSVG(i) {
  const scenes = [
    // 0 hook: one $100 bill
    `<rect width="180" height="320" fill="#0d1b12"/><g class="a-pop"><rect x="35" y="130" width="110" height="56" rx="6" fill="#6fbf73"/><rect x="41" y="136" width="98" height="44" rx="4" fill="none" stroke="#e8ffe8" stroke-width="2"/><text x="90" y="166" text-anchor="middle" fill="#e8ffe8" font-size="22" font-weight="800" font-family="Inter">$100</text></g><text x="90" y="80" text-anchor="middle" fill="#fff" font-size="15" font-weight="800" font-family="Inter">30 years?</text>`,
    // 1 jar filling
    `<rect width="180" height="320" fill="#131a2b"/><rect x="50" y="110" width="80" height="120" rx="14" fill="none" stroke="#cfe0ff" stroke-width="4"/><rect class="a-fill" x="54" y="226" width="72" height="0" rx="10" fill="#f5c542"/><circle class="a-drop" cx="90" cy="70" r="9" fill="#f5c542"/>`,
    // 2 growing bars
    `<rect width="180" height="320" fill="#1d1430"/>${[0, 1, 2, 3, 4, 5].map(k => `<rect class="a-grow" style="animation-delay:${k * 0.25}s" x="${22 + k * 24}" y="${250 - (k + 1) * (k + 1) * 4.2}" width="16" height="${(k + 1) * (k + 1) * 4.2}" rx="3" fill="${k === 5 ? '#ff6a1f' : '#7a55ff'}"/>`).join('')}<line x1="15" y1="252" x2="165" y2="252" stroke="#fff" stroke-opacity=".3"/>`,
    // 3 calendar pages
    `<rect width="180" height="320" fill="#20160f"/>${[0, 1, 2].map(k => `<g class="a-flip" style="animation-delay:${k * 0.6}s"><rect x="45" y="${110 + k * 6}" width="90" height="96" rx="8" fill="#fff"/><rect x="45" y="${110 + k * 6}" width="90" height="22" rx="8" fill="#e85d4a"/><text x="90" y="${178 + k * 6}" text-anchor="middle" font-size="30" font-weight="800" fill="#222" font-family="Inter">${['1', '10', '30'][k]}</text></g>`).join('')}<text x="90" y="250" text-anchor="middle" fill="#ffd3b5" font-size="13" font-family="Inter" font-weight="700">years</text>`,
    // 4 snowball
    `<rect width="180" height="320" fill="#0f2233"/><path d="M0 250 L180 190 L180 320 L0 320Z" fill="#e8f3ff"/><circle class="a-roll" cx="40" cy="230" r="14" fill="#fff" stroke="#bcd" stroke-width="2"/>`,
    // 5 coin stack
    `<rect width="180" height="320" fill="#1a1a10"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<ellipse class="a-stack" style="animation-delay:${k * 0.18}s" cx="90" cy="${240 - k * 14}" rx="34" ry="9" fill="#f5c542" stroke="#b8902a" stroke-width="2"/>`).join('')}`,
    // 6 clock
    `<rect width="180" height="320" fill="#141d1a"/><circle cx="90" cy="160" r="54" fill="none" stroke="#c8f5e2" stroke-width="4"/><line class="a-spin" x1="90" y1="160" x2="90" y2="118" stroke="#2fd287" stroke-width="4" stroke-linecap="round" style="transform-origin:90px 160px"/><circle cx="90" cy="160" r="5" fill="#2fd287"/>`,
    // 7 end card
    `<rect width="180" height="320" fill="#5B2EE8"/><text x="90" y="140" text-anchor="middle" fill="#fff" font-size="16" font-weight="800" font-family="Inter">Start small.</text><text x="90" y="164" text-anchor="middle" fill="#fff" font-size="16" font-weight="800" font-family="Inter">Start early.</text><text class="a-pop" x="90" y="200" text-anchor="middle" fill="#ffd3b5" font-size="12" font-family="Inter">Not financial advice</text>`,
  ];
  return `<svg viewBox="0 0 180 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice"><style>
    .a-pop{animation:pop 2s ease-in-out infinite;transform-origin:90px 160px}
    @keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
    .a-fill{animation:fill 4s ease-in-out infinite}
    @keyframes fill{0%{height:0;y:226px}100%{height:110px;y:116px}}
    .a-drop{animation:drop 1s ease-in infinite}
    @keyframes drop{0%{transform:translateY(0);opacity:1}100%{transform:translateY(120px);opacity:0}}
    .a-grow{transform-origin:center bottom;transform-box:fill-box;animation:grow 3s ease-out infinite}
    @keyframes grow{0%{transform:scaleY(0)}60%,100%{transform:scaleY(1)}}
    .a-flip{animation:flip 3.6s ease-in-out infinite}
    @keyframes flip{0%{opacity:0;transform:translateY(-10px)}20%,100%{opacity:1;transform:none}}
    .a-roll{animation:roll 3s ease-in infinite}
    @keyframes roll{0%{transform:translate(0,0) scale(1)}100%{transform:translate(110px,-34px) scale(2.4)}}
    .a-stack{animation:st 2.4s ease-out infinite}
    @keyframes st{0%{opacity:0;transform:translateY(-20px)}30%,100%{opacity:1;transform:none}}
    .a-spin{animation:spin 2s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
  </style>${scenes[i % scenes.length]}</svg>`;
}

// Preview pictures for the hustle cards
export function hustlePreview(kind) {
  if (kind === 'airbnb') {
    const c = roomCanvas(4, 'living', 640, 400);
    const b = makeBefore(c, { dark: 0.6 });
    const ctx = c.getContext('2d');
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 320, 400); ctx.clip(); ctx.drawImage(b, 0, 0); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.fillRect(318, 0, 4, 400);
    return c;
  }
  if (kind === 'ads') {
    const c = document.createElement('canvas'); c.width = 640; c.height = 400;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1a1a22'; ctx.fillRect(0, 0, 640, 400);
    const a = adCanvas({ angle: 'pain', headline: 'Leak after the storm? We find it fast.', button: 'Free roof check', size: 360 });
    const t = adCanvas({ plain: true, size: 300 });
    ctx.globalAlpha = 0.6; ctx.drawImage(t, 30, 50); ctx.globalAlpha = 1;
    ctx.drawImage(a, 250, 20);
    return c;
  }
  const d = document.createElement('div');
  d.innerHTML = `<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="400" fill="#141420"/>${[0, 1, 2, 3].map(k => `<g transform="translate(${40 + k * 145} 30) scale(.75)">${clipSVG(k).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`).join('')}</svg>`;
  return d.firstElementChild;
}
