# Feature Specification: Reusable Sections with Manual Linking

**Feature Branch**: `002-reusable-sections`  
**Created**: 2025-01-29  
**Status**: Draft  
**Input**: User description: "Sections can be reused across multiple tutorials/blogs, manually linked by trainer/user"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Link Existing Section to Tutorial (Priority: P1)

As a trainer creating a tutorial, I want to link existing sections to my tutorial so that I can reuse common organizational structures (like "Introduction" or "Best Practices") across multiple tutorials without recreating them.

**Why this priority**: This is the core value proposition of the feature. Enables immediate reuse of existing sections and eliminates duplicate work. This story alone delivers the minimum viable product - trainers can start organizing content with reusable sections.

**Independent Test**: Can be fully tested by creating a tutorial, selecting the "link existing section" option, choosing from available sections, and verifying the section appears in the tutorial's sidebar. Delivers immediate value by reducing content organization time.

**Acceptance Scenarios**:

1. **Given** I am editing a tutorial with no sections, **When** I click "Add Existing Section" and select "Introduction" from the list, **Then** the "Introduction" section appears in my tutorial's section list
2. **Given** "Introduction" section is already used in Tutorial A, **When** I add the same "Introduction" section to Tutorial B, **Then** both tutorials show the section independently in their respective sidebars
3. **Given** I have linked 3 sections to my tutorial, **When** I view my tutorial's sidebar, **Then** only those 3 sections are displayed (not all available sections)
4. **Given** I am linking an existing section, **When** I view the section selection modal, **Then** I can see which tutorials/blogs already use each section
5. **Given** I want to create a repeating pattern in my tutorial, **When** I link the same "Exercise" section multiple times at different positions, **Then** each instance appears independently in the sidebar with different order values

---

### User Story 2 - Create New Reusable Section (Priority: P1)

As a trainer, I want to create a new section while editing my tutorial and make it available for reuse in other tutorials/blogs, so that I can build a library of commonly used organizational structures.

**Why this priority**: Essential for bootstrapping the section library. Without creating sections, there's nothing to reuse. This enables the P1 link functionality to have content.

**Independent Test**: Can be fully tested by creating a tutorial, clicking "Create New Section", filling in section details with the "make reusable" option enabled, and verifying the section appears in the tutorial and is available in the global section list. Delivers value by enabling section library growth.

**Acceptance Scenarios**:

1. **Given** I am editing a tutorial, **When** I click "Create New Section", fill in title "Getting Started", select an icon, and check "Make this section reusable", **Then** the section is created and appears in my tutorial's section list with me as the owner
2. **Given** I created a reusable section in Tutorial A, **When** I create Tutorial B and view available sections, **Then** the section I created appears in the "Add Existing Section" list
3. **Given** I am creating a new section, **When** I leave the "make reusable" option checked, **Then** the section is available for use in any of my tutorials or blogs
4. **Given** I create a section titled "Advanced Concepts", **When** the system generates a slug for it, **Then** the slug is URL-friendly and unique
5. **Given** I own a section that I no longer need, **When** I initiate a transfer to another trainer, **Then** the system requests confirmation from the target trainer before completing the transfer
6. **Given** I accept a section ownership transfer from another trainer, **When** the transfer completes, **Then** the section appears in my section library and I can edit/delete it while the original owner loses those permissions

---

### User Story 3 - Unlink Section from Content (Priority: P1)

As a trainer, I want to remove a section from my tutorial without deleting the section globally, so that I can reorganize my tutorial structure without affecting other tutorials that use the same section.

**Why this priority**: Critical for content management flexibility. Trainers need the ability to change their mind about section organization without fearing they'll break other content. This completes the basic CRUD operations for section management at the tutorial level.

**Independent Test**: Can be fully tested by linking a section to a tutorial, then clicking "unlink" on that section, and verifying it disappears from the tutorial but remains available in the global section list and other tutorials. Delivers value by enabling safe content reorganization.

**Acceptance Scenarios**:

1. **Given** my tutorial has 3 linked sections, **When** I click the unlink button (✕) on the "Advanced Topics" section, **Then** the section is removed from my tutorial but remains in the global section library
2. **Given** "Introduction" section is linked to both Tutorial A and Tutorial B, **When** I unlink it from Tutorial A, **Then** it still appears in Tutorial B's sidebar
3. **Given** I unlink a section that contains 5 posts, **When** the section is unlinked, **Then** the 5 posts remain in the tutorial but become orphaned (no longer associated with any section), and I can view them in an "Unassigned Posts" section in the tutorial sidebar where I can either reassign them to other sections or delete them manually
4. **Given** I accidentally unlinked a section, **When** I immediately re-link the same section, **Then** the section is restored to my tutorial, but previously orphaned posts remain orphaned and must be manually reassigned

---

### User Story 4 - Add Posts to Linked Sections (Priority: P2)

As a trainer, I want to add tutorial posts to specific sections within my tutorial, so that I can organize my content under the appropriate reusable sections.

**Why this priority**: Enables actual content population after section structure is defined. While important, the structure management (P1) must exist first. This builds on the foundation laid by P1 stories.

**Independent Test**: Can be fully tested by creating a tutorial with linked sections, adding posts to specific sections, and verifying posts appear under the correct sections in the sidebar. Delivers value by enabling complete tutorial organization.

**Acceptance Scenarios**:

1. **Given** my tutorial has a linked "Introduction" section, **When** I click "Add Post to this Section" and create a post titled "What is React?", **Then** the post appears under the "Introduction" section in my tutorial's sidebar
2. **Given** "Introduction" section is linked to both Tutorial A (React) and Tutorial B (Vue), **When** I add posts to "Introduction" in Tutorial A, **Then** those posts only appear in Tutorial A, not in Tutorial B
3. **Given** I have multiple sections in my tutorial, **When** I create a new post, **Then** I can select which section it belongs to
4. **Given** a section has 5 posts, **When** I reorder the posts within that section, **Then** the new order is saved and reflected in the sidebar

---

### User Story 5 - Search and Filter Available Sections (Priority: P2)

As a trainer, I want to search and filter available sections when linking them to my tutorial, so that I can quickly find the most relevant sections from a large library.

**Why this priority**: Becomes critical as the section library grows. Without this, P1 functionality becomes cumbersome with many sections. Enhances usability of existing features rather than adding new capability.

**Independent Test**: Can be fully tested by populating the system with 20+ sections, opening the "Add Existing Section" modal, using search and filters, and verifying correct results appear. Delivers value by improving section discovery speed.

**Acceptance Scenarios**:

1. **Given** there are 50 sections in the library, **When** I type "intro" in the search box, **Then** I see only sections with "intro" in their title or description
2. **Given** the section library contains both blog and tutorial sections, **When** I filter by "Tutorial" type, **Then** I see only sections tagged as tutorial-type
3. **Given** I am searching for sections, **When** I view search results, **Then** I can see how many times each section has been used and in which content
4. **Given** search returns no results, **When** I view the empty state, **Then** I see a suggestion to create a new section with my search term

---

### User Story 6 - Reorder Sections within Tutorial (Priority: P3)

As a trainer, I want to change the order of sections in my tutorial, so that I can control the learning flow and progression.

**Why this priority**: Refinement feature that improves content organization quality. Tutorials are still functional with any section order, making this a lower priority than core linking and content features.

**Independent Test**: Can be fully tested by creating a tutorial with 3+ sections, dragging them to reorder, and verifying the new order persists and reflects in the sidebar. Delivers value by enabling pedagogical optimization.

**Acceptance Scenarios**:

1. **Given** my tutorial has sections ordered as [Introduction, Advanced, Basics], **When** I drag "Basics" between "Introduction" and "Advanced", **Then** the order becomes [Introduction, Basics, Advanced]
2. **Given** I reorder sections in Tutorial A, **When** I view Tutorial B that uses the same sections, **Then** Tutorial B's section order is unchanged
3. **Given** I reorder sections, **When** I save the tutorial, **Then** the new order is persisted and shown to all users viewing the tutorial

---

### User Story 7 - View Section Usage Statistics (Priority: P3)

As a trainer or admin, I want to see where each section is being used, so that I can understand the impact of changes and identify popular organizational patterns.

**Why this priority**: Analytics and insight feature that doesn't affect core functionality. Useful for content governance but not essential for daily operations.

**Independent Test**: Can be fully tested by creating sections used across multiple tutorials, viewing a section's details, and verifying the usage count and list of tutorials/blogs appears. Delivers value by enabling informed section management decisions.

**Acceptance Scenarios**:

1. **Given** "Introduction" section is linked to 5 tutorials, **When** I view the section details, **Then** I see "Used in 5 tutorials" with a list of tutorial names
2. **Given** I am about to edit a section's title, **When** I view the section, **Then** I can see which tutorials will be affected by my changes
3. **Given** a section is not used anywhere, **When** I view it in the section library, **Then** I see "Not used" with an option to delete it

---

### User Story 8 - Transfer Section Ownership (Priority: P3)

As a trainer, I want to transfer ownership of a section I created to another trainer, so that they can take over maintenance and editing responsibilities when I no longer need to manage it.

**Why this priority**: Collaboration and handoff feature that improves team workflows but is not essential for core functionality. Trainers can still use sections across content without ownership transfer.

**Independent Test**: Can be fully tested by creating a section, initiating a transfer to another trainer, verifying the target trainer receives a request, accepting the transfer, and confirming ownership has changed with the original trainer losing edit rights. Delivers value by enabling section governance flexibility.

**Acceptance Scenarios**:

1. **Given** I own a section called "Introduction", **When** I click "Transfer Ownership" and select trainer "Jane Doe", **Then** Jane receives a transfer request notification
2. **Given** I received a section ownership transfer request, **When** I accept the request, **Then** the section appears in my section library with full edit/delete permissions
3. **Given** I received a section ownership transfer request, **When** I decline the request, **Then** the section remains with the original owner and no changes occur
4. **Given** I transferred a section to another trainer, **When** the transfer is accepted, **Then** I can no longer edit or delete that section, but existing links to my tutorials remain functional
5. **Given** a section has pending ownership transfer, **When** the section is linked to a new tutorial by the current owner, **Then** the link succeeds and does not cancel the pending transfer

---

### Edge Cases

- **Empty section linking**: What happens when a trainer links a section that has no posts yet? System should allow this - sections can be organizational placeholders that get filled with content later.

- **Circular section nesting**: What happens when someone tries to make Section A a parent of Section B, while Section B is already a parent of Section A? System must prevent circular relationships by validating the hierarchy before saving.

- **Section deletion with active links**: What happens when someone tries to delete a section that is currently linked to tutorials/blogs? System must show a confirmation dialog with impact preview displaying: (1) list of affected tutorials/blogs, (2) count of posts that will become orphaned in each piece of content, and (3) explicit warning that SectionLink records will be cascade deleted. Deletion proceeds only after trainer confirms understanding of impact.

- **Maximum sections per tutorial**: What happens when a tutorial has 50+ linked sections? System should allow this but may need pagination or collapse/expand functionality in the UI to maintain usability.

- **Slug conflicts**: What happens when creating a new section with a title that generates the same slug as an existing section? System should append a number or unique identifier to ensure slug uniqueness (e.g., "introduction-2").

- **Concurrent section modifications**: What happens when two trainers edit the same section simultaneously? System should detect conflicts and notify users, allowing them to review changes before saving.

- **Section visibility in different contexts**: What happens when a section's visibility is toggled while it's linked to multiple tutorials? System should respect the visibility flag - if set to hidden, section disappears from all tutorials using it.

- **Bulk section operations**: What happens when a trainer wants to link 10 sections at once? System should support multi-select in the "Add Existing Section" modal for efficiency.

- **Section search performance**: What happens when searching through 1000+ sections? System should return results quickly (under 2 seconds) and use pagination to display manageable result sets.

- **Orphaned posts after section unlink**: What happens to posts when their section is unlinked from a tutorial? Posts remain in the tutorial but become orphaned (unassigned to any section). System should display these in an "Unassigned Posts" view and allow trainers to reassign them to other sections or delete them.

- **Multiple orphaned posts accumulation**: What happens when a trainer repeatedly unlinks sections without cleaning up orphaned posts? System should maintain a visible count of unassigned posts and show a notification/warning when the count exceeds a threshold (e.g., 10+ unassigned posts).

- **Reassigning orphaned posts to relinked section**: What happens when a trainer unlinks a section creating orphaned posts, then re-links the same section later? System should NOT automatically reassign the orphaned posts to the re-linked section - trainer must manually reassign them if desired.

- **Orphaned posts in tutorial deletion**: What happens to orphaned posts when a tutorial is deleted? System should delete orphaned posts along with the tutorial since they belong to that specific tutorial and have no organizational home.

- **Trainer account deletion cascade**: What happens to sections created by a trainer when their account is deleted? System should cascade delete all sections created by that trainer. This will cause all posts within those sections across all tutorials/blogs to become orphaned and appear in each tutorial's "Unassigned Posts" view, requiring manual cleanup by other trainers.

- **Section ownership transfer validation**: What happens when a trainer tries to transfer section ownership to a non-existent or invalid trainer? System must validate the target trainerId exists and has trainer role before allowing transfer.

- **Section ownership transfer while linked**: What happens when a trainer transfers ownership of a section that is actively linked to multiple tutorials? System should allow this - ownership transfer does not break existing links. However, the new owner gains edit/delete permissions while the original owner loses them.

- **Duplicate section links to same content**: What happens when a trainer links the same section multiple times to the same tutorial? System should allow this - it's useful for repeating patterns (e.g., "Exercise" section appearing after each chapter). Each link gets a separate SectionLink record with different order values.

- **Section creation scaling**: What happens when a trainer creates 500+ sections? System should support unlimited creation but may need pagination, virtual scrolling, or search-first UI patterns to maintain picker performance.

- **Orphaned sections after trainer deletion**: What happens to sections created by a deleted trainer if they are NOT linked to any content? System should delete these along with all other sections owned by that trainer (part of cascade delete).

- **Pending ownership transfers on trainer deletion**: What happens to pending section ownership transfer requests when the source trainer is deleted? System should cancel all pending transfers and proceed with cascade deletion of the trainer's sections.

## Clarifications

### Session 2026-01-29

- Q: Admin permissions for cross-trainer section management - should admins be able to edit/delete sections created by other trainers and link them to different trainers' content? → A: A - Admins have full access - can edit/delete any trainer's sections and link them to other trainers' content
- Q: When a trainer account is deleted, what should happen to all sections created by that trainer? → A: A - Delete all sections created by that trainer (cascade deletion). Note: Posts in those sections will become orphaned across all tutorials using those sections.
- Q: When a trainer views the "Add Existing Section" picker UI, which sections should be shown? → A: A - Show only sections created by the current trainer (filtered view). Admins see all sections.
- Q: What should happen when a trainer attempts to delete a section that is linked to active tutorials/blogs? → A: B - Require confirmation with impact preview - System shows which tutorials/blogs will be affected and the count of posts that will become orphaned, then requires explicit confirmation to proceed with cascade deletion of SectionLink records
- Q: Section ownership and limits - Can trainers transfer section ownership? Are there limits on section creation? Can a section be linked to the same tutorial multiple times? → A: A - Trainers can transfer section ownership to another trainer + No limit on section creation + A section can be linked to the same tutorial/blog multiple times (useful for repeating patterns)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow trainers to link existing sections to tutorials or blogs through a dedicated interface within the content creation/editing form
- **FR-002**: System MUST allow trainers to create new reusable sections with a title, icon, and optional description while editing tutorial/blog content
- **FR-003**: System MUST maintain a many-to-many relationship between sections and content (tutorials/blogs), allowing one section to be linked to multiple pieces of content
- **FR-004**: System MUST display only the sections that are explicitly linked to a specific tutorial/blog in that content's sidebar, not all available sections
- **FR-005**: System MUST allow trainers to unlink sections from their tutorials/blogs without deleting the section from the global library
- **FR-006**: System MUST preserve posts within a section and associate them with both the specific tutorial/blog and the section
- **FR-007**: System MUST generate unique URL-friendly slugs for newly created sections, handling conflicts by appending identifiers as needed
- **FR-008**: System MUST allow trainers to search available sections by title when linking sections to content. Trainers see only sections they created; admins see all sections
- **FR-009**: System MUST filter available sections by content type (blog or tutorial) when displaying the section selection interface
- **FR-010**: System MUST display usage information for each section, showing which tutorials/blogs currently use it
- **FR-011**: System MUST allow trainers to reorder linked sections within their tutorial/blog to control presentation sequence
- **FR-012**: System MUST persist section order independently for each tutorial/blog, so reordering in one does not affect others
- **FR-013**: System MUST allow adding posts to sections only if that section is linked to the current tutorial/blog
- **FR-014**: System MUST support nested sections within the reusable section model, allowing hierarchical organization
- **FR-015**: System MUST prevent circular section relationships when setting parent-child hierarchies
- **FR-016**: System MUST show visual indicators in the UI when a section is reusable and used across multiple pieces of content
- **FR-017**: System MUST provide a confirmation dialog with impact preview before allowing section deletion when the section is linked to active tutorials/blogs, displaying affected content and orphaned post counts
- **FR-018**: System MUST cascade delete all SectionLink records when a section is deleted (after confirmation), causing posts in those sections to become orphaned across all linked tutorials/blogs
- **FR-019**: System MUST support bulk selection when linking multiple existing sections to a tutorial/blog
- **FR-020**: System MUST update section metadata (title, icon) globally across all linked content when the section is modified
- **FR-021**: System MUST allow filtering sections by visibility status when displaying the section library
- **FR-022**: System MUST retain posts in the tutorial when their section is unlinked, marking them as orphaned (unassigned to any section)
- **FR-022**: System MUST provide an "Unassigned Posts" view in the tutorial sidebar that displays all orphaned posts for that tutorial
- **FR-023**: System MUST allow trainers to reassign orphaned posts to any linked section within the same tutorial
- **FR-024**: System MUST allow trainers to delete orphaned posts from the "Unassigned Posts" view
- **FR-025**: System MUST display a count badge or indicator showing the number of unassigned posts in the tutorial sidebar
- **FR-026**: System MUST support bulk operations for reassigning or deleting multiple orphaned posts at once
- **FR-027**: System MUST NOT automatically reassign orphaned posts when a previously unlinked section is re-linked to the tutorial
- **FR-028**: System MUST allow admin users to edit, delete, and link any section regardless of which trainer created it
- **FR-029**: System MUST allow admin users to link sections created by any trainer to any trainer's tutorials or blogs
- **FR-030**: System MUST cascade delete all sections when the trainer who created them is deleted from the system
- **FR-031**: System MUST orphan all posts within deleted sections (due to trainer deletion) across all tutorials/blogs, making them appear in each tutorial's "Unassigned Posts" view
- **FR-032**: System MUST allow trainers to transfer ownership of their sections to another trainer through a dedicated transfer operation
- **FR-033**: System MUST allow the same section to be linked multiple times to the same tutorial/blog (no uniqueness constraint on sectionId+contentId), enabling repeating organizational patterns
- **FR-034**: System MUST impose no hard limit on the number of sections a trainer can create
- **FR-035**: System MUST require explicit permission from the receiving trainer before completing a section ownership transfer

### Key Entities

- **Section**: Represents a reusable organizational unit with a title, slug, icon, content type (blog/tutorial), visibility status, and optional parent relationship. Sections exist independently and can be linked to multiple tutorials/blogs. Contains metadata like depth (for nesting), order (for global library display), and creation timestamp.

- **SectionLink**: Represents the many-to-many relationship between a Section and content (Tutorial or Blog). Contains references to both the section and content, the content type, an order value (position within that specific content), and creation timestamp. This is the junction entity that enables section reusability.

- **Tutorial/Blog**: Content entities that contain posts organized into sections. Each tutorial/blog has multiple section links that define which sections appear in its sidebar and in what order.

- **Post**: Content items (tutorial posts or blog articles) that belong to both a specific tutorial/blog and a specific section within that content. Contains references to both the parent content and the section, plus ordering information within the section.

### Assumptions

- Trainers have editing permissions on the tutorials/blogs they are linking sections to
- Admin users have full permissions to manage all sections across all trainers, including editing, deleting, and cross-linking sections to any content
- Trainers can only edit/delete sections they created, and can only view and link their own sections when using the "Add Existing Section" picker. Admins see all sections in the picker
- Each section has a trainerId field indicating the creating trainer (owner)
- Trainers can transfer section ownership to another trainer with appropriate permissions
- No hard limit exists on section creation per trainer (system scales to accommodate growth)
- The same section can be linked multiple times to the same tutorial/blog (useful for repeating organizational patterns like "Exercise" sections)
- Section library starts empty or with a small set of predefined sections; grows organically as trainers create sections
- The same section can contain different posts in different tutorials (e.g., "Introduction" in React tutorial has different posts than "Introduction" in Vue tutorial)
- Section metadata changes (title, icon) are intentionally global and should reflect everywhere the section is used
- Default section visibility is "visible" when created
- Maximum reasonable section count per tutorial is ~50 before UI/UX concerns arise
- Sections are primarily organizational tools, not access control mechanisms
- Users will typically work with 5-15 sections per tutorial
- Section search should be case-insensitive and support partial matching

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Trainers can find and link an existing section to their tutorial in under 30 seconds (measured from clicking "Add Existing Section" to section appearing in tutorial)
- **SC-002**: Trainers can create a new reusable section and link it to their tutorial in under 60 seconds
- **SC-003**: System supports 100+ sections in the global library with search results returning in under 2 seconds
- **SC-004**: Trainers successfully reuse sections across an average of 2.5+ pieces of content within the first month of feature launch
- **SC-005**: 80% of trainers can complete the "link existing section" flow without requiring help documentation or support
- **SC-006**: Tutorial sidebar displays only linked sections (not all sections) with 100% accuracy
- **SC-007**: Section metadata updates (title/icon changes) propagate to all linked tutorials/blogs within 5 seconds
- **SC-008**: Zero data loss incidents when unlinking sections - unlinked sections remain in global library and accessible
- **SC-009**: System prevents 100% of circular section relationship attempts with clear error messaging
- **SC-010**: Trainers report 40% reduction in time spent organizing tutorial content compared to previous non-reusable approach (measured via user survey at 30-day mark)
- **SC-011**: Search functionality returns relevant results for 95%+ of search queries (measured by trainer clicking a search result vs. creating new section after search)
- **SC-012**: Section reordering within a tutorial persists correctly in 100% of cases without affecting other tutorials using the same sections
