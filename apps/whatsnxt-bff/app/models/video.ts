/*!
 * Module dependencies
 */

import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * User schema
 */

const VideoSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
    },
    isPreview: Boolean,
    videoUrl: String,
    videoDuration: Number,
    order: { type: Number },
    name: String,
    docUrl: String,
    videoPublicId: String,
    docPublicId: String,
    docResourceType: String,
    videoResourceType: String,
    description: String,
    isPublish: {
      type: Boolean,
      default: false,
    },
    sectionId: {
      type: mongoose.Types.ObjectId,
      ref: "sections",
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active"],
    },
    lectureLinks: [{ link: String }],
  },
  { timestamps: true, collection: "videos" },
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

VideoSchema.method({});

/**
 * Statics
 */

VideoSchema.static({});

/**
 * Register
 */

const Video = mongoose.model("videos", VideoSchema);
export default Video;
