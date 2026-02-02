# Course Content Overview - Data Persistence Fix (Updated)

## Issue
When saving the Overview content in a Course Content section and navigating to the Landing Page step and back, the Overview content would disappear.

## Root Cause
The `ContentSectionEditor` component was using `useState` initialized from props, but the `useEffect` dependency `[section]` wasn't triggering when the section data changed because:

1. **Object Reference Issue**: React Query might return the same object reference even after refetching
2. **Shallow Comparison**: `useEffect` uses shallow comparison, so if the object reference doesn't change, it won't trigger
3. **Navigation Behavior**: The component doesn't unmount when navigating between steps, so the effect needs to trigger on data changes

## Solution Evolution

### First Attempt (Partial Fix)
```typescript
// ❌ Problem: Only triggers when object reference changes
useEffect(() => {
    setOverview(section.overview);
    // ... other fields
}, [section]);
```

### Second Attempt (Better but Verbose)
```typescript
// ⚠️ Works but verbose and may have issues with array comparisons
useEffect(() => {
    setOverview(section.overview);
    // ... other fields
}, [
    section._id,
    section.title,
    section.overview,
    // ... many dependencies
]);
```

### Final Solution (Best)
```typescript
// ✅ Deep comparison using JSON.stringify
useEffect(() => {
    setTitle(section.title);
    setOverview(section.overview);
    setComparisonsTitle(section.comparisons?.title || '');
    setComparisonsDesc(section.comparisons?.description || '');
    setTabs(section.comparisons?.tabs || []);
    setCollapsiblesTitle(section.collapsibles?.title || '');
    setCollapsiblesDesc(section.collapsibles?.description || '');
    setCollapsibleItems(section.collapsibles?.items || []);
    setResourcesTitle(section.additionalResources?.title || '');
    setResources(section.additionalResources?.items || []);
}, [JSON.stringify(section)]);
```

## Why JSON.stringify Works

**Advantages:**
- ✅ Deep comparison - catches changes in nested objects and arrays
- ✅ Triggers on any data change, not just reference changes
- ✅ Simpler than listing all dependencies
- ✅ Works with React Query's caching behavior

**How it works:**
```javascript
// Before save:
JSON.stringify(section) = '{"_id":"123","overview":"","title":"Topic"}'

// After save:
JSON.stringify(section) = '{"_id":"123","overview":"Saved content","title":"Topic"}'

// Strings are different → useEffect triggers → State updates ✅
```

## Flow Diagram

```
User Action: Save Overview
    ↓
API Call: Update section
    ↓
React Query: Invalidate cache
    ↓
React Query: Refetch data
    ↓
section prop: Updates with new data
    ↓
JSON.stringify(section): Produces new string
    ↓
useEffect: Detects change (different string)
    ↓
State Update: setOverview(section.overview)
    ↓
UI: Shows saved content ✅
```

## Navigation Flow

```
Step 1: Course Content (save overview)
    ↓
Step 2: Landing Page (component stays mounted)
    ↓
Step 3: Back to Course Content
    ↓
React Query: Returns cached data
    ↓
JSON.stringify(section): Same as before
    ↓
useEffect: Doesn't trigger (no change)
    ↓
State: Already has correct data ✅
```

## Performance Considerations

**Q: Is JSON.stringify expensive?**
**A:** For typical section objects (< 100KB), it's negligible. The benefit of correct behavior outweighs the minimal performance cost.

**Q: Will it cause unnecessary re-renders?**
**A:** No. The effect only runs when the stringified section changes, which is exactly when we want it to run.

## Files Modified
- `/Users/arjun/whatsnxt-mfe/apps/web/app/_component/trainer/CourseContent/CourseContentEditor.tsx`
  - Updated `useEffect` dependency from `[section]` to `[JSON.stringify(section)]`
  - Added comment explaining the deep comparison approach

## Testing Checklist
1. ✅ Save Overview content in Course Content section
2. ✅ Navigate to Landing Page step
3. ✅ Navigate back to Course Content step
4. ✅ **Overview content should still be visible**
5. ✅ Edit Overview content
6. ✅ Save again
7. ✅ Navigate away and back
8. ✅ **Updated content should be visible**
9. ✅ Test with all tabs (Comparisons, Collapsibles, Additional Resources)

## Related Issues Fixed
This fix also ensures that:
- ✅ Comparisons data persists
- ✅ Collapsibles data persists
- ✅ Additional Resources data persists
- ✅ All tabs maintain their state correctly

## Status
✅ **Fixed** - Course Content Overview now persists correctly across navigation using deep comparison with JSON.stringify
