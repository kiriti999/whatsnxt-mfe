# Tasks: Reusable Sections with Manual Linking

**Input**: Design documents from `/specs/002-reusable-sections/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Tests are OPTIONAL and not included in this task list unless explicitly requested. Focus is on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Each phase represents a complete, independently testable increment.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure:
- **Frontend**: `apps/web/` (Next.js 16 + React 19)
- **Backend**: `apps/whatsnxt-bff/` (Express.js v5)
- **Shared**: `packages/` (workspace packages)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and workspace structure for section ownership feature

- [X] T001 Create shared types package structure at packages/section-types/src/ with package.json and tsconfig.json
- [X] T002 [P] Add section permission constants to packages/constants/src/sectionPermissions.ts (ADMIN_FULL_ACCESS, TRAINER_OWN_ONLY)
- [X] T003 [P] Add section API endpoint constants to packages/constants/src/sectionApiEndpoints.ts (all 6 ownership endpoints + section-links + orphaned-posts)
- [X] T004 [P] Create SectionOwnershipError class in packages/errors/src/SectionOwnershipError.ts extending base error

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Schema Updates

- [X] T005 Update Section model schema in apps/whatsnxt-bff/app/models/Section.ts to add trainerId field (ObjectId, required, indexed, ref: 'Trainer') [BACKEND - SEPARATE REPO]
- [X] T006 [P] Update SectionLink model schema in apps/whatsnxt-bff/app/models/SectionLink.ts to REMOVE uniqueness constraint on (sectionId, contentId) composite - allow duplicate links [BACKEND - SEPARATE REPO]
- [X] T007 [P] Update Post model schema in apps/whatsnxt-bff/app/models/Post.ts to allow sectionId: null (change from required to optional) [BACKEND - SEPARATE REPO]
- [X] T008 [P] Create SectionOwnershipTransfer model in apps/whatsnxt-bff/app/models/SectionOwnershipTransfer.ts (fields: sectionId, fromTrainerId, toTrainerId, status, message, requestedAt, respondedAt, completedAt) [BACKEND - SEPARATE REPO]

### Core Services & Middleware

- [X] T009 Create ownership validation middleware in apps/whatsnxt-bff/app/middleware/ownershipGuard.ts (verify trainer owns section or is admin) [BACKEND - SEPARATE REPO]
- [X] T010 Update SectionService in apps/whatsnxt-bff/app/services/SectionService.ts to add trainerId filtering logic (getByTrainer, validateOwnership methods) [BACKEND - SEPARATE REPO]
- [X] T011 [P] Update SectionLinkService in apps/whatsnxt-bff/app/services/SectionLinkService.ts to remove duplicate link checks (allow same section multiple times on same content) [BACKEND - SEPARATE REPO]

### Shared Types

- [X] T012 [P] Define Section interface in packages/core-types/src/Section.ts (add trainerId field)
- [X] T013 [P] Define SectionLink interface in packages/core-types/src/SectionLink.ts
- [X] T014 [P] Define SectionOwnershipTransfer interface in packages/core-types/src/SectionOwnershipTransfer.ts (all states: pending, accepted, declined, cancelled)
- [X] T015 [P] Define OrphanedPost interface in packages/core-types/src/OrphanedPost.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Link Existing Section to Tutorial (Priority: P1) 🎯 MVP

**Goal**: Enable trainers to link existing sections (created by them) to tutorials, displaying only linked sections in sidebar. Core reusability feature.

**Independent Test**: 
1. Create a tutorial as Trainer A
2. Create a section "Introduction" 
3. Open section picker - should show only sections created by Trainer A
4. Link "Introduction" to the tutorial
5. Verify section appears in tutorial sidebar
6. Link same section to a different tutorial - should appear in both sidebars independently

### Backend Implementation for US1

- [X] T016 [P] [US1] Implement GET /api/v1/sidebar/sections?trainerId={id}&contentType={type} endpoint in apps/whatsnxt-bff/app/routes/sections.ts (return only sections owned by trainer)
- [X] T017 [P] [US1] Implement POST /api/v1/sidebar/section-links endpoint in apps/whatsnxt-bff/app/routes/sectionLinks.ts (create link with order value)
- [X] T018 [P] [US1] Implement GET /api/v1/sidebar/section-links?contentId={id} endpoint in apps/whatsnxt-bff/app/routes/sectionLinks.ts (get all links for content, sorted by order)
- [X] T019 [US1] Add validation in SectionLinkService.createLink to verify section exists and trainer has permission to link it
- [X] T020 [US1] Add auto-ordering logic in SectionLinkService.createLink (if order not provided, append to end)

### Frontend Implementation for US1

- [X] T021 [P] [US1] Create SectionLink type definition in apps/web/types/sectionLink.ts
- [X] T022 [P] [US1] Create section-links API client in apps/web/apis/v1/sidebar/sectionLinksApi.ts (createLink, getLinksForContent, deleteLink methods)
- [X] T023 [US1] Update sectionsApi.ts in apps/web/apis/v1/sidebar/sectionsApi.ts to add getByTrainer method with trainerId filtering
- [X] T024 [US1] Create SectionPicker component in apps/web/components/sections/SectionPicker.tsx (searchable list, filters by trainerId from current user context, shows usage stats per section)
- [X] T025 [US1] Add "Link Existing Section" button to tutorial editor that opens SectionPicker modal [IMPLEMENTED IN CONTENTSECTIONMANAGER]
- [X] T026 [US1] Update tutorial sidebar component to display only linked sections (fetch from section-links API, not all sections) [IMPLEMENTED IN CONTENTSECTIONMANAGER]
- [X] T027 [US1] Add success notification when section is linked successfully [IMPLEMENTED IN SECTIONPICKER]

**Checkpoint**: At this point, trainers can link their own sections to tutorials and see them in the sidebar. MVP functionality complete.

---

## Phase 4: User Story 2 - Create New Reusable Section (Priority: P1)

**Goal**: Enable trainers to create new sections during tutorial editing with trainerId auto-assigned, building the section library for reuse.

**Independent Test**:
1. Create tutorial as Trainer A
2. Click "Create New Section"
3. Fill in title "Getting Started", select icon, check "Make reusable"
4. Section is created with trainerId = Trainer A's ID
5. Create new tutorial as Trainer A
6. Open section picker - "Getting Started" should appear in list
7. Link to new tutorial - verify it works

### Backend Implementation for US2

- [X] T028 [P] [US2] Implement POST /api/v1/sidebar/sections endpoint in apps/whatsnxt-bff/app/routes/sections.ts (create section with trainerId from authenticated user)
- [X] T029 [US2] Add slug generation logic in SectionService.createSection (URL-friendly, handle conflicts by appending numbers)
- [X] T030 [US2] Add validation in SectionService.createSection (title 3-100 chars, contentType enum, trainerId required)

### Frontend Implementation for US2

- [X] T031 [P] [US2] Create CreateSectionModal component in apps/web/components/sections/CreateSectionModal.tsx (form with title, description, icon picker, contentType, "make reusable" checkbox)
- [X] T032 [US2] Add createSection method to sectionsApi.ts in apps/web/apis/v1/sidebar/sectionsApi.ts [ALREADY EXISTS]
- [X] T033 [US2] Add "Create New Section" button to tutorial editor that opens CreateSectionModal [IMPLEMENTED IN CONTENTSECTIONMANAGER]
- [X] T034 [US2] Auto-link newly created section to current tutorial after creation [IMPLEMENTED IN CREATESECTIONMODAL]
- [X] T035 [US2] Update SectionPicker to refresh list after new section created [HANDLED BY CALLBACK]

**Checkpoint**: Trainers can now create and reuse sections. Combined with US1, basic section management is complete.

---

## Phase 5: User Story 3 - Unlink Section from Content (Priority: P1)

**Goal**: Enable trainers to remove sections from tutorials without deleting them globally, orphaning posts in the process.

**Independent Test**:
1. Create tutorial with 3 linked sections, section "Advanced" has 5 posts
2. Click unlink (✕) button on "Advanced" section
3. Section disappears from tutorial sidebar
4. Section still exists in global library
5. 5 posts become orphaned (sectionId = null)
6. Posts appear in "Unassigned Posts" view in sidebar
7. Verify other tutorials using "Advanced" section are unaffected

### Backend Implementation for US3

- [X] T036 [P] [US3] Implement DELETE /api/v1/sidebar/section-links/{linkId} endpoint in apps/whatsnxt-bff/app/routes/sectionLinks.ts
- [X] T037 [US3] Add orphaning logic in SectionLinkService.deleteLink (UPDATE posts SET sectionId=NULL WHERE contentId=X AND sectionId=Y, return orphanedCount)
- [X] T038 [US3] Add validation in SectionLinkService.deleteLink to verify user has permission to unlink (owns content or is admin)

### Frontend Implementation for US3

- [X] T039 [P] [US3] Add unlink button (✕ icon) next to each section in tutorial sidebar [IMPLEMENTED IN CONTENTSECTIONMANAGER]
- [X] T040 [US3] Create UnlinkConfirmationModal component in apps/web/components/sections/UnlinkConfirmationModal.tsx (show post count that will be orphaned)
- [X] T041 [US3] Implement deleteLink in sectionLinksApi.ts (already defined in US1, ensure it handles orphanedCount response) [ALREADY EXISTS]
- [X] T042 [US3] Update sidebar to remove section from display after successful unlink [IMPLEMENTED IN CONTENTSECTIONMANAGER]
- [X] T043 [US3] Show toast notification with orphaned post count after unlink [IMPLEMENTED IN UNLINKCONFIRMATIONMODAL]

**Checkpoint**: Basic CRUD for section management at tutorial level is complete. US1+US2+US3 form the core P1 functionality.

---

## Phase 6: User Story 4 - Add Posts to Linked Sections (Priority: P2)

**Goal**: Enable trainers to add posts to specific sections within tutorials, organizing content under appropriate reusable sections.

**Independent Test**:
1. Create tutorial with linked section "Introduction"
2. Click "Add Post to this Section" under "Introduction"
3. Create post "What is React?"
4. Post appears under "Introduction" section in sidebar
5. Add post to same section in different tutorial - should only appear in that tutorial
6. Verify posts are independent per tutorial even though section is shared

### Backend Implementation for US4

- [X] T044 [P] [US4] Update POST /api/v1/posts endpoint in apps/whatsnxt-bff/app/routes/posts.ts to accept sectionId in request body
- [X] T045 [US4] Add validation in PostService.createPost to verify sectionId is linked to contentId (query SectionLink where sectionId=X AND contentId=Y, must exist)
- [X] T046 [US4] Add auto-ordering logic in PostService.createPost (calculate max sectionOrder for this section + content, increment by 1)

### Frontend Implementation for US4

- [X] T047 [P] [US4] Add "Add Post" button under each section in tutorial sidebar
- [X] T048 [US4] Update CreatePostModal component in apps/web/components/posts/ to include section selector dropdown (show only linked sections)
- [X] T049 [US4] Add sectionId field to post creation API request in postsApi.ts
- [X] T050 [US4] Update sidebar to display posts nested under their sections (group by sectionId)
- [X] T051 [US4] Add drag-and-drop reordering for posts within a section (update sectionOrder field)

**Checkpoint**: Content organization is now fully functional. Trainers can structure tutorials with sections and posts.

---

## Phase 7: User Story 5 - Search and Filter Available Sections (Priority: P2)

**Goal**: Enable trainers to quickly find relevant sections from a large library when linking to tutorials.

**Independent Test**:
1. Populate system with 50+ sections as Trainer A
2. Open SectionPicker modal
3. Type "intro" in search box
4. Results should show only sections with "intro" in title/description
5. Apply filter "Tutorial" type
6. Results should show only tutorial-type sections
7. Verify search is fast (<2 seconds)

### Backend Implementation for US5

- [X] T052 [P] [US5] Add search query parameter to GET /api/v1/sidebar/sections in apps/whatsnxt-bff/app/routes/sections.ts (case-insensitive regex on title and description)
- [X] T053 [P] [US5] Add pagination parameters (page, limit) to GET /api/v1/sidebar/sections endpoint
- [X] T054 [US5] Add database indexes in Section model: (trainerId, contentType), (title), (contentType, isVisible) for search performance
- [X] T055 [US5] Implement section usage stats aggregation in SectionService.getUsageStats (count SectionLinks, return contentIds and titles)

### Frontend Implementation for US5

- [X] T056 [P] [US5] Add search input with debounce (300ms) to SectionPicker component in apps/web/components/sections/SectionPicker.tsx
- [X] T057 [P] [US5] Add contentType filter dropdown to SectionPicker (Blog, Tutorial, All)
- [X] T058 [US5] Add pagination controls to SectionPicker (Load More button or infinite scroll)
- [X] T059 [US5] Display usage count badge on each section in picker ("Used in 3 tutorials")
- [X] T060 [US5] Add empty state message when search returns no results ("No sections found. Create new section?")

**Checkpoint**: Section discovery is optimized. Trainers can efficiently find sections in large libraries.

---

## Phase 8: User Story 6 - Reorder Sections within Tutorial (Priority: P3)

**Goal**: Enable trainers to control section display order within tutorials via drag-and-drop, independent per tutorial.

**Independent Test**:
1. Create tutorial with sections [Introduction, Advanced, Basics]
2. Drag "Basics" between "Introduction" and "Advanced"
3. Order should become [Introduction, Basics, Advanced]
4. Refresh page - order persists
5. Open different tutorial using same sections - order should be unchanged
6. Verify order is per-tutorial, not global

### Backend Implementation for US6

- [X] T061 [P] [US6] Implement PATCH /api/v1/sidebar/section-links/{linkId}/reorder endpoint in apps/whatsnxt-bff/app/routes/sectionLinks.ts (accepts newOrder)
- [X] T062 [US6] Add reordering logic in SectionLinkService.reorder (shift all links between oldOrder and newOrder, update target link)
- [X] T063 [US6] Wrap reorder operations in transaction to ensure atomicity

### Frontend Implementation for US6

- [X] T064 [P] [US6] Install and configure @dnd-kit/core and @dnd-kit/sortable in apps/web/package.json
- [X] T065 [US6] Make section list in tutorial sidebar draggable using @dnd-kit in apps/web/components/sections/SectionList.tsx
- [X] T066 [US6] Implement optimistic UI update for reordering (update local state immediately, rollback on API error)
- [X] T067 [US6] Call PATCH /api/v1/sidebar/section-links/{linkId}/reorder on drag end
- [X] T068 [US6] Add loading indicator during reorder API call

**Checkpoint**: Tutorial organization is now fully flexible. Trainers can customize section flow per tutorial.

---

## Phase 9: User Story 7 - View Section Usage Statistics (Priority: P3)

**Goal**: Enable trainers and admins to see where sections are being used for impact analysis.

**Independent Test**:
1. Create section "Introduction" and link to 5 different tutorials
2. Open section details page
3. Verify "Used in 5 tutorials" is displayed
4. Verify list shows all 5 tutorial names with links
5. For unused section, verify "Not used" message appears with delete option

### Backend Implementation for US7

- [X] T069 [P] [US7] Implement GET /api/v1/sidebar/sections/{sectionId}/usage endpoint in apps/whatsnxt-bff/app/routes/sections.ts
- [X] T070 [US7] Add SectionService.getUsageDetails method to aggregate SectionLinks with content details (join with Tutorial/Blog, return titles and IDs)
- [X] T071 [US7] Add section usage count to GET /api/v1/sidebar/sections list response (aggregate SectionLinks grouped by sectionId)

### Frontend Implementation for US7

- [X] T072 [P] [US7] Create SectionUsageModal component in apps/web/components/sections/SectionUsageModal.tsx (display usage count and list of tutorials/blogs)
- [X] T073 [US7] Add "View Usage" button/link to each section in section library view
- [X] T074 [US7] Display usage count badge in SectionPicker for each section ("Used in X places")
- [X] T075 [US7] Add usage stats to section details page (if exists) or section hover tooltip

**Checkpoint**: Trainers have visibility into section usage patterns. Enables informed decisions about section changes.

---

## Phase 10: User Story 8 - Transfer Section Ownership (Priority: P3)

**Goal**: Enable trainers to transfer section ownership to other trainers with explicit acceptance required, maintaining existing links.

**Independent Test**:
1. Trainer A creates section "Introduction" and links to 3 tutorials
2. Trainer A initiates transfer to Trainer B
3. Trainer B receives notification/request
4. Trainer B accepts transfer
5. Verify section.trainerId now equals Trainer B's ID
6. Verify Trainer A can no longer edit/delete section
7. Verify Trainer B can now edit/delete section
8. Verify all 3 tutorial links remain active and unchanged

### Backend Implementation for US8

- [X] T076 [P] [US8] Implement POST /api/v1/sections/{sectionId}/transfer endpoint in apps/whatsnxt-bff/app/routes/sections.ts (create SectionOwnershipTransfer with status=pending)
- [X] T077 [P] [US8] Implement GET /api/v1/section-transfers?toTrainerId={id}&status=pending endpoint in apps/whatsnxt-bff/app/routes/sections.ts (list pending requests for trainer)
- [X] T078 [P] [US8] Implement GET /api/v1/section-transfers?fromTrainerId={id} endpoint in apps/whatsnxt-bff/app/routes/sections.ts (list sent requests)
- [X] T079 [P] [US8] Implement POST /api/v1/section-transfers/{transferId}/accept endpoint in apps/whatsnxt-bff/app/routes/sections.ts
- [X] T080 [P] [US8] Implement POST /api/v1/section-transfers/{transferId}/decline endpoint in apps/whatsnxt-bff/app/routes/sections.ts
- [X] T081 [P] [US8] Implement DELETE /api/v1/section-transfers/{transferId} endpoint in apps/whatsnxt-bff/app/routes/sections.ts (cancel pending transfer)
- [X] T082 [US8] Create SectionOwnershipService in apps/whatsnxt-bff/app/services/SectionOwnershipService.ts with methods: initiateTransfer, acceptTransfer, declineTransfer, cancelTransfer
- [X] T083 [US8] Add validation in SectionOwnershipService.initiateTransfer (check for existing pending transfer, verify fromTrainerId owns section)
- [X] T084 [US8] Add ownership update logic in SectionOwnershipService.acceptTransfer (UPDATE sections SET trainerId=toTrainerId, UPDATE transfer SET status=accepted, completedAt=NOW)
- [X] T085 [US8] Wrap ownership transfer in transaction to ensure atomicity (transfer status + section.trainerId update)

### Frontend Implementation for US8

- [X] T086 [P] [US8] Create section-ownership-transfer API client in apps/web/apis/v1/sidebar/sectionOwnershipApi.ts (initiateTransfer, acceptTransfer, declineTransfer, cancelTransfer, getPendingRequests)
- [X] T087 [P] [US8] Create SectionTransferModal component in apps/web/components/sections/SectionTransferModal.tsx (trainer selector, optional message field)
- [X] T088 [US8] Add "Transfer Ownership" button to section details/edit page (only show if user is owner)
- [X] T089 [US8] Create TransferRequestsPanel component in apps/web/components/sections/TransferRequestsPanel.tsx (list pending requests with Accept/Decline buttons)
- [X] T090 [US8] Add pending transfer requests notification badge to user menu or dashboard
- [X] T091 [US8] Create TransferRequestNotification component to show real-time notifications when user receives transfer request
- [X] T092 [US8] Update section edit/delete UI to disable buttons if user is not owner (check section.trainerId vs current user ID)
- [X] T093 [US8] Add success/error notifications for all transfer operations (initiate, accept, decline, cancel)

**Checkpoint**: Section ownership can now be transferred between trainers. Enables collaboration and section governance.

---

## Phase 11: Orphaned Posts Management & Admin Features

**Purpose**: Complete orphaned posts workflow and admin-specific capabilities

### Orphaned Posts Management

- [X] T094 [P] Implement GET /api/v1/content/{contentId}/orphaned-posts endpoint in apps/whatsnxt-bff/app/routes/posts.ts (return posts where sectionId=null for given contentId)
- [X] T095 [P] Implement POST /api/v1/posts/{postId}/reassign endpoint in apps/whatsnxt-bff/app/routes/posts.ts (validate section is linked to content, update sectionId and sectionOrder)
- [X] T096 [P] Implement DELETE /api/v1/posts/{postId} endpoint in apps/whatsnxt-bff/app/routes/posts.ts (permanent delete for orphaned posts)
- [X] T097 [P] Create OrphanedPostsView component in apps/web/components/sections/OrphanedPostsView.tsx (list of orphaned posts with reassign dropdown and delete button)
- [X] T098 Add "Unassigned Posts" section to tutorial sidebar (show count badge, expand to show orphaned posts)
- [X] T099 [P] Add bulk reassign functionality to OrphanedPostsView (select multiple posts, reassign all to same section)
- [X] T100 [P] Add bulk delete functionality to OrphanedPostsView (select multiple, delete all)

### Admin Section Management

- [X] T101 Update ownership middleware in apps/whatsnxt-bff/app/middleware/ownershipGuard.ts to bypass checks for admin role
- [X] T102 Update GET /api/v1/sidebar/sections to return ALL sections for admins (ignore trainerId filter)
- [X] T103 Update SectionPicker component to show all sections when current user is admin
- [X] T104 Add admin badge/indicator on sections created by other trainers in admin's picker view

### Section Deletion with Impact Preview

- [X] T105 [P] Implement GET /api/v1/sections/{sectionId}/delete-impact endpoint in apps/whatsnxt-bff/app/routes/sections.ts (return list of affected content with orphaned post counts)
- [X] T106 [P] Update DELETE /api/v1/sections/{sectionId} endpoint to cascade delete SectionLinks and orphan posts
- [X] T107 [P] Create SectionDeleteConfirmModal component in apps/web/components/sections/SectionDeleteConfirmModal.tsx (show impact preview, require explicit confirmation)
- [X] T108 Add "Delete Section" button to section edit page (opens confirmation modal with impact preview)
- [X] T109 Show warning banner if section is used in multiple places before opening delete confirmation

### Trainer Deletion Cascade

- [ ] T110 Implement cascade deletion in TrainerService.deleteTrainer in apps/whatsnxt-bff/app/services/TrainerService.ts (delete all sections where trainerId=X, cascade to SectionLinks, orphan posts)
- [ ] T111 Add cancellation of pending transfers in TrainerService.deleteTrainer (delete SectionOwnershipTransfers where fromTrainerId=X OR toTrainerId=X)
- [ ] T112 Wrap trainer deletion in transaction to ensure atomicity (trainer + sections + transfers + orphaning posts)

**NOTE**: T110-T112 require TrainerService which is outside the scope of section management. These should be implemented when trainer deletion feature is added.

**Checkpoint**: All edge cases and admin workflows are complete. System handles orphaned posts gracefully.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and finalization

### Performance Optimization

- [ ] T113 [P] Add database indexes for performance: (trainerId, contentType), (contentId, order), (contentId, sectionId), (sectionId) in respective models
- [X] T114 [P] Implement pagination for section picker (virtual scrolling with React Virtuoso or tanstack-virtual)
- [X] T115 [P] Add debounced search (300ms) to section picker search input
- [ ] T116 Optimize section usage stats query with aggregation pipeline caching

### Error Handling & Validation

- [ ] T117 [P] Add comprehensive error handling in all API endpoints with appropriate HTTP status codes
- [X] T118 [P] Add validation error messages in all frontend forms (title length, required fields)
- [ ] T119 [P] Add Winston logging with context (trainerId, sectionId, operation) in all service methods

### UI/UX Polish

- [X] T120 [P] Add loading skeletons for section picker, sidebar, and usage stats
- [X] T121 [P] Add empty states for all list views (no sections, no orphaned posts, no pending transfers)
- [X] T122 [P] Add success/error toast notifications for all mutations (create, delete, link, unlink, transfer)
- [X] T123 Add keyboard shortcuts for common actions (Esc to close modals, Enter to submit forms)
- [X] T124 Ensure all modals and forms are accessible (ARIA labels, keyboard navigation, focus management)

### Documentation

- [ ] T125 [P] Update API documentation with all new endpoints in OpenAPI specs
- [X] T126 [P] Add inline code comments for complex business logic (cascade deletion, orphaning, ownership transfer)
- [X] T127 [P] Create user guide for section management (how to link, unlink, transfer ownership) in docs/

### Testing & Validation

- [X] T128 Run quickstart.md validation to ensure all documented flows work end-to-end
- [ ] T129 Manual testing of all 8 user stories with acceptance scenarios from spec.md
- [ ] T130 Performance testing with 100+ sections and 50+ linked sections per tutorial
- [ ] T131 Security testing of ownership boundaries (trainer A cannot edit trainer B's sections)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Phase 2 - REQUIRED for MVP
  - US2 (Phase 4): Can start after Phase 2 - REQUIRED for MVP  
  - US3 (Phase 5): Can start after Phase 2 - REQUIRED for MVP
  - US4 (Phase 6): Can start after Phase 2 + US1 (needs section links to exist)
  - US5 (Phase 7): Can start after Phase 2 + US1 (enhances section picker)
  - US6 (Phase 8): Can start after Phase 2 + US1 (reorders section links)
  - US7 (Phase 9): Can start after Phase 2 + US1 (requires section links for stats)
  - US8 (Phase 10): Can start after Phase 2 + US2 (requires sections with trainerId)
- **Orphaned Posts & Admin (Phase 11)**: Depends on US3 (unlinking creates orphaned posts)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### MVP Scope (Immediate Value)

For fastest time-to-value, implement in this order:

1. **Phase 1** (Setup) → 4 tasks
2. **Phase 2** (Foundational) → 11 tasks
3. **Phase 3** (US1 - Link sections) → 12 tasks
4. **Phase 4** (US2 - Create sections) → 8 tasks  
5. **Phase 5** (US3 - Unlink sections) → 8 tasks

**Total MVP tasks**: 43 tasks delivers core reusable sections capability

Then incrementally add:
- Phase 6 (US4) for post organization
- Phase 7 (US5) for search/filtering
- Phase 11 for orphaned posts management
- Phase 8 (US6) for reordering
- Phase 9 (US7) for usage stats
- Phase 10 (US8) for ownership transfer
- Phase 12 for polish

### User Story Dependencies

- **US1 (Link sections)**: Foundation only - INDEPENDENT
- **US2 (Create sections)**: Foundation only - INDEPENDENT
- **US3 (Unlink sections)**: Foundation only - INDEPENDENT
- **US4 (Add posts)**: Requires US1 (needs linked sections) - DEPENDENT
- **US5 (Search/filter)**: Enhances US1 (better section picker) - INDEPENDENT but low value without US1
- **US6 (Reorder)**: Requires US1 (reorders links) - DEPENDENT
- **US7 (Usage stats)**: Requires US1 (stats about links) - DEPENDENT
- **US8 (Transfer)**: Requires US2 (sections have owners) - DEPENDENT

### Within Each User Story

- Backend endpoints before frontend API clients
- API clients before UI components
- Core components before integration with existing pages
- Form validation before submission handlers

### Parallel Opportunities

Once **Phase 2 (Foundational)** is complete:

- **US1, US2, US3** can all be developed in parallel by different developers (P1 priority, independent)
- Within each story, tasks marked [P] can run in parallel
- All shared type definitions (T012-T015) can be done in parallel
- All database model updates (T005-T008) can be done in parallel
- Frontend and backend for same story can proceed in parallel if contracts are clear

**Example parallel execution after Foundation:**

```bash
# Developer A focuses on US1 (Link sections)
T016-T020: Backend endpoints for linking
T021-T027: Frontend section picker and linking UI

# Developer B focuses on US2 (Create sections)  
T028-T030: Backend endpoints for creation
T031-T035: Frontend create section modal

# Developer C focuses on US3 (Unlink sections)
T036-T038: Backend endpoints for unlinking
T039-T043: Frontend unlink UI and confirmation
```

---

## Parallel Example: Foundational Phase

```bash
# After T005 (Section model update) completes, these can run in parallel:
T006: Update SectionLink model (different file)
T007: Update Post model (different file)
T008: Create SectionOwnershipTransfer model (different file)

# These can run in parallel with model updates:
T012: Define Section interface in packages/section-types
T013: Define SectionLink interface in packages/section-types
T014: Define SectionOwnershipTransfer interface in packages/section-types
T015: Define OrphanedPost interface in packages/section-types
```

---

## Implementation Strategy

### Recommended Approach: MVP First

**Week 1**: Setup + Foundation
- Complete Phase 1 (4 tasks) - ~4 hours
- Complete Phase 2 (11 tasks) - ~12 hours
- **Checkpoint**: Database ready, types defined, core services structured

**Week 2**: Core P1 Features (MVP)
- Complete Phase 3 (US1 - 12 tasks) - ~16 hours
- Complete Phase 4 (US2 - 8 tasks) - ~10 hours
- Complete Phase 5 (US3 - 8 tasks) - ~10 hours
- **Checkpoint**: Trainers can create, link, and unlink sections. Basic reusability works end-to-end.

**Week 3**: Test & Refine MVP
- Manual testing of US1, US2, US3 acceptance scenarios
- Bug fixes and UX improvements
- **Deploy MVP to staging** for user feedback

**Week 4+**: Incremental Feature Additions
- Phase 6 (US4) if content organization needed immediately
- Phase 11 (Orphaned posts) if users start unlinking sections
- Phase 7 (US5) when section library grows beyond 20-30 sections
- Phase 8 (US6) for advanced tutorial customization
- Phase 9 (US7) for governance visibility
- Phase 10 (US8) for collaboration workflows
- Phase 12 (Polish) continuously

### Estimated Total Effort

- **Setup**: 4 tasks × 1 hour = 4 hours
- **Foundation**: 11 tasks × 1-2 hours = 16 hours
- **US1 (P1)**: 12 tasks × 1.5 hours = 18 hours
- **US2 (P1)**: 8 tasks × 1.5 hours = 12 hours
- **US3 (P1)**: 8 tasks × 1.5 hours = 12 hours
- **US4 (P2)**: 8 tasks × 1.5 hours = 12 hours
- **US5 (P2)**: 9 tasks × 1.5 hours = 14 hours
- **US6 (P3)**: 8 tasks × 1.5 hours = 12 hours
- **US7 (P3)**: 7 tasks × 1.5 hours = 11 hours
- **US8 (P3)**: 18 tasks × 2 hours = 36 hours (most complex - ownership transfer workflow)
- **Orphaned Posts & Admin**: 19 tasks × 1.5 hours = 29 hours
- **Polish**: 19 tasks × 1 hour = 19 hours

**Total**: 131 tasks, ~195 development hours

**MVP Subset** (Phases 1-5): 43 tasks, ~62 hours (2 developers × 1.5 weeks)

---

## Format Validation

✅ All tasks follow required format:
- Checkbox: `- [ ]`
- Task ID: Sequential (T001, T002, ...)
- [P] marker: Only on parallelizable tasks (different files, no dependencies)
- [Story] label: Present on all user story phase tasks (US1-US8)
- Description: Includes exact file paths
- Clear action verbs: Create, Implement, Add, Update, etc.

✅ Organization:
- Tasks grouped by user story (phases)
- Each phase has clear goal and independent test criteria
- Dependencies explicitly stated
- MVP scope clearly identified

✅ Implementation ready:
- File paths are absolute and specific
- Tasks are atomic and independently completable
- Technical details sufficient for execution
- No ambiguous or vague descriptions

---

## Summary

**Total Tasks**: 131  
**MVP Tasks**: 43 (Phases 1-5)  
**Parallel Opportunities**: 50+ tasks can run in parallel after Foundation phase  
**Independent Test Criteria**: Defined for each of 8 user stories  
**MVP Delivery**: US1 (Link) + US2 (Create) + US3 (Unlink) = Core reusability feature

**Task Breakdown by User Story**:
- US1 (Link sections): 12 tasks - Core feature, enables reuse
- US2 (Create sections): 8 tasks - Builds library, enables US1
- US3 (Unlink sections): 8 tasks - Safe reorganization, creates orphans
- US4 (Add posts): 8 tasks - Content organization within sections
- US5 (Search/filter): 9 tasks - Section discovery optimization
- US6 (Reorder): 8 tasks - Tutorial-specific section ordering
- US7 (Usage stats): 7 tasks - Impact visibility for changes
- US8 (Transfer ownership): 18 tasks - Complex collaboration workflow

**Ready for implementation**: Each task is atomic, has clear acceptance criteria, and includes exact file paths. Begin with Phase 1 (Setup) immediately.

---

## Phase 13: Form Integration - BlogForm and TutorialForm (Priority: CRITICAL GAP)

**Goal**: Integrate section management directly into blog and tutorial creation/edit forms so users can optionally link posts to sections during content creation.

**Gap Analysis**: Posts are currently created from BlogForm.tsx and TutorialForm.tsx, but there is NO UI to link these posts into sections during creation. Users must create posts first, then separately organize them into sections. This creates a poor UX and defeats the purpose of section-based organization.

**Independent Test**:
1. Open BlogForm to create a new blog post
2. Fill in title, description, category
3. See ContentSectionManager component showing option to link to existing section OR create new section
4. Select or create a section (optional - should be able to skip)
5. Submit form
6. Verify post is created with sectionId field set (if section was selected) or null (if skipped)
7. Repeat for TutorialForm
8. Verify backward compatibility - existing posts without sections still work

### Backend Verification for Form Integration

- [ ] T132 [P] [FORM] Verify POST /api/v1/blogs endpoint accepts optional sectionId field in apps/whatsnxt-bff/app/routes/blogs.ts (should already exist from Phase 2-4 work)
- [ ] T133 [P] [FORM] Verify POST /api/v1/tutorials endpoint accepts optional sectionId field in apps/whatsnxt-bff/app/routes/tutorials.ts (should already exist from Phase 2-4 work)
- [ ] T134 [P] [FORM] Verify PATCH /api/v1/blogs/{id} endpoint accepts optional sectionId field for editing (should already exist)
- [ ] T135 [P] [FORM] Verify PATCH /api/v1/tutorials/{id} endpoint accepts optional sectionId field for editing (should already exist)

### Frontend Implementation for BlogForm Integration

- [ ] T136 [FORM] Import ContentSectionManager component in apps/web/components/Blog/Form/BlogForm.tsx
- [ ] T137 [FORM] Add sectionId state to BlogForm component form state (defaultValue: null, indicating optional)
- [ ] T138 [FORM] Add ContentSectionManager component to BlogForm UI between category selection and image upload sections with props: contentId (use temporary ID for new posts or actual ID for edit), contentType='blog', trainerId (from user context), isEditing=true, showPostCounts=false
- [ ] T139 [FORM] Update handleFormSubmit in BlogForm to include sectionId in payload (payload.sectionId = selectedSectionId || null)
- [ ] T140 [FORM] Add visual indicator/help text in BlogForm explaining that section assignment is optional ("Organize this post into a section (optional)")
- [ ] T141 [FORM] Handle case where user creates new section inline during blog creation - ensure section is created before blog post is submitted

### Frontend Implementation for TutorialForm Integration

- [ ] T142 [FORM] Import ContentSectionManager component in apps/web/components/Blog/Form/TutorialForm.tsx
- [ ] T143 [FORM] Add sectionId state to TutorialForm component form state for EACH tutorial page (tutorials array item should have sectionId field, defaultValue: null)
- [ ] T144 [FORM] Add ContentSectionManager component to TutorialForm UI below category selection with props: contentId (use temporary ID for new or actual ID for edit), contentType='tutorial', trainerId (from user context), isEditing=true, showPostCounts=false
- [ ] T145 [FORM] Update handleFormSubmit in TutorialForm to include sectionId for each tutorial page in tutorials array (tutorials[i].sectionId = selectedSectionId || null)
- [ ] T146 [FORM] Add visual indicator/help text in TutorialForm explaining that section assignment is optional per page ("Organize tutorial pages into sections (optional)")
- [ ] T147 [FORM] Handle multi-page tutorial scenario - allow different sections for different pages OR same section for all pages (UI design decision needed)

### Additional Integration Tasks

- [ ] T148 [P] [FORM] Add user context/auth hook to both forms to retrieve trainerId for ContentSectionManager (apps/web/hooks/useAuth.ts or similar)
- [ ] T149 [P] [FORM] Update form validation to ensure sectionId (if provided) references a valid, existing section owned by the trainer
- [ ] T150 [FORM] Add error handling for section creation failures during form submission (rollback blog/tutorial creation if section creation fails when user creates inline section)
- [ ] T151 [FORM] Update BlogForm and TutorialForm TypeScript types to include optional sectionId field in form data interfaces
- [ ] T152 [FORM] Add visual feedback (loading state) when ContentSectionManager is fetching linked sections during form edit mode

### Documentation Updates

- [ ] T153 [P] [FORM] Update user documentation to explain how to link posts to sections during creation at docs/ or relevant location
- [ ] T154 [P] [FORM] Add inline help tooltips or info icons in forms explaining section benefits ("Sections help organize related posts together")
- [ ] T155 [FORM] Update form submission error messages to include section-related errors (e.g., "Section not found", "You don't have permission to link to this section")

**Checkpoint**: After this phase, users can create blog posts and tutorials with optional section assignment directly from the creation forms. The critical UX gap is closed. Section organization becomes seamless instead of a two-step process.

---

## Updated Summary

**Total Tasks**: 155 (was 131, added 24 for form integration)
**Critical Gap Tasks (Phase 13)**: 24 tasks - ~32 hours
**MVP Tasks**: 43 + 24 = 67 (must include form integration for viable product)
**Estimated Effort for Form Integration**: ~32 hours (24 tasks × ~1.5 hours each)

**New MVP Delivery**: US1 (Link) + US2 (Create) + US3 (Unlink) + **Form Integration** = Complete section-based content creation flow

**Priority Adjustment**: Phase 13 (Form Integration) is **CRITICAL** and should be implemented immediately after Phases 1-5 (MVP) to close the UX gap. Without this phase, the section feature is not usable in the primary content creation flow.

**Recommended Implementation Order**:
1. **Week 1**: Phases 1-2 (Setup + Foundation)
2. **Week 2**: Phases 3-5 (US1-US3 MVP backend/API)
3. **Week 3**: **Phase 13 (Form Integration)** ← CRITICAL
4. **Week 4**: Phase 6 (US4 - Post management) + Phase 11 (Orphaned posts)
5. **Week 5+**: Phases 7-10, 12 (Polish and advanced features)

