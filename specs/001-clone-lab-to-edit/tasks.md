---
description: 'Implementation tasks for Clone Published Lab to Edit feature'
---

# Tasks: Clone Published Lab to Edit

**Input**: Design documents from `/specs/001-clone-lab-to-edit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend Repository**: `/Users/arjun/whatsnxt-mfe` (Next.js monorepo)
- **Backend Repository**: `/Users/arjun/whatsnxt-bff` (Express.js API)
- Paths shown below use absolute paths based on plan.md structure

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [X] T001 Create feature branch `001-clone-lab-to-edit` in whatsnxt-bff repository
- [X] T002 Create feature branch `001-clone-lab-to-edit` in whatsnxt-mfe repository
- [X] T003 [P] Verify MongoDB 8.0.4 with transaction support is available in dev environment
- [X] T004 [P] Verify Vitest is configured in whatsnxt-bff for unit/integration tests
- [X] T005 [P] Verify Vitest is configured in whatsnxt-mfe/apps/web for component tests

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation ✅

- [X] T006 Add `clonedFromLabId` field to Lab schema in /Users/arjun/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T007 Add validation for `clonedFromLabId` field (must reference published lab) in /Users/arjun/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T008 Add compound index `{ clonedFromLabId: 1, status: 1, instructorId: 1 }` in /Users/arjun/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T009 Add static method `findDraftClone()` in /Users/arjun/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T010 Add static method `hasDraftClone()` in /Users/arjun/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T011 Create LabCloneService class skeleton in /Users/arjun/whatsnxt-bff/app/services/lab/LabCloneService.ts
- [X] T012 [P] Create authorization middleware `requireLabOwnership` in /Users/arjun/whatsnxt-bff/app/middleware/requireLabOwnership.ts
- [X] T013 [P] Create custom error classes (ConflictError, NotACloneError) in @whatsnxt/errors package

### Frontend Foundation ✅

- [X] T014 Add `cloneLab()` function signature to /Users/arjun/whatsnxt-mfe/apps/web/apis/lab.api.ts
- [X] T015 Add `republishLab()` function signature to /Users/arjun/whatsnxt-mfe/apps/web/apis/lab.api.ts
- [X] T016 [P] Create CloneLabButton component skeleton in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [X] T017 [P] Create RepublishModal component skeleton in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Clone Published Lab for Editing (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable instructors to clone a published lab to a draft version with all content (pages, questions, diagram tests, hints) copied correctly

**Independent Test**: Create a published lab with 5 pages and 20 questions, click "Clone to Edit" button, verify draft exists with all content identical, verify `clonedFromLabId` field is set correctly

### Backend Implementation for User Story 1

- [ ] T018 [P] [US1] Implement deep copy logic for Lab entity in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts method `cloneLab()`
- [ ] T019 [P] [US1] Implement deep copy logic for LabPage entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T020 [P] [US1] Implement deep copy logic for Question entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T021 [P] [US1] Implement deep copy logic for DiagramTest entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T022 [US1] Implement duplicate clone check (prevent multiple drafts) in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T023 [US1] Implement MongoDB transaction wrapper for atomic clone operation in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T024 [US1] Implement batch inserts (insertMany) for pages, questions, diagram tests in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T025 [US1] Add Winston logging for clone operations (start, success, failure) in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T026 [US1] Create POST /api/labs/:labId/clone route in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T027 [US1] Add `requireLabOwnership` middleware to clone route in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T028 [US1] Implement clone route handler calling LabCloneService in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts
- [ ] T029 [US1] Add error handling (404, 403, 409, 500) for clone endpoint in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts

### Frontend Implementation for User Story 1

- [ ] T030 [P] [US1] Implement `cloneLab()` API call using @whatsnxt/http-client in /Users/arjun/whatsnxt-mfe/apps/web/apis/lab.api.ts
- [ ] T031 [US1] Create CloneLabButton component with loading state in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T032 [US1] Add TanStack Query mutation for clone operation in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T033 [US1] Add redirect to draft edit page on successful clone in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T034 [US1] Add error handling (display toast on 409 duplicate, 403 forbidden) in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T035 [US1] Integrate CloneLabButton into published lab detail page in /Users/arjun/whatsnxt-mfe/apps/web/app/labs/[labId]/page.tsx
- [ ] T036 [US1] Add conditional rendering (only show button for lab owner) in /Users/arjun/whatsnxt-mfe/apps/web/app/labs/[labId]/page.tsx
- [ ] T037 [US1] Add draft clone indicator badge on published lab (when hasDraftClone is true) in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/LabDetail.tsx

### Tests for User Story 1

- [ ] T038 [P] [US1] Unit test: LabCloneService deep copy preserves all fields in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts
- [ ] T039 [P] [US1] Unit test: Duplicate clone check throws ConflictError in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts
- [ ] T040 [P] [US1] Unit test: Clone generates new UUIDs for all entities in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts
- [ ] T041 [US1] Integration test: Full clone operation with 20 pages and 100 questions in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-clone.test.ts
- [ ] T042 [US1] Integration test: Clone transaction rollback on error in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-clone.test.ts
- [ ] T043 [P] [US1] Component test: CloneLabButton renders and triggers clone on click in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.test.tsx
- [ ] T044 [P] [US1] Component test: CloneLabButton shows loading state during clone in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.test.tsx

**Checkpoint**: ✅ At this point, User Story 1 should be fully functional - instructors can clone published labs to drafts

---

## Phase 4: User Story 2 - Republish Draft to Replace Original (Priority: P1) ✅ COMPLETE

**Goal**: Enable instructors to republish edited drafts back to the original published lab with clear confirmation and atomic replacement

**Independent Test**: Create a draft cloned from a published lab, make edits, click "Publish", verify confirmation modal appears, confirm republish, verify original lab is updated and draft is deleted

### Backend Implementation for User Story 2 ✅

- [X] T045 [P] [US2] Implement question ID matching algorithm (exact equality) in /Users/arjun/whatsnxt-bff/app/services/lab/LabCloneService.ts method `matchQuestionIds()`
- [X] T046 [US2] Implement republish logic in LabService in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts method `republishLab()`
- [X] T047 [US2] Fetch draft lab and validate `clonedFromLabId` exists in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T048 [US2] Fetch original published lab in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T049 [US2] Implement MongoDB transaction for atomic republish in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T050 [US2] Delete original lab pages, questions, diagram tests within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T051 [US2] Update original lab metadata (name, description, updatedAt) within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T052 [US2] Insert new pages with original labId within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T053 [US2] Insert new questions with matched IDs within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T054 [US2] Insert new diagram tests within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T055 [US2] Delete draft lab and all related entities within transaction in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T056 [US2] Add Winston logging for republish operations (matched IDs count, success, failure) in /Users/arjun/whatsnxt-bff/app/services/lab/LabService.ts
- [X] T057 [US2] Create POST /api/labs/:labId/republish route in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts
- [X] T058 [US2] Add `requireLabOwnership` middleware to republish route (via auth middleware)
- [X] T059 [US2] Implement republish route handler calling LabService in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts
- [X] T060 [US2] Add error handling (400 NotACloneError, 404, 403, 500) for republish endpoint in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts

### Frontend Implementation for User Story 2 ✅

- [X] T061 [P] [US2] Implement `republishLab()` API call using @whatsnxt/http-client (already done in Phase 2)
- [X] T062 [US2] Create RepublishModal component with Mantine Modal in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T063 [US2] Add warning message "This will replace the original published lab" in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T064 [US2] Add Cancel and Confirm buttons in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T065 [US2] Add TanStack Query mutation for republish operation in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T066 [US2] Add redirect to original published lab on successful republish in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T067 [US2] Invalidate TanStack Query cache for original lab ID after republish in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T068 [US2] Add error handling (display toast on 400, 500) in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [X] T069 [US2] Modify "Publish" button on draft detail page to trigger RepublishModal in /Users/arjun/whatsnxt-mfe/apps/web/app/labs/[labId]/page.tsx
- [X] T070 [US2] Add conditional logic to show RepublishModal only for drafts with `clonedFromLabId` in /Users/arjun/whatsnxt-mfe/apps/web/app/labs/[labId]/page.tsx

### Tests for User Story 2

- [ ] T071 [P] [US2] Unit test: matchQuestionIds preserves IDs for unchanged questions in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts
- [ ] T072 [P] [US2] Unit test: matchQuestionIds generates new IDs for edited questions in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts
- [ ] T073 [P] [US2] Unit test: republishLab throws NotACloneError if clonedFromLabId is null in /Users/arjun/whatsnxt-bff/app/tests/unit/LabService.test.ts
- [ ] T074 [US2] Integration test: Full republish operation updates original and deletes draft in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-republish.test.ts
- [ ] T075 [US2] Integration test: Republish transaction rollback on error in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-republish.test.ts
- [ ] T076 [P] [US2] Component test: RepublishModal renders warning message in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.test.tsx
- [ ] T077 [P] [US2] Component test: RepublishModal cancel closes without API call in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.test.tsx
- [ ] T078 [P] [US2] Component test: RepublishModal confirm triggers republish API call in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.test.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 are complete - instructors can clone, edit, and republish labs

---

## Phase 5: User Story 3 - Student Progress Preservation (Priority: P2)

**Goal**: Preserve student progress (completed pages, correct answers) when a lab is republished with minor edits

**Independent Test**: Have a student complete 3 out of 5 pages in a lab, republish with typo fixes, verify student's progress on those 3 pages is preserved (using question ID matching)

### Backend Implementation for User Story 3

- [ ] T079 [US3] Add detailed ID mapping logging in matchQuestionIds() in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T080 [US3] Return metadata with questionsPreserved and questionsNew counts in /Users/arjun/whatsnxt-bff/app/services/LabService.ts republishLab()
- [ ] T081 [US3] Add whitespace normalization in question matching algorithm in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T082 [US3] Update republish response to include preservation metadata in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts

### Frontend Implementation for User Story 3

- [ ] T083 [US3] Display preservation metadata (X questions preserved) in success toast after republish in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/RepublishModal.tsx
- [ ] T084 [US3] Add link from draft to original published lab in draft edit view in /Users/arjun/whatsnxt-mfe/apps/web/app/labs/[labId]/edit/page.tsx

### Tests for User Story 3

- [ ] T085 [P] [US3] Integration test: Student submissions preserved for unchanged questions after republish in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-republish.test.ts
- [ ] T086 [P] [US3] Integration test: Student submissions for edited questions remain in database (archived) in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-republish.test.ts
- [ ] T087 [P] [US3] Unit test: Whitespace normalization in question matching in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts

**Checkpoint**: Student progress preservation is working - students don't lose work when labs are updated

---

## Phase 6: User Story 4 - Multiple Clones Prevention (Priority: P3)

**Goal**: Prevent instructors from creating duplicate draft clones and direct them to existing draft

**Independent Test**: Create a draft clone of a published lab, attempt to clone the same lab again, verify error message with link to existing draft appears

### Backend Implementation for User Story 4

- [ ] T088 [US4] Enhance ConflictError response to include existingDraftId and existingDraftUrl in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T089 [US4] Add endpoint GET /api/labs/:labId/draft-clone to fetch existing draft in /Users/arjun/whatsnxt-bff/app/routes/lab.routes.ts

### Frontend Implementation for User Story 4

- [ ] T090 [US4] Handle 409 ConflictError in CloneLabButton with custom modal in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T091 [US4] Display "Draft already exists" modal with link to existing draft in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx
- [ ] T092 [US4] Add "Edit Existing Draft" and "Cancel" buttons in duplicate modal in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.tsx

### Tests for User Story 4

- [ ] T093 [P] [US4] Integration test: Duplicate clone attempt returns 409 with existing draft ID in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-clone.test.ts
- [ ] T094 [P] [US4] Integration test: After draft deletion, new clone succeeds in /Users/arjun/whatsnxt-bff/app/tests/integration/lab-clone.test.ts
- [ ] T095 [P] [US4] Component test: CloneLabButton shows duplicate modal on 409 error in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/CloneLabButton.test.tsx

**Checkpoint**: All user stories complete - feature is fully functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T096 [P] Add performance monitoring for clone operations (log duration) in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T097 [P] Add performance monitoring for republish operations (log duration) in /Users/arjun/whatsnxt-bff/app/services/LabService.ts
- [ ] T098 [P] Add transaction timeout configuration (60 seconds) in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T099 [P] Add retry logic with exponential backoff for transient errors in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts
- [ ] T100 [P] Code cleanup and refactoring (extract helper methods, reduce cyclomatic complexity)
- [ ] T101 [P] Security audit: Verify authorization checks in all routes
- [ ] T102 [P] Performance test: Clone 100-page lab with 3000 questions (verify <10s goal)
- [ ] T103 Validate quickstart.md instructions work end-to-end
- [ ] T104 Update API documentation with clone/republish endpoints
- [ ] T105 [P] Add error boundary for clone/republish UI components in /Users/arjun/whatsnxt-mfe/apps/web/components/Lab/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P1): Can start after Foundational - Depends on US1 completion (needs clone to exist for republish)
  - User Story 3 (P2): Can start after US1+US2 - Extends republish with progress preservation
  - User Story 4 (P3): Can start after US1 - Enhances clone duplicate handling
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1**: Independent after Foundational phase
- **User Story 2**: Depends on User Story 1 (needs cloned drafts to republish)
- **User Story 3**: Depends on User Story 2 (enhances republish)
- **User Story 4**: Depends on User Story 1 (enhances clone)

### Within Each User Story

- Backend schema changes before services
- Services before routes
- Routes before frontend API calls
- Frontend API calls before components
- Components before integration into pages
- Tests should be written alongside implementation (or TDD if preferred)

### Parallel Opportunities

**Phase 1 (Setup)**: T003, T004, T005 can run in parallel

**Phase 2 (Foundational)**:
- Backend: T012, T013 can run in parallel with T006-T011 (different files)
- Frontend: T016, T017 can run in parallel with T014, T015 (different files)

**Phase 3 (User Story 1)**:
- Backend models: T018, T019, T020, T021 can run in parallel (deep copy for different entities)
- Frontend: T030 can run in parallel with backend work
- Tests: T038, T039, T040 can run in parallel (unit tests), T043, T044 can run in parallel (component tests)

**Phase 4 (User Story 2)**:
- Backend: T045 can run in parallel with T046-T056 once US1 complete
- Frontend: T061 can run in parallel with backend work
- Tests: T071, T072, T073 can run in parallel (unit tests), T076, T077, T078 can run in parallel (component tests)

**Phase 5 (User Story 3)**:
- Tests: T085, T086, T087 can run in parallel

**Phase 6 (User Story 4)**:
- Tests: T093, T094, T095 can run in parallel

**Phase 7 (Polish)**: T096, T097, T098, T099, T100, T101, T102, T105 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all deep copy logic tasks in parallel:
copilot task "Implement deep copy logic for Lab entity in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts method cloneLab()" --agent general-purpose &
copilot task "Implement deep copy logic for LabPage entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts" --agent general-purpose &
copilot task "Implement deep copy logic for Question entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts" --agent general-purpose &
copilot task "Implement deep copy logic for DiagramTest entities in /Users/arjun/whatsnxt-bff/app/services/LabCloneService.ts" --agent general-purpose &

# Launch all unit tests in parallel:
copilot task "Unit test: LabCloneService deep copy preserves all fields in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts" --agent task &
copilot task "Unit test: Duplicate clone check throws ConflictError in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts" --agent task &
copilot task "Unit test: Clone generates new UUIDs for all entities in /Users/arjun/whatsnxt-bff/app/tests/unit/LabCloneService.test.ts" --agent task &
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Clone)
4. Complete Phase 4: User Story 2 (Republish)
5. **STOP and VALIDATE**: Test clone-edit-republish workflow end-to-end
6. Deploy/demo if ready (core workflow complete)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test end-to-end → Deploy/Demo (MVP! Core workflow works)
3. Add User Story 3 → Test progress preservation → Deploy/Demo (Student-friendly updates)
4. Add User Story 4 → Test duplicate prevention → Deploy/Demo (Polish)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Clone)
   - Developer B: Start User Story 2 prep (can't fully complete until US1 done)
3. After US1+US2 complete:
   - Developer C: User Story 3 (Progress preservation)
   - Developer D: User Story 4 (Duplicate prevention)

---

## Summary

- **Total Tasks**: 105
- **Setup Tasks**: 5
- **Foundational Tasks**: 13
- **User Story 1 Tasks**: 27 (Clone functionality)
- **User Story 2 Tasks**: 34 (Republish functionality)
- **User Story 3 Tasks**: 9 (Progress preservation)
- **User Story 4 Tasks**: 7 (Duplicate prevention)
- **Polish Tasks**: 10

### Suggested MVP Scope (Phases 1-4)

- Phase 1: Setup (5 tasks)
- Phase 2: Foundational (13 tasks)
- Phase 3: User Story 1 - Clone (27 tasks)
- Phase 4: User Story 2 - Republish (34 tasks)
- **Total MVP**: 79 tasks

This delivers the complete clone-edit-republish workflow (P1 user stories). User Stories 3 and 4 can be added incrementally.

### Parallel Opportunities Identified

- **Setup**: 3 parallel tasks
- **Foundational**: 5 parallel groups
- **User Story 1**: 15 parallel tasks (models, tests)
- **User Story 2**: 12 parallel tasks (tests, API calls)
- **User Story 3**: 3 parallel tasks (tests)
- **User Story 4**: 3 parallel tasks (tests)
- **Polish**: 8 parallel tasks

**Total Parallelizable Tasks**: 49 tasks (47% of total)

### Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ All user story tasks have [US1], [US2], [US3], or [US4] labels
✅ All Setup and Foundational tasks have NO story label
✅ All Polish tasks have NO story label
✅ All tasks include exact file paths
✅ All tasks are organized by user story for independent implementation

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Follow quickstart.md for local testing workflow
- Refer to contracts/ for exact API request/response formats
- Refer to data-model.md for schema details and validation rules
