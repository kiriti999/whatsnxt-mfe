import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
      index: true, // Single-field index for userId
    },
    message: {
      type: String,
      required: true,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true, collection: "notifications" },
);

// TTL index for automatic deletion of expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for userId and createdAt to optimize filtering and sorting
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model("notifications", notificationSchema);
export default Notification;
