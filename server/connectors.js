// Every outside service the app can talk to. The helper adds the key on the way out.
// The page never sees a full key. Each "test" makes one harmless, read only call.

import { getSecret, getSettings } from './store.js';

export const CONNECTORS = {
  claude: {
    name: 'Claude', fields: ['key'],
    where: 'console.anthropic.com, then Settings, then API keys. It starts with "sk-ant-".',
  },
  apify: {
    name: 'Apify', fields: ['key'],
    where: 'Apify Console, then Settings, then API and Integrations. Copy the personal API token.',
  },
  higgsfield: {
    name: 'Higgsfield', fields: ['keyId', 'secret'],
    where: 'Higgsfield API platform, then API keys. You get a key ID and a secret.',
  },
  aiark: {
    name: 'AI Ark', fields: ['key'],
    where: 'AI Ark app, then Developer portal, then API key.',
  },
  instantly: {
    name: 'Instantly', fields: ['key'],
    where: 'Instantly, then Settings, then Integrations, then API. Make an API v2 key.',
  },
  whop: {
    name: 'Whop', fields: ['key'],
    where: 'Whop dashboard, then Developer, then API keys. Also add your Whop account ID below.',
  },
  nanobanana: {
    name: 'Nano Banana', fields: ['key'],
    where: 'Google AI Studio, then Get API key. Saved for later, nothing uses it yet.',
  },
  spaceship: {
    name: 'Spaceship', fields: ['key', 'secret'],
    where: 'Spaceship, then API Manager. Make a key with domains and DNS access. You get a key and a secret.',
  },
  scaledmail: {
    name: 'ScaledMail', fields: ['key'],
    where: 'ScaledMail, then Settings, then API. Copy the API key.',
  },
};

const UA = 'product-suite-local/1.0';

async function http(url, { method = 'GET', headers = {}, body, timeoutMs = 30000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      headers: { 'User-Agent': UA, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* not json */ }
    return { ok: res.ok, status: res.status, json, text };
  } finally {
    clearTimeout(t);
  }
}

// ---------- per service request helpers (key added here) ----------
export const svc = {
  apify: (p, o = {}) => http('https://api.apify.com/v2' + p, {
    ...o, headers: { Authorization: 'Bearer ' + getSecret('apify'), ...(o.headers || {}) },
  }),
  instantly: (p, o = {}) => http('https://api.instantly.ai/api/v2' + p, {
    ...o, headers: { Authorization: 'Bearer ' + getSecret('instantly'), ...(o.headers || {}) },
  }),
  whop: (p, o = {}) => http('https://api.whop.com/api/v1' + p, {
    ...o, headers: { Authorization: 'Bearer ' + getSecret('whop'), ...(o.headers || {}) },
  }),
  spaceship: (p, o = {}) => http('https://spaceship.dev/api/v1' + p, {
    ...o, headers: { 'X-API-Key': getSecret('spaceship'), 'X-API-Secret': getSecret('spaceship', 'secret'), ...(o.headers || {}) },
  }),
  scaledmail: (p, o = {}) => http('https://server.scaledmail.com/api/v1' + p, {
    ...o, headers: { Authorization: 'Bearer ' + getSecret('scaledmail'), ...(o.headers || {}) },
  }),
  aiark: (p, o = {}) => http('https://api.ai-ark.com/api/developer-portal' + p, {
    ...o, headers: { 'X-TOKEN': getSecret('aiark'), ...(o.headers || {}) },
  }),
  higgsfield: (p, o = {}) => http('https://api.higgsfield.ai' + p, {
    ...o, headers: { Authorization: `Key ${getSecret('higgsfield', 'keyId')}:${getSecret('higgsfield', 'secret')}`, ...(o.headers || {}) },
  }),
  gemini: (p, o = {}) => http('https://generativelanguage.googleapis.com/v1beta' + p, {
    ...o, headers: { 'x-goog-api-key': getSecret('nanobanana'), ...(o.headers || {}) },
  }),
};

// An auth check that spends nothing: a 401 or 403 means the key is wrong.
// Any other answer (200, 404 for a made up id, 422) means the key was accepted.
function authVerdict(r) {
  if (r.status === 401 || r.status === 403) return { ok: false, detail: 'The service said this key is not allowed.' };
  if (r.status >= 500) return { ok: false, detail: 'The service had a problem. Try again in a minute.' };
  return { ok: true, detail: 'Key accepted.' };
}

export async function testConnector(tool, anthropicClient) {
  switch (tool) {
    case 'claude': {
      const client = anthropicClient();
      if (!client) return { ok: false, detail: 'Run "npm install" first so the Claude helper is installed.' };
      try {
        const m = await client.models.retrieve(getSettings().defaultModel || 'claude-opus-5-5');
        return { ok: true, detail: `Key works. ${m.display_name || m.id} is ready.` };
      } catch (e) {
        return { ok: false, detail: e?.status === 401 ? 'The key did not work.' : 'Could not reach Claude: ' + (e?.message || 'unknown') };
      }
    }
    case 'apify': {
      const r = await svc.apify('/users/me');
      if (!r.ok) return authVerdict(r).ok ? { ok: false, detail: 'Unexpected answer from Apify.' } : authVerdict(r);
      const u = r.json?.data || {};
      return { ok: true, detail: `Signed in as ${u.username || 'your account'}.` };
    }
    case 'instantly': {
      const r = await svc.instantly('/accounts?limit=1');
      if (!r.ok) return authVerdict(r);
      return { ok: true, detail: 'Key works. Instantly can read your inboxes.' };
    }
    case 'whop': {
      const acct = getSettings().whopAccountId;
      const r = await svc.whop('/products?first=1' + (acct ? '&company_id=' + encodeURIComponent(acct) : ''));
      const v = authVerdict(r);
      return v.ok ? { ok: true, detail: acct ? 'Key works with your Whop account.' : 'Key accepted. Add your Whop account ID in Limits and accounts.' } : v;
    }
    case 'spaceship': {
      const r = await svc.spaceship('/domains?take=1&skip=0');
      return authVerdict(r).ok ? { ok: true, detail: 'Key works. Spaceship can read your domains.' } : authVerdict(r);
    }
    case 'scaledmail': {
      const r = await svc.scaledmail('/organizations');
      return authVerdict(r).ok ? { ok: true, detail: 'Key works. ScaledMail can read your workspaces.' } : authVerdict(r);
    }
    case 'aiark': {
      // Reads statistics for a made up track id. Free. A 404 still proves the key was accepted.
      const r = await svc.aiark('/v1/people/email-finder/statistics/test-key-check');
      return authVerdict(r);
    }
    case 'higgsfield': {
      // Reads the status of a made up request. Free. A 404 still proves the key was accepted.
      const r = await svc.higgsfield('/requests/00000000-0000-0000-0000-000000000000/status');
      return authVerdict(r);
    }
    case 'nanobanana': {
      const r = await svc.gemini('/models?pageSize=1');
      return authVerdict(r).ok ? { ok: true, detail: 'Key works. Saved for later.' } : authVerdict(r);
    }
    default:
      return { ok: false, detail: 'Unknown tool.' };
  }
}
