import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Repeat, Image as ImageIcon, CheckCircle, AlertCircle, Upload, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SAMPLE_GAMING_COVERS = [
  { name: 'God of War Ragnarök', url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800' },
  { name: 'Elden Ring', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800' },
  { name: 'Spider-Man 2', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800' },
  { name: 'Cyberpunk 2077', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800' },
  { name: 'Zelda Tears of the Kingdom', url: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=800' },
  { name: 'EA FC 25 Sports', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800' },
];

export const AddExchangeListingModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PS5',
    genre: 'Action',
    condition: 'Like New',
    wantedGames: '',
    description: '',
    imageUrl: SAMPLE_GAMING_COVERS[0].url,
    exchangeable: true,
  });

  const [uploadMode, setUploadMode] = useState('preset'); // 'upload' | 'url' | 'preset'
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle local image file upload from device
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, imageUrl: event.target.result }));
      setUploading(false);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.wantedGames.trim()) {
      setError('Please provide the game title and what game you want in return.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createGame({
        ...formData,
        price: 0, // 0 cash required for barter exchanges
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
      setError('Network error while listing game: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 sm:p-6 cursor-pointer"
    >
      <div className="min-h-full flex items-center justify-center py-6">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl glass-panel rounded-3xl border border-amber-500/30 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 cursor-default"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold uppercase tracking-wider text-xs font-['Rajdhani']">
            <Repeat className="w-4 h-4" />
            Game Swap Zone Barter Listing
          </div>

          <h3 className="text-2xl font-bold text-white font-['Rajdhani'] mb-1">
            List Game for Barter Exchange
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Offer a game from your shelf to trade game-for-game with other players. Zero cash fees required!
          </p>

          {user?.role === 'seller' ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white font-['Rajdhani']">
                Exclusive to Customer Accounts
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                As a registered Merchant / Seller, you can sell games in the <strong>Store Catalog</strong>. Game bartering is reserved for regular customer accounts.
              </p>
              <button
                onClick={onClose}
                className="btn-secondary py-2.5 px-6 text-xs mx-auto cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : success ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-xl font-bold text-white font-['Rajdhani']">
                Game Listed on Swap Zone!
              </h4>
              <p className="text-xs text-slate-300">
                Your game is now live. When another gamer offers an exchange, you will receive an instant notification and email.
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
                <label className="block text-slate-300 font-bold mb-1">Game Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., God of War Ragnarök, Elden Ring, Black Myth Wukong"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              {/* Platform & Genre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs cursor-pointer focus:border-amber-400"
                  >
                    <option value="PS5">PlayStation 5 (PS5)</option>
                    <option value="Xbox Series X">Xbox Series X|S</option>
                    <option value="PC">PC (Disc/Boxed)</option>
                    <option value="Nintendo Switch">Nintendo Switch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs cursor-pointer focus:border-amber-400"
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

              {/* Physical Condition */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Physical Disc Condition</label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs cursor-pointer focus:border-amber-400"
                >
                  <option value="Like New">Like New (Mint condition with original case &amp; inserts)</option>
                  <option value="Good">Good (Tested &amp; verified working disc, minor case wear)</option>
                  <option value="Fair">Fair (Disc surface has light scuffs, plays 100%)</option>
                  <option value="Brand New">Brand New (Unopened / sealed copy)</option>
                </select>
              </div>

              {/* What you want in return */}
              <div>
                <label className="block text-amber-400 font-bold mb-1 flex items-center justify-between">
                  <span>Wanted Game(s) in Return *</span>
                  <span className="text-[10px] text-slate-400 font-normal">What titles are you willing to accept?</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.wantedGames}
                  onChange={(e) => setFormData({ ...formData, wantedGames: e.target.value })}
                  placeholder="E.g., Ghost of Tsushima, Spider-Man 2, or any PS5 RPG"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-white text-xs focus:border-amber-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Description / Gamer Notes</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Disc is in immaculate condition. Completed main story. Original manual and sleeve included."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400"
                />
              </div>

              {/* Custom Cover Image Selection & Upload */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-200 font-bold">Game Cover Artwork</label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setUploadMode('upload')}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        uploadMode === 'upload' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        uploadMode === 'url' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('preset')}
                      className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                        uploadMode === 'preset' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Presets
                    </button>
                  </div>
                </div>

                {/* Option 1: File Upload */}
                {uploadMode === 'upload' && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-dashed border-slate-700 text-center hover:border-amber-400 transition-all">
                    <input
                      type="file"
                      id="exchange-cover-file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="exchange-cover-file"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-slate-300"
                    >
                      <Upload className="w-5 h-5 text-amber-400 animate-bounce" />
                      <span>{uploading ? 'Reading image...' : 'Click to Browse & Upload Game Cover'}</span>
                      <span className="text-[10px] text-slate-500">PNG, JPG or WebP up to 5MB</span>
                    </label>
                  </div>
                )}

                {/* Option 2: Image URL */}
                {uploadMode === 'url' && (
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/cover-art.jpg"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-amber-400"
                  />
                )}

                {/* Option 3: Presets */}
                {uploadMode === 'preset' && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {SAMPLE_GAMING_COVERS.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          formData.imageUrl === preset.url ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Cover Preview */}
                {formData.imageUrl && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                    <img
                      src={formData.imageUrl}
                      alt="Cover Preview"
                      className="w-12 h-14 object-cover rounded-lg border border-slate-700 shadow-md shrink-0"
                    />
                    <div className="text-[11px] text-slate-300 truncate">
                      <div className="font-bold text-white flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cover Preview Attached</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">Ready to display on game card</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-exchange w-full py-3 text-sm font-bold justify-center cursor-pointer mt-4 shadow-lg shadow-amber-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                {loading ? 'Publishing Trade Listing...' : 'Publish Game to Swap Zone'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
