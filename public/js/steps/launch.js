// Digital Product, step 3: Launch.
import { state, set, refresh, setLiveResult, liveResult, isDemo, log } from '../core/store.js';
import { esc, icon, pill, money, seg, tabs, copyBtn, toast, confirmBox, downloadText } from '../core/ui.js';
import { api, approve, token, claudeJSON, robot } from '../core/api.js';
import { coverSVG } from '../core/art.js';
import { register, frame, stepData, emptyFor, view, setView } from './frame.js';
import { OFFER, READY, LAUNCH_KIT, DISCLOSURE, CHECKLIST } from '../data/product.js';

const model = k => state.stepModel[k];

// ---------- 8.1 Your offer ----------
const offerStep = {
  key: 'p.launch.offer', track: 'product', section: 'launch', short: 'Your offer', title: 'Your offer',
  explain: 'Four robots check what already sells in your niche. Then Claude builds the offer: who it is for, the promise, the pitches and honest answers to doubts.',
  mainLabel: 'Build my offer', uses: ['apify', 'claude'],
  replaces: 'Ghostwriter OS ($2,999)', saves: '$2,999', costs: '~$0.05 est., about 1 minute',
  demo: () => OFFER,
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Your offer, pitches and answers to doubts will show up here.');
    return `<div class="grid g2">
      <div class="card"><div class="h3">The offer</div><div class="kv mt12"><span>Who it is for</span><span>${esc(d.who)}</span><span>The problem</span><span>${esc(d.problem)}</span><span>The promise</span><span>${esc(d.promise)}</span><span>Price</span><span class="peach mono">${esc(d.price)}</span><span>Bonuses</span><span>${esc(d.bonuses.join(', '))}</span></div></div>
      <div class="card"><div class="h3">3 ways to pitch it</div>${d.pitches.map(p => `<div class="row between mt12" style="align-items:flex-start;gap:10px"><p class="ink" style="margin:0">"${esc(p)}"</p>${copyBtn(p, 'Copy')}</div>`).join('')}</div>
      <div class="card"><div class="h3">Before and After</div><div class="tbl-wrap mt12"><table class="tbl"><tbody>
        <tr><td class="ink">Have</td><td>A vague "eat more protein"</td><td class="ink">One number and a short food list</td></tr>
        <tr><td class="ink">Do</td><td>Skip meals, force big dinners</td><td class="ink">Protein first, small plates</td></tr>
        <tr><td class="ink">Feel</td><td>Worried about muscle</td><td class="ink">Calm and in control</td></tr></tbody></table></div></div>
      <div class="card"><div class="h3">What they tried before</div>${d.tried.map(t => `<div class="mt12"><b class="ink small">${esc(t.what)}</b><div class="small dim">${esc(t.why)}</div></div>`).join('')}</div>
      <div class="card"><div class="h3">5 common doubts, with kind answers</div>${d.objections.map(o => `<div class="mt12"><b class="ink small">"${esc(o.q)}"</b><div class="small">${esc(o.a)}</div></div>`).join('')}</div>
      <div class="card"><div class="h3">What already sells</div><div class="tbl-wrap mt12"><table class="tbl"><thead><tr><th>Product</th><th>Sells for</th><th>Gap</th></tr></thead><tbody>${d.competitors.map(c => `<tr><td class="ink">${esc(c.name)}</td><td class="mono peach">${esc(c.price)}</td><td>${esc(c.note)}</td></tr>`).join('')}</tbody></table></div></div>
    </div>`;
  },
  movie: () => [...OFFER.robots.map(r => ({ line: `${r.name}: reading ${r.count}`, cost: '$0.00', ms: 260 })), { type: OFFER.promise, title: 'The promise', ms: 900 }, ...OFFER.pitches.map(p => ({ type: p, title: 'Pitch', ms: 700 })), { line: '5 doubts answered', ok: true }],
  async run(step) {
    const ok = await approve({ title: 'Build the offer?', lines: [...OFFER.robots.map(r => [r.name, money(r.price) + ' est.']), ['Claude builds the offer', '$0.03 est.']], total: 0.13 });
    if (!ok) return;
    const q = state.inputs.idea || 'GLP-1 protein';
    const [a, b] = await Promise.allSettled([robot({ robot: 'whopStore', query: q, count: 20, maxUsd: 0.1, label: 'Read Whop, Gumroad and Skool pages' }), robot({ robot: 'igHashtag', query: q, count: 20, maxUsd: 0.1, label: 'Read top reels on the topic' })]);
    const { data } = await claudeJSON({ model: model(step.key), maxTokens: 4000, label: 'Claude built the offer',
      system: 'Build an honest offer for a beginner. Never promise results. Kind, honest answers. Use only competitor prices that are in the data.',
      prompt: `Product: ${JSON.stringify(liveResult('p.build.plan') || {})}\nStore copy: ${JSON.stringify(liveResult('p.build.ready') || {})}\nWhat sells: ${JSON.stringify(a.status === 'fulfilled' ? a.value.items.slice(0, 20) : []).slice(0, 15000)}\nTop reels: ${JSON.stringify(b.status === 'fulfilled' ? b.value.items.slice(0, 10).map(x => x.caption) : [])}\nReturn {"who","problem","promise","price","bonuses":[],"pitches":[3, each "You keep asking me [question]. So I made [product]."],"objections":[5 x {"q","a"}],"tried":[3 x {"what","why"}],"competitors":[{"name","price","note"}]}` });
    setLiveResult(step.key, data);
  },
};

// ---------- 8.2 Store page ----------
const storeStep = {
  key: 'p.launch.store', track: 'product', section: 'launch', short: 'Store page', title: 'Store page',
  explain: 'A Whop store page. Publishing is two separate yeses: first hidden, so only you can see it, then visible.',
  mainLabel: () => (whopState().productId ? (whopState().visible ? 'Hide it again' : 'Make it visible') : 'Publish to Whop (hidden)'), mainCls: 'money', uses: ['whop'],
  replaces: 'Synthesize AI store and publish', saves: 'A web designer, $500+', costs: '$0, about 7 minutes',
  demo: () => READY,
  liveDone: () => !!liveResult('whop:product')?.productId,
  render(step) {
    const d = (!isDemo() && liveResult('p.build.ready')) || READY;
    const w = whopState();
    const payload = { title: d.fullTitle, headline: d.store.headline, description: [d.store.sub, '', ...d.store.bullets.map(b => '- ' + b), '', d.store.guarantee].join('\n'), price: d.price, visibility: 'hidden', stock: 0 };
    return `<div class="split" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)">
      <div class="whop"><div class="wbar"><i></i><i></i><i></i><span style="margin-left:8px">whop.com/${esc(slugify(d.creatorTitle))}</span></div>
        <div class="wbody"><div class="cover">${coverSVG({ title: d.creatorTitle, subtitle: 'The Small Appetite Protein Plan', author: d.creator, variant: 'creator', kicker: 'Creator edition' })}</div>
          <div><h2 style="font-size:24px;color:inherit">${esc(d.fullTitle)}</h2><p style="opacity:.75;margin-top:6px">${esc(d.store.headline)}</p>
          <div style="font:700 26px var(--mono);margin-top:12px">${esc(d.store.priceLine.split(',')[0])}<span style="font:500 13px var(--font);opacity:.6"> , one time, instant download</span></div>
          <button class="buy" tabindex="-1">Get instant access</button>
          <ul style="padding-left:18px;font-size:14px;opacity:.9">${d.store.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
          <p style="font-size:12.5px;opacity:.6">${esc(d.store.guarantee)}</p></div></div></div>
      <div class="stack">
        <div class="card"><div class="h3">Publishing</div>
          <div class="row mt12">${w.productId ? pill('Published', 'green') : pill('Not published', 'grey')}${w.productId ? (w.visible ? pill('Visible, people can buy', 'green') : pill('Hidden, stock 0', 'orange')) : ''}</div>
          ${w.productId ? `<div class="kv mt12"><span>Product ID</span><span class="mono">${esc(w.productId)}</span><span>Plan</span><span class="mono">${esc(w.planId || 'plan_demo_0000')}</span><span>Stock</span><span class="mono">${w.visible ? '25' : '0'}</span></div><a class="btn sm mt12" href="${esc(w.url)}" target="_blank" rel="noopener">${icon('ext')}Open this product in Whop</a>` : ''}
          <ol class="small mt12" style="padding-left:18px"><li class="${w.productId ? 'green' : ''}">Publish to Whop (hidden): only you can see it and nobody can buy it yet.</li><li class="${w.visible ? 'green' : ''}">Make it visible: a second, serious yes. You can hide it again any time.</li></ol>
          <div class="btns">${!w.productId ? `<button class="btn money" data-whop="publish">Publish to Whop (hidden)</button>` : w.visible ? `<button class="btn" data-whop="hide">Hide it again</button>` : `<button class="btn money" data-whop="visible">Make it visible</button>`}</div>
          ${w.visible ? '<div class="note g mt12 small"><b class="green">Now people can buy.</b></div>' : ''}</div>
        <div class="card"><div class="h3">The 50/50 split</div><p class="small mt8" style="margin:0">You and the creator split each sale 50/50. Set the creator as a payout split or affiliate in Whop so it is paid out on its own. Check Whop's current fees before you set the price.</p></div>
        <details class="card"><summary class="h3" style="cursor:pointer">More options</summary><p class="small mt8">This is exactly what will be sent to Whop:</p><pre class="mono tiny" style="white-space:pre-wrap;background:var(--card-2);padding:12px;border-radius:10px;max-height:240px;overflow:auto">${esc(JSON.stringify(payload, null, 2))}</pre><button class="btn sm" data-dl-payload>${icon('download')}Download it</button></details>
      </div></div>`;
  },
  bind(root, step) {
    const d = (!isDemo() && liveResult('p.build.ready')) || READY;
    root.querySelector('[data-dl-payload]')?.addEventListener('click', () => downloadText('whop-product.json', JSON.stringify({ title: d.fullTitle, price: d.price, visibility: 'hidden', stock: 0 }, null, 2), 'application/json'));
    root.querySelectorAll('[data-whop]').forEach(b => b.onclick = () => whopAction(b.dataset.whop, { title: d.fullTitle, headline: d.store.headline, description: d.store.sub + '\n\n' + d.store.bullets.map(x => '- ' + x).join('\n') + '\n\n' + d.store.guarantee, price: d.price }, 'whop:product', b));
  },
  movie: () => [{ line: 'Building the store page from your store copy' }, { html: `<div style="max-width:150px" class="cover">${coverSVG({ title: READY.creatorTitle, subtitle: 'The Small Appetite Protein Plan', author: READY.creator, variant: 'creator', kicker: 'Creator edition' })}</div>`, ms: 600 }, { line: 'Whop: product created, hidden, stock 0', ok: true }, { line: 'Product ID prod_demo_7Q2X (placeholder)', ok: true }, { line: 'Waiting for your second yes to make it visible' }],
  async run(step) { await whopAction(whopState().productId ? (whopState().visible ? 'hide' : 'visible') : 'publish', { title: READY.fullTitle, headline: READY.store.headline, description: READY.store.sub, price: READY.price, ...(liveResult('p.build.ready') ? { title: liveResult('p.build.ready').fullTitle, price: liveResult('p.build.ready').price } : {}) }, 'whop:product'); },
};

function slugify(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function whopState(key = 'whop:product') {
  if (isDemo()) return state.ui[key] || { productId: 'prod_demo_7Q2X', planId: 'plan_demo_3KD1', visible: false, url: 'https://whop.com/dashboard', checkout: 'https://whop.com/checkout/plan_demo_3KD1' };
  return liveResult(key) || {};
}
function saveWhop(key, w) { if (isDemo()) { state.ui[key] = w; refresh(); } else setLiveResult(key, w); }

export async function whopAction(kind, product, key, btn) {
  const w = whopState(key);
  btn?.classList.add('running');
  try {
    if (kind === 'publish') {
      const ok = await approve({ kind: 'publish', title: 'Publish to Whop, hidden?', intro: 'The product goes up hidden with stock 0. Only you can see it and nobody can buy it yet.', lines: [['Title', product.title], ['Price', money(product.price, 0) + (product.monthly ? ' a month' : ' one time')], ['Visibility', 'Hidden'], ['Stock', '0']], total: '$0' });
      if (!ok) return;
      if (isDemo()) { saveWhop(key, { productId: 'prod_demo_' + Math.random().toString(36).slice(2, 6).toUpperCase(), planId: 'plan_demo_' + Math.random().toString(36).slice(2, 6).toUpperCase(), visible: false, url: 'https://whop.com/dashboard', checkout: 'https://whop.com/checkout/plan_demo' }); }
      else { const tk = await token('publish', 0, 'whop'); const r = await api('whop/product', { ...product, confirmToken: tk }); saveWhop(key, { productId: r.productId, planId: r.planId, visible: false, url: r.url, checkout: r.checkout }); }
      log(`Put "${product.title}" on Whop, hidden, stock 0${isDemo() ? ' (demo)' : ''}`, { icon: 'store', cost: 0, tool: 'whop' });
    } else if (kind === 'visible') {
      const ok = await confirmBox({ title: 'Make it visible?', serious: 'People will be able to find it and buy it. Read the page once more first.', yes: 'Yes, make it visible', yesCls: 'money' });
      if (!ok) { toast('Cancelled. Nothing changed.'); return; }
      if (!isDemo()) { const tk = await token('publish', 0, 'visible'); await api('whop/visibility', { productId: w.productId, planId: w.planId, visible: true, stock: 25, confirmToken: tk }); }
      saveWhop(key, { ...w, visible: true });
      log(`Made "${product.title}" visible on Whop${isDemo() ? ' (demo)' : ''}`, { icon: 'eye', cost: 0, tool: 'whop' });
      toast('Now people can buy');
    } else if (kind === 'hide') {
      const ok = await confirmBox({ title: 'Hide it again?', intro: 'Nobody new can buy it while it is hidden.', yes: 'Yes, hide it' });
      if (!ok) return;
      if (!isDemo()) { const tk = await token('publish', 0, 'hide'); await api('whop/visibility', { productId: w.productId, planId: w.planId, visible: false, confirmToken: tk }); }
      saveWhop(key, { ...w, visible: false });
      log(`Hid "${product.title}" on Whop`, { icon: 'lock', cost: 0, tool: 'whop' });
    }
  } catch (e) { toast(e.message, 'err'); } finally { btn?.classList.remove('running'); }
}

// ---------- 8.3 Launch posts ----------
function phone(r, i) {
  const bg = ['linear-gradient(160deg,#3a2214,#a0623a)', 'linear-gradient(160deg,#1d2a1f,#4f8a45)', 'linear-gradient(160deg,#20163a,#6d4a8a)'][i % 3];
  return `<div class="phone" style="background:${bg}"><div class="notch"></div><div class="scr">
    <div class="tiny" style="position:absolute;top:30px;left:14px;opacity:.8">${r.secs}s . reel</div>
    ${r.beats.map((b, k) => `<div class="beat" style="animation-delay:${k * (9 / r.beats.length)}s;position:absolute;left:14px;right:14px;bottom:${70}px">${esc(b)}</div>`).join('')}
    <div class="tiny" style="opacity:.85">I earn from each sale of this ebook.</div></div></div>`;
}

const postsStep = {
  key: 'p.launch.posts', track: 'product', section: 'launch', short: 'Launch posts', title: 'Launch posts',
  explain: 'Reels, captions, emails, stories, FAQs and a 7-day plan, written in the creator\'s voice.',
  mainLabel: 'Write the launch kit', uses: ['claude'],
  replaces: 'Ghostwriter OS ($2,999)', saves: '$2,999', costs: '44 cents, 92 seconds',
  demo: () => LAUNCH_KIT,
  render(step) {
    const kit = view(step, 'kit', 'ebook');
    const all = stepData(step);
    const top = `<div class="row between wrap" style="margin-bottom:14px">${seg('kit', [['ebook', 'Ebook kit'], ['airbnb', 'Airbnb photo pack kit']], kit)}<button class="btn" data-dl-kit>${icon('download')}Download the whole kit</button></div>`;
    if (!all) return top + emptyFor(step, 'Your reels, captions, emails, stories and 7-day plan will show up here.');
    const d = all[kit] || LAUNCH_KIT[kit];
    const tab = view(step, 'tab', 'reels');
    const T = [['reels', 'Reels'], ['captions', 'Captions'], ['emails', 'Emails'], ['stories', 'Stories'], ['faqs', 'FAQs'], ['plan', '7-day plan'], ['disclosure', 'Disclosure'], ['check', 'Final check']];
    let body = '';
    if (tab === 'reels') body = `<div class="stack">${d.reels.map((r, i) => `<div class="card"><div class="row" style="align-items:flex-start;gap:22px">${phone(r, i)}<div style="flex:1"><div class="row between"><div class="h3">${esc(r.title)}</div>${pill(r.secs + ' seconds', 'purple')}</div>
        <span class="label mt12">Hook, first 2 seconds</span><p class="ink">"${esc(r.hook)}"</p><span class="label">Lines</span><ol class="small">${r.lines.map(l => `<li>${esc(l)}</li>`).join('')}</ol>
        <span class="label">On screen text</span><div class="row wrap">${r.beats.map(b => `<span class="pill no-dot">${esc(b)}</span>`).join('')}</div><span class="label mt12">Shot idea (phone only)</span><p class="small">${esc(r.shot)}</p>${copyBtn([r.hook, ...r.lines].join('\n'), 'Copy script')}</div></div></div>`).join('')}</div>`;
    if (tab === 'captions') body = `<div class="grid g2">${d.captions.map((c, i) => `<div class="card"><div class="row between"><span class="tiny dim">Caption ${i + 1} . ${c.split(/\s+/).length} words</span>${copyBtn(c)}</div><p class="mt8" style="margin:0">${esc(c)}</p></div>`).join('')}</div>`;
    if (tab === 'emails') body = `<div class="stack">${d.emails.map(e => `<div class="email-prev"><div class="eh"><div><span>Subject</span><b>${esc(e.subject)}</b></div></div><div class="eb" style="white-space:pre-wrap">${esc(e.body)}</div><div class="foot">${copyBtn(e.subject + '\n\n' + e.body)}</div></div>`).join('')}</div>`;
    if (tab === 'stories') body = `<div class="grid g4">${d.stories.map((s, i) => `<div class="card tight" style="aspect-ratio:9/14;display:flex;flex-direction:column;justify-content:space-between;background:linear-gradient(170deg,var(--card-2),rgba(91,46,232,.25))"><span class="tiny mono dim">${i + 1} . ${esc(s.type)}</span><b class="ink">${esc(s.text)}</b><span class="pill no-dot">${esc(s.sticker)}</span></div>`).join('')}</div>`;
    if (tab === 'faqs') body = `<div class="stack">${d.faqs.map(f => `<div class="card tight"><b class="ink">${esc(f.q)}</b><p class="small mt8" style="margin:0">${esc(f.a)}</p></div>`).join('')}</div>`;
    if (tab === 'plan') body = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Day</th><th>Post</th><th>Stories</th><th>Email</th><th>Goal</th></tr></thead><tbody>${d.plan.map(p => `<tr><td class="mono">${p.day}</td><td class="ink">${esc(p.post)}</td><td>${esc(p.stories)}</td><td>${esc(p.email || '')}</td><td>${esc(p.goal)}</td></tr>`).join('')}</tbody></table></div>`;
    if (tab === 'disclosure') body = `<div class="card"><div class="h3">"${esc(kit === 'ebook' ? DISCLOSURE.line : 'I earn from each photo pack I sell.')}"</div>${copyBtn(kit === 'ebook' ? DISCLOSURE.line : 'I earn from each photo pack I sell.')}<div class="tbl-wrap mt12"><table class="tbl"><tbody>${DISCLOSURE.places.map(p => `<tr><td class="ink">${esc(p.where)}</td><td>${esc(p.how)}</td></tr>`).join('')}</tbody></table></div><a class="btn sm mt12" href="${DISCLOSURE.ftc}" target="_blank" rel="noopener">${icon('ext')}Official FTC guidance</a></div>`;
    if (tab === 'check') body = `<div class="card"><div class="h3">Before you post, check all 12</div><div class="stack mt12">${CHECKLIST.map((c, i) => `<label class="row small" style="cursor:pointer"><input type="checkbox" style="width:auto" data-chk="${i}" ${(state.inputs.checklist || []).includes(i) ? 'checked' : ''}>${esc(c)}</label>`).join('')}</div></div>`;
    return top + tabs('tab', T, tab) + body + `<div class="card mt16"><div class="h3">How to post these</div><ul class="small mt8" style="margin-bottom:0"><li>Film on your phone, in good window light. No fancy gear.</li><li>Post the reel, then the stories the same day.</li><li>Answer comments in the first hour.</li><li>Send the emails only to people who signed up for them.</li></ul></div>`;
  },
  bind(root, step) {
    root.querySelector('[data-dl-kit]')?.addEventListener('click', () => {
      const d = (stepData(step) || LAUNCH_KIT)[view(step, 'kit', 'ebook')];
      const txt = ['REELS', ...d.reels.map(r => `\n${r.title} (${r.secs}s)\nHook: ${r.hook}\n${r.lines.join('\n')}\nOn screen: ${r.beats.join(' / ')}\nShot: ${r.shot}`), '\nCAPTIONS', ...d.captions, '\nEMAILS', ...d.emails.map(e => `Subject: ${e.subject}\n${e.body}`), '\nSTORIES', ...d.stories.map((s, i) => `${i + 1}. ${s.type}: ${s.text} [${s.sticker}]`), '\nFAQS', ...d.faqs.map(f => `${f.q}\n${f.a}`), '\n7-DAY PLAN', ...d.plan.map(p => `Day ${p.day}: ${p.post} | ${p.stories} | ${p.email} | ${p.goal}`), '\nFINAL CHECK', ...CHECKLIST.map(c => '[ ] ' + c)].join('\n\n');
      downloadText(`launch-kit-${view(step, 'kit', 'ebook')}.txt`, txt);
      log('Downloaded the launch kit', { icon: 'download', cost: 0 });
    });
    root.querySelectorAll('[data-chk]').forEach(c => c.onchange = () => { const s = new Set(state.inputs.checklist || []); c.checked ? s.add(Number(c.dataset.chk)) : s.delete(Number(c.dataset.chk)); set({ inputs: { ...state.inputs, checklist: [...s] } }, { silent: true }); });
  },
  movie: () => [...LAUNCH_KIT.ebook.reels.map(r => ({ type: `${r.hook}\n${r.lines.join('\n')}`, title: `Reel: ${r.title}`, ms: 900 })), ...LAUNCH_KIT.ebook.captions.slice(0, 2).map(c => ({ type: c, title: 'Caption', ms: 600 })), { line: '3 emails, 8 story frames, 8 FAQs, a 7-day plan', ok: true }, { line: 'Disclosure line added everywhere it is needed', ok: true }],
  async run(step) {
    const ok = await approve({ title: 'Write the launch kit?', lines: [['Claude writes reels, captions, emails, stories, FAQs and a 7-day plan', '$0.44 est.']], total: 0.44 });
    if (!ok) return;
    const voice = liveResult('p.build.voice');
    const { data } = await claudeJSON({ model: model(step.key), maxTokens: 10000, label: 'Claude wrote the launch kit',
      system: 'Write a launch kit in the creator\'s voice. Every caption starts with the disclosure line "I earn from each sale of this ebook." Never promise results. No made up reviews or testimonials. Each reel: a hook in the first 2 seconds, 3 to 5 short lines with one real tip from the book, "link in my bio".',
      prompt: `Product: ${JSON.stringify(liveResult('p.build.ready') || READY)}\nCreator voice: ${JSON.stringify(voice || {}).slice(0, 4000)}\nReturn {"reels":[3 x {"title","hook","lines":[],"beats":[],"shot","secs"}],"captions":[5 strings under 150 words],"emails":[3 x {"subject","body"}],"stories":[8 x {"type","text","sticker"}],"faqs":[up to 10 x {"q","a"}],"plan":[7 x {"day","post","stories","email","goal"}]}` });
    setLiveResult(step.key, { ebook: data, airbnb: LAUNCH_KIT.airbnb });
  },
  finish: () => `<div class="btns"><button class="btn main" data-go="#/hustles">Pick a side hustle${icon('arrow')}</button><button class="btn" data-go="#/home">Back to Home</button></div>`,
};

register([offerStep, storeStep, postsStep]);
