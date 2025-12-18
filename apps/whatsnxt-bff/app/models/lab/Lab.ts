import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * Lab Model for Lab Diagram Tests Feature
 *
 * Represents a learning module containing one or more pages.
 * Labs can be in 'draft' or 'published' status.
 *
 * Key Fields:
 * - labType: Category of the lab (e.g., 'Cloud Computing', 'Networking')
 * - architectureType: Platform (e.g., 'AWS', 'Azure', 'GCP', 'Common', 'Hybrid')
 * - status: 'draft' or 'published'
 *
 * Indexes: instructorId, status, createdAt, architectureType
 */

export interface ILab extends Document {
  id: string; // UUID
  status: "draft" | "published";
  name: string;
  description?: string;
  labType: string;
  architectureType: string;
  instructorId: string; // UUID
  createdAt: Date;
  updatedAt: Date;
}

const LabSchema = new Schema<ILab>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Lab name is required"],
      trim: true,
      minlength: [3, "Lab name must be at least 3 characters"],
      maxlength: [100, "Lab name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    labType: {
      type: String,
      required: [true, "Lab type is required"],
      trim: true,
    },
    architectureType: {
      type: String,
      required: [true, "Architecture type is required"],
      trim: true,
    },
    instructorId: {
      type: String,
      required: [true, "Instructor ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Remove MongoDB's _id and __v from JSON output
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

// Indexes for performance
LabSchema.index({ instructorId: 1 });
LabSchema.index({ status: 1 });
LabSchema.index({ createdAt: -1 }); // For sorting by latest
LabSchema.index({ architectureType: 1 });
LabSchema.index({ instructorId: 1, status: 1 }); // Composite index for common queries

// Virtual for pages (relationship)
LabSchema.virtual("pages", {
  ref: "LabPage",
  localField: "id",
  foreignField: "labId",
});

// Pre-save middleware for validation
LabSchema.pre("save", function (next) {
  // Additional validation can be added here
  next();
});

// Static method to find by UUID
LabSchema.statics.findByUUID = function (uuid: string) {
  return this.findOne({ id: uuid });
};

// Static method to find drafts by instructor
LabSchema.statics.findDraftsByInstructor = function (
  instructorId: string,
  page: number = 1,
  limit: number = 3,
) {
  return this.find({ instructorId, status: "draft" })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to count drafts
LabSchema.statics.countDrafts = function (instructorId: string) {
  return this.countDocuments({ instructorId, status: "draft" });
};

export const LabModel =
  mongoose.models.LabDiagramTest ||
  mongoose.model<ILab>("LabDiagramTest", LabSchema, "lab_diagram_tests");

export default LabModel;
