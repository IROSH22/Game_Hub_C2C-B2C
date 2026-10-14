import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Heart,
  Bell,
  Mail,
  User,
  Shield,
  Store,
  LogOut,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { LiveTicker } from './LiveTicker';

export const Navbar = ({
  onOpenAuth,
  onOpenCart,
  onOpenExchangeHub,
  onOpenMyExchanges,
  onOpenOrders,
  onOpenWishlist,
  onOpenSeller,
  onOpenAdmin,
  onOpenEmailCenter,
  activeView,
  setActiveView,
}) => {
  const { user, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      try {
        const res = await api.getNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
          setUnreadNotifications(res.unreadCount || 0);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadNotifications(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-950 to-cyan-950 border-b border-cyan-500/20 py-1.5 px-4 sm:px-6 lg:px-10 text-center text-[11px] text-slate-300 overflow-hidden font-medium">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-cyan-400 font-bold tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-cyan-400 animate-pulse" />
            <span>HYBRID E-COMMERCE ECOSYSTEM</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-pink-400 font-bold">⚡ FREE EXPRESS SHIPPING</span> on orders over $60
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">🎮 100% ESCROW PROTECTED</span> Game Barter & Trades
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-emerald-400 font-bold hidden md:inline">PROMO CODE: GAMER10 (10% OFF)</span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 sm:px-6 lg:px-10 py-3 transition-all">
        <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            onClick={() => setActiveView('store')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-white font-['Rajdhani']">
                  GAME<span className="text-cyan-400">HUB</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  Hybrid
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                Buy • Sell • Exchange Video Games
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveView('store')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeView === 'store'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Store Catalog
            </button>

            {user?.role !== 'seller' && (
              <button
                onClick={() => {
                  setActiveView('exchange');
                  if (onOpenExchangeHub) onOpenExchangeHub();
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeView === 'exchange'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Repeat className="w-4 h-4 text-pink-400" />
                <span>Game Swap Zone</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/30 text-purple-300 rounded font-bold uppercase">
                  Trade
                </span>
              </button>
            )}

            {user && user.role !== 'seller' && (
              <button
                onClick={onOpenMyExchanges}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                My Trade Desk
              </button>
            )}

            {user?.role === 'seller' && (
              <button
                onClick={onOpenSeller}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                Seller Portal
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            )}
          </nav>

          {/* Right Controls & Utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-pink-400 transition-all cursor-pointer"
              title="Wishlist & Smart Matches"
            >
              <Heart className="w-4 h-4" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center border border-slate-950">
                  {user.wishlist.length}
                </span>
              )}
            </button>

            {/* Email Center */}
            <button
              onClick={onOpenEmailCenter}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
              title="Email Center (Inspect generated receipts & trade emails)"
            >
              <Mail className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center border border-slate-950 animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-sm text-white font-['Rajdhani']">
                        Notifications ({unreadNotifications})
                      </h4>
                    </div>
                    {unreadNotifications > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-cyan-400 hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-400 py-6">
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 rounded-xl border text-xs transition-all ${
                            n.isRead
                              ? 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                              : 'bg-slate-800/70 border-cyan-500/30 text-slate-200'
                          }`}
                        >
                          <div className="font-semibold text-white mb-0.5">{n.title}</div>
                          <p>{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-400 font-bold text-xs transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 text-[10px] font-black font-mono">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer"
                >
                  <img
                    src={user.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=gamer'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg border border-cyan-400/40 object-cover"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-cyan-400 font-medium capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <div className="font-bold text-sm text-white truncate">{user.name}</div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1.5 inline-block text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                        🛡️ {user.trustScore || 95}% Trust ({user.successfulTrades || 0} trades)
                      </div>
                    </div>

                    {user.role !== 'seller' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenMyExchanges();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                      >
                        <Repeat className="w-4 h-4 text-amber-400" />
                        My Exchange Requests
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenOrders();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-cyan-400" />
                      Orders & Tracking
                    </button>

                    {user.role === 'seller' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSeller();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-emerald-400" />
                        Seller Inventory Desk
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 cursor-pointer"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        Admin Control Panel
                      </button>
                    )}

                    <div className="my-1 border-t border-slate-800"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 font-['Rajdhani'] cursor-pointer whitespace-nowrap"
              >
                Sign In / Join
              </button>
            )}

            {/* Mobile Burger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setActiveView('store');
                setMobileMenuOpen(false);
              }}
              className="px-4 py-2.5 text-left rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              Store Catalog
            </button>
            {user?.role !== 'seller' && (
              <button
                onClick={() => {
                  setActiveView('exchange');
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 text-left rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Repeat className="w-4 h-4 text-pink-400" />
                Game Swap Zone
              </button>
            )}
            {user && user.role !== 'seller' && (
              <button
                onClick={() => {
                  onOpenMyExchanges();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 text-left rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                My Trade Desk
              </button>
            )}
            {user?.role === 'seller' && (
              <button
                onClick={() => {
                  onOpenSeller();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 text-left rounded-xl text-xs font-bold text-emerald-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Seller Portal
              </button>
            )}
            {user?.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2.5 text-left rounded-xl text-xs font-bold text-amber-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </button>
            )}
          </div>
        )}
      </header>
      {/* Live Activity Ticker with Marquee Animation */}
      <LiveTicker />
    </>
  );
};
