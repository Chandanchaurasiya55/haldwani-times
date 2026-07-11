import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function ReporterDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminTab, setAdminTab] = useState('overview');
  const [myArticles, setMyArticles] = useState([]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Uttarakhand');
  const [newType, setNewType] = useState('local');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'reporter') setCurrentUser(user);
      else localStorage.removeItem('ht_user');
    }
  }, []);

  useEffect(() => { if (currentUser) fetchMyArticles(); }, [currentUser]);

  const fetchMyArticles = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/my-submissions/${currentUser.id}`); if (res.ok) setMyArticles(await res.json()); } catch (err) { console.error(err); } };

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      if (data.user.role !== 'reporter') throw new Error('Access denied. Reporter account required.');
      localStorage.setItem('ht_user', JSON.stringify(data.user)); setCurrentUser(data.user); setEmail(''); setPassword('');
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/reporter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setUsername(''); setEmail(''); setPassword('');
      window.location.href = '/';
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleLogout = () => { localStorage.removeItem('ht_user'); setCurrentUser(null); setMyArticles([]); setSuccessMsg(''); setErrorMsg(''); };

  const handlePostArticle = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/articles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: newTitle, content: newContent, category: newCategory, type: newType, image_url: newImageUrl, author_id: currentUser.id, priority: newPriority }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit article.');
      setSuccessMsg('Article submitted for review!'); setNewTitle(''); setNewContent(''); setNewImageUrl(''); setNewPriority(0); fetchMyArticles(); if (onRefreshArticles) onRefreshArticles();
    } catch (err) { setErrorMsg(err.message); }
  };

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'submit', icon: 'edit_note', label: 'File New Story' },
    { id: 'history', icon: 'history', label: 'Submissions' },
  ];

  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[520px]">
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#1e3a5f] via-[#1a365d] to-[#0f172a] p-12 flex-col justify-between text-white relative">
            <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl"></div>
            <div className="flex flex-col gap-1 z-10 select-none">
              <span className="font-serif font-black text-2xl italic tracking-tight leading-none">Haldwani Times</span>
              <span className="text-[9px] tracking-[0.25em] text-blue-300 font-semibold mt-1">REPORTER SYSTEM</span>
            </div>
            <div className="flex flex-col gap-4 my-auto z-10">
              <div className="h-0.5 w-12 bg-white/50"></div>
              <blockquote className="font-serif text-lg italic leading-relaxed text-blue-100">"Journalism is printing what someone else does not want printed."</blockquote>
            </div>
            <div className="text-[10px] text-blue-300/60 select-none">© Haldwani Times Reporter Desk</div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {authMode === 'login' ? (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Reporter Console</h3>
                <p className="text-xs text-slate-400 mt-1">Enter your reporter credentials to access the desk.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                {successMsg && <div className="mt-4 text-xs font-extrabold text-emerald-600 text-center">{successMsg}</div>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="reporter@haldwanitimes.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#1e3a5f] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Authenticate Console →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Don't have an account? <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#1e3a5f] hover:underline font-bold cursor-pointer">Create Account</button></p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Create Reporter Account</h3>
                <p className="text-xs text-slate-400 mt-1">Register to start filing news stories.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="ReporterName" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="reporter@haldwanitimes.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#1e3a5f] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Register →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Already have an account? <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#1e3a5f] hover:underline font-bold cursor-pointer">Sign In</button></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-[#f0f2f5]">
      {/* Dark Sidebar */}
      <aside className="w-[240px] bg-[#0f172a] text-white flex flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">{currentUser.username.substring(0, 2)}</div>
            <div className="min-w-0"><h4 className="font-bold text-sm truncate leading-tight">{currentUser.username}</h4><span className="text-[10px] text-blue-400 font-semibold block">Reporter</span></div>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-5 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</span>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setAdminTab(item.id)} className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all ${adminTab === item.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <span className="material-symbols-outlined text-lg">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout} className="w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"><span className="material-symbols-outlined text-lg">logout</span><span>Sign Out</span></button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen">
        <header className="bg-white border-b border-slate-200 h-14 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-serif font-black text-lg text-[#b80035] cursor-pointer" onClick={() => window.location.href = '/'}>Haldwani Times</span>
            <span className="bg-blue-50 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider select-none">Reporter Desk</span>
          </div>
          <button onClick={() => window.location.href = '/'} className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"><span className="material-symbols-outlined text-sm">home</span> Go To Homepage</button>
        </header>

        <div className="p-8">
          {successMsg && <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">check_circle</span>{successMsg}</div>}
          {errorMsg && <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}

          {/* OVERVIEW */}
          {adminTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Overview</h2><p className="text-xs text-slate-400 mt-0.5">Your reporter desk at a glance</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-blue-600">edit_document</span><div><h3 className="text-2xl font-black text-slate-800">{myArticles.length}</h3><p className="text-[11px] text-slate-400 font-medium">Total filings</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-emerald-600">verified</span><div><h3 className="text-2xl font-black text-slate-800">{myArticles.filter(a => a.status === 'published').length}</h3><p className="text-[11px] text-slate-400 font-medium">Approved & Live</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-amber-500">pending_actions</span><div><h3 className="text-2xl font-black text-slate-800">{myArticles.filter(a => a.status === 'pending').length}</h3><p className="text-[11px] text-slate-400 font-medium">Pending review</p></div></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">Recent Submissions</h3><button onClick={() => setAdminTab('history')} className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">View all →</button></div>
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody>
                    {myArticles.slice(0, 5).length === 0 ? <tr><td colSpan="5" className="px-5 py-8 text-center text-xs text-slate-400">No submissions yet.</td></tr> : myArticles.slice(0, 5).map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3 font-bold text-slate-800 max-w-[260px] truncate">{art.title}</td>
                        <td className="px-5 py-3 text-slate-500">{art.category}</td>
                        <td className="px-5 py-3"><span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded">{art.priority || 0}</span></td>
                        <td className="px-5 py-3 text-slate-500">{new Date(art.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : art.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{art.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FILE NEW STORY */}
          {adminTab === 'submit' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">File New Story</h2><p className="text-xs text-slate-400 mt-0.5">Draft and submit an editorial article for review</p></div>
              <form onSubmit={handlePostArticle} className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 max-w-3xl">
                <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Headline Title</label><input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder="Enter article headline..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Category</label>
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium bg-white cursor-pointer">
                      <option value="Uttarakhand">Uttarakhand</option><option value="India">India</option><option value="Education">Education</option><option value="Politics">Politics</option><option value="Top Stories">Top Stories</option><option value="Food">Food</option><option value="Business">Business</option><option value="Celebrity">Celebrity</option><option value="Hindi News">Hindi News</option><option value="World">World</option><option value="Blog">Blog</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Scope</label>
                    <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium bg-white cursor-pointer">
                      <option value="local">Local</option><option value="national">National</option><option value="international">International</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Priority</label>
                    <select value={newPriority} onChange={(e) => setNewPriority(parseInt(e.target.value, 10))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm font-medium bg-white cursor-pointer">
                      <option value={0}>Low (0)</option><option value={5}>Medium (5)</option><option value={10}>High (10)</option><option value={50}>Critical (50)</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Cover Image URL</label><input type="url" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Article Content</label><textarea rows="6" value={newContent} onChange={(e) => setNewContent(e.target.value)} required placeholder="Write your story..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-sm" /></div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase py-2.5 px-5 rounded-lg self-start cursor-pointer transition-colors">Submit Draft →</button>
              </form>
            </div>
          )}

          {/* SUBMISSION HISTORY */}
          {adminTab === 'history' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Submissions</h2><p className="text-xs text-slate-400 mt-0.5">All your filed articles and their status</p></div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody>
                    {myArticles.length === 0 ? <tr><td colSpan="6" className="px-5 py-12 text-center text-xs text-slate-400">No submissions filed yet.</td></tr> : myArticles.map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3 font-bold text-slate-800 max-w-[240px] truncate">{art.title}</td>
                        <td className="px-5 py-3 text-slate-500">{art.category}</td>
                        <td className="px-5 py-3"><span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">{art.type}</span></td>
                        <td className="px-5 py-3"><span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-2 py-0.5 rounded">{art.priority || 0}</span></td>
                        <td className="px-5 py-3 text-slate-500">{new Date(art.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${art.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : art.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{art.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReporterDashboard;
