// Demo outreach data for the 4 campaigns. Each one is its own little business:
// its own leads, sending domains, inboxes, emails and replies. Nothing is shared.
// All people and businesses are made up. Demo email addresses use the reserved ".example" ending.

const FIRST = ['Kim', 'Dana', 'Priya', 'Leo', 'Rosa', 'Jamal', 'Tess', 'Omar', 'Hana', 'Grace', 'Marco', 'Nina', 'Ivy', 'Ben', 'Zoe', 'Ray', 'Lena', 'Sofia', 'Ade', 'Caleb', 'Mira', 'Jo', 'Theo', 'Ana', 'Cole', 'Ruth', 'Eli', 'Nora', 'Sam', 'Uma'];
const LAST = ['Park', 'Reyes', 'Shah', 'Bauer', 'Lopez', 'Wright', 'Hale', 'Nasser', 'Kato', 'Bell', 'Russo', 'Ivanova', 'Chen', 'Ortega', 'Fox', 'Diaz', 'Moss', 'Costa', 'Okafor', 'Price', 'Haddad', 'Lund', 'Grant', 'Silva', 'Brooks', 'Kerr', 'Stone', 'Quinn', 'Vega', 'Rao'];

function pick(i, arr) { return arr[i % arr.length]; }

export const TRACKS = {
  ebook: {
    id: 'ebook', tag: 'Ebook', sells: 'The Small Appetite Protein Plan', business: 'Bright Path Studio',
    campaign: 'Selling: The Small Appetite Protein Plan', leadKind: 'creators',
    domains: ['brightpathstudioagency.com', 'getbrightpathstudio.com', 'brightpathstudiohq.com', 'trybrightpathstudio.com', 'hellobrightpathstudio.com', 'teambrightpathstudio.com'],
  },
  airbnb: {
    id: 'airbnb', tag: 'Airbnb photos', sells: 'Airbnb Photo Pack', business: 'Lumen Stay Photos',
    campaign: 'Selling: Airbnb Photo Pack', leadKind: 'hosts',
    domains: ['getlumenstayphotos.com', 'lumenstayphotoshq.com', 'trylumenstayphotos.com'],
  },
  ads: {
    id: 'ads', tag: 'Ad remakes', sells: 'Ad Remakes', business: 'Northlight Ad Studio',
    campaign: 'Selling: Ad Remakes', leadKind: 'businesses', altName: 'Ad remake: Austin roofers',
    domains: ['getnorthlightads.com', 'northlightadshq.com', 'trynorthlightads.com'],
  },
  shorts: {
    id: 'shorts', tag: 'YouTube Shorts', sells: 'YouTube Shorts', business: 'Tiny Ledger Studio',
    campaign: 'Selling: YouTube Shorts', leadKind: 'channels', altName: 'Faceless video offer',
    domains: ['gettinyledgerstudio.com', 'tinyledgerstudiohq.com', 'trytinyledgerstudio.com'],
  },
};

// ---------- leads ----------
const CREATOR_NICHES = ['GLP-1 meals', 'Zepbound diary', 'protein snacks', 'small portions', 'nurse on GLP-1', 'GLP-1 over 50', 'high protein mom', 'Mounjaro journey'];
export function creatorsFound() {
  // 7 creators that passed all 4 checks in this Instagram run, plus 5 that failed one check.
  const pass = [
    { handle: '@smallplates.maya', name: 'Maya Ortiz', followers: 38400, top: 208000, why: 'Talks about protein on GLP-1 every week, warm teaching style' },
    { handle: '@zepdiary.dana', name: 'Dana Reyes', followers: 22100, top: 94000, why: 'Shot day food diaries, audience asks "what do you eat" daily' },
    { handle: '@proteinpriya', name: 'Priya Shah', followers: 61800, top: 143000, why: 'Protein recipe reels, already teaches portions' },
    { handle: '@nurse.on.glp1', name: 'Tess Hale', followers: 17600, top: 66500, why: 'Nurse voice, trusted, asks for sourced info' },
    { handle: '@over50andstrong', name: 'Grace Bell', followers: 44900, top: 120000, why: 'Strength and muscle focus for women over 50' },
    { handle: '@tinyplate.hana', name: 'Hana Kato', followers: 12300, top: 58200, why: 'Small plate aesthetic, very engaged comments' },
    { handle: '@mounjaro.marco', name: 'Marco Russo', followers: 29700, top: 81000, why: 'Honest updates, male audience, asks about muscle' },
  ].map(p => ({ ...p, platform: 'Instagram', sells: false, email: true, pass: true }));
  const fail = [
    { handle: '@glp1queen', name: 'Rosa Lopez', followers: 412000, top: 900000, why: 'Too big, over 100K followers', failed: 'followers' },
    { handle: '@ozempicmeals', name: 'Leo Bauer', followers: 33000, top: 210000, why: 'Already sells a meal plan', failed: 'sells', sells: true },
    { handle: '@semaglutide.sam', name: 'Sam Quinn', followers: 8100, top: 12000, why: 'Best video under 50K views', failed: 'views' },
    { handle: '@zepbound.zoe', name: 'Zoe Fox', followers: 26000, top: 77000, why: 'No business email shown', failed: 'email', email: false },
    { handle: '@protein.ray', name: 'Ray Diaz', followers: 5400, top: 51000, why: 'Under 10K followers', failed: 'followers' },
  ].map(p => ({ platform: 'Instagram', sells: false, email: true, ...p, pass: false }));
  return [...pass, ...fail].map((p, i) => ({ ...p, fit: p.pass ? 92 - i * 4 : 30 + i * 3, name: p.name + ' (demo)', handle: p.handle + ' (demo)' }));
}

export const FUNNEL = [
  { label: 'Reels found on the topic', n: 58 },
  { label: 'Creator profiles read', n: 32 },
  { label: '10K to 100K followers', n: 14 },
  { label: 'Last 15 reels checked', n: 12 },
  { label: 'Passed all 4 checks', n: 7 },
];

function leadFor(track, i) {
  const f = pick(i, FIRST), l = pick(i * 7 + 3, LAST);
  const t = TRACKS[track];
  if (track === 'ebook') {
    const fromRun = i < 7 ? creatorsFound()[i] : null;
    const name = fromRun ? fromRun.name.replace(' (demo)', '') : `${f} ${l}`;
    const first = name.split(' ')[0];
    const handle = fromRun ? fromRun.handle.replace(' (demo)', '') : '@' + (first + pick(i, CREATOR_NICHES).split(' ')[0]).toLowerCase().replace(/[^a-z0-9]/g, '');
    return { id: `${track}-${i}`, first, name: name + ' (demo)', company: handle + ' (demo)', email: `${first.toLowerCase()}@${handle.replace('@', '').replace(/[^a-z0-9]/g, '')}.example`, source: fromRun ? 'Instagram run today' : (i % 2 ? 'TikTok run, last week' : 'YouTube run, last week'), detail: fromRun ? fromRun.why : `Posts about ${pick(i, CREATOR_NICHES)}` };
  }
  if (track === 'airbnb') {
    const co = [`${l} Stays`, `${f}'s Cozy Rentals`, `${l} Property Co`, `Hill Country ${l} Homes`, `${f} and ${pick(i + 4, FIRST)} Hosting`][i % 5];
    return { id: `${track}-${i}`, first: f, name: `${f} ${l} (demo)`, company: co + ' (demo)', email: `${f.toLowerCase()}@${co.toLowerCase().replace(/[^a-z]/g, '')}.example`, source: 'Public host business page', detail: `${2 + (i % 5)} listings in Austin, TX (demo)` };
  }
  if (track === 'ads') {
    const names = ['Rick', 'Carla', 'Dwayne', 'Mel', 'Hector', 'Jen', 'Paul', 'Trina', 'Gus', 'Lori'];
    const first = i === 0 ? 'Rick' : pick(i, names.concat(FIRST));
    const co = [`${l} Roofing`, `Capitol City Roofing`, `Lone Star Roof and Gutter`, `${l} Brothers Roofing`, `Hill Country Roofers`, `${first}'s Roof Repair`][i % 6];
    const company = i === 0 ? 'Rick\'s Roofing ATX' : co;
    return { id: `${track}-${i}`, first, name: `${first} ${i === 0 ? 'Dalton' : l} (demo)`, company: company + ' (demo)', email: `${first.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.example`, source: 'Business website, via AI Ark', detail: 'Roofer in Austin, TX, running Facebook ads' };
  }
  const ch = [`Penny Wise ${l}`, `The ${f} Ledger`, `Money in 60`, `${l} Finance Bites`, `Tiny Budget TV`, `Coin Stories`][i % 6];
  return { id: `${track}-${i}`, first: f, name: `${f} ${l} (demo)`, company: ch + ' (demo)', email: `${f.toLowerCase()}@${ch.toLowerCase().replace(/[^a-z]/g, '')}.example`, source: 'Channel About page', detail: 'Animated personal finance channel' };
}

const LEAD_COUNT = 30;
const leadCache = {};
export function leads(track) {
  if (!leadCache[track]) {
    leadCache[track] = Array.from({ length: LEAD_COUNT }, (_, i) => {
      const lead = leadFor(track, i);
      const status = i === 9 ? 'Risky and skipped' : i === 17 ? 'Not found' : i === 23 ? 'Not found' : i === 27 ? 'Risky and skipped' : 'Verified';
      return { ...lead, emailStatus: status, email: status === 'Verified' ? lead.email : null };
    });
  }
  return leadCache[track];
}
export function verifiedLeads(track) { return leads(track).filter(l => l.email); }

// ---------- domains and inboxes ----------
const SENDERS = [['Alex', 'alex'], ['Sam', 'sam']];
export function inboxes(track) {
  const out = [];
  TRACKS[track].domains.forEach((d, di) => SENDERS.forEach(([n, u], si) => out.push({ email: `${u}@${d}`, name: n, domain: d, day: 14, ready: true, today: 0, id: di * 2 + si })));
  return out;
}
export function domainBoard(track) {
  return TRACKS[track].domains.map(d => ({ domain: d, bought: true, inboxes: true, dns: true, instantly: true, warm: true, price: 10.98 }));
}
export function dnsRecords(domain) {
  return [
    { what: 'Gets your mail', tech: 'MX (mail server)', name: '@', value: 'smtp.google.com', status: 'Verified' },
    { what: 'Lets Google send for you', tech: 'SPF (TXT)', name: '@', value: 'v=spf1 include:_spf.google.com ~all', status: 'Verified' },
    { what: 'Rules for fake mail', tech: 'DMARC (TXT)', name: '_dmarc', value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`, status: 'Verified' },
    { what: 'Proves it is you', tech: 'DKIM (TXT, from ScaledMail)', name: 'google._domainkey', value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx3...(demo)', status: 'Verified' },
  ];
}

// ---------- emails ----------
export const SENDER = { name: 'Jordan Lee (demo)', business: 'Bright Path Studio (demo)', address: '100 Example Street, Suite 2, Austin, TX 78701 (demo)' };

export function footer(track) {
  const b = TRACKS[track].business + ' (demo)';
  return `\n\n${SENDER.name.replace(' (demo)', '')}\n${b}\n${SENDER.address}\n\nNot for you? Just reply "no thanks" and I will not email again.`;
}

export const EMAILS = {
  ebook: [
    { subject: 'Quick idea: a protein guide built from your reels', body: 'Hi {first},\n\nYour reel "What I eat in a day when I am NOT hungry" had people in the comments asking the same thing over and over: how do you get protein in when you cannot eat much?\n\nI am Jordan, I write and design short, sourced guides for creators. I would like to turn your answers into a small ebook for your audience.\n\nI write and design it, set up the store, and you check every word before anything goes live. We split each sale 50/50, and it costs you nothing.\n\nWould you be open to it? A simple "yes" is enough and I will send a sample chapter.' },
    { subject: 'Re: Quick idea: a protein guide built from your reels', body: 'Hi {first},\n\nJust checking this reached you. Happy to send a free sample chapter so you can see if it sounds like you. If now is not a good time, no problem at all, I will not follow up again.' },
  ],
  airbnb: [
    { subject: 'A free brighter photo of your listing', body: 'Hi {first},\n\nI was looking at your Austin listing and noticed a few photos look darker than the room really is.\n\nI fixed one for free so you can see the difference. Same room, nothing added, just light, color and straight lines. It is attached.\n\nIf you like it, I can do the rest for $49 (up to 10 photos, done in 2 days). If not, no worries at all, keep the free one.' },
    { subject: 'Re: A free brighter photo of your listing', body: 'Hi {first},\n\nDid the free photo come through okay? Happy to fix a different one if you prefer. This is my only follow up.' },
  ],
  ads: [
    { subject: '3 free ad ideas for {company}', body: 'Hi {first},\n\nI saw your Facebook ad in the Ad Library. It has been running a while with very few words on it, so I wrote 3 new versions using only services you already list on your site.\n\nI made one of them into a finished ad picture. It is yours to use free, no strings.\n\nIf you like it, I make 3 new ads every month for $200 and you can stop any time. Want me to send the free one?' },
    { subject: 'Re: 3 free ad ideas for {company}', body: 'Hi {first},\n\nShould I send the free ad? Just reply yes.' },
  ],
  shorts: [
    { subject: 'A free video for your channel', body: 'Hi {first},\n\nYour Short on compound interest did really well compared to your usual videos. Small channels on this topic often want more videos than they have time for.\n\nI make faceless animated Shorts. I would like to make you one free sample in your style, on a new money topic, so you can see if it fits.\n\nIf you like it, a pack of 4 is $150. Want the free one?' },
    { subject: 'Re: A free video for your channel', body: 'Hi {first},\n\nJust a quick nudge in case this got buried. Happy to make the free sample this week. If not, all good, I will not email again.' },
  ],
};

export const TEMPLATES = [
  { name: 'A one line free offer', hint: 'Shortest. Best for busy people.', body: 'Hi {first}, I made something free for {company}. Want me to send it? Just reply yes.' },
  { name: 'Pain point plus solution', hint: 'Name the problem, then the fix.', body: 'Hi {first},\n\nMost people in your space struggle with one thing: {pain}. I fix that with {solution}. Can I send you a free sample?' },
  { name: 'Proof', hint: 'Lead with a real result you have.', body: 'Hi {first},\n\nHere is a before and after from a recent project (shared with permission). I can do the same for {company}, starting with one free sample. Interested?' },
  { name: 'A question', hint: 'Start a conversation.', body: 'Hi {first},\n\nQuick question: who handles {topic} for {company}? I have a free idea for it and want to send it to the right person.' },
  { name: 'A polite last email', hint: 'Use once, then stop for good.', body: 'Hi {first},\n\nI will not keep emailing. If you ever want that free sample, just reply and it is yours. All the best.' },
];

// ---------- replies ----------
export const LABELS = ['Interested', 'Question', 'Pricing question', 'Wrong person', 'Not now', 'Out of office'];
export const LABEL_TONE = { Interested: 'green', Question: 'purple', 'Pricing question': 'orange', 'Wrong person': 'grey', 'Not now': 'grey', 'Out of office': 'grey' };

export const REPLIES = {
  ebook: [
    { lead: 0, label: 'Interested', at: '9:42', t: 6, text: 'Oh I love this. People ask me that every day. Yes, send the sample chapter!', draft: 'Thank you, Maya! Here is the sample chapter: Chapter 5, "Protein First, on Small Plates", with a "From Maya\'s kitchen" box built from your reel. Could we talk for 15 minutes this week? Tuesday at 11 or Thursday at 2 both work for me.', alt: 'So glad you like the idea! The sample is attached. If it helps, I can walk you through it on a quick call. Does Tuesday at 11 or Thursday at 2 suit you?' },
    { lead: 1, label: 'Question', at: '10:05', t: 8, text: 'Interesting. Who writes it, you or AI? I do not want anything that sounds fake.', draft: 'Fair question. AI helps me research and draft, and I edit every line by hand. Every fact has a source, and you read and approve all of it before it goes live. Here is a 1 page sample so you can judge for yourself.', alt: 'I use AI to research and draft, then I rewrite and check it all myself. Nothing goes live until you approve every word. Want a sample page?' },
    { lead: 2, label: 'Pricing question', at: '10:31', t: 9.5, text: 'What does it cost me?', draft: 'Nothing up front. I write, design and set up the store. We split each sale 50/50. Happy to explain on a 10 minute call if that is easier.', alt: 'It costs you nothing. I do the work, and we split each sale 50/50. Want a quick call to go over it?' },
    { lead: 3, label: 'Not now', at: '11:12', t: 11, text: 'Busy season for me, maybe in the spring.', draft: 'Totally understand. Thank you for letting me know, and good luck with the busy season.', alt: 'No problem at all. Thanks for the reply!' },
    { lead: 4, label: 'Out of office', at: '11:40', t: 12.5, text: 'I am away until Monday with limited access to email.', draft: '(No reply needed. Out of office messages are left alone.)', alt: '' },
    { lead: 5, label: 'Wrong person', at: '12:02', t: 14, text: 'My manager handles brand stuff, not me.', draft: 'Thank you for telling me! Who is the right person to talk to, and would you be okay sharing their email?', alt: 'Thanks so much. Could you point me to your manager\'s email?' },
  ],
  airbnb: [
    { lead: 0, label: 'Interested', at: '9:18', t: 6, text: 'Wow, that is my living room?! Yes please do the rest.', draft: 'So glad you like it! Here is the link to get the full pack ($49, up to 10 photos, done in 2 days). Or if you prefer, I can call you Tuesday at 10 or Wednesday at 3.', alt: 'Thank you! I will start as soon as you are ready. Want a quick call Tuesday at 10 or Wednesday at 3?' },
    { lead: 1, label: 'Question', at: '9:50', t: 8, text: 'Will Airbnb know the photos were edited? I do not want to get in trouble.', draft: 'Good question. We only fix light, color and straight lines, like a real estate photographer would. Nothing is added or removed from the room, so the photos still show your place honestly.', alt: 'We never change the room, only the light and color. It is the same kind of edit a pro photographer makes.' },
    { lead: 2, label: 'Pricing question', at: '10:14', t: 9.5, text: 'Is the $49 for one listing or all three?', draft: 'The $49 pack is up to 10 photos, usually one listing. For all three, I can do 30 photos for $129. Want me to send that link?', alt: 'It is for up to 10 photos. For three listings, I can quote you a bundle.' },
    { lead: 3, label: 'Not now', at: '10:52', t: 11, text: 'Thanks but we are redoing the place this winter.', draft: 'Makes sense! Thanks for letting me know, and good luck with the remodel.', alt: 'Thank you, good luck with the project!' },
    { lead: 4, label: 'Out of office', at: '11:20', t: 12.5, text: 'Auto reply: I am traveling and will answer when I return.', draft: '(No reply needed. Out of office messages are left alone.)', alt: '' },
    { lead: 5, label: 'Wrong person', at: '11:58', t: 14, text: 'I just clean the unit, the owner is someone else.', draft: 'Thank you! Would you mind passing this to the owner, or sharing the best way to reach them?', alt: 'Thanks for telling me. Who is the best person to reach?' },
  ],
  ads: [
    { lead: 0, label: 'Pricing question', at: '9:05', t: 6, text: 'This is Rick. What does it cost each month after the free one?', draft: 'Hi Rick, it is $200 a month for 3 new ads, and you can stop any time. The first ad is free either way. Want me to send it now, or talk for 10 minutes on Tuesday at 9 or Thursday at 4?', alt: 'Hi Rick! $200 a month gets you 3 fresh ads every month, no contract. Should I send the free one first?' },
    { lead: 1, label: 'Interested', at: '9:40', t: 8, text: 'Sure send it over.', draft: 'Here it is: the "Leak after the storm?" ad, sized for Facebook and Instagram. It is yours to use. If you want 3 new ones every month, here is the link: $200 a month, stop any time.', alt: 'Attached! Use it however you like. Happy to talk about a monthly plan if it helps.' },
    { lead: 2, label: 'Question', at: '10:22', t: 9.5, text: 'Do you run the ads too or just make them?', draft: 'I make the ads, you or your ad person runs them. That keeps your account and your budget fully in your hands. I can share simple tips for running them too.', alt: 'I only make them. You keep control of your ad account and budget.' },
    { lead: 3, label: 'Not now', at: '11:01', t: 11, text: 'Slow season, check back later.', draft: 'Understood. Thanks for the reply, and good luck this season.', alt: 'No problem, thank you!' },
    { lead: 4, label: 'Wrong person', at: '11:33', t: 12.5, text: 'Our marketing is done by an agency.', draft: 'Thanks for letting me know! Would you be open to sharing the free ad with them, or should I leave it there?', alt: 'Thank you. I will leave it there.' },
    { lead: 5, label: 'Out of office', at: '12:10', t: 14, text: 'On a job site all week.', draft: '(No reply needed. Out of office messages are left alone.)', alt: '' },
  ],
  shorts: [
    { lead: 0, label: 'Interested', at: '9:30', t: 6, text: 'Yes! Could it be about emergency funds?', draft: 'Love that topic. I will make a free sample on emergency funds in your style and send it by Friday. Want a 10 minute call Tuesday at 1 or Thursday at 11 to agree on the hook?', alt: 'Great idea. I will make it and send it by Friday!' },
    { lead: 1, label: 'Question', at: '10:02', t: 8, text: 'Will this get flagged as reused content?', draft: 'Good question. YouTube may not pay for repetitive or mass produced videos. Each video I make is new: a new script, new visuals, a useful point. I copy the format that works, never the words or the video.', alt: 'Every video is made fresh with its own script and visuals, so it is not reused content.' },
    { lead: 2, label: 'Pricing question', at: '10:40', t: 9.5, text: 'How much for a weekly video?', draft: 'One video a week is $160 a month. A pack of 4 is $150 if you prefer to buy in batches. The first sample is free.', alt: 'Weekly is $160 a month. Want the free sample first?' },
    { lead: 3, label: 'Not now', at: '11:15', t: 11, text: 'Taking a break from the channel this month.', draft: 'Totally fair. Thanks for letting me know, enjoy the break.', alt: 'Understood, thank you!' },
    { lead: 4, label: 'Out of office', at: '11:48', t: 12.5, text: 'Away until the 20th.', draft: '(No reply needed. Out of office messages are left alone.)', alt: '' },
    { lead: 5, label: 'Wrong person', at: '12:20', t: 14, text: 'I just edit for this channel.', draft: 'Thank you! Who decides on new videos, and would you share their email?', alt: 'Thanks. Could you point me to the channel owner?' },
  ],
};

export const AUTO_TEMPLATES = [
  { n: 1, name: 'Interested', text: 'Thank them, share the free sample, offer two call times.' },
  { n: 2, name: 'Send more info', text: 'Answer the question in 2 or 3 lines, share a short details page.' },
  { n: 3, name: 'Wrong person', text: 'Thank them, ask who the right person is.' },
  { n: 4, name: 'Pricing question', text: 'Nothing to pay up front, 50/50 split (or the real price), offer a short call.' },
  { n: 5, name: 'Ghost follow up', text: 'A one line nudge with a useful sample.' },
];

// A send timeline that plays the same way every time (about 15 seconds).
export function timeline(track) {
  const ls = verifiedLeads(track);
  const ib = inboxes(track);
  const ev = [];
  const total = Math.min(ls.length, 26);
  for (let i = 0; i < total; i++) {
    const t = 0.4 + i * 0.5;
    const from = ib[i % ib.length].email;
    ev.push({ t, kind: 'sent', lead: i, text: `Sent to ${ls[i].first} from ${from}` });
    if (i === 6) ev.push({ t: t + 0.3, kind: 'bounce', lead: i, text: `Bounced, skipped: ${ls[i].first}` });
    else if (i % 3 !== 2) ev.push({ t: t + 1.6 + (i % 4) * 0.4, kind: 'open', lead: i, text: `Opened: ${ls[i].first}` });
  }
  for (const r of REPLIES[track]) ev.push({ t: r.t, kind: 'reply', lead: r.lead, text: `Replied: ${r.label}, ${ls[r.lead].first}` });
  return { events: ev.sort((a, b) => a.t - b.t), total, duration: 15.5 };
}

export const NEXT_SEND = 'Tomorrow, 9:00 am';
