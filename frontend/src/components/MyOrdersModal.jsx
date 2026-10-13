import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck } from 'lucide-react';
import { api } from '../services/api';

export const MyOrdersModal = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold uppercase tracking-wider text-xs font-['Rajdhani']">
          <ShoppingBag className="w-4 h-4" />
          Customer Purchase Desk
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani'] mb-1">
          My Order History & Tracking
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Track packages and review purchased video games.
        </p>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-600" />
            <p>You haven't placed any store orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {orders.map((ord) => (
              <div
                key={ord._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-cyan-400 font-bold font-mono text-sm">
                      #{ord._id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-slate-400 ml-2">
                      Placed on {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 self-start sm:self-auto">
                    {ord.orderStatus}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  {['Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                    const currentIdx = ['Confirmed', 'Shipped', 'Delivered'].indexOf(
                      ord.orderStatus
                    );
                    const isDone = idx <= currentIdx;
                    return (
                      <div
                        key={step}
                        className={`p-2 rounded-lg border ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border-slate-800'
                        }`}
                      >
                        {step}
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {ord.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.platform} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Details Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 pt-2 gap-2">
                  <div>
                    <strong>Shipping To:</strong> {ord.shippingAddress?.fullName},{' '}
                    {ord.shippingAddress?.address}, {ord.shippingAddress?.city}
                  </div>
                  <div className="text-right">
                    <span>Total Paid: </span>
                    <strong className="text-cyan-400 text-sm font-['Rajdhani']">
                      ${ord.totalAmount.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
