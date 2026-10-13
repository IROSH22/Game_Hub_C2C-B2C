import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Sparkles,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  ArrowRightLeft,
  Flame,
  Award,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExchangeHub = ({ onRequestExchange, onOpenListTrade, onOpenMyTrades, onOpenAuth }) => {
  const { user } = useAuth();
  const [exchangeListings, setExchangeListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  const fetchExchangeListings = async () => {
    setLoading(true);
    try {
      const res = await api.getExchangeListings({
        platform: selectedPlatform,
        search: searchTerm,
      });
      if (res.success) {
        setExchangeListings(res.listings || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExchangeListings();
  }, [selectedPlatform]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExchangeListings();
  };

  const platforms = ['All', 'PS5', 'Xbox Series X', 'PC', 'Nintendo Switch'];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] w-full mx-auto space-y-8">
      {/* C2C Swap Zone Hero Banner */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-10 border border-pink-500/30 overflow-hidden shadow-2xl shadow-pink-950/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold tracking-wider uppercase">
              <ArrowRightLeft className="w-3.5 h-3.5 text-pink-400" />
              C2C Video Game Barter System
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-['Rajdhani'] text-white leading-tight">
              COMMUNITY <span className="text-pink-400 glow-text-pink">SWAP ZONE</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Trade your completed games directly with other gamers! No cash required—just game-for-game barter backed by community <span className="text-emerald-400 font-semibold">Trust Scores</span> and delivery tracking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  onOpenListTrade();
                }
              }}
              className="btn-exchange py-3.5 px-6 text-sm font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              List a Game to Trade
            </button>

            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth();
                } else {
                  onOpenMyTrades();
                }
              }}
              className="btn-secondary py-3.5 px-5 text-sm flex items-center justify-center gap-2 cursor-pointer bg-slate-900 border-slate-700"
            >
              <Repeat className="w-4 h-4 text-cyan-400" />
              My Trade Desk
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search game or what gamer wants..."
            className="w-full h-12 pl-14 pr-4 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 transition-colors shadow-inner"
          />
        </form>

        {/* Platform tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {platforms.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedPlatform === p
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Exchange Games Grid */}
      {loading ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-['Rajdhani'] font-bold">Scanning available trade offers...</p>
        </div>
      ) : exchangeListings.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 border border-slate-800">
          <Repeat className="w-12 h-12 text-pink-400 mx-auto opacity-50" />
          <h3 className="text-xl font-bold text-white font-['Rajdhani']">No Active Trade Offers Found</h3>
          <p className="text-sm text-slate-400">
            Be the first gamer in your area to put a game up for barter!
          </p>
          <button
            onClick={() => (user ? onOpenListTrade() : onOpenAuth())}
            className="btn-exchange px-6 py-2.5 text-sm cursor-pointer mx-auto"
          >
            + Post the First Trade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {exchangeListings.map((item) => (
            <div
              key={item._id}
              className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden hover:border-pink-500/40 transition-all duration-300 flex flex-col justify-between group shadow-lg"
            >
              {/* Media */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="badge-ps5">{item.platform}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.condition}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 backdrop-blur-md flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Est. Trade Value</span>
                  <span className="text-cyan-400 font-bold font-['Rajdhani'] text-sm">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white font-['Rajdhani'] truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {item.description}
                  </p>

                  {/* Wanted Trade Banner */}
                  <div className="mt-3 p-3 rounded-xl bg-pink-950/30 border border-pink-500/30 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                      <Repeat className="w-3 h-3" /> Gamer Wants in Return:
                    </div>
                    <div className="text-xs font-semibold text-white truncate">
                      {item.wantedGames || 'Open to all console trade offers!'}
                    </div>
                  </div>
                </div>

                {/* Owner Info & Trust Score */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.sellerId?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=gamer'}
                      alt="Owner"
                      className="w-8 h-8 rounded-full border border-pink-400/40 object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-[120px]">
                        {item.sellerId?.name || 'Gamer'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.sellerId?.city || 'Colombo'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {item.sellerId?.trustScore || 95}% Trust
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.sellerId?.successfulTrades || 0} Trades
                    </span>
                  </div>
                </div>

                {/* Request Button */}
                <button
                  onClick={() => {
                    if (!user) onOpenAuth();
                    else onRequestExchange(item);
                  }}
                  className="btn-exchange w-full py-2.5 text-xs font-bold justify-center cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  Make a Trade Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
