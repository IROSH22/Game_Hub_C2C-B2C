/**
 * EmailJS Client Service Module (Free Real Email Delivery - https://www.emailjs.com)
 * Enables dispatching authentic emails to real inboxes directly from the client and backend.
 */

const STORAGE_KEY = 'gamehub_emailjs_config';

export const getStoredEmailJSConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    templateOrder: import.meta.env.VITE_EMAILJS_TEMPLATE_ORDER || import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    templateWelcome: import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME || '',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  };
};

export const saveEmailJSConfig = (config) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

/**
 * Dispatch real email using EmailJS API directly from browser
 */
export const sendRealEmailViaEmailJS = async ({
  toEmail,
  toName,
  subject,
  message,
  templateType = 'general',
  templateParams = {},
}) => {
  const config = getStoredEmailJSConfig();
  const effectiveTemplateId =
    templateType === 'order_receipt' || templateType === 'order_status_update'
      ? (config.templateOrder || config.templateId)
      : (config.templateWelcome || config.templateOrder || config.templateId);

  if (!config.serviceId || !effectiveTemplateId || !config.publicKey) {
    return {
      success: false,
      isConfigured: false,
      message: 'EmailJS keys not configured. Enter your Service ID, Template IDs, and Public Key.',
    };
  }

  try {
    const payload = {
      service_id: config.serviceId,
      template_id: effectiveTemplateId,
      user_id: config.publicKey,
      template_params: {
        to_email: toEmail,
        to_name: toName || 'Game Hub Gamer',
        from_name: 'Game Hub Official',
        reply_to: 'support@gamehub.com',
        subject: subject,
        message: message || subject,
        timestamp: new Date().toLocaleString(),
        ...templateParams,
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return {
        success: true,
        isConfigured: true,
        message: `Real email successfully delivered to ${toEmail}!`,
      };
    } else {
      const errorText = await res.text();
      return {
        success: false,
        isConfigured: true,
        message: `EmailJS responded with status ${res.status}: ${errorText}`,
      };
    }
  } catch (err) {
    return {
      success: false,
      isConfigured: true,
      message: `Network error sending email: ${err.message}`,
    };
  }
};
