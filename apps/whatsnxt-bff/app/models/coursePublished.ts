"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * CoursePublished schema - stores finalized published courses
 */
const CoursePublishedSchema = new Schema(
  {
    // Reference to the original course
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "courses",
      required: true,
      index: true,
    },
    // Course data (same fields as Course model)
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
      index: true,
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
      index: true,
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
    // Version of the published course
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true, collection: "coursesPublished" },
);

/**
 * Add indexes to optimize queries
 */
CoursePublishedSchema.index({ courseId: 1 });
CoursePublishedSchema.index({ userId: 1 });
CoursePublishedSchema.index({ categoryName: 1, subCategoryName: 1 });

/**
 * Set options for virtuals and toJSON
 */
CoursePublishedSchema.set("toObject", { virtuals: true });
CoursePublishedSchema.set("toJSON", { virtuals: true });

/**
 * Register
 */
const CoursePublished = mongoose.model(
  "coursesPublished",
  CoursePublishedSchema,
);
export default CoursePublished;
