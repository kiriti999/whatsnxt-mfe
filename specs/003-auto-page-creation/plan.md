# Implementation Plan: Auto-Create Page After 3 Questions

**Branch**: `003-auto-page-creation` | **Date**: 2025-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-auto-page-creation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Automatically create and redirect to a new lab page after an instructor saves the 3rd question on the current page. This eliminates 15-20 seconds of manual navigation overhead per page, enabling seamless multi-page lab creation. The feature triggers only for new questions (not edits), counts all question types equally, and gracefully handles failures by preserving saved questions and providing manual fallback options.

## Technical Context

**Language/Version**: TypeScript 5.8.2, Node.js 24 LTS  
**Primary Dependencies**: Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10, @whatsnxt/http-client (workspace), @whatsnxt/core-types (workspace)  
**Storage**: Backend PostgreSQL (via Express.js v5 BFF at apps/whatsnxt-bff)  
**Testing**: Vitest 4.0.15 with @testing-library/react 16.3.1  
**Target Platform**: Web (Next.js App Router), Chrome/Safari/Firefox latest  
**Project Type**: Web application (Turbo monorepo)  
**Performance Goals**: <2 seconds for page creation + redirect, <500ms API response time  
**Constraints**: <200ms p95 for question save, cyclomatic complexity ≤5, real APIs only (no mocks), must reuse @whatsnxt/http-client  
**Scale/Scope**: Instructor workflow (low concurrency), ~100-200 labs per instructor, 3-15 pages per lab

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Code Quality and SOLID Principles ✅
- All functions will maintain cyclomatic complexity ≤5
- Auto-page-creation logic will be single-purpose (SRP)
- Question counting logic will be extracted to separate utility

**Post-Phase 1 Validation**: ✅ **PASSED**
- `useAutoPageCreation` hook maintains low complexity (primary function ~15 lines)
- Logic separated into: count tracking, API calls, navigation, notifications
- Each responsibility isolated in separate code blocks

### Principle III: User Experience Consistency ✅
- Uses existing Mantine Notifications (@mantine/notifications) for success/error messages
- Maintains existing page editor UI patterns
- Uses CSS classes per Mantine performance recommendations

**Post-Phase 1 Validation**: ✅ **PASSED**
- Reuses `notifications.show()` with consistent color schemes (green/red)
- No new UI components introduced
- Notification messages standardized in constants

### Principle IV: Performance Requirements and Shared Packages ✅
- Reuses @whatsnxt/http-client for API calls (existing HttpClient instance)
- Reuses @whatsnxt/core-types for Lab, LabPage, Question types
- No new workspace packages needed (uses existing)

**Post-Phase 1 Validation**: ✅ **PASSED**
- All API calls through existing `labApi` client
- Types imported from `@whatsnxt/core-types`
- Constants added to `@whatsnxt/constants` per requirements

### Principle V: Monorepo Architecture ✅
- Frontend changes in apps/web (Next.js 16 + React 19)
- Backend changes in apps/whatsnxt-bff (Express.js v5)
- Testing with Vitest per project standards

**Post-Phase 1 Validation**: ✅ **PASSED**
- No backend changes required (reuses existing endpoints)
- Frontend follows App Router structure
- New hook placed in `apps/web/hooks/` per conventions

### Principle VI: API Communication Standards ✅
- Reuses existing labApi.createLabPage() method from apps/web/apis/lab.api.ts
- Reuses existing labApi.saveQuestion() method
- Uses @whatsnxt/http-client (already configured in lab.api.ts)
- No new HTTP client instances created

**Post-Phase 1 Validation**: ✅ **PASSED**
- Zero new API endpoints
- Zero new HTTP clients
- Zero backend modifications

### Principle IX: Error Handling Standards ✅
- Will use @whatsnxt/errors for custom error classes
- Graceful failure handling per spec requirements

**Post-Phase 1 Validation**: ✅ **PASSED**
- Error handling uses try/catch with fallback notifications
- Question data preserved on page creation failure
- Clear error messages guide user to manual fallback

### Principle X: Code Maintainability Standards ✅
- Will use @whatsnxt/constants for question count threshold (QUESTIONS_PER_PAGE_THRESHOLD = 3)
- Will use constants for notification messages

**Post-Phase 1 Validation**: ✅ **PASSED**
- `QUESTIONS_PER_PAGE_THRESHOLD = 3` added to `@whatsnxt/constants`
- `AUTO_PAGE_CREATION_MESSAGES` object added for all notification text
- `NOTIFICATION_DURATIONS` added for timing consistency

### Principle XI: Real Data and API Standards ✅
- Uses real backend APIs (no mocks)
- labApi already configured for real backend endpoints

**Post-Phase 1 Validation**: ✅ **PASSED**
- All API calls use real endpoints
- No mock data introduced
- Integration leverages existing real API infrastructure

**GATE STATUS**: ✅ **PASSED** (Initial and Post-Phase 1)

All constitutional requirements met. No violations. Feature builds on existing architecture patterns and adheres to all principles.

## Project Structure

### Documentation (this feature)

```text
specs/003-auto-page-creation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web Application (Turbo monorepo structure)
apps/web/
├── app/
│   └── labs/[id]/pages/[pageId]/
│       └── page.tsx             # Page editor component (modify for auto-creation)
├── apis/
│   └── lab.api.ts               # Lab API client (reuse existing methods)
├── components/
│   └── Lesson/
│       └── question.tsx         # Question form component
├── hooks/
│   └── useAutoPageCreation.ts   # NEW: Custom hook for auto-creation logic
└── utils/
    └── questionCount.ts         # NEW: Question counting utility

apps/whatsnxt-bff/
├── app/
│   ├── routes/
│   │   └── labs.routes.ts       # Existing routes (no changes needed)
│   ├── services/
│   │   └── labService.ts        # Existing service (no changes needed)
│   └── models/
│       └── Lab.model.ts         # Existing model (no changes needed)

packages/constants/
└── src/
    └── lab.constants.ts         # NEW: Add QUESTIONS_PER_PAGE_THRESHOLD = 3

packages/core-types/
└── src/
    └── lab.types.ts             # Existing types (reuse Lab, LabPage, Question)

__tests__/
└── unit/
    └── useAutoPageCreation.test.ts  # NEW: Unit tests for auto-creation hook
```

**Structure Decision**: This feature follows the existing web application structure. Frontend changes are isolated to the page editor component and a new custom hook. The backend API endpoints already exist (createLabPage, saveQuestion), so no backend changes are required. New constants will be added to the shared packages/constants workspace package per constitution requirements.

## Complexity Tracking

> **No violations** - All constitutional requirements are met. No complexity justification needed.
