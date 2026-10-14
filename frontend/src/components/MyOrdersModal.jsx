import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Truck, CheckCircle2, Clock, PackageCheck, Star, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const MyOrdersModal = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.getMyOrders();
      if (res.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSubmitReview = async (e) => {
    if (e) e.preventDefault();
    if (!reviewOrder) return;

    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await api.reviewOrder(reviewOrder._id, {
        rating: reviewRating,
        comment: reviewComment,
        sellerId: reviewOrder.items?.[0]?.sellerId,
      });

      if (res.success) {
        setReviewSuccess('Review submitted! Thank you for rating the merchant.');
        setOrders((prev) =>
          prev.map((o) => (o._id === reviewOrder._id ? { ...o, isReviewed: true } : o))
        );
        setTimeout(() => {
          setReviewOrder(null);
          setReviewSuccess('');
        }, 1800);
      } else {
        setReviewError(res.message || 'Failed to submit review.');
      }
    } catch (err) {
      setReviewError(err.message || 'Network error.');
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !reviewOrder) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, reviewOrder]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !reviewOrder) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 cursor-pointer"
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close (Esc)"
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
            Track packages, view payment receipts, and review merchant service.
          </p>

          {loading ? (
            <div className="text-center py-16 text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
              <span>Loading your orders...</span>
            </div>
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
                      <span>Total Paid ({ord.paymentMethod}): </span>
                      <strong className="text-cyan-400 text-sm font-['Rajdhani']">
                        ${ord.totalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Seller Rating Section */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Merchant Service:</span>
                    {ord.isReviewed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]">
                        <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                        <span>Merchant Reviewed &amp; Verified</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewOrder(ord);
                          setReviewRating(5);
                          setReviewComment('');
                          setReviewSuccess('');
                          setReviewError('');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-amber-500/15"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>⭐ Rate Merchant Service</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Review Merchant Modal Overlay */}
          {reviewOrder && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
              <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl">
                <button
                  onClick={() => setReviewOrder(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-white font-['Rajdhani'] mb-1">
                  Rate Merchant Service
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Order #{reviewOrder._id.slice(-8).toUpperCase()} • Your feedback directly updates the merchant's <strong>Trust Score %</strong>.
                </p>

                {reviewSuccess ? (
                  <div className="text-center py-6 text-emerald-400 font-bold text-sm">
                    {reviewSuccess}
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    {reviewError && (
                      <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
                        {reviewError}
                      </div>
                    )}

                    {/* Star selection */}
                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1">Star Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= reviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-300 font-bold block mb-1">Feedback Comment</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                        placeholder="Game discs arrived in brand new condition, excellent packaging and fast delivery!"
                        rows={3}
                        className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-primary w-full py-2.5 text-xs font-bold justify-center cursor-pointer shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                    >
                      {submittingReview ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-amber-400" />}
                      <span>Submit Merchant Rating</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
