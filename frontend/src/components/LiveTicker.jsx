import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
  '🔥 Grand Theft Auto VI pre-orders surging across Colombo & Western Province',
  '🔄 Peer-to-Peer Barter Completed: Cyberpunk 2077 ⇄ Elden Ring (0% Fee, Safe Escrow)',
  '⭐ EA Sports FC 25 hit a 4.9 average rating with 100% authentic disc verification',
  '🛡️ 100% Escrow Buyer & Trade Protection active on all island-wide video game exchanges',
  '🎉 Verified Merchant "Nexus Gaming Official" restocked 20+ PS5, Xbox & PC hits',
  '💥 Special Promotion: Use code GAMER10 for 10% off store purchases today',
  '🚚 Island-wide express delivery active: Colombo, Kandy, Galle, Negombo, Jaffna',
];

export const LiveTicker = () => {
  const loop = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 select-none">
      <div className="max-w-[1600px] mx-auto flex items-center py-2 px-4 sm:px-6 lg:px-10 gap-3">
        {/* Pulsing Live Badge */}
        <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="flex items-center gap-1 font-['Rajdhani'] font-extrabold">
            <Flame className="w-3 h-3 text-amber-400" /> LIVE TICKER
          </span>
        </div>

        {/* Marquee Text Stream */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs text-slate-300 font-medium">
            {loop.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Escrow badge right side */}
        <div className="hidden lg:flex shrink-0 items-center gap-1.5 text-[11px] text-emerald-400 font-bold font-mono">
          <Sparkles className="w-3 h-3 animate-spin" /> ESCROW VERIFIED
        </div>
      </div>
    </div>
  );
};
