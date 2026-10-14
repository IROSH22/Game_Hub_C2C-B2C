const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  const authToken = token || localStorage.getItem('gamehub_token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  demoLogin: async (role) => {
    const res = await fetch(`${API_BASE}/auth/demo-login/${role}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateProfile: async (data) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  toggleWishlist: async (gameId) => {
    const res = await fetch(`${API_BASE}/auth/toggle-wishlist/${gameId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  getWishlistMatches: async () => {
    const res = await fetch(`${API_BASE}/auth/wishlist-matches`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  // Games
  getGames: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const res = await fetch(`${API_BASE}/games?${params.toString()}`);
    return res.json();
  },

  getGameById: async (id) => {
    const res = await fetch(`${API_BASE}/games/${id}`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  createGame: async (gameData) => {
    const res = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(gameData),
    });
    return res.json();
  },

  updateGame: async (id, gameData) => {
    const res = await fetch(`${API_BASE}/games/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(gameData),
    });
    return res.json();
  },

  deleteGame: async (id) => {
    const res = await fetch(`${API_BASE}/games/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return res.json();
  },

  getMetaCategories: async () => {
    const res = await fetch(`${API_BASE}/games/meta/categories`);
    return res.json();
  },

  // C2C Exchange
  getExchangeListings: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${API_BASE}/exchanges?${params.toString()}`);
    return res.json();
  },

  getMyExchangeListings: async () => {
    const res = await fetch(`${API_BASE}/exchanges/my-listings`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getMyExchangeRequests: async () => {
    const res = await fetch(`${API_BASE}/exchanges/my-requests`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  sendExchangeRequest: async (tradeData) => {
    const res = await fetch(`${API_BASE}/exchanges/request`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tradeData),
    });
    return res.json();
  },

  respondExchangeRequest: async (id, actionData) => {
    const res = await fetch(`${API_BASE}/exchanges/${id}/respond`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(actionData),
    });
    return res.json();
  },

  updateExchangeStatus: async (id, statusData) => {
    const res = await fetch(`${API_BASE}/exchanges/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(statusData),
    });
    return res.json();
  },

  reviewExchangePartner: async (id, reviewData) => {
    const res = await fetch(`${API_BASE}/exchanges/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return res.json();
  },

  getTradeMessages: async (id) => {
    const res = await fetch(`${API_BASE}/exchanges/${id}/messages`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  sendTradeMessage: async (id, text) => {
    const res = await fetch(`${API_BASE}/exchanges/${id}/message`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Orders & Checkout
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    return res.json();
  },

  reviewOrder: async (id, reviewData) => {
    const res = await fetch(`${API_BASE}/orders/${id}/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    return res.json();
  },

  createStripeSession: async (items, totalAmount) => {
    const res = await fetch(`${API_BASE}/orders/create-stripe-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ items, totalAmount }),
    });
    return res.json();
  },

  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getSellerOrders: async () => {
    const res = await fetch(`${API_BASE}/orders/seller-orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ orderStatus: status }),
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  markNotificationRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Emails Inspection & Dispatch
  getEmailLogs: async () => {
    const res = await fetch(`${API_BASE}/emails/my-emails`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getEmailConfigStatus: async () => {
    const res = await fetch(`${API_BASE}/emails/config/status`);
    return res.json();
  },

  saveEmailConfig: async (config) => {
    const res = await fetch(`${API_BASE}/emails/config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return res.json();
  },

  testSendEmail: async (targetEmail, targetName, templateType = 'welcome') => {
    const res = await fetch(`${API_BASE}/emails/test-send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ targetEmail, targetName, templateType }),
    });
    return res.json();
  },

  // Seller Portal
  getSellerAnalytics: async () => {
    const res = await fetch(`${API_BASE}/seller/analytics`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getSellerInventory: async () => {
    const res = await fetch(`${API_BASE}/seller/inventory`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  updateInventoryItem: async (id, data) => {
    const res = await fetch(`${API_BASE}/seller/inventory/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Admin Portal
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  toggleUserBan: async (id) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/toggle-ban`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  getAdminGames: async () => {
    const res = await fetch(`${API_BASE}/admin/games`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  toggleFeatureGame: async (id) => {
    const res = await fetch(`${API_BASE}/admin/games/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return res.json();
  },

  getAdminOrders: async () => {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getAdminExchanges: async () => {
    const res = await fetch(`${API_BASE}/admin/exchanges`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  getSupabaseStatus: async () => {
    const res = await fetch(`${API_BASE}/admin/supabase-status`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  saveSupabaseConfig: async (keys) => {
    const res = await fetch(`${API_BASE}/admin/supabase-config`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(keys),
    });
    return res.json();
  },
};
