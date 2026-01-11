# Research: Show Pagination in Page Editor

**Feature**: 004-page-editor-pagination  
**Date**: 2025-01-17  
**Phase**: 0 - Research & Investigation

## Research Objective

Investigate best practices and implementation patterns for pagination in Next.js 16 App Router applications using Mantine UI 8, focusing on client-side navigation, state management, URL synchronization, and accessibility compliance.

## Technology Stack Research

### Decision: Mantine UI Pagination Component

**What was chosen**: `@mantine/core` Pagination component (v8.3.10)

**Rationale**:
- Already used throughout the project (constitution requirement III: "UI MUST be built using Mantine UI")
- Provides built-in accessibility features (ARIA attributes, keyboard navigation)
- Supports responsive design out of the box
- Includes Previous/Next buttons and page number controls
- Allows customization via `styles` API and CSS modules
- Well-documented with TypeScript support
- Handles ellipsis pagination automatically for large page counts

**Alternatives considered**:
- **Custom pagination component**: Rejected because it would duplicate effort, violate DRY principles, require extensive accessibility testing, and not leverage Mantine's design system consistency
- **React Paginate library**: Rejected because it's a third-party dependency that would conflict with Mantine UI consistency requirements and add unnecessary bundle size
- **Ant Design Pagination**: Rejected because it violates constitution requirement to use Mantine UI exclusively

**Implementation approach**: Use `<Pagination />` component with controlled state, integrate with Next.js App Router `useRouter()` for programmatic navigation.

**References**:
- Mantine Pagination docs: https://mantine.dev/core/pagination/
- Mantine v8 migration guide: https://mantine.dev/changelog/8-0-0/

---

### Decision: Next.js App Router Navigation Pattern

**What was chosen**: `useRouter()` from `next/navigation` with programmatic `router.push()`

**Rationale**:
- Next.js 16 App Router is the standard for this project (constitution requirement V)
- `router.push()` provides smooth client-side navigation without full page reloads
- Automatically updates browser URL and history (supports browser back/forward)
- Integrates with Next.js caching and prefetching strategies
- Type-safe with TypeScript

**Alternatives considered**:
- **Link component**: Rejected because pagination requires programmatic navigation based on click events, not static links
- **window.location.href**: Rejected because it causes full page reloads, losing client-side state and degrading performance
- **useNavigate (React Router)**: Not applicable; project uses Next.js App Router, not React Router

**Implementation approach**: 
```typescript
const router = useRouter();
const handlePageChange = (pageNumber: number) => {
  router.push(`/labs/${labId}/pages/${getPageIdForNumber(pageNumber)}`);
};
```

**References**:
- Next.js App Router navigation: https://nextjs.org/docs/app/api-reference/functions/use-router
- App Router migration guide: https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration

---

### Decision: URL-Based Page State (No Client-Side Persistence)

**What was chosen**: Store current page in URL path (`/labs/[id]/pages/[pageId]`), derive pagination state from URL

**Rationale**:
- URL already contains `pageId` parameter in existing routing structure
- Enables shareable links to specific pages
- Supports browser back/forward buttons naturally
- No need for additional state management (Redux, Context API)
- Server-side rendering friendly (SSR/SSG compatible)
- Avoids state synchronization issues between URL and client state

**Alternatives considered**:
- **Query parameters** (`?page=2`): Rejected because existing routing uses path parameters (`/pages/[pageId]`), changing to query params would require backend API changes
- **Client-side state only (useState/useReducer)**: Rejected because it breaks browser navigation, prevents link sharing, and loses state on refresh
- **LocalStorage persistence**: Rejected because it's unnecessary (URL is sufficient), complicates state management, and can cause stale data issues

**Implementation approach**: Parse `pageId` from URL params, map to page number, use for pagination state.

**References**:
- Next.js dynamic routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- URL state management patterns: https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster

---

### Decision: Keyboard Navigation Implementation

**What was chosen**: Leverage Mantine Pagination's built-in keyboard support, add custom focus management

**Rationale**:
- Mantine Pagination component already handles Tab/Enter/Arrow keys
- WCAG 2.1 Level AA compliance requires keyboard navigability
- Constitution requirement III: "Accessibility and code readability are non-negotiable"
- Built-in focus indicators reduce custom CSS needs

**Alternatives considered**:
- **Custom keyboard event handlers**: Rejected because Mantine already provides this, duplicating effort increases bugs and maintenance burden
- **Skip keyboard support**: Rejected because it violates accessibility standards and constitution requirements

**Implementation approach**: 
- Use Mantine Pagination default keyboard behavior
- Add `aria-label` attributes for screen readers
- Ensure focus indicators are visible (use Mantine's default styles or custom CSS)
- Test with keyboard-only navigation

**References**:
- WCAG 2.1 keyboard guidelines: https://www.w3.org/WAI/WCAG21/Understanding/keyboard
- Mantine accessibility docs: https://mantine.dev/guides/accessibility/

---

### Decision: Mobile Responsive Design Strategy

**What was chosen**: Use `@mantine/hooks` `useMediaQuery()` with conditional rendering for mobile layouts

**Rationale**:
- Already using `useMediaQuery` in page editor (`isMobile` on line 68 of page.tsx)
- Allows different pagination layouts for mobile vs desktop (stacking vs horizontal)
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Touch-friendly tap targets (44x44px minimum) for mobile

**Alternatives considered**:
- **CSS-only responsive design**: Rejected because JavaScript logic needed to hide/show page numbers on mobile, adjust touch target sizes dynamically
- **Separate mobile component**: Rejected because it duplicates logic, increases maintenance burden
- **No mobile support**: Rejected because constitution requirement III mandates responsive design

**Implementation approach**:
```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
<Pagination
  total={totalPages}
  siblings={isMobile ? 0 : 1}
  boundaries={isMobile ? 1 : 2}
  size={isMobile ? 'sm' : 'md'}
/>
```

**References**:
- Mantine useMediaQuery: https://mantine.dev/hooks/use-media-query/
- Touch target size guidelines: https://web.dev/accessible-tap-targets/

---

### Decision: Error Handling for Navigation Failures

**What was chosen**: Use `@whatsnxt/errors` workspace package, display user-friendly notifications via `@mantine/notifications`

**Rationale**:
- Constitution requirement IX: "All applications MUST use custom error classes from `@whatsnxt/errors`"
- `@mantine/notifications` already used in project (line 27 of page.tsx)
- Provides consistent error messaging across application
- Non-blocking UI feedback (toast notifications)

**Alternatives considered**:
- **Generic Error objects**: Rejected because it violates constitution requirement IX
- **Alert/modal for errors**: Rejected because notifications are less intrusive and don't block workflow
- **Silent failure**: Rejected because users need feedback when navigation fails

**Implementation approach**:
```typescript
try {
  await router.push(`/labs/${labId}/pages/${pageId}`);
} catch (error) {
  notifications.show({
    title: 'Navigation Error',
    message: 'Unable to load page. Please try again.',
    color: 'red',
  });
}
```

**References**:
- Mantine notifications: https://mantine.dev/x/notifications/

---

### Decision: Integration with useAutoPageCreation Hook

**What was chosen**: Listen to hook's state updates, refresh pagination data when new pages are created

**Rationale**:
- Feature 003 (auto-page-creation) is a dependency specified in spec.md
- `useAutoPageCreation` hook already used in page editor (line 88 of page.tsx)
- Hook provides `isCreatingPage` state to show loading indicators
- Need to refresh total page count after new page creation

**Alternatives considered**:
- **Polling for page count updates**: Rejected because it's inefficient, adds unnecessary API calls
- **Ignore auto-page-creation**: Rejected because feature 003 is a hard dependency
- **Manual refresh button**: Rejected because it creates poor UX, users shouldn't need manual actions

**Implementation approach**:
- Monitor `isCreatingPage` state from hook
- After page creation completes, fetch updated page count
- Update pagination total dynamically
- Show loading state during creation

**References**:
- Existing implementation: `/apps/web/app/labs/[id]/pages/[pageId]/page.tsx` lines 88-93

---

### Decision: Performance Optimization Strategy

**What was chosen**: Client-side state management, minimal re-renders, prefetch adjacent pages

**Rationale**:
- Performance requirement: <500ms navigation (SC-002)
- <100ms pagination render (custom requirement)
- Next.js automatic route prefetching reduces navigation time
- Controlled component pattern prevents unnecessary re-renders

**Alternatives considered**:
- **Server-side pagination logic**: Rejected because pagination state is purely client-side (UI concern)
- **Virtualized pagination**: Rejected because typical page counts (2-20) don't require virtualization
- **Service Worker caching**: Rejected because Next.js built-in caching is sufficient

**Implementation approach**:
- Use React.memo for pagination component
- Prefetch adjacent pages on hover (Next.js default behavior)
- Cache page count in component state
- Debounce rapid navigation clicks (cancel pending navigations)

**References**:
- Next.js prefetching: https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#prefetching
- React performance optimization: https://react.dev/reference/react/memo

---

## Summary of Research Findings

All technical unknowns have been resolved. Key decisions:

1. **UI Framework**: Mantine Pagination component (constitution-compliant, accessible)
2. **Navigation**: Next.js App Router `useRouter()` with URL-based state
3. **Responsive Design**: `useMediaQuery` with conditional layouts
4. **Accessibility**: Built-in keyboard support + ARIA attributes
5. **Error Handling**: `@whatsnxt/errors` + Mantine notifications
6. **Integration**: Sync with `useAutoPageCreation` hook
7. **Performance**: Client-side optimization, prefetching, controlled components

No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 (Design & Contracts).
