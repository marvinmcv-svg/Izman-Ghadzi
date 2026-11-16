// Find buyers & send. The same screens power every campaign, each with its own
// leads, domains, inboxes, emails and replies.
import { state, set, refresh, setLiveResult, liveResult, isDemo, log, emit, persist } from '../core/store.js';
import { esc, icon, pill, bar, money, fmt, short, seg, tabs, copyBtn, toast, confirmBox, slug } from '../core/ui.js';
import { api, approve, token, claudeJSON, robot } from '../core/api.js';
import { register, frame, stepData, emptyFor, view, setView, BY_KEY } from './frame.js';
import { TRACKS, creatorsFound, FUNNEL, leads as demoLeads, inboxes as demoInboxes, domainBoard, dnsRecords, EMAILS, TEMPLATES, REPLIES, LABEL_TONE, AUTO_TEMPLATES, timeline, footer, SENDER, NEXT_SEND } from '../data/outreach.js';

const cap = () => state.server?.settings?.dailyCapPerInbox || 25;
const sender = () => {
  const s = state.server?.settings || {};
  return isDemo() || !s.senderName ? SENDER : { name: s.senderName, business: s.businessName, address: s.mailingAddress };
};

// ---------- where each track's data lives ----------
export const OUT_KEYS = {
  ebook: { prefix: 'p.send', leadsKey: 'p.send.emails' },
  airbnb: { prefix: 'h.airbnb.clients', leadsKey: 'h.airbnb.clients.pitch' },
  ads: { prefix: 'h.ads.clients', leadsKey: 'h.ads.clients.pitch' },
  shorts: { prefix: 'h.shorts.clients', leadsKey: 'h.shorts.clients.pitch' },
};

export function trackLeads(track) {
  if (isDemo()) return demoLeads(track);
  return liveResult(OUT_KEYS[track].leadsKey)?.leads || [];
}
export function trackInboxes(track) {
  if (isDemo()) return demoInboxes(track);
  const r = liveResult(OUT_KEYS[track].prefix + '.inboxes');
  return (r?.inboxes || []).map(ib => ({ ...ib, day: Math.min(14, Math.floor((Date.now() - (ib.addedAt || Date.now())) / 864e5) + 1), ready: (Date.now() - (ib.addedAt || 0)) > 13 * 864e5 }));
}
function campaignName(track) { return TRACKS[track].campaign; }

function fill(text, lead, track) {
  return String(text || '')
    .replaceAll('{first}', lead?.first || 'there').replaceAll('{company}', (lead?.company || '').replace(' (demo)', ''))
    .replaceAll('{pain}', 'getting started').replaceAll('{solution}', 'a free sample').replaceAll('{topic}', TRACKS[track].sells.toLowerCase());
}
function emailsFor(track) {
  const saved = state.inputs['emails:' + track];
  if (saved) return saved;
  if (!isDemo()) return liveResult(OUT_KEYS[track].prefix + '.write')?.emails || EMAILS[track];
  return EMAILS[track];
}

// ---------- 7.1 Find creators (Digital Product only) ----------
const findStep = {
  key: 'p.send.find', track: 'product', section: 'send', short: 'Find creators', title: 'Find creators',
  explain: 'A robot reads public reels and keeps only creators who pass all 4 checks.',
  mainLabel: 'Find creators', uses: ['apify'],
  replaces: 'ListKit search ($7,164 a year)', saves: '$7,164 a year', costs: 'under $1, about 7 minutes',
  demo: () => ({ rows: creatorsFound(), funnel: FUNNEL }),
  render(step) {
    const platform = view(step, 'platform', 'instagram');
    const niche = state.inputs.niche ?? 'GLP-1 protein';
    const c = state.inputs.checks || { views: 50000, min: 10000, max: 100000, sells: true, email: true };
    const inputs = `<div class="card"><div class="row wrap between">${seg('platform', [['instagram', 'Instagram'], ['tiktok', 'TikTok'], ['youtube', 'YouTube'], ['linkedin', 'LinkedIn']], platform)}
      <label class="row small" style="cursor:pointer"><input type="checkbox" data-hidenames ${state.hideNames ? 'checked' : ''} style="width:auto"> Hide names for camera</label></div>
      <div class="grid g2 mt16"><label class="field"><span class="label">Niche</span><input data-input="niche" value="${esc(niche)}"></label>
      <div class="field"><span class="label">The 4 checks</span><div class="grid g2 small" style="gap:8px">
        <label class="row">Best recent video has <input data-check="views" type="number" value="${c.views}" style="width:100px;padding:5px 8px"> views</label>
        <label class="row"><input data-check="min" type="number" value="${c.min}" style="width:90px;padding:5px 8px"> to <input data-check="max" type="number" value="${c.max}" style="width:100px;padding:5px 8px"> followers</label>
        <label class="row"><input type="checkbox" data-check="sells" ${c.sells ? 'checked' : ''} style="width:auto"> Does not sell their own product yet</label>
        <label class="row"><input type="checkbox" data-check="email" ${c.email ? 'checked' : ''} style="width:auto"> Shows a business email</label></div></div></div>
      ${platform === 'instagram' ? '<p class="tiny dim mt12">On Instagram it runs 3 robot jobs in one confirm: find reels on the topic, read the creators\' profiles, then read the last reels of the best fits.</p>' : platform === 'linkedin' ? '<p class="tiny dim mt12">LinkedIn has no follower or views data in public reels, so the views check is skipped there.</p>' : ''}</div>`;
    const d = stepData(step);
    if (!d) return inputs + '<div class="mt16">' + emptyFor(step, 'The funnel and the creators who pass will show up here.') + '</div>';
    const top = d.funnel[0].n;
    return inputs + `<div class="card mt16"><div class="card-head"><div class="h3">The funnel</div><span class="tiny dim">Opens and replies are not measured here</span></div>
      <div class="funnel">${d.funnel.map(f => `<div class="funnel-row"><span class="small">${esc(f.label)}</span><div><div class="fb" style="width:${Math.max(4, (f.n / top) * 100)}%"></div></div><b>${f.n}</b></div>`).join('')}</div></div>
      <div class="tbl-wrap mt16 ${state.hideNames ? 'blur-names' : ''}"><table class="tbl"><thead><tr><th>Creator</th><th>Platform</th><th class="num">Followers</th><th class="num">Top views</th><th>Sells</th><th>Email</th><th>Fit</th><th>Why they fit</th></tr></thead><tbody>
      ${d.rows.map(r => `<tr class="${r.pass ? '' : 'fail'}"><td><div class="ink nm">${esc(r.name)}</div><div class="tiny dim nm">${esc(r.handle)}</div></td><td>${esc(r.platform)}</td><td class="num">${short(r.followers)}</td><td class="num">${short(r.top)}</td><td>${r.sells ? pill('Yes', 'red') : pill('No', 'green')}</td><td>${r.email ? pill('Yes', 'green') : pill('No', 'grey')}</td><td style="min-width:90px">${bar(r.fit, 100, r.pass ? '' : 'o')}<span class="tiny mono">${r.fit}</span></td><td class="small">${esc(r.why)}</td></tr>`).join('')}
      </tbody></table></div>`;
  },
  bind(root, step) {
    root.querySelectorAll('[data-check]').forEach(i => i.onchange = () => {
      const c = { views: 50000, min: 10000, max: 100000, sells: true, email: true, ...(state.inputs.checks || {}) };
      c[i.dataset.check] = i.type === 'checkbox' ? i.checked : Number(i.value);
      set({ inputs: { ...state.inputs, checks: c } }, { silent: true });
    });
  },
  movie: () => {
    const rows = creatorsFound();
    return [
      { line: 'Robot 1: find reels on #glp1protein', cost: '$0.00' }, { line: 'Robot 2: read 32 creator profiles' }, { line: 'Robot 3: read the last 15 reels of 12 best fits' },
      { html: `<div class="funnel">${FUNNEL.map(f => `<div class="funnel-row"><span class="small">${esc(f.label)}</span><div><div class="fb" style="width:${(f.n / 58) * 100}%"></div></div><b>${f.n}</b></div>`).join('')}</div>`, ms: 1200 },
      { rows: { head: ['Creator', 'Followers', 'Top views', 'Fit'], rows: rows.filter(r => r.pass).map(r => [state.hideNames ? '••••••••' : r.name, short(r.followers), short(r.top), r.fit]) } },
      { line: '7 creators passed all 4 checks', ok: true },
    ];
  },
  async run(step) {
    const platform = view(step, 'platform', 'instagram');
    const niche = (state.inputs.niche || 'GLP-1 protein').trim();
    const c = { views: 50000, min: 10000, max: 100000, sells: true, email: true, ...(state.inputs.checks || {}) };
    if (platform === 'linkedin') throw new Error('LinkedIn search is not built in yet. Use Instagram, TikTok or YouTube.');
    const runCap = state.server?.settings?.apifyRunCap ?? 1;
    const ok = await approve({ title: `Find creators on ${platform}?`, intro: `Each robot run has a hard cap of ${money(runCap)}.`, lines: platform === 'instagram' ? [['Reels on the topic, 60 results', '$0.14 est.'], ['Creator profiles, up to 40', '$0.10 est.'], ['Last 15 reels of the best fits', '$0.30 est.']] : [[`${platform} videos, 60 results`, '$0.30 est.']], total: platform === 'instagram' ? 0.54 : 0.3 });
    if (!ok) return;
    let rows = [], funnel = [];
    if (platform === 'instagram') {
      const a = await robot({ robot: 'igHashtag', query: niche, count: 60, maxUsd: Math.min(runCap, 0.3), label: `Read reels about ${niche}` });
      const users = [...new Set(a.items.map(x => x.ownerUsername).filter(Boolean))].slice(0, 40);
      const b = await robot({ robot: 'igProfile', query: niche, count: users.length, extra: { usernames: users }, maxUsd: Math.min(runCap, 0.3), label: `Read ${users.length} creator profiles` });
      const inRange = b.items.filter(p => p.followersCount >= c.min && p.followersCount <= c.max);
      const best = inRange.slice(0, 12).map(p => p.username);
      const r = best.length ? await robot({ robot: 'igReels', query: niche, count: best.length * 15, extra: { usernames: best }, maxUsd: Math.min(runCap, 0.5), label: `Read the last reels of ${best.length} creators` }) : { items: [] };
      const topViews = u => Math.max(0, ...r.items.filter(x => x.ownerUsername === u).map(x => x.videoViewCount || x.videoPlayCount || 0));
      rows = b.items.map(p => {
        const top = topViews(p.username);
        const email = !!(p.businessEmail || /@/.test(p.biography || ''));
        const sells = /shop|course|ebook|stan\.store|linktr|my program/i.test((p.biography || '') + (p.externalUrl || ''));
        const pass = top >= c.views && p.followersCount >= c.min && p.followersCount <= c.max && (!c.sells || !sells) && (!c.email || email);
        return { name: p.fullName || p.username, handle: '@' + p.username, platform: 'Instagram', followers: p.followersCount || 0, top, sells, email, pass, fit: Math.round((pass ? 60 : 20) + Math.min(40, top / 5000)), why: (p.biography || '').slice(0, 90), businessEmail: p.businessEmail || null };
      }).sort((x, y) => y.pass - x.pass || y.fit - x.fit);
      funnel = [{ label: 'Reels found on the topic', n: a.items.length }, { label: 'Creator profiles read', n: b.items.length }, { label: `${short(c.min)} to ${short(c.max)} followers`, n: inRange.length }, { label: 'Last 15 reels checked', n: best.length }, { label: 'Passed all 4 checks', n: rows.filter(x => x.pass).length }];
    } else {
      const a = await robot({ robot: platform, query: niche, count: 60, maxUsd: Math.min(runCap, 0.4), label: `Read ${platform} videos about ${niche}` });
      const by = {};
      for (const v of a.items) { const u = v.authorMeta?.name || v.channelName; if (!u) continue; const views = v.playCount || v.viewCount || 0; by[u] = by[u] || { name: u, handle: '@' + u, platform, followers: v.authorMeta?.fans || v.numberOfSubscribers || 0, top: 0, sells: false, email: false }; by[u].top = Math.max(by[u].top, views); }
      rows = Object.values(by).map(r => ({ ...r, pass: r.top >= c.views && r.followers >= c.min && r.followers <= c.max, fit: Math.min(99, Math.round(r.top / 5000)), why: 'Check their channel for a business email' }));
      funnel = [{ label: 'Videos found', n: a.items.length }, { label: 'Creators', n: rows.length }, { label: 'Passed the checks', n: rows.filter(x => x.pass).length }];
    }
    setLiveResult(step.key, { rows, funnel });
  },
};

// ---------- 7.2 Get their emails ----------
const emailsStep = {
  key: 'p.send.emails', track: 'product', section: 'send', short: 'Get their emails', title: 'Get their emails',
  explain: 'AI Ark finds each person\'s email and checks it works. You only pay when it finds one.',
  mainLabel: 'Find their emails', uses: ['aiark'],
  replaces: 'ListKit emails', saves: 'Part of $7,164 a year', costs: '~$0.30 est., about 2 minutes',
  demo: () => ({ leads: demoLeads('ebook') }),
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Each lead with a checked email will show up here.');
    const ls = d.leads;
    const v = ls.filter(l => l.emailStatus === 'Verified').length;
    return `<div class="grid g4" style="margin-bottom:16px"><div class="stat g"><b>${v}</b><span>Verified</span></div><div class="stat o"><b>${ls.filter(l => l.emailStatus === 'Risky and skipped').length}</b><span>Risky and skipped</span></div><div class="stat"><b>${ls.filter(l => l.emailStatus === 'Not found').length}</b><span>Not found</span></div><div class="stat p"><b>${v}</b><span>Credits used</span></div></div>
      <div class="note small" style="margin-bottom:12px">${icon('shield', 'style="width:14px;vertical-align:-2px"')} Bad emails are dropped. The app never guesses an email address.</div>
      <div class="tbl-wrap ${state.hideNames ? 'blur-names' : ''}"><table class="tbl"><thead><tr><th>Lead</th><th>Email</th><th>Status</th><th>Where it came from</th></tr></thead><tbody>
      ${ls.map(l => `<tr class="${l.email ? '' : 'fail'}"><td><div class="ink nm">${esc(l.name)}</div><div class="tiny dim nm">${esc(l.company)}</div></td><td class="mono small nm">${l.email ? esc(l.email) : 'No email found'}</td><td>${pill(l.emailStatus, l.emailStatus === 'Verified' ? 'green' : l.emailStatus === 'Not found' ? 'grey' : 'orange')}</td><td class="small">${esc(l.source)}</td></tr>`).join('')}</tbody></table></div>`;
  },
  movie: () => {
    const ls = demoLeads('ebook');
    return [{ line: `AI Ark: looking up ${ls.length} leads` }, { rows: { head: ['Lead', 'Email', 'Status'], rows: ls.slice(0, 12).map(l => [state.hideNames ? '••••••' : l.name, l.email ? (state.hideNames ? '•••@•••.example' : l.email) : 'No email found', { html: pill(l.emailStatus, l.emailStatus === 'Verified' ? 'green' : 'orange') }]) }, ms: 140 }, { stats: [['Verified', ls.filter(l => l.email).length], ['Not found', 2], ['Risky, skipped', 2], ['Credits', ls.filter(l => l.email).length]] }];
  },
  async run(step) {
    const found = liveResult('p.send.find')?.rows?.filter(r => r.pass) || [];
    if (!found.length) throw new Error('Run Find creators first.');
    const ok = await approve({ title: `Find emails for ${found.length} creators?`, intro: '1 credit per verified email, 0 if none is found.', lines: [['Most it can cost', `${found.length} credits`]], total: found.length * 0.03 });
    if (!ok) return;
    const t = await token('spend', found.length * 0.03, 'AI Ark emails');
    const r = await api('aiark/find', { leads: found.map((f, i) => ({ id: String(i), name: f.name, company: f.handle })), confirmToken: t });
    const leads = found.map((f, i) => {
      const x = r.results.find(y => y.id === String(i)) || {};
      const email = x.email || f.businessEmail || null;
      return { id: 'ebook-' + i, first: (f.name || '').split(' ')[0], name: f.name, company: f.handle, email, emailStatus: email ? 'Verified' : (x.status || 'Not found'), source: x.email ? 'AI Ark' : f.businessEmail ? 'Business email on profile' : 'AI Ark' };
    });
    log(`AI Ark found ${leads.filter(l => l.email).length} checked emails`, { icon: 'mail', run: true, tool: 'aiark' });
    setLiveResult(step.key, { leads });
  },
};

// ---------- 7.3 Set up inboxes ----------
function inboxesStep(track, prefix, section, trackKey) {
  const t = TRACKS[track];
  const key = prefix + '.inboxes';
  return {
    key, track: trackKey, section, short: 'Set up inboxes', title: 'Set up inboxes', outTrack: track,
    explain: 'Never email from your main domain. The app buys domains made from your business name, makes 2 inboxes on each and warms them up for 14 days.',
    mainLabel: () => view({ key }, 'way', 'buy') === 'buy' ? 'Check 6 names' : 'Load my inboxes', uses: ['spaceship', 'scaledmail', 'instantly'],
    replaces: 'Sending from your main email', saves: 'Your main domain\'s reputation', costs: '$7 a month a domain',
    demo: () => ({ domains: domainBoard(track), inboxes: demoInboxes(track) }),
    render(step) {
      const way = view(step, 'way', 'buy');
      const d = stepData(step) || { domains: [], inboxes: [] };
      const stage = view(step, 'stage', isDemo() ? 4 : 1);
      const biz = state.inputs['biz:' + track] ?? (isDemo() ? t.business : (state.server?.settings?.businessName || ''));
      const base = slug(biz).replace(/-/g, '');
      const names = base ? [`${base}agency.com`, `get${base}.com`, `${base}hq.com`, `try${base}.com`, `hello${base}.com`, `team${base}.com`] : [];
      const checked = d.checked || (isDemo() ? t.domains.map(x => ({ domain: x, available: true, price: 10.98 })) : []);
      const doms = d.domains || [];
      const ibs = isDemo() ? demoInboxes(track) : trackInboxes(track);
      const stageCard = (n, title, done, body) => `<div class="stage ${done ? 'done' : ''} ${stage === n ? 'open' : ''}"><button class="stage-h" data-stage="${n}"><span class="n">${done ? '✓' : n}</span><b class="ink">${esc(title)}</b>${done ? pill('Done', 'green') : ''}</button>${stage === n ? `<div class="stage-b">${body}</div>` : ''}</div>`;
      const buy = `
        ${stageCard(1, 'Pick domains (Spaceship)', doms.length > 0, `
          <label class="field"><span class="label">Your business name</span><input data-input="biz:${track}" value="${esc(biz)}" placeholder="Your business name"></label>
          <div class="row wrap mt8">${names.map(n => `<span class="pill no-dot mono">${esc(n)}</span>`).join('')}</div>
          <div class="btns mt12"><button class="btn" data-dom-check>Check 6 names (free)</button></div>
          ${checked.length ? `<div class="tbl-wrap mt12"><table class="tbl"><thead><tr><th></th><th>Domain</th><th>Status</th><th class="num">Price a year</th></tr></thead><tbody>${checked.map(c => `<tr><td><input type="checkbox" data-dom-pick="${esc(c.domain)}" ${c.available ? '' : 'disabled'} ${isDemo() || (d.picked || []).includes(c.domain) ? 'checked' : ''} style="width:auto"></td><td class="mono">${esc(c.domain)}</td><td>${c.available ? pill('Available', 'green') : pill('Taken', 'grey')}</td><td class="num">${c.price ? money(c.price) : 'about $11 est.'}</td></tr>`).join('')}</tbody></table></div>
          <div class="btns mt12"><button class="btn money" data-dom-buy>Buy the ticked domains</button></div>` : ''}`)}
        ${stageCard(2, 'Make inboxes (ScaledMail)', doms.length > 0 && doms.every(x => x.inboxes), `
          <p class="small">2 Google inboxes per domain with real looking names, about $3.50 an inbox a month. One domain at a time, each with its own yes.</p>
          ${doms.map(x => `<div class="row between mt8"><span class="mono small">${esc(x.domain)}</span>${x.inboxes ? pill('alex@ and sam@ made', 'green') : `<button class="btn sm" data-ib-make="${esc(x.domain)}">Make 2 inboxes</button>`}</div>`).join('') || '<p class="dim small">Buy domains first.</p>'}`)}
        ${stageCard(3, 'Connect domains (DNS)', doms.length > 0 && doms.every(x => x.dns), `
          ${(doms[0] ? [doms[0]] : []).map(x => `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>What it does</th><th>Record</th><th>Name</th><th>Value</th><th>Status</th></tr></thead><tbody>${dnsRecords(x.domain).map(r => `<tr><td class="ink">${esc(r.what)}</td><td class="small">${esc(r.tech)}</td><td class="mono small">${esc(r.name)}</td><td class="mono tiny" style="max-width:240px;word-break:break-all">${esc(r.value)}</td><td>${pill(isDemo() || x.dns ? 'Verified' : x.dnsWritten ? 'Added' : 'Pending', isDemo() || x.dns ? 'green' : x.dnsWritten ? 'orange' : 'grey')}</td></tr>`).join('')}</tbody></table></div>`).join('')}
          <p class="tiny dim mt8">Showing the first domain. The same 4 records go on every domain. The DKIM value comes from ScaledMail.</p>
          <div class="btns mt12"><button class="btn" data-dns-write>Write records</button><button class="btn" data-dns-check>Check now (free)</button></div>`)}
        ${stageCard(4, 'Add to Instantly', ibs.length > 0, `
          <p class="small">The inboxes move into Instantly without the password ever showing on screen. The app checks Instantly first and skips any inbox already there. Warmup stays on.</p>
          <label class="row small mt8">Daily cap per inbox <input type="number" value="${cap()}" style="width:80px;padding:5px 8px" data-dailycap> emails a day</label>
          <div class="btns mt12"><button class="btn main" data-ib-instantly>Add to Instantly</button></div>`)}`;
      const have = `<div class="card"><div class="h3">Use inboxes I have</div>
        <p class="small mt8">Load them from your ScaledMail workspace (the app reads every workspace for free and picks the one with the most inboxes), or paste a list.</p>
        <div class="btns"><button class="btn" data-ib-load>Load from ScaledMail</button></div>
        <label class="field mt12"><span class="label">Or paste one inbox per line, or drop a CSV file here</span><textarea data-ib-paste placeholder="alex@yourdomain.com">${esc((d.pasted || []).join('\n'))}</textarea></label>
        <div class="btns mt12"><button class="btn main" data-ib-instantly>Add to Instantly</button></div></div>`;
      return `<div class="row" style="margin-bottom:14px">${seg('way', [['buy', 'Buy new'], ['have', 'Use inboxes I have']], way)}</div>
        <div class="split"><div>${way === 'buy' ? buy : have}</div>${board(track, step)}</div>`;
    },
    bind(root, step) {
      root.querySelectorAll('[data-stage]').forEach(b => b.onclick = () => setView(step, 'stage', Number(b.dataset.stage)));
      root.querySelector('[data-dailycap]')?.addEventListener('change', e => { if (!isDemo()) api('settings', { patch: { dailyCapPerInbox: Number(e.target.value) } }).then(() => toast('Saved')); else toast('Saved (demo)'); });
      const live = fn => async e => { if (isDemo()) { toast('Demo: this is already done. Switch to Live to do it for real.'); return; } const btn = e.currentTarget; btn.classList.add('running'); try { await fn(btn); } catch (err) { toast(err.message, 'err'); } finally { btn.classList.remove('running'); } };
      const cur = () => liveResult(step.key) || { domains: [], checked: [], inboxes: [] };
      root.querySelector('[data-dom-check]')?.addEventListener('click', live(async () => {
        const biz = slug(state.inputs['biz:' + track] || '').replace(/-/g, '');
        if (!biz) throw new Error('Type your business name first.');
        const names = [`${biz}agency.com`, `get${biz}.com`, `${biz}hq.com`, `try${biz}.com`, `hello${biz}.com`, `team${biz}.com`];
        const r = await api('spaceship/check', { domains: names });
        log(`Checked ${names.length} domain names (free)`, { icon: 'globe', cost: 0 });
        setLiveResult(step.key, { ...cur(), checked: r.domains });
      }));
      root.querySelector('[data-dom-buy]')?.addEventListener('click', live(async () => {
        const picks = [...root.querySelectorAll('[data-dom-pick]:checked')].map(x => x.dataset.domPick);
        if (!picks.length) throw new Error('Tick at least one domain.');
        const prices = picks.map(p => (cur().checked.find(c => c.domain === p)?.price) || 11);
        const total = prices.reduce((a, b) => a + b, 0);
        const ok = await approve({ title: `Buy ${picks.length} domains?`, lines: picks.map((p, i) => [p, money(prices[i]) + ' a year']), total, yes: 'Yes, buy them' });
        if (!ok) return;
        const tk = await token('spend', total, 'domains');
        const r = await api('spaceship/buy', { domains: picks, confirmToken: tk });
        const bought = r.results.filter(x => x.ok).map(x => ({ domain: x.domain, bought: true }));
        log(`Bought ${bought.length} domains on Spaceship`, { icon: 'globe', cost: total, tool: 'spaceship' });
        setLiveResult(step.key, { ...cur(), domains: [...(cur().domains || []), ...bought] });
        setView(step, 'stage', 2);
      }));
      root.querySelectorAll('[data-ib-make]').forEach(b => b.addEventListener('click', live(async () => {
        const domain = b.dataset.ibMake;
        const ok = await approve({ title: `Make 2 inboxes on ${domain}?`, lines: [[`alex@${domain}`, '$3.50 a month'], [`sam@${domain}`, '$3.50 a month']], total: 7, totalLabel: 'Total a month' });
        if (!ok) return;
        const tk = await token('spend', 7, 'inboxes');
        const r = await api('scaledmail/inboxes', { domain, names: [{ first: 'Alex', last: 'Reed', user: 'alex' }, { first: 'Sam', last: 'Hart', user: 'sam' }], confirmToken: tk });
        log(`Ordered 2 inboxes on ${domain}`, { icon: 'mail', cost: 7, tool: 'scaledmail' });
        setLiveResult(step.key, { ...cur(), domains: cur().domains.map(x => x.domain === domain ? { ...x, inboxes: true, dkim: r.dkim } : x) });
      })));
      root.querySelector('[data-dns-write]')?.addEventListener('click', live(async () => {
        const ok = await approve({ kind: 'publish', title: 'Write DNS records?', intro: 'The app saves the 4 mail records on each domain at Spaceship.', lines: cur().domains.map(x => [x.domain, '4 records']), total: '$0' });
        if (!ok) return;
        for (const x of cur().domains) {
          const tk = await token('publish', 0, 'dns');
          const recs = dnsRecords(x.domain).map(r => ({ type: r.tech.startsWith('MX') ? 'MX' : 'TXT', name: r.name, value: r.tech.startsWith('DKIM') ? (x.dkim || '') : r.value, priority: 1 })).filter(r => r.value);
          await api('spaceship/dns', { domain: x.domain, records: recs, confirmToken: tk });
        }
        log('Wrote DNS records', { icon: 'globe', cost: 0, tool: 'spaceship' });
        setLiveResult(step.key, { ...cur(), domains: cur().domains.map(x => ({ ...x, dnsWritten: true })) });
      }));
      root.querySelector('[data-dns-check]')?.addEventListener('click', live(async () => {
        const out = [];
        for (const x of cur().domains) { const r = await api('dns/check', { domain: x.domain }); out.push({ ...x, dns: r.mx && r.spf && r.dmarc && r.dkim, dnsDetail: r }); }
        log('Checked DNS records (free)', { icon: 'search', cost: 0 });
        setLiveResult(step.key, { ...cur(), domains: out });
      }));
      root.querySelector('[data-ib-load]')?.addEventListener('click', live(async () => {
        const r = await api('scaledmail/workspaces', {});
        const best = [...r.workspaces].sort((a, b) => b.inboxes - a.inboxes)[0];
        if (!best) throw new Error('No ScaledMail workspaces found.');
        toast(`Picked "${best.name}" with ${best.inboxes} inboxes`);
        setLiveResult(step.key, { ...cur(), workspace: best.id });
      }));
      root.querySelectorAll('[data-ib-instantly]').forEach(b => b.addEventListener('click', live(async () => {
        const pasted = (root.querySelector('[data-ib-paste]')?.value || '').split(/[\s,;]+/).filter(x => /@/.test(x)).map(x => x.toLowerCase());
        const ok = await approve({ kind: 'publish', title: 'Add inboxes to Instantly?', intro: 'Passwords go straight from ScaledMail to Instantly and are never shown here. Inboxes already in Instantly are skipped. Warmup stays on.', lines: [['Daily cap per inbox', cap() + ' emails']], total: '$0' });
        if (!ok) return;
        const tk = await token('publish', 0, 'instantly import');
        const r = await api('instantly/import', { workspace: cur().workspace, only: pasted.length ? pasted : undefined, confirmToken: tk });
        const added = r.results.filter(x => /Added|Already/.test(x.status)).map(x => ({ email: x.email, name: x.email.split('@')[0], domain: x.email.split('@')[1], addedAt: Date.now() }));
        log(`Added ${added.length} inboxes to Instantly, warmup on`, { icon: 'mail', cost: 0, tool: 'instantly' });
        setLiveResult(step.key, { ...cur(), inboxes: [...(cur().inboxes || []), ...added], domains: cur().domains.map(x => ({ ...x, instantly: added.some(a => a.domain === x.domain) })) });
      })));
      const drop = root.querySelector('[data-ib-paste]');
      drop?.addEventListener('dragover', e => e.preventDefault());
      drop?.addEventListener('drop', async e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { drop.value = (await f.text()).split(/[\r\n]+/).map(l => l.split(',').find(c => c.includes('@')) || '').filter(Boolean).join('\n'); toast('CSV loaded'); } });
    },
    movie: () => [
      { line: 'Spaceship: checking 6 names (free)' },
      ...t.domains.map(d => ({ line: `${d}: available, $10.98 a year`, ok: true, ms: 180 })),
      { line: `ScaledMail: making ${t.domains.length * 2} Google inboxes` },
      { line: 'DNS: mail server, SPF, DMARC, DKIM written and verified', ok: true },
      { line: `Instantly: ${t.domains.length * 2} inboxes added, warmup on, ${cap()} a day each`, ok: true },
      { html: rampSvg(), ms: 900 },
    ],
    async run(step) { const b = document.querySelector('[data-dom-check]') || document.querySelector('[data-ib-load]'); if (b) b.click(); },
  };
}

function rampSvg() {
  const pts = Array.from({ length: 22 }, (_, i) => Math.min(25, 1 + Math.round(i * 1.2)));
  const w = 520, h = 130;
  const path = pts.map((v, i) => `${i ? 'L' : 'M'}${(i / 21) * (w - 30) + 24},${h - 18 - (v / 25) * (h - 30)}`).join(' ');
  return `<svg class="ramp" viewBox="0 0 ${w} ${h}" role="img" aria-label="Warmup ramp from 1 to 25 emails a day over about 3 weeks">
    <line x1="24" y1="${h - 18}" x2="${w - 6}" y2="${h - 18}" stroke="var(--line-2)"/><text x="0" y="${h - 14}" fill="var(--dim)" font-size="10" font-family="var(--mono)">1</text><text x="0" y="16" fill="var(--dim)" font-size="10" font-family="var(--mono)">25</text>
    <path d="${path} L${w - 6},${h - 18} L24,${h - 18}Z" fill="rgba(91,46,232,.18)"/><path d="${path}" fill="none" stroke="var(--purple-2)" stroke-width="2.5"/>
    <text x="${w - 6}" y="${h - 4}" text-anchor="end" fill="var(--dim)" font-size="10">about 3 weeks</text></svg>`;
}

function board(track, step) {
  const d = isDemo() ? { domains: domainBoard(track) } : (liveResult(step.key) || { domains: [] });
  const ibs = trackInboxes(track);
  const tick = on => `<span class="tk ${on ? 'on' : ''}">${on ? icon('check') : ''}</span>`;
  const doms = d.domains || [];
  const todo = !doms.length ? ['Type your business name and check 6 names', 'Tick the ones to buy'] : doms.some(x => !x.inboxes) ? ['Make 2 inboxes on each domain'] : doms.some(x => !x.dns) ? ['Write the DNS records', 'Press Check now'] : ibs.length === 0 ? ['Add the inboxes to Instantly'] : ibs.some(x => !x.ready) ? ['Wait for warmup to finish', 'Write your emails meanwhile'] : ['All set. Write the emails next'];
  return `<div class="card" style="position:sticky;top:10px"><div class="card-head"><div class="h3"><span class="live-dot"></span>Live board</div></div>
    <div class="board-dom tiny dim" style="border-bottom:1px solid var(--line-2)"><span>Domain</span><span>Buy</span><span>Inb</span><span>DNS</span><span>Inst</span><span>Warm</span></div>
    ${doms.map(x => `<div class="board-dom"><span class="mono" style="font-size:12px;overflow:hidden;text-overflow:ellipsis">${esc(x.domain)}</span>${tick(x.bought)}${tick(x.inboxes)}${tick(x.dns)}${tick(x.instantly)}${tick(x.warm || (isDemo()))}</div>`).join('') || '<p class="small dim mt8">No domains yet.</p>'}
    <div class="grid g3 mt12" style="gap:8px"><div class="stat" style="padding:10px"><b style="font-size:20px">${doms.length}</b><span>Domains</span></div><div class="stat" style="padding:10px"><b style="font-size:20px">${ibs.length}</b><span>Inboxes</span></div><div class="stat o" style="padding:10px"><b style="font-size:20px">${ibs.length * cap()}</b><span>Emails a day</span></div></div>
    <div class="mt12">${rampSvg()}</div>
    ${ibs.length ? `<div class="mt8">${ibs.slice(0, 6).map(i => `<div class="row between tiny"><span class="mono">${esc(i.email)}</span><span class="${i.ready ? 'green' : 'peach'}">${i.ready ? 'Ready' : `Day ${i.day} of 14`}</span></div>`).join('')}${ibs.length > 6 ? `<div class="tiny dim">and ${ibs.length - 6} more</div>` : ''}</div>` : ''}
    <div class="note o mt12 small"><b class="peach">Do this now:</b><ul style="margin:6px 0 0;padding-left:18px">${todo.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>`;
}

// ---------- 7.4 Write the emails ----------
function writeStep(track, prefix, section, trackKey) {
  const key = prefix + '.write';
  return {
    key, track: trackKey, section, short: 'Write the emails', title: 'Write the emails', outTrack: track,
    explain: 'A short, honest set of emails. It is always made as a draft. Sending needs a second yes.',
    mainLabel: 'Write again', uses: ['claude', 'instantly'],
    replaces: 'ListKit email writer', saves: 'A copywriter, part of $7,164 a year', costs: '~$0.05 est., about 2 minutes',
    demo: () => ({ emails: EMAILS[track] }),
    liveDone: () => !!state.inputs['emails:' + track],
    render(step) {
      const tab = view(step, 'tab', 0);
      const ems = emailsFor(track);
      const ls = trackLeads(track).filter(l => l.email);
      const ib = trackInboxes(track);
      const lead = ls[view(step, 'lead', 0)] || ls[0];
      const from = ib[0];
      const camp = campState(track);
      const e = ems[tab] || ems[0];
      const s = sender();
      return `<div class="split">
        <div>
          ${tabs('tab', [[0, 'Email 1 . Day 0'], [1, 'Email 2 . Day 3']].map(([v, l]) => [v, l]), tab)}
          <div class="email-prev">
            <div class="eh">
              <div><span>From</span><span class="mono">${from ? esc(`${from.name} <${from.email}>`) : '<i>Add inboxes first</i>'}</span></div>
              <div><span>To</span><span>${lead ? `<select data-leadpick style="background:transparent;color:inherit;border:1px solid #e2e0ec;padding:3px 6px;border-radius:6px;width:auto">${ls.map((l, i) => `<option value="${i}" ${l === lead ? 'selected' : ''}>${esc(l.name)} &lt;${esc(l.email)}&gt;</option>`).join('')}</select>` : '<i>Get leads first</i>'}</span></div>
              <div><span>Subject</span><input data-em-subject value="${esc(fill(e.subject, lead, track))}" aria-label="Subject"></div>
            </div>
            <div class="eb"><textarea data-em-body aria-label="Email body">${esc(fill(e.body, lead, track))}</textarea></div>
            <div class="foot" style="white-space:pre-wrap">${esc(`${s.name}\n${s.business}\n${s.address}\n\nNot for you? Just reply "no thanks" and I will not email again.`)}</div>
          </div>
          <p class="tiny dim mt8">The first name fills itself in. Every email ends with your real name, business, mailing address and an easy way to say no.${!isDemo() && !state.server?.settings?.mailingAddress ? ' <b class="red">Add your sender details in Settings first.</b>' : ''}</p>
          <div class="btns mt12"><button class="btn sm" data-em-save>${icon('check')}Save edits</button><button class="btn sm" data-em-test>${icon('send')}Send a test email</button></div>
        </div>
        <div class="stack">
          <div class="card"><div class="h3">Then, in order</div>
            ${[['draft', 'Make the draft', 'Creates the campaign in Instantly, paused. Nothing sends.'], ['leads', 'Add leads', `Adds ${ls.length} checked leads to it.`], ['send', 'Start sending', 'Real emails to real people. Weekdays, 9am to 5pm.']].map(([k, l, h], i) => {
              const done = camp[k]; const ready = i === 0 || camp[['draft', 'leads'][i - 1]];
              return `<div class="row mt12" style="align-items:flex-start"><span class="n mono" style="width:24px;height:24px;border-radius:8px;display:grid;place-items:center;flex:none;background:${done ? 'var(--green-bg)' : ready ? 'var(--purple)' : 'var(--card-3)'};color:${done ? 'var(--green)' : ready ? '#fff' : 'var(--dim)'}">${done ? '✓' : i + 1}</span>
                <div style="flex:1"><button class="btn sm ${done ? '' : ready ? (k === 'send' ? 'money next-pulse' : 'main next-pulse') : ''}" data-camp="${k}" ${!ready || done ? 'disabled' : ''}>${done ? l + ': done' : l}</button><div class="tiny dim mt8">${esc(h)}</div></div></div>`; }).join('')}
          </div>
          <div class="card"><div class="h3">Starter templates</div>${TEMPLATES.map((tp, i) => `<div class="row between mt12" style="align-items:flex-start"><div><b class="ink small">${i + 1}. ${esc(tp.name)}</b><div class="tiny dim">${esc(tp.hint)}</div></div><button class="btn sm" data-tpl="${i}">Use this</button></div>`).join('')}</div>
        </div></div>`;
    },
    bind(root, step) {
      root.querySelector('[data-leadpick]')?.addEventListener('change', e => setView(step, 'lead', Number(e.target.value)));
      const save = () => {
        const tab = view(step, 'tab', 0);
        const ems = emailsFor(track).map(x => ({ ...x }));
        const lead = trackLeads(track).filter(l => l.email)[view(step, 'lead', 0)];
        const unfill = s => lead ? s.replaceAll(lead.first, '{first}') : s;
        ems[tab] = { subject: unfill(root.querySelector('[data-em-subject]').value), body: unfill(root.querySelector('[data-em-body]').value) };
        set({ inputs: { ...state.inputs, ['emails:' + track]: ems } }, { silent: true });
        return ems;
      };
      root.querySelector('[data-em-save]')?.addEventListener('click', () => { save(); toast('Saved'); refresh(); });
      root.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => {
        const tp = TEMPLATES[Number(b.dataset.tpl)];
        const ems = emailsFor(track).map(x => ({ ...x }));
        ems[view(step, 'tab', 0)] = { subject: ems[view(step, 'tab', 0)].subject, body: tp.body };
        set({ inputs: { ...state.inputs, ['emails:' + track]: ems } });
        toast('Template added. Edit it to fit.');
      });
      root.querySelector('[data-em-test]')?.addEventListener('click', async () => {
        const to = await confirmBox({ title: 'Send a test email?', intro: 'It goes to one address you type, never to leads.', input: { label: 'Send the test to', type: 'email', placeholder: 'you@yourbusiness.com' }, yes: 'Send the test', yesCls: 'money' });
        if (!to) { toast('Cancelled. Nothing was sent.'); return; }
        if (isDemo()) { log(`Test email sent to ${to} (demo, nothing sent)`, { icon: 'send', cost: 0 }); toast('Demo: test email shown as sent. Nothing left this computer.'); return; }
        try { const tk = await token('send', 0, 'test'); await api('instantly/test-email', { to, from: trackInboxes(track)[0]?.email, subject: root.querySelector('[data-em-subject]').value, body: root.querySelector('[data-em-body]').value + footer(track), confirmToken: tk }); log(`Test email sent to ${to}`, { icon: 'send' }); toast('Test sent'); } catch (e) { toast(e.message, 'err'); }
      });
      root.querySelectorAll('[data-camp]').forEach(b => b.onclick = async () => {
        const k = b.dataset.camp;
        const ems = save();
        const ls = trackLeads(track).filter(l => l.email);
        const ibs = trackInboxes(track);
        const c = campState(track);
        b.classList.add('running');
        try {
          if (k === 'draft') {
            const ok = await approve({ kind: 'publish', title: 'Make the draft campaign?', intro: `"${campaignName(track)}" is created in Instantly, paused. Nothing sends.`, lines: [['Emails', '2 (day 0 and day 3)'], ['Sending inboxes', String(ibs.length)]], total: '$0' });
            if (!ok) return;
            if (!isDemo()) { const tk = await token('publish', 0, 'campaign'); const r = await api('instantly/campaign', { name: campaignName(track), emails: ems.map(e => ({ subject: e.subject, body: e.body.replaceAll('{first}', '{{firstName}}') + footer(track) })), inboxes: ibs.map(i => i.email), confirmToken: tk }); c.id = r.id; c.url = r.url; }
            c.draft = true; log(`Made the draft "${campaignName(track)}", paused`, { icon: 'mail', cost: 0, tool: 'instantly' });
          } else if (k === 'leads') {
            const ok = await approve({ kind: 'publish', title: `Add ${ls.length} leads?`, intro: 'Only checked emails are added. Nothing sends yet.', lines: [['Leads with a checked email', String(ls.length)]], total: '$0' });
            if (!ok) return;
            if (!isDemo()) { const tk = await token('publish', 0, 'leads'); await api('instantly/leads', { campaignId: c.id, leads: ls.map(l => ({ email: l.email, firstName: l.first, company: l.company })), confirmToken: tk }); }
            c.leads = true; log(`Added ${ls.length} leads to "${campaignName(track)}"`, { icon: 'users', cost: 0, tool: 'instantly' });
          } else {
            const ok = await confirmBox({ title: 'Start sending?', serious: 'Real emails go to real people. Read every email first.', lines: [['Leads', String(ls.length)], ['Sends', 'Weekdays, 9am to 5pm'], ['Daily cap', `${ibs.length * cap()} (${ibs.length} inboxes x ${cap()})`]], yes: 'Yes, start sending', yesCls: 'money' });
            if (!ok) { toast('Cancelled. Nothing was sent.'); return; }
            if (!isDemo()) { const tk = await token('send', 0, 'activate'); await api('instantly/activate', { campaignId: c.id, confirmToken: tk }); }
            c.send = true; c.status = 'Sending';
            log(`Started sending "${campaignName(track)}"${isDemo() ? ' (demo)' : ''}`, { icon: 'send', cost: 0, tool: 'instantly' });
            if (isDemo()) restartSim(track);
          }
          saveCamp(track, c);
        } catch (e) { toast(e.message, 'err'); } finally { b.classList.remove('running'); }
      });
    },
    movie: () => [{ line: 'Reading your leads and offer' }, { type: fill(EMAILS[track][0].subject, demoLeads(track)[0], track), title: 'Email 1 subject', ms: 600 }, { type: fill(EMAILS[track][0].body, demoLeads(track)[0], track), title: 'Email 1 . Day 0', ms: 2200 }, { type: fill(EMAILS[track][1].body, demoLeads(track)[0], track), title: 'Email 2 . Day 3', ms: 900 }, { line: 'Saved as a draft. Nothing sends without a second yes.', ok: true }],
    async run(step) {
      const ok = await approve({ title: 'Write the emails again?', lines: [['Claude writes a fresh set of 2 emails', '$0.05 est.']], total: 0.05 });
      if (!ok) return;
      const t = TRACKS[track];
      const ls = trackLeads(track).filter(l => l.email);
      const { data } = await claudeJSON({ model: state.stepModel[step.key], maxTokens: 1500, label: `Claude wrote fresh emails for "${t.campaign}"`,
        system: 'Short, honest cold emails. One real detail about them, who you are in one line, the free offer, a simple yes. No pressure, no fake urgency, no invented facts. Use {first} for the first name and {company} for the company. Do not add a signature or footer.',
        prompt: `Selling: ${t.sells}. Business: ${sender().business || t.business}. A lead: ${JSON.stringify(ls[0] || {})}. Current emails: ${JSON.stringify(emailsFor(track))}. Return {"emails":[{"subject","body"} for day 0, {"subject","body"} for a short kind check in on day 3]}` });
      set({ inputs: { ...state.inputs, ['emails:' + track]: data.emails } });
      setLiveResult(step.key, { emails: data.emails });
    },
  };
}

// campaign progress (draft, leads, send) per track
export function campState(track) {
  if (isDemo()) return state.ui['camp:' + track] || { draft: true, leads: true, send: true, status: 'Sending', id: 'demo_campaign_' + track, url: 'https://app.instantly.ai/app/campaigns' };
  return liveResult('camp:' + track) || { draft: false, leads: false, send: false, status: 'Draft' };
}
function saveCamp(track, c) {
  if (isDemo()) { state.ui['camp:' + track] = { ...c }; refresh(); }
  else setLiveResult('camp:' + track, { ...c });
}

// ---------- 7.5 Send and track: the demo send plays out over about 15 seconds ----------
export function simOf(track) {
  if (!state.sends[track]) state.sends[track] = { t: timeline(track).duration, playing: false, paused: false };
  return state.sends[track];
}
export function restartSim(track) { state.sends[track] = { t: 0, playing: true, paused: false }; ensureTicker(); refresh(); }
let ticker = null;
function ensureTicker() {
  if (ticker) return;
  ticker = setInterval(() => {
    let any = false;
    for (const [track, s] of Object.entries(state.sends)) {
      if (!s.playing || s.paused) continue;
      any = true;
      const tl = timeline(track);
      const before = s.t;
      s.t = Math.min(tl.duration, s.t + 0.1);
      const fresh = tl.events.filter(e => e.t > before && e.t <= s.t);
      if (fresh.some(e => e.kind === 'reply')) emit();
      if (s.t >= tl.duration) { s.playing = false; const c = campState(track); c.status = 'Done'; if (isDemo()) state.ui['camp:' + track] = c; emit(); }
      updateSimDom(track);
    }
    if (!any) { clearInterval(ticker); ticker = null; }
  }, 100);
}
export function simCounts(track) {
  const s = simOf(track); const tl = timeline(track);
  const past = tl.events.filter(e => e.t <= s.t);
  const sent = past.filter(e => e.kind === 'sent').length;
  const bounced = past.filter(e => e.kind === 'bounce').length;
  return { sent, delivered: sent - bounced, opened: past.filter(e => e.kind === 'open').length, replied: past.filter(e => e.kind === 'reply').length, bounced, total: tl.total, log: past.slice().reverse(), t: s.t };
}
function updateSimDom(track) {
  const root = document.querySelector(`[data-sim="${track}"]`);
  if (!root) return;
  const c = simCounts(track);
  for (const k of ['sent', 'delivered', 'opened', 'replied', 'bounced']) { const el = root.querySelector(`[data-n="${k}"]`); if (el) el.textContent = c[k]; }
  root.querySelector('[data-prog]').style.width = (c.sent / c.total) * 100 + '%';
  root.querySelector('[data-progtext]').textContent = `${c.sent} of ${c.total} sent`;
  root.querySelector('[data-sendlog]').innerHTML = sendLogHtml(c.log);
  const ibs = trackInboxes(track);
  ibs.forEach((ib, i) => { const m = root.querySelector(`[data-meter="${i}"]`); if (m) { const n = Math.min(cap(), Math.ceil(c.sent / ibs.length) + (i < c.sent % ibs.length ? 1 : 0)); m.querySelector('i').style.width = (n / cap()) * 100 + '%'; m.querySelector('[data-mn]').textContent = `${n} / ${cap()} today`; } });
  const st = root.querySelector('[data-status]'); if (st) st.innerHTML = statusPill(campState(track).status, simOf(track));
}
function statusPill(status, s) {
  if (s.paused) return pill('Paused', 'orange');
  return pill(status, status === 'Sending' ? 'green' : status === 'Done' ? 'purple' : status === 'Paused' ? 'orange' : 'grey');
}
function sendLogHtml(events) {
  const ic = { sent: '→', open: '◉', reply: '✉', bounce: '✕' };
  return events.slice(0, 40).map(e => `<div><span class="t">${(e.t).toFixed(1)}s</span><span class="${e.kind === 'reply' ? 'green' : e.kind === 'bounce' ? 'red' : e.kind === 'open' ? 'lilac' : ''}">${ic[e.kind]}</span><span>${esc(e.text)}</span></div>`).join('') || '<div class="dim">Nothing sent yet.</div>';
}

function trackStep(track, prefix, section, trackKey) {
  return {
    key: prefix + '.track', track: trackKey, section, short: 'Send and track', title: 'Send and track', outTrack: track,
    explain: 'Watch the campaign go out. Pausing freezes every number. Resuming carries on from where it stopped.',
    mainLabel: () => isDemo() ? 'Replay the send' : 'Refresh numbers', uses: ['instantly'], demoMain: true,
    replaces: 'Sending one by one by hand', saves: 'Hours every week', costs: 'Your Instantly plan',
    demo: () => ({}),
    liveDone: () => !!campState(track).send,
    render(step) {
      const c = campState(track);
      const ibs = trackInboxes(track);
      if (!isDemo()) {
        const a = liveResult(step.key);
        if (!c.send) return emptyFor(step, 'Start sending in Write the emails first. Then the numbers show up here.');
        return campaignCard(track, c, ibs, null) + (a ? `<div class="grid g5 mt16">${[['Sent', a.sent], ['Delivered', a.sent - a.bounced], ['Opened', a.opened], ['Replied', a.replied], ['Bounced', a.bounced]].map(([l, v]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>` : '<p class="dim mt16">Press Refresh numbers to read them from Instantly.</p>');
      }
      const s = simOf(track); const n = simCounts(track);
      return `<div data-sim="${track}">${campaignCard(track, c, ibs, s)}
        <div class="grid g5 mt16">${[['sent', 'Sent', ''], ['delivered', 'Delivered', ''], ['opened', 'Opened', 'p'], ['replied', 'Replied', 'g'], ['bounced', 'Bounced', 'o']].map(([k, l, tone]) => `<div class="stat ${tone}"><b data-n="${k}">${n[k]}</b><span>${l}</span></div>`).join('')}</div>
        <div class="card mt16"><div class="row between"><b class="ink" data-progtext>${n.sent} of ${n.total} sent</b><span class="tiny dim">Demo send plays the same way every time, about 15 seconds</span></div><div class="progress mt8" style="height:8px"><i data-prog style="width:${(n.sent / n.total) * 100}%"></i></div></div>
        <div class="split mt16"><div class="card"><div class="h3">Live send log</div><div class="sendlog mt12" data-sendlog>${sendLogHtml(n.log)}</div></div>
        <div class="card"><div class="h3">Each inbox today</div><div class="stack mt12">${ibs.map((ib, i) => { const v = Math.min(cap(), Math.ceil(n.sent / ibs.length) + (i < n.sent % ibs.length ? 1 : 0)); return `<div data-meter="${i}"><div class="row between tiny"><span class="mono" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(ib.email)}</span><span class="mono" data-mn style="white-space:nowrap">${v} / ${cap()} today</span></div><div class="bar"><i style="width:${(v / cap()) * 100}%"></i></div></div>`; }).join('')}</div></div></div></div>`;
    },
    bind(root, step) {
      root.querySelector('[data-camp-switch]')?.addEventListener('click', async () => {
        const c = campState(track); const s = simOf(track);
        const on = isDemo() ? !(s.paused || c.status === 'Paused') : c.status === 'Sending';
        const ok = await confirmBox(on ? { title: 'Pause this campaign?', intro: 'Nothing more sends until you turn it back on. Every number holds still.', yes: 'Yes, pause it' } : { title: 'Turn sending back on?', serious: 'Real emails go to real people again.', yes: 'Yes, resume', yesCls: 'money' });
        if (!ok) { toast('Cancelled. Nothing changed.'); return; }
        try {
          if (!isDemo()) { const tk = await token(on ? 'publish' : 'send', 0, 'toggle'); await api(on ? 'instantly/pause' : 'instantly/activate', { campaignId: c.id, confirmToken: tk }); }
          c.status = on ? 'Paused' : 'Sending';
          if (isDemo()) { s.paused = on; if (!on && s.t < timeline(track).duration) { s.playing = true; ensureTicker(); } state.ui['camp:' + track] = c; refresh(); }
          else saveCamp(track, c);
          log(`${on ? 'Paused' : 'Resumed'} "${campaignName(track)}"`, { icon: on ? 'pause' : 'play', cost: 0, tool: 'instantly' });
        } catch (e) { toast(e.message, 'err'); }
      });
      if (isDemo() && simOf(track).playing) ensureTicker();
    },
    movie: () => {
      const tl = timeline(track);
      return [{ line: `Campaign "${campaignName(track)}" is sending` }, ...tl.events.filter((e, i) => i % 2 === 0).slice(0, 20).map(e => ({ line: e.text, ok: e.kind === 'reply', ms: 140 })), { stats: [['Sent', tl.total], ['Opened', tl.events.filter(e => e.kind === 'open').length], ['Replied', REPLIES[track].length], ['Bounced', 1]] }];
    },
    async run(step) {
      if (isDemo()) { restartSim(track); return; }
      const c = campState(track);
      if (!c.id) throw new Error('Make the draft and start sending first.');
      const a = await api('instantly/analytics', { campaignId: c.id });
      setLiveResult(step.key, a);
      log('Read campaign numbers from Instantly', { icon: 'chart', cost: 0 });
    },
  };
}

function campaignCard(track, c, ibs, s) {
  const on = s ? !(s.paused || c.status === 'Paused') && c.status !== 'Done' : c.status === 'Sending';
  return `<div class="card"><div class="row wrap between">
    <div><div class="tiny dim">Campaign</div><div class="h3">${esc(campaignName(track))}</div></div>
    <div class="row wrap" style="gap:18px">
      <div><div class="tiny dim">Status</div><div data-status>${s ? statusPill(c.status, s) : pill(c.status, c.status === 'Sending' ? 'green' : 'orange')}</div></div>
      <div><div class="tiny dim">Daily cap</div><div class="mono ink">${ibs.length * cap()} <span class="tiny dim">(${ibs.length} x ${cap()})</span></div></div>
      <div><div class="tiny dim">Next send</div><div class="ink small">${NEXT_SEND}</div></div>
      <a class="btn sm" href="${esc(c.url || 'https://app.instantly.ai/app/campaigns')}" target="_blank" rel="noopener">${icon('ext')}Open in Instantly</a>
      <div class="row"><span class="small">${on ? 'On' : 'Off'}</span><button class="switch ${on ? 'on' : ''}" data-camp-switch aria-label="Sending on or off" role="switch" aria-checked="${on}"></button></div>
    </div></div></div>`;
}

// ---------- 7.6 Autoresponder ----------
export function repliesFor(track) {
  if (!isDemo()) return liveResult(OUT_KEYS[track].prefix + '.replies')?.replies || [];
  const ls = demoLeads(track);
  const s = simOf(track);
  return REPLIES[track].filter(r => r.t <= s.t).map((r, i) => ({ ...r, id: `${track}-r${i}`, track, from: ls[r.lead].name, company: ls[r.lead].company, email: ls[r.lead].email }));
}
export function isUnread(r) { return !state.unreadRead.includes(r.id); }
export function markRead(id) { if (!state.unreadRead.includes(id)) { state.unreadRead = [...state.unreadRead, id]; persist('unreadRead'); emit(); } }

function repliesStep(track, prefix, section, trackKey) {
  const key = prefix + '.replies';
  return {
    key, track: trackKey, section, short: trackKey === 'product' ? 'Autoresponder' : 'Replies', title: trackKey === 'product' ? 'Autoresponder' : 'Replies', outTrack: track,
    explain: 'Each reply is sorted for you. The autoresponder is off until you turn it on.',
    mainLabel: () => isDemo() ? 'Sort the replies' : 'Check for replies', uses: ['instantly', 'claude'],
    replaces: 'Answering every reply yourself', saves: 'An hour a day', costs: '~$0.01 a reply est.',
    demo: () => ({}),
    render(step) {
      const rs = repliesFor(track);
      const on = isDemo() ? state.autoresponder[track] !== false : !!state.inputs['auto:' + track];
      const selId = state.ui['reply:' + track] || rs[0]?.id;
      const r = rs.find(x => x.id === selId) || rs[0];
      const useAlt = view(step, 'alt:' + (r?.id || ''), false);
      if (r && isUnread(r)) setTimeout(() => markRead(r.id), 400);
      const head = `<div class="card"><div class="row between wrap"><div><div class="h3">Autoresponder</div><div class="small dim">${on ? (isDemo() ? 'On. Answers are written within 5 minutes as drafts. Nothing is sent by itself.' : 'On. Checks for new replies every minute while the app is open, and saves drafts for you to send yourself.') : 'Off. Turn it on to have drafts written for each new reply.'}</div></div>
        <div class="row"><span class="small">${on ? 'On' : 'Off'}</span><button class="switch ${on ? 'on' : ''}" data-auto role="switch" aria-checked="${on}" aria-label="Autoresponder"></button></div></div>
        <div class="row wrap mt12">${['Interested', 'Question', 'Pricing question', 'Wrong person', 'Not now', 'Out of office'].map(l => `<span class="pill ${LABEL_TONE[l]}">${l}: ${rs.filter(x => x.label === l).length}</span>`).join('')}</div>
        <p class="tiny dim mt8">Out of office and "not now" are left alone, so nobody gets a pushy answer.</p></div>`;
      if (!rs.length) return head + '<div class="mt16">' + emptyFor(step, 'Replies from this campaign will show up here, each with a draft answer.') + '</div>';
      return head + `<div class="split mt16" style="grid-template-columns:minmax(0,.9fr) minmax(0,1.3fr)">
        <div class="card" style="padding:8px"><div class="reply-list">${rs.map(x => `<div class="reply ${x.id === r.id ? 'on' : ''}" data-reply="${x.id}" tabindex="0"><span class="ud ${isUnread(x) ? '' : 'read'}"></span><div style="min-width:0"><div class="row"><span class="who nm">${esc(x.from)}</span>${pill(x.label, LABEL_TONE[x.label])}</div><div class="pv">${esc(x.text)}</div></div><span class="tm">${esc(x.at)}</span></div>`).join('')}</div></div>
        <div class="stack"><div class="card"><div class="row between"><div><b class="ink nm">${esc(r.from)}</b> <span class="tiny dim nm">${esc(r.email || '')}</span></div>${pill(r.label, LABEL_TONE[r.label])}</div><p class="ink mt12" style="margin-bottom:0">"${esc(r.text)}"</p></div>
          <div class="card"><div class="card-head"><div class="h3">AI drafted answer</div>${pill('Draft, not sent', 'orange')}</div>
            <div class="draft">${esc(useAlt && r.alt ? r.alt : r.draft)}</div>
            <div class="btns mt12">${copyBtn(useAlt && r.alt ? r.alt : r.draft, 'Copy')}${r.alt ? `<button class="btn sm" data-alt="${r.id}">${icon('refresh')}Use the other idea</button>` : ''}</div></div>
          <div class="card"><div class="h3">How to answer</div><ul class="small mt8" style="margin-bottom:0;padding-left:18px"><li><b class="ink">Interested:</b> send the sample the same day.</li><li><b class="ink">Question:</b> answer in 2 or 3 short lines.</li><li><b class="ink">Not now:</b> thank them and stop.</li><li>Never argue. Never follow up after a no.</li></ul></div>
          <div class="card"><div class="h3">Reply templates</div>${AUTO_TEMPLATES.map(a => `<div class="small mt8"><b class="ink">${a.n}. ${esc(a.name)}:</b> ${esc(a.text)}</div>`).join('')}</div></div></div>`;
    },
    bind(root, step) {
      root.querySelectorAll('[data-reply]').forEach(el => { const go = () => { state.ui['reply:' + track] = el.dataset.reply; markRead(el.dataset.reply); refresh(); }; el.onclick = go; el.onkeydown = e => { if (e.key === 'Enter') go(); }; });
      root.querySelector('[data-alt]')?.addEventListener('click', e => setView(step, 'alt:' + e.currentTarget.dataset.alt, !view(step, 'alt:' + e.currentTarget.dataset.alt, false)));
      root.querySelector('[data-auto]')?.addEventListener('click', async () => {
        if (isDemo()) { state.autoresponder = { ...state.autoresponder, [track]: state.autoresponder[track] === false }; persist('autoresponder'); refresh(); return; }
        const on = !!state.inputs['auto:' + track];
        if (!on) { const ok = await confirmBox({ title: 'Turn on the autoresponder?', intro: 'While the app is open it checks for new replies every minute and writes a draft for each one, about $0.01 a reply est. It never sends anything by itself.', yes: 'Yes, turn it on' }); if (!ok) return; }
        set({ inputs: { ...state.inputs, ['auto:' + track]: !on } });
      });
    },
    movie: () => [{ line: 'Reading 6 replies' }, ...REPLIES[track].map(r => ({ line: `${r.label}: "${r.text.slice(0, 60)}${r.text.length > 60 ? '...' : ''}"`, ok: true, ms: 260 })), { type: REPLIES[track][0].draft, title: 'Draft, not sent', ms: 1500 }],
    async run(step) {
      if (isDemo()) { restartSim(track); toast('Replies will arrive as the demo send plays'); return; }
      await pollReplies(track, step);
    },
  };
}

export async function pollReplies(track, step) {
  const c = campState(track);
  if (!c.id) throw new Error('Start sending first, then replies show up here.');
  const r = await api('instantly/replies', { campaignId: c.id });
  const prev = liveResult(step.key)?.replies || [];
  const fresh = r.replies.filter(x => !prev.some(p => p.id === x.id));
  let drafted = [];
  if (fresh.length) {
    const { data } = await claudeJSON({ model: state.stepModel[step.key] || 'claude-haiku-5-5', maxTokens: 3000, label: `Claude sorted ${fresh.length} replies and wrote drafts`,
      system: 'Sort each email reply into one label: Interested, Question, Pricing question, Wrong person, Not now, Out of office. Write a short, kind draft answer and one other idea. For Out of office and Not now, the draft is a thank you or nothing. Never pushy. Never argue.',
      prompt: `Selling: ${TRACKS[track].sells}\nReplies: ${JSON.stringify(fresh.map(x => ({ id: x.id, from: x.from, text: x.text.slice(0, 1500) })))}\nReturn [{"id","label","draft","alt"}]` });
    drafted = fresh.map(x => { const d = data.find(y => y.id === x.id) || {}; return { id: x.id, track, from: x.from, email: x.from, text: x.text, at: new Date(x.at).toTimeString().slice(0, 5), label: d.label || 'Question', draft: d.draft || '', alt: d.alt || '' }; });
  }
  setLiveResult(step.key, { replies: [...drafted, ...prev] });
}

// ---------- register ----------
export function outreachSteps(track, prefix, section, trackKey) {
  return [inboxesStep(track, prefix, section, trackKey), writeStep(track, prefix, section, trackKey), trackStep(track, prefix, section, trackKey), repliesStep(track, prefix, section, trackKey)];
}
register([findStep, emailsStep, ...outreachSteps('ebook', 'p.send', 'send', 'product')]);
