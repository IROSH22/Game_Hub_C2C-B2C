import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Repeat,
  ShoppingBag,
  Sparkles,
  Gamepad2,
  TrendingUp,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { Hero } from './components/Hero';
import { ModeSwitcher } from './components/ModeSwitcher';
import { GameCard } from './components/GameCard';
import { GameDetailModal } from './components/GameDetailModal';
import { ExchangeHub } from './components/ExchangeHub';
import { ExchangeRequestModal } from './components/ExchangeRequestModal';
import { MyExchangesModal } from './components/MyExchangesModal';
import { AddExchangeListingModal } from './components/AddExchangeListingModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { WishlistModal } from './components/WishlistModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { EmailCenterModal } from './components/EmailCenterModal';
import { AuthModal } from './components/AuthModal';
import { BackToTop } from './components/BackToTop';
import { Footer } from './components/Footer';
import { api } from './services/api';

function MainApp() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Navigation State
  const [activeView, setActiveView] = useState('store'); // 'store' | 'exchange'

  // Modals
  const [selectedGame, setSelectedGame] = useState(null);
  const [exchangeTargetGame, setExchangeTargetGame] = useState(null);
  const [showMyExchanges, setShowMyExchanges] = useState(false);
  const [showAddTradeListing, setShowAddTradeListing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showSeller, setShowSeller] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEmailCenter, setShowEmailCenter] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Store Catalog Data & Filters
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyExchangeable, setOnlyExchangeable] = useState(false);

  const fetchGames = async (searchOverride = null) => {
    setLoadingGames(true);
    try {
      const filters = {};
      const activeSearch = searchOverride !== null ? searchOverride : searchTerm;
      if (activeSearch) filters.search = activeSearch;
      if (selectedPlatform !== 'All') filters.platform = selectedPlatform;
      if (selectedGenre !== 'All') filters.genre = selectedGenre;
      if (selectedCondition !== 'All') filters.condition = selectedCondition;
      if (onlyExchangeable) filters.exchangeable = 'true';
      if (sortBy === 'price_asc') filters.sort = 'price_asc';
      if (sortBy === 'price_desc') filters.sort = 'price_desc';
      if (sortBy === 'rating') filters.sort = 'rating';

      const res = await api.getGames(filters);
      if (res && res.success) {
        setGames(res.games || []);
      }
    } catch (err) {
      console.error('Fetch games error:', err);
    }
    setLoadingGames(false);
  };

  useEffect(() => {
    fetchGames();
  }, [selectedPlatform, selectedGenre, selectedCondition, sortBy, onlyExchangeable]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchGames();
  };

  const handleQuickSearch = (term) => {
    setSearchTerm(term);
    fetchGames(term);
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchGames('');
  };

  const platforms = [
    { name: 'All', label: 'All Platforms', icon: '🎮', color: 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black border-cyan-400' },
    { name: 'PS5', label: 'PlayStation 5', icon: '⚡', color: 'bg-[#003791] text-white border-blue-400' },
    { name: 'Xbox Series X', label: 'Xbox Series X', icon: '💚', color: 'bg-[#107c10] text-white border-green-400' },
    { name: 'PC', label: 'PC Steam / Win', icon: '💻', color: 'bg-[#6b21a8] text-white border-purple-400' },
    { name: 'Nintendo Switch', label: 'Nintendo Switch', icon: '🔴', color: 'bg-[#e60012] text-white border-red-400' },
  ];

  const genres = ['All', 'Action', 'RPG', 'Adventure', 'Sports', 'Open World', 'Shooter', 'Racing', 'Horror'];
  const POPULAR_SEARCHES = ['GTA VI', 'EA FC 25', 'Spider-Man 2', 'Black Myth Wukong', 'Elden Ring', 'Cyberpunk 2077'];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation Bar */}
      <Navbar
        onOpenAuth={() => setShowAuth(true)}
        onOpenCart={() => setShowCart(true)}
        onOpenExchangeHub={() => setActiveView('exchange')}
        onOpenMyExchanges={() => setShowMyExchanges(true)}
        onOpenOrders={() => setShowOrders(true)}
        onOpenWishlist={() => setShowWishlist(true)}
        onOpenSeller={() => setShowSeller(true)}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenEmailCenter={() => setShowEmailCenter(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="flex-1">
        {/* NEW FEATURE: Auto-Sliding Promotional Banner Carousel */}
        <HeroSlider
          onExploreStore={() => {
            setActiveView('store');
            window.scrollTo({ top: 950, behavior: 'smooth' });
          }}
          onExploreExchange={() => setActiveView('exchange')}
          onOpenListTrade={() => {
            if (!user) setShowAuth(true);
            else setShowAddTradeListing(true);
          }}
          onOpenWishlist={() => setShowWishlist(true)}
          onOpenSeller={() => {
            if (!user) setShowAuth(true);
            else setShowSeller(true);
          }}
        />

        {/* Hero Concept & Trust Breakdown */}
        <Hero
          onExploreStore={() => {
            setActiveView('store');
            window.scrollTo({ top: 950, behavior: 'smooth' });
          }}
          onExploreExchange={() => setActiveView('exchange')}
          onOpenListTrade={() => {
            if (!user) setShowAuth(true);
            else setShowAddTradeListing(true);
          }}
        />

        {/* Interactive Dual-Mode Switcher: B2C Store vs C2C Swap Zone */}
        <ModeSwitcher
          activeView={activeView}
          setActiveView={setActiveView}
          gamesCount={games.length}
          barterCount={4}
        />

        {/* VIEW 1: STORE CATALOG (B2C & C2C DIRECT BUY) */}
        {activeView === 'store' && (
          <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8" id="catalog-section">
            {/* Cyberpunk Gaming Command Console (Search & Filter Engine) */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl shadow-cyan-950/20 space-y-6">
              {/* Row 1: High-Contrast Search Bar & Trending Queries */}
              <div className="space-y-3">
                <form onSubmit={handleSearchSubmit} className="relative w-full">
                  <div className="relative flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 absolute left-3 pointer-events-none shadow-sm">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search game titles (e.g. GTA VI, EA FC 25, Spider-Man 2, Black Myth Wukong, Elden Ring)..."
                      className="w-full h-14 pl-16 pr-36 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all shadow-inner font-medium"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-28 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-all"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="submit"
                      className="absolute right-2.5 h-10 px-5 btn-primary text-xs font-black rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </form>

                {/* Trending Queries Pill Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1 font-['Rajdhani']">
                    <Sparkles className="w-3.5 h-3.5" /> Trending Searches:
                  </span>
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickSearch(tag)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        searchTerm === tag
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Hardware Platform Selector with Glowing Hardware Chips */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-['Rajdhani']">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" /> Filter by Hardware Platform:
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {games.length} Titles Found
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
                  {platforms.map((p) => {
                    const isSelected = selectedPlatform === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => setSelectedPlatform(p.name)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 justify-center ${
                          isSelected
                            ? `${p.color} shadow-lg shadow-cyan-500/25 scale-[1.02]`
                            : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-base">{p.icon}</span>
                        <span className="font-['Rajdhani'] font-bold tracking-wide">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Secondary Filters & Barter Toggle */}
              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
                {/* Genre Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-['Rajdhani']">
                    Game Genre:
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
                  >
                    {genres.map((g) => (
                      <option key={g} value={g} className="bg-slate-900 text-white">
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-['Rajdhani']">
                    Disc Condition:
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
                  >
                    <option value="All" className="bg-slate-900 text-white">All Conditions</option>
                    <option value="Brand New" className="bg-slate-900 text-white">Brand New (Sealed Copy)</option>
                    <option value="Like New" className="bg-slate-900 text-white">Pre-Owned (Like New / Mint)</option>
                    <option value="Good" className="bg-slate-900 text-white">Pre-Owned (Good Tested)</option>
                  </select>
                </div>

                {/* Sorting Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-['Rajdhani']">
                    Sort Catalog:
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-11 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400 cursor-pointer shadow-inner"
                  >
                    <option value="featured" className="bg-slate-900 text-white">Featured First</option>
                    <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High</option>
                    <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low</option>
                    <option value="rating" className="bg-slate-900 text-white">Top Community Rating</option>
                  </select>
                </div>

                {/* Barter Games Only Toggle */}
                <div className="flex flex-col gap-1.5 sm:self-end">
                  <button
                    type="button"
                    onClick={() => setOnlyExchangeable(!onlyExchangeable)}
                    className={`h-11 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      onlyExchangeable
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-lg shadow-pink-500/30'
                        : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:border-pink-500/50'
                    }`}
                  >
                    <Repeat className={`w-4 h-4 text-pink-400 ${onlyExchangeable ? 'animate-spin' : ''}`} />
                    <span className="font-['Rajdhani'] font-black tracking-wide">
                      {onlyExchangeable ? 'BARTER ONLY: ON' : 'SHOW BARTER ONLY'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Category Chips Row (Inspired by previous design) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {genres.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGenre(g)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                    selectedGenre === g
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  <span className="font-['Rajdhani'] tracking-wide">{g}</span>
                </button>
              ))}
            </div>

            {/* Catalog Grid Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white font-['Rajdhani'] tracking-wide">
                    Video Games Catalog
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Authentic physical discs, authorized retailer copies &amp; verified community barter listings
                  </p>
                </div>
                <div className="text-xs font-mono text-cyan-400 font-bold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  {games.length} Discs Listed
                </div>
              </div>

              {loadingGames ? (
                <div className="text-center py-24 space-y-4">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-400 text-sm font-['Rajdhani'] font-bold">Loading game catalog...</p>
                </div>
              ) : games.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-3xl p-8 border border-slate-800 space-y-3">
                  <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <h3 className="text-xl font-bold text-white font-['Rajdhani']">No Games Found</h3>
                  <p className="text-xs text-slate-400">
                    Try adjusting your search query or platform filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPlatform('All');
                      setSelectedGenre('All');
                      setSelectedCondition('All');
                      setOnlyExchangeable(false);
                    }}
                    className="btn-secondary py-2 px-4 text-xs text-cyan-400 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {games.map((game) => (
                    <GameCard
                      key={game._id}
                      game={game}
                      onSelect={(g) => setSelectedGame(g)}
                      onRequestExchange={(g) => {
                        if (!user) setShowAuth(true);
                        else setExchangeTargetGame(g);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: C2C SWAP ZONE / EXCHANGE HUB */}
        {activeView === 'exchange' && (
          <ExchangeHub
            onRequestExchange={(g) => {
              if (!user) setShowAuth(true);
              else setExchangeTargetGame(g);
            }}
            onOpenListTrade={() => setShowAddTradeListing(true)}
            onOpenMyTrades={() => setShowMyExchanges(true)}
            onOpenAuth={() => setShowAuth(true)}
          />
        )}
      </main>

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* MODALS */}
      {selectedGame && (
        <GameDetailModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onRequestExchange={(g) => {
            setSelectedGame(null);
            if (!user) setShowAuth(true);
            else setExchangeTargetGame(g);
          }}
          onInstantBuy={(g) => {
            addToCart(g);
            setSelectedGame(null);
            setShowCheckout(true);
          }}
        />
      )}

      {exchangeTargetGame && (
        <ExchangeRequestModal
          targetGame={exchangeTargetGame}
          onClose={() => setExchangeTargetGame(null)}
          onSuccess={() => {
            setShowMyExchanges(true);
          }}
          onOpenListTrade={() => setShowAddTradeListing(true)}
        />
      )}

      {showMyExchanges && (
        <MyExchangesModal
          onClose={() => setShowMyExchanges(false)}
          onOpenListTrade={() => setShowAddTradeListing(true)}
        />
      )}

      {showAddTradeListing && (
        <AddExchangeListingModal
          onClose={() => setShowAddTradeListing(false)}
          onSuccess={() => {
            fetchGames();
            setShowMyExchanges(true);
          }}
        />
      )}

      {showCart && (
        <CartDrawer
          onClose={() => setShowCart(false)}
          onProceedCheckout={() => {
            if (!user) {
              setShowAuth(true);
            } else {
              setShowCheckout(true);
            }
          }}
        />
      )}

      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            fetchGames();
          }}
          onOpenEmailCenter={() => setShowEmailCenter(true)}
          onOpenOrders={() => setShowOrders(true)}
        />
      )}

      {showOrders && <MyOrdersModal onClose={() => setShowOrders(false)} />}

      {showWishlist && (
        <WishlistModal
          onClose={() => setShowWishlist(false)}
          onRequestExchange={(g) => {
            setShowWishlist(false);
            setExchangeTargetGame(g);
          }}
        />
      )}

      {showSeller && <SellerDashboard onClose={() => setShowSeller(false)} />}

      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}

      {showEmailCenter && <EmailCenterModal onClose={() => setShowEmailCenter(false)} />}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={() => fetchGames()} />}

      {/* Academic Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
