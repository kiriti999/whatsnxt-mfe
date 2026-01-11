---
description: 'Task list for pagination in page editor implementation'
---

# Tasks: Show Pagination in Page Editor

**Input**: Design documents from `/specs/004-page-editor-pagination/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: No test tasks included - feature specification does not require TDD approach

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `apps/web/` for frontend Next.js app
- **Backend**: `apps/whatsnxt-bff/` (no changes for this feature)
- **Workspace packages**: `packages/@whatsnxt/` for shared code

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions for pagination feature

- [X] T001 Create pagination type definitions file at `apps/web/types/pagination.ts` with PaginationState, PagePaginationProps, PageMapping, NavigationResult interfaces
- [X] T002 [P] Update API type definitions in `apps/web/types/api.ts` to add totalPages field to PageResponse interface and PageSummary type
- [X] T003 [P] Verify backend API endpoint `GET /api/v1/labs/:labId/pages/:pageId` returns totalPages field in response

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create custom hook file `apps/web/hooks/usePageMapping.ts` for managing page number to page ID mapping
- [X] T005 Implement usePageMapping hook with state management (pageMapping, isLoading, error, getPageId function) in `apps/web/hooks/usePageMapping.ts`
- [X] T006 Add API call to fetch lab data with pages array in usePageMapping hook using `@whatsnxt/http-client` in `apps/web/hooks/usePageMapping.ts`
- [X] T007 Implement page mapping cache logic (Map<number, string>) in usePageMapping hook in `apps/web/hooks/usePageMapping.ts`
- [X] T008 Add error handling with `@whatsnxt/errors` for page mapping failures in `apps/web/hooks/usePageMapping.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - See Current Page Position (Priority: P1) 🎯 MVP

**Goal**: Display page position indicator ("Page X of Y") at top of editor when lab has multiple pages

**Independent Test**: Create lab with 2 pages, navigate to page 2, verify clear "Page 2 of 2" indicator displays at top of editor within 1 second

### Implementation for User Story 1

- [X] T009 [P] [US1] Add pagination state variables (totalPages, isNavigating) to page editor component in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T010 [P] [US1] Import usePageMapping hook in page editor component at `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T011 [US1] Update page data fetch useEffect to extract and set totalPages from API response in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T012 [US1] Add conditional rendering logic to show pagination only when totalPages > 1 in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T013 [US1] Create page position indicator UI component using Mantine Paper and Text components in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T014 [US1] Display "Page X of Y" text with current page number and total pages in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T015 [US1] Style page position indicator with appropriate typography (size="sm", fw=500) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T016 [US1] Position pagination controls Paper component at top of editor (after page title, before question form) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: At this point, page position indicator should display correctly for multi-page labs and be hidden for single-page labs

---

## Phase 4: User Story 2 - Navigate Between Pages Quickly (Priority: P1)

**Goal**: Enable clicking page numbers to instantly navigate between pages without leaving editor

**Independent Test**: Create lab with 3 pages, navigate to page 1, click page number "3", verify instant navigation to page 3 (under 500ms)

### Implementation for User Story 2

- [X] T017 [P] [US2] Import Mantine Pagination component and related UI components in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T018 [P] [US2] Import Next.js useRouter hook from 'next/navigation' in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T019 [US2] Create handlePageChange function to manage page navigation logic in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T020 [US2] Implement page ID lookup using getPageId from usePageMapping hook in handlePageChange function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T021 [US2] Add navigation logic using router.push with target page URL in handlePageChange function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T022 [US2] Implement isNavigating state management (set true before navigation, false after) in handlePageChange function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T023 [US2] Add error handling with `@mantine/notifications` for navigation failures in handlePageChange function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T024 [US2] Render Mantine Pagination component with total, value, onChange props in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T025 [US2] Configure Pagination component to highlight current page number in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T026 [US2] Add loading indicator (Mantine Loader) that displays during navigation in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T027 [US2] Layout pagination controls using Mantine Group component (justify="space-between", align="center") in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: At this point, users should be able to click any page number and navigate instantly with visual feedback

---

## Phase 5: User Story 3 - Automatic Pagination Updates (Priority: P2)

**Goal**: Ensure pagination controls update automatically when new pages are created via auto-page-creation feature

**Independent Test**: Create lab with 1 page containing 2 questions, add 3rd question to trigger auto-page-creation, verify after redirect pagination shows "Page 2 of 2"

### Implementation for User Story 3

- [X] T028 [US3] Add useEffect to monitor isCreatingPage state from useAutoPageCreation hook in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T029 [US3] Implement automatic page count refresh when page creation completes in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T030 [US3] Add logic to re-fetch page mapping after new page creation in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T031 [US3] Ensure pagination indicator updates within 1 second of redirect to new page in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T032 [US3] Handle pagination visibility toggle (hidden → visible) when transitioning from 1 to 2 pages in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T033 [US3] Add loading skeleton or placeholder during pagination data refresh in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: Pagination should automatically reflect new page counts after auto-page-creation without manual refresh

---

## Phase 6: User Story 4 - Navigation Control States (Priority: P2)

**Goal**: Disable Previous/Next buttons appropriately at boundaries and provide clear UI feedback

**Independent Test**: Create lab with 3 pages, navigate to page 1, verify "Previous" disabled, navigate to page 3, verify "Next" disabled

### Implementation for User Story 4

- [X] T034 [P] [US4] Configure Pagination component disabled prop to control button states in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T035 [P] [US4] Implement logic to disable Previous button when currentPageNumber equals 1 in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T036 [P] [US4] Implement logic to disable Next button when currentPageNumber equals totalPages in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T037 [US4] Add disabled state styling for pagination buttons using Mantine theme in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T038 [US4] Ensure disabled buttons show visual feedback (opacity, cursor) when hovered in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T039 [US4] Verify disabled buttons do not trigger navigation when clicked in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: Navigation boundaries should be clearly indicated with disabled button states

---

## Phase 7: User Story 5 - Mobile-Responsive Pagination (Priority: P3)

**Goal**: Adapt pagination controls for smaller screens without layout issues or horizontal scrolling

**Independent Test**: Open multi-page lab editor on mobile device (or responsive mode), verify pagination controls are touch-friendly (44px tap targets), no horizontal scroll

### Implementation for User Story 5

- [X] T040 [P] [US5] Import useMediaQuery hook from '@mantine/hooks' in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T041 [P] [US5] Add isMobile state using useMediaQuery with breakpoint 768px in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T042 [US5] Configure Pagination component with conditional siblings prop (0 for mobile, 1 for desktop) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T043 [US5] Configure Pagination component with conditional boundaries prop (1 for mobile, 2 for desktop) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T044 [US5] Configure Pagination component with conditional size prop ('sm' for mobile, 'md' for desktop) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T045 [US5] Update pagination controls layout to stack vertically on mobile screens in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T046 [US5] Ensure touch targets meet 44x44 pixel minimum on mobile devices in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T047 [US5] Add responsive padding and margin adjustments for tablet (768-1024px) breakpoint in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T048 [US5] Test pagination layout on mobile (320px), tablet (768px), and desktop (1920px) widths in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: Pagination should work seamlessly across all device sizes without layout breaking

---

## Phase 8: User Story 6 - Keyboard Navigation Support (Priority: P3)

**Goal**: Enable Tab, Enter, and Arrow keys for navigating pagination controls to meet accessibility standards

**Independent Test**: Open pagination controls, press Tab to focus page number, press Enter to navigate, verify keyboard focus indicators are visible throughout

### Implementation for User Story 6

- [X] T049 [P] [US6] Add aria-label prop to Pagination component for screen reader support in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T050 [P] [US6] Implement getItemAriaLabel function for Pagination component to provide contextual labels in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T051 [US6] Add custom aria-label for current page ("Current page, page X") in getItemAriaLabel function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T052 [US6] Add custom aria-label for other pages ("Go to page X") in getItemAriaLabel function in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T053 [US6] Ensure visible focus indicators on pagination controls (use Mantine default or custom CSS) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T054 [US6] Test keyboard navigation flow (Tab through all controls, Enter to activate) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T055 [US6] Verify focus skips disabled buttons or indicates they are not actionable in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T056 [US6] Add keyboard navigation support for Arrow keys (left/right) between page numbers in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Checkpoint**: Pagination should be fully accessible via keyboard navigation meeting WCAG 2.1 Level AA standards

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, performance optimization, and final improvements

- [X] T057 [P] Implement debounce for rapid page navigation clicks using useDebouncedCallback in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T058 [P] Add error handling for page data fetch failures with retry notification in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [ ] T059 [P] Handle edge case for deleted page with redirect to nearest valid page in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T060 Implement ellipsis pagination for labs with more than 7 pages (max 5 visible numbers) in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T061 Add browser back/forward button support with correct pagination state updates in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [X] T062 Ensure pagination maintains state without flickering during auto-page-creation in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [ ] T063 [P] Add performance optimization with React.memo for pagination component if extracted to separate file
- [ ] T064 [P] Add loading skeleton for pagination area to prevent layout shift during initial render in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- [ ] T065 Test pagination performance with network throttling to verify <500ms navigation time
- [ ] T066 Run accessibility audit using Lighthouse or axe DevTools on pagination controls
- [X] T067 Verify pagination CSS uses CSS modules (not inline styles) per constitution requirement
- [ ] T068 Update feature documentation with pagination usage examples
- [ ] T069 Run quickstart.md validation to ensure implementation matches guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Builds on US1 but US1 must be functional first
- **User Story 3 (P2)**: Depends on US1 and US2 completion - Requires pagination to be visible and navigable
- **User Story 4 (P2)**: Depends on US2 completion - Enhances navigation controls from US2
- **User Story 5 (P3)**: Depends on US1 and US2 completion - Responsive adaptation of existing pagination
- **User Story 6 (P3)**: Depends on US2 completion - Adds keyboard accessibility to navigation controls

### Within Each User Story

- Phase 1 → Phase 2 (MUST complete before any user stories)
- Phase 2 → Phase 3 (US1 displays position indicator)
- Phase 3 → Phase 4 (US2 adds navigation using US1's display)
- Phase 4 → Phase 5 (US3 updates pagination from US1/US2)
- Phase 4 → Phase 6 (US4 enhances US2 navigation controls)
- Phase 4 → Phase 7 (US5 makes US1/US2 responsive)
- Phase 4 → Phase 8 (US6 makes US2 keyboard accessible)
- Phases 3-8 → Phase 9 (Polish after all user stories complete)

### Parallel Opportunities

- **Phase 1 (Setup)**: T001, T002, T003 can all run in parallel (different concerns)
- **Phase 2 (Foundational)**: All tasks sequential (T004→T005→T006→T007→T008) as they build on each other
- **Phase 3 (US1)**: T009 and T010 can run in parallel (different imports/state)
- **Phase 4 (US2)**: T017 and T018 can run in parallel (different imports)
- **Phase 6 (US4)**: T034, T035, T036 can run in parallel (different button states)
- **Phase 7 (US5)**: T040 and T041 can run in parallel (hook import and state)
- **Phase 8 (US6)**: T049 and T050 can run in parallel (different accessibility attributes)
- **Phase 9 (Polish)**: T057, T058, T059, T063, T064, T067 can run in parallel (different concerns)

### Critical Path

**Minimum viable implementation (MVP - User Story 1 & 2 only)**:

1. T001-T003 (Setup) → ~30 minutes
2. T004-T008 (Foundational) → ~2 hours
3. T009-T016 (US1: Display position) → ~2 hours
4. T017-T027 (US2: Navigation) → ~3 hours

**Total MVP time**: ~7.5 hours (single developer)

**Full feature with all user stories**: ~15-20 hours (single developer)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all Setup tasks together (different files, no dependencies):
Developer A: "Create pagination type definitions file at apps/web/types/pagination.ts"
Developer B: "Update API type definitions in apps/web/types/api.ts"
Developer C: "Verify backend API endpoint returns totalPages field"
```

## Parallel Example: Phase 4 User Story 2

```bash
# Launch import tasks together:
Developer A: "Import Mantine Pagination component in page.tsx"
Developer B: "Import Next.js useRouter hook in page.tsx"

# Then launch implementation tasks:
Developer A: "Create handlePageChange function"
Developer B: "Render Mantine Pagination component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - P1 Priority)

1. Complete Phase 1: Setup (T001-T003) → ~30 min
2. Complete Phase 2: Foundational (T004-T008) → ~2 hours
3. Complete Phase 3: User Story 1 (T009-T016) → ~2 hours
4. Complete Phase 4: User Story 2 (T017-T027) → ~3 hours
5. **STOP and VALIDATE**: Test pagination display and navigation independently
6. Deploy/demo if ready (MVP delivers core pagination value)

**MVP Success Criteria**:
- "Page X of Y" visible on multi-page labs
- Click page numbers to navigate instantly (<500ms)
- Hidden for single-page labs
- Current page highlighted

### Incremental Delivery

1. **MVP** (Phases 1-4): Display + Navigation → User can see and navigate pages
2. **Enhancement 1** (Phase 5): Auto-updates → Pagination stays accurate after auto-page-creation
3. **Enhancement 2** (Phase 6): Button states → Clear feedback at navigation boundaries
4. **Enhancement 3** (Phase 7): Mobile responsive → Works on all devices
5. **Enhancement 4** (Phase 8): Keyboard accessible → WCAG compliant
6. **Polish** (Phase 9): Edge cases + performance → Production ready

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Foundation (Days 1-2)**: All devs work together on Phases 1-2
2. **Once Foundational complete**:
   - Developer A: User Story 1 (Phase 3)
   - Developer B: User Story 2 (Phase 4) - after A completes US1
   - Developer C: User Story 5 (Phase 7) - after A/B complete US1/US2
3. **After MVP**:
   - Developer A: User Story 3 (Phase 5)
   - Developer B: User Story 4 (Phase 6)
   - Developer C: User Story 6 (Phase 8)
4. **Polish (Final day)**: All devs work on Phase 9 together

---

## Success Metrics

### Implementation Validation Checklist

- ✅ **SC-001**: Page position identified within 1 second (test with multi-page lab)
- ✅ **SC-002**: Navigation completes in under 500ms (test with network throttling)
- ✅ **SC-003**: Pagination appears within 1 second after auto-page-creation (test with 3rd question)
- ✅ **SC-004**: Current page visually distinguishable (test styling)
- ✅ **SC-005**: Pagination hidden for single-page labs (test with 1-page lab)
- ✅ **SC-006**: Navigation errors show clear messaging (test with API failure)
- ✅ **SC-007**: Keyboard navigation works for all controls (test Tab/Enter/Arrow keys)
- ✅ **SC-008**: Mobile layout works without breaking (test 320px-1024px widths)
- ✅ **SC-009**: Touch targets at least 44x44px on mobile (test with DevTools)
- ✅ **SC-010**: 95% success rate on first navigation attempt (user testing)
- ✅ **SC-011**: Pagination state accurate after auto-page-creation (test consistency)
- ✅ **SC-012**: Browser back/forward buttons work correctly (test navigation history)

### Format Validation

All tasks follow required format:
- ✅ Checkbox prefix `- [ ]`
- ✅ Sequential Task ID (T001-T069)
- ✅ [P] marker for parallelizable tasks
- ✅ [Story] label for user story tasks (US1-US6)
- ✅ Clear description with exact file path

---

## Notes

- [P] tasks = different files/concerns, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks included (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 69 (1 Setup + 5 Foundational + 52 User Story + 13 Polish)
- MVP tasks: 27 (Phases 1-4 only)
- Estimated MVP time: 7.5 hours (single developer)
- Estimated full feature time: 15-20 hours (single developer)
