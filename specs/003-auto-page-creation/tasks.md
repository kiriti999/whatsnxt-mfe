# Tasks: Auto-Create Page After 3 Questions

**Input**: Design documents from `/specs/003-auto-page-creation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Turbo monorepo structure
  - Frontend: `apps/web/` (Next.js 16 + React 19)
  - Backend: `apps/whatsnxt-bff/` (no changes needed)
  - Shared packages: `packages/constants/`, `packages/core-types/`
- Paths follow existing monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared constants setup

- [ ] T001 Create lab constants file in packages/constants/src/lab.constants.ts with QUESTIONS_PER_PAGE_THRESHOLD = 3
- [ ] T002 Add AUTO_PAGE_CREATION_MESSAGES constants to packages/constants/src/lab.constants.ts
- [ ] T003 Add NOTIFICATION_DURATIONS constants to packages/constants/src/lab.constants.ts
- [ ] T004 Export lab constants from packages/constants/src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook implementation that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create useAutoPageCreation hook file in apps/web/hooks/useAutoPageCreation.ts
- [ ] T006 Implement UseAutoPageCreationOptions interface in apps/web/hooks/useAutoPageCreation.ts
- [ ] T007 Implement UseAutoPageCreationResult interface in apps/web/hooks/useAutoPageCreation.ts
- [ ] T008 Implement question count state management in apps/web/hooks/useAutoPageCreation.ts
- [ ] T009 Implement initial question count fetching logic in useEffect in apps/web/hooks/useAutoPageCreation.ts
- [ ] T010 Implement onQuestionSaved callback with edit detection in apps/web/hooks/useAutoPageCreation.ts
- [ ] T011 Implement auto-page-creation trigger logic (when count reaches 3) in apps/web/hooks/useAutoPageCreation.ts
- [ ] T012 Implement page creation API call using labApi.createLabPage() in apps/web/hooks/useAutoPageCreation.ts
- [ ] T013 Implement navigation using useRouter().push() after successful page creation in apps/web/hooks/useAutoPageCreation.ts
- [ ] T014 Implement success notification using notifications.show() in apps/web/hooks/useAutoPageCreation.ts
- [ ] T015 Implement error handling with try/catch and error notification in apps/web/hooks/useAutoPageCreation.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Seamless Multi-Page Lab Creation (Priority: P1) 🎯 MVP

**Goal**: Enable instructors to add questions across multiple pages without manual navigation interruption

**Independent Test**: Create a lab, add 3 questions to page 1, verify page 2 is auto-created and instructor is redirected to it, verify success notification appears

### Implementation for User Story 1

- [X] T016 [US1] Import useAutoPageCreation hook in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T017 [US1] Add state for currentPageNumber in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T018 [US1] Initialize useAutoPageCreation hook with labId, currentPageId, currentPageNumber in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T019 [US1] Modify handleQuestionSave to call onQuestionSaved after successful save in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T020 [US1] Pass question response data and isEdit flag to onQuestionSaved in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T021 [US1] Add optional loading overlay component (Loader with overlay prop) during page creation in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T022 [US1] Update QuestionForm component to detect edit mode using existingQuestion?.id in apps/web/components/Lesson/question.tsx
- [X] T023 [US1] Pass isEdit flag to onSubmit callback in apps/web/components/Lesson/question.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Test by creating a lab, adding 3 questions, and verifying automatic page creation with redirect.

---

## Phase 4: User Story 2 - Graceful Failure Handling (Priority: P2)

**Goal**: Handle page creation failures gracefully to prevent data loss and provide manual fallback option

**Independent Test**: Simulate page creation failure (mock server error or network disconnect), save 3rd question, verify error notification appears, question is still saved, and instructor can manually create page

**Dependencies**: Requires User Story 1 to be complete (builds on existing auto-creation flow)

### Implementation for User Story 2

- [X] T024 [US2] Verify error state handling in useAutoPageCreation hook try/catch block in apps/web/hooks/useAutoPageCreation.ts
- [X] T025 [US2] Verify error notification displays correct message and duration in apps/web/hooks/useAutoPageCreation.ts
- [X] T026 [US2] Verify question persistence happens before page creation attempt in apps/web/hooks/useAutoPageCreation.ts
- [X] T027 [US2] Verify instructor remains on current page when page creation fails in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T028 [US2] Add error logging with console.error for debugging page creation failures in apps/web/hooks/useAutoPageCreation.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Test failure scenarios with network errors and verify graceful degradation.

---

## Phase 5: User Story 3 - Edit Mode Safety (Priority: P2)

**Goal**: Prevent unwanted page creation when instructors edit existing questions

**Independent Test**: Create a page with 3 questions, edit one of them, save the edit, verify no new page is created

**Dependencies**: Requires User Story 1 to be complete (extends edit detection logic)

### Implementation for User Story 3

- [X] T029 [US3] Verify isEdit detection logic checks for question.id presence in apps/web/hooks/useAutoPageCreation.ts
- [X] T030 [US3] Verify onQuestionSaved returns early when isEdit is true in apps/web/hooks/useAutoPageCreation.ts
- [X] T031 [US3] Verify QuestionForm correctly detects edit mode with !!existingQuestion?.id in apps/web/components/Lesson/question.tsx
- [X] T032 [US3] Verify questionId is passed to saveQuestion API for edit operations in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [ ] T033 [US3] Test editing questions on pages with exactly 3 questions to ensure no auto-creation triggers

**Checkpoint**: All edit mode scenarios should now be safe. Test by editing questions on pages with various question counts.

---

## Phase 6: User Story 4 - Question Type Consistency (Priority: P3)

**Goal**: Ensure all question types count equally toward the 3-question threshold

**Independent Test**: Create a page with 2 multiple choice questions and 1 diagram test, verify page auto-creation triggers after the 3rd question regardless of type

**Dependencies**: Requires User Story 1 to be complete (validates counting logic)

### Implementation for User Story 4

- [X] T034 [US4] Verify question counting logic in useAutoPageCreation treats all types equally in apps/web/hooks/useAutoPageCreation.ts
- [X] T035 [US4] Verify getLabPageById response includes all question types in count in apps/web/hooks/useAutoPageCreation.ts
- [ ] T036 [US4] Test with multiple choice questions (type: 'MCQ')
- [ ] T037 [US4] Test with True/False questions (type: 'True/False')
- [ ] T038 [US4] Test with Fill in the blank questions (type: 'Fill in the blank')
- [ ] T039 [US4] Test with mixed question types (2 MCQ + 1 True/False, etc.)

**Checkpoint**: All question types should trigger auto-creation consistently. Test various combinations of question types.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T040 [P] Add JSDoc comments to useAutoPageCreation hook functions in apps/web/hooks/useAutoPageCreation.ts
- [X] T041 [P] Add TypeScript type safety checks for all hook parameters and return values
- [X] T042 [P] Verify cyclomatic complexity ≤5 for all functions in useAutoPageCreation hook
- [X] T043 [P] Add optional enabled flag to useAutoPageCreation for feature flag control
- [X] T044 [P] Update packages/constants/README.md with documentation for new lab constants (if README exists)
- [ ] T045 Verify manual "Add New Page" button still works on lab detail page
- [ ] T046 Verify existing auto-show question form feature (002) works on newly created pages
- [X] T047 Run type checking with pnpm check-types in repository root
- [X] T048 Run linting with pnpm lint in repository root
- [ ] T049 Test all acceptance scenarios from spec.md for each user story
- [ ] T050 Run quickstart.md manual testing checklist to validate complete feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Builds on User Story 1 (error handling for auto-creation flow)
  - User Story 3 (P2): Extends User Story 1 (edit detection in auto-creation flow)
  - User Story 4 (P3): Validates User Story 1 (question type counting logic)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - MVP delivery target
- **User Story 2 (P2)**: Requires US1 complete - Adds error handling to existing flow
- **User Story 3 (P2)**: Requires US1 complete - Adds edit mode safety to existing flow
- **User Story 4 (P3)**: Requires US1 complete - Validates type consistency

### Within Each User Story

- Setup constants before hook implementation
- Hook implementation before page editor integration
- Question form updates before end-to-end testing
- Core implementation before validation/testing tasks

### Parallel Opportunities

- Setup tasks (T001-T004) can all run in parallel (different sections of same file)
- Polish tasks marked [P] (T040-T044) can run in parallel (different files/independent checks)
- Once Foundational phase completes, User Stories 2, 3, and 4 can be worked on in parallel by different team members (though US1 must complete first)

---

## Parallel Example: Setup Phase

```bash
# Launch all setup tasks together:
Task: "Create lab constants file with QUESTIONS_PER_PAGE_THRESHOLD"
Task: "Add AUTO_PAGE_CREATION_MESSAGES constants"
Task: "Add NOTIFICATION_DURATIONS constants"
Task: "Export lab constants from index"
```

---

## Parallel Example: Polish Phase

```bash
# Launch all documentation and validation tasks together:
Task: "Add JSDoc comments to hook functions"
Task: "Add TypeScript type safety checks"
Task: "Verify cyclomatic complexity"
Task: "Update constants README"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (constants)
2. Complete Phase 2: Foundational (hook implementation)
3. Complete Phase 3: User Story 1 (page editor integration)
4. **STOP and VALIDATE**: Test User Story 1 independently with quickstart checklist
5. Deploy/demo if ready

**Estimated Time**: 4-6 hours (per quickstart.md)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test error scenarios → Deploy/Demo (robust error handling)
4. Add User Story 3 → Test edit workflows → Deploy/Demo (edit safety)
5. Add User Story 4 → Test question types → Deploy/Demo (type consistency)
6. Polish phase → Final validation → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (dependencies)
2. Once Foundational is done:
   - Developer A: User Story 1 (core functionality)
   - Once US1 complete:
     - Developer A: User Story 2 (error handling)
     - Developer B: User Story 3 (edit safety)
     - Developer C: User Story 4 (type validation)
3. Stories integrate independently without conflicts

---

## Notes

- [P] tasks = different files or independent operations, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No new backend changes required - reuses existing API endpoints
- No new database schema changes - uses existing entities
- Feature can be controlled via optional `enabled` flag for gradual rollout
- Manual "Add New Page" workflow remains fully functional (fallback option)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Metrics (from spec.md)

- **SC-001**: Page transition time < 2 seconds (down from 15-20 seconds)
- **SC-002**: 95% auto-creation success rate
- **SC-003**: Zero unintentional page creations during edits
- **SC-004**: Zero data loss during auto-page-creation
- **SC-005**: Manual page creation works 100% of the time
- **SC-006**: 12-question lab creation time reduced by 45-60 seconds
- **SC-007**: Error messages displayed within 1 second

---

## Risk Mitigation

- **Risk**: Auto-creation triggers on edits → **Mitigation**: US3 validates edit detection
- **Risk**: Page creation failure loses question → **Mitigation**: US2 ensures question saves first
- **Risk**: Multiple rapid saves create duplicate pages → **Mitigation**: Count logic prevents (checked in hook)
- **Risk**: Feature breaks manual workflow → **Mitigation**: Phase 7 validates manual flow still works
- **Risk**: Feature conflicts with existing auto-show form → **Mitigation**: Phase 7 validates feature 002 integration

---

## Total Task Count: 50 tasks

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 11 tasks
- **Phase 3 (User Story 1)**: 8 tasks
- **Phase 4 (User Story 2)**: 5 tasks
- **Phase 5 (User Story 3)**: 5 tasks
- **Phase 6 (User Story 4)**: 6 tasks
- **Phase 7 (Polish)**: 11 tasks

**MVP Scope (Recommended)**: Phases 1-3 only (23 tasks, ~4-6 hours)

**Full Feature**: All phases (50 tasks, ~8-12 hours total)
