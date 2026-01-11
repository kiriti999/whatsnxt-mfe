# Quickstart: Auto-Show Question Form

**Feature**: 002-auto-show-question-form  
**Date**: 2025-01-21  
**Target Audience**: Developers implementing or testing the auto-show behavior

---

## What This Feature Does

When an instructor navigates to an **empty page editor** (a page with zero questions), the question form **automatically appears** without requiring them to click the "Add Question" button. This saves 1 click and 3-5 seconds per lab creation.

**Key Behaviors**:
- ✅ Auto-shows on empty pages
- ✅ Does NOT auto-show on pages with existing questions
- ✅ Allows cancellation → returns to standard empty state
- ✅ Maintains all validation and save logic
- ✅ Auto-focuses the first form field for accessibility

---

## 5-Minute Implementation Guide

### Step 1: Add State Flag

In `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`, add:

```typescript
const [isFormCancelled, setIsFormCancelled] = useState(false);
```

**Purpose**: Track if user explicitly cancelled the auto-displayed form.

---

### Step 2: Reset Flag on Navigation

Update the existing `useEffect` that loads page data:

```typescript
useEffect(() => {
  setIsFormCancelled(false);  // ← Add this line
  fetchPageData();
}, [pageId]);
```

**Purpose**: Reset the cancel flag when navigating to a different page.

---

### Step 3: Add Conditional Logic

Create a derived state variable:

```typescript
const shouldAutoShowForm = 
  !loading &&                    // Data must be loaded
  questions.length === 0 &&      // Page must be empty
  !isFormCancelled;              // User hasn't cancelled
```

**Purpose**: Determine when to auto-display the form.

---

### Step 4: Update Render Logic

Replace the empty state rendering logic:

**Before**:
```typescript
{questions.length === 0 ? (
  <EmptyState>
    <Button onClick={addQuestion}>Add Question</Button>
  </EmptyState>
) : (
  <QuestionList questions={questions} />
)}
```

**After**:
```typescript
{shouldAutoShowForm ? (
  // Auto-display the form
  <QuestionForm 
    question={questions[0] || createEmptyQuestion()}
    autoFocus={true}  // ← Auto-focus first field
    onSave={saveIndividualQuestion}
    onCancel={() => {
      setIsFormCancelled(true);  // ← Set cancel flag
      setQuestions([]);          // Clear unsaved question
    }}
  />
) : questions.length === 0 ? (
  // Show empty state with button
  <EmptyState>
    <Button onClick={addQuestion}>Add Question</Button>
  </EmptyState>
) : (
  // Show existing questions
  <QuestionList questions={questions} />
)}
```

---

### Step 5: Add Auto-Focus

In the `QuestionForm` component (or inline if using Mantine directly), add `autoFocus` to the first input:

```typescript
<Textarea
  autoFocus={props.autoFocus}  // ← Pass down autoFocus prop
  placeholder="Enter your question text"
  value={question.questionText}
  onChange={(e) => updateQuestion('questionText', e.target.value)}
  minLength={10}
  maxLength={1000}
/>
```

**Purpose**: Automatically focus the question text field when form appears.

---

## Testing Checklist

### Manual Testing

1. **Empty Page Auto-Show**:
   - Create a new lab (or navigate to an empty page)
   - ✅ Form should appear automatically
   - ✅ First field should be focused
   - ✅ No "Add Question" button click needed

2. **Cancel Behavior**:
   - Auto-display form should be visible
   - Click "Cancel" button
   - ✅ Form should disappear
   - ✅ "Add Question" button should appear

3. **Existing Questions**:
   - Navigate to a page with existing questions
   - ✅ Form should NOT auto-display
   - ✅ Questions should be visible normally

4. **Navigation Reset**:
   - Auto-display form, then cancel it
   - Navigate to a different empty page
   - ✅ Form should auto-display again (cancel flag reset)

---

### Automated Testing

Run the test suite:

```bash
cd apps/web
pnpm test __tests__/page-editor-auto-form.test.tsx
```

**Expected**: All tests pass ✅

**Test Coverage**:
- Auto-display on empty page
- No auto-display on populated page
- Cancel behavior
- Auto-focus verification
- Navigation reset

---

## Troubleshooting

### Issue: Form doesn't auto-display

**Diagnosis**:
```typescript
// Add debug logging
console.log({
  loading,
  questionsLength: questions.length,
  isFormCancelled,
  shouldAutoShowForm
});
```

**Common Causes**:
- `loading` is still `true` → Wait for data fetch to complete
- `questions.length` is not `0` → Page is not actually empty
- `isFormCancelled` is `true` → User previously cancelled, try navigating away and back

---

### Issue: Auto-focus doesn't work

**Diagnosis**: Check if `autoFocus` prop is being passed down correctly.

**Fix**:
```typescript
// Ensure prop is passed to Textarea
<Textarea autoFocus={shouldAutoShowForm} {...} />
```

**Note**: Auto-focus only works if the component mounts with the prop set to `true`.

---

### Issue: Cancel doesn't show "Add Question" button

**Diagnosis**: Check if `setIsFormCancelled(true)` is being called in the cancel handler.

**Fix**:
```typescript
const handleCancel = () => {
  setIsFormCancelled(true);   // ← Must set this
  setQuestions([]);            // Clear any unsaved question
};
```

---

## Performance Notes

- **Form Display Time**: <1 second after page load (data fetch + render)
- **Auto-Focus Delay**: ~10ms (negligible)
- **No Additional API Calls**: Uses existing `getLabPageById` response
- **Memory Impact**: +1 boolean flag (~1 byte)

**Performance is within requirements** ✓

---

## Accessibility

### Focus Management
- Auto-focus is **intentional** and **expected** for this workflow
- User has just created a lab → primary intent is to add questions
- Screen readers will announce the focused field immediately

### Keyboard Navigation
- Tab order remains unchanged
- Escape key should close the form (if implemented in QuestionForm)
- All existing keyboard shortcuts continue to work

### ARIA Labels
Ensure form fields have proper labels:
```typescript
<Textarea
  autoFocus
  aria-label="Question text"
  aria-required="true"
  {...}
/>
```

---

## Integration with 001-Streamline-Lab-Creation

This feature works seamlessly with the lab creation redirect:

1. User creates a new lab (001 feature)
2. User is redirected to page editor (001 feature)
3. **This feature**: Form auto-displays (002 feature)
4. User fills in question and saves
5. Lab is ready with first question ✅

**Combined Time Savings**: 5-8 seconds per lab creation

---

## Code Locations

| File | Lines | Purpose |
|------|-------|---------|
| `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` | ~50-900 | Main page editor component |
| `apps/web/__tests__/page-editor-auto-form.test.tsx` | NEW | Component tests for auto-show |
| `specs/002-auto-show-question-form/` | N/A | Design documentation |

---

## Rollback Plan

If issues arise, rollback is simple:

1. Remove `isFormCancelled` state declaration
2. Remove `setIsFormCancelled(false)` from useEffect
3. Revert conditional rendering to previous logic
4. Remove `autoFocus` prop

**Estimated Rollback Time**: <5 minutes

---

## Future Enhancements (Out of Scope)

- Pre-populate form with AI-suggested questions
- Auto-save as user types
- Keyboard shortcut to toggle form (e.g., `Cmd+N`)
- Analytics tracking for time saved

---

## Summary

**Implementation Time**: ~30 minutes  
**Testing Time**: ~15 minutes  
**Lines of Code Changed**: ~20 lines  
**Risk Level**: Low (pure UI enhancement)

**Quick Win**: High user value for minimal code change ✅

---

## Questions or Issues?

Refer to:
- **Spec**: `specs/002-auto-show-question-form/spec.md`
- **Research**: `specs/002-auto-show-question-form/research.md`
- **Data Model**: `specs/002-auto-show-question-form/data-model.md`
- **Plan**: `specs/002-auto-show-question-form/plan.md`
