"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Course schema
 */
const CourseSchema = new Schema(
  {
    author: {
      type: String,
    },
    courseName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    overview: {
      type: String,
      default: "",
    },
    topics: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: null,
    },
    courseType: {
      type: String,
      default: null,
    },
    paidType: {
      type: String,
      default: null,
    },
    published: {
      type: Boolean,
      default: false,
      index: true, // Added index for published field
    },
    imageUrl: {
      type: String,
      default: "",
    },
    courseImagePublicId: {
      type: String,
      default: "",
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    course_preview_video: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    lessons: {
      type: Number,
      default: null,
    },
    access: {
      type: String,
      default: "",
    },
    categoryName: {
      type: String,
      default: "",
      index: true, // Added index for categoryName field
    },
    subCategoryName: {
      type: String,
      default: "",
    },
    nestedSubCategoryName: {
      type: String,
      default: "",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    languageIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "languages" }],
      required: true,
    },
    courseFeedback: {
      type: mongoose.Types.ObjectId,
      ref: "courseFeedbacks",
    },
    purchaseCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      index: true, // Keep existing index for rating
    },
    rateArray: {
      type: [Number],
      default: [],
    },
    discount: {
      type: Number,
      default: 0,
    },
    cloudinaryAssets: {
      type: [Object],
      default: [],
    },
    statusUpdateReason: {
      type: String,
    },
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "pending_review", "approved", "published", "rejected"],
      index: true, // Added index for status field
    },
  },
  { timestamps: true, collection: "courses" },
);

/**
 * Add indexes to optimize queries
 */

// Compound index for published and createdAt (used in sorting/filtering)
CourseSchema.index({ published: 1, createdAt: -1 });

// Index for categoryName and subCategoryName for efficient filtering by category
CourseSchema.index({ categoryName: 1, subCategoryName: 1 });

// Index for status and createdAt for admin-related queries
CourseSchema.index({ status: 1, createdAt: -1 });

/**
 * Set options for virtuals and toJSON
 */
CourseSchema.set("toObject", { virtuals: true });
CourseSchema.set("toJSON", { virtuals: true });

/**
 * Register
 */
const Course = mongoose.model("courses", CourseSchema);
export default Course;
