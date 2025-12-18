import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LabPurchaseSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    labId: {
      type: String, // UUID from Lab model
      ref: "Lab",
      required: true,
      index: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      immutable: true,
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
      enum: ["completed", "refunded"],
      default: "completed",
    },
    metadata: {
      razorpayOrderId: {
        type: String,
        required: true,
      },
      razorpayPaymentId: {
        type: String,
        required: true,
      },
      razorpaySignature: {
        type: String,
        required: true,
      },
      reason: {
        type: String,
        enum: ["purchase", "free_to_paid_conversion"],
        default: "purchase",
      },
      convertedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      convertedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: One purchase per student per lab
LabPurchaseSchema.index({ studentId: 1, labId: 1 }, { unique: true });

// Index for purchase history queries
LabPurchaseSchema.index({ studentId: 1, purchaseDate: -1 });
LabPurchaseSchema.index({ labId: 1, purchaseDate: -1 });

// Prevent OverwriteModelError by checking if model already exists
export default mongoose.models.LabPurchase || mongoose.model("LabPurchase", LabPurchaseSchema);
