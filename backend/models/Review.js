const { getSupabase } = require('../utils/supabaseClient');

function parseReviewMeta(rawComment) {
  if (!rawComment) return { comment: '', type: 'purchase' };
  try {
    const parsed = JSON.parse(rawComment);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {
    // Non-JSON comment string
  }
  return { comment: rawComment, type: 'purchase' };
}

function formatReview(row) {
  if (!row) return null;
  const meta = parseReviewMeta(row.comment);

  const review = {
    _id: row.id,
    id: row.id,
    reviewerId: row.reviewer_id,
    revieweeId: row.target_user_id,
    targetUserId: row.target_user_id,
    rating: Number(row.rating) || 5,
    comment: meta.comment !== undefined ? meta.comment : (row.comment || ''),
    type: meta.type || 'purchase',
    listingId: meta.listingId || null,
    orderId: meta.orderId || null,
    exchangeId: meta.exchangeId || null,
    createdAt: row.created_at,
    toObject() { return { ...this }; },
    toJSON() { return { ...this }; },
  };

  review.populate = async function (field) {
    if (field === 'reviewerId' && this.reviewerId) {
      const uId = (this.reviewerId._id || this.reviewerId.id || this.reviewerId).toString();
      const User = require('./User');
      const u = await User.findById(uId);
      if (u) this.reviewerId = u;
    }
    return this;
  };

  return review;
}

class ReviewQueryBuilder {
  constructor(initialQuery = {}, single = false) {
    this.mongoQuery = initialQuery;
    this.single = single;
    this.populateReviewer = false;
    this.sortOption = { created_at: false };
  }

  populate(field) {
    if (field === 'reviewerId') {
      this.populateReviewer = true;
    }
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

    let q = supabase.from('reviews').select('*');

    if (this.mongoQuery.revieweeId) {
      const rId = (this.mongoQuery.revieweeId._id || this.mongoQuery.revieweeId.id || this.mongoQuery.revieweeId).toString();
      q = q.eq('target_user_id', rId);
    }

    if (this.mongoQuery.reviewerId) {
      const rId = (this.mongoQuery.reviewerId._id || this.mongoQuery.reviewerId.id || this.mongoQuery.reviewerId).toString();
      q = q.eq('reviewer_id', rId);
    }

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending });

    const { data, error } = await q;
    if (error || !data) return this.single ? null : [];

    let reviews = data.map(formatReview);

    // Filter in-memory by listingId or exchangeId if specified
    if (this.mongoQuery.listingId) {
      const lId = (this.mongoQuery.listingId._id || this.mongoQuery.listingId.id || this.mongoQuery.listingId).toString();
      reviews = reviews.filter((r) => r.listingId && r.listingId.toString() === lId);
    }

    if (this.mongoQuery.exchangeId) {
      const eId = (this.mongoQuery.exchangeId._id || this.mongoQuery.exchangeId.id || this.mongoQuery.exchangeId).toString();
      reviews = reviews.filter((r) => r.exchangeId && r.exchangeId.toString() === eId);
    }

    if (this.single) {
      if (reviews.length === 0) return null;
      const singleReview = reviews[0];
      if (this.populateReviewer) {
        await singleReview.populate('reviewerId');
      }
      return singleReview;
    }

    if (this.populateReviewer && reviews.length > 0) {
      const reviewerIds = [...new Set(reviews.map((r) => (r.reviewerId?._id || r.reviewerId)).filter(Boolean))];
      if (reviewerIds.length > 0) {
        const User = require('./User');
        const { data: users } = await supabase.from('users').select('*').in('id', reviewerIds);
        const userMap = {};
        (users || []).forEach((u) => { userMap[u.id] = User.formatUser(u); });
        reviews.forEach((r) => {
          if (r.reviewerId && userMap[r.reviewerId]) {
            r.reviewerId = userMap[r.reviewerId];
          }
        });
      }
    }

    return reviews;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class ReviewModel {
  static formatReview(row) {
    return formatReview(row);
  }

  static find(query = {}) {
    return new ReviewQueryBuilder(query, false);
  }

  static findOne(query = {}) {
    return new ReviewQueryBuilder(query, true);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;
    const { count, error } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not connected');

    const revierId = typeof data.reviewerId === 'object' ? (data.reviewerId._id || data.reviewerId.id) : data.reviewerId;
    const revieeId = typeof data.revieweeId === 'object' ? (data.revieweeId._id || data.revieweeId.id) : data.revieweeId;
    const listId = typeof data.listingId === 'object' ? (data.listingId._id || data.listingId.id) : data.listingId;
    const ordId = typeof data.orderId === 'object' ? (data.orderId._id || data.orderId.id) : data.orderId;
    const exchId = typeof data.exchangeId === 'object' ? (data.exchangeId._id || data.exchangeId.id) : data.exchangeId;

    const meta = {
      comment: data.comment || '',
      type: data.type || 'purchase',
      listingId: listId ? listId.toString() : null,
      orderId: ordId ? ordId.toString() : null,
      exchangeId: exchId ? exchId.toString() : null,
    };

    const row = {
      reviewer_id: revierId ? revierId.toString() : null,
      target_user_id: revieeId ? revieeId.toString() : null,
      rating: Math.min(5, Math.max(1, Math.round(Number(data.rating) || 5))),
      comment: JSON.stringify(meta),
    };

    const { data: inserted, error } = await supabase.from('reviews').insert(row).select().single();
    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return formatReview(inserted);
  }
}

module.exports = ReviewModel;
