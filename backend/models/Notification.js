const { getSupabase } = require('../utils/supabaseClient');

function formatNotification(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    userId: row.user_id,
    title: row.title || 'Notification',
    message: row.message || '',
    type: row.type || 'system',
    link: row.link || '/',
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
    toObject() { return { ...this }; },
    toJSON() { return { ...this }; },
  };
}

class NotificationQueryBuilder {
  constructor(initialQuery = {}) {
    this.mongoQuery = initialQuery;
    this.sortOption = { created_at: false };
    this.limitCount = 50;
  }

  sort(sortOption) {
    if (typeof sortOption === 'object' && sortOption) {
      if (sortOption.createdAt !== undefined) {
        this.sortOption = { created_at: sortOption.createdAt === 1 };
      }
    }
    return this;
  }

  limit(n) {
    this.limitCount = Math.max(1, Number(n) || 50);
    return this;
  }

  async execute() {
    const supabase = getSupabase();
    if (!supabase) return [];

    let q = supabase.from('notifications').select('*');

    if (this.mongoQuery.userId) {
      const uId = (this.mongoQuery.userId._id || this.mongoQuery.userId.id || this.mongoQuery.userId).toString();
      q = q.eq('user_id', uId);
    }

    if (this.mongoQuery.isRead !== undefined) {
      q = q.eq('is_read', Boolean(this.mongoQuery.isRead));
    }

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending }).limit(this.limitCount);

    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(formatNotification);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class NotificationModel {
  static formatNotification(row) {
    return formatNotification(row);
  }

  static find(query = {}) {
    return new NotificationQueryBuilder(query);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;

    let q = supabase.from('notifications').select('*', { count: 'exact', head: true });
    if (query.userId) {
      const uId = (query.userId._id || query.userId.id || query.userId).toString();
      q = q.eq('user_id', uId);
    }
    if (query.isRead !== undefined) {
      q = q.eq('is_read', Boolean(query.isRead));
    }

    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const uId = typeof data.userId === 'object' ? (data.userId._id || data.userId.id) : data.userId;
    const row = {
      user_id: uId ? uId.toString() : null,
      title: data.title || 'Notification',
      message: data.message || '',
      type: data.type || 'system',
      link: data.link || '/',
      is_read: Boolean(data.isRead),
    };

    const { data: inserted, error } = await supabase.from('notifications').insert(row).select().single();
    if (error || !inserted) return null;
    return formatNotification(inserted);
  }

  static async findOneAndUpdate(query = {}, updates = {}) {
    const supabase = getSupabase();
    if (!supabase) return null;

    let q = supabase.from('notifications').update({ is_read: updates.isRead ?? true });

    if (query._id || query.id) {
      const idVal = (query._id || query.id).toString();
      q = q.eq('id', idVal);
    }

    if (query.userId) {
      const uId = (query.userId._id || query.userId.id || query.userId).toString();
      q = q.eq('user_id', uId);
    }

    const { data, error } = await q.select().maybeSingle();
    if (error || !data) return null;
    return formatNotification(data);
  }

  static async updateMany(query = {}, updates = {}) {
    const supabase = getSupabase();
    if (!supabase) return { modifiedCount: 0 };

    let q = supabase.from('notifications').update({ is_read: updates.isRead ?? true });

    if (query.userId) {
      const uId = (query.userId._id || query.userId.id || query.userId).toString();
      q = q.eq('user_id', uId);
    }

    if (query.isRead !== undefined) {
      q = q.eq('is_read', Boolean(query.isRead));
    }

    const { data, error } = await q.select();
    if (error || !data) return { modifiedCount: 0 };
    return { modifiedCount: data.length };
  }
}

module.exports = NotificationModel;
