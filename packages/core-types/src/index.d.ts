// packages/core-types/src/index.d.ts

// Base interface for entities with common fields
export interface BaseEntity {
  id: string; // Representing UUID as string
  createdAt: Date;
  updatedAt: Date;
}

export interface Lab extends BaseEntity {
  status: 'draft' | 'published';
  name: string;
  description?: string;
  labType: string; // Category/type of the lab (e.g., 'Cloud Computing', 'Networking', 'Security')
  architectureType: string; // Architecture platform (e.g., 'AWS', 'Azure', 'GCP', 'Common', 'Hybrid')
  instructorId: string; // Assuming Instructor entity has a UUID
  associatedCourses?: string[]; // Course IDs that include this lab
  pricing?: any;
  defaultPageId?: string; // Optional: ID of auto-created default page (present only in creation response)
}

export interface LabPage extends BaseEntity {
  labId: string;
  pageNumber: number;
  hasQuestion: boolean;
  hasDiagramTest: boolean;
  question?: Question; // Optional: can be embedded or linked
  diagramTest?: DiagramTest; // Optional: can be embedded or linked
}

export type QuestionType = 'Multiple Choice' | 'Text';

export interface Question extends BaseEntity {
  labPageId: string;
  type: QuestionType;
  questionText: string;
  options?: string[]; // For Multiple Choice
  correctAnswer?: string | string[]; // For Text or Multiple Choice
}

export interface DiagramTest extends BaseEntity {
  labPageId: string;
  prompt: string;
  expectedDiagramState: Record<string, any>; // JSON representation
  architectureType: string; // e.g., 'AWS', 'Azure', 'GCP', 'Common'
}

export interface DiagramShape extends BaseEntity {
  name: string;
  type: string; // e.g., 'compute', 'network', 'storage'
  architectureType: string; // e.g., 'AWS', 'Azure', 'GCP', 'Common'
  svgPath: string; // SVG path data
  metadata: Record<string, any>; // Additional properties
}

// Paginated API Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// API Request Types
export interface CreateLabRequest {
  name: string;
  description?: string;
  labType: string;
  architectureType: string;
  instructorId: string;
  associatedCourses?: string[];
}

export interface UpdateLabRequest {
  name?: string;
  description?: string;
  labType?: string;
  architectureType?: string;
  associatedCourses?: string[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}
