import mongoose from "mongoose";
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    trainerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    receipt: {
      type: String,
      unique: true, // Unique receipt number for this order
    },
    currency: {
      type: String,
      default: "INR", // Default currency set to INR
    },
    cost: {
      type: Number,
      required: true, // Cost in currency subunits
    },
    amount_paid: {
      type: Number,
      default: 0, // amount paid in currency subunits
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "refunded"],
      default: "unpaid", // Default status to 'unpaid'
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    paymentId: String, // Reference to the payment transaction ID if available
    refund_status: String, // Refund status
    refund_message: String, // Refund message
    refund_reasons: [String], // Refund reasons
    amount_refunded: Number, // Refunded amount
    method: String,
    bank: String, // Bank name of purchase
    wallet: String, // Wallet name of purchase
    cardType: String, // for example` credit
    cardNetwork: String, // for example` mastercard
    cardLast4: String,
  },
  { timestamps: true, collection: "trainerContactedPayments" },
);

const TrainerContactedPayment = mongoose.model(
  "trainerContactedPayments",
  schema,
);
export default TrainerContactedPayment;
