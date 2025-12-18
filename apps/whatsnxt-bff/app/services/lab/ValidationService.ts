import { ValidationError } from "@whatsnxt/errors";
import { ERROR_MESSAGES, VALIDATION } from "@whatsnxt/constants";
import LabModel from "../../models/lab/Lab";
import LabPageModel from "../../models/lab/LabPage";
import QuestionModel from "../../models/lab/Question";
import DiagramTestModel from "../../models/lab/DiagramTest";

/**
 * ValidationService for Lab Diagram Tests Feature
 *
 * Handles all validation logic for labs, pages, questions, and diagram tests.
 * Follows SOLID principles with single responsibility for validation.
 * Max cyclomatic complexity: 5
 */

export class ValidationService {
  /**
   * Validates lab name
   * @param name - Lab name to validate
   * @throws ValidationError if invalid
   */
  static validateLabName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.LAB_NAME_REQUIRED);
    }

    if (name.trim().length < VALIDATION.MIN_LAB_NAME_LENGTH) {
      throw new ValidationError(
        `Lab name must be at least ${VALIDATION.MIN_LAB_NAME_LENGTH} characters`,
      );
    }

    if (name.length > VALIDATION.MAX_LAB_NAME_LENGTH) {
      throw new ValidationError(
        `Lab name cannot exceed ${VALIDATION.MAX_LAB_NAME_LENGTH} characters`,
      );
    }
  }

  /**
   * Validates lab type
   * @param labType - Lab type to validate
   * @throws ValidationError if invalid
   */
  static validateLabType(labType: string): void {
    if (!labType || labType.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.LAB_TYPE_REQUIRED);
    }
  }

  /**
   * Validates architecture type
   * @param architectureType - Architecture type to validate
   * @throws ValidationError if invalid
   */
  static validateArchitectureType(architectureType: string): void {
    if (!architectureType || architectureType.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.ARCHITECTURE_TYPE_REQUIRED);
    }
  }

  /**
   * Validates instructor ID
   * @param instructorId - Instructor ID to validate
   * @throws ValidationError if invalid
   */
  static validateInstructorId(instructorId: string): void {
    if (!instructorId || instructorId.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.INSTRUCTOR_ID_REQUIRED);
    }
  }

  /**
   * Validates question text
   * @param questionText - Question text to validate
   * @throws ValidationError if invalid
   */
  static validateQuestionText(questionText: string): void {
    if (!questionText || questionText.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.QUESTION_TEXT_REQUIRED);
    }

    if (questionText.trim().length < VALIDATION.MIN_QUESTION_TEXT_LENGTH) {
      throw new ValidationError(
        `Question text must be at least ${VALIDATION.MIN_QUESTION_TEXT_LENGTH} characters`,
      );
    }
  }

  /**
   * Validates MCQ options
   * @param options - Array of options to validate
   * @throws ValidationError if invalid
   */
  static validateMCQOptions(options: any[]): void {
    if (!options || options.length < VALIDATION.MIN_MCQ_OPTIONS) {
      throw new ValidationError(
        `MCQ must have at least ${VALIDATION.MIN_MCQ_OPTIONS} options`,
      );
    }

    const hasEmptyOption = options.some(
      (opt) => !opt.text || opt.text.trim().length === 0,
    );
    if (hasEmptyOption) {
      throw new ValidationError(ERROR_MESSAGES.MCQ_OPTION_EMPTY);
    }
  }

  /**
   * Validates diagram test prompt
   * @param prompt - Prompt to validate
   * @throws ValidationError if invalid
   */
  static validateDiagramPrompt(prompt: string): void {
    if (!prompt || prompt.trim().length === 0) {
      throw new ValidationError(ERROR_MESSAGES.DIAGRAM_PROMPT_REQUIRED);
    }

    if (prompt.trim().length < VALIDATION.MIN_DIAGRAM_PROMPT_LENGTH) {
      throw new ValidationError(
        `Diagram prompt must be at least ${VALIDATION.MIN_DIAGRAM_PROMPT_LENGTH} characters`,
      );
    }
  }

  /**
   * Validates expected diagram state structure
   * @param expectedDiagramState - Diagram state to validate
   * @throws ValidationError if invalid structure
   * Note: Empty diagrams (0 shapes) are now allowed for instructor flexibility
   */
  static validateDiagramState(expectedDiagramState: any): void {
    if (!expectedDiagramState || !expectedDiagramState.shapes) {
      throw new ValidationError("Diagram state must have a shapes array");
    }

    // Empty diagrams are now allowed - instructors can save placeholder tests
    // They can add shapes later during editing
  }

  /**
   * Validates that a lab has at least one test before publishing
   * @param labId - Lab ID to validate
   * @throws ValidationError if lab has no tests
   */
  static async validateLabHasTests(labId: string): Promise<void> {
    const pages = await LabPageModel.find({ labId });

    if (pages.length === 0) {
      throw new ValidationError(ERROR_MESSAGES.AT_LEAST_ONE_TEST_REQUIRED);
    }

    // Check if at least one page has a valid test
    const hasValidTest = await this.checkPagesHaveValidTests(pages);

    if (!hasValidTest) {
      throw new ValidationError(ERROR_MESSAGES.AT_LEAST_ONE_TEST_REQUIRED);
    }
  }

  /**
   * Helper method to check if pages have valid tests
   * @param pages - Array of lab pages
   * @returns True if at least one page has a valid test
   */
  private static async checkPagesHaveValidTests(
    pages: any[],
  ): Promise<boolean> {
    for (const page of pages) {
      const hasValidQuestion = await this.pageHasValidQuestion(page);
      const hasValidDiagram = await this.pageHasValidDiagram(page);

      if (hasValidQuestion || hasValidDiagram) {
        return true;
      }
    }
    return false;
  }

  /**
   * Helper method to check if page has a valid question
   * @param page - Lab page to check
   * @returns True if page has valid question
   */
  private static async pageHasValidQuestion(page: any): Promise<boolean> {
    if (!page.hasQuestion) {
      return false;
    }

    const question = await QuestionModel.findOne({ labPageId: page.id });
    return question !== null;
  }

  /**
   * Helper method to check if page has a valid diagram test
   * @param page - Lab page to check
   * @returns True if page has valid diagram test
   */
  private static async pageHasValidDiagram(page: any): Promise<boolean> {
    if (!page.hasDiagramTest) {
      return false;
    }

    const diagramTest = await DiagramTestModel.findOne({ labPageId: page.id });
    return diagramTest !== null;
  }

  /**
   * Note: validatePageHasTestType was removed - pages can be created empty
   * and tests can be added later. Validation only happens at lab publish time.
   */

  /**
   * Validates lab exists
   * @param labId - Lab ID to check
   * @throws ValidationError if lab not found
   */
  static async validateLabExists(labId: string): Promise<void> {
    const lab = await LabModel.findOne({ id: labId });
    if (!lab) {
      throw new ValidationError(ERROR_MESSAGES.LAB_NOT_FOUND);
    }
  }

  /**
   * Validates lab page exists
   * @param labPageId - Lab page ID to check
   * @throws ValidationError if lab page not found
   */
  static async validateLabPageExists(labPageId: string): Promise<void> {
    const labPage = await LabPageModel.findOne({ id: labPageId });
    if (!labPage) {
      throw new ValidationError(ERROR_MESSAGES.LAB_PAGE_NOT_FOUND);
    }
  }

  /**
   * Validates page exists for a specific lab
   * @param labId - Lab ID
   * @param pageId - Page ID to check
   * @throws ValidationError if page not found or doesn't belong to lab
   */
  static async validatePageExists(
    labId: string,
    pageId: string,
  ): Promise<void> {
    const page = await LabPageModel.findOne({ id: pageId, labId });
    if (!page) {
      throw new ValidationError("Page not found in this lab");
    }
  }
}

export default ValidationService;
