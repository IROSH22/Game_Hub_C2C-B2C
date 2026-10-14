import React, { useState, useEffect } from 'react';
import {
  X,
  Repeat,
  Check,
  XCircle,
  MessageSquare,
  Truck,
  CheckCircle2,
  Star,
  PlusCircle,
  ShieldCheck,
  PackageCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TradeChatModal } from './TradeChatModal';

export const MyExchangesModal = ({ onClose, onOpenListTrade }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // incoming | outgoing | active | listings
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Trade Chat modal
  const [activeChatTrade, setActiveChatTrade] = useState(null);

  // Counter-offer modal state
  const [counterTradeId, setCounterTradeId] = useState(null);
  const [counterMessage, setCounterMessage] = useState('');

  // Review modal state
  const [reviewTrade, setReviewTrade] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Shipping tracking modal
  const [trackingTradeId, setTrackingTradeId] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, listRes] = await Promise.all([
        api.getMyExchangeRequests(),
        api.getMyExchangeListings(),
      ]);

      if (reqRes.success) {
        setIncoming(reqRes.incoming || []);
        setOutgoing(reqRes.outgoing || []);
      }
      if (listRes.success) {
        setMyListings(listRes.listings || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Respond to incoming request
  const handleRespond = async (tradeId, action) => {
    try {
      const res = await api.respondExchangeRequest(tradeId, {
        action,
        counterOfferMessage: counterMessage,
      });
      if (res.success) {
        setCounterTradeId(null);
        setCounterMessage('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update status (Shipped, Delivered, Completed)
  const handleUpdateStatus = async (tradeId, status, tracking = '') => {
    try {
      const res = await api.updateExchangeStatus(tradeId, {
        status,
        trackingNumber: tracking,
      });
      if (res.success) {
        setTrackingTradeId(null);
        setTrackingNumber('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Partner Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewTrade) return;

    try {
      const res = await api.reviewExchangePartner(reviewTrade._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewSuccess('Review submitted! Partner trust score updated.');
        setTimeout(() => {
          setReviewTrade(null);
          setReviewSuccess('');
          loadData();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter active trades (Accepted, Shipped, Delivered, Completed)
  const allTrades = [...incoming, ...outgoing];
  const activeTrades = allTrades.filter((t) =>
    ['Accepted', 'Shipped', 'Delivered', 'Completed'].includes(t.status)
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !activeChatTrade) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeChatTrade]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !activeChatTrade) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 cursor-pointer"
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl glass-panel rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
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
            <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider font-['Rajdhani']">
              <Repeat className="w-4 h-4" />
              Community Game Barter Desk
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
              My Trade Desk
            </h2>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenListTrade();
            }}
            className="btn-exchange py-2 px-4 text-xs font-bold self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            + List Another Game
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 overflow-x-auto my-6 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'incoming'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Incoming Offers ({incoming.filter((r) => r.status === 'Pending').length})
          </button>

          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'outgoing'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Sent Offers ({outgoing.length})
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Active Trades & Shipping ({activeTrades.length})
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'listings'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            My Listed Games ({myListings.length})
          </button>
        </div>

        {/* TAB 1: INCOMING REQUESTS */}
        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incoming.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">
                No incoming trade offers right now. Make sure your games are listed in the Swap Zone!
              </p>
            ) : (
              incoming.map((trade) => (
                <div
                  key={trade._id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={trade.requesterId?.profileImage || 'https://api.dicebear.com/7.x/bottts/svg?seed=gamer'}
                        alt="Requester"
                        className="w-10 h-10 rounded-xl object-cover border border-cyan-400"
                      />
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {trade.requesterId?.name}
                          <span className="text-[11px] text-emerald-400 font-normal">
                            ({trade.requesterId?.trustScore || 95}% Trust)
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                        trade.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : trade.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      Status: {trade.status}
                    </span>
                  </div>

                  {/* Trade details comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-cyan-400">
                        They Offer:
                      </span>
                      <div className="text-sm font-bold text-white">
                        {trade.offeredListingId?.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {trade.offeredListingId?.platform} • {trade.offeredListingId?.condition}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-pink-400">
                        For Your Game:
                      </span>
                      <div className="text-sm font-bold text-white">
                        {trade.wantedListingId?.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {trade.wantedListingId?.platform} • {trade.wantedListingId?.condition}
                      </div>
                    </div>
                  </div>

                  {trade.message && (
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <strong>Gamer's Note:</strong> "{trade.message}"
                    </div>
                  )}

                  {/* Actions for Pending */}
                  {trade.status === 'Pending' && (
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleRespond(trade._id, 'accept')}
                        className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Accept Trade Offer
                      </button>

                      <button
                        onClick={() => setCounterTradeId(trade._id)}
                        className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        Counter-Offer
                      </button>

                      <button
                        onClick={() => handleRespond(trade._id, 'reject')}
                        className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {trade.status === 'Accepted' && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs text-emerald-400 font-bold">Trade Accepted &amp; Active</span>
                      <button
                        onClick={() => setActiveChatTrade(trade)}
                        className="btn-primary py-2 px-3 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Live Trade Chat</span>
                      </button>
                    </div>
                  )}

                  {/* Counter Offer Field */}
                  {counterTradeId === trade._id && (
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <label className="text-xs font-bold text-amber-400">
                        Type your counter-proposal (e.g., requested cash top-up or alternate game):
                      </label>
                      <input
                        type="text"
                        value={counterMessage}
                        onChange={(e) => setCounterMessage(e.target.value)}
                        placeholder="I would accept if you include $10 or another game."
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(trade._id, 'counter-offer')}
                          className="btn-exchange py-1.5 px-3 text-xs"
                        >
                          Send Counter-Offer
                        </button>
                        <button
                          onClick={() => setCounterTradeId(null)}
                          className="text-xs text-slate-400 px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: OUTGOING REQUESTS */}
        {activeTab === 'outgoing' && (
          <div className="space-y-4">
            {outgoing.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">
                You haven't sent any trade proposals yet. Browse the Swap Zone to find games!
              </p>
            ) : (
              outgoing.map((trade) => (
                <div
                  key={trade._id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Sent to <strong className="text-white">{trade.receiverId?.name}</strong>
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trade.status === 'Accepted'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : trade.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {trade.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">You Offered</span>
                      <div className="font-bold text-white truncate">{trade.offeredListingId?.title}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">You Wanted</span>
                      <div className="font-bold text-cyan-400 truncate">{trade.wantedListingId?.title}</div>
                    </div>
                  </div>

                  {trade.counterOfferMessage && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                      <strong>Counter Offer Received:</strong> "{trade.counterOfferMessage}"
                    </div>
                  )}

                  {trade.status === 'Accepted' && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-xs text-emerald-400 font-bold">Proposal Accepted!</span>
                      <button
                        onClick={() => setActiveChatTrade(trade)}
                        className="btn-primary py-2 px-3 text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Live Trade Chat</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ACTIVE TRADES & DELIVERY TRACKER */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeTrades.length === 0 ? (
              <p className="text-center py-12 text-slate-400 text-sm">
                No active accepted trades currently. When a trade is accepted, you can track shipment here!
              </p>
            ) : (
              activeTrades.map((trade) => {
                const partner =
                  trade.requesterId?._id === user._id ? trade.receiverId : trade.requesterId;

                return (
                  <div
                    key={trade._id}
                    className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="text-xs text-cyan-400 font-bold uppercase">
                          Trade Agreement #{trade._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-white">
                          Trading with {partner?.name} ({partner?.trustScore || 95}% Trust)
                        </div>
                      </div>

                      {/* Status indicator */}
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {trade.status}
                      </span>
                    </div>

                    {/* Progress Steps */}
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold py-2">
                      {['Accepted', 'Shipped', 'Delivered', 'Completed'].map((st, i) => {
                        const stepIndex = ['Accepted', 'Shipped', 'Delivered', 'Completed'].indexOf(
                          trade.status
                        );
                        const isDone = i <= stepIndex;
                        return (
                          <div
                            key={st}
                            className={`p-2 rounded-lg border transition-all ${
                              isDone
                                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                                : 'bg-slate-900/50 text-slate-500 border-slate-800'
                            }`}
                          >
                            {st}
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions based on status */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {/* Live Trade Coordination Chat */}
                      <button
                        onClick={() => setActiveChatTrade(trade)}
                        className="py-2 px-3.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-cyan-500/15"
                      >
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <span>💬 Live Trade Chat</span>
                      </button>

                      {trade.status === 'Accepted' && (
                        <button
                          onClick={() => setTrackingTradeId(trade._id)}
                          className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          Dispatch & Mark as Shipped
                        </button>
                      )}

                      {trade.status === 'Shipped' && (
                        <button
                          onClick={() => handleUpdateStatus(trade._id, 'Delivered')}
                          className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
                        >
                          <PackageCheck className="w-4 h-4" />
                          Confirm Package Delivery
                        </button>
                      )}

                      {trade.status === 'Delivered' && (
                        <button
                          onClick={() => handleUpdateStatus(trade._id, 'Completed')}
                          className="btn-exchange py-2 px-4 text-xs font-bold cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Finalize Trade & Complete
                        </button>
                      )}

                      {trade.status === 'Completed' && (
                        <button
                          onClick={() => setReviewTrade(trade)}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-amber-500/30"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                          Rate & Review Partner
                        </button>
                      )}
                    </div>

                    {/* Tracking modal input */}
                    {trackingTradeId === trade._id && (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2 mt-2">
                        <label className="text-xs font-bold text-white">
                          Enter Courier / Postal Tracking Number (Optional):
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="E.g., PROMPT-EXP-89421 or SL-POST-991"
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(trade._id, 'Shipped', trackingNumber)}
                            className="btn-primary py-1.5 px-3 text-xs"
                          >
                            Save & Mark Shipped
                          </button>
                          <button
                            onClick={() => setTrackingTradeId(null)}
                            className="text-xs text-slate-400 px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: MY LISTED GAMES */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {myListings.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-slate-400 text-sm">You haven't listed any games for trade yet.</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenListTrade();
                  }}
                  className="btn-exchange px-5 py-2.5 text-xs mx-auto"
                >
                  + Add Game for Trade
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myListings.map((g) => (
                  <div
                    key={g._id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={g.imageUrl}
                        alt={g.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                      />
                      <div>
                        <div className="font-bold text-sm text-white truncate max-w-[150px]">
                          {g.title}
                        </div>
                        <div className="text-xs text-cyan-400">{g.platform} • {g.condition}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          Wanted: {g.wantedGames || 'Any trade'}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        g.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REVIEW MODAL OVERLAY */}
        {reviewTrade && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="relative w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl">
              <button
                onClick={() => setReviewTrade(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white font-['Rajdhani'] mb-1">
                Rate Your Trade Partner
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Your rating directly updates their platform <strong>Trust Score %</strong>!
              </p>

              {reviewSuccess ? (
                <div className="text-center py-6 text-emerald-400 font-bold text-sm">
                  {reviewSuccess}
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Star selection */}
                  <div>
                    <label className="text-xs text-slate-300 font-bold block mb-1">Star Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer"
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
                      placeholder="Fast shipping, game disc in pristine condition as described!"
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-2.5 text-xs font-bold justify-center cursor-pointer"
                  >
                    Submit Trader Rating
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* LIVE TRADE CHAT MODAL OVERLAY */}
        {activeChatTrade && (
          <TradeChatModal
            trade={activeChatTrade}
            onClose={() => setActiveChatTrade(null)}
          />
        )}
        </div>
      </div>
    </div>
  );
};
