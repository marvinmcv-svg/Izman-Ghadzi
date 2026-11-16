// Home, Settings, Unibox, hustle picker, Summary and the PDF view.
import { state, set, refresh, isDemo, log, persist } from '../core/store.js';
import { esc, icon, pill, money, fmt, toolLogo, TOOLS, copyBtn, toast, confirmBox, short } from '../core/ui.js';
import { api, refreshServer, HOSTED } from '../core/api.js';
import { coverSVG, foodSVG, hustlePreview, chapterArt } from '../core/art.js';
import { STEPS, BY_KEY, trackSteps, stepRoute, isDone, statusPill, toolStatus } from '../steps/frame.js';
import { repliesFor, isUnread, markRead, OUT_KEYS } from '../steps/outreach.js';
import { chapterHtml, bookContent } from '../steps/build.js';
import { TRACKS, LABEL_TONE } from '../data/outreach.js';
import { HUSTLES } from '../data/hustles.js';
import { RESEARCH, POCKETS } from '../data/product.js';
import { DISCLAIMER } from '../data/book.js';
import { tourSteps } from '../player.js';

// ---------- HOME ----------
export function home() {
  const first = BY_KEY['p.build.idea'];
  return `<div class="page enter">
    <div class="hero">
      <div class="eyebrow">Product Suite</div>
      <h1 class="h-title">Make a digital product, find buyers, email them, and launch it.</h1>
      <p class="lede">One dashboard on your own computer. Clear steps a beginner can follow, from one idea to a store page and launch week.</p>
      <div class="btns mt24"><button class="btn main lg next-pulse" data-go="${stepRoute(first)}">Start here: make a product${icon('arrow')}</button><button class="btn lg" data-go="#/settings">${icon('key')}Add your keys</button></div>
      <div class="note ${isDemo() ? '' : 'o'} mt16" style="display:inline-flex;gap:10px;align-items:center">${icon(isDemo() ? 'info' : 'bolt', 'style="width:16px;height:16px"')}<span>${isDemo() ? 'You are in Demo mode. It uses saved examples, so nothing is spent or sent.' : 'You are in Live mode. Every step that costs money or sends something shows the price and waits for your yes.'}</span></div>
    </div>
    <div class="sec-head"><div><h2 class="h2">Your path</h2><p>Four stages. Each one has small steps with one clear button.</p></div></div>
    <div class="path4">${[['Make it', 'An ebook people already want', 'p.build.idea'], ['Find buyers', 'Creators and shops that fit', 'p.send.find'], ['Send', 'Safe inboxes, then a short email', 'p.send.inboxes'], ['Launch', 'Store page and launch posts', 'p.launch.offer']].map(([t, l, k], i) => `<button class="card hover" style="text-align:left;cursor:pointer" data-go="${stepRoute(BY_KEY[k])}"><div class="num-badge">${i + 1}</div><div class="h3">${t}</div><p class="small dim mt8" style="margin:0">${l}</p></button>`).join('')}</div>
    <div class="sec-head"><div><h2 class="h2">Tools</h2><p>Each one does the work of a paid tool, with your own keys.</p></div></div>
    <div class="grid g2">
      ${toolCard('Digital Product', 'Turn one idea into an ebook people already pay for.', `<div class="row" style="gap:14px"><div class="cover" style="width:74px;flex:none">${coverSVG({})}</div><div class="small"><div class="ink">The Small Appetite Protein Plan</div><div class="dim">10 chapters . 24 sources . $37</div><div class="mt8">${POCKETS.slice(0, 3).map(p => `<span class="pill no-dot mono" style="margin:2px">${esc(p.name)} ${p.total}</span>`).join('')}</div></div></div>`, 'p.build.idea', 'Start')}
      ${toolCard('Leads & Outreach', 'Find people who fit, get their email, and write to them safely.', `<div class="small"><div class="row between"><span>Creators found</span><b class="mono ink">7</b></div><div class="row between"><span>Checked emails</span><b class="mono ink">26</b></div><div class="row between"><span>Inboxes warming</span><b class="mono ink">12</b></div><div class="row between"><span>Replies</span><b class="mono green">6</b></div></div>`, 'p.send.find', 'Find buyers')}
      ${toolCard('AI Side Hustles', 'Win a first paying client with one of 3 easy AI services.', `<div class="row wrap" style="gap:8px">${Object.values(HUSTLES).map(h => `<span class="pill no-dot">${esc(h.name)}: ${esc(h.charge)}</span>`).join('')}</div>`, '#/hustles', 'Pick a hustle')}
      ${toolCard('Launch', 'Put it on sale and get every post for launch week.', `<div class="small"><div>3 reels . 5 captions . 3 emails . 8 story frames</div><div class="mt8">${pill('Whop page hidden, stock 0', 'orange')}</div></div>`, 'p.launch.offer', 'Launch')}
    </div>
    <div class="sec-head"><div><h2 class="h2">Good to know</h2></div></div>
    <div class="facts">${[['play', 'Demo mode first', 'Every step works with saved examples. Switch to Live when ready.'], ['coin', 'You see every cost', 'Anything that costs money shows the price and waits for your yes.'], ['lock', 'Your keys stay here', 'Paste a key once. It is saved on this computer only.']].map(([i, t, l]) => `<div class="card fact"><div class="fi">${icon(i)}</div><div><b class="ink">${t}</b><p class="small dim" style="margin:4px 0 0">${l}</p></div></div>`).join('')}</div>
  </div>`;
}
function toolCard(title, line, prev, target, btn) {
  const route = target.startsWith('#') ? target : stepRoute(BY_KEY[target]);
  return `<div class="card tool-card"><div><div class="h3">${esc(title)}</div><p class="small dim" style="margin:4px 0 0">${esc(line)}</p></div><div class="prev">${prev}</div><div><button class="btn main sm" data-go="${route}">${esc(btn)}${icon('arrow')}</button></div></div>`;
}

// ---------- SETTINGS ----------
const ORDER = ['claude', 'apify', 'higgsfield', 'aiark', 'instantly', 'whop', 'nanobanana', 'spaceship', 'scaledmail'];
const WHAT = {
  claude: 'Writes the plan, the book, the emails and the reply drafts',
  apify: 'Runs the robots that read Reddit, Etsy, Amazon, TikTok, YouTube, Instagram, Airbnb and the Meta Ad Library',
  higgsfield: 'Fixes photos, makes ad pictures and short video clips',
  aiark: 'Finds a real, checked email for each lead',
  instantly: 'Holds the sending inboxes, warms them up, sends the campaign',
  whop: 'Makes the store page and the pay link',
  nanobanana: 'An optional slot for a Google Gemini image key, saved for later',
  spaceship: 'Buys the sending domains and writes their DNS records',
  scaledmail: 'Makes Google inboxes on those domains',
};
export const LINKS = {
  apify: { url: 'https://www.apify.com?fpr=dopaminedigital', note: 'code 25JORDAN' },
  higgsfield: { url: 'https://higgsfield.ai?fpr=jordan-a7ae0b' },
  aiark: { url: 'https://www.ai-ark.com/?ref=jordan' },
  instantly: { url: 'https://refer.instantly.ai/ty0wj6t5f0pi' },
  scaledmail: { url: 'https://go.scaledmail.com/jordan-rafealov' },
  spaceship: { url: 'https://www.spaceship.com' },
  whop: { url: 'https://whop.com/sell' },
  claude: { url: 'https://console.anthropic.com' },
  nanobanana: { url: 'https://aistudio.google.com/apikey' },
};
const EXTRA_LINKS = [
  { name: 'Zernio', url: 'https://zernio.link/jordan-rafealov', what: 'Schedules launch week posts' },
  { name: 'Wispr Flow', url: 'https://ref.wisprflow.ai/jordan-rafealov-tvka', what: 'Talk instead of type' },
];

export function settings() {
  const s = state.server;
  const set_ = s?.settings || {};
  const demo = isDemo();
  const fieldLabel = f => ({ key: 'Key', secret: 'Secret', keyId: 'Key ID' }[f] || f);
  const rows = ORDER.map(id => {
    const c = s?.connectors?.[id] || { fields: id === 'higgsfield' ? ['keyId', 'secret'] : id === 'spaceship' ? ['key', 'secret'] : ['key'], masked: {}, has: false, where: '' };
    const st = demo ? 'demo' : toolStatus(id);
    return `<div class="card" id="conn-${id}" data-keyform="${id}"><div class="row wrap" style="align-items:flex-start;gap:14px">
      ${toolLogo(id, 38)}
      <div style="flex:1;min-width:220px"><div class="row wrap"><b class="ink">${esc(TOOLS[id].name)}</b>${statusPill(st)}</div><p class="small dim" style="margin:4px 0 0">${esc(WHAT[id])}</p>
        <div class="mono small mt8 ${demo ? 'dim' : 'ink'}">${demo ? `${id.slice(0, 3)}-demo........0000${c.fields.length > 1 ? '   secret-demo........0000' : ''}` : c.has ? Object.entries(c.masked).map(([k, v]) => `${fieldLabel(k)}: ${esc(v)}`).join('   ') : 'No key saved'}</div></div>
      <div class="btns">${LINKS[id] ? `<a class="btn sm quiet" href="${esc(LINKS[id].url)}" target="_blank" rel="noopener">${icon('ext')}Get a key${LINKS[id].note ? ` (${esc(LINKS[id].note)})` : ''}</a>` : ''}</div></div>
      ${demo ? `<div class="btns mt12"><button class="btn sm main" data-go-live>Use my real key</button></div>` : `
      <div class="grid ${c.fields.length > 1 ? 'g2' : ''} mt12">${c.fields.map(f => `<label class="field"><span class="label">${fieldLabel(f)}</span><input type="password" autocomplete="off" spellcheck="false" data-kf="${f}" placeholder="Paste a new ${fieldLabel(f).toLowerCase()}"></label>`).join('')}</div>
      <p class="tiny dim mt8">Where to find this key: ${esc(c.where)}</p>
      <div class="btns mt8"><button class="btn sm main" data-keysave="${id}">Save</button><button class="btn sm" data-keytest="${id}" ${c.has ? '' : 'disabled'}>Test (free)</button>${c.has ? `<button class="btn sm quiet danger" data-keyremove="${id}">Remove</button>` : ''}</div>`}
    </div>`;
  }).join('');
  const models = [['claude-opus-5-5', 'Opus 5.5', 'The default. Best writing.'], ['claude-sonnet-5-5', 'Sonnet 5.5', 'Faster and cheaper.'], ['claude-haiku-5-5', 'Haiku 5.5', 'Fastest and cheapest.'], ['claude-fable-5-2', 'Fable', 'Runs on your own Mac mini through Hermes. Needs its address.']];
  const cur = set_.defaultModel || 'claude-opus-5-5';
  const robots = s?.robots || [];
  return `<div class="page enter">
    ${HOSTED ? `<div class="banner info">${icon('info', 'style="width:18px;height:18px;flex:none"')}<div>This is the online demo. Keys are never pasted here. To use Live mode with your own keys, run the app on your computer: <code>npm install</code> then <code>npm start</code>.</div></div>` : state.serverDown ? helperBanner() : ''}
    <div class="eyebrow">Settings</div>
    <h1 class="h-title">Settings and keys</h1>
    <p class="lede">Paste a key once. Every tool uses it. You can also paste keys right on the step that needs them.</p>
    <div class="note mt16 small">${icon('lock', 'style="width:14px;vertical-align:-2px"')} Keys are saved in a private file on this computer${s?.keyFile ? ` (<span class="mono">${esc(s.keyFile)}</span>)` : ''} that only you can read. This page only ever sees masked keys like <span class="mono">sk-a........9f2c</span>.</div>
    <div class="sec-head"><div><h2 class="h2">Every connector</h2><p>${demo ? 'In Demo mode every row uses an obviously fake demo key.' : 'The free test makes one harmless read only call. It never spends money.'}</p></div></div>
    <div class="stack">${rows}</div>

    <div class="sec-head"><div><h2 class="h2">Claude model</h2><p>Each step can override this from its Claude chip.</p></div></div>
    <div class="grid g4">${models.map(([v, l, d]) => `<button class="card ${cur === v ? 'sel' : ''}" style="text-align:left;cursor:pointer" data-model="${v}"><div class="row between"><b class="ink">${l}</b>${cur === v ? pill('Default', 'purple') : ''}</div><p class="small dim mt8" style="margin:0">${d}</p></button>`).join('')}</div>

    <div class="sec-head"><div><h2 class="h2">Limits and accounts</h2><p>Your sender details go at the bottom of every cold email because the law asks for them.</p></div></div>
    <div class="card" data-settings-form><div class="grid g2">
      ${[['sessionCap', 'Spend cap for this session ($)', 'number', 10], ['apifyRunCap', 'Apify cap per robot run ($)', 'number', 1], ['fableAddress', 'Fable address (Hermes on your Mac mini)', 'text', 'http://mac-mini.local:8080'], ['whopAccountId', 'Whop account ID', 'text', 'biz_...'], ['scaledmailWorkspace', 'ScaledMail workspace', 'text', ''], ['spaceshipContact', 'Spaceship owner contact', 'text', 'Contact ID'], ['senderName', 'Your name', 'text', 'Your real name'], ['businessName', 'Business name', 'text', ''], ['mailingAddress', 'Mailing address', 'text', 'Street, city, state, zip']].map(([k, l, t, ph]) => `<label class="field"><span class="label">${l}</span><input type="${t}" data-setting="${k}" value="${esc(demo ? (k === 'sessionCap' ? 10 : k === 'apifyRunCap' ? 1 : '') : (set_[k] ?? ''))}" placeholder="${esc(String(ph))}" ${demo ? 'disabled' : ''}></label>`).join('')}
    </div>${demo ? '<p class="small dim mt12">Switch to Live to change these.</p>' : '<div class="btns mt16"><button class="btn main" data-save-settings>Save</button></div>'}</div>

    <div class="sec-head"><div><h2 class="h2">Registrar login (private)</h2><p>ScaledMail needs this to finish inboxes on domains bought elsewhere. Used only inside an order you confirm.</p></div></div>
    <div class="card">${demo ? '<p class="small dim" style="margin:0">Switch to Live to add it.</p>' : `<div class="grid g2"><label class="field"><span class="label">Login</span><input data-reg="login" autocomplete="off" placeholder="${s?.registrarSaved ? 'Saved. Type to replace.' : 'Registrar login'}"></label><label class="field"><span class="label">Password</span><input type="password" data-reg="password" autocomplete="off"></label></div><div class="btns mt12"><button class="btn sm main" data-reg-save>Save privately</button>${s?.registrarSaved ? '<button class="btn sm quiet danger" data-reg-remove>Remove</button>' + pill('Saved', 'green') : ''}</div>`}</div>

    <div class="sec-head"><div><h2 class="h2">Robots and prices</h2><p>Price per result, est. Check each robot's page in the Apify store before a big run.</p></div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Robot</th><th>Apify actor</th><th class="num">Price per result</th></tr></thead><tbody>${(robots.length ? robots : [{ name: 'Start the helper to see the list', actor: '', perResult: 0, unit: '' }]).map(r => `<tr><td class="ink">${esc(r.name)}</td><td class="mono small">${esc(r.actor)}</td><td class="num">${r.perResult ? '$' + r.perResult.toFixed(4) + ' a ' + esc(r.unit) + ' est.' : ''}</td></tr>`).join('')}</tbody></table></div>

    <div class="sec-head"><div><h2 class="h2">Sign up links</h2><p>Partner links may pay the person who shared this app. Same price for you.</p></div></div>
    <div class="grid g3">${[...ORDER.filter(id => LINKS[id]).map(id => ({ name: TOOLS[id].name, url: LINKS[id].url, what: WHAT[id], note: LINKS[id].note })), ...EXTRA_LINKS].map(l => `<a class="card hover" href="${esc(l.url)}" target="_blank" rel="noopener" style="text-decoration:none"><div class="row between"><b class="ink">${esc(l.name)}</b>${icon('ext', 'style="width:14px;height:14px;color:var(--dim)"')}</div><p class="tiny dim mt8" style="margin:0">${esc(l.what)}${l.note ? ` . ${esc(l.note)}` : ''}</p></a>`).join('')}</div>

    <div class="sec-head"><div><h2 class="h2">Demo</h2></div></div>
    <div class="card row between wrap"><div><b class="ink">Reset the demo</b><p class="small dim" style="margin:4px 0 0">Puts every demo step back to finished and clears demo edits.</p></div><button class="btn" data-reset-demo>${icon('refresh')}Reset the demo</button></div>
  </div>`;
}

export function helperBanner() {
  return `<div class="banner">${icon('info', 'style="width:18px;height:18px;color:var(--red);flex:none"')}<div>The local helper is not running, so Live mode and keys are off. Start it from the app folder with <code>npm start</code>, then reload this page.</div></div>`;
}

export async function bindSettings(root) {
  root.querySelectorAll('[data-model]').forEach(b => b.onclick = async () => {
    if (isDemo()) { toast('Switch to Live to change the default model'); return; }
    if (b.dataset.model === 'claude-fable-5-2' && !state.server?.settings?.fableAddress) toast('Add your Fable address below too', 'err');
    try { await api('settings', { patch: { defaultModel: b.dataset.model } }); await refreshServer(); toast('Saved'); } catch (e) { toast(e.message, 'err'); }
  });
  root.querySelector('[data-save-settings]')?.addEventListener('click', async () => {
    const patch = {};
    root.querySelectorAll('[data-setting]').forEach(i => { patch[i.dataset.setting] = i.type === 'number' ? Number(i.value) : i.value.trim(); });
    try { await api('settings', { patch }); await refreshServer(); log('Saved your settings', { icon: 'gear', cost: 0 }); toast('Saved'); } catch (e) { toast(e.message, 'err'); }
  });
  root.querySelector('[data-reg-save]')?.addEventListener('click', async () => {
    const login = root.querySelector('[data-reg="login"]').value.trim(), password = root.querySelector('[data-reg="password"]').value;
    if (!login || !password) { toast('Type the login and the password', 'err'); return; }
    try { await api('registrar', { login, password }); await refreshServer(); toast('Saved privately on this computer'); } catch (e) { toast(e.message, 'err'); }
  });
  root.querySelector('[data-reg-remove]')?.addEventListener('click', async () => { await api('registrar', { remove: true }); await refreshServer(); toast('Removed'); });
  root.querySelector('[data-reset-demo]')?.addEventListener('click', async () => {
    const ok = await confirmBox({ title: 'Reset the demo?', intro: 'Every demo step goes back to finished and demo edits are cleared. Your Live results and keys are not touched.', yes: 'Reset' });
    if (!ok) return;
    const edits = { ...state.edits }; delete edits.book;
    const inputs = Object.fromEntries(Object.entries(state.inputs).filter(([k]) => !k.startsWith('emails:') && !k.startsWith('tiers')));
    state.demoCleared = {}; state.sends = {}; state.ui = {};
    set({ edits, inputs, unreadRead: [], autoresponder: { ebook: true, airbnb: true, ads: true, shorts: true } });
    log('Reset the demo', { icon: 'refresh', cost: 0 });
    toast('Demo reset');
  });
}

// ---------- UNIBOX ----------
const TRACK_ORDER = ['ebook', 'airbnb', 'ads', 'shorts'];
export function allReplies() { return TRACK_ORDER.flatMap(t => repliesFor(t)); }
export function unreadCount() { return allReplies().filter(isUnread).length; }

export function unibox() {
  const filter = state.ui.uniFilter || 'all';
  const all = allReplies();
  const list = filter === 'all' ? all : all.filter(r => r.track === filter);
  const sel = list.find(r => r.id === state.ui.uniSel) || list[0];
  const stats = [['Interested', all.filter(r => r.label === 'Interested').length, 'g'], ['Questions', all.filter(r => r.label === 'Question' || r.label === 'Pricing question').length, 'p'], ['Not now or away', all.filter(r => r.label === 'Not now' || r.label === 'Out of office').length, ''], ['AI drafts', all.filter(r => r.label !== 'Out of office').length, 'o']];
  return `<div class="page wide enter">
    <div class="eyebrow">Unibox</div>
    <h1 class="h-title">One inbox for every campaign</h1>
    <p class="lede">Every reply from every campaign. Filter by track. Open a reply in its own campaign to answer it there.</p>
    ${!isDemo() ? `<div class="note o mt16 small">In Live mode your real replies live in Instantly. <a href="https://app.instantly.ai/app/unibox" target="_blank" rel="noopener">Open the Instantly inbox</a>. Each campaign's Replies step still drafts answers, and those drafts show up here.</div>` : ''}
    <div class="grid g4 mt24">${stats.map(([l, v, t]) => `<div class="stat ${t}"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <div class="row wrap mt16"><button class="chip ${filter === 'all' ? 'on' : ''}" data-unifilter="all">All <span class="mono">${all.length}</span></button>${TRACK_ORDER.map(t => `<button class="chip ${filter === t ? 'on' : ''}" data-unifilter="${t}">${esc(TRACKS[t].campaign)} <span class="mono">${all.filter(r => r.track === t).length}</span></button>`).join('')}</div>
    ${!list.length ? `<div class="card mt16"><p class="dim" style="margin:0">No replies yet. They show up here as campaigns get answers.</p></div>` : `
    <div class="split mt16" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)">
      <div class="card ${state.hideNames ? 'blur-names' : ''}" style="padding:8px"><div class="reply-list">${list.map(r => `<div class="reply ${r.id === sel.id ? 'on' : ''}" data-unisel="${r.id}" tabindex="0"><span class="ud ${isUnread(r) ? '' : 'read'}"></span>
        <div style="min-width:0"><div class="row wrap" style="gap:6px"><span class="who nm">${esc(r.from)}</span>${pill(r.label, LABEL_TONE[r.label])}<span class="pill no-dot tiny">${esc(TRACKS[r.track].tag)}</span></div><div class="tiny lilac">${esc(TRACKS[r.track].campaign)}</div><div class="pv">${esc(r.text)}</div></div><span class="tm">${esc(r.at)}</span></div>`).join('')}</div></div>
      <div class="stack ${state.hideNames ? 'blur-names' : ''}"><div class="card"><div class="row between wrap"><div><b class="ink nm">${esc(sel.from)}</b><div class="tiny dim">${esc(TRACKS[sel.track].campaign)}</div></div><div class="row">${pill(sel.label, LABEL_TONE[sel.label])}<span class="pill no-dot">${esc(TRACKS[sel.track].tag)}</span></div></div><p class="ink mt12" style="margin-bottom:0">"${esc(sel.text)}"</p></div>
        <div class="card"><div class="card-head"><div class="h3">AI reply draft (not sent)</div>${pill('Draft', 'orange')}</div><div class="draft">${esc(sel.draft)}</div>
          <div class="btns mt12">${copyBtn(sel.draft, 'Copy the reply')}<button class="btn main sm" data-uniopen="${sel.id}" data-track="${sel.track}">Open in ${esc(TRACKS[sel.track].campaign)}${icon('arrow')}</button></div></div></div>
    </div>`}
  </div>`;
}
export function bindUnibox(root) {
  const all = allReplies();
  const sel = state.ui.uniSel || all[0]?.id;
  if (sel) setTimeout(() => markRead(sel), 500);
  root.querySelectorAll('[data-unifilter]').forEach(b => b.onclick = () => { state.ui.uniFilter = b.dataset.unifilter; state.ui.uniSel = null; refresh(); });
  root.querySelectorAll('[data-unisel]').forEach(el => { const go = () => { state.ui.uniSel = el.dataset.unisel; markRead(el.dataset.unisel); refresh(); }; el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter') go(); }; });
  root.querySelectorAll('[data-uniopen]').forEach(b => b.onclick = () => {
    const t = b.dataset.track;
    state.ui['reply:' + t] = b.dataset.uniopen;
    if (t !== 'ebook') set({ hustle: t }, { silent: true });
    location.hash = '#/step/' + OUT_KEYS[t].prefix + '.replies';
  });
}

// ---------- HUSTLE PICKER ----------
export function hustlePick() {
  return `<div class="page enter"><div class="eyebrow">AI Side Hustles</div><h1 class="h-title">Pick a side hustle</h1>
    <p class="lede">Do a small job for a client, show them a free sample, then get paid. Each hustle has its own leads, inboxes, campaign and replies.</p>
    <div class="grid g3 mt24">${Object.values(HUSTLES).map(h => `<div class="card pick-card" data-pickhustle="${h.id}" tabindex="0"><div class="pv" data-hprev="${h.id}"></div>
      <div class="h3">${esc(h.name)}</div><p class="small mt8">${esc(h.line)}</p>
      <div class="kv mt12"><span>Charge</span><span class="peach">${esc(h.charge)}</span><span>Costs you</span><span>${esc(h.costs)} est.</span><span>Time</span><span>${esc(h.time)}</span></div>
      <button class="btn main mt16" style="width:100%">Start this hustle${icon('arrow')}</button></div>`).join('')}</div>
    <p class="small dim mt16">Prices and costs are starting points (est.). Nothing here promises income.</p></div>`;
}
export function bindHustlePick(root) {
  root.querySelectorAll('[data-hprev]').forEach(el => { const p = hustlePreview(el.dataset.hprev); el.appendChild(p); });
  root.querySelectorAll('[data-pickhustle]').forEach(c => { const go = () => { set({ hustle: c.dataset.pickhustle }, { silent: true }); location.hash = stepRoute(trackSteps(c.dataset.pickhustle)[0]); }; c.onclick = go; c.onkeydown = e => { if (e.key === 'Enter') go(); }; });
}

// ---------- SUMMARY ----------
export function summary() {
  const list = tourSteps();
  const all = allReplies();
  return `<div class="page enter"><div class="eyebrow">Run live demo . finished</div><h1 class="h-title">Everything this app just did</h1>
    <p class="lede">A full walk through, from one idea to a store page and a first side hustle client, using saved results.</p>
    <div class="grid g3 mt24">
      <div class="stat p"><b>${fmt(state.counters.words)}</b><span>Words written</span></div>
      <div class="stat"><b>${state.counters.runs}</b><span>Searches and runs</span></div>
      <div class="stat"><b>52</b><span>Emails sent (demo)</span></div>
      <div class="stat g"><b>${all.length}</b><span>Replies</span></div>
      <div class="stat"><b>2</b><span>Whop pages (hidden)</span></div>
      <div class="stat o"><b>$0.00</b><span>Spent</span></div>
    </div>
    <div class="tbl-wrap mt24"><table class="tbl"><thead><tr><th>#</th><th>Step</th><th>Replaces</th><th>Saves</th></tr></thead><tbody>
      ${list.map((s, i) => `<tr class="click" data-go="${stepRoute(s)}"><td class="mono">${i + 1}</td><td class="ink">${esc(typeof s.short === 'function' ? s.short() : (s.short || s.title))}</td><td class="small">${esc(s.replaces)}</td><td class="small peach">${esc(s.saves)}</td></tr>`).join('')}</tbody></table></div>
    <div class="btns mt24"><button class="btn main" data-go="#/home">Back to Home</button><button class="btn" data-go="#/settings">Add your keys and go Live</button></div></div>`;
}

// ---------- PDF ----------
export function openPdf() {
  const b = bookContent();
  const edited = state.edits.book;
  const root = document.getElementById('pdf-root');
  let chaptersHtml;
  if (edited) {
    // split the edited book back into chapters on each chapter number marker
    const t = document.createElement('div'); t.innerHTML = edited;
    const pages = []; let cur = null;
    [...t.childNodes].forEach(n => { if (n.nodeType === 1 && n.classList.contains('ch-num')) { cur = document.createElement('div'); pages.push(cur); } if (cur) cur.appendChild(n.cloneNode(true)); });
    chaptersHtml = pages.map((p, i) => `<section class="pdf-page"><div class="chimg">${chapterArt(i)}</div>${p.innerHTML}<div class="pn">${i + 3}</div></section>`).join('');
  } else {
    chaptersHtml = b.chapters.map((c, i) => `<section class="pdf-page"><div class="chimg">${chapterArt(i)}</div>${chapterHtml(c, i)}<div class="pn">${i + 3}</div></section>`).join('');
  }
  root.innerHTML = `<div class="pdf-view" role="dialog" aria-label="Book PDF">
    <div class="pdf-bar"><div class="row"><b>${esc(b.title)}</b><span class="small" style="opacity:.6">6 by 9 inch book${edited ? ', with your edits' : ''}</span></div>
      <div class="btns"><button class="btn money" data-pdf-print>${icon('download')}Download PDF</button><button class="btn" data-pdf-close>${icon('x')}Close</button></div></div>
    <div class="pdf-pages">
      <section class="pdf-page cover-page"><div class="cover">${coverSVG({ title: b.title, subtitle: b.subtitle })}</div></section>
      <section class="pdf-page"><h2>Contents</h2><ol style="padding-left:20px">${b.chapters.map((c, i) => `<li style="margin-bottom:6px"><a href="#pdf-ch-${i}" style="color:#1d1b26">${esc(c.title)}</a></li>`).join('')}<li>Sources</li></ol><p class="disclaimer" style="margin-top:30px">${esc(DISCLAIMER)}</p><div class="pn">2</div></section>
      ${chaptersHtml}
      <section class="pdf-page"><h2>Sources</h2><ol class="sources" style="padding-left:18px">${b.sources.map(s => `<li value="${s.n}">${esc(s.t)} <span style="color:#5B2EE8;word-break:break-all">${esc(s.u)}</span></li>`).join('')}</ol><div class="pn">${b.chapters.length + 3}</div></section>
    </div></div>`;
  root.querySelector('[data-pdf-close]').onclick = () => { root.innerHTML = ''; };
  root.querySelector('[data-pdf-print]').onclick = () => { log('Opened the print window to save the book as a PDF', { icon: 'download', cost: 0 }); toast('Pick "Save as PDF" in the print window'); setTimeout(() => window.print(), 300); };
  log('Opened the designed PDF', { icon: 'book', cost: 0 });
}
