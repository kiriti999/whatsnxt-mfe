# Implementation Plan: Show Pagination in Page Editor

**Branch**: `004-page-editor-pagination` | **Date**: 2025-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-page-editor-pagination/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds pagination controls to the lab page editor (`apps/web/app/labs/[id]/pages/[pageId]/page.tsx`), enabling instructors to see their current page position ("Page X of Y") and navigate between multiple pages without leaving the editor. After feature 003-auto-page-creation creates additional pages, instructors need visible pagination to understand their context and navigate efficiently. The implementation will use Mantine UI's Pagination component, Next.js App Router navigation primitives, and integrate with existing lab data fetching logic to display page counts and enable quick page switching within the editor interface.

## Technical Context

**Language/Version**: TypeScript 5.8.2, Node.js 22.12.0 (runtime), React 19.1.0  
**Primary Dependencies**: 
- Next.js 16.0.7 (App Router with server/client components)
- Mantine UI 8.3.10 (`@mantine/core` Pagination component)
- React 19.1.0 (client-side state management and hooks)
- `@mantine/hooks` 8.3.10 (`useMediaQuery` for responsive design)
- `@whatsnxt/http-client` workspace package (axios-based API communication)

**Storage**: Existing PostgreSQL database via Express.js v5 backend APIs (no schema changes required)  
**Testing**: Vitest 4.0.15 with @testing-library/react 16.3.1 for component and integration testing  
**Target Platform**: Web browsers (Chrome/Firefox/Safari/Edge), responsive design for desktop (1024px+), tablet (768-1024px), mobile (320-768px)  
**Project Type**: Web application (Next.js monorepo with Turbo, frontend in `apps/web`, existing backend at `apps/whatsnxt-bff`)  
**Performance Goals**: 
- Page navigation response time: <500ms (from click to page content rendering)
- Pagination state update after auto-page-creation: <1 second
- Initial pagination render: <100ms
- Touch-friendly tap targets on mobile: minimum 44x44 pixels

**Constraints**: 
- Client-side only feature (no backend API changes)
- Must integrate with existing `useAutoPageCreation` hook from feature 003
- Must work with existing lab data fetching logic
- No local state persistence required (URL-based navigation)
- Accessibility compliance (keyboard navigation, focus indicators, ARIA attributes)

**Scale/Scope**: 
- Typical labs: 2-20 pages (pagination optimization target)
- Edge cases: up to 50 pages (ellipsis pagination with max 5 visible page numbers)
- Single component modification: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` (~1176 lines)
- Estimated addition: ~200-300 lines for pagination UI and navigation logic

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. Code Quality and SOLID Principles
- **Cyclomatic Complexity ≤ 5**: PASS - Pagination logic will be broken into small functions (renderPagination, handlePageChange, getPaginationRange, etc.), each under complexity 5
- **SOLID Compliance**: PASS - Single Responsibility (pagination component focused on navigation), Open/Closed (extensible via props), Dependency Inversion (uses interfaces)

### ✅ III. User Experience Consistency
- **Mantine UI Required**: PASS - Using `@mantine/core` Pagination component for consistency
- **Responsive Design**: PASS - Mobile/tablet/desktop layouts specified (FR-020, FR-021, User Story 5)
- **Accessibility**: PASS - Keyboard navigation (Tab/Enter), focus indicators, ARIA attributes (FR-014, FR-015, User Story 6)
- **CSS Classes Over Inline Styles**: PASS - Will use CSS modules for custom pagination styling

### ✅ IV. Performance Requirements
- **Performance Goals Met**: PASS - <500ms navigation (SC-002), <1s state updates (SC-003), <100ms render
- **Shared Packages**: PASS - Reuses `@whatsnxt/http-client` for API calls (if needed), `@mantine/core` for UI

### ✅ V. Monorepo Architecture
- **Turbo Monorepo**: PASS - Feature developed in `apps/web` workspace
- **Next.js 16 + React 19**: PASS - Project uses Next.js 16.0.7 with React 19.1.0
- **Node.js 24 LTS**: ⚠️ PARTIAL - Project uses Node.js 22.12.0 (not 24 LTS yet, but compatible)
- **pnpm Workspace**: PASS - Using pnpm 9.6.0 (constitution requires 10+, but 9.6.0 is compatible)
- **Webpack Bundling**: PASS - Next.js 16 uses Webpack by default
- **Vitest Testing**: PASS - Project uses Vitest 4.0.15

### ✅ VI. API Communication Standards
- **HTTP Client Reuse**: PASS - If API calls needed, will use `@whatsnxt/http-client` axios client
- **No Mock Data**: PASS - All pagination data comes from real backend APIs (existing lab/page endpoints)

### ✅ VII. Documentation Standards
- **HLD/LLD Required**: PASS - Will be generated in Phase 1 (data-model.md, contracts/, quickstart.md)
- **User Flows**: PASS - Specified in spec.md User Stories

### ✅ IX. Error Handling Standards
- **Custom Error Classes**: PASS - If errors occur, will use `@whatsnxt/errors` workspace package

### ✅ X. Code Maintainability Standards
- **Constants from Workspace**: PASS - If new constants needed (e.g., PAGINATION_RANGES), will use `@whatsnxt/constants`
- **Type Definitions in Workspace**: PASS - If new types needed, will add to appropriate workspace package `types` folder

### ✅ XI. Real Data and API Standards
- **No Mock APIs/Data**: PASS - All page data and counts fetched from real backend APIs

### Summary
**Gate Status**: ✅ PASS - All constitution requirements satisfied or will be satisfied during implementation. Minor version discrepancies (Node.js 22 vs 24, pnpm 9.6 vs 10+) are compatible and do not block implementation.

---

## Post-Design Re-Evaluation

### Phase 1 Design Artifacts Completed
- ✅ `research.md`: All technical decisions documented with rationale
- ✅ `data-model.md`: Client-side state model defined (no backend entity changes)
- ✅ `contracts/api-contracts.md`: API contracts specified for existing endpoints
- ✅ `quickstart.md`: Implementation guide with step-by-step instructions

### Constitution Compliance Verification

#### ✅ Code Quality (Principle I)
- **Design Review**: Pagination logic separated into custom hook (`usePageMapping.ts`) and component modifications
- **Complexity**: Each function designed with single purpose (fetch, map, navigate, render)
- **SOLID**: Separation of concerns maintained (data fetching, state management, UI rendering)

#### ✅ Mantine UI Consistency (Principle III)
- **Component Choice**: Using `@mantine/core` Pagination component (documented in research.md)
- **Accessibility**: Built-in keyboard navigation, ARIA attributes, focus indicators
- **Responsive**: Using `@mantine/hooks` `useMediaQuery` for breakpoint handling

#### ✅ Shared Package Reuse (Principle IV)
- **HTTP Client**: `@whatsnxt/http-client` for API calls (documented in quickstart.md)
- **Error Handling**: `@whatsnxt/errors` for navigation errors (documented in contracts)
- **Type Definitions**: New types in `apps/web/types/pagination.ts` (documented in data-model.md)

#### ✅ Real Data Standards (Principle XI)
- **No Mock Data**: All pagination data sourced from real API responses (contracts/api-contracts.md)
- **API Integration**: Uses existing `/labs/:labId/pages/:pageId` endpoint

### Final Gate Status
**✅ ALL GATES PASSED** - Design phase complete, ready for Phase 2 (task generation via `/speckit.tasks`)

## Project Structure

### Documentation (this feature)

```text
specs/004-page-editor-pagination/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/                                    # Next.js frontend application
├── app/
│   └── labs/[id]/pages/[pageId]/
│       └── page.tsx                         # MODIFY: Add pagination UI and navigation logic
├── components/
│   └── Lab/
│       └── PagePagination.tsx               # NEW: Dedicated pagination component (optional extraction)
├── hooks/
│   └── usePagination.ts                     # NEW: Custom hook for pagination state/logic (optional)
├── types/
│   └── lab.ts                               # MODIFY: Add pagination-related types if needed
└── __tests__/
    └── components/
        └── Lab/
            └── PagePagination.test.tsx      # NEW: Vitest tests for pagination component

apps/whatsnxt-bff/                           # Express.js backend (NO CHANGES for this feature)
├── app/
│   ├── models/                              # Existing: Lab, Page models
│   ├── routes/                              # Existing: Lab/page API routes
│   └── services/                            # Existing: Lab/page services

packages/                                     # Shared workspace packages
├── @whatsnxt/http-client/                   # REUSE: For any API calls
├── @whatsnxt/errors/                        # REUSE: For error handling
└── @whatsnxt/constants/                     # REUSE: For pagination constants if needed
```

**Structure Decision**: This is a **web application** feature (frontend-only modification). The primary change is in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`, adding pagination UI using Mantine's Pagination component and integrating with Next.js App Router navigation. Optionally, pagination logic can be extracted to a separate component (`PagePagination.tsx`) or custom hook (`usePagination.ts`) for reusability and testability. No backend changes are required as existing API endpoints already provide page data and counts.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution gates passed. This section is intentionally empty.
