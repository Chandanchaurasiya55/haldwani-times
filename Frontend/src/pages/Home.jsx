import React, { useState, useEffect, useRef, useMemo } from 'react';
import { parseLiveTitle } from '../utils/liveUtils';

const API_BASE_URL = 'http://localhost:5000/api';

const ads = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=1200&h=300&q=80',
    title: 'Kumaon Luxury Retreats',
    desc: 'Experience pure tranquility in the lap of nature. Book your premium cottage stay today.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=300&q=80',
    title: 'Haldwani Premium Residency',
    desc: 'Delivering dream homes at unbeatable rates. RERA-approved luxury villas open for booking.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&h=300&q=80',
    title: 'Nainital Adventure Club',
    desc: 'Unleash the thrill with paragliding, boating, and trekking campaigns. Group discounts active.'
  }
];

const categoryPlaceholders = {
  uttarakhand: [
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80', // Mountains
    'https://images.unsplash.com/photo-1626621427793-2751336c648f?auto=format&fit=crop&w=800&q=80', // Temple/hills
    'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80'
  ],
  india: [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80', // Taj Mahal
    'https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=800&q=80', // Varanasi
    'https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
  ],
  politics: [
    'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80', // Voting / Podium
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80', // Law / Government
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  ],
  business: [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', // Chart
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', // Skyscrapers / Office
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80'
  ],
  education: [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', // University / Grad
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80', // Student / Books
    'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80'
  ],
  celebrity: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80', // Concert
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80', // Show / Entertainment
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
  ],
  world: [
    'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=800&q=80', // Globe / Planet
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', // Digital World
    'https://images.unsplash.com/photo-1526253038957-bce54e05968e?auto=format&fit=crop&w=800&q=80'
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // Food Table
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=800&q=80', // Newspaper
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80', // News mic
    'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80' // Journalism
  ]
};

const AdPlaceholder = ({ id, size, type, description, className = "", adObject }) => {
  const isSidebar = size.includes('300x250') || size.includes('300x600');
  const imageUrl = adObject?.image_url;
  const targetUrl = adObject?.target_url;

  if (imageUrl) {
    return (
      <div className={`w-full flex justify-center py-2 select-none ${className}`}>
        <a 
          href={targetUrl || "#"} 
          target={targetUrl ? "_blank" : undefined} 
          rel="noopener noreferrer"
          className="w-full relative overflow-hidden rounded-none border border-slate-100 flex items-center justify-center bg-slate-50 shadow-sm transition-all hover:opacity-95"
          style={
            isSidebar 
              ? { maxWidth: '100%', height: size.includes('300x600') ? '650px' : '320px' } 
              : { maxWidth: '100%', height: '160px' }
          }
        >
          <img src={imageUrl} alt="Advertisement" className="max-w-full max-h-full object-contain" />
          <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[8px] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">Ad</span>
        </a>
      </div>
    );
  }
  
  return (
    <div className={`w-full flex justify-center py-2 select-none ${className}`}>
      <div 
        className={`w-full bg-[#f8fafc] border border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center p-3 relative shadow-sm text-center ${
          isSidebar ? 'min-h-[320px]' : 'min-h-[160px]'
        }`}
        style={
          isSidebar 
            ? { maxWidth: '100%', height: size.includes('300x600') ? '650px' : '320px' } 
            : { maxWidth: '100%', height: '160px' }
        }
      >
        <span className="bg-[#b80035] text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-full absolute -top-2 left-6 uppercase tracking-widest shadow-sm">
          {id}
        </span>
        <h4 className="text-slate-800 font-extrabold text-[11px] md:text-xs tracking-tight">{size}</h4>
        <span className="text-[9px] text-[#b80035]/80 font-bold uppercase tracking-wider">{type}</span>
        <span className="text-[8px] text-slate-400 font-medium max-w-[90%] leading-normal">{description}</span>
      </div>
    </div>
  );
};


function Home({ articles: rawArticles = [], isLoading: isFetchLoading = false, selectedCategory, onSelectCategory, searchQuery, selectedDate, onSelectArticle, onRefreshArticles }) {
  const [activeTab, setActiveTab] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  // Dynamic Ads State from DB
  const [dbAds, setDbAds] = useState([]);
  const getAdBySlot = (slotId) => dbAds.find(ad => ad.slot_id === slotId);

  const sliderAds = useMemo(() => {
    const s1 = getAdBySlot('SLIDER 1');
    const s2 = getAdBySlot('SLIDER 2');
    const s3 = getAdBySlot('SLIDER 3');
    return [
      {
        id: 1,
        image: s1?.image_url || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&w=1200&h=300&q=80',
        title: s1?.title || 'Kumaon Luxury Retreats',
        desc: s1?.description || 'Experience pure tranquility in the lap of nature. Book your premium cottage stay today.',
        target: s1?.target_url
      },
      {
        id: 2,
        image: s2?.image_url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=300&q=80',
        title: s2?.title || 'Haldwani Premium Residency',
        desc: s2?.description || 'Delivering dream homes at unbeatable rates. RERA-approved luxury villas open for booking.',
        target: s2?.target_url
      },
      {
        id: 3,
        image: s3?.image_url || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&h=300&q=80',
        title: s3?.title || 'Nainital Adventure Club',
        desc: s3?.description || 'Unleash the thrill with paragliding, boating, and trekking campaigns. Group discounts active.',
        target: s3?.target_url
      }
    ];
  }, [dbAds]);
  
  // Lazy loading pagination count
  const [visibleCount, setVisibleCount] = useState(12);
  const [visibleRemainingCount, setVisibleRemainingCount] = useState(6);

  // Load Hindi translation cache from sessionStorage
  const [hindiCache, setHindiCache] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ht_hindi_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Sync translation cache to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('ht_hindi_cache', JSON.stringify(hindiCache));
    } catch (err) {
      console.error('Failed to sync translation cache:', err);
    }
  }, [hindiCache]);

  // Translate a single text string to Hindi using Google Translate free endpoint
  const translateToHindi = async (text) => {
    if (!text || !text.trim()) return text;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=hi&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return text;
      const data = await res.json();
      // Response format: [ [ ["translated", "original"], ... ], ... ]
      return data[0]?.map(chunk => chunk[0]).join('') || text;
    } catch {
      return text;
    }
  };

  // Map rawArticles to mappedArticles with categories
  const articles = useMemo(() => {
    return rawArticles.map(art => ({
      id: art.id,
      category: `${art.type.toUpperCase()} / ${art.category.toUpperCase()}`,
      rawCategory: (art.category || '').toLowerCase(), // raw DB category for filtering
      title: art.title,
      summary: art.content,
      author: art.source_name || art.author_name || 'Haldwani Times',
      readTime: '4 min read',
      type: art.type,
      image: art.image_url,
      hasRealImage: !!art.image_url,
      sourceName: art.source_name,
      sourceUrl: art.source_url,
      createdAt: art.created_at
    }));
  }, [rawArticles]);

  // Auto scroll ads every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % sliderAds.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [sliderAds.length]);

  // Reset activeTab and pagination on selectedCategory change
  useEffect(() => {
    setActiveTab('all');
    setVisibleCount(12);
  }, [selectedCategory]);

  useEffect(() => {
    setVisibleCount(12);
  }, [activeTab]);

  // Smooth scroll aggregator feed when tab or category changes
  useEffect(() => {
    if (selectedCategory !== 'All' || activeTab !== 'all') {
      const element = document.getElementById('news-feed');
      if (element) {
        const offset = 160; 
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedCategory, activeTab]);

  // Load bookmarks, ads on mount & check session
  useEffect(() => {
    fetchDbAds();
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.role === 'user') {
        fetchBookmarks(user.id);
      }
    }
  }, []);

  const fetchDbAds = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/ads`);
      if (res.ok) {
        const data = await res.json();
        setDbAds(data);
      }
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    }
  };

  const fetchBookmarks = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/bookmarks/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(data.map(b => b.id));
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    }
  };

  const handleToggleBookmark = async (e, articleId) => {
    e.stopPropagation();
    e.preventDefault();

    if (!currentUser) {
      alert('Please click "My account" in the top-right corner to log in as a Reader first to bookmark stories!');
      return;
    }
    if (currentUser.role !== 'user') {
      alert('Only General Readers can bookmark articles.');
      return;
    }

    const isBookmarked = bookmarkedIds.includes(articleId);
    const endpoint = isBookmarked ? 'unbookmark' : 'bookmark';

    try {
      const res = await fetch(`${API_BASE_URL}/articles/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          article_id: articleId
        })
      });

      if (res.ok) {
        if (isBookmarked) {
          setBookmarkedIds(prev => prev.filter(id => id !== articleId));
        } else {
          setBookmarkedIds(prev => [...prev, articleId]);
        }
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const filteredArticles = articles.filter(art => {
    // 1. Tab filtering (type)
    if (activeTab !== 'all' && art.type !== activeTab) {
      return false;
    }

    // 2. Header Category filtering
    if (selectedCategory && selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      const rawCat = art.rawCategory || '';        // e.g. "uttarakhand", "politics", "india"
      const titleLower = (art.title || '').toLowerCase();
      const summaryLower = (art.summary || '').toLowerCase();

      if (catLower === 'uttarakhand') {
        // local type OR raw category is uttarakhand OR title/summary mentions uttarakhand/haldwani
        if (
          art.type !== 'local' &&
          !rawCat.includes('uttarakhand') &&
          !titleLower.includes('uttarakhand') &&
          !titleLower.includes('haldwani') &&
          !titleLower.includes('kumaon') &&
          !titleLower.includes('nainital') &&
          !summaryLower.includes('uttarakhand') &&
          !summaryLower.includes('haldwani')
        ) return false;
      } else if (catLower === 'india') {
        if (art.type !== 'national' && !rawCat.includes('india') && !rawCat.includes('national')) return false;
      } else if (catLower === 'world') {
        if (art.type !== 'international' && !rawCat.includes('world') && !rawCat.includes('international')) return false;
      } else if (catLower === 'top stories') {
        // Show all
      } else if (catLower === 'blog') {
        if (art.type !== 'blog') return false;
      } else if (catLower === 'hindi news') {
        // Match articles whose rawCategory is 'hindi news' OR source is a known Hindi outlet
        const hindiSources = ['aaj tak', 'amar ujala', 'dainik bhaskar', 'dainik jagran', 'navbharat times', 'patrika', 'google news hindi', 'google news uttarakhand hindi'];
        const srcLower = (art.sourceName || '').toLowerCase();
        const isHindiSource = hindiSources.some(s => srcLower.includes(s));
        if (!rawCat.includes('hindi') && !isHindiSource) return false;
      } else {
        // For Politics, Business, Education, Food, Celebrity, Sports etc.
        if (!rawCat.includes(catLower)) return false;
      }
    }

    // 3. Keyword Search filtering
    if (searchQuery && searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      const titleLower = (art.title || '').toLowerCase();
      const summaryLower = (art.summary || '').toLowerCase();
      if (!titleLower.includes(queryLower) && !summaryLower.includes(queryLower)) {
        return false;
      }
    }

    // 4. Date filtering
    if (selectedDate) {
      const artDateStr = art.createdAt ? art.createdAt.substring(0, 10) : '';
      if (artDateStr !== selectedDate) {
        return false;
      }
    }

    return true;
  });

  const isDefaultState = activeTab === 'all' && (!selectedCategory || selectedCategory === 'All') && !searchQuery && !selectedDate;

  // Filter default feed to: 5 Haldwani news (with unique images) + 3 Uttarakhand news (with unique images) + India news (with unique images)
  const finalDisplayArticles = (() => {
    if (!isDefaultState) {
      // Prevent duplicate images in other views
      const seen = new Set();
      return filteredArticles.filter(art => {
        if (!art.image) return false;
        if (seen.has(art.image)) return false;
        seen.add(art.image);
        return true;
      });
    }

    const seen = new Set();
    const haldwani = [];
    const uttarakhand = [];
    const india = [];

    // 1. Get Haldwani news (max 5)
    for (const art of filteredArticles) {
      if (!art.image) continue;
      const titleLower = (art.title || '').toLowerCase();
      const summaryLower = (art.summary || '').toLowerCase();
      const catLower = (art.category || '').toLowerCase();

      const isHaldwani = titleLower.includes('haldwani') || summaryLower.includes('haldwani') || catLower.includes('haldwani');
      if (isHaldwani) {
        if (!seen.has(art.image) && haldwani.length < 5) {
          seen.add(art.image);
          haldwani.push(art);
        }
      }
    }

    // 2. Get Uttarakhand news (max 3)
    for (const art of filteredArticles) {
      if (!art.image) continue;
      if (haldwani.some(h => h.id === art.id)) continue;

      const titleLower = (art.title || '').toLowerCase();
      const summaryLower = (art.summary || '').toLowerCase();
      const catLower = (art.category || '').toLowerCase();

      const isUttarakhand = titleLower.includes('uttarakhand') || titleLower.includes('kumaon') || titleLower.includes('nainital') || catLower.includes('uttarakhand') || art.type === 'local';
      if (isUttarakhand) {
        if (!seen.has(art.image) && uttarakhand.length < 3) {
          seen.add(art.image);
          uttarakhand.push(art);
        }
      }
    }

    // 3. Get India news
    for (const art of filteredArticles) {
      if (!art.image) continue;
      if (haldwani.some(h => h.id === art.id)) continue;
      if (uttarakhand.some(u => u.id === art.id)) continue;

      const titleLower = (art.title || '').toLowerCase();
      const summaryLower = (art.summary || '').toLowerCase();
      const catLower = (art.category || '').toLowerCase();

      const isIndia = art.type === 'national' || catLower.includes('india') || catLower.includes('national') || titleLower.includes('india') || summaryLower.includes('india');
      if (isIndia) {
        if (!seen.has(art.image)) {
          seen.add(art.image);
          india.push(art);
        }
      }
    }

    return [...haldwani, ...uttarakhand, ...india];
  })();

  // Hero article: when a tab or category is selected, use first article from filtered set
  // Otherwise prefer latest LOCAL news with a real image
  const heroArticle = (() => {
    if (activeTab !== 'all' || (selectedCategory && selectedCategory !== 'All')) {
      // Use the first article from the filtered/categorised feed as hero
      return finalDisplayArticles.find(a => a.hasRealImage) || finalDisplayArticles[0] || null;
    }
    const localWithImg = finalDisplayArticles.find(a => a.type === 'local' && a.hasRealImage);
    if (localWithImg) return localWithImg;
    return finalDisplayArticles.find(a => a.hasRealImage) || finalDisplayArticles[0] || null;
  })();

  const { mainNewsArticle, generalNewsGrid, exclusiveNewsGrid, entertainmentArticles } = useMemo(() => {
    if (!isDefaultState) {
      return { mainNewsArticle: null, generalNewsGrid: [], exclusiveNewsGrid: [], entertainmentArticles: [] };
    }
    const remaining = finalDisplayArticles.filter(a => a.id !== heroArticle?.id);
    const mainNews = remaining[0] || null;
    const general = remaining.slice(1, 4);
    const exclusive = remaining.slice(4, 7);

    // If exclusive is short, we can backfill from other articles to make it look complete
    if (exclusive.length < 3 && remaining.length > 7) {
      exclusive.push(...remaining.slice(7, 7 + (3 - exclusive.length)));
    }

    // For Entertainment (celebrity)
    let entList = articles.filter(art => 
      art.rawCategory === 'celebrity' && 
      art.id !== heroArticle?.id && 
      art.id !== mainNews?.id && 
      !general.some(g => g.id === art.id) && 
      !exclusive.some(e => e.id === art.id)
    ).slice(0, 4);

    // Fallback if not enough celebrity articles to make a full 4-column row
    if (entList.length < 4) {
      const fallbackPool = articles.filter(art => 
        art.id !== heroArticle?.id && 
        art.id !== mainNews?.id && 
        !general.some(g => g.id === art.id) && 
        !exclusive.some(e => e.id === art.id) &&
        !entList.some(el => el.id === art.id)
      );
      entList = [...entList, ...fallbackPool.slice(0, 4 - entList.length)];
    }

    return {
      mainNewsArticle: mainNews,
      generalNewsGrid: general,
      exclusiveNewsGrid: exclusive,
      entertainmentArticles: entList
    };
  }, [isDefaultState, finalDisplayArticles, heroArticle, articles]);

  // Auto-translate all articles to Hindi
  const isHindiMode = selectedCategory === 'Hindi News';
  // Track which article IDs have already been translated, initialized from cached keys
  const translatedIdsRef = useRef(new Set(Object.keys(hindiCache).map(Number)));
  // Build a stable key from article IDs to trigger translation only when articles change
  const articleIdsKey = finalDisplayArticles.map(a => a.id).join(',');

  useEffect(() => {
    if (finalDisplayArticles.length === 0) return;

    const articlesToTranslate = finalDisplayArticles.filter(a => !translatedIdsRef.current.has(a.id)).slice(0, 12);
    if (articlesToTranslate.length === 0) return;

    let cancelled = false;
    setIsTranslating(true);

    // Translate in batches of 3 to avoid rate limiting
    const batchSize = 3;
    const batches = [];
    for (let i = 0; i < articlesToTranslate.length; i += batchSize) {
      batches.push(articlesToTranslate.slice(i, i + batchSize));
    }

    (async () => {
      const newCache = {};
      for (const batch of batches) {
        if (cancelled) return;
        await Promise.all(batch.map(async (art) => {
          const [hindiTitle, hindiSummary] = await Promise.all([
            translateToHindi(art.title),
            translateToHindi(art.summary ? art.summary.slice(0, 300) : '')
          ]);
          newCache[art.id] = { title: hindiTitle, summary: hindiSummary };
          translatedIdsRef.current.add(art.id);
        }));
        // Small delay between batches to avoid throttling
        await new Promise(r => setTimeout(r, 300));
      }
      if (!cancelled) {
        setHindiCache(prev => ({ ...prev, ...newCache }));
        setIsTranslating(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleIdsKey]);

  const tickerItems = [
    { label: "SENSEX", value: "72,431.05", change: "+0.45%", isUp: true },
    { label: "NIFTY 50", value: "21,987.50", change: "+0.32%", isUp: true },
    { label: "USD/INR", value: "83.42", change: "+0.05%", isUp: true },
    { label: "BTC/USD", value: "64,210.80", change: "-1.21%", isUp: false },
    { label: "ETH/USD", value: "3,456.20", change: "+2.15%", isUp: true },
    { label: "NASDAQ", value: "16,041.64", change: "+0.82%", isUp: true },
    { label: "DOW JONES", value: "38,989.84", change: "-0.18%", isUp: false },
    { label: "GOLD/USD", value: "2,331.40", change: "+1.10%", isUp: true },
    { label: "CRUDE OIL", value: "78.26", change: "-0.75%", isUp: false },
  ];

  // Return Hindi-translated article if available in cache, otherwise original
  const getDisplayArticle = (art) => {
    if (hindiCache[art.id]) {
      return {
        ...art,
        title: hindiCache[art.id].title,
        summary: hindiCache[art.id].summary
      };
    }
    return art;
  };

  // Extract all currently displayed article IDs on the homepage default grid
  const displayedIds = useMemo(() => {
    return new Set([
      heroArticle?.id,
      mainNewsArticle?.id,
      ...generalNewsGrid.map(a => a.id),
      ...exclusiveNewsGrid.map(a => a.id),
      ...entertainmentArticles.map(a => a.id)
    ].filter(Boolean));
  }, [heroArticle, mainNewsArticle, generalNewsGrid, exclusiveNewsGrid, entertainmentArticles]);

  const remainingFeedArticles = useMemo(() => {
    return articles.filter(art => !displayedIds.has(art.id));
  }, [articles, displayedIds]);

  return (
    <div className="w-full pt-[148px] pb-10 flex flex-col gap-6 md:gap-10">

      {/* AD 1: 728x90 Leaderboard Ad */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12">
        <AdPlaceholder 
          id="AD 1" 
          size="728x90 - Leaderboard Ad" 
          type="TOP BANNER AD (Leaderboard)" 
          description="Best for brand visibility" 
          adObject={getAdBySlot('AD 1')}
        />
      </div>

      {/* Stock / Finance Ticker Widget */}
      <section className="w-full bg-white border-y border-outline-variant/20 overflow-hidden flex items-center select-none py-3">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          {[0, 1].map((clone) => (
            <div key={clone} className="flex items-center gap-8 md:gap-12 shrink-0 pr-8 md:pr-12" aria-hidden={clone === 1 ? "true" : undefined}>
              {tickerItems.map((item, index) => (
                <React.Fragment key={`ticker-${clone}-${index}`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="font-label-caps text-on-surface-variant font-extrabold tracking-wider text-[10px] md:text-xs">{item.label}</span>
                    <span className="font-extrabold text-on-surface text-xs md:text-sm">{item.value}</span>
                    <span className={`${item.isUp ? 'text-secondary' : 'text-primary'} text-[10px] md:text-xs flex items-center font-bold`}>
                      <span className="material-symbols-outlined text-sm font-extrabold">{item.isUp ? 'trending_up' : 'trending_down'}</span>
                      <span className="ml-0.5">{item.change}</span>
                    </span>
                  </div>
                  <div className="w-px h-4 bg-outline-variant/40 shrink-0"></div>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Key Administrative Profiles Bar */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-12 select-none">
        {/* Mobile: wrap into lines (3 on first line, 2 on second line centered) */}
        <div className="flex flex-wrap justify-center gap-2.5 md:hidden">
          {[
            { src: '/modi.jpg', name: 'Narendra Modi', role: 'PM of India' },
            { src: '/governor.jpg', name: 'Lt. Gen. Gurmit Singh', role: 'Governor' },
            { src: '/dhami.jpg', name: 'Pushkar S. Dhami', role: 'CM Uttarakhand' },
            { src: '/dm.jpg', name: 'Lalit M. Rayal', role: 'DM Nainital' },
            { src: '/mayor.jpg', name: 'Gajraj S. Bisht', role: 'Mayor Haldwani' },
          ].map((p) => (
            <div key={p.name} className="flex flex-col items-center text-center bg-white border border-slate-100 p-3 rounded-2xl shadow-sm w-[calc(33.33%-7px)] min-w-[90px] shrink-0">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/10">
                <img className="w-full h-full object-cover" src={p.src} alt={p.name} />
              </div>
              <h4 className="text-[10px] font-semibold text-slate-800 mt-2 leading-tight">{p.name}</h4>
              <span className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">{p.role}</span>
            </div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6 bg-[#f8fafc] border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
          {[
            { src: '/modi.jpg', name: 'Narendra Modi', role: 'PM of India' },
            { src: '/governor.jpg', name: 'Lt. Gen. Gurmit Singh', role: 'Governor of UK' },
            { src: '/dhami.jpg', name: 'Pushkar S. Dhami', role: 'CM of Uttarakhand' },
            { src: '/dm.jpg', name: 'Lalit M. Rayal', role: 'DM of Nainital' },
            { src: '/mayor.jpg', name: 'Gajraj S. Bisht', role: 'Mayor of Haldwani' },
          ].map((p) => (
            <div key={p.name} className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
                <img className="w-full h-full object-cover" src={p.src} alt={p.name} />
              </div>
              <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-3 leading-snug">{p.name}</h4>
              <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-1">{p.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Full Width Advertisement Banner Slider */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-12 select-none">
        <div className="relative w-full h-[140px] sm:h-[180px] md:h-[220px] rounded-none overflow-hidden shadow-sm group">
          <div className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
               style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}>
            {sliderAds.map((ad) => {
              const slideContent = (
                <div className="relative w-full h-full shrink-0">
                  <img className="w-full h-full object-cover" src={ad.image} alt={ad.title} />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
                  <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-5 sm:px-8 md:px-16 text-white max-w-[90%] md:max-w-[55%]">
                    <span className="bg-primary/95 text-[9px] text-white font-normal uppercase tracking-widest px-2 py-0.5 rounded w-max mb-2 shadow-sm">Sponsored Ad</span>
                    <h3 className="text-base sm:text-xl md:text-2xl font-normal tracking-tight leading-tight mb-1">{ad.title}</h3>
                    <p className="hidden sm:block text-xs md:text-sm text-slate-200/90 leading-relaxed font-normal">{ad.desc}</p>
                  </div>
                </div>
              );
              return ad.target ? (
                <a key={ad.id} href={ad.target} target="_blank" rel="noopener noreferrer" className="w-full h-full shrink-0 block">
                  {slideContent}
                </a>
              ) : (
                <div key={ad.id} className="w-full h-full shrink-0 block">
                  {slideContent}
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {sliderAds.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentAdIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentAdIndex === idx ? 'bg-primary w-5' : 'w-1.5 bg-white/60 hover:bg-white'}`}
                aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Main content grid wrapped in restricted width container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col gap-6 md:gap-10">

        {/* Loading / Empty States */}
        {isFetchLoading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">समाचार लोड हो रहा है...</span>
          </div>
        ) : (
          <>
            {isDefaultState ? (
              <div className="flex flex-col gap-6 md:gap-10">
                {/* Featured Section */}
                {heroArticle && (() => {
                  const display = getDisplayArticle(heroArticle);
                  const liveData = parseLiveTitle(display.title);
                  return (
                    <section 
                      onClick={() => onSelectArticle && onSelectArticle(heroArticle)}
                      className="group relative overflow-hidden rounded-2xl md:rounded-[18px] bg-white card-shadow border border-outline-variant/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2">
                        <div className="h-[220px] sm:h-[300px] md:h-[380px] lg:h-[480px] relative overflow-hidden">
                          <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={display.image} alt={display.title} loading="lazy" />
                          <div className="absolute top-3 left-3 bg-[#ba1a1a] text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 font-label-caps text-[9px] md:text-xs shadow-lg select-none">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            {liveData ? 'लाइव अपडेट' : 'ताज़ा खबर'}
                          </div>
                        </div>
                        <div className="p-5 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
                          <span className="font-label-caps text-xs text-primary mb-3 tracking-widest block font-bold uppercase flex items-center gap-2">
                            {display.category}
                          </span>
                          {liveData ? (
                            <>
                              <h1 className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 font-bold leading-tight text-[#191c1e] ${isHindiMode ? 'leading-relaxed' : ''}`}>
                                {liveData.prefix}
                              </h1>
                              <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                                {liveData.headlines.map((hl, idx) => (
                                  <div key={idx} className="flex gap-3 items-start group/hl hover:bg-white p-2.5 rounded-xl border border-transparent hover:border-slate-100 hover:shadow-sm transition-all duration-300">
                                    <div className="flex items-center justify-center mt-1.5 shrink-0 relative">
                                      <span className="absolute w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                      <span className="relative w-2.5 h-2.5 rounded-full bg-red-600"></span>
                                    </div>
                                    <p className="font-serif text-sm sm:text-base text-slate-800 font-bold group-hover/hl:text-primary transition-colors leading-snug">{hl}</p>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <h1 className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6 font-bold leading-tight text-[#191c1e] ${isHindiMode ? 'leading-relaxed' : ''}`}>
                                {display.title}
                              </h1>
                              <p className="font-body-md text-sm text-on-surface-variant mb-5 md:mb-8 leading-relaxed line-clamp-3 md:line-clamp-none">{display.summary}</p>
                            </>
                          )}
                          <div className="flex items-center justify-between mt-auto pt-4 md:pt-6 border-t border-outline-variant/20">
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary border border-outline-variant/30 uppercase select-none text-xs">
                                {(display.sourceName || display.author || 'HT').slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <p className="font-metadata text-xs font-bold truncate">{display.sourceName || display.author}</p>
                                <p className="text-[10px] text-on-surface-variant font-medium hidden sm:block">हल्द्वानी टाइम्स</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {(!currentUser || currentUser.role === 'user') && (
                                <button onClick={(e) => handleToggleBookmark(e, heroArticle.id)} className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary">
                                  <span className="material-symbols-outlined text-lg md:text-xl">{bookmarkedIds.includes(heroArticle.id) ? 'bookmark' : 'bookmark_border'}</span>
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); }} className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-lg md:text-xl">share</span></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })()}

                {/* AD 2: Below Featured */}
                <AdPlaceholder id="AD 2" size="728x90 - Horizontal Ad" type="BELOW HEADER AD" description="Good for mid-page visibility" adObject={getAdBySlot('AD 2')} />

                {/* Two-Column Section: Main story + AD 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Left: Main horizontal story */}
                  {mainNewsArticle ? (() => {
                    const display = getDisplayArticle(mainNewsArticle);
                    const liveData = parseLiveTitle(display.title);
                    return (
                      <div 
                        onClick={() => onSelectArticle && onSelectArticle(mainNewsArticle)}
                        className="lg:col-span-2 bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group flex flex-col md:flex-row cursor-pointer transition-all hover:-translate-y-1 relative h-full min-h-[300px]"
                      >
                        {(!currentUser || currentUser.role === 'user') && (
                          <button
                            onClick={(e) => handleToggleBookmark(e, mainNewsArticle.id)}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                          >
                            <span className="material-symbols-outlined text-lg font-bold">
                              {bookmarkedIds.includes(mainNewsArticle.id) ? 'bookmark' : 'bookmark_border'}
                            </span>
                          </button>
                        )}
                        <div className="md:w-1/2 h-[200px] md:h-auto relative overflow-hidden shrink-0">
                          <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} loading="lazy" />
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">
                            {display.category}
                          </div>
                        </div>
                        <div className="md:w-1/2 p-5 sm:p-6 flex flex-col justify-between gap-3 flex-1">
                          <div className="flex flex-col gap-2 md:gap-3">
                            <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded w-max uppercase tracking-wider">मुख्य समाचार</span>
                            <h3 className="font-serif text-base md:text-lg lg:text-xl font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-3">{display.title}</h3>
                            <p className="font-body-md text-xs md:text-sm text-on-surface-variant line-clamp-3 leading-relaxed">{display.summary}</p>
                          </div>
                          <div className="border-t border-outline-variant/10 pt-3 mt-1 text-[10px] md:text-xs text-on-surface-variant flex items-center justify-between">
                            <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                            <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-xs">schedule</span> {display.readTime}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="lg:col-span-2 bg-[#f8fafc] border border-slate-200/60 rounded-2xl p-8 flex items-center justify-center text-slate-400">मुख्य समाचार उपलब्ध नहीं है</div>
                  )}

                  {/* Right: AD 3 */}
                  <div className="flex justify-center items-center h-full">
                    <AdPlaceholder id="AD 3" size="300x250 - Medium Rectangle" type="SIDEBAR AD" description="High visibility on desktop" adObject={getAdBySlot('AD 3')} />
                  </div>
                </div>

                {/* AD 4 */}
                <AdPlaceholder id="AD 4" size="728x90 - Horizontal Banner" type="BETWEEN SECTIONS AD" description="Good CTR, Between content sections" adObject={getAdBySlot('AD 4')} />

                {/* Section with Grid & AD 5 Sidebar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Left (2 columns): General news + Exclusive news */}
                  <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                    
                    {/* General News Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {generalNewsGrid.map((article) => {
                        const display = getDisplayArticle(article);
                        return (
                          <article 
                            key={article.id}
                            onClick={() => onSelectArticle && onSelectArticle(article)}
                            className="bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-full flex flex-col transition-all hover:-translate-y-1 relative cursor-pointer"
                          >
                            {(!currentUser || currentUser.role === 'user') && (
                              <button
                                onClick={(e) => handleToggleBookmark(e, article.id)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">
                                  {bookmarkedIds.includes(article.id) ? 'bookmark' : 'bookmark_border'}
                                </span>
                              </button>
                            )}
                            <div className="h-40 relative overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} />
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">{display.category}</div>
                            </div>
                            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                              <div className="flex flex-col gap-2">
                                <h3 className="font-serif text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-2">{display.title}</h3>
                                <p className="font-body-md text-[11px] md:text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{display.summary}</p>
                              </div>
                              <div className="border-t border-outline-variant/10 pt-3 mt-1 text-[10px] md:text-xs text-on-surface-variant flex items-center justify-between">
                                <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                                <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-xs">schedule</span> {display.readTime}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {/* Exclusive News Section */}
                    {exclusiveNewsGrid.length > 0 && (
                      <div className="border-t border-black/10 pt-6">
                        <h2 className="font-serif font-black text-xl text-on-surface mb-4 flex items-center gap-2">
                          <span className="w-1.5 h-6 bg-[#ba1a1a] rounded"></span>
                          एक्सक्लूसिव न्यूज़
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          {exclusiveNewsGrid.map((article) => {
                            const display = getDisplayArticle(article);
                            return (
                              <article 
                                key={article.id}
                                onClick={() => onSelectArticle && onSelectArticle(article)}
                                className="bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-full flex flex-col transition-all hover:-translate-y-1 relative cursor-pointer"
                              >
                                {(!currentUser || currentUser.role === 'user') && (
                                  <button
                                    onClick={(e) => handleToggleBookmark(e, article.id)}
                                    className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                                  >
                                    <span className="material-symbols-outlined text-lg font-bold">
                                      {bookmarkedIds.includes(article.id) ? 'bookmark' : 'bookmark_border'}
                                    </span>
                                  </button>
                                )}
                                <div className="h-40 relative overflow-hidden shrink-0">
                                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} />
                                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">{display.category}</div>
                                </div>
                                <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                                  <div className="flex flex-col gap-2">
                                    <h3 className="font-serif text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-2">{display.title}</h3>
                                    <p className="font-body-md text-[11px] md:text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{display.summary}</p>
                                  </div>
                                  <div className="border-t border-outline-variant/10 pt-3 mt-1 text-[10px] md:text-xs text-on-surface-variant flex items-center justify-between">
                                    <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                                    <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-xs">schedule</span> {display.readTime}</span>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: AD 5 */}
                  <div className="lg:col-span-1 flex justify-center items-start lg:sticky lg:top-24 h-full">
                    <AdPlaceholder id="AD 5" size="300x600 - Half Page Ad" type="HALF PAGE AD" description="Best for brand campaigns" adObject={getAdBySlot('AD 5')} />
                  </div>
                </div>

                {/* AD 6: Before Footer Ad */}
                <AdPlaceholder id="AD 6" size="728x90 - Horizontal Banner" type="BEFORE FOOTER AD" description="Capture attention before footer" adObject={getAdBySlot('AD 6')} />

                {/* Entertainment World Section */}
                {entertainmentArticles.length > 0 && (
                  <div className="border-t border-black/10 pt-6">
                    <h2 className="font-serif font-black text-xl text-on-surface mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-[#ba1a1a] rounded"></span>
                      मनोरंजन जगत
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      {entertainmentArticles.map((article) => {
                        const display = getDisplayArticle(article);
                        return (
                          <article 
                            key={article.id}
                            onClick={() => onSelectArticle && onSelectArticle(article)}
                            className="bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-full flex flex-col transition-all hover:-translate-y-1 relative cursor-pointer"
                          >
                            {(!currentUser || currentUser.role === 'user') && (
                              <button
                                onClick={(e) => handleToggleBookmark(e, article.id)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">
                                  {bookmarkedIds.includes(article.id) ? 'bookmark' : 'bookmark_border'}
                                </span>
                              </button>
                            )}
                            <div className="h-36 relative overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} />
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">{display.category}</div>
                            </div>
                            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                              <div className="flex flex-col gap-2">
                                <h3 className="font-serif text-xs md:text-sm font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-2">{display.title}</h3>
                                <p className="font-body-md text-[10px] md:text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">{display.summary}</p>
                              </div>
                              <div className="border-t border-outline-variant/10 pt-3 mt-1 text-[9px] md:text-[10px] text-on-surface-variant flex items-center justify-between">
                                <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                                <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-xs" style={{ fontSize: '10px' }}>schedule</span> {display.readTime}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AD 7: Last Content Ad */}
                <AdPlaceholder id="AD 7" size="728x90 - Horizontal Banner" type="LAST CONTENT AD" description="Increase page RPM" adObject={getAdBySlot('AD 7')} />

                {/* NEW: More Stories / Latest Feed Section for Default Homepage */}
                {remainingFeedArticles.length > 0 && (
                  <div className="border-t border-black/10 pt-8 mt-4 flex flex-col gap-6">
                    <h2 className="font-serif font-black text-xl text-on-surface flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-[#ba1a1a] rounded"></span>
                      और अधिक नवीनतम समाचार (More Latest News)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {remainingFeedArticles.slice(0, visibleRemainingCount).map((article) => {
                        const display = getDisplayArticle(article);
                        return (
                          <article 
                            key={article.id}
                            onClick={() => onSelectArticle && onSelectArticle(article)}
                            className="bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-full flex flex-col transition-all hover:-translate-y-1 relative cursor-pointer"
                          >
                            {(!currentUser || currentUser.role === 'user') && (
                              <button
                                onClick={(e) => handleToggleBookmark(e, article.id)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">
                                  {bookmarkedIds.includes(article.id) ? 'bookmark' : 'bookmark_border'}
                                </span>
                              </button>
                            )}
                            <div className="h-44 relative overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} loading="lazy" />
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">{display.category}</div>
                            </div>
                            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                              <div className="flex flex-col gap-2">
                                <h3 className="font-serif text-sm md:text-base font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-2">{display.title}</h3>
                                <p className="font-body-md text-xs md:text-sm text-on-surface-variant line-clamp-2 leading-relaxed">{display.summary}</p>
                              </div>
                              <div className="border-t border-outline-variant/10 pt-3 mt-1 text-[10px] md:text-xs text-on-surface-variant flex items-center justify-between">
                                <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                                <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-xs">schedule</span> {display.readTime}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    {remainingFeedArticles.length > visibleRemainingCount && (
                      <div className="flex justify-center mt-4 select-none">
                        <button 
                          onClick={() => setVisibleRemainingCount(prev => prev + 6)}
                          className="px-8 py-3 bg-white hover:bg-slate-50 text-primary border border-primary/20 rounded-full font-bold text-xs uppercase shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer animate-pulse hover:animate-none"
                        >
                          <span className="material-symbols-outlined text-sm font-black">expand_more</span>
                          <span>और समाचार लोड करें (Show More)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Non-default category/tab page rendering (simple grid)
              <div className="flex flex-col gap-6 md:gap-8">
                {/* Banner Ad below header */}
                <AdPlaceholder id="AD 2" size="728x90 - Horizontal Ad" type="BELOW HEADER AD" description="Good for mid-page visibility" adObject={getAdBySlot('AD 2')} />

                {/* Grid Navigation */}
                <section id="news-feed" className="border-b border-black/10 pb-1 mt-2 md:mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-6 md:gap-8 font-bold text-xs sm:text-sm text-on-surface-variant select-none overflow-x-auto no-scrollbar pb-2 flex-1">
                      <button 
                        onClick={() => { setActiveTab('all'); }}
                        className={`shrink-0 pb-1 relative font-extrabold whitespace-nowrap ${activeTab === 'all' ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        सभी सुर्खियाँ
                        {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('local'); }}
                        className={`shrink-0 pb-1 relative font-extrabold flex items-center gap-1 whitespace-nowrap ${activeTab === 'local' ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span>स्थानीय समाचार</span>
                        {activeTab === 'local' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('national'); }}
                        className={`shrink-0 pb-1 relative font-extrabold flex items-center gap-1 whitespace-nowrap ${activeTab === 'national' ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <span className="material-symbols-outlined text-base">flag</span>
                        <span>राष्ट्रीय</span>
                        {activeTab === 'national' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                      </button>
                    </div>
                    <div className="text-[10px] md:text-xs text-on-surface-variant font-bold select-none shrink-0">
                      {finalDisplayArticles.length} खबरें
                    </div>
                  </div>
                </section>

                {finalDisplayArticles.length === 0 ? (
                  <div className="text-center py-12 md:py-16 bg-[#f8fafc] rounded-2xl md:rounded-3xl border border-slate-200/60 my-4">
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-slate-400 mb-3 block">search_off</span>
                    <h3 className="text-base md:text-lg font-bold text-slate-700">कोई समाचार नहीं मिला</h3>
                    <p className="text-xs md:text-sm text-slate-400 mt-1 px-6">आपके फ़िल्टर से मेल खाने वाला कोई लेख नहीं मिला।</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                      {finalDisplayArticles.slice(0, visibleCount).map((article) => {
                        const display = getDisplayArticle(article);
                        const liveData = parseLiveTitle(display.title);
                        return (
                          <article 
                            key={article.id}
                            onClick={() => onSelectArticle && onSelectArticle(article)}
                            className="bg-white rounded-2xl md:rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-full flex flex-col transition-all hover:-translate-y-1 relative cursor-pointer"
                          >
                            {(!currentUser || currentUser.role === 'user') && (
                              <button
                                onClick={(e) => handleToggleBookmark(e, article.id)}
                                className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-1.5 rounded-full shadow-md text-on-surface hover:text-primary transition-all flex items-center justify-center z-10"
                              >
                                <span className="material-symbols-outlined text-lg font-bold">
                                  {bookmarkedIds.includes(article.id) ? 'bookmark' : 'bookmark_border'}
                                </span>
                              </button>
                            )}
                            <div className="h-44 sm:h-48 md:h-52 relative overflow-hidden shrink-0">
                              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={display.image} alt={display.title} loading="lazy" />
                              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md font-label-caps text-[9px] font-bold text-on-surface uppercase select-none flex items-center gap-1.5">
                                {display.category}
                              </div>
                            </div>
                            <div className="p-4 md:p-6 flex flex-col flex-1 justify-between gap-3">
                              <div className="flex flex-col gap-2 md:gap-3">
                                <h3 className="font-serif text-base md:text-lg lg:text-xl font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e] line-clamp-2">{display.title}</h3>
                                <p className="font-body-md text-xs md:text-sm text-on-surface-variant line-clamp-2 md:line-clamp-3 leading-relaxed">{display.summary}</p>
                              </div>
                              <div className="border-t border-outline-variant/10 pt-3 md:pt-4 mt-1 md:mt-2 text-[10px] md:text-xs text-on-surface-variant flex items-center justify-between">
                                <span className="font-bold truncate mr-2">{display.sourceName || display.author}</span>
                                <span className="flex items-center gap-0.5 shrink-0"><span className="material-symbols-outlined text-sm">schedule</span> {display.readTime}</span>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </section>
                    
                    {finalDisplayArticles.length > visibleCount && (
                      <div className="flex justify-center mt-6 select-none">
                        <button 
                          onClick={() => setVisibleCount(prev => prev + 12)}
                          className="px-8 py-3 bg-white hover:bg-slate-50 text-primary border border-primary/20 rounded-full font-bold text-xs uppercase shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm font-black">expand_more</span>
                          <span>और समाचार लोड करें (Load More)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <AdPlaceholder id="AD 7" size="728x90 - Horizontal Banner" type="LAST CONTENT AD" description="Increase page RPM" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
