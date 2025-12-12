# Tasks for Lab Diagram Tests

**Feature Branch**: `001-lab-diagram-test`
**Date**: 2025-12-12
**Updated**: 2025-12-12

## Task Status Legend
- [ ] Not Started
- [~] In Progress
- [X] Completed
- [B] Blocked

## Priority Legend
- [P0] Critical - Must have for MVP
- [P1] High - Important for core functionality
- [P2] Medium - Enhances user experience
- [P3] Low - Nice to have

---

## Phase 0: Research and Setup

### Research Tasks
- [ ] **T001** [P0] Research existing Labs page implementation (`apps/web/app/labs/page.tsx`)
  - Document current structure and components
  - Identify what can be reused vs needs refactoring
  - **Estimate**: 2h | **File**: `specs/001-lab-diagram-test/research.md`

- [ ] **T002** [P0] Research existing lab creation page (`apps/web/app/lab/create/page.tsx`)
  - Document current implementation
  - Identify integration points for new features
  - **Estimate**: 2h | **File**: `specs/001-lab-diagram-test/research.md`

- [ ] **T003** [P0] Analyze current API structure (`apps/web/apis/lab.api.ts`)
  - Document existing mock API implementation
  - Plan migration to real APIs (NO mock data allowed)
  - **Estimate**: 1h | **File**: `specs/001-lab-diagram-test/research.md`

- [ ] **T004** [P0] Review `packages/core-types` structure
  - Verify existing Lab types
  - Plan additions for labType and architectureType
  - **Estimate**: 1h | **File**: `specs/001-lab-diagram-test/research.md`

- [ ] **T005** [P0] Review `packages/diagram-core` package
  - Document current diagram functionality
  - Plan shape package integration
  - **Estimate**: 1h | **File**: `specs/001-lab-diagram-test/research.md`

- [ ] **T006** [P0] Review `apps/whatsnxt-bff` backend structure
  - Identify JavaScript files needing TypeScript conversion
  - Document MongoDB connection setup
  - Check Winston logger configuration
  - **Estimate**: 2h | **File**: `specs/001-lab-diagram-test/research.md`

### Workspace Package Setup
- [ ] **T007** [P0] Verify `@whatsnxt/http-client` configuration
  - Ensure axios instance properly configured
  - Verify retry logic and interceptors
  - **Estimate**: 1h | **File**: `packages/http-client/`

- [ ] **T008** [P0] Verify `@whatsnxt/errors` package exists
  - Check for ValidationError, NotFoundError, etc.
  - Create if missing
  - **Estimate**: 2h | **File**: `packages/errors/`

- [ ] **T009** [P0] Verify `@whatsnxt/constants` package exists
  - Check for API endpoint constants
  - Plan additions for lab APIs
  - **Estimate**: 1h | **File**: `packages/constants/`

---

## Phase 1: Design and Architecture

### Design Documents
- [ ] **T010** [P0] Create High-Level Design (HLD)
  - System architecture diagram
  - Component interaction diagram
  - Data flow diagrams (Labs page, Lab creation)
  - Authentication flow
  - Error handling strategy
  - **Estimate**: 4h | **File**: `specs/001-lab-diagram-test/HLD.md`

- [ ] **T011** [P0] Create Low-Level Design (LLD)
  - Frontend component hierarchy
  - Backend service layer design
  - Database schema with indexes
  - Validation logic design
  - State management design
  - **Estimate**: 4h | **File**: `specs/001-lab-diagram-test/LLD.md`

- [ ] **T012** [P1] Create quickstart guide
  - Development environment setup
  - Running the application
  - Testing procedures
  - API testing examples
  - **Estimate**: 2h | **File**: `specs/001-lab-diagram-test/quickstart.md`

---

## Phase 2: Backend - Type Definitions and Models

### Type Definitions
- [ ] **T013** [P0] Update Lab interface in `@whatsnxt/core-types`
  - Add `labType: string` field
  - Add `architectureType: string` field
  - Update validation types
  - **Estimate**: 1h | **File**: `packages/core-types/src/index.d.ts`
  - **Depends on**: T004

- [ ] **T014** [P0] Create PaginatedResponse type in `@whatsnxt/core-types`
  - Generic type for paginated API responses
  - Include data, page, limit, totalItems, totalPages
  - **Estimate**: 0.5h | **File**: `packages/core-types/src/index.d.ts`

- [ ] **T015** [P0] Add validation types for Lab requests
  - CreateLabRequest with labType, architectureType
  - UpdateLabRequest with optional fields
  - **Estimate**: 1h | **File**: `packages/core-types/src/index.d.ts`

### Backend Setup
- [ ] **T016** [P0] Convert `apps/whatsnxt-bff` existing JS files to TypeScript
  - Convert models/*.js to *.ts
  - Convert routes/*.js to *.ts
  - Convert services/*.js to *.ts
  - Fix all TypeScript errors
  - **Estimate**: 6h | **File**: `apps/whatsnxt-bff/app/`
  - **Depends on**: T006

- [ ] **T017** [P0] Configure TypeScript in `apps/whatsnxt-bff`
  - Update tsconfig.json
  - Configure build scripts
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/tsconfig.json`

- [ ] **T018** [P0] Configure Vitest for backend testing
  - Setup vitest.config.ts
  - Configure test environment
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/vitest.config.ts`

### Database Models
- [ ] **T019** [P0] Create Lab MongoDB model
  - Fields: id (UUID), status, name, description, labType, architectureType, instructorId
  - Indexes: instructorId, status, createdAt, architectureType
  - Validation: name, labType, architectureType required
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/models/Lab.ts`
  - **Depends on**: T013, T016

- [ ] **T020** [P0] Create LabPage MongoDB model
  - Fields: id (UUID), labId, pageNumber, hasQuestion, hasDiagramTest
  - Relationships: references Lab, Question, DiagramTest
  - Indexes: labId, pageNumber
  - Validation: at least one test type required
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/models/LabPage.ts`
  - **Depends on**: T019

- [ ] **T021** [P0] Create Question MongoDB model
  - Fields: id (UUID), labPageId, type, questionText, options, correctAnswer
  - Indexes: labPageId
  - Validation: questionText required, MCQ must have ≥2 options
  - **Estimate**: 1.5h | **File**: `apps/whatsnxt-bff/app/models/Question.ts`

- [ ] **T022** [P0] Create DiagramTest MongoDB model
  - Fields: id (UUID), labPageId, prompt, expectedDiagramState, architectureType
  - Indexes: labPageId, architectureType
  - Validation: prompt, expectedDiagramState, architectureType required
  - **Estimate**: 1.5h | **File**: `apps/whatsnxt-bff/app/models/DiagramTest.ts`

- [ ] **T023** [P1] Create DiagramShape MongoDB model
  - Fields: id (UUID), name, type, architectureType, svgPath, metadata
  - Indexes: architectureType, type
  - Seed common shapes data
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/models/DiagramShape.ts`

---

## Phase 3: Backend - Services and Validation

### Validation Services
- [ ] **T024** [P0] Create ValidationService
  - validateLabData(data) - max complexity 5
  - validateLabPageData(data) - max complexity 5
  - validateQuestionData(data) - max complexity 5
  - validateDiagramTestData(data) - max complexity 5
  - Return descriptive error messages
  - **Estimate**: 3h | **File**: `apps/whatsnxt-bff/app/services/ValidationService.ts`
  - **Depends on**: T019-T023

- [ ] **T025** [P0] Create PaginationService
  - calculatePagination(page, limit, total) - max complexity 5
  - buildPaginationResponse(data, pagination) - max complexity 5
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/services/PaginationService.ts`
  - **Depends on**: T014

### Business Logic Services
- [ ] **T026** [P0] Create LabService
  - createLab(data) - validate and create lab - max complexity 5
  - getLabs(filters, pagination) - get paginated labs - max complexity 5
  - getLabById(labId) - max complexity 5
  - updateLab(labId, data) - draft only - max complexity 5
  - deleteLab(labId) - draft only - max complexity 5
  - publishLab(labId) - validate before publish - max complexity 5
  - **Estimate**: 5h | **File**: `apps/whatsnxt-bff/app/services/LabService.ts`
  - **Depends on**: T019, T024, T025

- [ ] **T027** [P0] Create LabPageService
  - createLabPage(labId, data) - validate - max complexity 5
  - getLabPage(labId, pageId) - max complexity 5
  - updateLabPage(labId, pageId, data) - validate - max complexity 5
  - validateLabPageTests(pageData) - ensure at least one test - max complexity 5
  - **Estimate**: 4h | **File**: `apps/whatsnxt-bff/app/services/LabPageService.ts`
  - **Depends on**: T020-T022, T024

- [ ] **T028** [P1] Create DiagramShapeService
  - getShapes(architectureType) - filter by architecture - max complexity 5
  - Implement caching for shape data
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/services/DiagramShapeService.ts`
  - **Depends on**: T023

---

## Phase 4: Backend - API Routes and Middleware

### Error Handling Middleware
- [ ] **T029** [P0] Create global error handler middleware
  - Use `@whatsnxt/errors` custom error classes
  - Map errors to HTTP status codes
  - Log errors with Winston
  - Return structured error responses
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/middleware/errorHandler.ts`
  - **Depends on**: T008

- [ ] **T030** [P0] Create validation middleware
  - validateRequest(schema) - express middleware
  - Use with route handlers
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/middleware/validation.ts`

### Authentication and Authorization
- [ ] **T031** [P0] Integrate OAuth2/OIDC authentication
  - Configure authentication middleware
  - Extract user info from tokens
  - **Estimate**: 3h | **File**: `apps/whatsnxt-bff/app/middleware/auth.ts`

- [ ] **T032** [P0] Implement RBAC authorization middleware
  - requireRole(role) middleware
  - Check instructor vs student roles
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/middleware/rbac.ts`
  - **Depends on**: T031

### API Routes - Labs
- [ ] **T033** [P0] Implement POST /api/v1/labs
  - Create lab with validation
  - Require: name, labType, architectureType
  - Return created lab as draft
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T029, T030, T032

- [ ] **T034** [P0] Implement GET /api/v1/labs
  - Support pagination (page, limit params)
  - Support filtering (status param)
  - Sort by createdAt descending
  - Return PaginatedResponse
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T029

- [ ] **T035** [P0] Implement GET /api/v1/labs/:labId
  - Get single lab by ID
  - Include basic page data
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T029

- [ ] **T036** [P0] Implement PUT /api/v1/labs/:labId
  - Update lab metadata (draft only)
  - Validate status before update
  - **Estimate**: 1.5h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T029, T030, T032

- [ ] **T037** [P0] Implement DELETE /api/v1/labs/:labId
  - Delete lab (draft only)
  - Validate status before delete
  - Cascade delete pages, questions, diagram tests
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T029, T032

- [ ] **T038** [P0] Implement POST /api/v1/labs/:labId/publish
  - Validate lab has at least one page with valid tests
  - Validate no empty tests
  - Change status to published
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/routes/labs.ts`
  - **Depends on**: T026, T027, T029, T032

### API Routes - Lab Pages
- [ ] **T039** [P0] Implement POST /api/v1/labs/:labId/pages
  - Create lab page
  - Validate at least one test type
  - Create associated Question or DiagramTest
  - **Estimate**: 3h | **File**: `apps/whatsnxt-bff/app/routes/labPages.ts`
  - **Depends on**: T027, T029, T030, T032

- [ ] **T040** [P0] Implement GET /api/v1/labs/:labId/pages/:pageId
  - Get lab page with Question and DiagramTest data
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/routes/labPages.ts`
  - **Depends on**: T027, T029

- [ ] **T041** [P0] Implement PUT /api/v1/labs/:labId/pages/:pageId
  - Update lab page
  - Validate at least one test type
  - Update associated Question or DiagramTest
  - **Estimate**: 3h | **File**: `apps/whatsnxt-bff/app/routes/labPages.ts`
  - **Depends on**: T027, T029, T030, T032

### API Routes - Diagram Shapes
- [ ] **T042** [P1] Implement GET /api/v1/diagram-shapes
  - Support architectureType query parameter
  - Return filtered shapes
  - Implement caching
  - **Estimate**: 1.5h | **File**: `apps/whatsnxt-bff/app/routes/diagramShapes.ts`
  - **Depends on**: T028, T029

---

## Phase 5: Backend - Testing

### Unit Tests
- [ ] **T043** [P0] Write unit tests for ValidationService
  - Test all validation functions
  - Test error messages
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/app/tests/unit/ValidationService.test.ts`
  - **Depends on**: T024

- [ ] **T044** [P0] Write unit tests for PaginationService
  - Test pagination calculations
  - Test edge cases
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/tests/unit/PaginationService.test.ts`
  - **Depends on**: T025

- [ ] **T045** [P0] Write unit tests for LabService
  - Test all CRUD operations
  - Test validation
  - Test publish logic
  - Target: >80% coverage
  - **Estimate**: 4h | **File**: `apps/whatsnxt-bff/app/tests/unit/LabService.test.ts`
  - **Depends on**: T026

- [ ] **T046** [P0] Write unit tests for LabPageService
  - Test CRUD operations
  - Test validation logic
  - Target: >80% coverage
  - **Estimate**: 3h | **File**: `apps/whatsnxt-bff/app/tests/unit/LabPageService.test.ts`
  - **Depends on**: T027

- [ ] **T047** [P1] Write unit tests for DiagramShapeService
  - Test filtering by architectureType
  - Test caching
  - **Estimate**: 1.5h | **File**: `apps/whatsnxt-bff/app/tests/unit/DiagramShapeService.test.ts`
  - **Depends on**: T028

### Integration Tests
- [ ] **T048** [P0] Write integration tests for Lab routes
  - Test POST, GET, PUT, DELETE, publish endpoints
  - Test authentication/authorization
  - Test validation errors
  - Test pagination
  - **Estimate**: 5h | **File**: `apps/whatsnxt-bff/app/tests/integration/labs.test.ts`
  - **Depends on**: T033-T038

- [ ] **T049** [P0] Write integration tests for LabPage routes
  - Test POST, GET, PUT endpoints
  - Test validation
  - **Estimate**: 4h | **File**: `apps/whatsnxt-bff/app/tests/integration/labPages.test.ts`
  - **Depends on**: T039-T041

- [ ] **T050** [P1] Write integration tests for DiagramShape routes
  - Test GET with filtering
  - **Estimate**: 1h | **File**: `apps/whatsnxt-bff/app/tests/integration/diagramShapes.test.ts`
  - **Depends on**: T042

---

## Phase 6: Shared Packages - Diagram Shapes

### Common Shapes Package
- [ ] **T051** [P1] Create `@whatsnxt/diagram-shapes-common` package
  - Setup package.json
  - Configure TypeScript
  - **Estimate**: 1h | **File**: `packages/diagram-shapes-common/`

- [ ] **T052** [P1] Define common shape types and interfaces
  - Shape interface
  - Metadata interface
  - **Estimate**: 1h | **File**: `packages/diagram-shapes-common/src/types.ts`

- [ ] **T053** [P1] Implement common shapes (Server, Database, User, Network, etc.)
  - Create shape definitions with SVG paths
  - Add metadata (size, connection points)
  - **Estimate**: 4h | **File**: `packages/diagram-shapes-common/src/shapes/`
  - **Depends on**: T052

### AWS Shapes Package
- [ ] **T054** [P1] Create `@whatsnxt/diagram-shapes-aws` package
  - Setup package.json
  - Configure TypeScript
  - **Estimate**: 1h | **File**: `packages/diagram-shapes-aws/`

- [ ] **T055** [P1] Implement AWS shapes (EC2, S3, VPC, Lambda, RDS, etc.)
  - Create shape definitions with SVG paths
  - Add AWS-specific metadata
  - **Estimate**: 5h | **File**: `packages/diagram-shapes-aws/src/shapes/`
  - **Depends on**: T052

### Azure Shapes Package
- [ ] **T056** [P2] Create `@whatsnxt/diagram-shapes-azure` package
  - Setup package.json
  - Configure TypeScript
  - **Estimate**: 1h | **File**: `packages/diagram-shapes-azure/`

- [ ] **T057** [P2] Implement Azure shapes (VM, Storage, Functions, SQL, etc.)
  - Create shape definitions with SVG paths
  - Add Azure-specific metadata
  - **Estimate**: 5h | **File**: `packages/diagram-shapes-azure/src/shapes/`
  - **Depends on**: T052

### GCP Shapes Package
- [ ] **T058** [P2] Create `@whatsnxt/diagram-shapes-gcp` package
  - Setup package.json
  - Configure TypeScript
  - **Estimate**: 1h | **File**: `packages/diagram-shapes-gcp/`

- [ ] **T059** [P2] Implement GCP shapes (Compute Engine, Cloud Storage, etc.)
  - Create shape definitions with SVG paths
  - Add GCP-specific metadata
  - **Estimate**: 5h | **File**: `packages/diagram-shapes-gcp/src/shapes/`
  - **Depends on**: T052

### Shape Registry
- [ ] **T060** [P1] Create ShapeRegistry in `@whatsnxt/diagram-core`
  - registerShapes(architectureType, shapes)
  - getShapes(architectureType) - max complexity 5
  - Support lazy loading of architecture-specific shapes
  - **Estimate**: 3h | **File**: `packages/diagram-core/src/ShapeRegistry.ts`
  - **Depends on**: T051-T059

---

## Phase 7: Frontend - Labs Page

### API Client
- [ ] **T061** [P0] Add API endpoint constants to `@whatsnxt/constants`
  - LABS_API, LAB_PAGES_API, DIAGRAM_SHAPES_API
  - **Estimate**: 0.5h | **File**: `packages/constants/src/api.ts`
  - **Depends on**: T009

- [ ] **T062** [P0] Implement Lab API client functions
  - getLabs(status, page, limit) using `@whatsnxt/http-client`
  - createLab(data)
  - updateLab(labId, data)
  - deleteLab(labId)
  - publishLab(labId)
  - Remove all mock data/APIs
  - **Estimate**: 3h | **File**: `apps/web/apis/lab.api.ts`
  - **Depends on**: T033-T038, T061

### Components
- [ ] **T063** [P0] Create LabCard component
  - Display: title, description, labType badge, architectureType badge
  - Edit button (routes to `/lab/create?id=${labId}`)
  - Delete button (opens confirmation dialog)
  - Responsive layout with Mantine components
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/components/Labs/LabCard.tsx`

- [ ] **T064** [P0] Create DeleteLabDialog component
  - Confirmation modal with lab name
  - Cancel and Confirm buttons
  - Call deleteLab API
  - Show success notification
  - Handle errors
  - Max complexity 5
  - **Estimate**: 2h | **File**: `apps/web/components/Labs/DeleteLabDialog.tsx`
  - **Depends on**: T062

- [ ] **T065** [P0] Create CreateLabModal component
  - Form: name, description, labType, architectureType
  - Validation: name, labType, architectureType required
  - Submit creates lab via API
  - Navigate to `/lab/create?id=${labId}` on success
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/components/Labs/CreateLabModal.tsx`
  - **Depends on**: T062

- [ ] **T066** [P0] Create LabsList component
  - Fetch labs with pagination from API
  - Display LabCard components in grid
  - Pagination controls (Mantine Pagination component)
  - Loading state with spinner
  - Empty state message
  - Error state with retry button
  - Sort by createdAt descending
  - Max complexity 5
  - **Estimate**: 4h | **File**: `apps/web/components/Labs/LabsList.tsx`
  - **Depends on**: T062, T063, T064

### Page Implementation
- [ ] **T067** [P0] Refactor LabsPage component
  - Display all labs section (published)
  - Display draft labs section with LabsList
  - "Create New Lab" button opens CreateLabModal
  - Handle lab creation success (close modal, refresh list)
  - Handle lab deletion success (refresh list)
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/app/labs/page.tsx`
  - **Depends on**: T065, T066

### Frontend Tests
- [ ] **T068** [P1] Write tests for LabCard component
  - Test rendering
  - Test Edit button click
  - Test Delete button click
  - **Estimate**: 1.5h | **File**: `apps/web/__tests__/components/Labs/LabCard.test.tsx`
  - **Depends on**: T063

- [ ] **T069** [P1] Write tests for DeleteLabDialog component
  - Test modal open/close
  - Test delete confirmation
  - Test API call
  - **Estimate**: 1.5h | **File**: `apps/web/__tests__/components/Labs/DeleteLabDialog.test.tsx`
  - **Depends on**: T064

- [ ] **T070** [P1] Write tests for CreateLabModal component
  - Test form validation
  - Test submission
  - Test navigation
  - **Estimate**: 2h | **File**: `apps/web/__tests__/components/Labs/CreateLabModal.test.tsx`
  - **Depends on**: T065

- [ ] **T071** [P1] Write tests for LabsList component
  - Test data fetching
  - Test pagination
  - Test loading/error states
  - **Estimate**: 2h | **File**: `apps/web/__tests__/components/Labs/LabsList.test.tsx`
  - **Depends on**: T066

- [ ] **T072** [P1] Write tests for LabsPage component
  - Test rendering
  - Test create lab flow
  - Test delete lab flow
  - **Estimate**: 2h | **File**: `apps/web/__tests__/app/labs/page.test.tsx`
  - **Depends on**: T067

---

## Phase 8: Frontend - Lab Creation Page

### API Client Extensions
- [ ] **T073** [P0] Implement LabPage API client functions
  - getLabPages(labId)
  - createLabPage(labId, data)
  - updateLabPage(labId, pageId, data)
  - **Estimate**: 2h | **File**: `apps/web/apis/labPage.api.ts`
  - **Depends on**: T039-T041, T061

- [ ] **T074** [P1] Implement DiagramShape API client functions
  - getShapes(architectureType)
  - **Estimate**: 1h | **File**: `apps/web/apis/diagramShape.api.ts`
  - **Depends on**: T042, T061

### Lab Metadata Components
- [ ] **T075** [P0] Create LabMetadataForm component
  - Fields: name, description, labType, architectureType
  - Real-time validation
  - Auto-save on blur (debounced)
  - Error messages
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/components/LabCreation/LabMetadataForm.tsx`
  - **Depends on**: T062

### Question Editor Components
- [ ] **T076** [P0] Refactor QuestionEditor component
  - Question type selector (MCQ, Text)
  - Question text input
  - Dynamic options list for MCQ (add/remove)
  - Correct answer selection
  - Validation: questionText required, MCQ ≥2 options
  - Max complexity 5
  - **Estimate**: 4h | **File**: `apps/web/components/LabCreation/QuestionEditor.tsx`

### Diagram Editor Components
- [ ] **T077** [P0] Create DiagramTestToggle component
  - Toggle switch to enable/disable diagram test
  - Show/hide diagram editor based on state
  - Max complexity 5
  - **Estimate**: 1h | **File**: `apps/web/components/LabCreation/DiagramTestToggle.tsx`

- [ ] **T078** [P1] Refactor ShapePalette component
  - Use ShapeRegistry to get shapes
  - Filter by architectureType (from lab metadata)
  - Display common shapes + architecture-specific shapes
  - Drag-and-drop support
  - Max complexity 5
  - **Estimate**: 4h | **File**: `apps/web/components/DiagramEditor/ShapePalette.tsx`
  - **Depends on**: T060, T074

- [ ] **T079** [P1] Refactor DiagramCanvas component
  - Drop target for shapes from palette
  - Render shapes on canvas
  - Support shape connections
  - Store diagram state (shapes, positions, connections)
  - Max complexity 5
  - **Estimate**: 5h | **File**: `apps/web/components/DiagramEditor/DiagramCanvas.tsx`
  - **Depends on**: T060

### Validation Services
- [ ] **T080** [P0] Create PageValidator client-side service
  - validatePage(pageData) - max complexity 5
  - Validate at least one test type
  - Validate question if present (questionText, options)
  - Validate diagram if present (at least one shape)
  - Return descriptive error messages
  - **Estimate**: 2h | **File**: `apps/web/utils/PageValidator.ts`

### Page Navigation and Actions
- [ ] **T081** [P0] Create PageNavigator component
  - Stepper or tabs for page navigation
  - Show page numbers and status (completed, current)
  - Click to navigate between pages
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/components/LabCreation/PageNavigator.tsx`

- [ ] **T082** [P0] Implement page save logic
  - "Next" button handler
  - Validate current page using PageValidator
  - Call createLabPage or updateLabPage API
  - Navigate to next page on success
  - Show error on validation failure
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/app/lab/create/page.tsx`
  - **Depends on**: T073, T080

- [ ] **T083** [P0] Implement draft save logic
  - "Save as Draft" button handler
  - Validate current page
  - Save page via API
  - Show success notification
  - Stay on current page
  - Max complexity 5
  - **Estimate**: 2h | **File**: `apps/web/app/lab/create/page.tsx`
  - **Depends on**: T073, T080

- [ ] **T084** [P0] Implement publish logic
  - "Publish" button handler
  - Validate all pages have at least one test
  - Validate no empty tests
  - Show confirmation dialog
  - Call publishLab API
  - Navigate to Labs page on success
  - Max complexity 5
  - **Estimate**: 3h | **File**: `apps/web/app/lab/create/page.tsx`
  - **Depends on**: T062, T080

- [ ] **T085** [P0] Implement edit draft logic
  - Load draft data when labId in URL query
  - Fetch lab metadata and pre-fill LabMetadataForm
  - Fetch existing pages and populate PageNavigator
  - Load current page data
  - Preserve changes during page navigation
  - Max complexity 5
  - **Estimate**: 4h | **File**: `apps/web/app/lab/create/page.tsx`
  - **Depends on**: T062, T073

### Lab Creation Page Assembly
- [ ] **T086** [P0] Refactor LabCreationPage component
  - Back button to navigate to Labs page
  - LabMetadataForm at top
  - PageNavigator below metadata
  - Current page editor area (Question + Diagram)
  - Action buttons: Back, Save as Draft, Next, Publish
  - Max complexity 5
  - **Estimate**: 4h | **File**: `apps/web/app/lab/create/page.tsx`
  - **Depends on**: T075-T085

### Frontend Tests
- [ ] **T087** [P1] Write tests for LabMetadataForm
  - Test validation
  - Test auto-save
  - **Estimate**: 1.5h | **File**: `apps/web/__tests__/components/LabCreation/LabMetadataForm.test.tsx`
  - **Depends on**: T075

- [ ] **T088** [P1] Write tests for QuestionEditor
  - Test question type switching
  - Test option management
  - Test validation
  - **Estimate**: 2h | **File**: `apps/web/__tests__/components/LabCreation/QuestionEditor.test.tsx`
  - **Depends on**: T076

- [ ] **T089** [P1] Write tests for DiagramTestToggle
  - Test toggle behavior
  - **Estimate**: 0.5h | **File**: `apps/web/__tests__/components/LabCreation/DiagramTestToggle.test.tsx`
  - **Depends on**: T077

- [ ] **T090** [P2] Write tests for ShapePalette
  - Test shape rendering
  - Test filtering by architectureType
  - **Estimate**: 1.5h | **File**: `apps/web/__tests__/components/DiagramEditor/ShapePalette.test.tsx`
  - **Depends on**: T078

- [ ] **T091** [P2] Write tests for DiagramCanvas
  - Test shape rendering
  - Test drag-and-drop
  - **Estimate**: 2h | **File**: `apps/web/__tests__/components/DiagramEditor/DiagramCanvas.test.tsx`
  - **Depends on**: T079

- [ ] **T092** [P1] Write tests for PageValidator
  - Test all validation rules
  - Test error messages
  - **Estimate**: 1.5h | **File**: `apps/web/__tests__/utils/PageValidator.test.ts`
  - **Depends on**: T080

- [ ] **T093** [P1] Write tests for LabCreationPage
  - Test page load with draft data
  - Test page navigation
  - Test save operations
  - Test publish flow
  - **Estimate**: 4h | **File**: `apps/web/__tests__/app/lab/create/page.test.tsx`
  - **Depends on**: T086

---

## Phase 9: Integration and Testing

### End-to-End Testing
- [ ] **T094** [P0] E2E test: Create lab draft flow
  - Navigate to Labs page
  - Click "Create New Lab"
  - Fill lab metadata
  - Navigate to creation page
  - Create page with question
  - Save as draft
  - Verify draft in list
  - **Estimate**: 3h | **File**: `apps/web/__tests__/e2e/createLabDraft.test.ts`

- [ ] **T095** [P0] E2E test: Edit and delete draft flow
  - Load Labs page with draft
  - Click Edit on draft
  - Modify lab metadata
  - Save changes
  - Return to Labs page
  - Delete draft
  - Verify deletion
  - **Estimate**: 2.5h | **File**: `apps/web/__tests__/e2e/editDeleteDraft.test.ts`

- [ ] **T096** [P0] E2E test: Publish lab flow
  - Create lab with multiple pages
  - Add questions and diagram tests
  - Validate all pages
  - Click Publish
  - Verify lab status changed
  - **Estimate**: 3h | **File**: `apps/web/__tests__/e2e/publishLab.test.ts`

- [ ] **T097** [P1] E2E test: Validation errors flow
  - Attempt to save page without tests
  - Verify error message
  - Attempt to save empty question
  - Verify error message
  - Attempt to save empty diagram
  - Verify error message
  - **Estimate**: 2h | **File**: `apps/web/__tests__/e2e/validationErrors.test.ts`

- [ ] **T098** [P1] E2E test: Pagination flow
  - Create >3 draft labs
  - Verify pagination controls appear
  - Navigate between pages
  - Verify latest on top
  - **Estimate**: 2h | **File**: `apps/web/__tests__/e2e/pagination.test.ts`

### Performance Testing
- [ ] **T099** [P1] Performance test: Labs page load time
  - Measure page load with 50 labs
  - Target: <2 seconds
  - **Estimate**: 2h

- [ ] **T100** [P1] Performance test: Diagram editor performance
  - Measure rendering time with 20+ shapes
  - Optimize if needed
  - **Estimate**: 3h

### Code Quality Checks
- [ ] **T101** [P0] Verify cyclomatic complexity ≤ 5
  - Run complexity analysis on all new functions
  - Refactor if complexity > 5
  - **Estimate**: 3h

- [ ] **T102** [P0] Verify no mock data or APIs in codebase
  - Code review of all API client files
  - Search for "mock" keyword
  - Verify all APIs connect to real backend
  - **Estimate**: 2h

- [ ] **T103** [P0] Verify code coverage targets
  - Backend: >80% coverage
  - Frontend: >70% coverage
  - Write additional tests if needed
  - **Estimate**: 4h

### Accessibility Testing
- [ ] **T104** [P1] Accessibility test: Keyboard navigation
  - Test all forms with keyboard only
  - Test modal dialogs
  - Test pagination controls
  - **Estimate**: 2h

- [ ] **T105** [P1] Accessibility test: Screen reader compatibility
  - Test with NVDA/JAWS
  - Add ARIA labels where needed
  - **Estimate**: 2h

### Security Testing
- [ ] **T106** [P0] Security test: Authentication flows
  - Test protected routes
  - Test token expiration
  - **Estimate**: 2h

- [ ] **T107** [P0] Security test: Authorization (RBAC)
  - Test instructor-only operations
  - Test student cannot create/edit/delete labs
  - **Estimate**: 2h

- [ ] **T108** [P1] Security test: Input validation
  - Test XSS prevention
  - Test SQL injection prevention (MongoDB)
  - **Estimate**: 2h

---

## Phase 10: Documentation and Deployment

### Documentation
- [ ] **T109** [P1] Update README with new features
  - Document Labs page functionality
  - Document lab creation workflow
  - **Estimate**: 2h | **File**: `README.md`

- [ ] **T110** [P1] Create API documentation
  - Document all new endpoints
  - Include request/response examples
  - **Estimate**: 3h | **File**: `docs/api/labs.md`

- [ ] **T111** [P2] Create user guide for instructors
  - How to create labs
  - How to manage drafts
  - How to publish labs
  - **Estimate**: 3h | **File**: `docs/guides/instructor-guide.md`

### Deployment Preparation
- [ ] **T112** [P0] Configure environment variables
  - MongoDB connection string
  - OAuth2 configuration
  - API base URLs
  - **Estimate**: 1h | **File**: `.env.example`

- [ ] **T113** [P0] Create database migration scripts
  - Add indexes to MongoDB collections
  - Seed DiagramShape data
  - **Estimate**: 2h | **File**: `apps/whatsnxt-bff/migrations/`

- [ ] **T114** [P1] Update Docker configuration
  - Update Dockerfile for backend
  - Update docker-compose.yml
  - **Estimate**: 2h | **File**: `docker/`

### Deployment
- [ ] **T115** [P0] Deploy backend to staging
  - Build backend
  - Deploy to staging environment
  - Run smoke tests
  - **Estimate**: 2h

- [ ] **T116** [P0] Deploy frontend to staging
  - Build frontend
  - Deploy to staging environment
  - Run smoke tests
  - **Estimate**: 2h

- [ ] **T117** [P0] Staging verification
  - Test all user flows in staging
  - Test with real data
  - **Estimate**: 3h

- [ ] **T118** [P0] Deploy to production
  - Deploy backend to production
  - Deploy frontend to production
  - Run smoke tests
  - Monitor for errors
  - **Estimate**: 3h

### Monitoring Setup
- [ ] **T119** [P0] Configure Winston logs integration
  - Setup log aggregation service
  - Configure log levels
  - **Estimate**: 2h

- [ ] **T120** [P0] Setup error alerting
  - Configure alerts for 5xx errors
  - Configure alerts for failed validations
  - **Estimate**: 1.5h

- [ ] **T121** [P1] Setup performance monitoring
  - Monitor API response times
  - Monitor page load times
  - **Estimate**: 2h

- [ ] **T122** [P1] Post-deployment verification
  - Test all user flows in production
  - Monitor error rates
  - Gather initial user feedback
  - **Estimate**: 4h

---

## Task Summary

### By Phase
- **Phase 0 (Research)**: 9 tasks
- **Phase 1 (Design)**: 3 tasks
- **Phase 2 (Backend Types/Models)**: 11 tasks
- **Phase 3 (Backend Services)**: 5 tasks
- **Phase 4 (Backend Routes)**: 18 tasks
- **Phase 5 (Backend Tests)**: 8 tasks
- **Phase 6 (Diagram Shapes)**: 10 tasks
- **Phase 7 (Labs Page)**: 12 tasks
- **Phase 8 (Lab Creation)**: 21 tasks
- **Phase 9 (Integration)**: 16 tasks
- **Phase 10 (Docs & Deploy)**: 14 tasks

**Total**: 127 tasks

### By Priority
- **P0 (Critical)**: 77 tasks
- **P1 (High)**: 35 tasks
- **P2 (Medium)**: 15 tasks

### Estimated Time
- **Total estimated hours**: ~310 hours
- **Estimated weeks (40h/week)**: ~7.75 weeks
- **Estimated weeks (with 20% buffer)**: ~9.5 weeks

---

## Dependencies Graph

### Critical Path
```
T001-T006 (Research)
  → T010-T012 (Design)
    → T013-T023 (Types & Models)
      → T024-T028 (Services)
        → T029-T042 (Routes & Middleware)
          → T062 (API Client)
            → T063-T067 (Labs Page)
            → T073-T086 (Lab Creation Page)
              → T094-T098 (E2E Tests)
                → T115-T118 (Deployment)
```

### Parallel Work Opportunities
- **Backend Services** (T024-T028) can be developed in parallel
- **Backend Routes** (T033-T042) can be developed in parallel after services
- **Backend Unit Tests** (T043-T047) can run parallel with route development
- **Diagram Shape Packages** (T051-T059) can be developed independently
- **Frontend Components** (T063-T066, T075-T079) can be developed in parallel
- **Frontend Tests** (T068-T072, T087-T093) can run parallel with component development

---

## Notes

1. **No Mock Data**: All tasks must use real backend APIs. Tasks T003 and T062 specifically address removing mock implementations.

2. **Cyclomatic Complexity**: All functions must maintain complexity ≤ 5. Task T101 verifies this requirement.

3. **Diagram Shape Separation**: Tasks T051-T060 implement proper architectural separation of shapes.

4. **Validation at Multiple Layers**: Validation occurs at:
   - Frontend (T080)
   - Backend middleware (T030)
   - Backend services (T024)
   - Database models (T019-T023)

5. **TypeScript Conversion**: Task T016 handles converting existing JavaScript files to TypeScript before adding new logic.

6. **Testing Coverage**:
   - Backend target: >80% (verified in T103)
   - Frontend target: >70% (verified in T103)

7. **SOLID Principles**: All new code follows SOLID principles with services separated by responsibility and max complexity enforced.
