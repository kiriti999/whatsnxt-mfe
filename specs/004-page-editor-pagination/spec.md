# Feature Specification: Show Pagination in Page Editor

**Feature Branch**: `004-page-editor-pagination`  
**Created**: 2025-01-17  
**Status**: Draft  
**Input**: User description: "Show Pagination in Page Editor"

## Overview

This feature adds pagination controls to the lab page editor, enabling instructors to see their current page position and navigate between multiple pages without leaving the editor. This directly builds on feature 003-auto-page-creation, which automatically creates new pages after 3 questions are saved, creating the need for visible pagination in the editor interface.

### Background Context

**Previous Features:**
- **001-streamline-lab-creation**: Auto-redirect to page editor after lab creation
- **002-auto-show-question-form**: Auto-show question form on empty pages  
- **003-auto-page-creation**: Auto-create new page after saving 3 questions ✅ IMPLEMENTED

**Current Pain Point:**
After feature 003 creates a second page and redirects the instructor to it, there is no visible indication of:
- Which page they are currently viewing (page 1 vs page 2)
- How many total pages exist in the lab
- How to navigate back to previous pages to review or edit questions

Instructors must navigate back to the lab detail page to see the page list and switch between pages, breaking their workflow.

### Problem Statement

When an instructor is editing a lab with multiple pages, they lack contextual awareness and navigation capabilities within the page editor itself. This creates confusion ("Which page am I on?") and forces unnecessary navigation to the lab detail page just to switch between pages.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - See Current Page Position (Priority: P1)

As an instructor editing a multi-page lab, I need to see which page I'm currently on and how many total pages exist, so I understand my position in the lab and can make informed decisions about where to add content.

**Why this priority**: This is the foundational capability that addresses the core confusion problem. Without knowing "Page X of Y", instructors are disoriented after auto-page-creation. This delivers immediate value by providing context awareness.

**Independent Test**: Can be fully tested by creating a lab with 2 pages, navigating to page 2, and verifying that a clear page indicator (e.g., "Page 2 of 2") is displayed prominently at the top of the editor. Delivers value by eliminating confusion about current position.

**Acceptance Scenarios**:

1. **Given** I am editing a lab with only 1 page, **When** I view the page editor, **Then** no pagination indicator is shown (since pagination is not needed for a single page)

2. **Given** I am editing a lab with 2 pages and currently on page 1, **When** I view the page editor, **Then** I see "Page 1 of 2" displayed clearly at the top

3. **Given** I am editing a lab with 2 pages and currently on page 2, **When** I view the page editor, **Then** I see "Page 2 of 2" displayed clearly at the top

4. **Given** I just saved my 3rd question and was auto-redirected to page 2, **When** the page editor loads, **Then** the pagination indicator updates to show "Page 2 of 2" within 1 second

5. **Given** I am viewing a lab with 5 pages while on page 3, **When** I view the page editor, **Then** I see "Page 3 of 5" displayed

---

### User Story 2 - Navigate Between Pages Quickly (Priority: P1)

As an instructor editing a multi-page lab, I need to click on page numbers to instantly navigate between pages, so I can review, edit, or add questions on any page without leaving the editor workflow.

**Why this priority**: This is the primary action capability that solves the workflow disruption problem. Instructors currently must go back to lab detail page to switch pages. Direct navigation from the editor saves time and maintains focus.

**Independent Test**: Can be fully tested by creating a lab with 3 pages, navigating to page 1, clicking page number "3" in the pagination controls, and verifying instant navigation to page 3 (under 500ms). Delivers value by enabling efficient page switching.

**Acceptance Scenarios**:

1. **Given** I am on page 1 of a 3-page lab, **When** I click page number "2" in the pagination controls, **Then** I am navigated to page 2 within 500ms

2. **Given** I am on page 2 of a 3-page lab, **When** I click page number "1", **Then** I am navigated back to page 1 and see the questions from page 1

3. **Given** I am on page 1 of a 3-page lab, **When** I click page number "3", **Then** I am navigated directly to page 3 (skipping page 2)

4. **Given** I am viewing the pagination controls, **When** I view the current page number, **Then** it is visually highlighted to distinguish it from other page numbers

5. **Given** I am on page 2 of a 5-page lab, **When** I click "Next" button, **Then** I am navigated to page 3

6. **Given** I am on page 3 of a 5-page lab, **When** I click "Previous" button, **Then** I am navigated to page 2

7. **Given** I am navigating to another page, **When** the navigation is in progress, **Then** I see a loading indicator to confirm the action is processing

---

### User Story 3 - Automatic Pagination Updates (Priority: P2)

As an instructor adding questions to my lab, I need the pagination controls to update automatically when a new page is created, so I always see accurate page counts without manual refreshing.

**Why this priority**: This ensures data consistency and prevents confusion after auto-page-creation. While important, it's secondary to P1 stories since it enhances an existing flow rather than enabling a core capability.

**Independent Test**: Can be fully tested by creating a lab with 1 page containing 2 questions, adding a 3rd question to trigger auto-page-creation, and verifying that after redirect to page 2, the pagination immediately shows "Page 2 of 2". Delivers value by maintaining accurate context after system-initiated actions.

**Acceptance Scenarios**:

1. **Given** I am on page 1 with 2 questions (no pagination visible), **When** I save a 3rd question triggering auto-page-creation and redirect to page 2, **Then** pagination appears showing "Page 2 of 2"

2. **Given** I am on page 2 of a 2-page lab with 2 questions, **When** I save a 3rd question triggering creation of page 3 and redirect to page 3, **Then** pagination updates to show "Page 3 of 3"

3. **Given** pagination is showing "Page 1 of 2", **When** I navigate to page 2 and back to page 1, **Then** pagination remains accurate showing "Page 1 of 2"

4. **Given** I am viewing pagination during an auto-page-creation event, **When** the new page is being created, **Then** pagination maintains state without flickering or showing incorrect counts

---

### User Story 4 - Navigation Control States (Priority: P2)

As an instructor using pagination controls, I need Previous/Next buttons to be disabled appropriately at boundaries, so I have clear feedback about available navigation options and don't encounter errors clicking disabled actions.

**Why this priority**: This is a usability enhancement that prevents user errors and provides clear UI feedback. Important for polish, but not required for basic pagination functionality.

**Independent Test**: Can be fully tested by creating a lab with 3 pages, navigating to page 1, verifying "Previous" is disabled, navigating to page 3, and verifying "Next" is disabled. Delivers value by preventing confusing error states.

**Acceptance Scenarios**:

1. **Given** I am on page 1 of a multi-page lab, **When** I view the pagination controls, **Then** the "Previous" button is disabled (not clickable)

2. **Given** I am on the last page of a multi-page lab, **When** I view the pagination controls, **Then** the "Next" button is disabled

3. **Given** I am on page 2 of a 3-page lab (middle page), **When** I view the pagination controls, **Then** both "Previous" and "Next" buttons are enabled

4. **Given** I am on page 1 with "Previous" disabled, **When** I click the disabled "Previous" button, **Then** no navigation occurs and no error is shown

---

### User Story 5 - Mobile-Responsive Pagination (Priority: P3)

As an instructor using a mobile device or tablet, I need pagination controls that adapt to smaller screens, so I can navigate between pages comfortably without layout issues or requiring horizontal scrolling.

**Why this priority**: Important for mobile users but lower priority since the primary workflow is desktop-based for lab creation. Most instructors create labs on desktop, though reviewing on mobile should work.

**Independent Test**: Can be fully tested by opening a multi-page lab editor on a mobile device (or using browser responsive mode), verifying pagination controls are touch-friendly (minimum 44px tap targets), and confirming no horizontal scroll or layout breaking. Delivers value by ensuring feature works across all devices.

**Acceptance Scenarios**:

1. **Given** I am viewing the page editor on a mobile device (screen width < 768px), **When** the pagination controls render, **Then** they stack vertically or scale appropriately without breaking the layout

2. **Given** I am viewing pagination on a mobile device, **When** I tap any page number or button, **Then** the tap target is at least 44x44 pixels (touch-friendly)

3. **Given** I am on a tablet device (768-1024px width), **When** I view pagination controls, **Then** they remain on a single line with appropriate spacing

4. **Given** I am viewing pagination on any screen size, **When** the page indicator "Page X of Y" is displayed, **Then** the text is legible and not truncated

---

### User Story 6 - Keyboard Navigation Support (Priority: P3)

As an instructor who prefers keyboard navigation, I need to use Tab, Enter, and Arrow keys to navigate pagination controls, so I can work efficiently without using a mouse and meet accessibility standards.

**Why this priority**: Accessibility is important for inclusive design and may be required for compliance. However, since most users will use mouse/touch initially, this is lower priority than core mouse-based navigation.

**Independent Test**: Can be fully tested by opening pagination controls, pressing Tab to focus on a page number, pressing Enter to navigate, and verifying keyboard focus indicators are visible throughout. Delivers value by ensuring accessibility compliance.

**Acceptance Scenarios**:

1. **Given** pagination controls are visible, **When** I press Tab key repeatedly, **Then** focus moves through each interactive element (page numbers, Previous, Next) with visible focus indicators

2. **Given** a page number has keyboard focus, **When** I press Enter, **Then** I am navigated to that page

3. **Given** pagination controls are focused, **When** I press Arrow keys (left/right), **Then** focus moves between pagination elements

4. **Given** I am using keyboard navigation, **When** I reach a disabled button (Previous on page 1), **Then** focus skips over the disabled button or indicates it's not actionable

---

### Edge Cases

- **Rapid page navigation**: What happens if an instructor clicks multiple page numbers rapidly in succession? System should queue navigation or cancel pending navigations, showing only the most recent request. Navigation should complete without errors or showing stale page data.

- **Page data fetch failure**: What happens if navigating to a page fails due to network error or deleted page? System should show an error message "Unable to load page. Please try again." and remain on the current page with pagination still functional.

- **Single page scenario**: What happens when there's only 1 page? Pagination controls should be hidden entirely (no "Page 1 of 1" display) to avoid UI clutter.

- **Auto-page-creation during navigation**: What happens if an instructor is navigating between pages while another auto-page-creation event is triggered in the background? System should complete the current navigation first, then refresh pagination state to reflect the new page count.

- **Unsaved form data**: What happens if an instructor has typed content in the question form but hasn't saved, then clicks a different page number? **Decision**: Navigation proceeds without warning (standard web form behavior). This matches existing patterns in the application, keeps navigation fast and frictionless, and is the simplest implementation. Users learn quickly that unsaved content is lost when navigating away, which is consistent with standard web UX expectations.

- **Pagination with large page counts**: What happens when a lab has more than 10 pages? Pagination should show ellipsis (...) with max 5 visible page numbers (e.g., "1 ... 8 9 10 ... 15" when on page 9), allowing navigation to any page without overwhelming the UI.

- **Browser back/forward navigation**: What happens if an instructor uses browser back/forward buttons after navigating between pages? Browser navigation should work naturally, updating pagination state to match the current page in the URL.

- **Concurrent editing**: What happens if two instructors are editing the same lab and one adds a 3rd question creating a new page? The second instructor's pagination should update on their next action (refresh, save, navigate) to reflect the new page count.

- **Page deletion**: What happens if an instructor navigates to page 3, but page 3 is deleted (via lab detail page or API)? System should redirect to the nearest valid page (page 2 or last available page) and show a notification "Page no longer exists, redirected to Page X".

- **Loading state timing**: What happens during the brief moment after auto-page-creation redirect but before pagination data loads? Show a subtle loading skeleton for pagination area to prevent layout shift, with pagination appearing within 1 second.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a page position indicator in the format "Page X of Y" at the top of the page editor when total pages > 1

- **FR-002**: System MUST show pagination controls (page numbers, Previous button, Next button) when total pages > 1

- **FR-003**: System MUST hide all pagination elements (indicator and controls) when the lab has only 1 page

- **FR-004**: System MUST navigate to the selected page within 500ms when an instructor clicks a page number

- **FR-005**: System MUST highlight the current page number in pagination controls to distinguish it from other pages

- **FR-006**: System MUST disable the "Previous" button when viewing page 1

- **FR-007**: System MUST disable the "Next" button when viewing the last page

- **FR-008**: System MUST enable both "Previous" and "Next" buttons when viewing any middle page (not first or last)

- **FR-009**: System MUST update pagination state within 1 second after auto-page-creation redirect occurs

- **FR-010**: System MUST display pagination controls above the question form area (top of editor interface)

- **FR-011**: System MUST show a loading indicator during page navigation transitions

- **FR-012**: System MUST maintain pagination visibility while scrolling on the page (fixed or sticky positioning)

- **FR-013**: System MUST display up to 5 page numbers at once, using ellipsis (...) for labs with more than 7 pages

- **FR-014**: System MUST support keyboard navigation through pagination controls using Tab and Enter keys

- **FR-015**: System MUST show visible focus indicators on pagination controls when navigating via keyboard

- **FR-016**: System MUST handle rapid successive page navigation clicks by canceling pending navigations and executing only the most recent request

- **FR-017**: System MUST display an error message and remain on current page if navigation fails due to network error

- **FR-018**: System MUST update browser URL to reflect current page number during navigation

- **FR-019**: System MUST support browser back/forward buttons for page navigation with correct pagination state updates

- **FR-020**: System MUST adapt pagination layout for mobile screens (< 768px width) without horizontal scrolling or breaking layout

- **FR-021**: System MUST provide touch-friendly tap targets (minimum 44x44 pixels) on mobile devices

- **FR-022**: System MUST reflect pagination state changes from concurrent edits on next user action (refresh, save, navigate)

### Key Entities

This feature primarily enhances UI/navigation and doesn't introduce new data entities. It works with existing entities:

- **Lab**: The parent container with an ID; pagination operates within the context of a specific lab
- **Page**: Individual pages within a lab, identified by page ID and sequential page number; pagination displays these pages and enables navigation between them
- **Question**: Content within pages; while not directly manipulated by pagination, questions are the reason multiple pages exist (3 questions per page triggers auto-creation)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Instructors can identify their current page position within 1 second of viewing the editor (via "Page X of Y" indicator)

- **SC-002**: Instructors can navigate to any page from the editor in under 500ms (measured from click to page content rendering)

- **SC-003**: Pagination appears within 1 second after auto-page-creation redirect completes

- **SC-004**: Current page number is visually distinguishable from other page numbers in 100% of cases

- **SC-005**: Pagination is completely hidden when viewing single-page labs (no unnecessary UI clutter)

- **SC-006**: 100% of page navigation requests complete successfully or show clear error messaging

- **SC-007**: Keyboard navigation allows reaching every pagination control with Tab and activating with Enter

- **SC-008**: Mobile/tablet users can navigate between pages without layout breaking or requiring horizontal scroll (tested on screens 320px-1024px width)

- **SC-009**: Touch targets on mobile devices are at least 44x44 pixels, meeting accessibility guidelines

- **SC-010**: 95% of instructors successfully navigate between pages on their first attempt without confusion (based on user testing)

- **SC-011**: Pagination state remains accurate after auto-page-creation events in 100% of cases (no stale data)

- **SC-012**: Browser back/forward buttons work correctly with pagination in 100% of navigation scenarios

## Assumptions

1. **Component location**: Pagination UI will be added to the existing page editor component at `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

2. **Lab scale**: Labs typically have 2-20 pages; extreme cases (> 50 pages) are rare, so pagination optimization focuses on this range

3. **Page numbering**: Pages are numbered sequentially starting from 1, with no gaps (deleting page 2 renumbers page 3 → page 2)

4. **Navigation context**: Instructors primarily navigate between pages to review questions, not to reorder pages (reordering is done on lab detail page)

5. **Device usage**: Desktop is the primary device for lab creation (80%+ of usage), but mobile/tablet support is required for reviewing and light editing

6. **Network reliability**: Internet connection is generally stable during editing sessions; brief disconnections are handled with error messages and retry capability

7. **Concurrent editing**: Multiple instructors editing the same lab simultaneously is rare; if it occurs, the most recent action takes precedence, and pagination updates on next user action

8. **UI framework**: Project uses Mantine UI v8 components; pagination implementation will use `@mantine/core` Pagination component for consistency

9. **Browser support**: Modern browsers with JavaScript enabled (React 19 requirements); no support needed for IE11 or older browsers

10. **Permission model**: All instructors with access to edit a lab can view and navigate all pages; no page-level permissions exist

11. **Draft state**: Unsaved question form content is assumed to be ephemeral; navigating away from a page without saving may result in content loss (this assumption may be revisited based on clarification response)

## Dependencies

### External Dependencies

- **Feature 003-auto-page-creation**: Provides the multi-page lab context that necessitates pagination; pagination is only visible when this feature has created 2+ pages

- **Mantine UI Pagination component** (`@mantine/core`): Core UI component used for rendering pagination controls with consistent styling

- **Next.js App Router**: Provides routing primitives (`useRouter`, `useParams`) for programmatic page navigation and URL updates

- **Existing Lab API endpoints**: Relies on current API structure for fetching page data and page counts; no new endpoints required (assumption: current API returns total page count with page data)

### Internal Dependencies

- **Page Editor Component**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` must be modified to include pagination UI

- **Lab data fetching logic**: Current data fetching mechanism must provide total page count for pagination display

- **Question form component**: Should coexist with pagination without layout conflicts; pagination should not obscure question form

## Out of Scope

The following capabilities are explicitly NOT included in this feature to maintain focused scope:

- **Pagination on lab detail page**: Lab detail page already has its own page list UI; this feature only adds pagination to the page editor itself

- **Jump to specific page via input box**: Direct page number input (e.g., "Go to page: [__]") is not included; navigation is via clicking page numbers only

- **Drag-and-drop page reordering**: Changing page sequence remains on lab detail page; pagination only provides navigation, not reordering

- **Bulk page operations**: Deleting multiple pages, duplicating pages, or other multi-page actions are not part of this feature

- **Page thumbnails or previews**: Pagination shows page numbers only, not miniature previews of page content

- **Infinite scroll or virtualization**: Standard pagination UI is sufficient for expected lab sizes (2-20 pages); virtualization is unnecessary

- **Page-level analytics**: Tracking time spent on each page or navigation patterns is not included

- **Collaborative cursors**: Showing which page other instructors are viewing in real-time is out of scope

- **Undo/redo across pages**: Navigation history beyond browser back/forward is not included

- **Auto-save of question form**: Whether to save draft question content before navigation is addressed via clarification; if auto-save is needed, it will be minimal scope (basic draft state), not a full auto-save system

- **Custom page naming**: Pages are identified by number only ("Page 1", "Page 2"); custom names like "Introduction Page" are not supported
