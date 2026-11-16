// Product Suite: the shell, router and global actions.
import { state, set, subscribe, emit, refresh, setTheme, log, isDemo, persist, ui, setUi } from './core/store.js';
import { esc, icon, pill, money, toast, copyText, modal, confirmBox, toolLogo, TOOLS } from './core/ui.js';
import { api, refreshServer, spendText, spentValue, ApiError, HOSTED } from './core/api.js';
import { STEPS, BY_KEY, SECTIONS, stepsIn, trackSteps, isDone, frame, stepRoute, sectionDone, toolStatus, nextStep } from './steps/frame.js';
import './steps/build.js';
import './steps/outreach.js';
import './steps/launch.js';
import './steps/hustles.js';
import { home, settings, bindSettings, unibox, bindUnibox, unreadCount, hustlePick, bindHustlePick, summary, openPdf, helperBanner } from './screens/screens.js';
import { playMovie, runTour, loadAll, ctl, renderFloat } from './player.js';
import { HUSTLES } from './data/hustles.js';
import { pollReplies, OUT_KEYS, campState } from './steps/outreach.js';
import { bookWords } from './data/book.js';

const app = document.getElementById('app');
app.innerHTML = `<div class="app">
  <aside class="side" id="side" aria-label="Main menu"></aside>
  <div class="maincol"><header class="topbar" id="top"></header><main class="content" id="content"><div id="main"></div></main></div>
  <aside class="rightp" id="right" aria-label="What the app did"></aside>
</div>`;
const $side = document.getElementById('side'), $top = document.getElementById('top'), $right = document.getElementById('right'), $main = document.getElementById('main'), $content = document.getElementById('content');

// ---------- routing ----------
function currentStep() {
  const m = state.route.match(/^#\/step\/(.+)$/);
  return m ? BY_KEY[m[1]] : null;
}
function onRoute() {
  let r = location.hash || '#/home';
  if (r.startsWith('#/step/') && !BY_KEY[r.slice(7)]) r = '#/home';
  state.route = r;
  const s = currentStep();
  if (s && s.track !== 'product' && state.hustle !== s.track) { state.hustle = s.track; persist('hustle'); }
  $side.classList.remove('open');
  $content.scrollTop = 0;
  refresh();
}
window.addEventListener('hashchange', onRoute);

// ---------- sidebar ----------
const LOGO = `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 17l5-10 4 7 2-3 4 6"/></svg>`;
function sideHtml() {
  const s = currentStep();
  const r = state.route;
  const unread = unreadCount();
  const section = (track, sec) => {
    const list = stepsIn(track, sec);
    const open = s && s.track === track && s.section === sec;
    const done = list.every(isDone);
    const first = list.find(x => !isDone(x)) || list[0];
    return `<button class="nav-sec ${open ? 'on' : ''} ${done && !open ? 'done' : ''}" data-go="${stepRoute(first)}" aria-expanded="${open}"><span class="n">${done && !open ? '✓' : SECTIONS[sec].n}</span>${esc(SECTIONS[sec].label)}</button>
      ${open ? `<div class="substeps">${list.map((x, i) => `<button class="substep ${x === s ? 'on' : ''} ${isDone(x) ? 'done' : ''}" data-go="${stepRoute(x)}"><span class="i">${isDone(x) && x !== s ? '✓' : i + 1}</span>${esc(typeof x.short === 'function' ? x.short() : x.short || x.title)}</button>`).join('')}</div>` : ''}`;
  };
  const h = state.hustle;
  return `<div class="side-scroll">
    <div class="brand"><div class="logo">${LOGO}</div><div><b>Product Suite</b><span>Make it, sell it, get clients</span></div></div>
    <nav>
      <button class="nav-item ${r === '#/home' ? 'on' : ''}" data-go="#/home">${icon('home')}Home</button>
      <button class="nav-item ${r === '#/unibox' ? 'on' : ''}" data-go="#/unibox">${icon('inbox')}Unibox${unread ? `<span class="count" aria-label="${unread} unread">${unread}</span>` : ''}</button>
      <button class="nav-item ${r === '#/settings' ? 'on' : ''}" data-go="#/settings">${icon('gear')}Settings</button>
      <div class="nav-group"><div class="nav-label">Digital product</div>
        <select class="nav-select" data-format aria-label="Product format"><option value="ebook" ${state.format === 'ebook' ? 'selected' : ''}>Ebook</option><option value="course" ${state.format === 'course' ? 'selected' : ''}>Course</option><option value="coaching" ${state.format === 'coaching' ? 'selected' : ''}>Coaching</option></select>
        ${section('product', 'build')}${section('product', 'send')}${section('product', 'launch')}
      </div>
      <div class="nav-group"><div class="nav-label">AI side hustles</div>
        <select class="nav-select" data-hustle aria-label="Side hustle">${Object.values(HUSTLES).map(x => `<option value="${x.id}" ${h === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        ${section(h, 'work')}${section(h, 'clients')}${section(h, 'paid')}
      </div>
    </nav></div>
  <div class="side-foot">
    <div class="seg full mode" role="tablist" aria-label="Mode"><button class="${isDemo() ? 'on demo' : ''}" data-mode="demo">Demo</button><button class="${!isDemo() ? 'on live' : ''}" data-mode="live">Live</button></div>
    ${isDemo() ? `<div class="demo-row"><button class="btn money" data-tour-start ${ctl.tour ? 'disabled' : ''}>${icon('play')}Run live demo</button><button class="btn" data-loadall>Load all</button><button class="btn" data-saved>Saved</button></div>` : ''}
    <div class="spendline"><span>${esc(spendText())}</span><b>${money(spentValue())}</b></div>
  </div>`;
}

// ---------- top bar ----------
function pathStages() {
  return [
    { label: 'Make it', done: sectionDone('product', 'build'), key: 'p.build.idea', keys: stepsIn('product', 'build').map(s => s.key) },
    { label: 'Find buyers', done: ['p.send.find', 'p.send.emails'].every(k => isDone(BY_KEY[k])), key: 'p.send.find', keys: ['p.send.find', 'p.send.emails'] },
    { label: 'Send', done: ['p.send.inboxes', 'p.send.write', 'p.send.track', 'p.send.replies'].every(k => isDone(BY_KEY[k])), key: 'p.send.inboxes', keys: ['p.send.inboxes', 'p.send.write', 'p.send.track', 'p.send.replies'] },
    { label: 'Launch', done: sectionDone('product', 'launch'), key: 'p.launch.offer', keys: stepsIn('product', 'launch').map(s => s.key) },
  ];
}
function topHtml() {
  const st = pathStages();
  const s = currentStep();
  const curIdx = s && s.track === 'product' ? st.findIndex(x => x.keys.includes(s.key)) : st.findIndex(x => !x.done);
  const done = st.filter(x => x.done).length;
  return `<button class="btn sm quiet menu-toggle" data-menu aria-label="Open menu">${icon('menu')}</button>
    <span class="path-label">Your path: <b>${done} of 4</b> done</span>
    <div class="dots">${st.map((x, i) => `${i ? `<span class="dot-link ${st[i - 1].done ? 'done' : ''}"></span>` : ''}<button class="dot-step ${x.done && i !== curIdx ? 'done' : ''} ${i === curIdx ? 'cur' : ''}" data-go="${stepRoute(BY_KEY[x.key])}"><span class="dot">${x.done && i !== curIdx ? icon('check') : ''}</span><span>${x.label}</span></button>`).join('')}</div>
    <div class="top-right">
      <button class="btn sm" data-go="#/hustles">${icon('sparkle')}3 side hustles</button>
      <button class="btn sm" data-theme aria-label="Switch to ${state.theme === 'dark' ? 'light' : 'dark'} theme">${icon(state.theme === 'dark' ? 'sun' : 'moon')}${state.theme === 'dark' ? 'Light' : 'Dark'}</button>
      <button class="btn sm panel-toggle" data-panel aria-label="Show what the app did">${icon('panel')}</button>
    </div>`;
}

// ---------- right panel ----------
const TOOL_ORDER = ['claude', 'apify', 'higgsfield', 'aiark', 'instantly', 'whop', 'nanobanana', 'spaceship', 'scaledmail'];
function rightHtml() {
  const connected = isDemo() ? 9 : TOOL_ORDER.filter(t => toolStatus(t) === 'ok').length;
  const open = state.ui.toolsOpen;
  const lg = state.log;
  return `<div class="rp-head">
    <div class="row between"><div class="rp-title"><span class="live-dot"></span>What the app did</div><button class="btn sm quiet panel-toggle" data-panel aria-label="Close">${icon('x')}</button></div>
    <div class="counters"><div class="counter"><b>${state.counters.words.toLocaleString('en-US')}</b><span>Words written</span></div><div class="counter"><b>${state.counters.runs}</b><span>Searches and runs</span></div></div>
    <button class="tools-row" data-toolsopen aria-expanded="${!!open}"><span>Tools connected: <b class="ink mono">${connected} of 9</b>${isDemo() ? ' (demo)' : ''}</span>${icon(open ? 'x' : 'arrow', 'style="width:14px;height:14px"')}</button>
    ${open ? `<div class="tools-list">${TOOL_ORDER.map(t => `<div><span class="row" style="gap:8px">${toolLogo(t, 18)}${esc(TOOLS[t].name)}</span>${isDemo() ? pill('Demo', 'purple') : toolStatus(t) === 'ok' ? pill('Connected', 'green') : toolStatus(t) === 'bad' ? pill('Did not work', 'red') : toolStatus(t) === 'saved' ? pill('Not tested', 'orange') : pill('Not added', 'grey')}</div>`).join('')}</div>` : ''}
  </div>
  <div class="rp-log" aria-live="polite">${lg.length ? lg.map(l => `<div class="log-item"><div class="log-ico">${icon(l.icon)}</div><div><div class="t">${esc(l.text)}</div><div class="m"><span>${l.time}</span>${l.cost !== null && l.cost !== undefined ? `<span class="cost">${money(l.cost)}</span>` : ''}</div></div></div>`).join('') : `<p class="small dim" style="padding:8px">Every search, robot run, words written, cost and send shows up here, newest on top.</p>`}</div>
  <div class="rp-foot">${[['send', 'Nothing sends or posts without your yes'], ['coin', 'Every cost is shown before it runs'], ['lock', 'Your keys stay on this computer']].map(([i, t]) => `<div class="promise">${icon('check')}<span>${t}</span></div>`).join('')}</div>`;
}

// ---------- main area ----------
function mainHtml() {
  const r = state.route;
  const banner = state.serverDown && !isDemo() && r !== '#/settings' ? `<div class="page" style="padding-bottom:0">${helperBanner()}</div>` : '';
  if (r === '#/settings') return settings();
  if (r === '#/unibox') return unibox();
  if (r === '#/hustles') return hustlePick();
  if (r === '#/summary') return summary();
  const s = currentStep();
  if (s) return banner + frame(s, s.render(s));
  return home();
}
function bindMain() {
  const r = state.route;
  if (r === '#/settings') return bindSettings($main);
  if (r === '#/unibox') return bindUnibox($main);
  if (r === '#/hustles') return bindHustlePick($main);
  const s = currentStep();
  if (s && s.bind) try { s.bind($main, s); } catch (e) { console.error(e); }
}

let lastRoute = null;
function render() {
  $side.innerHTML = sideHtml();
  $top.innerHTML = topHtml();
  const rpScroll = $right.querySelector('.rp-log')?.scrollTop || 0;
  $right.innerHTML = rightHtml();
  const rl = $right.querySelector('.rp-log'); if (rl) rl.scrollTop = rpScroll;
  if (state.mainDirty || lastRoute !== state.route) {
    const keepScroll = lastRoute === state.route ? $content.scrollTop : 0;
    const focusId = document.activeElement?.id;
    $main.innerHTML = mainHtml();
    bindMain();
    $content.scrollTop = keepScroll;
    if (focusId) document.getElementById(focusId)?.focus();
    state.mainDirty = false;
    lastRoute = state.route;
  }
}
subscribe(render);

// ---------- running a step ----------
const NEEDS = { 'p.build.idea': [], 'p.build.book': ['claude'], 'h.airbnb.work.spot': [], 'p.launch.offer': ['claude'] };
function needsFor(step) {
  if (NEEDS[step.key]) return NEEDS[step.key];
  if (/\.(inboxes)$/.test(step.key)) return [];
  if (/\.write$/.test(step.key)) return ['claude'];
  if (/\.track$/.test(step.key)) return ['instantly'];
  if (/\.paid\.(price|paylink|deliver)$/.test(step.key)) return [];
  return (step.uses || []).filter(u => u !== 'local');
}
async function runStep(step) {
  if (!step) return;
  if (isDemo()) { if (step.demoMain) { try { await step.run(step); } catch (e) { toast(e.message, 'err'); } } else await playMovie(step); return; }
  if (state.serverDown || !state.server) { await refreshServer(); if (!state.server) { toast('The local helper is not running. Start it with: npm start', 'err'); return; } }
  const missing = needsFor(step).find(t => !state.server.connectors?.[t]?.has);
  if (missing) { setUi('keypop:' + step.key, missing); toast(`Add your ${TOOLS[missing].name} key first. It opens below.`, 'err'); return; }
  setUi('running:' + step.key, true);
  try {
    await step.run(step);
  } catch (e) {
    const m = e?.message || 'Something went wrong.';
    if (e instanceof ApiError && e.status === 412) { const t = needsFor(step).find(x => m.includes(TOOLS[x]?.name)); if (t) setUi('keypop:' + step.key, t); }
    toast(e?.status === 401 ? m + ' Press "Test (free)" to check it.' : m, 'err');
    log('Stopped: ' + m, { icon: 'info' });
  } finally {
    setUi('running:' + step.key, false);
    refreshServer();
  }
}

// ---------- key forms (Settings and the Uses chips) ----------
async function keyAction(kind, tool, btn) {
  const form = btn.closest('[data-keyform]');
  btn.classList.add('running');
  try {
    if (kind === 'save') {
      const values = {};
      form.querySelectorAll('[data-kf]').forEach(i => { if (i.value.trim()) values[i.dataset.kf] = i.value.trim(); });
      if (!Object.keys(values).length) { toast('Paste a key first', 'err'); return; }
      await api('keys/save', { tool, values });
      form.querySelectorAll('[data-kf]').forEach(i => { i.value = ''; });
      log(`Saved your ${TOOLS[tool].name} key on this computer`, { icon: 'key', cost: 0 });
      await refreshServer();
      toast('Saved. Press "Test (free)" to check it.');
    } else if (kind === 'test') {
      const r = await api('keys/test', { tool });
      set({ server: r.state });
      log(`Tested ${TOOLS[tool].name}: ${r.detail}`, { icon: r.ok ? 'check' : 'info', cost: 0 });
      toast(r.detail, r.ok ? 'ok' : 'err');
    } else if (kind === 'remove') {
      const ok = await confirmBox({ title: `Remove your ${TOOLS[tool].name} key?`, intro: 'It is deleted from the private file on this computer.', yes: 'Remove' });
      if (!ok) return;
      const s = await api('keys/remove', { tool }); set({ server: s });
      log(`Removed your ${TOOLS[tool].name} key`, { icon: 'lock', cost: 0 });
    }
  } catch (e) { toast(e.message, 'err'); } finally { btn.classList.remove('running'); }
}

// ---------- mode ----------
async function setMode(mode) {
  if (mode === state.mode) return;
  if (HOSTED && mode === 'live') {
    await confirmBox({ title: 'Live mode runs on your computer', intro: 'This online version is a demo. Live mode uses your own API keys, so it only runs on your own computer, where the keys stay private. Download the app, run "npm install" and "npm start", then switch to Live there.', yes: 'Got it' });
    return;
  }
  if (ctl.tour) { ctl.stop = true; ctl.skip = true; }
  set({ mode });
  if (mode === 'live') {
    await refreshServer();
    log('Switched to Live mode. Every cost and send waits for your yes.', { icon: 'bolt' });
    if (!state.server) toast('Start the local helper to use Live mode: npm start', 'err');
  } else log('Switched to Demo mode. Nothing is spent or sent.', { icon: 'play' });
}

// ---------- saved demo runs (never contain a key: the page never has one) ----------
function savedModal() {
  const list = state.savedDemos;
  const m = modal(`<h3>Saved demo runs</h3><p class="dim small">Save this demo with a name, load it later, rename it or delete it. A saved demo never contains a key.</p>
    <div class="row mt12"><input data-saved-name placeholder="Name this run, like Filming take 2"><button class="btn main" data-saved-add>Save</button></div>
    <div class="stack mt16">${list.length ? list.map((d, i) => `<div class="card tight row between"><div><b class="ink">${esc(d.name)}</b><div class="tiny dim">${new Date(d.at).toLocaleString()}</div></div><div class="btns"><button class="btn sm" data-saved-load="${i}">Load</button><button class="btn sm quiet" data-saved-rename="${i}">Rename</button><button class="btn sm quiet danger" data-saved-del="${i}">Delete</button></div></div>`).join('') : '<p class="dim small">No saved runs yet.</p>'}</div>
    <div class="foot"><button class="btn" data-saved-close>Close</button></div>`);
  const snapshot = () => JSON.parse(JSON.stringify({ format: state.format, hustle: state.hustle, inputs: state.inputs, edits: state.edits, unreadRead: state.unreadRead, counters: state.counters, log: state.log.slice(0, 60), ui: Object.fromEntries(Object.entries(state.ui).filter(([k]) => k.startsWith('camp:') || k.startsWith('whop:'))) }));
  m.el.querySelector('[data-saved-close]').onclick = m.close;
  m.el.querySelector('[data-saved-add]').onclick = () => { const name = m.el.querySelector('[data-saved-name]').value.trim() || 'Demo run ' + (list.length + 1); set({ savedDemos: [{ name, at: Date.now(), data: snapshot() }, ...list] }); m.close(); savedModal(); toast('Saved'); };
  m.el.querySelectorAll('[data-saved-load]').forEach(b => b.onclick = () => { const d = list[Number(b.dataset.savedLoad)].data; Object.assign(state.counters, d.counters); state.log = d.log || []; Object.assign(state.ui, d.ui || {}); set({ format: d.format, hustle: d.hustle, inputs: d.inputs, edits: d.edits, unreadRead: d.unreadRead }); m.close(); toast('Loaded'); });
  m.el.querySelectorAll('[data-saved-rename]').forEach(b => b.onclick = async () => { const i = Number(b.dataset.savedRename); m.close(); const name = await confirmBox({ title: 'Rename this run', input: { label: 'New name', placeholder: list[i].name }, yes: 'Rename' }); if (name) { const l = [...list]; l[i] = { ...l[i], name }; set({ savedDemos: l }); } savedModal(); });
  m.el.querySelectorAll('[data-saved-del]').forEach(b => b.onclick = () => { const l = list.filter((_, i) => i !== Number(b.dataset.savedDel)); set({ savedDemos: l }); m.close(); savedModal(); });
}

// ---------- one click handler for the whole app ----------
document.addEventListener('click', async e => {
  const t = e.target.closest('button, a, [data-go], [data-unisel], [data-reply], tr[data-go]');
  if (!t) return;
  const d = t.dataset;
  if (t.matches('a.src')) { e.preventDefault(); const el = document.getElementById('src-' + d.src); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); } return; }
  if (d.go !== undefined && !t.matches('[data-unisel],[data-reply]')) { e.preventDefault(); if (location.hash === d.go) refresh(); else location.hash = d.go; return; }
  if (d.copy !== undefined) return copyText(d.copy);
  if (d.seg) {
    const v = /^\d+$/.test(d.val) ? Number(d.val) : d.val;
    if (d.seg === 'format') { set({ format: v }); log(`Switched the product to ${v}`, { icon: 'layers', cost: 0 }); return; }
    if (d.seg === 'ideaKind') { set({ inputs: { ...state.inputs, ideaKind: v } }); return; }
    const s = currentStep(); if (s) setUi(s.key + ':' + d.seg, v);
    return;
  }
  if (d.tab) { const s = currentStep(); const v = /^\d+$/.test(d.val) ? Number(d.val) : d.val; if (s) setUi(s.key + ':' + d.tab, v); return; }
  if (d.main) return runStep(BY_KEY[d.main]);
  if (d.demostep) return playMovie(BY_KEY[d.demostep]);
  if (d.keypop) { const k = 'keypop:' + d.step; setUi(k, ui(k, null) === d.keypop ? null : d.keypop); return; }
  if (d.keypopClose) { setUi('keypop:' + d.keypopClose, null); return; }
  if (d.keysave) return keyAction('save', d.keysave, t);
  if (d.keytest) return keyAction('test', d.keytest, t);
  if (d.keyremove) return keyAction('remove', d.keyremove, t);
  if (d.goLive !== undefined) { await setMode('live'); location.hash = '#/settings'; return; }
  if (d.mode) return setMode(d.mode);
  if (d.theme !== undefined) return setTheme(state.theme === 'dark' ? 'light' : 'dark');
  if (d.panel !== undefined) { $right.classList.toggle('open'); return; }
  if (d.menu !== undefined) { $side.classList.toggle('open'); return; }
  if (d.toolsopen !== undefined) { state.ui.toolsOpen = !state.ui.toolsOpen; emit(); return; }
  if (d.tourStart !== undefined) return runTour();
  if (d.loadall !== undefined) { loadAll(); log('Loaded every demo step', { icon: 'layers', cost: 0 }); toast('Every step is filled'); return; }
  if (d.saved !== undefined) return savedModal();
  if (d.openpdf !== undefined) return openPdf();
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.input) { state.inputs = { ...state.inputs, [el.dataset.input]: el.value }; persist('inputs'); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('[data-format]')) { set({ format: el.value }); log(`Switched the product to ${el.value}`, { icon: 'layers', cost: 0 }); }
  if (el.matches('[data-hustle]')) { set({ hustle: el.value }); location.hash = stepRoute(trackSteps(el.value)[0]); }
  if (el.matches('[data-hidenames]')) set({ hideNames: el.checked });
  if (el.matches('[data-stepmodel]')) { set({ stepModel: { ...state.stepModel, [el.dataset.stepmodel]: el.value } }, { silent: true }); toast('This step will use ' + el.options[el.selectedIndex].text); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { $side.classList.remove('open'); $right.classList.remove('open'); document.getElementById('pdf-root').innerHTML = ''; }
});

// ---------- Live autoresponder: checks every minute while the app is open, only if turned on ----------
setInterval(async () => {
  if (isDemo() || !state.server) return;
  for (const t of ['ebook', 'airbnb', 'ads', 'shorts']) {
    if (!state.inputs['auto:' + t] || !campState(t).id) continue;
    try { await pollReplies(t, BY_KEY[OUT_KEYS[t].prefix + '.replies']); } catch (err) { log('Reply check stopped: ' + err.message, { icon: 'info' }); }
  }
}, 60000);

// The saved demo run already did this work, so the panel starts with its history (all demo, $0).
function seedDemoHistory() {
  const h = [
    ['robot', 'Saved run: 5 robots read 155 posts and listings about "GLP-1 protein"', true],
    ['sparkle', 'Saved run: Claude scored 5 buyer pockets. Best: GLP-1 protein, 23 / 25'],
    ['pen', 'Saved run: Claude wrote 10 chapters with 24 sources', false, bookWords()],
    ['robot', 'Saved run: read 15 reels from a creator (demo)', true],
    ['robot', 'Saved run: 3 robot jobs found 7 creators who passed all 4 checks', true],
    ['mail', 'Saved run: AI Ark found 26 checked emails', true],
    ['globe', 'Saved run: 6 domains, 12 inboxes warming up, DNS verified'],
    ['send', 'Saved run: 4 campaigns made as drafts, then started after a second yes'],
    ['store', 'Saved run: Whop pages made hidden, stock 0'],
    ['photo', 'Saved run: fixed 1 listing photo, same room, nothing added', true],
    ['pen', 'Saved run: launch kit written: 3 reels, 5 captions, 3 emails', false, 1450],
    ['play', 'Opened in Demo mode. Saved examples only, nothing is spent or sent.'],
  ];
  for (const [i, t, run, words] of h) log(t, { icon: i, cost: 0, run: !!run, words: words || 0 });
}

// ---------- start ----------
(async function start() {
  onRoute();
  await refreshServer();
  if (!state.log.length && isDemo()) seedDemoHistory();
  else if (!state.log.length) log('Opened in Live mode.', { icon: 'bolt' });
})();
