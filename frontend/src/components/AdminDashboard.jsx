import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Gamepad2,
  DollarSign,
  Repeat,
  ShoppingBag,
  Check,
  Ban,
  Star,
  X,
  AlertTriangle,
  Database,
  ExternalLink,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';

export const AdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | users | games | exchanges | orders | database
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [orders, setOrders] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase State
  const [supabaseKeys, setSupabaseKeys] = useState({
    anonKey: typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_anon_key') || '' : '',
    serviceRoleKey: '',
  });
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, uRes, gRes, oRes, exRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getAdminGames(),
        api.getAdminOrders(),
        api.getAdminExchanges(),
      ]);

      if (ovRes.success) setOverview(ovRes.stats);
      if (uRes.success) setUsers(uRes.users || []);
      if (gRes.success) setGames(gRes.games || []);
      if (oRes.success) setOrders(oRes.orders || []);
      if (exRes.success) setExchanges(exRes.exchanges || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const loadSupabaseStatus = async () => {
    try {
      const res = await api.getSupabaseStatus();
      if (res && res.success) {
        setSupabaseStatus(res.supabase);
      }
    } catch (e) {
      console.warn('Failed to load Supabase status:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
    loadSupabaseStatus();
  }, []);

  const handleSaveSupabase = async (e) => {
    e.preventDefault();
    try {
      if (supabaseKeys.anonKey) {
        localStorage.setItem('gamehub_supabase_anon_key', supabaseKeys.anonKey);
      }
      const res = await api.saveSupabaseConfig(supabaseKeys);
      setSupabaseSaved(true);
      setTimeout(() => setSupabaseSaved(false), 3000);
      loadSupabaseStatus();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await api.toggleUserBan(userId);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFeature = async (gameId) => {
    try {
      await api.toggleFeatureGame(gameId);
      loadAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl glass-panel rounded-3xl border border-amber-500/40 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800 pr-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider font-['Rajdhani']">
                Platform Master Oversight
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
                Game Hub Administrator Panel
              </h2>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>PRIMARY DB: Supabase (mdemadyzfrlmymwgmelk)</span>
          </div>
        </div>

        {/* Global KPI Cards */}
        {overview && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-6">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Total Users
              </span>
              <div className="text-2xl font-black text-cyan-400 font-['Rajdhani']">
                {overview.totalUsers}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Catalog Games
              </span>
              <div className="text-2xl font-black text-white font-['Rajdhani']">
                {overview.totalGames}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Store Orders
              </span>
              <div className="text-2xl font-black text-emerald-400 font-['Rajdhani']">
                {overview.totalOrders}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Barter Trades
              </span>
              <div className="text-2xl font-black text-pink-400 font-['Rajdhani']">
                {overview.totalExchanges}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-amber-400 font-['Rajdhani']">
                ${overview.totalPlatformRevenue.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
          {['overview', 'users', 'games', 'exchanges', 'orders', 'database'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === t
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'database' && <Database className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{t === 'database' ? 'Supabase Database' : t}</span>
            </button>
          ))}
        </div>

        {/* TAB: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto max-h-[50vh] pr-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Trust Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={u.profileImage}
                        alt={u.name}
                        className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold uppercase text-[11px] text-cyan-400">
                      {u.role}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-400">{u.trustScore || 95}%</span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({u.successfulTrades || 0} trades)
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isBanned
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleBan(u._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          u.isBanned
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        }`}
                      >
                        {u.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: GAMES MANAGEMENT */}
        {activeTab === 'games' && (
          <div className="overflow-x-auto max-h-[50vh] pr-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="p-3">Game Title</th>
                  <th className="p-3">Seller / Gamer</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Price</th>
                  <th className="p-3 text-right">Featured on Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {games.map((g) => (
                  <tr key={g._id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-bold text-white">{g.title}</td>
                    <td className="p-3 text-slate-300">{g.sellerId?.name}</td>
                    <td className="p-3 text-cyan-400 font-semibold">{g.platform}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          g.exchangeable
                            ? 'bg-pink-500/20 text-pink-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {g.exchangeable ? 'C2C Barter' : 'B2C Store'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">${g.price.toFixed(2)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleFeature(g._id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          g.isFeatured
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {g.isFeatured ? '★ Featured' : 'Not Featured'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: EXCHANGES MONITORING */}
        {(activeTab === 'exchanges' || activeTab === 'overview') && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Live Platform Barter Trades Monitoring
            </h4>
            {exchanges.map((ex) => (
              <div
                key={ex._id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{ex.requesterId?.name}</span> offered{' '}
                  <strong className="text-cyan-400">{ex.offeredListingId?.title}</strong> to{' '}
                  <span className="font-bold text-white">{ex.receiverId?.name}</span> for{' '}
                  <strong className="text-pink-400">{ex.wantedListingId?.title}</strong>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200">
                  {ex.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB: SUPABASE DATABASE MANAGEMENT */}
        {activeTab === 'database' && (
          <div className="space-y-6 max-h-[55vh] overflow-y-auto pr-1">
            {/* Top Info Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-['Rajdhani']">
                  <Database className="w-4 h-4" /> Supabase PostgreSQL Database Integration
                </div>
                <p className="text-xs text-slate-300">
                  Target Project: <code className="text-emerald-300 font-mono font-bold">https://mdemadyzfrlmymwgmelk.supabase.co</code>
                </p>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    {supabaseStatus?.status || 'Configured (https://mdemadyzfrlmymwgmelk.supabase.co)'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://supabase.com/dashboard/project/mdemadyzfrlmymwgmelk/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>1. Get API Keys</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://supabase.com/dashboard/project/mdemadyzfrlmymwgmelk/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>2. Open SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Save Keys Form */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-['Rajdhani'] uppercase tracking-wider flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Supabase Project API Credentials
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Connector
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Paste your <strong>anon public key</strong> and optional <strong>service_role key</strong> from your Supabase dashboard to activate live data synchronization:
                </p>

                <form onSubmit={handleSaveSupabase} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Supabase Anon (Public) Key:
                    </label>
                    <input
                      type="text"
                      value={supabaseKeys.anonKey}
                      onChange={(e) => setSupabaseKeys({ ...supabaseKeys, anonKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      Supabase Service Role (Secret) Key (Optional):
                    </label>
                    <input
                      type="password"
                      value={supabaseKeys.serviceRoleKey}
                      onChange={(e) => setSupabaseKeys({ ...supabaseKeys, serviceRoleKey: e.target.value })}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Save &amp; Connect to Supabase Live
                  </button>

                  {supabaseSaved && (
                    <div className="text-[11px] text-emerald-400 text-center font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/30">
                      ✓ Connected successfully to https://mdemadyzfrlmymwgmelk.supabase.co!
                    </div>
                  )}
                </form>
              </div>

              {/* Box 2: SQL Schema & Migration Info */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="font-bold text-white text-sm font-['Rajdhani'] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Supabase Schema Migration (1-Click)
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  The complete SQL migration script has been prepared in your project root at <code className="text-cyan-400 font-bold">supabase_schema.sql</code>. It creates all tables and seeds initial games:
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ users
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ game_listings
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ orders
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ order_items
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ exchange_requests
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ notifications
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ email_logs
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    ✓ reviews
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <strong className="text-emerald-400 block font-['Rajdhani']">How to Run in Supabase:</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click <strong>"2. Open SQL Editor"</strong> above.</li>
                    <li>Copy all contents of <code>supabase_schema.sql</code>.</li>
                    <li>Paste into the SQL Editor and click <strong>"Run"</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
