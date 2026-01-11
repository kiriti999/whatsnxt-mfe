// API response type definitions for page editor pagination feature
// Feature: 004-page-editor-pagination

/**
 * Question type for API responses
 */
export interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options: string;
  correctAnswer: string;
}

/**
 * Page API response structure
 * Returned by GET /api/v1/labs/:labId/pages/:pageId
 */
export interface PageResponse {
  id: string;
  labId: string;
  pageNumber: number;
  questions: Question[];
  totalPages: number; // CRITICAL: Total number of pages in the lab (for pagination)
  createdAt: string;
  updatedAt: string;
}

/**
 * Page summary for lab page list
 */
export interface PageSummary {
  id: string;
  pageNumber: number;
  questionCount: number;
}

/**
 * Lab API response structure
 * Returned by GET /api/v1/labs/:labId
 */
export interface LabResponse {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  totalPages: number;
  pages: PageSummary[];
  createdAt: string;
  updatedAt: string;
}

/**
 * API error response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
