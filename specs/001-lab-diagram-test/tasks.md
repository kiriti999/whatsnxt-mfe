# Tasks: Lab Diagram Tests

**Input**: Design documents from `/specs/001-lab-diagram-test/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by phase and user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project & Backend Initialization)

**Purpose**: Initialize new packages and the `whatsnxt-bff` service structure.

- [x] T001 Create `apps/whatsnxt-bff` directory structure (src, src/config, src/middleware, src/routes, src/controllers, src/services, src/models, tests).
- [x] T002 Create `package.json` for `apps/whatsnxt-bff` with basic Express.js, Mongoose, and dev dependencies.
- [x] T003 Create `tsconfig.json` for `apps/whatsnxt-bff`.
- [x] T004 Create `apps/whatsnxt-bff/src/index.ts` with basic Express app setup.
- [x] T005 Create `apps/whatsnxt-bff/.env` for `MONGO_URI`.
- [x] T006 Create `apps/whatsnxt-bff/src/config/db.ts` for MongoDB connection.
- [x] T007 Update `apps/whatsnxt-bff/src/index.ts` to use `connectDB`.
- [x] T008 [P] Create `packages/diagram-core` directory structure (src, src/state, src/shapes, types, __mocks__).
- [x] T009 [P] Create `packages/diagram-core/package.json` with basic dependencies.
- [x] T010 [P] Create `packages/diagram-core/tsconfig.json`.
- [x] T011 [P] Create `packages/diagram-core/webpack.config.js`.
- [x] T012 [P] Create `packages/diagram-core/Global.d.ts`.
- [x] T013 [P] Create `packages/diagram-core/index.ts`.
- [x] T014 [P] Create `packages/diagram-core/__mocks__/stylemock.css`.
- [x] T015 Update `pnpm-workspace.yaml` to include `apps/whatsnxt-bff` and `packages/diagram-core`.
- [x] T016 Run `pnpm install` to install all new dependencies.
- [x] T017 [P] Create placeholder authentication middleware in `apps/whatsnxt-bff/src/middleware/auth.middleware.ts`.
- [x] T018 [P] Create placeholder logging middleware in `apps/whatsnxt-bff/src/middleware/log.middleware.ts`.
- [x] T019 [P] Create placeholder global error handling middleware in `apps/whatsnxt-bff/src/middleware/error.middleware.ts`.
- [x] T020 [P] Update `.vscode/settings.json` to include `diagram-core` association.

---

## Phase 2: Foundational (Backend Models & Services)

**Purpose**: Core data models and services that MUST be complete before API endpoints are implemented.

- [x] T021 Implement Mongoose schema for the `Lab` entity in `apps/whatsnxt-bff/src/models/lab.model.ts` based on `data-model.md`.
- [x] T022 Implement Mongoose schema for the `LabPage` entity in `apps/whatsnxt-bff/src/models/labPage.model.ts` based on `data-model.md`.
- [x] T023 Create a `LabService` in `apps/whatsnxt-bff/src/services/lab.service.ts` with placeholder methods for CRUD operations on Labs.
- [x] T024 Create a `LabPageService` in `apps/whatsnxt-bff/src/services/labPage.service.ts` with placeholder methods for CRUD operations on Lab Pages.

---

## Phase 3: User Story 1 - Instructor Creates a Lab with Questions and Diagrams (Priority: P1) 🎯 MVP

**Goal**: Allow an instructor to create a multi-page lab with questions and diagrams, save it as a draft, and publish it.

### Backend API Implementation (`apps/whatsnxt-bff`)

- [x] T025 [US1] Implement `POST /api/labs` endpoint and `createLab` service method.
- [x] T026 [US1] Implement `GET /api/labs/:labId` endpoint and `getLabById` service method.
- [x] T027 [US1] Implement `POST /api/labs/:labId/pages` endpoint and `addPageToLab` service method.
- [x] T028 [US1] Implement `PUT /api/labs/:labId/pages/:pageId` endpoint and `updateLabPage` service method for saving page content.
- [x] T029 [US1] Implement `POST /api/labs/:labId/publish` endpoint and `publishLab` service method.
- [x] T030 [US1] Integrate authentication middleware on relevant API routes.
- [x] T031 [US1] Integrate logging middleware on relevant API routes.
- [x] T032 [US1] Integrate error handling middleware.

### Frontend Core Package Implementation (`packages/diagram-core`)

- [x] T033 [P] [US1] Implement state management for the diagram editor (Zustand) in `packages/diagram-core/src/state/editor.store.ts`.
- [x] T034 [P] [US1] Create generic shape components (e.g., Box, Circle, Line) in `packages/diagram-core/src/shapes/`.

### Frontend Application Implementation (`apps/web`)

- [x] T035 [US1] Create the main lab creation route and page component at `apps/web/app/lab/create/page.tsx`.
- [x] T036 [US1] Implement the linear stepper navigation UI within `apps/web/app/lab/create/page.tsx`.
- [x] T037 [P] [US1] Create the `QuestionEditor` component in `apps/web/app/lab/components/QuestionEditor.tsx`.
- [x] T038 [P] [US1] Create the `DiagramCanvas` component in `apps/web/app/lab/components/DiagramEditor/DiagramCanvas.tsx`.
- [x] T039 [P] [US1] Create the `ShapePalette` component in `apps/web/app/lab/components/DiagramEditor/ShapePalette.tsx`, consuming shapes from `diagram-core`.
- [x] T040 [US1] Integrate the API client (`@whatsnxt/http-client`) to connect the lab creation UI with the `whatsnxt-bff` backend endpoints.
- [x] T041 [US1] Implement the auto-save functionality to call the `updateLabPage` endpoint when a user navigates between steps.
- [x] T042 [US1] Implement the "Publish" button functionality to call the `publishLab` endpoint.

### Testing (Vitest)

- [x] T043 [P] [US1] Write unit tests for the `whatsnxt-bff` services.
- [x] T044 [P] [US1] Write integration tests for the new `whatsnxt-bff` API endpoints.
- [x] T045 [P] [US1] Write unit tests for the `QuestionEditor` and `DiagramCanvas` React components.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T046 [P] Add loading skeletons/spinners to the lab creation UI for a better user experience during API calls.
- [x] T047 [P] Implement comprehensive error handling and display user-friendly notifications for API or validation errors.
- [x] T048 [P] Create HLD and LLD diagrams for the lab diagram feature and add them to the `specs/001-lab-diagram-test/` directory, as required by Constitution VII.
- [x] T049 Ensure the UI is responsive and accessible according to project standards.

---

## Dependencies & Parallel Execution

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
# These tasks are placeholders and would be populated with actual test file paths
- [ ] TXXX [P] [US1] Write contract tests for Lab API in `apps/whatsnxt-bff/tests/api/lab.test.ts`
- [ ] TXXX [P] [US1] Write unit tests for LabService in `apps/whatsnxt-bff/src/services/lab.service.test.ts`

# Launch all models for User Story 1 together:
- [ ] TXXX [P] [US1] Implement Lab model in `apps/whatsnxt-bff/src/models/lab.model.ts`
- [ ] TXXX [P] [US1] Implement LabPage model in `apps/whatsnxt-bff/src/models/labPage.model.ts`
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
