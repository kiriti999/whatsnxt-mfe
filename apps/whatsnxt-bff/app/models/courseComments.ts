import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CourseCommentSchema = new Schema(
  {
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
    lessonId: {
      type: String,
      ref: "videos",
      required: true,
    },
    parentId: {
      type: String,
      ref: "courseComments",
      default: null,
    },
    flags: {
      type: Number,
      default: 0,
    },
    flaggedBy: {
      type: [mongoose.Types.ObjectId], // Array of user IDs who flagged this comment
      ref: "users",
      default: [],
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
    isHidden: {
      type: Boolean,
      default: false,
    },
    childCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: "courseComments" },
);

CourseCommentSchema.set("toObject", { virtuals: true });
CourseCommentSchema.set("toJSON", { virtuals: true });

/**
 * Register
 */
const CourseComment = mongoose.model("courseComments", CourseCommentSchema);
export default CourseComment;
