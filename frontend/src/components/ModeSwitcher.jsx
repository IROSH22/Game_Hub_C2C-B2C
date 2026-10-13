import React from 'react';
import { ShoppingBag, Repeat, ShieldCheck, Sparkles, Flame, CheckCircle } from 'lucide-react';

export const ModeSwitcher = ({ activeView, setActiveView, gamesCount = 12, barterCount = 4 }) => {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 my-6">
      <div className="relative rounded-3xl p-1.5 sm:p-2 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-pink-500/20 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        {/* Glow ambient effect */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 blur-xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Option 1: B2C Video Games Store */}
          <button
            type="button"
            onClick={() => setActiveView('store')}
            className={`relative rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden border ${
              activeView === 'store'
                ? 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-blue-950/80 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.01]'
                : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeView === 'store' && (
              <span className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    activeView === 'store'
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-400/40'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-lg sm:text-xl font-black font-['Rajdhani'] tracking-wide ${
                        activeView === 'store' ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      B2C VIDEO GAMES STORE
                    </h3>
                    {activeView === 'store' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 uppercase">
                        <CheckCircle className="w-3 h-3" /> Active Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Buy factory-sealed new &amp; certified pre-owned discs directly from verified shops
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                  {gamesCount} Verified Titles
                </span>
                <span className="text-[10px] text-slate-400 mt-1">Express Island Delivery</span>
              </div>
            </div>
          </button>

          {/* Option 2: C2C Game Barter Hub (Swap Zone) */}
          <button
            type="button"
            onClick={() => setActiveView('exchange')}
            className={`relative rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 cursor-pointer overflow-hidden border ${
              activeView === 'exchange'
                ? 'bg-gradient-to-br from-purple-950/90 via-slate-900 to-pink-950/80 border-pink-400 shadow-xl shadow-pink-500/20 scale-[1.01]'
                : 'bg-slate-950/60 hover:bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeView === 'exchange' && (
              <span className="absolute top-0 right-0 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    activeView === 'exchange'
                      ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/40'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  <Repeat className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-lg sm:text-xl font-black font-['Rajdhani'] tracking-wide ${
                        activeView === 'exchange' ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      C2C SWAP ZONE (BARTER HUB)
                    </h3>
                    {activeView === 'exchange' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase">
                        <Flame className="w-3 h-3 text-pink-400" /> Active Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                    Gamer-to-Gamer disc exchange: barter your completed game for another title with 0% fee
                  </p>
                </div>
              </div>

              {/* Status pill */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-xl border border-pink-500/20">
                  {barterCount} Live Barter Offers
                </span>
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3 h-3" /> 100% Escrow Safe
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
