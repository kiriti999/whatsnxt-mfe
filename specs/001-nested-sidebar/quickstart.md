# Quickstart Guide: Nested Content Sidebar

**Feature**: 001-nested-sidebar  
**Date**: 2025-01-27  
**For**: Developers implementing the nested sidebar feature

## Overview

This guide provides step-by-step instructions for implementing the nested content sidebar feature, from database setup to frontend component integration. Follow these steps in order for a smooth development experience.

## Prerequisites

- **Backend**: Node.js 24.11.0, MongoDB 7.0+, Redis running
- **Frontend**: Node.js 18+, pnpm 9.0.0
- **Tools**: Git, MongoDB Compass (optional for DB inspection)
- **Access**: Admin credentials for testing admin features
- **Knowledge**: TypeScript, React, Express.js, Mongoose, Mantine UI

## Project Structure Quick Reference

```
Frontend: /Users/arjun/whatsnxt-mfe/apps/web/
Backend:  /Users/arjun/whatsnxt-bff/app/
Specs:    /Users/arjun/whatsnxt-mfe/specs/001-nested-sidebar/
```

## Development Workflow

### Phase 1: Backend Setup (Day 1-2)

#### 1.1 Create Database Schemas

**Location**: `/Users/arjun/whatsnxt-bff/app/models/`

```bash
cd /Users/arjun/whatsnxt-bff/app/models

# Create the new schema files
# Reference: specs/001-nested-sidebar/data-model.md
```

**Files to create**:
- `sectionSchema.ts` - Main section entity
- `iconSchema.ts` - Icon library

**Files to modify**:
- `tutorialSchema.ts` - Add sectionId and sectionOrder fields
- `[blog schema]` - Add same fields (locate blog schema first)

**Key implementation notes**:
- Use the exact schemas from `data-model.md`
- Ensure all indexes are created
- Test pre-save hooks for depth calculation

**Validation checklist**:
```bash
# Start MongoDB
brew services start mongodb-community@7.0

# Test schema in Node REPL
node
> const mongoose = require('mongoose');
> mongoose.connect('mongodb://localhost:27017/whatsnxt-local');
> require('./sectionSchema.ts');
> // Verify model loads without errors
```

#### 1.2 Create Migration Scripts

**Location**: `/Users/arjun/whatsnxt-bff/scripts/`

Create three migration scripts:

```bash
mkdir -p /Users/arjun/whatsnxt-bff/scripts/migrations
cd /Users/arjun/whatsnxt-bff/scripts/migrations
```

**Script 1**: `001-seed-icons.ts`
```typescript
// Seed curated icon library (~50 icons)
// Reference: data-model.md "Icon Library Seeding" section
```

**Script 2**: `002-seed-default-sections.ts`
```typescript
// Create default top-level sections for blog and tutorial
// Reference: data-model.md "Initial Section Seeding" section
```

**Script 3**: `003-migrate-existing-posts.ts`
```typescript
// Add sectionId to existing tutorials and blogs
// Assign to "Uncategorized" section by default
// Reference: data-model.md "Add sectionId to Existing Tutorials" section
```

**Run migrations**:
```bash
# Make sure you're in dev environment
export NODE_ENV=local

# Run in order
ts-node scripts/migrations/001-seed-icons.ts
ts-node scripts/migrations/002-seed-default-sections.ts
ts-node scripts/migrations/003-migrate-existing-posts.ts

# Verify in MongoDB
mongosh whatsnxt-local
> db.icons.countDocuments()
> db.sections.find().pretty()
> db.tutorials.findOne({ sectionId: { $exists: true } })
```

#### 1.3 Create Service Layer

**Location**: `/Users/arjun/whatsnxt-bff/app/services/sidebar/`

```bash
mkdir -p /Users/arjun/whatsnxt-bff/app/services/sidebar
cd /Users/arjun/whatsnxt-bff/app/services/sidebar
```

**Files to create**:

**`sectionService.ts`**:
```typescript
// Business logic for section CRUD operations
// Functions:
// - createSection(data): Generate slug, validate depth, save
// - updateSection(id, data): Recalculate depth if parent changed
// - deleteSection(id): Check for children/posts, handle cascade
// - getSectionTree(contentType): Build hierarchy
// - reorderSections(updates): Bulk update order fields
// - getBreadcrumb(sectionId): Get ancestor trail
```

**`slugService.ts`**:
```typescript
// Slug generation and uniqueness checking
// Functions:
// - generateUniqueSlug(title, excludeId?): Auto-increment on duplicates
// - slugify(text): Convert to URL-friendly format
// - isSlugUnique(slug, excludeId?): Check existence
```

**Testing**:
```bash
# Create test file
touch /Users/arjun/whatsnxt-bff/app/services/sidebar/__tests__/sectionService.test.ts

# Run tests
npm test -- sectionService.test.ts
```

#### 1.4 Create Controllers

**Location**: `/Users/arjun/whatsnxt-bff/app/controllers/sidebar/`

```bash
mkdir -p /Users/arjun/whatsnxt-bff/app/controllers/sidebar
cd /Users/arjun/whatsnxt-bff/app/controllers/sidebar
```

**Files to create**:
- `sectionsController.ts` - HTTP handlers for section endpoints
- `iconsController.ts` - HTTP handlers for icon endpoints

**Pattern to follow**:
```typescript
// Example structure
export class SectionsController {
  async list(req, res) {
    try {
      const { contentType, parentId, isVisible } = req.query;
      const sections = await sectionService.getSections({ contentType, parentId, isVisible });
      res.json({ success: true, data: sections });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  async create(req, res) { /* ... */ }
  async getById(req, res) { /* ... */ }
  async update(req, res) { /* ... */ }
  async delete(req, res) { /* ... */ }
  async getTree(req, res) { /* ... */ }
  async reorder(req, res) { /* ... */ }
  async getBreadcrumb(req, res) { /* ... */ }
}
```

#### 1.5 Create Validation Middleware

**Location**: `/Users/arjun/whatsnxt-bff/app/middleware/validation/`

```bash
cd /Users/arjun/whatsnxt-bff/app/middleware/validation
```

**File to create**: `sectionValidation.ts`

```typescript
import { body, param, query } from 'class-validator';

export const validateSectionCreate = [
  body('title').isLength({ min: 1, max: 100 }).trim(),
  body('iconName').notEmpty(),
  body('contentType').isIn(['blog', 'tutorial']),
  body('parentId').optional().isMongoId(),
  body('order').optional().isInt({ min: 0 }),
  // ... add all validation rules
];

export const validateSectionUpdate = [ /* ... */ ];
export const validateSectionDelete = [ /* ... */ ];
```

#### 1.6 Create Routes

**Location**: `/Users/arjun/whatsnxt-bff/app/routes/sidebar/`

```bash
mkdir -p /Users/arjun/whatsnxt-bff/app/routes/sidebar
cd /Users/arjun/whatsnxt-bff/app/routes/sidebar
```

**Files to create**:
- `sections.routes.ts`
- `icons.routes.ts`
- `index.ts` (route aggregator)

**sections.routes.ts example**:
```typescript
import { Router } from 'express';
import { SectionsController } from '../../controllers/sidebar/sectionsController';
import { authMiddleware } from '../../middleware/auth';
import { validateSectionCreate } from '../../middleware/validation/sectionValidation';

const router = Router();
const controller = new SectionsController();

// Public routes
router.get('/sections', controller.list);
router.get('/sections/tree', controller.getTree);
router.get('/sections/:id', controller.getById);
router.get('/sections/:id/breadcrumb', controller.getBreadcrumb);

// Protected routes (admin only)
router.post('/sections', authMiddleware, validateSectionCreate, controller.create);
router.put('/sections/:id', authMiddleware, controller.update);
router.delete('/sections/:id', authMiddleware, controller.delete);
router.patch('/sections/reorder', authMiddleware, controller.reorder);

export default router;
```

**index.ts aggregator**:
```typescript
import { Router } from 'express';
import sectionsRouter from './sections.routes';
import iconsRouter from './icons.routes';

const router = Router();

router.use('/sidebar', sectionsRouter);
router.use('/sidebar', iconsRouter);

export default router;
```

**Register in main app**:
```typescript
// In /Users/arjun/whatsnxt-bff/server.ts
import sidebarRoutes from './app/routes/sidebar';
app.use('/api/v1', sidebarRoutes);
```

#### 1.7 Test Backend API

```bash
# Start backend server
cd /Users/arjun/whatsnxt-bff
npm run dev

# Test endpoints with curl or Postman
# Reference: contracts/*.openapi.yaml for request/response formats

# Example: List sections
curl http://localhost:4444/api/v1/sidebar/sections?contentType=blog

# Example: Create section (requires auth token)
curl -X POST http://localhost:4444/api/v1/sidebar/sections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"JavaScript Basics","iconName":"IconCode","contentType":"tutorial","order":1}'

# Example: Get tree
curl http://localhost:4444/api/v1/sidebar/sections/tree?contentType=tutorial
```

**Checkpoint**: Backend API should be fully functional before moving to frontend.

---

### Phase 2: Frontend Setup (Day 3-4)

#### 2.1 Create API Client

**Location**: `/Users/arjun/whatsnxt-mfe/apps/web/apis/v1/sidebar/`

```bash
cd /Users/arjun/whatsnxt-mfe/apps/web/apis/v1
mkdir sidebar
cd sidebar
```

**Files to create**:
- `sectionsApi.ts`
- `iconsApi.ts`

**sectionsApi.ts example**:
```typescript
import { httpClient } from '@whatsnxt/http-client';

const BASE_URL = '/api/v1/sidebar';

export const SectionsAPI = {
  list: async (params?: { contentType?: string; parentId?: string; isVisible?: boolean }) => {
    const response = await httpClient.get(`${BASE_URL}/sections`, { params });
    return response.data;
  },

  getTree: async (contentType: 'blog' | 'tutorial', includePosts = false) => {
    const response = await httpClient.get(`${BASE_URL}/sections/tree`, {
      params: { contentType, includePosts }
    });
    return response.data;
  },

  create: async (data: SectionCreateDTO) => {
    const response = await httpClient.post(`${BASE_URL}/sections`, data);
    return response.data;
  },

  update: async (id: string, data: SectionUpdateDTO) => {
    const response = await httpClient.put(`${BASE_URL}/sections/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await httpClient.delete(`${BASE_URL}/sections/${id}`);
    return response.data;
  },

  reorder: async (updates: Array<{ _id: string; order: number }>) => {
    const response = await httpClient.patch(`${BASE_URL}/sections/reorder`, { updates });
    return response.data;
  },

  getBreadcrumb: async (id: string) => {
    const response = await httpClient.get(`${BASE_URL}/sections/${id}/breadcrumb`);
    return response.data;
  },
};

// TypeScript types
export interface SectionCreateDTO {
  title: string;
  iconName: string;
  contentType: 'blog' | 'tutorial';
  parentId?: string | null;
  order?: number;
  description?: string;
  isVisible?: boolean;
}

export interface SectionUpdateDTO {
  title?: string;
  iconName?: string;
  parentId?: string | null;
  order?: number;
  description?: string;
  isVisible?: boolean;
}
```

#### 2.2 Create Redux Slice

**Location**: `/Users/arjun/whatsnxt-mfe/apps/web/store/slices/`

```bash
cd /Users/arjun/whatsnxt-mfe/apps/web/store/slices
```

**File to create**: `nestedSidebarSlice.ts`

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SectionsAPI } from '../../apis/v1/sidebar/sectionsApi';

// Types
interface Section {
  _id: string;
  title: string;
  slug: string;
  iconName: string;
  parentId: string | null;
  order: number;
  contentType: 'blog' | 'tutorial';
  depth: number;
  childCount: number;
  postCount: number;
  isVisible: boolean;
  children?: Section[];
  posts?: any[];
}

interface NestedSidebarState {
  sections: {
    byId: Record<string, Section>;
    allIds: string[];
  };
  tree: Section[];
  expandedSections: Set<string>;
  activePath: string[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: NestedSidebarState = {
  sections: { byId: {}, allIds: [] },
  tree: [],
  expandedSections: new Set<string>(),
  activePath: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchSidebarTree = createAsyncThunk(
  'nestedSidebar/fetchTree',
  async ({ contentType, includePosts }: { contentType: 'blog' | 'tutorial'; includePosts?: boolean }) => {
    const response = await SectionsAPI.getTree(contentType, includePosts);
    return response.data;
  }
);

export const createSection = createAsyncThunk(
  'nestedSidebar/create',
  async (data: any) => {
    const response = await SectionsAPI.create(data);
    return response.data;
  }
);

// Slice
const nestedSidebarSlice = createSlice({
  name: 'nestedSidebar',
  initialState,
  reducers: {
    toggleSection: (state, action: PayloadAction<string>) => {
      const sectionId = action.payload;
      if (state.expandedSections.has(sectionId)) {
        state.expandedSections.delete(sectionId);
      } else {
        state.expandedSections.add(sectionId);
      }
      // Persist to localStorage
      localStorage.setItem('sidebar_expanded', JSON.stringify([...state.expandedSections]));
    },
    
    expandToSection: (state, action: PayloadAction<string>) => {
      // Auto-expand all ancestors of a section
      const sectionId = action.payload;
      const expandAncestors = (id: string) => {
        const section = state.sections.byId[id];
        if (section && section.parentId) {
          state.expandedSections.add(section.parentId);
          expandAncestors(section.parentId);
        }
      };
      expandAncestors(sectionId);
    },
    
    setActivePath: (state, action: PayloadAction<string[]>) => {
      state.activePath = action.payload;
    },
    
    loadExpandedFromStorage: (state) => {
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved) {
        state.expandedSections = new Set(JSON.parse(saved));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSidebarTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSidebarTree.fulfilled, (state, action) => {
        state.tree = action.payload;
        // Normalize into byId/allIds
        const normalize = (sections: Section[]) => {
          sections.forEach(section => {
            state.sections.byId[section._id] = section;
            state.sections.allIds.push(section._id);
            if (section.children) {
              normalize(section.children);
            }
          });
        };
        state.sections.byId = {};
        state.sections.allIds = [];
        normalize(action.payload);
        state.loading = false;
      })
      .addCase(fetchSidebarTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load sidebar';
      });
  },
});

export const { toggleSection, expandToSection, setActivePath, loadExpandedFromStorage } = nestedSidebarSlice.actions;
export const nestedSidebarReducer = nestedSidebarSlice.reducer;
```

**Register slice in store**:
```typescript
// In /Users/arjun/whatsnxt-mfe/apps/web/store/store.ts
import { nestedSidebarReducer } from './slices/nestedSidebarSlice';

export const store = configureStore({
  reducer: {
    // ... existing reducers
    nestedSidebar: nestedSidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['nestedSidebar/toggleSection'],
        ignoredPaths: ['nestedSidebar.expandedSections'],
      },
    }),
});
```

#### 2.3 Create Sidebar Components

**Location**: `/Users/arjun/whatsnxt-mfe/apps/web/components/Blog/NestedSidebar/`

```bash
cd /Users/arjun/whatsnxt-mfe/apps/web/components/Blog
mkdir NestedSidebar
cd NestedSidebar
```

**Files to create**:

**`index.tsx`** - Main container:
```typescript
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSidebarTree, loadExpandedFromStorage } from '@/store/slices/nestedSidebarSlice';
import { NavLinkVariant } from './NavLinkVariant';
import { AccordionVariant } from './AccordionVariant';

interface NestedSidebarProps {
  contentType: 'blog' | 'tutorial';
  variant?: 'navlink' | 'accordion';
}

export function NestedSidebar({ contentType, variant = 'accordion' }: NestedSidebarProps) {
  const dispatch = useAppDispatch();
  const { tree, loading, error } = useAppSelector((state) => state.nestedSidebar);

  useEffect(() => {
    dispatch(loadExpandedFromStorage());
    dispatch(fetchSidebarTree({ contentType, includePosts: true }));
  }, [contentType, dispatch]);

  if (loading) return <div>Loading sidebar...</div>;
  if (error) return <div>Error: {error}</div>;

  return variant === 'navlink' ? (
    <NavLinkVariant tree={tree} />
  ) : (
    <AccordionVariant tree={tree} />
  );
}
```

**`AccordionVariant.tsx`** - Collapsible panels:
```typescript
import { Accordion } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSection } from '@/store/slices/nestedSidebarSlice';
import { SectionItem } from './SectionItem';
import type { Section } from '@/types/sidebar';

export function AccordionVariant({ tree }: { tree: Section[] }) {
  const dispatch = useAppDispatch();
  const expandedSections = useAppSelector((state) => state.nestedSidebar.expandedSections);

  const renderSection = (section: Section) => (
    <Accordion.Item key={section._id} value={section._id}>
      <Accordion.Control>
        <SectionItem section={section} />
      </Accordion.Control>
      <Accordion.Panel>
        {/* Render posts */}
        {section.posts?.map(post => (
          <div key={post._id}>{post.title}</div>
        ))}
        {/* Render child sections recursively */}
        {section.children && section.children.length > 0 && (
          <Accordion>{section.children.map(renderSection)}</Accordion>
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );

  return (
    <Accordion
      multiple
      value={[...expandedSections]}
      onChange={(values) => {
        // Handle expand/collapse
        values.forEach(id => {
          if (!expandedSections.has(id)) {
            dispatch(toggleSection(id));
          }
        });
      }}
    >
      {tree.map(renderSection)}
    </Accordion>
  );
}
```

**`SectionItem.tsx`** - Individual section renderer:
```typescript
import { Group, Text } from '@mantine/core';
import * as TablerIcons from '@tabler/icons-react';
import type { Section } from '@/types/sidebar';

export function SectionItem({ section }: { section: Section }) {
  const IconComponent = (TablerIcons as any)[section.iconName] || TablerIcons.IconFolder;

  return (
    <Group>
      <IconComponent size={20} />
      <Text>{section.title}</Text>
      {section.postCount > 0 && (
        <Text size="sm" c="dimmed">({section.postCount})</Text>
      )}
    </Group>
  );
}
```

**`styles.module.css`**:
```css
.sidebar {
  max-width: 400px;
  height: 100vh;
  overflow-y: auto;
}

.sectionItem {
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.sectionItem:hover {
  background-color: var(--mantine-color-gray-1);
}

.sectionItem.active {
  background-color: var(--mantine-color-blue-1);
  border-left: 3px solid var(--mantine-color-blue-6);
}

.postItem {
  padding-left: 2rem;
  padding: 0.375rem 1rem;
}

.postItem:hover {
  background-color: var(--mantine-color-gray-0);
}

.nested {
  margin-left: 1.5rem;
}
```

#### 2.4 Create Admin Interface

**Location**: `/Users/arjun/whatsnxt-mfe/apps/web/app/admin/sidebar-management/`

```bash
cd /Users/arjun/whatsnxt-mfe/apps/web/app/admin
mkdir sidebar-management
cd sidebar-management
```

**Files to create**:
- `page.tsx` - Main admin page
- `components/SectionForm.tsx` - Create/edit modal
- `components/IconPicker.tsx` - Icon selection UI
- `components/SectionList.tsx` - Manage existing sections

**page.tsx**:
```typescript
'use client';

import { Button, Container, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { SectionList } from './components/SectionList';
import { SectionForm } from './components/SectionForm';

export default function SidebarManagementPage() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="xl">Sidebar Management</Title>
      
      <Button onClick={open} mb="lg">Create New Section</Button>
      
      <SectionList />
      
      <SectionForm opened={opened} onClose={close} />
    </Container>
  );
}
```

**components/SectionForm.tsx**:
```typescript
import { Modal, TextInput, Select, Button, NumberInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch } from '@/store/hooks';
import { createSection } from '@/store/slices/nestedSidebarSlice';
import { IconPicker } from './IconPicker';

export function SectionForm({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  
  const form = useForm({
    initialValues: {
      title: '',
      description: '',
      iconName: 'IconFolder',
      contentType: 'blog',
      parentId: null,
      order: 0,
      isVisible: true,
    },
    validate: {
      title: (value) => value.length === 0 ? 'Title is required' : null,
      title: (value) => value.length > 100 ? 'Title must be 100 chars or less' : null,
      iconName: (value) => !value ? 'Icon is required' : null,
    },
  });

  const handleSubmit = async (values: any) => {
    try {
      await dispatch(createSection(values)).unwrap();
      notifications.show({
        title: 'Success',
        message: 'Section created successfully',
        color: 'green',
      });
      form.reset();
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to create section',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Section" size="lg">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Title"
          placeholder="JavaScript Basics"
          required
          {...form.getInputProps('title')}
        />
        
        <Textarea
          label="Description"
          placeholder="Optional description..."
          mt="md"
          {...form.getInputProps('description')}
        />
        
        <IconPicker
          value={form.values.iconName}
          onChange={(iconName) => form.setFieldValue('iconName', iconName)}
        />
        
        <Select
          label="Content Type"
          data={[
            { value: 'blog', label: 'Blog' },
            { value: 'tutorial', label: 'Tutorial' },
          ]}
          {...form.getInputProps('contentType')}
        />
        
        <NumberInput
          label="Display Order"
          min={0}
          {...form.getInputProps('order')}
        />
        
        <Button type="submit" mt="xl" fullWidth>
          Create Section
        </Button>
      </form>
    </Modal>
  );
}
```

#### 2.5 Integrate Sidebar into Blog/Tutorial Pages

**For Blog Pages**: `/Users/arjun/whatsnxt-mfe/apps/web/app/blogs/layout.tsx`

```typescript
import { NestedSidebar } from '@/components/Blog/NestedSidebar';
import { AppShell } from '@mantine/core';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      navbar={{
        width: { sm: 300, lg: 350 },
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar>
        <NestedSidebar contentType="blog" variant="accordion" />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
```

**For Tutorial Pages**: Similar integration in `/app/tutorials/layout.tsx`

---

### Phase 3: Testing & Polish (Day 5)

#### 3.1 Backend Testing

```bash
cd /Users/arjun/whatsnxt-bff

# Run test suite
npm test

# Test specific features
npm test -- sectionService.test.ts
npm test -- sectionsController.test.ts
npm test -- slugService.test.ts
```

**Create tests for**:
- Slug uniqueness (duplicate titles get numeric suffix)
- Max depth validation (error at 5th level)
- Cascade delete prevention
- Reorder operation
- Breadcrumb trail generation

#### 3.2 Frontend Testing

```bash
cd /Users/arjun/whatsnxt-mfe/apps/web

# Run test suite
npm test

# Test specific components
npm test -- NestedSidebar.test.tsx
```

**Create tests for**:
- Section expand/collapse
- Active path highlighting
- Icon picker search
- Form validation
- Redux state updates

#### 3.3 Manual Testing Checklist

**User Story 1: Browse Navigation**
- [ ] Sidebar displays all sections hierarchically
- [ ] Current page is visually highlighted
- [ ] Clicking section expands/collapses it
- [ ] Clicking post navigates to that page
- [ ] Parent sections auto-expand for active post

**User Story 2: Content Management**
- [ ] Create section modal opens and validates
- [ ] Icon picker displays and filters icons
- [ ] Slug auto-generates from title
- [ ] Form submission succeeds with success notification
- [ ] Edit pre-fills form with current values
- [ ] Delete shows confirmation and succeeds
- [ ] Validation errors display clearly

**User Story 3: Nested Content**
- [ ] Creating subsection nests correctly
- [ ] Assigning posts shows them in sidebar
- [ ] Hierarchy visible with proper indentation
- [ ] Deep nesting works up to 4 levels

**User Story 4: Sidebar Variants**
- [ ] NavLink style shows all as flat list
- [ ] Accordion style allows collapse
- [ ] Switching variants preserves active state

**User Story 5: Responsive**
- [ ] Mobile: sidebar in drawer with toggle
- [ ] Tablet: collapsible sidebar
- [ ] Desktop: fixed sidebar visible

#### 3.4 Performance Testing

```bash
# Load test with many sections
# Create 50 sections with 200 posts total

# Frontend: Check render performance
# Use React DevTools Profiler
# Target: <100ms for sidebar render

# Backend: Check query performance
# Use MongoDB explain plan
# Target: <100ms for tree query

mongosh whatsnxt-local
> db.sections.find({ contentType: "blog", isVisible: true }).explain("executionStats")
```

---

## Common Issues & Solutions

### Issue 1: Icons Not Displaying
**Symptom**: Icon names don't resolve to components  
**Solution**: Ensure dynamic import or use Icon component wrapper:
```typescript
import * as TablerIcons from '@tabler/icons-react';
const IconComponent = (TablerIcons as any)[iconName] || TablerIcons.IconFolder;
```

### Issue 2: Depth Validation Not Working
**Symptom**: Can create 5+ levels of nesting  
**Solution**: Check pre-save hook runs and validates parent depth:
```typescript
sectionSchema.pre('save', async function(next) {
  if (this.parentId) {
    const parent = await Section.findById(this.parentId);
    this.depth = parent.depth + 1;
    if (this.depth > 3) return next(new Error('Max depth exceeded'));
  }
  next();
});
```

### Issue 3: Expanded State Not Persisting
**Symptom**: Sidebar collapses on page refresh  
**Solution**: Load from localStorage on mount:
```typescript
useEffect(() => {
  dispatch(loadExpandedFromStorage());
}, []);
```

### Issue 4: Slug Collisions
**Symptom**: Duplicate slug errors  
**Solution**: Ensure slug service increments properly:
```typescript
let counter = 2;
while (await Section.findOne({ slug, _id: { $ne: excludeId } })) {
  slug = `${baseSlug}-${counter}`;
  counter++;
}
```

### Issue 5: MongoDB Connection Issues
**Symptom**: "MongoNetworkError" or timeout  
**Solution**:
```bash
# Check MongoDB is running
brew services list | grep mongodb

# Restart if needed
brew services restart mongodb-community@7.0

# Verify connection string in .env
# Should be: mongodb://localhost:27017/whatsnxt-local
```

---

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing (backend + frontend)
- [ ] Migration scripts tested on staging DB
- [ ] Icons seeded in staging
- [ ] Environment variables set (production MongoDB URL)
- [ ] Build succeeds without errors

### Backend Deployment
```bash
cd /Users/arjun/whatsnxt-bff

# Build TypeScript
npm run build

# Run migrations on production
NODE_ENV=prod ts-node scripts/migrations/001-seed-icons.ts
NODE_ENV=prod ts-node scripts/migrations/002-seed-default-sections.ts
NODE_ENV=prod ts-node scripts/migrations/003-migrate-existing-posts.ts

# Deploy
npm run deploy
```

### Frontend Deployment
```bash
cd /Users/arjun/whatsnxt-mfe

# Build
npm run build

# Deploy to Vercel
npm run deploy
```

### Post-deployment Verification
- [ ] API endpoints responding (check /api/v1/sidebar/sections/tree)
- [ ] Sidebar renders on blog pages
- [ ] Admin can create sections
- [ ] Existing posts display correctly
- [ ] No console errors in browser
- [ ] Performance metrics acceptable (sidebar loads <1s)

---

## Reference Documents

- **Feature Spec**: `specs/001-nested-sidebar/spec.md`
- **Data Models**: `specs/001-nested-sidebar/data-model.md`
- **Research Decisions**: `specs/001-nested-sidebar/research.md`
- **API Contracts**: `specs/001-nested-sidebar/contracts/`
- **Implementation Plan**: `specs/001-nested-sidebar/plan.md`

## Support & Resources

- **Mantine Docs**: https://mantine.dev/
- **Redux Toolkit**: https://redux-toolkit.js.org/
- **Mongoose Docs**: https://mongoosejs.com/
- **Tabler Icons**: https://tabler.io/icons

## Next Steps After Implementation

1. Run `/speckit.tasks` command to generate detailed task breakdown
2. Execute tasks in dependency order
3. Create GitHub issues if using issue tracking
4. Monitor performance in production
5. Gather user feedback on sidebar UX
6. Plan iterative improvements (drag-and-drop reordering, search, etc.)

---

**Happy Coding!** 🚀

For questions or issues, refer to the research and planning documents or consult with the team lead.
