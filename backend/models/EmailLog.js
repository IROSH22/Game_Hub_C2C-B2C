const { getSupabase } = require('../utils/supabaseClient');

function formatEmailLog(row) {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    recipientEmail: row.recipient_email,
    recipientName: row.recipient_name || '',
    subject: row.subject || '',
    templateType: row.template_type || 'welcome',
    htmlContent: row.html_content || '',
    status: row.status || 'Sent',
    errorDetails: row.error_details || null,
    createdAt: row.created_at,
    toObject() { return { ...this }; },
    toJSON() { return { ...this }; },
  };
}

class EmailLogQueryBuilder {
  constructor(initialQuery = {}, single = false) {
    this.mongoQuery = initialQuery;
    this.single = single;
    this.sortOption = { created_at: false };
    this.limitCount = single ? 1 : 50;
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
    if (!supabase) return this.single ? null : [];

    let q = supabase.from('email_logs').select('*');

    if (this.mongoQuery.recipientEmail) {
      q = q.ilike('recipient_email', this.mongoQuery.recipientEmail.trim().toLowerCase());
    }

    if (this.mongoQuery._id || this.mongoQuery.id) {
      const idVal = (this.mongoQuery._id || this.mongoQuery.id).toString();
      q = q.eq('id', idVal);
    }

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending }).limit(this.limitCount);

    if (this.single) {
      const { data, error } = await q.maybeSingle();
      if (error || !data) return null;
      return formatEmailLog(data);
    }

    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(formatEmailLog);
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class EmailLogModel {
  static formatEmailLog(row) {
    return formatEmailLog(row);
  }

  static find(query = {}) {
    return new EmailLogQueryBuilder(query, false);
  }

  static findById(id) {
    if (!id) return new EmailLogQueryBuilder({ id: 'none' }, true);
    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    return new EmailLogQueryBuilder({ id: cleanId }, true);
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) return null;

    const row = {
      recipient_email: data.recipientEmail || '',
      recipient_name: data.recipientName || '',
      subject: data.subject || '',
      template_type: data.templateType || 'general',
      html_content: data.htmlContent || '',
      status: data.status || 'Sent',
    };

    const { data: inserted, error } = await supabase.from('email_logs').insert(row).select().single();
    if (error || !inserted) return null;
    return formatEmailLog(inserted);
  }
}

module.exports = EmailLogModel;
