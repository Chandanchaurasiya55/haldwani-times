import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000';

function Dashboard({ onClose, onRefreshArticles }) {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ht_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [registerRole, setRegisterRole] = useState('user'); // 'user' or 'reporter'
  
  // Auth Form Inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reporter State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Uttarakhand');
  const [newType, setNewType] = useState('local');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [myArticles, setMyArticles] = useState([]);

  // Admin State
  const [pendingArticles, setPendingArticles] = useState([]);
  const [reportersList, setReportersList] = useState([]);
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'pending', 'reporters', 'ads', or 'blog'
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');

  // Ads management state
  const [adsList, setAdsList] = useState([]);
  const [selectedAdSlot, setSelectedAdSlot] = useState('AD 1');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');

  // General User State
  const [myBookmarks, setMyBookmarks] = useState([]);

  // Load contextual data based on logged-in role
  useEffect(() => {
    if (currentUser) {
      setAdminTab('overview');
      if (currentUser.role === 'reporter') {
        fetchMyArticles();
      } else if (currentUser.role === 'admin') {
        fetchPendingArticles();
        fetchReporters();
        fetchAds();
      } else if (currentUser.role === 'user') {
        fetchMyBookmarks();
        fetchAds();
      }
    }
  }, [currentUser]);

  // ==========================================
  // API INTERACTIONS
  // ==========================================

  const fetchMyArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/my-submissions/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch reporter submissions:', err);
    }
  };

  const fetchPendingArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/pending`);
      if (res.ok) {
        const data = await res.json();
        setPendingArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch pending reviews:', err);
    }
  };

  const fetchReporters = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/admin/reporters`);
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
      const res = await fetch(`${API_BASE_URL}/api/articles/ads`);
      if (res.ok) {
        const data = await res.json();
        setAdsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch ads:', err);
    }
  };

  const handleUpdateAd = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/ads`, {
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

  const fetchMyBookmarks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/bookmarks/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyBookmarks(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
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

      // If logged in as general reader or reporter, close dashboard modal to view homepage.
      // If admin, stay on dashboard.
      if (data.user.role !== 'admin' && onClose) {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const endpoint = registerRole === 'reporter' ? 'register/reporter' : 'register/user';

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      // Log in automatically
      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      
      setUsername('');
      setEmail('');
      setPassword('');

      // Navigate back to home page
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ht_user');
    setCurrentUser(null);
    setMyArticles([]);
    setPendingArticles([]);
    setReportersList([]);
    setMyBookmarks([]);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handlePostArticle = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          type: newType,
          image_url: newImageUrl,
          author_id: currentUser.id
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit article.');
      }

      setSuccessMsg('Article submitted successfully for Admin approval!');
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      fetchMyArticles();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogTitle,
          content: blogContent,
          image_url: blogImageUrl
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

  const handleUpdateArticleStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchPendingArticles();
      }
    } catch (err) {
      console.error('Failed to update article status:', err);
    }
  };

  const handleToggleReporterStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/admin/reporters/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchReporters();
      }
    } catch (err) {
      console.error('Failed to toggle reporter block status:', err);
    }
  };

  const handleRemoveBookmark = async (articleId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/articles/unbookmark`, {
        method: 'POST',
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
    <div className="w-full min-h-[85vh] flex items-center justify-center bg-[#f3f4f6] pt-[180px] pb-16 px-4 md:px-8 select-none">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[650px] relative">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-primary transition-all material-symbols-outlined font-black text-2xl z-20 bg-white/80 backdrop-blur rounded-full p-1"
          >
            close
          </button>
        )}

        {/* ==========================================
            UNAUTHENTICATED PANEL: SPLIT DESIGN
            ========================================== */}
        {!currentUser ? (
          <>
            {/* Left Column: Dark Editorial Brand Showcase */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1c1d1f] via-[#2f3135] to-[#121314] p-12 flex-col justify-between text-white relative">
              {/* Subtle visual lighting accents */}
              <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-primary/10 blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-secondary/10 blur-3xl"></div>

              <div className="flex flex-col gap-1 z-10">
                <span className="font-serif font-black text-3xl italic tracking-tight text-white leading-none">
                  Haldwani Times
                </span>
                <span className="text-[9px] font-sans tracking-[0.25em] text-[#9ca3af] font-semibold mt-1">
                  PREMIUM NEWS CONSOLE
                </span>
              </div>

              <div className="flex flex-col gap-6 my-auto z-10">
                <div className="h-0.5 w-12 bg-primary"></div>
                <blockquote className="font-serif text-xl md:text-2xl italic leading-relaxed text-[#f3f4f6]">
                  "Journalism is printing what someone else does not want printed; everything else is public relations."
                </blockquote>
                <cite className="text-xs font-bold uppercase tracking-wider text-slate-400 not-italic -mt-2">
                  — George Orwell
                </cite>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-slate-300 z-10">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  <span>Independent Local Journalism Reviews</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  <span>Real-time Editorial Feeds & Alerts</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-lg">security</span>
                  <span>Role-restricted Submissions Oversight</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Form Area */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              {/* Form Mode Tabs */}
              <div className="flex border-b border-slate-100 mb-8 select-none">
                <button 
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-4 text-center font-bold text-sm transition-all relative ${authMode === 'login' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span>Sign In</span>
                  {authMode === 'login' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-4 text-center font-bold text-sm transition-all relative ${authMode === 'register' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span>Sign Up</span>
                  {authMode === 'register' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
              </div>

              {/* Status Alert Banners */}
              {errorMsg && (
                <div className="mb-6 p-4 bg-primary-container text-primary rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-6 p-4 bg-secondary-container text-secondary rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Login Block */}
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back</h3>
                    <p className="text-xs text-slate-400 mt-1">Access your news stream or review editorial drafts.</p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2 tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>Log In</span>
                    <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                  </button>
                </form>
              ) : (
                /* Registration Block */
                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Create Account</h3>
                    <p className="text-xs text-slate-400 mt-1">Join the Haldwani Times editorial community.</p>
                  </div>

                  {/* Role Selection Tabs */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setRegisterRole('user')}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${registerRole === 'user' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      General Reader
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRegisterRole('reporter')}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${registerRole === 'reporter' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      News Reporter
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      placeholder="Choose username"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter email address"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create security password"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2 tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <span>Create Account</span>
                    <span className="material-symbols-outlined text-sm font-bold">person_add</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          /* ==========================================
              AUTHENTICATED DASHBOARDS (LOGGED-IN SIDEBAR LAYOUT)
              ========================================== */
          <>
            {/* Left Sidebar */}
            <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 border-r border-slate-100 bg-[#f8fafc] flex flex-col justify-between p-5 select-none">
              
              {/* Top Section */}
              <div className="flex flex-col gap-6">
                
                {/* Profile Card */}
                <div className="flex items-center gap-3.5 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm uppercase shadow-sm shrink-0">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate leading-tight">{currentUser.username}</h4>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 border border-blue-100/50 px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                  {/* Vertical Navigation Menu */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-4 mb-3">
                    ADMINISTRATION
                  </span>
                  
                  <nav className="flex flex-col gap-1">
                    
                    {/* Universal Tab: Overview */}
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

                    {/* Admin Specific Tabs */}
                    {currentUser.role === 'admin' && (
                      <>
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
                            <span className="ml-auto bg-primary text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
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
                          <span>Reporters</span>
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
                      </>
                    )}

                    {/* Reporter Specific Tabs */}
                    {currentUser.role === 'reporter' && (
                      <>
                        <button 
                          onClick={() => setAdminTab('submit')}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                            adminTab === 'submit' 
                              ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                              : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">edit_note</span>
                          <span>Draft Story</span>
                        </button>

                        <button 
                          onClick={() => setAdminTab('history')}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                            adminTab === 'history' 
                              ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                              : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">history</span>
                          <span>My Submissions</span>
                        </button>
                      </>
                    )}

                    {/* Reader (General User) Specific Tabs */}
                    {currentUser.role === 'user' && (
                      <>
                        <button 
                          onClick={() => setAdminTab('bookmarks')}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                            adminTab === 'bookmarks' 
                              ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                              : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">bookmark</span>
                          <span>My Library</span>
                        </button>

                        <button 
                          onClick={() => setAdminTab('sponsored_ads')}
                          className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                            adminTab === 'sponsored_ads' 
                              ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                              : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">campaign</span>
                          <span>Sponsored Offers</span>
                        </button>
                      </>
                    )}

                  </nav>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 border-transparent text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <span className="material-symbols-outlined text-lg font-bold">logout</span>
                  <span>Sign out</span>
                </button>
              </div>

            </div>

            {/* Right Main Content Area */}
            <div className="flex-1 bg-white p-6 md:p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto no-scrollbar max-h-[750px]">
              
              {/* Success/Error Alerts */}
              {successMsg && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shrink-0">
                  <span className="material-symbols-outlined text-lg">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ==========================================
                  ROLE-BASED VIEW RENDERING
                  ========================================== */}
              
              {/* ==========================
                  1. ADMIN VIEWS
                  ========================== */}
              {currentUser.role === 'admin' && (
                <>
                  {/* Overview Tab */}
                  {adminTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Jumbotron Banner */}
                      <div className="bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex flex-col z-10">
                          <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">GOOD MORNING 👋</span>
                          <h3 className="text-xl md:text-2xl font-black mt-1 tracking-tight">{currentUser.username}'s Command Center</h3>
                          <span className="text-xs text-indigo-200 mt-2 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex gap-6 z-10">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{reportersList.length}</span>
                            <span className="text-[9px] uppercase font-bold text-indigo-300 tracking-wider mt-1">Reporters</span>
                          </div>
                          <div className="w-px h-10 bg-indigo-500/50"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{pendingArticles.length}</span>
                            <span className="text-[9px] uppercase font-bold text-indigo-300 tracking-wider mt-1">Pending</span>
                          </div>
                          <div className="w-px h-10 bg-indigo-500/50"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{adsList.filter(a => a.image_url).length}</span>
                            <span className="text-[9px] uppercase font-bold text-indigo-300 tracking-wider mt-1">Active Ads</span>
                          </div>
                        </div>
                      </div>

                      {/* Stat Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 select-none">
                        
                        {/* Reporters Card */}
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

                        {/* Pending Submissions Card */}
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
                              {pendingArticles.length > 0 ? 'Awaiting Editorial Approval' : 'Submissions Queue Empty'}
                            </p>
                          </div>
                        </div>

                        {/* Active Ads Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Active Campaigns</span>
                            <span className="text-emerald-700 bg-emerald-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">campaign</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{adsList.filter(a => a.image_url).length} / 7</h2>
                            <p className="text-[11px] font-bold text-[#0051d5] mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm font-black">trending_up</span> Live Ad Placements
                            </p>
                          </div>
                        </div>

                        {/* Console Oversight Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Oversight Status</span>
                            <span className="text-[#0051d5] bg-blue-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">security</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">100%</h2>
                            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm font-black">check</span> System Online & Safe
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Lower Grid Row: Pending List and Ads Preview */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
                        
                        {/* Pending Submissions Quick Look */}
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
                                <div key={art.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 hover:bg-slate-100/50 transition-colors">
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-slate-800 text-xs truncate leading-snug">{art.title}</h5>
                                    <span className="text-[9px] text-slate-400 font-medium block mt-0.5">By {art.author_name} • {art.category}</span>
                                  </div>
                                  <button onClick={() => setAdminTab('pending')} className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors text-lg shrink-0">arrow_forward</button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Ads Placements Status Quick Look */}
                        <div className="border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center select-none">
                            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-emerald-600 text-lg">campaign</span>
                              <span>Ad Placements Status</span>
                            </h4>
                            <button onClick={() => setAdminTab('ads')} className="text-[11px] text-blue-600 font-bold hover:underline">Manage Ads</button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3.5">
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
                                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} 
                                        title={isActive ? 'Active Ad Campaign Live' : 'Placeholder Empty'} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* Submissions Pending Review Tab */}
                  {adminTab === 'pending' && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 select-none">
                          <span className="material-symbols-outlined text-primary text-xl">rate_review</span>
                          <span>Editorial Submissions Pending Review</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 select-none">Review drafts filed by contributors. Approve to publish immediately onto the public site feed, or Reject.</p>
                      </div>

                      <div className="flex flex-col gap-5">
                        {pendingArticles.length === 0 ? (
                          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center select-none">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">check_circle</span>
                            <p className="text-sm font-bold text-slate-500">Inbox Clean! No articles pending review.</p>
                          </div>
                        ) : (
                          pendingArticles.map((art) => (
                            <div key={art.id} className="p-5 border border-slate-150 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5">
                              {art.image_url && (
                                <img src={art.image_url} alt="Cover" className="w-full md:w-44 h-28 object-cover rounded-xl bg-slate-100 shrink-0" />
                              )}
                              <div className="flex-1 flex flex-col gap-2 justify-between">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap text-xs select-none">
                                    <span className="text-[9px] bg-primary-container text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">{art.type}</span>
                                    <span className="text-slate-400 font-bold">Category: <span className="text-slate-700">{art.category}</span></span>
                                    <span className="text-slate-200">|</span>
                                    <span className="text-slate-400">Author: <strong className="text-slate-700">{art.author_name}</strong></span>
                                  </div>
                                  <h4 className="text-base font-extrabold text-slate-800 mt-2 leading-snug">{art.title}</h4>
                                  <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">{art.content}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-4 border-t border-slate-100 pt-3 select-none">
                                  <button 
                                    onClick={() => handleUpdateArticleStatus(art.id, 'published')}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm hover:shadow transition-all"
                                  >
                                    <span className="material-symbols-outlined text-base">check</span>
                                    Approve & Publish
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateArticleStatus(art.id, 'rejected')}
                                    className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm hover:shadow transition-all"
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

                  {/* Manage Reporters Tab */}
                  {adminTab === 'reporters' && (
                    <div className="flex flex-col gap-6">
                      <div className="select-none">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">group</span>
                          <span>Registered Editorial Reporters</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Review active staff writers. Block writers to restrict them from filing new drafts.</p>
                      </div>

                      <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse bg-white">
                            <thead>
                              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                                <th className="p-4">Reporter Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Date Joined</th>
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
                                reportersList.map((rep) => (
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
                                        className={`font-bold text-[10px] uppercase py-1.5 px-3.5 rounded-xl border transition-all ${rep.status === 'active' ? 'border-primary text-primary hover:bg-rose-50/30' : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'}`}
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
                    </div>
                  )}

                  {/* NEW: Manage Ads Tab */}
                  {adminTab === 'ads' && (
                    <div className="flex flex-col gap-6">
                      <div className="select-none">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-xl">campaign</span>
                          <span>Ads Campaign Management Desk</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Select an active ad slot to update its image asset URL and target landing link. Changes appear instantly on the home feed.</p>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
                        
                        {/* Ad Editing Form */}
                        <form onSubmit={handleUpdateAd} className="xl:col-span-3 bg-slate-50/50 border border-slate-200/60 rounded-3xl p-6 flex flex-col gap-5">
                          
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 select-none">Ad Placement Slot</label>
                             <select 
                              value={selectedAdSlot}
                              onChange={(e) => setSelectedAdSlot(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white font-bold transition-all cursor-pointer"
                            >
                              <option value="AD 1">AD 1 - 728x90 Leaderboard Ad (Top Banner)</option>
                              <option value="AD 2">AD 2 - 728x90 Horizontal Ad (Below Header)</option>
                              <option value="AD 3">AD 3 - 300x250 Medium Rectangle (Main Sidebar)</option>
                              <option value="AD 4">AD 4 - 728x90 Horizontal Banner (Mid-Page)</option>
                              <option value="AD 5">AD 5 - 300x600 Half Page Ad (News Sidebar)</option>
                              <option value="AD 6">AD 6 - 728x90 Horizontal Banner (Pre-Footer)</option>
                              <option value="AD 7">AD 7 - 728x90 Horizontal Banner (Last Ad)</option>
                              <option value="AD_DETAIL">AD_DETAIL - 1200x160 In-Article Banner (Detail Page)</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 select-none">Ad Banner Image URL</label>
                            <input 
                              type="url" 
                              required
                              value={adImageUrl}
                              onChange={(e) => setAdImageUrl(e.target.value)}
                              placeholder="e.g. https://images.unsplash.com/... or paste direct image link"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all"
                            />
                            <span className="text-[10px] text-slate-400 select-none mt-0.5">Please ensure it is a valid direct link containing JPEG, PNG, or GIF.</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 select-none">Target Destination Link (URL)</label>
                            <input 
                              type="url" 
                              value={adTargetUrl}
                              onChange={(e) => setAdTargetUrl(e.target.value)}
                              placeholder="e.g. https://mysponsor.com/promo"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all"
                            />
                          </div>

                          <button 
                            type="submit" 
                            className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mt-2 self-start tracking-wider"
                          >
                            <span className="material-symbols-outlined text-base">publish</span>
                            Publish Campaign
                          </button>

                        </form>

                        {/* Live Preview Pane */}
                        <div className="xl:col-span-2 flex flex-col gap-4 select-none">
                          <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider px-1">Live Placement Preview</h4>
                          
                          <div className="border border-slate-150 rounded-3xl p-5 bg-white shadow-sm flex flex-col items-center gap-4">
                            <div className="flex justify-between items-center w-full pb-2.5 border-b border-slate-100 text-xs">
                              <span className="font-extrabold text-slate-800">{selectedAdSlot}</span>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">
                                {selectedAdSlot === 'AD 3' ? '300x250' : selectedAdSlot === 'AD 5' ? '300x600' : '728x90'}
                              </span>
                            </div>

                            {adImageUrl ? (
                              <div className="relative w-full overflow-hidden rounded-xl border border-slate-100 flex items-center justify-center bg-slate-50"
                                   style={{ 
                                     height: selectedAdSlot === 'AD 3' ? '180px' : selectedAdSlot === 'AD 5' ? '320px' : '90px' 
                                   }}>
                                <img src={adImageUrl} alt="Ad Preview" className="w-full h-full object-contain" />
                                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-sm text-[8px] text-white font-black px-1.5 py-0.5 rounded tracking-wide uppercase">Preview</span>
                              </div>
                            ) : (
                              <div className="w-full bg-red-50/20 border border-dashed border-red-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center"
                                   style={{ 
                                     height: selectedAdSlot === 'AD 3' ? '180px' : selectedAdSlot === 'AD 5' ? '320px' : '90px' 
                                   }}>
                                <span className="material-symbols-outlined text-red-400 text-2xl">campaign</span>
                                <div className="text-[10px] font-bold text-slate-700">No Image Uploaded</div>
                                <div className="text-[8px] text-slate-400 max-w-[80%]">Placeholder values will display on the frontend main stream.</div>
                              </div>
                            )}

                            <div className="text-left w-full text-[10px] text-slate-400 flex flex-col gap-1 mt-1 leading-normal">
                              <span>• Target: <strong className="text-slate-600 truncate block max-w-full">{adTargetUrl || 'None (no click link)'}</strong></span>
                              <span>• Placement: <strong className="text-slate-600">Haldwani Times Stream</strong></span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Write Blog Tab */}
                  {adminTab === 'blog' && (
                    <div className="bg-slate-50/60 border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                      <div className="select-none">
                        <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#b80035] text-2xl">post_add</span>
                          <span>Write Blog Post</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Directly publish editorial opinion articles, essays, and stories onto the blog category of Haldwani Times.</p>
                      </div>

                      <form onSubmit={handlePostBlog} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Blog Title</label>
                          <input 
                            type="text" 
                            value={blogTitle}
                            onChange={(e) => setBlogTitle(e.target.value)}
                            required
                            placeholder="e.g. Navigating Haldwani's Urban Shift: A Kumaoni Perspective..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Cover Image URL (Optional)</label>
                          <input 
                            type="url" 
                            value={blogImageUrl}
                            onChange={(e) => setBlogImageUrl(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/... or leave blank"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Blog Content</label>
                          <textarea 
                            rows="8"
                            value={blogContent}
                            onChange={(e) => setBlogContent(e.target.value)}
                            required
                            placeholder="Draft your editorial blog article here..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-white"
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="bg-[#b80035] hover:bg-[#b80035]/90 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 tracking-wider flex items-center justify-center gap-1.5 self-start px-8"
                        >
                          <span className="material-symbols-outlined text-base">send</span>
                          <span>Publish Blog Post</span>
                        </button>
                      </form>
                    </div>
                  )}
                </>
              )}

              {/* ==========================
                  2. REPORTER VIEWS
                  ========================== */}
              {currentUser.role === 'reporter' && (
                <>
                  {/* Overview Tab */}
                  {adminTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Jumbotron Banner */}
                      <div className="bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#1e3a8a] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex flex-col z-10">
                          <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">GOOD MORNING 👋</span>
                          <h3 className="text-xl md:text-2xl font-black mt-1 tracking-tight">{currentUser.username}'s Reporter Desk</h3>
                          <span className="text-xs text-blue-100 mt-2 font-medium">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex gap-6 z-10">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{myArticles.length}</span>
                            <span className="text-[9px] uppercase font-bold text-blue-200 tracking-wider mt-1">My Filed Drafts</span>
                          </div>
                          <div className="w-px h-10 bg-blue-500/50"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{myArticles.filter(a => a.status === 'published').length}</span>
                            <span className="text-[9px] uppercase font-bold text-blue-200 tracking-wider mt-1">Approved</span>
                          </div>
                          <div className="w-px h-10 bg-blue-500/50"></div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">{myArticles.filter(a => a.status === 'pending').length}</span>
                            <span className="text-[9px] uppercase font-bold text-blue-200 tracking-wider mt-1">In Review</span>
                          </div>
                        </div>
                      </div>

                      {/* Stat Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                        
                        {/* Drafts Filed */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Drafts Filed</span>
                            <span className="text-[#920028] bg-[#ffdada]/60 p-2 rounded-xl material-symbols-outlined font-bold text-xl">edit_document</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myArticles.length} <span className="text-sm font-normal text-slate-400">Stories</span></h2>
                            <p className="text-[11px] font-bold text-[#0051d5] mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">history</span> Total filings submitted
                            </p>
                          </div>
                        </div>

                        {/* Approved & Live */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Approved & Live</span>
                            <span className="text-[#0051d5] bg-blue-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">verified</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myArticles.filter(a => a.status === 'published').length} <span className="text-sm font-normal text-slate-400">Articles</span></h2>
                            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm font-black">check_circle</span> Live on public feed
                            </p>
                          </div>
                        </div>

                        {/* In Review */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">Awaiting Review</span>
                            <span className="text-amber-700 bg-amber-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">pending_actions</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myArticles.filter(a => a.status === 'pending').length} <span className="text-sm font-normal text-slate-400">Drafts</span></h2>
                            <p className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${myArticles.filter(a => a.status === 'pending').length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                              <span className="material-symbols-outlined text-sm font-bold">schedule</span>
                              {myArticles.filter(a => a.status === 'pending').length > 0 ? 'Awaiting Editor decision' : 'No drafts pending'}
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Lower Grid Row */}
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        
                        {/* Recent Stories */}
                        <div className="border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm">
                          <div className="flex justify-between items-center select-none">
                            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-lg">history</span>
                              <span>Recent Story Submissions</span>
                            </h4>
                            <button onClick={() => setAdminTab('history')} className="text-[11px] text-blue-600 font-bold hover:underline">View all</button>
                          </div>
                          
                          <div className="flex flex-col gap-3">
                            {myArticles.slice(0, 3).length === 0 ? (
                              <div className="text-center py-6 bg-slate-50 rounded-xl text-slate-400 text-xs">No filed stories.</div>
                            ) : (
                              myArticles.slice(0, 3).map(art => (
                                <div key={art.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4">
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-slate-800 text-xs truncate">{art.title}</h5>
                                    <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(art.created_at).toLocaleDateString()} • {art.category}</span>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                    art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : art.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>{art.status}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Writer Guidelines */}
                        <div className="border border-slate-150 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-sm select-none">
                          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-lg">rule</span>
                            <span>Editorial Reporter Rules</span>
                          </h4>
                          
                          <div className="flex flex-col gap-2.5 text-xs text-slate-500 leading-normal font-medium">
                            <div className="flex gap-2.5 items-start">
                              <span className="text-primary font-bold">1.</span>
                              <span>Always check and verify your references and local sources prior to filing draft releases.</span>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <span className="text-primary font-bold">2.</span>
                              <span>Avoid adding subjective opinion content to Local or National segments; keep opinion articles confined to the <strong>Blog</strong> category.</span>
                            </div>
                            <div className="flex gap-2.5 items-start">
                              <span className="text-primary font-bold">3.</span>
                              <span>Use high-quality Unsplash image URLs to ensure the article layout renders beautifully.</span>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                  {/* Draft Story Form Tab */}
                  {adminTab === 'submit' && (
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2 select-none">
                        <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                        <span>Draft & File Editorial Story</span>
                      </h3>

                      <form onSubmit={handlePostArticle} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Headline Title</label>
                          <input 
                            type="text" 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            placeholder="e.g. Local Markets Flourish: Haldwani Traders Report Steady Sales..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 select-none">Editorial Category</label>
                            <select 
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all cursor-pointer font-bold"
                            >
                              <option value="Uttarakhand">Uttarakhand</option>
                              <option value="India">India</option>
                              <option value="Education">Education</option>
                              <option value="Politics">Politics</option>
                              <option value="Top Stories">Top Stories</option>
                              <option value="Food">Food</option>
                              <option value="Business">Business</option>
                              <option value="Celebrity">Celebrity</option>
                              <option value="Hindi News">Hindi News</option>
                              <option value="World">World</option>
                              <option value="Blog">Blog</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-600 select-none">News Release Scope</label>
                            <select 
                              value={newType}
                              onChange={(e) => setNewType(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all cursor-pointer font-bold"
                            >
                              <option value="local">Local (Haldwani / Kumaon)</option>
                              <option value="national">National (India)</option>
                              <option value="international">International (World)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Cover Image URL (Optional)</label>
                          <input 
                            type="url" 
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/... or leave blank"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-600 select-none">Article Content / Body</label>
                          <textarea 
                            rows="6"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            required
                            placeholder="Draft your story narrative here. Support details and references..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 tracking-wider flex items-center justify-center gap-1.5 self-start px-6"
                        >
                          <span className="material-symbols-outlined text-base">send</span>
                          <span>Submit Draft to Editor</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Submission History Tab */}
                  {adminTab === 'history' && (
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2 select-none">
                        <span className="material-symbols-outlined text-secondary text-xl">history</span>
                        <span>My Submissions Filing History</span>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {myArticles.length === 0 ? (
                          <div className="col-span-2 text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl select-none">
                            <p className="text-xs font-bold text-slate-400">No submissions filed yet.</p>
                          </div>
                        ) : (
                          myArticles.map((art) => (
                            <div key={art.id} className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col gap-2">
                              <div className="flex justify-between items-center select-none">
                                <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                  {art.type}
                                </span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                                  art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : art.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {art.status}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 leading-snug">{art.title}</h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{art.content}</p>
                              <span className="text-[9px] text-slate-400 font-bold self-end mt-1 select-none">
                                {new Date(art.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ==========================
                  3. READER (USER) VIEWS
                  ========================== */}
              {currentUser.role === 'user' && (
                <>
                  {/* Overview Tab */}
                  {adminTab === 'overview' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Greeting Jumbotron */}
                      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="flex items-center gap-4 z-10">
                          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-black text-xl uppercase">
                            {currentUser.username.slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-black tracking-tight">नमस्ते, {currentUser.username}!</h3>
                            <p className="text-xs text-slate-400 mt-1">आपकी पर्सनल फीड में आपका स्वागत है। यहां आपके सहेजे गए लेख व्यवस्थित हैं।</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border border-slate-700 bg-slate-800/40 rounded-xl px-4 py-2 shrink-0 text-xs font-semibold text-slate-300 z-10">
                          <span className="material-symbols-outlined text-base">calendar_today</span>
                          <span>{new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Reader Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                        
                        {/* Bookmarks Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">सहेजे गए लेख (Bookmarks)</span>
                            <span className="text-[#920028] bg-[#ffdada]/60 p-2 rounded-xl material-symbols-outlined font-bold text-xl">collections_bookmark</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myBookmarks.length}</h2>
                            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm font-black">check</span> Saved in library
                            </p>
                          </div>
                        </div>

                        {/* Read Time Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">पढ़ने का समय (Est. Time)</span>
                            <span className="text-[#0051d5] bg-blue-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">history_toggle_off</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{myBookmarks.length * 4} <span className="text-sm font-normal text-slate-400">min</span></h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span> Average reading speed
                            </p>
                          </div>
                        </div>

                        {/* Account Status Card */}
                        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col gap-2 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
                          <div className="flex justify-between items-start">
                            <span className="text-slate-400 font-sans text-[11px] font-bold uppercase tracking-wider">खाता स्थिति (Status)</span>
                            <span className="text-emerald-750 bg-emerald-50 p-2 rounded-xl material-symbols-outlined font-bold text-xl">verified_user</span>
                          </div>
                          <div className="mt-2">
                            <h2 className="text-3xl font-black text-emerald-600 tracking-tight uppercase">Active</h2>
                            <p className="text-[11px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm font-black">verified</span> General Reader Account
                            </p>
                          </div>
                        </div>

                      </div>

                      {/* Bookmarks & Sponsored Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Bookmarks */}
                        <div className="lg:col-span-2 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex justify-between items-center select-none">
                            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary text-lg">bookmark</span>
                              <span>सहेजे गए नवीनतम लेख (Latest Saved Articles)</span>
                            </h4>
                            <button onClick={() => setAdminTab('bookmarks')} className="text-[11px] text-[#0051d5] font-bold hover:underline">View all library</button>
                          </div>

                          <div className="flex flex-col gap-3">
                            {myBookmarks.slice(0, 3).length === 0 ? (
                              <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-400 text-xs select-none">आपकी लाइब्रेरी खाली है।</div>
                            ) : (
                              myBookmarks.slice(0, 3).map(art => (
                                <div key={art.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 hover:shadow-sm transition-all duration-300">
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-slate-800 text-xs truncate">{art.title}</h5>
                                    <span className="text-[9px] text-slate-400 mt-0.5 block">{art.category}</span>
                                  </div>
                                  <button onClick={() => setAdminTab('bookmarks')} className="text-[10px] text-primary hover:text-primary-hover font-bold shrink-0">Open Library</button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Right Column: Sponsored Deals & Offers */}
                        <div className="border border-slate-100 rounded-2xl p-5 flex flex-col gap-4 bg-white shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex justify-between items-center select-none">
                            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                              <span className="material-symbols-outlined text-[#b80035] text-lg">campaign</span>
                              <span>प्रायोजित ऑफर्स (Sponsored Offers)</span>
                            </h4>
                          </div>
                          
                          <div className="flex flex-col gap-3 overflow-y-auto max-h-[220px] no-scrollbar">
                            {adsList.filter(a => a.image_url).length === 0 ? (
                              <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-400 text-xs select-none">कोई ऑफर्स उपलब्ध नहीं हैं।</div>
                            ) : (
                              adsList.filter(a => a.image_url).slice(0, 2).map(ad => (
                                <a 
                                  key={ad.id} 
                                  href={ad.target_url || "#"} 
                                  target={ad.target_url ? "_blank" : undefined}
                                  rel="noopener noreferrer"
                                  className="group flex gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 hover:shadow-sm transition-all duration-300"
                                >
                                  <img src={ad.image_url} alt="Offer" className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                                  <div className="min-w-0 flex flex-col justify-center">
                                    <h5 className="font-extrabold text-slate-800 text-[10px] truncate leading-tight group-hover:text-primary transition-colors">{ad.slot_id} Campaign</h5>
                                    <span className="text-[9px] text-[#0051d5] font-bold mt-1 truncate">{ad.target_url || 'Sponsored Link'}</span>
                                  </div>
                                </a>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Bookmarks Full List Tab */}
                  {adminTab === 'bookmarks' && (
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 select-none">
                        <span className="material-symbols-outlined text-primary text-xl">bookmark</span>
                        <span>मेरी लाइब्रेरी ({myBookmarks.length})</span>
                      </h3>

                      {myBookmarks.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center select-none">
                          <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">bookmark_border</span>
                          <p className="text-sm font-bold text-slate-500">आपकी लाइब्रेरी खाली है।</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          {myBookmarks.map((art) => (
                            <div key={art.id} className="p-4 border border-slate-150 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 relative">
                              {art.image_url && (
                                <img src={art.image_url} alt="Cover" className="w-24 h-24 object-cover rounded-xl bg-slate-50 shrink-0" loading="lazy" />
                              )}
                              <div className="flex-1 flex flex-col gap-2 justify-between min-w-0">
                                <div>
                                  <div className="flex items-center gap-2 select-none">
                                    <span className="text-[8px] bg-primary-container text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">{art.type}</span>
                                    <span className="text-[10px] text-slate-400 font-bold truncate">{art.category}</span>
                                  </div>
                                  <h4 className="text-sm font-extrabold text-slate-800 line-clamp-2 mt-1 leading-snug">{art.title}</h4>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1 select-none text-[10px]">
                                  <span className="text-slate-400 font-bold truncate pr-2">By {art.author_name}</span>
                                  <button 
                                    onClick={() => handleRemoveBookmark(art.id)}
                                    className="text-primary hover:text-primary-hover font-bold uppercase flex items-center gap-0.5 shrink-0"
                                  >
                                    <span className="material-symbols-outlined text-sm font-bold">bookmark_remove</span>
                                    <span>हटाएं</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sponsored Ads View Tab */}
                  {adminTab === 'sponsored_ads' && (
                    <div className="flex flex-col gap-6">
                      <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 select-none">
                        <span className="material-symbols-outlined text-primary text-xl">campaign</span>
                        <span>प्रायोजित विज्ञापन एवं ऑफर्स (Sponsored Offers)</span>
                      </h3>

                      {adsList.filter(a => a.image_url).length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center select-none">
                          <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">campaign</span>
                          <p className="text-sm font-bold text-slate-500">कोई ऑफर्स उपलब्ध नहीं हैं।</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {adsList.filter(a => a.image_url).map((ad) => (
                            <div key={ad.id} className="bg-white border border-slate-100 rounded-2xl shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
                              <div className="relative h-44 overflow-hidden bg-slate-100">
                                <img src={ad.image_url} alt="Campaign" className="w-full h-full object-contain" />
                                <span className="absolute bottom-3 right-3 bg-black/75 text-[8px] font-black text-white px-2 py-0.5 rounded tracking-wide uppercase select-none">Sponsored Offer</span>
                              </div>
                              <div className="p-5 flex flex-col gap-3">
                                <div>
                                  <span className="text-[9px] bg-rose-50 text-rose-700 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider select-none">{ad.slot_id} Placement</span>
                                  <h4 className="font-extrabold text-slate-800 text-sm mt-2 leading-snug">Exclusive sponsored advertisement. Click to learn more about this offer.</h4>
                                </div>
                                <a 
                                  href={ad.target_url || "#"} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="w-full bg-[#0051d5] text-white text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md shadow-blue-500/10 mt-2 block"
                                >
                                  Visit Website
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
