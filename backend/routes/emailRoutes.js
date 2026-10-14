const express = require('express');
const EmailLog = require('../models/EmailLog');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get emails sent to this user (or all if admin)
router.get('/my-emails', authMiddleware, async (req, res) => {
  try {
    let query = { recipientEmail: req.user.email };
    if (req.user.role === 'admin') {
      query = {}; // Admin can see all system emails
    }

    const emails = await EmailLog.find(query).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: emails.length, emails });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch email logs.' });
  }
});

// Get single email details / HTML content
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const email = await EmailLog.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email log not found.' });
    }

    if (email.recipientEmail !== req.user.email && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    res.json({ success: true, email });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch email details.' });
  }
});

// Check EmailJS & Mail Configuration Status
router.get('/config/status', async (req, res) => {
  const isEmailJSConfigured = Boolean(
    process.env.EMAILJS_SERVICE_ID &&
    (process.env.EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_ID) &&
    process.env.EMAILJS_PUBLIC_KEY
  );

  res.json({
    success: true,
    emailjs: {
      configured: isEmailJSConfigured,
      serviceId: process.env.EMAILJS_SERVICE_ID || '',
      templateId: process.env.EMAILJS_TEMPLATE_ID || '',
      templateOrder: process.env.EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_ID || '',
      templateWelcome: process.env.EMAILJS_TEMPLATE_WELCOME || '',
      publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    },
    smtp: {
      configured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    },
    message: isEmailJSConfigured
      ? 'EmailJS is actively configured for real inbox delivery with multi-template routing.'
      : 'EmailJS is running in simulation mode. Admin can save keys to deliver to real inboxes.',
  });
});

// Save EmailJS Credentials (ADMIN ONLY - Updates Entire System)
router.post('/config', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Only System Admin can configure email service.' });
    }

    const { serviceId, templateId, templateOrder, templateWelcome, publicKey, privateKey } = req.body;

    // Update in-memory process.env immediately
    if (serviceId !== undefined) process.env.EMAILJS_SERVICE_ID = String(serviceId).trim();
    if (templateId !== undefined) process.env.EMAILJS_TEMPLATE_ID = String(templateId).trim();
    if (templateOrder !== undefined) process.env.EMAILJS_TEMPLATE_ORDER = String(templateOrder).trim();
    if (templateWelcome !== undefined) process.env.EMAILJS_TEMPLATE_WELCOME = String(templateWelcome).trim();
    if (publicKey !== undefined) process.env.EMAILJS_PUBLIC_KEY = String(publicKey).trim();
    if (privateKey !== undefined) process.env.EMAILJS_PRIVATE_KEY = String(privateKey).trim();

    // Persist to backend/.env file
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(__dirname, '../.env');

    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');

      const updateOrAppend = (key, val) => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (regex.test(envContent)) {
          envContent = envContent.replace(regex, `${key}=${val}`);
        } else {
          envContent += `\n${key}=${val}`;
        }
      };

      if (serviceId !== undefined) updateOrAppend('EMAILJS_SERVICE_ID', String(serviceId).trim());
      if (templateId !== undefined) updateOrAppend('EMAILJS_TEMPLATE_ID', String(templateId).trim());
      if (templateOrder !== undefined) updateOrAppend('EMAILJS_TEMPLATE_ORDER', String(templateOrder).trim());
      if (templateWelcome !== undefined) updateOrAppend('EMAILJS_TEMPLATE_WELCOME', String(templateWelcome).trim());
      if (publicKey !== undefined) updateOrAppend('EMAILJS_PUBLIC_KEY', String(publicKey).trim());
      if (privateKey !== undefined) updateOrAppend('EMAILJS_PRIVATE_KEY', String(privateKey).trim());

      fs.writeFileSync(envPath, envContent, 'utf8');
    }

    const isLive = Boolean(
      process.env.EMAILJS_SERVICE_ID &&
      (process.env.EMAILJS_TEMPLATE_ORDER || process.env.EMAILJS_TEMPLATE_ID) &&
      process.env.EMAILJS_PUBLIC_KEY
    );

    res.json({
      success: true,
      message: 'EmailJS credentials and multi-templates saved successfully to backend system! All customer and seller emails will now be sent live.',
      configured: isLive,
      emailjs: {
        serviceId: process.env.EMAILJS_SERVICE_ID,
        templateId: process.env.EMAILJS_TEMPLATE_ID,
        templateOrder: process.env.EMAILJS_TEMPLATE_ORDER,
        templateWelcome: process.env.EMAILJS_TEMPLATE_WELCOME,
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
      },
    });
  } catch (err) {
    console.error('Save email config error:', err);
    res.status(500).json({ success: false, message: 'Failed to update system email configuration.' });
  }
});

// Test real email dispatch to any recipient (supports testing order or welcome templates)
router.post('/test-send', authMiddleware, async (req, res) => {
  try {
    const { targetEmail, targetName, templateType = 'welcome' } = req.body;
    const recipient = targetEmail || req.user.email;
    const recipientName = targetName || req.user.name;

    const isOrderTest = templateType === 'order_receipt' || templateType === 'order';
    const effectiveType = isOrderTest ? 'order_receipt' : 'welcome';
    const subject = isOrderTest
      ? '🎮 Game Hub Order Confirmation Receipt (Live Test #GH-8492)'
      : '🚀 Welcome to Game Hub Marketplace! (Live Test Verification)';

    const testData = isOrderTest
      ? {
          order: {
            _id: '6615b1a8f90c19729de860ea',
            transactionId: 'TXN-GH-LIVE-TEST',
            paymentMethod: 'Visa / Mastercard',
            cardLast4: '4242',
            totalAmount: 59.99,
            shippingAddress: {
              fullName: recipientName,
              address: 'No. 22 Galle Road',
              city: 'Colombo 03',
            },
            items: [
              {
                title: 'Marvel Spider-Man 2 - Collectors Edition',
                platform: 'PlayStation 5',
                quantity: 1,
                price: 59.99,
                condition: 'Mint / Tested',
              },
            ],
          },
          buyer: { name: recipientName, email: recipient },
        }
      : {
          user: { name: recipientName, email: recipient },
          role: 'Gamer & Seller',
          message: `Welcome to Game Hub! This is a live email test confirming that your EmailJS Welcome template is successfully dispatched to ${recipient}.`,
        };

    const { sendEmailNotification } = require('../utils/mailer');
    const result = await sendEmailNotification({
      to: recipient,
      toName: recipientName,
      subject,
      templateType: effectiveType,
      data: testData,
    });

    const isLiveSuccess = Boolean(result?.deliverySuccess);
    const failureMsg = result?.reason || (result?.status?.startsWith('Failed') ? result.status : null);

    res.json({
      success: isLiveSuccess,
      message: isLiveSuccess
        ? `✅ Success! Real email (${effectiveType}) delivered live to ${recipient} inbox!`
        : `⚠️ EmailJS delivery issue: ${failureMsg || 'Please check your Public Key in EmailJS Dashboard.'}`,
      emailRecord: result?.emailRecord || result,
    });
  } catch (err) {
    console.error('Test send error:', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch test email: ' + err.message });
  }
});

module.exports = router;
