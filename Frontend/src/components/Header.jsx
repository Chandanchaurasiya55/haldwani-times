import React, { useState, useEffect } from 'react';

function Header({ onNavigate, onSelectCategory, selectedCategory, onSearch, searchQuery, onSelectDate, selectedDate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showProfileDrop, setShowProfileDrop] = useState(false);

  // Check login state on mount and listen for storage changes
  useEffect(() => {
    const checkUser = () => {
      const saved = localStorage.getItem('ht_user');
      setLoggedInUser(saved ? JSON.parse(saved) : null);
    };
    checkUser();
    window.addEventListener('storage', checkUser);
    // Also poll every 2s for same-tab changes
    const interval = setInterval(checkUser, 2000);
    return () => { window.removeEventListener('storage', checkUser); clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = [
    "Uttarakhand", "India", "Education", "Politics", "Top Stories",
    "Food", "Business", "Celebrity", "Hindi News", "World", "Blog"
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 flex flex-col bg-white">

        {/* Row 1: Top Bar — hidden when scrolled */}
        <div className={`border-b border-outline-variant/20 shadow-sm transition-all duration-300 ${isScrolled ? 'max-h-0 opacity-0 overflow-hidden border-none' : 'max-h-24 opacity-100'}`}>
          <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-12 h-20 relative bg-white">

            {/* Left: Menu & Search */}
            <div className="flex items-center gap-3 md:gap-6">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-1.5 md:gap-2 text-primary transition-all font-bold tracking-wider text-xs md:text-sm"
              >
                <span className="hidden xs:inline">MENU</span>
                <span className="material-symbols-outlined text-xl md:text-xl font-bold">menu</span>
              </button>

              <div className="h-4 w-px bg-outline-variant/30 hidden md:block"></div>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-1.5 md:gap-2 text-on-surface hover:text-primary transition-all font-bold tracking-wider text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Search</span>
                <span className="material-symbols-outlined text-xl md:text-xl">search</span>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="hover:opacity-90 transition-all text-center flex flex-col items-center select-none">
                <img src="/logo.png" alt="Haldwani Times Logo" className="h-10 sm:h-12 md:h-14 w-auto object-contain" />
              </a>
            </div>

            {/* Right: Account & Subscribe */}
            <div className="flex items-center gap-2 md:gap-4">
              {loggedInUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDrop(!showProfileDrop)}
                    className="flex items-center gap-2 text-on-surface hover:text-primary transition-all font-bold text-xs md:text-sm"
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-black text-[10px] md:text-xs uppercase shrink-0 ${
                      loggedInUser.role === 'admin' ? 'bg-indigo-600' : loggedInUser.role === 'reporter' ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}>
                      {loggedInUser.username.substring(0, 2)}
                    </div>
                    <span className="hidden sm:inline truncate max-w-[100px]">{loggedInUser.username}</span>
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                  </button>

                  {/* Dropdown */}
                  {showProfileDrop && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileDrop(false)}></div>
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-xs uppercase shrink-0 ${
                              loggedInUser.role === 'admin' ? 'bg-indigo-600' : loggedInUser.role === 'reporter' ? 'bg-blue-600' : 'bg-emerald-600'
                            }`}>
                              {loggedInUser.username.substring(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-slate-800 truncate">{loggedInUser.username}</h4>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                loggedInUser.role === 'admin' ? 'text-indigo-600' : loggedInUser.role === 'reporter' ? 'text-blue-600' : 'text-emerald-600'
                              }`}>{loggedInUser.role}</span>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowProfileDrop(false);
                              if (loggedInUser.role === 'admin') window.location.href = '/maalik-access';
                              else if (loggedInUser.role === 'reporter') window.location.href = '/reporter/login';
                              else window.location.href = '/dashboard';
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-base text-slate-500">dashboard</span>
                            My Dashboard
                          </button>
                          <button
                            onClick={() => {
                              setShowProfileDrop(false);
                              localStorage.removeItem('ht_user');
                              setLoggedInUser(null);
                              window.location.href = '/';
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <span className="material-symbols-outlined text-base">logout</span>
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <button onClick={() => onNavigate && onNavigate('dashboard')} className="flex items-center gap-1 md:gap-1.5 text-on-surface hover:text-primary transition-all font-bold text-xs md:text-sm">
                    <span className="material-symbols-outlined text-xl md:text-xl">person</span>
                    <span className="hidden sm:inline">My account</span>
                  </button>
                  <button onClick={() => onNavigate && onNavigate('dashboard')} className="bg-primary text-white font-bold text-[9px] md:text-xs uppercase px-3 md:px-6 py-2 md:py-2.5 rounded tracking-wider shadow-sm hover:shadow-md transition-all">
                    SUBSCRIBE
                  </button>
                </>
              )}

            </div>

          </div>
        </div>

        {/* Row 2: Categories Nav — horizontally scrollable on mobile */}
        <div className={`bg-white border-b border-outline-variant/20 shadow-sm transition-all duration-300 ${isScrolled ? 'shadow-md bg-white/95 backdrop-blur-md' : ''}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-2.5 md:py-3 flex items-center w-full">

            {/* Scrolled Logo */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}
              className={`transition-all duration-300 select-none shrink-0 ${isScrolled ? 'opacity-100 w-auto mr-6' : 'opacity-0 w-0 overflow-hidden pointer-events-none'}`}
            >
              <img src="/logo.png" alt="Haldwani Times Logo" className="h-7 w-auto object-contain" />
            </a>

            {/* Scrollable nav */}
            <nav className="flex items-center gap-5 md:gap-8 whitespace-nowrap text-xs md:text-sm font-bold text-on-surface-variant overflow-x-auto no-scrollbar w-full justify-start md:justify-center">
              {categories.map((category) => (
                <a
                  key={category}
                  href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory && onSelectCategory(category);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`shrink-0 hover:text-primary pb-1 border-b-2 duration-200 ${selectedCategory === category ? 'text-primary border-primary' : 'border-transparent hover:border-primary'}`}
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Slide-down Search Bar */}
        <div className={`transition-all duration-300 overflow-hidden ${isSearchOpen ? 'max-h-20 opacity-100 border-b border-outline-variant/20 bg-surface' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center gap-3 bg-white">
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              placeholder="Search articles, topics..."
              className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 text-sm md:text-base placeholder-on-surface-variant/50 p-0 min-w-0"
            />

            {/* Date filter — hidden on very small screens, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-2 border-l border-outline-variant/30 pl-3 shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
                className="bg-transparent border-none text-on-surface text-xs focus:outline-none cursor-pointer outline-none"
              />
              {selectedDate && (
                <button
                  onClick={() => onSelectDate && onSelectDate('')}
                  className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm font-bold"
                  title="Clear Date"
                >
                  clear
                </button>
              )}
            </div>

            <button onClick={() => setIsSearchOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-primary shrink-0">close</button>
          </div>

          {/* Date filter row on mobile */}
          <div className="sm:hidden flex items-center gap-2 px-4 pb-2 bg-white">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">calendar_month</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
              className="bg-transparent border-none text-on-surface text-xs focus:outline-none cursor-pointer outline-none"
            />
            {selectedDate && (
              <button
                onClick={() => onSelectDate && onSelectDate('')}
                className="material-symbols-outlined text-on-surface-variant hover:text-primary text-sm font-bold"
              >
                clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Left Drawer Menu */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 h-full w-[280px] sm:w-[300px] bg-white shadow-2xl p-5 md:p-6 transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-outline-variant/20 pb-4">
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl text-primary leading-none italic">Haldwani Times</span>
              <span className="text-[8px] font-sans tracking-[0.1em] text-on-surface-variant mt-1 font-semibold">EST. 2026</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="material-symbols-outlined text-2xl hover:text-primary transition-colors">close</button>
          </div>

          <div className="px-2 mb-3">
            <span className="font-label-caps text-[10px] text-on-surface-variant opacity-60 uppercase tracking-widest block mb-2">VERTICALS</span>
          </div>
          <nav className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1">
            <a className="bg-primary-fixed text-on-primary-fixed-variant border-l-4 border-primary px-4 py-2.5 flex items-center gap-3 font-label-caps text-xs transition-all transform hover:translate-x-1" href="#" onClick={() => setIsMenuOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
              Home
            </a>
            {categories.map((category) => (
              <a
                key={category}
                className={`px-4 py-2.5 flex items-center gap-3 font-label-caps text-xs transition-all transform hover:translate-x-1 border-l-4 ${selectedCategory === category ? 'bg-primary-fixed text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-transparent'}`}
                href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectCategory && onSelectCategory(category);
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <span className="material-symbols-outlined">newspaper</span>
                {category}
              </a>
            ))}
          </nav>

          <div className="border-t border-outline-variant/20 pt-5 mt-auto flex flex-col gap-3">
            <div className="flex flex-col gap-2 px-2">
              <a className="text-on-surface-variant hover:text-on-surface text-xs flex items-center gap-2" href="#">
                <span className="material-symbols-outlined text-base">settings</span> Settings
              </a>
              <a className="text-on-surface-variant hover:text-on-surface text-xs flex items-center gap-2" href="#">
                <span className="material-symbols-outlined text-base">help</span> Help Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
