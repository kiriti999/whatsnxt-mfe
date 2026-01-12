# Tasks: Diagram Quiz Hints System

**Feature Branch**: `001-diagram-quiz-hints`  
**Date**: 2025-01-20  
**Input**: Design documents from `/specs/001-diagram-quiz-hints/`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic dependencies verification

- [X] T001 Verify Node.js 24 LTS and pnpm 10+ are installed
- [X] T002 [P] Verify MongoDB is running at localhost:27017
- [X] T003 [P] Verify backend API is accessible at localhost:4444
- [X] T004 Checkout feature branch 001-diagram-quiz-hints and run pnpm install

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 [P] Update DiagramTest interface in packages/core-types/src/index.d.ts to add hints?: string[]
- [X] T006 [P] Update CreateDiagramTestRequest interface in apps/web/apis/lab.api.ts to add hints?: string[]
- [ ] T007 [P] Add hints field to DiagramTest Mongoose schema in backend/models/DiagramTest.js with validation (max 5 items, each 1-500 chars, no duplicates)
- [ ] T008 [P] Add pre-save hook to DiagramTest schema in backend/models/DiagramTest.js to trim and filter empty hints
- [ ] T009 Update diagram test controller in backend/controllers/lab/diagramTestController.js to accept and validate hints in create/update operations
- [ ] T010 Verify backend endpoints (POST/GET diagram-test) correctly handle hints field through manual testing
- [X] T011 Rebuild shared core-types package with pnpm build (not needed - type definitions only)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 4 - Optional Hints (Priority: P1) 🎯 MVP Foundation

**Goal**: Ensure diagram tests work correctly without hints, maintaining backward compatibility with existing tests

**Independent Test**: Create a diagram quiz without hints and verify students can complete it normally with no hint UI displayed. Load existing diagram tests without hints and verify they continue to function.

### Implementation for User Story 4

- [X] T012 [P] [US4] Update StudentTestRunner component in apps/web/components/Lab/StudentTestRunner.tsx to conditionally render hints UI only when diagramTest?.hints?.length > 0
- [X] T013 [P] [US4] Update diagram test editor page in apps/web/app/labs/[id]/pages/[pageId]/page.tsx to handle optional hints field (allow undefined or empty array)
- [ ] T014 [US4] Test creating new diagram test without hints - verify no hint UI appears for students
- [ ] T015 [US4] Test loading existing diagram test without hints - verify backward compatibility
- [ ] T016 [US4] Test saving diagram test with hints=undefined - verify no errors

**Checkpoint**: At this point, backward compatibility is confirmed and tests can work with or without hints

---

## Phase 4: User Story 1 - Instructor Adds Single Hint (Priority: P1) 🎯 MVP Core

**Goal**: Allow instructors to add one hint to a diagram quiz, which students can optionally reveal during the quiz

**Independent Test**: Create a diagram quiz with one hint in the editor, then as a student, access and reveal that hint during quiz-taking. Verify hint is saved and displayed correctly.

### Implementation for User Story 1

- [X] T017 [P] [US1] Create HintsEditor component in apps/web/components/Lab/HintsEditor.tsx with basic UI for adding/editing/deleting hints (TextInput, Add/Delete buttons, character counter)
- [X] T018 [P] [US1] Create HintsDisclosure component in apps/web/components/Lab/HintsDisclosure.tsx with progressive disclosure UI using Mantine Accordion
- [X] T019 [US1] Integrate HintsEditor component into diagram test editor page in apps/web/app/labs/[id]/pages/[pageId]/page.tsx
- [X] T020 [US1] Integrate HintsDisclosure component into StudentTestRunner in apps/web/components/Lab/StudentTestRunner.tsx within Diagram Test tab
- [X] T021 [US1] Implement frontend validation in HintsEditor for max 500 characters per hint with real-time feedback
- [X] T022 [US1] Implement frontend validation in HintsEditor to filter empty/whitespace-only hints on blur
- [X] T023 [US1] Connect HintsEditor to diagram test save handler - include hints in saveDiagramTest API call
- [ ] T024 [US1] Test instructor flow: create diagram test with 1 hint, save, reload page, verify hint persists
- [ ] T025 [US1] Test student flow: load quiz with 1 hint, click "Show Hint" button, verify hint displays
- [ ] T026 [US1] Test student flow: verify hint button not shown when hint not revealed
- [ ] T027 [US1] Test instructor editing: modify existing hint, save, verify changes persist

**Checkpoint**: At this point, basic single-hint functionality is fully working end-to-end

---

## Phase 5: User Story 2 - Progressive Multi-Hint System (Priority: P2)

**Goal**: Allow instructors to provide multiple hints (up to 5) of increasing specificity, with students revealing them sequentially

**Independent Test**: Create a quiz with 3-5 hints, then as a student, reveal them sequentially. Verify hints are revealed one at a time in correct order, with previously revealed hints remaining visible.

### Implementation for User Story 2

- [X] T028 [P] [US2] Add drag-and-drop reordering to HintsEditor using @dnd-kit/sortable with drag handles
- [X] T029 [P] [US2] Implement "Add Hint" button in HintsEditor with max 5 hints enforcement (disable button at limit)
- [X] T030 [US2] Implement hint reordering logic in HintsEditor component state management
- [X] T031 [US2] Add visual feedback in HintsEditor showing hint count (e.g., "3/5 hints")
- [X] T032 [US2] Update HintsDisclosure to show "Show Next Hint" button with remaining count (e.g., "Show Hint 2 (3 remaining)")
- [X] T033 [US2] Implement progressive disclosure logic in HintsDisclosure - track revealedHintsCount state
- [X] T034 [US2] Update HintsDisclosure to keep previously revealed hints visible when revealing next hint
- [X] T035 [US2] Add "No more hints available" message in HintsDisclosure when all hints revealed
- [X] T036 [US2] Implement frontend validation in HintsEditor to detect and warn about duplicate hints
- [X] T037 [US2] Add tooltip/help text in HintsEditor with best practices for writing effective hints
- [ ] T038 [US2] Test instructor flow: add 5 hints, verify 6th hint button is disabled
- [ ] T039 [US2] Test instructor flow: drag-and-drop reorder hints, save, verify new order persists
- [ ] T040 [US2] Test instructor flow: try adding duplicate hint, verify warning appears
- [ ] T041 [US2] Test student flow: reveal hints sequentially (1, 2, 3), verify previous hints remain visible
- [ ] T042 [US2] Test student flow: reveal all 5 hints, verify "no more hints" message appears
- [ ] T043 [US2] Test edge case: instructor deletes middle hint from 3-hint list, verify remaining hints renumber correctly

**Checkpoint**: At this point, multi-hint progressive disclosure is fully functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T044 [P] Add responsive design for HintsEditor on mobile devices
- [ ] T045 [P] Add responsive design for HintsDisclosure on mobile devices
- [ ] T046 [P] Add loading states to HintsEditor during save operations
- [ ] T047 [P] Add error handling and user notifications in HintsEditor for save failures
- [ ] T048 [P] Add accessibility attributes (ARIA labels) to HintsEditor components
- [ ] T049 [P] Add accessibility attributes (ARIA labels) to HintsDisclosure components
- [ ] T050 [P] Optimize HintsEditor rendering performance for rapid hint edits
- [ ] T051 Test edge case: very long hint text (500 chars), verify UI displays correctly in scrollable container
- [ ] T052 Test edge case: instructor saves hints with only whitespace, verify backend filters correctly
- [ ] T053 Test edge case: student rapidly clicks "Show Hint" button multiple times, verify no race conditions
- [ ] T054 Test backward compatibility: load existing labs without hints, verify no regression
- [ ] T055 Run quickstart.md validation steps for instructor and student flows
- [ ] T056 Code cleanup: remove console.logs, add proper logging where needed
- [ ] T057 Update component documentation with JSDoc comments for HintsEditor and HintsDisclosure

---

## Phase 7: User Story 3 - Hint Usage Tracking (Priority: P3) [FUTURE]

**Goal**: Track whether and how many hints a student used when solving a diagram quiz for analytics and feedback

**Note**: This is a P3 priority feature to be implemented after P1/P2 are complete and validated in production.

**Independent Test**: Solve quizzes with different hint usage patterns, then verify the data is recorded and displayed correctly in student results and instructor analytics.

### Implementation for User Story 3 (FUTURE)

- [ ] T058 [P] [US3] Create StudentDiagramTestSubmission entity/interface in packages/core-types/src/index.d.ts
- [ ] T059 [P] [US3] Create StudentDiagramTestSubmission Mongoose schema in backend/models/StudentDiagramTestSubmission.js
- [ ] T060 [P] [US3] Add hintsRevealed and hintIndices tracking to StudentTestRunner component state
- [ ] T061 [P] [US3] Update diagram test submission endpoint in backend to accept and store hint usage data
- [ ] T062 [US3] Implement submission handler in StudentTestRunner to include hint usage in payload
- [ ] T063 [US3] Create student results view to display hint usage (e.g., "You used 2 out of 4 hints")
- [ ] T064 [US3] Create instructor analytics view to show hint usage per student submission
- [ ] T065 [US3] Create instructor analytics aggregation to show average hints used, percentage of students using hints
- [ ] T066 [US3] Test student flow: complete quiz without hints, verify results show zero hints used
- [ ] T067 [US3] Test student flow: use 2 out of 4 hints, complete quiz, verify submission records correct count
- [ ] T068 [US3] Test instructor flow: view submission details, verify hint usage is displayed
- [ ] T069 [US3] Test instructor flow: view quiz analytics, verify aggregate hint statistics are correct

**Checkpoint**: All user stories should now be independently functional

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-5)**: All depend on Foundational phase completion
  - User Story 4 (P1 - Optional Hints) should be completed first to ensure backward compatibility
  - User Story 1 (P1 - Single Hint) is the core MVP feature
  - User Story 2 (P2 - Multi-Hint) extends User Story 1 functionality
  - User Story 3 (P3 - Tracking) can be implemented later after P1/P2 validation
- **Polish (Phase 6)**: Depends on User Stories 1 and 2 being complete
- **User Story 3 (Phase 7)**: Future implementation, depends on P1/P2 in production

### User Story Dependencies

- **User Story 4 (P1 - Optional Hints)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 1 (P1 - Single Hint)**: Can start after Foundational (Phase 2) - Should follow US4 to build on compatibility foundation
- **User Story 2 (P2 - Multi-Hint)**: Depends on User Story 1 completion - Extends HintsEditor and HintsDisclosure components
- **User Story 3 (P3 - Tracking)**: Can start after US1/US2 are validated in production - Separate entity and analytics

### Within Each User Story

- Frontend type updates before component implementation
- Backend schema updates before API endpoint modifications
- Component creation before integration into pages
- Core implementation before edge case testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks can run in parallel
- **Phase 2 (Foundational)**: Tasks T005-T008 can run in parallel (different files)
- **Phase 3 (US4)**: Tasks T012-T013 can run in parallel (different files)
- **Phase 4 (US1)**: Tasks T017-T018 can run in parallel (creating separate components)
- **Phase 5 (US2)**: Tasks T028-T029, T036-T037 can run in parallel (different concerns)
- **Phase 6 (Polish)**: All tasks marked [P] can run in parallel (different files/concerns)
- **Phase 7 (US3)**: Tasks T058-T059, T063-T065 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task: "Create HintsEditor component in apps/web/components/Lab/HintsEditor.tsx"
Task: "Create HintsDisclosure component in apps/web/components/Lab/HintsDisclosure.tsx"

# Then integrate them sequentially:
Task: "Integrate HintsEditor into diagram test editor page"
Task: "Integrate HintsDisclosure into StudentTestRunner"
```

---

## Implementation Strategy

### MVP First (User Stories 4 + 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 4 (Optional Hints - Backward Compatibility)
4. Complete Phase 4: User Story 1 (Single Hint - Core Feature)
5. **STOP and VALIDATE**: Test US4 and US1 independently
6. Deploy/demo MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 4 → Test backward compatibility → Validate
3. Add User Story 1 → Test single hint flow → Deploy/Demo (MVP!)
4. Add User Story 2 → Test multi-hint progressive disclosure → Deploy/Demo
5. Validate P1/P2 in production with real users
6. Add User Story 3 (P3 - Tracking) → Test analytics → Deploy/Demo
7. Complete Polish phase for production-ready quality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 4 (Optional Hints)
   - Developer B: User Story 1 (Single Hint) - wait for A to complete T012-T013
3. After US1 complete:
   - Developer A: User Story 2 (Multi-Hint) - extends US1 components
4. After P1/P2 validated:
   - Developer B: User Story 3 (Tracking) - parallel work on new entity

---

## Task Summary

| Phase | User Story | Priority | Task Count | MVP? |
|-------|-----------|----------|------------|------|
| Phase 1 | Setup | - | 4 tasks | ✅ Yes |
| Phase 2 | Foundational | - | 7 tasks | ✅ Yes |
| Phase 3 | US4: Optional Hints | P1 | 5 tasks | ✅ Yes |
| Phase 4 | US1: Single Hint | P1 | 11 tasks | ✅ Yes |
| Phase 5 | US2: Multi-Hint | P2 | 16 tasks | ⚠️ Enhanced |
| Phase 6 | Polish | - | 14 tasks | ⚠️ Quality |
| Phase 7 | US3: Tracking | P3 | 12 tasks | ❌ Future |
| **Total** | **-** | **-** | **69 tasks** | **MVP: 27 tasks** |

**MVP Scope** (Setup + Foundational + US4 + US1): 27 tasks
**Enhanced MVP** (+ US2 + Polish): 57 tasks
**Full Feature** (+ US3): 69 tasks

---

## Testing Validation Checklist

### User Story 4: Optional Hints (P1)
- ✅ Diagram test without hints displays no hint UI to students
- ✅ Existing diagram tests continue to function normally
- ✅ Instructor can create test without adding hints

### User Story 1: Single Hint (P1)
- ✅ Instructor can add single hint while creating diagram test
- ✅ Instructor can edit existing hint
- ✅ Student can reveal single hint during quiz
- ✅ Hint persists after page reload

### User Story 2: Multi-Hint (P2)
- ✅ Instructor can add up to 5 hints
- ✅ 6th hint button is disabled
- ✅ Instructor can reorder hints via drag-and-drop
- ✅ Student reveals hints sequentially
- ✅ Previously revealed hints remain visible
- ✅ "No more hints" message appears after last hint

### User Story 3: Tracking (P3 - Future)
- ⏳ Student submission includes hint usage count
- ⏳ Instructor can view hint usage per student
- ⏳ Aggregate statistics show average hints used

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- MVP focuses on P1 priorities (US4 + US1) for immediate value
- US2 (P2) enhances with multi-hint support
- US3 (P3) is deferred until P1/P2 validated in production
- All file paths are absolute from repository root
- Backend tasks reference separate backend repository (localhost:4444)
- Tests are NOT included (not requested in feature specification)
