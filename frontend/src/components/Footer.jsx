import React from 'react';
import {
  Gamepad2,
  ShieldCheck,
  Heart,
  Repeat,
  Truck,
  CreditCard,
  Sparkles,
  Lock,
  Headphones,
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md pt-12 pb-8 px-4 sm:px-6 lg:px-10 text-xs text-slate-400">
      <div className="max-w-[1600px] w-full mx-auto space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-extrabold text-xl text-white font-['Rajdhani']">
                GAME<span className="text-cyan-400">HUB</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              The First Hybrid E-Commerce and Video Game Barter Marketplace in Sri Lanka. Buy authentic physical discs or barter game-for-game with zero fees.
            </p>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Escrow Protected &amp; Verified
            </div>
          </div>

          {/* Gamer Care & Quick Support */}
          <div className="space-y-2.5 md:col-span-1">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-['Rajdhani'] flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              Gamer Care &amp; Support
            </h4>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p className="text-slate-300">
                Need help with an order or barter trade? Our gamer support team is available 24/7.
              </p>
              <div className="space-y-1 text-[11px]">
                <p><span className="text-slate-500 font-medium">Hotline:</span> <span className="text-cyan-400 font-semibold">+94 11 234 5678</span></p>
                <p><span className="text-slate-500 font-medium">Email:</span> <span className="text-pink-400 font-semibold">support@gamehub.lk</span></p>
                <p><span className="text-slate-500 font-medium">Hub:</span> <span className="text-slate-300">Colombo 03, Sri Lanka</span></p>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Supported Payments:</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 font-mono">VISA / MASTER</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 font-mono">GENIE</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 font-mono">KOKO</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-300 font-mono">COD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Trust & Buyer Protection Guarantees (Replacing Individual Member Division) */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider font-['Rajdhani'] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Platform Guarantees &amp; Buyer Protection
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              {/* Feature 1 */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold font-['Rajdhani'] tracking-wide">100% SAFE ESCROW TRADING</div>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                    Zero-risk game barter. Both game discs are inspected and verified before transfer completes.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-pink-500/20 hover:border-pink-500/40 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Repeat className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold font-['Rajdhani'] tracking-wide">0% COMMISSION GAME SWAP</div>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                    Gamers barter directly with fellow gamers with no middleman fees or mandatory subscriptions.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold font-['Rajdhani'] tracking-wide">ISLAND-WIDE DOORSTEP DELIVERY</div>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                    Tracked, insured dispatch covering all 25 districts with 24–48 hour delivery windows.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 transition-all flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-bold font-['Rajdhani'] tracking-wide">SECURE PAYMENT GATEWAYS</div>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">
                    Card payments, installment plans via Koko, Genie, Bank Transfer, and Cash on Delivery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© 2026 Game Hub Hybrid E-Commerce Platform. All Rights Reserved.</div>
          <div className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> for Gamers &amp; Collectors
          </div>
        </div>
      </div>
    </footer>
  );
};
