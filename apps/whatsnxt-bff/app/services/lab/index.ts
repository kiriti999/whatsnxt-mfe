/**
 * Lab Services Index
 *
 * Central export point for all lab-related services.
 * Import services from this file for consistency and easier refactoring.
 *
 * Usage:
 *   import { LabService, LabPageService, ValidationService } from '@/services/lab';
 */

export { ValidationService } from "./ValidationService";
export {
  PaginationService,
  type PaginationParams,
  type PaginationMetadata,
  type PaginatedResponse,
} from "./PaginationService";
export { LabService, type CreateLabDTO, type UpdateLabDTO } from "./LabService";
export {
  LabPageService,
  type CreateLabPageDTO,
  type UpdateLabPageDTO,
  type CreateQuestionDTO,
  type CreateDiagramTestDTO,
} from "./LabPageService";

// Re-export default services as named exports for convenience
import ValidationService from "./ValidationService";
import PaginationService from "./PaginationService";
import LabService from "./LabService";
import LabPageService from "./LabPageService";

export default {
  Validation: ValidationService,
  Pagination: PaginationService,
  Lab: LabService,
  LabPage: LabPageService,
};
