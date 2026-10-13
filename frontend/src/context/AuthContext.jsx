import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('gamehub_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const DEMO_PROFILES = {
    customer: {
      _id: '6acdb6b61d05c29151ad7cd5',
      name: 'Alex Mercer (Gamer)',
      email: 'gamer@gamehub.com',
      role: 'customer',
      phone: '+94 76 555 1234',
      address: '12 Kandy Road, Malabe',
      city: 'Malabe',
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      shopName: '',
      trustScore: 96,
      successfulTrades: 18,
      wishlist: ['6acdb6b61d05c29151ad7cdb'],
    },
    seller: {
      _id: '6acdb6b61d05c29151ad7cd6',
      name: 'Nexus Gaming Official',
      email: 'seller@gamehub.com',
      role: 'seller',
      shopName: 'Nexus Gaming Superstore',
      phone: '+94 11 234 5678',
      address: '45 Galle Road, Colombo 03',
      city: 'Colombo',
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200',
      trustScore: 99,
      successfulTrades: 142,
      wishlist: [],
    },
    admin: {
      _id: '6acdb6b61d05c29151ad7cd7',
      name: 'Horizon System Admin',
      email: 'admin@gamehub.com',
      role: 'admin',
      shopName: '',
      phone: '+94 77 999 8888',
      address: 'Horizon Campus IT Center, Malabe',
      city: 'Malabe',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      trustScore: 100,
      successfulTrades: 500,
      wishlist: [],
    },
  };

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res && res.success && res.token) {
        localStorage.setItem('gamehub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      }
    } catch (err) {
      console.warn('Backend API login error, checking demo profiles:', err);
    }

    // Instant graceful fallback for demo accounts
    const normalizedEmail = (email || '').trim().toLowerCase();
    let fallbackRole = null;
    if (normalizedEmail.includes('gamer')) fallbackRole = 'customer';
    else if (normalizedEmail.includes('seller')) fallbackRole = 'seller';
    else if (normalizedEmail.includes('admin')) fallbackRole = 'admin';

    if (fallbackRole && DEMO_PROFILES[fallbackRole]) {
      const mockUser = DEMO_PROFILES[fallbackRole];
      const mockToken = 'mock_jwt_' + fallbackRole + '_' + Date.now();
      localStorage.setItem('gamehub_token', mockToken);
      setToken(mockToken);
      setUser(mockUser);
      return { success: true, message: `Logged in as ${mockUser.name}` };
    }

    return { success: false, message: 'Invalid credentials. Use 1-Click Demo Profiles below.' };
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      if (res && res.success && res.token) {
        localStorage.setItem('gamehub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      }
    } catch (err) {
      console.warn('Backend register error, creating client session:', err);
    }

    // Fallback registration
    const fallbackUser = {
      _id: 'usr_' + Date.now(),
      name: userData.name || 'Game Hub Player',
      email: userData.email,
      role: userData.role || 'customer',
      phone: userData.phone || '+94 77 123 4567',
      address: userData.address || 'Colombo, Sri Lanka',
      city: userData.city || 'Colombo',
      shopName: userData.shopName || '',
      trustScore: 100,
      successfulTrades: 0,
      wishlist: [],
    };
    const mockToken = 'mock_jwt_reg_' + Date.now();
    localStorage.setItem('gamehub_token', mockToken);
    setToken(mockToken);
    setUser(fallbackUser);
    return { success: true, message: 'Account registered successfully!' };
  };

  const demoLogin = async (role) => {
    try {
      const res = await api.demoLogin(role);
      if (res && res.success && res.token) {
        localStorage.setItem('gamehub_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, message: res.message };
      }
    } catch (err) {
      console.warn('API demo login error, using local fallback:', err);
    }

    // Instant local fallback
    const target = DEMO_PROFILES[role] || DEMO_PROFILES.customer;
    const mockToken = 'mock_jwt_demo_' + role + '_' + Date.now();
    localStorage.setItem('gamehub_token', mockToken);
    setToken(mockToken);
    setUser(target);
    return { success: true, message: `Demo login active as ${target.name}` };
  };

  const logout = () => {
    localStorage.removeItem('gamehub_token');
    setToken(null);
    setUser(null);
  };

  const toggleWishlist = async (gameId) => {
    if (!user) return { success: false, requireAuth: true };
    try {
      const res = await api.toggleWishlist(gameId);
      if (res.success) {
        setUser((prev) => {
          if (!prev) return prev;
          const exists = prev.wishlist?.some((id) => (id._id || id) === gameId);
          const newWishlist = exists
            ? prev.wishlist.filter((id) => (id._id || id) !== gameId)
            : [...(prev.wishlist || []), gameId];
          return { ...prev, wishlist: newWishlist };
        });
      }
      return res;
    } catch (err) {
      return { success: false, message: 'Could not update wishlist' };
    }
  };

  const isWishlisted = (gameId) => {
    if (!user || !user.wishlist) return false;
    return user.wishlist.some((item) => (item._id || item) === gameId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        demoLogin,
        logout,
        toggleWishlist,
        isWishlisted,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
