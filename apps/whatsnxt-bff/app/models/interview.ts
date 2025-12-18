import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Interview is required"],
    },
    answer: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses", // Name of the related model
      required: [true, "Course is required"],
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users", // Name of the related model
      required: [true, "Author is required"],
    },
    questionUpdated: {
      type: String,
    },
    answerUpdated: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "updated"],
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "interviews",
  },
);

// Create a virtual field authorInfo
InterviewSchema.virtual("authorInfo", {
  ref: "users",
  localField: "authorId",
  foreignField: "_id",
  justOne: true, // Ensures single object instead of array
});

// Create a virtual field courseInfo
InterviewSchema.virtual("courseInfo", {
  ref: "courses",
  localField: "courseId",
  foreignField: "_id",
  justOne: true, // Ensures single object instead of array
});

// Enable virtuals when converting to JSON or Object
InterviewSchema.set("toObject", { virtuals: true });
InterviewSchema.set("toJSON", { virtuals: true });

// Export the Interview model
const Interview = mongoose.model("interviews", InterviewSchema);
export default Interview;
