// Demo content for the Digital Product track. Every person, quote, listing and business is
// made up and marked "(demo)". Links go to real public search pages, not to invented posts.

export const IDEA = {
  text: 'GLP-1 protein',
  kind: 'topic',
  chips: ['GLP-1 protein', 'Perimenopause sleep', 'ADHD home reset', 'Crochet pattern sellers'],
};

export const RESEARCH = {
  robots: [
    { id: 'reddit', name: 'Reddit posts and comments', count: 60, price: 0.20 },
    { id: 'amazon', name: 'Amazon products', count: 30, price: 0.15 },
    { id: 'etsy', name: 'Etsy listings', count: 30, price: 0.12 },
    { id: 'tiktok', name: 'TikTok videos', count: 20, price: 0.08 },
    { id: 'youtube', name: 'YouTube videos', count: 15, price: 0.07 },
  ],
  searches: [
    'reddit: "glp-1" protein "not hungry"',
    'reddit: zepbound "how do you get protein"',
    'reddit: semaglutide "losing muscle"',
    'amazon: glp-1 protein cookbook',
    'amazon: high protein small meals',
    'etsy: glp-1 meal plan printable',
    'etsy: protein tracker printable',
    'tiktok: #glp1protein',
    'tiktok: what I eat on ozempic',
    'youtube: glp-1 muscle loss protein',
  ],
  quotes: [
    { text: 'I know I need protein but by the time I eat two bites of chicken I am done. Then I feel weak at the gym.', where: 'Reddit, r/Zepbound', url: 'https://www.reddit.com/r/Zepbound/' },
    { text: 'Every list says eat 120g of protein. I can barely eat 600 calories. Nobody explains how.', where: 'Reddit, r/Semaglutide', url: 'https://www.reddit.com/r/Semaglutide/' },
    { text: 'My doctor said "eat more protein" and that was the whole conversation.', where: 'Reddit, r/Mounjaro', url: 'https://www.reddit.com/r/Mounjaro/' },
    { text: 'Shot day plus one I cannot look at food. What do you all actually eat?', where: 'Reddit, r/Zepbound', url: 'https://www.reddit.com/r/Zepbound/' },
    { text: 'Bought a GLP-1 cookbook and every recipe is a huge dinner plate. That is not my life anymore.', where: 'Amazon review', url: 'https://www.amazon.com/s?k=glp-1+cookbook' },
    { text: 'I want something that just tells me what to eat at 10am when I am not hungry.', where: 'TikTok comment', url: 'https://www.tiktok.com/tag/glp1protein' },
    { text: 'Scared I am losing muscle, not just fat. My arms look different.', where: 'Reddit, r/Semaglutide', url: 'https://www.reddit.com/r/Semaglutide/' },
    { text: 'Printable was cute but no sources. How do I know any of it is right?', where: 'Etsy review', url: 'https://www.etsy.com/search?q=glp-1+meal+plan' },
  ],
  listings: [
    { title: 'GLP-1 Meal Plan Printable, 4 Weeks (demo)', where: 'Etsy', price: 4.99, reviews: 1240, note: 'No sources', url: 'https://www.etsy.com/search?q=glp-1+meal+plan' },
    { title: 'High Protein Tracker Bundle (demo)', where: 'Etsy', price: 7.50, reviews: 386, note: 'Tracker only', url: 'https://www.etsy.com/search?q=protein+tracker' },
    { title: 'The GLP-1 Companion Cookbook (demo)', where: 'Amazon', price: 18.99, reviews: 2104, note: 'Full size meals', url: 'https://www.amazon.com/s?k=glp-1+cookbook' },
    { title: 'Protein Smoothies for Small Appetites (demo)', where: 'Amazon', price: 12.99, reviews: 211, note: 'Drinks only', url: 'https://www.amazon.com/s?k=protein+smoothies' },
    { title: 'Ozempic Kitchen eBook (demo)', where: 'Amazon Kindle', price: 9.99, reviews: 873, note: 'No sources', url: 'https://www.amazon.com/s?k=ozempic+kitchen' },
    { title: 'GLP-1 Nutrition Course (demo)', where: 'Stan Store', price: 47, reviews: null, note: 'Video only', url: 'https://www.google.com/search?q=glp-1+nutrition+course' },
  ],
  crowded: [
    { where: 'Reddit', count: 412, label: 'threads asking how' },
    { where: 'Amazon', count: 38, label: 'books and guides' },
    { where: 'Etsy', count: 96, label: 'printables' },
    { where: 'TikTok', count: 1200, label: 'videos on the topic' },
    { where: 'YouTube', count: 240, label: 'videos on the topic' },
  ],
  verdict: 'Lots of cheap plans, nothing sourced. Room to win.',
};

const SCORE_KEYS = [['lasts', 'Lasts'], ['easy', 'Easy to make'], ['runs', 'Runs itself'], ['again', 'Buys again'], ['room', 'Room to win']];
export { SCORE_KEYS };

export const POCKETS = [
  {
    id: 'glp1', name: 'GLP-1 protein',
    pocket: 'Help adults on GLP-1 shots get enough protein to protect muscle without forcing big meals they cannot finish.',
    scores: { lasts: 5, easy: 5, runs: 4, again: 4, room: 5 },
    why: 'Huge, growing group with a clear, worrying problem. What sells today is cheap, generic and unsourced. A short, sourced, small appetite guide stands out.',
    pays: 'Printables at $5 to $8, cookbooks at $10 to $19, a few courses near $47.',
    proof: {
      pains: ['Too full to finish protein', 'Fear of losing muscle', 'Generic advice from doctors', 'Recipes sized for old appetites'],
      quotes: [0, 1, 6],
      hangouts: ['r/Zepbound', 'r/Semaglutide', 'r/Mounjaro', 'TikTok #glp1protein', 'Facebook GLP-1 groups'],
      size: 'Millions of adults in the US alone use these medicines (est.)',
    },
  },
  {
    id: 'peri', name: 'Perimenopause sleep',
    pocket: 'Help women in perimenopause sleep through the night without relying on sleeping pills.',
    scores: { lasts: 5, easy: 4, runs: 4, again: 3, room: 4 },
    why: 'Big, loyal audience and a painful problem. Crowded with supplements, lighter on calm, practical plans.',
    pays: 'Sleep journals at $9, courses at $49 to $99, lots of supplements.',
    proof: { pains: ['Waking at 3am', 'Night sweats', 'Brain fog the next day'], quotes: [], hangouts: ['r/Perimenopause', 'Facebook groups', 'Instagram'], size: 'Tens of millions of women in this life stage (est.)' },
  },
  {
    id: 'adhd', name: 'ADHD home reset',
    pocket: 'Help adults with ADHD reset a messy home in 15 minute bursts without shame.',
    scores: { lasts: 4, easy: 5, runs: 4, again: 4, room: 3 },
    why: 'Very active buyers who love printables. More crowded, but bundles and add ons sell well.',
    pays: 'Cleaning printables at $3 to $12, many sellers.',
    proof: { pains: ['Overwhelm', 'Starting is the hard part', 'Shame about the mess'], quotes: [], hangouts: ['r/ADHD', 'TikTok', 'Pinterest'], size: 'Large and growing online community (est.)' },
  },
  {
    id: 'crochet', name: 'First Etsy crochet pattern',
    pocket: 'Help hobby crocheters write and sell their first pattern on Etsy without getting buried.',
    scores: { lasts: 4, easy: 4, runs: 3, again: 3, room: 4 },
    why: 'Clear first step for makers. Smaller market and buyers spend less.',
    pays: 'Pattern writing guides at $8 to $25.',
    proof: { pains: ['Pattern testing', 'Photos that sell', 'Pricing'], quotes: [], hangouts: ['r/crochet', 'Ravelry', 'Etsy forums'], size: 'Smaller niche, steady demand (est.)' },
  },
  {
    id: 'nurses', name: 'Protein meals for nurses on 12 hour shifts',
    pocket: 'Help nurses on 12 hour shifts eat enough protein without a break long enough to cook or sit down.',
    scores: { lasts: 4, easy: 4, runs: 3, again: 3, room: 4 },
    why: 'Very specific and easy to reach, but a smaller group and harder to find at scale.',
    pays: 'Meal prep guides at $10 to $20.',
    proof: { pains: ['No real lunch break', 'Vending machine dinners', 'Too tired to cook'], quotes: [], hangouts: ['r/nursing', 'Nurse TikTok', 'Facebook groups'], size: 'Several million nurses in the US (est.)' },
  },
].map(p => ({ ...p, total: Object.values(p.scores).reduce((a, b) => a + b, 0) }));

// ---------- the plan, for all 3 formats ----------
const COMMON = {
  title: 'The Small Appetite Protein Plan',
  subtitle: 'How to eat enough protein on GLP-1 shots when you are barely hungry',
  promise: 'Get enough protein to protect your muscle, in small, easy bites, without forcing big meals.',
  before: {
    have: 'A medicine that kills your appetite and a vague "eat more protein" from your doctor.',
    do: 'Skip meals, graze on crackers, try to force down a big dinner and feel sick.',
    feel: 'Worried about losing muscle, guilty about not eating "right", confused by advice.',
  },
  after: {
    have: 'One protein number, a short list of easy foods and a 14-day plan.',
    do: 'Eat protein first, on small plates, with three small snacks on low days.',
    feel: 'Calm and in control. Strong enough for stairs and groceries.',
  },
  journey: [
    { stage: 'Understand', milestone: 'Knows why appetite changed and why protein matters now' },
    { stage: 'Set the number', milestone: 'Has a daily protein target agreed with their doctor' },
    { stage: 'Eat it daily', milestone: 'Protein first at two meals a day, low day snacks ready' },
    { stage: 'Keep it', milestone: 'Strength work twice a week and the habits feel automatic' },
  ],
  bonuses: ['A printable 14-day tracker', 'A small appetite shopping list', 'A protein swaps chart', 'Questions to ask your doctor'],
  price: 37,
  priceWhy: 'Buyers already pay $5 to $19 for unsourced printables and cookbooks, and about $47 for video courses. $37 sits below courses and is fair for a sourced, complete plan with bonuses.',
};

export const PLANS = {
  ebook: {
    ...COMMON,
    unit: 'chapters',
    outline: [
      'Start Here', 'Why Your Appetite Changed', 'Why Protein Matters Now', 'Your Protein Number', 'Protein First, on Small Plates',
      'Easy Wins for Low Days', 'Drinks, Water and Fiber', 'Move to Keep Muscle', 'When to Call Your Doctor', 'The 14-Day Protein Plan',
    ].map((t, i) => ({ n: i + 1, title: t })),
    button: 'Build the ebook',
  },
  course: {
    ...COMMON,
    title: 'The Small Appetite Protein Course',
    price: 67,
    priceWhy: 'Video courses in this space sell for about $47 and up. Six short lessons with worksheets and the ebook included justify $67.',
    unit: 'lessons',
    outline: [
      { n: 1, title: 'Why your appetite changed', script: 'A 6 minute talk with simple drawings of how fullness works on these medicines, and why first bites matter.', sheet: 'My first bites: a one page log for 3 meals.' },
      { n: 2, title: 'Find your protein number', script: 'Walk through the 0.8 grams per kilogram floor, the higher numbers some experts suggest, and how to ask your doctor.', sheet: 'My number: a fill in calculator with space for your doctor\'s note.' },
      { n: 3, title: 'Protein first, on small plates', script: 'A kitchen demo: plating a small protein first meal in under 5 minutes.', sheet: 'Small plate builder: palm, color, spoon.' },
      { n: 4, title: 'Low days and drinks', script: 'What to eat the day after your shot, sipping protein, and staying hydrated.', sheet: 'My low day list and a 3 reminder schedule.' },
      { n: 5, title: 'Move to keep muscle', script: 'Follow along: chair stands and wall push ups for beginners, 8 minutes.', sheet: 'Two week strength check.' },
      { n: 6, title: 'Your 14 days, and when to call', script: 'The 14-day plan, warning signs, and how to keep going after day 14.', sheet: 'The 14-day tracker and a doctor visit question list.' },
    ],
    button: 'Build the video course',
  },
  coaching: {
    ...COMMON,
    title: 'Small Appetite Protein Coaching',
    price: 297,
    priceWhy: 'Group nutrition coaching in this space often runs $200 to $500 for a month. Four weekly calls plus the ebook and check ins fit at $297.',
    unit: 'weeks',
    outline: [
      { n: 1, title: 'Understand and set the number', call: 'Welcome, why appetite changed, each person sets a target to confirm with their doctor.', checkin: 'How many meals did you eat protein first? (0 to 21)' },
      { n: 2, title: 'Protein first and small plates', call: 'Share plates, fix sticking points, build the low day list together.', checkin: 'How many low day snacks did you use?' },
      { n: 3, title: 'Low days, drinks and fiber', call: 'Shot day plans, hydration check, adding fiber slowly.', checkin: 'Any signs of dehydration this week? (yes or no, then call your doctor if yes)' },
      { n: 4, title: 'Move and keep it going', call: 'Strength routine, warning signs review, your plan after the program.', checkin: 'Chair stands today vs week 1.' },
    ],
    button: 'Build the coaching offer',
  },
};

// ---------- ready to sell ----------
export const READY = {
  creatorTitle: 'Strong on Small Plates',
  fullTitle: 'Strong on Small Plates: The Small Appetite Protein Plan',
  creator: 'with Maya Ortiz (demo)',
  price: 37,
  addon: { name: 'Small Plates Recipe Pack', price: 19, pitch: '30 small, high protein recipes Maya actually eats, each one fits on a salad plate.' },
  store: {
    headline: 'Eat enough protein on GLP-1 shots, even when you are barely hungry',
    sub: 'A short, sourced plan with small plates, low day snacks and a 14-day routine. Written with a creator who lives it.',
    bullets: [
      'Find your daily protein number in 5 minutes',
      'The protein first rule that works on a small appetite',
      'A low day snack list for the day after your shot',
      'Simple strength moves to help protect muscle',
      'Clear warning signs and when to call your doctor',
      '24 sources, every fact numbered and linked',
    ],
    priceLine: '$37, one time, instant download',
    guarantee: 'If it does not help, email within 30 days for a full refund. No forms, no questions.',
  },
  creatorMessage: 'Hi Maya, the book is done. It is called "Strong on Small Plates", built from your reels and fully sourced. I added a "From Maya\'s kitchen" box to four chapters using only things you have already said on camera. Can you read it this week and mark anything that does not sound like you? Once you are happy, I will put it on Whop at $37 and we split every sale 50/50, like we said. Thank you!',
};

// ---------- the creator (made up for the demo) ----------
export const CREATOR = {
  name: 'Maya Ortiz (demo)',
  handle: '@smallplates.maya (demo)',
  followers: 38400,
  postsRead: 15,
  platform: 'Instagram',
  bio: 'Nurse, mom of 2, on Zepbound since spring. Small plates, real food, no shame. (demo)',
  posts: [
    { id: 1, caption: 'What I eat in a day when I am NOT hungry. Spoiler: it is mostly snacks and that is fine.', views: 182000 },
    { id: 2, caption: 'Protein first, always. Three bites before anything else. That is the rule.', views: 96400 },
    { id: 3, caption: 'My salad plate trick. Same food, looks like a real dinner.', views: 54100 },
    { id: 4, caption: 'What I eat on shot day. Fridge door five, no cooking.', views: 121000 },
    { id: 5, caption: 'Grocery haul for a small appetite. All under $60.', views: 41800 },
    { id: 6, caption: 'Sip your protein. Kefir on the commute changed my mornings.', views: 63200 },
    { id: 7, caption: 'Kettle workout: ten chair stands while the water boils. I started with four.', views: 77900 },
    { id: 8, caption: 'Real talk: I was scared I was losing muscle. Here is what my doctor said.', views: 208000 },
    { id: 9, caption: 'Cottage cheese three ways. Do not scroll, it is actually good.', views: 48600 },
  ],
  traits: [
    { t: 'Warm and direct, like a friend in the kitchen', post: 1 },
    { t: 'Uses simple house rules ("protein first, always")', post: 2 },
    { t: 'Honest about hard days, never shames', post: 8 },
    { t: 'Practical, budget aware', post: 5 },
  ],
  phrases: [{ p: 'protein first, always', post: 2 }, { p: 'fridge door five', post: 4 }, { p: 'real talk', post: 8 }, { p: 'do not scroll', post: 9 }],
  topics: [
    { t: 'What I eat', share: 38, color: '#7a55ff' },
    { t: 'Protein tricks', share: 27, color: '#ff6a1f' },
    { t: 'Shot day and side effects', share: 18, color: '#2fd287' },
    { t: 'Moving and strength', share: 11, color: '#5b8cff' },
    { t: 'Groceries', share: 6, color: '#f5c542' },
  ],
  audience: {
    who: 'Women 30 to 55 on GLP-1 shots, many in health or care jobs',
    want: 'Simple food that fits a small appetite and keeps them strong',
    fear: 'Losing muscle, looking unwell, doing it "wrong"',
  },
};

// ---------- launch ----------
export const OFFER = {
  robots: [
    { id: 'whop', name: 'Whop products', count: 20, price: 0.02 },
    { id: 'gumroad', name: 'Trending Gumroad products', count: 20, price: 0.02 },
    { id: 'skool', name: 'Paid Skool communities', count: 10, price: 0.01 },
    { id: 'reels', name: 'Top reels on the topic', count: 20, price: 0.05 },
  ],
  who: 'Adults on GLP-1 shots who are barely hungry and worried about losing muscle.',
  problem: 'They cannot finish normal meals, so protein falls short, and nobody shows them how to fix it.',
  promise: 'Eat enough protein in small, easy bites, with a 14-day plan and clear warning signs.',
  price: '$37 one time',
  bonuses: ['14-day tracker', 'Shopping list', 'Swaps chart', 'Doctor questions'],
  pitches: [
    'You keep asking me what I actually eat when I am not hungry. So I made Strong on Small Plates.',
    'You keep asking me how I get my protein in on shot day. So I made a 14-day plan for it.',
    'You keep asking me if I am losing muscle. So I made a sourced guide to protect it.',
  ],
  objections: [
    { q: 'I can find this free online.', a: 'You can find pieces of it. This puts it in one short plan, in order, with every fact sourced so you do not have to wonder.' },
    { q: 'Is this medical advice?', a: 'No. It is general information with sources. It tells you exactly what to ask your doctor.' },
    { q: 'I do not have time to cook.', a: 'Most of it needs no cooking at all. The low day list is open the fridge and eat.' },
    { q: '$37 is a lot.', a: 'It is less than one takeout night for two. If it does not help, you get your money back within 30 days.' },
    { q: 'Will it work for me?', a: 'It is built for small appetites on GLP-1 shots. If that is you, it is written for you. If you have kidney disease, check with your doctor first.' },
  ],
  tried: [
    { what: 'Big GLP-1 cookbooks', why: 'Recipes sized for an old appetite.' },
    { what: 'Protein tracker apps', why: 'Counting without a plan for what to eat.' },
    { what: 'Free TikTok tips', why: 'Scattered, sometimes wrong, never sourced.' },
  ],
  competitors: [
    { name: '4 week meal plan (demo)', price: 'about $5', note: 'no sources' },
    { name: 'GLP-1 cookbook (demo)', price: 'about $19', note: 'full size meals' },
    { name: 'GLP-1 nutrition course (demo)', price: 'about $47', note: 'video only, no plan' },
    { name: 'Protein tracker bundle (demo)', price: 'about $8', note: 'tracking only' },
  ],
};

export const LAUNCH_KIT = {
  ebook: {
    reels: [
      { title: 'The 3 bite rule', hook: 'If you are on a GLP-1 and barely hungry, do this first.', lines: ['Three bites of protein before anything else.', 'If you only finish half, it was the right half.', 'Research on muscle suggests protein spread across meals helps.', 'I wrote it all down, with sources.', 'Link in my bio.'], beats: ['Barely hungry?', '3 bites of protein first', 'Then the rest', 'Strong on Small Plates'], shot: 'Phone propped on the counter, you plating eggs on a salad plate.', secs: 28 },
      { title: 'Shot day snacks', hook: 'This is everything I eat the day after my shot.', lines: ['10am: a small kefir.', '1pm: a cheese stick.', '4pm: a small yogurt.', 'Three small snacks, about 30 grams of protein.', 'The whole low day list is in my book. Link in bio.'], beats: ['Shot day +1', '10am kefir', '1pm cheese stick', '4pm yogurt', 'Link in bio'], shot: 'Open the fridge door, grab each snack, time stamp text on screen.', secs: 34 },
      { title: 'Am I losing muscle?', hook: 'Real talk: I was scared I was losing muscle on Zepbound.', lines: ['Studies show some weight lost can be lean mass.', 'Two things help: protein and strength work.', 'I do ten chair stands while the kettle boils.', 'Everything is sourced in the book.', 'Link in my bio.'], beats: ['Losing muscle?', 'Protein + strength', '10 chair stands', 'Sources inside'], shot: 'Kitchen, kettle on, you doing chair stands.', secs: 38 },
    ],
    captions: [
      'I earn from each sale of this ebook. Okay. The question I get every single day: how do you get your protein in when you are not hungry? Protein first. Three bites before anything else. I wrote the whole plan down with a sourced guide, Strong on Small Plates. Link in bio.',
      'I earn from each sale of this ebook. Shot day snacks, no cooking: kefir, cheese stick, small yogurt. That is my fridge door five. The full low day list is in the book. Link in bio.',
      'I earn from each sale of this ebook. Salad plates changed everything for me. Same food, looks like dinner, and I actually finish it. Chapter 5 is all about this. Link in bio.',
      'I earn from each sale of this ebook. Real talk: I was scared about muscle loss. The book explains what the studies say, in plain words, with every source linked. Link in bio.',
      'I earn from each sale of this ebook. 14 days. One small habit a day. That is the plan at the end of Strong on Small Plates. Day 1 is just writing one number on a sticky note. Link in bio.',
    ],
    emails: [
      { subject: 'It is here: Strong on Small Plates', body: 'Hi {first name},\n\nThe book is live. It is the plan I wish I had when I started: protein first, small plates, low day snacks and a 14-day routine. Every fact is sourced.\n\nIt is $37 and you can read it tonight: {link}\n\nI earn from each sale of this ebook.\n\nMaya' },
      { subject: 'One tip from chapter 6', body: 'Hi {first name},\n\nOn low days, three small snacks of about 10 grams of protein each add up to a real meal. Put them at eye level in the fridge so you do not have to think.\n\nThe full list is in the book: {link}\n\nI earn from each sale of this ebook.\n\nMaya' },
      { subject: 'Last reminder about the book', body: 'Hi {first name},\n\nJust a quick last note: Strong on Small Plates is here if you want it. If it is not for you, no worries at all. This is the last email about it.\n\n{link}\n\nI earn from each sale of this ebook.\n\nMaya' },
    ],
    stories: [
      { type: 'Poll', text: 'Do you struggle to eat protein on your shot?', sticker: 'Poll: Yes / Some days' },
      { type: 'You asked', text: '"What do you eat when you are not hungry?" I made a whole book about it.', sticker: 'Question reply' },
      { type: 'Peek inside', text: 'Chapter 6: Easy Wins for Low Days', sticker: 'Slider: how useful?' },
      { type: 'Price and link', text: '$37, one time, instant download', sticker: 'Link sticker' },
      { type: 'Disclosure', text: 'I earn from each sale of this ebook.', sticker: 'Text only' },
      { type: 'Question box', text: 'Ask me anything about the book', sticker: 'Question box' },
      { type: 'A real reply', text: 'Share a real reply you got, with their permission only.', sticker: 'Screenshot (with permission)' },
      { type: 'Thank you', text: 'Thank you for all the love on this one.', sticker: 'Emoji slider' },
    ],
    faqs: [
      { q: 'How much is it?', a: '$37, one time. You get the PDF right away.' },
      { q: 'Can I get a refund?', a: 'Yes. Email within 30 days for a full refund.' },
      { q: 'Is it for me?', a: 'It is for adults on GLP-1 shots who struggle to eat enough. If you have kidney disease, ask your doctor first.' },
      { q: 'Is this medical advice?', a: 'No. It is general information with 24 sources. It helps you ask your doctor better questions.' },
      { q: 'Did you really make this?', a: 'We made it together. The book is written and sourced with a writer, and every "From Maya\'s kitchen" box comes from my real posts.' },
      { q: 'Do I need protein powder?', a: 'No. Powders are optional. Most ideas use normal foods.' },
      { q: 'Does it have recipes?', a: 'It has simple plates and snack lists. Full recipes are in the optional $19 recipe pack.' },
      { q: 'Is it vegetarian friendly?', a: 'Yes, there are plenty of options with eggs, dairy, beans, lentils and tofu.' },
    ],
    plan: [
      { day: 1, post: 'Reel: The 3 bite rule', stories: 'Poll, You asked', email: 'Launch email', goal: 'Say it is here' },
      { day: 2, post: 'Caption post: shot day snacks', stories: 'Peek inside', email: '', goal: 'Show what is inside' },
      { day: 3, post: 'Reel: Shot day snacks', stories: 'Question box', email: '', goal: 'Answer questions' },
      { day: 4, post: 'Carousel: salad plate trick', stories: 'Price and link', email: 'Helpful tip email', goal: 'Teach one tip' },
      { day: 5, post: 'Reel: Am I losing muscle?', stories: 'A real reply', email: '', goal: 'Build trust' },
      { day: 6, post: 'Caption post: 14 days', stories: 'Disclosure, Thank you', email: '', goal: 'Social proof' },
      { day: 7, post: 'Story only', stories: 'Last call', email: 'Last reminder', goal: 'Last reminder, then stop' },
    ],
  },
  airbnb: {
    reels: [
      { title: 'Same room, more light', hook: 'Hosts, your room is not this dark. Your photo is.', lines: ['This is the same room. Nothing added.', 'Brighter, cleaner whites, straight lines.', 'One free photo, then a pack if you like it.', 'Link in my bio.'], beats: ['Same room', 'Before', 'After', 'Free photo'], shot: 'Screen record the before and after slider moving.', secs: 22 },
      { title: 'Crooked walls', hook: 'Why does your listing look crooked? This.', lines: ['Tilted phone, leaning walls.', 'We straighten lines, fix the color.', 'Nothing fake. Same furniture, same view.', 'Link in bio.'], beats: ['Leaning walls?', 'Straightened', 'Nothing fake'], shot: 'Two photos side by side with grid lines.', secs: 20 },
      { title: '3 photo fixes', hook: '3 things that make a listing photo look dark.', lines: ['Shooting into a bright window.', 'Lamps with warm bulbs.', 'Phone exposure set too low.', 'We fix all three. Link in bio.'], beats: ['1. Window glare', '2. Warm bulbs', '3. Low exposure'], shot: 'Talking head with text beats.', secs: 30 },
    ],
    captions: ['I earn from each photo pack I sell. Same room, more light, nothing added. One free photo for hosts. Link in bio.', 'I earn from each photo pack I sell. Dark photos mean fewer clicks. We fix light, color and straight lines only. Link in bio.', 'I earn from each photo pack I sell. Want a free fixed photo of your listing? Reply "photo".', 'I earn from each photo pack I sell. Before and after from a host this week (shared with permission).', 'I earn from each photo pack I sell. Up to 10 photos, done in 2 days. $49. Link in bio.'],
    emails: [{ subject: 'Your free fixed photo', body: 'Hi {first name},\n\nHere is your free fixed photo. Same room, nothing added. If you want the rest done, it is $49 for up to 10 photos: {link}\n\nNo worries if not.' }, { subject: 'A quick tip for listing photos', body: 'Hi {first name},\n\nTurn on every lamp and shoot with your back to the window. It helps a lot. If you want us to fix the rest: {link}' }, { subject: 'Last note from me', body: 'Hi {first name},\n\nLast note: the photo pack offer is here if it helps. This is my last email about it. {link}' }],
    stories: [{ type: 'Poll', text: 'Hosts: are your photos too dark?', sticker: 'Poll' }, { type: 'You asked', text: 'Do you change the room? Never.', sticker: 'Question reply' }, { type: 'Peek inside', text: 'Before and after', sticker: 'Slider' }, { type: 'Price and link', text: '$49 for up to 10 photos', sticker: 'Link' }, { type: 'Disclosure', text: 'I earn from each photo pack I sell.', sticker: 'Text' }, { type: 'Question box', text: 'Ask about your listing', sticker: 'Question box' }, { type: 'A real reply', text: 'Shared with permission only.', sticker: 'Screenshot' }, { type: 'Thank you', text: 'Thanks hosts!', sticker: 'Emoji slider' }],
    faqs: [{ q: 'Do you change my room?', a: 'Never. Light, color and straight lines only.' }, { q: 'How much?', a: '$49 for up to 10 photos, done in 2 days.' }, { q: 'Refunds?', a: 'If you do not like them, you do not pay.' }],
    plan: [{ day: 1, post: 'Reel: Same room, more light', stories: 'Poll', email: '', goal: 'Show the change' }, { day: 2, post: 'Caption: free photo', stories: 'Peek inside', email: '', goal: 'Offer a free photo' }, { day: 3, post: 'Reel: Crooked walls', stories: 'Question box', email: '', goal: 'Teach' }, { day: 4, post: 'Before and after carousel', stories: 'Price and link', email: '', goal: 'Show results' }, { day: 5, post: 'Reel: 3 photo fixes', stories: 'Disclosure', email: '', goal: 'Trust' }, { day: 6, post: 'Caption: pack details', stories: 'A real reply', email: '', goal: 'Proof' }, { day: 7, post: 'Story only', stories: 'Thank you', email: '', goal: 'Last call' }],
  },
};

export const DISCLOSURE = {
  line: 'I earn from each sale of this ebook.',
  places: [
    { where: 'Reels', how: 'Say it out loud in the first seconds and put it in the on screen text.' },
    { where: 'Captions', how: 'First line of every caption, before "more".' },
    { where: 'Stories', how: 'On the price and link frame, as text you can read.' },
    { where: 'Emails', how: 'Near the link, not hidden at the bottom.' },
    { where: 'Bio link page', how: 'Next to the book.' },
  ],
  ftc: 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers',
};

export const CHECKLIST = [
  'Every caption starts with the disclosure line',
  'The price in every post matches the store page',
  'The link in bio goes to the right Whop page',
  'The store page is visible (not hidden)',
  'No promise of weight loss or health results',
  'No made up reviews or testimonials',
  '"General information, not medical advice" is in the book',
  'Any shared reply has the person\'s permission',
  'The creator has read and approved the book',
  'The refund promise matches the store page',
  'Each reel has a hook in the first 2 seconds',
  'The emails stop after the last reminder',
];
