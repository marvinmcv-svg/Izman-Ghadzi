// Product Suite local helper.
// - Serves the dashboard from ./public
// - Keeps keys in a private file on this computer and adds them to outside calls
// - Enforces the money caps and the "nothing sends or publishes without a yes" rules
// It only listens on 127.0.0.1 and only answers the page it served.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import * as store from './store.js';
import { CONNECTORS, svc, testConnector } from './connectors.js';
import { robotList } from './robots.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(here, '..', 'public');
const PORT = Number(process.env.PORT || 5177);
const HOST = '127.0.0.1';
const SESSION_TOKEN = crypto.randomBytes(24).toString('hex');

// ---------- Claude client (official SDK) ----------
let AnthropicCtor = null;
try { AnthropicCtor = (await import('@anthropic-ai/sdk')).default; } catch { AnthropicCtor = null; }

const PRICES = { // dollars per million tokens: [input, output]
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.10, 0.50],
  'claude-fable-5-2': [8, 40],
};
const MODELS = Object.keys(PRICES);

function anthropicClient(model) {
  const key = store.getSecret('claude');
  if (!AnthropicCtor || !key) return null;
  const s = store.getSettings();
  const opts = { apiKey: key, maxRetries: 2 };
  if (model === 'claude-fable-5-2' && s.fableAddress) opts.baseURL = s.fableAddress;
  return new AnthropicCtor(opts);
}

// ---------- spend tracking (resets when the helper restarts) ----------
const session = { spent: 0, items: [] };
function addSpend(what, dollars) {
  const d = Math.max(0, Number(dollars) || 0);
  session.spent = Math.round((session.spent + d) * 10000) / 10000;
  session.items.unshift({ what, dollars: d, at: new Date().toISOString() });
  session.items = session.items.slice(0, 200);
}
function checkCap(estimate) {
  const cap = store.getSettings().sessionCap;
  if (session.spent + estimate > cap + 1e-9) {
    const left = Math.max(0, cap - session.spent);
    throw httpError(402, `This would pass your session spend cap of $${cap.toFixed(2)}. You have $${left.toFixed(2)} left. Raise the cap in Settings to go on.`);
  }
}

// ---------- confirm tokens: every spend, send or publish needs a fresh yes ----------
const confirms = new Map();
function makeConfirm(kind, cost, summary) {
  const token = crypto.randomBytes(16).toString('hex');
  confirms.set(token, { kind, cost: Number(cost) || 0, summary: String(summary || '').slice(0, 300), exp: Date.now() + 5 * 60 * 1000 });
  return token;
}
function useConfirm(token, kinds) {
  const c = confirms.get(token);
  confirms.delete(token);
  if (!c || c.exp < Date.now()) throw httpError(428, 'This needs your yes first. Press the button again and confirm.');
  if (!kinds.includes(c.kind)) throw httpError(428, 'This yes was for a different action. Press the button again.');
  return c;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of confirms) if (v.exp < now) confirms.delete(k); }, 60000).unref();

function httpError(status, message) { const e = new Error(message); e.status = status; return e; }

// ---------- request guards ----------
function allowedHost(h) { return h === `127.0.0.1:${PORT}` || h === `localhost:${PORT}`; }
function guardApi(req) {
  if (!allowedHost(req.headers.host || '')) throw httpError(403, 'Wrong host.');
  const origin = req.headers.origin;
  if (origin && origin !== `http://127.0.0.1:${PORT}` && origin !== `http://localhost:${PORT}`) throw httpError(403, 'Wrong origin.');
  if (req.headers['x-suite-token'] !== SESSION_TOKEN) throw httpError(403, 'Missing app token. Reload the page.');
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > 5e6) { reject(httpError(413, 'Too big.')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(httpError(400, 'Bad JSON.')); } });
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function requireKey(tool) {
  const c = CONNECTORS[tool];
  if (!store.hasKey(tool, c.fields)) throw httpError(412, `Add your ${c.name} key first. It opens below.`);
}

// ---------- state for the page (masked only) ----------
function publicState() {
  const connectors = {};
  for (const [id, c] of Object.entries(CONNECTORS)) {
    const has = store.hasKey(id, c.fields);
    connectors[id] = { name: c.name, fields: c.fields, where: c.where, has, status: has ? store.keyStatus(id) : 'none', masked: store.maskedValues(id) };
  }
  const s = store.getSettings();
  return {
    ok: true,
    connectors,
    settings: s,
    registrarSaved: store.hasKey('registrar', ['login']),
    spend: { spent: session.spent, cap: s.sessionCap, items: session.items.slice(0, 20) },
    robots: robotList(s.robots).map(({ id, actor, name, perResult, unit }) => ({ id, actor, name, perResult, unit })),
    models: MODELS,
    claudeSdk: !!AnthropicCtor,
    keyFile: path.join(store.DIR, 'keys.json'),
  };
}

// ---------- Claude ----------
async function runClaude({ model, system, prompt, maxTokens = 4000, webSearch = false, images = [], confirmToken }) {
  requireKey('claude');
  const s = store.getSettings();
  model = MODELS.includes(model) ? model : s.defaultModel;
  if (model === 'claude-fable-5-2' && !s.fableAddress) throw httpError(412, 'Add your Fable address in Settings first.');
  const [pin, pout] = PRICES[model];
  maxTokens = Math.min(Math.max(256, Number(maxTokens) || 4000), 64000);
  const estIn = Math.ceil(((system || '').length + (prompt || '').length) / 3.5) + (Array.isArray(images) ? images.length * 1600 : 0);
  const searches = webSearch ? 5 : 0;
  const estimate = (estIn * pin + maxTokens * pout) / 1e6 + searches * 0.01 + (webSearch ? 0.15 : 0);
  useConfirm(confirmToken, ['spend']);
  checkCap(estimate);
  const client = anthropicClient(model);
  if (!client) throw httpError(412, 'Run "npm install" so the Claude helper is installed.');
  const imgs = (Array.isArray(images) ? images : []).filter(u => /^https:\/\//.test(u)).slice(0, 8);
  const messages = [{ role: 'user', content: imgs.length ? [...imgs.map(url => ({ type: 'image', source: { type: 'url', url } })), { type: 'text', text: String(prompt || '') }] : String(prompt || '') }];
  const params = {
    model,
    max_tokens: maxTokens,
    system: system || undefined,
    // Web search lets Claude find and cite real public sources instead of guessing them.
    tools: webSearch ? [{ type: 'web_search_20260209', name: 'web_search', max_uses: searches }] : undefined,
  };
  let msg, cost = 0, servedModel = model;
  const textParts = [];
  try {
    // A long search can pause the turn. Send the partial answer back to let it finish (twice at most).
    for (let round = 0; round < 3; round++) {
      if (model === 'claude-haiku-5-5') {
        msg = await client.messages.stream({ ...params, messages }).finalMessage();
      } else {
        // Server side fallback: if the model declines, the API reruns on a fallback model in the same call.
        msg = await client.beta.messages.stream({ ...params, messages, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' }).finalMessage();
      }
      const u = msg.usage || {};
      servedModel = PRICES[msg.model] ? msg.model : model;
      const [ci, co] = PRICES[servedModel];
      cost += ((u.input_tokens || 0) * ci + (u.output_tokens || 0) * co) / 1e6 + (u.server_tool_use?.web_search_requests || 0) * 0.01;
      textParts.push((msg.content || []).filter(b => b.type === 'text').map(b => b.text).join(''));
      if (msg.stop_reason !== 'pause_turn') break;
      messages.push({ role: 'assistant', content: msg.content });
    }
  } catch (e) {
    if (cost) addSpend(`Claude (${servedModel})`, cost);
    throw httpError(e?.status === 401 ? 401 : 502, e?.status === 401 ? 'Your Claude key did not work. Test it in Settings.' : 'Claude did not answer: ' + (e?.message || 'unknown error'));
  }
  addSpend(`Claude (${servedModel})`, cost);
  if (msg.stop_reason === 'refusal') throw httpError(422, 'Claude would not write this one. Change the words a little and press the button again.');
  // With web search the final answer is the last text block; earlier text is narration between searches.
  const all = textParts.join('');
  const text = webSearch && all.includes('{') ? all.slice(all.indexOf('{')) : all;
  return { text, cost, model: servedModel, usage: msg.usage, truncated: msg.stop_reason === 'max_tokens' };
}

// ---------- Apify (hard money cap per run, enforced here) ----------
async function runRobot({ robot, query, count = 20, extra, maxUsd, confirmToken }) {
  requireKey('apify');
  const s = store.getSettings();
  const r = robotList(s.robots).find(x => x.id === robot);
  if (!r) throw httpError(400, 'Unknown robot.');
  const cap = Math.min(Number(maxUsd) || s.apifyRunCap, s.apifyRunCap);
  useConfirm(confirmToken, ['spend']);
  checkCap(cap);
  const actor = r.actor.replace('/', '~');
  const n = Math.max(1, Math.min(200, Number(count) || 20));
  const start = await svc.apify(`/acts/${actor}/runs?maxTotalChargeUsd=${cap}&maxItems=${n}&waitForFinish=60`, { method: 'POST', body: r.input(String(query || ''), n, extra), timeoutMs: 90000 });
  if (!start.ok) throw httpError(start.status === 401 ? 401 : 502, `${r.name} robot could not start (${start.status}). ${start.json?.error?.message || ''}`.trim());
  let run = start.json.data;
  const deadline = Date.now() + 6 * 60 * 1000;
  while (!['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status) && Date.now() < deadline) {
    const p = await svc.apify(`/actor-runs/${run.id}?waitForFinish=60`, { timeoutMs: 90000 });
    if (p.ok) run = p.json.data;
  }
  const charged = Number(run.usageTotalUsd ?? cap);
  addSpend(`Apify ${r.name}`, Math.min(charged, cap));
  if (run.status !== 'SUCCEEDED') throw httpError(502, `${r.name} robot stopped: ${run.status}. Run again for just this one.`);
  const items = await svc.apify(`/datasets/${run.defaultDatasetId}/items?clean=true&limit=${n}`, { timeoutMs: 60000 });
  return { items: Array.isArray(items.json) ? items.json : [], cost: Math.min(charged, cap), runId: run.id };
}

// ---------- routes ----------
const routes = {
  'GET /api/state': async () => publicState(),

  'POST /api/keys/save': async b => {
    const c = CONNECTORS[b.tool]; if (!c) throw httpError(400, 'Unknown tool.');
    store.saveKey(b.tool, b.values || {});
    return publicState();
  },
  'POST /api/keys/remove': async b => { store.removeKey(b.tool); return publicState(); },
  'POST /api/keys/test': async b => {
    const c = CONNECTORS[b.tool]; if (!c) throw httpError(400, 'Unknown tool.');
    if (!store.hasKey(b.tool, c.fields)) return { ok: false, detail: 'Paste a key first.', state: publicState() };
    let r;
    try { r = await testConnector(b.tool, () => anthropicClient()); } catch (e) { r = { ok: false, detail: 'Could not reach ' + c.name + '. Check your internet.' }; }
    store.setKeyStatus(b.tool, r.ok ? 'ok' : 'bad');
    return { ...r, state: publicState() };
  },
  'POST /api/settings': async b => { store.saveSettings(b.patch || {}); return publicState(); },
  'POST /api/registrar': async b => {
    if (b.remove) store.removeKey('registrar');
    else store.saveKey('registrar', { login: b.login, password: b.password });
    return publicState();
  },
  'POST /api/confirm': async b => {
    if (!['spend', 'send', 'publish'].includes(b.kind)) throw httpError(400, 'Unknown kind.');
    return { token: makeConfirm(b.kind, b.cost, b.summary) };
  },

  'POST /api/claude': async b => runClaude(b),
  'POST /api/robot': async b => runRobot(b),

  // Fetch a public image so the page can measure its pixels (Live mode only). Images only, 10 MB max.
  'POST /api/image': async b => {
    const url = String(b.url || '');
    if (!/^https:\/\//.test(url)) throw httpError(400, 'Only https image links.');
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 30000);
    try {
      const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'product-suite-local/1.0' } });
      const type = r.headers.get('content-type') || '';
      if (!r.ok || !/^image\//.test(type)) throw httpError(502, 'That link is not an image.');
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 10e6) throw httpError(413, 'That image is too big.');
      return { dataUrl: `data:${type.split(';')[0]};base64,${buf.toString('base64')}` };
    } finally { clearTimeout(t); }
  },

  // AI Ark: pay only when an email is found. Never guesses.
  'POST /api/aiark/find': async b => {
    requireKey('aiark');
    const c = useConfirm(b.confirmToken, ['spend']);
    checkCap(c.cost || 0);
    const out = [];
    for (const lead of (b.leads || []).slice(0, 100)) {
      const body = { fullName: lead.name, domain: lead.domain || undefined, linkedin: lead.linkedin || undefined, company: lead.company || undefined };
      const r = await svc.aiark('/v1/people/export/single', { method: 'POST', body });
      const email = r.json?.email?.address || r.json?.email || r.json?.data?.email || null;
      const st = String(r.json?.email?.status || r.json?.status || '').toUpperCase();
      if (r.ok && email && typeof email === 'string') {
        const verified = !st || st === 'VALID' || st === 'SMTP' || st === 'VERIFIED';
        out.push({ id: lead.id, email: verified ? email : null, status: verified ? 'Verified' : 'Risky and skipped', source: 'AI Ark' });
      } else {
        out.push({ id: lead.id, email: null, status: 'Not found', source: 'AI Ark' });
      }
    }
    return { results: out };
  },

  // Spaceship: checking names is free; buying needs a yes.
  'POST /api/spaceship/check': async b => {
    requireKey('spaceship');
    const r = await svc.spaceship('/domains/available', { method: 'POST', body: { domains: (b.domains || []).slice(0, 20) } });
    if (!r.ok) throw httpError(r.status, 'Spaceship could not check these names.');
    return { domains: (r.json?.domains || []).map(d => ({ domain: d.domain, available: d.result === 'available', price: d.premiumPricing?.[0]?.price ?? null })) };
  },
  'POST /api/spaceship/buy': async b => {
    requireKey('spaceship');
    const c = useConfirm(b.confirmToken, ['spend']);
    checkCap(c.cost || 0);
    const results = [];
    for (const domain of (b.domains || []).slice(0, 10)) {
      const r = await svc.spaceship('/domains/' + encodeURIComponent(domain), { method: 'POST', body: { autoRenew: false, years: 1, privacyProtection: { level: 'high', userConsent: true } } });
      results.push({ domain, ok: r.ok || r.status === 202, detail: r.ok || r.status === 202 ? 'Ordered' : (r.json?.detail || 'Spaceship said no (' + r.status + ')') });
    }
    addSpend('Spaceship domains', results.filter(x => x.ok).length * ((c.cost || 0) / Math.max(1, (b.domains || []).length)));
    return { results };
  },
  'POST /api/spaceship/dns': async b => {
    requireKey('spaceship');
    useConfirm(b.confirmToken, ['spend', 'publish']);
    const items = (b.records || []).map(r => r.type === 'MX'
      ? { type: 'MX', name: r.name || '@', exchange: r.value, preference: r.priority || 1, ttl: 3600 }
      : { type: r.type, name: r.name || '@', value: r.value, ttl: 3600 });
    const r = await svc.spaceship('/dns/records/' + encodeURIComponent(b.domain), { method: 'PUT', body: { force: true, items } });
    if (!r.ok && r.status !== 204) throw httpError(r.status, 'Spaceship did not save the records (' + r.status + ').');
    return { ok: true };
  },
  // Free DNS lookup from this computer.
  'POST /api/dns/check': async b => {
    const d = String(b.domain || '');
    const out = {};
    try { out.mx = (await dns.resolveMx(d)).length > 0; } catch { out.mx = false; }
    try { out.spf = (await dns.resolveTxt(d)).some(t => t.join('').startsWith('v=spf1')); } catch { out.spf = false; }
    try { out.dmarc = (await dns.resolveTxt('_dmarc.' + d)).some(t => t.join('').startsWith('v=DMARC1')); } catch { out.dmarc = false; }
    try { out.dkim = (await dns.resolveTxt('google._domainkey.' + d)).some(t => t.join('').includes('v=DKIM1')); } catch { out.dkim = false; }
    return out;
  },

  // ScaledMail
  'POST /api/scaledmail/workspaces': async () => {
    requireKey('scaledmail');
    const r = await svc.scaledmail('/workspaces');
    if (!r.ok) throw httpError(r.status, 'ScaledMail could not list workspaces.');
    const list = Array.isArray(r.json) ? r.json : (r.json?.data || r.json?.workspaces || []);
    return { workspaces: list.map(w => ({ id: w.id || w._id, name: w.name, inboxes: w.inboxCount ?? w.inboxes?.length ?? 0 })) };
  },
  'POST /api/scaledmail/inboxes': async b => {
    requireKey('scaledmail');
    const c = useConfirm(b.confirmToken, ['spend']);
    checkCap(c.cost || 0);
    const registrar = store.hasKey('registrar', ['login']) ? { login: store.getSecret('registrar', 'login'), password: store.getSecret('registrar', 'password') } : undefined;
    const r = await svc.scaledmail('/orders', { method: 'POST', body: { workspace_id: b.workspace || store.getSettings().scaledmailWorkspace, provider: 'google', domain: b.domain, inboxes: b.names, registrar } });
    if (!r.ok) throw httpError(r.status, 'ScaledMail did not take the order (' + r.status + '). ' + (r.json?.message || ''));
    addSpend('ScaledMail inboxes', c.cost || 0);
    return { ok: true, order: r.json?.id || null, dkim: r.json?.dkim || null };
  },

  // Instantly. New campaigns are always created paused. Starting is its own yes.
  'POST /api/instantly/accounts': async () => {
    requireKey('instantly');
    const r = await svc.instantly('/accounts?limit=100');
    if (!r.ok) throw httpError(r.status, 'Instantly could not list inboxes.');
    return { accounts: (r.json?.items || []).map(a => ({ email: a.email, warmup: a.warmup_status, status: a.status })) };
  },
  'POST /api/instantly/import': async b => {
    requireKey('instantly'); requireKey('scaledmail');
    useConfirm(b.confirmToken, ['spend', 'publish']);
    const have = await svc.instantly('/accounts?limit=100');
    const existing = new Set((have.json?.items || []).map(a => String(a.email).toLowerCase()));
    const exp = await svc.scaledmail('/workspaces/' + encodeURIComponent(b.workspace || store.getSettings().scaledmailWorkspace) + '/inboxes/export');
    const creds = Array.isArray(exp.json) ? exp.json : (exp.json?.data || []);
    const results = [];
    for (const ib of creds) {
      const email = String(ib.email || '').toLowerCase();
      if (!email) continue;
      if (b.only && !b.only.includes(email)) continue;
      if (existing.has(email)) { results.push({ email, status: 'Already in Instantly, skipped' }); continue; }
      // The password goes straight from ScaledMail to Instantly. It is never returned to the page.
      const r = await svc.instantly('/accounts', { method: 'POST', body: {
        email, first_name: ib.first_name, last_name: ib.last_name, provider_code: 2,
        imap_username: email, imap_password: ib.password, imap_host: 'imap.gmail.com', imap_port: 993,
        smtp_username: email, smtp_password: ib.password, smtp_host: 'smtp.gmail.com', smtp_port: 587,
        daily_limit: store.getSettings().dailyCapPerInbox, warmup: { limit: 20, increment: 'disabled' },
      } });
      if (r.ok) await svc.instantly('/accounts/warmup/enable', { method: 'POST', body: { emails: [email] } });
      results.push({ email, status: r.ok ? 'Added, warmup on' : 'Instantly said no (' + r.status + ')' });
    }
    return { results };
  },
  'POST /api/instantly/campaign': async b => {
    requireKey('instantly');
    useConfirm(b.confirmToken, ['spend', 'publish']);
    const s = store.getSettings();
    const body = {
      name: String(b.name || 'Selling'),
      campaign_schedule: { schedules: [{ name: 'Weekdays', timing: { from: '09:00', to: '17:00' }, days: { 1: true, 2: true, 3: true, 4: true, 5: true }, timezone: b.timezone || 'America/Chicago' }] },
      sequences: [{ steps: (b.emails || []).slice(0, 2).map((e, i) => ({ type: 'email', delay: i === 0 ? 0 : 3, variants: [{ subject: e.subject, body: e.body }] })) }],
      email_list: b.inboxes || [],
      daily_limit: (b.inboxes || []).length * s.dailyCapPerInbox || s.dailyCapPerInbox,
      stop_on_reply: true,
    };
    const r = await svc.instantly('/campaigns', { method: 'POST', body });
    if (!r.ok) throw httpError(r.status, 'Instantly did not make the draft (' + r.status + '). ' + (r.json?.message || ''));
    return { id: r.json?.id, status: 'Draft (paused)', url: 'https://app.instantly.ai/app/campaign/' + r.json?.id + '/analytics' };
  },
  'POST /api/instantly/leads': async b => {
    requireKey('instantly');
    useConfirm(b.confirmToken, ['spend', 'publish']);
    let added = 0;
    for (const l of (b.leads || []).slice(0, 500)) {
      if (!l.email) continue; // never guess an address
      const r = await svc.instantly('/leads', { method: 'POST', body: { campaign: b.campaignId, email: l.email, first_name: l.firstName, last_name: l.lastName, company_name: l.company } });
      if (r.ok) added++;
    }
    return { added };
  },
  'POST /api/instantly/activate': async b => {
    requireKey('instantly');
    useConfirm(b.confirmToken, ['send']);
    const r = await svc.instantly('/campaigns/' + encodeURIComponent(b.campaignId) + '/activate', { method: 'POST', body: {} });
    if (!r.ok) throw httpError(r.status, 'Instantly did not start the campaign (' + r.status + ').');
    return { status: 'Sending' };
  },
  'POST /api/instantly/pause': async b => {
    requireKey('instantly');
    useConfirm(b.confirmToken, ['send', 'publish']);
    const r = await svc.instantly('/campaigns/' + encodeURIComponent(b.campaignId) + '/pause', { method: 'POST', body: {} });
    if (!r.ok) throw httpError(r.status, 'Instantly did not pause the campaign (' + r.status + ').');
    return { status: 'Paused' };
  },
  'POST /api/instantly/analytics': async b => {
    requireKey('instantly');
    const r = await svc.instantly('/campaigns/analytics?id=' + encodeURIComponent(b.campaignId));
    if (!r.ok) throw httpError(r.status, 'Instantly could not read the numbers.');
    const a = Array.isArray(r.json) ? r.json[0] || {} : r.json || {};
    return { sent: a.emails_sent_count || 0, opened: a.open_count_unique || a.open_count || 0, replied: a.reply_count_unique || a.reply_count || 0, bounced: a.bounced_count || 0, leads: a.leads_count || 0 };
  },
  'POST /api/instantly/replies': async b => {
    requireKey('instantly');
    const r = await svc.instantly('/emails?limit=50&email_type=received&campaign_id=' + encodeURIComponent(b.campaignId));
    if (!r.ok) throw httpError(r.status, 'Instantly could not read replies.');
    return { replies: (r.json?.items || []).map(e => ({ id: e.id, from: e.from_address_email, subject: e.subject, text: e.body?.text || e.content_preview || '', at: e.timestamp_email || e.timestamp_created })) };
  },
  'POST /api/instantly/test-email': async b => {
    requireKey('instantly');
    useConfirm(b.confirmToken, ['send']);
    const to = String(b.to || '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) throw httpError(400, 'Type one real email address for the test.');
    const r = await svc.instantly('/emails/test', { method: 'POST', body: { eaccount: b.from, to_address_email_list: to, subject: b.subject, body: { text: b.body } } });
    if (!r.ok) throw httpError(r.status, 'Instantly did not send the test (' + r.status + '). You can also send a test from the campaign page in Instantly.');
    return { ok: true };
  },

  // Whop. New products start hidden with stock 0. Making one visible is its own yes.
  'POST /api/whop/product': async b => {
    requireKey('whop');
    useConfirm(b.confirmToken, ['spend', 'publish']);
    const acct = store.getSettings().whopAccountId;
    if (!acct) throw httpError(412, 'Add your Whop account ID in Settings, under Limits and accounts.');
    const p = await svc.whop('/products', { method: 'POST', body: { account_id: acct, title: String(b.title || 'New product').slice(0, 80), headline: b.headline, description: b.description, visibility: 'hidden' } });
    if (!p.ok) throw httpError(p.status, 'Whop did not make the product (' + p.status + '). ' + (p.json?.error?.message || ''));
    const productId = p.json?.id;
    const plan = await svc.whop('/plans', { method: 'POST', body: {
      company_id: acct, product_id: productId, plan_type: b.monthly ? 'renewal' : 'one_time',
      initial_price: b.monthly ? 0 : Number(b.price) || 0, renewal_price: b.monthly ? Number(b.price) || 0 : undefined,
      billing_period: b.monthly ? 30 : undefined, currency: 'usd', visibility: 'hidden', stock: 0, unlimited_stock: false,
    } });
    return { productId, planId: plan.json?.id || null, checkout: plan.json?.purchase_url || null, visibility: 'hidden', stock: 0, url: 'https://whop.com/dashboard/' + acct + '/products/' + productId };
  },
  'POST /api/whop/visibility': async b => {
    requireKey('whop');
    const visible = !!b.visible;
    useConfirm(b.confirmToken, visible ? ['publish'] : ['publish', 'spend']);
    const p = await svc.whop('/products/' + encodeURIComponent(b.productId), { method: 'PATCH', body: { visibility: visible ? 'visible' : 'hidden' } });
    if (!p.ok) throw httpError(p.status, 'Whop did not change it (' + p.status + ').');
    if (b.planId) await svc.whop('/plans/' + encodeURIComponent(b.planId), { method: 'PATCH', body: { visibility: visible ? 'visible' : 'hidden', stock: visible ? Number(b.stock) || 25 : 0 } });
    return { visibility: visible ? 'visible' : 'hidden' };
  },

  // Higgsfield. Paths for each model live in one place so they are easy to update.
  'POST /api/higgsfield/generate': async b => {
    requireKey('higgsfield');
    const c = useConfirm(b.confirmToken, ['spend']);
    checkCap(c.cost || 0);
    const paths = { image: '/higgsfield-ai/soul/v2/standard', edit: '/higgsfield-ai/soul/v2/standard', video: '/higgsfield-ai/dop/standard' };
    const body = { prompt: b.prompt, ...(b.imageUrl ? { image_urls: [b.imageUrl] } : {}), ...(b.aspect ? { aspect_ratio: b.aspect } : {}) };
    let r = await svc.higgsfield(paths[b.kind] || paths.image, { method: 'POST', body, timeoutMs: 60000 });
    if (!r.ok) throw httpError(r.status, 'Higgsfield did not take the job (' + r.status + ').');
    addSpend('Higgsfield ' + (b.kind || 'image'), c.cost || 0);
    let job = r.json || {};
    const id = job.request_id || job.id;
    const deadline = Date.now() + 4 * 60 * 1000;
    while (id && !['completed', 'failed', 'nsfw'].includes(String(job.status || '').toLowerCase()) && Date.now() < deadline) {
      await new Promise(res => setTimeout(res, 4000));
      const p = await svc.higgsfield('/requests/' + id + '/status');
      if (p.ok) job = p.json || job;
    }
    const url = job.images?.[0]?.url || job.video?.url || job.output?.[0] || null;
    if (!url) throw httpError(502, 'Higgsfield did not send a picture back. Try again.');
    return { url };
  },
};

// ---------- static files ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon' };

function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file);
    const headers = {
      'Content-Type': TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    };
    if (ext === '.html') {
      data = Buffer.from(data.toString('utf8').replace('__SUITE_TOKEN__', SESSION_TOKEN));
      headers['Content-Security-Policy'] = "default-src 'self'; img-src 'self' data: blob: https:; media-src 'self' blob: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'";
    }
    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (!url.pathname.startsWith('/api/')) {
    if (!allowedHost(req.headers.host || '')) { res.writeHead(403); return res.end('Wrong host'); }
    return serveStatic(req, res);
  }
  try {
    guardApi(req);
    const handler = routes[`${req.method} ${url.pathname}`];
    if (!handler) throw httpError(404, 'Unknown request.');
    const body = req.method === 'POST' ? await readBody(req) : {};
    const out = await handler(body);
    send(res, 200, out);
  } catch (e) {
    send(res, e.status || 500, { ok: false, error: e.message || 'Something went wrong.', spend: { spent: session.spent } });
  }
});

server.listen(PORT, HOST, () => {
  const link = `http://127.0.0.1:${PORT}`;
  console.log('\n  Product Suite is running.');
  console.log('  Open: ' + link);
  console.log('  Keys are saved in: ' + path.join(store.DIR, 'keys.json') + ' (only you can read it)');
  if (!AnthropicCtor) console.log('  Note: run "npm install" to turn on Claude in Live mode.');
  console.log('  Stop it with Ctrl+C.\n');
  if (!process.env.NO_OPEN && !process.env.CI) {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', link] : [link];
    try { spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref(); } catch { /* fine */ }
  }
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') console.error(`\n  Port ${PORT} is busy. Is the app already open? Or start on another port: PORT=5178 npm start\n`);
  else console.error(e);
  process.exit(1);
});
