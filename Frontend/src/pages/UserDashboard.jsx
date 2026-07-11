import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

function UserDashboard({ onRefreshArticles }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminTab, setAdminTab] = useState('overview');
  const [myBookmarks, setMyBookmarks] = useState([]);
  const [adsList, setAdsList] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [showTerms, setShowTerms] = useState(false);

  // Ad bid form state
  const [bidBusinessName, setBidBusinessName] = useState('');
  const [bidContactEmail, setBidContactEmail] = useState('');
  const [bidContactPhone, setBidContactPhone] = useState('');
  const [bidAdTitle, setBidAdTitle] = useState('');
  const [bidAdDescription, setBidAdDescription] = useState('');
  const [bidAdImageUrl, setBidAdImageUrl] = useState('');
  const [bidAdTargetUrl, setBidAdTargetUrl] = useState('');
  const [bidSlotPref, setBidSlotPref] = useState('Any');
  const [bidAmount, setBidAmount] = useState('');
  const [bidDuration, setBidDuration] = useState(7);
  const [bidAgreedTerms, setBidAgreedTerms] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('ht_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === 'user') setCurrentUser(user);
      else localStorage.removeItem('ht_user');
    }
  }, []);

  useEffect(() => { if (currentUser) { fetchMyBookmarks(); fetchAds(); fetchMyBids(); } }, [currentUser]);

  const fetchMyBookmarks = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/bookmarks/${currentUser.id}`); if (res.ok) setMyBookmarks(await res.json()); } catch (err) { console.error(err); } };
  const fetchAds = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/ads`); if (res.ok) setAdsList(await res.json()); } catch (err) { console.error(err); } };
  const fetchMyBids = async () => { try { const res = await fetch(`${API_BASE_URL}/articles/ad-bids/user/${currentUser.id}`); if (res.ok) setMyBids(await res.json()); } catch (err) { console.error(err); } };

  const handleLogin = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed.');
      localStorage.setItem('ht_user', JSON.stringify(data.user)); setCurrentUser(data.user); setEmail(''); setPassword('');
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/user`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed.');
      localStorage.setItem('ht_user', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setUsername(''); setEmail(''); setPassword('');
      window.location.href = '/';
    } catch (err) { setErrorMsg(err.message); }
  };

  const handleLogout = () => { localStorage.removeItem('ht_user'); setCurrentUser(null); setMyBookmarks([]); setSuccessMsg(''); setErrorMsg(''); };

  const handleRemoveBookmark = async (articleId) => {
    try { const res = await fetch(`${API_BASE_URL}/articles/bookmarks`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: currentUser.id, article_id: articleId }) }); if (res.ok) fetchMyBookmarks(); } catch (err) { console.error(err); }
  };

  // Load Razorpay checkout script
  useEffect(() => {
    if (!document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleSubmitBid = async (e) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    if (!bidAgreedTerms) { setErrorMsg('You must agree to the Terms & Conditions before submitting.'); return; }
    const amount = parseFloat(bidAmount);
    if (!amount || amount < 50) { setErrorMsg('Minimum bid amount is ₹50.'); return; }

    setPaymentProcessing(true);
    try {
      // Step 1: Create Razorpay order from backend
      const orderRes = await fetch(`${API_BASE_URL}/articles/ad-bids/payment-order`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || 'Failed to create payment order.');

      // Step 2: If test mode (no Razorpay keys), skip checkout modal
      if (orderData.test_mode) {
        // Submit bid directly with test order ID
        await submitBidToBackend(orderData.id, 'pay_TEST_' + Date.now(), '');
        return;
      }

      // Step 3: Open Razorpay checkout popup
      const options = {
        key: orderData.key_id || 'rzp_test_placeholder',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Haldwani Times',
        description: `Ad Bid: ${bidAdTitle}`,
        order_id: orderData.id,
        handler: async function (response) {
          // Step 4: Payment successful — submit bid with verification params
          await submitBidToBackend(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: bidBusinessName,
          email: bidContactEmail,
          contact: bidContactPhone,
        },
        theme: { color: '#b80035' },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
            setErrorMsg('Payment was cancelled. Your bid has not been placed.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setPaymentProcessing(false);
        setErrorMsg(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      setPaymentProcessing(false);
      setErrorMsg(err.message);
    }
  };

  const submitBidToBackend = async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    try {
      const res = await fetch(`${API_BASE_URL}/articles/ad-bids`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, business_name: bidBusinessName, contact_email: bidContactEmail, contact_phone: bidContactPhone, ad_title: bidAdTitle, ad_description: bidAdDescription, ad_image_url: bidAdImageUrl, ad_target_url: bidAdTargetUrl, slot_preference: bidSlotPref, bid_amount: parseFloat(bidAmount), duration_days: bidDuration, razorpay_order_id, razorpay_payment_id, razorpay_signature })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit bid.');
      setSuccessMsg('🎉 Payment successful! Ad bid submitted. Our team will review and the highest bidder gets priority placement.');
      setBidBusinessName(''); setBidContactEmail(''); setBidContactPhone(''); setBidAdTitle(''); setBidAdDescription(''); setBidAdImageUrl(''); setBidAdTargetUrl(''); setBidSlotPref('Any'); setBidAmount(''); setBidDuration(7); setBidAgreedTerms(false);
      fetchMyBids();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Overview' },
    { id: 'bookmarks', icon: 'bookmarks', label: 'Saved Bookmarks' },
    { id: 'advertise', icon: 'ads_click', label: 'Advertise With Us' },
    { id: 'my-bids', icon: 'receipt_long', label: 'My Bids' },
    { id: 'offers', icon: 'campaign', label: 'Sponsored Offers' },
  ];

  // ---- LOGIN / REGISTER SCREEN ----
  if (!currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex min-h-[520px]">
          <div className="hidden md:flex md:w-1/2 bg-[#0f172a] p-12 flex-col justify-between text-white relative">
            <div className="absolute top-1/4 left-1/4 w-44 h-44 rounded-full bg-[#b80035]/10 blur-3xl"></div>
            <div className="flex flex-col gap-1 z-10 select-none">
              <span className="font-serif font-black text-2xl italic tracking-tight leading-none">Haldwani Times</span>
              <span className="text-[9px] tracking-[0.25em] text-slate-400 font-semibold mt-1">READER NETWORK</span>
            </div>
            <div className="flex flex-col gap-4 my-auto z-10">
              <div className="h-0.5 w-12 bg-[#b80035]"></div>
              <blockquote className="font-serif text-lg italic leading-relaxed text-slate-200">"Stay informed, stay connected. Haldwani's premium news network."</blockquote>
            </div>
            <div className="text-[10px] text-slate-500 select-none">© Haldwani Times Reader Portal</div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {authMode === 'login' ? (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Welcome Back</h3>
                <p className="text-xs text-slate-400 mt-1">Access your saved news stream and library.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                {successMsg && <div className="mt-4 text-xs font-extrabold text-emerald-600 text-center">{successMsg}</div>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#b80035] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Log In →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Don't have an account? <button type="button" onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#b80035] hover:underline font-bold cursor-pointer">Create Account</button></p>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-black text-slate-800">Create Account</h3>
                <p className="text-xs text-slate-400 mt-1">Join Haldwani Times to bookmark stories & advertise.</p>
                {errorMsg && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}
                <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-6">
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Username</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="YourName" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm bg-slate-50/50" /></div>
                  <button type="submit" className="bg-[#b80035] text-white font-bold text-xs uppercase py-3 rounded-lg shadow-md hover:shadow-lg transition-all mt-2 tracking-wider cursor-pointer">Create Account →</button>
                </form>
                <p className="text-xs text-slate-500 text-center mt-6">Already have an account? <button type="button" onClick={() => { setAuthMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-[#b80035] hover:underline font-bold cursor-pointer">Sign In</button></p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD ----
  return (
    <div className="w-full min-h-screen flex bg-[#f0f2f5]">
      {/* Dark Sidebar */}
      <aside className="w-[240px] bg-[#0f172a] text-white flex flex-col shrink-0 min-h-screen sticky top-0">
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">{currentUser.username.substring(0, 2)}</div>
            <div className="min-w-0"><h4 className="font-bold text-sm truncate leading-tight">{currentUser.username}</h4><span className="text-[10px] text-emerald-400 font-semibold block">Reader</span></div>
          </div>
        </div>
        <nav className="flex-1 px-3 pt-5 flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Menu</span>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setAdminTab(item.id)} className={`w-full px-3 py-2.5 flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all ${adminTab === item.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
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
            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider select-none">User Portal</span>
          </div>
          <button onClick={() => window.location.href = '/'} className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"><span className="material-symbols-outlined text-sm">home</span> Go To Homepage</button>
        </header>

        <div className="p-8">
          {successMsg && <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">check_circle</span>{successMsg}</div>}
          {errorMsg && <div className="mb-6 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-2"><span className="material-symbols-outlined text-base">error</span>{errorMsg}</div>}

          {/* ═══ OVERVIEW ═══ */}
          {adminTab === 'overview' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Overview</h2><p className="text-xs text-slate-400 mt-0.5">Your personal reading library</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-indigo-600">bookmark</span><div><h3 className="text-2xl font-black text-slate-800">{myBookmarks.length}</h3><p className="text-[11px] text-slate-400 font-medium">Saved articles</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-blue-600">schedule</span><div><h3 className="text-2xl font-black text-slate-800">{myBookmarks.length * 4}m</h3><p className="text-[11px] text-slate-400 font-medium">Read time est.</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-amber-500">ads_click</span><div><h3 className="text-2xl font-black text-slate-800">{myBids.length}</h3><p className="text-[11px] text-slate-400 font-medium">Ad bids placed</p></div></div>
                <div className="bg-white border border-slate-200 rounded-lg p-5 flex items-center gap-4"><span className="material-symbols-outlined text-2xl text-emerald-600">verified_user</span><div><h3 className="text-2xl font-black text-slate-800">Active</h3><p className="text-[11px] text-slate-400 font-medium">Account status</p></div></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-800">My Bookmarked Articles</h3><button onClick={() => setAdminTab('bookmarks')} className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer">View all →</button></div>
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {myBookmarks.length === 0 ? <tr><td colSpan="3" className="px-5 py-8 text-center text-xs text-slate-400">No bookmarks. Save articles from Homepage!</td></tr> : myBookmarks.slice(0, 5).map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3 font-bold text-slate-800 max-w-[300px] truncate">{art.title}</td>
                        <td className="px-5 py-3 text-slate-500">{art.category}</td>
                        <td className="px-5 py-3 text-right"><button onClick={() => handleRemoveBookmark(art.id)} className="text-red-500 font-bold text-[10px] hover:underline cursor-pointer">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ BOOKMARKS ═══ */}
          {adminTab === 'bookmarks' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Saved Bookmarks</h2><p className="text-xs text-slate-400 mt-0.5">All your saved articles in one place</p></div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {myBookmarks.length === 0 ? <tr><td colSpan="3" className="px-5 py-12 text-center text-xs text-slate-400">Library Empty! Save articles from Homepage.</td></tr> : myBookmarks.map(art => (
                      <tr key={art.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5"><div className="font-bold text-slate-800 max-w-[340px] truncate">{art.title}</div><div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{art.content?.substring(0, 80)}...</div></td>
                        <td className="px-5 py-3.5 text-slate-500">{art.category}</td>
                        <td className="px-5 py-3.5 text-right"><button onClick={() => handleRemoveBookmark(art.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] px-3 py-1.5 rounded-md border border-red-200 cursor-pointer transition-colors">Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ ADVERTISE WITH US ═══ */}
          {adminTab === 'advertise' && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Advertise With Us</h2>
                <p className="text-xs text-slate-400 mt-0.5">Place your ad bid. Highest bidder gets premium placement!</p>
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg p-5 text-white flex items-start gap-4">
                <span className="material-symbols-outlined text-3xl mt-0.5">trending_up</span>
                <div>
                  <h4 className="font-bold text-sm">How Bidding Works</h4>
                  <p className="text-[11px] text-indigo-100 mt-1 leading-relaxed">Submit your ad with a bid amount. The <strong>highest bidder</strong> gets priority placement at the top of the homepage. Multiple slots are available. Our editorial team reviews all submissions within 24 hours.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bid Form */}
                <form onSubmit={handleSubmitBid} className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="material-symbols-outlined text-base text-indigo-600">edit_note</span> Ad Campaign Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Business / Brand Name *</label><input type="text" required value={bidBusinessName} onChange={(e) => setBidBusinessName(e.target.value)} placeholder="Your Business Name" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Ad Campaign Title *</label><input type="text" required value={bidAdTitle} onChange={(e) => setBidAdTitle(e.target.value)} placeholder="Summer Sale 2026" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Contact Email *</label><input type="email" required value={bidContactEmail} onChange={(e) => setBidContactEmail(e.target.value)} placeholder="business@example.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Contact Phone</label><input type="tel" value={bidContactPhone} onChange={(e) => setBidContactPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>
                  </div>

                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Ad Banner Image URL *</label><input type="url" required value={bidAdImageUrl} onChange={(e) => setBidAdImageUrl(e.target.value)} placeholder="https://your-image-link.com/banner.jpg" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>

                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Landing Page URL</label><input type="url" value={bidAdTargetUrl} onChange={(e) => setBidAdTargetUrl(e.target.value)} placeholder="https://your-website.com" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-sm" /></div>

                  <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Ad Description</label><textarea rows="3" value={bidAdDescription} onChange={(e) => setBidAdDescription(e.target.value)} placeholder="Describe your campaign goals and target audience..." className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm" /></div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Preferred Slot</label>
                      <select value={bidSlotPref} onChange={(e) => setBidSlotPref(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium bg-white cursor-pointer">
                        <option value="Any">Any Available</option><option value="AD 1">AD 1 - Top Banner</option><option value="AD 2">AD 2 - Below Header</option><option value="AD 3">AD 3 - Sidebar</option><option value="AD 4">AD 4 - Mid-Page</option><option value="AD 5">AD 5 - Half Page</option><option value="AD 6">AD 6 - Pre-Footer</option><option value="AD 7">AD 7 - Bottom</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Bid Amount (₹) *</label><input type="number" required min="50" step="50" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder="Min ₹50" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-600">Duration</label>
                      <select value={bidDuration} onChange={(e) => setBidDuration(parseInt(e.target.value))} className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 outline-none text-sm font-medium bg-white cursor-pointer">
                        <option value={3}>3 Days</option><option value={7}>7 Days</option><option value={14}>14 Days</option><option value={30}>30 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <div className="flex items-start gap-3 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <input type="checkbox" checked={bidAgreedTerms} onChange={(e) => setBidAgreedTerms(e.target.checked)} className="mt-0.5 cursor-pointer accent-indigo-600" id="terms-check" />
                    <label htmlFor="terms-check" className="text-[11px] text-slate-600 leading-relaxed cursor-pointer">
                      I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-indigo-600 font-bold hover:underline cursor-pointer">Terms & Conditions</button> of the Haldwani Times Ad Bidding Program. I understand that the highest bidder gets priority ad placement, and that all bids are reviewed by the editorial team.
                    </label>
                  </div>

                  <button type="submit" disabled={paymentProcessing} className={`${paymentProcessing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} text-white font-bold text-xs uppercase py-2.5 px-6 rounded-lg self-start transition-colors mt-1 flex items-center gap-2`}>
                    {paymentProcessing ? (<><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span><span>Processing Payment...</span></>) : (<><span className="material-symbols-outlined text-sm">payments</span><span>Pay & Submit Ad Bid →</span></>)}
                  </button>
                </form>

                {/* Right sidebar - pricing info */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-sm text-amber-500">workspace_premium</span> Pricing Tiers</h4>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs py-2 border-b border-slate-100"><span className="text-slate-600">Minimum Bid</span><span className="font-bold text-slate-800">₹50</span></div>
                      <div className="flex justify-between items-center text-xs py-2 border-b border-slate-100"><span className="text-slate-600">Standard (7 days)</span><span className="font-bold text-slate-800">₹500+</span></div>
                      <div className="flex justify-between items-center text-xs py-2 border-b border-slate-100"><span className="text-slate-600">Premium (14 days)</span><span className="font-bold text-slate-800">₹1,000+</span></div>
                      <div className="flex justify-between items-center text-xs py-2"><span className="text-slate-600">Enterprise (30 days)</span><span className="font-bold text-slate-800">₹2,500+</span></div>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><span className="material-symbols-outlined text-sm text-emerald-600">info</span> Quick Facts</h4>
                    <ul className="text-[11px] text-slate-500 flex flex-col gap-2 leading-relaxed">
                      <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-px">✓</span> Highest bid = Top placement</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-px">✓</span> Review within 24 hours</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-px">✓</span> 7 ad slots available</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-px">✓</span> Banner + sidebar formats</li>
                      <li className="flex items-start gap-2"><span className="text-emerald-500 font-bold mt-px">✓</span> Reach all Haldwani readers</li>
                    </ul>
                  </div>
                  {/* Image Preview */}
                  {bidAdImageUrl && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Banner Preview</h4>
                      <div className="rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center bg-slate-50 min-h-[100px]"><img src={bidAdImageUrl} alt="Preview" className="max-w-full max-h-[200px] object-contain" /></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ MY BIDS ═══ */}
          {adminTab === 'my-bids' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">My Bids</h2><p className="text-xs text-slate-400 mt-0.5">Track the status of your ad submissions</p></div>
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider"><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Business</th><th className="px-5 py-3">Slot</th><th className="px-5 py-3">Bid (₹)</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody>
                    {myBids.length === 0 ? <tr><td colSpan="7" className="px-5 py-12 text-center text-xs text-slate-400">No bids placed yet. Go to "Advertise With Us" to start!</td></tr> : myBids.map(bid => (
                      <tr key={bid.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors text-xs">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800 max-w-[200px] truncate">{bid.ad_title}</div>
                          {bid.admin_notes && <div className="text-[10px] text-indigo-600 mt-0.5 italic">Admin: {bid.admin_notes}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{bid.business_name}</td>
                        <td className="px-5 py-3.5"><span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded">{bid.slot_preference}</span></td>
                        <td className="px-5 py-3.5 font-bold text-emerald-700">₹{parseFloat(bid.bid_amount).toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-slate-500">{bid.duration_days} days</td>
                        <td className="px-5 py-3.5 text-slate-500">{new Date(bid.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5"><span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${bid.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : bid.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : bid.status === 'expired' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{bid.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ SPONSORED OFFERS ═══ */}
          {adminTab === 'offers' && (
            <div className="flex flex-col gap-6">
              <div><h2 className="text-xl font-black text-slate-800">Sponsored Offers</h2><p className="text-xs text-slate-400 mt-0.5">Browse promotions from our trusted partners</p></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adsList.filter(ad => ad.image_url).length === 0 ? (
                  <div className="col-span-3 bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-400">No campaigns active right now.</div>
                ) : adsList.filter(ad => ad.image_url).map((ad) => (
                  <div key={ad.slot_id} className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
                    <div className="h-32 bg-slate-100 overflow-hidden relative border-b border-slate-100">
                      <img src={ad.image_url} alt="Campaign" className="w-full h-full object-contain" />
                      <span className="absolute bottom-2 left-2 bg-black/65 text-white font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider">SPONSORED</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div><span className="text-xs font-bold text-slate-700">{ad.slot_id}</span><br/><span className="text-[9px] text-slate-400">Exclusive Deal</span></div>
                      {ad.target_url ? <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] uppercase px-3 py-1.5 rounded-md transition-colors">Visit →</a> : <span className="text-[9px] text-slate-400">No link</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowTerms(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-slate-800">Terms & Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"><span className="material-symbols-outlined text-base text-slate-600">close</span></button>
            </div>
            <div className="p-6 text-xs text-slate-600 leading-relaxed flex flex-col gap-4">
              <h4 className="text-sm font-black text-slate-800">Haldwani Times — Ad Bidding Program</h4>
              <p className="text-[11px] text-slate-400">Effective Date: July 2026 | Last Updated: July 2026</p>

              <div className="flex flex-col gap-3">
                <div><strong className="text-slate-800">1. Bidding Process</strong><p className="mt-1">All ad placements on Haldwani Times are awarded through a competitive bidding system. Advertisers submit bids indicating their desired ad slot, budget, and campaign duration. The platform reserves the right to accept or reject any bid at its sole discretion.</p></div>

                <div><strong className="text-slate-800">2. Highest Bidder Priority</strong><p className="mt-1">The advertiser with the <strong>highest bid amount</strong> for a specific ad slot will receive priority placement. In case of equal bids, the earlier submission takes precedence. Active campaigns are displayed in order of bid value — highest first.</p></div>

                <div><strong className="text-slate-800">3. Minimum Bid Amount</strong><p className="mt-1">The minimum bid amount is <strong>₹100 (INR)</strong>. Bids below this threshold will be automatically rejected by the system.</p></div>

                <div><strong className="text-slate-800">4. Ad Content Guidelines</strong><p className="mt-1">All ad creatives must comply with Indian advertising standards. Content that is misleading, offensive, illegal, or promotes prohibited substances/services will be rejected. The editorial team reviews all submissions within 24 hours.</p></div>

                <div><strong className="text-slate-800">5. Payment & Billing</strong><p className="mt-1">Successful bidders will be contacted via their registered email/phone for payment confirmation. Campaign activation is subject to payment clearance. Refunds are available only for rejected campaigns.</p></div>

                <div><strong className="text-slate-800">6. Campaign Duration</strong><p className="mt-1">Campaigns run for the selected duration (3, 7, 14, or 30 days) from the date of activation. Extensions require a new bid submission.</p></div>

                <div><strong className="text-slate-800">7. Modification & Cancellation</strong><p className="mt-1">Once submitted, bids cannot be modified. You may submit a new bid with updated details. The platform may cancel or pause campaigns that violate content guidelines.</p></div>

                <div><strong className="text-slate-800">8. Disclaimer</strong><p className="mt-1">Haldwani Times is not responsible for the performance or outcomes of any ad campaign. Placement is provided on an as-is basis. The platform makes no guarantees regarding click-through rates or conversion metrics.</p></div>

                <div><strong className="text-slate-800">9. Data Privacy</strong><p className="mt-1">Advertiser information (business name, contact details) is stored securely and used only for campaign management purposes. Data is never sold to third parties.</p></div>
              </div>

              <div className="mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-medium text-[11px]">
                By checking the agreement box, you confirm that you have read, understood, and agree to these terms.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
