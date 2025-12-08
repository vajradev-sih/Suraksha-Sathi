// Push Notification Manager
// Handles push notification subscription and management for the PWA

class PushManager {
  constructor() {
    this.subscription = null;
    this.publicKey = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Initialize push notifications
   */
  async init() {
    console.log('[Push] Initializing push notification manager');
    
    if (!this.isSupported) {
      console.warn('[Push] Push notifications not supported');
      return false;
    }

    try {
      // Get the public VAPID key from server
      const response = await fetch(`${API_BASE_URL}/push/public-key`);
      const data = await response.json();
      this.publicKey = data.data.publicKey;
      console.log('[Push] Retrieved public key');

      // Check current subscription status
      await this.checkSubscription();
      return true;
    } catch (error) {
      console.error('[Push] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if user is already subscribed
   */
  async checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      this.subscription = await registration.pushManager.getSubscription();
      
      if (this.subscription) {
        console.log('[Push] Existing subscription found');
        this.dispatchEvent('subscription-status', { subscribed: true });
      } else {
        console.log('[Push] No existing subscription');
        this.dispatchEvent('subscription-status', { subscribed: false });
      }
      
      return !!this.subscription;
    } catch (error) {
      console.error('[Push] Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Request notification permission and subscribe
   */
  async subscribe() {
    console.log('[Push] Requesting subscription');

    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    if (!this.publicKey) {
      await this.init();
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.warn('[Push] Notification permission denied');
        throw new Error('Notification permission denied');
      }

      console.log('[Push] Permission granted');

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
      });

      console.log('[Push] Browser subscription created');

      // Send subscription to server
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: this.subscription.toJSON(),
          device_type: this.getDeviceType(),
          browser: this.getBrowserInfo()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      const data = await response.json();
      console.log('[Push] Subscription saved to server:', data.data);

      this.dispatchEvent('subscribed', { subscription: data.data });
      this.dispatchEvent('subscription-status', { subscribed: true });

      return data.data;
    } catch (error) {
      console.error('[Push] Subscription failed:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe() {
    console.log('[Push] Unsubscribing');

    if (!this.subscription) {
      console.warn('[Push] No subscription to unsubscribe');
      return true;
    }

    try {
      // Unsubscribe from browser
      await this.subscription.unsubscribe();
      
      // Remove from server
      const token = localStorage.getItem('token');
      if (token) {
        const endpoint = this.subscription.endpoint;
        
        await fetch(`${API_BASE_URL}/push/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ endpoint })
        });
      }

      this.subscription = null;
      console.log('[Push] Unsubscribed successfully');

      this.dispatchEvent('unsubscribed');
      this.dispatchEvent('subscription-status', { subscribed: false });

      return true;
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
      throw error;
    }
  }

  /**
   * Send a test notification
   */
  async sendTestNotification() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/push/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      const data = await response.json();
      console.log('[Push] Test notification sent:', data);
      return data;
    } catch (error) {
      console.error('[Push] Test notification failed:', error);
      throw error;
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus() {
    if (!this.isSupported) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled() {
    return this.getPermissionStatus() === 'granted' && !!this.subscription;
  }

  /**
   * Convert base64 string to Uint8Array for VAPID key
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Detect device type
   */
  getDeviceType() {
    const ua = navigator.userAgent.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(navigator.userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';

    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'Opera';
    }

    return browser;
  }

  /**
   * Dispatch custom events
   */
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(`push-${eventName}`, { detail });
    window.dispatchEvent(event);
  }
}

// Create global instance
const pushManager = new PushManager();

// Auto-initialize when page loads and user is authenticated
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
      pushManager.init().catch(err => console.error('[Push] Auto-init failed:', err));
    }
  });
} else {
  if (localStorage.getItem('token')) {
    pushManager.init().catch(err => console.error('[Push] Auto-init failed:', err));
  }
}

// Export for use in other scripts
window.pushManager = pushManager;
