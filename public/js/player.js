// "Demo this step" movies and the full "Run live demo".
// Uses saved results only. No outside calls, nothing spent.

import { state, set, refresh, log, emit } from './core/store.js';
import { esc, icon, toolLogo, TOOLS, wordsIn } from './core/ui.js';
import { STEPS, BY_KEY, nextStep, stepRoute, trackSteps } from './steps/frame.js';

export const ctl = { speed: 1, paused: false, skip: false, stop: false, running: false, tour: null };

async function wait(ms) {
  let left = ms;
  while (left > 0) {
    if (ctl.skip || ctl.stop) return;
    await new Promise(r => setTimeout(r, 40));
    if (!ctl.paused) left -= 40 * ctl.speed;
  }
}

function overlayRoot() {
  const content = document.querySelector('.content');
  let el = content.querySelector('.movie');
  if (!el) { el = document.createElement('div'); el.className = 'movie'; content.appendChild(el); }
  content.scrollTop = 0;
  return el;
}

export async function playMovie(step, { inTour = false } = {}) {
  const beats = (step.movie ? step.movie() : null) || [{ line: 'Loading saved results' }, { line: 'Done', ok: true }];
  ctl.skip = false;
  if (!inTour) { ctl.stop = false; ctl.paused = false; ctl.speed = ctl.speed || 1; }
  ctl.running = true;
  state.demoCleared = { ...state.demoCleared, [step.key]: true };
  const root = overlayRoot();
  const nxt = nextStep(step);
  root.innerHTML = `<div class="movie-inner">
    <div class="card movie-card">
      <div class="logos">${(step.uses || []).map(u => toolLogo(u, 34)).join('')}</div>
      <div style="flex:1;min-width:0">
        <div class="tiny dim" style="letter-spacing:.1em;text-transform:uppercase;font-weight:600">Demo run <span class="sep">.</span> saved results</div>
        <div class="h3">${esc(typeof step.title === 'function' ? step.title() : step.title)}</div>
      </div>
      <span class="live-dot"></span>
      <div class="mono small" data-mv-timer>0:00</div>
      <div class="mono peach" style="font-weight:600" data-mv-cost>$0.00</div>
      <button class="btn sm" data-mv-skip>${icon('skip')}Skip</button>
    </div>
    <div class="progress mt12"><i data-mv-prog></i></div>
    <div class="movie-stage" data-mv-stage></div>
  </div>`;
  const stage = root.querySelector('[data-mv-stage]');
  const prog = root.querySelector('[data-mv-prog]');
  const timer = root.querySelector('[data-mv-timer]');
  const costEl = root.querySelector('[data-mv-cost]');
  root.querySelector('[data-mv-skip]').onclick = () => { ctl.skip = true; };
  const t0 = performance.now();
  let elapsed = 0, last = t0;
  const tick = setInterval(() => {
    const now = performance.now();
    if (!ctl.paused) elapsed += (now - last) * ctl.speed;
    last = now;
    const s = Math.floor(elapsed / 1000);
    timer.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }, 200);

  for (let i = 0; i < beats.length; i++) {
    if (ctl.skip || ctl.stop) break;
    await playBeat(stage, beats[i]);
    prog.style.width = ((i + 1) / beats.length) * 100 + '%';
  }
  clearInterval(tick);
  prog.style.width = '100%';
  costEl.textContent = '$0 spent';
  // count the work in the log
  const words = beats.reduce((a, b) => a + (b.type ? wordsIn(b.type) : 0), 0);
  log(`${typeof step.title === 'function' ? step.title() : step.title} (demo run)`, { icon: step.logIcon || 'sparkle', cost: 0, words: step.logWords || words, run: (step.uses || []).some(u => u === 'apify' || u === 'higgsfield' || u === 'aiark') });
  state.demoCleared = { ...state.demoCleared }; delete state.demoCleared[step.key];
  ctl.running = false;
  if (ctl.stop) { root.remove(); refresh(); return 'stopped'; }
  if (inTour) { await wait(500); root.remove(); refresh(); return 'done'; }
  stage.insertAdjacentHTML('beforeend', `<div class="done-bar">
    <span class="done-tag">${icon('check')}Done.${nxt ? ' Next: ' + esc(nxt.title) : ''}</span>
    <div class="btns"><button class="btn" data-mv-close>See the results</button>${nxt ? `<button class="btn main" data-mv-next>Next${icon('arrow')}</button>` : ''}</div></div>`);
  stage.lastElementChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return new Promise(res => {
    stage.querySelector('[data-mv-close]').onclick = () => { root.remove(); refresh(); res('done'); };
    const n = stage.querySelector('[data-mv-next]');
    if (n) n.onclick = () => { root.remove(); location.hash = stepRoute(nxt); res('next'); };
  });
}

async function playBeat(stage, b) {
  const box = document.createElement('div');
  stage.appendChild(box);
  const instant = () => ctl.skip || ctl.stop;
  if (b.head) {
    box.innerHTML = `<div class="h3 mt16" style="margin-bottom:8px">${esc(b.head)}</div>`;
    await wait(200);
  } else if (b.line !== undefined) {
    box.className = 'mv-line';
    box.innerHTML = `<span class="${b.ok ? 'ok' : 'dim'}">${b.ok ? '✓' : '›'}</span><span>${esc(b.line)}</span>${b.cost ? `<span class="peach" style="margin-left:auto">${esc(b.cost)}</span>` : ''}`;
    await wait(b.ms || 260);
  } else if (b.type !== undefined) {
    box.className = 'card mt12';
    box.innerHTML = `${b.title ? `<div class="tiny lilac" style="font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">${esc(b.title)}</div>` : ''}<div class="typed"></div>`;
    const el = box.querySelector('.typed');
    const text = String(b.type);
    const step = Math.max(2, Math.round(text.length / ((b.ms || 1800) / 30)));
    for (let i = 0; i <= text.length; i += step) {
      if (instant()) break;
      el.textContent = text.slice(0, i);
      box.scrollIntoView({ block: 'nearest' });
      await wait(30);
    }
    el.textContent = text;
    el.classList.remove('typed'); el.style.whiteSpace = 'pre-wrap'; el.style.color = 'var(--ink)';
  } else if (b.rows) {
    box.className = 'tbl-wrap mt12';
    box.innerHTML = `<table class="tbl"><thead><tr>${b.rows.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody></tbody></table>`;
    const tb = box.querySelector('tbody');
    for (const r of b.rows.rows) {
      const tr = document.createElement('tr');
      tr.innerHTML = r.map(c => `<td>${typeof c === 'object' && c?.html ? c.html : esc(c)}</td>`).join('');
      tr.style.animation = 'rise .25s ease';
      tb.appendChild(tr);
      box.scrollIntoView({ block: 'nearest' });
      if (!instant()) await wait(b.ms || 160);
    }
  } else if (b.stats) {
    box.className = 'grid g4 mt12';
    box.innerHTML = b.stats.map(([label, v, pre = '', suf = '']) => `<div class="stat"><b data-to="${v}" data-pre="${esc(pre)}" data-suf="${esc(suf)}">${esc(pre)}0${esc(suf)}</b><span>${esc(label)}</span></div>`).join('');
    const els = [...box.querySelectorAll('[data-to]')];
    for (let k = 0; k <= 20; k++) {
      els.forEach(e => { const to = Number(e.dataset.to); const v = instant() ? to : Math.round(to * k / 20); e.textContent = e.dataset.pre + v.toLocaleString('en-US') + e.dataset.suf; });
      if (instant()) break;
      await wait(40);
    }
  } else if (b.html !== undefined) {
    box.className = 'mt12';
    box.style.animation = 'rise .3s ease';
    box.innerHTML = b.html;
    if (b.after) b.after(box);
    await wait(b.ms || 900);
  } else if (b.photo) {
    box.className = 'mt12';
    await b.photo(box, { wait, instant });
  } else if (b.wait) {
    await wait(b.wait);
  }
}

// ---------- the whole app, start to finish ----------
export function tourSteps() {
  return [...trackSteps('product'), ...trackSteps('airbnb')];
}

export async function runTour() {
  if (ctl.tour) return;
  set({ mode: 'demo', hustle: 'airbnb' }, { silent: true });
  const list = tourSteps();
  ctl.tour = { i: 0, total: list.length, startedAt: Date.now() };
  ctl.stop = false; ctl.paused = false; ctl.speed = ctl.speed || 1;
  state.demoCleared = Object.fromEntries(list.map(s => [s.key, true]));
  renderFloat();
  for (let i = 0; i < list.length; i++) {
    if (ctl.stop) break;
    ctl.tour.i = i;
    const s = list[i];
    location.hash = stepRoute(s);
    await new Promise(r => setTimeout(r, 120));
    renderFloat();
    await playMovie(s, { inTour: true });
    ctl.skip = false;
  }
  const stopped = ctl.stop;
  ctl.tour = null;
  document.getElementById('float-root').innerHTML = '';
  state.demoCleared = {};
  if (!stopped) location.hash = '#/summary';
  refresh();
}

export function renderFloat() {
  const root = document.getElementById('float-root');
  if (!ctl.tour) { root.innerHTML = ''; return; }
  const s = tourSteps()[ctl.tour.i];
  root.innerHTML = `<div class="floatbar" role="region" aria-label="Live demo controls">
    <span class="live-dot"></span>
    <div class="fbt">Step <b>${ctl.tour.i + 1} of ${ctl.tour.total}</b>: ${esc(typeof s.title === 'function' ? s.title() : s.title)}</div>
    <div class="seg">${[1, 2, 4].map(v => `<button class="${ctl.speed === v ? 'on' : ''}" data-speed="${v}">${v}x</button>`).join('')}</div>
    <button class="btn sm" data-tour="pause">${icon(ctl.paused ? 'play' : 'pause')}${ctl.paused ? 'Play' : 'Pause'}</button>
    <button class="btn sm" data-tour="skip">${icon('skip')}Skip</button>
    <button class="btn sm danger" data-tour="stop">${icon('stop')}Stop</button>
  </div>`;
  root.querySelectorAll('[data-speed]').forEach(b => b.onclick = () => { ctl.speed = Number(b.dataset.speed); renderFloat(); });
  root.querySelector('[data-tour="pause"]').onclick = () => { ctl.paused = !ctl.paused; renderFloat(); };
  root.querySelector('[data-tour="skip"]').onclick = () => { ctl.skip = true; };
  root.querySelector('[data-tour="stop"]').onclick = () => { ctl.stop = true; ctl.skip = true; };
}

export function loadAll() {
  state.demoCleared = {};
  refresh();
}
