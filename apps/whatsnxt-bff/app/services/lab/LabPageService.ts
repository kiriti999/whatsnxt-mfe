import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "@whatsnxt/errors";
import { ERROR_MESSAGES } from "@whatsnxt/constants";
import { ValidationService } from "./ValidationService";
import LabModel from "../../models/lab/Lab";
import LabPageModel from "../../models/lab/LabPage";
import QuestionModel from "../../models/lab/Question";
import DiagramTestModel from "../../models/lab/DiagramTest";
import {
  calculateSimilarity,
  findSimilarStrings,
} from "../../utils/stringSimilarity";

// Type definitions
type ILabPage = any;
type IQuestion = any;
type IDiagramTest = any;

/**
 * LabPageService for Lab Diagram Tests Feature
 *
 * Handles all business logic for lab page management.
 * Follows SOLID principles with single responsibility for page operations.
 * Max cyclomatic complexity: 5
 */

export interface CreateLabPageDTO {
  labId: string;
  pageNumber: number;
  hasQuestion: boolean;
  hasDiagramTest: boolean;
}

export interface UpdateLabPageDTO {
  hasQuestion?: boolean;
  hasDiagramTest?: boolean;
}

export interface QuestionOptionInput {
  text: string;
}

export interface CreateQuestionDTO {
  labPageId: string;
  type: "MCQ" | "True/False" | "Fill in the blank";
  questionText: string;
  options?: QuestionOptionInput[];
  correctAnswer: string;
}

export interface CreateDiagramTestDTO {
  labPageId: string;
  prompt: string;
  expectedDiagramState: any;
  architectureType: string;
}

export class LabPageService {
  /**
   * Creates a new lab page
   * @param data - Page creation data
   * @returns Created lab page
   * @throws ValidationError if validation fails
   */
  static async createLabPage(data: CreateLabPageDTO): Promise<ILabPage> {
    // Validate lab exists
    await ValidationService.validateLabExists(data.labId);

    // Note: Pages can be created empty and tests added later
    // No validation required for hasQuestion or hasDiagramTest at creation time

    // Check if page number already exists for this lab
    const existingPage = await LabPageModel.findOne({
      labId: data.labId,
      pageNumber: data.pageNumber,
    });

    if (existingPage) {
      throw new ConflictError(
        `Page ${data.pageNumber} already exists for this lab`,
      );
    }

    // Create page
    const page = new LabPageModel({
      labId: data.labId,
      pageNumber: data.pageNumber,
      hasQuestion: data.hasQuestion,
      hasDiagramTest: data.hasDiagramTest,
    });

    await page.save();
    return page;
  }

  /**
   * Gets a lab page by its UUID
   * @param labPageId - Lab page UUID
   * @returns Lab page document
   * @throws NotFoundError if page not found
   */
  static async getLabPageById(labPageId: string): Promise<ILabPage> {
    const page = await LabPageModel.findOne({ id: labPageId });

    if (!page) {
      throw new NotFoundError(ERROR_MESSAGES.LAB_PAGE_NOT_FOUND);
    }

    return page;
  }

  /**
   * Gets a lab page with populated questions and diagram test
   * @param labPageId - Lab page UUID
   * @returns Lab page with populated data
   */
  static async getLabPageWithTests(labPageId: string): Promise<any> {
    const page = await this.getLabPageById(labPageId);

    const questions = await QuestionModel.find({ labPageId })
      .sort({ createdAt: 1 })
      .limit(30);
    const diagramTest = await DiagramTestModel.findOne({ labPageId });

    return {
      ...page.toJSON(),
      questions,
      question: questions.length > 0 ? questions[0] : null, // For backward compatibility
      diagramTest,
    };
  }

  /**
   * Gets all pages for a lab
   * @param labId - Lab UUID
   * @returns Array of lab pages sorted by page number
   */
  static async getPagesByLabId(labId: string): Promise<ILabPage[]> {
    await ValidationService.validateLabExists(labId);

    const pages = await LabPageModel.find({ labId }).sort({ pageNumber: 1 });
    return pages;
  }

  /**
   * Updates a lab page (only for draft labs)
   * @param labPageId - Lab page UUID
   * @param data - Update data
   * @returns Updated lab page
   * @throws ConflictError if lab is published
   */
  static async updateLabPage(
    labPageId: string,
    data: UpdateLabPageDTO,
  ): Promise<ILabPage> {
    const page = await this.getLabPageById(labPageId);

    // Check if lab is published
    await this.ensureLabIsDraft(page.labId);

    // Note: Pages can be updated to have no tests (tests can be added/removed independently)
    // No validation required for hasQuestion or hasDiagramTest

    // Update page
    if (data.hasQuestion !== undefined) {
      page.hasQuestion = data.hasQuestion;
    }

    if (data.hasDiagramTest !== undefined) {
      page.hasDiagramTest = data.hasDiagramTest;
    }

    await page.save();
    return page;
  }

  /**
   * Deletes a lab page
   * For published labs, only allows deletion if page has no questions or diagram tests
   * @param labPageId - Lab page UUID
   * @throws ConflictError if lab is published and page has tests
   */
  static async deleteLabPage(labPageId: string): Promise<void> {
    const page = await this.getLabPageById(labPageId);

    // Get lab to check status
    const lab = await LabModel.findOne({ id: page.labId });
    if (!lab) {
      throw new NotFoundError(ERROR_MESSAGES.LAB_NOT_FOUND);
    }

    // For published labs, check if page has any tests
    if (lab.status === "published") {
      const questionCount = await QuestionModel.countDocuments({ labPageId });
      const diagramTest = await DiagramTestModel.findOne({ labPageId });

      if (questionCount > 0 || diagramTest) {
        throw new ConflictError(
          "Cannot delete page with questions or diagram tests from a published lab",
        );
      }
    }

    // Delete associated questions and diagram test
    await QuestionModel.deleteMany({ labPageId });
    await DiagramTestModel.deleteOne({ labPageId });

    // Delete page
    await LabPageModel.deleteOne({ id: labPageId });
  }

  /**
   * Creates or updates a question for a lab page
   * Supports up to 30 questions per page
   * @param data - Question data
   * @returns Created/updated question
   */
  static async saveQuestion(
    data: CreateQuestionDTO & { questionId?: string },
  ): Promise<IQuestion> {
    const page = await this.getLabPageById(data.labPageId);

    // Ensure lab is draft
    await this.ensureLabIsDraft(page.labId);

    // Validate question data
    ValidationService.validateQuestionText(data.questionText);

    if (data.type === "MCQ" && data.options) {
      ValidationService.validateMCQOptions(data.options);
    }

    // Check similarity: question text must not be too similar (>= 85%) to existing questions in the lab
    const allQuestionsInLab = await QuestionModel.find({
      labId: page.labId,
      ...(data.questionId && { id: { $ne: data.questionId } }), // Exclude current question when updating
    }).select("id questionText");

    console.log(
      `Checking similarity against ${allQuestionsInLab.length} existing questions in lab`,
    );

    // Extract just the question texts for comparison
    const existingQuestionTexts = allQuestionsInLab.map((q) => q.questionText);

    // Find similar questions using fuzzy matching (85% threshold)
    const similarQuestions = findSimilarStrings(
      data.questionText.trim(),
      existingQuestionTexts,
      85,
    );

    if (similarQuestions.length > 0) {
      const mostSimilar = similarQuestions[0];
      throw new ConflictError(
        `This question is ${mostSimilar.similarity.toFixed(1)}% similar to an existing question: "${mostSimilar.text.substring(0, 100)}${mostSimilar.text.length > 100 ? "..." : ""}". Questions must be less than 85% similar.`,
      );
    }

    let question;

    if (data.questionId) {
      // Update existing question by ID
      console.log(`Updating existing question: ${data.questionId}`);
      question = await QuestionModel.findOne({
        id: data.questionId,
        labPageId: data.labPageId,
      });

      if (!question) {
        console.error(
          `Question not found: ${data.questionId} for page: ${data.labPageId}`,
        );
        throw new NotFoundError("Question not found");
      }

      question.type = data.type;
      question.questionText = data.questionText.trim();
      question.options = data.options as any; // Model will auto-generate IDs
      question.correctAnswer = data.correctAnswer.trim();
      await question.save();
      console.log(`Question updated successfully: ${question.id}`);
    } else {
      // Check question count limit
      const questionCount = await QuestionModel.countDocuments({
        labPageId: data.labPageId,
      });
      console.log(
        `Current question count for page ${data.labPageId}: ${questionCount}`,
      );

      if (questionCount >= 30) {
        throw new ConflictError("Maximum 30 questions allowed per page");
      }

      // Create new question
      console.log(`Creating new question for page: ${data.labPageId}`);
      question = new QuestionModel({
        labId: page.labId,
        labPageId: data.labPageId,
        type: data.type,
        questionText: data.questionText.trim(),
        options: data.options as any, // Model will auto-generate IDs
        correctAnswer: data.correctAnswer.trim(),
      });

      try {
        await question.save();
        console.log(`New question created successfully: ${question.id}`);
      } catch (saveError) {
        console.error("Error saving new question:", saveError);
        throw saveError;
      }

      // Update page to mark hasQuestion as true
      if (!page.hasQuestion) {
        page.hasQuestion = true;
        await page.save();
      }
    }

    return question;
  }

  /**
   * Creates or updates a diagram test for a lab page
   * @param data - Diagram test data
   * @returns Created/updated diagram test
   */
  static async saveDiagramTest(
    data: CreateDiagramTestDTO,
  ): Promise<IDiagramTest> {
    const page = await this.getLabPageById(data.labPageId);

    // Ensure lab is draft
    await this.ensureLabIsDraft(page.labId);

    // Validate diagram test data
    ValidationService.validateDiagramPrompt(data.prompt);
    ValidationService.validateDiagramState(data.expectedDiagramState);
    ValidationService.validateArchitectureType(data.architectureType);

    // Check if diagram test already exists
    let diagramTest = await DiagramTestModel.findOne({
      labPageId: data.labPageId,
    });

    if (diagramTest) {
      // Update existing diagram test
      diagramTest.prompt = data.prompt.trim();
      diagramTest.expectedDiagramState = data.expectedDiagramState;
      diagramTest.architectureType = data.architectureType.trim();
      await diagramTest.save();
    } else {
      // Create new diagram test
      diagramTest = new DiagramTestModel({
        labPageId: data.labPageId,
        prompt: data.prompt.trim(),
        expectedDiagramState: data.expectedDiagramState,
        architectureType: data.architectureType.trim(),
      });
      await diagramTest.save();

      // Update page to mark hasDiagramTest as true
      page.hasDiagramTest = true;
      await page.save();
    }

    return diagramTest;
  }

  /**
   * Deletes a question from a lab page
   * @param labPageId - Lab page UUID
   * @param questionId - Optional question ID to delete specific question
   */
  static async deleteQuestion(
    labPageId: string,
    questionId?: string,
  ): Promise<void> {
    const page = await this.getLabPageById(labPageId);

    // Note: Allow deletion from published labs
    // await this.ensureLabIsDraft(page.labId);

    if (questionId) {
      // Delete specific question
      const result = await QuestionModel.deleteOne({
        id: questionId,
        labPageId,
      });

      if (result.deletedCount === 0) {
        throw new NotFoundError("Question not found");
      }
    } else {
      // Delete all questions for the page
      await QuestionModel.deleteMany({ labPageId });
    }

    // Check if any questions remain
    const remainingQuestions = await QuestionModel.countDocuments({
      labPageId,
    });

    // Update page hasQuestion flag
    if (remainingQuestions === 0) {
      page.hasQuestion = false;
      await page.save();
    }
  }

  /**
   * Deletes a diagram test from a lab page
   * @param labPageId - Lab page UUID
   */
  static async deleteDiagramTest(labPageId: string): Promise<void> {
    const page = await this.getLabPageById(labPageId);

    // Note: Allow deletion from published labs
    // await this.ensureLabIsDraft(page.labId);

    // Delete diagram test
    await DiagramTestModel.deleteOne({ labPageId });

    // Update page
    page.hasDiagramTest = false;
    await page.save();
  }

  /**
   * Helper method to ensure a lab is in draft status
   * @param labId - Lab UUID
   * @throws ConflictError if lab is published
   */
  private static async ensureLabIsDraft(labId: string): Promise<void> {
    const lab = await LabModel.findOne({ id: labId });

    if (!lab) {
      throw new NotFoundError(ERROR_MESSAGES.LAB_NOT_FOUND);
    }

    if (lab.status === "published") {
      throw new ConflictError(ERROR_MESSAGES.CANNOT_UPDATE_PUBLISHED_LAB);
    }
  }

  /**
   * Gets the next page number for a lab
   * @param labId - Lab UUID
   * @returns Next available page number
   */
  static async getNextPageNumber(labId: string): Promise<number> {
    await ValidationService.validateLabExists(labId);

    const lastPage = await LabPageModel.findOne({ labId }).sort({
      pageNumber: -1,
    });

    return lastPage ? lastPage.pageNumber + 1 : 1;
  }
}

export default LabPageService;
