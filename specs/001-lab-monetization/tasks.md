# Tasks: Lab Monetization System

**Feature Branch**: `001-lab-monetization`  
**Date**: 2025-12-18  
**Input**: Design documents from `/specs/001-lab-monetization/`

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All tasks include exact file paths

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize project structure and foundational dependencies

- [X] T001 Create lab monetization feature branch from main
- [X] T002 [P] Add MongoDB schema validation for labs.pricing field in database setup
- [X] T003 [P] Create lab_purchases collection with indexes in database setup
- [X] T004 [P] Create transactions collection with indexes in database setup
- [X] T005 [P] Configure Razorpay test credentials in apps/whatsnxt-bff/.env.local
- [X] T006 [P] Add Razorpay public key to apps/web/.env.local
- [X] T007 [P] Create shared TypeScript types in packages/core-types/src/LabPricing.ts
- [X] T008 [P] Create shared TypeScript types in packages/core-types/src/Purchase.ts
- [X] T009 [P] Create shared TypeScript types in packages/core-types/src/Transaction.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Create Lab model extension with pricing field in apps/whatsnxt-bff/src/models/Lab.ts
- [X] T011 [P] Create LabPurchase model in apps/whatsnxt-bff/src/models/LabPurchase.ts
- [X] T012 [P] Create Transaction model in apps/whatsnxt-bff/src/models/Transaction.ts
- [X] T013 Implement accessControlService.canAccessLab in apps/whatsnxt-bff/src/services/accessControlService.ts
- [X] T014 [P] Implement access control middleware in apps/whatsnxt-bff/src/middleware/accessControl.ts
- [X] T015 [P] Implement paymentGatewayService with Razorpay integration in apps/whatsnxt-bff/src/services/paymentGatewayService.ts
- [X] T016 [P] Create lab pricing service skeleton in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T017 [P] Create purchase service skeleton in apps/whatsnxt-bff/src/services/purchaseService.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instructor Sets Free Lab Pricing (Priority: P1) 🎯 MVP

**Goal**: Enable instructors to create labs with "Free" pricing option, allowing students to access content without payment barriers

**Independent Test**: Create a lab with "Free" pricing selected, publish it, verify students can access without purchase prompts

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement setPricing method for free labs in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T019 [P] [US1] Implement getPricing method in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T020 [US1] Create PUT /labs/:labId/pricing endpoint in apps/whatsnxt-bff/src/routes/labPricing.ts
- [X] T021 [US1] Create GET /labs/:labId/pricing endpoint in apps/whatsnxt-bff/src/routes/labPricing.ts
- [X] T022 [US1] Register labPricing routes in apps/whatsnxt-bff/src/app.ts
- [X] T023 [P] [US1] Create LabPricingForm component in apps/web/src/components/lab/LabPricingForm.tsx
- [ ] T024 [US1] Add pricing selection to lab creation flow in apps/web/src/pages/labs/create.tsx
- [X] T025 [P] [US1] Create LabAccessButton component for free labs in apps/web/src/components/lab/LabAccessButton.tsx
- [ ] T026 [US1] Update lab detail page to show access button in apps/web/src/pages/labs/[id].tsx
- [X] T027 [US1] Add pricing API client methods in apps/web/src/services/labPricingService.ts

**Checkpoint**: User Story 1 complete - instructors can create free labs, students can access them

---

## Phase 4: User Story 2 - Instructor Sets Paid Lab Pricing (Priority: P2)

**Goal**: Enable instructors to set paid pricing with validation (₹10-₹100,000 range)

**Independent Test**: Create a lab with "Paid" option, enter valid price, verify lab saves with correct pricing metadata

### Implementation for User Story 2

- [X] T028 [US2] Add price validation logic to labPricingService.setPricing in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T029 [US2] Implement validation rules (min ₹10, max ₹100,000) in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T030 [US2] Add price field validation to PUT /labs/:labId/pricing endpoint in apps/whatsnxt-bff/src/routes/labPricing.ts
- [X] T031 [US2] Add paid pricing UI to LabPricingForm component in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T032 [US2] Implement price input validation in LabPricingForm in apps/web/src/components/lab/LabPricingForm.tsx
- [X] T033 [US2] Add error messaging for invalid prices in apps/web/src/components/lab/LabPricingForm.tsx
- [ ] T034 [US2] Update lab creation flow to handle paid pricing in apps/web/src/pages/labs/create.tsx

**Checkpoint**: User Story 2 complete - instructors can set paid lab pricing with validation

---

## Phase 5: User Story 3 - Student Purchases a Paid Lab (Priority: P3)

**Goal**: Enable students to purchase paid labs via Razorpay and gain access upon successful payment

**Independent Test**: Student views paid lab, clicks purchase, completes payment, verifies access is granted

### Implementation for User Story 3

- [X] T035 [US3] Implement initiatePurchase method in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T036 [US3] Implement verifyPurchase method in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T037 [US3] Implement createPurchaseRecord method in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T038 [US3] Implement createTransaction method in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T039 [US3] Create POST /labs/:labId/purchase/initiate endpoint in apps/whatsnxt-bff/src/routes/labPurchase.ts
- [X] T040 [US3] Create POST /labs/:labId/purchase/verify endpoint in apps/whatsnxt-bff/src/routes/labPurchase.ts
- [X] T041 [US3] Create GET /labs/:labId/access endpoint in apps/whatsnxt-bff/src/routes/labPurchase.ts
- [X] T042 [US3] Register labPurchase routes in apps/whatsnxt-bff/src/app.ts
- [X] T043 [P] [US3] Create LabPurchaseButton component in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T044 [P] [US3] Implement Razorpay modal integration in apps/web/src/services/paymentService.ts
- [X] T045 [US3] Add purchase API client methods in apps/web/src/services/labPricingService.ts
- [ ] T046 [US3] Update lab detail page to show purchase button for paid labs in apps/web/src/pages/labs/[id].tsx
- [ ] T047 [US3] Implement payment success callback handling in apps/web/src/pages/labs/[id].tsx
- [X] T048 [US3] Implement payment failure/cancellation handling in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T049 [US3] Create POST /webhooks/razorpay webhook endpoint in apps/whatsnxt-bff/src/routes/paymentCallback.ts
- [X] T050 [US3] Implement signature verification in webhook handler in apps/whatsnxt-bff/src/routes/paymentCallback.ts
- [X] T051 [US3] Implement idempotent transaction handling in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T052 [US3] Register payment webhook route in apps/whatsnxt-bff/src/app.ts

**Checkpoint**: User Story 3 complete - students can purchase paid labs and gain access

---

## Phase 6: User Story 4 - Course Enrollment Grants Lab Access (Priority: P4)

**Goal**: Students enrolled in courses automatically receive access to all included labs without separate purchase

**Independent Test**: Enroll student in course containing paid labs, verify they can access labs without purchase prompts

### Implementation for User Story 4

- [X] T053 [US4] Extend canAccessLab to check course enrollment in apps/whatsnxt-bff/src/services/accessControlService.ts
- [X] T054 [US4] Add course-lab relationship query logic in apps/whatsnxt-bff/src/services/accessControlService.ts
- [X] T055 [US4] Update GET /labs/:labId/access to return access reason in apps/whatsnxt-bff/src/routes/labPurchase.ts
- [X] T056 [US4] Update LabAccessButton to show course-based access in apps/web/src/components/lab/LabAccessButton.tsx
- [ ] T057 [US4] Update lab detail page to handle course enrollment access in apps/web/src/pages/labs/[id].tsx

**Checkpoint**: User Story 4 complete - course enrollment grants lab access seamlessly

---

## Phase 7: User Story 5 - Instructor Updates Lab Pricing (Priority: P5)

**Goal**: Instructors can update prices with constraints (cannot change paid to free if purchases exist)

**Independent Test**: Update lab price, verify new purchases use new price, existing purchasers retain access

### Implementation for User Story 5

- [X] T058 [US5] Implement validatePricingUpdate method in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T059 [US5] Implement paid-to-free conversion check in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T060 [US5] Implement free-to-paid conversion with grandfathering in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T061 [US5] Update PUT /labs/:labId/pricing to include validation in apps/whatsnxt-bff/src/routes/labPricing.ts
- [ ] T062 [US5] Add pricing update UI to lab edit page in apps/web/src/pages/labs/[id]/edit.tsx
- [X] T063 [US5] Implement validation error messages in LabPricingForm in apps/web/src/components/lab/LabPricingForm.tsx
- [ ] T064 [US5] Add confirmation dialog for free-to-paid conversion in apps/web/src/components/lab/LabPricingForm.tsx

**Checkpoint**: User Story 5 complete - instructors can update pricing with proper constraints

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories

- [X] T065 [P] Implement Redis caching for access checks in apps/whatsnxt-bff/src/services/accessControlService.ts
- [X] T066 [P] Add cache invalidation on pricing updates in apps/whatsnxt-bff/src/services/labPricingService.ts
- [X] T067 [P] Add cache invalidation on purchases in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T068 [P] Add structured logging for payment operations in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T069 [P] Add error tracking for failed transactions in apps/whatsnxt-bff/src/services/purchaseService.ts
- [X] T070 [P] Implement currency formatting utility in packages/core-util/src/currency.ts
- [X] T071 Add user-friendly error messages for payment failures in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T072 [P] Add loading states to LabPurchaseButton in apps/web/src/components/lab/LabPurchaseButton.tsx
- [X] T073 [P] Add loading states to LabAccessButton in apps/web/src/components/lab/LabAccessButton.tsx
- [ ] T074 Document API endpoints in apps/whatsnxt-bff/README.md
- [ ] T075 Update quickstart.md with final setup instructions in specs/001-lab-monetization/quickstart.md
- [ ] T076 Run quickstart.md validation to verify all setup steps work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Can proceed independently
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) - Can proceed independently or after US1
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) and User Story 2 (needs paid pricing) - Can proceed after US2
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) and User Story 3 (needs purchase flow) - Can proceed after US3
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) and User Story 2 (needs pricing updates) - Can proceed after US2
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start after Foundational
- **User Story 2 (P2)**: Builds on US1 pricing framework - can start after US1 or independently
- **User Story 3 (P3)**: Requires US2 (paid pricing must exist) - start after US2
- **User Story 4 (P4)**: Requires US3 (access control must handle purchases) - start after US3
- **User Story 5 (P5)**: Requires US2 (pricing updates extend paid pricing) - start after US2

### Within Each User Story

- Backend services before API routes
- API routes before frontend components
- Core components before page integration
- Story implementation complete before moving to next priority

### Parallel Opportunities

#### Phase 1: Setup
- Tasks T002-T004 (database setup) can run in parallel
- Tasks T005-T006 (Razorpay config) can run in parallel
- Tasks T007-T009 (shared types) can run in parallel

#### Phase 2: Foundational
- Tasks T011-T012 (models) can run in parallel
- Tasks T014-T017 (services and middleware) can run in parallel after models

#### Phase 3: User Story 1
- Tasks T018-T019 (service methods) can run in parallel
- Tasks T023, T025 (frontend components) can run in parallel after backend API is ready

#### Phase 5: User Story 3
- Tasks T043-T044 (frontend components and payment service) can run in parallel after backend API

#### Phase 8: Polish
- Most polish tasks (T065-T073) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend services (parallel):
Task T018: "Implement setPricing method for free labs in apps/whatsnxt-bff/src/services/labPricingService.ts"
Task T019: "Implement getPricing method in apps/whatsnxt-bff/src/services/labPricingService.ts"

# Frontend components (parallel, after backend):
Task T023: "Create LabPricingForm component in apps/web/src/components/lab/LabPricingForm.tsx"
Task T025: "Create LabAccessButton component for free labs in apps/web/src/components/lab/LabAccessButton.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Backend services (sequential - dependencies):
Task T035 → T036 → T037 → T038

# Frontend components (parallel, after backend API):
Task T043: "Create LabPurchaseButton component in apps/web/src/components/lab/LabPurchaseButton.tsx"
Task T044: "Implement Razorpay modal integration in apps/web/src/services/paymentService.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T017) - CRITICAL
3. Complete Phase 3: User Story 1 (T018-T027)
4. **STOP and VALIDATE**: Test free lab creation and access end-to-end
5. Deploy/demo if ready - instructors can publish free labs

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Core infrastructure
2. **MVP** (Phase 3): Free labs → Deploy ✅
3. **Monetization** (Phases 4-5): Paid pricing + Purchase flow → Deploy ✅
4. **Course Integration** (Phase 6): Course enrollment access → Deploy ✅
5. **Management** (Phase 7): Pricing updates → Deploy ✅
6. **Polish** (Phase 8): Caching, error handling, documentation

### Parallel Team Strategy

With 2-3 developers after Foundational phase completes:

- **Developer A**: User Story 1 (free labs)
- **Developer B**: User Story 2 (paid pricing)
- **Developer C**: Start on User Story 3 after Developer B completes US2

Or prioritized sequential:
1. All devs: Setup + Foundational
2. Focus: US1 → US2 → US3 → US4 → US5
3. Each story validates independently before next

---

## Task Count Summary

- **Total Tasks**: 76
- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 8 tasks (BLOCKING)
- **Phase 3 (US1 - Free Labs)**: 10 tasks
- **Phase 4 (US2 - Paid Pricing)**: 7 tasks
- **Phase 5 (US3 - Purchase Flow)**: 18 tasks
- **Phase 6 (US4 - Course Access)**: 5 tasks
- **Phase 7 (US5 - Pricing Updates)**: 7 tasks
- **Phase 8 (Polish)**: 12 tasks

**Parallel Tasks**: 26 tasks marked [P] can run in parallel with others

**MVP Scope** (Recommended for first release):
- Phases 1-3 only (27 tasks)
- Delivers: Free lab creation and access
- Independent validation possible
- Immediate value to instructors and students

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks = different files, no dependencies within same phase
- [Story] labels (US1-US5) map directly to user stories in spec.md
- Each user story independently deliverable and testable
- Tests are NOT included (not requested in spec)
- Stop at any checkpoint to validate story independently
- Razorpay test mode credentials used throughout development
- MongoDB schema validation enforces pricing constraints at database level
