# Implementation Plan: Nested Content Sidebar

**Branch**: `001-nested-sidebar` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-nested-sidebar/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a hierarchical, collapsible sidebar navigation system for organizing and browsing blog posts and tutorials. The system supports multi-level nesting (sections → subsections → posts), drag-and-drop reordering, two display variants (NavLink and Accordion styles), and a complete admin interface for content organization. The implementation leverages the existing Mantine UI component library, Redux Toolkit state management, and Mongoose-based MongoDB backend with Express.js API routes.

## Technical Context

**Language/Version**: 
- Frontend: TypeScript 5.8.2 with React 19 / Next.js 16
- Backend: TypeScript with Node.js 24.11.0

**Primary Dependencies**: 
- Frontend: Mantine 8.3.10 (UI components), Redux Toolkit 2.8.2 (state management), @mantine/form 8.3.10 (form handling), @mantine/notifications 8.3.10 (toast system), @mantine/modals 8.3.10 (modal dialogs), @dnd-kit 6.3.1 (drag-and-drop), @tabler/icons-react 3.34.0 (icon library)
- Backend: Express 5.0.0, Mongoose 8.21.0 (MongoDB ODM), class-validator 0.14.1 (validation)

**Storage**: MongoDB 7.0+ with Mongoose schemas (existing patterns in tutorialSchema.ts, blogCommentSchema.ts)

**Testing**: Vitest (both frontend and backend have vitest.config.ts configured)

**Target Platform**: Web application (modern browsers: Chrome, Firefox, Safari, Edge - last 2 versions)

**Project Type**: Web (separate frontend/backend monorepo structure with pnpm workspaces)

**Performance Goals**: 
- Sidebar data load: <500ms API response time
- Sidebar initial render: <1 second
- Expand/collapse animations: <300ms
- Support 50+ sections with 200+ total posts without degradation

**Constraints**: 
- Sidebar max width: 400px on desktop
- Maximum nesting depth: 4 levels
- Section titles: max 100 characters
- Slug length: max 150 characters
- WCAG 2.1 Level AA accessibility compliance
- Must work with keyboard-only navigation

**Scale/Scope**: 
- Expected <1000 total sidebar items
- 50-100 concurrent admin users
- Multi-tenant support (blog vs tutorial content types)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Status**: ✅ PASS (Constitution template is empty/not defined - no violations possible)

The project constitution file (`.specify/memory/constitution.md`) contains only placeholder content with no actual project-specific principles or constraints defined. Therefore, there are no constitutional requirements to validate against.

**Post-Design Re-check**: Will be performed after Phase 1 completes to ensure design artifacts don't introduce any issues that would require a constitution definition.

## Project Structure

### Documentation (this feature)

```text
specs/001-nested-sidebar/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - technology decisions
├── data-model.md        # Phase 1 output - MongoDB schemas
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API contracts
│   ├── sections.openapi.yaml
│   ├── posts.openapi.yaml
│   └── icons.openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Frontend Repository**: `/Users/arjun/whatsnxt-mfe` (Next.js monorepo with pnpm workspaces)

```text
apps/web/
├── app/
│   ├── admin/
│   │   └── sidebar-management/    # NEW: Admin interface for section CRUD
│   │       ├── page.tsx           # Main management page
│   │       └── components/        # Section forms, modals
│   ├── blogs/                     # Existing blog pages
│   └── tutorials/                 # Existing tutorial pages
│
├── components/
│   ├── Blog/
│   │   └── NestedSidebar/         # NEW: Reusable sidebar components
│   │       ├── index.tsx          # Main sidebar container
│   │       ├── NavLinkVariant.tsx # Flat link style variant
│   │       ├── AccordionVariant.tsx # Collapsible panel variant
│   │       ├── SectionItem.tsx    # Individual section renderer
│   │       └── styles.module.css  # Sidebar styling
│   └── Admin/
│       └── SidebarForms/          # NEW: Admin form components
│           ├── SectionForm.tsx    # Create/edit section
│           ├── PostAssignment.tsx # Assign posts to sections
│           └── IconPicker.tsx     # Icon selection UI
│
├── store/slices/
│   └── nestedSidebarSlice.ts      # NEW: Redux state for sidebar navigation
│
├── apis/v1/
│   └── sidebar/
│       ├── sectionsApi.ts         # NEW: Section CRUD API client
│       └── iconsApi.ts            # NEW: Icon fetching API client
│
└── hooks/
    └── useSidebarState.ts         # NEW: Custom hook for sidebar state
```

**Backend Repository**: `/Users/arjun/whatsnxt-bff` (Express.js TypeScript API)

```text
app/
├── models/
│   ├── sectionSchema.ts           # NEW: Section entity schema
│   ├── iconSchema.ts              # NEW: Available icons schema
│   ├── tutorialSchema.ts          # MODIFIED: Add sectionId reference
│   └── [blog model TBD]           # MODIFIED: Add sectionId reference
│
├── routes/
│   └── sidebar/
│       ├── sections.routes.ts     # NEW: Section CRUD endpoints
│       ├── icons.routes.ts        # NEW: Icon listing endpoint
│       └── index.ts               # Route aggregator
│
├── controllers/
│   └── sidebar/
│       ├── sectionsController.ts  # NEW: Section business logic
│       └── iconsController.ts     # NEW: Icon fetching logic
│
├── services/
│   └── sidebar/
│       ├── sectionService.ts      # NEW: Section operations & validation
│       └── slugService.ts         # NEW: Slug generation & uniqueness
│
└── middleware/
    └── validation/
        └── sectionValidation.ts   # NEW: Request validation schemas
```

**Structure Decision**: The project follows a **web application structure** with separate frontend (Next.js) and backend (Express.js) repositories. The frontend uses the Next.js App Router pattern (`apps/web/app/`), Mantine component library, and Redux Toolkit for state management. The backend uses Express.js with Mongoose for MongoDB operations and TypeScript for type safety. Both projects are in monorepo configurations with workspace packages.

## Complexity Tracking

**No violations to track**: The constitution file contains only placeholder content with no defined principles. This feature follows standard web application patterns (CRUD operations, hierarchical data, REST API) without introducing unusual complexity.
