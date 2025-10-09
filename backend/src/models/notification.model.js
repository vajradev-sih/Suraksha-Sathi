import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  report_id: { type: Schema.Types.ObjectId, ref: 'HazardReport' },
  notification_type: { type: String, required: true },
  sent_at: { type: Date },
  read_at: { type: Date }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
