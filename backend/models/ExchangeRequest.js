const { getSupabase } = require('../utils/supabaseClient');

function parseMeta(rawMessage) {
  if (!rawMessage) return { text: '', messages: [] };
  if (typeof rawMessage === 'object') return rawMessage;
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {
    // Plain string message
  }
  return { text: rawMessage, messages: [] };
}

function formatExchange(row) {
  if (!row) return null;
  const meta = parseMeta(row.message);

  const exchange = {
    _id: row.id,
    id: row.id,
    requesterId: row.requester_id,
    receiverId: row.owner_id,
    wantedListingId: row.listing_id,
    offeredListingId: meta.offeredListingId || null,
    status: meta.actualStatus || row.status || 'Pending',
    message: meta.text !== undefined ? meta.text : (row.message || ''),
    counterOfferMessage: meta.counterOfferMessage || '',
    trackingNumberRequester: meta.trackingNumberRequester || row.tracking_number || '',
    trackingNumberReceiver: meta.trackingNumberReceiver || '',
    deliveryStatusRequester: meta.deliveryStatusRequester || 'Preparing',
    deliveryStatusReceiver: meta.deliveryStatusReceiver || 'Preparing',
    requesterAddress: meta.requesterAddress || '',
    receiverAddress: meta.receiverAddress || '',
    isReviewedByRequester: Boolean(meta.isReviewedByRequester),
    isReviewedByReceiver: Boolean(meta.isReviewedByReceiver),
    messages: Array.isArray(meta.messages) ? meta.messages : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    async save() {
      const supabase = getSupabase();
      if (!supabase) return this;

      const reqId = typeof this.requesterId === 'object' ? (this.requesterId._id || this.requesterId.id) : this.requesterId;
      const recId = typeof this.receiverId === 'object' ? (this.receiverId._id || this.receiverId.id) : this.receiverId;
      const wantedId = typeof this.wantedListingId === 'object' ? (this.wantedListingId._id || this.wantedListingId.id) : this.wantedListingId;
      const offeredId = typeof this.offeredListingId === 'object' ? (this.offeredListingId._id || this.offeredListingId.id) : this.offeredListingId;

      const metaToStore = {
        text: this.message || '',
        counterOfferMessage: this.counterOfferMessage || '',
        trackingNumberRequester: this.trackingNumberRequester || '',
        trackingNumberReceiver: this.trackingNumberReceiver || '',
        deliveryStatusRequester: this.deliveryStatusRequester || 'Preparing',
        deliveryStatusReceiver: this.deliveryStatusReceiver || 'Preparing',
        requesterAddress: this.requesterAddress || '',
        receiverAddress: this.receiverAddress || '',
        isReviewedByRequester: this.isReviewedByRequester,
        isReviewedByReceiver: this.isReviewedByReceiver,
        offeredListingId: offeredId ? offeredId.toString() : null,
        actualStatus: this.status,
        messages: Array.isArray(this.messages) ? this.messages : [],
      };

      // Postgres DB status check constraint: ('Pending', 'Accepted', 'Rejected', 'Counter-Offer', 'Completed')
      let dbStatus = this.status;
      if (dbStatus === 'Counter-offer') dbStatus = 'Counter-Offer';
      if (!['Pending', 'Accepted', 'Rejected', 'Counter-Offer', 'Completed'].includes(dbStatus)) {
        dbStatus = 'Accepted';
      }

      const updates = {
        owner_id: recId ? recId.toString() : undefined,
        listing_id: wantedId ? wantedId.toString() : undefined,
        status: dbStatus,
        tracking_number: this.trackingNumberRequester || this.trackingNumberReceiver || null,
        message: JSON.stringify(metaToStore),
        updated_at: new Date().toISOString(),
      };

      await supabase.from('exchange_requests').update(updates).eq('id', this.id);
      return this;
    },

    toObject() {
      return { ...this };
    },
    toJSON() {
      return { ...this };
    },
  };

  exchange.populate = async function (field) {
    const supabase = getSupabase();
    if (!supabase) return this;

    const User = require('./User');
    const GameListing = require('./GameListing');

    if (field === 'requesterId' && this.requesterId) {
      const uId = typeof this.requesterId === 'object' ? (this.requesterId._id || this.requesterId.id) : this.requesterId;
      const u = await User.findById(uId);
      if (u) this.requesterId = u;
    } else if (field === 'receiverId' && this.receiverId) {
      const uId = typeof this.receiverId === 'object' ? (this.receiverId._id || this.receiverId.id) : this.receiverId;
      const u = await User.findById(uId);
      if (u) this.receiverId = u;
    } else if (field === 'wantedListingId' && this.wantedListingId) {
      const gId = typeof this.wantedListingId === 'object' ? (this.wantedListingId._id || this.wantedListingId.id) : this.wantedListingId;
      const g = await GameListing.findById(gId);
      if (g) this.wantedListingId = g;
    } else if (field === 'offeredListingId' && this.offeredListingId) {
      const gId = typeof this.offeredListingId === 'object' ? (this.offeredListingId._id || this.offeredListingId.id) : this.offeredListingId;
      const g = await GameListing.findById(gId);
      if (g) this.offeredListingId = g;
    }

    return this;
  };

  return exchange;
}

class ExchangeQueryBuilder {
  constructor(initialQuery = {}, single = false) {
    this.mongoQuery = initialQuery;
    this.single = single;
    this.populates = new Set();
    this.sortOption = { created_at: false };
  }

  populate(field) {
    if (field) this.populates.add(field);
    return this;
  }

  sort(sortOption) {
    if (typeof sortOption === 'object' && sortOption) {
      if (sortOption.createdAt !== undefined) {
        this.sortOption = { created_at: sortOption.createdAt === 1 };
      }
    }
    return this;
  }

  async execute() {
    const supabase = getSupabase();
    if (!supabase) return this.single ? null : [];

    let q = supabase.from('exchange_requests').select('*');

    if (this.mongoQuery.receiverId) {
      const rId = typeof this.mongoQuery.receiverId === 'object' ? (this.mongoQuery.receiverId._id || this.mongoQuery.receiverId.id) : this.mongoQuery.receiverId;
      q = q.eq('owner_id', rId.toString());
    }

    if (this.mongoQuery.requesterId) {
      const rId = typeof this.mongoQuery.requesterId === 'object' ? (this.mongoQuery.requesterId._id || this.mongoQuery.requesterId.id) : this.mongoQuery.requesterId;
      q = q.eq('requester_id', rId.toString());
    }

    if (this.mongoQuery.wantedListingId) {
      const wId = typeof this.mongoQuery.wantedListingId === 'object' ? (this.mongoQuery.wantedListingId._id || this.mongoQuery.wantedListingId.id) : this.mongoQuery.wantedListingId;
      q = q.eq('listing_id', wId.toString());
    }

    if (this.mongoQuery.status) {
      let st = this.mongoQuery.status;
      if (st === 'Counter-offer') st = 'Counter-Offer';
      q = q.eq('status', st);
    }

    if (this.mongoQuery._id || this.mongoQuery.id) {
      const idVal = this.mongoQuery._id || this.mongoQuery.id;
      q = q.eq('id', (idVal._id || idVal.id || idVal).toString());
    }

    if (this.mongoQuery.$or && Array.isArray(this.mongoQuery.$or)) {
      const userCondition = this.mongoQuery.$or.find((item) => item.requesterId || item.receiverId);
      if (userCondition) {
        const uId = userCondition.requesterId || userCondition.receiverId;
        const cleanUId = (uId._id || uId.id || uId).toString();
        q = q.or(`requester_id.eq.${cleanUId},owner_id.eq.${cleanUId}`);
      }
    }

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending });

    if (this.single) {
      q = q.limit(1);
      const { data, error } = await q;
      if (error || !data || data.length === 0) return null;
      const item = formatExchange(data[0]);
      for (const field of this.populates) {
        await item.populate(field);
      }
      return item;
    }

    const { data, error } = await q;
    if (error || !data) return [];

    const items = data.map(formatExchange);

    // Apply population batching if requested
    if (this.populates.size > 0 && items.length > 0) {
      const User = require('./User');
      const GameListing = require('./GameListing');

      if (this.populates.has('requesterId')) {
        const userIds = [...new Set(items.map((i) => i.requesterId).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: users } = await supabase.from('users').select('*').in('id', userIds);
          const uMap = {};
          (users || []).forEach((u) => { uMap[u.id] = User.formatUser(u); });
          items.forEach((i) => { if (i.requesterId && uMap[i.requesterId]) i.requesterId = uMap[i.requesterId]; });
        }
      }

      if (this.populates.has('receiverId')) {
        const userIds = [...new Set(items.map((i) => i.receiverId).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: users } = await supabase.from('users').select('*').in('id', userIds);
          const uMap = {};
          (users || []).forEach((u) => { uMap[u.id] = User.formatUser(u); });
          items.forEach((i) => { if (i.receiverId && uMap[i.receiverId]) i.receiverId = uMap[i.receiverId]; });
        }
      }

      if (this.populates.has('wantedListingId')) {
        const gameIds = [...new Set(items.map((i) => i.wantedListingId).filter(Boolean))];
        if (gameIds.length > 0) {
          const { data: games } = await supabase.from('game_listings').select('*').in('id', gameIds);
          const gMap = {};
          (games || []).forEach((g) => { gMap[g.id] = GameListing.formatGame(g); });
          items.forEach((i) => { if (i.wantedListingId && gMap[i.wantedListingId]) i.wantedListingId = gMap[i.wantedListingId]; });
        }
      }

      if (this.populates.has('offeredListingId')) {
        const gameIds = [...new Set(items.map((i) => i.offeredListingId).filter(Boolean))];
        if (gameIds.length > 0) {
          const { data: games } = await supabase.from('game_listings').select('*').in('id', gameIds);
          const gMap = {};
          (games || []).forEach((g) => { gMap[g.id] = GameListing.formatGame(g); });
          items.forEach((i) => { if (i.offeredListingId && gMap[i.offeredListingId]) i.offeredListingId = gMap[i.offeredListingId]; });
        }
      }
    }

    return items;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class ExchangeRequestModel {
  static formatExchange(row) {
    return formatExchange(row);
  }

  static find(query = {}) {
    return new ExchangeQueryBuilder(query, false);
  }

  static findById(id) {
    if (!id) return new ExchangeQueryBuilder({ id: 'none' }, true);
    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    return new ExchangeQueryBuilder({ id: cleanId }, true);
  }

  static findOne(query = {}) {
    return new ExchangeQueryBuilder(query, true);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;

    let q = supabase.from('exchange_requests').select('*', { count: 'exact', head: true });
    if (query.status) {
      let st = query.status;
      if (st === 'Counter-offer') st = 'Counter-Offer';
      q = q.eq('status', st);
    }
    if (query.$or && Array.isArray(query.$or)) {
      const u = query.$or.find((item) => item.requesterId || item.receiverId);
      if (u) {
        const idVal = (u.requesterId || u.receiverId).toString();
        q = q.or(`requester_id.eq.${idVal},owner_id.eq.${idVal}`);
      }
    }

    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not connected');

    const reqId = typeof data.requesterId === 'object' ? (data.requesterId._id || data.requesterId.id) : data.requesterId;
    const recId = typeof data.receiverId === 'object' ? (data.receiverId._id || data.receiverId.id) : data.receiverId;
    const wantedId = typeof data.wantedListingId === 'object' ? (data.wantedListingId._id || data.wantedListingId.id) : data.wantedListingId;
    const offeredId = typeof data.offeredListingId === 'object' ? (data.offeredListingId._id || data.offeredListingId.id) : data.offeredListingId;

    // Fetch offered listing summary to satisfy non-null constraints in postgres table
    let offeredTitle = 'Offered Game';
    let offeredPlatform = 'PS5';
    let offeredCondition = 'Like New';
    let offeredImage = null;

    if (offeredId) {
      const { data: g } = await supabase.from('game_listings').select('*').eq('id', offeredId.toString()).maybeSingle();
      if (g) {
        offeredTitle = g.title;
        offeredPlatform = g.platform;
        offeredCondition = g.condition || 'Like New';
        offeredImage = g.image_url;
      }
    }

    const meta = {
      text: data.message || '',
      counterOfferMessage: data.counterOfferMessage || '',
      trackingNumberRequester: data.trackingNumberRequester || '',
      trackingNumberReceiver: data.trackingNumberReceiver || '',
      requesterAddress: data.requesterAddress || '',
      receiverAddress: data.receiverAddress || '',
      isReviewedByRequester: false,
      isReviewedByReceiver: false,
      offeredListingId: offeredId ? offeredId.toString() : null,
      actualStatus: data.status || 'Pending',
      messages: Array.isArray(data.messages) ? data.messages : [],
    };

    const row = {
      requester_id: reqId ? reqId.toString() : null,
      owner_id: recId ? recId.toString() : null,
      listing_id: wantedId ? wantedId.toString() : null,
      offered_game_title: offeredTitle,
      offered_game_platform: offeredPlatform,
      offered_game_condition: offeredCondition,
      offered_game_image: offeredImage,
      message: JSON.stringify(meta),
      status: 'Pending',
    };

    const { data: inserted, error } = await supabase.from('exchange_requests').insert(row).select().single();
    if (error) {
      throw new Error(`Failed to create trade request: ${error.message}`);
    }

    return formatExchange(inserted);
  }
}

module.exports = ExchangeRequestModel;
