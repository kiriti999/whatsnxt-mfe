# Feature Specification: Lab Diagram Tests

**Feature Branch**: `001-lab-diagram-test`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "On Labs page: http://localhost:3001/lab/693a91e4b84c01813477e170 Show an option to enable diagram test like a toggle button The toggle button should show the playground of diagram with shapes Questions type test are enabled by default. Instructor can create questions of MCQ, Text etc These Questions type test along with Diagrams test can be a paginated lab altogether So each lab page should have option to create new page Each new page should have option to create new question and option to create the diagram test by enabling the toggle button Each page should be saved to db before moving to next page as draft Final page should have option to publish Implementation plan: 1. Lets do it like a step form 2. Each step should have option to create new question and option to create the diagram test by enabling the toggle button and ability to create new step if required to create more questions and diagram test 3. Each step should be saved to db before moving to next page as draft 4. Final step should have option to publish Categories: 1. Each Architecture Type will have its own related shapes 2. All the common shapes should be isolated into a separate file or a shared package 3. Specific shapes should be isolated into a separate file based on the architecture type Follow solid princiiples and max cyclomatic complexity of 5"

## Clarifications

### Session 2025-12-11

- Q: How should diagram tests and question-based tests coexist on a single lab page? → A: A page can contain BOTH a diagram test AND/OR a set of questions.
- Q: What happens when a 'published' lab is edited? → A: A new 'draft' version of the lab is created, leaving the original 'published' version accessible.
- Q: How should the user navigate between lab pages/steps during creation? → A: Linear progression with the option to jump to previously created pages.
- Q: Is there a pre-existing API for saving lab content that should be used? → A: No, a new API and database schema must be designed and built for this feature.
- Q: Where should the APIs for this feature be implemented? → A: All APIs must be implemented in the existing 'whatsnxt-bff' service, using Node.js 24.12.0 LTS and Express.js 5, with data saved to MongoDB.
- Q: Which testing framework should be used for this feature? → A: Vitest must be used for all testing, replacing any previous use of Jest.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instructor Creates a Lab with Questions and Diagrams (Priority: P1)

As an instructor, I want to create a lab that includes both standard questions (like multiple choice) and interactive diagramming exercises, so I can create comprehensive and engaging learning experiences.

**Why this priority**: This is the core functionality of the feature.

**Independent Test**: An instructor can create a new lab, add a page with a multiple-choice question, add another page with a diagram exercise, save the lab as a draft, and then publish it.

**Acceptance Scenarios**:

1.  **Given** an instructor is on a lab creation page, **When** they add a new page, **Then** they should have the option to add a question (e.g., MCQ) or enable a diagram test.
2.  **Given** an instructor has added a diagram test to a page, **When** they enable it, **Then** a diagram editor with shapes should be displayed.
3.  **Given** an instructor is editing a lab, **When** they move between pages/steps, **Then** the content of each page should be saved as a draft automatically.
4.  **Given** an instructor has finished creating the lab, **When** they click the "Publish" button on the final page, **Then** the lab should be published and made available to students.
5.  **Given** an instructor is editing a published lab, **When** they make changes, **Then** these changes should be saved to a new draft version, and the original published version remains accessible to students.

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST provide an option on the lab creation page to add new pages/steps.
-   **FR-002**: Each page/step MUST allow the instructor to add a standard question (MCQ, text), a diagram test, or both.
-   **FR-003**: The system MUST provide a toggle to enable a diagram test on a page.
-   **FR-004**: When the diagram test is enabled, the system MUST display a diagram editor with a palette of shapes.
-   **FR-005**: The diagram shape palette MUST be organized by architecture type, with common shapes available for all types.
-   **FR-006**: The system MUST automatically save the content of a page as a draft when the instructor navigates to another page or explicitly saves.
-   **FR-007**: The system MUST provide a "Publish" button on the final page of the lab creation process.
-   **FR-008**: The system MUST adhere to SOLID principles and a maximum cyclomatic complexity of 5 for all new functions.
-   **FR-009**: The system MUST guide the instructor through a linear page creation process (e.g., "Next Page"), but MUST also allow them to jump directly to any previously created page for editing.


### Key Entities *(include if feature involves data)*

-   **Lab**: Represents a learning module, contains one or more pages. Can exist in 'draft' or 'published' states, with published labs retaining their state even if a new draft is being edited.
-   **LabPage**: A step or a page within a lab. Can contain a question, a diagram test, or both.
-   **Question**: A standard question, with types like "Multiple Choice" or "Text".
-   **DiagramTest**: An interactive diagramming exercise.
-   **DiagramShape**: A graphical element used in a diagram test, categorized by architecture type.


## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: An instructor can create a multi-page lab with at least one question and one diagram test in under 5 minutes.
-   **SC-002**: The system should provide clear feedback to the instructor when a page is saved as a draft.
-   **SC-003**: Published labs must be viewable by students in the intended format.

## Technical Considerations

-   All APIs related to this feature MUST be implemented in the `whatsnxt-bff` service.
-   A new API and corresponding database schema must be designed and built for saving and retrieving lab content. These APIs must be integrated into the `whatsnxt-bff` service.
-   The `whatsnxt-bff` service should use Node.js 24.12.0 LTS and Express.js 5, with data saved to MongoDB.
