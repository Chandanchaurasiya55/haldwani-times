import React, { useState, useEffect } from 'react';

function Header({ onNavigate, onSelectCategory, selectedCategory, onSearch, searchQuery, onSelectDate, selectedDate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
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
        {/* Row 1: Top Bar */}
        <div className={`border-b border-outline-variant/20 shadow-sm transition-all duration-300 ${isScrolled ? 'max-h-0 opacity-0 overflow-hidden border-none' : 'max-h-24 opacity-100'}`}>
          <div className="max-w-[1440px] mx-auto flex justify-between items-center px-4 md:px-12 h-20 relative bg-white">
            
            {/* Left: Menu & Search */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 text-primary hover:text-opacity-80 transition-all font-bold tracking-wider text-xs md:text-sm"
              >
                <span>MENU</span>
                <span className="material-symbols-outlined text-lg md:text-xl font-bold">menu</span>
              </button>
              
              <div className="h-4 w-px bg-outline-variant/30 hidden md:block"></div>
              
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-2 text-on-surface hover:text-primary transition-all font-bold tracking-wider text-xs md:text-sm"
              >
                <span>Search</span>
                <span className="material-symbols-outlined text-lg md:text-xl">search</span>
              </button>
            </div>

            {/* Center: Haldwani Times Logo */}
            <div className="flex items-center justify-center flex-1 md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }} className="hover:text-primary transition-all text-center flex flex-col items-center select-none">
                <span className="font-serif font-black text-2xl md:text-3xl tracking-tight text-on-surface leading-none italic">
                  Haldwani Times
                </span>
                <span className="text-[8px] md:text-[9px] font-sans tracking-[0.25em] text-on-surface-variant font-semibold mt-1">
                  PREMIUM EDITORIAL AGGREGATOR
                </span>
              </a>
            </div>

            {/* Right: Account & Subscribe */}
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate && onNavigate('dashboard')} className="flex items-center gap-1.5 text-on-surface hover:text-primary transition-all font-bold text-xs md:text-sm">
                <span className="material-symbols-outlined text-lg md:text-xl">person</span>
                <span className="hidden sm:inline">My account</span>
              </button>
              
              <button className="bg-primary hover:bg-opacity-95 text-white font-bold text-[10px] md:text-xs uppercase px-4 md:px-6 py-2.5 rounded tracking-wider shadow-sm hover:shadow-md transition-all">
                SUBSCRIBE
              </button>
            </div>

          </div>
        </div>

        {/* Row 2: Categories Navigation */}
        <div className={`bg-white border-b border-outline-variant/20 shadow-sm overflow-x-auto no-scrollbar transition-all duration-300 ${isScrolled ? 'py-1 shadow-md bg-white/95 backdrop-blur-md' : ''}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center justify-between w-full">
            
            {/* Scrolled Logo (left) */}
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate && onNavigate('home'); }}
              className={`font-serif font-black text-xl text-on-surface leading-none italic whitespace-nowrap transition-all duration-300 transform select-none ${isScrolled ? 'opacity-100 translate-x-0 w-auto mr-8' : 'opacity-0 -translate-x-4 w-0 overflow-hidden pointer-events-none'}`}
            >
              Haldwani Times
            </a>

            {/* Navigation links */}
            <nav className={`flex items-center gap-6 md:gap-8 whitespace-nowrap text-xs md:text-sm font-bold text-on-surface-variant transition-all duration-300 ${isScrolled ? 'ml-auto justify-end' : 'mx-auto justify-center w-full'}`}>
              {categories.map((category) => (
                <a 
                  key={category} 
                  href={`#${category.toLowerCase().replace(/\s+/g, '-')}`} 
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectCategory && onSelectCategory(category);
                  }}
                  className={`hover:text-primary transition-all pb-1 border-b-2 transition-all duration-200 ${selectedCategory === category ? 'text-primary border-primary' : 'border-transparent hover:border-primary'}`}
                >
                  {category}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Dynamic Slide-down Search Bar Overlay */}
        <div className={`transition-all duration-300 overflow-hidden ${isSearchOpen ? 'max-h-16 opacity-100 border-b border-outline-variant/20 bg-surface' : 'max-h-0 opacity-0 pointer-events-none'}`}>
          <div className="max-w-[1440px] mx-auto px-4 md:px-12 py-3 flex items-center gap-4 bg-white">
            <span className="material-symbols-outlined text-on-surface-variant">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              placeholder="Search articles, topics, or insights..." 
              className="w-full bg-transparent border-none text-on-surface focus:outline-none focus:ring-0 text-base md:text-lg placeholder-on-surface-variant/50 p-0" 
            />
            
            {/* Date filter input */}
            <div className="flex items-center gap-2 border-l border-outline-variant/30 pl-4 shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-sm md:text-base">calendar_month</span>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => onSelectDate && onSelectDate(e.target.value)}
                className="bg-transparent border-none text-on-surface text-xs md:text-sm focus:outline-none cursor-pointer outline-none"
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

            <button onClick={() => setIsSearchOpen(false)} className="material-symbols-outlined text-on-surface-variant hover:text-primary">close</button>
          </div>
        </div>
      </header>

      {/* DYNAMIC LEFT MENU DRAWER */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 h-full w-[300px] bg-white shadow-2xl p-6 transition-transform duration-300 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex justify-between items-center mb-8 border-b border-outline-variant/20 pb-4">
            <div className="flex flex-col">
              <span className="font-serif font-black text-xl text-primary leading-none italic">Haldwani Times</span>
              <span className="text-[8px] font-sans tracking-[0.1em] text-on-surface-variant mt-1 font-semibold">EST. 2026</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} className="material-symbols-outlined text-2xl hover:text-primary transition-colors">close</button>
          </div>
          
          {/* Vertical Menu Links */}
          <div className="px-2 mb-4">
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
                }}
              >
                <span className="material-symbols-outlined">newspaper</span>
                {category}
              </a>
            ))}
          </nav>

          {/* Drawer Footer Actions */}
          <div className="border-t border-outline-variant/20 pt-6 mt-auto flex flex-col gap-4">
            <button className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-label-caps text-xs shadow-lg hover:brightness-110 transition-all font-bold">
              Subscribe Premium
            </button>
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
