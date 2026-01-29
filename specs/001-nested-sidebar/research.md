# Research: Nested Content Sidebar

**Feature**: 001-nested-sidebar  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

This document captures research decisions for implementing a nested, hierarchical sidebar navigation system for blog posts and tutorials. The research focused on resolving technical unknowns identified during planning and establishing best practices for the chosen technology stack.

## Research Areas

### 1. Hierarchical Data Modeling in MongoDB

**Decision**: Use self-referential schema with `parentId` field and maintain denormalized `order` field for sorting.

**Rationale**:
- MongoDB/Mongoose supports self-referential schemas efficiently via ObjectId references
- Existing codebase pattern (seen in `blogCommentSchema.ts`) already uses `parentId` for hierarchical comments
- Denormalized `order` field prevents complex sorting queries and enables drag-and-drop reordering
- Mongoose virtuals can populate nested children dynamically without deep recursive queries
- Maximum nesting depth of 4 levels is manageable without specialized tree structures

**Alternatives Considered**:
- **Materialized Path**: Storing full path as string (e.g., `/tech/javascript/react`). Rejected because it complicates reordering and path updates when parent sections change.
- **Nested Sets**: Precomputed left/right node values. Rejected due to complexity and poor write performance for frequently reordered content.
- **Array of Ancestors**: Storing all ancestor IDs in array. Rejected as overkill for max 4-level depth and adds update complexity.

**Implementation Pattern**:
```typescript
{
  _id: ObjectId,
  title: string,
  parentId: ObjectId | null,  // null for top-level sections
  order: number,              // Sort order within parent
  // ... other fields
}
```

**Query Strategy**:
- Fetch all sections in one query (expected <100 sections)
- Build hierarchy tree client-side (O(n) complexity)
- Index on `parentId` and `order` for efficient queries

### 2. Slug Generation and Uniqueness

**Decision**: Auto-generate slugs from titles using `slugify` pattern with uniqueness validation via numeric suffixes.

**Rationale**:
- Existing tutorial schema uses `slug` field with `unique: true, sparse: true`
- Automatic generation reduces admin burden and ensures URL-friendly format
- Numeric suffixes (e.g., `javascript-basics-2`) handle duplicate titles gracefully
- Sparse unique index allows multiple null slugs during creation

**Alternatives Considered**:
- **Manual slug entry**: Rejected because it increases admin cognitive load and error potential
- **UUID-based slugs**: Rejected because they're not human-readable or SEO-friendly
- **Error on duplicate**: Rejected because it creates poor UX when titles naturally overlap

**Implementation Pattern**:
```typescript
// pseudocode
async function generateUniqueSlug(title: string, excludeId?: ObjectId): Promise<string> {
  let baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 2;
  
  while (await sectionExists({ slug, _id: { $ne: excludeId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

### 3. State Management Strategy

**Decision**: Use Redux Toolkit with normalized state for sections and runtime tree construction.

**Rationale**:
- Project already uses Redux Toolkit (v2.8.2) - see `store/slices/blogSidebarSlice.ts`
- Normalized state prevents data duplication and enables efficient updates
- `createAsyncThunk` provides standardized async action handling with loading/error states
- Memoized selectors (via `reselect`) can build hierarchy tree only when data changes
- RTK Query considered but standard RTK adequate for this CRUD pattern

**Alternatives Considered**:
- **React Context API**: Rejected because existing codebase uses Redux, and Context doesn't provide devtools/time-travel debugging
- **Zustand**: Rejected to maintain consistency with existing state management approach
- **Local component state**: Rejected because sidebar state needs to be shared across multiple routes

**State Shape**:
```typescript
{
  nestedSidebar: {
    sections: {
      byId: { [id: string]: Section },
      allIds: string[]
    },
    expandedSections: Set<string>,  // Track which sections are expanded
    activePath: string[],            // Breadcrumb trail to active item
    loading: boolean,
    error: string | null
  }
}
```

### 4. Icon Management Approach

**Decision**: Use existing Tabler Icons React library with database-stored icon name references.

**Rationale**:
- Project already depends on `@tabler/icons-react` v3.34.0 (seen in package.json)
- 3000+ icons available covering common use cases
- Icon names stored as strings in DB (e.g., `"IconBook"`, `"IconCode"`)
- Dynamic import prevents loading all icons: `import(icons-react).then(mod => mod[iconName])`
- No additional dependencies or asset management required

**Alternatives Considered**:
- **Custom SVG uploads**: Rejected due to file storage complexity, size validation needs, and security concerns
- **Font Awesome**: Rejected because Tabler Icons already integrated
- **Material Icons**: Rejected to avoid adding another icon library

**Icon Picker Implementation**:
- Curate list of ~50 commonly used category icons
- Store mapping in separate `iconSchema` collection: `{ name: string, category: string, displayName: string }`
- Picker displays icon grid with search/filter
- Lazy load icon components only when picker opens

### 5. Form Validation Strategy

**Decision**: Use Mantine Form (`@mantine/form`) with custom validation functions integrated with backend `class-validator`.

**Rationale**:
- Project already uses `@mantine/form` v8.3.10 (see package.json)
- Mantine Form provides built-in validation, error display, and form state management
- Backend uses `class-validator` v0.14.1 - validation logic can be shared via TypeScript types
- Client-side validation provides immediate feedback; server-side validation ensures data integrity
- Integrates seamlessly with Mantine UI components

**Alternatives Considered**:
- **React Hook Form**: Rejected to maintain consistency with Mantine ecosystem
- **Formik**: Rejected as it's not integrated with existing UI library
- **Zod schema validation**: Considered but class-validator already in backend

**Validation Rules**:
```typescript
{
  title: {
    required: true,
    maxLength: 100,
    validate: (value) => value.trim().length > 0
  },
  slug: {
    pattern: /^[a-z0-9-]+$/,
    maxLength: 150
  },
  parentId: {
    validate: async (value, values) => {
      // Check max nesting depth (4 levels)
      const depth = await calculateDepth(value);
      return depth < 4 || 'Maximum nesting depth exceeded';
    }
  }
}
```

### 6. Expand/Collapse State Persistence

**Decision**: Store expanded section IDs in Redux store (session-based), with optional localStorage persistence for user preferences.

**Rationale**:
- Session-level state via Redux provides immediate response without backend calls
- localStorage enables persistence across page refreshes (user convenience)
- Auto-expansion of active item's ancestors happens on navigation via Redux action
- No database overhead for temporary UI state
- Supports both controlled (admin specifying) and uncontrolled (user preference) scenarios

**Alternatives Considered**:
- **Database storage**: Rejected as overkill for UI preference data
- **URL query params**: Rejected because it clutters URLs and doesn't persist across sessions
- **Cookie storage**: Rejected as localStorage is simpler for client-only data

**Implementation Pattern**:
```typescript
// Redux action
toggleSection(sectionId: string) {
  // Update expandedSections Set
  // Sync to localStorage: localStorage.setItem('sidebar_expanded', JSON.stringify([...set]))
}

// On mount
useEffect(() => {
  const saved = localStorage.getItem('sidebar_expanded');
  if (saved) dispatch(setExpandedSections(JSON.parse(saved)));
}, []);
```

### 7. API Design Pattern

**Decision**: RESTful API with nested resource routes and batch operations where beneficial.

**Rationale**:
- Existing backend follows RESTful patterns (see `app/routes/` structure)
- Express.js v5.0.0 provides simple routing with `express.Router()`
- Standard CRUD operations map cleanly to HTTP methods
- Batch operations reduce network overhead for common scenarios (e.g., reordering multiple sections)

**API Routes**:
```
GET    /api/v1/sidebar/sections              # List all sections (with query filters)
POST   /api/v1/sidebar/sections              # Create section
GET    /api/v1/sidebar/sections/:id          # Get single section
PUT    /api/v1/sidebar/sections/:id          # Update section
DELETE /api/v1/sidebar/sections/:id          # Delete section
PATCH  /api/v1/sidebar/sections/reorder      # Batch reorder sections
GET    /api/v1/sidebar/sections/tree         # Get pre-built hierarchy tree

GET    /api/v1/sidebar/icons                 # List available icons

PATCH  /api/v1/blogs/:id/section             # Assign blog to section
PATCH  /api/v1/tutorials/:id/section         # Assign tutorial to section
```

**Alternatives Considered**:
- **GraphQL**: Rejected to maintain consistency with REST API architecture
- **Separate endpoints per depth level**: Rejected as overly complex
- **Single `/tree` endpoint only**: Rejected because individual operations need granular control

### 8. Responsive Sidebar Behavior

**Decision**: Use Mantine's AppShell component with built-in responsive drawer behavior.

**Rationale**:
- Mantine v8.3.10 provides `AppShell` with integrated responsive sidebar/navbar
- Mobile: Sidebar becomes overlay drawer with hamburger toggle
- Tablet: Collapsible sidebar with toggle button
- Desktop: Fixed sidebar (max 400px width)
- No custom responsive logic needed - declarative breakpoints

**Implementation Pattern**:
```tsx
<AppShell
  navbar={{
    width: { sm: 300, lg: 350 },
    breakpoint: 'sm',
    collapsed: { mobile: !opened }
  }}
>
  <AppShell.Navbar>
    <NestedSidebar />
  </AppShell.Navbar>
  <AppShell.Main>{children}</AppShell.Main>
</AppShell>
```

**Alternatives Considered**:
- **Custom CSS media queries**: Rejected as Mantine provides tested solution
- **Separate mobile/desktop components**: Rejected as it duplicates logic

### 9. Animation and Performance

**Decision**: CSS transitions for expand/collapse with `max-height` transition and `will-change` hints.

**Rationale**:
- Target: <300ms animation duration (per spec)
- CSS transitions are GPU-accelerated and performant
- Mantine Accordion component provides built-in animations
- `max-height: 0` → `max-height: <calculated>` creates smooth expand effect
- `will-change: max-height` hints browser for optimization

**Performance Optimizations**:
- Virtual scrolling if >200 items (using `react-window` if needed)
- Memoize section components with `React.memo` and comparison by `_id`
- Debounce search/filter inputs (300ms delay)
- Lazy load icons only when sections render

**Alternatives Considered**:
- **JavaScript animation libraries**: Rejected as CSS is more performant for simple transitions
- **Height: auto transitions**: Rejected because they don't animate smoothly
- **Framer Motion**: Rejected to avoid additional dependency for simple transitions

### 10. Testing Strategy

**Decision**: Vitest for unit/integration tests with React Testing Library; manual E2E for MVP.

**Rationale**:
- Both repos already configured with Vitest (vitest.config.ts exists)
- React Testing Library provides user-centric testing approach
- Mock MSW (Mock Service Worker) for API testing in frontend
- Supertest for backend API endpoint testing
- E2E with Playwright deferred to post-MVP due to setup overhead

**Test Coverage Targets**:
- Backend: 80%+ coverage (models, services, controllers)
- Frontend: 70%+ coverage (components, Redux slices, hooks)
- Critical paths: 100% (slug uniqueness, nesting depth validation, CRUD operations)

**Key Test Scenarios**:
```typescript
// Backend
- Section creation with slug generation
- Duplicate slug handling (numeric suffix)
- Max nesting depth validation (4 levels)
- Cascade delete handling
- Reorder operation consistency

// Frontend  
- Section expand/collapse toggling
- Active path highlighting
- Form validation (client-side)
- Drag-and-drop reordering
- Icon picker search/filter
```

## Technology Stack Summary

| Layer                | Technology                          | Version | Decision Rationale                                    |
| -------------------- | ----------------------------------- | ------- | ----------------------------------------------------- |
| Frontend Framework   | Next.js                             | 16.0    | Existing project framework                            |
| UI Components        | Mantine                             | 8.3.10  | Already integrated, comprehensive component library   |
| State Management     | Redux Toolkit                       | 2.8.2   | Existing pattern, devtools support                    |
| Form Handling        | @mantine/form                       | 8.3.10  | Integrated with Mantine, simpler than React Hook Form |
| Notifications        | @mantine/notifications              | 8.3.10  | Consistent with Mantine ecosystem                     |
| Modal Dialogs        | @mantine/modals                     | 8.3.10  | Consistent with Mantine ecosystem                     |
| Drag & Drop          | @dnd-kit                            | 6.3.1   | Already in project, modern DnD solution               |
| Icons                | Tabler Icons React                  | 3.34.0  | Already integrated, 3000+ icons                       |
| Backend Framework    | Express.js                          | 5.0.0   | Existing backend framework                            |
| Database             | MongoDB                             | 7.0+    | Existing database, flexible schema for hierarchies    |
| ODM                  | Mongoose                            | 8.21.0  | Existing pattern, schema validation                   |
| Validation (backend) | class-validator                     | 0.14.1  | Already in use, decorator-based validation            |
| Testing              | Vitest                              | Latest  | Already configured in both repos                      |
| API Client           | fetch (with wrapper from httpClient | N/A     | Existing pattern in `@whatsnxt/http-client`           |

## Migration Considerations

### Database Migration
**Required**: Add `sectionId` field to existing blog and tutorial documents.

**Approach**:
1. Create new Section schema and deploy
2. Add `sectionId` field to tutorialSchema (existing) and blog schema (TBD - need to locate)
3. Run migration script to create default sections and assign existing content
4. Add indexes: `db.tutorials.createIndex({ sectionId: 1, order: 1 })`

**Rollback Strategy**:
- `sectionId` field is optional initially (allows gradual migration)
- Old sidebar continues working until new sections populated
- Backward compatible: queries without `sectionId` still return results

### Data Seeding
Seed initial sections for both blog and tutorial content types:
```javascript
// Example seed data
[
  { title: "Getting Started", icon: "IconRocket", order: 1, contentType: "tutorial" },
  { title: "Advanced Topics", icon: "IconBrain", order: 2, contentType: "tutorial" },
  { title: "Web Development", icon: "IconWorld", order: 1, contentType: "blog" },
  // ... more sections
]
```

## Open Questions Resolved

1. **Q: Should sections be shared between blogs and tutorials?**  
   A: No. Use `contentType` enum field to separate. Allows independent organization.

2. **Q: How to handle deletion of sections with child content?**  
   A: Cascade delete children OR prevent deletion with warning (prefer prevent for safety).

3. **Q: Should sidebar state sync across tabs?**  
   A: No for MVP. LocalStorage is per-tab. Future: use BroadcastChannel API.

4. **Q: How to handle real-time updates when multiple admins edit?**  
   A: Not required for MVP. Future: WebSocket or polling for live updates.

5. **Q: Should posts support multiple section assignments?**  
   A: No. Single section per post keeps model simple. Use tags for cross-categorization.

## Next Steps

- [x] Complete research documentation
- [ ] Create data model schemas (Phase 1)
- [ ] Define API contracts (Phase 1)
- [ ] Write quickstart guide (Phase 1)
- [ ] Generate implementation tasks (Phase 2)

## References

- Existing schemas: `/app/models/tutorialSchema.ts`, `/app/models/blogCommentSchema.ts`
- Mantine documentation: https://mantine.dev/
- MongoDB hierarchical data patterns: https://www.mongodb.com/docs/manual/applications/data-models-tree-structures/
- Existing Redux pattern: `/apps/web/store/slices/blogSidebarSlice.ts`
