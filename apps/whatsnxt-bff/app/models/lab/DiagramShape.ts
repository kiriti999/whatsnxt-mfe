import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * DiagramShape Model for Lab Diagram Tests Feature
 *
 * Represents a reusable diagram shape in the shape library.
 * Shapes are isolated by architecture type (AWS, Azure, GCP, Common, Hybrid).
 * Common shapes are available across all architectures.
 *
 * Validation Rules:
 * - name is required and unique within architectureType
 * - type is required (e.g., 'compute', 'storage', 'network', 'database')
 * - architectureType is required
 * - Either svgPath or svgContent must be provided
 *
 * Indexes: architectureType, type, name
 */

export interface IDiagramShape extends Document {
  id: string; // UUID
  name: string;
  type: string; // Category: compute, storage, network, database, etc.
  architectureType: string; // AWS, Azure, GCP, Common, Hybrid
  isCommon: boolean; // If true, available across all architectures
  svgPath?: string; // Path to SVG file
  svgContent?: string; // Inline SVG content
  width?: number; // Default width
  height?: number; // Default height
  metadata?: Record<string, any>; // Additional properties (color, icon, etc.)
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiagramShapeSchema = new Schema<IDiagramShape>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Shape name is required"],
      trim: true,
      minlength: [2, "Shape name must be at least 2 characters"],
      maxlength: [100, "Shape name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Shape type is required"],
      trim: true,
      lowercase: true,
    },
    architectureType: {
      type: String,
      required: [true, "Architecture type is required"],
      trim: true,
    },
    isCommon: {
      type: Boolean,
      default: false,
    },
    svgPath: {
      type: String,
      trim: true,
    },
    svgContent: {
      type: String,
    },
    width: {
      type: Number,
      min: [10, "Width must be at least 10 pixels"],
      max: [1000, "Width cannot exceed 1000 pixels"],
    },
    height: {
      type: Number,
      min: [10, "Height must be at least 10 pixels"],
      max: [1000, "Height cannot exceed 1000 pixels"],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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

// Indexes for efficient queries
DiagramShapeSchema.index({ architectureType: 1 });
DiagramShapeSchema.index({ type: 1 });
DiagramShapeSchema.index({ isCommon: 1 });
DiagramShapeSchema.index({ architectureType: 1, type: 1 }); // Compound index
DiagramShapeSchema.index({ name: 1, architectureType: 1 }, { unique: true }); // Unique shape name per architecture

// Pre-save validation: ensure either svgPath or svgContent is provided
DiagramShapeSchema.pre("save", function (next) {
  if (!this.svgPath && !this.svgContent) {
    return next(new Error("Either svgPath or svgContent must be provided"));
  }

  // If marked as common, architectureType should be 'Common'
  if (this.isCommon && this.architectureType !== "Common") {
    return next(
      new Error('Common shapes must have architectureType set to "Common"'),
    );
  }

  next();
});

// Pre-update validation
DiagramShapeSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update.$set) {
    const svgPath = update.$set.svgPath;
    const svgContent = update.$set.svgContent;

    // Check if both are being unset
    if (svgPath === null && svgContent === null) {
      return next(new Error("Either svgPath or svgContent must be provided"));
    }

    // Validate common shape constraint
    const isCommon = update.$set.isCommon;
    const architectureType = update.$set.architectureType;

    if (
      isCommon === true &&
      architectureType &&
      architectureType !== "Common"
    ) {
      return next(
        new Error('Common shapes must have architectureType set to "Common"'),
      );
    }
  }

  next();
});

// Static method to find by UUID
DiagramShapeSchema.statics.findByUUID = function (uuid: string) {
  return this.findOne({ id: uuid });
};

// Static method to find shapes by architecture type
DiagramShapeSchema.statics.findByArchitectureType = function (
  architectureType: string,
) {
  return this.find({
    $or: [{ architectureType }, { isCommon: true }],
  }).sort({ type: 1, name: 1 });
};

// Static method to find shapes by type
DiagramShapeSchema.statics.findByType = function (type: string) {
  return this.find({ type }).sort({ name: 1 });
};

// Static method to find shapes by architecture and type
DiagramShapeSchema.statics.findByArchitectureAndType = function (
  architectureType: string,
  type: string,
) {
  return this.find({
    $or: [{ architectureType }, { isCommon: true }],
    type,
  }).sort({ name: 1 });
};

// Static method to get all common shapes
DiagramShapeSchema.statics.findCommonShapes = function () {
  return this.find({ isCommon: true }).sort({ type: 1, name: 1 });
};

export const DiagramShapeModel =
  mongoose.models.DiagramShape ||
  mongoose.model<IDiagramShape>(
    "DiagramShape",
    DiagramShapeSchema,
    "diagram_shapes",
  );

export default DiagramShapeModel;
