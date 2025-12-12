/**
 * Lab API Client
 *
 * Real HTTP client for Lab Diagram Tests feature.
 * Connects to backend APIs at /api/v1/labs
 *
 * NO MOCK DATA - All requests go to real backend
 */

import http from '@whatsnxt/http-client';
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
  architectureType: string;
  instructorId: string;
}

export interface UpdateLabRequest {
  name?: string;
  description?: string;
  labType?: string;
  architectureType?: string;
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
}

/**
 * Lab API Client
 */
const labApi = {
  /**
   * Get draft labs for an instructor (paginated)
   * @param instructorId - Instructor UUID
   * @param page - Page number (default: 1)
   * @returns Paginated draft labs
   */
  getDraftLabs: (instructorId: string, page?: number) =>
    http.get<PaginatedResponse<Lab>>('/labs', {
      params: { instructorId, page },
    }),

  /**
   * Create a new lab as draft
   * @param data - Lab creation data
   * @returns Created lab
   */
  createLab: (data: CreateLabRequest) =>
    http.post<{ message: string; data: Lab }>('/labs', data),

  /**
   * Get a lab by ID with all pages
   * @param labId - Lab UUID
   * @returns Lab with populated pages
   */
  getLabById: (labId: string) =>
    http.get<{ data: Lab & { pages: LabPage[] } }>(`/labs/${labId}`),

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
  deleteLab: (labId: string) =>
    http.delete<{ message: string }>(`/labs/${labId}`),

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
  getLabPages: (labId: string) =>
    http.get<{ data: LabPage[] }>(`/labs/${labId}/pages`),

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
  ) =>
    http.put<{ message: string; data: LabPage }>(
      `/labs/${labId}/pages/${pageId}`,
      data
    ),

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
    http.post<{ message: string; data: Question }>(
      `/labs/${labId}/pages/${pageId}/question`,
      data
    ),

  /**
   * Delete a question from a lab page
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   */
  deleteQuestion: (labId: string, pageId: string) =>
    http.delete<{ message: string }>(`/labs/${labId}/pages/${pageId}/question`),

  /**
   * Save a diagram test for a lab page
   * Creates new or updates existing diagram test
   * @param labId - Lab UUID
   * @param pageId - Page UUID
   * @param data - Diagram test data
   * @returns Created/updated diagram test
   */
  saveDiagramTest: (
    labId: string,
    pageId: string,
    data: CreateDiagramTestRequest
  ) =>
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
    http.delete<{ message: string }>(
      `/labs/${labId}/pages/${pageId}/diagram-test`
    ),

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
};

export default labApi;
