// The Apify robots ("actors") the app can run, with a price per result.
// Prices are estimates from each robot's public store page. Check them in the Apify store
// before a big run. You can change the actor IDs in settings.json ("robots") if one is retired.

export const ROBOTS = [
  { id: 'reddit', actor: 'trudax/reddit-scraper-lite', name: 'Reddit posts and comments', perResult: 0.0034, unit: 'post',
    input: (q, n) => ({ searches: [q], maxItems: n, maxPostCount: n, maxComments: 5, sort: 'relevance' }) },
  { id: 'amazon', actor: 'junglee/amazon-crawler', name: 'Amazon products', perResult: 0.005, unit: 'product',
    input: (q, n) => ({ categoryOrProductUrls: [{ url: 'https://www.amazon.com/s?k=' + encodeURIComponent(q) }], maxItemsPerStartUrl: n }) },
  { id: 'etsy', actor: 'epctex/etsy-scraper', name: 'Etsy listings', perResult: 0.004, unit: 'listing',
    input: (q, n) => ({ search: q, maxItems: n }) },
  { id: 'tiktok', actor: 'clockworks/tiktok-scraper', name: 'TikTok videos', perResult: 0.004, unit: 'video',
    input: (q, n) => ({ searchQueries: [q], resultsPerPage: n }) },
  { id: 'youtube', actor: 'streamers/youtube-scraper', name: 'YouTube videos', perResult: 0.005, unit: 'video',
    input: (q, n) => ({ searchQueries: [q], maxResults: n }) },
  { id: 'igHashtag', actor: 'apify/instagram-hashtag-scraper', name: 'Instagram reels by topic', perResult: 0.0023, unit: 'post',
    input: (q, n) => ({ hashtags: [q.replace(/[^a-z0-9]/gi, '')], resultsLimit: n, resultsType: 'reels' }) },
  { id: 'igProfile', actor: 'apify/instagram-profile-scraper', name: 'Instagram profiles', perResult: 0.0026, unit: 'profile',
    input: (q, n, extra) => ({ usernames: (extra?.usernames || []).slice(0, n) }) },
  { id: 'igReels', actor: 'apify/instagram-reel-scraper', name: 'Instagram recent reels', perResult: 0.0026, unit: 'reel',
    input: (q, n, extra) => ({ username: extra?.usernames || [], resultsLimit: n }) },
  { id: 'airbnb', actor: 'tri_angle/airbnb-scraper', name: 'Airbnb public listings', perResult: 0.0035, unit: 'listing',
    input: (q, n) => ({ locationQueries: [q], maxItems: n }) },
  { id: 'adLibrary', actor: 'curious_coder/facebook-ads-library-scraper', name: 'Meta Ad Library ads', perResult: 0.00075, unit: 'ad',
    input: (q, n) => ({ urls: [{ url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=' + encodeURIComponent(q) }], count: n }) },
  { id: 'maps', actor: 'compass/crawler-google-places', name: 'Google Maps businesses', perResult: 0.004, unit: 'place',
    input: (q, n) => ({ searchStringsArray: [q], maxCrawledPlacesPerSearch: n }) },
  { id: 'whopStore', actor: 'apify/website-content-crawler', name: 'Whop, Gumroad and Skool pages', perResult: 0.002, unit: 'page',
    input: (q, n) => ({ startUrls: [{ url: 'https://www.google.com/search?q=' + encodeURIComponent(q + ' site:whop.com OR site:gumroad.com OR site:skool.com') }], maxCrawlPages: n }) },
];

export function robotList(overrides) {
  if (!overrides || typeof overrides !== 'object') return ROBOTS;
  return ROBOTS.map(r => (overrides[r.id] ? { ...r, actor: overrides[r.id] } : r));
}
