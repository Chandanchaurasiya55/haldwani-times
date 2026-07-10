import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function UserDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard states
  const [adminTab, setAdminTab] = useState('overview');
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [adsList, setAdsList] = useState([]);

  // Load session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'user') {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('ht_user');
      }
    }
  }, []);

  // Fetch bookmarks & ads
  useEffect(() => {
    if (currentUser) {
      fetchMyBookmarks();
      fetchAds();
    }
  }, [currentUser]);

  const fetchMyBookmarks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/bookmarks/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyBookmarks(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const fetchAds = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/ads`);
      if (res.ok) {
        const data = await res.json();
        setAdsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // Instead of blue box, set green success message and switch to login
      setSuccessMsg('Account registered successfully! You can now log in.');
      setAuthMode('login');
      setUsername('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ht_user');
    setCurrentUser(null);
    setMyBookmarks([]);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleRemoveBookmark = async (articleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/bookmarks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          article_id: articleId
        })
      });
      if (res.ok) {
        fetchMyBookmarks();
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col">
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 w-full z-50 h-16 flex items-center justify-between px-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span 
            onClick={() => window.location.href = '/'}
            className="font-serif font-black text-2xl tracking-tight text-[#b80035] cursor-pointer hover:opacity-90 animate-pulse hover:animate-none"
          >
            Haldwani Times
          </span>
          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
            User Portal
          </span>
        </div>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors border border-slate-200 hover:border-slate-300 rounded-full px-4 py-1.5"
        >
          <span className="material-symbols-outlined text-sm">home</span>
          <span>Go To Homepage</span>
        </button>
      </header>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1440px] w-full mx-auto p-4 md:p-8 gap-6">
        {!currentUser ? (
          /* ==========================================
              READER LOGIN / SIGNUP FORMS
              ========================================== */
          <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] my-auto">
            {/* Left Showcase Banner */}
            <div className="hidden md:flex md:w-1/2 bg-[#121314] p-12 flex-col justify-between text-white relative">
              <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-[#b80035]/10 blur-3xl"></div>
              <div className="flex flex-col gap-1 z-10 select-none">
                <span className="font-serif font-black text-2xl italic tracking-tight text-white leading-none">Haldwani Times</span>
                <span className="text-[9px] font-sans tracking-[0.25em] text-slate-400 font-semibold mt-1">READER NETWORK</span>
              </div>
              <div className="flex flex-col gap-4 my-auto z-10">
                <div className="h-0.5 w-12 bg-[#b80035]"></div>
                <blockquote className="font-serif text-lg italic leading-relaxed text-slate-200">
                  "Stay informed, stay connected. Haldwani's premium news network directly to your console."
                </blockquote>
              </div>
              <div className="text-[10px] text-slate-500 select-none">© Haldwani Times Reader Portal.</div>
            </div>

            {/* Right Form Section (Sign In or Sign Up dynamically toggled at the bottom) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              {authMode === 'login' ? (
                /* SIGN IN FORM */
                <div className="animate-fadeIn">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h3>
                    <p className="text-xs text-slate-400 mt-1">Access your saved news stream and library.</p>
                  </div>

                  {/* Errors */}
                  {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Clean green success text message, no blue box! */}
                  {successMsg && (
                    <div className="mt-4 text-xs font-extrabold text-emerald-600 text-center animate-fadeIn select-none">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 select-none">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="e.g. reader@haldwanitimes.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 select-none">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#b80035] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2 tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Log In</span>
                      <span className="material-symbols-outlined text-sm font-bold">login</span>
                    </button>
                  </form>

                  {/* Create Account Option at bottom of login */}
                  <p className="text-xs text-slate-500 text-center mt-6">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }} 
                      className="text-[#b80035] hover:underline font-bold"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              ) : (
                /* SIGN UP / REGISTER FORM */
                <div className="animate-fadeIn">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h3>
                    <p className="text-xs text-slate-400 mt-1">Join Haldwani Times to bookmark stories and receive newsletters.</p>
                  </div>

                  {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegister} className="flex flex-col gap-5 mt-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 select-none">Username</label>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="e.g. HaldwaniReader"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 select-none">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="e.g. yourname@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600 select-none">Password</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#b80035] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2 tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Create Account</span>
                      <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                    </button>
                  </form>

                  {/* Sign In Option at bottom of register */}
                  <p className="text-xs text-slate-500 text-center mt-6">
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} 
                      className="text-[#b80035] hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==========================================
              READER WORKSPACE
              ========================================== */
          <>
            {/* Sidebar Controls */}
            <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 border border-slate-200/60 rounded-3xl bg-white flex flex-col justify-between p-5 select-none shadow-sm animate-fadeIn">
              <div className="flex flex-col gap-6">
                
                {/* Profile Widget */}
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#b80035] flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                    UR
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate leading-tight">{currentUser.username}</h4>
                    <span className="text-[9px] text-[#b80035] font-black uppercase tracking-wider mt-0.5 block">Premium Reader</span>
                  </div>
                </div>

                {/* Vertical menu navigation */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-4 mb-3">MY ACCOUNT</span>
                  <nav className="flex flex-col gap-1">
                    <button 
                      onClick={() => setAdminTab('overview')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'overview' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      <span>Overview Library</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('bookmarks')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'bookmarks' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">bookmarks</span>
                      <span>Saved Bookmarks</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('offers')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'offers' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">campaign</span>
                      <span>Sponsored Offers</span>
                    </button>
                  </nav>
                </div>
              </div>

              {/* Bottom logout section */}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 border-transparent text-[#b80035] hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg font-bold">logout</span>
                  <span>Sign out Desk</span>
                </button>
              </div>
            </div>

            {/* Right main canvas */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm overflow-y-auto no-scrollbar max-h-[750px] animate-fadeIn">
              
              {/* OVERVIEW TAB */}
              {adminTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Jumbotron Banner */}
                  <div className="bg-gradient-to-br from-[#121314] via-[#242629] to-[#0f1011] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none animate-fadeIn">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="flex flex-col z-10">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">WELCOME 👋</span>
                      <h3 className="text-xl md:text-2xl font-black mt-1 tracking-tight">Haldwani Times Premium Library</h3>
                      <span className="text-xs text-slate-300 mt-2 font-medium">Enjoy personalized reading and sponsored campaigns.</span>
                    </div>
                    <div className="flex gap-6 z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">{myBookmarks.length}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">Bookmarks</span>
                      </div>
                    </div>
                  </div>

                  {/* LuxeGlobal Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none animate-fadeIn">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Saved Articles</span>
                        <span className="text-[#920028] bg-[#ffdada]/60 p-2 rounded-xl material-symbols-outlined font-bold text-xl">bookmark</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myBookmarks.length} <span className="text-sm font-normal text-slate-400">Items</span></h2>
                        <p className="text-[11px] font-bold text-[#0051d5] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">history</span> Personal bookmarks
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Estimated Reading Time</span>
                        <span className="text-[#0051d5] bg-blue-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">schedule</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myBookmarks.length * 4} <span className="text-sm font-normal text-slate-400">Mins</span></h2>
                        <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm font-black">hourglass_empty</span> Time saved
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Reader Account</span>
                        <span className="text-emerald-700 bg-emerald-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">verified_user</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Active</h2>
                        <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm font-bold">check_circle</span> Verified reader
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Split screen content: Bookmarks on Left, Sponsored Campaigns on Right */}
                  <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start animate-fadeIn">
                    
                    {/* Left: Saved Bookmarks */}
                    <div className="xl:col-span-3 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center select-none">
                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">bookmarks</span>
                          <span>My Bookmarked Articles</span>
                        </h4>
                        <button onClick={() => setAdminTab('bookmarks')} className="text-[11px] text-blue-600 font-bold hover:underline">View all</button>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {myBookmarks.length === 0 ? (
                          <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-xs">No bookmarks saved yet. Go back to Home and bookmark articles!</div>
                        ) : (
                          myBookmarks.slice(0, 3).map(art => (
                            <div key={art.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 animate-fadeIn">
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-800 text-xs truncate">{art.title}</h5>
                                <span className="text-[9px] text-slate-400 mt-0.5 block">{art.category} • {art.readTime || '4 min read'}</span>
                              </div>
                              <button 
                                onClick={() => handleRemoveBookmark(art.id)}
                                className="text-[#b80035] hover:text-[#920028] material-symbols-outlined text-base cursor-pointer shrink-0"
                              >
                                delete
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Right: Sponsored Announcements */}
                    <div className="xl:col-span-2 border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm select-none">
                      <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-lg">campaign</span>
                        <span>Sponsored Offers</span>
                      </h4>
                      <div className="flex flex-col gap-3.5">
                        {adsList.filter(ad => ad.image_url).length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs">No sponsored offers currently active. Check back later!</div>
                        ) : (
                          adsList.filter(ad => ad.image_url).slice(0, 2).map((ad, idx) => (
                            <a 
                              key={ad.slot_id || idx} 
                              href={ad.target_url || '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="group block rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow transition-all"
                            >
                              <div className="h-20 bg-slate-100 overflow-hidden relative">
                                <img src={ad.image_url} alt="Offer banner" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              </div>
                            </a>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* BOOKMARKS LIST TAB */}
              {adminTab === 'bookmarks' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b80035] text-xl">bookmarks</span>
                      <span>All Saved Articles</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myBookmarks.length === 0 ? (
                      <div className="col-span-2 text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl select-none">
                        <p className="text-xs font-bold text-slate-400">Library Empty! Save articles from Homepage feed.</p>
                      </div>
                    ) : (
                      myBookmarks.map((art) => (
                        <div key={art.id} className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:shadow transition-all flex justify-between gap-4 animate-fadeIn">
                          <div className="min-w-0">
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                              {art.category}
                            </span>
                            <h4 className="font-bold text-slate-800 text-xs mt-1.5 leading-snug">{art.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{art.content}</p>
                          </div>
                          <button 
                            onClick={() => handleRemoveBookmark(art.id)}
                            className="text-[#b80035] hover:bg-rose-50 p-2 rounded-xl material-symbols-outlined text-lg self-center shrink-0 cursor-pointer transition-colors"
                          >
                            delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SPONSORED OFFERS LIST TAB */}
              {adminTab === 'offers' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-xl">campaign</span>
                      <span>Exclusive Sponsored Offers & Deals</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Browse promotions and sponsored campaigns curated from our trusted partners.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 select-none">
                    {adsList.filter(ad => ad.image_url).length === 0 ? (
                      <div className="col-span-2 text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400">No campaigns active right now.</p>
                      </div>
                    ) : (
                      adsList.filter(ad => ad.image_url).map((ad) => (
                        <div key={ad.slot_id} className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between animate-fadeIn">
                          <div className="h-36 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                            <img src={ad.image_url} alt="Campaign ad" className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-black/65 text-white font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">
                              SPONSORED
                            </span>
                          </div>
                          <div className="p-4 flex items-center justify-between border-t border-slate-50 bg-slate-50/50">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-extrabold text-slate-700">{ad.slot_id}</span>
                              <span className="text-[8px] text-slate-400 font-medium">Exclusive Deal Link</span>
                            </div>
                            {ad.target_url ? (
                              <a 
                                href={ad.target_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-[#b80035] hover:bg-opacity-95 text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all"
                              >
                                <span>Visit Offer</span>
                                <span className="material-symbols-outlined text-[10px] font-black">arrow_forward</span>
                              </a>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-bold uppercase">No target URL</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
