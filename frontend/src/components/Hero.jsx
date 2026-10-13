import React from 'react';
import { Sparkles, Repeat, ShieldCheck, ShoppingCart, Zap, Users } from 'lucide-react';

export const Hero = ({ onExploreStore, onExploreExchange, onOpenListTrade }) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 lg:pt-12 lg:pb-16 px-4 sm:px-6 lg:px-10">
      {/* Background Cyber Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/15 via-purple-600/15 to-pink-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] w-full mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>THE FIRST HYBRID GAMING MARKETPLACE IN SRI LANKA</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-['Rajdhani'] leading-tight">
              BUY • SELL • <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">EXCHANGE</span>
              <br />
              VIDEO GAMES
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              Why let your finished games gather dust? <span className="text-pink-400 font-semibold">Barter games directly with fellow gamers (C2C)</span> without spending money, or buy authenticated new and pre-owned hits from verified retailers (B2C).
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreExchange}
                className="btn-exchange px-6 py-3.5 text-base shadow-xl shadow-pink-500/25 flex items-center gap-3 cursor-pointer"
              >
                <Repeat className="w-5 h-5 animate-pulse" />
                <span>Go to Swap Zone (C2C)</span>
              </button>

              <button
                onClick={onExploreStore}
                className="btn-primary px-6 py-3.5 text-base shadow-xl shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Browse Store Catalog</span>
              </button>

              <button
                onClick={onOpenListTrade}
                className="btn-secondary px-5 py-3.5 text-sm cursor-pointer"
              >
                <span>+ List a Game to Trade</span>
              </button>
            </div>

            {/* Key Metric Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black font-['Rajdhani'] text-white">100%</div>
                <div className="text-xs text-slate-400 font-medium">Safe Escrow Barter</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black font-['Rajdhani'] text-cyan-400">98%</div>
                <div className="text-xs text-slate-400 font-medium">Community Trust Score</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-black font-['Rajdhani'] text-pink-400">0%</div>
                <div className="text-xs text-slate-400 font-medium">Barter Platform Fee</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Featured Showcase Card */}
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="relative glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl shadow-purple-900/20 overflow-hidden float-slow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 fill-cyan-400" /> Featured C2C Barter Deal
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  Verified Trader
                </span>
              </div>

              {/* Trade Match Box */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 relative">
                {/* Offered */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">They Offer</div>
                  <img
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600"
                    alt="God of War Ragnarök"
                    className="w-full h-28 object-cover rounded-xl border border-slate-700"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600';
                    }}
                  />
                  <div className="font-bold text-xs text-white truncate">God of War Ragnarök</div>
                  <span className="badge-ps5">PS5</span>
                </div>

                {/* Central Arrow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/50">
                  <Repeat className="w-4 h-4 animate-spin" />
                </div>

                {/* Wanted */}
                <div className="space-y-2 text-right">
                  <div className="text-[11px] font-bold text-pink-400 uppercase tracking-wider">In Return For</div>
                  <img
                    src="https://images.unsplash.com/photo-1563089145-599997674d42?w=600"
                    alt="Elden Ring Shadow"
                    className="w-full h-28 object-cover rounded-xl border border-slate-700 ml-auto"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600';
                    }}
                  />
                  <div className="font-bold text-xs text-white truncate">Elden Ring Shadow</div>
                  <span className="badge-ps5">PS5</span>
                </div>
              </div>

              {/* Gamer Trust info */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"
                    alt="Trader"
                    className="w-7 h-7 rounded-full border border-cyan-400"
                  />
                  <span>
                    <strong className="text-white">Alex Mercer</strong>
                    <span className="text-slate-400 block text-[10px]">18 Completed Trades</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-bold">96% Trust Score</div>
                  <div className="text-[10px] text-slate-400">Malabe, Colombo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
