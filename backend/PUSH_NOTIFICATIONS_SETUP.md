# Push Notifications Setup Guide

This guide explains how to set up and configure push notifications for Suraksha Sathi.

## Prerequisites

- Node.js and npm installed
- Backend server running
- HTTPS connection (required for service workers and push notifications)

## 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for Web Push authentication.

### Generate Keys

```bash
cd backend
npx web-push generate-vapid-keys
```

This will output something like:

```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSGhzEh...

Private Key:
-dCqzKqz4ek3bMBhHq5G0qN9qBV5v7BWP4OTi...
=======================================
```

### Add to Environment Variables

Create or update `.env` file in the `backend` directory:

```env
# Push Notification VAPID Keys
VAPID_PUBLIC_KEY=BEl62iUYgUivxIkv69yViEuiBIa-Ib27SDbQjfTbSGhzEh...
VAPID_PRIVATE_KEY=-dCqzKqz4ek3bMBhHq5G0qN9qBV5v7BWP4OTi...
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:** 
- Keep the private key secret
- Never commit `.env` file to version control
- Add `.env` to `.gitignore`

## 2. Install Dependencies

```bash
cd backend
npm install
```

This will install the `web-push` package along with other dependencies.

## 3. Include Push Manager in Frontend

Add the push manager script to your HTML pages that need push notifications:

```html
<!-- Add before closing </body> tag -->
<script src="/push-manager.js"></script>
```

For pages with push notification settings, include the UI component:

```html
<!-- In profile settings or notification preferences page -->
<div id="pushNotificationSettings"></div>
<script>
  // Load the push notification settings component
  fetch('/components/push-notification-settings.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('pushNotificationSettings').innerHTML = html;
    });
</script>
```

## 4. API Endpoints

The following endpoints are available:

### Public Endpoints

- `GET /api/v1/push/public-key` - Get VAPID public key

### Protected Endpoints (Require Authentication)

- `POST /api/v1/push/subscribe` - Subscribe to push notifications
  ```json
  {
    "subscription": {
      "endpoint": "https://...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    },
    "device_type": "mobile|tablet|desktop",
    "browser": "Chrome|Firefox|Safari|..."
  }
  ```

- `POST /api/v1/push/unsubscribe` - Unsubscribe from push notifications
  ```json
  {
    "endpoint": "https://..."
  }
  ```

- `GET /api/v1/push/subscriptions` - Get all subscriptions for current user

- `POST /api/v1/push/test` - Send a test notification to current user

### Admin Endpoints (Require Admin/Safety Officer Role)

- `POST /api/v1/push/send` - Send notification to specific user
  ```json
  {
    "user_id": "user_id_here",
    "title": "Notification Title",
    "body": "Notification message",
    "data": {
      "url": "/features_pages/report.html",
      "reportId": "123"
    }
  }
  ```

- `DELETE /api/v1/push/cleanup` - Clean up expired/invalid subscriptions

## 5. Sending Notifications

### From Controllers

Use the push notification utility in your controllers:

```javascript
import { 
  sendPushNotification, 
  sendPushNotificationToMultiple,
  sendPushNotificationByRole 
} from '../utils/pushNotification.js';
import PushSubscription from '../models/pushSubscription.model.js';

// Send to specific user
const subscriptions = await PushSubscription.find({ 
  user_id: userId, 
  is_active: true 
});

await sendPushNotificationToMultiple(subscriptions, {
  title: 'New Hazard Report',
  body: 'A new hazard has been reported in your area',
  data: {
    url: '/features_pages/report.html',
    reportId: newReport._id
  }
});

// Send to all users with a specific role
await sendPushNotificationByRole('SafetyOfficer', {
  title: 'High Priority Alert',
  body: 'Critical hazard requires immediate attention',
  data: {
    url: '/admin/hazard_nav_admin.html',
    priority: 'high'
  }
});
```

### Example: Notify on Hazard Report Creation

Update `hazardReport.controller.js`:

```javascript
export const createHazardReport = asyncHandler(async (req, res) => {
  // ... existing code to create hazard report ...

  // Send notification to safety officers
  await sendPushNotificationByRole('SafetyOfficer', {
    title: 'New Hazard Report',
    body: `${req.user.full_name} reported: ${hazardReport.description.substring(0, 50)}...`,
    data: {
      url: '/admin/hazard_nav_admin.html',
      reportId: hazardReport._id.toString(),
      type: 'hazard_report'
    }
  });

  res.status(201).json({
    success: true,
    data: hazardReport
  });
});
```

## 6. Frontend Usage

### Automatic Initialization

The push manager automatically initializes when:
- User is authenticated (has token in localStorage)
- Page loads with push-manager.js included

### Manual Control

```javascript
// Check if notifications are supported
if (window.pushManager.isSupported) {
  // Subscribe to notifications
  await window.pushManager.subscribe();

  // Check subscription status
  const isSubscribed = await window.pushManager.checkSubscription();

  // Send test notification
  await window.pushManager.sendTestNotification();

  // Unsubscribe
  await window.pushManager.unsubscribe();

  // Get permission status
  const status = window.pushManager.getPermissionStatus();
  // Returns: 'granted', 'denied', 'default', or 'unsupported'
}
```

### Listen for Events

```javascript
// Subscription status changed
window.addEventListener('push-subscription-status', (event) => {
  console.log('Subscribed:', event.detail.subscribed);
});

// Successfully subscribed
window.addEventListener('push-subscribed', (event) => {
  console.log('Subscription:', event.detail.subscription);
});

// Unsubscribed
window.addEventListener('push-unsubscribed', () => {
  console.log('User unsubscribed');
});
```

## 7. Service Worker Integration

The service worker (`sw.js`) already includes push notification handlers:

- `push` event - Receives and displays notifications
- `notificationclick` event - Handles notification clicks

### Notification Format

```javascript
{
  title: 'Notification Title',
  body: 'Notification message',
  icon: './mine logo.png',  // Optional, defaults to app icon
  badge: './mine logo.png', // Optional
  data: {
    url: '/target-page.html',  // Page to open on click
    customData: 'any custom data'
  },
  actions: [  // Optional action buttons
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Dismiss' }
  ]
}
```

## 8. Testing

### Test Subscription Flow

1. Open the app in browser
2. Navigate to profile settings
3. Enable notifications
4. Allow notification permission when prompted
5. Click "Send Test Notification"
6. Verify notification appears

### Test from Backend

```bash
# Using curl or Postman
POST http://localhost:8000/api/v1/push/test
Authorization: Bearer YOUR_JWT_TOKEN
```

### Debug Mode

Check browser console for logs:
- `[Push]` - Push manager logs
- `[SW]` - Service worker logs

## 9. Production Deployment

### Requirements

1. **HTTPS Required**: Service workers and push notifications require HTTPS
2. **VAPID Keys**: Generate production keys (different from development)
3. **Environment Variables**: Set in production environment
4. **Browser Support**: Chrome, Firefox, Edge, Opera (Safari requires different setup)

### Security Checklist

- ✅ VAPID private key kept secret
- ✅ Endpoint protected with authentication
- ✅ Admin endpoints restricted to authorized roles
- ✅ Rate limiting on notification sending
- ✅ Subscription cleanup for expired endpoints
- ✅ Validation of notification payload

## 10. Troubleshooting

### "Push not supported"
- Check HTTPS connection
- Verify browser support
- Check service worker registration

### "Permission denied"
- User must manually re-enable in browser settings
- Cannot programmatically override denied permission

### Notifications not received
- Check subscription is active in database
- Verify VAPID keys are correct
- Check browser console for errors
- Ensure service worker is active

### Expired subscriptions
- Run cleanup endpoint: `DELETE /api/v1/push/cleanup`
- Automatically handled when sending fails

## 11. Best Practices

1. **Don't spam**: Only send important notifications
2. **Personalize**: Include user-specific information
3. **Actionable**: Make notifications clickable with relevant URLs
4. **Timely**: Send notifications when events happen
5. **Respect preferences**: Allow users to disable notifications
6. **Handle failures**: Gracefully handle expired/invalid subscriptions
7. **Clean up**: Periodically remove invalid subscriptions

## 12. Notification Use Cases

### For Workers
- New task assignments
- Hazard report status updates
- Safety alerts in their area
- Daily safety prompts
- Shift reminders

### For Safety Officers
- New hazard reports
- High-priority incidents
- Pending approvals
- Escalated issues
- Compliance deadlines

### For Admins
- System alerts
- User registrations
- Critical incidents
- Report summaries
- Performance metrics

## Resources

- [Web Push API Spec](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
