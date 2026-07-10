import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function ReporterDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminTab, setAdminTab] = useState('overview');

  // Reporter states
  const [myArticles, setMyArticles] = useState([]);

  // Draft story form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Uttarakhand');
  const [newType, setNewType] = useState('local');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState(0);

  // Load session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'reporter') {
        setCurrentUser(user);
      } else {
        localStorage.removeItem('ht_user');
      }
    }
  }, []);

  // Fetch reporter articles
  useEffect(() => {
    if (currentUser) {
      fetchMyArticles();
    }
  }, [currentUser]);

  const fetchMyArticles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/my-submissions/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setMyArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch your submissions:', err);
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

      if (data.user.role !== 'reporter') {
        throw new Error('Access denied. Reporter account required.');
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
    setMyArticles([]);
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
          author_id: currentUser.id,
          priority: newPriority
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit article.');
      }

      setSuccessMsg('Article draft successfully submitted to editors for review!');
      setNewTitle('');
      setNewContent('');
      setNewImageUrl('');
      setNewPriority(0);
      fetchMyArticles();
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
          <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider select-none">
            Reporter Desk
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
              REPORTER LOGIN FORM
              ========================================== */
          <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px] my-auto">
            {/* Left Showcase Banner */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1e3b8b] via-[#244196] to-[#0f1b40] p-12 flex-col justify-between text-white relative">
              <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-white/5 blur-3xl"></div>
              <div className="flex flex-col gap-1 z-10 select-none">
                <span className="font-serif font-black text-2xl italic tracking-tight text-white leading-none">Haldwani Times</span>
                <span className="text-[9px] font-sans tracking-[0.25em] text-blue-200 font-semibold mt-1">REPORTER SYSTEM</span>
              </div>
              <div className="flex flex-col gap-4 my-auto z-10">
                <div className="h-0.5 w-12 bg-white"></div>
                <blockquote className="font-serif text-lg italic leading-relaxed text-blue-50">
                  "Journalism is printing what someone else does not want printed; everything else is public relations."
                </blockquote>
              </div>
              <div className="text-[10px] text-blue-300 select-none">© Haldwani Times News Desk. Authorized Reporters Only.</div>
            </div>

            {/* Right Login Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Reporter Console Login</h3>
                <p className="text-xs text-blue-600/70 mt-1 uppercase tracking-wider font-extrabold select-none">Enter reporter credentials</p>
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
                  <label className="text-xs font-bold text-slate-600 select-none">Reporter Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="e.g. reporter@haldwanitimes.com"
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
                  className="bg-[#1e3b8b] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 mt-2 tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Authenticate Console</span>
                  <span className="material-symbols-outlined text-sm font-bold">edit_note</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* ==========================================
              REPORTER WORKSPACE
              ========================================== */
          <>
            {/* Sidebar Controls */}
            <div className="w-full md:w-[260px] lg:w-[280px] shrink-0 border border-slate-200/60 rounded-3xl bg-white flex flex-col justify-between p-5 select-none shadow-sm animate-fadeIn">
              <div className="flex flex-col gap-6">
                
                {/* Profile Widget */}
                <div className="flex items-center gap-3 bg-[#f8fafc] border border-slate-100 p-4 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-[#1e3b8b] flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                    RP
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-800 text-sm truncate leading-tight">{currentUser.username}</h4>
                    <span className="text-[9px] text-[#1e3b8b] font-black uppercase tracking-wider mt-0.5 block">Staff Reporter</span>
                  </div>
                </div>

                {/* Vertical menu navigation */}
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-4 mb-3">WORK DESK</span>
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
                      <span>Overview Desk</span>
                    </button>

                    <button 
                      onClick={() => setAdminTab('submit')}
                      className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left font-sans font-bold text-[11px] uppercase tracking-wider border-l-4 ${
                        adminTab === 'submit' 
                          ? 'bg-[#ffdada]/60 text-[#920028] border-[#b80035] rounded-r-lg shadow-sm' 
                          : 'border-transparent text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 hover:translate-x-1'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">edit_note</span>
                      <span>File New Story</span>
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
                      <span>Submission History</span>
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
                  <span>Sign out Console</span>
                </button>
              </div>
            </div>

            {/* Right main canvas */}
            <div className="flex-1 bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-sm overflow-y-auto no-scrollbar max-h-[750px] animate-fadeIn">
              
              {/* Success/Error status banners */}
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

              {/* OVERVIEW TAB */}
              {adminTab === 'overview' && (
                <div className="flex flex-col gap-6">
                  
                  {/* Jumbotron Banner */}
                  <div className="bg-gradient-to-br from-[#1e3b8b] via-[#244196] to-[#0f1b40] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 select-none animate-fadeIn">
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

                  {/* LuxeGlobal Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none animate-fadeIn">
                    
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
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fadeIn">
                    
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
                            <div key={art.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4 animate-fadeIn">
                              <div className="min-w-0">
                                <h5 className="font-bold text-slate-800 text-xs truncate">{art.title}</h5>
                                <span className="text-[9px] text-slate-400 mt-0.5 block">{new Date(art.created_at).toLocaleDateString()} • {art.category} • Priority: {art.priority || 0}</span>
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
                          <span>Set article <strong>Priority</strong> depending on relevance (Breaking news should be High or Critical priority to display at the top).</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* DRAFT STORY FORM TAB */}
              {adminTab === 'submit' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 select-none">Editorial Category</label>
                        <select 
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white transition-all cursor-pointer font-bold"
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
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white transition-all cursor-pointer font-bold"
                        >
                          <option value="local">Local (Haldwani / Kumaon)</option>
                          <option value="national">National (India)</option>
                          <option value="international">International (World)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600 select-none">Story Display Priority</label>
                        <select 
                          value={newPriority}
                          onChange={(e) => setNewPriority(parseInt(e.target.value, 10))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm bg-white transition-all cursor-pointer font-bold"
                        >
                          <option value={0}>Low / Standard (Priority 0)</option>
                          <option value={5}>Medium / Regional Feature (Priority 5)</option>
                          <option value={10}>High / Breaking News (Priority 10)</option>
                          <option value={50}>Critical / Main Sticky Banner (Priority 50)</option>
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#b80035] focus:ring-2 focus:ring-[#b80035]/20 focus:outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="bg-[#1e3b8b] hover:bg-opacity-95 text-white font-bold text-xs uppercase py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 tracking-wider flex items-center justify-center gap-1.5 self-start px-6 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">send</span>
                      <span>Submit Draft to Editor</span>
                    </button>
                  </form>
                </div>
              )}

              {/* SUBMISSION HISTORY TAB */}
              {adminTab === 'history' && (
                <div className="flex flex-col gap-6 animate-fadeIn">
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
                        <div key={art.id} className="p-4 bg-white border border-slate-150 rounded-2xl shadow-sm hover:shadow transition-all flex flex-col gap-2 animate-fadeIn">
                          <div className="flex justify-between items-center select-none">
                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                              {art.type} • Priority: {art.priority || 0}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-wider ${
                              art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : art.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              {art.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-xs line-clamp-2 mt-1">{art.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{art.content}</p>
                          <div className="border-t border-slate-100 pt-2 mt-1 text-[9px] text-slate-400 select-none">
                            Filed on: {new Date(art.created_at).toLocaleString()}
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

export default ReporterDashboard;
