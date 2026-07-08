import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

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
  const [adminTab, setAdminTab] = useState('pending'); // 'pending', 'reporters', or 'blog'
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');

  // General User State
  const [myBookmarks, setMyBookmarks] = useState([]);

  // Load contextual data based on logged-in role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'reporter') {
        fetchMyArticles();
      } else if (currentUser.role === 'admin') {
        fetchPendingArticles();
        fetchReporters();
      } else if (currentUser.role === 'user') {
        fetchMyBookmarks();
      }
    }
  }, [currentUser]);

  // ==========================================
  // API INTERACTIONS
  // ==========================================

  const fetchMyArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/my-submissions/${currentUser.id}`);
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
      const res = await fetch(`${API_BASE_URL}/articles/pending`);
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
      const res = await fetch(`${API_BASE_URL}/articles/admin/reporters`);
      if (res.ok) {
        const data = await res.json();
        setReportersList(data);
      }
    } catch (err) {
      console.error('Failed to fetch reporters:', err);
    }
  };

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
      setSuccessMsg('Logged in successfully!');
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

    const endpoint = registerRole === 'reporter' ? 'register/reporter' : 'register/user';

    try {
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccessMsg(`Account registered successfully! You can now log in.`);
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
      const res = await fetch(`${API_BASE_URL}/articles`, {
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
      const res = await fetch(`${API_BASE_URL}/articles/blog`, {
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
      const res = await fetch(`${API_BASE_URL}/articles/${id}/status`, {
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
      const res = await fetch(`${API_BASE_URL}/articles/admin/reporters/${id}/status`, {
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
      const res = await fetch(`${API_BASE_URL}/articles/unbookmark`, {
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
                      placeholder="e.g. admin@haldwanitimes.com"
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
              AUTHENTICATED DASHBOARDS (LOGGED-IN)
              ========================================== */
          <div className="w-full p-8 md:p-12 flex flex-col gap-8">
            
            {/* Header Ribbon */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-6 flex-wrap gap-4 select-none">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    {currentUser.role === 'admin' ? 'admin_panel_settings' : currentUser.role === 'reporter' ? 'edit_document' : 'local_library'}
                  </span>
                  {currentUser.role === 'admin' ? 'Admin Portal' : currentUser.role === 'reporter' ? 'Reporter Desk' : 'Reader Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active User: <strong className="text-primary font-bold">{currentUser.username}</strong> | Role: <span className="uppercase font-bold">{currentUser.role}</span>
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-primary border border-primary/30 hover:bg-primary-container px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase transition-all shadow-sm hover:shadow"
              >
                <span>Logout</span>
                <span className="material-symbols-outlined text-base font-bold">logout</span>
              </button>
            </div>

            {/* Alert Logs */}
            {successMsg && (
              <div className="p-4 bg-secondary-container text-secondary rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="p-4 bg-primary-container text-primary rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ==========================================
                LOGGED IN: ADMIN OVERVIEW PANEL
                ========================================== */}
            {currentUser.role === 'admin' && (
              <div className="flex flex-col gap-8">
                {/* Stats Widgets */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-primary bg-primary-container p-3 rounded-xl font-bold">rate_review</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Reviews</h4>
                      <span className="text-xl font-black text-slate-800">{pendingArticles.length} Submissions</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-secondary bg-secondary-container p-3 rounded-xl font-bold">assignment_ind</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Reporters</h4>
                      <span className="text-xl font-black text-slate-800">{reportersList.length} Accounts</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-[#b80035] bg-[#b80035]/10 p-3 rounded-xl font-bold">book</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Editorial Blog</h4>
                      <span className="text-xl font-black text-slate-800">Publish Directly</span>
                    </div>
                  </div>
                </div>

                {/* Subpage Tabs */}
                <div className="flex border-b border-slate-100 select-none">
                  <button 
                    onClick={() => setAdminTab('pending')}
                    className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${adminTab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-lg">rate_review</span>
                    <span>Submissions ({pendingArticles.length})</span>
                  </button>
                  <button 
                    onClick={() => setAdminTab('reporters')}
                    className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${adminTab === 'reporters' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-lg">group</span>
                    <span>Reporters ({reportersList.length})</span>
                  </button>
                  <button 
                    onClick={() => setAdminTab('blog')}
                    className={`py-3 px-6 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${adminTab === 'blog' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  >
                    <span className="material-symbols-outlined text-lg">post_add</span>
                    <span>Write Blog</span>
                  </button>
                </div>

                {/* Tab 1: Articles pending review */}
                {adminTab === 'pending' && (
                  <div className="flex flex-col gap-6">
                    {pendingArticles.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">check_circle</span>
                        <p className="text-sm font-bold text-slate-500">Inbox clean! No stories pending review.</p>
                      </div>
                    ) : (
                      pendingArticles.map((art) => (
                        <div key={art.id} className="p-6 border border-slate-150 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
                          {art.image_url && (
                            <img 
                              src={art.image_url} 
                              alt="Thumbnail" 
                              className="w-full md:w-44 h-28 object-cover rounded-xl bg-slate-100 shrink-0" 
                            />
                          )}
                          <div className="flex-1 flex flex-col gap-2 justify-between">
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[9px] bg-primary-container text-primary font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {art.type}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">
                                  Category: <span className="text-slate-700">{art.category}</span>
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="text-xs text-slate-400 font-medium">
                                  Author: <span className="text-slate-700 font-bold">{art.author_name}</span> ({art.author_email})
                                </span>
                              </div>
                              <h4 className="text-base font-extrabold text-slate-800 mt-2 leading-snug">{art.title}</h4>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{art.content}</p>
                            </div>

                            <div className="flex items-center gap-3 mt-4 border-t border-slate-50 pt-3">
                              <button 
                                onClick={() => handleUpdateArticleStatus(art.id, 'published')}
                                className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
                              >
                                <span className="material-symbols-outlined text-base font-bold">check</span>
                                Approve
                              </button>
                              <button 
                                onClick={() => handleUpdateArticleStatus(art.id, 'rejected')}
                                className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-2 px-4 rounded-xl flex items-center gap-1 shadow-sm hover:shadow transition-all transform hover:-translate-y-0.5"
                              >
                                <span className="material-symbols-outlined text-base font-bold">close</span>
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 2: Manage reporters list */}
                {adminTab === 'reporters' && (
                  <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse bg-white">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                            <th className="p-4">Reporter Profile</th>
                            <th className="p-4">Registration</th>
                            <th className="p-4">Account Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportersList.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="p-8 text-center text-xs font-bold text-slate-400">No reporters registered yet.</td>
                            </tr>
                          ) : (
                            reportersList.map((rep) => (
                              <tr key={rep.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-extrabold text-sm text-slate-800">{rep.username}</span>
                                    <span className="text-xs text-slate-400">{rep.email}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-xs text-slate-500 font-medium">
                                  {new Date(rep.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${rep.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                    {rep.status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => handleToggleReporterStatus(rep.id, rep.status)}
                                    className={`font-bold text-xs uppercase py-1.5 px-4 rounded-xl border transition-all ${rep.status === 'active' ? 'border-primary text-primary hover:bg-primary-container' : 'border-emerald-500 text-emerald-500 hover:bg-emerald-50'}`}
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

                {/* Tab 3: Write Blog Panel */}
                {adminTab === 'blog' && (
                  <div className="bg-slate-50/60 border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#b80035] text-2xl">post_add</span>
                        <span>Write Blog Post</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Directly publish editorial opinion articles, essays, and stories onto the blog category of Haldwani Times.</p>
                    </div>

                    <form onSubmit={handlePostBlog} className="flex flex-col gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Blog Title</label>
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
                        <label className="text-xs font-bold text-slate-600">Cover Image URL (Optional)</label>
                        <input 
                          type="url" 
                          value={blogImageUrl}
                          onChange={(e) => setBlogImageUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or leave blank"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-white"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Blog Content</label>
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
              </div>
            )}

            {/* ==========================================
                LOGGED IN: REPORTER EDITORIAL PANEL
                ========================================== */}
            {currentUser.role === 'reporter' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Submit New Article Form */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2 select-none">
                    <span className="material-symbols-outlined text-primary text-xl">edit_note</span>
                    <span>Draft & File Story</span>
                  </h3>

                  <form onSubmit={handlePostArticle} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Headline Title</label>
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
                        <label className="text-xs font-bold text-slate-600">Editorial Category</label>
                        <select 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all"
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
                        <label className="text-xs font-bold text-slate-600">News Release Scope</label>
                        <select 
                          value={newType}
                          onChange={(e) => setNewType(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm bg-white transition-all"
                        >
                          <option value="local">Local (Haldwani / Kumaon)</option>
                          <option value="national">National (India)</option>
                          <option value="international">International (World)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Cover Image URL (Optional)</label>
                      <input 
                        type="url" 
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/... or leave blank"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Article Content / Body</label>
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
                      className="bg-primary hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 tracking-wider flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Submit draft for Admin approval</span>
                    </button>
                  </form>
                </div>

                {/* My Submission List */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2 select-none">
                    <span className="material-symbols-outlined text-secondary text-xl">history</span>
                    <span>Submission History</span>
                  </h3>

                  <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                    {myArticles.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                        <p className="text-xs font-bold text-slate-400">No submissions filed yet.</p>
                      </div>
                    ) : (
                      myArticles.map((art) => (
                        <div key={art.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                              {art.type}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : art.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                              {art.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1 leading-snug">{art.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{art.content}</p>
                          <span className="text-[9px] text-slate-400 font-bold self-end mt-1">
                            {new Date(art.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                LOGGED IN: READER DASHBOARD
                ========================================== */}
            {currentUser.role === 'user' && (
              <div className="flex flex-col gap-8">
                {/* Greeting Jumbotron */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex items-center gap-4 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary font-black text-2xl uppercase">
                      {currentUser.username.slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight">नमस्ते, {currentUser.username}!</h3>
                      <p className="text-xs text-slate-400 mt-1">आपकी पर्सनल फीड में आपका स्वागत है। यहां आपके सहेजे गए लेख व्यवस्थित हैं।</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border border-slate-700 bg-slate-800/40 rounded-xl px-4 py-2 shrink-0 text-xs font-semibold text-slate-300 z-10">
                    <span className="material-symbols-outlined text-base">calendar_today</span>
                    <span>{new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Reader Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-primary bg-primary-container p-3 rounded-xl font-bold">collections_bookmark</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">सहेजे गए लेख (Bookmarks)</h4>
                      <span className="text-xl font-black text-slate-800">{myBookmarks.length} समाचार</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-secondary bg-secondary-container p-3 rounded-xl font-bold">history_toggle_off</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">पढ़ने का समय (Est. Read Time)</h4>
                      <span className="text-xl font-black text-slate-800">{myBookmarks.length * 4} मिनट</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-all duration-300">
                    <span className="material-symbols-outlined text-3xl text-emerald-500 bg-emerald-50 p-3 rounded-xl font-bold">verified_user</span>
                    <div>
                      <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">खाता स्थिति (Status)</h4>
                      <span className="text-xl font-black text-emerald-600 uppercase">सक्रिय (Active)</span>
                    </div>
                  </div>
                </div>

                {/* Bookmarks Section */}
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 select-none">
                    <span className="material-symbols-outlined text-primary text-xl">bookmark</span>
                    <span>मेरी लाइब्रेरी ({myBookmarks.length})</span>
                  </h3>

                  {myBookmarks.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center select-none">
                      <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">bookmark_border</span>
                      <p className="text-sm font-bold text-slate-500">आपकी लाइब्रेरी खाली है।</p>
                      <p className="text-xs text-slate-400 mt-1">मुख्य समाचारों पर बुकमार्क आइकन दबाकर उन्हें यहां सहेजें।</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myBookmarks.map((art) => (
                        <div key={art.id} className="p-4 border border-slate-200/60 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 relative">
                          {(art.image_url) && (
                            <img 
                              src={art.image_url} 
                              alt="Cover" 
                              className="w-24 h-24 object-cover rounded-xl bg-slate-50 shrink-0" 
                              loading="lazy"
                            />
                          )}
                          <div className="flex-1 flex flex-col gap-2 justify-between min-w-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] bg-primary-container text-primary font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                  {art.type}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold truncate">
                                  {art.category}
                                </span>
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-800 line-clamp-2 mt-1 leading-snug">{art.title}</h4>
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-1 select-none">
                              <span className="text-[9px] text-slate-400 font-bold truncate pr-2">By {art.author_name}</span>
                              <button 
                                onClick={() => handleRemoveBookmark(art.id)}
                                className="text-primary hover:text-primary-hover transition-all font-bold text-xs uppercase flex items-center gap-0.5 shrink-0"
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
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
