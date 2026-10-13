import React, { useState } from 'react';
import { X, PlusCircle, Repeat, Image, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

const SAMPLE_GAMING_COVERS = [
  { name: 'Cyberpunk 2077', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
  { name: 'God of War', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800' },
  { name: 'Elden Ring', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800' },
  { name: 'Spider-Man', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800' },
  { name: 'Zelda', url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800' },
  { name: 'Sports Football', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800' },
];

export const AddExchangeListingModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PS5',
    genre: 'Action',
    condition: 'Like New',
    price: 39.99,
    wantedGames: '',
    description: '',
    imageUrl: SAMPLE_GAMING_COVERS[0].url,
    exchangeable: true,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.wantedGames) {
      setError('Please provide game title and what game you want in return.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createGame({
        ...formData,
        stock: 1,
        exchangeable: true,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(res.message || 'Failed to list game.');
      }
    } catch (err) {
      setError('Network error while listing game.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-pink-500/40 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2 text-pink-400 font-bold uppercase tracking-wider text-xs font-['Rajdhani']">
          <Repeat className="w-4 h-4" />
          Add to Swap Zone (C2C Barter)
        </div>

        <h3 className="text-2xl font-bold text-white font-['Rajdhani'] mb-1">
          List Your Game for Barter Exchange
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Put up a game you've finished so other gamers can offer you exciting titles in exchange!
        </p>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-xl font-bold text-white font-['Rajdhani']">
              Game Listed on Swap Zone!
            </h4>
            <p className="text-xs text-slate-300">
              Your game is now live. When another gamer offers a swap, you will receive an in-app and email notification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}

            {/* Game Title */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Game Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., God of War Ragnarök, Elden Ring, Spider-Man 2"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-pink-500 text-xs"
              />
            </div>

            {/* Platform & Genre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="PS5">PS5</option>
                  <option value="Xbox Series X">Xbox Series X</option>
                  <option value="PC">PC</option>
                  <option value="Nintendo Switch">Nintendo Switch</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Genre</label>
                <select
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="Action">Action</option>
                  <option value="RPG">RPG</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sports">Sports</option>
                  <option value="Open World">Open World</option>
                  <option value="Shooter">Shooter</option>
                  <option value="Racing">Racing</option>
                  <option value="Horror">Horror</option>
                </select>
              </div>
            </div>

            {/* Condition & Estimated Value */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Physical Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                >
                  <option value="Like New">Like New (Mint)</option>
                  <option value="Good">Good (Working fine)</option>
                  <option value="Fair">Fair</option>
                  <option value="Brand New">Brand New (Sealed)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Est. Trade Value ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            {/* What you want in return */}
            <div>
              <label className="block text-pink-400 font-bold mb-1">
                Wanted Game(s) in Return (Wishlist Pitch)
              </label>
              <input
                type="text"
                required
                value={formData.wantedGames}
                onChange={(e) => setFormData({ ...formData, wantedGames: e.target.value })}
                placeholder="E.g., Elden Ring or Black Myth Wukong or any PS5 RPG"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-pink-500/50 text-white text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Description / Notes</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Disc is in immaculate condition. Completed main story and DLC. Original box included."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              />
            </div>

            {/* Image Presets */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">
                Cover Image Presets (Or paste custom image link)
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SAMPLE_GAMING_COVERS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                    className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      formData.imageUrl === preset.url ? 'border-pink-500 scale-105' : 'border-slate-800 opacity-60'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full mt-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-exchange w-full py-3 text-sm font-bold justify-center cursor-pointer mt-4"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Posting Listing...' : 'Publish Game to Swap Zone'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
