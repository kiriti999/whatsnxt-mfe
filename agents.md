# WhatsNxt AI Coding Agent Instructions

> Project-specific rules for AI coding agents | Based on Constitution v5.3.0

## Project Overview

WhatsNxt is a Turbo monorepo with:
- **Frontend**: `apps/web/` - Next.js 16 with React 19, Mantine UI
- **Backend**: `apps/whatsnxt-bff/` - Express.js v5, TypeScript
- **Shared Packages**: `packages/` - Reusable `@whatsnxt/*` workspace packages

## Critical Rules

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

- **Cyclomatic complexity**: Max 5 per function, max 10 for `.tsx` files
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

## Quick Reference

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

*WhatsNxt Constitution v5.3.0 | Node.js 24 LTS | Next.js 16 | React 19 | pnpm 10+*
