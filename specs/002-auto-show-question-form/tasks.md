# Tasks: Auto-Show Question Form in Page Editor

**Feature**: 002-auto-show-question-form  
**Input**: Design documents from `/specs/002-auto-show-question-form/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a monorepo web application:
- **Web App**: `apps/web/app/` (Next.js 16 App Router)
- **Tests**: `apps/web/__tests__/`
- **APIs**: `apps/web/apis/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create feature branch `002-auto-show-question-form` from main
- [X] T002 Review existing page editor component in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T003 Review existing test patterns in apps/web/__tests__/ directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Set up test file structure for auto-form behavior in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T005 Configure mock for labApi.getLabPageById in test setup
- [X] T006 Add isFormCancelled state flag to PageEditor component in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First Question Creation on New Lab (Priority: P1) 🎯 MVP

**Goal**: Automatically display question form when instructor lands on empty page editor after creating new lab, saving 3-5 seconds and 1 click per lab creation

**Independent Test**: Create a new lab → redirected to page editor → verify question form appears automatically without button click → fill and save question → verify question is created successfully

### Implementation for User Story 1

- [X] T007 [US1] Add shouldAutoShowForm derived state logic in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T008 [US1] Update useEffect to reset isFormCancelled flag on pageId change in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T009 [US1] Add conditional rendering logic to auto-display QuestionForm on empty pages in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T010 [US1] Add autoFocus prop to QuestionForm component's first Textarea field in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T011 [US1] Update cancel handler to set isFormCancelled flag and clear unsaved question in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T012 [US1] Add data-testid attributes for auto-displayed form in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T013 [US1] Write test for auto-display on empty page with auto-focus verification in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T014 [US1] Write test for successful question save from auto-displayed form in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T015 [US1] Write test for cancel behavior and "Add Question" button appearance in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T016 [US1] Write test for validation error handling in auto-displayed form in apps/web/__tests__/page-editor-auto-form.test.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - instructors can create new labs and immediately start adding questions without extra clicks

---

## Phase 4: User Story 2 - Editing Existing Pages with Questions (Priority: P1)

**Goal**: Ensure backward compatibility - existing pages with questions display normally without auto-opening any forms, preserving all existing functionality

**Independent Test**: Navigate to any existing page with questions → verify page displays all questions in read/view mode (not edit mode) → verify "Add Question" button works → verify edit/delete functionality remains intact

### Implementation for User Story 2

- [X] T017 [US2] Verify conditional logic prevents auto-show when questions.length > 0 in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T018 [US2] Write test for NO auto-display on page with existing questions in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T019 [US2] Write test for manual "Add Question" button functionality on populated pages in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T020 [US2] Write test for edit existing question functionality (regression test) in apps/web/__tests__/page-editor-auto-form.test.tsx
- [ ] T021 [US2] Perform manual QA testing with multiple existing questions per quickstart.md checklist

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - new empty pages auto-show form, existing pages with questions display normally

---

## Phase 5: User Story 3 - Empty Page Navigation (Priority: P2)

**Goal**: Extend auto-show convenience to all entry points - direct navigation, browser back/forward, new page addition to existing labs

**Independent Test**: Add new page to existing lab OR navigate directly to empty page URL → verify question form auto-displays → verify save/cancel behavior identical to lab creation flow

### Implementation for User Story 3

- [X] T022 [US3] Write test for auto-display on direct empty page navigation in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T023 [US3] Write test for navigation reset behavior (cancel flag resets on page change) in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T024 [US3] Write test for browser back/forward navigation to empty page in apps/web/__tests__/page-editor-auto-form.test.tsx
- [ ] T025 [US3] Perform manual QA testing for all navigation entry points per quickstart.md checklist

**Checkpoint**: All user stories should now be independently functional - auto-show works consistently across all empty page entry points

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T026 [P] Add accessibility ARIA labels to auto-displayed form in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T027 [P] Verify keyboard navigation (Tab, Escape) works with auto-displayed form
- [X] T028 [P] Add performance logging for form display time (should be <1 second)
- [X] T029 [P] Write edge case test for component unmount/remount with open form in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T030 [P] Write edge case test for page loading state (form should not show until data loaded) in apps/web/__tests__/page-editor-auto-form.test.tsx
- [X] T031 Run full test suite to verify no regressions in existing page editor tests
- [X] T032 Perform complete manual QA using quickstart.md testing checklist
- [X] T033 Update quickstart.md with any implementation notes or troubleshooting tips discovered during development
- [X] T034 Code cleanup and add inline comments for auto-show logic in apps/web/app/labs/[id]/pages/[pageId]/page.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1) must complete before User Story 2 (P1) testing to verify backward compatibility
  - User Story 2 (P1) and User Story 3 (P2) can proceed in parallel after US1 completes
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - This is the MVP
- **User Story 2 (P1)**: Can start after User Story 1 completes (needs auto-show logic in place to test backward compatibility)
- **User Story 3 (P2)**: Can start after User Story 1 completes (extends same auto-show behavior to additional entry points)

### Within Each User Story

- Implementation tasks (T007-T012) should be completed sequentially in order
- Test tasks (T013-T016) can start after implementation tasks complete
- Tests can be written in parallel (marked [P] in Polish phase where applicable)
- Manual QA should be last step for each story

### Parallel Opportunities

- T003 (review tests) can run in parallel with T002 (review component) during Setup
- T005 (mock setup) and T006 (state flag) can run in parallel during Foundational
- Once US1 implementation (T007-T012) completes, all US1 tests (T013-T016) can be written in parallel
- US2 and US3 can be developed in parallel after US1 completes
- All Polish phase tasks marked [P] (T026-T030) can run in parallel

---

## Parallel Example: User Story 1 Tests

```bash
# After implementation tasks T007-T012 complete, launch all US1 tests together:
Task: "Write test for auto-display on empty page with auto-focus verification"
Task: "Write test for successful question save from auto-displayed form"
Task: "Write test for cancel behavior and Add Question button appearance"
Task: "Write test for validation error handling in auto-displayed form"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (~10 minutes)
2. Complete Phase 2: Foundational (~15 minutes) - CRITICAL: blocks all stories
3. Complete Phase 3: User Story 1 (~45 minutes implementation + tests)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md checklist
5. Deploy/demo if ready

**MVP Delivery Time**: ~1.5 hours  
**MVP Value**: 3-5 seconds saved per new lab creation

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (~25 minutes)
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! - ~1.5 hours total)
3. Add User Story 2 → Test independently → Deploy/Demo (Backward compatibility confirmed - ~2 hours total)
4. Add User Story 3 → Test independently → Deploy/Demo (Full coverage - ~2.5 hours total)
5. Add Polish → Final deployment (Production-ready - ~3 hours total)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (~25 minutes)
2. Once Foundational is done and US1 completes:
   - Developer A: User Story 2 (backward compatibility tests)
   - Developer B: User Story 3 (navigation entry points)
   - Developer C: Polish phase tasks
3. Stories complete and integrate independently

---

## Task Count Summary

- **Total Tasks**: 34
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (User Story 1)**: 10 tasks - **MVP SCOPE**
- **Phase 4 (User Story 2)**: 5 tasks - **Backward Compatibility**
- **Phase 5 (User Story 3)**: 4 tasks - **Extended Coverage**
- **Phase 6 (Polish)**: 9 tasks

### Parallel Opportunities Identified

- Setup phase: 2 tasks can run in parallel (T002, T003)
- Foundational phase: 2 tasks can run in parallel (T005, T006)
- User Story 1 tests: 4 tests can be written in parallel (T013-T016)
- User Story 2 & 3: Can proceed in parallel after US1 (10 tasks total)
- Polish phase: 5 tasks can run in parallel (T026-T030)

**Total Parallelizable Tasks**: 15 out of 34 (44%)

---

## MVP Scope Definition

**Recommended MVP**: User Story 1 only (Phase 1 + 2 + 3)

**Tasks in MVP**: T001-T016 (16 tasks)  
**Estimated Time**: ~1.5 hours  
**Value Delivered**: Core auto-show behavior for new lab creation flow (primary use case - 80%+ of users)

**Post-MVP Phases**:
- Phase 4 (US2): Backward compatibility validation (critical for production)
- Phase 5 (US3): Extended entry points (nice-to-have)
- Phase 6: Polish and edge cases (production hardening)

---

## Notes

- [P] tasks = different files or independent work, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group (e.g., after each US phase)
- Stop at any checkpoint to validate story independently using quickstart.md
- All implementation follows existing patterns in codebase (per research.md)
- No API changes required (per contracts/README.md)
- Feature is pure frontend enhancement with minimal code changes (~20 lines)
- Auto-focus is intentional and accessibility-compliant (per quickstart.md)

---

## Integration Notes

**Works with**: 001-streamline-lab-creation feature
- Combined flow: Create lab → Auto-redirect to page editor → Auto-show question form
- Combined time savings: 5-8 seconds per lab creation

**Backward Compatible**: All existing page editor functionality preserved
- Pages with questions: No change in behavior
- Manual "Add Question" button: Still works as before
- Edit/delete operations: Unchanged

---

## Success Criteria Validation

After completing all tasks, verify:

- ✅ **SC-001**: Instructors can start filling first question within 1 second of landing on page editor
- ✅ **SC-002**: Clicks reduced by 1 (from 3 to 2: create lab → fill form)
- ✅ **SC-003**: 95% of existing page editor interactions remain unchanged (regression tests pass)
- ✅ **SC-004**: Time from lab creation to first question saved reduced by 3-5 seconds
- ✅ **SC-005**: Zero increase in form submission errors or cancellations (tracked via manual QA)

---

## Rollback Plan

If issues arise after deployment:

1. Revert commit containing T007-T012 changes
2. Re-run test suite to verify revert is clean
3. Re-deploy previous version

**Estimated Rollback Time**: <5 minutes (per quickstart.md)

---

**End of Tasks**
