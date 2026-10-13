/**
 * GameHub Production Anti-Tamper & Security Shield
 * 
 * 1. Blocks Developer Mode shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, etc.)
 * 2. Restricts context menu (Right-Click Inspect Element)
 * 3. Neutralizes React Developer Tools Global Hook injection
 * 4. Displays security alerts upon inspection attempts
 * 5. Prevents client-side runtime debugging & script tampering
 */

export const initSecurityShield = () => {
  // 1. Neutralize React DevTools Extension Hook
  if (typeof window !== 'undefined') {
    try {
      if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
        for (const [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
          window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value === 'function' ? () => {} : null;
        }
      }
    } catch (e) {
      // ignore
    }

    // 2. High-Priority Console Security Warning
    const showConsoleWarning = () => {
      console.clear();
      console.log(
        '%c🛑 GAMEHUB SECURITY SHIELD: RESTRICTED ACCESS',
        'color: #ef4444; font-size: 20px; font-weight: 900; background: #0f172a; padding: 8px 14px; border-radius: 8px; border: 1px solid #ef4444;'
      );
      console.log(
        '%c⚡ Developer Mode, Source Inspection, and Runtime Tampering are strictly locked.',
        'color: #06b6d4; font-size: 13px; font-weight: bold;'
      );
      console.log(
        '%cTransactions, payment tokens, and Escrow barter exchanges are cryptographically verified by SHA-256 signatures.',
        'color: #94a3b8; font-size: 11px;'
      );
    };

    // Show initial console warning
    showConsoleWarning();

    // 3. Prevent Right-Click Context Menu (Inspect Element Lockdown)
    window.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        triggerSecurityToast('Right-click inspection is disabled in secure mode.');
        return false;
      },
      true
    );

    // 4. Block Keyboard Shortcuts for DevTools & Source Viewing
    window.addEventListener(
      'keydown',
      (e) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
        const shiftKey = e.shiftKey;

        // F12 (DevTools)
        if (e.key === 'F12' || e.keyCode === 123) {
          e.preventDefault();
          e.stopPropagation();
          triggerSecurityToast('Developer Mode (F12) is disabled on GameHub.');
          return false;
        }

        // Ctrl + Shift + I (Inspect)
        if (ctrlOrCmd && shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
          e.preventDefault();
          e.stopPropagation();
          triggerSecurityToast('Inspect Element is restricted by Security Shield.');
          return false;
        }

        // Ctrl + Shift + J (Console)
        if (ctrlOrCmd && shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
          e.preventDefault();
          e.stopPropagation();
          triggerSecurityToast('Console access is restricted.');
          return false;
        }

        // Ctrl + Shift + C (Element Inspector)
        if (ctrlOrCmd && shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
          e.preventDefault();
          e.stopPropagation();
          triggerSecurityToast('Element Inspector is locked.');
          return false;
        }

        // Ctrl + U (View Page Source)
        if (ctrlOrCmd && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
          e.preventDefault();
          e.stopPropagation();
          triggerSecurityToast('View Source is disabled.');
          return false;
        }

        // Ctrl + S (Save Page)
        if (ctrlOrCmd && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      },
      true
    );

    // 5. Detect DevTools Open State & Mitigate
    let devToolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          showConsoleWarning();
        }
      } else {
        devToolsOpen = false;
      }
    };

    window.addEventListener('resize', checkDevTools);
    setInterval(checkDevTools, 2000);
  }
};

/**
 * Temporary Cyberpunk Security Toast
 */
let toastTimeout = null;
export const triggerSecurityToast = (message) => {
  if (typeof document === 'undefined') return;

  let toast = document.getElementById('gh-security-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gh-security-toast';
    toast.className =
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-red-500/80 shadow-2xl shadow-red-950/60 text-white text-xs font-semibold flex items-center gap-2.5 backdrop-blur-xl transition-all duration-300 pointer-events-none select-none';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
    <span class="text-red-400 font-bold uppercase tracking-wider font-mono text-[10px]">SECURITY SHIELD:</span>
    <span class="text-slate-200">${message}</span>
  `;

  toast.style.opacity = '1';
  toast.style.transform = 'translate(-50%, 0) scale(1)';

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 15px) scale(0.95)';
    }
  }, 3200);
};
