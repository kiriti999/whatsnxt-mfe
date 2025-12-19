# Tasks: Lab Monetization System

**Feature**: 001-lab-monetization  
**Input**: Design documents from `/specs/001-lab-monetization/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are NOT requested in feature specification - tasks focus on implementation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with:
- **Backend**: `apps/whatsnxt-bff/app/` (Express.js BFF)
- **Frontend**: `apps/web/src/` (Next.js)
- **Shared Packages**: `packages/` (TypeScript types, errors, constants)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify MongoDB collections exist (labs, courses, enrolledCourses, users)
- [X] T002 Create lab_purchases collection with compound indexes in MongoDB
- [X] T003 Create transactions collection with indexes in MongoDB
- [X] T004 [P] Add pricing validation schema to labs collection in MongoDB
- [X] T005 [P] Create shared TypeScript types in packages/@whatsnxt/core-types/src/LabPricing.ts
- [X] T006 [P] Create shared TypeScript types in packages/@whatsnxt/core-types/src/Purchase.ts
- [X] T007 [P] Create shared TypeScript types in packages/@whatsnxt/core-types/src/Transaction.ts
- [X] T008 [P] Create custom error classes in packages/@whatsnxt/errors/src/lab/LabPricingError.ts
- [X] T009 [P] Create custom error classes in packages/@whatsnxt/errors/src/lab/LabPurchaseError.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Extend existing Lab model with pricing field in apps/whatsnxt-bff/app/models/lab/Lab.ts
- [X] T011 [P] Create LabPurchase model in apps/whatsnxt-bff/app/models/LabPurchase.ts
- [X] T012 [P] Create Transaction model in apps/whatsnxt-bff/app/models/Transaction.ts
- [X] T013 Create accessControlService with canAccessLab function in apps/whatsnxt-bff/app/services/accessControlService.ts
- [X] T014 [P] Create paymentGatewayService extending existing Razorpay controller in apps/whatsnxt-bff/app/services/paymentGatewayService.ts
- [X] T015 [P] Create Joi validation schemas for pricing requests in apps/whatsnxt-bff/app/validators/labPricingValidator.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instructor Sets Free Lab Pricing (Priority: P1) 🎯 MVP

**Goal**: Enable instructors to designate labs as free, allowing students immediate access without payment

**Independent Test**: Create a lab with "Free" pricing option, publish it, and verify students can access it without purchase prompts

### Implementation for User Story 1

- [X] T016 [US1] Create labPricingService with setFreePricing method in apps/whatsnxt-bff/app/services/labPricingService.ts
- [X] T017 [US1] Create PUT /api/labs/:labId/pricing endpoint for free labs in apps/whatsnxt-bff/app/routes/labPricing.routes.ts
- [X] T018 [US1] Create GET /api/labs/:labId/pricing endpoint in apps/whatsnxt-bff/app/routes/labPricing.routes.ts
- [X] T019 [US1] Create GET /api/labs/:labId/access endpoint using accessControlService in apps/whatsnxt-bff/app/routes/labAccess.routes.ts
- [X] T020 [US1] Create LabPricingForm component with Free/Paid toggle in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T021 [US1] Create LabAccessButton component showing "Access Lab" for free labs in apps/web/src/components/lab/LabAccessButton.tsx
- [X] T022 [US1] Integrate LabPricingForm into lab creation page in apps/web/src/pages/labs/create.tsx
- [X] T023 [US1] Integrate LabAccessButton into lab detail page in apps/web/src/pages/labs/[id].tsx

**Checkpoint**: At this point, instructors can create free labs and students can access them immediately - MVP is deliverable!

---

## Phase 4: User Story 2 - Instructor Sets Paid Lab Pricing (Priority: P2)

**Goal**: Enable instructors to set paid pricing for labs, creating revenue opportunities

**Independent Test**: Create a lab with "Paid" option, enter a valid price (₹10-₹100,000), and verify the lab is saved with correct pricing metadata

### Implementation for User Story 2

- [X] T024 [US2] Add setPaidPricing method to labPricingService in apps/whatsnxt-bff/app/services/labPricingService.ts
- [X] T025 [US2] Update PUT /api/labs/:labId/pricing endpoint to handle paid pricing with validation in apps/whatsnxt-bff/app/routes/labPricing.routes.ts
- [X] T026 [US2] Add price input field with validation (min ₹10, max ₹100,000) to LabPricingForm in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T027 [US2] Add currency display (₹) and validation feedback to LabPricingForm in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T028 [US2] Update LabAccessButton to show "Purchase for ₹{price}" for paid labs in apps/web/src/components/lab/LabAccessButton.tsx

**Checkpoint**: At this point, instructors can create both free AND paid labs with proper validation

---

## Phase 5: User Story 3 - Student Purchases a Paid Lab (Priority: P3)

**Goal**: Enable students to purchase paid labs through Razorpay and gain access upon successful payment

**Independent Test**: Have a student view a paid lab, click purchase button, complete payment, and verify access is granted

### Implementation for User Story 3

- [X] T029 [US3] Create purchaseService with initiatePurchase method in apps/whatsnxt-bff/app/services/purchaseService.ts
- [X] T030 [US3] Create verifyPayment method in purchaseService in apps/whatsnxt-bff/app/services/purchaseService.ts
- [X] T031 [US3] Create POST /api/labs/:labId/purchase/initiate endpoint (creates Razorpay order) in apps/whatsnxt-bff/app/routes/labPurchase.routes.ts
- [X] T032 [US3] Create POST /api/labs/:labId/purchase/verify endpoint (verifies payment signature) in apps/whatsnxt-bff/app/routes/labPurchase.routes.ts
- [X] T033 [US3] Create POST /api/webhooks/razorpay endpoint for payment callbacks in apps/whatsnxt-bff/app/routes/paymentCallback.routes.ts
- [X] T034 [US3] Implement webhook signature verification in paymentCallback handler in apps/whatsnxt-bff/app/routes/paymentCallback.routes.ts
- [X] T035 [US3] Implement idempotent purchase record creation using transactionId in purchaseService in apps/whatsnxt-bff/app/services/purchaseService.ts
- [X] T036 [US3] Create LabPurchaseButton component with Razorpay modal integration in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T037 [US3] Add payment success/failure notifications using Mantine in LabPurchaseButton in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T038 [US3] Update LabAccessButton to conditionally render Purchase or Access button in apps/web/src/components/lab/LabAccessButton.tsx
- [X] T039 [US3] Create paymentService API client for frontend in apps/web/src/services/paymentService.ts

**Checkpoint**: Full purchase flow is operational - students can buy labs and instructors receive revenue

---

## Phase 6: User Story 4 - Course Enrollment Grants Lab Access (Priority: P4)

**Goal**: Automatically grant lab access to students enrolled in courses containing those labs

**Independent Test**: Enroll a student in a course containing paid labs and verify they can access those labs without separate purchase prompts

### Implementation for User Story 4

- [X] T040 [US4] Add checkCourseEnrollmentAccess method to accessControlService in apps/whatsnxt-bff/app/services/accessControlService.ts
- [X] T041 [US4] Update canAccessLab function to check course enrollment in accessControlService in apps/whatsnxt-bff/app/services/accessControlService.ts
- [X] T042 [US4] Update GET /api/labs/:labId/access endpoint response to include access reason (purchased/enrolled/free) in apps/whatsnxt-bff/app/routes/labAccess.routes.ts
- [X] T043 [US4] Update LabAccessButton to display enrollment-based access indicator in apps/web/src/components/lab/LabAccessButton.tsx

**Checkpoint**: Course-based bundling is working - students enrolled in courses get automatic lab access

---

## Phase 7: User Story 5 - Instructor Updates Lab Pricing (Priority: P5)

**Goal**: Allow instructors to update lab prices with grandfathering and validation constraints

**Independent Test**: Update a lab's price, verify new purchases use new price, and confirm existing purchasers retain access

### Implementation for User Story 5

- [X] T044 [US5] Add updatePricing method with validation to labPricingService in apps/whatsnxt-bff/app/services/labPricingService.ts
- [X] T045 [US5] Add checkExistingPurchases validation in labPricingService (prevent paid-to-free if purchases exist) in apps/whatsnxt-bff/app/services/labPricingService.ts
- [X] T046 [US5] Add grandfatherExistingAccess method for free-to-paid conversions in labPricingService in apps/whatsnxt-bff/app/services/labPricingService.ts
- [X] T047 [US5] Update PUT /api/labs/:labId/pricing endpoint to handle price updates with constraints in apps/whatsnxt-bff/app/routes/labPricing.routes.ts
- [X] T048 [US5] Add price update capability to LabPricingForm with constraint validation feedback in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T049 [US5] Create edit pricing page or modal in apps/web/src/pages/labs/[id]/edit.tsx

**Checkpoint**: Instructors can adjust pricing with proper business rule enforcement

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T050 [P] Add caching for lab pricing metadata (5-min TTL) using Redis in apps/whatsnxt-bff/app/services/accessControlService.ts
- [X] T051 [P] Add caching for access control checks (5-min TTL) in apps/whatsnxt-bff/app/services/accessControlService.ts
- [X] T052 [P] Add comprehensive error logging for payment failures in apps/whatsnxt-bff/app/services/purchaseService.ts
- [X] T053 [P] Add transaction audit logging for all payment attempts in apps/whatsnxt-bff/app/services/purchaseService.ts
- [X] T054 [P] Add loading states and skeleton loaders to LabAccessButton in apps/web/src/components/lab/LabAccessButton.tsx
- [X] T055 [P] Add loading states to LabPurchaseButton during payment in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T056 [P] Update API documentation with OpenAPI spec in apps/whatsnxt-bff/docs/api-spec.yaml
- [X] T057 Run quickstart.md validation scenarios to verify all flows work end-to-end
- [X] T058 [P] Add monitoring alerts for payment callback failures
- [X] T059 [P] Add analytics tracking for purchase events and conversion rates

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories ✅ MVP
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable
- **User Story 3 (P3)**: Depends on US2 (needs paid pricing to exist) - Full monetization enabled
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of purchase flow
- **User Story 5 (P5)**: Depends on US2 and US3 (needs pricing and purchases to exist) - Management feature

### Within Each User Story

- Backend services before API endpoints
- API endpoints before frontend components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: T005, T006, T007 (type definitions) + T008, T009 (error classes) can all run in parallel
- **Foundational Phase**: T011, T012 (models) + T014, T015 (services/validators) can run in parallel
- **User Story 1**: T016 service + T020, T021 frontend components can run in parallel after endpoints exist
- **User Story 2**: Frontend updates (T026, T027, T028) can run in parallel
- **User Story 3**: Backend endpoints (T031, T032, T033) can run in parallel before frontend
- **Polish Phase**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Foundational phase is complete, these can start in parallel:

# Backend team:
Task T016: "Create labPricingService with setFreePricing method"
Task T017: "Create PUT /api/labs/:labId/pricing endpoint"
Task T018: "Create GET /api/labs/:labId/pricing endpoint"
Task T019: "Create GET /api/labs/:labId/access endpoint"

# Once endpoints are ready, frontend can proceed in parallel:
Task T020: "Create LabPricingForm component"
Task T021: "Create LabAccessButton component"

# Integration tasks (sequential):
Task T022: "Integrate LabPricingForm into lab creation page"
Task T023: "Integrate LabAccessButton into lab detail page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended for Initial Launch

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T015)
3. Complete Phase 3: User Story 1 (T016-T023)
4. **STOP and VALIDATE**: Test free lab creation and access independently
5. Deploy/demo MVP - instructors can share free educational content

**Value Delivered**: Instructors can publish free labs, students can access them - foundational monetization framework operational

### Incremental Delivery (Recommended Approach)

1. **Sprint 1**: Setup + Foundational (T001-T015) → Foundation ready
2. **Sprint 2**: User Story 1 (T016-T023) → Test independently → Deploy MVP (free labs)
3. **Sprint 3**: User Story 2 (T024-T028) → Test independently → Deploy (paid lab setup)
4. **Sprint 4**: User Story 3 (T029-T039) → Test independently → Deploy (revenue generation enabled!)
5. **Sprint 5**: User Story 4 (T040-T043) → Test independently → Deploy (course bundling)
6. **Sprint 6**: User Story 5 (T044-T049) → Test independently → Deploy (price management)
7. **Sprint 7**: Polish (T050-T059) → Production hardening

Each sprint adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **All team**: Complete Setup + Foundational together (critical foundation)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (free lab MVP)
   - Developer B: User Story 2 (paid lab setup)
   - After US2 complete → Developer B starts US3 (purchase flow)
   - Developer C: User Story 4 (course integration) - can start in parallel
3. **Sequential**: User Story 5 requires US2 + US3 complete
4. **All team**: Polish phase tasks can be distributed in parallel

---

## Task Statistics

- **Total Tasks**: 59
- **Setup Phase**: 9 tasks
- **Foundational Phase**: 6 tasks (BLOCKS all stories)
- **User Story 1 (MVP)**: 8 tasks
- **User Story 2**: 5 tasks
- **User Story 3**: 11 tasks (most complex - full payment flow)
- **User Story 4**: 4 tasks
- **User Story 5**: 6 tasks
- **Polish**: 10 tasks

**Parallel Tasks**: 24 tasks marked [P] can run in parallel with other tasks  
**MVP Completion**: 23 tasks total (Setup + Foundational + US1)  
**Full Feature Completion**: 59 tasks total

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Razorpay Test Mode**: Use test credentials for all development work
- **Idempotency**: Transaction IDs ensure duplicate webhooks don't create duplicate purchases
- **Security**: All payment callbacks MUST verify Razorpay signatures
- **Grandfathering**: Free-to-paid conversions preserve access for existing students automatically
