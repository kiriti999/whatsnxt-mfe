# Implementation Plan: Reusable Sections with Manual Linking

**Branch**: `002-reusable-sections` | **Date**: 2025-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-reusable-sections/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable trainers to create reusable organizational sections that can be linked to multiple tutorials/blogs with trainer-scoped ownership. Each section has a trainerId field enforcing ownership boundaries - trainers can only view/edit/link their own sections while admins have full access to all sections. Includes ownership transfer capability, cascade deletion on trainer deletion, and confirmation dialogs with impact previews before section deletion. Supports duplicate section links to the same content and imposes no limits on section creation.

## Technical Context

**Language/Version**: TypeScript 5.8.2, Node.js 18+  
**Primary Dependencies**: Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10, xior (HTTP client), @dnd-kit (drag-and-drop)  
**Storage**: MongoDB via external BFF API (baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444')  
**Testing**: Vitest with React Testing Library (@testing-library/react, jsdom)  
**Target Platform**: Web (Next.js App Router, server-side rendering + client components)  
**Project Type**: Web application - monorepo with separate frontend (apps/web) consuming external backend API  
**Performance Goals**: Section search <2s for 100+ sections, UI updates within 5s for metadata changes, picker modal load <30s  
**Constraints**: Trainer-scoped data access (trainers see only their sections, admins see all), cascade deletion integrity, no section creation limits  
**Scale/Scope**: Expected 100+ sections in global library, 5-15 sections per tutorial average, 50+ sections per tutorial max, support for 1000+ trainers

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Code Quality (Principle I)
- All functions will maintain cyclomatic complexity ≤ 5
- SOLID principles will be applied to section management service layer
- Code reviews will verify CRUD operations for sections, ownership transfers, and cascade deletions
- Use best suitable design patterns and best practices for code quality

### ✅ User Experience Consistency (Principle III)
- Mantine UI components will be used for section picker, transfer modals, confirmation dialogs
- CSS classes will be preferred over inline styles
- Responsive design for section management interfaces
- Accessible forms and keyboard navigation for section operations

### ✅ Performance Requirements (Principle IV)
- Section search must return results in <2s for 100+ sections
- Metadata updates must propagate in <5s
- Picker modal must load in <30s
- Pagination/virtual scrolling for large section lists
- Always consider big o notation for performance

### ✅ Shared Package Architecture (Principle IV)
- Section types will be defined in workspace package (create `@whatsnxt/section-types` or use existing core-types)
- No duplicate type definitions in apps/web
- HTTP client from `@whatsnxt/http-client` will be used for all API calls
- Error handling via `@whatsnxt/errors` package
- Constants via `@whatsnxt/constants` package

### ✅ Monorepo Architecture (Principle V)
- Next.js 16 with React 19 for frontend
- Node.js 24 LTS runtime (current: Node 22, will verify compatibility)
- pnpm workspace structure maintained
- Vitest for testing section components and ownership logic

### ✅ API Communication Standards (Principle VI)
- Backend APIs in `apps/whatsnxt-bff` using Express.js v5
- Follow existing folder structure: models/, routes/, services/, utils/, errors/, tests/
- Convert .js files to .ts before adding logic
- HTTP client from `@whatsnxt/http-client` for all API calls
- Winston for structured logging with context (userId, trainerId, sectionId)
- OpenAPI specs in JSON format for 6 new ownership endpoints

### ✅ Documentation Standards (Principle VII)
- HLD/LLD diagrams for ownership model architecture
- User flow diagrams for ownership transfer workflow
- Sequence diagrams for cascade deletion logic
- OpenAPI contracts in JSON (not YAML)

### ✅ Error Handling (Principle IX)
- Use `@whatsnxt/errors` for ownership violations, transfer errors, cascade deletion failures
- Structured error context: trainerId, sectionId, operation type

### ✅ Constants (Principle X)
- Define API endpoints in `@whatsnxt/constants`
- Error codes for ownership violations
- Permission constants for admin vs trainer access

### ✅ Real Data (Principle XI)
- No mock APIs - all section/ownership operations use real backend
- Test environments use dedicated test databases
- Integration tests with actual MongoDB collections

### Gate Status: ✅ PASS
All constitution requirements are satisfied. No violations requiring justification.

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

### Source Code (repository root)

```text
# Frontend (Next.js 16 + React 19)
apps/web/
├── apis/v1/sidebar/
│   ├── sectionsApi.ts          # UPDATED: Add trainerId filtering, ownership transfer, cascade delete
│   └── sectionLinksApi.ts      # NEW: API for SectionLink CRUD operations
├── components/
│   ├── sections/
│   │   ├── SectionPicker.tsx          # UPDATED: Filter by trainerId, show usage stats
│   │   ├── SectionTransferModal.tsx   # NEW: Ownership transfer UI
│   │   ├── SectionDeleteConfirm.tsx   # NEW: Impact preview before deletion
│   │   └── UnassignedPostsView.tsx    # NEW: Orphaned posts management
│   └── ...
├── types/
│   ├── section.ts              # UPDATED: Add trainerId, ownership fields
│   └── sectionLink.ts          # NEW: SectionLink types
└── ...

# Backend (Express.js v5 + MongoDB)
apps/whatsnxt-bff/
├── app/
│   ├── models/
│   │   ├── Section.ts          # UPDATED: Add trainerId, owner reference
│   │   ├── SectionLink.ts      # UPDATED: Remove uniqueness constraint on sectionId+contentId
│   │   └── SectionOwnershipTransfer.ts  # NEW: Transfer request entity
│   ├── routes/
│   │   ├── sections.ts         # UPDATED: Add ownership endpoints (6 new routes)
│   │   └── sectionLinks.ts     # UPDATED: Support duplicate links
│   ├── services/
│   │   ├── SectionService.ts           # UPDATED: Ownership validation, cascade deletion
│   │   ├── SectionOwnershipService.ts  # NEW: Transfer workflow, request management
│   │   └── SectionLinkService.ts       # UPDATED: Remove uniqueness checks
│   ├── middleware/
│   │   └── ownershipGuard.ts   # NEW: Verify trainer owns section or is admin
│   └── tests/
│       ├── section.test.ts     # UPDATED: Ownership & cascade tests
│       └── ownership-transfer.test.ts  # NEW: Transfer workflow tests
└── ...

# Shared Packages
packages/
├── section-types/              # NEW: Shared types for Section, SectionLink, Ownership
│   ├── src/
│   │   ├── Section.ts
│   │   ├── SectionLink.ts
│   │   └── SectionOwnershipTransfer.ts
│   └── package.json
├── constants/
│   └── src/
│       ├── sectionPermissions.ts       # NEW: Permission constants
│       └── sectionApiEndpoints.ts      # NEW: API endpoint constants
└── errors/
    └── src/
        └── SectionOwnershipError.ts    # NEW: Custom ownership errors
```

**Structure Decision**: Web application architecture with separate frontend (Next.js) and backend (Express.js) in monorepo. Frontend consumes backend API via xior HTTP client. Shared workspace packages for types, constants, and errors to eliminate duplication and ensure consistency. Backend follows existing folder structure in `apps/whatsnxt-bff` with TypeScript conversion. New `packages/section-types` created to centralize section-related interfaces.

## Complexity Tracking

> **No violations detected** - All constitution requirements are satisfied without need for justification.

---

## Phase 0: Research Outcomes ✅

**Status**: Complete (PLANNING_COMPLETE marker exists)

All technical unknowns have been resolved through research. Key decisions documented in existing artifacts:

1. **Ownership Model**: trainerId field with middleware-based access control
2. **Cascade Deletion**: MongoDB transactions for atomic multi-collection operations
3. **Ownership Transfer**: Request-approval workflow with SectionOwnershipTransfer entity
4. **Impact Previews**: Separate preview API endpoint before destructive operations
5. **Duplicate Links**: Removed uniqueness constraint to support repeating section patterns
6. **Section Picker Performance**: Hybrid virtualization + pagination + debounced search
7. **Orphaned Posts**: Dedicated UI component with bulk reassignment capabilities

**Artifacts Generated**: Research decisions integrated into existing data-model.md and contracts/

---

## Phase 1: Design & Contracts ✅

**Status**: Complete (artifacts exist and reviewed)

### Generated Artifacts

1. **data-model.md**: Complete entity definitions including:
   - Section (with trainerId field)
   - SectionLink (duplicate-friendly)
   - SectionOwnershipTransfer (transfer workflow)
   - Post (orphanable)
   - Relationships and state transitions

2. **contracts/**: OpenAPI specs in JSON format:
   - `section-ownership-transfer-api.json`: 6 endpoints for ownership operations
   - `section-links-api.json`: CRUD for linking sections to content
   - `orphaned-posts-api.json`: Orphaned post management

3. **quickstart.md**: Implementation guide with:
   - Architecture overview
   - 5-minute implementation checklist
   - Code examples for models, services, routes
   - Environment setup

### Agent Context Update ✅

GitHub Copilot context updated with:
- Language: TypeScript 5.8.2, Node.js 18+
- Framework: Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10
- Database: MongoDB via BFF API

---

## Phase 2: Constitution Re-Check ✅

**Status**: PASS - All gates satisfied

Post-design validation confirms:
- ✅ Shared packages for types, constants, errors
- ✅ Mantine UI with CSS classes
- ✅ Express.js v5 backend with Winston logging
- ✅ OpenAPI specs in JSON format
- ✅ No mock data - real MongoDB integration
- ✅ Cyclomatic complexity ≤ 5 achievable with current design
- ✅ Performance targets met via indexing + virtualization + pagination

No new violations introduced during design phase.

---

## Next Steps (Phase 3: Implementation)

**Command**: `/speckit.tasks` to generate tasks.md

Implementation will proceed in dependency order:
1. Database schema updates (add trainerId, remove uniqueness constraints)
2. Backend models and services (ownership logic, cascade deletion)
3. Backend API routes (6 new endpoints)
4. Frontend types and API clients
5. Frontend UI components (picker, modals, orphaned posts view)
6. Testing (unit, integration, E2E)
7. Documentation updates

**Estimated Effort**: ~40 development hours across 15-20 atomic tasks

---

## Success Criteria Mapping

Feature success criteria from spec.md are directly addressed by design:

| Criteria | Design Element |
|----------|----------------|
| SC-001: Link section in <30s | Section picker with search + pagination |
| SC-002: Create section in <60s | Inline creation modal with trainerId auto-assignment |
| SC-003: 100+ sections <2s search | MongoDB indexes on (trainerId, contentType) + debounced search |
| SC-004: 2.5+ reuses per section | Usage stats display in picker + no limits on links |
| SC-007: Metadata updates <5s | Real-time propagation via shared Section reference |
| SC-009: 100% circular prevention | Validation in SectionService.validateHierarchy() |
| SC-012: Independent section ordering | SectionLink.order field unique per contentId |

---

## Risk Assessment & Mitigations

### Technical Risks

1. **Performance degradation with 1000+ sections**
   - Mitigation: Database indexing + virtualized lists + pagination
   - Monitoring: Add performance logging to search endpoints

2. **Cascade deletion transaction failures**
   - Mitigation: Proper error handling + rollback via MongoDB transactions
   - Monitoring: Winston logs with trainerId context

3. **Race conditions in ownership transfer**
   - Mitigation: Atomic updates with status checks in service layer
   - Testing: Concurrent transfer acceptance tests

### Migration Risks

1. **Existing sections without trainerId**
   - Mitigation: Migration script assigns to admin, documented in quickstart
   - Rollback: Keep backup before schema change

2. **Frontend compatibility with new API**
   - Mitigation: Backward compatible - trainerId is additive field
   - Rollback: Feature flag to disable ownership UI

---

## Appendix: Key Design Decisions

### Decision 1: trainerId at Database Level
**Rationale**: Ensures data integrity, prevents unauthorized access at source
**Alternative Rejected**: Application-level filtering (security risk)

### Decision 2: No Soft Deletes
**Rationale**: Spec requires actual deletion, posts preserved as orphaned
**Alternative Rejected**: Soft delete with cleanup jobs (added complexity)

### Decision 3: Request-Approval Workflow for Transfer
**Rationale**: Spec requires explicit confirmation from target trainer
**Alternative Rejected**: Direct transfer (violates consent requirement)

### Decision 4: Remove SectionLink Uniqueness Constraint
**Rationale**: Spec allows duplicate section links for repeating patterns
**Alternative Rejected**: Virtual sections with separate IDs (unnecessary complexity)

### Decision 5: Separate Impact Preview Endpoint
**Rationale**: Prevents accidental deletions, follows confirmation pattern
**Alternative Rejected**: Client-side calculation (sync issues, security concerns)

---

## Conclusion

Implementation planning is complete. All constitutional requirements are satisfied. Design artifacts (data-model.md, contracts/, quickstart.md) are ready for implementation phase. Agent context has been updated. Next step: Generate tasks.md via `/speckit.tasks` command to break down implementation into atomic, testable units.
