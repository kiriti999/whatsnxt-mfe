# Data Model: Auto-Show Question Form

**Date**: 2025-01-21  
**Feature**: 002-auto-show-question-form  
**Purpose**: Document data structures and state management for the auto-show behavior

---

## Overview

This feature does **not introduce new entities** or modify existing data structures. It purely adds UI state management to control the conditional display of the question form. All question-related data models remain unchanged.

---

## Existing Data Structures (No Changes)

### Question Entity
```typescript
interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options: string;  // Comma-separated string for MCQ
  correctAnswer: string;
  isSaved?: boolean;  // Client-side flag for UI state
}
```

**Source**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` (lines 50-56)

**Notes**:
- This entity is **not modified** by the auto-show feature
- Backend stores questions; frontend transforms for display
- `isSaved` is a client-side flag to show "Saved" badge

---

### Page Data Response
```typescript
interface PageDataResponse {
  id: string;
  labId: string;
  questions: Question[];
  // ... other page metadata
}
```

**API Endpoint**: `GET /labs/{labId}/pages/{pageId}`  
**Source**: `apis/lab.api.ts` - `labApi.getLabPageById()`

**Notes**:
- No changes to API contract
- Feature uses existing `questions` array to determine empty state

---

## New UI State (Client-Side Only)

### isFormCancelled Flag

**Purpose**: Track whether the user has explicitly cancelled the auto-displayed form

```typescript
// Added to PageEditor component state
const [isFormCancelled, setIsFormCancelled] = useState<boolean>(false);
```

**Lifecycle**:
1. **Initial**: `false` (allow auto-show)
2. **After Cancel**: `true` (prevent auto-show until navigation)
3. **On Navigation**: Reset to `false` (via useEffect dependency on pageId)

**Scope**: Component-local state (React useState)  
**Persistence**: None - resets on page navigation or browser refresh

---

### Conditional Rendering Logic

**Derived State** (no new state variable needed):
```typescript
const shouldAutoShowForm = 
  !loading &&                    // Data must be loaded
  questions.length === 0 &&      // Page must be empty
  !isFormCancelled;              // User hasn't cancelled
```

**Usage**:
```typescript
{shouldAutoShowForm ? (
  <QuestionForm 
    question={emptyQuestion} 
    autoFocus={true}
    onSave={handleSave}
    onCancel={handleCancel}
  />
) : (
  <EmptyStateWithButton />
)}
```

---

## State Transitions

### State Machine Diagram

```
┌─────────────────┐
│  Page Loads     │
│  (loading=true) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Data Fetched    │
│ (loading=false) │
└────────┬────────┘
         │
         ├─── questions.length > 0 ──▶ [Show Existing Questions]
         │
         └─── questions.length === 0
              │
              ├─── isFormCancelled = true ──▶ [Show "Add Question" Button]
              │
              └─── isFormCancelled = false ──▶ [Auto-Show Form] ◀─┐
                   │                                               │
                   ├─── User Saves ──▶ [Show Question List]       │
                   │                                               │
                   └─── User Cancels ──▶ [Set isFormCancelled]────┘
```

### Transition Rules

| Current State | Trigger | Next State | Side Effect |
|---------------|---------|------------|-------------|
| Loading | Data fetched (empty) | Auto-Show Form | Focus first field |
| Loading | Data fetched (populated) | Show Questions | None |
| Auto-Show Form | User saves | Show Questions | API call, add to list |
| Auto-Show Form | User cancels | Empty State Button | Set `isFormCancelled=true` |
| Empty State Button | User clicks "Add Question" | Manual Show Form | Same as normal flow |
| Any State | Navigate to new page | Loading | Reset `isFormCancelled=false` |

---

## Validation Rules (Unchanged)

All existing question form validation remains identical:

1. **Question Text**: 10-1000 characters (required)
2. **Question Type**: One of 3 valid types (required)
3. **Options**: Required for MCQ type, comma-separated
4. **Correct Answer**: Required, must match type constraints

**Source**: Existing validation in `page.tsx` (lines 260-367, validation logic)

---

## API Contracts (No Changes)

### Existing Endpoints Used

**1. Load Page Data**
```
GET /labs/{labId}/pages/{pageId}
Response: { questions: Question[], ... }
```

**2. Save Question**
```
POST /labs/{labId}/pages/{pageId}/questions
Request: { questionText, type, options, correctAnswer }
Response: { id, questionText, type, options, correctAnswer }
```

**No new endpoints required** ✓

---

## Component State Summary

### Before Feature
```typescript
// Existing state in page.tsx
const [questions, setQuestions] = useState<Question[]>([]);
const [loading, setLoading] = useState(true);
const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
// ... other state
```

### After Feature
```typescript
// Existing state (unchanged)
const [questions, setQuestions] = useState<Question[]>([]);
const [loading, setLoading] = useState(true);
const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

// NEW: Track if auto-show was cancelled
const [isFormCancelled, setIsFormCancelled] = useState(false);

// DERIVED: Determine if form should auto-show
const shouldAutoShowForm = !loading && questions.length === 0 && !isFormCancelled;
```

**State Complexity**: +1 boolean flag (minimal increase)

---

## Data Flow Diagram

```
┌──────────────┐
│ Page Loads   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ useEffect triggers   │
│ fetchPageData()      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ API: getLabPageById  │
│ Returns: questions[] │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ setQuestions(data)   │
│ setLoading(false)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Render Logic:                │
│ if (shouldAutoShowForm)      │
│   → Display Form (autoFocus) │
│ else if (questions.length>0) │
│   → Display Questions        │
│ else                         │
│   → Display "Add" Button     │
└──────────────────────────────┘
```

---

## Accessibility Data Attributes

To support testing and accessibility tools, the following data attributes should be added:

```typescript
// Auto-displayed form container
<div data-testid="auto-question-form" data-auto-displayed="true">
  <Textarea 
    data-testid="question-text-input"
    autoFocus
    aria-label="Question text"
  />
</div>

// Empty state with button
<div data-testid="empty-state">
  <Button data-testid="add-question-button">
    Add Question
  </Button>
</div>
```

**Purpose**: Enable reliable testing and screen reader announcements

---

## Summary

### Data Changes
- ❌ No new database entities
- ❌ No API contract changes
- ✅ 1 new client-side state flag (`isFormCancelled`)
- ✅ 1 derived boolean (`shouldAutoShowForm`)

### Data Model Impact
- **Complexity**: Minimal (+2 lines of state logic)
- **Testing**: Easy to mock (single boolean flag)
- **Maintenance**: Low (no coupling to backend)

**Conclusion**: This is a **pure UI feature** with no data model changes required.
