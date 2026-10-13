import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Repeat,
  ShoppingCart,
  ShieldCheck,
  Tag,
  ArrowRight,
  Store,
  Flame,
} from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    tag: 'EXCLUSIVE PRE-ORDER • SAVE 10% CODE: GAMER10',
    title: 'GRAND THEFT AUTO VI',
    subtitle: 'Next-Generation Vice City Has Arrived',
    description: 'Immerse in the biggest, most interactive open-world criminal sandbox ever built with breathtaking ray-traced graphics and living ecosystems.',
    priceTag: '$69.99',
    originalPrice: '$79.99',
    platforms: ['PS5', 'Xbox Series X'],
    badgeColor: 'from-pink-500 to-purple-600',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&auto=format&fit=crop&q=80',
    primaryBtn: { text: 'Explore Game Store', action: 'store' },
    secondaryBtn: { text: 'View Swap Zone', action: 'exchange' },
  },
  {
    id: 2,
    tag: 'REVOLUTIONARY C2C BARTER • ZERO FEES',
    title: 'COMMUNITY SWAP ZONE',
    subtitle: 'Trade Finished Games for Zero Cash',
    description: 'Done playing Elden Ring or God of War? Barter game-for-game directly with fellow gamers. Protected with automated Trust Scores and delivery tracking.',
    priceTag: '$0 Cash Trade',
    originalPrice: null,
    platforms: ['PS5', 'Xbox', 'PC', 'Nintendo'],
    badgeColor: 'from-cyan-500 to-blue-600',
    bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&auto=format&fit=crop&q=80',
    primaryBtn: { text: 'Enter Swap Zone (C2C)', action: 'exchange' },
    secondaryBtn: { text: '+ List a Game to Trade', action: 'list_trade' },
  },
  {
    id: 3,
    tag: 'WEEKEND SPOTLIGHT • VERIFIED STORES',
    title: 'BLACK MYTH: WUKONG & RPG HITS',
    subtitle: 'Epic Mythological Battles & Cinematic Combat',
    description: 'Unleash ancient combat prowess as the Destined One. Get certified factory-sealed copies from authorized retailers with guaranteed authenticity.',
    priceTag: '$59.99',
    originalPrice: '$69.99',
    platforms: ['PC', 'PS5'],
    badgeColor: 'from-amber-500 to-orange-600',
    bgImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1400&auto=format&fit=crop&q=80',
    primaryBtn: { text: 'Shop RPG Catalog', action: 'store' },
    secondaryBtn: { text: 'Check Wishlist Matches', action: 'wishlist' },
  },
  {
    id: 4,
    tag: 'BECOME A MERCHANT • ZERO COMMISSIONS',
    title: 'SELL & GROW YOUR SHOP',
    subtitle: 'Turn Your Gaming Stock into Nationwide Revenue',
    description: 'Reach thousands of passionate console and PC gamers. Complete with live inventory control, real-time sales analytics, and automated email receipts.',
    priceTag: 'Instant Merchant Payouts',
    originalPrice: null,
    platforms: ['B2C Store Portal'],
    badgeColor: 'from-emerald-500 to-teal-600',
    bgImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&auto=format&fit=crop&q=80',
    primaryBtn: { text: 'Launch Seller Portal', action: 'seller' },
    secondaryBtn: { text: 'Explore Store', action: 'store' },
  },
];

export const HeroSlider = ({
  onExploreStore,
  onExploreExchange,
  onOpenListTrade,
  onOpenWishlist,
  onOpenSeller,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleAction = (action) => {
    switch (action) {
      case 'store':
        if (onExploreStore) onExploreStore();
        break;
      case 'exchange':
        if (onExploreExchange) onExploreExchange();
        break;
      case 'list_trade':
        if (onOpenListTrade) onOpenListTrade();
        break;
      case 'wishlist':
        if (onOpenWishlist) onOpenWishlist();
        break;
      case 'seller':
        if (onOpenSeller) onOpenSeller();
        break;
      default:
        break;
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[currentSlide];

  return (
    <div
      className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-4 pb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider Frame */}
      <div className="relative rounded-3xl overflow-hidden min-h-[460px] sm:min-h-[500px] border border-slate-700/80 shadow-2xl shadow-cyan-950/20 bg-slate-950 flex items-center">
        {/* Background Image with Dark Cyber Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-105"
          style={{ backgroundImage: `url(${slide.bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/50 to-slate-950" />

        {/* Content Box */}
        <div className="relative z-10 max-w-2xl p-6 sm:p-12 space-y-5 animate-in fade-in slide-in-from-left duration-500 key={currentSlide}">
          {/* Promotional Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-white shadow-lg">
            <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${slide.badgeColor} animate-ping`} />
            <span className="font-['Rajdhani'] tracking-wider uppercase text-cyan-400">
              {slide.tag}
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-['Rajdhani'] text-white tracking-wide leading-tight drop-shadow-md">
              {slide.title}
            </h1>
            <h2 className="text-sm sm:text-lg text-pink-400 font-semibold tracking-wide mt-1">
              {slide.subtitle}
            </h2>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
            {slide.description}
          </p>

          {/* Platform Pills & Price Indicator */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              {slide.platforms.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold font-mono"
                >
                  {p}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
              <span className="text-sm sm:text-base font-black text-white font-['Rajdhani']">
                {slide.priceTag}
              </span>
              {slide.originalPrice && (
                <span className="text-xs text-slate-500 line-through">
                  {slide.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => handleAction(slide.primaryBtn.action)}
              className="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-cyan-500/30 flex items-center gap-2 cursor-pointer"
            >
              <span>{slide.primaryBtn.text}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleAction(slide.secondaryBtn.action)}
              className="btn-secondary py-3 px-5 text-sm font-semibold cursor-pointer bg-slate-900/80 border-slate-700 hover:border-slate-500"
            >
              <span>{slide.secondaryBtn.text}</span>
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-white transition-all cursor-pointer z-20 hover:scale-110 shadow-lg"
          title="Previous Banner"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-slate-700/80 text-white transition-all cursor-pointer z-20 hover:scale-110 shadow-lg"
          title="Next Banner"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-full border border-slate-800">
          {SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx
                  ? 'w-7 bg-gradient-to-r from-cyan-400 to-pink-500 shadow-md shadow-cyan-500/50'
                  : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
