// Offline UI Indicator Component
// This script should be included on all pages that need offline status indicators

(function() {
  'use strict';

  // Create and inject offline status banner
  function createOfflineBanner() {
    const banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner hidden';
    banner.innerHTML = `
      <div class="offline-banner-content">
        <span class="material-symbols-outlined">cloud_off</span>
        <span class="offline-banner-text">You're offline. Changes will be synced when connection is restored.</span>
        <span class="offline-queue-count" id="offline-queue-count"></span>
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  }

  // Create sync status indicator
  function createSyncIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'sync-indicator';
    indicator.className = 'sync-indicator hidden';
    indicator.innerHTML = `
      <div class="sync-indicator-content">
        <div class="sync-spinner"></div>
        <span class="sync-text">Syncing...</span>
      </div>
    `;
    document.body.appendChild(indicator);
    return indicator;
  }

  // Create install prompt for PWA
  function createInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.id = 'install-prompt';
    prompt.className = 'install-prompt hidden';
    prompt.innerHTML = `
      <div class="install-prompt-content">
        <span class="material-symbols-outlined">download</span>
        <span class="install-text">Install Suraksha Sathi app for offline access</span>
        <button class="install-btn" id="install-btn-yes">Install</button>
        <button class="install-btn-dismiss" id="install-btn-dismiss">×</button>
      </div>
    `;
    document.body.appendChild(prompt);
    return prompt;
  }

  // Inject CSS styles
  function injectStyles() {
    const styles = `
      <style>
        .offline-banner {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 0.75rem 1rem;
          z-index: 9999;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transform: translateY(-100%);
          transition: transform 0.3s ease-in-out;
        }

        .offline-banner:not(.hidden) {
          transform: translateY(0);
        }

        .offline-banner-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .offline-banner-content .material-symbols-outlined {
          font-size: 1.25rem;
        }

        .offline-queue-count {
          background: rgba(255, 255, 255, 0.3);
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          margin-left: 0.5rem;
        }

        .sync-indicator {
          position: fixed;
          bottom: 5rem;
          right: 1rem;
          background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s, transform 0.3s;
        }

        .sync-indicator:not(.hidden) {
          opacity: 1;
          transform: translateY(0);
        }

        .sync-indicator-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .sync-spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .install-prompt {
          position: fixed;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          padding: 1rem;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          z-index: 9997;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s, transform 0.3s;
          max-width: 28rem;
          margin: 0 auto;
        }

        .install-prompt:not(.hidden) {
          opacity: 1;
          transform: translateY(0);
        }

        .install-prompt-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .install-prompt-content .material-symbols-outlined {
          font-size: 1.5rem;
          color: #ffc107;
        }

        .install-text {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .install-btn {
          background: #ffc107;
          color: #0f172a;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .install-btn:hover {
          background: #ffcd38;
        }

        .install-btn-dismiss {
          background: transparent;
          color: white;
          padding: 0.25rem;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .install-btn-dismiss:hover {
          opacity: 1;
        }

        .hidden {
          display: none !important;
        }

        /* Toast notification for sync status */
        .sync-toast {
          position: fixed;
          bottom: 6rem;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: #10b981;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9996;
          opacity: 0;
          transition: opacity 0.3s, transform 0.3s;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .sync-toast.show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        .sync-toast.error {
          background: #ef4444;
        }

        /* Adjust body padding when offline banner is shown */
        body.offline-mode {
          padding-top: 3rem;
        }

        @media (min-width: 768px) {
          .install-prompt {
            left: auto;
            right: 1rem;
            max-width: 24rem;
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  // Show toast notification
  function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `sync-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Initialize the UI components
  function init() {
    injectStyles();
    const banner = createOfflineBanner();
    const syncIndicator = createSyncIndicator();
    const installPrompt = createInstallPrompt();

    let deferredPrompt = null;

    // Update offline status
    function updateOfflineStatus(isOnline) {
      if (isOnline) {
        banner.classList.add('hidden');
        document.body.classList.remove('offline-mode');
      } else {
        banner.classList.remove('hidden');
        document.body.classList.add('offline-mode');
        updateQueueCount();
      }
    }

    // Update queue count
    function updateQueueCount() {
      if (typeof getOfflineQueueStatus === 'function') {
        const status = getOfflineQueueStatus();
        const countEl = document.getElementById('offline-queue-count');
        if (countEl && status.queueLength > 0) {
          countEl.textContent = `${status.queueLength} pending`;
          countEl.style.display = 'inline-block';
        } else if (countEl) {
          countEl.style.display = 'none';
        }
      }
    }

    // Listen for connection status changes
    document.addEventListener('connection-status-changed', (e) => {
      updateOfflineStatus(e.detail.online);
      if (e.detail.online) {
        showToast('Back online! Syncing data...');
      } else {
        showToast('You are offline. Changes will be saved locally.', 'error');
      }
    });

    // Listen for requests being queued
    document.addEventListener('request-queued', () => {
      updateQueueCount();
    });

    // Listen for sync completion
    document.addEventListener('sync-completed', (e) => {
      syncIndicator.classList.add('hidden');
      const { successCount, failCount, remaining } = e.detail;
      
      if (successCount > 0) {
        showToast(`✓ Synced ${successCount} item${successCount > 1 ? 's' : ''}`);
      }
      
      if (failCount > 0) {
        showToast(`Failed to sync ${failCount} item${failCount > 1 ? 's' : ''}`, 'error');
      }
      
      updateQueueCount();
    });

    // Show sync indicator when syncing starts
    window.addEventListener('online', () => {
      if (typeof getOfflineQueueStatus === 'function') {
        const status = getOfflineQueueStatus();
        if (status.queueLength > 0) {
          syncIndicator.classList.remove('hidden');
        }
      }
    });

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Don't show if already installed or user dismissed
      if (!localStorage.getItem('pwa-install-dismissed')) {
        setTimeout(() => {
          installPrompt.classList.remove('hidden');
        }, 5000); // Show after 5 seconds
      }
    });

    document.getElementById('install-btn-yes')?.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] Install outcome:', outcome);
        deferredPrompt = null;
      }
      installPrompt.classList.add('hidden');
    });

    document.getElementById('install-btn-dismiss')?.addEventListener('click', () => {
      installPrompt.classList.add('hidden');
      localStorage.setItem('pwa-install-dismissed', 'true');
    });

    // Check if app is installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      installPrompt.classList.add('hidden');
      showToast('App installed successfully!');
    });

    // Initial status check
    updateOfflineStatus(navigator.onLine);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for manual control if needed
  window.offlineUI = {
    showToast,
    updateQueueCount: () => {
      const countEl = document.getElementById('offline-queue-count');
      if (typeof getOfflineQueueStatus === 'function') {
        const status = getOfflineQueueStatus();
        if (countEl && status.queueLength > 0) {
          countEl.textContent = `${status.queueLength} pending`;
          countEl.style.display = 'inline-block';
        } else if (countEl) {
          countEl.style.display = 'none';
        }
      }
    }
  };
})();
