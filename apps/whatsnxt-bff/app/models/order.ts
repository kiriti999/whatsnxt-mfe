import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Order schema
 */

const OrderSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    courseInfo: [
      {
        courseId: {
          type: mongoose.Types.ObjectId,
          ref: "courses",
          required: true,
        },
        status: {
          type: String,
          enum: ["paid", "refunded"],
          default: "paid", // Status of the course
        },
        price: {
          type: Number,
          required: true,
        },
        total_cost: {
          type: Number,
          required: true,
        },
        courseName: String, // Optional: Store the course name for quick access
      },
    ],
    cost: {
      type: Number,
      required: true, // Cost of the order in currency subunits
    },
    // GST fields
    gstAmount: {
      type: Number,
      default: 0, // GST amount in currency subunits
    },
    gstRate: {
      type: String,
      default: "0%", // GST rate applied
    },
    quantity: {
      type: Number,
    },
    currency: {
      type: String,
      default: "INR", // Default currency set to INR
    },
    status: {
      type: String,
      enum: ["created", "attempted", "paid", "refunded", "partial_refunded"],
      default: "created", // Default status to 'created'
    },
    amount_paid: {
      type: Number,
      default: 0, // Amount paid, in currency subunits
    },
    orderId: {
      type: String,
      unique: true,
      required: true,
      default: "",
    },
    receipt: {
      type: String,
      unique: true, // Unique receipt number for this order
    },
    attempts: {
      type: Number,
      default: 0, // Number of payment attempts made
    },
    notes: {
      type: Map,
      of: String, // Key-value pairs for additional info, e.g., {"note_key": "value"}
    },
    paymentId: String, // Reference to the payment transaction ID if available
    refund_status: String, // Refund status
    refund_message: String, // Refund message
    refund_reasons: [String], // Refund reasons
    amount_refunded: Number, // Refunded amount
    phone: String, // Contact phone number of the user
    method: String, // Method of purchase
    bank: String, // Bank name of purchase
    wallet: String, // Wallet name of purchase
    cardType: String, // for example` credit
    cardNetwork: String, // for example` mastercard
    cardLast4: String,
  },
  { timestamps: true, collection: "orders" },
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */

// Example static: find by user and status
OrderSchema.statics.findByUserAndStatus = function (userId, status) {
  return this.find({ userId, status });
};

/**
 * Register the model
 */

export default mongoose.model("orders", OrderSchema);
