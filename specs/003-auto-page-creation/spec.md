# Feature Specification: Auto-Create Page After 3 Questions

**Feature Branch**: `003-auto-page-creation`  
**Created**: 2025-01-17  
**Status**: Draft  
**Input**: User description: "Create a feature specification for automatically creating new pages after 3 questions"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Seamless Multi-Page Lab Creation (Priority: P1)

An instructor is creating a new lab and wants to add 12 questions organized across multiple pages (3 questions per page). Currently, after adding 3 questions to page 1, they must navigate back to the lab detail page, click "Add New Page", and navigate to the new page before continuing. This interrupts their workflow and adds 15-20 seconds of overhead per page.

With this feature, after saving the 3rd question on any page, the system automatically creates the next page and redirects the instructor to it, allowing them to continue adding questions without interruption. The question form auto-shows on the new page (existing behavior from feature 002), maintaining flow.

**Why this priority**: This is the core value proposition and directly addresses the main pain point. It delivers immediate time savings and workflow improvement for the most common use case (instructors creating new labs with multiple questions).

**Independent Test**: Can be fully tested by creating a lab, adding 3 questions to page 1, and verifying that page 2 is automatically created and the instructor is redirected to it. Delivers value by eliminating 3 manual steps (navigate back, click add page, navigate to new page).

**Acceptance Scenarios**:

1. **Given** instructor is on page editor with 2 questions already saved, **When** they save the 3rd question, **Then** system automatically creates page 2, redirects to page 2, shows success notification "Page 2 created. Continue adding questions...", and displays the question form
2. **Given** instructor is on page 2 with 3 questions, **When** they save a 4th question on the same page, **Then** no new page is created and the 4th question is saved normally
3. **Given** instructor is on page 3 with 2 questions, **When** they save the 3rd question, **Then** page 4 is created automatically and they are redirected to page 4
4. **Given** instructor manually navigates to lab detail and clicks "Add New Page", **When** they navigate to the new page, **Then** they can add questions normally (manual flow still works)

---

### User Story 2 - Graceful Failure Handling (Priority: P2)

An instructor is adding questions to a page and saves the 3rd question. The automatic page creation request fails due to a network issue or server error. The instructor should see a clear error message explaining what happened and be provided with a manual fallback option.

**Why this priority**: While less common than the happy path, failure scenarios must be handled gracefully to prevent data loss and user confusion. Without proper error handling, instructors might be blocked from continuing their work or lose the question they just saved.

**Independent Test**: Can be tested independently by simulating a page creation failure (mock server error) and verifying that the instructor sees an error message, the 3rd question is still saved, and they can manually navigate to add a new page.

**Acceptance Scenarios**:

1. **Given** instructor saves the 3rd question on a page, **When** automatic page creation fails, **Then** the 3rd question is still saved, an error notification appears: "Couldn't create next page automatically. Click 'Add New Page' to continue.", and the instructor remains on the current page
2. **Given** page creation fails, **When** instructor manually navigates to lab detail and clicks "Add New Page", **Then** the new page is created successfully and they can continue adding questions
3. **Given** page creation request times out, **When** the timeout occurs, **Then** the system treats it as a failure and shows the error notification without attempting to redirect

---

### User Story 3 - Edit Mode Safety (Priority: P2)

An instructor is reviewing an existing page with 3 questions and decides to edit question 2 to fix a typo. When they save the edited question, the system should recognize this is an edit (not a new question) and should not trigger automatic page creation.

**Why this priority**: Prevents unwanted page creation when instructors are maintaining existing content. Without this safeguard, editing questions on pages with exactly 3 questions would incorrectly trigger page creation, leading to empty pages and workflow confusion.

**Independent Test**: Can be tested by creating a page with 3 questions, editing one of them, and verifying that no new page is created upon saving the edit.

**Acceptance Scenarios**:

1. **Given** instructor is on a page with exactly 3 saved questions, **When** they edit question 2 and save it, **Then** no new page is created and the page still has 3 questions
2. **Given** instructor is on a page with 2 questions, **When** they edit question 1 and save it, **Then** the page still has 2 questions and no auto-creation is triggered
3. **Given** instructor is on a page with 3 questions, **When** they delete question 3 and then add a new question (making it the 3rd again), **Then** auto-page-creation triggers because it's a new 3rd question, not an edit

---

### User Story 4 - Question Type Consistency (Priority: P3)

An instructor is creating a lab with various question types (multiple choice, diagram tests, code questions). The system should count all question types equally toward the 3-question threshold for auto-page creation. A page with 2 multiple choice questions and 1 diagram test should trigger auto-creation the same way as a page with 3 multiple choice questions.

**Why this priority**: Ensures consistent behavior across all question types. While important for feature completeness, the majority of labs use standard question types, making this lower priority than core functionality and error handling.

**Independent Test**: Can be tested by creating a page with 2 multiple choice questions and 1 diagram test, verifying that page auto-creation triggers after the 3rd question regardless of type.

**Acceptance Scenarios**:

1. **Given** instructor has saved 2 multiple choice questions, **When** they save a diagram test as the 3rd question, **Then** auto-page-creation triggers and creates the next page
2. **Given** instructor has saved 1 code question and 1 diagram test, **When** they save a multiple choice question as the 3rd, **Then** auto-page-creation triggers
3. **Given** instructor has saved 3 questions of any mix of types, **When** they are redirected to the new page, **Then** they can add any question type on the new page

---

### Edge Cases

- **What happens when page creation fails?**: The 3rd question is still saved, an error notification appears: "Couldn't create next page automatically. Click 'Add New Page' to continue.", and the instructor remains on the current page with the option to manually add a new page from lab detail.

- **What if instructor is editing an existing question (not creating 3rd)?**: The system detects this is an edit operation (question already has an ID) and does not trigger auto-page-creation, even if the page has exactly 3 questions.

- **What if instructor deletes a question after auto-page-creation?**: The newly created page remains (pages are not automatically deleted). If the instructor deletes a question from the original page (reducing it to 2 questions), they can add another question to that page without triggering another auto-creation unless they reach 3 questions again.

- **What if multiple questions are saved rapidly?**: The system checks the current question count before saving. Only the save operation that brings the total to exactly 3 new questions on a page triggers auto-creation. Subsequent rapid saves on the same page do not trigger additional page creation.

- **What about diagram tests - do they count toward the 3 limit?**: Yes, all question types (multiple choice, short answer, code questions, diagram tests) count equally toward the 3-question threshold.

- **What if the instructor navigates away before auto-redirect completes?**: The page is still created, but the redirect is cancelled by the navigation. The instructor can access the new page by navigating to it manually.

- **What if the instructor is on a manually created page with 0 questions?**: The auto-creation logic only triggers when saving the 3rd question on the current page. Empty pages created manually don't affect the count.

- **What if the backend returns a duplicate page number?**: This indicates a race condition or data inconsistency. The system should display an error and not redirect, allowing the instructor to manually resolve by refreshing the lab detail page.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST detect when an instructor saves the 3rd question on the current page (counting only new questions, not edits)
- **FR-002**: System MUST automatically create a new page with the next sequential page number immediately after the 3rd question is saved
- **FR-003**: System MUST automatically redirect the instructor to the newly created page within 2 seconds of page creation
- **FR-004**: System MUST display a brief success notification: "Page {N} created. Continue adding questions..." upon successful auto-creation and redirect
- **FR-005**: System MUST preserve the existing question-saving workflow - all existing functionality (validation, error handling, form clearing) must continue to work
- **FR-006**: System MUST distinguish between new question creation and editing existing questions - only new questions count toward the 3-question threshold
- **FR-007**: System MUST count all question types (multiple choice, short answer, code questions, diagram tests) equally toward the 3-question threshold
- **FR-008**: System MUST handle page creation failures gracefully by displaying error notification: "Couldn't create next page automatically. Click 'Add New Page' to continue." and keeping the instructor on the current page
- **FR-009**: System MUST preserve the manual "Add New Page" button functionality on lab detail page - instructors can still create pages manually at any time
- **FR-010**: System MUST NOT trigger auto-page-creation if the instructor is editing an existing question (question has an ID)
- **FR-011**: System MUST NOT trigger auto-page-creation on pages with more than 3 questions (instructor can add as many questions as desired to a page)
- **FR-012**: System MUST persist the 3rd question to the database before attempting page creation to prevent data loss if page creation fails

### Key Entities

- **Question**: Represents a question on a page. Has a unique ID (when saved), question text, type (multiple choice, diagram test, etc.), and belongs to exactly one page.
- **Page**: Represents a page within a lab. Has a page number (sequential within the lab), belongs to exactly one lab, and contains zero or more questions.
- **Lab**: Represents a lab that can contain multiple pages. Has a unique ID and is created by an instructor.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Instructors can transition from completing 3 questions on one page to adding the first question on the next page in under 2 seconds (down from 15-20 seconds with manual navigation)
- **SC-002**: 95% of page auto-creation attempts succeed on the first try (tracked via successful page creation + redirect completion)
- **SC-003**: Zero unintentional page creations occur during question editing workflows (instructor editing existing questions never triggers auto-creation)
- **SC-004**: Zero data loss occurs during auto-page-creation - all 3rd questions are saved successfully even if page creation fails
- **SC-005**: Instructors can still manually create pages from lab detail 100% of the time (manual workflow remains fully functional)
- **SC-006**: The time to create a 12-question lab (4 pages × 3 questions) is reduced by approximately 45-60 seconds compared to the manual workflow
- **SC-007**: Error messages are displayed within 1 second when auto-page-creation fails, providing clear next steps to the instructor

## Assumptions

- The backend page creation endpoint already exists and is reliable (assumed based on technical context)
- The Next.js routing system supports programmatic navigation (standard Next.js functionality)
- The question save operation returns a success response that includes the updated question count for the page
- The existing auto-show question form feature (002-auto-show-question-form) works correctly on newly created pages
- The page editor component has access to the current lab ID and page ID for API calls
- Network latency for page creation is typically under 500ms in normal conditions
- Instructors create labs in a linear fashion (page 1 → page 2 → page 3) rather than jumping between pages randomly

## Dependencies

- **Feature 001-streamline-lab-creation**: Provides auto-redirect to page editor after lab creation (prerequisite for seamless multi-page flow)
- **Feature 002-auto-show-question-form**: Provides auto-show question form on empty pages (required for question form to appear on newly created pages)
- **Backend page creation endpoint**: Must be accessible and return the new page ID and page number
- **Next.js router**: Used for programmatic navigation to the newly created page
- **Question save endpoint**: Must return updated question count or allow client to determine when 3rd question is saved

## Out of Scope

- Customizing the 3-question threshold (e.g., allowing instructors to set auto-creation at 5 questions instead)
- Automatically deleting empty pages created by auto-page-creation if the instructor navigates away
- Bulk question import triggering multiple page auto-creations
- Auto-page-creation for questions added via API or external integrations
- Undo/rollback functionality for automatically created pages
- Analytics or tracking of how many pages are created automatically vs manually
- Configuring different page creation thresholds for different lab types
