import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Truck,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const CheckoutModal = ({ onClose, onSuccess, onOpenEmailCenter, onOpenOrders }) => {
  const { cart, totalAmount, subtotal, discountAmount, shippingFee, coupon, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: Shipping & Payment, 2: Processing, 3: Success Receipt
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '+94 77 123 4567',
    address: user?.address || '12 Kandy Road',
    city: user?.city || 'Malabe',
    postalCode: '10115',
  });

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardData, setCardData] = useState({
    number: '4242 •••• •••• 4242',
    name: user?.name || 'ALEX MERCER',
    expiry: '12/28',
    cvv: '888',
  });

  const [processingStatus, setProcessingStatus] = useState('Connecting to Bank Gateway...');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [error, setError] = useState('');

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.address) {
      setError('Please provide full shipping details.');
      return;
    }

    setStep(2);
    setError('');

    // Simulate Payment Gateway Stages
    setProcessingStatus('Verifying Card with 3D Secure...');
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStatus('Processing Transaction with Bank Escrow...');
    await new Promise((r) => setTimeout(r, 800));

    try {
      const orderPayload = {
        items: cart,
        shippingAddress,
        paymentMethod,
        cardLast4: cardData.number.slice(-4) || '4242',
        couponCode: coupon,
      };

      const res = await api.createOrder(orderPayload);
      if (res.success && res.order) {
        setCompletedOrder(res.order);
        clearCart();
        setStep(3);
        triggerConfetti();
      } else {
        setError(res.message || 'Payment was declined by processor.');
        setStep(1);
      }
    } catch (err) {
      setError('Failed to contact checkout service.');
      setStep(1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-cyan-500/40 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: CHECKOUT FORM */}
        {step === 1 && (
          <form onSubmit={handlePay} className="space-y-6">
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-xs font-['Rajdhani']">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              256-Bit SSL Encrypted Checkout
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
              Complete Your Purchase
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Shipping Address Inputs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-cyan-400" /> 1. Delivery Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, address: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">City / Region</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method & Interactive Card */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" /> 2. Payment Method
              </h4>

              {/* Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {['Credit Card', 'PayPal', 'Cash on Delivery'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      paymentMethod === m
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Virtual Credit Card Display */}
              {paymentMethod === 'Credit Card' && (
                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/40 shadow-xl shadow-cyan-950/30 flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-8 rounded-md bg-amber-400/80 flex items-center justify-center font-bold text-[10px] text-slate-950">
                        CHIP
                      </div>
                      <span className="font-extrabold text-sm tracking-widest text-white font-['Rajdhani']">
                        GAMEHUB PAY
                      </span>
                    </div>

                    <div className="font-mono text-base sm:text-lg tracking-widest text-cyan-300 font-bold">
                      {cardData.number}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 uppercase tracking-wider">
                      <div>
                        <div className="text-[9px] text-slate-500">Cardholder</div>
                        <div className="font-bold text-white">{cardData.name}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500">Expires</div>
                        <div className="font-bold text-white">{cardData.expiry}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card input helper */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="col-span-2">
                      <label className="text-slate-400 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Security CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total Summary & Pay Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-2xl font-black text-cyan-400 font-['Rajdhani']">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="btn-primary py-3.5 px-8 text-sm font-bold shadow-xl shadow-cyan-500/30 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Pay & Place Order
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PROCESSING ANIMATION */}
        {step === 2 && (
          <div className="text-center py-16 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <Lock className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h4 className="text-2xl font-bold text-white font-['Rajdhani']">
              Authorizing Payment
            </h4>
            <p className="text-sm text-cyan-300 font-mono animate-pulse">
              {processingStatus}
            </p>
          </div>
        )}

        {/* STEP 3: ORDER CONFIRMED RECEIPT */}
        {step === 3 && completedOrder && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 animate-pulse" />
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
                Payment Authorized & Order Confirmed!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Receipt #{completedOrder._id.slice(-6).toUpperCase()} • Transaction ID: {completedOrder.transactionId}
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HMAC-SHA256 SIGNED &amp; PCI-DSS COMPLIANT • ZERO TAMPERING</span>
              </div>
            </div>

            {/* Email Notification Card */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-left space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4 text-cyan-400" />
                Automated Transaction Receipt Dispatched
              </div>
              <p className="text-xs text-slate-300">
                A detailed HTML payment invoice with game cover details and courier tracking has been sent to <strong className="text-white">{user?.email}</strong>.
              </p>
            </div>

            {/* Ordered Items List */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-left space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Purchased Games ({completedOrder.items.length})
              </div>
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="text-white font-semibold">
                    {item.title} <span className="text-slate-400 font-normal">({item.platform}) × {item.quantity}</span>
                  </span>
                  <span className="text-cyan-400 font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total Paid</span>
                <span className="text-cyan-400 font-['Rajdhani'] text-base">
                  ${completedOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenEmailCenter();
                }}
                className="btn-primary w-full sm:w-auto py-2.5 px-6 text-xs font-bold cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                View Receipt in Email Center
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className="btn-secondary w-full sm:w-auto py-2.5 px-6 text-xs font-semibold cursor-pointer"
              >
                <Truck className="w-4 h-4 text-cyan-400" />
                Track Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
