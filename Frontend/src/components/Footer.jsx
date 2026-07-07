import React from 'react';

function Footer() {
  const categories = [
    "Uttarakhand", "India", "Education", "Politics", "Top Stories", 
    "Food", "Business", "Celebrity", "Hindi News", "World", "Blog"
  ];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#eceef0] text-[#191c1e] pt-12 pb-6 px-4 md:px-12 border-t border-outline-variant/30">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Top Header Row of Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center pb-6 border-b border-black/80 gap-6">
          <div className="flex flex-col items-center md:items-start select-none">
            <span className="font-serif font-black text-2xl md:text-3xl tracking-tight leading-none italic">
              Haldwani Times
            </span>
          </div>
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs md:text-sm font-bold text-on-surface-variant">
            {categories.map((category) => (
              <a 
                key={category} 
                href={`#${category.toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-primary transition-all pb-1"
              >
                {category}
              </a>
            ))}
          </nav>
        </div>

        {/* Multi-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-10 pb-8 text-sm">
          
          {/* Column 1: About us */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">About us</h4>
            <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed max-w-sm">
              Haldwani Times is your trusted Haldwani news portal for the latest Haldwani news, local updates, Uttarakhand headlines, business, and community stories. Stay informed with fast, reliable news from Haldwani.
            </p>
            {/* Social Icons */}
            <div className="flex gap-2.5 mt-2">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 bg-black hover:bg-primary transition-colors flex items-center justify-center text-white rounded">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-8 h-8 bg-black hover:bg-primary transition-colors flex items-center justify-center text-white rounded">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="#" className="w-8 h-8 bg-black hover:bg-primary transition-colors flex items-center justify-center text-white rounded">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a href="#" className="w-8 h-8 bg-black hover:bg-primary transition-colors flex items-center justify-center text-white rounded">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.555A3.002 3.002 0 00.5 6.163C0 8.03 0 12 0 12s0 3.97.5 5.836a3.002 3.002 0 002.112 2.107c1.866.556 9.388.556 9.388.556s7.522 0 9.388-.556a3.003 3.003 0 002.11-2.107C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">Company</h4>
            <ul className="flex flex-col gap-2 font-bold text-on-surface-variant text-xs md:text-sm">
              {categories.map((category) => (
                <li key={category}>
                  <a className="hover:text-primary transition-colors" href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: The latest */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">The latest</h4>
            <ul className="flex flex-col gap-4 text-xs md:text-sm text-on-surface-variant font-medium">
              <li>
                <a href="#" className="hover:text-primary transition-colors leading-snug block">
                  • Heavy rainfall predicted in Kumaon region over next 48 hours.
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors leading-snug block">
                  • Uttarakhand board exams results announced; local students top the charts.
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors leading-snug block">
                  • New business and tech corridor in Haldwani to boost youth employment.
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Subscribe */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">Subscribe</h4>
            <div className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-white text-[#191c1e] px-4 py-3 text-xs md:text-sm border border-black/10 focus:outline-none focus:ring-1 focus:ring-black placeholder-gray-400"
              />
              <button className="w-full bg-black text-white hover:bg-neutral-800 font-bold text-xs uppercase py-3 tracking-widest transition-colors flex items-center justify-center gap-2">
                <span>I WANT IN</span>
                <span className="text-sm font-bold">→</span>
              </button>
              
              {/* Privacy Acceptance Checkbox */}
              <div className="flex items-start gap-2.5 mt-1 select-none">
                <input 
                  type="checkbox" 
                  id="privacy-policy-checkbox"
                  className="mt-1 w-3.5 h-3.5 text-black border-black/30 focus:ring-black accent-black cursor-pointer"
                />
                <label htmlFor="privacy-policy-checkbox" className="text-[11px] leading-tight text-on-surface-variant font-medium cursor-pointer">
                  I've read and accept the <a href="#" className="text-[#b80035] hover:underline font-semibold">Privacy Policy</a>.
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-black/10 text-xs text-on-surface-variant relative">
          <div className="flex-1 text-center font-semibold">
            © 2026 All Rights Reserved to BUIMB Research
          </div>
          
          {/* Scroll to Top Arrow Icon Button (Absolute or Flex placement) */}
          <div className="md:absolute md:right-0 bottom-0 md:-bottom-2">
            <button 
              onClick={handleScrollToTop}
              className="bg-[#b80035] text-white w-9 h-9 flex items-center justify-center shadow hover:bg-opacity-95 transition-all"
              aria-label="Scroll to top"
            >
              <span className="material-symbols-outlined text-xl font-bold">arrow_upward</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
