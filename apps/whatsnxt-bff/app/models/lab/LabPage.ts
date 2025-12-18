import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * LabPage Model for Lab Diagram Tests Feature
 *
 * Represents a step or page within a lab.
 * Can contain multiple questions (max 30), a diagram test, both, or neither (empty page).
 *
 * Validation Rules:
 * - Pages can be created empty (hasQuestion: false, hasDiagramTest: false)
 * - Tests can be added later via LabPageService.saveQuestion() or saveDiagramTest()
 * - Each page supports up to 30 questions
 * - Lab publishing validates that at least one page has a test
 *
 * Indexes: labId, pageNumber
 */

export interface ILabPage extends Document {
  id: string; // UUID
  labId: string; // UUID reference to Lab
  pageNumber: number;
  hasQuestion: boolean;
  hasDiagramTest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LabPageSchema = new Schema<ILabPage>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    labId: {
      type: String,
      required: [true, "Lab ID is required"],
      index: true,
    },
    pageNumber: {
      type: Number,
      required: [true, "Page number is required"],
      min: [1, "Page number must be at least 1"],
    },
    hasQuestion: {
      type: Boolean,
      default: false,
    },
    hasDiagramTest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Compound index for efficient queries
LabPageSchema.index({ labId: 1, pageNumber: 1 }, { unique: true });

// Virtual for questions (relationship) - supports up to 30 questions
LabPageSchema.virtual("questions", {
  ref: "Question",
  localField: "id",
  foreignField: "labPageId",
  justOne: false,
});

// Virtual for question (backward compatibility - returns first question)
LabPageSchema.virtual("question", {
  ref: "Question",
  localField: "id",
  foreignField: "labPageId",
  justOne: true,
});

// Virtual for diagramTest (relationship)
LabPageSchema.virtual("diagramTest", {
  ref: "DiagramTest",
  localField: "id",
  foreignField: "labPageId",
  justOne: true,
});

// Note: Pre-save validation removed - pages can be created empty
// Tests can be added later via saveQuestion() or saveDiagramTest()
// Validation only happens at lab publish time (LabService.publishLab)

// Static method to find by UUID
LabPageSchema.statics.findByUUID = function (uuid: string) {
  return this.findOne({ id: uuid });
};

// Static method to find pages by lab
LabPageSchema.statics.findByLabId = function (labId: string) {
  return this.find({ labId }).sort({ pageNumber: 1 });
};

// Static method to get page count for a lab
LabPageSchema.statics.countByLabId = function (labId: string) {
  return this.countDocuments({ labId });
};

export const LabPageModel =
  mongoose.models.LabPage ||
  mongoose.model<ILabPage>("LabPage", LabPageSchema, "lab_pages");

export default LabPageModel;
