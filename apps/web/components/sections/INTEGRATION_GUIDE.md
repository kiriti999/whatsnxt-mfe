# Content Section Manager Integration Guide

## Overview

The `ContentSectionManager` component provides a complete section management UI for tutorial/blog editing workflows. It integrates:

- **SectionPicker**: Link existing sections to content
- **CreateSectionModal**: Create new reusable sections
- **UnlinkConfirmationModal**: Safely unlink sections with impact preview

## Components Created

1. **ContentSectionManager** (`apps/web/components/sections/ContentSectionManager.tsx`)
   - Main integration component
   - Displays linked sections
   - Provides link/create/unlink controls
   - Tasks: T025, T026, T033, T039, T042

2. **CreateSectionModal** (`apps/web/components/sections/CreateSectionModal.tsx`)
   - Modal for creating new sections
   - Auto-assigns trainerId
   - Optional auto-linking to current content
   - Tasks: T031, T034

3. **UnlinkConfirmationModal** (`apps/web/components/sections/UnlinkConfirmationModal.tsx`)
   - Confirmation dialog for unlinking
   - Shows impact (orphaned posts count)
   - Tasks: T040, T043

## Usage Example

### Basic Integration

```tsx
import { ContentSectionManager } from '@/components/sections/ContentSectionManager';

export default function TutorialEditor() {
  const tutorialId = "tutorial_123";
  const contentType = "tutorial";
  const trainerId = "trainer_456"; // from auth context
  const isEditing = true;

  return (
    <div>
      <h1>Edit Tutorial</h1>
      
      {/* Other tutorial fields... */}
      
      <ContentSectionManager
        contentId={tutorialId}
        contentType={contentType}
        trainerId={trainerId}
        isEditing={isEditing}
        showPostCounts={true}
      />
    </div>
  );
}
```

### Integration with Admin Sidebar Management

```tsx
// In apps/web/app/admin/sidebar-management/page.tsx
// or apps/web/app/admin/content-editor/page.tsx

import { ContentSectionManager } from '@/components/sections/ContentSectionManager';

export default function ContentEditorPage() {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'blog' | 'tutorial'>('tutorial');
  
  return (
    <Container>
      {/* Content selection UI */}
      
      {selectedContent && (
        <ContentSectionManager
          contentId={selectedContent}
          contentType={contentType}
          trainerId={currentUser.id}
          isEditing={true}
          showPostCounts={true}
        />
      )}
    </Container>
  );
}
```

### Props Reference

```tsx
interface ContentSectionManagerProps {
  contentId: string;           // ID of tutorial/blog being edited
  contentType: 'blog' | 'tutorial';
  trainerId: string;           // Current user's trainer ID (from auth)
  isEditing?: boolean;         // Show management controls (default: false)
  showPostCounts?: boolean;    // Show post counts per section (default: false)
}
```

## Features

### 1. Link Existing Section (US1)
- Click "Link Section" button
- Opens SectionPicker modal
- Filters sections by trainer ownership
- Shows usage statistics
- Success notification after linking

### 2. Create New Section (US2)
- Click "Create Section" button
- Opens CreateSectionModal
- Auto-assigns trainerId from current user
- Optional auto-link to current content
- Section added to trainer's library

### 3. Unlink Section (US3)
- Click trash icon next to section
- Opens UnlinkConfirmationModal
- Shows impact preview (orphaned posts)
- Confirms action with explanations
- Section remains in library for reuse

## API Dependencies

All API clients are already implemented:

- `SectionsAPI.getByTrainer()` - Get sections owned by trainer (T023)
- `SectionsAPI.createSection()` - Create new section (T032)
- `SectionLinksAPI.getLinksWithDetails()` - Get linked sections (T022)
- `SectionLinksAPI.createLink()` - Link section to content (T022)
- `SectionLinksAPI.deleteLink()` - Unlink section (T041)

## State Management

The component manages its own state and provides callbacks:

```tsx
<ContentSectionManager
  contentId={contentId}
  contentType={contentType}
  trainerId={trainerId}
  isEditing={true}
  
  // Optional: Custom refresh logic
  // (Component auto-refreshes after mutations)
/>
```

## Styling

Uses Mantine components for consistent styling:
- Paper, Stack, Group for layout
- Button, ActionIcon for controls
- Badge for counts and status
- Alert for empty states
- LoadingOverlay for async operations

## Testing Workflow

1. **Link Existing Section**
   - Open tutorial editor
   - Click "Link Section"
   - Select section from picker
   - Verify section appears in list

2. **Create New Section**
   - Click "Create Section"
   - Fill in title, description, icon
   - Enable "Link to current tutorial"
   - Verify section is created and linked

3. **Unlink Section**
   - Click trash icon next to section
   - Review impact (orphaned posts)
   - Confirm unlink
   - Verify section removed from list
   - Check "Unassigned Posts" for orphans

## Next Steps

To complete US1-US3 integration:

1. Add ContentSectionManager to actual tutorial/blog editors:
   - `apps/web/app/form/tutorial/page.tsx`
   - `apps/web/app/form/blog/page.tsx`
   - Or relevant edit/create pages

2. Get trainerId from authentication context:
   ```tsx
   const { user } = useAuth();
   const trainerId = user?.trainerId || user?.id;
   ```

3. Pass content ID from route params or state:
   ```tsx
   const searchParams = useSearchParams();
   const contentId = searchParams.get('id');
   ```

4. Enable editing mode conditionally:
   ```tsx
   const isEditing = !!contentId; // Edit mode if ID present
   ```

## Files Modified

- ✅ Created: `apps/web/components/sections/ContentSectionManager.tsx`
- ✅ Created: `apps/web/components/sections/CreateSectionModal.tsx`
- ✅ Created: `apps/web/components/sections/UnlinkConfirmationModal.tsx`
- ✅ Updated: `specs/002-reusable-sections/tasks.md` (marked T025-T043 complete)

## Completed Tasks

- T025: Link existing section button ✅
- T026: Display only linked sections ✅
- T027: Success notification ✅
- T031: CreateSectionModal component ✅
- T032: createSection API method ✅ (already exists)
- T033: Create new section button ✅
- T034: Auto-link after creation ✅
- T035: Refresh section list ✅
- T039: Unlink button ✅
- T040: UnlinkConfirmationModal ✅
- T041: deleteLink API ✅ (already exists)
- T042: Remove from display ✅
- T043: Notification with orphan count ✅

**US1, US2, and US3 frontend implementation complete!** 🎉
