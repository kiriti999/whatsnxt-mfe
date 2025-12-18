import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * DiagramTest Model for Lab Diagram Tests Feature
 *
 * Represents a diagram-based test within a lab page.
 * Contains the prompt (instructions) and expected diagram state for validation.
 *
 * Validation Rules:
 * - prompt is required and non-empty
 * - expectedDiagramState is required and must contain at least one shape
 * - architectureType is required (shapes are isolated by architecture)
 *
 * Indexes: labPageId, architectureType
 */

export interface IDiagramShape {
  shapeId: string; // Reference to DiagramShape id
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface IDiagramConnection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string;
  type?: string; // e.g., 'line', 'arrow', 'dashed'
  label?: string;
  metadata?: Record<string, any>;
}

export interface IExpectedDiagramState {
  shapes: IDiagramShape[];
  connections?: IDiagramConnection[];
  metadata?: Record<string, any>;
}

export interface IDiagramTest extends Document {
  id: string; // UUID
  labPageId: string; // UUID reference to LabPage
  prompt: string;
  expectedDiagramState: IExpectedDiagramState;
  architectureType: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiagramShapeSchema = new Schema(
  {
    shapeId: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    rotation: {
      type: Number,
      default: 0,
    },
    label: String,
    metadata: Schema.Types.Mixed,
  },
  { _id: false },
);

const DiagramConnectionSchema = new Schema(
  {
    id: {
      type: String,
      default: () => uuidv4(),
    },
    sourceShapeId: {
      type: String,
      required: true,
    },
    targetShapeId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: "arrow",
    },
    label: String,
    metadata: Schema.Types.Mixed,
  },
  { _id: false },
);

const ExpectedDiagramStateSchema = new Schema(
  {
    shapes: {
      type: [DiagramShapeSchema],
      required: true,
      validate: {
        validator: function (shapes: IDiagramShape[]) {
          return shapes && shapes.length > 0;
        },
        message: "Expected diagram state must contain at least one shape",
      },
    },
    connections: [DiagramConnectionSchema],
    metadata: Schema.Types.Mixed,
  },
  { _id: false },
);

const DiagramTestSchema = new Schema<IDiagramTest>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      required: true,
    },
    labPageId: {
      type: String,
      required: [true, "Lab Page ID is required"],
      index: true,
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      trim: true,
      minlength: [10, "Prompt must be at least 10 characters"],
      maxlength: [2000, "Prompt cannot exceed 2000 characters"],
    },
    expectedDiagramState: {
      type: ExpectedDiagramStateSchema,
      required: [true, "Expected diagram state is required"],
    },
    architectureType: {
      type: String,
      required: [true, "Architecture type is required"],
      trim: true,
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
DiagramTestSchema.index({ labPageId: 1 });
DiagramTestSchema.index({ architectureType: 1 });
DiagramTestSchema.index({ labPageId: 1, architectureType: 1 }); // Compound index

// Pre-save validation: ensure at least one shape in expected diagram state
DiagramTestSchema.pre("save", function (next) {
  if (
    !this.expectedDiagramState ||
    !this.expectedDiagramState.shapes ||
    this.expectedDiagramState.shapes.length === 0
  ) {
    return next(
      new Error("Expected diagram state must contain at least one shape"),
    );
  }

  // Validate all shapeIds are non-empty
  const hasInvalidShape = this.expectedDiagramState.shapes.some(
    (shape) => !shape.shapeId || shape.shapeId.trim() === "",
  );
  if (hasInvalidShape) {
    return next(new Error("All shapes must have a valid shapeId"));
  }

  // If connections exist, validate source and target shape IDs
  if (
    this.expectedDiagramState.connections &&
    this.expectedDiagramState.connections.length > 0
  ) {
    const shapeIds = this.expectedDiagramState.shapes.map(
      (shape) => shape.shapeId,
    );

    for (const connection of this.expectedDiagramState.connections) {
      if (!shapeIds.includes(connection.sourceShapeId)) {
        return next(
          new Error(
            `Connection source shape "${connection.sourceShapeId}" does not exist`,
          ),
        );
      }
      if (!shapeIds.includes(connection.targetShapeId)) {
        return next(
          new Error(
            `Connection target shape "${connection.targetShapeId}" does not exist`,
          ),
        );
      }
    }
  }

  next();
});

// Pre-update validation
DiagramTestSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update.$set && update.$set.expectedDiagramState) {
    const state = update.$set.expectedDiagramState;

    if (!state.shapes || state.shapes.length === 0) {
      return next(
        new Error("Expected diagram state must contain at least one shape"),
      );
    }
  }

  next();
});

// Static method to find by UUID
DiagramTestSchema.statics.findByUUID = function (uuid: string) {
  return this.findOne({ id: uuid });
};

// Static method to find by lab page ID
DiagramTestSchema.statics.findByLabPageId = function (labPageId: string) {
  return this.findOne({ labPageId });
};

// Static method to find by architecture type
DiagramTestSchema.statics.findByArchitectureType = function (
  architectureType: string,
) {
  return this.find({ architectureType });
};

// Static method to delete by lab page ID
DiagramTestSchema.statics.deleteByLabPageId = function (labPageId: string) {
  return this.deleteOne({ labPageId });
};

export const DiagramTestModel =
  mongoose.models.DiagramTest ||
  mongoose.model<IDiagramTest>(
    "DiagramTest",
    DiagramTestSchema,
    "diagram_tests",
  );

export default DiagramTestModel;
