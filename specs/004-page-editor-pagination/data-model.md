# Data Model: Show Pagination in Page Editor

**Feature**: 004-page-editor-pagination  
**Date**: 2025-01-17  
**Phase**: 1 - Design & Contracts

## Overview

This feature introduces **no new database entities or backend models**. It operates exclusively on existing entities (Lab, Page) and adds client-side UI state for pagination controls. All data is derived from existing API responses.

## Existing Entities (No Changes)

### Lab

**Description**: Parent container for pages and questions, identified by unique ID.

**Attributes**:
- `id` (string, UUID): Unique identifier for the lab
- `title` (string): Lab name/title
- `status` (enum: 'draft' | 'published'): Lab publication status
- `pages` (relation): One-to-many relationship with Page entity

**Relationships**:
- **Has many** Pages (1:N)
- **Belongs to** User (instructor)

**Validation Rules** (existing, not modified):
- Lab ID must be valid UUID
- Status must be 'draft' or 'published'

**Source**: Backend model at `apps/whatsnxt-bff/app/models/` (existing)

---

### Page

**Description**: Individual page within a lab, contains questions and has sequential numbering.

**Attributes**:
- `id` (string, UUID): Unique identifier for the page
- `labId` (string, UUID): Foreign key to parent Lab
- `pageNumber` (number, integer): Sequential page number (1-based indexing)
- `questions` (relation): One-to-many relationship with Question entity

**Relationships**:
- **Belongs to** Lab (N:1)
- **Has many** Questions (1:N)

**Validation Rules** (existing, not modified):
- Page ID must be valid UUID
- Lab ID must reference existing lab
- Page number must be positive integer
- Page numbers within a lab must be sequential (no gaps after deletion)

**Source**: Backend model at `apps/whatsnxt-bff/app/models/` (existing)

---

### Question

**Description**: Individual question within a page (not directly used by pagination, but provides context for page creation).

**Attributes**:
- `id` (string, UUID): Unique identifier for the question
- `pageId` (string, UUID): Foreign key to parent Page
- `questionText` (string): Question content
- `type` (enum): 'MCQ' | 'True/False' | 'Fill in the blank'
- `options` (string): Comma-separated options for MCQ
- `correctAnswer` (string): Correct answer value

**Relationships**:
- **Belongs to** Page (N:1)

**Source**: Backend model at `apps/whatsnxt-bff/app/models/` (existing)

---

## New Client-Side State (UI Only, Not Persisted)

### PaginationState (TypeScript Interface)

**Description**: Client-side state for pagination UI, derived from URL and API responses.

**Attributes**:
```typescript
interface PaginationState {
  currentPageNumber: number;    // Current page number (1-based)
  totalPages: number;            // Total number of pages in the lab
  currentPageId: string;         // UUID of current page
  labId: string;                 // UUID of parent lab
  isNavigating: boolean;         // Loading state during navigation
}
```

**Derivation Logic**:
- `currentPageNumber`: Derived from mapping `currentPageId` to page number (via API response or local cache)
- `totalPages`: Retrieved from API response (existing endpoint returns page count)
- `currentPageId`: Extracted from URL path parameter (`/labs/[id]/pages/[pageId]`)
- `labId`: Extracted from URL path parameter (`/labs/[id]/pages/[pageId]`)
- `isNavigating`: Managed by component state during `router.push()` calls

**Lifecycle**:
- **Initialization**: On component mount, extract IDs from URL, fetch page data and count
- **Updates**: On page navigation, update via `router.push()` and re-fetch page data
- **Destruction**: State cleared on component unmount (no persistence)

**Source**: Component state in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

---

### PageMapping (In-Memory Cache, Optional)

**Description**: Optional in-memory mapping of page numbers to page IDs for quick navigation.

**Structure**:
```typescript
type PageMapping = Map<number, string>; // pageNumber -> pageId
// Example: { 1 => "uuid-1", 2 => "uuid-2", 3 => "uuid-3" }
```

**Purpose**:
- Enables fast lookup of page ID when user clicks page number
- Avoids additional API call to resolve page number to page ID
- Populated on initial page load or lazy-loaded on navigation

**Lifecycle**:
- **Initialization**: Empty map on mount
- **Population**: Fetch all page IDs/numbers for lab on first navigation or on demand
- **Updates**: Refresh when new page is created (via `useAutoPageCreation` hook)
- **Destruction**: Cleared on component unmount

**Alternative**: If backend API supports `/labs/:labId/pages?number=2`, skip in-memory cache and query directly.

**Source**: Component state or custom hook in `apps/web/hooks/usePagination.ts`

---

## State Transitions

### Pagination Visibility States

```
Single Page Lab (totalPages = 1)
  → Pagination Hidden
  → No pagination controls visible

Multi-Page Lab (totalPages > 1)
  → Pagination Visible
  → Show "Page X of Y" + controls
  → Previous button disabled if currentPageNumber = 1
  → Next button disabled if currentPageNumber = totalPages
```

### Navigation State Transitions

```
Idle (no navigation in progress)
  → User clicks page number
  → Navigating (isNavigating = true, show loading indicator)
  → API call to fetch new page data
  → Success: Update URL, render new page, isNavigating = false
  → Failure: Show error notification, remain on current page, isNavigating = false
```

### Auto-Page-Creation Integration

```
User saves 3rd question on page
  → useAutoPageCreation hook triggers
  → isCreatingPage = true (from hook)
  → New page created via API
  → Redirect to new page (router.push)
  → totalPages increments (e.g., 1 → 2)
  → Pagination appears (was hidden before)
  → isCreatingPage = false
```

---

## Validation Rules

### Client-Side Validation

- **Page number**: Must be integer between 1 and `totalPages` (inclusive)
- **Lab ID**: Must be non-empty string (validated by Next.js routing)
- **Page ID**: Must be non-empty string (validated by Next.js routing)
- **Total pages**: Must be positive integer (≥ 1)

### Navigation Guards

- **Prevent navigation to non-existent page**: If user manually edits URL to invalid page number, redirect to nearest valid page or show 404
- **Handle deleted pages**: If page ID in URL no longer exists, redirect to last available page with notification
- **Debounce rapid clicks**: If user clicks multiple page numbers rapidly, cancel pending navigations and execute only the most recent

---

## API Response Structure (Existing, Not Modified)

### GET /labs/:labId/pages/:pageId

**Response**:
```json
{
  "id": "page-uuid",
  "labId": "lab-uuid",
  "pageNumber": 2,
  "questions": [...],
  "totalPages": 5  // Optional: total page count in this response
}
```

**Notes**:
- If `totalPages` not included in page response, fetch separately via `/labs/:labId` or `/labs/:labId/pages` (count)
- No backend changes required if existing endpoint already returns page count

---

## Type Definitions (New)

### Location: `apps/web/types/pagination.ts` (or add to existing `apps/web/types/lab.ts`)

```typescript
// Pagination state interface
export interface PaginationState {
  currentPageNumber: number;
  totalPages: number;
  currentPageId: string;
  labId: string;
  isNavigating: boolean;
}

// Pagination component props
export interface PagePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

// Page mapping type
export type PageMapping = Map<number, string>;

// Navigation result
export interface NavigationResult {
  success: boolean;
  error?: string;
  redirectedTo?: number; // If redirected to different page than requested
}
```

---

## Summary

This feature introduces **zero new database entities**. All data is derived from existing Lab and Page models. Client-side state (`PaginationState`) is ephemeral and managed by React component state. The only new types are TypeScript interfaces for type safety. No backend API changes are required, assuming existing endpoints return page counts.

**Entities Modified**: None  
**New Entities**: None  
**New Client State**: `PaginationState`, `PageMapping` (optional)  
**New Type Definitions**: `pagination.ts` or additions to `lab.ts`
