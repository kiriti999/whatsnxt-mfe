# Feature Specification: Auto-Show Question Form in Page Editor

**Feature Branch**: `002-auto-show-question-form`  
**Created**: 2025-01-21  
**Status**: Draft  
**Input**: User description: "Auto-Show Question Form in Page Editor - automatically display question form when instructor lands on empty page editor to reduce clicks and save 3-5 seconds"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - First Question Creation on New Lab (Priority: P1)

An instructor creates a new lab through the streamlined lab creation flow (001-streamline-lab-creation) and is automatically redirected to the page editor. Instead of seeing an empty state requiring a button click to add a question, the question form is immediately displayed, allowing them to start filling in question details without interruption.

**Why this priority**: This is the primary use case and delivers the core value of the feature - reducing friction in the most common workflow where instructors create labs and immediately add their first question. This represents the "happy path" that 80%+ of users will experience.

**Independent Test**: Can be fully tested by creating a new lab, being redirected to the page editor, and verifying the question form appears automatically without any button clicks. Delivers immediate time savings of 3-5 seconds per lab creation.

**Acceptance Scenarios**:

1. **Given** a new lab has just been created with no questions, **When** the instructor is redirected to the page editor for the first page, **Then** the question form is automatically displayed in open/edit mode
2. **Given** the question form is auto-displayed, **When** the instructor fills in question details and saves, **Then** the question is created successfully and the form closes
3. **Given** the question form is auto-displayed, **When** the instructor cancels the form, **Then** the form closes and shows the standard empty state with "Add Question" button
4. **Given** the auto-displayed form has validation errors, **When** the instructor attempts to save, **Then** validation errors are displayed and prevent submission until corrected

---

### User Story 2 - Editing Existing Pages with Questions (Priority: P1)

An instructor navigates to a page editor for an existing page that already has one or more questions. The page displays the existing questions in their normal view (not in edit mode), allowing the instructor to review, edit, or add additional questions as needed.

**Why this priority**: This is equally critical to prevent breaking existing workflows. Instructors frequently return to edit existing pages, and auto-showing the form would disrupt their ability to review existing content. This ensures backward compatibility.

**Independent Test**: Can be fully tested by navigating to any existing page with questions and verifying that the page displays normally without auto-opening any forms. All existing functionality (view, edit, delete questions) remains intact.

**Acceptance Scenarios**:

1. **Given** a page has one or more existing questions, **When** the instructor navigates to the page editor, **Then** the page displays all questions in read/view mode (not edit mode)
2. **Given** a page with existing questions is displayed, **When** the instructor clicks "Add Question", **Then** the question form opens as it did before this feature
3. **Given** a page with existing questions is displayed, **When** the instructor clicks to edit an existing question, **Then** that specific question opens in edit mode

---

### User Story 3 - Empty Page Navigation (Priority: P2)

An instructor navigates directly to an empty page (not through the lab creation redirect) - for example, by adding a new page to an existing lab or using browser navigation to visit a page URL. The question form appears automatically, providing the same streamlined experience.

**Why this priority**: This extends the convenience to additional entry points beyond the primary lab creation flow. While less common than the P1 scenarios, it ensures consistency across all ways of reaching an empty page.

**Independent Test**: Can be fully tested by creating a new page in an existing lab (if that feature exists) or manually navigating to an empty page URL, and verifying the question form auto-displays.

**Acceptance Scenarios**:

1. **Given** an instructor adds a new page to an existing lab, **When** they navigate to that empty page, **Then** the question form is automatically displayed
2. **Given** an instructor uses browser back/forward to navigate to an empty page they've seen before, **When** the page loads, **Then** the question form is automatically displayed
3. **Given** an empty page is displayed with the auto-opened form, **When** the instructor saves a question, **Then** the behavior is identical to the lab creation flow scenario

---

### Edge Cases

- What happens when the page is in a loading state? (Form should not auto-display until data is fully loaded to avoid premature rendering)
- How does the system handle concurrent edits if multiple instructors access the same empty page simultaneously? (Standard conflict resolution applies - first save wins)
- What happens if the page editor component unmounts/remounts while the auto-displayed form is open? (Form state should be preserved through React state management or cleared appropriately)
- What happens if browser autofill populates form fields before the instructor interacts? (Standard form behavior - autofill works normally)
- What happens when the instructor refreshes the page while the auto-displayed form has unsaved data? (Standard browser behavior - unsaved changes are lost, unless already implementing unsaved changes warning)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST automatically display the question form when an instructor lands on a page editor for a page with zero existing questions
- **FR-002**: System MUST NOT automatically display the question form when the page already contains one or more questions
- **FR-003**: System MUST preserve all existing form validation rules when the question form is auto-displayed
- **FR-004**: System MUST allow instructors to cancel the auto-displayed form, returning to the standard empty state with "Add Question" button
- **FR-005**: System MUST apply auto-display behavior consistently regardless of navigation method (redirect from lab creation, direct URL navigation, browser back/forward)
- **FR-006**: System MUST wait for page data to fully load before determining whether to auto-display the form (to avoid false positives during loading states)
- **FR-007**: System MUST maintain all existing question form functionality (save, cancel, validation, error handling) when auto-displayed
- **FR-008**: System MUST preserve existing page editor functionality for pages with questions (view, edit, delete, add additional questions)

### Key Entities _(include if feature involves data)_

- **Page**: Represents a single page within a lab, which may contain zero or more questions. Key attributes include page ID, lab ID, and question count/collection.
- **Question**: Represents a single question within a page. The feature focuses on the creation of the first question, but does not modify the question entity itself.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Instructors can start filling in their first question within 1 second of landing on the page editor (down from 4-6 seconds previously)
- **SC-002**: The number of clicks required to create the first question in a new lab is reduced by 1 click (from 3 clicks to 2 clicks: create lab → fill form instead of create lab → click "Add Question" → fill form)
- **SC-003**: 95% of existing page editor interactions with pages containing questions remain unchanged (no regressions)
- **SC-004**: Time from lab creation to first question saved is reduced by 3-5 seconds on average
- **SC-005**: Zero increase in form submission errors or cancellations compared to current baseline (indicates the auto-display doesn't cause confusion or mistakes)

## Assumptions _(optional)_

- The page editor component in `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` already has logic to distinguish between empty pages (no questions) and pages with existing questions
- The "Add Question" button click currently triggers the display of the question form component, and this component can be programmatically shown without the button click
- The 001-streamline-lab-creation feature is already deployed and functioning, providing the redirect flow that serves as the primary entry point for this feature
- Instructors prefer fewer clicks and faster workflows when creating labs (validated assumption from 001-streamline-lab-creation)
- The question form component maintains its own state and validation logic, which will continue to work when displayed automatically
- Form accessibility features (focus management, keyboard navigation) will continue to work with auto-display

## Dependencies _(optional)_

- **001-streamline-lab-creation**: This feature builds directly on the redirect flow established in the previous enhancement. While the auto-display feature can work independently, it delivers maximum value when combined with the streamlined redirect.
- **Page data loading mechanism**: The feature depends on the existing mechanism that loads page data (including question count) to determine whether the page is empty.
- **Question form component**: The feature depends on the existing question form component being able to be displayed programmatically (not only via button click).

## Out of Scope _(optional)_

- Auto-saving form data as the instructor types (would require additional state management and backend changes)
- Pre-populating the question form with suggested content or templates (could be a future enhancement)
- Modifying the question form UI or validation logic (this feature only changes when/how the form appears, not the form itself)
- Adding keyboard shortcuts to open/close the form (could be a future accessibility enhancement)
- Analytics or tracking of time saved per instructor (valuable but not required for core functionality)
- A/B testing infrastructure to measure adoption or user preference (assumes the streamlined flow is universally preferred based on 001-streamline-lab-creation learnings)
- Multi-question bulk creation (adding multiple questions at once)
- Changes to the "Add Question" button behavior for pages with existing questions

## Related Features _(optional)_

- **001-streamline-lab-creation**: Provides the redirect flow that serves as the primary entry point for this feature. The auto-show question form is the logical next step in reducing friction in the lab creation workflow.

## Notes _(optional)_

### Technical Context
- **Component**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` (Next.js 16 page component)
- **Tech Stack**: Next.js 16, React 19, TypeScript, Mantine UI
- **Pattern**: Conditional rendering based on page state (question count)

### Implementation Guidance
The implementation should follow React best practices for conditional rendering and state management. Key considerations:

1. **State Detection**: Use the existing page data (likely from a React Query hook or similar) to determine if the page has zero questions
2. **Form Display Logic**: Add a condition that renders the question form in "open" state when the page is empty on initial load
3. **Focus Management**: Ensure the first form field receives focus automatically for accessibility
4. **Cancel Behavior**: Ensure canceling the auto-displayed form returns to the standard empty state (with "Add Question" button visible)

### Design Consistency
The auto-displayed form should look and behave identically to the form that appears after clicking "Add Question". No visual or functional differences should exist - the only change is eliminating the button click step for empty pages.

### User Experience Philosophy
This feature continues the design philosophy established in 001-streamline-lab-creation: reduce friction and clicks in instructor workflows by making intelligent assumptions about user intent. When an instructor lands on an empty page, the most likely next action is to add a question, so we optimize for that path while preserving the ability to cancel or navigate away.
