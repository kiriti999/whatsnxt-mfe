"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseFeedbackSchema = new Schema(
  {
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "courses",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    rating: Number,
    averageRating: Number,
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    flags: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [mongoose.Types.ObjectId],
      ref: "users",
      default: [],
    },
    disLikedBy: {
      type: [mongoose.Types.ObjectId],
      ref: "users",
      default: [],
    },
    is_editable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: "courseFeedbacks" },
);

CourseFeedbackSchema.set("toObject", { virtuals: true });
CourseFeedbackSchema.set("toJSON", { virtuals: true });

/**
 * Methods
 */

CourseFeedbackSchema.method({});

/**
 * Statics
 */

CourseFeedbackSchema.static({});

/**
 * Register
 */

const courseFeedback = mongoose.model("courseFeedbacks", CourseFeedbackSchema);
export default courseFeedback;
