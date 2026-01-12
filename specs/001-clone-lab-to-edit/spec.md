# Feature Specification: Clone Published Lab to Edit

**Feature Branch**: `001-clone-lab-to-edit`  
**Created**: 2025-01-17  
**Status**: Draft  
**Input**: User description: "Clone Published Lab to Edit"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clone Published Lab for Editing (Priority: P1)

An instructor has published a lab that students are using. The instructor discovers a typo or wants to add additional content. Instead of creating a new lab from scratch, the instructor clones the published lab to a draft version, makes edits, and then republishes it to replace the original.

**Why this priority**: This is the core workflow and provides immediate value by allowing instructors to maintain and improve published labs without disrupting student access or creating duplicate content.

**Independent Test**: Can be fully tested by creating a published lab, clicking "Clone to Edit", making changes to the draft, and verifying the draft exists with all content copied correctly. Delivers value by allowing instructors to iterate on published content.

**Acceptance Scenarios**:

1. **Given** an instructor views their published lab, **When** they click "Clone to Edit", **Then** a complete copy of the lab is created as a new draft with all pages, questions, diagram tests, and hints
2. **Given** an instructor has cloned a published lab, **When** they view the draft, **Then** the draft shows a reference indicating it was cloned from the original published lab
3. **Given** an instructor is viewing a published lab that has an active draft clone, **When** they look at the lab status, **Then** they see an indication that a draft edit is in progress
4. **Given** a published lab with 5 pages and 20 questions, **When** the instructor clones it, **Then** the draft contains all 5 pages and all 20 questions with identical content

---

### User Story 2 - Republish Draft to Replace Original (Priority: P1)

After editing the cloned draft, the instructor wants to publish their changes. When they attempt to republish, they see a clear confirmation modal warning them that this will replace the original published lab. After confirming, the original lab is updated with the draft content.

**Why this priority**: This is equally critical as cloning because it completes the edit-republish workflow and ensures instructors understand the impact of replacing a published lab that students may be using.

**Independent Test**: Can be fully tested by creating a draft cloned from a published lab, attempting to republish it, verifying the confirmation modal appears, and confirming that the original lab is updated after approval. Delivers value by safely allowing instructors to update published content.

**Acceptance Scenarios**:

1. **Given** an instructor has edited a cloned draft, **When** they click "Publish", **Then** a confirmation modal appears warning that this will replace the original published lab
2. **Given** the confirmation modal is shown, **When** the instructor cancels, **Then** the draft remains unpublished and the original lab is unchanged
3. **Given** the confirmation modal is shown, **When** the instructor confirms, **Then** the original published lab is updated with the draft content
4. **Given** a draft is successfully republished, **When** the operation completes, **Then** the draft is deleted and only the updated published lab remains
5. **Given** an instructor republishes a cloned draft, **When** students view the lab, **Then** they see the updated content

---

### User Story 3 - Student Progress Preservation (Priority: P2)

Students are actively working on a published lab when the instructor updates it by republishing a cloned draft. The system preserves student progress on questions and pages that still exist in the updated version.

**Why this priority**: This prevents student frustration and maintains learning continuity, but is secondary to the core clone-edit-republish workflow. Without this, students would lose progress when labs are updated.

**Independent Test**: Can be tested by having a student complete 3 out of 5 pages in a lab, then having an instructor republish with minor edits (typo fixes), and verifying the student's progress on those 3 pages is preserved. Delivers value by protecting student work.

**Acceptance Scenarios**:

1. **Given** a student has completed pages 1-3 of a 5-page published lab, **When** the instructor republishes with minor edits, **Then** the student's progress on pages 1-3 is preserved
2. **Given** a student has answered 10 questions correctly, **When** the instructor republishes the lab with those same questions unchanged, **Then** the student's 10 correct answers are preserved
3. **Given** a student has progress on a page that was removed in the republished version, **When** the lab is updated, **Then** progress on removed pages is archived but not lost from the database

---

### User Story 4 - Multiple Clones Prevention (Priority: P3)

An instructor attempts to clone a published lab when a draft clone already exists. The system prevents duplicate clones and instead directs the instructor to the existing draft.

**Why this priority**: This prevents confusion and wasted effort, but is not critical for the core workflow. It's a quality-of-life improvement that can be added after the main functionality works.

**Independent Test**: Can be tested by creating a draft clone, then attempting to clone the same published lab again, and verifying that the system either prevents the second clone or redirects to the existing draft. Delivers value by reducing instructor confusion.

**Acceptance Scenarios**:

1. **Given** an instructor has already cloned a published lab to draft, **When** they attempt to clone it again, **Then** the system shows a message indicating a draft already exists and provides a link to edit it
2. **Given** an existing draft clone has been deleted or republished, **When** the instructor attempts to clone the published lab, **Then** a new draft clone is created successfully

---

### Edge Cases

- What happens when a student is actively working on a lab page at the exact moment the instructor republishes? Are there any race conditions with concurrent edits?
- How does the system handle cloning very large labs with 50+ pages and hundreds of questions? Are there performance or timeout concerns?
- What happens if the republish operation fails halfway through (database error, network issue)? Is the operation atomic or could it leave the system in an inconsistent state?
- What if the original published lab is deleted while a draft clone still exists referencing it? Should the draft become orphaned or prevent deletion?
- How are references in questions (e.g., "see Question 5") preserved when question order changes between draft and republish?
- What happens when an instructor clones a lab, then another instructor updates the original published lab separately? Which version should be replaced on republish?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST prevent direct editing of published labs
- **FR-002**: System MUST display a "Clone to Edit" option on published labs owned by the instructor
- **FR-003**: System MUST create a complete copy of the published lab as a new draft when cloning, including all pages, questions, diagram tests, and hints
- **FR-004**: System MUST maintain a reference in the cloned draft linking it to the original published lab
- **FR-005**: System MUST display an indication on the published lab when an active draft clone exists
- **FR-006**: System MUST display a confirmation modal when an instructor attempts to republish a cloned draft
- **FR-007**: Confirmation modal MUST clearly warn that republishing will replace the original published lab
- **FR-008**: System MUST update the original published lab with the cloned draft content when republish is confirmed
- **FR-009**: System MUST delete the cloned draft after successful republish
- **FR-010**: System MUST preserve student progress on questions and pages that exist in both the original and republished versions
- **FR-011**: System MUST prevent creating multiple draft clones of the same published lab simultaneously
- **FR-012**: System MUST only allow the lab owner to clone and republish their own labs
- **FR-013**: Clone operation MUST copy all lab metadata including title, description, and settings
- **FR-014**: System MUST maintain question IDs or provide a mapping mechanism to preserve student progress during republish
- **FR-015**: System MUST provide error messages if cloning or republishing operations fail

### Key Entities

- **Lab**: Represents a lab assignment with multiple pages and questions. Has states: Draft, Published. Contains metadata like title, description, owner (instructor), creation date, and modification date.

- **Lab Clone Reference**: Links a draft lab to its original published lab. Stores the relationship between the cloned draft and the source published lab for republish operations.

- **Page**: Represents a single page within a lab. Contains content, ordering information, and belongs to a specific lab.

- **Question**: Represents an assessment question within a page. Contains question text, answer options, correct answer, hints, and diagram tests. Belongs to a specific page.

- **Student Progress**: Tracks student completion and answers for specific questions and pages. References both the student and the specific question/page. Must be preserved across lab updates where possible.

- **Diagram Test**: Validation rules or test cases associated with questions that involve diagrams. Must be copied during clone operations.

- **Hint**: Helper information for students working on questions. Must be copied during clone operations.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Instructors can clone a published lab and create a complete draft copy in under 10 seconds for labs with up to 20 pages
- **SC-002**: Instructors can successfully republish a cloned draft and replace the original published lab within 5 seconds
- **SC-003**: At least 90% of student progress (completed pages and correct answers) is preserved when a lab is republished with minor edits
- **SC-004**: Zero published labs are left in an inconsistent state after failed clone or republish operations
- **SC-005**: Instructors receive clear visual feedback about draft clone status within 2 seconds of viewing a published lab
- **SC-006**: 100% of instructors see and acknowledge the confirmation modal before replacing a published lab
- **SC-007**: Cloning and republishing operations complete successfully for labs containing up to 100 questions without timeout errors
