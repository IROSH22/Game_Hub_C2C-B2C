import React from 'react';
import { Sparkles, Repeat, ShieldCheck, ShoppingCart, Zap, Store, ArrowRight, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Hero = ({ onExploreStore, onExploreExchange, onOpenListTrade, onOpenSeller }) => {
  const { user } = useAuth();
  const isSeller = user?.role === 'seller';

  return (
    <div className="relative overflow-hidden pt-6 pb-10 lg:pt-8 lg:pb-14 px-4 sm:px-6 lg:px-10">
      {/* Background Ambient Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[250px] bg-gradient-to-tr from-sky-500/10 via-blue-600/10 to-amber-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1600px] w-full mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-sky-400 text-xs font-semibold tracking-wide shadow-lg">
              <Sparkles className="w-4 h-4 text-sky-400 animate-spin" />
              <span>THE FIRST HYBRID GAMING MARKETPLACE IN SRI LANKA</span>
            </div>

            {isSeller ? (
              <>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-['Rajdhani'] leading-tight text-white">
                  EXPAND &amp; GROW YOUR <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500">
                    GAMING STOREFRONT
                  </span>
                </h1>

                <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Reach thousands of verified console and PC gamers island-wide. List new &amp; pre-owned games, manage stock in real time, and process verified orders with zero commissions.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={onExploreStore}
                    className="btn-primary px-6 py-3.5 text-base shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Browse Store Catalog</span>
                  </button>

                  <button
                    onClick={onOpenSeller}
                    className="px-6 py-3.5 text-base font-bold font-['Rajdhani'] rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-5 h-5" />
                    <span>Launch Seller Desk</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-emerald-400">0%</div>
                    <div className="text-xs text-slate-400 font-medium">Merchant Fees</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-sky-400">100%</div>
                    <div className="text-xs text-slate-400 font-medium">Real-Time Stock Sync</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-amber-400">Verified</div>
                    <div className="text-xs text-slate-400 font-medium">Store Authenticity</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-['Rajdhani'] leading-tight text-white">
                  BUY • SELL • <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-blue-500">EXCHANGE</span>
                  <br />
                  VIDEO GAMES
                </h1>

                <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                  Why let your finished games gather dust? <span className="text-amber-400 font-semibold">Barter games directly with fellow gamers</span> for zero cash, or purchase authenticated copies from verified video game merchants.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    onClick={onExploreExchange}
                    className="btn-exchange px-6 py-3.5 text-base shadow-xl flex items-center gap-3 cursor-pointer"
                  >
                    <Repeat className="w-5 h-5" />
                    <span>Go to Game Swap Zone</span>
                  </button>

                  <button
                    onClick={onExploreStore}
                    className="btn-primary px-6 py-3.5 text-base shadow-xl flex items-center gap-2 cursor-pointer"
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

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-white">100%</div>
                    <div className="text-xs text-slate-400 font-medium">Safe Escrow Barter</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-sky-400">98%</div>
                    <div className="text-xs text-slate-400 font-medium">Community Trust Score</div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-2xl font-black font-['Rajdhani'] text-amber-400">0%</div>
                    <div className="text-xs text-slate-400 font-medium">Barter Platform Fee</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Featured Deal or Merchant Card */}
          <div className="w-full max-w-md lg:max-w-lg">
            <div className="relative glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl overflow-hidden float-slow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5 font-['Rajdhani']">
                  <Zap className="w-4 h-4 fill-sky-400" /> {isSeller ? 'Top Merchant Desk' : 'Verified Community Barter'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  Verified Trader
                </span>
              </div>

              {/* Trade Match Box or Merchant Box */}
              <div className="grid grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 relative">
                {/* Offered */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-['Rajdhani']">
                    {isSeller ? 'Featured Title' : 'They Offer'}
                  </div>
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg font-bold">
                  {isSeller ? <Package className="w-4 h-4" /> : <Repeat className="w-4 h-4 animate-spin" />}
                </div>

                {/* Wanted */}
                <div className="space-y-2 text-right">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-['Rajdhani']">
                    {isSeller ? 'Store Stock' : 'In Return For'}
                  </div>
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

              {/* Trust Info */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"
                    alt="Trader"
                    className="w-7 h-7 rounded-full border border-sky-400 object-cover"
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
