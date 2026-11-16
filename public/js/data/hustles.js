// Demo data for the 3 AI side hustles. All listings, businesses, channels and ads are made up.

export const HUSTLES = {
  airbnb: {
    id: 'airbnb', name: 'Airbnb Photos', title: 'Fix dark listing photos for hosts',
    line: 'Fix dark listing photos for hosts. One free photo, then the pack.',
    charge: '$49 to $99', costs: 'about $1.50', time: 'About 1 hour a host',
    work: [['hosts', 'Find hosts with weak photos'], ['spot', 'Spot weak photos'], ['fix', 'Fix one photo free']],
    pitch: 'Message the host',
  },
  ads: {
    id: 'ads', name: 'Ad Remakes', title: 'Remake weak local Facebook ads',
    line: 'Find local businesses with weak ads. Remake one, then charge monthly.',
    charge: '$200 a month', costs: 'about $1', time: 'About 2 hours a client',
    work: [['findads', 'Find weak ads'], ['ideas', 'Write 3 new ad ideas'], ['make', 'Make the ads']],
    pitch: 'Pitch the owner',
  },
  shorts: {
    id: 'shorts', name: 'YouTube Shorts', title: 'Make faceless Shorts for channels',
    line: 'Copy the style of videos that took off, not the words. Sell videos to channels.',
    charge: '$150 for 4 Shorts', costs: 'about $3', time: 'About 3 hours a video',
    work: [['outliers', 'Find videos that took off'], ['script', 'Write the script'], ['clips', 'Make the clips']],
    pitch: 'Offer it to channels',
  },
};

// ---------- Airbnb ----------
const TITLES = ['Cozy bungalow near South Congress', 'Modern loft by Rainey Street', 'Quiet studio in Hyde Park', 'Family home with big yard', 'Bright condo near downtown', 'Garden cottage in Travis Heights', 'Craftsman house, walk to Zilker', 'Hill Country casita', 'Lakeside cabin retreat', 'East Austin tiny house'];
const TYPES = ['Entire home', 'Entire loft', 'Entire studio', 'Entire home', 'Entire condo', 'Guest house', 'Entire home', 'Casita', 'Cabin', 'Tiny house'];
const KINDS = ['living', 'bedroom', 'kitchen'];
const ISSUES = ['too dark', 'color cast', 'blurry', 'crooked', 'messy'];

export const LISTINGS = Array.from({ length: 40 }, (_, i) => {
  const quality = [2, 3, 2.5, 4, 3.5, 5, 6, 7, 8, 9][i % 10] + ((i * 7) % 3) * 0.3;
  const q = Math.round(Math.min(9.6, quality) * 10) / 10;
  const issues = q < 7 ? ISSUES.filter((_, k) => (i + k) % (q < 4 ? 2 : 3) === 0).slice(0, q < 4 ? 3 : 2) : [];
  return {
    id: 'L' + (i + 1),
    title: TITLES[i % 10] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : '') + ' (demo)',
    type: TYPES[i % 10],
    rating: Math.round((4.5 + ((i * 13) % 5) / 10) * 100) / 100,
    reviews: 8 + ((i * 37) % 180),
    price: 89 + ((i * 29) % 160),
    photos: 6 + (i % 14),
    seed: 11 + i * 3,
    kind: KINDS[i % 3],
    quality: q,
    weak: Math.round((10 - q) * 10) / 10,
    issues: issues.length ? issues : q < 7 ? ['too dark'] : [],
    host: i % 4 === 0 ? 'Superhost' : 'Host',
    url: 'https://www.airbnb.com/s/Austin--TX/homes',
  };
}).sort((a, b) => b.weak - a.weak);

export const AIRBNB_CITY = 'Austin, TX';
export const HERO_LISTING = LISTINGS[0];

export const AIRBNB_MESSAGE = {
  subject: 'A free brighter photo of your listing',
  body: 'Hi {first},\n\nI was looking at your listing "{title}" and noticed some of the photos look darker than the room really is.\n\nI fixed one for free so you can see the difference. Same room, nothing added, just brighter light, cleaner color and straight lines. It is attached.\n\nIf you like it, I can do the rest for $49 (up to 10 photos, done in 2 days). If not, no worries at all, keep the free one.\n\nThanks for reading,\nJordan',
  followup: 'Hi {first}, did the free photo come through okay? Happy to fix a different one if you prefer. This is my only follow up.',
};

// ---------- Ad Remakes ----------
const PAGES = ['Rick\'s Roofing ATX', 'Capitol City Roofing', 'Lone Star Roof and Gutter', 'Bauer Brothers Roofing', 'Hill Country Roofers', 'Eastside Roof Repair', 'Austin Storm Pros', 'TopCoat Roofing', 'Barton Roof Co', 'Pecan Street Roofing', 'Red Oak Roofing', 'Blue Bonnet Roofs'];
const WEAK = ['No words on the ad', 'Very short words', 'Same ad for 2 years', 'No words on the ad', 'Blurry picture', 'Very short words', 'No clear button', 'Same ad for 2 years', 'Very short words', 'No words on the ad', 'Stock photo only', 'Very short words'];
export const ADS = PAGES.map((p, i) => ({
  id: 'A' + (i + 1),
  page: p + ' (demo)',
  started: ['Mar 2024', 'Jan 2025', 'Nov 2023', 'Aug 2025', 'Jun 2025', 'Feb 2024', 'Sep 2025', 'Dec 2023', 'May 2025', 'Oct 2024', 'Jul 2025', 'Apr 2025'][i],
  runs: ['Facebook, Instagram', 'Facebook', 'Facebook, Instagram, Messenger', 'Instagram', 'Facebook', 'Facebook, Instagram', 'Facebook', 'Facebook, Instagram', 'Facebook', 'Facebook, Instagram', 'Instagram', 'Facebook'][i],
  weakness: WEAK[i],
  text: ['Roofing. Call today.', 'Best roofs in Austin', 'We do roofs and gutters.', 'Need a roof?', 'Quality roofing', 'Roof repair', 'Storm damage? Call us', 'Roofing services', 'Free estimates', 'Roofers', 'Your local roofer', 'Roof work'][i],
  seed: 3 + i * 5,
  url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=roofing%20austin',
}));
export const AD_CITY = { kind: 'Roofers', city: 'Austin, TX' };

export const AD_IDEAS = [
  { angle: 'pain', label: 'Pain', score: 4.6, parts: {
    primary: 'Storm last night? Small leaks turn into big ceiling stains fast. We check your roof, show you photos of what we find, and tell you straight if it needs work.',
    headline: 'Leak after the storm? We find it fast.',
    description: 'Free roof check in Austin',
    button: 'Free roof check',
    picture: 'A real house with a dark, wet roof after rain, a blue tarp over one section, grey sky. No text, no logos.',
  } },
  { angle: 'proof', label: 'Proof', score: 4.3, parts: {
    primary: 'This is a roof we finished in South Austin last month. Same day cleanup, every nail picked up. See more of our work on our page.',
    headline: 'A new roof, and a clean yard after.',
    description: 'Roof replacement and repair',
    button: 'See our work',
    picture: 'A freshly finished roof in bright sun, clean lawn, neat edges. No text, no logos.',
  } },
  { angle: 'offer', label: 'Offer', score: 4.1, parts: {
    primary: 'We offer a free roof inspection with photos, so you can see exactly what we see. No pressure, just a clear answer.',
    headline: 'Free roof inspection, with photos.',
    description: 'Book a time that suits you',
    button: 'Book inspection',
    picture: 'A roofer on a ladder with a clipboard, checking a roof on a sunny afternoon. No text, no logos.',
  } },
];

export const AD_PITCH = {
  subject: '3 free ad ideas for {company}',
  body: 'Hi {first},\n\nI saw your Facebook ad in the Ad Library. It has been running a while with very few words on it, so I wrote 3 new versions using only services you already list on your site.\n\nI made one into a finished ad picture. It is yours to use for free, no strings.\n\nIf you like it, I make 3 new ads every month for $200 and you can stop any time.\n\nWant me to send the free one?\nJordan',
  followup: 'Hi {first}, should I send the free ad? Just reply yes.',
};

// ---------- YouTube Shorts ----------
export const SHORTS_NICHE = 'animated personal finance';
export const OUTLIERS = [
  { channel: 'Penny Wise Animations (demo)', subs: 8200, avg: 3100, views: 412000, title: 'What $100 becomes in 30 years' },
  { channel: 'Coin Stories (demo)', subs: 21500, avg: 9800, views: 186000, title: 'Why rich people buy boring things' },
  { channel: 'Money in 60 (demo)', subs: 4300, avg: 1900, views: 97000, title: 'The latte myth, explained' },
  { channel: 'Tiny Budget TV (demo)', subs: 46000, avg: 22000, views: 310000, title: 'The 50/30/20 rule in 45 seconds' },
  { channel: 'The Ledger Kid (demo)', subs: 12800, avg: 6400, views: 158000, title: 'How credit card interest really works' },
].map(o => ({ ...o, x: Math.round(o.views / o.avg) }));

export const SCRIPT = {
  hook: 'What happens to $100 if you leave it alone for 30 years?',
  lines: [
    { n: 1, kind: 'Hook', text: 'What happens to $100 if you leave it alone for 30 years?', visual: 'One $100 bill pulses in the middle of the screen.' },
    { n: 2, kind: 'Clip', text: 'Put it somewhere that grows a little each year.', visual: 'Coins drop into a glass jar that slowly fills.' },
    { n: 3, kind: 'Clip', text: 'Year one, it barely moves.', visual: 'Short bars grow left to right, the first ones tiny.' },
    { n: 4, kind: 'Clip', text: 'But growth starts growing on itself.', visual: 'Calendar pages flip: 1, 10, 30.' },
    { n: 5, kind: 'Clip', text: 'Like a snowball rolling downhill.', visual: 'A small snowball rolls and gets bigger.' },
    { n: 6, kind: 'Clip', text: 'The last years add the most.', visual: 'A coin stack grows faster at the top.' },
    { n: 7, kind: 'Key line', text: 'Time does more of the work than the amount.', visual: 'A clock hand spins fast.' },
    { n: 8, kind: 'End card', text: 'One rule: start small, start early.', visual: 'Purple end card with the rule. Small text: not financial advice.' },
  ],
  warning: 'YouTube may not pay for repetitive or mass produced videos. Make each one useful and different: a new idea, a new script, new visuals.',
  disclaimer: 'Money topics get a "not financial advice" line on the end card and in the description.',
};

export const SHORTS_PITCH = {
  subject: 'A free video for your channel',
  body: 'Hi {first},\n\nYour Short "{title}" did really well compared to your usual videos. Small channels on this topic often want more videos than they have time for.\n\nI make faceless animated Shorts. I would like to make you one free sample in your style, on a new money topic, so you can see if it fits.\n\nIf you like it, a pack of 4 is $150. Want the free one?\n\nJordan',
  followup: 'Hi {first}, just a quick nudge in case this got buried. Happy to make the free sample this week. If not, all good.',
};

// ---------- Get paid ----------
export const GET_PAID = {
  airbnb: {
    product: 'Airbnb Photo Pack',
    tiers: [
      { name: 'Free sample', price: 0, unit: '', line: '1 fixed photo, so they can see it', cost: 0.15 },
      { name: 'Photo pack', price: 49, unit: 'one time', line: 'Up to 10 photos, done in 2 days', cost: 1.5, main: true },
      { name: 'Monthly refresh', price: 99, unit: 'a month', line: 'New photos each season, plus fixes', cost: 3, monthly: true },
    ],
    delivery: { files: 10, label: 'fixed photos', message: 'Hi {first},\n\nYour 10 fixed photos are ready. Same rooms, nothing added, just brighter light, cleaner color and straight lines. Whop sent you the download link when you paid.\n\nThank you for trusting me with your listing!\nJordan', review: 'Hi {first}, how do the new photos look on your listing? If you have a minute, a short review would mean a lot. And if you know another host who might want this, I would love an introduction.', next: ['Offer the monthly refresh next season', 'Ask if they know another host', 'Ask to share the before and after (with permission)'] },
  },
  ads: {
    product: 'Local Ad Plan',
    tiers: [
      { name: 'Free first ad', price: 0, unit: '', line: '1 finished ad to try', cost: 0.3 },
      { name: 'Local Ad Plan', price: 200, unit: 'a month', line: '3 new ads a month, stop any time', cost: 1, main: true, monthly: true },
      { name: 'Bigger plan', price: 450, unit: 'a month', line: '8 new ads a month and a short video ad', cost: 4, monthly: true },
    ],
    delivery: { files: 3, label: 'finished ads', message: 'Hi {first},\n\nYour 3 ads for this month are ready, sized for Facebook and Instagram. Whop sent you the download link.\n\nJordan', review: 'Hi {first}, how are the new ads doing? If you have a minute, a short review would help a lot. Know another business that needs better ads?', next: ['Ask for numbers after 2 weeks', 'Offer the bigger plan', 'Ask for an introduction'] },
  },
  shorts: {
    product: 'YouTube Shorts Package',
    tiers: [
      { name: 'Single video', price: 45, unit: 'one time', line: '1 Short, your topic', cost: 3 },
      { name: 'YouTube Shorts Package', price: 150, unit: 'one time', line: '4 Shorts, done in a week', cost: 10, main: true },
      { name: 'One a week', price: 160, unit: 'a month', line: '4 to 5 Shorts a month, new topics', cost: 12, monthly: true },
    ],
    delivery: { files: 4, label: 'Shorts', message: 'Hi {first},\n\nYour 4 Shorts are ready to upload. Whop sent you the download link.\n\nJordan', review: 'Hi {first}, how did the Shorts do? A short review would mean a lot. Know another channel that needs videos?', next: ['Offer one a week', 'Ask which video did best', 'Ask for an introduction'] },
  },
};
export const WHOP_FEE = { pct: 0.03, fixed: 0.30 }; // est. Check Whop's current fees.
