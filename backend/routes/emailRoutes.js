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
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY
  );

  res.json({
    success: true,
    emailjs: {
      configured: isEmailJSConfigured,
      serviceId: process.env.EMAILJS_SERVICE_ID ? 'Configured (***)' : '',
      templateId: process.env.EMAILJS_TEMPLATE_ID ? 'Configured (***)' : '',
      publicKey: process.env.EMAILJS_PUBLIC_KEY ? 'Configured (***)' : '',
    },
    smtp: {
      configured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    },
    message: isEmailJSConfigured
      ? 'EmailJS is actively configured for real inbox delivery.'
      : 'EmailJS is running in in-app simulation mode. Add your free keys to .env to deliver to real inboxes.',
  });
});

// Test real email dispatch to any recipient
router.post('/test-send', authMiddleware, async (req, res) => {
  try {
    const { targetEmail, targetName } = req.body;
    const recipient = targetEmail || req.user.email;
    const recipientName = targetName || req.user.name;

    const { sendEmailNotification } = require('../utils/mailer');
    const result = await sendEmailNotification({
      to: recipient,
      toName: recipientName,
      subject: '🚀 Game Hub Live Test Email (Real Inbox Verification)',
      templateType: 'general',
      data: {
        message: `This is a live test email sent from Game Hub Hybrid E-Commerce Marketplace to verify real inbox delivery for ${recipientName} (${recipient})!`,
      },
    });

    res.json({
      success: true,
      message: `Test email processed for ${recipient}! Status: ${result?.status || 'Dispatched'}`,
      emailRecord: result,
    });
  } catch (err) {
    console.error('Test send error:', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch test email: ' + err.message });
  }
});

module.exports = router;
