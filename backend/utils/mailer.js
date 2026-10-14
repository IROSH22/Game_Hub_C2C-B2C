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
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  // Dynamic Multi-Template Routing:
  // 1. Order Confirmation & Invoice Template
  const orderTemplateId = process.env.EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_ID;
  // 2. Welcome / Registration & General Notification Template
  const welcomeTemplateId = process.env.EMAILJS_TEMPLATE_WELCOME || process.env.EMAILJS_TEMPLATE_ID;

  let chosenTemplateId = process.env.EMAILJS_TEMPLATE_ID;
  if (templateType === 'order_receipt' || templateType === 'order_status_update') {
    chosenTemplateId = orderTemplateId || process.env.EMAILJS_TEMPLATE_ID;
  } else {
    chosenTemplateId = welcomeTemplateId || orderTemplateId || process.env.EMAILJS_TEMPLATE_ID;
  }

  if (!serviceId || !chosenTemplateId || !publicKey) {
    return { attempted: false, success: false, reason: 'EmailJS credentials or template not set' };
  }

  try {
    const payload = {
      service_id: serviceId,
      template_id: chosenTemplateId,
      user_id: publicKey,
      accessToken: privateKey || undefined,
      template_params: {
        to_email: to,
        to_name: toName || 'Game Hub Gamer',
        from_name: 'Game Hub Marketplace',
        reply_to: 'support@gamehub.lk',
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
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Receipt</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#060913" style="background-color: #060913; width: 100%; margin: 0; padding: 30px 10px;">
          <tr>
            <td align="center" valign="top">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#0d1527" style="max-width: 600px; width: 100%; background-color: #0d1527; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15);">
                <tr>
                  <td bgcolor="#00f0ff" align="center" style="background-color: #00f0ff; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 50%, #ec4899 100%); padding: 32px 20px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 900; color: #070a13; letter-spacing: 1.5px; text-transform: uppercase;">🎮 GAME HUB MARKETPLACE</div>
                    <div style="margin-top: 8px;">
                      <span style="display: inline-block; background-color: #070a13; color: #00f0ff; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
                        Official Order Receipt #${order._id.toString().slice(-8).toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px 26px; background-color: #0d1527;">
                    <h2 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">Order Confirmed, ${toName || 'Gamer'}! 🎉</h2>
                    <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 20px 0;">
                      Your video game order is secured with automated Escrow protection. Our verified seller network is preparing your physical disc(s).
                    </p>
                    
                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#070b16" style="background-color: #070b16; border: 1px solid #1e293b; border-radius: 12px; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 18px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                          <strong style="color: #cbd5e1;">Transaction ID:</strong> ${order.transactionId}<br>
                          <strong style="color: #cbd5e1;">Payment Method:</strong> ${order.paymentMethod} (ending in ${order.cardLast4 || '4242'})<br>
                          <strong style="color: #cbd5e1;">Delivery Destination:</strong> ${order.shippingAddress?.fullName}, ${order.shippingAddress?.address}, ${order.shippingAddress?.city}
                        </td>
                      </tr>
                      ${(order.items || [])
                        .map(
                          (item) => `
                        <tr>
                          <td style="padding: 12px 18px; border-top: 1px solid #1e293b;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                              <tr>
                                <td>
                                  <div style="color: #f1f5f9; font-weight: 700; font-size: 14px;">${item.title}</div>
                                  <div style="font-size: 12px; color: #94a3b8;">${item.platform} • Qty: ${item.quantity} • ${item.condition || 'Tested'}</div>
                                </td>
                                <td align="right" style="color: #00f0ff; font-weight: 800; font-size: 15px;">
                                  $${(item.price * item.quantity).toFixed(2)}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      `
                        )
                        .join('')}
                      <tr>
                        <td style="padding: 16px 18px; border-top: 2px solid #334155;">
                          <table width="100%" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 16px; font-weight: 800; color: #cbd5e1;">Total Amount Paid</td>
                              <td align="right" style="font-size: 19px; font-weight: 900; color: #00f0ff;">$${Number(order.totalAmount).toFixed(2)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0 10px 0;">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:5173" target="_blank" style="background-color: #00f0ff; background: linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%); color: #070a13 !important; font-size: 13px; font-weight: 900; text-decoration: none; padding: 14px 32px; border-radius: 12px; display: inline-block; text-transform: uppercase;">
                            Track Order in Game Hub
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#070a14" align="center" style="background-color: #070a14; border-top: 1px solid #1e293b; padding: 18px 20px; text-align: center; font-size: 11px; color: #64748b;">
                    Game Hub E-Commerce Ecosystem • Horizon Campus (IT32053) • Colombo, Sri Lanka
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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

  // 6. Template: Welcome to Game Hub (Registration)
  else if (templateType === 'welcome') {
    const { user, role } = data;
    plainTextSummary = `Welcome to Game Hub, ${toName || 'Gamer'}! Your new account has been created. Start browsing authentic physical game discs or barter game-for-game with zero fees!`;
    html = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Game Hub</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#060913" style="background-color: #060913; width: 100%; margin: 0; padding: 30px 10px;">
          <tr>
            <td align="center" valign="top">
              <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#0d1527" style="max-width: 600px; width: 100%; background-color: #0d1527; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 240, 255, 0.15);">
                <tr>
                  <td bgcolor="#00f0ff" align="center" style="background-color: #00f0ff; background: linear-gradient(135deg, #00f0ff 0%, #8b5cf6 50%, #ec4899 100%); padding: 35px 20px; text-align: center;">
                    <div style="font-size: 26px; font-weight: 900; color: #070a13; letter-spacing: 1.5px; text-transform: uppercase;">🎮 GAME HUB MARKETPLACE</div>
                    <div style="margin-top: 10px;">
                      <span style="display: inline-block; background-color: #070a13; color: #00f0ff; padding: 6px 18px; border-radius: 50px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                        Official Member Activation
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 28px; background-color: #0d1527;">
                    <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0;">Welcome Aboard, ${toName || 'Gamer'}! 🚀</h1>
                    <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 24px 0;">
                      Your Game Hub gamer account is now officially verified and active. You are now part of Sri Lanka's leading hybrid gaming ecosystem — built for genuine gamers, disc collectors, and verified sellers.
                    </p>

                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#070b16" style="background-color: #070b16; border: 1px solid #1e293b; border-radius: 14px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 20px;">
                          <div style="font-size: 13px; color: #00f0ff; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; margin-bottom: 14px;">
                            What you can do on Game Hub:
                          </div>
                          <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                            <strong style="color: #00f0ff;">🛒 B2C Retail Store:</strong> Buy original, inspected PlayStation, Xbox, and Nintendo game discs with 100% Escrow buyer protection.
                          </div>
                          <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                            <strong style="color: #a855f7;">🔄 C2C Swap Zone:</strong> Finished playing a game? Trade your physical disc with fellow gamers island-wide with zero listing fees.
                          </div>
                          <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                            <strong style="color: #eab308;">🔔 Wishlist Radar:</strong> Add titles to your wishlist; our automated system notifies you the moment another gamer lists it!
                          </div>
                          <div style="margin-bottom: 0; font-size: 13px; line-height: 1.5; color: #cbd5e1;">
                            <strong style="color: #10b981;">🛡️ Trust &amp; Reputation:</strong> Complete trades and purchases to earn Community Badges and high trust scores.
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#091830" style="background-color: #091830; border-left: 4px solid #00f0ff; border-radius: 8px; margin-bottom: 26px;">
                      <tr>
                        <td style="padding: 14px 18px; font-size: 13px; color: #38bdf8; font-style: italic;">
                          💡 <em>Welcome to Game Hub! Discover hundreds of pre-owned and sealed video games.</em>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px 0;">
                      <tr>
                        <td align="center">
                          <a href="http://localhost:5173" target="_blank" style="background-color: #00f0ff; background: linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%); color: #070a13 !important; font-size: 14px; font-weight: 900; text-decoration: none; padding: 15px 36px; border-radius: 12px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">
                            Launch Game Hub &amp; Explore
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td bgcolor="#070a14" align="center" style="background-color: #070a14; border-top: 1px solid #1e293b; padding: 22px 20px; text-align: center;">
                    <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
                      Account Email: <strong style="color: #00f0ff;">${to}</strong>
                    </div>
                    <div style="margin-top: 6px; font-size: 11px; color: #475569;">
                      © 2026 Game Hub Hybrid E-Commerce Ecosystem • Horizon Campus (IT32053)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
  let deliverySuccess = false;
  let deliveryReason = '';

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
    deliverySuccess = true;
  } else if (emailJSRes.attempted) {
    status = `Failed: ${emailJSRes.reason || 'EmailJS error'}`;
    deliveryReason = emailJSRes.reason;
  } else if (transporter) {
    try {
      await transporter.sendMail({
        from: '"Game Hub Official" <noreply@gamehub.com>',
        to,
        subject,
        html,
      });
      status = 'Sent (SMTP Live)';
      deliverySuccess = true;
    } catch (e) {
      console.log('SMTP error:', e.message);
      status = 'Simulated';
    }
  } else {
    status = 'Simulated (Credentials missing)';
    deliveryReason = emailJSRes.reason || 'EmailJS Public Key or Service ID not configured';
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
    return { emailRecord, deliverySuccess, reason: deliveryReason, status };
  } catch (err) {
    console.error('Failed to log email:', err.message);
    return { emailRecord: null, deliverySuccess, reason: deliveryReason, status };
  }
};

module.exports = {
  sendEmailNotification,
  sendViaEmailJS,
};
