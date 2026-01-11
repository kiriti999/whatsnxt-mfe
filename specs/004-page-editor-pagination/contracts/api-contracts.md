# API Contracts: Show Pagination in Page Editor

**Feature**: 004-page-editor-pagination  
**Date**: 2025-01-17  
**Phase**: 1 - Design & Contracts

## Overview

This feature requires **NO new API endpoints**. It uses existing lab and page APIs to retrieve page data and counts. This document specifies the expected request/response contracts for the existing endpoints used by pagination functionality.

---

## Existing Endpoints Used

### 1. GET /labs/:labId/pages/:pageId

**Description**: Fetch page data for a specific page in a lab (existing endpoint, no changes).

**HTTP Method**: GET

**URL Pattern**: `/api/v1/labs/{labId}/pages/{pageId}`

**Path Parameters**:
- `labId` (string, required): UUID of the lab
- `pageId` (string, required): UUID of the page

**Query Parameters**: None

**Request Headers**:
- `Authorization: Bearer <token>` (required if authentication enabled)
- `Content-Type: application/json`

**Request Body**: None (GET request)

**Success Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "labId": "123e4567-e89b-12d3-a456-426614174000",
  "pageNumber": 2,
  "questions": [
    {
      "id": "q1-uuid",
      "questionText": "What is React?",
      "type": "MCQ",
      "options": "Library,Framework,Language,Tool",
      "correctAnswer": "Library"
    }
  ],
  "totalPages": 5,
  "createdAt": "2025-01-17T10:00:00Z",
  "updatedAt": "2025-01-17T10:00:00Z"
}
```

**Response Fields**:
- `id` (string, UUID): Page ID
- `labId` (string, UUID): Parent lab ID
- `pageNumber` (number, integer): Current page number (1-based)
- `questions` (array): Array of question objects on this page
- `totalPages` (number, integer): **REQUIRED** - Total number of pages in the lab (used by pagination)
- `createdAt` (string, ISO 8601): Page creation timestamp
- `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses**:

- **404 Not Found** (Page does not exist):
```json
{
  "error": "PageNotFound",
  "message": "Page with ID 550e8400-e29b-41d4-a716-446655440000 not found",
  "statusCode": 404
}
```

- **403 Forbidden** (User lacks permission):
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this page",
  "statusCode": 403
}
```

- **500 Internal Server Error** (Database error):
```json
{
  "error": "InternalServerError",
  "message": "An error occurred while fetching page data",
  "statusCode": 500
}
```

**Expected Performance**:
- Response time: <200ms (p95)
- Used by pagination to fetch page content and total page count

**Pagination Usage**:
- Called on initial page load to get `totalPages`
- Called on every page navigation to fetch new page content
- `totalPages` field is critical for rendering pagination controls

---

### 2. GET /labs/:labId (Optional, if totalPages not in page response)

**Description**: Fetch lab metadata including total page count (fallback if page endpoint doesn't include `totalPages`).

**HTTP Method**: GET

**URL Pattern**: `/api/v1/labs/{labId}`

**Path Parameters**:
- `labId` (string, required): UUID of the lab

**Query Parameters**: None

**Request Headers**:
- `Authorization: Bearer <token>` (required if authentication enabled)
- `Content-Type: application/json`

**Request Body**: None (GET request)

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Introduction to React",
  "description": "Learn React fundamentals",
  "status": "draft",
  "totalPages": 5,
  "pages": [
    {
      "id": "page1-uuid",
      "pageNumber": 1,
      "questionCount": 3
    },
    {
      "id": "page2-uuid",
      "pageNumber": 2,
      "questionCount": 2
    }
  ],
  "createdAt": "2025-01-17T09:00:00Z",
  "updatedAt": "2025-01-17T10:00:00Z"
}
```

**Response Fields**:
- `id` (string, UUID): Lab ID
- `title` (string): Lab title
- `description` (string): Lab description
- `status` (enum): 'draft' | 'published'
- `totalPages` (number, integer): **REQUIRED** - Total number of pages in the lab
- `pages` (array): Summary of all pages in the lab (with IDs and page numbers)
- `createdAt` (string, ISO 8601): Lab creation timestamp
- `updatedAt` (string, ISO 8601): Last update timestamp

**Error Responses**:

- **404 Not Found** (Lab does not exist):
```json
{
  "error": "LabNotFound",
  "message": "Lab with ID 123e4567-e89b-12d3-a456-426614174000 not found",
  "statusCode": 404
}
```

**Expected Performance**:
- Response time: <300ms (p95)
- Used by pagination only if page endpoint doesn't include `totalPages`

**Pagination Usage**:
- Called once on component mount to get total page count and page ID mappings
- Used to build `PageMapping` (page number → page ID) for quick navigation
- `pages` array enables direct mapping of page numbers to page IDs without additional API calls

---

### 3. Page Number to Page ID Mapping Strategy

**Problem**: User clicks page number (e.g., "3"), but API requires page ID (UUID) for navigation.

**Solution Option A** (Preferred if lab endpoint returns page list):
1. Fetch lab metadata once: `GET /labs/:labId`
2. Extract `pages` array: `[{id: "uuid-1", pageNumber: 1}, {id: "uuid-2", pageNumber: 2}, ...]`
3. Build in-memory map: `Map(1 => "uuid-1", 2 => "uuid-2", ...)`
4. On page number click, lookup page ID in map
5. Navigate to `/labs/:labId/pages/{pageId}`

**Solution Option B** (If lab endpoint doesn't return page list):
1. Fetch first page: `GET /labs/:labId/pages/:currentPageId`
2. Extract `totalPages` from response
3. Assume sequential page numbering (no gaps)
4. Calculate page ID or fetch page ID via separate endpoint
5. **Backend requirement**: Add endpoint `GET /labs/:labId/pages?number=2` to resolve page number to ID

**Recommended**: Use Option A if possible. If not feasible, backend must add page number query endpoint.

---

## Client-Side Type Definitions

### Location: `apps/web/types/api.ts` (or existing API types file)

```typescript
// Page API response type
export interface PageResponse {
  id: string;
  labId: string;
  pageNumber: number;
  questions: Question[];
  totalPages: number; // CRITICAL: Must be included by backend
  createdAt: string;
  updatedAt: string;
}

// Lab API response type (for page mapping)
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

// Page summary within lab response
export interface PageSummary {
  id: string;
  pageNumber: number;
  questionCount: number;
}

// Question type (existing, reused)
export interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options: string;
  correctAnswer: string;
}

// API error response type
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
```

---

## HTTP Client Usage

### Required: Use `@whatsnxt/http-client` workspace package

**Constitution Requirement VI**: "All HTTP communication MUST use the axios client from the `@whatsnxt/http-client` workspace package."

**Implementation**:
```typescript
import { httpClient } from '@whatsnxt/http-client';

// Fetch page data
const fetchPageData = async (labId: string, pageId: string): Promise<PageResponse> => {
  const response = await httpClient.get<PageResponse>(`/api/v1/labs/${labId}/pages/${pageId}`);
  return response.data;
};

// Fetch lab metadata (for page mapping)
const fetchLabData = async (labId: string): Promise<LabResponse> => {
  const response = await httpClient.get<LabResponse>(`/api/v1/labs/${labId}`);
  return response.data;
};
```

**Error Handling** (using `@whatsnxt/errors`):
```typescript
import { ApiError } from '@whatsnxt/errors';
import { notifications } from '@mantine/notifications';

try {
  const pageData = await fetchPageData(labId, pageId);
  // Use pageData
} catch (error) {
  if (error instanceof ApiError) {
    notifications.show({
      title: 'Navigation Error',
      message: error.message || 'Unable to load page. Please try again.',
      color: 'red',
    });
  } else {
    throw error; // Re-throw unexpected errors
  }
}
```

---

## Backend Requirements (If Not Already Met)

### Required Backend Changes (Conditional)

**If page endpoint (`GET /labs/:labId/pages/:pageId`) does NOT include `totalPages` field**:
1. **Modify page response** to include `totalPages` (count of pages in parent lab)
2. **Rationale**: Avoids additional API call to lab endpoint just to get page count
3. **Implementation**: Add SQL query to count pages where `labId = :labId`

**If lab endpoint does NOT include `pages` array with page IDs**:
1. **Add `pages` field** to lab response with page summaries `[{id, pageNumber, questionCount}]`
2. **Rationale**: Enables client-side page number to page ID mapping without additional queries
3. **Alternative**: Add new endpoint `GET /labs/:labId/pages?number=2` to resolve page number to ID

**If neither change is feasible**:
- Client must fetch all pages individually or use sequential ID assumptions (brittle)

---

## OpenAPI Specification (JSON Format)

**Constitution Requirement VII**: "OpenAPI specifications MUST be in JSON format (not YAML)."

**Location**: `specs/004-page-editor-pagination/contracts/openapi.json`

*Note: Since this feature uses existing endpoints without modification, a full OpenAPI spec is not generated. If backend changes are needed (to add `totalPages` field), refer to existing API documentation and update accordingly.*

**Example snippet** (if generating full spec):
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Lab Page API",
    "version": "1.0.0"
  },
  "paths": {
    "/api/v1/labs/{labId}/pages/{pageId}": {
      "get": {
        "summary": "Get page by ID",
        "parameters": [
          {"name": "labId", "in": "path", "required": true, "schema": {"type": "string"}},
          {"name": "pageId", "in": "path", "required": true, "schema": {"type": "string"}}
        ],
        "responses": {
          "200": {
            "description": "Page data",
            "content": {
              "application/json": {
                "schema": {"$ref": "#/components/schemas/PageResponse"}
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "PageResponse": {
        "type": "object",
        "properties": {
          "id": {"type": "string"},
          "labId": {"type": "string"},
          "pageNumber": {"type": "integer"},
          "totalPages": {"type": "integer"},
          "questions": {"type": "array", "items": {"$ref": "#/components/schemas/Question"}}
        },
        "required": ["id", "labId", "pageNumber", "totalPages", "questions"]
      }
    }
  }
}
```

---

## Summary

- **No new API endpoints required**
- **Uses existing**: `GET /labs/:labId/pages/:pageId` and optionally `GET /labs/:labId`
- **Critical requirement**: Page response must include `totalPages` field (verify with backend team)
- **Mapping strategy**: Use lab endpoint to build page number → page ID map
- **HTTP client**: Must use `@whatsnxt/http-client` (constitution requirement)
- **Error handling**: Must use `@whatsnxt/errors` (constitution requirement)
- **Type safety**: All API responses typed via TypeScript interfaces
