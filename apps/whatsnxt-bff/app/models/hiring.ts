import mongoose from "mongoose";
const Schema = mongoose.Schema;

const hiringSchema = new Schema(
  {
    trainerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "users",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    durationType: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "booked", "unavailable", "cancelled"],
      default: "pending",
    },
    reason: String,
    isPaymentDone: Boolean,
    course_slug: String,
  },
  { timestamps: true, collection: "hirings" },
);

const Hiring = mongoose.model("hirings", hiringSchema);
export default Hiring;
