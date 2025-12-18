import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

/**
 * Question Model for Lab Diagram Tests Feature
 *
 * Represents a question within a lab page.
 * Supports multiple question types: MCQ, True/False, Fill in the blank.
 *
 * Validation Rules:
 * - questionText is required and non-empty (10-1000 characters)
 * - questionText must be unique per lab using fuzzy matching (< 85% similarity)
 * - Similarity is calculated using Levenshtein distance algorithm
 * - type must be one of: MCQ, True/False, Fill in the blank
 * - For MCQ: options array must have at least 2 items
 * - For True/False: options must be exactly ['True', 'False']
 * - correctAnswer is required
 * - For MCQ/True/False: correctAnswer must be one of the options
 *
 * Indexes: labId, labPageId
 * Note: No unique index on questionText to allow fuzzy matching validation
 */

export interface IQuestionOption {
  id: string;
  text: string;
}

export interface IQuestion extends Document {
  id: string; // UUID
  labId: string; // UUID reference to Lab (for uniqueness validation)
  labPageId: string; // UUID reference to LabPage
  type: "MCQ" | "True/False" | "Fill in the blank";
  questionText: string;
  options?: IQuestionOption[]; // For MCQ and True/False
  correctAnswer: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
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
    labPageId: {
      type: String,
      required: [true, "Lab Page ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: {
        values: ["MCQ", "True/False", "Fill in the blank"],
        message: "Type must be MCQ, True/False, or Fill in the blank",
      },
      required: [true, "Question type is required"],
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [5, "Question text must be at least 5 characters"],
      maxlength: [1000, "Question text cannot exceed 1000 characters"],
    },
    options: [
      {
        id: {
          type: String,
          default: () => uuidv4(),
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, "Correct answer is required"],
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

// Index for efficient queries
QuestionSchema.index({ labPageId: 1 });
QuestionSchema.index({ labId: 1 });

// Pre-save validation: validate options based on type
QuestionSchema.pre("save", function (next) {
  // Validate MCQ has at least 2 options
  if (this.type === "MCQ") {
    if (!this.options || this.options.length < 2) {
      return next(new Error("MCQ questions must have at least 2 options"));
    }
    // Validate correctAnswer is one of the options
    const optionTexts = this.options.map((opt) => opt.text);
    if (!optionTexts.includes(this.correctAnswer)) {
      return next(
        new Error("Correct answer must be one of the provided options"),
      );
    }
  }

  // Validate True/False has exactly 2 options
  if (this.type === "True/False") {
    if (!this.options || this.options.length !== 2) {
      return next(
        new Error("True/False questions must have exactly 2 options"),
      );
    }
    const optionTexts = this.options.map((opt) => opt.text).sort();
    const expectedOptions = ["False", "True"];
    if (JSON.stringify(optionTexts) !== JSON.stringify(expectedOptions)) {
      return next(
        new Error(
          'True/False questions must have "True" and "False" as options',
        ),
      );
    }
    // Validate correctAnswer is either True or False
    if (!["True", "False"].includes(this.correctAnswer)) {
      return next(new Error('Correct answer must be either "True" or "False"'));
    }
  }

  // Validate Fill in the blank has no options
  if (this.type === "Fill in the blank") {
    if (this.options && this.options.length > 0) {
      return next(
        new Error("Fill in the blank questions should not have options"),
      );
    }
  }

  next();
});

// Pre-update validation
QuestionSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  if (update.$set) {
    const type = update.$set.type;
    const options = update.$set.options;
    const correctAnswer = update.$set.correctAnswer;

    // If type is being updated, validate accordingly
    if (type === "MCQ" && options) {
      if (options.length < 2) {
        return next(new Error("MCQ questions must have at least 2 options"));
      }
    }

    if (type === "True/False" && options) {
      if (options.length !== 2) {
        return next(
          new Error("True/False questions must have exactly 2 options"),
        );
      }
    }

    if (type === "Fill in the blank" && options && options.length > 0) {
      return next(
        new Error("Fill in the blank questions should not have options"),
      );
    }
  }

  next();
});

// Static method to find by UUID
QuestionSchema.statics.findByUUID = function (uuid: string) {
  return this.findOne({ id: uuid });
};

// Static method to find all questions by lab page ID
QuestionSchema.statics.findByLabPageId = function (labPageId: string) {
  return this.find({ labPageId }).sort({ createdAt: 1 }).limit(30);
};

// Static method to find all questions by lab ID
QuestionSchema.statics.findByLabId = function (labId: string) {
  return this.find({ labId }).sort({ createdAt: 1 });
};

// Static method to count questions by lab page ID
QuestionSchema.statics.countByLabPageId = function (labPageId: string) {
  return this.countDocuments({ labPageId });
};

// Static method to check if question text exists in lab
QuestionSchema.statics.existsInLab = function (
  labId: string,
  questionText: string,
  excludeQuestionId?: string,
) {
  const query: any = { labId, questionText: questionText.trim() };
  if (excludeQuestionId) {
    query.id = { $ne: excludeQuestionId };
  }
  return this.findOne(query);
};

// Static method to find all questions in a lab (for similarity checking)
QuestionSchema.statics.findAllInLab = function (
  labId: string,
  excludeQuestionId?: string,
) {
  const query: any = { labId };
  if (excludeQuestionId) {
    query.id = { $ne: excludeQuestionId };
  }
  return this.find(query).select("id questionText");
};

// Static method to delete by lab page ID
QuestionSchema.statics.deleteByLabPageId = function (labPageId: string) {
  return this.deleteMany({ labPageId });
};

export const QuestionModel =
  mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema, "questions");

export default QuestionModel;
