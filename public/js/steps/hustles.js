// AI side hustles: Airbnb Photos, Ad Remakes, YouTube Shorts. Same 3 parts each:
// Do the work, Find clients & send, Get paid.
import { state, set, refresh, setLiveResult, liveResult, isDemo, log, ui } from '../core/store.js';
import { esc, icon, pill, money, fmt, short, copyBtn, toast, confirmBox, downloadDataUrl, slug, bar } from '../core/ui.js';
import { api, approve, token, claudeJSON, robot } from '../core/api.js';
import { listingPhoto, roomCanvas, makeBefore, measure, changedPct, photoScore, adCanvas, clipSVG } from '../core/art.js';
import { register, stepData, emptyFor, view, setView, BY_KEY, isDone, stepRoute } from './frame.js';
import { outreachSteps, OUT_KEYS, trackLeads } from './outreach.js';
import { whopState, whopAction } from './launch.js';
import { HUSTLES, LISTINGS, AIRBNB_CITY, HERO_LISTING, AIRBNB_MESSAGE, ADS, AD_CITY, AD_IDEAS, AD_PITCH, OUTLIERS, SHORTS_NICHE, SCRIPT, SHORTS_PITCH, GET_PAID, WHOP_FEE } from '../data/hustles.js';
import { leads as demoLeads, TRACKS } from '../data/outreach.js';

const model = k => state.stepModel[k];

// ---------- the slim strip across the top of every hustle step ----------
function strip(h) {
  return step => {
    const keys = [...HUSTLES[h].work.map(([k, l]) => [`h.${h}.work.${k}`, BY_KEY[`h.${h}.work.${k}`]?.short || l]), [`h.${h}.clients.pitch`, HUSTLES[h].pitch], ['reach', 'Reach out'], [`h.${h}.paid.price`, 'Set your price'], [`h.${h}.paid.whop`, 'Whop page'], [`h.${h}.paid.paylink`, 'Pay link'], [`h.${h}.paid.deliver`, 'Deliver']];
    const reachKeys = ['inboxes', 'write', 'track', 'replies'].map(x => `h.${h}.clients.${x}`);
    return `<div class="strip" aria-label="${esc(HUSTLES[h].name)} steps">${keys.map(([k, l]) => {
      const isReach = k === 'reach';
      const on = isReach ? reachKeys.includes(step.key) : k === step.key;
      const done = isReach ? reachKeys.every(x => BY_KEY[x] && isDone(BY_KEY[x])) : BY_KEY[k] && isDone(BY_KEY[k]);
      return `<button class="${on ? 'on' : ''} ${done && !on ? 'done' : ''}" data-go="${stepRoute(BY_KEY[isReach ? reachKeys[0] : k])}">${done ? icon('check', 'style="width:12px;height:12px"') : ''}${esc(l)}</button>`;
    }).join('')}</div>`;
  };
}

// =====================================================================
// AIRBNB PHOTOS
// =====================================================================
const hosts = {
  key: 'h.airbnb.work.hosts', track: 'airbnb', section: 'work', short: 'Find hosts', title: 'Find hosts with weak photos',
  explain: 'Dark or blurry photos mean fewer bookings. A robot reads public listings in one city.',
  mainLabel: 'Read 40 listings', uses: ['apify'], strip: strip('airbnb'),
  replaces: 'Finding clients by hand', saves: 'Hours of scrolling', costs: '~$0.14 est. (under $0.20)',
  demo: () => ({ city: AIRBNB_CITY, listings: LISTINGS }),
  render(step) {
    const city = state.inputs.city ?? AIRBNB_CITY;
    const top = `<div class="card" style="margin-bottom:16px"><label class="label" for="city">City</label><input id="city" data-input="city" value="${esc(city)}"></div>`;
    const d = stepData(step);
    if (!d) return top + emptyFor(step, 'Listing cards, weakest photos first, will show up here.');
    return top + `<div class="row between" style="margin-bottom:12px"><span class="small dim">${d.listings.length} listings, weakest photos first</span><span class="small dim">All demo listings are made up</span></div>
      <div class="grid g4">${d.listings.map((l, i) => `<div class="card listing"><div class="ph">${l.img ? `<img src="${esc(l.img)}" alt="" loading="lazy">` : `<img data-lphoto="${i}" alt="">`}<span class="ws">${pill('Weak ' + l.weak + '/10', l.weak >= 6 ? 'red' : l.weak >= 4 ? 'orange' : 'green')}</span></div>
        <div class="lb"><b class="ink">${esc(l.title)}</b><div class="tiny dim mt8">${esc(l.type)} . ★ ${l.rating} (${l.reviews}) . ${money(l.price, 0)} a night . ${l.photos} photos</div>
        <a class="tiny" href="${esc(l.url)}" target="_blank" rel="noopener">Open on Airbnb</a></div></div>`).join('')}</div>`;
  },
  bind(root, step) { fillPhotos(root, stepData(step)?.listings || []); },
  movie: () => [{ line: `Airbnb robot: reading 40 public listings in ${AIRBNB_CITY}`, cost: '$0.00' }, { rows: { head: ['Listing', 'Rating', 'Photos', 'Weak'], rows: LISTINGS.slice(0, 10).map(l => [l.title, '★ ' + l.rating, l.photos, { html: pill(l.weak + '/10', l.weak >= 6 ? 'red' : 'orange') }]) }, ms: 150 }, { line: '40 listings sorted, weakest first', ok: true }],
  async run(step) {
    const city = (state.inputs.city || AIRBNB_CITY).trim();
    const ok = await approve({ title: `Read 40 listings in ${city}?`, lines: [['Airbnb robot, 40 public listings', '$0.14 est.']], total: 0.14 });
    if (!ok) return;
    const r = await robot({ robot: 'airbnb', query: city, count: 40, maxUsd: 0.3, label: `Read 40 Airbnb listings in ${city}` });
    const listings = r.items.map((x, i) => ({ id: x.id || 'L' + i, title: x.name || x.title || 'Listing', type: x.roomType || x.type || '', rating: x.rating?.guestSatisfaction || x.stars || 0, reviews: x.reviewsCount || x.numberOfReviews || 0, price: x.price?.price ? Number(String(x.price.price).replace(/[^0-9.]/g, '')) : (x.pricing?.rate?.amount || 0), photos: (x.images || x.photos || []).length, img: (x.images?.[0]?.imageUrl || x.thumbnail || x.photos?.[0]?.large || ''), images: (x.images || []).slice(0, 6).map(im => im.imageUrl || im), url: x.url || 'https://www.airbnb.com', host: x.host?.name || '', hostId: x.host?.id || '', weak: '?', issues: [] }));
    setLiveResult(step.key, { city, listings });
  },
};

function fillPhotos(root, listings) {
  const imgs = [...root.querySelectorAll('[data-lphoto]')];
  let i = 0;
  const next = () => {
    const slice = imgs.slice(i, i + 4); i += 4;
    slice.forEach(img => { const l = listings[Number(img.dataset.lphoto)]; if (l) img.src = listingPhoto(l.seed, l.kind, l.quality); });
    if (i < imgs.length) setTimeout(next, 16);
  };
  next();
}

const spot = {
  key: 'h.airbnb.work.spot', track: 'airbnb', section: 'work', short: 'Spot weak photos', title: 'Spot weak photos',
  explain: 'First a free check on this computer, no AI: it measures each photo\'s brightness, contrast and sharpness. Then, if you want, Claude looks too and only says what it can see.',
  mainLabel: 'Run the free check', uses: ['local', 'claude'], strip: strip('airbnb'),
  replaces: 'Writing and scoring by hand', saves: 'An hour a city', costs: 'Free, or ~$0.05 est. with Claude',
  demo: () => ({ measured: true }),
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Each photo, scored 0 to 10 with issue tags, will show up here.');
    const list = (isDemo() ? LISTINGS : liveResult('h.airbnb.work.hosts')?.listings || []).slice(0, 12);
    const scores = view(step, 'scores', null);
    return `<div class="note small" style="margin-bottom:14px">${icon('info', 'style="width:14px;vertical-align:-2px"')} Scores are measured on the real pixels of each photo on this computer. 10 is a bright, clear, sharp photo.</div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Photo</th><th>Listing</th><th class="num">Brightness</th><th class="num">Contrast</th><th class="num">Sharpness</th><th>Score</th><th>Issues</th></tr></thead><tbody>
      ${list.map((l, i) => { const s = scores?.[i]; return `<tr><td><img data-lphoto="${i}" ${l.img ? `src="${esc(l.img)}"` : ''} alt="" style="width:84px;height:56px;object-fit:cover;border-radius:8px;display:block"></td><td class="ink small">${esc(l.title)}</td><td class="num">${s ? s.brightness : '...'}</td><td class="num">${s ? s.contrast : '...'}</td><td class="num">${s ? s.sharpness : '...'}</td><td style="min-width:110px">${s ? `${bar(s.score, 10, s.score < 5 ? 'o' : 'g')}<span class="mono small">${s.score} / 10</span>` : '...'}</td><td>${(s?.issues || l.issues || []).map(x => pill(x, 'orange')).join(' ')}</td></tr>`; }).join('')}</tbody></table></div>
      <div class="btns mt16"><button class="btn" data-claudecheck>${icon('eye')}Check with Claude</button><span class="tiny dim">Optional. Claude only says what it can see.</span></div>
      ${view(step, 'claudeNotes', null) ? `<div class="card mt12"><div class="h3">What Claude saw</div><div class="small mt8" style="white-space:pre-wrap">${esc(view(step, 'claudeNotes'))}</div></div>` : ''}`;
  },
  bind(root, step) {
    const list = (isDemo() ? LISTINGS : liveResult('h.airbnb.work.hosts')?.listings || []).slice(0, 12);
    fillPhotos(root, list);
    if (!view(step, 'scores', null) && list.length) {
      setTimeout(() => {
        const scores = list.map((l, i) => {
          const img = root.querySelector(`[data-lphoto="${i}"]`);
          try {
            const c = document.createElement('canvas'); c.width = 240; c.height = 160;
            const im = l.img ? img : (() => { const x = new Image(); x.src = listingPhoto(l.seed, l.kind, l.quality); return x; })();
            c.getContext('2d').drawImage(im, 0, 0, 240, 160);
            const m = measure(c); const score = photoScore(m);
            const issues = []; if (m.brightness < 110) issues.push('too dark'); if (m.contrast < 40) issues.push('flat'); if (m.sharpness < 5) issues.push('blurry');
            return { brightness: m.brightness, contrast: m.contrast, sharpness: m.sharpness, score, issues: issues.length ? issues : (score < 7 ? l.issues : []) };
          } catch { return { brightness: '?', contrast: '?', sharpness: '?', score: 0, issues: ['could not read'] }; }
        });
        setView(step, 'scores', scores);
      }, 300);
    }
    root.querySelector('[data-claudecheck]')?.addEventListener('click', async e => {
      if (isDemo()) { setView(step, 'claudeNotes', 'Photo 1: the room looks dim and the colors lean yellow. The left wall leans slightly. The sofa and window are clear to see.\nPhoto 2: the window is very bright compared to the room, so the room looks dark.\nPhoto 3: the photo looks soft, a little out of focus.\n(Demo notes. In Live mode Claude looks at the real photos.)'); return; }
      const urls = list.slice(0, 5).map(l => l.img).filter(Boolean);
      if (!urls.length) { toast('No photo links to check.', 'err'); return; }
      const ok = await approve({ title: 'Check 5 photos with Claude?', lines: [['Claude looks at 5 photos', '$0.05 est.']], total: 0.05 });
      if (!ok) return;
      e.currentTarget.classList.add('running');
      try { const tk = await token('spend', 0.05, 'vision'); const r = await api('claude', { model: model(step.key), images: urls, maxTokens: 1200, system: 'Describe only what you can see in each listing photo: light, color cast, blur, crooked lines, clutter. Never guess. One or two short lines per photo.', prompt: 'Check these listing photos in order.', confirmToken: tk }); setView(step, 'claudeNotes', r.text); log('Claude checked 5 listing photos', { icon: 'eye', cost: r.cost, tool: 'claude' }); } catch (err) { toast(err.message, 'err'); }
    });
  },
  movie: () => [{ line: 'Measuring brightness, contrast and sharpness on this computer (free)' }, { rows: { head: ['Listing', 'Brightness', 'Score'], rows: LISTINGS.slice(0, 8).map(l => [l.title, Math.round(60 + l.quality * 9), (l.quality).toFixed(1) + ' / 10']) }, ms: 160 }, { line: 'Weakest listings ranked', ok: true }],
  async run(step) { setView(step, 'scores', null); if (!isDemo()) setLiveResult(step.key, { measured: true }); log('Measured listing photos on this computer (free)', { icon: 'photo', cost: 0 }); },
};

// Before and after photo for the fix step
const fixCache = {};
function heroPair() {
  if (!fixCache.pair) {
    const after = roomCanvas(HERO_LISTING.seed + 1000, 'living', 1200, 800);
    const before = makeBefore(after, { dark: 0.62, warm: 1, tilt: 2, blur: 1.2 });
    const ma = measure(after), mb = measure(before);
    fixCache.pair = { after, before, ma, mb, changed: changedPct(mb, ma), afterUrl: after.toDataURL('image/jpeg', 0.9), beforeUrl: before.toDataURL('image/jpeg', 0.9) };
  }
  return fixCache.pair;
}

export function sliderHtml(beforeUrl, afterUrl, label = 'Before and after') {
  return `<div class="slider" tabindex="0" role="slider" aria-label="${esc(label)}. Use the arrow keys to move." aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" data-slider>
    <img src="${esc(beforeUrl)}" alt="Before: the original photo">
    <div class="after-wrap"><img src="${esc(afterUrl)}" alt="After: the fixed photo, same room"></div>
    <div class="handle"><div class="knob">${icon('grip')}</div></div>
    <span class="tag l">Before</span><span class="tag r">After</span></div>`;
}
// Moves only on drag, click or arrow keys. Never on hover.
export function bindSlider(el) {
  if (!el) return;
  let pos = 50, dragging = false;
  const set = p => { pos = Math.max(0, Math.min(100, p)); el.querySelector('.after-wrap').style.clipPath = `inset(0 0 0 ${pos}%)`; el.querySelector('.handle').style.left = pos + '%'; el.setAttribute('aria-valuenow', Math.round(pos)); };
  const at = e => { const r = el.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
  el.addEventListener('pointerdown', e => { dragging = true; el.setPointerCapture(e.pointerId); set(at(e)); });
  el.addEventListener('pointermove', e => { if (dragging) set(at(e)); });
  el.addEventListener('pointerup', () => { dragging = false; });
  el.addEventListener('pointercancel', () => { dragging = false; });
  el.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') { set(pos - 5); e.preventDefault(); } if (e.key === 'ArrowRight') { set(pos + 5); e.preventDefault(); } if (e.key === 'Home') set(0); if (e.key === 'End') set(100); });
  set(50);
}

const fix = {
  key: 'h.airbnb.work.fix', track: 'airbnb', section: 'work', short: 'Fix one photo free', title: 'Fix one photo free',
  explain: 'Higgsfield edits the worst photo like a real estate photographer would. The room stays exactly the same.',
  mainLabel: 'Fix the worst photo', uses: ['higgsfield'], strip: strip('airbnb'),
  replaces: 'Making it by hand', saves: 'A photographer, $150+', costs: '~$0.40 to $1 est.',
  demo: () => ({ demo: true }),
  render(step) {
    const d = stepData(step);
    const rule = `<div class="note o" style="margin-bottom:16px"><b class="peach">The rule:</b> <span class="ink">Fix light, color and straight lines only. Never fake the room.</span> Every piece of furniture, every color, the layout, the framing and the view stay the same. Nothing new appears. The photo keeps its shape.</div>`;
    if (!d) return rule + emptyFor(step, 'The before and after slider will show up here.');
    const p = isDemo() ? heroPair() : d;
    const tooSmall = p.changed < 15;
    return rule + `${sliderHtml(p.beforeUrl, p.afterUrl, 'Before and after photo')}
      <p class="tiny dim mt8">Drag the handle, click anywhere on the photo, or use the arrow keys.</p>
      <div class="grid g2 mt16">
        <div class="card"><div class="card-head"><div class="h3">Did it really change?</div>${tooSmall ? pill('Too small', 'red') : pill('Measured on the real files', 'green')}</div>
          <div class="grid g3"><div class="stat o"><b>${p.changed}%</b><span>Pixels changed</span></div><div class="stat"><b>${p.mb.brightness} to ${p.ma.brightness}</b><span>Brightness</span></div><div class="stat"><b>${p.mb.contrast} to ${p.ma.contrast}</b><span>Contrast</span></div></div>
          ${tooSmall ? `<div class="note mt12"><b class="red">The change is too small to sell. Try again.</b> <button class="btn sm" data-main="${step.key}">Fix it again</button></div>` : ''}</div>
        <div class="card"><div class="h3">Download</div><p class="small dim">Clear file names, ready to attach.</p><div class="btns"><button class="btn" data-dl="before">${icon('download')}Download before</button><button class="btn main" data-dl="after">${icon('download')}Download after</button></div></div>
      </div>`;
  },
  bind(root, step) {
    bindSlider(root.querySelector('[data-slider]'));
    root.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => {
      const p = isDemo() ? heroPair() : stepData(step);
      const base = slug((isDemo() ? HERO_LISTING.title : 'listing').replace(' (demo)', ''));
      downloadDataUrl(`${base}-${b.dataset.dl}.jpg`, b.dataset.dl === 'before' ? p.beforeUrl : p.afterUrl);
    });
  },
  movie: () => [
    { line: 'Higgsfield: fixing light, color and straight lines' },
    { photo: async (box, { wait, instant }) => {
      const p = heroPair();
      box.innerHTML = `<div class="slider" style="cursor:default"><img src="${p.beforeUrl}" alt=""><div class="after-wrap" style="clip-path:inset(0 0 0 100%)"><img src="${p.afterUrl}" alt=""></div><span class="tag l">Before</span><span class="tag r">After</span></div>`;
      const w = box.querySelector('.after-wrap');
      for (let k = 100; k >= 0; k -= 4) { if (instant()) break; w.style.clipPath = `inset(0 0 0 ${k}%)`; await wait(45); }
      w.style.clipPath = 'inset(0 0 0 0)';
    } },
    { stats: [['Pixels changed', heroPair().changed, '', '%'], ['Brightness after', heroPair().ma.brightness], ['Contrast after', heroPair().ma.contrast]] },
    { line: 'Same room. Nothing added.', ok: true },
  ],
  async run(step) {
    const l = (liveResult('h.airbnb.work.hosts')?.listings || [])[0];
    if (!l?.img) throw new Error('Run Find hosts first, so there is a real photo to fix.');
    const ok = await approve({ title: 'Fix this photo with Higgsfield?', lines: [['1 photo edit', '$0.40 to $1 est.']], total: 1 });
    if (!ok) return;
    const tk = await token('spend', 1, 'photo');
    const r = await api('higgsfield/generate', { kind: 'edit', imageUrl: l.img, prompt: 'Edit this real estate photo like a professional photographer: brighter and airier, clean whites, no color cast, straight vertical lines, remove small clutter only. Keep every piece of furniture, every color, the layout, the framing and the view exactly the same. Add nothing new. Keep the original aspect ratio.', confirmToken: tk });
    log('Higgsfield fixed one listing photo', { icon: 'photo', cost: 1, run: true, tool: 'higgsfield' });
    const [b, a] = await Promise.all([api('image', { url: l.img }), api('image', { url: r.url })]);
    const load = src => new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = 600; c.height = Math.round(600 * im.height / im.width); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c); }; im.src = src; });
    const [cb, ca] = await Promise.all([load(b.dataUrl), load(a.dataUrl)]);
    const mb = measure(cb), ma = measure(ca);
    setLiveResult(step.key, { beforeUrl: b.dataUrl, afterUrl: a.dataUrl, mb: { brightness: mb.brightness, contrast: mb.contrast }, ma: { brightness: ma.brightness, contrast: ma.contrast }, changed: changedPct(mb, ma) });
  },
};

const airbnbPitch = {
  key: 'h.airbnb.clients.pitch', track: 'airbnb', section: 'clients', short: 'Message the host', title: 'Message the host',
  explain: 'A short, kind message with the free photo attached. Public business info only, never a private person\'s email.',
  mainLabel: 'Look up the host', uses: ['aiark', 'claude'], strip: strip('airbnb'),
  replaces: 'Writing each pitch yourself', saves: '20 minutes a host', costs: '~$0.01 est.',
  demo: () => ({ leads: demoLeads('airbnb') }),
  render(step) {
    const ls = trackLeads('airbnb');
    const lead = ls[0];
    const p = isDemo() ? heroPair() : liveResult('h.airbnb.work.fix');
    if (!lead) return emptyFor(step, 'The host\'s public business info and your message will show up here.');
    const body = AIRBNB_MESSAGE.body.replaceAll('{first}', lead.first).replaceAll('{title}', (isDemo() ? HERO_LISTING.title : 'your listing').replace(' (demo)', ''));
    return pitchView('airbnb', step, lead, AIRBNB_MESSAGE.subject, body, AIRBNB_MESSAGE.followup.replaceAll('{first}', lead.first), p ? `<div class="row mt12" style="gap:10px"><img src="${p.afterUrl}" alt="Attached: the fixed photo" style="width:140px;border-radius:8px"><span class="tiny dim">Attached: ${esc(slug(HERO_LISTING.title.replace(' (demo)', '')))}-after.jpg</span></div>` : '');
  },
  bind: (root, step) => bindPitch(root, step, 'airbnb', AIRBNB_MESSAGE),
  movie: () => [{ line: 'Looking up the host: public business page only' }, { line: `Found: ${demoLeads('airbnb')[0].company}`, ok: true }, { type: AIRBNB_MESSAGE.body.replaceAll('{first}', demoLeads('airbnb')[0].first).replaceAll('{title}', HERO_LISTING.title.replace(' (demo)', '')), title: 'Message', ms: 1800 }],
  run: step => livePitch(step, 'airbnb'),
};

// =====================================================================
// AD REMAKES
// =====================================================================
const adThumbCache = {};
function adThumb(seed, plain = true, angle = 'pain', headline = '', button = '', size = 220) {
  const k = [seed, plain, angle, headline, size].join('|');
  if (!adThumbCache[k]) adThumbCache[k] = adCanvas({ plain, angle, headline, button, seed, size }).toDataURL('image/jpeg', 0.85);
  return adThumbCache[k];
}
function fbAd(ad, img, { headline, primary, description, button } = {}) {
  return `<div class="fb-ad"><div class="top"><div class="av">${esc(ad.page[0])}</div><div><b style="font-size:14px">${esc(ad.page)}</b><div style="font-size:12px;color:#65676b">Sponsored</div></div></div>
    <div class="pt">${esc(primary || ad.text)}</div><img src="${img}" alt="" style="width:100%;display:block">
    <div class="bot"><div><span>${esc((ad.page.split(' ')[0] || '').toUpperCase())}.EXAMPLE</span><b>${esc(headline || ad.text)}</b><span>${esc(description || '')}</span></div><span class="cta">${esc(button || 'Learn more')}</span></div></div>`;
}

const findAds = {
  key: 'h.ads.work.findads', track: 'ads', section: 'work', short: 'Find weak ads', title: 'Find weak ads',
  explain: 'Type a kind of business and a city. A robot reads real, running ads from the Meta Ad Library.',
  mainLabel: 'Read the Ad Library', uses: ['apify'], strip: strip('ads'),
  replaces: 'Finding clients by hand', saves: 'Hours of scrolling', costs: '~$0.03 est.',
  demo: () => ({ ads: ADS }),
  render(step) {
    const kind = state.inputs.adKind ?? AD_CITY.kind, city = state.inputs.adCity ?? AD_CITY.city;
    const top = `<div class="card" style="margin-bottom:16px"><div class="grid g2"><label class="field"><span class="label">Kind of business</span><input data-input="adKind" value="${esc(kind)}"></label><label class="field"><span class="label">City</span><input data-input="adCity" value="${esc(city)}"></label></div></div>`;
    const d = stepData(step);
    if (!d) return top + emptyFor(step, 'Running ads, each with a weakness tag, will show up here.');
    const sel = view(step, 'sel', 0);
    const ad = d.ads[sel] || d.ads[0];
    return top + `<div class="split"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ad</th><th>Page</th><th>Started</th><th>Runs on</th><th>Weakness</th></tr></thead><tbody>
      ${d.ads.map((a, i) => `<tr class="click ${i === sel ? 'sel' : ''}" data-adrow="${i}"><td><img src="${a.img || adThumb(a.seed)}" alt="" style="width:52px;height:52px;border-radius:6px;object-fit:cover;display:block"></td><td class="ink small">${esc(a.page)}</td><td class="small">${esc(a.started)}</td><td class="tiny">${esc(a.runs)}</td><td>${pill(a.weakness, 'orange')}</td></tr>`).join('')}</tbody></table></div>
      <div class="stack" style="position:sticky;top:10px">${fbAd(ad, ad.img || adThumb(ad.seed, true, 'pain', '', '', 480))}
        <div class="btns"><a class="btn sm" href="${esc(ad.url)}" target="_blank" rel="noopener">${icon('ext')}View on Ad Library</a><button class="btn main sm" data-remake="${sel}">Remake this ad</button></div></div></div>`;
  },
  bind(root, step) {
    root.querySelectorAll('[data-adrow]').forEach(r => r.onclick = () => setView(step, 'sel', Number(r.dataset.adrow)));
    root.querySelector('[data-remake]')?.addEventListener('click', e => { set({ inputs: { ...state.inputs, adPick: Number(e.currentTarget.dataset.remake) } }, { silent: true }); location.hash = '#/step/h.ads.work.ideas'; });
  },
  movie: () => [{ line: `Ad Library robot: running ads for "${AD_CITY.kind}" in ${AD_CITY.city}`, cost: '$0.00' }, { rows: { head: ['Page', 'Started', 'Weakness'], rows: ADS.map(a => [a.page, a.started, { html: pill(a.weakness, 'orange') }]) }, ms: 140 }, { line: '12 ads found, 12 with a clear weakness', ok: true }],
  async run(step) {
    const q = `${state.inputs.adKind || AD_CITY.kind} ${state.inputs.adCity || AD_CITY.city}`;
    const ok = await approve({ title: 'Read the Ad Library?', lines: [[`Running ads for "${q}"`, '$0.03 est.']], total: 0.03 });
    if (!ok) return;
    const r = await robot({ robot: 'adLibrary', query: q, count: 30, maxUsd: 0.1, label: `Read running ads for ${q}` });
    const ads = r.items.slice(0, 20).map((x, i) => { const text = x.snapshot?.body?.text || x.body || ''; const start = x.start_date ? new Date(x.start_date * 1000) : null; const months = start ? (Date.now() - start) / 2.6e9 : 0; return { id: x.ad_archive_id || 'A' + i, page: x.page_name || x.snapshot?.page_name || 'Page', started: start ? start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '', runs: (x.publisher_platform || []).join(', '), weakness: !text ? 'No words on the ad' : text.length < 40 ? 'Very short words' : months > 18 ? 'Same ad for a long time' : 'Weak call to action', text: text.slice(0, 200), img: x.snapshot?.images?.[0]?.original_image_url || x.snapshot?.cards?.[0]?.original_image_url || '', url: x.ad_archive_id ? `https://www.facebook.com/ads/library/?id=${x.ad_archive_id}` : 'https://www.facebook.com/ads/library/', seed: i + 3 }; });
    setLiveResult(step.key, { ads });
  },
};

function pickedAd() { const list = (isDemo() ? ADS : liveResult('h.ads.work.findads')?.ads) || ADS; return list[state.inputs.adPick || 0] || list[0]; }
function ideasData() { return isDemo() ? AD_IDEAS : liveResult('h.ads.work.ideas')?.ideas; }

const ideas = {
  key: 'h.ads.work.ideas', track: 'ads', section: 'work', short: 'Write 3 ad ideas', title: 'Write 3 new ad ideas',
  explain: 'Their ad today on the left, 3 new ideas on the right, one per angle: pain, proof and a real offer they already make.',
  mainLabel: 'Write again', uses: ['claude'], strip: strip('ads'),
  replaces: 'Ghostwriter OS ($2,999)', saves: '$2,999', costs: '~$0.05 est.',
  demo: () => AD_IDEAS,
  render(step) {
    const d = ideasData();
    const ad = pickedAd();
    if (!d) return emptyFor(step, 'Three new ad ideas will show up here.');
    const parts = [['primary', 'Primary text'], ['headline', 'Headline'], ['description', 'Description'], ['button', 'Button'], ['picture', 'Picture idea']];
    return `<div class="note small" style="margin-bottom:14px">${icon('shield', 'style="width:14px;vertical-align:-2px"')} Rules: never invent prices, reviews, numbers or offers. Only real services. No brackets or placeholders, ever.</div>
      <div class="split" style="grid-template-columns:300px minmax(0,1fr)"><div><span class="label">Their ad today</span>${fbAd(ad, ad.img || adThumb(ad.seed, true, 'pain', '', '', 480))}</div>
      <div class="stack">${d.map(x => `<div class="card"><div class="row between"><div class="row"><div class="h3">${esc(x.label)}</div>${pill(x.score + ' / 5', 'purple')}</div>${copyBtn(parts.map(([k, l]) => `${l}: ${x.parts[k]}`).join('\n'), 'Copy the whole ad')}</div>
        ${parts.map(([k, l]) => `<div class="row between mt12" style="align-items:flex-start;gap:12px"><div><span class="label" style="margin-bottom:2px">${l}</span><div class="${k === 'headline' ? 'ink' : 'small'}" style="${k === 'headline' ? 'font-weight:600' : ''}">${esc(x.parts[k])}</div></div>${copyBtn(x.parts[k], 'Copy', 'sm quiet')}</div>`).join('')}</div>`).join('')}</div></div>`;
  },
  movie: () => [{ line: 'Reading their ad and the services on their website' }, ...AD_IDEAS.map(x => ({ type: `${x.parts.headline}\n${x.parts.primary}\nButton: ${x.parts.button}`, title: `${x.label} angle . ${x.score} / 5`, ms: 1100 }))],
  async run(step) {
    const ok = await approve({ title: 'Write 3 new ad ideas?', lines: [['Claude writes 3 ideas', '$0.05 est.']], total: 0.05 });
    if (!ok) return;
    const ad = pickedAd();
    const { data } = await claudeJSON({ model: model(step.key), maxTokens: 2500, label: `Claude wrote 3 ad ideas for ${ad.page}`,
      system: 'Write Facebook ads for a local business. Never invent prices, reviews, numbers or offers. Only services the business really lists. No brackets or placeholders, ever. If you do not know a real offer, use a free estimate or inspection only if their ad or page mentions it, otherwise a simple "Call today".',
      prompt: `Business page: ${ad.page}\nTheir ad today: ${ad.text}\nReturn [3 x {"angle":"pain"|"proof"|"offer","label":"Pain"|"Proof"|"Offer","score": 1 to 5,"parts":{"primary","headline","description","button","picture" (a real looking photo idea, no text, no logos)}}]` });
    const clean = data.map(x => ({ ...x, parts: Object.fromEntries(Object.entries(x.parts).map(([k, v]) => [k, String(v).replace(/\[[^\]]*\]/g, '').replace(/\s{2,}/g, ' ').trim()])) }));
    setLiveResult(step.key, { ideas: clean });
  },
};

const makeAds = {
  key: 'h.ads.work.make', track: 'ads', section: 'work', short: 'Make the ads', title: 'Make the ads',
  explain: 'Higgsfield makes one real looking photo per idea, with no text and no logos. The app then puts the headline on top as clean text and adds an orange button, so the words are always sharp and spelled right.',
  mainLabel: 'Make 3 ad pictures', uses: ['higgsfield'], strip: strip('ads'),
  replaces: 'Making it by hand', saves: 'A designer, $100+ an ad', costs: '~$0.40 to $1 est.',
  demo: () => ({ demo: true }),
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Four ads in one row will show up here: theirs today, then 3 new ones.');
    const ad = pickedAd();
    const id = ideasData() || AD_IDEAS;
    return `<div class="grid g4">
      <div><span class="label">Their ad today</span><div class="adimg"><img src="${ad.img || adThumb(ad.seed, true, 'pain', '', '', 540)}" alt="Their ad today"></div></div>
      ${id.map((x, i) => `<div><span class="label">${esc(x.label)}</span><div class="adimg" data-adimg="${i}"></div><button class="btn sm mt8" data-addl="${i}">${icon('download')}Download</button></div>`).join('')}
    </div><div class="btns mt16"><button class="btn main" data-addl-all>${icon('download')}Download all</button><span class="small dim">1080 by 1080. File names use the business and the angle.</span></div>`;
  },
  bind(root, step) {
    const id = ideasData() || AD_IDEAS;
    const live = liveResult(step.key);
    const canvases = [];
    root.querySelectorAll('[data-adimg]').forEach(el => {
      const i = Number(el.dataset.adimg);
      const x = id[i];
      const make = bg => { const c = adCanvas({ angle: x.angle, headline: x.parts.headline, button: x.parts.button, seed: 7 + i, size: 1080 }); if (bg) { const ctx = c.getContext('2d'); const g = ctx.getImageData(0, 0, 1, 1); } return c; };
      if (live?.urls?.[i]) {
        // put clean text over the real photo
        const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 1080; const ctx = c.getContext('2d'); const s = Math.max(1080 / im.width, 1080 / im.height); ctx.drawImage(im, (1080 - im.width * s) / 2, (1080 - im.height * s) / 2, im.width * s, im.height * s); const overlay = adCanvas({ angle: x.angle, headline: x.parts.headline, button: x.parts.button, size: 1080, seed: 1 }); const oc = overlay.getContext('2d'); ctx.save(); const g = ctx.createLinearGradient(0, 0, 0, 450); g.addColorStop(0, 'rgba(10,10,16,.78)'); g.addColorStop(1, 'rgba(10,10,16,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 450); ctx.restore(); textOver(ctx, x.parts.headline, x.parts.button); canvases[i] = c; el.innerHTML = ''; el.appendChild(c); };
        im.src = live.urls[i];
      } else {
        const c = make(); canvases[i] = c; el.appendChild(c);
      }
    });
    const biz = slug((pickedAd().page || 'business').replace(' (demo)', ''));
    root.querySelectorAll('[data-addl]').forEach(b => b.onclick = () => { const i = Number(b.dataset.addl); downloadDataUrl(`${biz}-${id[i].angle}.png`, canvases[i].toDataURL('image/png')); });
    root.querySelector('[data-addl-all]')?.addEventListener('click', () => { canvases.forEach((c, i) => setTimeout(() => downloadDataUrl(`${biz}-${id[i].angle}.png`, c.toDataURL('image/png')), i * 300)); log('Downloaded 3 ad pictures', { icon: 'download', cost: 0 }); });
  },
  movie: () => [{ line: 'Higgsfield: 3 photos, no text, no logos' }, { html: `<div class="grid g3">${AD_IDEAS.map((x, i) => `<div class="adimg"><img src="${adCanvas({ angle: x.angle, headline: x.parts.headline, button: x.parts.button, seed: 7 + i, size: 400 }).toDataURL('image/jpeg', 0.8)}" alt=""></div>`).join('')}</div>`, ms: 1400 }, { line: 'Headlines added as clean text, orange buttons added', ok: true }],
  async run(step) {
    const id = ideasData();
    if (!id) throw new Error('Write the 3 ad ideas first.');
    const ok = await approve({ title: 'Make 3 ad pictures?', lines: id.map(x => [`${x.label}: ${x.parts.picture.slice(0, 50)}`, '$0.30 est.']), total: 0.9 });
    if (!ok) return;
    const urls = [];
    for (const x of id) { const tk = await token('spend', 0.3, 'ad'); const r = await api('higgsfield/generate', { kind: 'image', aspect: '1:1', prompt: x.parts.picture + ' Photo realistic. No text, no letters, no logos anywhere in the picture.', confirmToken: tk }); urls.push((await api('image', { url: r.url })).dataUrl); log(`Higgsfield made the ${x.label} picture`, { icon: 'photo', cost: 0.3, run: true, tool: 'higgsfield' }); }
    setLiveResult(step.key, { urls });
  },
};
function textOver(ctx, headline, button) {
  const S = 1080; ctx.fillStyle = '#fff'; ctx.font = `800 ${Math.round(S * 0.062)}px Inter, system-ui, sans-serif`; ctx.textBaseline = 'top';
  const words = String(headline).split(' '); const lines = []; let line = '';
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > S * 0.86 && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line);
  lines.slice(0, 3).forEach((l, i) => ctx.fillText(l, S * 0.07, S * 0.07 + i * S * 0.075));
  ctx.font = `700 ${Math.round(S * 0.036)}px Inter, system-ui, sans-serif`; const bw = ctx.measureText(button).width + S * 0.08, bh = S * 0.085, bx = S * 0.07, by = S * 0.86;
  ctx.fillStyle = '#FF6A1F'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, bh / 2) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.fillStyle = '#1d0c02'; ctx.textBaseline = 'middle'; ctx.fillText(button, bx + S * 0.04, by + bh / 2 + 1);
}

const adsPitch = {
  key: 'h.ads.clients.pitch', track: 'ads', section: 'clients', short: 'Pitch the owner', title: 'Pitch the owner',
  explain: 'An email that leads with the free remake, plus a short follow up. AI Ark finds a checked email for the business.',
  mainLabel: 'Find the owner\'s email', uses: ['aiark', 'claude'], strip: strip('ads'),
  replaces: 'Writing each pitch yourself', saves: '20 minutes a business', costs: '~$0.01 est.',
  demo: () => ({ leads: demoLeads('ads') }),
  render(step) {
    const ls = trackLeads('ads'); const lead = ls[0];
    if (!lead) return emptyFor(step, 'The owner\'s checked email and your pitch will show up here.');
    const co = lead.company.replace(' (demo)', '');
    return pitchView('ads', step, lead, AD_PITCH.subject.replace('{company}', co), AD_PITCH.body.replaceAll('{first}', lead.first), AD_PITCH.followup.replaceAll('{first}', lead.first), `<div class="row mt12" style="gap:10px"><img src="${adCanvas({ angle: 'pain', headline: AD_IDEAS[0].parts.headline, button: AD_IDEAS[0].parts.button, seed: 7, size: 300 }).toDataURL('image/jpeg', 0.8)}" alt="Attached: the free ad" style="width:110px;border-radius:8px"><span class="tiny dim">Attached: ${esc(slug(co))}-pain.png</span></div>`);
  },
  bind: (root, step) => bindPitch(root, step, 'ads', AD_PITCH),
  movie: () => [{ line: 'AI Ark: finding a checked email for Rick\'s Roofing ATX (demo)' }, { line: 'Verified: rick@ricksroofingatx.example', ok: true }, { type: AD_PITCH.body.replaceAll('{first}', 'Rick'), title: '3 free ad ideas for Rick\'s Roofing ATX', ms: 1700 }],
  run: step => livePitch(step, 'ads'),
};

// =====================================================================
// YOUTUBE SHORTS
// =====================================================================
const outliers = {
  key: 'h.shorts.work.outliers', track: 'shorts', section: 'work', short: 'Find videos that took off', title: 'Find videos that took off',
  explain: 'Look for a video with many times more views than that channel usually gets. That kind of video already works.',
  mainLabel: 'Find outliers', uses: ['apify'], strip: strip('shorts'),
  replaces: 'Finding clients by hand', saves: 'Hours of research', costs: '~$0.20 est.',
  demo: () => ({ rows: OUTLIERS }),
  render(step) {
    const niche = state.inputs.shortsNiche ?? SHORTS_NICHE;
    const top = `<div class="card" style="margin-bottom:16px"><label class="label" for="sn">Niche</label><input id="sn" data-input="shortsNiche" value="${esc(niche)}"></div>`;
    const d = stepData(step);
    if (!d) return top + emptyFor(step, 'Channels with an outlier video will show up here.');
    return top + `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Channel</th><th class="num">Subscribers</th><th class="num">Usual views</th><th class="num">This video</th><th class="num">Outlier</th><th>Video title</th></tr></thead><tbody>
      ${d.rows.map(o => `<tr><td class="ink">${esc(o.channel)}</td><td class="num">${short(o.subs)}</td><td class="num">${short(o.avg)}</td><td class="num">${short(o.views)}</td><td class="num"><span class="pill orange no-dot mono">${o.x}x</span></td><td class="small">${esc(o.title)}</td></tr>`).join('')}</tbody></table></div>
      <div class="note o mt16 small">"A small channel with a huge video proves the idea, not the channel, did the work."</div>`;
  },
  movie: () => [{ line: `YouTube robot: reading Shorts about "${SHORTS_NICHE}"`, cost: '$0.00' }, { rows: { head: ['Channel', 'Views', 'Outlier'], rows: OUTLIERS.map(o => [o.channel, short(o.views), o.x + 'x']) }, ms: 220 }, { line: 'The idea, not the channel, did the work', ok: true }],
  async run(step) {
    const q = state.inputs.shortsNiche || SHORTS_NICHE;
    const ok = await approve({ title: 'Find videos that took off?', lines: [[`YouTube robot, 60 Shorts about "${q}"`, '$0.20 est.']], total: 0.2 });
    if (!ok) return;
    const r = await robot({ robot: 'youtube', query: q + ' shorts', count: 60, maxUsd: 0.4, label: `Read Shorts about ${q}` });
    const by = {};
    for (const v of r.items) { const c = v.channelName; if (!c) continue; (by[c] = by[c] || { channel: c, subs: v.numberOfSubscribers || 0, vids: [] }).vids.push(v); }
    const rows = Object.values(by).map(c => { const views = c.vids.map(v => v.viewCount || 0); const avg = Math.max(1, Math.round(views.reduce((a, b) => a + b, 0) / views.length)); const best = c.vids.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))[0]; return { channel: c.channel, subs: c.subs, avg: c.vids.length > 1 ? avg : Math.round((c.subs || 1) * 0.3), views: best.viewCount || 0, title: best.title, url: best.url }; }).map(o => ({ ...o, x: Math.round(o.views / Math.max(1, o.avg)) })).filter(o => o.x >= 3).sort((a, b) => b.x - a.x).slice(0, 10);
    setLiveResult(step.key, { rows });
  },
};

const script = {
  key: 'h.shorts.work.script', track: 'shorts', section: 'work', short: 'Write the script', title: 'Write the script',
  explain: 'We copy the format: the hook, the pace, the visual idea. We never copy the words or the video.',
  mainLabel: 'Write the script', uses: ['claude'], strip: strip('shorts'),
  replaces: 'Ghostwriter OS ($2,999)', saves: '$2,999', costs: '~$0.05 est.',
  demo: () => SCRIPT,
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'An 8 line script under 60 seconds will show up here.');
    return `<div class="split"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Part</th><th>What they hear</th><th>What they see</th></tr></thead><tbody>${d.lines.map(l => `<tr><td class="mono">${l.n}</td><td>${pill(l.kind, l.kind === 'Hook' ? 'orange' : l.kind === 'End card' ? 'purple' : 'grey')}</td><td class="ink">${esc(l.text)}</td><td class="small">${esc(l.visual)}</td></tr>`).join('')}</tbody></table></div>
      <div class="stack"><div class="card"><div class="h3">Hook</div><p class="ink mt8">"${esc(d.hook)}"</p>${copyBtn(d.lines.map(l => `${l.n}. ${l.text} [${l.visual}]`).join('\n'), 'Copy the script')}</div>
      <div class="note o"><b class="peach">Heads up:</b> ${esc(d.warning)}</div><div class="note small">${esc(d.disclaimer)}</div></div></div>`;
  },
  movie: () => SCRIPT.lines.map(l => ({ type: `${l.text}\n[${l.visual}]`, title: `${l.n}. ${l.kind}`, ms: 450 })),
  async run(step) {
    const o = (liveResult('h.shorts.work.outliers')?.rows || [])[0];
    const ok = await approve({ title: 'Write the script?', lines: [['Claude writes an 8 line script', '$0.05 est.']], total: 0.05 });
    if (!ok) return;
    const { data } = await claudeJSON({ model: model(step.key), maxTokens: 2000, label: 'Claude wrote the Shorts script',
      system: 'Write a faceless animated YouTube Short under 60 seconds. Copy only the format of the outlier (hook, pace, visual idea), never its words. Make it useful and different. Money topics: add "not financial advice" on the end card.',
      prompt: `Outlier video: ${JSON.stringify(o || { title: 'What $100 becomes in 30 years' })}\nReturn {"hook","lines":[8 x {"n","kind" (Hook, Clip, Key line or End card),"text","visual"}],"warning":"${SCRIPT.warning}","disclaimer":"${SCRIPT.disclaimer}"}` });
    setLiveResult(step.key, data);
  },
};

const clips = {
  key: 'h.shorts.work.clips', track: 'shorts', section: 'work', short: 'Make the clips', title: 'Make the clips',
  explain: 'One short clip per script line, in order, ready to edit together. Hover a clip to play it.',
  mainLabel: 'Make 8 clips', uses: ['higgsfield'], strip: strip('shorts'),
  replaces: 'Making it by hand', saves: 'An animator, $50+ a video', costs: '~$0.30 a clip est.',
  demo: () => ({ demo: true }),
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Your clips will show up here, in script order.');
    const s = (isDemo() ? SCRIPT : liveResult('h.shorts.work.script')) || SCRIPT;
    return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${s.lines.map((l, i) => `<div class="clip" tabindex="0">${d.urls?.[i] ? `<video src="${esc(d.urls[i])}" muted loop playsinline style="width:100%;height:100%;object-fit:cover"></video>` : clipSVG(i)}<span class="idx">${l.n}</span><div class="cap">${esc(l.text)}</div></div>`).join('')}</div>
      <p class="tiny dim mt12">Clips play when you hover or focus them.</p>`;
  },
  bind(root) { root.querySelectorAll('.clip').forEach(c => { const v = c.querySelector('video'); const on = () => { c.classList.add('playing'); v?.play().catch(() => {}); }; const off = () => { c.classList.remove('playing'); v?.pause(); }; c.onmouseenter = on; c.onmouseleave = off; c.onfocus = on; c.onblur = off; }); },
  movie: () => [{ line: 'Higgsfield: 8 short clips, one per line' }, { html: `<div class="grid" style="grid-template-columns:repeat(8,1fr);gap:6px">${SCRIPT.lines.map((l, i) => `<div class="clip playing">${clipSVG(i)}<span class="idx">${l.n}</span></div>`).join('')}</div>`, ms: 2000 }, { line: '8 clips ready, in script order', ok: true }],
  async run(step) {
    const s = liveResult('h.shorts.work.script');
    if (!s) throw new Error('Write the script first.');
    const ok = await approve({ title: 'Make 8 clips?', lines: s.lines.map(l => [`${l.n}. ${l.visual.slice(0, 44)}`, '$0.30 est.']), total: 0.3 * s.lines.length });
    if (!ok) return;
    const urls = [];
    for (const l of s.lines) { const tk = await token('spend', 0.3, 'clip'); const r = await api('higgsfield/generate', { kind: 'video', aspect: '9:16', prompt: `Simple animated explainer clip, vertical 9:16, no text: ${l.visual}`, confirmToken: tk }); urls.push(r.url); log(`Higgsfield made clip ${l.n}`, { icon: 'video', cost: 0.3, run: true, tool: 'higgsfield' }); setLiveResult(step.key, { urls: [...urls] }); }
  },
};

const shortsPitch = {
  key: 'h.shorts.clients.pitch', track: 'shorts', section: 'clients', short: 'Offer it to channels', title: 'Offer it to channels',
  explain: 'Small channels on this topic want more videos. Offer one free sample.',
  mainLabel: 'Find channel emails', uses: ['aiark', 'claude'], strip: strip('shorts'),
  replaces: 'Writing each pitch yourself', saves: '20 minutes a channel', costs: '~$0.01 est.',
  demo: () => ({ leads: demoLeads('shorts') }),
  render(step) {
    const ls = trackLeads('shorts'); const lead = ls[0];
    if (!lead) return emptyFor(step, 'The channel contact and your offer will show up here.');
    return pitchView('shorts', step, lead, SHORTS_PITCH.subject, SHORTS_PITCH.body.replaceAll('{first}', lead.first).replaceAll('{title}', OUTLIERS[0].title), SHORTS_PITCH.followup.replaceAll('{first}', lead.first), '');
  },
  bind: (root, step) => bindPitch(root, step, 'shorts', SHORTS_PITCH),
  movie: () => [{ line: 'Reading channel About pages for a business email' }, { line: `Found: ${demoLeads('shorts')[0].company}`, ok: true }, { type: SHORTS_PITCH.body.replaceAll('{first}', demoLeads('shorts')[0].first).replaceAll('{title}', OUTLIERS[0].title), title: 'A free video for your channel', ms: 1600 }],
  run: step => livePitch(step, 'shorts'),
};

// ---------- shared pitch view ----------
function pitchView(track, step, lead, subject, body, followup, attach) {
  return `<div class="split"><div class="stack">
    <div class="email-prev"><div class="eh"><div><span>To</span><span class="nm">${esc(lead.name)} &lt;${esc(lead.email || 'no email yet')}&gt;</span></div><div><span>Subject</span><b>${esc(subject)}</b></div></div>
      <div class="eb" style="white-space:pre-wrap">${esc(body)}${attach}</div></div>
    <div class="btns">${copyBtn(subject + '\n\n' + body, 'Copy the message')}<button class="btn main" data-loadout>${icon('arrow')}Load into Leads & Outreach</button></div>
    <div class="card"><div class="row between"><div class="h3">Follow up, day 3</div>${copyBtn(followup)}</div><p class="mt8" style="margin:0">${esc(followup)}</p></div></div>
    <div class="stack"><div class="card"><div class="h3">The lead</div><div class="kv mt12"><span>Name</span><span class="nm">${esc(lead.name)}</span><span>Business</span><span>${esc(lead.company)}</span><span>Email</span><span class="mono small">${esc(lead.email || 'Not found')}</span><span>Where from</span><span>${esc(lead.source)}</span></div>
      <p class="tiny dim mt12">Public business info only. The app never looks up a private person's email.</p></div>
      <div class="card"><div class="h3">${trackLeads(track).filter(l => l.email).length} leads ready</div><p class="small dim mt8" style="margin:0">They go into "${esc(TRACKS[track].campaign)}", with this hustle's own inboxes.</p></div></div></div>`;
}
function bindPitch(root, step, track, msg) {
  root.querySelector('[data-loadout]')?.addEventListener('click', () => {
    set({ inputs: { ...state.inputs, ['emails:' + track]: [{ subject: msg.subject, body: msg.body.replace(/\n\nThanks for reading,\nJordan|\n\nJordan|\nJordan$/g, '') }, { subject: 'Re: ' + msg.subject, body: msg.followup }] } }, { silent: true });
    log(`Loaded the pitch as email 1 of "${TRACKS[track].campaign}"`, { icon: 'mail', cost: 0 });
    toast('Loaded. It is now email 1 of this campaign.');
    location.hash = '#/step/' + OUT_KEYS[track].prefix + '.inboxes';
  });
}
async function livePitch(step, track) {
  const src = track === 'airbnb' ? (liveResult('h.airbnb.work.hosts')?.listings || []).slice(0, 20).map(l => ({ name: l.host, company: l.title })) : track === 'ads' ? (liveResult('h.ads.work.findads')?.ads || []).map(a => ({ name: '', company: a.page })) : (liveResult('h.shorts.work.outliers')?.rows || []).map(o => ({ name: '', company: o.channel }));
  if (!src.length) throw new Error('Do the work steps first, so there are leads to look up.');
  const ok = await approve({ title: `Look up ${src.length} business emails?`, intro: 'AI Ark looks for a public business email. You only pay when one is found. Private people are never looked up.', lines: [['Most it can cost', `${src.length} credits`]], total: src.length * 0.03 });
  if (!ok) return;
  const tk = await token('spend', src.length * 0.03, 'emails');
  const r = await api('aiark/find', { leads: src.map((s, i) => ({ id: String(i), name: s.name, company: s.company })), confirmToken: tk });
  const leads = src.map((s, i) => { const x = r.results.find(y => y.id === String(i)) || {}; return { id: `${track}-${i}`, first: (s.name || 'there').split(' ')[0], name: s.name || s.company, company: s.company, email: x.email, emailStatus: x.status, source: 'AI Ark, public business info' }; });
  log(`Found ${leads.filter(l => l.email).length} business emails`, { icon: 'mail', run: true, tool: 'aiark' });
  setLiveResult(step.key, { leads });
}

// =====================================================================
// GET PAID (shared by all 3 hustles)
// =====================================================================
function takeHome(t) { const fee = t.price ? t.price * WHOP_FEE.pct + WHOP_FEE.fixed : 0; return Math.max(0, t.price - fee - t.cost); }
function mainTier(h) { const tiers = state.inputs['tiers:' + h] || GET_PAID[h].tiers; return tiers.find(t => t.main) || tiers[1]; }

function paidSteps(h) {
  const G = GET_PAID[h];
  const whopKey = 'whop:' + h;
  const price = {
    key: `h.${h}.paid.price`, track: h, section: 'paid', short: 'Set your price', title: 'Set your price',
    explain: 'Three prices: a free sample, the main package and a monthly option. Prices are a starting point. Ask your first clients.',
    mainLabel: 'Save my prices', uses: ['local'], strip: strip(h),
    replaces: 'Guessing your price', saves: 'Undercharging', costs: '$0',
    demo: () => G, liveDone: () => !!state.inputs['tiersSaved:' + h],
    render() {
      const tiers = state.inputs['tiers:' + h] || G.tiers;
      return `<div class="grid g3">${tiers.map((t, i) => `<div class="card ${t.main ? 'sel' : ''}"><div class="row between"><div class="h3">${esc(t.name)}</div>${t.main ? pill('Most pick this', 'orange') : ''}</div>
        <div class="row mt12" style="align-items:baseline;gap:6px"><span class="mono" style="font-size:36px;font-weight:650;color:var(--ink)">$</span><input type="number" min="0" data-tier="${i}" value="${t.price}" style="font:650 36px var(--mono);width:130px;padding:2px 8px;background:transparent;border-color:transparent"><span class="dim">${esc(t.unit)}</span></div>
        <p class="small">${esc(t.line)}</p>
        <div class="note small"><b class="ink">What you take home:</b> <span class="mono green">${money(takeHome(t))}</span><div class="tiny dim mt8">${money(t.price)} minus the Whop fee (about ${Math.round(WHOP_FEE.pct * 100)}% plus 30 cents, est.) minus your tool costs (${money(t.cost)} est.), before tax.</div></div></div>`).join('')}</div>
        <p class="small dim mt12">Prices are a starting point. Ask your first clients.</p>`;
    },
    bind(root) { root.querySelectorAll('[data-tier]').forEach(inp => inp.onchange = () => { const tiers = (state.inputs['tiers:' + h] || G.tiers).map(x => ({ ...x })); tiers[Number(inp.dataset.tier)].price = Math.max(0, Number(inp.value) || 0); set({ inputs: { ...state.inputs, ['tiers:' + h]: tiers } }); }); },
    movie: () => [...G.tiers.map(t => ({ line: `${t.name}: ${money(t.price, 0)} ${t.unit}, you keep about ${money(takeHome(t))} (est.)`, ok: true, ms: 400 }))],
    async run() { set({ inputs: { ...state.inputs, ['tiersSaved:' + h]: true } }); log(`Saved prices for ${HUSTLES[h].name}`, { icon: 'coin', cost: 0 }); toast('Saved'); },
  };
  const whop = {
    key: `h.${h}.paid.whop`, track: h, section: 'paid', short: 'Make the Whop page', title: 'Make the Whop page',
    explain: '"Put it on Whop" creates the product hidden, with stock 0. When a client says yes, set stock above 0 and make it visible.',
    mainLabel: () => whopState(whopKey).productId ? (whopState(whopKey).visible ? 'Hide it again' : 'Push live to Whop') : 'Put it on Whop', mainCls: 'money', uses: ['whop'], strip: strip(h),
    replaces: 'Building a sales page by hand', saves: 'A web designer, $300+', costs: '$0',
    demo: () => ({}), liveDone: () => !!liveResult(whopKey)?.productId,
    render() {
      const w = whopState(whopKey); const t = mainTier(h);
      if (!w.productId) return emptyFor(BY_KEY[`h.${h}.paid.whop`], 'Your Whop product card will show up here.');
      return `<div class="split"><div class="card"><div class="card-head"><div class="h3">${icon('store', 'style="width:16px"')}${w.visible ? 'Live on Whop' : 'Live on Whop (unlisted)'}</div>${w.visible ? pill('Visible', 'green') : pill('Hidden', 'orange')}</div>
        <div class="kv"><span>Product</span><span>${esc(G.product)}</span><span>Product ID</span><span class="mono">${esc(w.productId)}</span><span>Plan</span><span>${esc(t.name)}, ${money(t.price, 0)} ${esc(t.unit)}</span><span>Visibility</span><span>${w.visible ? 'Visible' : 'Hidden'}</span><span>Stock</span><span class="mono">${w.visible ? '25' : '0'}</span><span>Checkout link</span><span class="mono small" style="word-break:break-all">${esc(w.checkout || '')}</span></div>
        <div class="btns mt16"><a class="btn sm" href="${esc(w.url)}" target="_blank" rel="noopener">${icon('ext')}View on Whop</a>${copyBtn(w.checkout || '', 'Copy checkout link')}</div></div>
        <div class="card"><div class="h3">When a client says yes</div><p class="small mt8">Set stock above 0 and make it visible. Each change has its own yes.</p>
          <div class="row mt12"><span class="small">Hidden</span><button class="switch ${w.visible ? 'on' : ''}" data-whopswitch role="switch" aria-checked="${!!w.visible}" aria-label="Visible on Whop"></button><span class="small">Visible</span></div>
          <div class="btns mt16">${w.visible ? '' : '<button class="btn money" data-whopgo="visible">Push live to Whop</button>'}</div></div></div>`;
    },
    bind(root) {
      const t = mainTier(h);
      const prod = { title: G.product, headline: t.line, description: t.line, price: t.price, monthly: !!t.monthly };
      root.querySelector('[data-whopswitch]')?.addEventListener('click', e => whopAction(whopState(whopKey).visible ? 'hide' : 'visible', prod, whopKey, e.currentTarget));
      root.querySelector('[data-whopgo]')?.addEventListener('click', e => whopAction('visible', prod, whopKey, e.currentTarget));
    },
    movie: () => [{ line: `Whop: creating "${G.product}", hidden, stock 0` }, { line: 'Product ID prod_demo_' + h.toUpperCase() + ' (placeholder)', ok: true }, { line: 'Checkout link ready', ok: true }],
    async run() { const t = mainTier(h); const w = whopState(whopKey); await whopAction(w.productId ? (w.visible ? 'hide' : 'visible') : 'publish', { title: G.product, headline: t.line, description: t.line, price: t.price, monthly: !!t.monthly }, whopKey); },
  };
  const paylink = {
    key: `h.${h}.paid.paylink`, track: h, section: 'paid', short: 'Send the pay link', title: 'Send the pay link',
    explain: 'The client said yes in Replies. Send one short email with the Whop pay link.',
    mainLabel: 'Send the pay link', mainCls: 'money', uses: ['instantly'], strip: strip(h),
    replaces: 'Chasing payment by hand', saves: 'Awkward back and forth', costs: '$0',
    demo: () => ({}), liveDone: () => !!state.inputs['paySent:' + h],
    render() {
      const lead = trackLeads(h)[0]; const t = mainTier(h); const w = whopState(whopKey);
      const body = `Hi ${lead?.first || 'there'},\n\nThank you for saying yes! Here is the link to pay for the ${t.name} (${money(t.price, 0)} ${t.unit}):\n${w.checkout || '(put it on Whop first)'}\n\nAs soon as it goes through, I will get started.\n\nJordan`;
      return `<div class="split"><div class="email-prev"><div class="eh"><div><span>To</span><span class="nm">${esc(lead ? `${lead.name} <${lead.email}>` : 'Your client')}</span></div><div><span>Subject</span><b>Your link for the ${esc(t.name)}</b></div></div><div class="eb" style="white-space:pre-wrap">${esc(body)}</div></div>
        <div class="stack"><div class="card"><div class="h3">Only after your second yes</div><p class="small mt8">This email goes to one client who already said yes. Nothing sends until you confirm.</p><div class="btns">${copyBtn(body, 'Copy the email')}</div>${state.inputs['paySent:' + h] ? '<div class="note g mt12 small">Sent. Whop emails them a receipt when they pay.</div>' : ''}</div></div></div>`;
    },
    movie: () => [{ type: `Hi ${demoLeads(h)[0].first},\n\nThank you for saying yes! Here is the link to pay for the ${mainTier(h).name}...`, title: 'Pay link email', ms: 1200 }, { line: 'Waiting for your second yes before it sends', ok: true }],
    async run() {
      const lead = trackLeads(h)[0];
      const ok = await confirmBox({ title: 'Send the pay link?', serious: `One email goes to ${lead?.name || 'your client'}.`, yes: 'Yes, send it', yesCls: 'money' });
      if (!ok) { toast('Cancelled. Nothing was sent.'); return; }
      if (!isDemo()) toast('Copy the email and send it from your Instantly inbox. The app does not send single emails on its own.');
      set({ inputs: { ...state.inputs, ['paySent:' + h]: true } });
      log(`Pay link email ${isDemo() ? 'marked as sent (demo)' : 'ready to send'} for ${HUSTLES[h].name}`, { icon: 'send', cost: 0 });
    },
  };
  const deliver = {
    key: `h.${h}.paid.deliver`, track: h, section: 'paid', short: 'Deliver and get a review', title: 'Deliver and get a review',
    explain: 'Whop emails the client a download link the moment they pay. Then ask for a review 3 days later.',
    mainLabel: 'Mark as delivered', uses: ['whop'], strip: strip(h),
    replaces: 'Emailing files by hand', saves: 'Lost files and missed follow ups', costs: '$0',
    demo: () => ({}), liveDone: () => !!state.inputs['delivered:' + h],
    render() {
      const lead = trackLeads(h)[0];
      const d = G.delivery;
      const files = h === 'airbnb' ? Array.from({ length: d.files }, (_, i) => `<div style="aspect-ratio:3/2;border-radius:8px;overflow:hidden"><img data-dphoto="${i}" alt="" style="width:100%;height:100%;object-fit:cover"></div>`).join('')
        : h === 'ads' ? AD_IDEAS.map((x, i) => `<div class="adimg"><img src="${adCanvas({ angle: x.angle, headline: x.parts.headline, button: x.parts.button, seed: 7 + i, size: 300 }).toDataURL('image/jpeg', 0.8)}" alt=""></div>`).join('')
        : SCRIPT.lines.slice(0, 4).map((l, i) => `<div class="clip">${clipSVG(i)}<span class="idx">Short ${i + 1}</span></div>`).join('');
      return `<div class="card"><div class="card-head"><div class="h3">The finished files: ${d.files} ${esc(d.label)}</div>${pill('Delivered by Whop on payment', 'green')}</div><div class="grid" style="grid-template-columns:repeat(${h === 'airbnb' ? 5 : 4},1fr);gap:8px">${files}</div></div>
        <div class="grid g2 mt16"><div class="card"><div class="row between"><div class="h3">Delivery message</div>${copyBtn(d.message.replaceAll('{first}', lead?.first || 'there'))}</div><div class="draft mt12">${esc(d.message.replaceAll('{first}', lead?.first || 'there'))}</div></div>
        <div class="card"><div class="row between"><div class="h3">Review request, 3 days later</div>${copyBtn(d.review.replaceAll('{first}', lead?.first || 'there'))}</div><div class="draft mt12">${esc(d.review.replaceAll('{first}', lead?.first || 'there'))}</div></div></div>
        <div class="card mt16"><div class="h3">Next ideas</div><ul class="mt8" style="margin-bottom:0">${d.next.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>`;
    },
    bind(root) { root.querySelectorAll('[data-dphoto]').forEach(img => { const l = LISTINGS[Number(img.dataset.dphoto)]; setTimeout(() => { img.src = listingPhoto(l.seed + 1000, l.kind, 9.5); }, 30 * Number(img.dataset.dphoto)); }); },
    movie: () => [{ line: 'Whop: payment received (demo), download link sent', ok: true }, { type: G.delivery.message.replaceAll('{first}', demoLeads(h)[0].first), title: 'Delivery message', ms: 1000 }, { line: 'Review request scheduled for 3 days later', ok: true }],
    async run() { set({ inputs: { ...state.inputs, ['delivered:' + h]: true } }); log(`Marked ${HUSTLES[h].name} as delivered`, { icon: 'check', cost: 0 }); toast('Marked as delivered'); },
    finish: () => `<div class="btns"><button class="btn main" data-go="#/home">All 3 done: back to Home${icon('arrow')}</button><button class="btn" data-go="#/hustles">Pick another hustle</button></div>`,
  };
  return [price, whop, paylink, deliver];
}

// image fetch helper is used in Live mode only; register order sets the step order
register([hosts, spot, fix, airbnbPitch, ...outreachSteps('airbnb', 'h.airbnb.clients', 'clients', 'airbnb').map(s => ({ ...s, strip: strip('airbnb') })), ...paidSteps('airbnb')]);
register([findAds, ideas, makeAds, adsPitch, ...outreachSteps('ads', 'h.ads.clients', 'clients', 'ads').map(s => ({ ...s, strip: strip('ads') })), ...paidSteps('ads')]);
register([outliers, script, clips, shortsPitch, ...outreachSteps('shorts', 'h.shorts.clients', 'clients', 'shorts').map(s => ({ ...s, strip: strip('shorts') })), ...paidSteps('shorts')]);
