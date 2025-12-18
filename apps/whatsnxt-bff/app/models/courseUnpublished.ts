"use strict";
import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * CourseUnpublished schema - stores pending changes for review
 */
const CourseUnpublishedSchema = new Schema(
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
    published: {
      type: Boolean,
      default: false,
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
    cloudinaryAssets: {
      type: [Object],
      default: [],
    },
    // Status of the unpublished changes
    status: {
      type: String,
      default: "draft",
      enum: ["draft", "pending_review", "approved", "rejected", "published"],
      index: true,
    },
    statusUpdateReason: {
      type: String,
    },
    // Track sections that have been modified
    modifiedSections: {
      type: [mongoose.Types.ObjectId],
      default: [],
    },
    // Version tracking
    version: {
      type: Number,
      default: 1,
    },
    // Reviewer information
    reviewerId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true, collection: "coursesUnpublished" },
);

/**
 * Add indexes to optimize queries
 */
CourseUnpublishedSchema.index({ courseId: 1, status: 1 });
CourseUnpublishedSchema.index({ userId: 1, status: 1 });

/**
 * Set options for virtuals and toJSON
 */
CourseUnpublishedSchema.set("toObject", { virtuals: true });
CourseUnpublishedSchema.set("toJSON", { virtuals: true });

/**
 * Register
 */
const CourseUnpublished = mongoose.model(
  "coursesUnpublished",
  CourseUnpublishedSchema,
);
export default CourseUnpublished;
