/**
 * Shared Constants for WhatsnXT Platform
 *
 * This package contains all shared constants used across the application.
 * Using constants instead of string literals prevents typos, enables type checking,
 * and makes refactoring safer.
 */

import { StatusCodes } from 'http-status-codes';

// API Endpoints
export const API_ENDPOINTS = {
  // Lab Management
  LABS: '/api/v1/labs',
  LAB_BY_ID: (labId: string) => `/api/v1/labs/${labId}`,
  LAB_PUBLISH: (labId: string) => `/api/v1/labs/${labId}/publish`,

  // Lab Pages
  LAB_PAGES: (labId: string) => `/api/v1/labs/${labId}/pages`,
  LAB_PAGE_BY_ID: (labId: string, pageId: string) => `/api/v1/labs/${labId}/pages/${pageId}`,

  // Diagram Shapes
  DIAGRAM_SHAPES: '/api/v1/diagram-shapes',
} as const;

// Frontend Route Paths
export const ROUTE_PATHS = {
  // Lab Routes
  LABS_LIST: '/labs',
  LAB_CREATE: '/lab/create',
  LAB_DETAIL: (labId: string) => `/labs/${labId}`,
  LAB_EDIT: (labId: string) => `/lab/edit/${labId}`,

  // Lab Page Editor Routes
  LAB_PAGE_EDITOR: (labId: string, pageId: string) => `/labs/${labId}/pages/${pageId}`,

  // Authentication Routes
  LOGIN: '/login',
  REGISTER: '/register',
} as const;

// Lab Status
export const LAB_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

// Question Types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'Multiple Choice',
  TEXT: 'Text',
} as const;

// Diagram Shape Types
export const SHAPE_TYPES = {
  COMPUTE: 'compute',
  NETWORK: 'network',
  STORAGE: 'storage',
  DATABASE: 'database',
  SECURITY: 'security',
  ANALYTICS: 'analytics',
  INTEGRATION: 'integration',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LABS_PER_PAGE: 3,
  MAX_LIMIT: 100,
} as const;

// Validation
export const VALIDATION = {
  MIN_LAB_NAME_LENGTH: 3,
  MAX_LAB_NAME_LENGTH: 100,
  MIN_DESCRIPTION_LENGTH: 0,
  MAX_DESCRIPTION_LENGTH: 50000,
  MIN_QUESTION_TEXT_LENGTH: 5,
  MAX_QUESTION_TEXT_LENGTH: 1000,
  MIN_MCQ_OPTIONS: 2,
  MAX_MCQ_OPTIONS: 10,
  MIN_DIAGRAM_SHAPES: 1,
  MIN_DIAGRAM_PROMPT_LENGTH: 10,
  MAX_DIAGRAM_PROMPT_LENGTH: 2000,
} as const;

// HTTP Status Codes - Re-export from http-status-codes for convenience
export const HTTP_STATUS = {
  OK: StatusCodes.OK,
  CREATED: StatusCodes.CREATED,
  NO_CONTENT: StatusCodes.NO_CONTENT,
  BAD_REQUEST: StatusCodes.BAD_REQUEST,
  UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
  FORBIDDEN: StatusCodes.FORBIDDEN,
  NOT_FOUND: StatusCodes.NOT_FOUND,
  CONFLICT: StatusCodes.CONFLICT,
  INTERNAL_SERVER_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
} as const;

// Re-export StatusCodes for direct access to all status codes
export { StatusCodes } from 'http-status-codes';

// User Roles
export const USER_ROLES = {
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Lab Errors
  LAB_NOT_FOUND: 'Lab not found',
  LAB_NAME_REQUIRED: 'Lab name is required',
  LAB_TYPE_REQUIRED: 'Lab type is required',
  CANNOT_DELETE_PUBLISHED_LAB: 'Cannot delete a published lab',
  CANNOT_UPDATE_PUBLISHED_LAB: 'Cannot update a published lab',
  LAB_CREATION_FAILED: 'Failed to create lab and default page. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed - no changes were made.',
  TRANSACTION_ROLLBACK: 'Operation rolled back due to error',

  // Lab Page Errors
  PAGE_NOT_FOUND: 'Lab page not found',
  LAB_PAGE_NOT_FOUND: 'Lab page not found',
  AT_LEAST_ONE_TEST_REQUIRED: 'At least one test (question or diagram) is required',
  EMPTY_QUESTION_NOT_ALLOWED: 'Empty question is not allowed',
  EMPTY_DIAGRAM_NOT_ALLOWED: 'Empty diagram test is not allowed',
  DEFAULT_PAGE_CREATION_FAILED: 'Failed to create default page',

  // Question Errors
  QUESTION_TEXT_REQUIRED: 'Question text is required',
  MCQ_OPTIONS_REQUIRED: 'Multiple choice question must have at least 2 options',
  MCQ_OPTION_EMPTY: 'All MCQ options must have non-empty text',
  CORRECT_ANSWER_REQUIRED: 'Correct answer is required',

  // Instructor Errors
  INSTRUCTOR_ID_REQUIRED: 'Instructor ID is required',

  // Diagram Errors
  DIAGRAM_PROMPT_REQUIRED: 'Diagram test prompt is required',
  DIAGRAM_STATE_REQUIRED: 'Expected diagram state is required',
  AT_LEAST_ONE_SHAPE_REQUIRED: 'Diagram must contain at least one shape',

  // Authentication Errors
  AUTHENTICATION_REQUIRED: 'Authentication is required',
  INVALID_TOKEN: 'Invalid authentication token',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // General Errors
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  VALIDATION_FAILED: 'Validation failed',
  RESOURCE_NOT_FOUND: 'Resource not found',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LAB_CREATED: 'Lab created successfully',
  LAB_CREATED_REDIRECTING: 'Lab created successfully! Redirecting to page editor...',
  LAB_UPDATED: 'Lab updated successfully',
  LAB_DELETED: 'Lab deleted successfully',
  LAB_PUBLISHED: 'Lab published successfully',
  PAGE_CREATED: 'Page created successfully',
  PAGE_SAVED: 'Page saved successfully',
  DRAFT_SAVED: 'Draft saved successfully',
} as const;

// Content Plan Status (Auto Create Content Pipeline)
export const CONTENT_PLAN_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

// Content Plan Topic Status
export const CONTENT_PLAN_TOPIC_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PUBLISHED: 'published',
  ERROR: 'error',
  SKIPPED: 'skipped',
} as const;

// Content Plan Validation Constants
export const CONTENT_PLAN_VALIDATION = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 50000,
  MIN_TOPICS: 1,
  MAX_TOPICS: 20,
  MAX_RETRY_COUNT: 3,
  MAX_TOPICS_PER_RUN: 5,
  MAX_PLANS_PER_RUN: 10,
  RATE_LIMIT_COOLDOWN_HOURS: 24,
} as const;

// Lab-specific constants (feature 003-auto-page-creation)
export * from './lab.constants';
