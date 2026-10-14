import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer = ({ onClose, onProceedCheckout }) => {
  const {
    cart,
    selectedItems = [],
    selectedItemsCount = 0,
    allSelected = false,
    hasSelected = false,
    toggleSelectItem,
    selectAllItems,
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCodeInput) return;
    const res = applyCoupon(promoCodeInput);
    setCouponFeedback(res.message);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md h-full glass-panel border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 cursor-default"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3">
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
            <div className="space-y-3">
              {/* Select All / Deselect All Toolbar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs mb-2">
                <button
                  type="button"
                  onClick={() => selectAllItems(!allSelected)}
                  className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer select-none font-medium"
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      allSelected
                        ? 'bg-cyan-500 border-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/50'
                        : selectedItems.length > 0
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                </button>

                <div className="text-[11px] font-mono">
                  <span className="text-cyan-400 font-bold">{selectedItems.length}</span>
                  <span className="text-slate-400"> of </span>
                  <span className="text-slate-300 font-bold">{cart.length}</span>
                  <span className="text-slate-400"> items to buy</span>
                </div>
              </div>

              {/* Items scrollable container */}
              <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const isSelected = item.selected !== false;
                  return (
                    <div
                      key={item.listingId}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      }`}
                    >
                      {/* Checkbox button */}
                      <button
                        type="button"
                        onClick={() => toggleSelectItem(item.listingId)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 border border-cyan-400 text-slate-950 shadow-sm shadow-cyan-500/40'
                            : 'bg-slate-950 border border-slate-700 text-transparent hover:border-slate-500'
                        }`}
                        title={isSelected ? 'Deselect this game' : 'Select this game to buy'}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
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
                          className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 text-xs">
                          <button
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-white px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3.5">
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
                <button onClick={removeCoupon} className="text-slate-400 hover:text-white cursor-pointer">
                  Remove
                </button>
              </div>
            )}

            {/* Calculations based strictly on Selected Items */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal ({selectedItemsCount} {selectedItemsCount === 1 ? 'item' : 'items'} selected)</span>
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
                <span>
                  {selectedItems.length === 0 ? (
                    '$0.00'
                  ) : shippingFee === 0 ? (
                    <strong className="text-emerald-400">FREE</strong>
                  ) : (
                    `$${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-cyan-400 text-lg font-['Rajdhani']">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Warning if 0 items selected */}
            {selectedItems.length === 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs text-center font-medium">
                ⚠️ Please select at least 1 game from your cart to checkout.
              </div>
            )}

            <button
              disabled={selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length === 0) return;
                onClose();
                onProceedCheckout();
              }}
              className="btn-primary w-full py-3 text-sm font-bold justify-center cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:grayscale disabled:shadow-none transition-all"
            >
              <span>
                {selectedItems.length === 0
                  ? 'Select Items to Checkout'
                  : `Proceed to Checkout (${selectedItemsCount} items)`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

