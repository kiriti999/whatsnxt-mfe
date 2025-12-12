# Implementation Plan: Lab Diagram Tests

**Branch**: `001-lab-diagram-test` | **Date**: 2025-12-12 | **Spec**: /specs/001-lab-diagram-test/spec.md
**Input**: Feature specification from `/specs/001-lab-diagram-test/spec.md`

## Summary

This feature enables instructors to manage labs through a comprehensive workflow: viewing, creating, editing, and deleting lab drafts from a Labs page, then creating multi-page labs with standard questions (MCQ, text) and interactive diagramming exercises. The Labs page displays all labs with title, description, Lab type, and Architecture type, with draft labs shown in paginated format (3 per page, latest first). Each draft has Edit and Delete buttons. The lab creation page includes metadata fields (name, description, labType, architectureType), a toggle for diagram tests, question editor, and validation preventing empty tests. The implementation will utilize a Next.js 16 frontend with React 19 and Mantine UI, communicating with a Node.js 24 LTS Express.js 5 backend (`whatsnxt-bff`) storing data in MongoDB. Common diagram shapes must be in a shared package, architecture-specific shapes in separate files. Key technical approaches include UUIDs for entity identification, robust error handling with visual feedback, integration with existing OAuth2/OIDC for authentication/RBAC, retry mechanisms for external service calls, and NO mock data or mock APIs. All new code will adhere to SOLID principles and maintain a maximum cyclomatic complexity of 5. Existing JavaScript files in the `whatsnxt-bff` service will be converted to TypeScript before modification.


## Technical Context

**Language/Version**: TypeScript, Node.js 24 LTS
**Primary Dependencies**: Next.js 16, React 19, Mantine UI, Express.js 5, MongoDB, Vitest, Redis, Redux, React tool kit, Terraform, Docker
**Storage**: MongoDB
**Testing**: Vitest
**Target Platform**: Web (Next.js frontend, Node.js/Express.js backend)
**Project Type**: Web
**Performance Goals**: An instructor can create a multi-page lab with at least one question and one diagram test in under 5 minutes.
**Constraints**: SOLID principles, maximum cyclomatic complexity of 5 for all new functions. UUIDs for entity identification. Clear visual feedback for all states. OAuth2/OIDC, RBAC, data encryption. Retry mechanisms with exponential backoff for external services. NO mock data or mock APIs in any environment. Common diagram shapes in shared package, architecture-specific shapes in separate files. Existing JavaScript (.js) files in `apps/whatsnxt-bff` must be converted to TypeScript (.ts) before modification, and all resulting TypeScript errors must be resolved.
**Scale/Scope**: Moderate (e.g., 100-1000 labs, 10-50 pages/lab, 5-20 questions/diagrams/page)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

-   **I. Code Quality and SOLID Principles**:
    -   **Requirement**: All code MUST adhere to industry best practices, SOLID principles, and a maximum cyclomatic complexity of 5. This includes the transition from JavaScript to TypeScript in the backend for enhanced code quality and maintainability.
    -   **Status**: PASSED (FR-008 explicitly states adherence to SOLID principles and max cyclomatic complexity of 5. The JS to TS conversion aligns with best practices for maintainability and type safety.)
-   **III. User Experience Consistency**:
    -   **Requirement**: UI MUST be built using Mantine UI. Layouts and components MUST be responsive and accessible.
    -   **Status**: PASSED (Implicit in "Show an option to enable diagram test like a toggle button" and standard UI expectations in a Next.js/Mantine project).
-   **IV. Performance Requirements and Shared Packages**:
    -   **Requirement**: Monorepo structure MUST use pnpm workspace, common functionality MUST be extracted into reusable packages in `packages/`, applications MUST reuse existing workspace packages. All interfaces MUST be created in separate files under a `types` folder within the appropriate workspace package.
    -   **Status**: PASSED (Project uses pnpm monorepo. Existing structure dictates use of `packages/` for shared functionality and `types` folders).
-   **V. Monorepo Architecture**:
    -   **Requirement**: App MUST be built using Turbo monorepo, Next.js 16+ (frontend) with React 19, Node.js 24 LTS (runtime), pnpm 10+ (package manager), Webpack (frontend bundling).
    -   **Status**: PASSED (As per `GEMINI.md` and project setup).
-   **VI. API Communication Standards**:
    -   **Requirement**: All backend APIs MUST be built using Express.js version 5. All HTTP communication MUST use the axios client from the `@whatsnxt/http-client` workspace package. All backend applications MUST use Winston for structured logging.
    -   **Status**: PASSED (Clarification and Technical Considerations explicitly mention Express.js 5 for backend and `whatsnxt-bff` service. Assumption of `axios` and `Winston` as per constitution for `whatsnxt-bff`).
-   **IX. Error Handling Standards**:
    -   **Requirement**: All applications MUST use custom error classes from the `@whatsnxt/errors` workspace package.
    -   **Status**: PASSED (Assumption based on project standards for error handling in the `whatsnxt-bff` service).
-   **X. Code Maintainability Standards**:
    -   **Requirement**: All applications MUST use constants from the `@whatsnxt/constants` workspace package.
    -   **Status**: PASSED (Assumption based on project standards for constants in the `whatsnxt-bff` service).
-   **XI. Real Data and API Standards**:
    -   **Requirement**: All applications MUST use real backend APIs and real data sources. Mock APIs, mock data, stub implementations, and hardcoded fake data are strictly PROHIBITED in all environments.
    -   **Status**: PASSED (FR-025 explicitly prohibits mock APIs, mock data, stub implementations, and hardcoded fake data).

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-diagram-test/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── web/  # Frontend Next.js Application
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── utils/
│   ├── hooks/
│   ├── store/
│   └── types/
└── whatsnxt-bff/ # Backend Express.js Application
    ├── app/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── utils/
    │   └── errors/
    ├── config/
    └── tests/

packages/ # Shared packages
├── blogComments/
├── comments/
├── core-ui/
├── core-util/
├── eslint-config/
└── typescript-config/
```

**Structure Decision**: The project will utilize the existing monorepo structure with `apps/web` for the frontend and `apps/whatsnxt-bff` for the backend. Shared components and utilities will reside in `packages/`.
The `apps/whatsnxt-bff` service, while historically a JavaScript project, will undergo conversion of existing `.js` files to `.ts` before new logic is implemented, and all TypeScript errors will be resolved.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | All requirements align with constitution |

## Implementation Phases

### Phase 0: Research and Setup
**Goal**: Understand existing codebase, identify dependencies, and prepare workspace packages.

**Tasks**:
1. **Research existing codebase structure** (`apps/web`, `apps/whatsnxt-bff`, `packages/`)
   - Examine current Labs page implementation in `apps/web/app/labs/page.tsx`
   - Review existing lab creation page in `apps/web/app/lab/create/page.tsx`
   - Analyze current API structure in `apps/web/apis/lab.api.ts`
   - Check existing type definitions in `packages/core-types`
   - Review diagram-core package structure in `packages/diagram-core`

2. **Identify shared packages to create/modify**
   - Verify `@whatsnxt/core-types` exists for Lab, LabPage, Question, DiagramTest, DiagramShape types
   - Check if `@whatsnxt/http-client` is properly configured
   - Verify `@whatsnxt/errors` package exists for error handling
   - Verify `@whatsnxt/constants` package exists for API endpoints and constants
   - Plan creation of `@whatsnxt/diagram-shapes-common` for common shapes
   - Plan creation of architecture-specific shape packages

3. **Review backend structure**
   - Examine `apps/whatsnxt-bff` folder structure
   - Identify JavaScript files that need TypeScript conversion
   - Review MongoDB connection configuration
   - Check existing authentication/authorization setup
   - Review Winston logger configuration

4. **Document findings**
   - Create research.md with findings
   - List all files requiring modification
   - List all new files to be created
   - Identify potential risks or blockers

**Output**: `research.md` file with complete analysis

### Phase 1: Design and Data Model
**Goal**: Create detailed data models, API contracts, and architectural diagrams.

**Tasks**:
1. **Update data model** (Already completed in data-model.md)
   - Lab entity with labType and architectureType fields
   - LabPage entity with validation rules
   - Question entity with validation rules
   - DiagramTest entity with validation rules
   - DiagramShape entity with implementation notes

2. **Update API contract** (Already completed in contracts/lab_api.json)
   - GET /api/v1/labs with pagination
   - POST /api/v1/labs
   - GET /api/v1/labs/:labId
   - PUT /api/v1/labs/:labId
   - DELETE /api/v1/labs/:labId
   - POST /api/v1/labs/:labId/publish
   - POST /api/v1/labs/:labId/pages
   - GET /api/v1/labs/:labId/pages/:pageId
   - PUT /api/v1/labs/:labId/pages/:pageId
   - GET /api/v1/diagram-shapes

3. **Create High-Level Design (HLD)**
   - System architecture diagram
   - Component interaction diagram
   - Data flow diagrams
   - Authentication flow
   - Error handling strategy

4. **Create Low-Level Design (LLD)**
   - Frontend component hierarchy
   - Backend service layer design
   - Database schema and indexes
   - Validation logic design
   - State management design

5. **Create quickstart guide**
   - Development environment setup
   - Running the application
   - Testing procedures
   - API testing examples

**Output**: HLD.md, LLD.md, quickstart.md files

### Phase 2: Backend Implementation
**Goal**: Implement all backend APIs, database models, and business logic.

**Tasks**:
1. **Setup workspace packages**
   - Update `@whatsnxt/core-types` with Lab, LabPage, Question, DiagramTest, DiagramShape interfaces
   - Add labType and architectureType fields to Lab type
   - Add validation types for request/response schemas
   - Create PaginatedResponse generic type

2. **Convert JavaScript to TypeScript in whatsnxt-bff**
   - Convert existing models to TypeScript
   - Convert existing routes to TypeScript
   - Convert existing services to TypeScript
   - Fix all TypeScript errors

3. **Create MongoDB models**
   - Lab model with labType, architectureType, status fields
   - LabPage model with relationships to Lab
   - Question model with type, questionText, options, correctAnswer
   - DiagramTest model with prompt, expectedDiagramState, architectureType
   - DiagramShape model with name, type, architectureType, svgPath
   - Add indexes for performance (labId, status, createdAt, architectureType)

4. **Implement validation middleware**
   - Lab validation: name, labType, architectureType required
   - LabPage validation: at least one test type required
   - Question validation: questionText required, MCQ options validation
   - DiagramTest validation: prompt, expectedDiagramState, at least one shape
   - Custom validation errors with descriptive messages

5. **Implement Lab routes and controllers**
   - POST /api/v1/labs - Create lab with validation
   - GET /api/v1/labs - Get labs with pagination, filtering, sorting
   - GET /api/v1/labs/:labId - Get single lab
   - PUT /api/v1/labs/:labId - Update lab (draft only)
   - DELETE /api/v1/labs/:labId - Delete lab (draft only, with validation)
   - POST /api/v1/labs/:labId/publish - Publish lab with validation

6. **Implement LabPage routes and controllers**
   - POST /api/v1/labs/:labId/pages - Create lab page
   - GET /api/v1/labs/:labId/pages/:pageId - Get lab page
   - PUT /api/v1/labs/:labId/pages/:pageId - Update lab page
   - Validate at least one test type before saving

7. **Implement DiagramShape routes**
   - GET /api/v1/diagram-shapes - Get shapes with architectureType filter
   - Implement caching for shape data

8. **Implement service layer**
   - LabService with CRUD operations, max complexity 5
   - LabPageService with CRUD operations, max complexity 5
   - ValidationService with reusable validation functions, max complexity 5
   - PaginationService with pagination logic, max complexity 5

9. **Implement error handling**
   - Use `@whatsnxt/errors` for custom error classes
   - ValidationError, NotFoundError, UnauthorizedError, ForbiddenError
   - Global error handler middleware
   - Winston logging for all errors

10. **Implement authentication and authorization**
    - Integrate with existing OAuth2/OIDC
    - RBAC middleware for instructor/student roles
    - Protect all routes with authentication
    - Instructor-only routes: create, update, delete, publish

11. **Write backend tests**
    - Unit tests for services (Vitest)
    - Integration tests for routes (Vitest)
    - Test validation logic
    - Test error handling
    - Test authentication/authorization
    - Achieve >80% code coverage

**Output**: Complete backend implementation with tests

### Phase 3: Shared Packages for Diagram Shapes
**Goal**: Create shared packages for diagram shapes following SOLID principles.

**Tasks**:
1. **Create @whatsnxt/diagram-shapes-common package**
   - Package.json setup
   - Common shape definitions (generic server, database, user, etc.)
   - SVG path data for each shape
   - Shape metadata (size, connection points, etc.)
   - Export all common shapes

2. **Create @whatsnxt/diagram-shapes-aws package**
   - Package.json setup
   - AWS-specific shapes (EC2, S3, VPC, Lambda, RDS, etc.)
   - SVG path data for each shape
   - Shape metadata
   - Export all AWS shapes

3. **Create @whatsnxt/diagram-shapes-azure package**
   - Package.json setup
   - Azure-specific shapes (VM, Virtual Network, Storage, Functions, SQL, etc.)
   - SVG path data for each shape
   - Shape metadata
   - Export all Azure shapes

4. **Create @whatsnxt/diagram-shapes-gcp package**
   - Package.json setup
   - GCP-specific shapes (Compute Engine, Cloud Storage, VPC, Cloud Functions, etc.)
   - SVG path data for each shape
   - Shape metadata
   - Export all GCP shapes

5. **Create shape factory/registry**
   - ShapeRegistry in diagram-core package
   - Register shapes by architectureType
   - Provide getShapes(architectureType) function
   - Maintain max complexity 5

**Output**: Four diagram shape packages with proper separation

### Phase 4: Frontend - Labs Page Implementation
**Goal**: Implement the Labs page with listing, pagination, and draft management.

**Tasks**:
1. **Update type definitions**
   - Import types from `@whatsnxt/core-types`
   - Create component-specific types
   - Create API response types with pagination

2. **Implement API client functions**
   - Use `@whatsnxt/http-client` axios instance
   - getLabs(status, page, limit) function
   - createLab(data) function
   - deleteLab(labId) function
   - Use constants from `@whatsnxt/constants` for endpoints

3. **Create LabCard component**
   - Display lab title, description
   - Display Lab type and Architecture type badges
   - Edit button (navigates to lab creation page)
   - Delete button (shows confirmation dialog)
   - Responsive layout
   - Accessibility compliance
   - Max complexity 5

4. **Create LabsList component**
   - Fetch labs with pagination
   - Display labs in grid/list
   - Pagination controls (3 per page)
   - Sort by createdAt descending
   - Loading state with spinner
   - Empty state message
   - Error state with retry
   - Max complexity 5

5. **Create CreateLabModal component**
   - Form for lab metadata (name, description, labType, architectureType)
   - Validation: name, labType, architectureType required
   - Submit creates lab and navigates to creation page
   - Cancel button
   - Error handling
   - Max complexity 5

6. **Create DeleteLabDialog component**
   - Confirmation dialog with lab name
   - Cancel and Confirm buttons
   - Call deleteLab API on confirm
   - Show success notification
   - Handle errors
   - Max complexity 5

7. **Refactor LabsPage component**
   - Use LabsList component
   - "Create New Lab" button opens modal
   - Handle lab creation success
   - Handle lab deletion success
   - Refresh list after operations
   - Max complexity 5

8. **Write frontend tests for Labs page**
   - Unit tests for components (Vitest + React Testing Library)
   - Test rendering, interactions, state changes
   - Test API call mocking (but NO mock data in actual app)
   - Test pagination behavior
   - Test error states
   - Test loading states

**Output**: Complete Labs page with draft management

### Phase 5: Frontend - Lab Creation Page Implementation
**Goal**: Implement the lab creation page with validation and multi-page support.

**Tasks**:
1. **Update LabCreationPage structure**
   - Back button to Labs page
   - Lab metadata form at top (editable)
   - Page navigation (stepper or tabs)
   - Current page editor area
   - Action buttons: Save as Draft, Next, Publish
   - Max complexity 5

2. **Create LabMetadataForm component**
   - Fields: name, description, labType, architectureType
   - Real-time validation
   - Auto-save on blur
   - Error messages
   - Max complexity 5

3. **Create QuestionEditor component (refactor existing)**
   - Question type selector (MCQ, Text)
   - Question text input
   - Options input for MCQ (dynamic list)
   - Correct answer selection
   - Validation: questionText required
   - Max complexity 5

4. **Create DiagramTestToggle component**
   - Switch/toggle to enable diagram test
   - Show/hide diagram editor based on toggle
   - Max complexity 5

5. **Refactor DiagramEditor components**
   - Use shape packages (@whatsnxt/diagram-shapes-*)
   - ShapePalette filtered by architectureType
   - DiagramCanvas for drawing
   - Store diagram state (shapes, connections)
   - Validation: at least one shape required
   - Max complexity 5 per component

6. **Create PageValidator service**
   - Validate at least one test type
   - Validate question if present
   - Validate diagram if present
   - Return descriptive error messages
   - Max complexity 5

7. **Implement page save logic**
   - Save current page on "Next" click
   - Validate before saving
   - Call API to create/update lab page
   - Handle success/error
   - Navigate to next page on success
   - Max complexity 5

8. **Implement draft save logic**
   - "Save as Draft" button
   - Validate all pages
   - Call API to update lab
   - Show success notification
   - Stay on current page
   - Max complexity 5

9. **Implement publish logic**
   - "Publish" button
   - Validate all pages have at least one test
   - Validate no empty tests
   - Confirmation dialog
   - Call API to publish
   - Navigate to Labs page on success
   - Max complexity 5

10. **Implement edit draft logic**
    - Load draft data when labId in URL
    - Pre-fill lab metadata
    - Load existing pages
    - Allow navigation between pages
    - Preserve changes during navigation
    - Max complexity 5

11. **Write frontend tests for Lab Creation page**
    - Unit tests for all components
    - Test validation logic
    - Test save/publish workflows
    - Test page navigation
    - Test error handling
    - Integration tests for complete flows

**Output**: Complete lab creation page with validation

### Phase 6: Integration and Testing
**Goal**: Integrate all components, end-to-end testing, and bug fixes.

**Tasks**:
1. **Integration testing**
   - Test complete user flows from Labs page to publish
   - Test draft creation, editing, deletion
   - Test validation across frontend and backend
   - Test pagination and sorting
   - Test error handling end-to-end

2. **Performance testing**
   - Test page load times
   - Test API response times
   - Test pagination performance
   - Test diagram editor performance
   - Optimize if needed

3. **Accessibility testing**
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA labels
   - Focus management
   - Color contrast

4. **Security testing**
   - Test authentication flows
   - Test authorization (instructor vs student)
   - Test input validation
   - Test SQL injection prevention (MongoDB)
   - Test XSS prevention

5. **Bug fixes and refinements**
   - Fix issues found during testing
   - Refine UI/UX based on feedback
   - Optimize performance bottlenecks
   - Improve error messages

6. **Documentation updates**
   - Update README with new features
   - Document API endpoints
   - Create user guide for instructors
   - Update deployment documentation

**Output**: Fully tested and integrated feature

### Phase 7: Deployment and Monitoring
**Goal**: Deploy to production and set up monitoring.

**Tasks**:
1. **Prepare for deployment**
   - Environment variables configuration
   - Database migrations/seeding
   - Build and bundle optimization
   - Docker configuration updates

2. **Deploy to staging**
   - Deploy backend to staging
   - Deploy frontend to staging
   - Run smoke tests
   - Test with real data

3. **Deploy to production**
   - Deploy backend to production
   - Deploy frontend to production
   - Monitor deployment
   - Verify functionality

4. **Set up monitoring**
   - Winston logs integration with monitoring service
   - Set up error alerts
   - Set up performance monitoring
   - Set up uptime monitoring

5. **Post-deployment verification**
   - Test all user flows in production
   - Monitor error rates
   - Monitor performance metrics
   - Gather user feedback

**Output**: Feature deployed to production with monitoring

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| TypeScript conversion errors in whatsnxt-bff | Medium | High | Convert incrementally, comprehensive testing |
| Diagram editor performance issues | Medium | Medium | Optimize rendering, use canvas virtualization |
| Validation logic complexity > 5 | Medium | Low | Extract to smaller functions, use validation library |
| MongoDB index performance | Low | Medium | Test with production-like data volume, optimize indexes |
| Authentication integration issues | Low | High | Test thoroughly with existing OAuth2 setup |
| Pagination edge cases | Medium | Low | Comprehensive testing of boundary conditions |
| Empty test validation bypassed | Low | High | Multiple validation layers (frontend + backend) |

## Success Metrics

1. **SC-001**: Labs page loads with all data in <2 seconds
2. **SC-002**: Draft pagination works correctly (3 per page, latest first)
3. **SC-003**: Lab creation flow completes in <3 seconds
4. **SC-004**: Edit/Delete operations work with proper feedback
5. **SC-005**: Back button navigation preserves draft data
6. **SC-006**: Complete lab creation in <5 minutes
7. **SC-007**: Validation errors displayed for empty tests
8. **SC-008**: Empty tests prevented from database save (100% validation coverage)
9. **SC-009**: "Next" button saves and navigates correctly
10. **SC-010**: Draft save provides clear feedback
11. **SC-011**: Published labs viewable by students
12. **SC-012**: Diagram shapes properly separated by architecture
13. **SC-013**: No mock data or APIs in codebase (verified by code review)
14. **Code Quality**: All functions have cyclomatic complexity ≤ 5
15. **Test Coverage**: >80% backend coverage, >70% frontend coverage

## Dependencies

### Internal Dependencies
- `@whatsnxt/core-types` - Type definitions
- `@whatsnxt/http-client` - HTTP communication
- `@whatsnxt/errors` - Error handling
- `@whatsnxt/constants` - Constants and API endpoints
- `@whatsnxt/diagram-core` - Diagram state management

### External Dependencies
- Next.js 16 with React 19
- Mantine UI components
- Express.js 5
- MongoDB with Mongoose
- Winston for logging
- Vitest for testing
- React Testing Library

### New Packages to Create
- `@whatsnxt/diagram-shapes-common`
- `@whatsnxt/diagram-shapes-aws`
- `@whatsnxt/diagram-shapes-azure`
- `@whatsnxt/diagram-shapes-gcp`
