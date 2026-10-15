const { getSupabase } = require('../utils/supabaseClient');

function formatOrderItem(itemRow) {
  if (!itemRow) return null;
  return {
    _id: itemRow.id,
    id: itemRow.id,
    listingId: itemRow.listing_id,
    sellerId: itemRow.seller_id,
    title: itemRow.title || 'Game',
    price: Number(itemRow.price) || 0,
    quantity: Number(itemRow.quantity) || 1,
    platform: itemRow.platform || 'PS5',
    imageUrl: itemRow.image_url || '',
    condition: itemRow.condition || 'Brand New',
  };
}

function formatOrder(row, items = []) {
  if (!row) return null;
  const addressObj = typeof row.shipping_address === 'object' && row.shipping_address ? row.shipping_address : {};

  const order = {
    _id: row.id,
    id: row.id,
    buyerId: row.buyer_id,
    userId: row.buyer_id,
    items: (items || []).map(formatOrderItem),
    subtotal: Number(row.subtotal) || 0,
    shippingFee: Number(row.shipping_fee) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    couponCode: row.coupon_code || '',
    totalAmount: Number(row.total_amount) || 0,
    shippingAddress: {
      fullName: addressObj.fullName || '',
      phone: addressObj.phone || '',
      address: addressObj.address || '',
      city: addressObj.city || '',
      postalCode: addressObj.postalCode || '',
    },
    paymentMethod: row.payment_method || 'Stripe',
    paymentStatus: row.payment_status || 'Paid',
    orderStatus: row.order_status || 'Confirmed',
    transactionId: row.transaction_id || '',
    cardLast4: row.card_last4 || '4242',
    paymentSignature: row.payment_signature || '',
    riskScore: row.risk_score || 'Low Risk (Verified)',
    securityCheck: true,
    isReviewed: Boolean(addressObj._isReviewed),
    ipAddress: addressObj._ipAddress || '127.0.0.1',
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    async save() {
      const supabase = getSupabase();
      if (!supabase) return this;

      const addressPayload = {
        ...this.shippingAddress,
        _isReviewed: this.isReviewed,
        _ipAddress: this.ipAddress,
      };

      const updates = {
        order_status: this.orderStatus || 'Confirmed',
        payment_status: this.paymentStatus || 'Paid',
        payment_signature: this.paymentSignature || '',
        shipping_address: addressPayload,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('orders').update(updates).eq('id', this.id);
      return this;
    },

    toObject() {
      return { ...this };
    },
    toJSON() {
      return { ...this };
    },
  };

  order.populate = async function (field) {
    if (field === 'buyerId' && this.buyerId) {
      const bId = typeof this.buyerId === 'object' ? (this.buyerId._id || this.buyerId.id) : this.buyerId;
      if (bId) {
        const User = require('./User');
        const u = await User.findById(bId);
        if (u) {
          this.buyerId = u;
          this.userId = u;
        }
      }
    }
    return this;
  };

  return order;
}

class OrderQueryBuilder {
  constructor(initialQuery = {}, single = false) {
    this.mongoQuery = initialQuery;
    this.single = single;
    this.populateBuyer = false;
    this.sortOption = { created_at: false };
    this.limitCount = single ? 1 : 100;
  }

  populate(field) {
    if (field === 'buyerId') {
      this.populateBuyer = true;
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

  limit(n) {
    this.limitCount = Math.max(1, Number(n) || 100);
    return this;
  }

  async execute() {
    const supabase = getSupabase();
    if (!supabase) return this.single ? null : [];

    let orderIdsToFetch = null;

    // Support query: { 'items.sellerId': sellerId }
    if (this.mongoQuery['items.sellerId']) {
      const sId = (this.mongoQuery['items.sellerId']._id || this.mongoQuery['items.sellerId'].id || this.mongoQuery['items.sellerId']).toString();
      const { data: itemRows } = await supabase.from('order_items').select('order_id').eq('seller_id', sId);
      if (!itemRows || itemRows.length === 0) {
        return this.single ? null : [];
      }
      orderIdsToFetch = [...new Set(itemRows.map((r) => r.order_id))];
    }

    let q = supabase.from('orders').select('*');

    if (orderIdsToFetch) {
      q = q.in('id', orderIdsToFetch);
    }

    if (this.mongoQuery.buyerId) {
      const bId = (this.mongoQuery.buyerId._id || this.mongoQuery.buyerId.id || this.mongoQuery.buyerId).toString();
      q = q.eq('buyer_id', bId);
    }

    if (this.mongoQuery._id || this.mongoQuery.id) {
      const oId = (this.mongoQuery._id || this.mongoQuery.id).toString();
      q = q.eq('id', oId);
    }

    if (this.mongoQuery.paymentStatus) {
      q = q.eq('payment_status', this.mongoQuery.paymentStatus);
    }

    if (this.mongoQuery.orderStatus) {
      q = q.eq('order_status', this.mongoQuery.orderStatus);
    }

    const sortCol = Object.keys(this.sortOption)[0] || 'created_at';
    const ascending = this.sortOption[sortCol] ?? false;
    q = q.order(sortCol, { ascending });

    if (this.single) {
      q = q.limit(1);
      const { data, error } = await q;
      if (error || !data || data.length === 0) return null;
      const rawOrder = data[0];
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', rawOrder.id);
      const order = formatOrder(rawOrder, items || []);
      if (this.populateBuyer) {
        await order.populate('buyerId');
      }
      return order;
    }

    q = q.limit(this.limitCount);
    const { data: ordersData, error } = await q;
    if (error || !ordersData || ordersData.length === 0) return [];

    const orderIds = ordersData.map((o) => o.id);
    const { data: allItems } = await supabase.from('order_items').select('*').in('order_id', orderIds);

    const itemsMap = {};
    (allItems || []).forEach((it) => {
      if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
      itemsMap[it.order_id].push(it);
    });

    const orders = ordersData.map((o) => formatOrder(o, itemsMap[o.id] || []));

    if (this.populateBuyer && orders.length > 0) {
      const buyerIds = [...new Set(orders.map((o) => o.buyerId).filter(Boolean))];
      if (buyerIds.length > 0) {
        const User = require('./User');
        const { data: users } = await supabase.from('users').select('*').in('id', buyerIds);
        const userMap = {};
        (users || []).forEach((u) => { userMap[u.id] = User.formatUser(u); });
        orders.forEach((o) => {
          if (o.buyerId && userMap[o.buyerId]) {
            o.buyerId = userMap[o.buyerId];
            o.userId = userMap[o.buyerId];
          }
        });
      }
    }

    return orders;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }
}

class OrderModel {
  static formatOrder(row, items) {
    return formatOrder(row, items);
  }

  static find(query = {}) {
    return new OrderQueryBuilder(query, false);
  }

  static findById(id) {
    if (!id) return new OrderQueryBuilder({ id: 'none' }, true);
    const cleanId = typeof id === 'object' ? (id._id || id.id || id).toString() : id.toString();
    return new OrderQueryBuilder({ id: cleanId }, true);
  }

  static findOne(query = {}) {
    return new OrderQueryBuilder(query, true);
  }

  static async countDocuments(query = {}) {
    const supabase = getSupabase();
    if (!supabase) return 0;

    let q = supabase.from('orders').select('*', { count: 'exact', head: true });
    if (query.paymentStatus) q = q.eq('payment_status', query.paymentStatus);
    if (query.orderStatus) q = q.eq('order_status', query.orderStatus);

    const { count, error } = await q;
    if (error) return 0;
    return count || 0;
  }

  static async create(data) {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase client not connected');

    const bId = typeof data.buyerId === 'object' ? (data.buyerId._id || data.buyerId.id) : data.buyerId;

    const addressPayload = {
      fullName: data.shippingAddress?.fullName || '',
      phone: data.shippingAddress?.phone || '',
      address: data.shippingAddress?.address || '',
      city: data.shippingAddress?.city || '',
      postalCode: data.shippingAddress?.postalCode || '',
      _isReviewed: Boolean(data.isReviewed),
      _ipAddress: data.ipAddress || '127.0.0.1',
    };

    const orderRow = {
      buyer_id: bId ? bId.toString() : null,
      subtotal: Number(data.subtotal) || 0,
      shipping_fee: Number(data.shippingFee) || 0,
      discount_amount: Number(data.discountAmount) || 0,
      coupon_code: data.couponCode || '',
      total_amount: Number(data.totalAmount) || 0,
      shipping_address: addressPayload,
      payment_method: data.paymentMethod || 'Stripe',
      payment_status: data.paymentStatus || 'Paid',
      order_status: data.orderStatus || 'Confirmed',
      transaction_id: data.transactionId || `TXN-${Date.now()}`,
      card_last4: data.cardLast4 || '4242',
      payment_signature: data.paymentSignature || '',
      risk_score: data.riskScore || 'Low Risk (Verified)',
    };

    const { data: insertedOrder, error: orderErr } = await supabase.from('orders').insert(orderRow).select().single();
    if (orderErr) {
      throw new Error(`Failed to insert order: ${orderErr.message}`);
    }

    const insertedItems = [];
    if (Array.isArray(data.items) && data.items.length > 0) {
      const itemsToInsert = data.items.map((it) => {
        const lId = typeof it.listingId === 'object' ? (it.listingId._id || it.listingId.id) : it.listingId;
        const sId = typeof it.sellerId === 'object' ? (it.sellerId._id || it.sellerId.id) : it.sellerId;
        return {
          order_id: insertedOrder.id,
          listing_id: lId ? lId.toString() : null,
          seller_id: sId ? sId.toString() : null,
          title: it.title || 'Game',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
          platform: it.platform || 'PS5',
          image_url: it.imageUrl || '',
          condition: it.condition || 'Brand New',
        };
      });

      const { data: itemRows, error: itemErr } = await supabase.from('order_items').insert(itemsToInsert).select();
      if (!itemErr && itemRows) {
        insertedItems.push(...itemRows);
      }
    }

    return formatOrder(insertedOrder, insertedItems);
  }
}

module.exports = OrderModel;
