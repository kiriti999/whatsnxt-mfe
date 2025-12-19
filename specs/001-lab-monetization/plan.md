# Implementation Plan: Lab Monetization System

**Branch**: `001-lab-monetization` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lab-monetization/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a comprehensive lab monetization system that allows instructors to set pricing (free or paid) for labs and enables students to purchase paid labs through the existing Razorpay payment gateway integration. The system supports standalone lab purchases, automatic access through course enrollment, and handles instructor-initiated pricing changes with appropriate grandfathering logic. The implementation is already complete and operational in the codebase.

## Technical Context

**Language/Version**: TypeScript 5.8.2 with Node.js 24.11.0 (LTS)  
**Primary Dependencies**: Express.js 5.0.0, Mongoose 7.6.10, Razorpay 2.9.0, Next.js 16.0.7, React 19.1.0, Mantine UI  
**Storage**: MongoDB 7.0 with mongoose ODM  
**Testing**: Vitest 4.0.15, Supertest 6.0.3 for API integration tests  
**Target Platform**: Web application (Node.js backend + Next.js frontend)  
**Project Type**: Web - backend (Express.js BFF) + frontend (Next.js)  
**Performance Goals**: <200ms API response time for pricing queries, 95%+ payment callback success rate  
**Constraints**: Razorpay integration requirements, INR currency only, transaction records immutable for audit compliance  
**Scale/Scope**: Supports 10k+ concurrent users, handles multiple payment gateway callbacks, idempotent transaction processing

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Requirement | Status | Evidence |
|-----------|-------------|--------|----------|
| I. Code Quality & SOLID | Max cyclomatic complexity 5 | ✅ PASS | Services use single-responsibility pattern; complexity managed through delegation |
| III. UI Consistency | Mantine UI + CSS classes | ✅ PASS | Frontend uses Mantine components; backend-only feature for pricing |
| IV. Shared Packages | Use workspace packages | ✅ PASS | Uses `@whatsnxt/errors`, `@whatsnxt/constants`, `@whatsnxt/http-client` |
| V. Monorepo Architecture | Turbo + Next.js 16 + React 19 + Node 24 | ✅ PASS | Backend: Node 24.11.0, Frontend: Next.js 16, React 19 |
| VI. API Standards | Express.js v5 + Winston + axios | ✅ PASS | Backend uses Express 5.0.0, Winston logging, shared axios client |
| VII. Documentation | HLD/LLD + OpenAPI JSON | ✅ PASS | Generated: data-model.md, contracts/api.json, quickstart.md |
| IX. Error Handling | Use `@whatsnxt/errors` | ✅ PASS | HttpException from shared error utilities |
| X. Constants | Use `@whatsnxt/constants` | ✅ PASS | Constants imported from workspace package |
| XI. Real Data | No mocks, real APIs | ✅ PASS | Razorpay integration with real payment gateway |

**Gates Status**: 
- ✅ All critical gates passed
- ✅ Phase 1 documentation artifacts generated and complete

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
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
├── whatsnxt-bff/                    # Backend Express.js application
│   ├── app/
│   │   ├── models/
│   │   │   ├── lab/Lab.ts           # Lab model with pricing field
│   │   │   └── LabPurchase.ts       # Purchase records
│   │   ├── services/
│   │   │   ├── labPricingService.ts # Pricing management
│   │   │   ├── purchaseService.ts   # Purchase workflow
│   │   │   ├── paymentGatewayService.ts # Razorpay integration
│   │   │   └── accessControlService.ts # Access checking
│   │   ├── controllers/
│   │   │   └── course/
│   │   │       └── razorpayController.ts # Payment callbacks
│   │   └── routes/
│   │       ├── labPurchase.routes.ts # Purchase endpoints
│   │       └── paymentCallback.routes.ts # Razorpay webhooks
│   └── tests/
│       ├── unit/                    # Unit tests for services
│       └── integration/             # API integration tests
└── web/                             # Next.js frontend
    └── src/
        ├── components/              # UI components for purchase flow
        └── pages/                   # Lab detail and purchase pages

packages/
├── @whatsnxt/errors/                # Shared error classes
├── @whatsnxt/constants/             # Shared constants
├── @whatsnxt/http-client/           # Shared axios client
└── @whatsnxt/core-types/            # Shared TypeScript types
```

**Structure Decision**: This is a web application with Express.js backend (BFF pattern) and Next.js frontend following the existing monorepo architecture. The feature integrates into existing lab and payment infrastructure with dedicated services for pricing and purchase management.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. All gates passed.
