import React, { useState, useEffect } from 'react';

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

function getFallbackImage(title, categoryName) {
  const cleanTitle = (title || '').toLowerCase();
  
  // Extract specific theme-based keywords from the title
  let query = 'news';
  
  if (cleanTitle.includes('train') || cleanTitle.includes('railway') || cleanTitle.includes('rail')) {
    query = 'train,railway';
  } else if (cleanTitle.includes('temple') || cleanTitle.includes('monument') || cleanTitle.includes('taj mahal') || cleanTitle.includes('history')) {
    query = 'temple,monument,india';
  } else if (cleanTitle.includes('road') || cleanTitle.includes('highway') || cleanTitle.includes('accident') || cleanTitle.includes('crash') || cleanTitle.includes('collision')) {
    query = 'road,accident';
  } else if (cleanTitle.includes('cricket') || cleanTitle.includes('dhoni') || cleanTitle.includes('kohli') || cleanTitle.includes('match') || cleanTitle.includes('ipl') || cleanTitle.includes('t20') || cleanTitle.includes('sports')) {
    query = 'cricket,sports';
  } else if (cleanTitle.includes('bjp') || cleanTitle.includes('modi') || cleanTitle.includes('politics') || cleanTitle.includes('election') || cleanTitle.includes('minister') || cleanTitle.includes('congress') || cleanTitle.includes('gandhi') || cleanTitle.includes('cabinet') || cleanTitle.includes('parliament')) {
    query = 'politics,government';
  } else if (cleanTitle.includes('school') || cleanTitle.includes('exam') || cleanTitle.includes('neet') || cleanTitle.includes('student') || cleanTitle.includes('university') || cleanTitle.includes('education') || cleanTitle.includes('syllabus')) {
    query = 'classroom,school,education';
  } else if (cleanTitle.includes('gold') || cleanTitle.includes('market') || cleanTitle.includes('stock') || cleanTitle.includes('rupee') || cleanTitle.includes('economy') || cleanTitle.includes('finance') || cleanTitle.includes('business') || cleanTitle.includes('trade')) {
    query = 'business,finance,market';
  } else if (cleanTitle.includes('weather') || cleanTitle.includes('rain') || cleanTitle.includes('monsoon') || cleanTitle.includes('flood') || cleanTitle.includes('landslide') || cleanTitle.includes('heavy rain')) {
    query = 'monsoon,rain,weather';
  } else if (cleanTitle.includes('celebrity') || cleanTitle.includes('movie') || cleanTitle.includes('film') || cleanTitle.includes('actor') || cleanTitle.includes('bollywood') || cleanTitle.includes('star') || cleanTitle.includes('entertainment')) {
    query = 'bollywood,movie,actor';
  } else if (cleanTitle.includes('haldwani') || cleanTitle.includes('nainital') || cleanTitle.includes('kumaon') || cleanTitle.includes('uttarakhand')) {
    query = 'uttarakhand,haldwani,himalayas';
  } else {
    // Default: use the category name as search query if no specific title keyword is matched
    query = categoryName ? `${categoryName.toLowerCase().replace(/[^a-z0-9]/g, ',')},news` : 'news,journalism';
  }

  // Create hash of the title to use as a signature seed for Unsplash so we get unique images
  let hash = 0;
  const str = title || '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);

  return `https://images.unsplash.com/featured/800x600/?${query}&sig=${seed}`;
}

function Home({ selectedCategory, onSelectCategory, searchQuery, selectedDate, onSelectArticle, onArticlesLoaded }) {
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Auto scroll ads every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch articles and bookmarks on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/articles`);
        if (res.ok) {
          const data = await res.json();
          // Map DB columns to our UI keys
          const mapped = data.map(art => ({
            id: art.id,
            category: `${art.type.toUpperCase()} / ${art.category.toUpperCase()}`,
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
          setArticles(mapped);
          onArticlesLoaded && onArticlesLoaded(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch articles:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();

    // Check user session
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (user.role === 'user') {
        fetchBookmarks(user.id);
      }
    }
  }, []);

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
    // 0. Only show articles that have a valid native image URL
    if (!art.image) {
      return false;
    }

    // 1. Tab filtering (type)
    if (activeTab !== 'all' && art.type !== activeTab) {
      return false;
    }

    // 2. Header Category filtering
    if (selectedCategory && selectedCategory !== 'All') {
      const catLower = selectedCategory.toLowerCase();
      const artCatLower = art.category.toLowerCase();
      
      if (catLower === 'uttarakhand') {
        if (art.type !== 'local' && !artCatLower.includes('uttarakhand')) return false;
      } else if (catLower === 'india') {
        if (art.type !== 'national' && !artCatLower.includes('india')) return false;
      } else if (catLower === 'world') {
        if (art.type !== 'international' && !artCatLower.includes('world')) return false;
      } else if (catLower === 'top stories') {
        // Show all top/headlines
      } else if (catLower === 'blog') {
        if (art.type !== 'blog' && art.author === 'Editorial Team') return false;
      } else if (catLower === 'hindi news') {
        if (!artCatLower.includes('hindi') && !artCatLower.includes('aaj tak') && !artCatLower.includes('amar ujala')) return false;
      } else {
        if (!artCatLower.includes(catLower)) return false;
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

  // Hero article: prefer latest LOCAL news with a real image, fallback to first article with image
  const heroArticle = (() => {
    if (activeTab !== 'all' || (selectedCategory && selectedCategory !== 'All')) {
      return finalDisplayArticles.find(a => a.hasRealImage) || finalDisplayArticles[0];
    }
    const localWithImg = finalDisplayArticles.find(a => a.type === 'local' && a.hasRealImage);
    if (localWithImg) return localWithImg;
    return finalDisplayArticles.find(a => a.hasRealImage) || finalDisplayArticles[0];
  })();

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

  return (
    <div className="w-full pt-[148px] pb-10 flex flex-col gap-10">
      
      {/* Stock / Finance Ticker Widget */}
      <section className="w-full bg-white border-y border-outline-variant/20 overflow-hidden flex items-center select-none py-3.5">
        <div className="flex animate-marquee whitespace-nowrap gap-0">
          
          {/* First Set of Items */}
          <div className="flex items-center gap-12 shrink-0 pr-12">
            {tickerItems.map((item, index) => (
              <React.Fragment key={`ticker-${index}`}>
                <div className="flex items-center gap-3 text-xs md:text-sm">
                  <span className="font-label-caps text-on-surface-variant font-extrabold tracking-wider text-[11px] md:text-xs">
                    {item.label}
                  </span>
                  <span className="font-extrabold text-on-surface text-sm md:text-base">
                    {item.value}
                  </span>
                  <span className={`${item.isUp ? 'text-secondary' : 'text-primary'} text-xs flex items-center font-bold`}>
                    <span className="material-symbols-outlined text-sm md:text-base font-extrabold">
                      {item.isUp ? 'trending_up' : 'trending_down'}
                    </span>
                    <span className="ml-1">{item.change}</span>
                  </span>
                </div>
                <div className="w-px h-5 bg-outline-variant/40 shrink-0"></div>
              </React.Fragment>
            ))}
          </div>

          {/* Cloned Set for Seamless Infinite Scrolling */}
          <div className="flex items-center gap-12 shrink-0 pr-12" aria-hidden="true">
            {tickerItems.map((item, index) => (
              <React.Fragment key={`ticker-clone-${index}`}>
                <div className="flex items-center gap-3 text-xs md:text-sm">
                  <span className="font-label-caps text-on-surface-variant font-extrabold tracking-wider text-[11px] md:text-xs">
                    {item.label}
                  </span>
                  <span className="font-extrabold text-on-surface text-sm md:text-base">
                    {item.value}
                  </span>
                  <span className={`${item.isUp ? 'text-secondary' : 'text-primary'} text-xs flex items-center font-bold`}>
                    <span className="material-symbols-outlined text-sm md:text-base font-extrabold">
                      {item.isUp ? 'trending_up' : 'trending_down'}
                    </span>
                    <span className="ml-1">{item.change}</span>
                  </span>
                </div>
                <div className="w-px h-5 bg-outline-variant/40 shrink-0"></div>
              </React.Fragment>
            ))}
          </div>

        </div>
      </section>

      {/* Key Administrative Profiles Bar */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-12 mt-4 select-none">
        <div className="bg-[#f8fafc] border border-slate-200/60 rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 shadow-sm">
          
          {/* PM Profile */}
          <div className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
              <img 
                className="w-full h-full object-cover"
                src="/modi.jpg"
                alt="PM Narendra Modi"
              />
            </div>
            <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-4 leading-none">Narendra Modi</h4>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-2">PM of India</span>
          </div>

          {/* Governor Profile */}
          <div className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
              <img 
                className="w-full h-full object-cover"
                src="/governor.jpg"
                alt="Governor Gurmit Singh"
              />
            </div>
            <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-4 leading-none">Lt. Gen. Gurmit Singh</h4>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-2">Governor of UK</span>
          </div>

          {/* CM Profile */}
          <div className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
              <img 
                className="w-full h-full object-cover"
                src="/dhami.jpg"
                alt="CM Pushkar S. Dhami"
              />
            </div>
            <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-4 leading-none">Pushkar S. Dhami</h4>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-2">CM of Uttarakhand</span>
          </div>

          {/* DM Profile */}
          <div className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
              <img 
                className="w-full h-full object-cover"
                src="/dm.jpg"
                alt="DM Lalit M. Rayal"
              />
            </div>
            <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-4 leading-none">Lalit M. Rayal</h4>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-2">DM of Nainital</span>
          </div>

          {/* Mayor Profile */}
          <div className="flex flex-col items-center text-center bg-white border border-slate-100/80 p-5 rounded-2xl shadow-sm hover:shadow hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/10 group-hover:border-primary/30 shadow-sm transition-all duration-300">
              <img 
                className="w-full h-full object-cover"
                src="/mayor.jpg"
                alt="Mayor Gajraj S. Bisht"
              />
            </div>
            <h4 className="text-sm font-normal text-slate-800 tracking-tight mt-4 leading-none">Gajraj S. Bisht</h4>
            <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider block mt-2">Mayor of Haldwani</span>
          </div>

        </div>
      </section>

      {/* Full Width Advertisement Banner Slider */}
      <section className="w-full max-w-[1440px] mx-auto px-4 md:px-12 mt-4 select-none">
        <div className="relative w-full h-[180px] md:h-[220px] rounded-3xl overflow-hidden shadow-sm group">
          
          {/* Slides Container */}
          <div className="absolute inset-0 w-full h-full flex transition-transform duration-700 ease-in-out"
               style={{ transform: `translateX(-${currentAdIndex * 100}%)` }}>
            {ads.map((ad) => (
              <div key={ad.id} className="relative w-full h-full shrink-0">
                <img 
                  className="w-full h-full object-cover"
                  src={ad.image}
                  alt={ad.title}
                />
                {/* Soft dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
                
                {/* Advertisement Text Details */}
                <div className="absolute inset-y-0 left-0 flex flex-col justify-center px-8 md:px-16 text-white max-w-[85%] md:max-w-[50%]">
                  <span className="bg-primary/95 text-[10px] text-white font-normal uppercase tracking-widest px-2.5 py-1 rounded-md w-max mb-3 shadow-sm">
                    Sponsored Ad
                  </span>
                  <h3 className="text-xl md:text-2xl font-normal tracking-tight leading-tight mb-2">
                    {ad.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-200/90 leading-relaxed font-normal">
                    {ad.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dot Indicators */}
          <div className="absolute bottom-4 right-8 flex gap-2">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentAdIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentAdIndex === idx ? 'bg-primary w-5' : 'bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Main content grid wrapped in restricted width container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12 flex flex-col gap-10">

        {/* Loading / Empty States */}
        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <span className="font-bold text-sm text-slate-500 uppercase tracking-widest">Compiling News Stream...</span>
          </div>
        ) : (
          <>
            {heroArticle && (
              <section 
                onClick={() => onSelectArticle && onSelectArticle(heroArticle)}
                className="group relative overflow-hidden rounded-[18px] bg-white card-shadow border border-outline-variant/10 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  
                  <div className="h-[300px] md:h-[400px] lg:h-[480px] relative overflow-hidden">
                    <img 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      src={heroArticle.image}
                      alt={heroArticle.title}
                    />
                    <div className="absolute top-4 left-4 bg-primary text-on-primary px-3 py-1.5 rounded-full flex items-center gap-1.5 font-label-caps text-[10px] md:text-xs shadow-lg select-none">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> BREAKING NEWS
                    </div>
                  </div>

                  <div className="p-8 lg:p-12 flex flex-col justify-center bg-white border-l-0 rounded-r-[18px]">
                    <span className="font-label-caps text-xs text-primary mb-4 tracking-widest block font-bold uppercase">{heroArticle.category}</span>
                    <h1 className="font-serif text-2xl md:text-4xl mb-6 font-bold leading-tight text-[#191c1e]">
                      {heroArticle.title}
                    </h1>
                    <p className="font-body-md text-sm md:text-base text-on-surface-variant mb-8 leading-relaxed">
                      {heroArticle.summary}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline-variant/20">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary border border-outline-variant/30 uppercase select-none">
                          {(heroArticle.sourceName || heroArticle.author || 'HT').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-metadata text-xs md:text-metadata font-bold">{heroArticle.sourceName || heroArticle.author}</p>
                          <p className="text-[10px] md:text-[11px] text-on-surface-variant font-medium">
                            {heroArticle.sourceName ? `Aggregated by Haldwani Times` : 'Haldwani Times'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(!currentUser || currentUser.role === 'user') && (
                          <button 
                            onClick={(e) => handleToggleBookmark(e, heroArticle.id)}
                            className="flex items-center justify-center p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"
                          >
                            <span className="material-symbols-outlined text-lg md:text-xl">
                              {bookmarkedIds.includes(heroArticle.id) ? 'bookmark' : 'bookmark_border'}
                            </span>
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                          className="flex items-center justify-center p-2.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant hover:text-primary"
                        >
                          <span className="material-symbols-outlined text-lg md:text-xl">share</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* Aggregator Navigation / Tabs Bar */}
            <section className="border-b border-black/10 pb-2 mt-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 md:gap-8 font-bold text-sm md:text-base text-on-surface-variant select-none">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 transition-colors relative font-extrabold ${activeTab === 'all' ? 'text-primary' : 'hover:text-primary'}`}
                  >
                    <span>All Headlines</span>
                    {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('local')}
                    className={`pb-3 transition-colors relative font-extrabold flex items-center gap-1.5 ${activeTab === 'local' ? 'text-primary' : 'hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span>Local News (Haldwani)</span>
                    {activeTab === 'local' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('national')}
                    className={`pb-3 transition-colors relative font-extrabold flex items-center gap-1.5 ${activeTab === 'national' ? 'text-primary' : 'hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-lg">flag</span>
                    <span>National (India)</span>
                    {activeTab === 'national' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('international')}
                    className={`pb-3 transition-colors relative font-extrabold flex items-center gap-1.5 ${activeTab === 'international' ? 'text-primary' : 'hover:text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-lg">public</span>
                    <span>International (World)</span>
                    {activeTab === 'international' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                  </button>
                </div>
                
                <div className="text-xs text-on-surface-variant font-bold select-none">
                  Showing {finalDisplayArticles.length} aggregated stories
                </div>
              </div>
            </section>

            {/* Main Aggregator Feed: Responsive Grid */}
            {finalDisplayArticles.length === 0 ? (
              <div className="text-center py-16 bg-[#f8fafc] rounded-3xl border border-slate-200/60 my-6 col-span-full">
                <span className="material-symbols-outlined text-5xl text-slate-400 mb-3 block">search_off</span>
                <h3 className="text-lg font-bold text-slate-700">No News Found</h3>
                <p className="text-sm text-slate-400 mt-1">We couldn't find any articles matching your filters. Try choosing another category or clearing search filters.</p>
              </div>
            ) : (
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {finalDisplayArticles.map((article) => (
                  <article 
                    key={article.id}
                    onClick={() => onSelectArticle && onSelectArticle(article)}
                    className="bg-white rounded-[18px] card-shadow border border-outline-variant/10 overflow-hidden group h-fit transition-all hover:-translate-y-1 relative cursor-pointer"
                  >
                    {/* Bookmark floating button */}
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

                    <div className="h-52 relative overflow-hidden">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        src={article.image} 
                        alt={article.title}
                      />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg font-label-caps text-[9px] font-bold text-on-surface uppercase select-none">
                        {article.category}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col gap-3">
                      <h3 className="font-serif text-lg md:text-xl font-bold leading-snug group-hover:text-primary transition-colors text-[#191c1e]">
                        {article.title}
                      </h3>
                      <p className="font-body-md text-xs md:text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                      
                      <div className="flex flex-col gap-2 border-t border-outline-variant/10 pt-4 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-on-surface-variant font-bold">{article.sourceName || article.author}</span>
                          <span className="text-xs text-on-surface-variant flex items-center gap-1 font-semibold">
                            <span className="material-symbols-outlined text-base">schedule</span> {article.readTime}
                          </span>
                        </div>
                        {article.sourceName && (
                          <div className="text-[10px] text-slate-400 italic font-medium">
                            Aggregated by Haldwani Times from {article.sourceName}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default Home;
