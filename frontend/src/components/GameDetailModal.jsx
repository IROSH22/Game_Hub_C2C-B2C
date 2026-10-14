import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Repeat, Star, Heart, ShieldCheck, Check, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const GameDetailModal = ({ game, onClose, onRequestExchange, onInstantBuy }) => {
  const { addToCart } = useCart();
  const { user, toggleWishlist, isWishlisted } = useAuth();
  const [selectedImage, setSelectedImage] = useState(game?.imageUrl);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  const wishlisted = isWishlisted(game._id);
  const isPureBarter = game.exchangeable && (!game.price || Number(game.price) === 0);
  const isBuyable = Number(game.price) > 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6"
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Media Column */}
          <div className="space-y-4">
            <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl">
              <img
                src={selectedImage || game.imageUrl || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800';
                }}
              />
            </div>

            {/* Screenshots Thumbnails */}
            {game.screenshots && game.screenshots.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[game.imageUrl, ...game.screenshots].map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img ? 'border-cyan-400 scale-105' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <img src={img} alt="screenshot" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Game Hub Buyer & Trader Protection
              </div>
              <p>
                All disc and digital listings are guaranteed working. Pre-owned barter games are held under community trust scores.
              </p>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Tested Disc / Code
                </span>
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" /> Insured Delivery
                </span>
              </div>
            </div>
          </div>

          {/* Right Info Column */}
          <div className="flex flex-col justify-between space-y-6">
            <div>
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold font-mono">
                  {game.platform}
                </span>
                <span className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                  {game.genre}
                </span>
                <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                  {game.condition}
                </span>
                {game.stock > 0 ? (
                  <span className="text-emerald-400 text-xs font-semibold">
                    In Stock ({game.stock} available)
                  </span>
                ) : (
                  <span className="text-red-400 text-xs font-semibold">Sold Out</span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani'] leading-tight">
                {game.title}
              </h2>

              {/* Price & Rating */}
              <div className="flex items-center justify-between my-4 pb-4 border-b border-slate-800">
                <div>
                  {isPureBarter ? (
                    <div>
                      <div className="text-2xl font-black text-amber-400 font-['Rajdhani'] flex items-center gap-2">
                        <Repeat className="w-6 h-6 text-amber-400" />
                        <span>Barter Trade Listing</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">Game-for-game direct exchange (0% cash fee)</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-black text-sky-400 font-['Rajdhani']">
                        ${Number(game.price).toFixed(2)}
                      </div>
                      {game.originalPrice > game.price && (
                        <div className="text-xs text-slate-500 line-through">
                          Regular: ${Number(game.originalPrice).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-white">{game.rating || 5.0}</span>
                  <span className="text-xs text-slate-500">({game.reviewsCount || 12} ratings)</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Overview</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {game.description}
                </p>
              </div>

              {/* Exchange info if exchangeable */}
              {game.exchangeable && (
                <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                    <Repeat className="w-4 h-4" /> Barter Exchange Offer Available
                  </div>
                  <p className="text-xs text-slate-300">
                    The owner is open to exchanging this game for another game!
                  </p>
                  <div className="mt-2 text-xs text-amber-200 bg-amber-900/30 px-3 py-1.5 rounded-lg border border-amber-500/20 font-medium">
                    Owner's Wishlist: <strong>{game.wantedGames || 'Open to all console trade offers'}</strong>
                  </div>
                </div>
              )}

              {/* Seller / Gamer Profile Box */}
              <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={game.sellerId?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=trader'}
                    alt="Seller"
                    className="w-10 h-10 rounded-xl object-cover border border-sky-500/40"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">
                      {game.sellerId?.shopName || game.sellerId?.name || 'Verified Seller'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {game.sellerId?.city || 'Colombo'} • {game.sellerId?.role === 'seller' ? 'Official Store' : 'Community Gamer'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    {game.sellerId?.trustScore || 95}% Trust Score
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {game.sellerId?.successfulTrades || 15} completed transactions
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              {isBuyable && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(game)}
                    className="btn-primary py-3 text-sm cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={() => onInstantBuy(game)}
                    className="btn-secondary py-3 text-sm cursor-pointer text-center justify-center font-bold text-white bg-slate-800 hover:bg-slate-700"
                  >
                    Buy Now
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {game.exchangeable && user?.role !== 'seller' && (
                  <button
                    onClick={() => onRequestExchange(game)}
                    className="btn-exchange flex-1 py-3 text-sm cursor-pointer font-bold justify-center"
                  >
                    <Repeat className="w-4 h-4" />
                    Propose Game Trade (Barter)
                  </button>
                )}

                <button
                  onClick={() => toggleWishlist(game._id)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                    wishlisted
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-slate-950' : ''}`} />
                  <span className="hidden sm:inline">{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
