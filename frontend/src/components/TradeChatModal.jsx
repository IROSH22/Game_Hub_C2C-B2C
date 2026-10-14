import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, RefreshCw, ShieldCheck, User, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const TradeChatModal = ({ trade, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const tradeId = trade?._id || trade?.id;
  const isRequester =
    (trade?.requesterId?._id || trade?.requesterId)?.toString() === (user?._id || user?.id)?.toString();
  const partner = isRequester ? trade?.receiverId : trade?.requesterId;
  const partnerName = partner?.name || 'Trade Partner';

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchMessages = async () => {
    if (!tradeId) return;
    try {
      const res = await api.getTradeMessages(tradeId);
      if (res.success) {
        setMessages(res.messages || []);
        setError('');
      } else {
        if (!messages.length) setError(res.message || 'Unable to load trade messages.');
      }
    } catch (err) {
      console.error('Fetch trade messages error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const timer = setInterval(fetchMessages, 3500);
    return () => clearInterval(timer);
  }, [tradeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || sending) return;

    if (!tradeId) {
      setError('Invalid trade session. Please return and re-open the trade.');
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    setError('');

    // Optimistic message placeholder
    const optimisticMsg = {
      senderId: user?._id || user?.id,
      senderName: user?.name || 'You',
      text: textToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.sendTradeMessage(tradeId, textToSend);
      if (res.success) {
        setMessages(res.messages || []);
      } else {
        setError(res.message || 'Failed to send message.');
        setInputText(textToSend);
      }
    } catch (err) {
      setError(err.message || 'Network error.');
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleQuickSnippet = (snippet) => {
    setInputText(snippet);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 flex flex-col items-center justify-center cursor-pointer overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl flex flex-col h-[90vh] max-h-[640px] my-auto overflow-hidden cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="shrink-0 p-3.5 sm:p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Prominent Back Button (Never Hidden) */}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
              title="Return to Trade Desk (Esc)"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Back to Trades</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 truncate">
                <h3 className="text-base font-extrabold text-white font-['Rajdhani'] leading-tight truncate">
                  Trade Live Chat
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {trade?.status || 'Active'}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                <span>With: <strong className="text-slate-200">{partnerName}</strong></span>
                <span>•</span>
                <span className="text-amber-400 font-mono text-[11px] truncate">
                  {trade?.offeredListingId?.title || 'Game A'} ⇄ {trade?.wantedListingId?.title || 'Game B'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={fetchMessages}
              title="Refresh messages"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Chat (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security & Logistics Banner */}
        <div className="shrink-0 px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Exchange Safety: Share delivery address, courier waybill number &amp; test disc condition.</span>
          </div>
          <span className="text-[10px] text-amber-400/90 font-mono shrink-0 ml-2">ESC to Close</span>
        </div>

        {/* Messages Stream with min-h-0 so flexbox cannot push header offscreen */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-950/50">
          {loading && messages.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Loading trade coordination thread...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-700" />
              <p>No messages yet. Send a greeting to start coordinating exchange logistics!</p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const currentUserId = (user?._id || user?.id)?.toString();
              const msgSenderId = (msg.senderId?._id || msg.senderId)?.toString();
              const isMe = msgSenderId === currentUserId;

              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400 font-mono">
                    <span>{isMe ? 'You' : msg.senderName || partnerName}</span>
                    <span>•</span>
                    <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-md ${
                      isMe
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="shrink-0 px-3.5 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <span className="text-slate-400 flex items-center gap-1 shrink-0 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick replies:
          </span>
          <button
            type="button"
            onClick={() => handleQuickSnippet(`Hi ${partnerName}! Where shall we arrange the handover or courier?`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer border border-slate-700/60"
          >
            Handover location?
          </button>
          <button
            type="button"
            onClick={() => handleQuickSnippet(`My delivery address is: ${user?.address || '12 Kandy Road'}, ${user?.city || 'Malabe'}`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer border border-slate-700/60"
          >
            Share my address
          </button>
          <button
            type="button"
            onClick={() => handleQuickSnippet(`I have packed the game in bubble wrap and will dispatch today!`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer border border-slate-700/60"
          >
            Dispatched parcel
          </button>
          <button
            type="button"
            onClick={() => handleQuickSnippet(`Received the game! Disc tested and working 100%. Thank you!`)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer border border-slate-700/60"
          >
            Received &amp; verified
          </button>
        </div>

        {/* Input Bar with Secondary Back Button as Fail-Safe */}
        <form onSubmit={handleSend} className="shrink-0 p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2 relative">
          {error && (
            <div className="absolute -top-7 left-4 right-4 text-center text-[10px] text-red-400 bg-red-950/90 border border-red-800 py-1 rounded-lg">
              {error}
            </div>
          )}
          {/* Secondary Bottom Back Button */}
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="Exit chat and return to trade proposals"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${partnerName} about exchange & delivery...`}
            className="flex-1 p-3 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="btn-primary py-3 px-5 rounded-2xl text-xs font-bold shadow-lg shadow-sky-500/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
          >
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
