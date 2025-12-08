import mongoose, { Schema } from 'mongoose';

const followSchema = new Schema({
  follower_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound index to ensure a user can only follow another user once
followSchema.index({ follower_id: 1, following_id: 1 }, { unique: true });

// Index for faster queries
followSchema.index({ follower_id: 1, createdAt: -1 });
followSchema.index({ following_id: 1, createdAt: -1 });

// Prevent self-following
followSchema.pre('save', function(next) {
  if (this.follower_id.toString() === this.following_id.toString()) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

export const Follow = mongoose.model('Follow', followSchema);
