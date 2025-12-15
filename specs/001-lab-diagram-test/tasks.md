# Tasks: Lab Diagram Tests

**Input**: Design documents from `/specs/001-lab-diagram-test/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL and only included where explicitly needed. This feature focuses on TDD approach for critical functionality.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `apps/whatsnxt-bff/app/`
- **Frontend**: `apps/web/`
- **Packages**: `packages/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Update Lab interface with labType and architectureType in packages/core-types/src/index.d.ts
- [ ] T002 Add PaginatedResponse interface in packages/core-types/src/index.d.ts
- [ ] T003 [P] Add CreateLabRequest and UpdateLabRequest types in packages/core-types/src/index.d.ts
- [ ] T004 [P] Verify MongoDB connection and indexes in apps/whatsnxt-bff/config/database.ts
- [ ] T005 [P] Convert JavaScript utility files to TypeScript in apps/whatsnxt-bff/app/utils/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create Lab model with UUID, status, labType, architectureType in apps/whatsnxt-bff/app/models/lab/Lab.ts
- [ ] T007 Create LabPage model with UUID, pageNumber, hasQuestion, hasDiagramTest in apps/whatsnxt-bff/app/models/lab/LabPage.ts
- [ ] T008 Create Question model with UUID, type, questionText, options, correctAnswer in apps/whatsnxt-bff/app/models/lab/Question.ts
- [ ] T009 Create DiagramTest model with UUID, prompt, expectedDiagramState, architectureType in apps/whatsnxt-bff/app/models/lab/DiagramTest.ts
- [ ] T010 Create DiagramShape model with UUID, name, type, architectureType, svgPath in apps/whatsnxt-bff/app/models/lab/DiagramShape.ts
- [ ] T011 Implement string similarity utility using Levenshtein algorithm in apps/whatsnxt-bff/app/utils/stringSimilarity.ts
- [ ] T012 Create ValidationService with page validation and fuzzy matching in apps/whatsnxt-bff/app/services/ValidationService.ts
- [ ] T013 Create PaginationService for list pagination in apps/whatsnxt-bff/app/services/PaginationService.ts
- [ ] T014 Setup API error handling middleware in apps/whatsnxt-bff/app/middleware/errorHandler.ts
- [ ] T015 Setup validation middleware in apps/whatsnxt-bff/app/middleware/validation.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instructor Manages Lab Drafts (Priority: P1) 🎯 MVP

**Goal**: Enable instructors to view, create, edit, and delete lab drafts from the Labs page

**Independent Test**: An instructor can navigate to the Labs page, view existing labs, create a new lab draft with labType and architectureType, and navigate to edit an existing draft

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create LabService with createLab, getLabs, getLabById, updateLab, deleteLab, publishLab in apps/whatsnxt-bff/app/services/LabService.ts
- [ ] T017 [US1] Implement POST /api/v1/labs endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T018 [US1] Implement GET /api/v1/labs endpoint with pagination in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T019 [US1] Implement GET /api/v1/labs/:labId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T020 [US1] Implement PUT /api/v1/labs/:labId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T021 [US1] Implement DELETE /api/v1/labs/:labId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T022 [US1] Implement POST /api/v1/labs/:labId/publish endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T023 [US1] Remove ALL mock implementations from apps/web/apis/lab.api.ts
- [ ] T024 [US1] Implement real createLab API call using @whatsnxt/http-client in apps/web/apis/lab.api.ts
- [ ] T025 [US1] Implement real getLabs API call with pagination in apps/web/apis/lab.api.ts
- [ ] T026 [US1] Implement real getLabById API call in apps/web/apis/lab.api.ts
- [ ] T027 [US1] Implement real updateLab API call in apps/web/apis/lab.api.ts
- [ ] T028 [US1] Implement real deleteLab API call in apps/web/apis/lab.api.ts
- [ ] T029 [US1] Implement real publishLab API call in apps/web/apis/lab.api.ts
- [ ] T030 [US1] Add labType and architectureType fields to create lab form in apps/web/app/labs/page.tsx
- [ ] T031 [US1] Add pagination UI for labs list (3 per page) in apps/web/app/labs/page.tsx
- [ ] T032 [US1] Add sorting by createdAt descending in apps/web/app/labs/page.tsx
- [ ] T033 [US1] Add delete button with confirmation dialog in apps/web/app/labs/page.tsx
- [ ] T034 [US1] Add loading states and error handling in apps/web/app/labs/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Instructor Edits Lab Details and Manages Pages (Priority: P1)

**Goal**: Enable instructors to edit lab metadata, view all pages with pagination, search across tests, and manage pages

**Independent Test**: An instructor can open a lab, edit its details, view all pages with pagination, search for specific questions, create new pages, and delete pages

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create LabPageService with createPage, getPageById, updatePage, deletePage in apps/whatsnxt-bff/app/services/LabPageService.ts
- [ ] T036 [US2] Implement POST /api/v1/labs/:labId/pages endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T037 [US2] Implement GET /api/v1/labs/:labId/pages/:pageId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T038 [US2] Implement PUT /api/v1/labs/:labId/pages/:pageId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T039 [US2] Implement DELETE /api/v1/labs/:labId/pages/:pageId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T040 [US2] Create labPage.api.ts with page operations in apps/web/apis/labPage.api.ts
- [ ] T041 [US2] Enhance lab detail page with metadata form (labType, architectureType) in apps/web/app/labs/[id]/page.tsx
- [ ] T042 [US2] Implement page list with pagination (3 per page) in apps/web/app/labs/[id]/page.tsx
- [ ] T043 [US2] Implement global search across all questions and tests in apps/web/app/labs/[id]/page.tsx
- [ ] T044 [US2] Add "Create New Page" button with navigation in apps/web/app/labs/[id]/page.tsx
- [ ] T045 [US2] Add delete page functionality with confirmation in apps/web/app/labs/[id]/page.tsx
- [ ] T046 [US2] Add "Publish Lab" button with validation in apps/web/app/labs/[id]/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Instructor Creates Multiple Questions per Page (Priority: P1)

**Goal**: Enable instructors to add up to 30 questions per page with different types (MCQ, True/False, Fill in the blank)

**Independent Test**: An instructor can add multiple questions to a page, save each individually, edit questions, delete questions, and see them paginated

### Implementation for User Story 3

- [ ] T047 [US3] Implement POST /api/v1/labs/:labId/pages/:pageId/question endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T048 [US3] Implement DELETE /api/v1/labs/:labId/pages/:pageId/question/:questionId endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T049 [US3] Add question validation (type, text length, options) in apps/whatsnxt-bff/app/services/ValidationService.ts
- [ ] T050 [US3] Add 30 questions per page limit validation in apps/whatsnxt-bff/app/services/LabPageService.ts
- [ ] T051 [US3] Implement saveQuestion API call in apps/web/apis/labPage.api.ts
- [ ] T052 [US3] Implement deleteQuestion API call in apps/web/apis/labPage.api.ts
- [ ] T053 [US3] Create page editor with Question Test tab in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T054 [US3] Implement "Add Question" form with type selector in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T055 [US3] Implement individual question save/edit/delete buttons in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T056 [US3] Add question pagination (3 per view) in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T057 [US3] Add question counter display (X/30 format) in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T058 [US3] Disable "Add Question" when limit reached in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T059 [US3] Add "Back to Tests & Questions" button with context preservation in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Instructor Creates Unique Questions (Priority: P1)

**Goal**: Prevent instructors from creating duplicate or very similar questions (85% similarity threshold)

**Independent Test**: An instructor attempts to create a question that is 85% or more similar to an existing question in the lab, and the system rejects it with a clear error message

### Implementation for User Story 4

- [ ] T060 [US4] Implement fuzzy matching validation in question save endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T061 [US4] Add cross-page question similarity check in apps/whatsnxt-bff/app/services/ValidationService.ts
- [ ] T062 [US4] Return detailed error with similarity percentage and existing question in apps/whatsnxt-bff/app/services/ValidationService.ts
- [ ] T063 [US4] Display fuzzy matching error with details in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

**Checkpoint**: Question uniqueness validation working across all pages in a lab

---

## Phase 7: User Story 5 - Instructor Searches Questions Efficiently (Priority: P2)

**Goal**: Enable instructors to search questions within a page and across all pages

**Independent Test**: An instructor searches for questions using per-page search and global search, seeing filtered results in real-time

### Implementation for User Story 5

- [ ] T064 [P] [US5] Add per-page search input with real-time filtering in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T065 [P] [US5] Add "No questions match your search" empty state in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T066 [US5] Update global search to include question text, type, and options in apps/web/app/labs/[id]/page.tsx
- [ ] T067 [US5] Add results counter "Showing X of Y" in apps/web/app/labs/[id]/page.tsx

**Checkpoint**: Search functionality working at both page and lab levels

---

## Phase 8: User Story 6 - Instructor Navigates with Context Preservation (Priority: P2)

**Goal**: Enable instructors to return to the exact page they came from when navigating between pages

**Independent Test**: An instructor on Page 2 clicks "Edit Tests", makes changes, then clicks "Back to Tests & Questions" and returns to Page 2

### Implementation for User Story 6

- [ ] T068 [US6] Add URL state management for tab and page parameters in apps/web/app/labs/[id]/page.tsx
- [ ] T069 [US6] Update page editor to accept and preserve return URL parameters in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T070 [US6] Update "Back to Tests & Questions" to use return URL in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T071 [US6] Update "Edit Tests" button to include current tab and page in URL in apps/web/app/labs/[id]/page.tsx

**Checkpoint**: Navigation context preserved across all page transitions

---

## Phase 9: User Story 7 - Instructor Creates Diagram Test with Architecture Shapes (Priority: P1)

**Goal**: Enable instructors to create a diagram test by selecting an architecture type and building a diagram with specific shapes

**Independent Test**: An instructor selects AWS architecture, sees AWS shapes, drags them onto a canvas, connects them, and saves the diagram

### Implementation for User Story 7

- [ ] T072 [P] [US7] Create DiagramShapeService with getShapes method in apps/whatsnxt-bff/app/services/DiagramShapeService.ts
- [ ] T073 [US7] Implement GET /api/v1/diagram-shapes endpoint with architectureType filter in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T074 [US7] Implement POST /api/v1/labs/:labId/pages/:pageId/diagram-test endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T075 [US7] Implement DELETE /api/v1/labs/:labId/pages/:pageId/diagram-test endpoint in apps/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T076 [US7] Create diagramShape.api.ts with getShapes method in apps/web/apis/diagramShape.api.ts
- [ ] T077 [US7] Add saveDiagramTest API call in apps/web/apis/labPage.api.ts
- [ ] T078 [US7] Add deleteDiagramTest API call in apps/web/apis/labPage.api.ts
- [ ] T079 [US7] Create Diagram Test tab in page editor in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T080 [US7] Add architecture type selector in Diagram Test tab in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T081 [US7] Add prompt input field (10-2000 characters) in Diagram Test tab in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T082 [US7] Load and display shapes based on architecture type in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T083 [US7] Add "Save Diagram Test" button with validation in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

**Checkpoint**: Diagram test creation functional with architecture-specific shapes

---

## Phase 10: User Story 8 - Instructor Uses D3.js Diagram Editor (Priority: P1)

**Goal**: Integrate existing DiagramEditor component into Diagram Test tab with save/load functionality

**Independent Test**: An instructor opens the diagram editor, adds multiple shapes, connects them, moves them around, undoes actions, zooms in/out, and saves the diagram

**Note**: DiagramEditor component already exists at apps/web/components/architecture-lab/DiagramEditor.tsx

### Implementation for User Story 8

- [ ] T084 [US8] Import DiagramEditor component into page editor in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T085 [US8] Pass shapes to DiagramEditor as toolbar shapes in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T086 [US8] Implement onExport handler to capture diagram state in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T087 [US8] Save diagram state to expectedDiagramState on "Save Diagram Test" in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T088 [US8] Load existing diagram state into DiagramEditor on page load in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T089 [US8] Add validation to prevent empty diagram saves in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

**Checkpoint**: DiagramEditor fully integrated with save/load functionality

---

## Phase 11: User Story 11 - Student Reconstructs Architecture Diagram (Priority: P1)

**Goal**: Implement diagram jumbling algorithm and student test interface

**Independent Test**: A student opens a diagram test, sees shapes randomized with no connections, reconstructs the architecture by dragging shapes and creating links, submits their answer, and receives immediate grading

### Implementation for User Story 11

- [ ] T090 [P] [US11] Implement extractNestedShapes utility function in apps/web/utils/lab-utils.ts
- [ ] T091 [US11] Enhance jumbleGraph to move at least one nested shape outside in apps/web/utils/lab-utils.ts
- [ ] T092 [US11] Test jumbleGraph and validateGraph algorithms in apps/web/utils/lab-utils.ts
- [ ] T093 [US11] Create student test page at apps/web/app/labs/[id]/test/page.tsx
- [ ] T094 [US11] Implement role-based diagram display (jumbled for students, original for instructors) in apps/web/app/labs/[id]/test/page.tsx
- [ ] T095 [US11] Add submit button for student diagram in apps/web/app/labs/[id]/test/page.tsx
- [ ] T096 [US11] Display grading results with score and feedback in apps/web/app/labs/[id]/test/page.tsx
- [ ] T097 [US11] Show green checkmarks on correct connections in apps/web/app/labs/[id]/test/page.tsx
- [ ] T098 [US11] Show red X marks on incorrect connections in apps/web/app/labs/[id]/test/page.tsx

**Checkpoint**: Student diagram reconstruction and grading fully functional

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T099 [P] Add comprehensive unit tests for all services in apps/whatsnxt-bff/app/tests/unit/
- [ ] T100 [P] Add integration tests for all API endpoints in apps/whatsnxt-bff/app/tests/integration/
- [ ] T101 [P] Add contract tests for OpenAPI specs in apps/whatsnxt-bff/app/tests/contract/
- [ ] T102 [P] Add frontend unit tests for components in apps/web/__tests__/unit/
- [ ] T103 [P] Add frontend integration tests in apps/web/__tests__/integration/
- [ ] T104 [P] Add E2E tests for critical user journeys in apps/web/__tests__/e2e/
- [ ] T105 Code quality audit (cyclomatic complexity ≤5, SOLID principles) across all new code
- [ ] T106 [P] Add retry logic with exponential backoff in packages/http-client/src/index.ts
- [ ] T107 [P] Add detailed logging for all API operations in apps/whatsnxt-bff/app/middleware/logger.ts
- [ ] T108 [P] Optimize database queries with indexes in apps/whatsnxt-bff/app/models/
- [ ] T109 [P] Add API documentation with Swagger UI in apps/whatsnxt-bff/app/routes/
- [ ] T110 [P] Update README with feature documentation in docs/
- [ ] T111 Validate all scenarios from quickstart.md in specs/001-lab-diagram-test/quickstart.md
- [ ] T112 Performance testing (load time <2s, API response <1s) across all endpoints

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - US1 (Labs Management) → Can start after Foundational
  - US2 (Lab Detail/Pages) → Depends on US1 (needs lab to exist)
  - US3 (Multiple Questions) → Depends on US2 (needs page to exist)
  - US4 (Question Uniqueness) → Depends on US3 (needs questions to validate)
  - US5 (Search) → Depends on US3 (needs questions to search)
  - US6 (Navigation Context) → Depends on US2 (needs pages to navigate)
  - US7 (Diagram Test) → Depends on US2 (needs page to add diagram)
  - US8 (DiagramEditor Integration) → Depends on US7 (needs diagram test structure)
  - US11 (Student Interface) → Depends on US8 (needs complete diagram functionality)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 completion - Needs labs to exist
- **User Story 3 (P1)**: Depends on US2 completion - Needs pages to exist
- **User Story 4 (P1)**: Depends on US3 completion - Needs questions to validate
- **User Story 5 (P2)**: Depends on US3 completion - Needs questions to search
- **User Story 6 (P2)**: Depends on US2 completion - Needs pages to navigate
- **User Story 7 (P1)**: Depends on US2 completion - Needs pages to add diagram
- **User Story 8 (P1)**: Depends on US7 completion - Needs diagram test structure
- **User Story 11 (P1)**: Depends on US8 completion - Needs complete diagram functionality

### Within Each User Story

- Backend models before services
- Services before API routes
- API routes before frontend API clients
- Frontend API clients before UI components
- Core implementation before validation and error handling
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- T016 (LabService) can be developed in parallel with T006-T010 (Models) once models are defined
- Within US1: T023-T029 (Frontend API client) can be written while backend is being tested
- Within US2: T040 (labPage.api.ts) can be written in parallel with T041-T046 (UI components)
- Within US7: T072-T075 (Backend) and T076-T078 (API client) can proceed independently once models exist
- All Polish tasks marked [P] can run in parallel once feature complete

---

## Parallel Example: User Story 1

```bash
# After Foundational phase completes, all US1 backend work can start together:
Task: "Create LabService with createLab, getLabs, getLabById..." (T016)
Task: "Implement POST /api/v1/labs endpoint" (T017)
Task: "Implement GET /api/v1/labs endpoint with pagination" (T018)

# Once backend APIs are ready, all frontend API client work can start:
Task: "Remove ALL mock implementations from apps/web/apis/lab.api.ts" (T023)
Task: "Implement real createLab API call" (T024)
Task: "Implement real getLabs API call" (T025)

# Once API client is ready, all UI enhancements can start in parallel:
Task: "Add labType and architectureType fields to create lab form" (T030)
Task: "Add pagination UI for labs list" (T031)
Task: "Add sorting by createdAt descending" (T032)
Task: "Add delete button with confirmation dialog" (T033)
```

---

## Implementation Strategy

### MVP First (User Stories 1-4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Labs Management)
4. Complete Phase 4: User Story 2 (Lab Detail/Pages)
5. Complete Phase 5: User Story 3 (Multiple Questions)
6. Complete Phase 6: User Story 4 (Question Uniqueness)
7. **STOP and VALIDATE**: Test all 4 user stories independently
8. Deploy/demo if ready

**MVP Scope**: Instructors can create labs, manage pages, add up to 30 unique questions per page

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic lab management!)
3. Add User Story 2 → Test independently → Deploy/Demo (Lab detail editing!)
4. Add User Story 3 → Test independently → Deploy/Demo (Multiple questions!)
5. Add User Story 4 → Test independently → Deploy/Demo (Question uniqueness!)
6. Add User Story 7 + 8 → Test independently → Deploy/Demo (Diagram tests!)
7. Add User Story 11 → Test independently → Deploy/Demo (Student interface!)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 5 (Labs + Search)
   - Developer B: User Story 2 + User Story 6 (Pages + Navigation)
   - Developer C: User Story 3 + User Story 4 (Questions + Uniqueness)
   - Developer D: User Story 7 + User Story 8 (Diagram Test + Editor)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **CRITICAL**: Remove ALL mock implementations (T023) - violates constitution
- **CRITICAL**: Complete backend before frontend for each user story
- **DiagramEditor component**: Already exists and is fully functional - only integration needed
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All new code must follow SOLID principles and maintain cyclomatic complexity ≤5
- All tests must use Vitest (not Jest)
- No mock data or APIs in any environment

---

## Task Statistics

**Total Tasks**: 112
**Task Distribution by User Story**:
- Setup: 5 tasks
- Foundational: 10 tasks
- User Story 1: 19 tasks
- User Story 2: 12 tasks
- User Story 3: 13 tasks
- User Story 4: 4 tasks
- User Story 5: 4 tasks
- User Story 6: 4 tasks
- User Story 7: 12 tasks
- User Story 8: 6 tasks
- User Story 11: 9 tasks
- Polish: 14 tasks

**Parallel Opportunities**: 28 tasks marked [P]

**Suggested MVP Scope**: Setup + Foundational + US1 + US2 + US3 + US4 (53 tasks)

**Estimated Timeline**:
- Setup + Foundational: 1 week
- MVP (US1-US4): 3 weeks
- Diagram Features (US7-US8): 2 weeks
- Student Interface (US11): 1 week
- Polish: 1 week
- **Total**: ~8 weeks with 1 developer, ~4 weeks with 2 developers

---

**Generated**: 2025-12-15
**Feature**: Lab Diagram Tests (001-lab-diagram-test)
**Status**: 80% complete (backend + some frontend), integration pending
**Next Phase**: DiagramEditor integration (US8), then student interface (US11)
