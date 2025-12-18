import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bookingDetailSchema = new Schema(
  {
    booking_id: {
      type: mongoose.Types.ObjectId,
    },
    booking_status: String,
    trainer_email: String,
    student_email: String,
    time_slot_requested: String,
    payment_status: {
      type: String,
      enum: ["pending", "success", "failed"],
    },
    order_id: String,
  },
  { timestamps: true, collection: "bookingDetails" },
);

const BookingDetail = mongoose.model("bookingDetails", bookingDetailSchema);
export default BookingDetail;
