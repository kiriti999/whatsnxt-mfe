/**
 * Lab Models Index
 *
 * Central export point for all lab-related MongoDB models.
 * Import models from this file for consistency and easier refactoring.
 *
 * Usage:
 *   import { LabModel, LabPageModel, QuestionModel } from '../../models/lab';
 */

// Re-export all named exports from individual model files
export { LabModel, ILab } from "./Lab";
export { LabPageModel, ILabPage } from "./LabPage";
export { QuestionModel, IQuestion, IQuestionOption } from "./Question";
export {
  DiagramTestModel,
  IDiagramTest,
  IDiagramShape as IDiagramShapeInTest,
  IDiagramConnection,
  IExpectedDiagramState,
} from "./DiagramTest";
export { DiagramShapeModel, IDiagramShape } from "./DiagramShape";

// Also export defaults for those who prefer default imports
import LabModelDefault from "./Lab";
import LabPageModelDefault from "./LabPage";
import QuestionModelDefault from "./Question";
import DiagramTestModelDefault from "./DiagramTest";
import DiagramShapeModelDefault from "./DiagramShape";

export default {
  Lab: LabModelDefault,
  LabPage: LabPageModelDefault,
  Question: QuestionModelDefault,
  DiagramTest: DiagramTestModelDefault,
  DiagramShape: DiagramShapeModelDefault,
};
