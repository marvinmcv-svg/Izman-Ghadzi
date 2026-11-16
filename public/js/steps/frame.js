// The step registry and the frame every step screen shares.
import { state, isDemo, liveResult, ui, setUi } from '../core/store.js';
import { esc, icon, toolLogo, TOOLS, pill, emptyState, ghostRows } from '../core/ui.js';

export const STEPS = [];          // ordered list of every step
export const BY_KEY = {};

export function register(list) {
  for (const s of list) { STEPS.push(s); BY_KEY[s.key] = s; }
}

export const SECTIONS = {
  build: { label: 'Build it', n: 1 },
  send: { label: 'Find buyers & send', n: 2 },
  launch: { label: 'Launch', n: 3 },
  work: { label: 'Do the work', n: 1 },
  clients: { label: 'Find clients & send', n: 2 },
  paid: { label: 'Get paid', n: 3 },
};

export function stepsIn(track, section) { return STEPS.filter(s => s.track === track && s.section === section); }
export function trackSteps(track) { return STEPS.filter(s => s.track === track); }

export function isDone(step) {
  if (isDemo()) return !state.demoCleared[step.key];
  return !!liveResult(step.key) || !!step.liveDone?.();
}
export function nextStep(step) {
  const list = trackSteps(step.track);
  const i = list.indexOf(step);
  return list[i + 1] || null;
}
export function sectionDone(track, section) { return stepsIn(track, section).every(isDone); }

export function stepRoute(step) { return '#/step/' + step.key; }

// Data for a step: saved demo results in Demo mode, the person's own results in Live mode.
export function stepData(step) {
  if (isDemo()) return state.demoCleared[step.key] ? null : step.demo?.();
  return liveResult(step.key) || null;
}

// ---------- the frame ----------
export function eyebrow(step) {
  const list = stepsIn(step.track, step.section);
  const i = list.indexOf(step) + 1;
  const label = SECTIONS[step.section].label;
  const name = typeof step.short === 'function' ? step.short() : (step.short || step.title);
  return `${esc(label)}<span class="sep">.</span>Step ${i} of ${list.length}: ${esc(name)}`;
}

export function toolStatus(id) {
  if (isDemo()) return 'demo';
  if (id === 'local') return 'ok';
  const c = state.server?.connectors?.[id];
  if (!c || !c.has) return 'none';
  return c.status === 'ok' ? 'ok' : c.status === 'bad' ? 'bad' : 'saved';
}

export function usesRow(step) {
  const open = ui('keypop:' + step.key, null);
  return `<div class="uses"><span class="k">Uses</span>${(step.uses || []).map(id => `
    <button class="chip ${open === id ? 'on' : ''}" data-keypop="${id}" data-step="${step.key}" title="${esc(TOOLS[id]?.name || id)}">
      ${toolLogo(id, 18)}<span>${esc(TOOLS[id]?.name || id)}</span><span class="sd ${toolStatus(id)}"></span>
    </button>`).join('')}
    ${open ? keyPopover(step, open) : ''}
  </div>`;
}

function keyPopover(step, id) {
  const t = TOOLS[id] || {};
  if (id === 'local') return `<div class="key-pop"><b class="ink">This computer</b><p class="small dim mt8">This part runs on your own computer for free. No key needed.</p></div>`;
  const models = [['claude-opus-5-5', 'Opus 5.5'], ['claude-sonnet-5-5', 'Sonnet 5.5'], ['claude-haiku-5-5', 'Haiku 5.5'], ['claude-fable-5-2', 'Fable']];
  const cur = state.stepModel[step.key] || state.server?.settings?.defaultModel || 'claude-opus-5-5';
  if (isDemo()) {
    return `<div class="key-pop">
      <div class="row between"><div class="row">${toolLogo(id, 24)}<b class="ink">${esc(t.name)}</b></div>${pill('Demo connection', 'purple')}</div>
      <p class="small dim mt8">In Demo mode this uses saved results. Nothing is called and nothing is spent.</p>
      <div class="mono small mt8 dim">${id}-demo........0000</div>
      ${id === 'claude' ? `<label class="field mt12"><span class="label">Model for just this step</span><select data-stepmodel="${step.key}">${models.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
      <div class="btns mt12"><button class="btn sm main" data-go-live>Use my real key</button><button class="btn sm quiet" data-keypop-close="${step.key}">Close</button></div>
    </div>`;
  }
  const c = state.server?.connectors?.[id];
  const fields = c?.fields || ['key'];
  const label = f => ({ key: 'Key', secret: 'Secret', keyId: 'Key ID' }[f] || f);
  return `<div class="key-pop" data-keyform="${id}">
    <div class="row between"><div class="row">${toolLogo(id, 24)}<b class="ink">${esc(t.name)}</b></div>${statusPill(toolStatus(id))}</div>
    ${c?.has ? `<div class="mono small mt8 dim">${Object.values(c.masked).map(esc).join('  ')}</div>` : ''}
    ${fields.map(f => `<label class="field mt8"><span class="label">${label(f)}</span><input type="password" autocomplete="off" data-kf="${f}" placeholder="Paste your ${esc(t.name)} ${label(f).toLowerCase()}"></label>`).join('')}
    <p class="tiny dim mt8">${esc(c?.where || '')}</p>
    ${id === 'claude' ? `<label class="field mt8"><span class="label">Model for just this step</span><select data-stepmodel="${step.key}">${models.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
    <div class="btns mt12"><button class="btn sm main" data-keysave="${id}">Save</button><button class="btn sm" data-keytest="${id}">Test (free)</button><button class="btn sm quiet" data-keypop-close="${step.key}">Close</button></div>
  </div>`;
}

export function statusPill(s) {
  return s === 'ok' ? pill('Connected', 'green') : s === 'saved' ? pill('Saved, not tested', 'orange') : s === 'bad' ? pill('Key did not work', 'red') : s === 'demo' ? pill('Demo connection', 'purple') : pill('Not added', 'grey');
}

export function infoStrip(step) {
  return `<div class="info-strip">
    <div><div class="k">Replaces</div><div class="v">${esc(step.replaces)}</div></div>
    <div><div class="k">Saves</div><div class="v o">${esc(step.saves)}</div></div>
    <div><div class="k">Costs</div><div class="v">${esc(step.costs)}</div></div>
  </div>`;
}

export function frame(step, body) {
  const done = isDone(step);
  const nxt = nextStep(step);
  const running = ui('running:' + step.key, false);
  const mainLabel = typeof step.mainLabel === 'function' ? step.mainLabel() : step.mainLabel;
  const doNow = done && nxt ? `Next: ${nxt.title}` : mainLabel;
  const strip = step.strip ? step.strip(step) : '';
  return `<div class="page enter" data-stepkey="${step.key}">
    ${strip}
    <div class="eyebrow">${eyebrow(step)}${done ? ' ' + pill('Done', 'green') : ''}</div>
    <h1 class="h-title">${esc(typeof step.title === 'function' ? step.title() : step.title)}</h1>
    <p class="lede">${esc(typeof step.explain === 'function' ? step.explain() : step.explain)}</p>
    <div class="do-now">${icon('arrow')}<span>Do this now: <b>${esc(doNow)}</b></span></div>
    <div class="btns step-actions">
      ${isDemo() ? `<button class="btn" data-demostep="${step.key}">${icon('play')}Demo this step</button>` : ''}
      ${step.noMain ? '' : `<button class="btn ${step.mainCls || 'main'} ${running ? 'running' : ''} ${!done ? 'next-pulse' : ''}" data-main="${step.key}" ${running ? 'disabled' : ''}>${running ? 'Working' : esc(mainLabel)}</button>`}
      ${done && nxt ? `<button class="btn ${step.noMain ? 'main next-pulse' : ''}" data-go="${stepRoute(nxt)}">Next: ${esc(nxt.title)}${icon('arrow')}</button>` : ''}
    </div>
    ${infoStrip(step)}
    ${usesRow(step)}
    <div class="results">${body}</div>
    ${done ? doneBar(step, nxt) : ''}
  </div>`;
}

function doneBar(step, nxt) {
  return `<div class="done-bar"><span class="done-tag">${icon('check')}Done</span>
    ${nxt ? `<button class="btn main" data-go="${stepRoute(nxt)}">Next: ${esc(nxt.title)}${icon('arrow')}</button>` : step.finish ? step.finish() : `<button class="btn main" data-go="#/home">Back to Home${icon('arrow')}</button>`}</div>`;
}

export function emptyFor(step, message) {
  const mainLabel = typeof step.mainLabel === 'function' ? step.mainLabel() : step.mainLabel;
  return emptyState(step.ghost ? step.ghost() : `<div class="grid g3"><div class="card">${ghostRows(5)}</div><div class="card">${ghostRows(5)}</div><div class="card">${ghostRows(5)}</div></div>`,
    message || 'Your results will show up here.',
    `<button class="btn main" data-main="${step.key}">${esc(mainLabel)}</button>`);
}

// small helper so step modules can keep per step view state
export function view(step, k, fallback) { return ui(step.key + ':' + k, fallback); }
export function setView(step, k, v, rerender = true) { setUi(step.key + ':' + k, v, rerender); }
