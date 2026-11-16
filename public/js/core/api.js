// Talks only to the local helper on this computer. The helper adds keys on the way out.
import { state, set, emit, log } from './store.js';
import { confirmBox, toast, money } from './ui.js';

const TOKEN = document.querySelector('meta[name="suite-token"]')?.content || '';

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export async function api(path, body) {
  let res;
  try {
    res = await fetch('/api/' + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Suite-Token': TOKEN },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    set({ serverDown: true });
    throw new ApiError('The local helper is not running. Start it with: npm start', 0);
  }
  let data = {};
  try { data = await res.json(); } catch { /* empty */ }
  if (state.serverDown) set({ serverDown: false });
  if (data?.spend && state.server) { state.server.spend = { ...state.server.spend, ...data.spend }; emit(); }
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong.', res.status);
  return data;
}

export async function refreshServer() {
  try {
    const s = await api('state');
    set({ server: s, serverDown: false });
    return s;
  } catch {
    set({ server: null, serverDown: true });
    return null;
  }
}

// Ask the person first, then get a one time token the helper needs for this action.
// kind: 'spend' | 'send' | 'publish'
export async function approve({ kind = 'spend', title, intro, lines, total, serious, yes, yesCls }) {
  const ok = await confirmBox({ title, intro, lines, total, serious, yes, yesCls: yesCls || (kind === 'send' || kind === 'publish' ? 'money' : 'main') });
  if (!ok) { toast('Cancelled. Nothing was spent.'); return null; }
  return true;
}
export async function token(kind, cost = 0, summary = '') {
  const r = await api('confirm', { kind, cost, summary });
  return r.token;
}

// One Claude call through the helper. Returns { text, cost }.
export async function claude({ system, prompt, maxTokens = 4000, model, webSearch = false, label = 'Claude wrote a draft' }) {
  const t = await token('spend', 0, label);
  const r = await api('claude', { system, prompt, maxTokens, model, webSearch, confirmToken: t });
  log(label, { icon: 'pen', cost: r.cost, words: (r.text || '').split(/\s+/).length, tool: 'claude' });
  await refreshServer();
  return r;
}

// Ask Claude for JSON and parse it. Tolerates code fences.
export async function claudeJSON(opts) {
  const r = await claude({ ...opts, system: (opts.system || '') + '\nAnswer with valid JSON only. No code fences, no notes before or after. Never use em dashes or en dashes.' });
  const raw = r.text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = raw.search(/[\[{]/);
  try { return { data: JSON.parse(raw.slice(start)), cost: r.cost }; }
  catch { throw new ApiError('The AI answer came back in the wrong shape. Press the button again. The old result stays.', 422); }
}

export async function robot({ robot, query, count, extra, maxUsd, label }) {
  const t = await token('spend', maxUsd || 0, label || robot);
  const r = await api('robot', { robot, query, count, extra, maxUsd, confirmToken: t });
  log(label || `Robot read ${r.items.length} results`, { icon: 'robot', cost: r.cost, run: true, tool: 'apify' });
  await refreshServer();
  return r;
}

export function spendText() {
  if (state.mode === 'demo') return 'Demo, nothing spent';
  const s = state.server?.spend;
  return s ? `Live, cap ${money(s.cap)}` : 'Live, helper not running';
}
export function spentValue() {
  if (state.mode === 'demo') return 0;
  return state.server?.spend?.spent || 0;
}
