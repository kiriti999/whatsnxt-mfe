# Quickstart Guide: Auto-Create Page After 3 Questions

**Feature**: 003-auto-page-creation  
**Date**: 2025-01-17  
**Audience**: Developers implementing this feature

## Overview

This feature automatically creates and redirects to a new lab page after an instructor saves the 3rd question on the current page. It eliminates manual navigation overhead and creates a seamless multi-page lab creation experience.

**Key Behavior**:
- ✅ Triggers on 3rd **NEW** question (not edits)
- ✅ Works for all question types (MCQ, True/False, Fill in the blank)
- ✅ Shows success notification and auto-navigates to new page
- ✅ Handles failures gracefully (preserves question, shows error)
- ✅ Manual "Add New Page" button still works

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Instructor Action                         │
│              (Saves 3rd question on page)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Page Editor Component (apps/web/app/labs/...)       │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  useAutoPageCreation Hook                          │    │
│  │  - Tracks question count                           │    │
│  │  - Detects 3rd new question                       │    │
│  │  - Triggers page creation                         │    │
│  │  - Handles navigation & notifications             │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Lab API Client (apps/web/apis/lab.api.ts)      │
│  - saveQuestion() → Save 3rd question                       │
│  - createLabPage() → Create next page                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Backend API (apps/whatsnxt-bff)                     │
│  - POST /labs/:labId/pages/:pageId/question                 │
│  - POST /labs/:labId/pages                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start (5 Steps)

### Step 1: Add Constants

**File**: `packages/constants/src/lab.constants.ts` (create if not exists)

```typescript
/**
 * Number of questions that trigger automatic page creation
 */
export const QUESTIONS_PER_PAGE_THRESHOLD = 3;

/**
 * Auto-page-creation notification messages
 */
export const AUTO_PAGE_CREATION_MESSAGES = {
  SUCCESS: (pageNumber: number) => 
    `Page ${pageNumber} created. Continue adding questions...`,
  ERROR: "Couldn't create next page automatically. Click 'Add New Page' to continue.",
  ERROR_TITLE: 'Page Creation Failed',
  SUCCESS_TITLE: 'Page Created',
} as const;

/**
 * Notification display durations (milliseconds)
 */
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 4000,
  ERROR: 6000,
} as const;
```

**Export from package index**:
```typescript
// packages/constants/src/index.ts
export * from './lab.constants';
```

---

### Step 2: Create the Custom Hook

**File**: `apps/web/hooks/useAutoPageCreation.ts` (new file)

```typescript
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import labApi from '@/apis/lab.api';
import type { Question } from '@whatsnxt/core-types';
import { 
  QUESTIONS_PER_PAGE_THRESHOLD,
  AUTO_PAGE_CREATION_MESSAGES,
  NOTIFICATION_DURATIONS,
} from '@whatsnxt/constants';

interface UseAutoPageCreationOptions {
  labId: string;
  currentPageId: string;
  currentPageNumber: number;
  enabled?: boolean; // Allow disabling the feature
}

interface UseAutoPageCreationResult {
  isCreatingPage: boolean;
  onQuestionSaved: (question: Question, isEdit: boolean) => Promise<void>;
}

export function useAutoPageCreation({
  labId,
  currentPageId,
  currentPageNumber,
  enabled = true,
}: UseAutoPageCreationOptions): UseAutoPageCreationResult {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(0);
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Fetch initial question count when page loads or changes
  useEffect(() => {
    const fetchInitialCount = async () => {
      try {
        const response = await labApi.getLabPageById(labId, currentPageId);
        const page = response.data;
        
        // Count existing questions on the page
        let count = 0;
        if (page.question) count += 1;
        
        setQuestionCount(count);
      } catch (error) {
        console.error('Failed to fetch initial question count:', error);
        setQuestionCount(0);
      }
    };

    fetchInitialCount();
  }, [labId, currentPageId]);

  const onQuestionSaved = useCallback(
    async (question: Question, isEdit: boolean) => {
      // If feature is disabled, do nothing
      if (!enabled) return;

      // If editing existing question, don't count toward threshold
      if (isEdit) return;

      // Increment count for new question
      const newCount = questionCount + 1;
      setQuestionCount(newCount);

      // Check if we've reached the threshold
      if (newCount === QUESTIONS_PER_PAGE_THRESHOLD) {
        setIsCreatingPage(true);

        try {
          // Create the next page
          const response = await labApi.createLabPage(labId, {});
          const newPage = response.data;

          // Navigate to the new page
          router.push(`/labs/${labId}/pages/${newPage.id}`);

          // Show success notification
          notifications.show({
            title: AUTO_PAGE_CREATION_MESSAGES.SUCCESS_TITLE,
            message: AUTO_PAGE_CREATION_MESSAGES.SUCCESS(newPage.pageNumber),
            color: 'green',
            autoClose: NOTIFICATION_DURATIONS.SUCCESS,
          });
        } catch (error) {
          console.error('Failed to create next page:', error);

          // Show error notification with fallback guidance
          notifications.show({
            title: AUTO_PAGE_CREATION_MESSAGES.ERROR_TITLE,
            message: AUTO_PAGE_CREATION_MESSAGES.ERROR,
            color: 'red',
            autoClose: NOTIFICATION_DURATIONS.ERROR,
          });
        } finally {
          setIsCreatingPage(false);
        }
      }
    },
    [labId, currentPageId, questionCount, enabled, router]
  );

  return {
    isCreatingPage,
    onQuestionSaved,
  };
}
```

---

### Step 3: Integrate Hook into Page Editor

**File**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Before** (simplified):
```typescript
export default function PageEditor({ params }) {
  const { id: labId, pageId } = params;
  
  const handleQuestionSave = async (questionData) => {
    await labApi.saveQuestion(labId, pageId, questionData);
    notifications.show({ message: 'Question saved!' });
  };
  
  return <QuestionForm onSubmit={handleQuestionSave} />;
}
```

**After** (with auto-creation):
```typescript
import { useAutoPageCreation } from '@/hooks/useAutoPageCreation';

export default function PageEditor({ params }) {
  const { id: labId, pageId } = params;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  
  // Initialize auto-page-creation hook
  const { isCreatingPage, onQuestionSaved } = useAutoPageCreation({
    labId,
    currentPageId: pageId,
    currentPageNumber,
    enabled: true, // Can be controlled via feature flag
  });
  
  const handleQuestionSave = async (questionData, isEdit = false) => {
    try {
      // Save the question (existing logic)
      const response = await labApi.saveQuestion(labId, pageId, {
        ...questionData,
        questionId: isEdit ? questionData.id : undefined,
      });
      
      notifications.show({ 
        message: 'Question saved!',
        color: 'green',
      });
      
      // Trigger auto-creation check
      await onQuestionSaved(response.data, isEdit);
      
    } catch (error) {
      notifications.show({
        message: 'Failed to save question',
        color: 'red',
      });
    }
  };
  
  return (
    <>
      <QuestionForm onSubmit={handleQuestionSave} />
      {isCreatingPage && <Loader overlay />}
    </>
  );
}
```

**Key Changes**:
1. Import and initialize `useAutoPageCreation` hook
2. Call `onQuestionSaved()` after successful question save
3. Pass `isEdit` flag to distinguish edits from new questions
4. Optional: Show loading overlay during page creation

---

### Step 4: Update Question Form Component

**File**: `apps/web/components/Lesson/question.tsx`

**Ensure the form tracks edit state**:
```typescript
export function QuestionForm({ onSubmit, existingQuestion }) {
  const isEdit = !!existingQuestion?.id;
  
  const handleSubmit = async (values) => {
    await onSubmit(values, isEdit); // Pass isEdit flag
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Question form fields */}
    </form>
  );
}
```

**Key Changes**:
- Detect edit mode based on `existingQuestion.id` presence
- Pass `isEdit` flag to the `onSubmit` callback

---

### Step 5: Test the Feature

**Manual Testing Checklist**:

1. **Happy Path - Auto-Creation**:
   - [ ] Create a new lab
   - [ ] Add question 1 → verify no auto-creation
   - [ ] Add question 2 → verify no auto-creation
   - [ ] Add question 3 → verify page 2 auto-created + redirected
   - [ ] Verify success notification appears
   - [ ] Verify question form auto-shows on new page

2. **Edit Mode - No Auto-Creation**:
   - [ ] Navigate to a page with 3 questions
   - [ ] Edit question 2 and save
   - [ ] Verify no new page created

3. **Error Handling**:
   - [ ] Simulate page creation failure (disconnect network)
   - [ ] Add 3rd question
   - [ ] Verify error notification appears
   - [ ] Verify question is still saved
   - [ ] Verify user can manually add page via lab detail

4. **All Question Types**:
   - [ ] Add 2 MCQ questions + 1 True/False → verify auto-creation
   - [ ] Add 2 Fill-in-blank + 1 MCQ → verify auto-creation

---

## File Structure

```
apps/web/
├── hooks/
│   └── useAutoPageCreation.ts      # NEW: Custom hook
├── app/
│   └── labs/[id]/pages/[pageId]/
│       └── page.tsx                 # MODIFIED: Integrate hook
└── components/
    └── Lesson/
        └── question.tsx             # MODIFIED: Pass isEdit flag

packages/constants/
└── src/
    ├── lab.constants.ts             # NEW: Add constants
    └── index.ts                     # MODIFIED: Export constants

__tests__/
└── unit/
    └── useAutoPageCreation.test.ts  # NEW: Unit tests
```

---

## Configuration

### Environment Variables

**No new environment variables needed** - Uses existing `NEXT_PUBLIC_BFF_HOST_LAB_API`

### Feature Flags (Optional)

If using a feature flag system:

```typescript
const { isCreatingPage, onQuestionSaved } = useAutoPageCreation({
  labId,
  currentPageId: pageId,
  currentPageNumber,
  enabled: featureFlags.autoPageCreation, // Control via flag
});
```

---

## Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev

# Navigate to page editor
open http://localhost:3001/labs/{labId}/pages/{pageId}
```

### 2. Run Tests

```bash
# Unit tests
pnpm test apps/web/hooks/useAutoPageCreation.test.ts

# Type checking
pnpm check-types

# Lint
pnpm lint
```

### 3. Build and Verify

```bash
# Build for production
pnpm build

# Check bundle size impact
pnpm analyze
```

---

## Common Issues and Solutions

### Issue 1: Auto-creation triggers on edit

**Symptom**: Editing a question on a page with 3 questions creates a new page

**Solution**: Ensure `isEdit` flag is correctly passed:
```typescript
const isEdit = !!existingQuestion?.id;
await onSubmit(questionData, isEdit); // Must pass isEdit
```

---

### Issue 2: Question count resets incorrectly

**Symptom**: Count doesn't match actual questions on page

**Solution**: Ensure `useEffect` dependency includes `currentPageId`:
```typescript
useEffect(() => {
  // Fetch and set question count
}, [labId, currentPageId]); // ✅ Re-run when page changes
```

---

### Issue 3: Navigation doesn't work

**Symptom**: No redirect after 3rd question, or redirect fails

**Solution**: Verify `useRouter` is from `next/navigation` (not `next/router`):
```typescript
import { useRouter } from 'next/navigation'; // ✅ App Router
```

---

## Performance Considerations

- **API Calls**: 2 calls per auto-creation (save question + create page) ~300-450ms total
- **Bundle Size**: ~2-3KB gzipped (hook + constants)
- **Client-Side Tracking**: No extra API calls for counting (tracked locally)

---

## Rollback Plan

If issues arise in production:

1. **Disable via feature flag**:
   ```typescript
   enabled: false, // Disable auto-creation
   ```

2. **Remove hook integration** (revert Step 3):
   ```typescript
   // Remove useAutoPageCreation hook call
   // Keep existing question save logic
   ```

3. **Manual page creation still works** (no backend changes)

---

## Next Steps

After implementing this feature:

1. **Monitor metrics**:
   - Time to create multi-page labs (should decrease)
   - Auto-creation success rate (target: >95%)
   - Error occurrences (should be <5%)

2. **Gather feedback**:
   - Do instructors find it helpful?
   - Any unexpected behavior?

3. **Future enhancements** (out of scope for this feature):
   - Configurable threshold (3, 5, or 10 questions)
   - Undo auto-created page
   - Bulk question import

---

## Support and Resources

- **Feature Spec**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/api-contracts.md](./contracts/api-contracts.md)
- **Tasks**: [tasks.md](./tasks.md) (generated separately via `/speckit.tasks`)

---

## Summary

This feature delivers a seamless lab creation experience by:
- ✅ Automatically creating pages after 3 questions
- ✅ Gracefully handling failures (data safety first)
- ✅ Reusing existing APIs and infrastructure
- ✅ Following constitution principles (shared packages, low complexity)

**Total implementation time**: ~4-6 hours (hook + integration + testing)
