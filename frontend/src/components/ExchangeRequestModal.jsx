import React, { useState, useEffect } from 'react';
import { X, Repeat, ArrowRightLeft, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ExchangeRequestModal = ({ targetGame, onClose, onSuccess, onOpenListTrade }) => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [selectedListingId, setSelectedListingId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMyGames = async () => {
      try {
        const res = await api.getMyExchangeListings();
        if (res.success) {
          setMyListings(res.listings || []);
          if (res.listings && res.listings.length > 0) {
            setSelectedListingId(res.listings[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchMyGames();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedListingId) {
      setError('Please select a game from your inventory to offer.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.sendExchangeRequest({
        wantedListingId: targetGame._id,
        offeredListingId: selectedListingId,
        message,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1800);
      } else {
        setError(res.message || 'Failed to submit exchange request.');
      }
    } catch (err) {
      setError('Network error submitting trade request.');
    }
    setSubmitting(false);
  };

  const selectedOfferedGame = myListings.find((g) => g._id === selectedListingId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-pink-500/40 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 text-pink-400 font-bold uppercase tracking-wider text-xs font-['Rajdhani']">
          <ArrowRightLeft className="w-4 h-4 text-pink-400" />
          Propose C2C Game Barter
        </div>

        <h3 className="text-2xl font-bold text-white font-['Rajdhani'] mb-1">
          Offer a Trade for <span className="text-cyan-400">{targetGame?.title}</span>
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Owned by <strong className="text-white">{targetGame?.sellerId?.name}</strong> • Seeking: {targetGame?.wantedGames || 'Any trade'}
        </p>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white font-['Rajdhani']">
              Trade Request Dispatched!
            </h4>
            <p className="text-xs text-slate-300">
              The owner has been notified via In-App Alert and Email. You can track their response in your <strong>Trade Desk</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Comparison Box */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <div className="space-y-1">
                <div className="text-[10px] text-pink-400 font-bold uppercase">Game You Want</div>
                <img
                  src={targetGame?.imageUrl}
                  alt={targetGame?.title}
                  className="w-full h-24 object-cover rounded-lg border border-slate-700"
                />
                <div className="text-xs font-bold text-white truncate">{targetGame?.title}</div>
                <div className="text-[10px] text-slate-400">{targetGame?.platform} • {targetGame?.condition}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase">Game You Offer</div>
                {selectedOfferedGame ? (
                  <>
                    <img
                      src={selectedOfferedGame.imageUrl}
                      alt={selectedOfferedGame.title}
                      className="w-full h-24 object-cover rounded-lg border border-cyan-500/40"
                    />
                    <div className="text-xs font-bold text-white truncate">{selectedOfferedGame.title}</div>
                    <div className="text-[10px] text-cyan-400">{selectedOfferedGame.platform} • {selectedOfferedGame.condition}</div>
                  </>
                ) : (
                  <div className="w-full h-24 rounded-lg border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 text-xs p-2 text-center">
                    Select a game below
                  </div>
                )}
              </div>
            </div>

            {/* Select Game from Inventory */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Select Game to Offer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenListTrade();
                  }}
                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> List new game first
                </button>
              </div>

              {loading ? (
                <div className="text-xs text-slate-400">Loading your trade listings...</div>
              ) : myListings.length === 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
                  <p>You haven't listed any games for trade in your profile yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenListTrade();
                    }}
                    className="btn-secondary py-1.5 px-3 text-xs text-white"
                  >
                    + Add a Game to Your Trade List
                  </button>
                </div>
              ) : (
                <select
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-pink-500"
                >
                  {myListings.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.title} ({g.platform} • {g.condition}) - Est. ${g.price}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Message / Pitch */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Trade Note / Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="E.g., Mint condition disc, includes original map and case. Can ship tomorrow morning!"
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedListingId}
              className="btn-exchange w-full py-3.5 text-sm font-bold justify-center cursor-pointer disabled:opacity-50"
            >
              <Repeat className="w-4 h-4" />
              {submitting ? 'Transmitting Request...' : 'Send Trade Proposal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
