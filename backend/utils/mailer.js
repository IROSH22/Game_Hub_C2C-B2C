const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');

// Optional SMTP Transporter
let transporter = null;
try {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
} catch (err) {
  console.log('Nodemailer configuration note:', err.message);
  transporter = null;
}

/**
 * Dispatch real email via EmailJS REST API
 * Free tier: 200 emails / month with 0 credit card needed (https://www.emailjs.com)
 */
const sendViaEmailJS = async ({ to, toName, subject, message, htmlContent, templateType, details = {} }) => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    return { attempted: false, success: false, reason: 'EmailJS credentials not set in .env' };
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey || undefined,
      template_params: {
        to_email: to,
        to_name: toName || 'Game Hub Gamer',
        from_name: 'Game Hub Platform',
        reply_to: 'support@gamehub.com',
        subject: subject,
        message: message || subject,
        html_content: htmlContent,
        template_type: templateType,
        timestamp: new Date().toLocaleString(),
        ...details,
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`[EmailJS] ✅ Real email successfully delivered to: ${to}`);
      return { attempted: true, success: true };
    } else {
      const errText = await res.text();
      console.warn(`[EmailJS] API returned status ${res.status}:`, errText);
      return { attempted: true, success: false, reason: errText };
    }
  } catch (err) {
    console.warn('[EmailJS] Network error:', err.message);
    return { attempted: true, success: false, reason: err.message };
  }
};

/**
 * Master Email Dispatcher
 */
const sendEmailNotification = async ({ to, toName, subject, templateType, data = {} }) => {
  let html = '';
  let plainTextSummary = '';

  // 1. Template: Order Receipt (Checkout)
  if (templateType === 'order_receipt') {
    const { order, buyer } = data;
    plainTextSummary = `Order #${order._id.toString().slice(-8).toUpperCase()} placed. Total: $${order.totalAmount}. Method: ${order.paymentMethod}.`;
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070a13; color: #e2e8f0; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #0e1526; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.6); }
          .header { background: linear-gradient(135deg, #00f0ff, #8b5cf6, #ec4899); padding: 30px 20px; text-align: center; color: #070a13; }
          .logo { font-size: 26px; font-weight: 900; letter-spacing: 1px; }
          .badge { display: inline-block; background: rgba(7,10,19,0.8); padding: 6px 14px; border-radius: 20px; font-size: 13px; color: #00f0ff; margin-top: 8px; font-weight: bold; }
          .content { padding: 30px; }
          .receipt-box { background: #070a13; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .item-row { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding: 12px 0; }
          .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #00f0ff; margin-top: 15px; border-top: 2px solid #334155; padding-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎮 GAME HUB HYBRID MARKETPLACE</div>
            <div class="badge">Official Order Receipt #${order._id.toString().slice(-8).toUpperCase()}</div>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; margin-top: 0;">Order Confirmed, ${toName || 'Gamer'}!</h2>
            <p style="color: #94a3b8; font-size: 14px;">Your video game order has been secured with automated Escrow buyer protection. Our seller network is packaging your physical disc(s).</p>
            
            <div class="receipt-box">
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 15px; line-height: 1.6;">
                <strong>Transaction ID:</strong> ${order.transactionId}<br>
                <strong>Payment Method:</strong> ${order.paymentMethod} (ending in ${order.cardLast4 || '4242'})<br>
                <strong>Delivery Address:</strong> ${order.shippingAddress?.fullName}, ${order.shippingAddress?.address}, ${order.shippingAddress?.city}
              </div>

              ${(order.items || [])
                .map(
                  (item) => `
                <div class="item-row">
                  <div>
                    <strong style="color: #f1f5f9; font-size: 14px;">${item.title}</strong>
                    <div style="font-size: 12px; color: #94a3b8;">${item.platform} • Qty: ${item.quantity} • ${item.condition || 'Tested'}</div>
                  </div>
                  <div style="color: #00f0ff; font-weight: 700; font-size: 15px;">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              `
                )
                .join('')}

              <div class="total-row">
                <span>Total Paid</span>
                <span>$${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <p style="color: #94a3b8; font-size: 13px;">Track your live delivery status in <strong>Game Hub > My Orders</strong>.</p>
          </div>
          <div class="footer">
            Game Hub E-Commerce Platform • IT32053 • Horizon Campus
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 2. Template: Order Status Update (Seller Accepts / Ships Order)
  else if (templateType === 'order_status_update') {
    const { order, orderStatus } = data;
    plainTextSummary = `Order #${order._id.toString().slice(-8).toUpperCase()} status updated to: ${orderStatus}.`;
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070a13; color: #e2e8f0; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #0e1526; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #10b981, #0ea5e9); padding: 25px 20px; text-align: center; color: #070a13; }
          .logo { font-size: 24px; font-weight: 900; }
          .content { padding: 30px; }
          .status-badge { display: inline-block; background: #10b981; color: #070a13; padding: 8px 18px; border-radius: 20px; font-weight: 900; font-size: 15px; margin: 15px 0; }
          .footer { text-align: center; padding: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚚 ORDER FULFILLMENT UPDATE</div>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; margin-top: 0;">Hello ${toName || 'Gamer'},</h2>
            <p style="color: #94a3b8;">Great news! The seller has reviewed and updated your order status:</p>
            
            <div style="text-align: center;">
              <span class="status-badge">STATUS: ${orderStatus.toUpperCase()}</span>
            </div>

            <div style="background: #070a13; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; margin: 15px 0; font-size: 13px; color: #94a3b8;">
              <strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}<br>
              <strong>Transaction:</strong> ${order.transactionId}<br>
              <strong>Recipient:</strong> ${order.shippingAddress?.fullName} (${order.shippingAddress?.city})
            </div>

            <p style="color: #94a3b8; font-size: 13px;">Your physical disc is being handled in accordance with island-wide delivery tracking.</p>
          </div>
          <div class="footer">
            Game Hub E-Commerce Platform • IT32053 • Horizon Campus
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 3. Template: Item Listed Successfully (New Store / Barter Game Added)
  else if (templateType === 'item_listed') {
    const { game } = data;
    plainTextSummary = `Your game "${game.title}" (${game.platform}) was successfully listed on Game Hub!`;
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070a13; color: #e2e8f0; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #0e1526; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #00f0ff, #8b5cf6); padding: 25px 20px; text-align: center; color: #070a13; }
          .logo { font-size: 24px; font-weight: 900; }
          .content { padding: 30px; }
          .card { background: #070a13; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0; display: flex; gap: 15px; }
          .footer { text-align: center; padding: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉 GAME LISTED SUCCESSFULLY!</div>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; margin-top: 0;">Congratulations ${toName || 'Seller'},</h2>
            <p style="color: #94a3b8;">Your game has been verified and published to the Game Hub marketplace. Gamers and collectors can now discover your title!</p>
            
            <div style="background: #070a13; border: 1px solid #1e293b; border-radius: 12px; padding: 18px; margin: 15px 0;">
              <h3 style="color: #00f0ff; margin-top: 0; font-size: 18px;">${game.title}</h3>
              <p style="color: #94a3b8; font-size: 13px; margin: 5px 0;"><strong>Hardware Platform:</strong> ${game.platform}</p>
              <p style="color: #94a3b8; font-size: 13px; margin: 5px 0;"><strong>Genre:</strong> ${game.genre} • <strong>Condition:</strong> ${game.condition}</p>
              <p style="color: #94a3b8; font-size: 13px; margin: 5px 0;"><strong>Listing Type:</strong> ${game.exchangeable ? '🔄 Barter / Swap Zone' : '🛒 B2C Store Sale'}</p>
              <p style="color: #10b981; font-weight: bold; font-size: 16px; margin: 8px 0 0 0;">Price / Valuation: $${Number(game.price).toFixed(2)}</p>
              ${game.wantedGames ? `<p style="color: #ec4899; font-size: 13px; margin-top: 6px;"><strong>Wants in Barter:</strong> ${game.wantedGames}</p>` : ''}
            </div>

            <p style="color: #94a3b8; font-size: 13px;">Manage your stock, incoming exchange offers, or prices in your dashboard.</p>
          </div>
          <div class="footer">
            Game Hub E-Commerce Platform • IT32053 • Horizon Campus
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 4. Template: C2C Exchange Request
  else if (templateType === 'exchange_request') {
    const { requester, offeredGame, wantedGame, message } = data;
    plainTextSummary = `${requester.name} wants to swap "${offeredGame.title}" for your "${wantedGame.title}".`;
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #070a13; color: #e2e8f0; margin: 0; padding: 20px; }
          .container { max-width: 580px; margin: 0 auto; background: #0e1526; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 25px 20px; text-align: center; color: #fff; }
          .logo { font-size: 24px; font-weight: 900; }
          .content { padding: 30px; }
          .trade-box { background: #070a13; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding: 18px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔄 NEW GAME BARTER OFFER!</div>
          </div>
          <div class="content">
            <h2 style="color: #ffffff; margin-top: 0;">Hello ${toName || 'Gamer'},</h2>
            <p style="color: #94a3b8;"><strong>${requester.name}</strong> (Trust Score: ${requester.trustScore || 96}%) proposed a game disc barter with you on Game Hub!</p>
            
            <div class="trade-box">
              <div style="color: #00f0ff; font-weight: bold; font-size: 13px;">THEY ARE OFFERING:</div>
              <h3 style="margin: 6px 0; color: #fff; font-size: 17px;">${offeredGame.title} (${offeredGame.platform})</h3>
              
              <div style="font-size: 22px; color: #ec4899; margin: 8px 0;">⇅</div>
              
              <div style="color: #ec4899; font-weight: bold; font-size: 13px;">IN RETURN FOR YOUR:</div>
              <h3 style="margin: 6px 0; color: #fff; font-size: 17px;">${wantedGame.title} (${wantedGame.platform})</h3>
            </div>

            ${message ? `<div style="background: #1e293b; padding: 12px; border-radius: 8px; font-size: 13px; color: #cbd5e1; margin-bottom: 15px;"><em>"${message}"</em></div>` : ''}

            <p style="color: #94a3b8; font-size: 13px;">Log in to <strong>Game Hub > My Exchanges</strong> to Accept, Reject, or Counter-offer this trade.</p>
          </div>
          <div class="footer">
            Game Hub C2C Barter Ecosystem • Horizon Campus
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // 5. Template: C2C Exchange Accepted
  else if (templateType === 'exchange_accepted') {
    const { partnerName, gameTitle } = data;
    plainTextSummary = `Your trade request for "${gameTitle}" was accepted by ${partnerName}!`;
    html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: sans-serif; background: #070a13; color: #fff; padding: 20px;">
        <div style="max-width: 550px; margin: auto; background: #0e1526; padding: 25px; border-radius: 16px; border: 1px solid #10b981;">
          <h2 style="color: #10b981; margin-top: 0;">🎉 Trade Request Accepted!</h2>
          <p style="color: #94a3b8;">Great news! <strong>${partnerName}</strong> accepted your exchange request for <strong>${gameTitle}</strong>.</p>
          <p style="color: #94a3b8;">Please check your exchange trade desk to view the shipping address and enter tracking numbers.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Default Fallback
  else {
    plainTextSummary = data.message || subject;
    html = `
      <div style="font-family: sans-serif; padding: 20px; background: #070a13; color: #fff;">
        <h2>Game Hub Notification</h2>
        <p>${plainTextSummary}</p>
      </div>
    `;
  }

  // Attempt EmailJS Dispatch First (Live real inbox delivery)
  let status = 'Simulated';
  const emailJSRes = await sendViaEmailJS({
    to,
    toName,
    subject,
    message: plainTextSummary,
    htmlContent: html,
    templateType,
    details: data,
  });

  if (emailJSRes.success) {
    status = 'Sent (EmailJS Live)';
  } else if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Game Hub Official" <noreply@gamehub.com>',
        to,
        subject,
        html,
      });
      status = 'Sent (SMTP Live)';
    } catch (e) {
      console.log('SMTP error:', e.message);
      status = 'Simulated';
    }
  }

  // Log in database
  try {
    const emailRecord = await EmailLog.create({
      recipientEmail: to,
      recipientName: toName,
      subject,
      templateType,
      htmlContent: html,
      status,
    });
    return emailRecord;
  } catch (err) {
    console.error('Failed to log email:', err.message);
    return null;
  }
};

module.exports = {
  sendEmailNotification,
  sendViaEmailJS,
};
