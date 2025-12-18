# Implementation Plan: Lab Monetization System

**Branch**: `001-lab-monetization` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lab-monetization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Enable instructors to set pricing (free or paid) for labs when creating them, and allow students to purchase paid labs using Razorpay payment gateway. Students enrolled in courses that include labs automatically receive access without separate purchase. System tracks purchase transactions and enforces access control based on purchase status or course enrollment.

## Technical Context

**Language/Version**: TypeScript (Node.js 24 LTS), React 19, Next.js 16  
**Primary Dependencies**: Next.js 16, React 19, Mantine UI 8.3, Express.js 5.0, MongoDB 7.0, Redux Toolkit 2.8  
**Storage**: MongoDB 7.0 (existing database with Labs, Courses, Users collections)  
**Testing**: NEEDS CLARIFICATION (existing test framework to be identified)  
**Target Platform**: Web application (Next.js frontend at port 3001, Express.js BFF backend)
**Project Type**: Web (monorepo with apps/web frontend and apps/whatsnxt-bff backend)  
**Performance Goals**: Payment callback processing <2s, pricing updates reflected immediately, lab access checks <200ms  
**Constraints**: Razorpay payment gateway integration (existing), Indian Rupees only, price range ₹10-₹100,000, 95%+ payment callback success rate  
**Scale/Scope**: Multi-tenant instructor platform, existing course/lab system to extend, ~10k potential users

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Constitution Status**: Template constitution found - no specific principles defined yet. This project appears to be establishing its constitution. Proceeding with standard web development best practices:

✅ **Modularity**: Lab monetization will be implemented as discrete modules (pricing, purchases, access control)  
✅ **Testing**: Will follow TDD approach as outlined in workflow  
✅ **Integration**: Will require integration tests for payment gateway and course-lab access relationships  
✅ **Minimal Changes**: Extending existing lab system without breaking current functionality  
✅ **Security**: Payment processing via established Razorpay gateway, transaction records for audit trail

**No violations to justify** - Feature aligns with modular web application architecture.

---

**Phase 1 Re-Evaluation** (Post-Design):

✅ **Modularity Maintained**: Design artifacts show clear separation of concerns:
  - Data models isolated (LabPurchase, Transaction separate from Lab)
  - Services layer (pricing, purchase, access control) properly separated
  - API contracts define clear boundaries between frontend/backend

✅ **Testing Strategy Defined**: 
  - Unit tests for services (labPricingService, purchaseService, accessControlService)
  - Integration tests for API endpoints
  - Contract tests for payment gateway integration
  - E2E tests for complete user flows

✅ **Integration Points Documented**:
  - Razorpay payment gateway (existing integration extended)
  - Course-lab access relationship (existing collections queried)
  - Caching layer (Redis optional, graceful degradation)

✅ **Minimal Schema Changes**:
  - Lab entity: Add pricing field (embedded document, non-breaking)
  - New collections: lab_purchases, transactions (no modification to existing collections)
  - Indexes for performance (no breaking changes)

✅ **Security Preserved**:
  - Signature verification for payment callbacks
  - Transaction audit trail for compliance
  - Access control middleware enforces authorization
  - Idempotent webhook handling prevents duplicate processing

**All Gates Passed** ✅ - Ready for Phase 2 (Task Breakdown)

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-monetization/
├── spec.md              # Feature specification (already exists)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Web Application Structure (Monorepo)
apps/
├── web/                          # Next.js 16 + React 19 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── lab/
│   │   │   │   ├── LabPricingForm.tsx      # Instructor pricing UI
│   │   │   │   ├── LabPurchaseButton.tsx   # Student purchase UI
│   │   │   │   └── LabAccessButton.tsx     # Access control UI
│   │   ├── pages/
│   │   │   └── labs/
│   │   │       └── [id].tsx                # Lab detail page
│   │   └── services/
│   │       ├── labPricingService.ts        # API calls for pricing
│   │       └── paymentService.ts           # Razorpay integration
│   └── tests/
│       ├── components/
│       └── integration/
│
└── whatsnxt-bff/                 # Express.js 5 backend
    ├── src/
    │   ├── models/
    │   │   ├── LabPricing.ts               # Lab pricing schema
    │   │   ├── LabPurchase.ts              # Purchase records
    │   │   └── Transaction.ts              # Transaction records
    │   ├── services/
    │   │   ├── labPricingService.ts        # Pricing logic
    │   │   ├── purchaseService.ts          # Purchase processing
    │   │   ├── accessControlService.ts     # Access validation
    │   │   └── paymentGatewayService.ts    # Razorpay integration
    │   ├── routes/
    │   │   ├── labPricing.ts               # Pricing endpoints
    │   │   ├── labPurchase.ts              # Purchase endpoints
    │   │   └── paymentCallback.ts          # Payment webhooks
    │   └── middleware/
    │       └── accessControl.ts            # Lab access middleware
    └── tests/
        ├── unit/
        ├── integration/
        └── contract/

packages/
├── core-types/                   # Shared TypeScript types
│   └── src/
│       ├── LabPricing.ts
│       ├── Purchase.ts
│       └── Transaction.ts
└── core-util/                    # Shared utilities
    └── src/
        └── currency.ts           # Currency formatting utilities
```

**Structure Decision**: Using existing monorepo web application structure. Frontend (apps/web) handles UI with Mantine components and Razorpay client integration. Backend (apps/whatsnxt-bff) implements business logic, MongoDB data access, and payment gateway integration. Shared types in packages/core-types ensure type safety across frontend/backend boundary.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
