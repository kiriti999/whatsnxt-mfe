/**
 * Lab API Client
 *
 * Real HTTP client for Lab Diagram Tests feature.
 * Connects to backend APIs at /api/v1/labs
 *
 * NO MOCK DATA - All requests go to real backend
 */

import { HttpClient } from '@whatsnxt/http-client';

const http = new HttpClient(process.env.NEXT_PUBLIC_BFF_HOST_LAB_API);

import type {
  Lab,
  LabPage,
  Question,
  DiagramTest,
  DiagramShape,
  PaginatedResponse,
} from '@whatsnxt/core-types';

/**
 * Request DTOs
 */
export interface CreateLabRequest {
  name: string;
  description?: string;
  labType: string;
  subCategory?: string;
  nestedSubCategory?: string;
  architectureType?: string;
  instructorId: string;
  pricing?: any;
  associatedCourses?: string[];
}

export interface UpdateLabRequest {
  name?: string;
  description?: string;
  labType?: string;
  subCategory?: string;
  nestedSubCategory?: string;
  architectureType?: string;
  pricing?: any;
  associatedCourses?: string[];
}

export interface CreateLabPageRequest {
  pageNumber?: number;
  hasQuestion?: boolean;
  hasDiagramTest?: boolean;
}

export interface CreateQuestionRequest {
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  questionText: string;
  options?: Array<{ text: string }>;
  correctAnswer: string;
  questionId?: string; // For updates
}

export interface CreateDiagramTestRequest {
  prompt: string;
  expectedDiagramState: {
    shapes: Array<{
      shapeId: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      rotation?: number;
      label?: string;
      metadata?: Record<string, any>;
    }>;
    connections?: Array<{
      id: string;
      sourceShapeId: string;
      targetShapeId: string;
      type?: string;
      label?: string;
      metadata?: Record<string, any>;
    }>;
    metadata?: Record<string, any>;
  };
  architectureType: string;
  additionalSubCatArchTypes?: string[]; // Additional L2 sub-category shape libraries (max 5)
  additionalNestedArchTypes?: string[]; // Additional L3 topic shape libraries (max 5)
  hints?: string[]; // Optional array of hint texts (max 5, each max 500 chars)
}

/**
 * Lab API Client
 */
const labApi = {
  /**
   * Get draft labs for an instructor (paginated)
   * @param instructorId - Instructor UUID
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 10)
   * @returns Paginated draft labs
   */
  getDraftLabs: (instructorId: string, page?: number, perPage?: number) =>
    http.get<PaginatedResponse<Lab>>('/labs', {
      params: { instructorId, page, perPage, status: 'draft' },
    }),

  /**
   * Get published labs (paginated)
   * @param page - Page number (default: 1)
   * @param perPage - Items per page (default: 10)
   * @returns Paginated published labs
   */
  getPublishedLabs: (page?: number, perPage?: number) =>
    http.get<PaginatedResponse<Lab>>('/labs', {
      params: { page, perPage, status: 'published' },
    }),

  /**
   * Get all labs for an instructor (for course association)
   * @param instructorId - Instructor UUID
   * @returns All labs owned by the instructor
   */
  getLabsByInstructor: (instructorId: string) =>
    http.get<{ data: Lab[] }>('/labs', {
      params: { instructorId, perPage: 1000 }, // Get all labs
    }),

  /**
   * Create a new lab as draft
   * @param data - Lab creation data
   * @returns Created lab
   */
  createLab: (data: CreateLabRequest) => http.post<{ message: string; data: Lab }>('/labs', data),

  /**
   * Get a lab by ID with all pages
   * @param labId - Lab UUID
   * @returns Lab with populated pages
   */
  getLabById: (labId: string) => http.get<{ data: Lab & { pages: LabPage[] } }>(`/labs/${labId}`),

  /**
   * Update a draft lab
   * Cannot update published labs
   * @param labId - Lab UUID
   * @param data - Update data
   * @returns Updated lab
   */
  updateLab: (labId: string, data: UpdateLabRequest) =>
    http.put<{ message: string; data: Lab }>(`/labs/${labId}`, data),

  /**
   * Delete a draft lab
   * Cannot delete published labs
   * @param labId - Lab UUID
   */
  deleteLab: (labId: string) => http.delete<{ message: string }>(`/labs/${labId}`),

  /**
   * Publish a lab
   * Validates that lab has at least one valid test
   * @param labId - Lab UUID
   * @returns Published lab
   */
  publishLab: (labId: string) =>
    http.post<{ message: string; data: Lab }>(`/labs/${labId}/publish`, {}),

  /**
   * Get all pages for a lab
   * @param labId - Lab UUID
   * @returns Array of lab pages
   */
  getLabPages: (labId: string) => http.get<{ data: LabPage[] }>(`/labs/${labId}/pages`),

  /**
   * Create a new lab page
   * @param labId - Lab UUID
   * @param data - Page creation data
   * @returns Created page
   */
  createLabPage: (labId: string, data: CreateLabPageRequest) =>
    http.post<{ message: string; data: LabPage }>(`/labs/${labId}/pages`, data),

  /**
   * Get a specific lab page with populated tests
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @returns Lab page with question and diagram test
   */
  getLabPageById: (labId: string, pageId: string) =>
    http.get<{
      data: LabPage & { question?: Question; diagramTest?: DiagramTest };
    }>(`/labs/${labId}/pages/${pageId}`),

  /**
   * Update a lab page
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @param data - Update data
   * @returns Updated page
   */
  updateLabPage: (
    labId: string,
    pageId: string,
    data: { hasQuestion?: boolean; hasDiagramTest?: boolean }
  ) => http.put<{ message: string; data: LabPage }>(`/labs/${labId}/pages/${pageId}`, data),

  /**
   * Delete a lab page
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   */
  deleteLabPage: (labId: string, pageId: string) =>
    http.delete<{ message: string }>(`/labs/${labId}/pages/${pageId}`),

  /**
   * Save a question for a lab page
   * Creates new or updates existing question
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @param data - Question data
   * @returns Created/updated question
   */
  saveQuestion: (labId: string, pageId: string, data: CreateQuestionRequest) =>
    http.post<{ message: string; data: Question }>(`/labs/${labId}/pages/${pageId}/question`, data),

  /**
   * Delete a question from a lab page
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @param questionId - Optional question UUID to delete specific question
   */
  deleteQuestion: (labId: string, pageId: string, questionId?: string) =>
    http.delete<{ message: string }>(
      questionId
        ? `/labs/${labId}/pages/${pageId}/question/${questionId}`
        : `/labs/${labId}/pages/${pageId}/question`
    ),

  /**
   * Save a diagram test for a lab page
   * Creates new or updates existing diagram test
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @param data - Diagram test data
   * @returns Created/updated diagram test
   */
  saveDiagramTest: (labId: string, pageId: string, data: CreateDiagramTestRequest) =>
    http.post<{ message: string; data: DiagramTest }>(
      `/labs/${labId}/pages/${pageId}/diagram-test`,
      data
    ),

  /**
   * Delete a diagram test from a lab page
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   */
  deleteDiagramTest: (labId: string, pageId: string) =>
    http.delete<{ message: string }>(`/labs/${labId}/pages/${pageId}/diagram-test`),

  /**
   * Get diagram shapes
   * Optionally filter by architecture type
   * @param architectureType - Optional architecture filter (AWS, Azure, GCP, Common, Hybrid)
   * @returns Array of diagram shapes
   */
  getDiagramShapes: (architectureType?: string) =>
    http.get<{ data: DiagramShape[] }>('/diagram-shapes', {
      params: architectureType ? { architectureType } : undefined,
    }),

  /**
   * Submit student test (questions and/or diagram)
   * @param labId - Lab ID
   * @param pageId - Page ID
   * @param submission - Student submission data
   * @returns Submission result with score
   */
  submitTest: (
    labId: string,
    pageId: string,
    submission: {
      studentId: string;
      questionAnswers?: Record<string, string>;
      diagramAnswer?: any;
      score: number;
      passed: boolean;
    }
  ) =>
    http.post<{ message: string; submissionId: string; score: number; passed: boolean }>(
      `/labs/${labId}/pages/${pageId}/submit`,
      submission
    ),

  /**
   * Get student's previous submission
   * @param labId - Lab ID
   * @param pageId - Page ID
   * @param studentId - Student ID
   * @returns Previous submission if exists
   */
  getSubmission: (labId: string, pageId: string, studentId: string) =>
    http.get<{ data: any }>(`/labs/${labId}/pages/${pageId}/submit?studentId=${studentId}`),

  /**
   * Get student's progress in a lab
   * @param labId - Lab ID
   * @param studentId - Student ID
   * @returns Progress statistics (totalPages, passedPages, percentage)
   */
  getStudentProgress: (labId: string, studentId: string) =>
    http.get<{ data: { totalPages: number; passedPages: number; percentage: number } }>(
      `/labs/${labId}/progress?studentId=${studentId}`
    ),

  /**
   * Clone a published lab to an editable draft version
   * Deep copies all pages, questions, and diagram tests
   * @param labId - Lab UUID (must be published)
   * @returns Cloned draft lab
   * @throws 403 if not lab owner
   * @throws 404 if lab not found
   * @throws 409 if draft clone already exists
   */
  cloneLab: (labId: string) =>
    http.post<{ success: boolean; data: { lab: Lab } }>(`/labs/${labId}/clone`, {}),

  /**
   * Republish a draft clone back to the original published lab
   * Replaces original lab content atomically with draft content
   * @param labId - Lab UUID (must be a draft clone)
   * @returns Updated original published lab
   * @throws 400 if lab is not a clone (clonedFromLabId missing)
   * @throws 403 if not lab owner
   * @throws 404 if lab or original not found
   */
  republishLab: (labId: string) =>
    http.post<{ success: boolean; data: { lab: Lab } }>(`/labs/${labId}/republish`, {}),

  /**
   * Get all lab categories (IT categories for lab type selection)
   * @returns Array of categories with subcategories
   */
  getCategories: () =>
    http.get<{ categories: Array<{ categoryName: string; subcategories: Array<{ name: string; subcategories?: Array<{ name: string }> }> }> }>('/labs/categories'),
};

export default labApi;
