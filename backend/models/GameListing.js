const { getSupabase } = require('../utils/supabaseClient');

function formatGame(row) {
  if (!row) return null;
  const game = {
    _id: row.id,
    id: row.id,
    sellerId: row.seller_id,
    title: row.title || 'Untitled Game',
    description:
      row.description ||
      `Original ${row.title} for ${row.platform}. Tested and fully working in ${row.city || 'Colombo'}.`,
    platform: row.platform || 'PS5',
    genre: row.genre || 'Action',
    condition: row.condition || 'Brand New',
    isNewGame: row.condition === 'Brand New',
    price: Number(row.price) || 0,
    originalPrice: Number(row.price) > 0 ? Number((Number(row.price) * 1.15).toFixed(2)) : 0,
    stock: row.stock !== undefined ? Number(row.stock) : 1,
    exchangeable: Boolean(row.exchangeable),
    wantedGames: row.looking_for || '',
    imageUrl:
      row.image_url ||
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    screenshots: [
      row.image_url ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    ],
    status: row.status || 'Active',
    isApproved: true,
    rating: Number(row.rating) || 4.8,
    reviewsCount: 15,
    isFeatured: Boolean(row.is_featured),
    city: row.city || 'Colombo',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    async save() {
      const supabase = getSupabase();
      if (!supabase) return this;
      const updates = {
        title: this.title,
        platform: this.platform,
        genre: this.genre,
        condition: this.condition,
        price: Number(this.price) || 0,
        stock: Number(this.stock) || 0,
        image_url: this.imageUrl || this.image_url,
        status: this.status || 'Active',
        exchangeable: Boolean(this.exchangeable),
        looking_for: this.wantedGames || this.looking_for || '',
        city: this.city || 'Colombo',
        rating: Number(this.rating) || 4.8,
        updated_at: new Date().toISOString(),
      };
      await supabase.from('game_listings').update(updates).eq('id', this.id);
      return this;
    },
    toObject() {
      return { ...this };
    },
    toJSON() {
      return { ...this };
    },
  };

  game.populate = async function (field) {
    if (field === 'sellerId' && this.sellerId) {
      const rawId = typeof this.sellerId === 'object' ? (this.sellerId._id || this.sellerId.id) : this.sellerId;
      if (rawId) {
        const User = require('./User');
        const user = await User.findById(rawId);
        if (user) this.sellerId = user;
      }
    }
    return this;
  };

  return game;
}

function applySupabaseFilters(baseQuery, mongoQuery = {}) {
  let q = baseQuery;

  if (mongoQuery.status) {
    q = q.eq('status', mongoQuery.status);
  }

  if (mongoQuery.platform && mongoQuery.platform !== 'All') {
    q = q.eq('platform', mongoQuery.platform);
  }

  if (mongoQuery.genre && mongoQuery.genre !== 'All') {
    q = q.eq('genre', mongoQuery.genre);
  }

  if (mongoQuery.condition && mongoQuery.condition !== 'All') {
    q = q.eq('condition', mongoQuery.condition);
  }

  if (mongoQuery.exchangeable !== undefined) {
    q = q.eq('exchangeable', Boolean(mongoQuery.exchangeable));
  }

  if (mongoQuery.sellerId) {
    const sId = typeof mongoQuery.sellerId === 'object' ? (mongoQuery.sellerId._id || mongoQuery.sellerId.id) : mongoQuery.sellerId;
    q = q.eq('seller_id', sId.toString());
  }

  if (mongoQuery._id) {
    if (typeof mongoQuery._id === 'object' && mongoQuery._id.$ne) {
      q = q.neq('id', mongoQuery._id.$ne.toString());
    } else {
      q = q.eq('id', (mongoQuery._id._id || mongoQuery._id).toString());
    }
  }

  if (mongoQuery.id) {
    q = q.eq('id', mongoQuery.id.toString());
  }

  // Price filters: $gt, $gte, $lte
  if (mongoQuery.price) {
    if (typeof mongoQuery.price === 'object') {
      if (mongoQuery.price.$gt !== undefined) q = q.gt('price', Number(mongoQuery.price.$gt));
      if (mongoQuery.price.$gte !== undefined) q = q.gte('price', Number(mongoQuery.price.$gte));
      if (mongoQuery.price.$lte !== undefined) q = q.lte('price', Number(mongoQuery.price.$lte));
      if (mongoQuery.price.$lt !== undefined) q = q.lt('price', Number(mongoQuery.price.$lt));
    } else {
      q = q.eq('price', Number(mongoQuery.price));
    }
  }

  // Text search in title / genre
  if (mongoQuery.$or && Array.isArray(mongoQuery.$or)) {
    const titleOr = mongoQuery.$or.find((item) => item.title && item.title.$regex);
    if (titleOr && titleOr.title.$regex) {
      const term = titleOr.title.$regex.replace(/^\^|\$$/g, '');
      q = q.ilike('title', `%${term}%`);
    }
  }

  return q;
}

class GameQueryBuilder {
  constructor(initialQuery = {}, single = false) {
    this.mongoQuery = initialQuery;
    this.single = single;
    this.populateSeller = false;
    this.populateFields = null;
    this.sortOption = { created_at: false }; // false = DESC
    this.limitCount = single ? 1 : 50;
    this.skipCount = 0;
  }

  populate(path, select) {
    if (path === 'sellerId') {
      this.populateSeller = true;
      this.populateFields = select;
    }
    return this;
  }

  sort(sortOption) {
    if (typeof sortOption === 'object' && sortOption) {
      if (sortOption.createdAt !== undefined) {
        this.sortOption = { created_at: sortOption.createdAt === 1 };
      } else if (sortOption.price !== undefined) {
        this.sortOption = { price: sortOption.price === 1 };
      } else if (sortOption.rating !== undefined) {
        this.sortOption = { rating: sortOption.rating === 1 };
      } else if (sortOption.title !== undefined) {
        this.sortOption = { title: sortOption.title === 1 };
      }
    }
    return this;
  }

  skip(n) {
    this.skipCount = Math.max(0, Number(n) || 0);
    return this;
  }

  limit(n) {
    this.limitCount = Math.max(1, Number(n) || 50);
    return this;
  }

  async execute() {
    const supabase = getSupabase();
    if (!supabase) return this.single ? null : [];

    let q = supabase.from('game_listings').select('*');
    q = applySupabaseFilters(q, this.mongoQuery);

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending });

    if (this.single) {
      q = q.limit(1);
      const { data, error } = await q;
      if (error || !data || data.length === 0) return null;
      const game = formatGame(data[0]);
      if (this.populateSeller) {
        await game.populate('sellerId');
      }
      return game;
    }

    const from = this.skipCount;
    const to = from + this.limitCount - 1;
    q = q.range(from, to);

    const { data, error } = await q;
    if (error || !data) return [];

    const games = data.map(formatGame);

    if (this.populateSeller && games.length > 0) {
      const sellerIds = [...new Set(games.map((g) => g.sellerId).filter(Boolean))];
      if (sellerIds.length > 0) {
        const { data: users } = await supabase.from('users').select('*').in('id', sellerIds);
        if (users && users.length > 0) {
          const User = require('./User');
          const userMap = {};
          users.forEach((u) => {
            userMap[u.id] = User.formatUser ? User.formatUser(u) : u;
          });
          games.forEach((g) => {
            if (g.sellerId && userMap[g.sellerId]) {
              g.sellerId = userMap[g.sellerId];
            }
          });
        }
      }
    }

    return games;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class GameListingModel {
  static formatGame(row) {
    return formatGame(row);
  }

  static find(query = {}) {
    return new GameQueryBuilder(query, false);
  }

  static findById(id) {
    if (!id) return new GameQueryBuilder({ id: 'none' }, true);
    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    return new GameQueryBuilder({ id: cleanId }, true);
  }

  static findOne(query = {}) {
    return new GameQueryBuilder(query, true);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;

    let q = supabase.from('game_listings').select('*', { count: 'exact', head: true });
    q = applySupabaseFilters(q, query);

    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  }

  static async create(gameData) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not connected');

    const sId = typeof gameData.sellerId === 'object' ? (gameData.sellerId._id || gameData.sellerId.id) : gameData.sellerId;

    const row = {
      seller_id: sId ? sId.toString() : null,
      title: gameData.title,
      platform: gameData.platform,
      genre: gameData.genre,
      condition: gameData.condition || 'Brand New',
      price: Number(gameData.price) || 0,
      stock: gameData.stock !== undefined ? Number(gameData.stock) : 1,
      image_url:
        gameData.imageUrl ||
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      status: gameData.status || 'Active',
      exchangeable: Boolean(gameData.exchangeable),
      looking_for: gameData.wantedGames || gameData.looking_for || '',
      city: gameData.city || 'Colombo',
      rating: Number(gameData.rating) || 4.8,
    };

    const { data, error } = await supabase.from('game_listings').insert(row).select().single();
    if (error) {
      throw new Error(`Failed to create game listing: ${error.message}`);
    }

    return formatGame(data);
  }

  static async findByIdAndUpdate(id, updates = {}) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    const dbUpdates = {};

    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.stock !== undefined) dbUpdates.stock = Number(updates.stock);
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.rating !== undefined) dbUpdates.rating = Number(updates.rating);
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('game_listings')
      .update(dbUpdates)
      .eq('id', cleanId)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return formatGame(data);
  }

  static async findByIdAndDelete(id) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    const { error } = await supabase.from('game_listings').delete().eq('id', cleanId);
    return !error;
  }
}

module.exports = GameListingModel;
