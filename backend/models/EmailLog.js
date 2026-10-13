const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
    },
    recipientName: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      required: true,
    },
    templateType: {
      type: String,
      enum: ['order_receipt', 'exchange_request', 'exchange_accepted', 'exchange_shipped', 'order_shipped', 'welcome'],
      required: true,
    },
    htmlContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Sent', 'Simulated', 'Failed'],
      default: 'Sent',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('EmailLog', emailLogSchema);
