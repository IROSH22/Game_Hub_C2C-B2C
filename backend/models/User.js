const { getSupabase } = require('../utils/supabaseClient');

function formatUser(row) {
  if (!row) return null;
  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    role: row.role || 'customer',
    phone: row.phone || '',
    address: row.address || '',
    city: row.city || '',
    profileImage: row.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    shopName: row.shop_name || '',
    shopDescription: row.shop_description || '',
    trustScore: Number(row.trust_score) || 95,
    successfulTrades: Number(row.successful_trades) || 0,
    totalRatings: 15,
    averageRating: 4.9,
    isBanned: Boolean(row.is_banned),
    wishlist: Array.isArray(row.wishlist) ? row.wishlist : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async save() {
      const supabase = getSupabase();
      if (!supabase) return this;
      const updates = {
        name: this.name,
        phone: this.phone,
        address: this.address,
        city: this.city,
        profile_image: this.profileImage,
        shop_name: this.shopName,
        trust_score: this.trustScore,
        successful_trades: this.successfulTrades,
        wishlist: Array.isArray(this.wishlist)
          ? this.wishlist.map((item) => (typeof item === 'object' && item ? (item._id || item.id) : item))
          : [],
        updated_at: new Date().toISOString(),
      };
      await supabase.from('users').update(updates).eq('id', this.id);
      return this;
    },
    toObject() {
      return { ...this };
    },
    toJSON() {
      return { ...this };
    },
  };

  user.select = function () {
    return this;
  };

  user.populate = async function (field) {
    if (field === 'wishlist' && Array.isArray(this.wishlist) && this.wishlist.length > 0) {
      const supabase = getSupabase();
      if (supabase) {
        const gameIds = this.wishlist.map((item) => (typeof item === 'object' && item ? (item._id || item.id) : item));
        const { data: games } = await supabase.from('game_listings').select('*').in('id', gameIds);
        if (games) {
          const GameListing = require('./GameListing');
          this.wishlist = games.map((g) => (GameListing.formatGame ? GameListing.formatGame(g) : g));
        }
      }
    }
    return this;
  };

  return user;
}

class UserModel {
  static findOne(query = {}) {
    const promise = (async () => {
      const supabase = getSupabase();
      if (!supabase) return null;
      let q = supabase.from('users').select('*');
      if (query.email) {
        q = q.ilike('email', query.email.toLowerCase());
      }
      if (query.role) {
        q = q.eq('role', query.role);
      }
      if (query._id || query.id) {
        q = q.eq('id', (query._id || query.id).toString());
      }
      const { data, error } = await q.limit(1);
      if (error || !data || data.length === 0) return null;
      return formatUser(data[0]);
    })();

    promise.select = function () { return this; };
    promise.populate = function () { return this; };
    return promise;
  }

  static findById(id) {
    if (!id) {
      const p = Promise.resolve(null);
      p.select = () => p;
      p.populate = () => p;
      return p;
    }
    const cleanId = (id._id || id.id || id).toString();
    const promise = (async () => {
      const supabase = getSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase.from('users').select('*').eq('id', cleanId).maybeSingle();
      if (error || !data) return null;
      return formatUser(data);
    })();

    promise.select = function () { return this; };
    promise.populate = async function (field) {
      const user = await this;
      if (user && user.populate) return user.populate(field);
      return user;
    };
    return promise;
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not initialized');
    const newId = data.id || data._id;
    const insertObj = {
      name: data.name,
      email: (data.email || '').toLowerCase(),
      password: data.password,
      role: data.role || 'customer',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || 'Colombo',
      profile_image: data.profileImage || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name || 'Gamer')}`,
      shop_name: data.shopName || '',
      trust_score: data.trustScore || 95,
      successful_trades: data.successfulTrades || 0,
      wishlist: data.wishlist || [],
    };
    if (newId) insertObj.id = newId;

    const { data: inserted, error } = await supabase.from('users').insert(insertObj).select().single();
    if (error) throw new Error(error.message);
    return formatUser(inserted);
  }

  static find(query = {}) {
    const supabase = getSupabase();
    const promise = (async () => {
      if (!supabase) return [];
      let q = supabase.from('users').select('*');
      if (query.role) q = q.eq('role', query.role);
      const { data, error } = await q;
      if (error || !data) return [];
      return data.map(formatUser);
    })();

    // Add query chain support (.select, .sort, .limit, .skip)
    promise.select = function () {
      return this;
    };
    promise.sort = function () {
      return this;
    };
    promise.limit = function () {
      return this;
    };
    promise.skip = function () {
      return this;
    };
    promise.populate = function () {
      return this;
    };
    return promise;
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    const supabase = getSupabase();
    if (!supabase || !id) return null;
    const cleanId = id.toString();
    const updateObj = { ...updateData, updated_at: new Date().toISOString() };
    if (updateObj.profileImage) updateObj.profile_image = updateObj.profileImage;
    if (updateObj.shopName) updateObj.shop_name = updateObj.shopName;
    if (updateObj.trustScore) updateObj.trust_score = updateObj.trustScore;
    if (updateObj.successfulTrades) updateObj.successful_trades = updateObj.successfulTrades;
    delete updateObj._id;
    delete updateObj.id;

    const { data, error } = await supabase.from('users').update(updateObj).eq('id', cleanId).select().single();
    if (error || !data) return null;
    return formatUser(data);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;
    let q = supabase.from('users').select('*', { count: 'exact', head: true });
    if (query.role) q = q.eq('role', query.role);
    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  }
}

UserModel.formatUser = formatUser;
module.exports = UserModel;
