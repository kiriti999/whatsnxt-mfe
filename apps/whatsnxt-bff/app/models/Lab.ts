import mongoose from "mongoose";
const Schema = mongoose.Schema;

const LabSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["programming", "cloud", "framework", "architecture"],
    },
    language: {
      type: String,
      default: "javascript",
    },
    // For Architecture Labs
    masterGraph: {
      type: Schema.Types.Mixed, // Stores the JointJS JSON
      default: null,
    },
    // Multi-select architecture types support
    architectureTypes: {
      type: [String],
      default: [],
      validate: {
        validator: function(v: string[]) {
          return v.length <= 10; // Max 10 architecture types
        },
        message: 'Maximum 10 architecture types allowed'
      }
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    questions: [
      {
        id: String,
        text: String,
        options: [String],
        correctAnswer: String,
        type: {
          type: String,
          default: "text",
        },
        codeSnippet: String,
        hint: String,
      },
    ],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
    },
    practiceTest: {
      enabled: {
        type: Boolean,
        default: false,
      },
      timeLimitMinutes: {
        type: Number,
        default: 30,
      },
      passingScorePercentage: {
        type: Number,
        default: 70,
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Prevent OverwriteModelError by checking if model already exists
export default mongoose.models.Lab || mongoose.model("Lab", LabSchema);
