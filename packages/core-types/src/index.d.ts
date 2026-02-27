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
  subCategory?: string; // Sub-category within the lab type
  nestedSubCategory?: string; // Nested sub-category (topic)
  instructorId: string; // Assuming Instructor entity has a UUID
  associatedCourses?: string[]; // Course IDs that include this lab
  pricing?: any;
  defaultPageId?: string; // Optional: ID of auto-created default page (present only in creation response)
}

export interface LearningLink {
  title: string;
  url: string;
  type: 'internal' | 'external';
}

export interface LabPage extends BaseEntity {
  labId: string;
  pageNumber: number;
  hasQuestion: boolean;
  hasDiagramTest: boolean;
  hasLearningMaterial: boolean;
  learningContent?: string;
  learningVideoUrl?: string;
  learningLinks?: LearningLink[];
  learningDiagramState?: string; // JSON string of {nodes, links} for architectural diagram
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
  isPreview?: boolean; // Whether this question is available as a free preview
}

export interface DiagramTest extends BaseEntity {
  labPageId: string;
  prompt: string;
  expectedDiagramState: Record<string, any>; // JSON representation
  additionalSubCatArchTypes?: string[]; // Additional L2 sub-category shape libraries (max 5)
  additionalNestedArchTypes?: string[]; // Additional L3 topic shape libraries (max 5)
  hints?: string[]; // Optional array of hint texts (max 5, each max 500 chars)
  isPreview?: boolean; // Whether this diagram test is available as a free preview
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
  subCategory?: string;
  nestedSubCategory?: string;
  instructorId: string;
  associatedCourses?: string[];
}

export interface UpdateLabRequest {
  name?: string;
  description?: string;
  labType?: string;
  subCategory?: string;
  nestedSubCategory?: string;
  associatedCourses?: string[];
}

// Validation Error
export interface ValidationError {
  field: string;
  message: string;
}
