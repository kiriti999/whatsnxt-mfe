# Implementation Plan: Clone Published Lab to Edit

**Branch**: `001-clone-lab-to-edit` | **Date**: 2025-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-clone-lab-to-edit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enables instructors to clone published labs into editable draft versions, make modifications, and republish them to replace the original. This supports iterative improvement of lab content without disrupting student access or requiring full recreation from scratch. The implementation uses MongoDB's document cloning with deep copy of all related entities (pages, questions, diagram tests, hints) and maintains referential integrity through a `clonedFromLabId` field for republish tracking.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend: Next.js 16 / React 19, Backend: Express.js 5 + Node.js 20+)  
**Primary Dependencies**: 
  - Frontend: Next.js 16, React 19, Mantine UI v7, Zustand (state), TanStack Query (data fetching)
  - Backend: Express.js 5, Mongoose 8.x, MongoDB 7.x, UUID v10
**Storage**: MongoDB 7.x with Mongoose ODM (separate collections: lab_diagram_tests, lab_pages, questions, diagram_tests)  
**Testing**: Vitest (unit/integration), Playwright (E2E - NEEDS CLARIFICATION if required for this feature)  
**Target Platform**: Web application (desktop + tablet browsers), Node.js server on AWS EC2
**Project Type**: Full-stack web (monorepo structure with apps/web frontend + separate whatsnxt-bff backend)  
**Performance Goals**: 
  - Clone operation: <10 seconds for labs with 20 pages and 100 questions
  - Republish operation: <5 seconds for atomic replacement
  - API response time: <200ms p95 for clone initiation
**Constraints**: 
  - Atomicity: Clone and republish must be transactional (all-or-nothing)
  - Data integrity: Student progress preservation requires careful ID mapping
  - Backward compatibility: No breaking changes to existing Lab/Question/DiagramTest schemas
  - Authorization: Only lab owner can clone/republish (instructorId match)
**Scale/Scope**: 
  - Labs: Up to 100 pages per lab, 30 questions per page
  - Users: ~1000 instructors, ~10k students
  - Clone frequency: ~50 clones/day, ~20 republishes/day

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Phase 0 Compliance (Pre-Research)

1. **Code Quality (Principle I)**: All service and route handlers will maintain cyclomatic complexity ≤5 through small, focused functions
2. **UI Consistency (Principle III)**: Clone button and republish modal will use Mantine UI components (Button, Modal, Text) with CSS classes
3. **Shared Packages (Principle IV)**: Will reuse existing `@whatsnxt/http-client` for API calls, `@whatsnxt/errors` for error handling, `@whatsnxt/constants` for status codes
4. **Monorepo Architecture (Principle V)**: Changes will be made in `apps/web` (frontend) and separate `whatsnxt-bff` repository (backend)
5. **API Standards (Principle VI)**: New endpoints will use Express.js 5 in `whatsnxt-bff/app/routes/lab.routes.ts`, services in `whatsnxt-bff/app/services/`
6. **Error Handling (Principle IX)**: Will use custom error classes from `@whatsnxt/errors` for authorization, validation, and operational errors
7. **Constants (Principle X)**: Will use constants from `@whatsnxt/constants` for status codes ('draft', 'published'), error messages

### ✅ Phase 1 Re-Evaluation (Post-Design)

**Testing (Principle V - Clarification Resolved)**:
- ✅ Unit tests with Vitest for all services (`LabCloneService.test.ts`, `LabService.test.ts`)
- ✅ Integration tests with Vitest + MongoDB Memory Server (`lab-clone.test.ts`, `lab-republish.test.ts`)
- ✅ E2E tests deferred as optional (not critical for initial release)
- **Decision**: Vitest unit + integration tests provide sufficient coverage

**Documentation (Principle VII - Clarification Resolved)**:
- ✅ Data model with embedded ER diagrams and sequence diagrams (`data-model.md`)
- ✅ OpenAPI contracts in JSON format (`contracts/clone.json`, `contracts/republish.json`)
- ✅ Developer quickstart guide (`quickstart.md`)
- **Decision**: Structured documentation meets constitution requirements without redundant HLD/LLD files

**D3.js Requirement (Principle VI)**:
- ✅ NOT APPLICABLE - This feature does not involve diagram rendering
- Feature only clones/copies existing diagram test data structures
- No visualization or SVG rendering logic required

**Additional Validations**:
- ✅ All API contracts in JSON format (not YAML) per Principle VII
- ✅ MongoDB transactions ensure atomicity per research findings
- ✅ Winston logging for backend operations per Principle VI
- ✅ Agent context updated with TypeScript, MongoDB, Next.js 16, Express.js 5

### ✅ Final Status: No Violations

All constitution requirements satisfied. Feature design aligns with all core principles. Ready for implementation (Phase 2 - Task generation via `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

## Project Structure

### Documentation (this feature)

```text
specs/001-clone-lab-to-edit/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Research on MongoDB transactions, ID mapping strategies
├── data-model.md        # Phase 1: Extended Lab schema, clone reference tracking
├── quickstart.md        # Phase 1: Developer setup and testing guide
├── contracts/           # Phase 1: OpenAPI specs for clone/republish endpoints
│   ├── clone.json
│   └── republish.json
└── tasks.md             # Phase 2: Generated by /speckit.tasks command (NOT by /speckit.plan)
```

### Source Code (repository root)

**Frontend Repository**: `/Users/arjun/whatsnxt-mfe`
```text
apps/web/
├── components/
│   └── Lab/
│       ├── LabCard.tsx (existing - add clone button)
│       ├── LabDetail.tsx (existing - add clone button)
│       ├── CloneLabButton.tsx (NEW)
│       └── RepublishModal.tsx (NEW)
├── apis/
│   └── lab.api.ts (existing - add cloneLab(), republishLab())
└── app/
    └── labs/
        └── [labId]/
            └── page.tsx (existing - integrate clone UI)

packages/
└── http-client/ (existing - reuse)
```

**Backend Repository**: `/Users/arjun/whatsnxt-bff`
```text
app/
├── models/
│   └── lab/
│       ├── Lab.ts (MODIFY - add clonedFromLabId field)
│       ├── LabPage.ts (existing)
│       ├── Question.ts (existing)
│       └── DiagramTest.ts (existing)
├── routes/
│   └── lab.routes.ts (MODIFY - add POST /labs/:labId/clone, POST /labs/:labId/republish)
├── services/
│   ├── LabService.ts (MODIFY - add cloneLab(), republishLab())
│   └── LabCloneService.ts (NEW - deep copy logic)
└── tests/
    ├── unit/
    │   └── LabCloneService.test.ts (NEW)
    └── integration/
        └── lab-clone.test.ts (NEW)
```

**Structure Decision**: This is a full-stack web application feature spanning both the Next.js frontend monorepo (`whatsnxt-mfe`) and the Express.js backend repository (`whatsnxt-bff`). The frontend handles UI components and API integration using existing patterns, while the backend implements the core cloning/republishing logic as a new service layer. We maintain separation of concerns by keeping presentation (React components), data fetching (TanStack Query in APIs), and business logic (Express services) in their respective layers.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations identified. This section intentionally left empty._
