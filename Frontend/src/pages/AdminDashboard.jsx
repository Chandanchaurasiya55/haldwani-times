import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function AdminDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminTab, setAdminTab] = useState('overview');

  const [pendingArticles, setPendingArticles] = useState([]);
  const [reportersList, setReportersList] = useState([]);
  const [adsList, setAdsList] = useState([]);
  const [adBids, setAdBids] = useState([]);

  const [selectedAdSlot, setSelectedAdSlot] = useState('AD 1');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [adTargetUrl, setAdTargetUrl] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');

  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');

  // Media Library state
  const [mediaList, setMediaList] = useState([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState(''); // 'blog' or 'ad'

  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'admin') setCurrentUser(user);
      else localStorage.removeItem('ht_user');
    }
  }, []);

  useEffect(() => {
    if (currentUser) { fetchPendingArticles(); fetchReporters(); fetchAds(); fetchAdBids(); fetchMediaList(); }
  }, [currentUser]);

  const fetchPendingArticles = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/pending`); if (res.ok) setPendingArticles(await res.json()); } catch (err) { console.error(err); } };
  const fetchReporters = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/admin/reporters`); if (res.ok) setReportersList(await res.json()); } catch (err) { console.error(err); } };
  const fetchAds = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/ads`); if (res.ok) setAdsList(await res.json()); } catch (err) { console.error(err); } };
  const fetchAdBids = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/ad-bids`); if (res.ok) setAdBids(await res.json()); } catch (err) { console.error(err); } };
  const fetchMediaList = async () => { try { const res = await fetch(`${API_BASE_URL}/media`); if (res.ok) setMediaList(await res.json()); } catch (err) { console.error(err); } };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaUploading(true); setErrorMsg(''); setSuccessMsg('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed.');
      setSuccessMsg('Media uploaded successfully!');
      fetchMediaList();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/media/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Deletion failed.');
      setSuccessMsg('Media item deleted.');
      fetchMediaList();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSelectMedia = (url) => {
    if (selectorTarget === 'blog') {
      setBlogImageUrl(url);
    } else if (selectorTarget === 'ad') {
      setAdImageUrl(url);
    }
    setIsSelectorOpen(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      if (data.user.role !== 'admin') throw new Error('Access denied. Administrator privileges required.');
      localStorage.setItem('ht_user', JSON.stringify(data.user)); setCurrentUser(data.user); setEmail(''); setPassword('');
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setUsername(''); setEmail(''); setPassword('');
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleLogout = () => { localStorage.removeItem('ht_user'); setCurrentUser(null); setPendingArticles([]); setReportersList([]); setSuccessMsg(''); setErrorMsg(''); };

  const handleUpdateAd = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/articles/ads`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot_id: selectedAdSlot,
          image_url: adImageUrl,
          target_url: adTargetUrl,
          title: selectedAdSlot.startsWith('SLIDER') ? adTitle : null,
          description: selectedAdSlot.startsWith('SLIDER') ? adDescription : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update ad.');
      setSuccessMsg(`Ad slot ${selectedAdSlot} updated successfully!`); 
      setAdImageUrl('');
      setAdTargetUrl('');
      setAdTitle('');
      setAdDescription('');
      fetchAds(); 
      if (onRefreshArticles) onRefreshArticles();
    } catch (err) { setErrorMsg(err.message); }
  };

  useEffect(() => {
    if (adsList.length > 0) {
      const s = adsList.find(ad => ad.slot_id === selectedAdSlot);
      if (s) {
        setAdImageUrl(s.image_url || '');
        setAdTargetUrl(s.target_url || '');
        setAdTitle(s.title || '');
        setAdDescription(s.description || '');
      }
    }
  }, [selectedAdSlot]);

  const handleUpdateArticleStatus = async (id, status) => {
    try { const res = await fetch(`${API_BASE_URL}/articles/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); if (res.ok) { fetchPendingArticles(); if (onRefreshArticles) onRefreshArticles(); } } catch (err) { console.error(err); }
  };

  const handleToggleReporterStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try { const res = await fetch(`${API_BASE_URL}/articles/admin/reporters/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: nextStatus }) }); if (res.ok) fetchReporters(); } catch (err) { console.error(err); }
  };

  const handleUpdateBidStatus = async (bidId, status, notes) => {
    try { const res = await fetch(`${API_BASE_URL}/articles/ad-bids/${bidId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, admin_notes: notes || '' }) }); if (res.ok) fetchAdBids(); } catch (err) { console.error(err); }
  };

  const handlePostBlog = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/articles/blog`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: blogTitle, content: blogContent, image_url: blogImageUrl, priority: 0 }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to publish blog.');
      setSuccessMsg('Blog post published successfully!'); setBlogTitle(''); setBlogContent(''); setBlogImageUrl(''); if (onRefreshArticles) onRefreshArticles();
    } catch (err) { setErrorMsg(err.message); }
  };

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'pending', icon: 'rate_review', label: 'Submissions', badge: pendingArticles.length },
    { id: 'reporters', icon: 'group', label: 'Reporters' },
    { id: 'ads', icon: 'campaign', label: 'Manage Ads' },
    { id: 'bids', icon: 'gavel', label: 'Ad Bids', badge: adBids.filter(b => b.status === 'pending').length },
    { id: 'media', icon: 'perm_media', label: 'Media Gallery' },
    { id: 'blog', icon: 'post_add', label: 'Write Blog' },
  ];

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[520px]">
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-12 flex-col justify-between text-white relative">
            <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-[#b80035]/15 blur-3xl"></div>
            <div className="flex flex-col gap-1 z-10 select-none">
              <span className="font-serif font-black text-2xl italic tracking-tight leading-none">Haldwani Times</span>
              <span className="text-[9px] tracking-[0.25em] text-slate-400 font-semibold mt-1">ADMINISTRATOR DESK</span>
            </div>
            <div className="flex flex-col gap-4 my-auto z-10">
              <div className="h-0.5 w-12 bg-[#b80035]"></div>
              <blockquote className="font-serif text-lg italic leading-relaxed text-slate-200">"With great power comes absolute editorial oversight."</blockquote>
            </div>
            <div className="text-[10px] text-slate-500 select-none">© Haldwani Times Admin Portal</div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {authMode === 'login' ? (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Maalik Access Portal</h3>
                <p className="text-xs text-slate-400 mt-1">Enter admin credentials to unlock the panel.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                {successMsg && <div className="mt-4 text-xs font-extrabold text-emerald-600 text-center">{successMsg}</div>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Admin Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@haldwanitimes.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#b80035] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Authenticate Portal →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Don't have an account? <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#b80035] hover:underline font-bold cursor-pointer">Create Account</button></p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Create Admin Account</h3>
                <p className="text-xs text-slate-400 mt-1">Register a new administrator account.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="AdminName" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@haldwanitimes.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#b80035] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Register →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Already have an account? <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#b80035] hover:underline font-bold cursor-pointer">Sign In</button></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-[#f0f2f5]">
      {/* Dark Sidebar - flush, no rounded borders */}
      <aside className="w-[240px] bg-[#0f172a] text-white flex flex-col shrink-0 min-h-screen sticky top-0">
        {/* Profile */}
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">
              {currentUser.username.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm truncate leading-tight text-white">{currentUser.username}</h4>
              <span className="text-[10px] text-indigo-400 font-semibold block">Admin</span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 pt-5 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</span>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all ${
                adminTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content - no rounded border, direct white bg */}
      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-lg text-[#b80035] cursor-pointer" onClick={() => window.location.href = '/'}>Haldwani Times</span>
            <span className="bg-rose-50 text-[#b80035] text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider select-none">Maalik Panel</span>
          </div>
          <button onClick={() => window.location.href = '/'} className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-sm">home</span> Go To Homepage
          </button>
        </header>

        {/* Content Area */}
        <div className="p-8">
          {/* Status messages */}
          {successMsg && <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">check_circle</span>{successMsg}</div>}
          {errorMsg && <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}

          {/* OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Overview</h2><p className="text-xs text-slate-400 mt-0.5">Admin command center dashboard</p></div>

              {/* Stats Row - flat cards like ss2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl text-indigo-600">group</span>
                  <div><h3 className="text-2xl font-black text-slate-800">{reportersList.length}</h3><p className="text-[11px] text-slate-400 font-medium">Total registered</p></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl text-amber-500">rate_review</span>
                  <div><h3 className="text-2xl font-black text-slate-800">{pendingArticles.length}</h3><p className="text-[11px] text-slate-400 font-medium">Pending reviews</p></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl text-emerald-600">campaign</span>
                  <div><h3 className="text-2xl font-black text-slate-800">{adsList.filter(a => a.image_url).length}</h3><p className="text-[11px] text-slate-400 font-medium">Active ads</p></div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4">
                  <span className="material-symbols-outlined text-2xl text-blue-600">security</span>
                  <div><h3 className="text-2xl font-black text-slate-800">Active</h3><p className="text-[11px] text-slate-400 font-medium">System status</p></div>
                </div>
              </div>

              {/* Recent Submissions Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Recent Pending Submissions</h3>
                  <button onClick={() => setAdminTab('pending')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View all →</button>
                </div>
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {pendingArticles.length === 0 ? (
                      <tr><td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-400">No pending submissions.</td></tr>
                    ) : pendingArticles.slice(0, 5).map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3 font-bold text-slate-800 max-w-[260px] truncate">{art.title}</td>
                        <td className="px-5 py-3 text-slate-500">{art.category}</td>
                        <td className="px-5 py-3 text-slate-500">{art.author_name}</td>
                        <td className="px-5 py-3"><span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded">{art.priority || 0}</span></td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => handleUpdateArticleStatus(art.id, 'published')} className="text-emerald-600 font-bold text-[10px] hover:underline mr-3 cursor-pointer">Approve</button>
                          <button onClick={() => handleUpdateArticleStatus(art.id, 'rejected')} className="text-red-500 font-bold text-[10px] hover:underline cursor-pointer">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ad Status Grid */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">Ad Placements Status</h3>
                  <button onClick={() => setAdminTab('ads')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">Manage →</button>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
                  {['AD 1','AD 2','AD 3','AD 4','AD 5','AD 6','AD 7'].map(slot => {
                    const ad = adsList.find(a => a.slot_id === slot);
                    const active = ad && ad.image_url;
                    return (
                      <div key={slot} className="border border-slate-200 rounded-lg p-3 flex flex-col items-center gap-1.5 text-center">
                        <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-xs font-bold text-slate-700">{slot}</span>
                        <span className="text-[9px] text-slate-400">{active ? 'Active' : 'Empty'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PENDING */}
          {adminTab === 'pending' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Pending Submissions</h2><p className="text-xs text-slate-400 mt-0.5">Review and approve/reject reporter articles</p></div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Author</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {pendingArticles.length === 0 ? (
                      <tr><td colSpan="6" className="px-5 py-12 text-center text-xs text-slate-400">No pending submissions. Queue is clean!</td></tr>
                    ) : pendingArticles.map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5"><div className="font-bold text-slate-800 max-w-[280px] truncate">{art.title}</div><div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{art.content?.substring(0, 80)}...</div></td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">{art.category}</td>
                        <td className="px-5 py-3.5"><span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{art.type}</span></td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">{art.author_name}</td>
                        <td className="px-5 py-3.5"><span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded">{art.priority || 0}</span></td>
                        <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdateArticleStatus(art.id, 'published')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-colors">Approve</button>
                          <button onClick={() => handleUpdateArticleStatus(art.id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-colors">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* REPORTERS */}
          {adminTab === 'reporters' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Reporters</h2><p className="text-xs text-slate-400 mt-0.5">All registered reporter accounts</p></div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {reportersList.length === 0 ? (
                      <tr><td colSpan="5" className="px-5 py-12 text-center text-xs text-slate-400">No reporters registered yet.</td></tr>
                    ) : reportersList.map(rep => (
                      <tr key={rep.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] uppercase shrink-0">{rep.username.substring(0, 1)}</div>
                          {rep.username}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{rep.email}</td>
                        <td className="px-5 py-3.5 text-slate-500">{new Date(rep.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${rep.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{rep.status}</span></td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => handleToggleReporterStatus(rep.id, rep.status)} className={`font-bold text-[10px] px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${rep.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>{rep.status === 'active' ? 'Block' : 'Unblock'}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADS */}
          {adminTab === 'ads' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Manage Ads</h2><p className="text-xs text-slate-400 mt-0.5">Upload and manage homepage ad placements</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleUpdateAd} className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Ad Slot</label>
                    <select value={selectedAdSlot} onChange={(e) => setSelectedAdSlot(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm font-medium bg-white cursor-pointer">
                      <option value="AD 1">AD 1 - Leaderboard Top (Recommended: 1200x160)</option>
                      <option value="AD 2">AD 2 - Below Header (Recommended: 1200x160)</option>
                      <option value="AD 3">AD 3 - Sidebar Banner (Recommended: 350x320)</option>
                      <option value="AD 4">AD 4 - Mid-Page Banner (Recommended: 1200x160)</option>
                      <option value="AD 5">AD 5 - Half Page Tall Sidebar (Recommended: 350x750)</option>
                      <option value="AD 6">AD 6 - Pre-Footer Banner (Recommended: 1200x160)</option>
                      <option value="AD 7">AD 7 - Last Ad Banner (Recommended: 1200x160)</option>
                      <option value="AD_DETAIL">AD_DETAIL - Article Detail Page (Recommended: 1200x160)</option>
                      <option value="SLIDER 1">SLIDER 1 - Home Banner Slide 1 (Recommended: 1200x300)</option>
                      <option value="SLIDER 2">SLIDER 2 - Home Banner Slide 2 (Recommended: 1200x300)</option>
                      <option value="SLIDER 3">SLIDER 3 - Home Banner Slide 3 (Recommended: 1200x300)</option>
                    </select>
                  </div>
                  {selectedAdSlot.startsWith('SLIDER') && (
                    <>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-600">Ad Slide Title *</label>
                        <input type="text" required value={adTitle} onChange={(e) => setAdTitle(e.target.value)} placeholder="e.g. Kumaon Luxury Retreats" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-slate-600">Ad Slide Description *</label>
                        <textarea required value={adDescription} onChange={(e) => setAdDescription(e.target.value)} placeholder="e.g. Experience pure tranquility in the lap of nature..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm" rows="2" />
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Image URL</label>
                    <div className="flex gap-2">
                      <input type="url" required value={adImageUrl} onChange={(e) => setAdImageUrl(e.target.value)} placeholder="https://..." className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                      <input type="file" id="admin-ad-upload" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setErrorMsg(''); setSuccessMsg('Uploading image...');
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch(`${API_BASE_URL}/media/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.message || 'Upload failed.');
                          setAdImageUrl(data.url);
                          setSuccessMsg('Ad image uploaded successfully!');
                        } catch (err) {
                          setSuccessMsg('');
                          setErrorMsg('Image upload failed: ' + err.message);
                        }
                      }} />
                      <label htmlFor="admin-ad-upload" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 select-none">Upload</label>
                      <button type="button" onClick={() => { setSelectorTarget('ad'); setIsSelectorOpen(true); }} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"><span className="material-symbols-outlined text-sm">perm_media</span>Gallery</button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Target URL</label><input type="url" value={adTargetUrl} onChange={(e) => setAdTargetUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase py-2.5 px-5 rounded-lg self-start cursor-pointer transition-colors">Publish Campaign</button>
                </form>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Preview</h4>
                  <div className="text-xs text-slate-500 pb-2 border-b border-slate-100 flex justify-between">
                    <span className="font-bold text-slate-800">{selectedAdSlot}</span>
                    <span>{selectedAdSlot.startsWith('SLIDER') ? '1200x300' : selectedAdSlot === 'AD 3' ? '350x320' : selectedAdSlot === 'AD 5' ? '350x750' : '1200x160'}</span>
                  </div>
                  {adImageUrl ? (
                    <div className="rounded-lg overflow-hidden border border-slate-100 relative flex flex-col justify-end" style={{height: selectedAdSlot.startsWith('SLIDER') ? '130px' : selectedAdSlot === 'AD 5' ? '200px' : selectedAdSlot === 'AD 3' ? '150px' : '70px'}}>
                      <img src={adImageUrl} alt="Preview" className="w-full h-full object-contain" />
                      {selectedAdSlot.startsWith('SLIDER') && (
                        <div className="absolute inset-0 bg-black/60 p-4 flex flex-col justify-end text-white text-left">
                          <h5 className="font-bold text-xs truncate">{adTitle || 'Slide Title'}</h5>
                          <p className="text-[9px] text-slate-300 line-clamp-1 mt-0.5">{adDescription || 'Slide Description'}</p>
                        </div>
                      )}
                    </div>
                  ) : <div className="border border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs" style={{height:'90px'}}>No image uploaded</div>}
                </div>
              </div>
            </div>
          )}

          {/* BLOG */}
          {adminTab === 'blog' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Write Blog</h2><p className="text-xs text-slate-400 mt-0.5">Publish a blog post directly to the main feed</p></div>
              <form onSubmit={handlePostBlog} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 max-w-3xl">
                <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Blog Title</label><input type="text" required value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Enter blog headline..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Cover Image URL</label>
                  <div className="flex gap-2">
                    <input type="url" value={blogImageUrl} onChange={(e) => setBlogImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" />
                    <input type="file" id="admin-blog-upload" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setErrorMsg(''); setSuccessMsg('Uploading image...');
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const res = await fetch(`${API_BASE_URL}/media/upload`, { method: 'POST', body: formData });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Upload failed.');
                        setBlogImageUrl(data.url);
                        setSuccessMsg('Blog cover image uploaded successfully!');
                      } catch (err) {
                        setSuccessMsg('');
                        setErrorMsg('Image upload failed: ' + err.message);
                      }
                    }} />
                    <label htmlFor="admin-blog-upload" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors shrink-0 select-none">Upload</label>
                    <button type="button" onClick={() => { setSelectorTarget('blog'); setIsSelectorOpen(true); }} className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"><span className="material-symbols-outlined text-sm">perm_media</span>Gallery</button>
                  </div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Content</label><textarea rows="6" required value={blogContent} onChange={(e) => setBlogContent(e.target.value)} placeholder="Write your blog content..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase py-2.5 px-5 rounded-lg self-start cursor-pointer transition-colors">Publish Blog →</button>
              </form>
            </div>
          )}

          {/* AD BIDS */}
          {adminTab === 'bids' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Ad Bids</h2><p className="text-xs text-slate-400 mt-0.5">Review incoming ad bids from users. Highest bid first.</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-amber-500">gavel</span><div><h3 className="text-2xl font-black text-slate-800">{adBids.filter(b => b.status === 'pending').length}</h3><p className="text-[11px] text-slate-400 font-medium">Pending bids</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-emerald-600">check_circle</span><div><h3 className="text-2xl font-black text-slate-800">{adBids.filter(b => b.status === 'active').length}</h3><p className="text-[11px] text-slate-400 font-medium">Active campaigns</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-indigo-600">payments</span><div><h3 className="text-2xl font-black text-slate-800">₹{adBids.reduce((sum, b) => sum + parseFloat(b.bid_amount || 0), 0).toLocaleString()}</h3><p className="text-[11px] text-slate-400 font-medium">Total bid value</p></div></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Business</th><th className="px-5 py-3">Bidder</th><th className="px-5 py-3">Slot</th><th className="px-5 py-3">Bid (₹)</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {adBids.length === 0 ? <tr><td colSpan="8" className="px-5 py-12 text-center text-xs text-slate-400">No ad bids received yet.</td></tr> : adBids.map(bid => (
                      <tr key={bid.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800 max-w-[180px] truncate">{bid.ad_title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{bid.contact_email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{bid.business_name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{bid.bidder_name || 'User #' + bid.user_id}</td>
                        <td className="px-5 py-3.5"><span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded">{bid.slot_preference}</span></td>
                        <td className="px-5 py-3.5 font-black text-emerald-700">₹{parseFloat(bid.bid_amount).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-slate-500">{bid.duration_days}d</td>
                        <td className="px-5 py-3.5"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${bid.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : bid.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : bid.status === 'expired' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{bid.status}</span></td>
                        <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                          {bid.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateBidStatus(bid.id, 'active', 'Approved by admin')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-colors">Approve</button>
                              <button onClick={() => handleUpdateBidStatus(bid.id, 'rejected', 'Rejected by admin')} className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-md cursor-pointer transition-colors">Reject</button>
                            </>
                          )}
                          {bid.status === 'active' && <button onClick={() => handleUpdateBidStatus(bid.id, 'expired', 'Expired by admin')} className="border border-slate-200 text-slate-600 font-bold text-[10px] px-3 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 transition-colors">Expire</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MEDIA GALLERY */}
          {adminTab === 'media' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">Media Gallery</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Upload images to Cloudinary (or fallback local directory) for your blogs and ads</p>
                </div>
                <div className="relative">
                  <input type="file" id="media-upload-input" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                  <label htmlFor="media-upload-input" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase py-2.5 px-5 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-md">
                    <span className="material-symbols-outlined text-sm font-black">upload</span>
                    {mediaUploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                </div>
              </div>

              {mediaList.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-400">
                  No images uploaded yet. Click the "Upload Image" button to upload your first image.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <div key={media.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden group relative flex flex-col justify-between">
                      <div className="aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden relative">
                        <img src={media.url} alt={media.filename} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(media.url);
                              alert('Copied secure URL to clipboard!');
                            }}
                            className="w-8 h-8 rounded-full bg-white hover:bg-indigo-50 text-indigo-600 flex items-center justify-center transition-colors"
                            title="Copy URL"
                          >
                            <span className="material-symbols-outlined text-base">content_copy</span>
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(media.id)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="p-3 text-[10px] text-slate-500 font-bold truncate select-all">{media.filename}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* SELECTOR MODAL FOR IMAGES */}
      {isSelectorOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsSelectorOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div>
                <h3 className="text-base font-black text-slate-800">Select Image from Media Gallery</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Click any image to auto-fill your URL input field</p>
              </div>
              <button onClick={() => setIsSelectorOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"><span className="material-symbols-outlined text-base text-slate-600">close</span></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {mediaList.length === 0 ? (
                <div className="text-center text-xs text-slate-400 py-12">No media files available. Please upload images in the "Media Gallery" first.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectMedia(media.url)}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all aspect-square relative group"
                    >
                      <img src={media.url} alt={media.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-indigo-600 text-white font-bold text-[9px] uppercase px-2 py-1 rounded">Select</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
