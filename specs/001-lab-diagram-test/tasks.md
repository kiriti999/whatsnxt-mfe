# Tasks: Lab Diagram Tests

**Input**: Design documents from `/specs/001-lab-diagram-test/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md

**Tests**: Tests are included as per the constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create new package `diagram-shapes` in `packages/`
- [ ] T002 [P] Create database migration script for the new tables (Lab, LabPage, Question, DiagramTest, DiagramShape) based on `data-model.md`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T003 Create API endpoint to create/update a lab: `POST /api/labs`
- [ ] T004 Create API endpoint to get a lab: `GET /api/labs/[id]`
- [ ] T005 Create API endpoint to publish a lab: `POST /api/labs/[id]/publish`

---

## Phase 3: User Story 1 - Instructor Creates a Lab with Questions and Diagrams (Priority: P1) 🎯 MVP

**Goal**: Allow instructors to create a lab with both questions and diagram tests.

**Independent Test**: An instructor can create a new lab, add a page with a multiple-choice question, add another page with a diagram exercise, save the lab as a draft, and then publish it.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T006 [P] [US1] Write a test for the lab creation page UI in `apps/web/components/architecture-lab/tests/LabCreation.test.tsx`
- [ ] T007 [P] [US1] Write a test for the diagram editor component in `apps/web/components/architecture-lab/tests/DiagramEditor.test.tsx`

### Implementation for User Story 1

- [ ] T008 [US1] Implement the step-based lab creation UI in `apps/web/app/lab/create/page.tsx`
- [ ] T009 [US1] Implement the question creation form in `apps/web/components/architecture-lab/QuestionForm.tsx`
- [ ] T010 [US1] Implement the diagram editor component in `apps/web/components/architecture-lab/DiagramEditor.tsx`
- [ ] T011 [US1] Implement the shape palette for the diagram editor in `apps/web/components/architecture-lab/ShapePalette.tsx` using shapes from the `diagram-shapes` package.
- [ ] T012 [US1] Implement the functionality to add/remove pages in the lab creation UI.
- [ ] T013 [US1] Implement the draft saving logic to automatically save the lab content when the user navigates between pages.
- [ ] T014 [US1] Implement the publish logic to finalize the lab.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T015 [P] Add documentation for the new components and packages.
- [ ] T016 [P] Add unit tests for all new functions and components to ensure they meet the cyclomatic complexity and SOLID principles requirements.

---
