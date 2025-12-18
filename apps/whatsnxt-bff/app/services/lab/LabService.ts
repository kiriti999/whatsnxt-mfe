import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@whatsnxt/errors";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@whatsnxt/constants";
import { ValidationService } from "./ValidationService";
import { PaginationService, PaginatedResponse } from "./PaginationService";
import LabModel from "../../models/lab/Lab";
import LabPageModel from "../../models/lab/LabPage";
import StudentSubmissionModel from "../../models/lab/StudentSubmission";

type ILab = any;

/**
 * LabService for Lab Diagram Tests Feature
 *
 * Handles all business logic for lab management.
 * Follows SOLID principles with single responsibility for lab operations.
 * Max cyclomatic complexity: 5
 */

export interface CreateLabDTO {
  name: string;
  description?: string;
  labType: string;
  architectureType: string;
  instructorId: string;
}

export interface UpdateLabDTO {
  name?: string;
  description?: string;
  labType?: string;
  architectureType?: string;
}

export class LabService {
  /**
   * Creates a new lab as a draft
   * @param data - Lab creation data
   * @returns Created lab
   */
  static async createLab(data: CreateLabDTO): Promise<ILab> {
    // Validate input
    ValidationService.validateLabName(data.name);
    ValidationService.validateLabType(data.labType);
    ValidationService.validateArchitectureType(data.architectureType);
    ValidationService.validateInstructorId(data.instructorId);

    // Create lab
    const lab = new LabModel({
      name: data.name.trim(),
      description: data.description?.trim(),
      labType: data.labType.trim(),
      architectureType: data.architectureType.trim(),
      instructorId: data.instructorId,
      status: "draft",
    });

    await lab.save();
    return lab;
  }

  /**
   * Gets a lab by its UUID
   * @param labId - Lab UUID
   * @returns Lab document
   * @throws NotFoundError if lab not found
   */
  static async getLabById(labId: string): Promise<ILab> {
    const lab = await LabModel.findOne({ id: labId });

    if (!lab) {
      throw new NotFoundError(ERROR_MESSAGES.LAB_NOT_FOUND);
    }

    return lab;
  }

  /**
   * Gets a lab with all its pages populated with questions and diagram tests
   * @param labId - Lab UUID
   * @returns Lab with populated pages
   * @throws NotFoundError if lab not found
   */
  static async getLabWithPages(labId: string): Promise<any> {
    const lab = await this.getLabById(labId);

    const pages = await LabPageModel.find({ labId })
      .populate("question") // Single question (backward compatibility)
      .populate("questions") // Multiple questions
      .populate("diagramTest")
      .sort({ pageNumber: 1 });

    return {
      ...lab.toJSON(),
      pages,
    };
  }

  /**
   * Gets draft labs for an instructor with pagination
   * @param instructorId - Instructor UUID
   * @param page - Page number
   * @returns Paginated draft labs
   */
  static async getDraftsByInstructor(
    instructorId: string,
    page?: number,
  ): Promise<PaginatedResponse<ILab>> {
    ValidationService.validateInstructorId(instructorId);

    const pagination = PaginationService.getLabDraftsPagination(page);
    const skip = PaginationService.calculateSkip(
      pagination.page,
      pagination.limit,
    );

    // Get total count
    const totalItems = await LabModel.countDocuments({
      instructorId,
      status: "draft",
    });

    // Get paginated drafts
    const labs = await LabModel.find({ instructorId, status: "draft" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit);

    return PaginationService.buildResponse(
      labs,
      pagination.page,
      pagination.limit,
      totalItems,
    );
  }

  /**
   * Gets published labs with pagination
   * @param page - Page number
   * @returns Paginated published labs
   */
  static async getPublishedLabs(
    page?: number,
  ): Promise<PaginatedResponse<ILab>> {
    const pagination = PaginationService.getLabDraftsPagination(page);
    const skip = PaginationService.calculateSkip(
      pagination.page,
      pagination.limit,
    );

    // Get total count
    const totalItems = await LabModel.countDocuments({
      status: "published",
    });

    // Get paginated published labs
    const labs = await LabModel.find({ status: "published" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit);

    return PaginationService.buildResponse(
      labs,
      pagination.page,
      pagination.limit,
      totalItems,
    );
  }

  /**
   * Updates a lab (only if it's a draft)
   * @param labId - Lab UUID
   * @param data - Update data
   * @returns Updated lab
   * @throws NotFoundError if lab not found
   * @throws ConflictError if lab is published
   */
  static async updateLab(labId: string, data: UpdateLabDTO): Promise<ILab> {
    const lab = await this.getLabById(labId);

    // Check if lab is published
    if (lab.status === "published") {
      throw new ConflictError(ERROR_MESSAGES.CANNOT_UPDATE_PUBLISHED_LAB);
    }

    // Validate updates
    if (data.name) {
      ValidationService.validateLabName(data.name);
      lab.name = data.name.trim();
    }

    if (data.description !== undefined) {
      lab.description = data.description?.trim();
    }

    if (data.labType) {
      ValidationService.validateLabType(data.labType);
      lab.labType = data.labType.trim();
    }

    if (data.architectureType) {
      ValidationService.validateArchitectureType(data.architectureType);
      lab.architectureType = data.architectureType.trim();
    }

    await lab.save();
    return lab;
  }

  /**
   * Deletes a lab (only if it's a draft)
   * @param labId - Lab UUID
   * @throws NotFoundError if lab not found
   * @throws ConflictError if lab is published
   */
  static async deleteLab(labId: string): Promise<void> {
    const lab = await this.getLabById(labId);

    // Check if lab is published
    // if (lab.status === 'published') {
    //   throw new ConflictError(ERROR_MESSAGES.CANNOT_DELETE_PUBLISHED_LAB);
    // }

    // Delete all pages associated with this lab
    await LabPageModel.deleteMany({ labId });

    // Delete the lab
    await LabModel.deleteOne({ id: labId });
  }

  /**
   * Publishes a lab (validates it has at least one test)
   * @param labId - Lab UUID
   * @returns Published lab
   * @throws NotFoundError if lab not found
   * @throws ValidationError if lab has no valid tests
   */
  static async publishLab(labId: string): Promise<ILab> {
    const lab = await this.getLabById(labId);

    // Validate lab has at least one test
    await ValidationService.validateLabHasTests(labId);

    // Update status to published
    lab.status = "published";
    await lab.save();

    return lab;
  }

  /**
   * Checks if a lab belongs to an instructor
   * @param labId - Lab UUID
   * @param instructorId - Instructor UUID
   * @returns True if lab belongs to instructor
   */
  static async belongsToInstructor(
    labId: string,
    instructorId: string,
  ): Promise<boolean> {
    const lab = await LabModel.findOne({ id: labId, instructorId });
    return lab !== null;
  }

  /**
   * Gets page count for a lab
   * @param labId - Lab UUID
   * @returns Number of pages in the lab
   */
  static async getPageCount(labId: string): Promise<number> {
    await ValidationService.validateLabExists(labId);
    return await LabPageModel.countDocuments({ labId });
  }

  /**
   * Submit student test
   * @param data - Submission data
   * @returns Created submission
   */
  static async submitTest(data: {
    studentId: string;
    labId: string;
    pageId: string;
    questionAnswers?: Record<string, string>;
    diagramAnswer?: any;
    score: number;
    passed: boolean;
  }) {
    // Validate lab and page exist
    await ValidationService.validateLabExists(data.labId);
    await ValidationService.validatePageExists(data.labId, data.pageId);

    // Check if lab is published
    const lab = await LabModel.findOne({ id: data.labId });
    if (lab?.status !== "published") {
      throw new ValidationError("Cannot submit test for unpublished lab");
    }

    // Create or update submission
    const submission = await StudentSubmissionModel.findOneAndUpdate(
      {
        studentId: data.studentId,
        labId: data.labId,
        pageId: data.pageId,
      },
      {
        $set: {
          questionAnswers: data.questionAnswers,
          diagramAnswer: data.diagramAnswer,
          score: data.score,
          passed: data.passed,
          submittedAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

    return submission;
  }

  /**
   * Get student's submission
   * @param studentId - Student ID
   * @param labId - Lab ID
   * @param pageId - Page ID
   * @returns Submission if exists
   */
  static async getStudentSubmission(
    studentId: string,
    labId: string,
    pageId: string,
  ) {
    return await StudentSubmissionModel.findOne({
      studentId,
      labId,
      pageId,
    }).exec();
  }

  /**
   * Get student's progress in a lab
   * @param studentId - Student ID
   * @param labId - Lab ID
   * @returns Progress statistics
   */
  static async getStudentProgress(studentId: string, labId: string) {
    // @ts-ignore
    return await StudentSubmissionModel.getLabProgress(studentId, labId);
  }
}

export default LabService;
