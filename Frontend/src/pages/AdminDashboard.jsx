import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function AdminDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminTab, setAdminTab] = useState('overview');

  // Admin states
  const [pendingArticles, setPendingArticles] = useState([]);
  const [reportersList, setReportersList] = useState([]);
  const [adsList, setAdsList] = useState([]);

  // Ad edit state
  const [selectedAdSlot, setSelectedAdSlot] = useState('AD 1');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');

  // Blog draft state
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');

  // Load session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') {
        setCurrentUser(user);
      } else {
        // Clear if not admin
        localStorage.removeItem('ht_user');
      }
    }
  }, []);

  // Fetch admin stats and details
  useEffect(() => {
    if (currentUser) {
      fetchPendingArticles();
      fetchReporters();
      fetchAds();
    }
  }, [currentUser]);

  const fetchPendingArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch pending articles:', err);
    }
  };

  const fetchReporters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/admin/reporters`);
      if (res.ok) {
        const data = await res.json();
        setReportersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch reporters:', err);
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

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ht_user');
    setCurrentUser(null);
    setPendingArticles([]);
    setReportersList([]);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/articles/ads`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedAdSlot,
          image_url: adImageUrl,
          target_url: adTargetUrl
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update ad.');
      }

      setSuccessMsg(`Ad slot ${selectedAdSlot} updated successfully!`);
      fetchAds();
      if (onRefreshArticles) {
        onRefreshArticles();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Sync ad inputs on selection change
  useEffect(() => {
    if (adsList.length > 0) {
      const currentSlot = adsList.find(ad => ad.slot_id === selectedAdSlot);
      if (currentSlot) {
        setAdImageUrl(currentSlot.image_url || '');
        setAdTargetUrl(currentSlot.target_url || '');
      }
    }
  }, [selectedAdSlot, adsList]);

  const handleUpdateArticleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchPendingArticles();
        if (onRefreshArticles) {
          onRefreshArticles();
        }
      }
    } catch (err) {
      console.error('Failed to update article status:', err);
    }
  };

  const handleToggleReporterStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/articles/admin/reporters/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchReporters();
      }
    } catch (err) {
      console.error('Failed to toggle reporter status:', err);
    }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/articles/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle,
          content: blogContent,
          image_url: blogImageUrl,
          priority: 0
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to publish blog.');
      }

      setSuccessMsg('Blog post published successfully to the main feed!');
      setBlogTitle('');
      setBlogContent('');
      setBlogImageUrl('');
      if (onRefreshArticles) {
        onRefreshArticles();
      }
    } catch (err) {
      setErrorMsg(err.message);
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
          <span className="bg-rose-50 text-[#b80035] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
            Maalik Panel
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
              ADMIN LOGIN FORM
              ========================================== */
          <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] my-auto">
            {/* Left Showcase Banner */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#121314] via-[#242629] to-[#0f1011] p-12 flex-col justify-between text-white relative">
              <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-[#b80035]/15 blur-3xl"></div>
              <div className="flex flex-col gap-1 z-10 select-none">
                <span className="font-serif font-black text-2xl italic tracking-tight text-white leading-none">Haldwani Times</span>
                <span className="text-[9px] font-sans tracking-[0.25em] text-[#9ca3af] font-semibold mt-1">ADMINISTRATOR DESK</span>
              </div>
              <div className="flex flex-col gap-4 my-auto z-10">
                <div className="h-0.5 w-12 bg-[#b80035]"></div>
                <blockquote className="font-serif text-lg italic leading-relaxed text-[#f3f4f6]">
                  "With great power comes absolute editorial oversight."
                </blockquote>
              </div>
              <div className="text-[10px] text-slate-400 select-none">© Haldwani Times Admin Portal. Unauthorized Access Prohibited.</div>
            </div>

            {/* Right Login Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Maalik Access Portal</h3>
                <p className="text-xs text-[#b80035]/70 mt-1 uppercase tracking-wider font-extrabold select-none">Enter admin credentials</p>
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mt-3 text-xs font-bold text-emerald-600 text-center select-none">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-5 mt-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600 select-none">Admin Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. admin@haldwanitimes.com"
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
                  <span>Authenticate Portal</span>
                  <span className="material-symbols-outlined text-sm font-bold">security</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ==========================================
              ADMIN DASHBOARD WORKSPACE
              ========================================== */
          <>
            {/* Sidebar Controls */}
            <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 border border-slate-200/60 rounded-3xl bg-white flex flex-col justify-between p-5 select-none shadow-sm">
              <div className="flex flex-col gap-6">
                
                {/* Profile Widget */}
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#b80035] flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                    AD
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate leading-tight">{currentUser.username}</h4>
                    <span className="text-[9px] text-[#b80035] font-black uppercase tracking-wider mt-0.5 block">SYSTEM MAALIK</span>
                  </div>
                </div>

                {/* Vertical menu navigation */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-4 mb-3">ADMINISTRATION</span>
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
                      <span>Overview</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('pending')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'pending' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">rate_review</span>
                      <span>Submissions</span>
                      {pendingArticles.length > 0 && (
                        <span className="ml-auto bg-[#b80035] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                          {pendingArticles.length}
                        </span>
                      )}
                    </button>

                    <button 
                      onClick={() => setAdminTab('reporters')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'reporters' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">group</span>
                      <span>Manage Reporters</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('ads')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'ads' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">campaign</span>
                      <span>Manage Ads</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('blog')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'blog' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">post_add</span>
                      <span>Write Blog</span>
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
                  <span>Sign out Panel</span>
                </button>
              </div>
            </div>

            {/* Right main canvas */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm overflow-y-auto no-scrollbar max-h-[750px]">
              
              {/* OVERVIEW TAB */}
              {adminTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Stats banner */}
                  <div className="bg-gradient-to-br from-[#121314] via-[#242629] to-[#0f1011] text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none animate-fadeIn">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">COMMAND CENTER</span>
                      <h3 className="text-xl font-black mt-1">Hello, Chief Editor maalik!</h3>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">{reportersList.length}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">Reporters</span>
                      </div>
                      <div className="w-px h-10 bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">{pendingArticles.length}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">Pending</span>
                      </div>
                      <div className="w-px h-10 bg-slate-700"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">{adsList.filter(a => a.image_url).length}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-1">Active Ads</span>
                      </div>
                    </div>
                  </div>

                  {/* LuxeGlobal Stats Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 select-none animate-fadeIn">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Registered Reporters</span>
                        <span className="text-[#920028] bg-[#ffdada]/60 p-2 rounded-xl material-symbols-outlined font-bold text-xl">group</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{reportersList.length}</h2>
                        <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm font-black">check</span> Active Editorial Desk
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Pending Submissions</span>
                        <span className="text-amber-700 bg-amber-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">rate_review</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{pendingArticles.length}</h2>
                        <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${pendingArticles.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          <span className="material-symbols-outlined text-sm font-black">
                            {pendingArticles.length > 0 ? 'warning' : 'check_circle'}
                          </span>
                          {pendingArticles.length > 0 ? 'Awaiting Editor Review' : 'Queue Clean'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Active Campaigns</span>
                        <span className="text-emerald-700 bg-emerald-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">campaign</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{adsList.filter(a => a.image_url).length} / 7</h2>
                        <p className="text-[11px] font-bold text-[#0051d5] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm font-black">trending_up</span> Live placements
                        </p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Oversight Status</span>
                        <span className="text-[#0051d5] bg-blue-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">security</span>
                      </div>
                      <div className="mt-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">100%</h2>
                        <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm font-black">check</span> Console Safe
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick lists layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                    {/* Submissions */}
                    <div className="border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center select-none">
                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-lg">rate_review</span>
                          <span>Recent Submissions</span>
                        </h4>
                        <button onClick={() => setAdminTab('pending')} className="text-[11px] text-blue-600 font-bold hover:underline">View all</button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {pendingArticles.slice(0, 3).length === 0 ? (
                          <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-xs">No pending stories.</div>
                        ) : (
                          pendingArticles.slice(0, 3).map(art => (
                            <div key={art.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 animate-fadeIn">
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-800 text-xs truncate">{art.title}</h5>
                                <span className="text-[9px] text-slate-400 block mt-0.5">By {art.author_name} • {art.category} • Priority: {art.priority || 0}</span>
                              </div>
                              <button onClick={() => setAdminTab('pending')} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-lg shrink-0">arrow_forward</button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Ads Placements status */}
                    <div className="border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm">
                      <div className="flex justify-between items-center select-none">
                        <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-600 text-lg">campaign</span>
                          <span>Ad Placements Status</span>
                        </h4>
                        <button onClick={() => setAdminTab('ads')} className="text-[11px] text-blue-600 font-bold hover:underline">Manage Ads</button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {['AD 1', 'AD 2', 'AD 3', 'AD 4', 'AD 5', 'AD 6', 'AD 7'].map(slot => {
                          const adObj = adsList.find(a => a.slot_id === slot);
                          const isActive = adObj && adObj.image_url;
                          return (
                            <div key={slot} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700">{slot}</span>
                                <span className="text-[8px] text-slate-400 mt-0.5">
                                  {slot === 'AD 3' ? '300x250' : slot === 'AD 5' ? '300x600' : '728x90'}
                                </span>
                              </div>
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PENDING SUBMISSIONS TAB */}
              {adminTab === 'pending' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 select-none">
                      <span className="material-symbols-outlined text-[#b80035] text-xl">rate_review</span>
                      <span>Pending Reviews</span>
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {pendingArticles.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 select-none">
                        <p className="text-sm font-bold text-slate-500">Inbox Clean! No drafts pending review.</p>
                      </div>
                    ) : (
                      pendingArticles.map((art) => (
                        <div key={art.id} className="p-5 border border-slate-150 rounded-2xl bg-white shadow-sm flex flex-col md:flex-row gap-5 animate-fadeIn">
                          {art.image_url && (
                            <img src={art.image_url} alt="Cover" className="w-full md:w-44 h-28 object-cover rounded-xl bg-slate-100 shrink-0" />
                          )}
                          <div className="flex-1 flex flex-col gap-2 justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap text-xs select-none">
                                <span className="text-[9px] bg-rose-50 text-[#b80035] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{art.type}</span>
                                <span className="text-slate-400 font-bold">Category: <span className="text-slate-700">{art.category}</span></span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400">Priority: <strong className="text-[#b80035] font-extrabold">{art.priority || 0}</strong></span>
                                <span className="text-slate-300">|</span>
                                <span className="text-slate-400">Author: <strong className="text-slate-700">{art.author_name}</strong></span>
                              </div>
                              <h4 className="text-base font-extrabold text-slate-800 mt-2 leading-snug">{art.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">{art.content}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-4 border-t border-slate-100 pt-3 select-none">
                              <button 
                                onClick={() => handleUpdateArticleStatus(art.id, 'published')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                                Approve & Publish
                              </button>
                              <button 
                                onClick={() => handleUpdateArticleStatus(art.id, 'rejected')}
                                className="bg-[#b80035] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* REPORTERS MANAGEMENT TAB */}
              {adminTab === 'reporters' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b80035] text-xl">group</span>
                      <span>Registered Editorial Reporters</span>
                    </h3>
                  </div>

                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse bg-white">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                          <th className="p-4">Reporter Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Joined Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportersList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-xs font-bold text-slate-400 select-none">No reporters registered.</td>
                          </tr>
                        ) : (
                          reportersList.map(rep => (
                            <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all text-xs">
                              <td className="p-4 font-bold text-slate-800">{rep.username}</td>
                              <td className="p-4 text-slate-500 font-medium">{rep.email}</td>
                              <td className="p-4 text-slate-500 font-medium">{new Date(rep.created_at).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`text-[8px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${rep.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                  {rep.status}
                                </span>
                              </td>
                              <td className="p-4 text-right select-none">
                                <button 
                                  onClick={() => handleToggleReporterStatus(rep.id, rep.status)}
                                  className={`font-bold text-[10px] uppercase py-1.5 px-3.5 rounded-xl border transition-all cursor-pointer ${rep.status === 'active' ? 'border-[#b80035] text-[#b80035] hover:bg-rose-50/30' : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'}`}
                                >
                                  {rep.status === 'active' ? 'Block' : 'Unblock'}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ADS MANAGEMENT TAB */}
              {adminTab === 'ads' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#b80035] text-xl">campaign</span>
                      <span>Ads Campaign Management Desk</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Select an active slot, enter the banner image URL, and landing page URL to update ads instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    <form onSubmit={handleUpdateAd} className="lg:col-span-3 bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 select-none">Ad Placement Slot</label>
                        <select 
                          value={selectedAdSlot}
                          onChange={(e) => setSelectedAdSlot(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white font-bold transition-all cursor-pointer"
                        >
                          <option value="AD 1">AD 1 - 728x90 Leaderboard Ad (Top Banner)</option>
                          <option value="AD 2">AD 2 - 728x90 Horizontal Ad (Below Header)</option>
                          <option value="AD 3">AD 3 - 300x250 Medium Rectangle (Main Sidebar)</option>
                          <option value="AD 4">AD 4 - 728x90 Horizontal Banner (Mid-Page)</option>
                          <option value="AD 5">AD 5 - 300x600 Half Page Ad (News Sidebar)</option>
                          <option value="AD 6">AD 6 - 728x90 Horizontal Banner (Pre-Footer)</option>
                          <option value="AD 7">AD 7 - 728x90 Horizontal Banner (Last Ad)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 select-none">Ad Banner Image URL</label>
                        <input 
                          type="url" 
                          required
                          value={adImageUrl}
                          onChange={(e) => setAdImageUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or paste image link"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 select-none">Target Destination Link (URL)</label>
                        <input 
                          type="url" 
                          value={adTargetUrl}
                          onChange={(e) => setAdTargetUrl(e.target.value)}
                          placeholder="e.g. https://mysponsor.com/promo"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white transition-all"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all self-start cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">publish</span>
                        Publish Campaign
                      </button>
                    </form>

                    <div className="lg:col-span-2 flex flex-col gap-4 select-none">
                      <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider px-1">Live Preview</h4>
                      <div className="border border-slate-150 rounded-3xl p-5 bg-white shadow-sm flex flex-col items-center gap-4">
                        <div className="flex justify-between items-center w-full pb-2 border-b border-slate-100 text-xs">
                          <span className="font-extrabold text-slate-800">{selectedAdSlot}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">
                            {selectedAdSlot === 'AD 3' ? '300x250' : selectedAdSlot === 'AD 5' ? '300x600' : '728x90'}
                          </span>
                        </div>
                        {adImageUrl ? (
                          <div className="relative w-full overflow-hidden rounded-xl border border-slate-100 flex items-center justify-center bg-slate-50"
                               style={{ height: selectedAdSlot === 'AD 3' ? '180px' : selectedAdSlot === 'AD 5' ? '320px' : '90px' }}>
                            <img src={adImageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-full bg-red-50/20 border border-dashed border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center"
                               style={{ height: selectedAdSlot === 'AD 3' ? '180px' : selectedAdSlot === 'AD 5' ? '320px' : '90px' }}>
                            <span className="material-symbols-outlined text-slate-400 text-2xl">campaign</span>
                            <span className="text-[10px] font-bold text-slate-700 mt-1">No Image Uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WRITE BLOG TAB */}
              {adminTab === 'blog' && (
                <form onSubmit={handlePostBlog} className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 flex flex-col gap-5 animate-fadeIn">
                  <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Publish Blog Story</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 select-none">Blog Title</label>
                    <input 
                      type="text" 
                      required
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      placeholder="e.g. Sustainable Tourism in Uttarakhand: The Path Forward..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 select-none">Cover Image URL</label>
                    <input 
                      type="url" 
                      value={blogImageUrl}
                      onChange={(e) => setBlogImageUrl(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600 select-none">Blog Narrative</label>
                    <textarea 
                      rows="6"
                      required
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      placeholder="Narrate your column details..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-[#b80035] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all self-start cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">send</span>
                    Publish Blog
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
