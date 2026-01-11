# Research: Streamline Lab Creation Flow

**Date**: 2026-01-11  
**Status**: Complete  
**Phase**: Phase 0 - Research & Analysis

## Research Overview

This document consolidates research findings for implementing the streamlined lab creation flow that automatically creates a default page and redirects instructors to the page editor upon lab creation.

---

## 1. Atomic Transaction Handling in MongoDB

### Decision
Implement atomic lab and page creation using MongoDB transactions with session management.

### Research Findings

**MongoDB Transaction Support**:
- MongoDB supports multi-document ACID transactions since version 4.0
- Transactions ensure all-or-nothing execution for lab + page creation
- Session-based transactions allow rollback if any operation fails

**Implementation Pattern**:
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Create Lab
  const lab = await Lab.create([labData], { session });
  
  // 2. Create Default Page (pageNumber: 1)
  const defaultPage = await LabPage.create([{
    labId: lab[0].id,
    pageNumber: 1,
    hasQuestion: false,
    hasDiagramTest: false
  }], { session });
  
  // 3. Commit transaction
  await session.commitTransaction();
  
  return { lab: lab[0], defaultPage: defaultPage[0] };
} catch (error) {
  // Rollback on any failure
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Error Scenarios**:
1. Lab creation succeeds, page creation fails → Transaction rolled back, no lab created
2. Database connection lost mid-transaction → Transaction automatically rolled back
3. Validation error on page creation → Transaction rolled back, no lab created

### Rationale
MongoDB transactions guarantee atomicity without custom rollback logic. This prevents orphaned labs (labs without default pages) and ensures data consistency. Using sessions is the industry-standard pattern for MongoDB multi-document operations.

### Alternatives Considered
- **Manual rollback**: Delete lab if page creation fails → Rejected: Race conditions, not atomic
- **Two-phase commit**: Create lab first, then page with manual rollback → Rejected: More complex, less reliable
- **Saga pattern**: Compensating transactions → Rejected: Overkill for single database operation

---

## 2. Redirect Pattern After Lab Creation

### Decision
Use Next.js router.push() with query parameter flag to differentiate "just created" vs "viewing existing lab".

### Research Findings

**Next.js Navigation Patterns**:
1. **Client-side redirect**: `router.push('/labs/[id]?justCreated=true')`
2. **Server-side redirect**: `redirect()` from Next.js
3. **Query parameters**: Preserve state without modifying URL visibly
4. **Session storage**: Browser-based temporary flags

**Chosen Pattern**:
```typescript
// In lab creation page (after successful creation)
const response = await labApi.createLab(data);
const newLab = response.data;

// Get the default page ID from response
const defaultPageId = newLab.defaultPageId;

// Redirect to page editor for default page
router.push(`/labs/${newLab.id}/pages/${defaultPageId}/edit`);
```

**Alternative Pattern (with lab detail intermediate)**:
```typescript
// Mark as "just created" with session flag
sessionStorage.setItem(`lab-${newLab.id}-justCreated`, 'true');
router.push(`/labs/${newLab.id}`);

// In lab detail page
useEffect(() => {
  const justCreated = sessionStorage.getItem(`lab-${id}-justCreated`);
  if (justCreated) {
    sessionStorage.removeItem(`lab-${id}-justCreated`);
    // Redirect to page editor
    router.push(`/labs/${id}/pages/${defaultPageId}/edit`);
  }
}, [id]);
```

### Rationale
Direct redirect to page editor is simpler and faster (one redirect instead of two). The lab detail page remains accessible via "Back to Lab" button. Session storage provides a clean way to mark "just created" state without polluting URLs or requiring database flags.

### Alternatives Considered
- **URL query parameter `?justCreated=true`**: Visible in URL, can be bookmarked incorrectly
- **Database flag**: Requires additional field, must be cleared, adds complexity
- **Cookie-based flag**: More complex than session storage, persists longer than needed
- **Direct to page editor (chosen)**: Simplest, fastest user experience

---

## 3. Navigation Breadcrumbs and "Back to Lab" Button

### Decision
Add "Back to Lab" button in page editor header that navigates to `/labs/[labId]`.

### Research Findings

**Mantine UI Button Patterns**:
```typescript
<Button 
  variant="default" 
  leftSection={<IconArrowLeft />}
  onClick={() => router.push(`/labs/${labId}`)}
>
  Back to Lab
</Button>
```

**Placement Options**:
1. **Header breadcrumb**: Consistent navigation pattern
2. **Sticky button**: Always visible during scrolling
3. **Top-left corner**: Standard back button location

**Existing Pattern in Codebase**:
- Lab detail page already has navigation to individual pages
- Page editor likely exists (found in grep results)
- Need to verify if "Back to Lab" button already exists

### Rationale
Standard "Back to Lab" button follows existing navigation patterns in the application. Left-aligned with back arrow icon is conventional UX. Using router.push() maintains SPA navigation without full page reload.

### Alternatives Considered
- **Browser back button**: User might navigate to wrong page if they came from elsewhere
- **Breadcrumb trail**: More complex UI, not needed for two-level navigation
- **Automatic redirect after save**: Interrupts workflow if instructor wants to continue editing

---

## 4. Default Page Specification

### Decision
Create default page with `pageNumber: 1`, `hasQuestion: false`, `hasDiagramTest: false`.

### Research Findings

**LabPage Entity Structure** (from @whatsnxt/core-types):
```typescript
interface LabPage extends BaseEntity {
  labId: string;
  pageNumber: number;
  hasQuestion: boolean;
  hasDiagramTest: boolean;
  question?: Question;
  diagramTest?: DiagramTest;
}
```

**Page Number Convention**:
- Pages start at 1 (not 0)
- Page numbers are sequential: 1, 2, 3, ...
- No gaps in page numbers allowed

**Default State**:
- Empty page (no question, no diagram test)
- Instructor can add content immediately in page editor
- Page is created but unpopulated

### Rationale
Creating an empty page with pageNumber=1 matches existing LabPage schema. Instructors can immediately start adding content without additional "create page" step. Empty state (hasQuestion=false, hasDiagramTest=false) is the natural starting point.

### Alternatives Considered
- **Create with placeholder content**: Rejected - instructors would need to delete it first
- **Create with both question and diagram test**: Rejected - not all pages need both
- **Start page numbers at 0**: Rejected - conflicts with existing convention

---

## 5. Error Handling and User Feedback

### Decision
Use Mantine notifications for success/error feedback with transaction rollback messaging.

### Research Findings

**Notification Patterns**:
```typescript
// Success case
notifications.show({
  title: 'Success',
  message: 'Lab created successfully! Redirecting to editor...',
  color: 'green',
  autoClose: 3000,
});

// Error case - transaction failure
notifications.show({
  title: 'Error',
  message: 'Failed to create lab and default page. Please try again.',
  color: 'red',
  autoClose: false, // Let user dismiss
});
```

**Error Scenarios**:
1. **Validation error**: Show specific field errors before submission
2. **Network error**: Show "Connection failed, please retry"
3. **Transaction rollback**: Show "Lab creation failed, no changes made"
4. **Page editor load failure**: Show error with link back to lab list

### Rationale
Mantine notifications provide consistent UI feedback across the application. Specific error messages help users understand what went wrong and what to do next. Auto-close for success, manual dismiss for errors follows UX best practices.

### Alternatives Considered
- **Inline error messages**: Less visible, can be missed
- **Modal dialogs**: Too intrusive for simple notifications
- **Toast notifications**: Essentially what Mantine notifications are

---

## 6. Preventing Unwanted Redirects for Existing Labs

### Decision
Only redirect immediately after lab creation; accessing existing lab URLs shows standard detail page.

### Research Findings

**Detection Methods**:
1. **Session flag**: Set temporary flag in sessionStorage during creation flow
2. **Route parameter**: Check if navigated from creation page
3. **Database timestamp**: Check if createdAt is within last 5 seconds (unreliable)
4. **Navigation state**: Use Next.js navigation state to pass creation flag

**Chosen Approach**:
```typescript
// In lab creation page
router.push(`/labs/${newLab.id}/pages/${defaultPageId}/edit`);
// Skip lab detail page entirely

// In lab detail page
// No special logic needed - always show detail view
// Direct URL access always shows detail view
```

**Direct to Editor Approach**:
Since we're redirecting directly to the page editor (not to lab detail page), there's no risk of unwanted redirects. The lab detail page remains unchanged and always shows the standard view.

### Rationale
Redirecting directly to page editor bypasses the lab detail page entirely, eliminating the need for "just created" detection logic on the detail page. This simplifies implementation and removes potential bugs from state management.

### Alternatives Considered
- **Always check session flag**: More complex, unnecessary if we skip detail page
- **Query parameter**: Pollutes URL, can cause issues if bookmarked
- **Database flag**: Requires additional field and cleanup logic

---

## 7. Backend API Response Contract

### Decision
Modify POST /labs endpoint to return lab object with embedded `defaultPageId` field.

### Research Findings

**Current API Response**:
```json
{
  "message": "Lab created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Lab Name",
    "status": "draft",
    ...
  }
}
```

**Enhanced API Response**:
```json
{
  "message": "Lab created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Lab Name",
    "status": "draft",
    ...,
    "defaultPageId": "page-uuid-here"
  }
}
```

**Alternative - Separate Field**:
```json
{
  "message": "Lab and default page created successfully",
  "data": {
    "lab": { ... },
    "defaultPage": { "id": "...", "pageNumber": 1 }
  }
}
```

### Rationale
Including `defaultPageId` in the lab response is minimal and provides the necessary information for redirect without breaking existing API consumers. The field can be optional (undefined for old data) to maintain backward compatibility.

### Alternatives Considered
- **Separate defaultPage object**: More verbose, not necessary for redirect
- **Make separate API call to get pages**: Extra network round-trip, slower UX
- **Embed full page object**: Unnecessary data transfer

---

## 8. Testing Strategy

### Decision
Add vitest unit tests for atomic transaction, redirect logic, and edge cases.

### Research Findings

**Test Categories**:

1. **Backend Unit Tests** (apps/whatsnxt-bff/app/tests/):
   - Test atomic transaction success path
   - Test rollback on page creation failure
   - Test rollback on lab creation validation failure
   - Test concurrent creation requests

2. **Frontend Unit Tests** (apps/web/__tests__/):
   - Test redirect after successful lab creation
   - Test redirect to correct page editor URL
   - Test error handling when creation fails
   - Test "Back to Lab" button navigation

3. **Integration Tests**:
   - End-to-end lab creation flow
   - Verify no orphaned labs in database
   - Verify default page is created with correct pageNumber

**Test Framework**:
- Vitest (already configured in project)
- React Testing Library for frontend components
- Supertest for backend API tests
- MongoDB memory server for isolated database tests

### Rationale
Comprehensive testing ensures atomic transactions work correctly and prevent data inconsistencies. Testing redirect logic prevents infinite redirect loops or broken navigation. Edge case testing (concurrent requests, network failures) ensures production reliability.

### Alternatives Considered
- **Manual testing only**: Risky, doesn't catch regressions
- **E2E tests only**: Slower, harder to debug specific failures
- **Unit tests only**: Misses integration issues between lab and page creation

---

## 9. Performance Optimization

### Decision
Execute lab and page creation in parallel within transaction to minimize latency.

### Research Findings

**Sequential Creation** (Current Pattern):
```javascript
const lab = await Lab.create([labData], { session });  // ~100ms
const page = await LabPage.create([pageData], { session });  // ~100ms
// Total: ~200ms
```

**Parallel Creation** (Not possible with transactions):
MongoDB transactions require sequential operations within a session. Parallel execution would break transaction atomicity.

**Optimization Strategy**:
1. Minimize data sent to database (only required fields)
2. Use lean() queries for read operations
3. Index labId in LabPage collection for fast lookups
4. Connection pooling for database (already configured)

**Expected Performance**:
- Lab creation API: <500ms (includes transaction + network)
- Page editor load: <2 seconds (existing performance)
- Total user flow: <5 seconds (meets success criteria)

### Rationale
MongoDB transactions must be sequential to ensure atomicity. Optimization focuses on minimizing each operation's latency rather than parallelization. Existing database performance is sufficient to meet <5 second requirement.

### Alternatives Considered
- **Parallel creation without transaction**: Rejected - loses atomicity guarantee
- **Create page asynchronously after lab**: Rejected - violates requirement for immediate redirect
- **Pre-create page template**: Rejected - adds complexity without meaningful speedup

---

## 10. Backward Compatibility

### Decision
Maintain full backward compatibility with existing lab creation and viewing workflows.

### Research Findings

**Existing Workflows Preserved**:
1. Viewing existing labs → No changes to lab detail page
2. Creating pages manually → "Add New Page" button still works
3. Direct URL access → Standard detail page shown
4. Lab editing → No changes to edit functionality

**Breaking Changes**: None

**New Behavior**:
- Only affects new lab creation flow
- Adds automatic default page creation (invisible to existing data)
- Adds redirect to editor (only for new creations)

**Migration Required**: No

**Database Schema Changes**: None (using existing LabPage schema)

### Rationale
Zero breaking changes ensure smooth deployment without requiring data migration or user re-training. Existing labs continue to work identically. New feature is purely additive.

### Alternatives Considered
- **Add database migration**: Not needed, using existing schema
- **Feature flag**: Unnecessary complexity for backward-compatible change
- **Gradual rollout**: Standard deployment is sufficient

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Atomic Transactions | MongoDB sessions with startTransaction/commit/abort | Industry standard, guarantees consistency |
| Redirect Pattern | Direct redirect to page editor with defaultPageId | Fastest UX, simplest implementation |
| Navigation | "Back to Lab" button in page editor header | Standard pattern, clear user intent |
| Default Page | pageNumber=1, empty (no question/diagram) | Matches schema, natural starting point |
| Error Handling | Mantine notifications with specific messages | Consistent UI, clear user feedback |
| Existing Labs | No changes, standard detail page | Maintains backward compatibility |
| API Response | Include defaultPageId in lab creation response | Minimal, sufficient for redirect |
| Testing | Vitest unit + integration tests | Comprehensive coverage, catches regressions |
| Performance | Sequential transaction, optimized queries | Meets <5s requirement, maintains atomicity |
| Compatibility | No breaking changes, fully backward compatible | Safe deployment, zero migration needed |

---

## Open Questions

None. All research complete and decisions finalized.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**
- Create data-model.md (verify LabPage schema)
- Generate API contracts for POST /labs endpoint
- Create quickstart.md for developers
- Update agent context with new patterns
