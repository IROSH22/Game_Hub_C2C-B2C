import React, { useState, useEffect } from 'react';
import {
  Mail,
  X,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Settings,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getStoredEmailJSConfig, saveEmailJSConfig, sendRealEmailViaEmailJS } from '../services/emailService';

export const EmailCenterModal = ({ onClose }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'emailjs'
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // EmailJS Setup State
  const [emailJSConfig, setEmailJSConfig] = useState(getStoredEmailJSConfig());
  const [testEmail, setTestEmail] = useState(user?.email || '');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);
  const [backendConfigStatus, setBackendConfigStatus] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await api.getEmailLogs();
      if (res && res.success) {
        setEmails(res.emails || []);
        if (res.emails && res.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(res.emails[0]);
        }
      }

      // Check backend mail config status
      const statusRes = await api.getEmailConfigStatus();
      if (statusRes && statusRes.success) {
        setBackendConfigStatus(statusRes);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveEmailJSConfig(emailJSConfig);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail) return;

    setTestSending(true);
    setTestResult(null);

    try {
      // 1. Try sending via backend endpoint
      const res = await api.testSendEmail(testEmail, user?.name || 'Game Hub Player');

      // 2. Also test client EmailJS if keys are stored in browser
      let clientMsg = '';
      if (emailJSConfig.serviceId && emailJSConfig.templateId && emailJSConfig.publicKey) {
        const clientRes = await sendRealEmailViaEmailJS({
          toEmail: testEmail,
          toName: user?.name || 'Game Hub Player',
          subject: '🚀 Game Hub Real Inbox Test Email',
          message: 'This is a live test email sent directly through EmailJS to verify real inbox delivery!',
        });
        if (clientRes.success) {
          clientMsg = ' • Browser EmailJS real delivery: Confirmed!';
        }
      }

      if (res && res.success) {
        setTestResult({
          success: true,
          message: `${res.message}${clientMsg}`,
        });
        fetchEmails(); // Reload logs to display the test email
      } else {
        setTestResult({
          success: false,
          message: res?.message || 'Failed to dispatch test email.',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Error sending test email.',
      });
    }
    setTestSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-panel rounded-3xl border border-cyan-500/40 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider font-['Rajdhani'] flex items-center gap-2">
                <span>Real Email &amp; Transaction Notifications</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  EmailJS Ready
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Rajdhani']">
                Customer &amp; Seller Notification Center
              </h2>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold font-['Rajdhani'] tracking-wide">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'inbox'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>DISPATCHED INBOX ({emails.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('emailjs')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'emailjs'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>EMAILJS REAL SENDER</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: DISPATCHED INBOX */}
        {activeTab === 'inbox' && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>
                All automated transactional emails sent upon order purchases, disc listings, and C2C barter trades are captured below:
              </p>
              <button
                onClick={fetchEmails}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 hover:text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 text-sm font-['Rajdhani'] font-bold">
                Loading emails...
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl p-8 border border-slate-800 space-y-3">
                <Mail className="w-12 h-12 mx-auto text-slate-600" />
                <h3 className="text-lg font-bold text-white font-['Rajdhani']">No Dispatched Emails Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Place an order, list a game in Store/Swap Zone, or test the EmailJS Real Sender tab to dispatch your first email!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[56vh]">
                {/* Left Column: Email List */}
                <div className="space-y-2 overflow-y-auto pr-1 border-r border-slate-800/80">
                  {emails.map((em) => (
                    <div
                      key={em._id}
                      onClick={() => setSelectedEmail(em)}
                      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                        selectedEmail?._id === em._id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white truncate max-w-[150px]">
                          {em.recipientName || em.recipientEmail}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">
                          {new Date(em.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-200 truncate">
                        {em.subject}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          <span>{em.status || 'Delivered'}</span>
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                          {em.templateType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Column: Rendered HTML Email Preview */}
                <div className="md:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                  {selectedEmail ? (
                    <>
                      <div className="p-3 bg-slate-900 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                        <div className="truncate max-w-md">
                          <strong className="text-cyan-400">To:</strong> {selectedEmail.recipientEmail} |{' '}
                          <strong className="text-white">Subject:</strong> {selectedEmail.subject}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                          {selectedEmail.templateType}
                        </span>
                      </div>

                      <div className="flex-1 p-3 overflow-y-auto">
                        <iframe
                          title="Email Preview"
                          srcDoc={selectedEmail.htmlContent}
                          className="w-full h-full min-h-[420px] rounded-xl border border-slate-800 bg-[#070a13]"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-500 text-xs">
                      Select an email to view full rendered receipt
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: EMAILJS REAL SENDER & CONFIGURATION */}
        {activeTab === 'emailjs' && (
          <div className="space-y-6 pt-4">
            {/* Guide & Status Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 border border-pink-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider font-['Rajdhani']">
                  <Sparkles className="w-4 h-4" /> Free EmailJS Real Inbox Delivery Integration
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  EmailJS (<a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-semibold">emailjs.com</a>) allows dispatching <strong>up to 200 real emails per month for free</strong> without requiring your own SMTP mail server.
                </p>
              </div>

              <a
                href="https://dashboard.emailjs.com/sign-up"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md shadow-pink-500/20"
              >
                <span>Get Free EmailJS Keys</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box A: Send Real Test Email */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-['Rajdhani'] uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-cyan-400" />
                    Test Real Inbox Delivery
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Sender
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Enter your real email address (e.g., your personal Gmail) below to trigger an authentic test email and verify delivery:
                </p>

                <form onSubmit={handleSendTestEmail} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1 font-['Rajdhani']">
                      Target Email Address:
                    </label>
                    <input
                      type="email"
                      required
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="your.real.email@gmail.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={testSending}
                    className="w-full h-11 rounded-xl btn-primary text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    {testSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Dispatching to Real Inbox...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Live Test Email Now</span>
                      </>
                    )}
                  </button>
                </form>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Box B: EmailJS Key Settings */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm font-['Rajdhani'] uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-4 h-4 text-pink-400" />
                    EmailJS API Credentials
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Free Tier (200/mo)
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Save your keys below or in <code>backend/.env</code> to automatically dispatch emails on purchases, listings &amp; trades:
                </p>

                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Service ID (e.g. <code>service_xxx</code>):
                    </label>
                    <input
                      type="text"
                      value={emailJSConfig.serviceId}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, serviceId: e.target.value })}
                      placeholder="service_gamehub"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Template ID (e.g. <code>template_xxx</code>):
                    </label>
                    <input
                      type="text"
                      value={emailJSConfig.templateId}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, templateId: e.target.value })}
                      placeholder="template_gamehub"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Public Key (User ID):
                    </label>
                    <input
                      type="text"
                      value={emailJSConfig.publicKey}
                      onChange={(e) => setEmailJSConfig({ ...emailJSConfig, publicKey: e.target.value })}
                      placeholder="user_xxx / public_key"
                      className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-pink-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs cursor-pointer transition-all"
                  >
                    Save EmailJS Keys to Browser
                  </button>

                  {configSaved && (
                    <div className="text-[11px] text-emerald-400 text-center font-bold">
                      ✓ Credentials saved successfully!
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Quick 3-Step EmailJS Setup Guide */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-['Rajdhani'] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Quick 3-Minute EmailJS Setup Guide:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400 block mb-1">1. Create Free Service</strong>
                  Go to EmailJS &gt; Email Services &gt; Add Service &gt; Choose Gmail / Outlook. Copy your <code>service_id</code>.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-pink-400 block mb-1">2. Create Email Template</strong>
                  Go to Email Templates &gt; Create New. In content, use <code>{'{{message}}'}</code> and <code>{'{{to_email}}'}</code>. Copy <code>template_id</code>.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-400 block mb-1">3. Get Public Key</strong>
                  Go to Account &gt; API Keys &gt; Copy your <code>Public Key</code>. Paste into <code>backend/.env</code> or this panel!
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
