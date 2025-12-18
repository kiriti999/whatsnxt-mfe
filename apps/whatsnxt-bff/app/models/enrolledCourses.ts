/*!
 * Module dependencies
 */

import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * User schema
 */

const EnrolledCoursesSchema = new Schema(
  {
    buyerEmail: {
      type: String,
      index: true, // Queries based on payment_email for reporting or filtering
    },
    cost: Number,
    lessons: {
      type: [
        {
          lesson_id: String,
          section_id: String,
          is_completed: Boolean,
        },
      ],
      default: [],
    },
    lessons_watched: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Types.ObjectId,
      ref: "coursesPublished",
      index: true, // Frequently filtered by course ID
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      index: true, // Joins with user collection for lookups
    },
  },
  { timestamps: true, collection: "enrolledCourses" },
);

// Compound index for user and course
EnrolledCoursesSchema.index({ user: 1, course: 1 });

export default mongoose.model("enrolledCourses", EnrolledCoursesSchema);
