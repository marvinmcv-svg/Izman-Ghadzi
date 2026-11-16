// App state. Only plain UI choices are saved in the browser (theme, mode, inputs, edits).
// Keys are never stored here: the page only ever receives masked keys from the helper.

const SAVE_KEYS = ['mode', 'format', 'hustle', 'inputs', 'edits', 'hideNames', 'stepModel', 'unreadRead', 'autoresponder', 'liveResults', 'savedDemos'];

function load(k, fallback) {
  try { const v = localStorage.getItem('ps.' + k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}
function save(k, v) {
  try { localStorage.setItem('ps.' + k, JSON.stringify(v)); } catch { /* private window */ }
}

export const state = {
  mode: load('mode', 'demo'),
  theme: (() => { try { return localStorage.getItem('ps.theme') || 'dark'; } catch { return 'dark'; } })(),
  format: load('format', 'ebook'),
  hustle: load('hustle', 'airbnb'),
  inputs: load('inputs', {}),
  edits: load('edits', {}),
  hideNames: load('hideNames', true),
  stepModel: load('stepModel', {}),
  unreadRead: load('unreadRead', []),
  autoresponder: load('autoresponder', { ebook: true, airbnb: true, ads: true, shorts: true }),
  liveResults: load('liveResults', {}),
  savedDemos: load('savedDemos', []),
  // not saved:
  demoCleared: {},          // step key -> true while a demo movie has not filled it yet
  route: '#/home',
  server: null,             // masked state from the helper, or null when it is not running
  serverDown: false,
  log: [],
  counters: { words: 0, runs: 0 },
  sends: {},                // per track send simulation state
  ui: {},                   // small per screen view state (tabs, selections)
  mainDirty: true,
};

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
let queued = false;
export function emit() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; listeners.forEach(fn => fn()); });
}

export function set(patch, { silent = false } = {}) {
  Object.assign(state, patch);
  for (const k of Object.keys(patch)) if (SAVE_KEYS.includes(k)) save(k, state[k]);
  if (!silent) refresh();
}
export function persist(k) { if (SAVE_KEYS.includes(k)) save(k, state[k]); }

export function setTheme(t) {
  state.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('ps.theme', t); } catch { /* fine */ }
  emit();
}

export function ui(key, fallback) {
  if (!(key in state.ui)) state.ui[key] = typeof fallback === 'function' ? fallback() : fallback;
  return state.ui[key];
}
export function setUi(key, value, rerender = true) {
  state.ui[key] = value;
  if (rerender) refresh();
}
// Re-draw the main area (the step you are on). Side panels re-draw on every emit.
export function refresh() { state.mainDirty = true; emit(); }

// ---------- the "What the app did" log ----------
let logId = 0;
export function log(text, { icon = 'dot', cost = null, words = 0, run = false, tool = '' } = {}) {
  const now = new Date();
  state.log.unshift({ id: ++logId, text, icon, cost, tool, time: now.toTimeString().slice(0, 5) });
  state.log = state.log.slice(0, 160);
  if (words) state.counters.words += words;
  if (run) state.counters.runs += 1;
  emit();
}

// ---------- results: demo data or live data ----------
export function isDemo() { return state.mode === 'demo'; }

export function liveResult(stepKey) { return state.liveResults[stepKey]; }
export function setLiveResult(stepKey, data) {
  state.liveResults = { ...state.liveResults, [stepKey]: data };
  persist('liveResults');
  refresh();
}
