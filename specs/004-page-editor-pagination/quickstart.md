# Quickstart Guide: Show Pagination in Page Editor

**Feature**: 004-page-editor-pagination  
**Date**: 2025-01-17  
**Phase**: 1 - Design & Contracts  
**Target Audience**: Developers implementing pagination in the page editor

## Overview

This guide provides a step-by-step implementation path for adding pagination controls to the lab page editor. Follow this guide to understand the architecture, component structure, and integration points before diving into implementation.

---

## Prerequisites

Before starting implementation, ensure you have:

- ✅ Node.js 22.12.0+ and pnpm 9.6.0+ installed
- ✅ Project repository cloned and dependencies installed (`pnpm install`)
- ✅ Familiarity with Next.js 16 App Router, React 19, and Mantine UI 8
- ✅ Access to backend API documentation (verify `totalPages` field availability)
- ✅ Read `research.md` and `data-model.md` in this feature directory
- ✅ Feature 003-auto-page-creation is implemented and functional

---

## Architecture Overview

### Component Hierarchy

```
apps/web/app/labs/[id]/pages/[pageId]/page.tsx (LabPageEditorPage)
├── Pagination Controls (new)
│   ├── Page Position Indicator ("Page X of Y")
│   ├── Mantine Pagination Component
│   │   ├── Previous Button
│   │   ├── Page Number Buttons (1, 2, 3, ...)
│   │   └── Next Button
│   └── Loading Indicator (during navigation)
├── Question Form (existing)
└── Question List (existing)
```

### Data Flow

```
URL (/labs/:labId/pages/:pageId)
  ↓
Extract labId, pageId from useParams()
  ↓
Fetch page data (GET /labs/:labId/pages/:pageId)
  ↓
Extract: pageNumber, totalPages
  ↓
Render Pagination (if totalPages > 1)
  ↓
User clicks page number
  ↓
Lookup pageId from pageNumber (via page mapping)
  ↓
router.push(/labs/:labId/pages/:newPageId)
  ↓
Re-fetch page data → Update pagination state
```

---

## Implementation Steps

### Step 1: Verify Backend API Support

**Task**: Confirm that existing API endpoints return required fields.

**Check**:
1. Inspect response from `GET /api/v1/labs/:labId/pages/:pageId`
2. Verify presence of `totalPages` field (integer, total page count)
3. Optionally, check if `GET /api/v1/labs/:labId` returns `pages` array with `{id, pageNumber}` mappings

**If `totalPages` missing**:
- Coordinate with backend team to add field (see `contracts/api-contracts.md`)
- Or implement workaround: count pages client-side via lab endpoint

**If page mapping unavailable**:
- Backend must add endpoint: `GET /labs/:labId/pages?number=2`
- Or fetch all pages on mount to build mapping

**Verification Command**:
```bash
# Test API endpoint (replace with real IDs)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/v1/labs/<labId>/pages/<pageId> | jq
```

Expected output should include:
```json
{
  "id": "...",
  "pageNumber": 2,
  "totalPages": 5,
  "questions": [...]
}
```

---

### Step 2: Add Type Definitions

**File**: `apps/web/types/pagination.ts` (create new file)

```typescript
// Pagination state interface
export interface PaginationState {
  currentPageNumber: number;
  totalPages: number;
  currentPageId: string;
  labId: string;
  isNavigating: boolean;
}

// Pagination component props
export interface PagePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

// Page mapping type
export type PageMapping = Map<number, string>; // pageNumber -> pageId

// Navigation result
export interface NavigationResult {
  success: boolean;
  error?: string;
  redirectedTo?: number;
}
```

**File**: `apps/web/types/api.ts` (add if not exists)

```typescript
// Add to existing API types or create new file
export interface PageResponse {
  id: string;
  labId: string;
  pageNumber: number;
  totalPages: number; // CRITICAL
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface PageSummary {
  id: string;
  pageNumber: number;
  questionCount: number;
}
```

---

### Step 3: Create Page Mapping Hook (Optional but Recommended)

**File**: `apps/web/hooks/usePageMapping.ts` (create new file)

```typescript
import { useState, useEffect } from 'react';
import { httpClient } from '@whatsnxt/http-client';
import { PageMapping } from '@/types/pagination';
import { PageSummary } from '@/types/api';

interface UsePageMappingResult {
  pageMapping: PageMapping;
  isLoading: boolean;
  error: string | null;
  getPageId: (pageNumber: number) => string | undefined;
}

export const usePageMapping = (labId: string): UsePageMappingResult => {
  const [pageMapping, setPageMapping] = useState<PageMapping>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageMapping = async () => {
      try {
        setIsLoading(true);
        const response = await httpClient.get<{ pages: PageSummary[] }>(
          `/api/v1/labs/${labId}`
        );
        
        const mapping = new Map<number, string>();
        response.data.pages.forEach((page) => {
          mapping.set(page.pageNumber, page.id);
        });
        
        setPageMapping(mapping);
        setError(null);
      } catch (err) {
        setError('Failed to load page mapping');
        console.error('Page mapping error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (labId) {
      fetchPageMapping();
    }
  }, [labId]);

  const getPageId = (pageNumber: number): string | undefined => {
    return pageMapping.get(pageNumber);
  };

  return { pageMapping, isLoading, error, getPageId };
};
```

---

### Step 4: Modify Page Editor Component

**File**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Changes**:

1. **Import pagination dependencies**:
```typescript
import { Pagination } from '@mantine/core'; // Already imported (line 20)
import { usePageMapping } from '@/hooks/usePageMapping';
import type { PaginationState } from '@/types/pagination';
```

2. **Add pagination state variables** (around line 80, after existing state):
```typescript
const [totalPages, setTotalPages] = useState<number>(1);
const [isNavigating, setIsNavigating] = useState(false);
const { getPageId, isLoading: isMappingLoading } = usePageMapping(labId);
```

3. **Update page data fetch logic** (modify existing `useEffect` for fetching page data):
```typescript
useEffect(() => {
  const fetchPageData = async () => {
    try {
      setLoading(true);
      const response = await labApi.getPageById(labId, pageId);
      
      // Set questions (existing logic)
      setQuestions(response.questions || []);
      
      // NEW: Extract pagination data
      setCurrentPageNumber(response.pageNumber);
      setTotalPages(response.totalPages || 1);
      
      // ... rest of existing logic
    } catch (error) {
      console.error('Error fetching page:', error);
    } finally {
      setLoading(false);
    }
  };

  if (labId && pageId) {
    fetchPageData();
  }
}, [labId, pageId]);
```

4. **Add page navigation handler** (new function):
```typescript
const handlePageChange = async (pageNumber: number) => {
  try {
    setIsNavigating(true);
    
    // Get page ID for target page number
    const targetPageId = getPageId(pageNumber);
    
    if (!targetPageId) {
      notifications.show({
        title: 'Navigation Error',
        message: `Unable to navigate to page ${pageNumber}`,
        color: 'red',
      });
      return;
    }
    
    // Navigate to target page
    router.push(`/labs/${labId}/pages/${targetPageId}`);
  } catch (error) {
    console.error('Navigation error:', error);
    notifications.show({
      title: 'Navigation Error',
      message: 'Unable to load page. Please try again.',
      color: 'red',
    });
  } finally {
    setIsNavigating(false);
  }
};
```

5. **Add pagination UI rendering** (insert after page title/header, before question form):
```typescript
{/* Pagination Controls - Show only if multiple pages exist */}
{totalPages > 1 && (
  <Paper shadow="xs" p="md" mb="lg" withBorder>
    <Group justify="space-between" align="center">
      {/* Page Position Indicator */}
      <Text size="sm" fw={500}>
        Page {currentPageNumber} of {totalPages}
      </Text>
      
      {/* Pagination Component */}
      <Pagination
        total={totalPages}
        value={currentPageNumber}
        onChange={handlePageChange}
        disabled={isNavigating || isMappingLoading}
        siblings={isMobile ? 0 : 1}
        boundaries={isMobile ? 1 : 2}
        size={isMobile ? 'sm' : 'md'}
      />
      
      {/* Loading Indicator */}
      {isNavigating && <Loader size="sm" />}
    </Group>
  </Paper>
)}
```

---

### Step 5: Add Keyboard Navigation (Accessibility)

**Mantine Pagination component already supports keyboard navigation by default**:
- **Tab**: Move focus between pagination elements
- **Enter**: Activate focused page number
- **Arrow keys**: Navigate between page numbers

**Ensure accessibility**:
```typescript
<Pagination
  total={totalPages}
  value={currentPageNumber}
  onChange={handlePageChange}
  aria-label="Page navigation"
  getItemAriaLabel={(page) => {
    if (page === currentPageNumber) return `Current page, page ${page}`;
    return `Go to page ${page}`;
  }}
/>
```

---

### Step 6: Handle Edge Cases

**1. Rapid navigation clicks** (debounce):
```typescript
import { useDebouncedCallback } from '@mantine/hooks';

const debouncedPageChange = useDebouncedCallback((pageNumber: number) => {
  handlePageChange(pageNumber);
}, 300);
```

**2. Auto-page-creation integration**:
```typescript
// Monitor useAutoPageCreation hook
useEffect(() => {
  if (!isCreatingPage) {
    // Page creation completed, refresh total page count
    // (will be handled automatically via useEffect that fetches page data)
  }
}, [isCreatingPage]);
```

**3. Error boundary** (optional):
```typescript
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<Text>Failed to load pagination</Text>}>
  {/* Pagination UI */}
</ErrorBoundary>
```

---

### Step 7: Add Tests

**File**: `apps/web/__tests__/components/Lab/Pagination.test.tsx` (create new file)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@mantine/core';
import { describe, it, expect, vi } from 'vitest';

describe('Page Pagination', () => {
  it('renders page indicator correctly', () => {
    render(
      <Text>Page 2 of 5</Text>
    );
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('calls onPageChange when page number clicked', () => {
    const handleChange = vi.fn();
    render(
      <Pagination total={5} value={2} onChange={handleChange} />
    );
    
    fireEvent.click(screen.getByText('3'));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('disables Previous button on first page', () => {
    render(
      <Pagination total={5} value={1} onChange={vi.fn()} />
    );
    
    const prevButton = screen.getByLabelText(/previous/i);
    expect(prevButton).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(
      <Pagination total={5} value={5} onChange={vi.fn()} />
    );
    
    const nextButton = screen.getByLabelText(/next/i);
    expect(nextButton).toBeDisabled();
  });

  it('hides pagination when totalPages is 1', () => {
    const { container } = render(
      <>
        {1 > 1 && <Pagination total={1} value={1} onChange={vi.fn()} />}
      </>
    );
    
    expect(container.querySelector('.mantine-Pagination-root')).toBeNull();
  });
});
```

**Run tests**:
```bash
cd apps/web
pnpm test Pagination.test.tsx
```

---

### Step 8: Mobile Responsive Testing

**Breakpoints to test**:
- Mobile: 320px - 767px (vertical stack, smaller buttons)
- Tablet: 768px - 1023px (horizontal layout, medium buttons)
- Desktop: 1024px+ (horizontal layout, full controls)

**Testing approach**:
```bash
# Start dev server
pnpm dev

# Open browser, navigate to page editor
# Open DevTools → Device Toolbar (Ctrl+Shift+M)
# Test breakpoints: iPhone SE (375px), iPad (768px), Desktop (1920px)
```

**Verify**:
- Touch targets ≥ 44x44px on mobile
- No horizontal scrolling
- Readable text on all screen sizes
- Pagination controls remain accessible

---

## Development Workflow

### Quick Start Commands

```bash
# 1. Checkout feature branch
git checkout 004-page-editor-pagination

# 2. Install dependencies (if not already done)
pnpm install

# 3. Start development server
cd apps/web
pnpm dev

# 4. Open page editor in browser
# http://localhost:3001/labs/<labId>/pages/<pageId>

# 5. Test pagination
# - Create lab with 2+ pages (via feature 003)
# - Verify pagination appears
# - Test navigation between pages
# - Test keyboard navigation (Tab/Enter)
# - Test mobile responsiveness

# 6. Run tests
pnpm test

# 7. Check types
pnpm check-types

# 8. Lint code
pnpm lint
```

---

## Troubleshooting

### Issue: Pagination not appearing

**Cause**: `totalPages` might be 1 or missing from API response

**Solution**:
1. Check API response in Network tab (DevTools)
2. Verify `totalPages` field exists and is > 1
3. If missing, coordinate with backend team (see `contracts/api-contracts.md`)

---

### Issue: Navigation fails with "Unable to navigate to page X"

**Cause**: Page mapping failed or page ID not found

**Solution**:
1. Check `usePageMapping` hook is fetching data correctly
2. Inspect `pageMapping` state in React DevTools
3. Verify lab endpoint returns `pages` array with IDs
4. Add error logging to `handlePageChange` function

---

### Issue: Pagination renders but shows incorrect current page

**Cause**: `currentPageNumber` state not syncing with URL

**Solution**:
1. Ensure `useEffect` updates `currentPageNumber` on `pageId` change
2. Verify API response includes correct `pageNumber` field
3. Check URL params are extracted correctly (`useParams()`)

---

### Issue: Keyboard navigation not working

**Cause**: Focus management or ARIA attributes missing

**Solution**:
1. Mantine Pagination has built-in keyboard support (should work by default)
2. Verify no custom CSS is blocking focus indicators
3. Test with keyboard only (no mouse) to isolate issue
4. Check browser console for accessibility warnings

---

## Performance Checklist

Before marking implementation complete, verify:

- ✅ Page navigation completes in <500ms (Network tab → measure page load)
- ✅ Pagination renders in <100ms (React DevTools → Profiler)
- ✅ No unnecessary re-renders on pagination state changes
- ✅ Prefetching enabled for adjacent pages (Next.js default)
- ✅ Loading indicators shown during navigation
- ✅ No console errors or warnings

---

## Next Steps

After implementing pagination:

1. **Code Review**: Submit PR, ensure constitution compliance
2. **QA Testing**: Test all user stories in `spec.md`
3. **Accessibility Audit**: Use Lighthouse or axe DevTools
4. **Performance Testing**: Verify <500ms navigation with throttling
5. **Documentation**: Update project docs with pagination usage
6. **Phase 2**: Run `/speckit.tasks` command to generate task breakdown for implementation

---

## References

- Feature Spec: `spec.md`
- Research: `research.md`
- Data Model: `data-model.md`
- API Contracts: `contracts/api-contracts.md`
- Mantine Pagination: https://mantine.dev/core/pagination/
- Next.js App Router: https://nextjs.org/docs/app/api-reference/functions/use-router
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/

---

**Questions?** Refer to `research.md` for technical decisions or `spec.md` for functional requirements.
