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
-  Maximum cyclomatic complexity is 5 for all functions and methods and 10 for .tsx files
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

### Documentation
- Include HLD/LLD diagrams for features
- OpenAPI in JSON format (not YAML)
- Maintain docs alongside code changes

---
*Based on WhatsNxt Constitution v5.3.0 | Last Updated: 2026-02-15*
