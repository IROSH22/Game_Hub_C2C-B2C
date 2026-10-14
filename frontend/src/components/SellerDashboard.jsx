import React, { useState, useEffect } from 'react';
import {
  Store,
  DollarSign,
  Package,
  TrendingUp,
  ShoppingBag,
  PlusCircle,
  Truck,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const SellerDashboard = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // inventory | orders | analytics
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Listing Modal inside Seller
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    platform: 'PS5',
    genre: 'Action',
    condition: 'Brand New',
    price: 59.99,
    stock: 20,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    exchangeable: false,
  });

  const loadSellerData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, invRes, ordRes] = await Promise.all([
        api.getSellerAnalytics(),
        api.getSellerInventory(),
        api.getSellerOrders(),
      ]);

      if (analyticsRes.success) setStats(analyticsRes.stats);
      if (invRes.success) setInventory(invRes.listings || []);
      if (ordRes.success) setOrders(ordRes.orders || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !showAddModal) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showAddModal]);

  // Quick edit stock / price
  const handleUpdateItem = async (id, stock, price, status) => {
    try {
      await api.updateInventoryItem(id, { stock, price, status });
      loadSellerData();
    } catch (e) {
      console.error(e);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadSellerData();
    } catch (e) {
      console.error(e);
    }
  };

  // Submit new product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createGame(newGame);
      if (res.success) {
        setShowAddModal(false);
        loadSellerData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, onClose]);

  const handleCoverFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewGame((prev) => ({ ...prev, imageUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !showAddModal) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 cursor-pointer"
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl glass-panel rounded-3xl border border-emerald-500/40 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider font-['Rajdhani']">
              <Store className="w-4 h-4" />
              Official Merchant Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
              {user?.shopName || `${user?.name}'s Game Store`}
            </h2>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + Add New Game to Store
          </button>
        </div>

        {/* Analytics Highlights */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-['Rajdhani']">
                ${stats.totalRevenue.toFixed(2)}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Orders Fulfilled</span>
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-cyan-400 font-['Rajdhani']">
                {stats.totalOrders}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Games Sold</span>
                <Package className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400 font-['Rajdhani']">
                {stats.totalItemsSold}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Active Listings</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 font-['Rajdhani']">
                {stats.activeListingsCount}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Inventory Stock Management ({inventory.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Orders Fulfillment ({orders.length})
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT TABLE */}
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto max-h-[50vh] pr-1">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="p-3">Game</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Price ($)</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Stock Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40">
                    <td className="p-3 flex items-center gap-2.5">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                      />
                      <span className="font-bold text-white truncate max-w-[180px]">
                        {item.title}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-cyan-400">{item.platform}</td>
                    <td className="p-3 font-mono font-bold text-white">${item.price.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`font-bold ${
                          item.stock > 5 ? 'text-emerald-400' : item.stock > 0 ? 'text-amber-400' : 'text-red-400'
                        }`}
                      >
                        {item.stock} in stock
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateItem(item._id, item.stock + 5, item.price, 'Active')}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-white"
                        >
                          +5 Stock
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateItem(
                              item._id,
                              0,
                              item.price,
                              item.status === 'Sold' ? 'Active' : 'Sold'
                            )
                          }
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400"
                        >
                          {item.status === 'Sold' ? 'Restock' : 'Mark Sold Out'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ORDERS FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {orders.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">No customer orders yet.</p>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="font-bold text-white">Order #{ord._id.slice(-6).toUpperCase()}</span>
                      <span className="text-slate-400 ml-2">
                        Buyer: {ord.buyer?.name} ({ord.buyer?.email})
                      </span>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300">
                      {ord.orderStatus}
                    </span>
                  </div>

                  {/* Items for this seller */}
                  <div className="space-y-1">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300">
                        <span>
                          {it.title} ({it.platform}) × {it.quantity}
                        </span>
                        <strong className="text-white">${(it.price * it.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">
                      Ship to: {ord.shippingAddress?.fullName}, {ord.shippingAddress?.address},{' '}
                      {ord.shippingAddress?.city}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'Shipped')}
                        className="btn-primary py-1.5 px-3 text-[11px]"
                      >
                        <Truck className="w-3.5 h-3.5" /> Mark Shipped
                      </button>
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, 'Delivered')}
                        className="btn-secondary py-1.5 px-3 text-[11px]"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Delivered
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MODAL: ADD PRODUCT TO STORE */}
        {showAddModal && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddModal(false);
            }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-emerald-500/40 shadow-2xl cursor-default"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white font-['Rajdhani'] mb-4">
                Add Game to Store Catalog
              </h3>

              <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Game Title</label>
                  <input
                    type="text"
                    required
                    value={newGame.title}
                    onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                    placeholder="E.g., GTA VI or EA FC 25"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold">Platform</label>
                    <select
                      value={newGame.platform}
                      onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="PS5">PS5</option>
                      <option value="Xbox Series X">Xbox Series X</option>
                      <option value="PC">PC</option>
                      <option value="Nintendo Switch">Nintendo Switch</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold">Genre</label>
                    <select
                      value={newGame.genre}
                      onChange={(e) => setNewGame({ ...newGame, genre: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="Action">Action</option>
                      <option value="RPG">RPG</option>
                      <option value="Sports">Sports</option>
                      <option value="Open World">Open World</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Racing">Racing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={newGame.price}
                      onChange={(e) => setNewGame({ ...newGame, price: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1 font-bold">Stock Count</label>
                    <input
                      type="number"
                      required
                      value={newGame.stock}
                      onChange={(e) => setNewGame({ ...newGame, stock: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>

                {/* Cover Image Section */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 block font-bold">Game Cover Artwork</label>
                    <label
                      htmlFor="seller-cover-upload"
                      className="cursor-pointer text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </label>
                    <input
                      type="file"
                      id="seller-cover-upload"
                      accept="image/*"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                  </div>

                  <input
                    type="url"
                    value={newGame.imageUrl}
                    onChange={(e) => setNewGame({ ...newGame, imageUrl: e.target.value })}
                    placeholder="Paste image URL (https://...)"
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px]"
                  />

                  {newGame.imageUrl && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                      <img
                        src={newGame.imageUrl}
                        alt="Preview"
                        className="w-10 h-12 object-cover rounded-lg border border-slate-700"
                      />
                      <span className="text-[10px] text-slate-400">Cover image ready for store catalog</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Description</label>
                  <textarea
                    rows={2}
                    value={newGame.description}
                    onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                    placeholder="Authentic factory sealed disc with manufacturer warranty."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-center mt-2"
                >
                  Publish Game to Store
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
