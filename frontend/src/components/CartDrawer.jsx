import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onClose, onProceedCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCodeInput) return;
    const res = applyCoupon(promoCodeInput);
    setCouponFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xl font-bold text-white font-['Rajdhani']">
                Shopping Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-medium">Your shopping cart is empty.</p>
              <p className="text-xs text-slate-500">
                Explore our catalog for the hottest console and PC games!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.listingId}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <div className="text-[10px] text-cyan-400 font-medium">
                      {item.platform} • {item.condition}
                    </div>
                    <div className="text-xs font-extrabold text-white mt-1">
                      ${Number(item.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <button
                      onClick={() => removeFromCart(item.listingId)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                      <button
                        onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-bold text-white px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-4">
            {/* Promo Code Box */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Promo Code (try GAMER10)"
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase focus:outline-none focus:border-cyan-400"
                />
              </div>
              <button
                type="submit"
                className="btn-secondary text-xs px-3 py-2 cursor-pointer"
              >
                Apply
              </button>
            </form>

            {coupon && (
              <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <span>Coupon "{coupon}" Applied (-10%)</span>
                <button onClick={removeCoupon} className="text-slate-400 hover:text-white">
                  Remove
                </button>
              </div>
            )}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-400">FREE</strong> : `$${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-cyan-400 text-lg font-['Rajdhani']">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedCheckout();
              }}
              className="btn-primary w-full py-3 text-sm font-bold justify-center cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
