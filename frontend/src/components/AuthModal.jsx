import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Store, Sparkles, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal = ({ onClose, onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
    city: 'Colombo',
    shopName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let res;
      if (isRegister) {
        res = await register(formData);
      } else {
        res = await login(formData.email, formData.password);
      }

      if (res && res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res?.message || 'Authentication failed. Please check credentials or use 1-Click Demo.');
      }
    } catch (err) {
      setError('An error occurred during authentication. Demo profiles are ready below.');
    }
    setLoading(false);
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      const res = await demoLogin(role);
      if (res && res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError(res?.message || 'Demo login failed.');
      }
    } catch (err) {
      setError('Demo login error.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Authentication Portal
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-['Rajdhani'] tracking-wide">
            {isRegister ? 'Join Game Hub Community' : 'Welcome Back to Game Hub'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Start buying, selling, and bartering video games in Sri Lanka'
              : 'Log in to trade, buy games, or manage your store dashboard'}
          </p>
        </div>

        {/* 1-Click Demo Profiles (Presentation Showcase) */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-['Rajdhani']">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> 1-Click Demo Profiles (Examiner &amp; Presentation Ready)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold">100% Instant Login</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Gamer Alex */}
            <button
              type="button"
              onClick={() => handleDemo('customer')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-cyan-500/15 border border-cyan-500/30 text-left transition-all group cursor-pointer hover:border-cyan-400 hover:scale-[1.02]"
            >
              <div className="text-xs font-black text-white group-hover:text-cyan-300 flex items-center justify-between font-['Rajdhani']">
                <span>🎮 Gamer Alex</span>
                <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-300 font-mono">C2C</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">gamer@gamehub.com</div>
              <div className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Trust: 96%
              </div>
            </button>

            {/* Store Seller */}
            <button
              type="button"
              onClick={() => handleDemo('seller')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-pink-500/15 border border-pink-500/30 text-left transition-all group cursor-pointer hover:border-pink-400 hover:scale-[1.02]"
            >
              <div className="text-xs font-black text-white group-hover:text-pink-300 flex items-center justify-between font-['Rajdhani']">
                <span>🏪 Nexus Store</span>
                <span className="text-[9px] px-1 rounded bg-pink-500/20 text-pink-300 font-mono">B2C</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">seller@gamehub.com</div>
              <div className="text-[10px] text-pink-400 font-bold mt-1 flex items-center gap-1">
                <Store className="w-2.5 h-2.5" /> Verified Shop
              </div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-amber-500/15 border border-amber-500/30 text-left transition-all group cursor-pointer hover:border-amber-400 hover:scale-[1.02]"
            >
              <div className="text-xs font-black text-white group-hover:text-amber-300 flex items-center justify-between font-['Rajdhani']">
                <span>🛡️ System Admin</span>
                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">ROOT</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">admin@gamehub.com</div>
              <div className="text-[10px] text-amber-400 font-bold mt-1 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Full Control
              </div>
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-2xl bg-slate-900/90 p-1 mb-5 text-xs font-bold border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer font-['Rajdhani'] tracking-wider ${
              !isRegister ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError('');
            }}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer font-['Rajdhani'] tracking-wider ${
              isRegister ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            REGISTER NEW ACCOUNT
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="text-slate-300 font-bold block mb-1.5 font-['Rajdhani'] tracking-wide">
                FULL NAME
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.g., Marcus Vance"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-900/95 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-bold block mb-1.5 font-['Rajdhani'] tracking-wide">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Mail className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="gamer@gamehub.com"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-900/95 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1.5 font-['Rajdhani'] tracking-wide">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-900/95 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="text-slate-300 font-bold block mb-1.5 font-['Rajdhani'] tracking-wide">
                  ACCOUNT TYPE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      formData.role === 'customer'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Gamer (Buy &amp; Barter)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'seller' })}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      formData.role === 'seller'
                        ? 'bg-pink-500/20 text-pink-400 border-pink-400 shadow-md shadow-pink-500/10'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Merchant (Store Seller)
                  </button>
                </div>
              </div>

              {formData.role === 'seller' && (
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5 font-['Rajdhani'] tracking-wide">
                    STORE / SHOP NAME
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Store className="w-4 h-4 text-pink-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.shopName}
                      onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                      placeholder="E.g., CyberPulse Gaming Store"
                      className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-900/95 border border-slate-700 text-white text-sm focus:border-pink-400 focus:outline-none transition-all placeholder:text-slate-500 shadow-inner"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm font-['Rajdhani'] tracking-wider uppercase transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isRegister ? (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
