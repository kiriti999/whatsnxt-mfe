import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    labId: {
      type: Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["purchase_attempt", "purchase_success", "purchase_failed"],
      immutable: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR"],
      default: "INR",
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "success", "failed", "cancelled"],
    },
    gatewayResponse: {
      orderId: String,
      paymentId: String,
      errorCode: String,
      errorDescription: String,
      raw: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
    clientContext: {
      userAgent: String,
      ipAddress: String,
      sessionId: String,
    },
  },
  {
    timestamps: false, // We use custom timestamp field
  }
);

// Index for audit log queries
TransactionSchema.index({ timestamp: -1 });
TransactionSchema.index({ studentId: 1, timestamp: -1 });
TransactionSchema.index({ labId: 1, timestamp: -1 });
TransactionSchema.index({ status: 1, timestamp: -1 });

// Prevent OverwriteModelError by checking if model already exists
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
