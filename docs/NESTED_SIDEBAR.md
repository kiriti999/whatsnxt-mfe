# Nested Content Sidebar Feature

## Overview

The Nested Content Sidebar is a hierarchical navigation system that organizes blog posts and tutorials into sections and subsections. It provides an intuitive way for users to browse content and for administrators to manage content organization.

## Features

### User Features
- **Hierarchical Navigation**: Browse content organized in up to 4 levels of nested sections
- **Expand/Collapse**: Toggle section visibility to focus on specific areas
- **Two Display Variants**: Choose between Accordion (collapsible) or NavLink (flat list) styles
- **Responsive Design**: Seamless experience across mobile, tablet, and desktop devices
- **Auto-Expand**: Automatically expands parent sections when navigating to nested content
- **Persistent State**: Remembers which sections you've expanded

### Admin Features
- **Section Management**: Create, edit, and delete sections through an intuitive UI
- **Icon Selection**: Choose from 100+ Tabler icons to represent sections
- **Post Assignment**: Assign blog posts and tutorials to specific sections
- **Visibility Control**: Show/hide sections without deleting them
- **Nested Organization**: Create subsections within sections for better organization

## Quick Start

See [Quickstart Guide](/specs/001-nested-sidebar/quickstart.md) for setup instructions.

## Architecture

### Frontend Components
- `NestedSidebar`: Main container with variant support
- `AccordionVariant`: Collapsible hierarchical display
- `NavLinkVariant`: Flat list display
- `SectionItem`: Individual section renderer (memoized)

### Backend Services
- `sectionService`: CRUD operations and hierarchy management
- `slugService`: Unique slug generation
- `postsController`: Post-to-section assignment

### State Management
- Redux Toolkit with `nestedSidebarSlice`
- localStorage persistence for expanded sections
- Async thunks for API calls

## API Reference

See full API documentation in [contracts/](/specs/001-nested-sidebar/contracts/)

### Key Endpoints
- `GET /api/v1/sidebar/sections/tree` - Get hierarchical structure
- `POST /api/v1/sidebar/sections` - Create section (admin)
- `PATCH /api/v1/sidebar/posts/:id/assign` - Assign post to section

## Performance

- Sidebar load: <500ms
- Render time: <1 second  
- Expand/collapse: <300ms
- Supports: 50+ sections, 200+ posts

## Accessibility

- WCAG 2.1 Level AA compliant
- Full keyboard navigation support
- Screen reader optimized
- High contrast support

## Support

For detailed information:
- [Feature Specification](/specs/001-nested-sidebar/spec.md)
- [Technical Plan](/specs/001-nested-sidebar/plan.md)
- [Data Model](/specs/001-nested-sidebar/data-model.md)
