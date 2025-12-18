/**
 * Student Submission Model
 * Stores student test submissions and scores
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IStudentSubmission extends Document {
  studentId: string; // User ID (can be ObjectId string or UUID)
  labId: string; // Lab UUID
  pageId: string; // Page UUID
  questionAnswers?: Record<string, string>;
  diagramAnswer?: {
    nodes: any[];
    links: any[];
  };
  score: number;
  passed: boolean;
  submittedAt: Date;
  timeSpentSeconds?: number;
}

const StudentSubmissionSchema = new Schema<IStudentSubmission>(
  {
    studentId: {
      type: String,
      ref: "users",
      required: true,
      index: true,
    },
    labId: {
      type: String,
      ref: "labs",
      required: true,
      index: true,
    },
    pageId: {
      type: String,
      ref: "labPages",
      required: true,
      index: true,
    },
    questionAnswers: {
      type: Map,
      of: String,
      required: false,
    },
    diagramAnswer: {
      type: {
        nodes: [Schema.Types.Mixed],
        links: [Schema.Types.Mixed],
      },
      required: false,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    passed: {
      type: Boolean,
      required: true,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeSpentSeconds: {
      type: Number,
      required: false,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "studentSubmissions",
  },
);

// Compound indexes for common queries
StudentSubmissionSchema.index({ studentId: 1, labId: 1, pageId: 1 });
StudentSubmissionSchema.index({ labId: 1, pageId: 1, passed: 1 });
StudentSubmissionSchema.index({ studentId: 1, passed: 1 });

// Static method to find student's submission
StudentSubmissionSchema.statics.findByStudent = function (
  studentId: string,
  labId: string,
  pageId: string,
) {
  return this.findOne({ studentId, labId, pageId })
    .sort({ submittedAt: -1 })
    .exec();
};

// Static method to get student's progress in a lab
StudentSubmissionSchema.statics.getLabProgress = async function (
  studentId: string,
  labId: string,
) {
  const submissions = await this.find({ studentId, labId }).exec();
  const totalPages = submissions.length;
  const passedPages = submissions.filter((s) => s.passed).length;

  return {
    totalPages,
    passedPages,
    percentage:
      totalPages > 0 ? Math.round((passedPages / totalPages) * 100) : 0,
  };
};

export default mongoose.models.studentSubmissions ||
  mongoose.model<IStudentSubmission>(
    "studentSubmissions",
    StudentSubmissionSchema,
  );
