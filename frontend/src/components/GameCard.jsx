import React from 'react';
import { ShoppingCart, Repeat, Star, Heart, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const GameCard = ({ game, onSelect, onRequestExchange }) => {
  const { addToCart } = useCart();
  const { user, toggleWishlist, isWishlisted } = useAuth();

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'PS5':
      case 'PS4':
        return <span className="badge-ps5">PS5</span>;
      case 'Xbox Series X':
      case 'Xbox One':
        return <span className="badge-xbox">XBOX</span>;
      case 'Nintendo Switch':
        return <span className="badge-nintendo">SWITCH</span>;
      default:
        return <span className="badge-pc">PC</span>;
    }
  };

  const wishlisted = isWishlisted(game._id);

  const FALLBACK_COVER = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800';

  return (
    <div className="group glass-panel rounded-2xl border border-slate-800/80 overflow-hidden game-card-hover flex flex-col justify-between relative">
      {/* Top Media Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onSelect(game)}>
        <img
          src={game.imageUrl || FALLBACK_COVER}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_COVER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          {getPlatformBadge(game.platform)}
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
              game.condition === 'Brand New'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {game.condition}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(game._id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all ${
            wishlisted
              ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/40'
              : 'bg-slate-950/60 text-slate-300 hover:text-pink-400 border border-slate-700/60'
          }`}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Barter Exchange Banner on bottom edge if exchangeable */}
        {game.exchangeable && (
          <div className="absolute bottom-2 left-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-pink-950/80 border border-pink-500/40 text-[11px] text-pink-300 font-semibold flex items-center justify-between backdrop-blur-md">
            <span className="flex items-center gap-1">
              <Repeat className="w-3.5 h-3.5 text-pink-400" />
              Available to Exchange
            </span>
            <span className="text-[10px] text-pink-200 truncate max-w-[120px]">
              Wants: {game.wantedGames || 'Any trade'}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="text-cyan-400 font-medium">{game.genre}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold text-xs">{game.rating || 5.0}</span>
            </div>
          </div>

          <h3
            className="font-bold text-lg text-white font-['Rajdhani'] leading-snug hover:text-cyan-400 transition-colors cursor-pointer truncate"
            onClick={() => onSelect(game)}
            title={game.title}
          >
            {game.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1 mb-3">
            {game.description}
          </p>
        </div>

        {/* Seller Info & Trust Score */}
        <div className="pt-2 border-t border-slate-800/80 mb-3 flex items-center justify-between text-[11px]">
          <span className="text-slate-400 truncate max-w-[140px]">
            By <strong className="text-slate-200">{game.sellerId?.shopName || game.sellerId?.name || 'Store'}</strong>
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {game.sellerId?.trustScore || 95}% Trust
          </span>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <div>
            <div className="text-xl font-extrabold text-white font-['Rajdhani']">
              ${Number(game.price).toFixed(2)}
            </div>
            {game.originalPrice > game.price && (
              <div className="text-xs text-slate-500 line-through">
                ${Number(game.originalPrice).toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {game.exchangeable ? (
              <button
                onClick={() => onRequestExchange(game)}
                className="btn-exchange text-xs px-3 py-2 cursor-pointer"
                title="Propose Game Barter"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Trade</span>
              </button>
            ) : null}

            <button
              onClick={() => addToCart(game)}
              className="btn-primary text-xs px-3 py-2 cursor-pointer"
              title="Add to Shopping Cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
