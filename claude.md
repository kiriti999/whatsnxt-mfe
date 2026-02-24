# WhatsNxt Claude AI Instructions

> Project-specific rules for Claude AI assistant | Based on Constitution v5.3.0

## Project Overview

WhatsNxt is a Turbo monorepo with:
- **Frontend**: `apps/web/` - Next.js 16 with React 19, Mantine UI
- **Backend**: `apps/whatsnxt-bff/` - Express.js v5, TypeScript
- **Shared Packages**: `packages/` - Reusable `@whatsnxt/*` workspace packages

## Critical Rules

- Always follow solid priniciples, cyclomatic code complexity of 6
- Always follow DRY principle
- Always follow KISS principle
- Always follow YAGNI principle
- Always follow Fail Fast principle
- Always follow Open/Closed principle
- Always follow Liskov Substitution principle
- Always follow Interface Segregation principle
- Always follow Dependency Inversion principle
- Always follow Single Responsibility principle
- Always follow Composition over Inheritance
- Always follow Single Source of Truth
- Always follow Keep It Simple, Stupid principle
- Always follow You Ain't Gonna Need This principle
- Always follow best design patterns
- App should be performant and scalable and should load in less than 2 seconds

### 1. Package Reuse is Mandatory

**ALWAYS check existing packages before writing new code.**

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@whatsnxt/core-util` | Utilities, Algolia | `InfiniteScrollComponent` |
| `@whatsnxt/core-ui` | UI Components | `CardComponent`, `Amount`, `SortByComponent` |
| `@whatsnxt/constants` | All app constants | Import, never use string literals |
| `@whatsnxt/errors` | Error classes | Extend base errors, no local classes |
| `@whatsnxt/http-client` | HTTP communication | Configured axios instance |
| `@whatsnxt/core-types` | Shared TypeScript interfaces | Import all shared types |

**Prohibited**: Creating local utilities, constants, error classes, or axios instances when workspace packages exist.

### 2. Code Quality Standards

- **Cyclomatic complexity**: Max 5 per function, max 10 for `.tsx` and `.ts` files
- **Max lines per file**: 500
- **UI Standards**: Always use mantine elements and styles unless not possible. Always use css modules instead of inline styles.
- **SOLID principles**: Mandatory
- **TypeScript**: Strict mode, interfaces in `types/` folders
- **Testing**: Use vitest

### 3. UI Implementation (Mantine UI)

**Card Grids** - Use SimpleGrid with responsive breakpoints:
```tsx
import { SimpleGrid } from '@mantine/core';

<SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4 }} spacing="lg" px="md">
  {items.map(item => <Card key={item.id} {...item} />)}
</SimpleGrid>
```

**Infinite Scroll** - Use workspace component, not pagination:
```tsx
import { InfiniteScrollComponent } from '@whatsnxt/core-util';

<InfiniteScrollComponent
  hasMore={displayCount < items.length}
  loadMore={() => setDisplayCount(prev => prev + 6)}
>
  {/* grid content */}
</InfiniteScrollComponent>
```

**Responsive Images** - Use aspect-ratio CSS:
```css
.image-container {
  aspect-ratio: 4 / 3;
  min-height: 180px;
  width: 100%;
  overflow: hidden;
}
```

**Dark Mode Colors** - Use light-dark() function:
```css
.text {
  color: light-dark(rgba(0, 0, 0, 0.7), rgba(255, 255, 255, 0.7));
}
```

**Performance**: Use CSS classes instead of Mantine's inline `style` props.

### 4. Backend Structure

All backend code in `apps/whatsnxt-bff/app/`:
```
app/
├── models/     # Database models
├── routes/     # API routes
├── services/   # Business logic
├── utils/      # Utilities
├── errors/     # Error classes
└── tests/      # Test files
```

- Use Express.js v5
- Use Winston for logging with contextual metadata
- Convert `.js` to `.ts` before adding logic
- Use D3.js for all diagram/visualization rendering

### 5. Strictly Prohibited

- Mock APIs, mock data, stub implementations, hardcoded fake data
- Local axios instances (use `@whatsnxt/http-client`)
- Local constants when `@whatsnxt/constants` exists
- Local error classes (use `@whatsnxt/errors`)
- Fixed pixel heights for responsive images (use `aspect-ratio`)
- Custom CSS grids when Mantine SimpleGrid works
- YAML format for OpenAPI (use JSON)
- Alternative visualization libraries (use D3.js)

### 6. Auto Create Content Pipeline (Programmatic SEO)

**Feature**: AI-powered content pipeline that generates and publishes blog posts with embedded SVG diagrams from structured topic outlines. Triggered daily via AWS Lambda + EventBridge cron.

**Architecture**:
- **Frontend**: "Auto Create Content" card on `/form` page → form at `/form/auto-create` accepting title, description (Lexical + AI sparkle for topic generation), category, sub-category, nested sub-category
- **Backend**: `contentPlanSchema.ts` (MongoDB model), `contentPlanService.ts` (business logic), `contentPlan.routes.ts` (API)
- **Lambda**: `lambda/content-generation/` — daily cron reads active plans, picks one pending topic per plan, generates blog content + SVG diagrams via AI, publishes to `blogPosts` collection
- **Terraform**: `lambda-content-generation.tf` with dedicated EventBridge rule `cron(0 11 * * ? *)` (daily 11am UTC)

**Content Plan MongoDB Schema** (`contentPlans` collection):
```typescript
{
  title: string,              // Parent title (unique per user)
  description: string,        // Original Lexical/HTML description
  userId: ObjectId,           // Owner
  categoryName: string,
  subCategory?: string,
  nestedSubCategory?: string,
  topics: [{
    _key: string,             // UUID for idempotency
    title: string,            // Extracted topic
    status: 'pending' | 'processing' | 'published' | 'error' | 'skipped',
    blogPostId?: ObjectId,    // Reference to created blogPost
    error?: string,
    processedAt?: Date,
    retryCount: number,       // Max 3 retries
  }],
  status: 'active' | 'completed' | 'paused' | 'cancelled',
  completedCount: number,
  totalCount: number,
  rateLimitedUntil?: Date,
}
// Indexes: { userId: 1, status: 1 }, { status: 1, rateLimitedUntil: 1 }, { userId: 1, title: 1 } (unique)
```

**AI-Generated SVG Diagrams**:
- The AI model MUST generate one or more SVG diagrams per topic alongside blog content
- Diagrams MUST leverage the existing Visualizer Builder diagram types (Architecture Diagram, Flow Diagram, Mind Map, etc.) and D3.js shape libraries
- Diagram complexity scales with topic context — small diagrams for simple concepts, larger multi-component diagrams for architecture/system topics
- SVG output is embedded directly in the blog content as inline SVG within the Lexical/HTML structure
- The AI prompt MUST include the diagram type hint based on category (e.g., architecture topics → Architecture Diagram, process topics → Flow Diagram)

**Design Patterns**:
| Pattern | Implementation |
|---------|---------------|
| Job Queue | MongoDB-backed embedded topics array (bounded 5-20 per plan) |
| Idempotency | Each topic has `_key` + `status` + `processedAt` |
| Circuit Breaker | On AI rate limit (429) → set `rateLimitedUntil` → skip until cooldown |
| Budget Guard | Configurable `maxTopicsPerRun` (default: 5) + `maxPlansPerRun` (default: 10) |
| FIFO Fairness | `$sort: { lastProcessedAt: 1 }` + `$limit` for cursor-based processing |
| Fault Isolation | Per-topic error handling; plan stays `active` until all topics resolved |
| Prompt Engineering | System prompt includes: parent title context, topic, category, word count target, SEO keywords, diagram type hint |

**Lambda Processing**:
1. Query `contentPlans` where `status = 'active'` and not rate-limited
2. For each plan: get user's AI config from `users.aiConfig` (user key or system fallback)
3. Pick next `pending` topic → mark `processing` (atomic) → call AI → create blog + diagrams → publish to `blogPosts` → mark `published`
4. On rate limit → reset topic to `pending`, set `rateLimitedUntil` = now + 24h, skip to next plan
5. On error → increment `retryCount`, mark `error` (or `skipped` after 3 retries)
6. If all topics done → mark plan `completed`

**Implementation Phases**:
| Phase | Scope |
|-------|-------|
| Phase 1 | MongoDB model + API routes + service (Backend) |
| Phase 2 | Frontend card + form page + AI topic generation |
| Phase 3 | Lambda handler with AI content + SVG diagram generation |
| Phase 4 | Terraform deployment (Lambda + EventBridge) |
| Phase 5 | Dashboard/progress tracking UI |

## Quick Reference

<!--
Sync Impact Report

- Version change: 5.3.0 → 5.4.0
- List of modified principles: Added Section 6 (Auto Create Content Pipeline)
- Added sections: Section 6 - Auto Create Content Pipeline (Programmatic SEO)
- Removed sections: None
- Modified content:
  - Added Auto Create Content Pipeline feature specification with MongoDB schema, Lambda processing, and AI SVG diagram generation
  - Added requirement for AI-generated SVG diagrams using existing Visualizer Builder diagram types and D3.js shape libraries
  - Added content plan MongoDB schema design with embedded topics queue pattern
  - Added Lambda processing algorithm with circuit breaker, budget guard, and FIFO fairness patterns
  - Added implementation phases (Backend → Frontend → Lambda → Terraform → Dashboard)
  - Added Additional Constraints for content pipeline automation
- Templates requiring updates:
  - ⚠️ ContentTypeForm must include "Auto Create Content" card
  - ⚠️ New form page at /form/auto-create with Lexical editor + AI sparkle for topic generation
  - ⚠️ New Lambda function lambda/content-generation/ with Terraform deployment
  - ⚠️ AI prompts must include diagram type hints for SVG generation
- Follow-up TODOs:
  - Create contentPlanSchema.ts in app/models/
  - Create contentPlanService.ts in app/services/
  - Create contentPlan.routes.ts in app/routes/
  - Create lambda/content-generation/ handler
  - Create lambda-content-generation.tf in terraform/
  - Create AutoCreateForm frontend component
  - Add progress tracking to dashboard
-->

# WhatsNxt Constitution

## Core Principles

### I. Code Quality and SOLID Principles
All code MUST adhere to industry best practices for maintainability, readability, and reliability. SOLID principles are mandatory for all contributors and coding agents. Code reviews MUST verify compliance before merge.

**Cyclomatic Complexity**: All functions and methods MUST have a maximum cyclomatic complexity of 5. Functions exceeding this threshold MUST be refactored into smaller, more maintainable units.

**Rationale**: Cyclomatic complexity of 5 or less ensures code remains testable, maintainable, and easy to understand. Higher complexity increases the likelihood of bugs and makes code harder to modify safely.

**D3 shsapes and diagrams**: Shapes and arrows must not overlap. If shapes need nested, use groups and pools. All arrows should be deletable


### III. User Experience Consistency
UI MUST be built using Mantine UI. Layouts and components MUST be responsive and accessible. User experience consistency is enforced across all packages and apps. Accessibility and code readability are top priorities. CSS classes MUST be used instead of Mantine style attributes wherever possible to prevent performance issues as recommended by the Mantine team.

**Responsive Grid Layouts**: Card-based layouts MUST use Mantine's `SimpleGrid` component with responsive column breakpoints. Applications MUST NOT use custom CSS grid implementations when SimpleGrid provides the required functionality.

**Infinite Scroll Pattern**: List views with large datasets SHOULD use `InfiniteScrollComponent` from `@whatsnxt/core-util` for scroll-to-load functionality instead of traditional pagination. This improves user experience by eliminating page navigation and providing seamless content loading.

**Responsive Images**: Image containers MUST use CSS `aspect-ratio` property for consistent sizing across breakpoints. Fixed pixel heights SHOULD be avoided to prevent image distortion on different screen sizes.

### IV. Performance Requirements and Shared Packages
All features MUST meet defined performance goals. Monorepo structure MUST use pnpm workspace with reusable components and packages as dependencies. Performance bottlenecks MUST be identified and resolved before release.

**Shared Package Architecture**: Common functionality MUST be extracted into reusable packages in the `packages/` directory. All applications MUST reuse existing workspace packages instead of creating duplicate implementations.

**Type Definitions**: All interfaces MUST be created in separate files under a `types` folder within the appropriate workspace package and imported where needed. Local type definitions are prohibited when a shared workspace package exists or can be created.

**Package Reuse Mandate**: Applications MUST NOT create local implementations of functionality that exists in workspace packages. Before implementing any utility, service, or type definition, developers MUST check for existing workspace packages and use them.

**Rationale**: Shared packages eliminate code duplication, ensure consistent behavior across apps, simplify maintenance (fix bugs once), enable centralized testing, and follow Turbo monorepo best practices. Mandatory package reuse prevents fragmentation and technical debt. Centralized type definitions improve consistency and enable safe refactoring across the codebase.

### V. Monorepo Architecture
- The app MUST be built using a Turbo monorepo structure.
- Next.js 16+ MUST be used for the frontend with React 19 as the underlying library.
- Node.js 24 LTS MUST be used for the runtime to utilize the latest stable features and long-term support.
- All contributors MUST follow workspace conventions and dependency management best practices.
- pnpm 10+ (or the latest version compatible with Node.js 24 LTS) MUST be used as the package manager.
- Frontend applications MUST be bundled using Webpack.
- Testing should be done using vitest. Refer: https://vitest.dev/

**Rationale**: Node.js 24 LTS provides the latest stable features with extended support. Next.js 16 and React 19 deliver the latest performance optimizations, React Server Components improvements, and modern development patterns. pnpm 10+ ensures compatibility and optimal workspace management.

### VI. API Communication Standards
All backend APIs MUST be built using Express.js version 5 for consistent, well-documented, and maintainable API architecture.
The backend code should reside inside the `apps/whatsnxt-bff` directory. It should follow the existing folder structure. The code should be written in typescript and should reside inside the `apps/whatsnxt-bff/app` directory.
Utilise `apps/whatsnxt-bff/config/` folder for all configs.
Utilise `apps/whatsnxt-bff/app/models/` folder for all models.
Utilise `apps/whatsnxt-bff/app/routes/` folder for all routes.
Utilise `apps/whatsnxt-bff/app/services/` folder for all services.
Utilise `apps/whatsnxt-bff/app/utils/` folder for all utils.
Utilise `apps/whatsnxt-bff/app/errors/` folder for all errors.
Utilise `apps/whatsnxt-bff/app/tests/` folder for all tests.
The `apps/whatsnxt-bff` is a javascript project. Utilise existing .js file instead of creating new ones. Convert to .ts typescript files before writing logic into it and fix typescript errors.

**HTTP Client Reuse**: All HTTP communication MUST use the axios client from the `@whatsnxt/http-client` workspace package. Applications MUST NOT create new axios instances or HTTP clients. The shared HTTP client provides configured interceptors, error handling, retry logic, and timeout management. This applies to:
- **Client-to-backend communication**: Frontend applications calling backend APIs

This ensures consistent error handling, request/response interceptors, retry logic, timeout management, and maintainable API communication across the entire application architecture.

All backend applications MUST use Winston for structured logging. Winston provides consistent log formatting, multiple transport options (console, file, cloud services), log level management, and production-ready error tracking. Logs MUST include contextual metadata (request IDs, user IDs, timestamps) to enable effective debugging and observability.

**Diagram and Shape Rendering**: All diagrams and diagram shapes MUST be created and rendered using the D3.js library. Applications MUST NOT use alternative visualization libraries for diagram-related features. D3.js provides powerful, flexible, and performant SVG-based rendering with extensive support for data-driven transformations, animations, and interactions.

**Rationale**: Express.js version 5 is the latest stable release of the industry-standard, battle-tested framework with extensive ecosystem support, improved performance, and modern async/await patterns. Reusing the shared axios client from `@whatsnxt/http-client` eliminates configuration drift, ensures consistent behavior across all services, and simplifies debugging and monitoring. Winston is the most mature and widely adopted Node.js logging library, offering structured logging with minimum overhead. D3.js is the industry-standard library for complex data visualizations and diagrams, providing complete control over SVG rendering, excellent performance, and extensive community support for architectural diagrams and interactive visualizations.

### VII. Documentation Standards
All features MUST include High-Level Design (HLD) and Low-Level Design (LLD) architectural diagrams. User stories MUST be accompanied by user flow diagrams or sequence diagrams. Documentation MUST be maintained alongside code changes. OpenAPI specifications MUST be in JSON format (not YAML) for consistency and tooling compatibility.

**Rationale**: JSON format for OpenAPI ensures better tooling support, type generation, and version control diff readability in modern development environments.

### VIII. Superseding Guidance
These principles supersede any other guidance and apply to all contributors and coding agents. No exceptions unless explicitly amended in this constitution.

### IX. Error Handling Standards
All applications MUST use custom error classes from the `@whatsnxt/errors` workspace package. Applications MUST NOT create local error classes or throw generic Error objects for application-specific errors.

Custom error classes MUST extend the base application error class and provide structured error information including error codes, messages, and contextual data. This enables consistent error handling, logging, and user-facing error messages across all applications.

**Rationale**: Centralized error handling ensures consistent error semantics, enables better error tracking and monitoring, simplifies debugging across services, and provides better user experience through standardized error messages.

### X. Code Maintainability Standards
**Constants Usage**: All applications MUST use constants from the `@whatsnxt/constants` workspace package instead of string literals or magic numbers. This includes API endpoints, configuration values, error codes, status codes, and any other repeated values.

Applications MUST NOT define local constants when shared constants exist or can be created in the workspace package. New constants MUST be added to the appropriate workspace package for reuse.

**Rationale**: Using constants instead of string literals prevents typos, enables type checking, facilitates refactoring, improves code readability, and ensures consistency across the codebase. Centralized constants eliminate duplication and make global changes safer and easier.

### XI. Real Data and API Standards
All applications MUST use real backend APIs and real data sources. Mock APIs, mock data, stub implementations, and hardcoded fake data are strictly PROHIBITED in all environments including development, testing, and production.

All API integrations MUST connect to actual backend services. Test environments MUST use dedicated test databases or sandboxed backend instances with real data structures. Development workflows MUST rely on functional backend services.

**Rationale**: Mock data and mock APIs create false confidence in code quality, hide integration issues until late in development, cause divergence between test and production behavior, and lead to bugs that only surface in production. Real APIs and data ensure code is tested against actual system behavior from the start, catch integration issues early, and maintain consistency across all environments.

## Additional Constraints

- Technology stack: Turbo monorepo, Next.js 16 (frontend) with React 19 and Webpack bundling, Node.js 24 LTS (runtime), Mantine UI (frontend components), pnpm 10+ workspace, Express.js v5 (backend APIs), axios from `@whatsnxt/http-client` for all HTTP communication, Winston (backend logging), D3.js (diagram and shape rendering), Docker with Node Alpine base images for deployment
- All components and packages MUST be reusable.
- Common functionality MUST be extracted into `@whatsnxt/*` workspace packages in the `packages/` directory.
- Applications MUST reuse existing workspace packages and MUST NOT create duplicate implementations.
- All interfaces MUST be defined in `types` folders within workspace packages and imported where needed.
- All custom errors MUST use error classes from `@whatsnxt/errors` workspace package.
- All constants MUST be defined in `@whatsnxt/constants` workspace package and imported where needed.
- All HTTP communication MUST reuse axios client from `@whatsnxt/http-client` workspace package.
- All diagrams and diagram shapes MUST be created using D3.js library.
- Maximum cyclomatic complexity is 5 for all functions and methods and 10 for .tsx files and .ts files
- Accessibility and code readability are non-negotiable.
- CSS classes preferred over inline Mantine styles for performance optimization.
- All backend APIs MUST use Express.js version 5 framework.
- All frontend applications MUST use Next.js 16 with React 19.
- All backend applications MUST use Winston for structured logging with contextual metadata.
- OpenAPI specifications MUST be in JSON format, not YAML.
- Documentation (HLD, LLD, user flows, sequence diagrams) MUST accompany all features.
- All Dockerfiles MUST use Node Alpine base images (e.g., node:24-alpine) for minimal size and improved security.
- Card-based layouts MUST use Mantine SimpleGrid with responsive breakpoints.
- Infinite scroll MUST use InfiniteScrollComponent from @whatsnxt/core-util.
- Image containers MUST use CSS aspect-ratio for responsive sizing.

## Development Workflow & Quality Gates

- All code changes MUST pass code review and accessibility checks.
- Pull requests MUST include evidence of compliance with all principles.
- Automated CI/CD pipelines MUST enforce testing and linting standards.
- All contributors MUST document rationale for any deviation from principles.
- All backend applications MUST include Winston logger configuration with appropriate log levels and transports.
- All frontend applications MUST use Next.js 16 with React 19.
- All HTTP communication layers MUST use axios client from `@whatsnxt/http-client` with consistent configuration.
- All functions MUST have cyclomatic complexity of 5 or less (enforced via linting).
- All custom errors MUST use `@whatsnxt/errors` package.
- All constants MUST use `@whatsnxt/constants` package.
- All type interfaces MUST be defined in workspace package `types` folders.
- Mock APIs, mock data, stub implementations, and hardcoded fake data are strictly PROHIBITED.

## Governance

This constitution supersedes all other practices and guidance. Amendments require documentation, approval, and a migration plan. All PRs and reviews MUST verify compliance. Complexity MUST be justified. Use runtime guidance files for development reference.

**Version**: 5.4.0 | **Ratified**: 2025-11-03 | **Last Amended**: 2026-02-19

### File Locations
- Frontend app: `apps/web/`
- Backend app: `apps/whatsnxt-bff/`
- Shared packages: `packages/`
- Type definitions: `packages/*/types/`

### Common Imports
```tsx
// UI Components
import { SimpleGrid, Paper, Flex, Box, Container } from '@mantine/core';
import { CardComponent, Amount } from '@whatsnxt/core-ui';

// Utilities
import { InfiniteScrollComponent } from '@whatsnxt/core-util';

// HTTP
import { httpClient } from '@whatsnxt/http-client';

// Constants
import { API_ENDPOINTS } from '@whatsnxt/constants';
```

### Documentation Requirements
- Include HLD/LLD diagrams for features
- OpenAPI specs in JSON format
- Maintain docs alongside code changes

---

*WhatsNxt Constitution v5.4.0 | Node.js 24 LTS | Next.js 16 | React 19 | pnpm 10+*
