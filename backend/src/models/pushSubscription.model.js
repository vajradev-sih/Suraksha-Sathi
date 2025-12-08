// Push Notification Subscription Model
import mongoose, { Schema } from 'mongoose';

const pushSubscriptionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true }
  },
  device_type: { type: String }, // 'android', 'ios', 'desktop', 'other'
  browser: { type: String }, // 'chrome', 'firefox', 'safari', etc.
  is_active: { type: Boolean, default: true },
  last_used: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
pushSubscriptionSchema.index({ user_id: 1, is_active: 1 });

export const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
