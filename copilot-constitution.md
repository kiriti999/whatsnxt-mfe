# WhatsNxt Copilot Constitution

> AI coding assistant guidelines extracted from the main constitution v5.3.0

## Mandatory Rules for All Code Generation

### Technology Stack
- **Frontend**: Next.js 16+ with React 19, Mantine UI, Webpack bundling
- **Backend**: Express.js v5, TypeScript, Winston logging
- **Runtime**: Node.js 24 LTS
- **Package Manager**: pnpm 10+
- **Monorepo**: Turbo with workspace packages

### Code Quality
- Maximum cyclomatic complexity: **5** per function
-  Maximum cyclomatic complexity is 5 for all functions and methods and 10 for .tsx files and .ts files
- SOLID principles are mandatory
- CSS classes preferred over inline Mantine styles

### Package Reuse (CRITICAL)
Before implementing ANY utility, service, or type:
1. Check `packages/` directory for existing workspace packages
2. Use `@whatsnxt/*` packages - DO NOT create duplicates

| Package | Usage |
|---------|-------|
| `@whatsnxt/core-util` | Utilities, InfiniteScrollComponent, Algolia |
| `@whatsnxt/core-ui` | UI components, CardComponent, Amount |
| `@whatsnxt/constants` | All constants (NO string literals) |
| `@whatsnxt/errors` | Custom error classes |
| `@whatsnxt/http-client` | All HTTP/axios communication |

### UI Patterns
- **Card Layouts**: Use Mantine `SimpleGrid` with responsive breakpoints
  ```tsx
  <SimpleGrid cols={{ base: 1, xs: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
  ```
- **Infinite Scroll**: Use `InfiniteScrollComponent` from `@whatsnxt/core-util`
- **Images**: Use CSS `aspect-ratio` (NOT fixed pixel heights)
  ```css
  .image-container {
    aspect-ratio: 4 / 3;
  }
  ```
- **Dark Mode**: Use `light-dark()` CSS function for colors

### Backend Structure
All backend code in `apps/whatsnxt-bff/app/`:
- `models/` - Database models
- `routes/` - API routes
- `services/` - Business logic
- `utils/` - Utilities
- `errors/` - Error classes
- `tests/` - Tests

### Type Definitions
- Define interfaces in `types/` folder within workspace packages
- Import types, DO NOT create local duplicates
- Use TypeScript strict mode

### PROHIBITED
- Mock APIs, mock data, stub implementations
- Hardcoded fake data
- Local axios instances (use `@whatsnxt/http-client`)
- Local constants when shared ones exist
- Local error classes (use `@whatsnxt/errors`)
- Alternative visualization libraries for diagrams (use D3.js)
- Fixed pixel heights for responsive images
- Custom CSS grids when SimpleGrid works

### Auto Create Content Pipeline (Programmatic SEO)

AI-powered content pipeline that generates and publishes blog posts with embedded SVG diagrams from structured topic outlines. Triggered daily via AWS Lambda + EventBridge cron.

**Architecture**:
- **Frontend**: "Auto Create Content" card → `/form/auto-create` form (title, Lexical description + AI sparkle, category, sub-category, nested sub-category)
- **Backend**: `contentPlanSchema.ts`, `contentPlanService.ts`, `contentPlan.routes.ts`
- **Lambda**: `lambda/content-generation/` — daily cron processes one topic per plan per run
- **Terraform**: `lambda-content-generation.tf` with dedicated EventBridge rule `cron(0 11 * * ? *)` (daily 11am UTC)

**Content Plan Schema** (`contentPlans` collection):
- `title` (unique per user), `description`, `userId`, `categoryName`, `subCategory?`, `nestedSubCategory?`
- `topics[]`: embedded queue with `_key`, `title`, `status` (pending/processing/published/error/skipped), `blogPostId?`, `retryCount`
- `status`: active/completed/paused/cancelled
- `rateLimitedUntil?`: circuit breaker timestamp

**AI-Generated SVG Diagrams**:
- AI MUST generate one or more SVG diagrams per topic alongside blog content
- MUST leverage existing Visualizer Builder diagram types and D3.js shape libraries
- Diagram complexity scales with topic context (small → large based on content type)
- SVG embedded inline in blog Lexical/HTML content
- AI prompt includes diagram type hint based on category

**Design Patterns**: MongoDB-backed job queue, idempotency via `_key` + `status`, circuit breaker on rate limits, budget guard (`maxTopicsPerRun`), FIFO fairness, per-topic fault isolation, structured prompt engineering with diagram type hints.

**Lambda Flow**: Query active plans → get user AI config → pick pending topic → mark processing (atomic) → call AI for content + SVG → publish to blogPosts → mark published. Rate limit → skip plan 24h. Error → retry up to 3x then skip. All topics done → plan completed.

**Phases**: 1) Backend model/routes/service → 2) Frontend form → 3) Lambda handler → 4) Terraform → 5) Dashboard UI

### Documentation
- Include HLD/LLD diagrams for features
- OpenAPI in JSON format (not YAML)
- Maintain docs alongside code changes


<!--
Sync Impact Report

- Version change: 5.3.0 → 5.4.0
- List of modified principles: Added Auto Create Content Pipeline section
- Added sections: Auto Create Content Pipeline (Programmatic SEO)
- Removed sections: None
- Modified content:
  - Added Auto Create Content Pipeline feature specification
  - Added AI SVG diagram generation using Visualizer Builder + D3.js
  - Added content plan MongoDB schema with embedded topics queue
  - Added Lambda processing with circuit breaker and budget guard
  - Added Additional Constraints for content pipeline automation
- Templates requiring updates:
  - ⚠️ ContentTypeForm must include "Auto Create Content" card
  - ⚠️ New form page at /form/auto-create
  - ⚠️ New Lambda function lambda/content-generation/
  - ⚠️ AI prompts must include diagram type hints
- Follow-up TODOs:
  - Implement contentPlanSchema, service, routes
  - Create lambda/content-generation/ handler
  - Create Terraform deployment config
  - Build AutoCreateForm frontend
  - Add progress dashboard
-->

# WhatsNxt Constitution

## Core Principles

### I. Code Quality and SOLID Principles
All code MUST adhere to industry best practices for maintainability, readability, and reliability. SOLID principles are mandatory for all contributors and coding agents. Code reviews MUST verify compliance before merge.

**Cyclomatic Complexity**: All functions and methods MUST have a maximum cyclomatic complexity of 5. Functions exceeding this threshold MUST be refactored into smaller, more maintainable units.

**Rationale**: Cyclomatic complexity of 5 or less ensures code remains testable, maintainable, and easy to understand. Higher complexity increases the likelihood of bugs and makes code harder to modify safely.

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

**D3 shsapes and diagrams**: Shapes and arrows must not overlap. If shapes need nested, use groups and pools. All arrows should be deletable


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
- Maximum cyclomatic complexity is 5 for all functions and methods and 10 for .tsx files
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

---
*Based on WhatsNxt Constitution v5.4.0 | Last Updated: 2026-02-19*
