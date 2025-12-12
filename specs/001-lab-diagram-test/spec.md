# Feature Specification: Lab Diagram Tests

**Feature Branch**: `001-lab-diagram-test`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "
Labs page: http://localhost:3001/lab/693a91e4b84c01813477e170 for example.
On the labs page, show title, description and category (Lab type, Architecture type) of the lab and a create button to create a new lab as draft.

Created drafts will be shown below on the same page in pagination set of 3 labs per page with title and Architecture type with a edit and delete button. Latest draft should show on top
Instructor can choose to edit or delete the draft. If instructor clicks on edit, it should navigate to the lab creation page with the draft data. If instructor clicks on delete, it should delete the draft and show a success message.

Lab creation page should have a back button to go back to labs page.
Lab creation page should have a save as draft button to save the lab as draft.
Lab creation page should have a publish button to publish the lab.
Lab creation page should have a toggle button to enable diagram test.
Lab creation page should show question test to be created.
Instructor must create either diagram test or question test or both before saving the lab as draft or publishing the lab. Empty diagram test or question test should not be saved to db and validation error should be shown to the instructor.
Lab creation page should have a next button to move to next page to create next set of diagram and questions. clicking on next button should save the diagram and questions as draft and move to next page.
If there are no futher questions and or diagram test to be created by instructor then instructor can choose to save the lab as draft or publish it.
All the common shapes related to diagram test should be isolated into a separate file or a shared package.
Specific shapes related to diagram test should be isolated into a separate file based on the architecture type.
Follow solid principles and max cyclomatic complexity of 5.

**Updated Requirements (2025-12-12)**:
- Labs page must display lab title, description, and category (Lab type, Architecture type)
- Labs page must have a "Create New Lab" button to create a new lab as draft
- Draft labs must be displayed in pagination (3 labs per page) with title and Architecture type
- Draft labs must be sorted with latest on top
- Each draft lab must have Edit and Delete buttons
- Edit button navigates to lab creation page with draft data pre-filled
- Delete button removes the draft and shows success message
- Lab creation page must have a back button to navigate to labs page
- Lab creation page must have "Save as Draft" and "Publish" buttons
- Lab creation page must have a toggle to enable/disable diagram test
- Lab creation page must show question test editor
- Validation: At least one diagram test OR question test must be created before saving/publishing
- Empty diagram tests or question tests must not be saved to database
- Validation errors must be shown to instructor when validation fails
- "Next" button on lab creation page saves current page as draft and moves to next page
- Instructor can finish creating lab by clicking "Save as Draft" or "Publish"
- Common diagram shapes must be in separate shared package
- Architecture-specific diagram shapes must be in separate files per architecture type
- All code must follow SOLID principles and maintain cyclomatic complexity ≤ 5

## Clarifications

### Session 2025-12-12

- Q: How should new TypeScript code be integrated into the existing JavaScript backend (`apps/whatsnxt-bff`)? → A: Existing JavaScript (.js) files in `apps/whatsnxt-bff` should be converted to TypeScript (.ts) files before writing new logic into them, and any resulting TypeScript errors must be fixed.

### Session 2025-12-11

- Q: How should diagram tests and question-based tests coexist on a single lab page? → A: A page can contain BOTH a diagram test AND/OR a set of questions.
- Q: What happens when a 'published' lab is edited? → A: A new 'draft' version of the lab is created, leaving the original 'published' version accessible.
- Q: How should the user navigate between lab pages/steps during creation? → A: Linear progression with the option to jump to previously created pages.
- Q: Is there a pre-existing API for saving lab content that should be used? → A: No, a new API and database schema must be designed and built for this feature.
- Q: Where should the APIs for this feature be implemented? → A: All APIs must be implemented in the existing 'whatsnxt-bff' service, using Node.js 24.12.0 LTS and Express.js 5, with data saved to MongoDB.
- Q: Which testing framework should be used for this feature? → A: Vitest must be used for all testing, replacing any previous use of Jest.
- Q: What is the desired unique identifier strategy for Lab, LabPage, Question, and DiagramTest entities? → A: UUIDs
- Q: What are the expected data volumes for labs, pages, questions, and diagram tests? → A: Moderate (e.g., 100-1000 labs, 10-50 pages/lab, 5-20 questions/diagrams/page)
- Q: What are the specific requirements for error handling, empty states, and loading indicators during lab creation and interaction? → A: Clear visual feedback (spinners, messages) for all states (loading, empty, error) and user guidance for recovery.
- Q: What are the authentication and authorization mechanisms required for instructors and students accessing and creating labs, and how is sensitive data protected? → A: Integrate with existing OAuth2/OIDC for authentication, role-based access control (RBAC) for authorization, and encrypt all sensitive data at rest and in transit.
- Q: What are the expected failure modes for external services (`whatsnxt-bff` and MongoDB) and how should the system behave in such scenarios? → A: Implement retry mechanisms with exponential backoff; provide graceful degradation or informative error messages to the user; log detailed errors for monitoring.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instructor Manages Lab Drafts (Priority: P1)

As an instructor, I want to view, create, edit, and delete lab drafts from the Labs page, so I can efficiently manage my lab content before publishing.

**Why this priority**: This is the foundation for the lab management workflow.

**Independent Test**: An instructor can navigate to the Labs page, view existing labs with their categories, create a new lab draft, edit an existing draft, and delete a draft.

**Acceptance Scenarios**:

1.  **Given** an instructor is on the Labs page, **When** the page loads, **Then** they should see all labs with title, description, Lab type, and Architecture type.
2.  **Given** an instructor is on the Labs page, **When** they click "Create New Lab", **Then** a new draft lab should be created and they should navigate to the lab creation page.
3.  **Given** an instructor views draft labs, **When** drafts are displayed, **Then** they should be paginated (3 per page) and sorted with latest on top.
4.  **Given** an instructor views a draft lab item, **When** they see the draft, **Then** the item should display title, Architecture type, Edit and Delete buttons.
5.  **Given** an instructor clicks "Edit" on a draft, **When** the button is clicked, **Then** they should navigate to the lab creation page with draft data pre-filled.
6.  **Given** an instructor clicks "Delete" on a draft, **When** the button is clicked, **Then** the draft should be deleted and a success message should appear.

### User Story 2 - Instructor Creates a Lab with Questions and Diagrams (Priority: P1)

As an instructor, I want to create a lab that includes both standard questions (like multiple choice) and interactive diagramming exercises, so I can create comprehensive and engaging learning experiences.

**Why this priority**: This is the core functionality of the feature.

**Independent Test**: An instructor can create a new lab, add a page with a multiple-choice question, add another page with a diagram exercise, save the lab as a draft, and then publish it.

**Acceptance Scenarios**:

1.  **Given** an instructor is on the lab creation page, **When** they add a new page, **Then** they should have the option to add a question (e.g., MCQ) or enable a diagram test.
2.  **Given** an instructor has added a diagram test to a page, **When** they enable it, **Then** a diagram editor with shapes should be displayed.
3.  **Given** an instructor attempts to save without tests, **When** they click "Save as Draft" or "Publish", **Then** a validation error should be shown indicating at least one test is required.
4.  **Given** an instructor creates an empty diagram test, **When** they try to save, **Then** the empty test should not be saved and a validation error should appear.
5.  **Given** an instructor has created valid tests, **When** they click "Next", **Then** the current page should be saved as draft and they should navigate to the next page.
6.  **Given** an instructor has finished creating all pages, **When** they click "Publish", **Then** the lab should be published and made available to students.
7.  **Given** an instructor is on the lab creation page, **When** they click "Back", **Then** they should navigate to the Labs page.
8.  **Given** an instructor is editing a published lab, **When** they make changes, **Then** these changes should be saved to a new draft version, and the original published version remains accessible to students.

## Requirements *(mandatory)*

### Functional Requirements

#### Labs Page (List View)
-   **FR-001**: The Labs page MUST display the title, description, and category (Lab type, Architecture type) of each lab.
-   **FR-002**: The Labs page MUST provide a "Create New Lab" button to initiate creation of a new lab as draft.
-   **FR-003**: Draft labs MUST be displayed in a paginated list with 3 labs per page.
-   **FR-004**: Draft labs MUST be sorted with the latest draft displayed on top.
-   **FR-005**: Each draft lab item MUST display the title and Architecture type.
-   **FR-006**: Each draft lab item MUST have "Edit" and "Delete" buttons.
-   **FR-007**: Clicking "Edit" MUST navigate to the lab creation page with draft data pre-filled.
-   **FR-008**: Clicking "Delete" MUST remove the draft from the database and display a success message.

#### Lab Creation Page
-   **FR-009**: The lab creation page MUST have a "Back" button to navigate to the labs page.
-   **FR-010**: The lab creation page MUST have a "Save as Draft" button to save the lab as draft.
-   **FR-011**: The lab creation page MUST have a "Publish" button to publish the lab.
-   **FR-012**: The lab creation page MUST provide a toggle to enable/disable diagram test for each page.
-   **FR-013**: The lab creation page MUST display a question test editor.
-   **FR-014**: The system MUST validate that at least one diagram test OR question test is created before allowing save/publish.
-   **FR-015**: Empty diagram tests or question tests MUST NOT be saved to the database.
-   **FR-016**: Validation errors MUST be displayed to the instructor when validation fails.
-   **FR-017**: The lab creation page MUST have a "Next" button that saves the current page as draft and navigates to the next page.
-   **FR-018**: The system MUST allow the instructor to finish creating the lab by clicking "Save as Draft" or "Publish" after all pages are complete.

#### Architecture and Code Quality
-   **FR-019**: Common diagram shapes MUST be isolated in a separate shared package.
-   **FR-020**: Architecture-specific diagram shapes MUST be isolated in separate files based on architecture type (AWS, Azure, GCP, etc.).
-   **FR-021**: The system MUST adhere to SOLID principles and a maximum cyclomatic complexity of 5 for all new functions.
-   **FR-022**: The system MUST provide clear visual feedback (spinners for loading, descriptive messages for empty states and errors) and guidance for recovery to the user during lab creation and interaction.
-   **FR-023**: The system MUST integrate with existing OAuth2/OIDC for authentication, implement role-based access control (RBAC) for authorization, and encrypt all sensitive data at rest and in transit.
-   **FR-024**: The system MUST implement robust retry mechanisms with exponential backoff for external service calls, provide graceful degradation or informative error messages to the user during external service failures, and log detailed errors for monitoring.
-   **FR-025**: The system MUST NOT use mock APIs, mock data, stub implementations, or hardcoded fake data in any environment.


### Key Entities *(include if feature involves data)*

-   **Lab**: Represents a learning module, contains one or more pages. Identified by a UUID. Can exist in 'draft' or 'published' states, with published labs retaining their state even if a new draft is being edited. Must include Lab type and Architecture type as category information.
-   **LabPage**: A step or a page within a lab. Identified by a UUID. Can contain a question, a diagram test, or both. Must have at least one test type (question OR diagram) to be valid.
-   **Question**: A standard question, with types like "Multiple Choice" or "Text". Identified by a UUID. Cannot be empty when associated with a LabPage.
-   **DiagramTest**: An interactive diagramming exercise. Identified by a UUID. Cannot be empty when associated with a LabPage. Must specify an architecture type.
-   **DiagramShape**: A graphical element used in a diagram test, categorized by architecture type. Identified by a UUID. Common shapes must be in shared package, architecture-specific shapes must be in separate files.


## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: The Labs page displays all labs with title, description, Lab type, and Architecture type within 2 seconds of page load.
-   **SC-002**: Draft labs are displayed in paginated format (3 per page) sorted with latest on top.
-   **SC-003**: An instructor can create a new lab draft and navigate to the lab creation page in under 3 seconds.
-   **SC-004**: Edit and Delete buttons on draft labs function correctly, with Delete showing confirmation and success messages.
-   **SC-005**: Lab creation page Back button navigates to Labs page without data loss for saved drafts.
-   **SC-006**: An instructor can create a multi-page lab with at least one question and one diagram test in under 5 minutes.
-   **SC-007**: The system provides clear validation errors when attempting to save empty tests or pages without tests.
-   **SC-008**: Empty diagram tests or empty questions are prevented from being saved to the database.
-   **SC-009**: The "Next" button successfully saves the current page as draft and navigates to the next page.
-   **SC-010**: The system provides clear feedback to the instructor when a page is saved as a draft.
-   **SC-011**: Published labs must be viewable by students in the intended format.
-   **SC-012**: All diagram shapes follow the architectural separation: common shapes in shared package, architecture-specific shapes in separate files.
-   **SC-013**: No mock data or mock APIs are used in any environment.

## Technical Considerations

-   All APIs related to this feature MUST be implemented in the `whatsnxt-bff` service.
-   A new API and corresponding database schema must be designed and built for saving and retrieving lab content. These APIs must be integrated into the `whatsnxt-bff` service.
-   The `whatsnxt-bff` service should use Node.js 24.12.0 LTS and Express.js 5, with data saved to MongoDB.
-   Security measures MUST include integration with existing OAuth2/OIDC for authentication, implementation of role-based access control (RBAC) for authorization, and encryption of all sensitive data at rest and in transit.
-   The system MUST implement robust retry mechanisms with exponential backoff for external service calls, provide graceful degradation or informative error messages to the user during external service failures, and log detailed errors for monitoring.
-   When implementing new logic or modifying existing functionality in `apps/whatsnxt-bff`, existing JavaScript (`.js`) files MUST be converted to TypeScript (`.ts`) before modification, and all resulting TypeScript errors MUST be resolved.
