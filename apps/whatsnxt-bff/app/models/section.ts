import mongoose from "mongoose";
import Video from "./video";
const Schema = mongoose.Schema;

/**
 * User schema
 */

const SectionSchema = new Schema(
  {
    sectionTitle: String,
    sectionSlug: {
      type: String,
      default: "",
    },
    description: String,
    order: Number,
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
    videos: [Video.schema],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active"],
    },
  },
  { timestamps: true, collection: "sections" },
);

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

SectionSchema.pre("save", async function (next) {
  if (!this.isModified("courseId")) return next();

  const count = await (this.constructor as any).countDocuments({
    courseId: this.courseId,
  });
  this.order = count + 1;
  next();
});

/**
 * Methods
 */

SectionSchema.method({});

/**
 * Statics
 */

SectionSchema.static({});

/**
 * Register
 */

export default mongoose.model("sections", SectionSchema);
