// Digital Product, step 1: Build it (7 small steps).
import { state, set, refresh, setLiveResult, liveResult, isDemo, log } from '../core/store.js';
import { esc, icon, pill, ring, bar, money, fmt, short, srcify, seg, tabs, copyBtn, toast, wordsIn } from '../core/ui.js';
import { approve, claudeJSON, robot } from '../core/api.js';
import { coverSVG, foodSVG } from '../core/art.js';
import { register, frame, stepData, emptyFor, view, setView } from './frame.js';
import { IDEA, RESEARCH, POCKETS, SCORE_KEYS, PLANS, READY, CREATOR } from '../data/product.js';
import { CHAPTERS, SOURCES, DISCLAIMER, KITCHEN_BOXES, VOICE_SAMPLE, bookWords } from '../data/book.js';

const fmtName = () => ({ ebook: 'ebook', course: 'video course', coaching: 'coaching offer' }[state.format]);
const unitName = () => ({ ebook: 'chapter', course: 'lesson', coaching: 'week' }[state.format]);
const idea = () => state.inputs.idea ?? IDEA.text;
const model = key => state.stepModel[key];

// ---------- 6.1 Your idea ----------
const ideaStep = {
  key: 'p.build.idea', track: 'product', section: 'build', short: 'Your idea', title: 'Your idea',
  explain: 'Type a topic or a group of people. The app finds what they already pay for.',
  mainLabel: 'Save my idea', uses: ['local'],
  replaces: 'Synthesize AI ($2,999 package)', saves: '$2,999', costs: '$0, about 1 minute',
  demo: () => ({ text: IDEA.text, kind: 'topic' }),
  liveDone: () => !!state.inputs.ideaSaved,
  render(step) {
    const kind = state.inputs.ideaKind || 'topic';
    return `<div class="split">
      <div class="card">
        <label class="label" for="idea-box">Your idea</label>
        <textarea id="idea-box" data-input="idea" rows="3" style="font-size:22px;font-weight:600;min-height:110px" placeholder="A topic, or a group of people">${esc(idea())}</textarea>
        <div class="row wrap mt12">${IDEA.chips.map(c => `<button class="chip ${idea() === c ? 'on' : ''}" data-ideachip="${esc(c)}">${esc(c)}</button>`).join('')}</div>
        <div class="mt16"><span class="label">This is</span>${seg('ideaKind', [['topic', 'A topic'], ['group', 'A group of people'], ['know', 'Something I know well']], kind)}</div>
        ${state.inputs.ideaSaved || isDemo() ? `<div class="note g mt16">${icon('check', 'style="width:14px;height:14px;vertical-align:-2px;color:var(--green)"')} Saved: <b class="ink">${esc(idea())}</b></div>` : ''}
      </div>
      <div class="card">
        <div class="h3">What happens next</div>
        <ol class="mt12" style="padding-left:20px;margin-bottom:0">
          <li>Robots read what buyers say on Reddit, Amazon, Etsy, TikTok and YouTube.</li>
          <li class="mt8">AI scores 5 buyer groups out of 25.</li>
          <li class="mt8">Then it writes the plan for your ${fmtName()}.</li>
        </ol>
        <p class="small dim mt16">This step costs nothing. Next step: about $0.62 est.</p>
      </div>
    </div>`;
  },
  bind(root, step) {
    root.querySelectorAll('[data-ideachip]').forEach(b => b.onclick = () => { state.inputs = { ...state.inputs, idea: b.dataset.ideachip }; set({ inputs: state.inputs }); });
  },
  async run() {
    const text = (state.inputs.idea ?? '').trim() || IDEA.text;
    state.inputs = { ...state.inputs, idea: text, ideaSaved: true };
    set({ inputs: state.inputs });
    log(`Saved your idea: ${text}`, { icon: 'check', cost: 0 });
    toast('Saved');
  },
  movie: () => [{ line: 'Reading your idea' }, { type: idea(), title: 'Idea', ms: 700 }, { line: 'Saved on this computer', ok: true }],
};

// ---------- 6.2 See what sells ----------
const researchStep = {
  key: 'p.build.research', track: 'product', section: 'build', short: 'See what sells', title: 'See what sells',
  explain: 'Five robots read public pages about your idea at the same time, then sort what buyers say and what they already pay for.',
  mainLabel: 'Run 5 robots', uses: ['apify', 'claude'],
  replaces: 'Synthesize AI market research', saves: 'Hours of reading, part of $2,999', costs: '~$0.62 est., about 3 minutes',
  demo: () => RESEARCH,
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Quotes, listings and a crowd check will show up here.');
    const max = Math.max(...d.crowded.map(c => c.count));
    return `<div class="grid g3">
      <div class="card"><div class="card-head"><div class="h3">${icon('users', 'style="width:16px"')}What buyers say</div>${pill(d.quotes.length + ' quotes', 'purple')}</div>
        <div class="stack">${d.quotes.map(q => `<div style="border-left:2px solid var(--purple);padding-left:12px"><div class="ink small">"${esc(q.text)}"</div><a class="tiny" href="${esc(q.url)}" target="_blank" rel="noopener">${esc(q.where)}${isDemo() ? ' (demo quote)' : ''}</a></div>`).join('')}</div></div>
      <div class="card"><div class="card-head"><div class="h3">${icon('coin', 'style="width:16px"')}What they already pay for</div></div>
        <div class="stack">${d.listings.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener" class="card tight flat" style="display:block;text-decoration:none"><div class="row between"><b class="ink small">${esc(l.title)}</b><span class="mono peach">${money(l.price)}</span></div><div class="tiny dim mt8">${esc(l.where)}${l.reviews ? ' . ' + fmt(l.reviews) + ' reviews' : ''} . ${esc(l.note)}</div></a>`).join('')}</div></div>
      <div class="card"><div class="card-head"><div class="h3">${icon('chart', 'style="width:16px"')}How crowded it is</div></div>
        <div class="stack">${d.crowded.map(c => `<div><div class="row between small"><span>${esc(c.where)}</span><span class="mono ink">${short(c.count)}</span></div>${bar(c.count, max)}<div class="tiny dim">${esc(c.label)}</div></div>`).join('')}</div>
        <div class="note o mt16"><b class="peach">Verdict:</b> <span class="ink">${esc(d.verdict)}</span></div></div>
    </div>
    <div class="card mt16"><div class="h3">Searches it ran</div><div class="row wrap mt12">${(d.searches || []).map(s => `<span class="pill no-dot mono">${esc(s)}</span>`).join('')}</div></div>`;
  },
  movie: () => [
    ...RESEARCH.robots.map(r => ({ line: `${r.name}: reading ${r.count} results`, cost: '$0.00', ms: 300 })),
    ...RESEARCH.searches.slice(0, 6).map(s => ({ line: s, ms: 160 })),
    { head: 'What buyers say' },
    ...RESEARCH.quotes.slice(0, 3).map(q => ({ type: `"${q.text}"  (${q.where}, demo quote)`, ms: 700 })),
    { stats: RESEARCH.crowded.slice(0, 4).map(c => [c.where, c.count]) },
    { line: 'Verdict: ' + RESEARCH.verdict, ok: true },
  ],
  async run(step) {
    const q = idea();
    const cap = state.server?.settings?.apifyRunCap ?? 1;
    const robots = RESEARCH.robots;
    const ok = await approve({ title: 'Run 5 robots?', intro: `They read public pages about "${q}". Each run has a hard money cap of ${money(cap)}.`, lines: robots.map(r => [`${r.name}, ${r.count} results`, money(r.price) + ' est.']), total: robots.reduce((a, r) => a + r.price, 0) + 0.02, yes: 'Yes, run them' });
    if (!ok) return;
    const results = await Promise.allSettled(robots.map(r => robot({ robot: r.id, query: q, count: r.count, maxUsd: Math.min(cap, r.price * 2), label: `${r.name}: read results for "${q}"` })));
    const failed = robots.filter((r, i) => results[i].status === 'rejected');
    if (failed.length === robots.length) throw results[0].reason;
    const sample = results.map((r, i) => r.status === 'fulfilled' ? { source: robots[i].name, items: r.value.items.slice(0, 25).map(x => JSON.stringify(x).slice(0, 600)) } : { source: robots[i].name, failed: true });
    const { data } = await claudeJSON({
      model: model(step.key), maxTokens: 6000, label: 'Claude sorted the research',
      system: 'You sort market research for a beginner. Use only what is in the data. Never invent quotes, prices, numbers or links. Quote buyers word for word.',
      prompt: `Idea: ${q}\nRaw robot results (JSON lines):\n${JSON.stringify(sample).slice(0, 60000)}\n\nReturn {"quotes":[{"text","where","url"}] (6 to 8, exact words from posts or comments, with the real url), "listings":[{"title","where","price" (number),"reviews" (number or null),"note","url"}] (up to 6, only real items with prices), "crowded":[{"where","count","label"}] (one per source, count of results read), "verdict": one short line, "searches": the searches used}`,
    });
    setLiveResult(step.key, { ...data, failed: failed.map(f => f.name) });
    if (failed.length) toast(`${failed.map(f => f.name).join(', ')} failed. The others kept going. Run again for just that one.`, 'err');
  },
};

// ---------- 6.3 Pick your buyers ----------
const pocketsStep = {
  key: 'p.build.pockets', track: 'product', section: 'build', short: 'Pick your buyers', title: 'Pick your buyers',
  explain: 'Claude turns the research into 5 pockets. A pocket is one specific person with one specific problem, scored out of 25.',
  mainLabel: 'Score 5 pockets', uses: ['claude'],
  replaces: 'Synthesize AI buyer scoring', saves: 'A week of guessing', costs: '~$0.31 est., about 3 minutes',
  demo: () => POCKETS,
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Five scored buyer pockets will show up here.');
    const list = [...d].sort((a, b) => b.total - a.total);
    const picked = state.inputs.pocket || list[0].id;
    return `<div class="stack">${list.map((p, i) => `
      <div class="card ${picked === p.id ? 'sel' : ''}">
        <div class="row" style="align-items:flex-start;gap:18px">
          ${ring(p.total, 25, 72, i === 0 ? 'var(--orange)' : 'var(--purple-2)')}
          <div style="flex:1;min-width:0">
            <div class="row wrap"><div class="h3">${esc(p.name)}</div>${i === 0 ? pill('Best pick', 'orange') : ''}${picked === p.id ? pill('Picked', 'green') : ''}</div>
            <p class="ink mt8" style="margin-bottom:10px">${esc(p.pocket)}</p>
            <div class="grid g5" style="gap:10px">${SCORE_KEYS.map(([k, l]) => `<div><div class="row between tiny"><span class="dim">${l}</span><span class="mono ink">${p.scores[k]}</span></div>${bar(p.scores[k], 5)}</div>`).join('')}</div>
            <div class="grid g2 mt12 small"><div><span class="dim">Why it can win:</span> ${esc(p.why)}</div><div><span class="dim">What buyers already pay for:</span> ${esc(p.pays)}</div></div>
            <details class="mt12"><summary class="small lilac" style="cursor:pointer">See the proof</summary>
              <div class="grid g2 mt12 small">
                <div><b class="ink">Their pains</b><ul>${p.proof.pains.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
                  <b class="ink">Where they hang out</b><div class="row wrap mt8">${p.proof.hangouts.map(h => `<span class="pill no-dot">${esc(h)}</span>`).join('')}</div>
                  <p class="mt12"><b class="ink">Rough size:</b> ${esc(p.proof.size)}</p></div>
                <div><b class="ink">Real quotes</b>${(p.proof.quotes || []).length ? p.proof.quotes.map(qi => { const q = (typeof qi === 'number' ? RESEARCH.quotes[qi] : qi); return q ? `<p class="mt8">"${esc(q.text)}" <a href="${esc(q.url)}" target="_blank" rel="noopener" class="tiny">${esc(q.where)}</a></p>` : ''; }).join('') : '<p class="dim mt8">Run See what sells for this idea to collect quotes.</p>'}</div>
              </div></details>
          </div>
          <button class="btn ${picked === p.id ? '' : 'main'} sm" data-pickpocket="${p.id}">${picked === p.id ? 'Picked' : 'Pick this one'}</button>
        </div>
      </div>`).join('')}</div>`;
  },
  bind(root) {
    root.querySelectorAll('[data-pickpocket]').forEach(b => b.onclick = () => { set({ inputs: { ...state.inputs, pocket: b.dataset.pickpocket } }); toast('Picked'); });
  },
  movie: () => [
    { line: 'Reading 8 quotes, 6 listings, 5 crowd counts' },
    ...POCKETS.map(p => ({ line: `${p.name}: ${p.total} / 25`, ok: true, ms: 380 })),
    { type: POCKETS[0].pocket, title: 'Best pick', ms: 1400 },
  ],
  async run(step) {
    const r = liveResult('p.build.research');
    if (!r) throw new Error('Run See what sells first, so the scores use real research.');
    const ok = await approve({ title: 'Score 5 pockets?', lines: [['Claude reads your research and scores 5 pockets', '$0.31 est.']], total: 0.31 });
    if (!ok) return;
    const { data } = await claudeJSON({
      model: model(step.key), maxTokens: 6000, label: 'Claude scored 5 buyer pockets',
      system: 'You score buyer pockets for a beginner making a digital product. A pocket is one specific person with one specific problem: "Help [person] get [result] without [pain]." Never a broad topic. Use only the research given. Mark any guessed size with "(est.)".',
      prompt: `Idea: ${idea()}\nResearch: ${JSON.stringify(r).slice(0, 30000)}\n\nReturn an array of 5 objects: {"id","name","pocket","scores":{"lasts","easy","runs","again","room"} each 1 to 5,"why","pays","proof":{"pains":[],"quotes":[{"text","where","url"}] (only from the research),"hangouts":[],"size"}}`,
    });
    setLiveResult(step.key, data.map(p => ({ ...p, total: Object.values(p.scores).reduce((a, b) => a + Number(b), 0) })));
  },
};

// ---------- 6.4 Product plan ----------
const planStep = {
  key: 'p.build.plan', track: 'product', section: 'build', short: 'Product plan', title: 'Product plan',
  explain: 'Pick the format. The plan changes with it: chapters for an ebook, lessons for a course, weeks for coaching.',
  mainLabel: () => PLANS[state.format].button, uses: ['claude'],
  replaces: 'Digital Product Formula 2.0 planning ($1,495)', saves: '$1,495', costs: '~$0.18 est., about 1 minute',
  demo: () => PLANS[state.format],
  render(step) {
    const top = `<div class="row between wrap" style="margin-bottom:16px">${seg('format', [['ebook', 'Ebook'], ['course', 'Video course'], ['coaching', 'Coaching']], state.format)}<span class="small dim">Same as the dropdown in the sidebar</span></div>`;
    const d = stepData(step);
    if (!d) return top + emptyFor(step, 'Your plan will show up here.');
    const p = d.unit === state.format || d.unit ? d : PLANS[state.format];
    return top + `<div class="split">
      <div class="stack">
        <div class="card"><div class="tiny lilac" style="letter-spacing:.12em;text-transform:uppercase;font-weight:600">${esc(fmtName())}</div>
          <h2 class="h2 mt8">${esc(p.title)}</h2><p class="lede" style="font-size:15.5px;margin-top:6px">${esc(p.subtitle)}</p>
          <div class="note mt12"><b class="ink">Promise:</b> ${esc(p.promise)}</div></div>
        <div class="card"><div class="h3">Before and After</div>
          <div class="tbl-wrap mt12"><table class="tbl"><thead><tr><th></th><th>Today</th><th>After</th></tr></thead><tbody>
          ${['have', 'do', 'feel'].map(k => `<tr><td class="ink" style="text-transform:capitalize">${k}</td><td>${esc(p.before[k])}</td><td class="ink">${esc(p.after[k])}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="card"><div class="h3">The journey in 4 stages</div>
          <div class="grid g4 mt12">${p.journey.map((j, i) => `<div class="card tight flat" style="background:var(--card-2)"><div class="mono lilac small">${i + 1}</div><b class="ink">${esc(j.stage)}</b><div class="small dim mt8">${esc(j.milestone)}</div></div>`).join('')}</div></div>
        <div class="card"><div class="h3">The outline: ${p.outline.length} ${esc(unitName())}s</div>
          <ol class="mt12" style="padding-left:22px;margin:12px 0 0">${p.outline.map(o => `<li class="mt8"><b class="ink">${esc(o.title)}</b>${o.script ? `<div class="small dim">${esc(o.script)}</div>` : ''}${o.call ? `<div class="small dim">${esc(o.call)}</div>` : ''}</li>`).join('')}</ol>
          ${state.format === 'ebook' ? '<p class="tiny dim mt12">Rules: chapter 1 is "Start Here", a day by day plan sits at the end, and there is a "when to get help" chapter because the topic touches health.</p>' : ''}</div>
      </div>
      <div class="stack">
        <div class="card"><div class="h3">Suggested price</div><div class="mono" style="font-size:44px;font-weight:650;color:var(--orange-ink);margin:8px 0">${money(p.price, 0)}</div><p class="small">${esc(p.priceWhy)}</p></div>
        <div class="card"><div class="h3">Bonuses</div><ul class="mt12" style="padding-left:18px;margin-bottom:0">${p.bonuses.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>
      </div></div>`;
  },
  movie: () => {
    const p = PLANS[state.format];
    return [{ line: `Format: ${fmtName()}` }, { type: `${p.title}\n${p.subtitle}`, title: 'Title', ms: 1000 }, { type: p.promise, title: 'Promise', ms: 900 }, ...p.outline.map(o => ({ line: `${unitName()} ${o.n}: ${o.title}`, ok: true, ms: 160 })), { line: `Suggested price: ${money(p.price, 0)}`, ok: true }];
  },
  async run(step) {
    const pockets = liveResult('p.build.pockets');
    const ok = await approve({ title: `Plan the ${fmtName()}?`, lines: [[`Claude writes the plan for your ${fmtName()}`, '$0.18 est.']], total: 0.18 });
    if (!ok) return;
    const n = { ebook: 10, course: 6, coaching: 4 }[state.format];
    const { data } = await claudeJSON({
      model: model(step.key), maxTokens: 5000, label: `Claude planned the ${fmtName()}`,
      system: 'You plan a digital product for a beginner. Plain words. Never promise results. Base the price on what buyers already pay in the research.',
      prompt: `Idea: ${idea()}\nPicked pocket: ${JSON.stringify((pockets || []).find(p => p.id === state.inputs.pocket) || (pockets || [])[0] || {})}\nResearch prices: ${JSON.stringify(liveResult('p.build.research')?.listings || [])}\nFormat: ${state.format}\nReturn {"title","subtitle","promise","before":{"have","do","feel"},"after":{"have","do","feel"},"journey":[4 x {"stage","milestone"}],"outline":[${n} x {"n","title"${state.format === 'course' ? ',"script","sheet"' : state.format === 'coaching' ? ',"call","checkin"' : ''}}],"bonuses":[4 strings],"price":number,"priceWhy"}. ${state.format === 'ebook' ? 'Chapter 1 is "Start Here". One of the last chapters is a day by day plan. Add a "when to get help" chapter if the topic touches health, money or safety.' : ''}`,
    });
    setLiveResult(step.key, { ...data, unit: state.format, button: PLANS[state.format].button });
  },
};

// ---------- 6.5 Build the ebook ----------
function chapterHtml(c, i, { kitchen = false } = {}) {
  const block = ([k, v]) => {
    if (k === 'h') return `<h3>${esc(v)}</h3>`;
    if (k === 'p') return `<p>${srcify(v)}</p>`;
    if (k === 'list') return `<ul>${v.map(x => `<li>${srcify(x)}</li>`).join('')}</ul>`;
    const names = { try: 'Try tonight', safety: 'Safety note', redflag: 'Red flag', picture: 'Picture this', kitchen: 'From the kitchen' };
    if (k === 'picture') return `<div class="box picture"><p>${srcify(v)}</p></div>`;
    return `<div class="box ${k}"><span class="bt">${names[k] || k}</span><p>${srcify(v)}</p></div>`;
  };
  const body = c.blocks.map(block);
  if (kitchen && KITCHEN_BOXES[c.id]) body.splice(2, 0, `<div class="box kitchen"><span class="bt">From Maya's kitchen</span><p>${esc(KITCHEN_BOXES[c.id].replace(/^From Maya's kitchen \(demo\): /, ''))}</p></div>`);
  return `<div class="ch-num" id="ch-${c.id}">Chapter ${i + 1}</div><h2>${esc(c.title)}</h2>
    <div class="box short"><span class="bt">The short version</span><p>${srcify(c.short)}</p></div>
    ${body.join('')}
    <div class="box remember"><span class="bt">Remember</span><ul>${c.remember.map(r => `<li>${esc(r)}</li>`).join('')}</ul></div>`;
}
export { chapterHtml };

export function bookContent() {
  const live = !isDemo() && liveResult('p.build.book');
  return live ? { chapters: live.chapters, sources: live.sources, title: live.title || PLANS.ebook.title, subtitle: live.subtitle || PLANS.ebook.subtitle } : { chapters: CHAPTERS, sources: SOURCES, title: PLANS.ebook.title, subtitle: PLANS.ebook.subtitle };
}

function sanitize(html) {
  const t = document.createElement('template');
  t.innerHTML = html;
  t.content.querySelectorAll('script,iframe,object,embed,style,link,meta').forEach(n => n.remove());
  t.content.querySelectorAll('*').forEach(n => [...n.attributes].forEach(a => { if (/^on/i.test(a.name) || /javascript:/i.test(a.value)) n.removeAttribute(a.name); }));
  return t.innerHTML;
}

const bookStep = {
  key: 'p.build.book', track: 'product', section: 'build', short: () => `Build the ${fmtName()}`,
  get title() { return `Build the ${fmtName()}`; },
  explain: () => state.format === 'ebook' ? 'Claude researches and writes every chapter, one at a time. Every fact gets a numbered source you can click.' : state.format === 'course' ? 'Claude writes each lesson script and a one page worksheet for it.' : 'Claude writes the 4 week plan, an outline for each call and a weekly check in form.',
  mainLabel: () => `Write the ${fmtName()}`, uses: ['claude', 'higgsfield'],
  replaces: 'Synthesize AI research and writing', saves: 'Weeks of writing, part of $2,999', costs: '~$0.50 est., about 6 minutes',
  demo: () => ({ chapters: CHAPTERS, sources: SOURCES }),
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, `Your ${fmtName()} will grow here, one ${unitName()} at a time.`);
    if (state.format === 'course') return courseView();
    if (state.format === 'coaching') return coachingView();
    const b = bookContent();
    const editing = view(step, 'editing', false);
    const edited = state.edits.book;
    const words = bookWords(b.chapters);
    return `<div class="split" style="grid-template-columns:minmax(0,1fr) 260px;margin-bottom:18px">
        <div class="grid g4">
          <div class="stat"><b>${b.chapters.length}</b><span>Chapters</span></div>
          <div class="stat"><b>${b.sources.length}</b><span>Sources</span></div>
          <div class="stat"><b>${fmt(words)}</b><span>Words</span></div>
          <div class="stat o"><b>6x9</b><span>Inch PDF</span></div>
        </div>
        <div class="cover" style="max-width:150px;justify-self:end">${coverSVG({ title: b.title, subtitle: b.subtitle })}</div>
      </div>
      <div class="btns" style="margin-bottom:16px">
        ${editing ? `<button class="btn main" data-booksave>${icon('check')}Save and update the PDF</button><button class="btn" data-bookcancel>Stop editing</button>` : `<button class="btn" data-bookedit>${icon('pen')}Edit</button>`}
        ${edited ? `<button class="btn quiet" data-bookundo>${icon('undo')}Undo my edits</button>` : ''}
        <button class="btn money" data-openpdf>${icon('book')}Open the PDF</button>
        ${edited ? pill('Your edits are saved', 'green') : ''}
      </div>
      <div class="book-layout">
        <nav class="toc" aria-label="Contents"><div class="label">Contents</div>${b.chapters.map((c, i) => `<button data-toc="ch-${c.id}"><span class="n">${i + 1}</span>${esc(c.title)}</button>`).join('')}<button data-toc="sources"><span class="n">#</span>Sources</button></nav>
        <div>
          <article class="book" ${editing ? 'contenteditable="true" spellcheck="true"' : ''} data-book>${edited || (`<p class="disclaimer">${esc(DISCLAIMER)}</p>` + b.chapters.map((c, i) => chapterHtml(c, i)).join(''))}</article>
          <div class="card mt16" id="sources"><div class="h3">Sources</div><ol class="sources mt12" style="padding-left:22px">${b.sources.map(s => `<li id="src-${s.n}" value="${s.n}"><a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a></li>`).join('')}</ol></div>
        </div>
      </div>`;
  },
  bind(root, step) {
    root.querySelectorAll('[data-toc]').forEach(b => b.onclick = () => document.getElementById(b.dataset.toc)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    const book = root.querySelector('[data-book]');
    root.querySelector('[data-bookedit]')?.addEventListener('click', () => { setView(step, 'editing', true); setTimeout(() => document.querySelector('[data-book]')?.focus(), 50); });
    root.querySelector('[data-bookcancel]')?.addEventListener('click', () => setView(step, 'editing', false));
    root.querySelector('[data-booksave]')?.addEventListener('click', () => {
      set({ edits: { ...state.edits, book: sanitize(book.innerHTML) } }, { silent: true });
      setView(step, 'editing', false);
      log('Saved your edits to the book and updated the PDF', { icon: 'pen', cost: 0 });
      toast('Saved. The PDF uses your edits.');
    });
    root.querySelector('[data-bookundo]')?.addEventListener('click', () => { const e = { ...state.edits }; delete e.book; set({ edits: e }); toast('Your edits were undone'); });
  },
  movie: () => {
    if (state.format !== 'ebook') {
      const p = PLANS[state.format];
      return [...p.outline.map(o => ({ type: `${o.title}\n${o.script || o.call}\n${o.sheet ? 'Worksheet: ' + o.sheet : 'Check in: ' + o.checkin}`, title: `Writing ${unitName()} ${o.n} of ${p.outline.length}`, ms: 900 }))];
    }
    return [
      { line: 'Making the cover with Higgsfield', ok: true },
      { html: `<div style="max-width:160px" class="cover">${coverSVG({})}</div>`, ms: 600 },
      ...CHAPTERS.map((c, i) => ({ type: `${c.title}\n\nThe short version: ${c.short}`, title: `Writing chapter ${i + 1} of ${CHAPTERS.length}`, ms: 750 })),
      { stats: [['Chapters', CHAPTERS.length], ['Sources', SOURCES.length], ['Words', bookWords()]] },
    ];
  },
  async run(step) {
    const plan = liveResult('p.build.plan') || PLANS[state.format];
    const outline = plan.outline || PLANS[state.format].outline;
    const est = state.format === 'ebook' ? 0.5 + outline.length * 0.06 : 0.3;
    const ok = await approve({ title: `Write the ${fmtName()}?`, intro: `Claude writes ${outline.length} ${unitName()}s one at a time${state.format === 'ebook' ? ', looking up sources on the web as it goes' : ''}.`, lines: [[`${outline.length} ${unitName()}s`, money(est) + ' est.'], ['Web searches for sources', 'included']], total: est });
    if (!ok) return;
    if (state.format !== 'ebook') {
      const { data } = await claudeJSON({ model: model(step.key), maxTokens: 8000, label: `Claude wrote the ${fmtName()}`, system: 'Plain, kind words. Never promise results. No made up people or testimonials.', prompt: `Plan: ${JSON.stringify(plan)}\nWrite the full ${fmtName()}. Return {"items":[{"n","title",${state.format === 'course' ? '"script" (spoken script, 300 to 500 words),"sheet" (worksheet text)' : '"call" (call outline as a list of steps),"checkin" (weekly check in questions)'}}]}` });
      setLiveResult(step.key, { format: state.format, items: data.items });
      return;
    }
    const chapters = [], sources = [];
    for (let i = 0; i < outline.length; i++) {
      toast(`Writing chapter ${i + 1} of ${outline.length}`);
      const { data } = await claudeJSON({
        model: model(step.key), maxTokens: 6000, webSearch: true, label: `Claude wrote chapter ${i + 1}: ${outline[i].title}`,
        system: 'You write one chapter of a short, sourced ebook in plain words a 10 year old can read. Every fact, number or study finding has a numbered source like [3]. Only use numbers that are in the source. If studies disagree, say so plainly. No made up people or testimonials. Short examples start with "Picture this:". Use web search to find real public sources and only cite pages you actually found.',
        prompt: `Book: ${plan.title}. Topic: ${idea()}.\nChapter ${i + 1}: ${outline[i].title}.\nSources already used (reuse their numbers if you cite them): ${JSON.stringify(sources)}\nReturn {"title","short" (the short version, 1 to 2 sentences),"blocks":[["h",text]|["p",text]|["list",[items]]|["try",text]|["safety",text]|["redflag",text]|["picture",text]],"remember":[3 short lines],"newSources":[{"t" (title and publisher),"u" (the exact url you found)}]}. 350 to 450 words. 3 to 6 short sections, at least one "try" box. Number new sources starting at ${sources.length + 1}.`,
      });
      (data.newSources || []).forEach((s, k) => sources.push({ n: sources.length + 1, t: s.t, u: s.u }));
      chapters.push({ id: 'ch' + (i + 1), title: data.title || outline[i].title, short: data.short, blocks: data.blocks || [], remember: data.remember || [] });
      setLiveResult(step.key, { chapters: [...chapters], sources: [...sources], title: plan.title, subtitle: plan.subtitle, partial: i < outline.length - 1 });
    }
  },
};

function courseView() {
  const live = !isDemo() && liveResult('p.build.book')?.format === 'course' ? liveResult('p.build.book').items : null;
  const items = live || PLANS.course.outline;
  return `<div class="grid g4" style="margin-bottom:16px"><div class="stat"><b>${items.length}</b><span>Lessons</span></div><div class="stat"><b>${items.length}</b><span>Worksheets</span></div><div class="stat"><b>~40</b><span>Minutes of video (est.)</span></div><div class="stat o"><b>${money(PLANS.course.price, 0)}</b><span>Price</span></div></div>
  <div class="stack">${items.map(o => `<div class="card"><div class="row between"><div class="h3">Lesson ${o.n}: ${esc(o.title)}</div>${copyBtn(o.script || '', 'Copy script')}</div>
    <div class="grid g2 mt12"><div><span class="label">Lesson script</span><div class="small ink" style="white-space:pre-wrap">${esc(o.script)}</div></div>
    <div class="card tight flat" style="background:var(--paper);color:var(--paper-ink)"><div class="tiny" style="letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#5B2EE8">One page worksheet</div><div class="small mt8" style="white-space:pre-wrap">${esc(o.sheet)}</div><div class="ghost-bar" style="background:#eee;margin-top:14px"></div><div class="ghost-bar" style="background:#eee;width:80%"></div><div class="ghost-bar" style="background:#eee;width:60%"></div></div></div></div>`).join('')}</div>`;
}
function coachingView() {
  const live = !isDemo() && liveResult('p.build.book')?.format === 'coaching' ? liveResult('p.build.book').items : null;
  const items = live || PLANS.coaching.outline;
  return `<div class="grid g4" style="margin-bottom:16px"><div class="stat"><b>4</b><span>Weeks</span></div><div class="stat"><b>4</b><span>Group calls</span></div><div class="stat"><b>4</b><span>Check in forms</span></div><div class="stat o"><b>${money(PLANS.coaching.price, 0)}</b><span>Price</span></div></div>
  <div class="grid g2">${items.map(o => `<div class="card"><div class="mono lilac small">Week ${o.n}</div><div class="h3">${esc(o.title)}</div>
    <span class="label mt12">Call outline</span><div class="small ink" style="white-space:pre-wrap">${esc(o.call)}</div>
    <div class="card tight flat mt12" style="background:var(--card-2)"><span class="label">Weekly check in form</span><div class="small">${esc(o.checkin)}</div><input class="mt8" placeholder="Their answer goes here" disabled></div></div>`).join('')}</div>`;
}

// ---------- 6.6 Add a creator's voice ----------
const voiceStep = {
  key: 'p.build.voice', track: 'product', section: 'build', short: "Add a creator's voice", title: "Add a creator's voice",
  explain: 'The fastest way to sell is to partner with a creator who already has the audience. A robot reads their last 15 public reels so the book sounds like them.',
  mainLabel: 'Read their reels', uses: ['apify', 'claude'],
  replaces: 'Synthesize AI creator voice', saves: 'A ghostwriter, $1,000s', costs: '~$0.41 est., about 4 minutes',
  demo: () => CREATOR,
  render(step) {
    const handle = state.inputs.creatorHandle ?? (isDemo() ? CREATOR.handle.replace(' (demo)', '') : '');
    const input = `<div class="card" style="margin-bottom:16px"><label class="label" for="ch-in">Their handle</label><div class="row"><input id="ch-in" data-input="creatorHandle" value="${esc(handle)}" placeholder="@their.handle"><span class="small dim" style="white-space:nowrap">Public posts only</span></div></div>`;
    const d = stepData(step);
    if (!d) return input + emptyFor(step, 'Their profile, posts and voice card will show up here.');
    const sel = view(step, 'post', 0);
    const p = d.posts[sel] || d.posts[0];
    const blur = state.hideNames ? 'blur-names' : '';
    return input + `<div class="split ${blur}">
      <div class="stack">
        <div class="card"><div class="row" style="gap:14px"><div style="width:58px;height:58px;border-radius:50%;overflow:hidden;flex:none">${foodSVG(77, { w: 80, h: 80 })}</div>
          <div><div class="h3 nm">${esc(d.name)}</div><div class="small dim nm">${esc(d.handle)}</div></div>
          <div style="margin-left:auto;text-align:right"><div class="mono ink" style="font-size:20px">${short(d.followers)}</div><div class="tiny dim">followers . ${d.postsRead} posts read</div></div></div>
          <p class="small mt12" style="margin-bottom:0">${esc(d.bio)}</p></div>
        <div class="card"><div class="card-head"><div class="h3">Their recent posts</div><span class="tiny dim">Click one</span></div>
          <div class="split" style="grid-template-columns:200px 1fr"><div class="thumb-grid">${d.posts.map((x, i) => `<button class="${i === sel ? 'on' : ''}" data-post="${i}" aria-label="Post ${i + 1}">${foodSVG(x.id * 13, {})}<span class="v">${short(x.views)}</span></button>`).join('')}</div>
          <div><span class="label">Post ${sel + 1} caption</span><p class="ink">"${esc(p.caption)}"</p><div class="mono peach">${fmt(p.views)} views</div></div></div></div>
      </div>
      <div class="stack">
        <div class="card"><div class="h3">Voice card</div>
          <span class="label mt12">Traits</span>${d.traits.map(t => `<div class="small mt8">${esc(t.t)} <button class="btn quiet sm" data-post="${t.post - 1}" style="padding:0 4px">post ${t.post}</button></div>`).join('')}
          <span class="label mt12">Favorite phrases</span><div class="row wrap">${d.phrases.map(x => `<button class="chip" data-post="${x.post - 1}">"${esc(x.p)}"</button>`).join('')}</div>
          <span class="label mt12">Topics</span><div class="share-bar">${d.topics.map(t => `<i style="width:${t.share}%;background:${t.color}" title="${esc(t.t)} ${t.share}%"></i>`).join('')}</div>
          <div class="mt8">${d.topics.map(t => `<div class="row between tiny"><span><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${t.color};margin-right:6px"></span>${esc(t.t)}</span><span class="mono">${t.share}%</span></div>`).join('')}</div>
          <span class="label mt12">Audience</span><div class="kv"><span>Who</span><span>${esc(d.audience.who)}</span><span>Want</span><span>${esc(d.audience.want)}</span><span>Fear</span><span>${esc(d.audience.fear)}</span></div></div>
      </div></div>
      <div class="card mt16"><div class="card-head"><div class="h3">Before and After: ${esc(VOICE_SAMPLE.chapter)}</div>${pill('Every fact and source kept', 'green')}</div>
        <div class="grid g2"><div><span class="label">Plain voice</span><p>${srcify(VOICE_SAMPLE.plain)}</p></div><div><span class="label">In her voice</span><p class="ink">${srcify(VOICE_SAMPLE.voiced)}</p></div></div>
        <div class="box kitchen"><span class="bt">From Maya's kitchen</span><p>${esc(KITCHEN_BOXES.ch5.replace(/^From Maya's kitchen \(demo\): /, ''))}</p></div>
        <p class="tiny dim">Each chapter gets a short "From the creator's kitchen" box, built only from their real posts.</p></div>`;
  },
  bind(root, step) {
    root.querySelectorAll('[data-post]').forEach(b => b.onclick = () => setView(step, 'post', Number(b.dataset.post)));
  },
  movie: () => [
    { line: 'Instagram profile: reading @smallplates.maya (demo)' },
    { line: 'Recent reels: reading 15 public posts', cost: '$0.00' },
    { html: `<div class="thumb-grid" style="max-width:260px">${CREATOR.posts.map(p => `<button>${foodSVG(p.id * 13, {})}<span class="v">${short(p.views)}</span></button>`).join('')}</div>`, ms: 900 },
    ...CREATOR.traits.map(t => ({ line: `Trait: ${t.t} (post ${t.post})`, ok: true, ms: 240 })),
    { type: VOICE_SAMPLE.voiced, title: 'Chapter 5 in her voice', ms: 1600 },
  ],
  async run(step) {
    const handle = (state.inputs.creatorHandle || '').trim().replace(/^@/, '');
    if (!handle) throw new Error('Type their handle first.');
    const ok = await approve({ title: `Read @${handle}?`, lines: [['Profile robot, 1 profile', '$0.01 est.'], ['Reels robot, last 15 reels', '$0.05 est.'], ['Claude builds the voice card and rewrites a chapter', '$0.35 est.']], total: 0.41 });
    if (!ok) return;
    const [prof, reels] = await Promise.all([
      robot({ robot: 'igProfile', query: handle, count: 1, extra: { usernames: [handle] }, maxUsd: 0.1, label: `Read the profile @${handle}` }),
      robot({ robot: 'igReels', query: handle, count: 15, extra: { usernames: [handle] }, maxUsd: 0.2, label: `Read 15 reels from @${handle}` }),
    ]);
    const book = liveResult('p.build.book');
    const { data } = await claudeJSON({
      model: model(step.key), maxTokens: 6000, label: `Claude learned @${handle}'s voice`,
      system: 'Build a voice card only from the posts given. Every trait points to the post it came from. Keep every fact and source number when rewriting.',
      prompt: `Profile: ${JSON.stringify(prof.items[0] || {}).slice(0, 3000)}\nReels: ${JSON.stringify(reels.items.map(r => ({ caption: r.caption, views: r.videoViewCount || r.videoPlayCount, url: r.url }))).slice(0, 20000)}\nA chapter paragraph: ${JSON.stringify(book?.chapters?.[4]?.blocks?.find(b => b[0] === 'p')?.[1] || VOICE_SAMPLE.plain)}\nReturn {"name","handle","followers" (number),"postsRead","bio","posts":[9 x {"id","caption","views"}],"traits":[{"t","post" (1 to 9)}],"phrases":[{"p","post"}],"topics":[{"t","share","color" (hex)}] shares add to 100,"audience":{"who","want","fear"},"voiced": the paragraph rewritten in their voice}`,
    });
    setLiveResult(step.key, { ...data, posts: (data.posts || []).slice(0, 9).map((p, i) => ({ ...p, id: i + 1 })) });
  },
};

// ---------- 6.7 Ready to sell ----------
const readyStep = {
  key: 'p.build.ready', track: 'product', section: 'build', short: 'Ready to sell', title: 'Ready to sell',
  explain: 'The creator edition, the price, an optional add on, store copy and a message for the creator.',
  mainLabel: 'Write the store copy', uses: ['claude'],
  replaces: 'Synthesize AI store and publish', saves: 'A copywriter, $500+', costs: '~$0.23 est., about 1 minute',
  demo: () => READY,
  render(step) {
    const d = stepData(step);
    if (!d) return emptyFor(step, 'Your cover, price and store copy will show up here.');
    return `<div class="split" style="grid-template-columns:240px minmax(0,1fr)">
      <div class="stack"><div class="cover">${coverSVG({ title: d.creatorTitle, subtitle: 'The Small Appetite Protein Plan', author: d.creator, variant: 'creator', kicker: 'Creator edition' })}</div>
        <div class="card tight"><div class="mono" style="font-size:34px;font-weight:650;color:var(--orange-ink)">${money(d.price, 0)}</div><div class="small dim">one time</div></div>
        <div class="card tight"><div class="row between"><b class="ink small">Add on: ${esc(d.addon.name)}</b><span class="mono peach">${money(d.addon.price, 0)}</span></div><p class="small mt8" style="margin:0">${esc(d.addon.pitch)}</p></div></div>
      <div class="stack">
        <div class="card"><div class="card-head"><div class="h3">Store copy</div>${copyBtn([d.store.headline, d.store.sub, ...d.store.bullets.map(b => '- ' + b), d.store.priceLine, d.store.guarantee].join('\n'), 'Copy all')}</div>
          <h2 class="h2">${esc(d.store.headline)}</h2><p class="mt8">${esc(d.store.sub)}</p>
          <ul>${d.store.bullets.map(b => `<li class="ink">${esc(b)}</li>`).join('')}</ul>
          <div class="mono peach">${esc(d.store.priceLine)}</div><p class="small dim mt8">${esc(d.store.guarantee)}</p></div>
        <div class="card"><div class="card-head"><div class="h3">Message to the creator</div>${copyBtn(d.creatorMessage)}</div><div class="draft">${esc(d.creatorMessage)}</div></div>
        <div class="btns"><button class="btn money" data-go="#/step/p.launch.store">Next: put it on Whop${icon('arrow')}</button><span class="small dim">Or find buyers first with the next step.</span></div>
      </div></div>`;
  },
  movie: () => [
    { html: `<div style="max-width:170px" class="cover">${coverSVG({ title: READY.creatorTitle, subtitle: 'The Small Appetite Protein Plan', author: READY.creator, variant: 'creator', kicker: 'Creator edition' })}</div>`, ms: 700 },
    { type: READY.store.headline, title: 'Headline', ms: 800 },
    ...READY.store.bullets.map(b => ({ line: b, ok: true, ms: 180 })),
    { type: READY.creatorMessage, title: 'Message to the creator', ms: 1400 },
  ],
  async run(step) {
    const ok = await approve({ title: 'Write the store copy?', lines: [['Claude writes the store copy and the creator message', '$0.23 est.']], total: 0.23 });
    if (!ok) return;
    const plan = liveResult('p.build.plan') || PLANS.ebook;
    const voice = liveResult('p.build.voice');
    const { data } = await claudeJSON({
      model: model(step.key), maxTokens: 3000, label: 'Claude wrote the store copy',
      system: 'Honest store copy. Never promise results or income. No made up reviews. The guarantee must be something the seller can keep.',
      prompt: `Plan: ${JSON.stringify(plan)}\nCreator: ${JSON.stringify({ name: voice?.name, handle: voice?.handle })}\nReturn {"creatorTitle","fullTitle","creator","price" (number),"addon":{"name","price","pitch"},"store":{"headline","sub","bullets":[6],"priceLine","guarantee"},"creatorMessage"}`,
    });
    setLiveResult(step.key, data);
  },
  finishLabel: 'Next: put it on Whop',
};

register([ideaStep, researchStep, pocketsStep, planStep, bookStep, voiceStep, readyStep]);
export { bookStep };
