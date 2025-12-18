import mongoose from "mongoose";
const Schema = mongoose.Schema;
const otpSchema = new Schema(
  {
    otp: {
      type: String,
      required: true,
    },
    name: String,
    email: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600,
    },
  },
  { timestamps: true, collection: "otps" },
);
export default mongoose.model("otps", otpSchema);
