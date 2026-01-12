# Implementation Plan: Diagram Quiz Hints System

**Branch**: `001-diagram-quiz-hints` | **Date**: 2025-01-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-diagram-quiz-hints/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Diagram Quiz Hints System allows instructors to provide up to 5 optional clues for diagram quizzes, enabling students to progressively reveal hints one at a time when they need help. The feature extends the existing `DiagramTest` entity with a `hints?: string[]` field, uses Mantine UI components for both instructor editing (drag-and-drop sortable list) and student disclosure (accordion-based progressive reveal), and maintains full backward compatibility with existing diagram tests. All hint validation occurs at both frontend and backend layers, with no new dependencies required.

## Technical Context

**Language/Version**: TypeScript, Node.js 24.12.0 LTS  
**Primary Dependencies**: Next.js 16, React 19, Mantine UI, Express.js v5, MongoDB, @dnd-kit (already in stack)  
**Storage**: MongoDB (extending DiagramTest collection with optional hints field)  
**Testing**: Vitest (framework already selected, tests to be implemented)  
**Target Platform**: Web (Next.js frontend at localhost:3001, Express.js backend at localhost:4444)  
**Project Type**: Web application (monorepo: apps/web frontend + separate backend service)  
**Performance Goals**: <100ms hint display latency, no impact to existing API response times, <2KB additional data per test  
**Constraints**: Max 5 hints per test, max 500 chars per hint, backward compatibility required  
**Scale/Scope**: Extends existing diagram test system (~100-1000 labs, 10-50 pages/lab, optional on all diagram tests)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Note**: Constitution file is a template placeholder. Applied generic best practices gates based on existing project patterns.

### Pre-Phase 0 Status: ✅ PASSED

#### Gate 1: Technology Stack Alignment
- ✅ Uses established stack (TypeScript, Node.js 24 LTS, Next.js 16, React 19, Express.js v5, MongoDB)
- ✅ Mantine UI already in use (consistent with existing components)
- ✅ @dnd-kit already available via Mantine dependencies
- ✅ No new external dependencies required

#### Gate 2: No Mock Data/APIs
- ✅ Extends real backend API endpoints (POST/GET diagram-test)
- ✅ Real MongoDB schema extension (DiagramTest model)
- ✅ No stub implementations planned

#### Gate 3: Backward Compatibility
- ✅ Optional field design (hints?: string[])
- ✅ Existing tests without hints continue to work
- ✅ No breaking changes to API contracts
- ✅ Frontend gracefully handles tests with/without hints

#### Gate 4: Code Quality Standards
- ✅ Follows existing patterns (component structure, API client design)
- ✅ Type safety maintained (TypeScript throughout)
- ✅ Validation at multiple layers (frontend + backend)
- ⚠️ Tests pending (Vitest framework selected, implementation in Phase 2)

**Decision**: Proceed to Phase 0 research.

---

### Post-Phase 1 Status: ✅ PASSED

**Re-evaluation Date**: 2025-01-20  
**Phase 1 Completion**: 100% (research.md, data-model.md, contracts/, quickstart.md completed)

#### Gate 1: Technology Stack Alignment ✅
- ✅ All technologies confirmed as already in stack
- ✅ No new dependencies required
- ✅ Component patterns match existing code (DiagramEditor, StudentTestRunner)
- ✅ Agent context updated with feature details

#### Gate 2: No Mock Data/APIs ✅
- ✅ Data model extends existing DiagramTest entity
- ✅ API contracts defined (OpenAPI 3.0)
- ✅ Backend endpoints extend existing routes (no new endpoints)
- ✅ MongoDB schema update documented with validation

#### Gate 3: Backward Compatibility ✅
- ✅ Optional hints field ensures zero breaking changes
- ✅ Migration plan requires no data updates
- ✅ Frontend conditional rendering handles both cases
- ✅ Existing diagram tests verified to continue working

#### Gate 4: Architecture & Design Quality ✅
- ✅ Data model follows existing entity patterns
- ✅ Component separation (HintsEditor, HintsDisclosure)
- ✅ API design consistent with existing lab endpoints
- ✅ Validation strategy matches project standards

#### Gate 5: Testability & Quality Assurance ⚠️
- ⚠️ **ADVISORY**: Test implementation pending (Vitest selected)
- ✅ Test cases documented in quickstart.md
- ✅ Manual testing checklist provided
- ⚠️ **ADVISORY**: No tests yet (framework chosen, implementation in Phase 2)

**Final Verdict**: ✅ **PASSED** - Feature may proceed to Phase 2 (Task Breakdown)

**Advisories**:
1. **Test Coverage** (High Priority)
   - Action: Implement comprehensive test suite with Vitest
   - Target: Unit tests for components, integration tests for API
   - Timeline: Phase 2 task generation, Phase 3 implementation

2. **Complexity Audit** (Low Priority)
   - Action: Verify components maintain low cyclomatic complexity
   - Target: All functions ≤5 complexity (project standard)
   - Timeline: During code review

## Project Structure

### Documentation (this feature)

```text
specs/001-diagram-quiz-hints/
├── plan.md                              # This file (/speckit.plan command output)
├── spec.md                              # Feature specification (user scenarios, requirements)
├── research.md                          # Phase 0 output (technical decisions, patterns)
├── data-model.md                        # Phase 1 output (entities, validation, schema)
├── quickstart.md                        # Phase 1 output (developer guide, examples)
├── contracts/
│   └── diagram-test-hints-api.json      # Phase 1 output (OpenAPI 3.0 contract)
├── checklists/
│   └── [generated by speckit.checklist] # Custom checklists (if needed)
└── tasks.md                             # Phase 2 output (/speckit.tasks command - NOT YET CREATED)
```

### Source Code (repository root)

```text
# Web application structure (Turbo monorepo)

apps/web/                                # Next.js 16 frontend (localhost:3001)
├── app/
│   └── labs/
│       └── [id]/
│           └── pages/
│               └── [pageId]/
│                   └── page.tsx         # MODIFY: Add HintsEditor component
├── components/
│   └── Lab/
│       ├── HintsEditor.tsx              # NEW: Instructor hint management UI
│       ├── HintsDisclosure.tsx          # NEW: Student progressive hint reveal UI
│       └── StudentTestRunner.tsx        # MODIFY: Integrate HintsDisclosure
├── apis/
│   └── lab.api.ts                       # MODIFY: Add hints to CreateDiagramTestRequest
└── __tests__/
    └── components/
        └── Lab/
            ├── HintsEditor.test.tsx     # NEW: Unit tests for HintsEditor
            └── HintsDisclosure.test.tsx # NEW: Unit tests for HintsDisclosure

packages/core-types/                     # Shared TypeScript types
└── src/
    └── index.d.ts                       # MODIFY: Add hints?: string[] to DiagramTest

# Backend API structure (separate service at localhost:4444)
# NOTE: Backend is external to this monorepo, documented for reference

backend/                                 # Express.js v5 backend (separate repo/service)
├── models/
│   └── DiagramTest.js                   # MODIFY: Add hints field to Mongoose schema
├── controllers/
│   └── lab/
│       └── diagramTestController.js     # MODIFY: Handle hints in create/update
├── validators/
│   └── diagramTestValidator.js          # MODIFY: Add hints validation rules
└── routes/
    └── labRoutes.js                     # NO CHANGE: Existing endpoints handle hints

# Database (MongoDB)
# Collection: diagram_tests
# MODIFY: Add optional hints: [String] field (max 5 items, each max 500 chars)
```

**Structure Decision**: 

This feature follows the existing **web application monorepo** pattern with frontend in `apps/web/` and backend as a separate service. The structure extends the existing Lab Diagram Tests feature (spec 001-lab-diagram-test) with minimal modifications:

1. **New Components**: Two new React components (`HintsEditor`, `HintsDisclosure`) in `apps/web/components/Lab/`
2. **Modified Components**: Update existing editor page and student runner to integrate hints
3. **Shared Types**: Extend `DiagramTest` interface in shared types package
4. **Backend Extension**: Optional field addition to existing DiagramTest model and endpoints

**No new directories or services required** - all changes integrate into existing structure.

## Complexity Tracking

> **No violations of constitution gates to justify. This section intentionally left empty.**

All constitution checks passed without requiring complexity justifications. The feature:
- Uses existing technology stack (no new dependencies)
- Follows established patterns (optional field extension, component composition)
- Maintains backward compatibility (no breaking changes)
- Requires no additional projects, repositories, or services

**Complexity Score**: Low

- Simple data model change (one optional array field)
- Two small, focused components (HintsEditor, HintsDisclosure)
- No new API endpoints (extends existing ones)
- No architectural changes required
