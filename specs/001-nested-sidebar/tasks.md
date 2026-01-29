---
description: 'Implementation tasks for Nested Content Sidebar feature'
---

# Tasks: Nested Content Sidebar

**Input**: Design documents from `/specs/001-nested-sidebar/`
**Prerequisites**: plan.md (✓), spec.md (✓), research.md (✓), data-model.md (✓), contracts/ (✓)

**Tests**: Tests are OPTIONAL per specification - not explicitly requested in spec.md, so test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `/Users/arjun/whatsnxt-mfe/apps/web/`
- **Backend**: `/Users/arjun/whatsnxt-bff/app/`
- **Specs**: `/Users/arjun/whatsnxt-mfe/specs/001-nested-sidebar/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database setup, migration scripts, and icon seeding

- [X] T001 Create Section schema in /Users/arjun/whatsnxt-bff/app/models/sectionSchema.ts
- [X] T002 [P] Create Icon schema in /Users/arjun/whatsnxt-bff/app/models/iconSchema.ts
- [X] T003 Create migration script 001-seed-icons.ts in /Users/arjun/whatsnxt-bff/scripts/migrations/
- [X] T004 [P] Create migration script 002-seed-default-sections.ts in /Users/arjun/whatsnxt-bff/scripts/migrations/
- [X] T005 [P] Create migration script 003-migrate-existing-posts.ts in /Users/arjun/whatsnxt-bff/scripts/migrations/
- [X] T006 Run all migration scripts and verify data in MongoDB

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend services, API routes, and validation that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Modify tutorialSchema.ts to add sectionId and sectionOrder fields in /Users/arjun/whatsnxt-bff/app/models/tutorialSchema.ts
- [X] T008 [P] Locate and modify blog schema to add sectionId and sectionOrder fields in /Users/arjun/whatsnxt-bff/app/models/
- [X] T009 Create slugService with generateUniqueSlug and slugify functions in /Users/arjun/whatsnxt-bff/app/services/sidebar/slugService.ts
- [X] T010 [P] Create sectionService with CRUD operations in /Users/arjun/whatsnxt-bff/app/services/sidebar/sectionService.ts
- [X] T011 Create sectionsController with HTTP handlers in /Users/arjun/whatsnxt-bff/app/controllers/sidebar/sectionsController.ts
- [X] T012 [P] Create iconsController with HTTP handlers in /Users/arjun/whatsnxt-bff/app/controllers/sidebar/iconsController.ts
- [X] T013 Create section validation middleware in /Users/arjun/whatsnxt-bff/app/middleware/validation/sectionValidation.ts
- [X] T014 Create sections routes in /Users/arjun/whatsnxt-bff/app/routes/sidebar/sections.routes.ts
- [X] T015 [P] Create icons routes in /Users/arjun/whatsnxt-bff/app/routes/sidebar/icons.routes.ts
- [X] T016 Create sidebar route aggregator index.ts in /Users/arjun/whatsnxt-bff/app/routes/sidebar/index.ts
- [X] T017 Register sidebar routes in main server.ts at /Users/arjun/whatsnxt-bff/
- [X] T018 Test all backend API endpoints with curl/Postman (sections CRUD, icons list, tree endpoint)

**Checkpoint**: Backend API fully functional - frontend development can now begin

---

## Phase 3: User Story 1 - Browse Content Navigation (Priority: P1) 🎯 MVP

**Goal**: Users can browse through blog posts and tutorials using a clean, organized sidebar with hierarchical sections

**Independent Test**: Create a few sections with posts/tutorials and verify users can click to navigate between them. Sidebar displays hierarchy, highlights current page, and allows expand/collapse of sections.

### Frontend Setup for User Story 1

- [X] T019 [P] [US1] Create SectionsAPI client in /Users/arjun/whatsnxt-mfe/apps/web/apis/v1/sidebar/sectionsApi.ts
- [X] T020 [P] [US1] Create IconsAPI client in /Users/arjun/whatsnxt-mfe/apps/web/apis/v1/sidebar/iconsApi.ts
- [X] T021 [US1] Create nestedSidebarSlice with Redux state management in /Users/arjun/whatsnxt-mfe/apps/web/store/slices/nestedSidebarSlice.ts
- [X] T022 [US1] Register nestedSidebarSlice in store configuration at /Users/arjun/whatsnxt-mfe/apps/web/store/store.ts

### Core Sidebar Components for User Story 1

- [X] T023 [P] [US1] Create SectionItem component in /Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/SectionItem.tsx
- [X] T024 [P] [US1] Create sidebar CSS styles in /Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/styles.module.css
- [X] T025 [US1] Create AccordionVariant component in /Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/AccordionVariant.tsx
- [X] T026 [US1] Create main NestedSidebar container in /Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/index.tsx
- [X] T027 [US1] Integrate NestedSidebar into blog layout at /Users/arjun/whatsnxt-mfe/apps/web/app/blogs/layout.tsx
- [X] T028 [US1] Integrate NestedSidebar into tutorial layout at /Users/arjun/whatsnxt-mfe/apps/web/app/tutorials/layout.tsx

**Checkpoint**: User Story 1 complete - users can browse content via sidebar, see hierarchy, expand/collapse sections, and navigate to posts

---

## Phase 4: User Story 2 - Content Organization Management (Priority: P2)

**Goal**: Administrators can create and organize sections, subsections, and posts through an intuitive interface

**Independent Test**: Log in as admin, create/edit/delete sections through admin interface, and verify changes appear in the sidebar immediately with proper notifications.

### Admin Interface Components

- [X] T029 [P] [US2] Create IconPicker component in /Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/components/IconPicker.tsx
- [X] T030 [P] [US2] Create SectionForm component in /Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/components/SectionForm.tsx
- [X] T031 [US2] Create SectionList component in /Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/components/SectionList.tsx
- [X] T032 [US2] Create main admin page at /Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/page.tsx

### CRUD Operations and Validation

- [X] T033 [US2] Add createSection async thunk to nestedSidebarSlice in /Users/arjun/whatsnxt-mfe/apps/web/store/slices/nestedSidebarSlice.ts
- [X] T034 [P] [US2] Add updateSection async thunk to nestedSidebarSlice
- [X] T035 [P] [US2] Add deleteSection async thunk to nestedSidebarSlice
- [X] T036 [US2] Implement form validation in SectionForm with Mantine form hooks
- [X] T037 [US2] Implement success/error notifications using @mantine/notifications
- [X] T038 [US2] Implement delete confirmation dialog before destructive actions

**Checkpoint**: User Story 2 complete - admins can manage sections through UI with validation and notifications

---

## Phase 5: User Story 3 - Nested Content Creation (Priority: P3)

**Goal**: Administrators can create subsections within sections and assign posts to specific sections for multi-level hierarchy

**Independent Test**: Create a section, create subsections within it, assign posts to both levels, and verify the hierarchical structure displays correctly with proper indentation.

### Post Assignment Implementation

- [X] T039 [P] [US3] Create PostAssignment component in /Users/arjun/whatsnxt-mfe/apps/web/components/Admin/SidebarForms/PostAssignment.tsx
- [X] T040 [US3] Add post assignment endpoints to backend at /Users/arjun/whatsnxt-bff/app/routes/sidebar/posts.routes.ts
- [X] T041 [US3] Implement assignPostToSection controller logic in /Users/arjun/whatsnxt-bff/app/controllers/sidebar/postsController.ts
- [X] T042 [US3] Add post assignment functionality to admin interface in /Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/components/PostAssignment.tsx

### Hierarchy Display Enhancement

- [X] T043 [US3] Implement recursive section rendering with proper indentation in AccordionVariant component
- [X] T044 [US3] Add breadcrumb trail support using getBreadcrumb API endpoint
- [X] T045 [US3] Implement auto-expand parent sections when navigating to nested post in nestedSidebarSlice
- [X] T046 [US3] Add depth validation in sectionService to prevent exceeding 4-level limit

**Checkpoint**: User Story 3 complete - full hierarchical content organization working with proper nesting and navigation

---

## Phase 6: User Story 4 - Sidebar Variant Selection (Priority: P4)

**Goal**: Site administrators can choose between NavLink and Accordion sidebar styles to match design preferences

**Independent Test**: Switch between NavLink and Accordion modes in settings and verify both display content correctly with different interaction patterns.

### Variant Implementation

- [X] T047 [P] [US4] Create NavLinkVariant component in /Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/NavLinkVariant.tsx
- [X] T048 [US4] Add variant prop and switching logic to main NestedSidebar container
- [X] T049 [US4] Implement flat list display for NavLink style with all sections visible
- [X] T050 [US4] Preserve active state highlighting when switching between variants
- [X] T051 [US4] Add variant selection control to admin settings (optional configuration)

**Checkpoint**: User Story 4 complete - both sidebar variants functional and switchable

---

## Phase 7: User Story 5 - Responsive Navigation Experience (Priority: P5)

**Goal**: Mobile users can access and navigate the sidebar on any device with appropriate responsive behavior

**Independent Test**: View sidebar on mobile (drawer), tablet (collapsible), and desktop (fixed) viewports and verify it remains usable and accessible at all sizes.

### Responsive Implementation

- [X] T052 [US5] Configure Mantine AppShell with responsive breakpoints in blog layout at /Users/arjun/whatsnxt-mfe/apps/web/app/blogs/layout.tsx
- [X] T053 [US5] Configure Mantine AppShell with responsive breakpoints in tutorial layout at /Users/arjun/whatsnxt-mfe/apps/web/app/tutorials/layout.tsx
- [X] T054 [US5] Implement mobile drawer behavior with toggle button
- [X] T055 [US5] Add tablet-specific styling for collapsible sidebar
- [X] T056 [US5] Test and adjust CSS for viewport sizes from 320px to 1920px
- [X] T057 [US5] Implement scroll-to-active-item on mobile devices

**Checkpoint**: User Story 5 complete - responsive sidebar working across all device sizes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance optimization, and final validation

### Advanced Features

- [X] T058 [P] Implement reorderSections functionality with batch updates in sectionService at /Users/arjun/whatsnxt-bff/app/services/sidebar/sectionService.ts
- [ ] T059 [P] Implement drag-and-drop reordering in admin interface using @dnd-kit (Optional - requires package installation)
- [X] T060 Add localStorage persistence for expanded sections state in nestedSidebarSlice
- [X] T061 [P] Implement search/filter functionality in icon picker
- [X] T062 [P] Add loading states and skeletons for async operations

### Performance Optimization

- [X] T063 Memoize section components with React.memo in SectionItem
- [X] T064 [P] Add indexes to MongoDB collections per data-model.md specifications
- [ ] T065 [P] Test with 50+ sections and 200+ posts to verify performance targets
- [X] T066 Optimize tree building algorithm in backend sectionService

### Documentation & Validation

- [X] T067 [P] Update README with sidebar feature documentation
- [X] T068 [P] Add inline code comments for complex logic (slug generation, depth calculation)
- [X] T069 Validate all API endpoints match OpenAPI contracts in contracts/ directory
- [X] T070 Run through quickstart.md guide to verify all steps work correctly
- [X] T071 [P] Verify WCAG 2.1 Level AA accessibility compliance with keyboard navigation
- [X] T072 [P] Test edge cases from spec.md (empty sections, deletion with children, slug collisions)

### Security & Error Handling

- [X] T073 Verify authentication middleware on all admin routes
- [ ] T074 [P] Add rate limiting to API endpoints (Optional - requires rate limiter package)
- [X] T075 [P] Implement comprehensive error handling in all controllers
- [X] T076 Add validation for maximum nesting depth in pre-save hooks
- [X] T077 Test cascade delete prevention for sections with children/posts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (Phase 2) completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - Independent of US1 (creates admin interface)
- **User Story 3 (P3)**: Depends on US2 (requires admin interface for post assignment)
- **User Story 4 (P4)**: Can start after US1 (adds alternative display variant)
- **User Story 5 (P5)**: Can start after US1 (adds responsive behavior to existing sidebar)

### Within Each User Story

- API clients before Redux slices
- Redux slices before components that use them
- Basic components before complex components that compose them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005 can run in parallel
- **Phase 2**: T008, T010, T012, T015 can run in parallel (different files)
- **User Story 1**: T019, T020, T023, T024 can run in parallel
- **User Story 2**: T029, T030, T034, T035 can run in parallel
- **User Story 4**: T047 independent of other US4 tasks initially
- **Phase 8**: Most polish tasks marked [P] can run in parallel
- **After Phase 2 completes**: US1, US2, US4, US5 can all start in parallel (different developers)

---

## Parallel Example: User Story 1

```bash
# Launch API clients together:
Task T019: "Create SectionsAPI client"
Task T020: "Create IconsAPI client"

# Launch components together:
Task T023: "Create SectionItem component"
Task T024: "Create sidebar CSS styles"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T018) - CRITICAL
3. Complete Phase 3: User Story 1 (T019-T028)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo basic sidebar navigation

**MVP delivers**: Users can browse content via organized, hierarchical sidebar with expand/collapse

### Incremental Delivery

1. **Foundation** (Phase 1+2) → Database + APIs ready
2. **MVP** (Phase 3: US1) → Basic browsing → Deploy/Demo
3. **Admin** (Phase 4: US2) → Content management → Deploy/Demo
4. **Hierarchy** (Phase 5: US3) → Nested sections → Deploy/Demo
5. **Variants** (Phase 6: US4) → Style options → Deploy/Demo
6. **Mobile** (Phase 7: US5) → Responsive design → Deploy/Demo
7. **Polish** (Phase 8) → Optimization + features → Deploy/Demo

Each phase adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. **Once Phase 2 done, split work**:
   - Developer A: User Story 1 (Browse navigation)
   - Developer B: User Story 2 (Admin interface)
   - Developer C: User Story 4 (NavLink variant)
   - Developer D: User Story 5 (Responsive design)
3. **Sequential**: User Story 3 starts after US2 completes (depends on admin UI)
4. **Final**: Team converges on Phase 8 (Polish)

---

## Task Counts by Phase

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 12 tasks (BLOCKING)
- **Phase 3 (US1 - Browse)**: 10 tasks 🎯 MVP
- **Phase 4 (US2 - Admin)**: 10 tasks
- **Phase 5 (US3 - Nesting)**: 8 tasks
- **Phase 6 (US4 - Variants)**: 5 tasks
- **Phase 7 (US5 - Responsive)**: 6 tasks
- **Phase 8 (Polish)**: 20 tasks

**Total**: 77 tasks

**Parallel opportunities identified**: 23 tasks marked [P]

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to parallelize
- **[Story] label**: Maps task to specific user story (US1-US5) for traceability
- **Each user story**: Independently completable and testable
- **MVP scope**: Phases 1+2+3 only (28 tasks) - delivers core browsing functionality
- **Commit strategy**: Commit after each task or logical group
- **Checkpoints**: Stop at any checkpoint to validate story independently
- **Tests not included**: Specification doesn't explicitly request TDD approach
- **Avoid**: Vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Metrics (from spec.md)

When implementation complete, verify:

- ✅ Navigate between content in <3 clicks (SC-001)
- ✅ Create section with posts in <2 minutes (SC-002)
- ✅ Sidebar loads in <1 second (SC-003)
- ✅ Expand/collapse animations <300ms (SC-007)
- ✅ 50+ sections with 200+ posts without degradation (SC-011)
- ✅ Keyboard navigation fully functional (SC-012)
- ✅ Responsive from 320px to 1920px (SC-006)

---

**Generated**: 2025-01-27
**Based on**: spec.md (5 user stories), plan.md, data-model.md (3 schemas), contracts/ (3 API specs), research.md
**Ready for**: `/speckit.implement` command execution
