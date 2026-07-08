import db from '../config/db.js';

const SYNC_INTERVAL = 30 * 60 * 1000; // Run every 30 minutes

// Clean HTML tags and CDATA syntax from strings
function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Extract CDATA content
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…').replace(/&bull;/g, '•')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))  // numeric entities
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))) // hex entities
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/\s+/g, ' ')   // Collapse multiple spaces
    .trim();
}

// Extract image URL from an RSS item XML block
function extractImageUrl(itemXml) {
  // Try media:content url attribute
  const mediaContent = itemXml.match(/<media:content[^>]+url="([^"]+)"/i);
  if (mediaContent) return mediaContent[1];

  // Try media:thumbnail url attribute
  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/i);
  if (mediaThumbnail) return mediaThumbnail[1];

  // Try enclosure url attribute
  const enclosure = itemXml.match(/<enclosure[^>]+url="([^"]+)"/i);
  if (enclosure) return enclosure[1];

  // Try any url attribute pointing to an image file
  const anyImgUrl = itemXml.match(/url="([^"]+\.(jpg|jpeg|png|webp|gif)[^"]*)"/i);
  if (anyImgUrl) return anyImgUrl[1];

  // Try img tag src inside description
  const imgTag = itemXml.match(/<img[^>]+src="([^"]+)"/i);
  if (imgTag) return imgTag[1];

  return null;
}

// Simple XML parser for RSS feeds using regex
function parseRssFeeds(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract Title
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const title = titleMatch ? cleanString(titleMatch[1]) : '';
    
    // Extract Link
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const link = linkMatch ? cleanString(linkMatch[1]) : '';
    
    // Extract Description/Content
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const description = descMatch ? cleanString(descMatch[1]) : '';
    
    // Extract pubDate
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDate = pubDateMatch ? cleanString(pubDateMatch[1]) : '';
    
    // Extract Image URL using robust extraction
    const imageUrl = extractImageUrl(itemContent);
    
    if (title && (description || link)) {
      items.push({
        title,
        description: description || title,
        link,
        imageUrl: imageUrl || null,
        pubDate
      });
    }
  }
  return items;
}

// Helper to map dynamic categories based on article context
function detectCategory(title, description, fallbackCategory) {
  // If the fallback is already 'Hindi News', preserve it — don't override
  if (fallbackCategory === 'Hindi News') return 'Hindi News';

  const text = `${title || ''} ${description || ''}`.toLowerCase();
  
  if (text.includes('business') || text.includes('economy') || text.includes('finance') || text.includes('market') || text.includes('stock') || text.includes('sensex') || text.includes('nifty')) {
    return 'Business';
  }
  if (text.includes('politics') || text.includes('election') || text.includes('minister') || text.includes('parliament') || text.includes('congress') || text.includes('bjp') || text.includes('modi')) {
    return 'Politics';
  }
  if (text.includes('education') || text.includes('exam') || text.includes('student') || text.includes('university') || text.includes('school') || text.includes('neet') || text.includes('jee')) {
    return 'Education';
  }
  if (text.includes('food') || text.includes('recipe') || text.includes('restaurant') || text.includes('cooking')) {
    return 'Food';
  }
  if (text.includes('celebrity') || text.includes('movie') || text.includes('actor') || text.includes('star') || text.includes('bollywood') || text.includes('hollywood') || text.includes('entertainment')) {
    return 'Celebrity';
  }
  if (text.includes('cricket') || text.includes('ipl') || text.includes('football') || text.includes('sport') || text.includes('olympics')) {
    return 'Sports';
  }
  if (text.includes('tech') || text.includes('ai ') || text.includes('artificial intelligence') || text.includes('startup') || text.includes('apple') || text.includes('google') || text.includes('software')) {
    return 'Technology';
  }
  if (text.includes('uttarakhand') || text.includes('haldwani') || text.includes('nainital') || text.includes('dehradun') || text.includes('kumaon')) {
    return 'Uttarakhand';
  }
  
  return fallbackCategory;
}

// Convert date to MySQL datetime string
function toMysqlDate(dateStr) {
  const d = dateStr ? new Date(dateStr) : new Date();
  return isNaN(d.getTime())
    ? new Date().toISOString().slice(0, 19).replace('T', ' ')
    : d.toISOString().slice(0, 19).replace('T', ' ');
}

// Insert article into DB (with duplicate check)
function insertArticle({ title, content, category, type, imageUrl, sourceName, sourceUrl, publishedAt }) {
  return new Promise((resolve) => {
    const checkSql = 'SELECT id FROM articles WHERE title = ? OR source_url = ?';
    db.query(checkSql, [title, sourceUrl], (checkErr, checkRows) => {
      if (checkErr) {
        console.error('[NewsSync] Duplicate check error:', checkErr.message);
        return resolve(false);
      }
      if (checkRows && checkRows.length > 0) {
        return resolve(false); // duplicate
      }

      const mysqlDate = toMysqlDate(publishedAt);
      const insertSql = `
        INSERT INTO articles (title, content, category, type, image_url, author_id, status, source_name, source_url, created_at)
        VALUES (?, ?, ?, ?, ?, 1, 'published', ?, ?, ?)
      `;
      db.query(
        insertSql,
        [title, content, category, type, imageUrl || null, sourceName, sourceUrl, mysqlDate],
        (insertErr) => {
          if (insertErr) {
            console.error('[NewsSync] Insert error:', insertErr.message);
            return resolve(false);
          }
          resolve(true);
        }
      );
    });
  });
}

// ===========================
// SYNC: NewsAPI
// ===========================
async function syncNewsAPI(apiKey) {
  console.log('[NewsSync] Syncing from NewsAPI...');
  
  const endpoints = [
    { url: `https://newsapi.org/v2/top-headlines?language=en&apiKey=${apiKey}`, type: 'international', fallbackCat: 'World' },
    { url: `https://newsapi.org/v2/everything?q=India+OR+Uttarakhand+OR+Haldwani&language=en&sortBy=publishedAt&pageSize=50&apiKey=${apiKey}`, type: 'national', fallbackCat: 'India' },
    { url: `https://newsapi.org/v2/everything?q=technology+OR+AI+OR+startup&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`, type: 'national', fallbackCat: 'Technology' },
    { url: `https://newsapi.org/v2/everything?q=cricket+OR+sports+India&language=en&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`, type: 'national', fallbackCat: 'Sports' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.articles || data.articles.length === 0) continue;

      let inserted = 0;
      for (const item of data.articles) {
        if (!item.title || !item.description || item.title.includes('[Removed]') || item.description.includes('[Removed]')) continue;
        
        const category = detectCategory(item.title, item.description, ep.fallbackCat);
        const type = category === 'Uttarakhand' ? 'local' : ep.type;
        const sourceName = item.source?.name || 'NewsAPI';
        
        const ok = await insertArticle({
          title: item.title,
          content: item.description || item.content,
          category, type,
          imageUrl: item.urlToImage,
          sourceName,
          sourceUrl: item.url,
          publishedAt: item.publishedAt
        });
        if (ok) inserted++;
      }
      console.log(`[NewsSync] NewsAPI (${ep.fallbackCat}): +${inserted} new articles`);
    } catch (err) {
      console.error(`[NewsSync] NewsAPI error for ${ep.fallbackCat}:`, err.message);
    }
  }
}

// ===========================
// SYNC: RSS Feeds
// ===========================
async function syncRssFeed(url, type, fallbackCategory, sourceName, limit) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 HaldwaniTimes/1.0' } });
    if (!res.ok) {
      console.warn(`[NewsSync] RSS failed for ${sourceName}: ${res.status}`);
      return;
    }
    const xmlText = await res.text();
    let articles = parseRssFeeds(xmlText);

    if (articles.length === 0) {
      console.log(`[NewsSync] No RSS articles from ${sourceName}.`);
      return;
    }

    if (limit && typeof limit === 'number') {
      articles = articles.slice(0, limit);
    }

    let inserted = 0;
    for (const item of articles) {
      const { title, description, link, imageUrl, pubDate } = item;
      if (!title || title.includes('[Removed]')) continue;

      const category = detectCategory(title, description, fallbackCategory);
      const finalType = category === 'Uttarakhand' ? 'local' : type;

      const ok = await insertArticle({
        title, content: description,
        category, type: finalType,
        imageUrl, sourceName,
        sourceUrl: link,
        publishedAt: pubDate
      });
      if (ok) inserted++;
    }
    console.log(`[NewsSync] ${sourceName}: +${inserted} new articles (of ${articles.length} total)`);
  } catch (err) {
    console.error(`[NewsSync] RSS exception for ${sourceName}:`, err.message);
  }
}

// ===========================
// MAIN SYNC ORCHESTRATOR
// ===========================
export async function performNewsSync() {
  console.log('[NewsSync] ========== Starting news synchronization ==========');

  // 1. NewsAPI (if key available)
  const apiKey = process.env.NEWS_API_KEY;
  if (apiKey) {
    await syncNewsAPI(apiKey);
  } else {
    console.log('[NewsSync] NEWS_API_KEY not set, skipping NewsAPI.');
  }

  // 2. NDTV RSS Feeds (with real images via media:content)
  await syncRssFeed('https://feeds.feedburner.com/ndtvnews-top-stories', 'national', 'India', 'NDTV');
  await syncRssFeed('https://feeds.feedburner.com/ndtvnews-india-news', 'national', 'India', 'NDTV India');
  await syncRssFeed('https://feeds.feedburner.com/ndtvnews-world-news', 'international', 'World', 'NDTV World');

  // 3. Times of India RSS Feeds (with real images via enclosure)
  await syncRssFeed('https://timesofindia.indiatimes.com/rssfeedstopstories.cms', 'national', 'India', 'Times of India');
  await syncRssFeed('https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', 'national', 'India', 'TOI India');

  // 4. Indian Express RSS Feeds (with real images via media:content)
  await syncRssFeed('https://indianexpress.com/section/india/feed/', 'national', 'India', 'Indian Express');
  await syncRssFeed('https://indianexpress.com/section/world/feed/', 'international', 'World', 'Indian Express World');
  await syncRssFeed('https://indianexpress.com/section/technology/feed/', 'national', 'Technology', 'Indian Express Tech');
  await syncRssFeed('https://indianexpress.com/section/entertainment/feed/', 'national', 'Celebrity', 'Indian Express Entertainment');
  await syncRssFeed('https://indianexpress.com/section/sports/feed/', 'national', 'Sports', 'Indian Express Sports');

  // 5. Hindustan Times RSS Feeds (with real images)
  await syncRssFeed('https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', 'national', 'India', 'Hindustan Times');
  await syncRssFeed('https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml', 'international', 'World', 'Hindustan Times World');
  await syncRssFeed('https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml', 'national', 'Business', 'Hindustan Times Business');
  await syncRssFeed('https://www.hindustantimes.com/feeds/rss/education/rssfeed.xml', 'national', 'Education', 'Hindustan Times Education');
  // 6. Google News (Uttarakhand local news only - limited to exactly 10 articles)
  await syncRssFeed(
    'https://news.google.com/rss/search?q=Uttarakhand&hl=en-IN&gl=IN&ceid=IN:en',
    'local', 'Uttarakhand', 'Google News (Uttarakhand)', 10
  );

  // 7. Hindi News RSS Feeds (Native Hindi content)
  // Amar Ujala Hindi
  await syncRssFeed('https://www.amarujala.com/rss/breaking-news.xml', 'national', 'Hindi News', 'Amar Ujala', 25);
  await syncRssFeed('https://www.amarujala.com/rss/uttar-pradesh.xml', 'national', 'Hindi News', 'Amar Ujala UP', 15);
  await syncRssFeed('https://www.amarujala.com/rss/uttarakhand.xml', 'local', 'Hindi News', 'Amar Ujala Uttarakhand', 20);
  await syncRssFeed('https://www.amarujala.com/rss/dehradun.xml', 'local', 'Hindi News', 'Amar Ujala Dehradun', 15);
  
  // Dainik Jagran Hindi
  await syncRssFeed('https://www.jagran.com/rss/news/national.xml', 'national', 'Hindi News', 'Dainik Jagran', 20);
  await syncRssFeed('https://www.jagran.com/rss/uttarakhand/dehradun-city.xml', 'local', 'Hindi News', 'Jagran Uttarakhand', 15);
  
  // Aaj Tak Hindi
  await syncRssFeed('https://feeds.feedburner.com/AajTak/lHWr', 'national', 'Hindi News', 'Aaj Tak', 20);
  
  // Patrika Hindi
  await syncRssFeed('https://api.patrika.com/rss/india-news', 'national', 'Hindi News', 'Patrika', 15);
  await syncRssFeed('https://api.patrika.com/rss/uttarakhand-news', 'local', 'Hindi News', 'Patrika Uttarakhand', 15);
  
  // Navbharat Times
  await syncRssFeed('https://navbharattimes.indiatimes.com/rssfeedsdefault.cms', 'national', 'Hindi News', 'Navbharat Times', 15);
  
  // Dainik Bhaskar
  await syncRssFeed('https://www.bhaskar.com/rss-feed/1061/', 'national', 'Hindi News', 'Dainik Bhaskar', 15);
  
  // BBC Hindi
  await syncRssFeed('https://feeds.bbci.co.uk/hindi/rss.xml', 'international', 'Hindi News', 'BBC Hindi', 20);
  
  // Google News Hindi - India
  await syncRssFeed(
    'https://news.google.com/rss/search?q=भारत+समाचार&hl=hi&gl=IN&ceid=IN:hi',
    'national', 'Hindi News', 'Google News Hindi', 20
  );
  
  // Google News Hindi - Uttarakhand
  await syncRssFeed(
    'https://news.google.com/rss/search?q=उत्तराखंड+हल्द्वानी+समाचार&hl=hi&gl=IN&ceid=IN:hi',
    'local', 'Hindi News', 'Google News Uttarakhand Hindi', 15
  );

  console.log('[NewsSync] ========== Synchronization complete ==========');
}

// Initialize scheduler
export function startNewsSync() {
  // Run synchronization immediately on startup
  performNewsSync();

  // Set interval to repeat
  setInterval(performNewsSync, SYNC_INTERVAL);
  console.log(`[NewsSync] Background sync scheduled every ${SYNC_INTERVAL / (60 * 1000)} min.`);
}
