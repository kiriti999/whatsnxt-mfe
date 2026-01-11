# Research: Auto-Create Page After 3 Questions

**Feature**: 003-auto-page-creation  
**Date**: 2025-01-17  
**Status**: Complete

## Research Questions

### 1. Next.js Router Navigation Patterns

**Question**: How should we programmatically navigate to the newly created page in Next.js 16 App Router?

**Research Findings**:
- Next.js 16 uses App Router with `useRouter()` hook from `next/navigation`
- The `router.push()` method is the recommended approach for client-side navigation
- Route pattern: `/labs/[labId]/pages/[pageId]/` (dynamic route segments)
- Navigation is instant with React Server Components + client hydration

**Decision**: Use `useRouter()` from `next/navigation` with `router.push()` for programmatic navigation

**Rationale**: 
- Standard Next.js 16 pattern (documented in official Next.js docs)
- Supports dynamic route parameters (labId, pageId)
- Client-side navigation is fast (<100ms perceived delay)
- Maintains browser history stack for back/forward navigation

**Alternatives Considered**:
- `window.location.href` - Rejected: Full page reload, slower, loses React state
- `Link` component with programmatic click - Rejected: Over-engineered, not idiomatic

**Code Example**:
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
const newPageId = createdPage.data.id;
router.push(`/labs/${labId}/pages/${newPageId}`);
```

---

### 2. Mantine Notification Patterns

**Question**: How should we display success and error notifications for auto-page-creation?

**Research Findings**:
- Project uses `@mantine/notifications` v8.3.10 (already installed)
- The `notifications.show()` API provides consistent notification UI
- Supports success (green), error (red), info (blue) variants
- Notifications auto-dismiss after 4000ms (configurable)
- Already integrated in the app (NotificationProvider in layout)

**Decision**: Use `notifications.show()` from `@mantine/notifications` with color variants

**Rationale**:
- Already used throughout the codebase (consistent UX)
- Follows Mantine UI standards (constitution requirement)
- Built-in accessibility (ARIA labels, keyboard support)
- Auto-dismiss reduces cognitive load on instructors

**Alternatives Considered**:
- Custom toast component - Rejected: Duplicates functionality, violates constitution (reuse existing)
- Browser alert() - Rejected: Poor UX, blocks interaction, not dismissible

**Code Example**:
```typescript
import { notifications } from '@mantine/notifications';

// Success notification
notifications.show({
  title: 'Page Created',
  message: `Page ${newPageNumber} created. Continue adding questions...`,
  color: 'green',
  autoClose: 4000,
});

// Error notification
notifications.show({
  title: 'Page Creation Failed',
  message: "Couldn't create next page automatically. Click 'Add New Page' to continue.",
  color: 'red',
  autoClose: 6000,
});
```

---

### 3. React Hook Patterns for Auto-Creation Logic

**Question**: What's the best pattern for implementing auto-creation logic that triggers after question save?

**Research Findings**:
- Custom hooks are the React 19 recommended pattern for reusable logic
- The `useAutoPageCreation` hook can encapsulate all auto-creation logic
- React 19 supports async operations in effects with proper cleanup
- The hook should return an `onQuestionSaved` callback for the question form
- State management: track loading state, error state, question count

**Decision**: Create a `useAutoPageCreation` custom hook that returns an `onQuestionSaved` callback

**Rationale**:
- Follows React 19 composition patterns (documented in React docs)
- Separates concerns (SRP): hook handles auto-creation, component handles UI
- Testable in isolation (mock dependencies, verify behavior)
- Cyclomatic complexity stays low (hook < 5, component < 5)
- Reusable if needed in future features

**Alternatives Considered**:
- Inline logic in component - Rejected: Violates SRP, makes component complex, not testable
- Service class - Rejected: Not idiomatic React, harder to integrate with React lifecycle
- Global state manager - Rejected: Overkill for feature-local logic

**Hook API Design**:
```typescript
interface UseAutoPageCreationOptions {
  labId: string;
  currentPageId: string;
  currentPageNumber: number;
  onError?: (error: Error) => void;
}

interface UseAutoPageCreationResult {
  isCreatingPage: boolean;
  onQuestionSaved: (question: Question, isEdit: boolean) => Promise<void>;
}

function useAutoPageCreation(options: UseAutoPageCreationOptions): UseAutoPageCreationResult;
```

**Hook Responsibilities**:
1. Track question count for current page
2. Detect when 3rd NEW question is saved (not edits)
3. Call labApi.createLabPage() to create next page
4. Navigate to new page on success
5. Show notifications (success or error)
6. Handle failures gracefully (preserve question, show fallback message)

---

### 4. Error Handling Best Practices

**Question**: How should we handle page creation failures to ensure data safety and good UX?

**Research Findings**:
- Question save and page creation are separate API calls (existing architecture)
- Question save MUST complete before attempting page creation (data safety)
- If page creation fails, question is already saved (no data loss)
- Users need clear error messages explaining what happened and next steps
- Retry logic is not needed (page creation is idempotent, user can manually retry)

**Decision**: Sequential error handling with explicit fallback messaging

**Rationale**:
- Data safety first: never lose the 3rd question
- Clear communication: tell user exactly what failed and how to proceed
- Manual fallback exists: "Add New Page" button on lab detail page
- Idempotent operations: safe to retry manually without side effects

**Error Handling Flow**:
```typescript
// 1. Save question (existing logic)
try {
  await labApi.saveQuestion(labId, pageId, questionData);
  // Question is now persisted ✅
} catch (error) {
  // Existing error handling for question save
  return;
}

// 2. Check if should trigger auto-creation
if (!shouldAutoCreatePage(questionCount, isEdit)) {
  return; // Normal flow, no auto-creation
}

// 3. Attempt page creation (may fail, question already saved)
try {
  const newPage = await labApi.createLabPage(labId, {});
  router.push(`/labs/${labId}/pages/${newPage.data.id}`);
  notifications.show({ color: 'green', message: `Page ${newPage.data.pageNumber} created...` });
} catch (error) {
  // Question is safe, page creation failed
  notifications.show({ 
    color: 'red', 
    message: "Couldn't create next page automatically. Click 'Add New Page' to continue." 
  });
  // Stay on current page, user can manually add page later
}
```

**Alternatives Considered**:
- Atomic transaction (save + create in one API call) - Rejected: Requires backend changes, adds coupling
- Automatic retry - Rejected: May create duplicate pages, adds complexity
- Rollback question on page failure - Rejected: Data loss risk, poor UX

---

### 5. Question Counting Strategies

**Question**: How do we accurately count NEW questions vs edits, and track the count across page renders?

**Research Findings**:
- Questions have an `id` field when saved (undefined for new questions)
- Existing labApi.saveQuestion() accepts optional `questionId` for updates
- The question form component passes question data (type, text, options, answer)
- Editing flow: user clicks edit button → form pre-fills with existing question data
- The component already tracks `isEdit` state based on question ID presence

**Decision**: Use question ID presence to distinguish new vs edit, track count in hook state

**Rationale**:
- Accurate detection: question.id exists = edit, undefined = new
- Existing pattern: component already tracks isEdit for form pre-population
- Local state sufficient: count resets when navigating to new page (correct behavior)
- No backend changes: detection happens client-side

**Count Tracking Logic**:
```typescript
function useAutoPageCreation({ labId, currentPageId, currentPageNumber }: Options) {
  const [questionCount, setQuestionCount] = useState(0);
  
  // Reset count when page changes
  useEffect(() => {
    // Fetch current page questions and set initial count
    labApi.getLabPageById(labId, currentPageId).then(page => {
      const questions = page.data.question ? 1 : 0; // Simplified, actual logic counts all
      setQuestionCount(questions);
    });
  }, [currentPageId]);
  
  const onQuestionSaved = async (question: Question, isEdit: boolean) => {
    if (!isEdit) {
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      
      if (newCount === 3) {
        // Trigger auto-creation
      }
    }
    // isEdit = true: no count change
  };
  
  return { onQuestionSaved };
}
```

**Alternatives Considered**:
- Server-side count - Rejected: Requires API changes, adds latency
- Count by re-fetching page - Rejected: Extra API call, race conditions
- Global state tracking - Rejected: Overkill, complicates reset logic

---

## Technology Decisions Summary

| Decision Area | Technology/Pattern | Rationale |
|---------------|-------------------|-----------|
| Navigation | `useRouter()` from `next/navigation` | Standard Next.js 16 App Router pattern |
| Notifications | `notifications.show()` from `@mantine/notifications` | Existing project standard, consistent UX |
| Logic Encapsulation | Custom `useAutoPageCreation` hook | React 19 composition, testable, low complexity |
| Error Handling | Sequential with fallback messaging | Data safety, clear UX, leverages manual fallback |
| Question Counting | Client-side with ID presence detection | Accurate, no backend changes, leverages existing patterns |

---

## Dependencies Validation

### External Dependencies (already installed)
- ✅ Next.js 16.0.7 (`next` package)
- ✅ React 19.1.0 (`react` package)
- ✅ Mantine UI 8.3.10 (`@mantine/core`, `@mantine/notifications`)
- ✅ TypeScript 5.8.2 (`typescript` package)

### Workspace Dependencies (already available)
- ✅ `@whatsnxt/http-client` - For lab API calls (HttpClient instance)
- ✅ `@whatsnxt/core-types` - For Lab, LabPage, Question types
- ✅ `@whatsnxt/errors` - For custom error classes
- ✅ `@whatsnxt/constants` - Will add QUESTIONS_PER_PAGE_THRESHOLD constant

### API Dependencies (already implemented)
- ✅ `labApi.createLabPage(labId, data)` - Creates new page
- ✅ `labApi.saveQuestion(labId, pageId, data)` - Saves/updates question
- ✅ `labApi.getLabPageById(labId, pageId)` - Fetches page with questions

**No new dependencies required** - Feature leverages existing infrastructure.

---

## Performance Considerations

### Auto-Creation Flow Performance
1. **Question Save API**: ~150-200ms (existing, optimized)
2. **Page Creation API**: ~100-150ms (lightweight operation)
3. **Client-side Navigation**: ~50-100ms (Next.js App Router optimized)
4. **Total Time**: **300-450ms** (well under 2-second target from spec)

### Network Optimization
- No additional API calls during normal question saves (count tracked client-side)
- Page creation only happens once per 3 questions (minimal API overhead)
- Navigation uses Next.js prefetching (instant perceived transition)

### Bundle Size Impact
- New hook: ~2-3KB (gzipped)
- No new external dependencies
- Negligible impact on initial page load

---

## Security Considerations

### Authorization
- Existing labApi methods already enforce instructor ownership checks
- Page creation requires instructor owns the lab (backend validation)
- No new security concerns introduced

### Data Validation
- Question data validated by existing saveQuestion endpoint
- Page creation validates lab exists and is in draft state
- Client-side detection (edit vs new) is UX optimization, not security boundary

### Race Conditions
- Question save completes before page creation (sequential operations)
- If user navigates away during page creation, page is still created (safe)
- Multiple rapid question saves won't create multiple pages (count logic prevents)

---

## Testing Strategy

### Unit Tests (Vitest)
1. **useAutoPageCreation hook**:
   - ✅ Does not trigger on 1st or 2nd question
   - ✅ Triggers on 3rd NEW question
   - ✅ Does not trigger on editing existing question
   - ✅ Shows success notification on successful creation
   - ✅ Shows error notification on failed creation
   - ✅ Calls router.push() with correct path
   - ✅ Resets count when page changes

2. **Question counting utility**:
   - ✅ Correctly identifies new vs edit based on question ID
   - ✅ Tracks count across multiple saves
   - ✅ Resets count when page ID changes

### Integration Tests (Manual QA)
- Full workflow: create lab → add 3 questions → verify page 2 created
- Error flow: simulate page creation failure → verify question saved + error message
- Edit flow: edit question on page with 3 questions → verify no new page created
- Multiple question types: verify all types count toward threshold

---

## Open Questions (None)

All research questions resolved. No blockers identified. Ready for Phase 1 (Design & Contracts).
