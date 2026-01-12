# Quickstart Guide: Diagram Quiz Hints System

**Feature Branch**: `001-diagram-quiz-hints`  
**Date**: 2025-01-20  
**Status**: Implementation Ready

---

## Overview

This guide provides developers with everything needed to implement the Diagram Quiz Hints System. The feature allows instructors to add up to 5 hints to diagram quiz tests, which students can progressively reveal during quiz attempts.

**Key Features**:
- Instructors can add/edit/reorder/delete hints (max 5 per test)
- Students reveal hints one at a time (progressive disclosure)
- Hints are optional - tests without hints work normally
- Backward compatible - existing tests continue to function

---

## Prerequisites

- **Node.js**: 24 LTS installed
- **MongoDB**: Running (localhost:27017 or configured)
- **Backend API**: Running at localhost:4444
- **pnpm**: 10+ installed
- **Repository**: Cloned and dependencies installed
- **Branch**: Checked out to `001-diagram-quiz-hints`

---

## Quick Start (5 Minutes)

### 1. Checkout Feature Branch

```bash
cd /path/to/whatsnxt-mfe
git checkout 001-diagram-quiz-hints
pnpm install
```

### 2. Start Backend API

```bash
# Backend runs separately at localhost:4444
# Ensure backend service is running before frontend development
# (Backend is a separate repository/service)
```

### 3. Start Frontend Development Server

```bash
pnpm dev
# Frontend runs at http://localhost:3001
```

### 4. Test Hint Management Flow (Instructor)

```bash
# 1. Navigate to: http://localhost:3001/labs
# 2. Open existing lab or create new one
# 3. Navigate to a page with a diagram test
# 4. Scroll to "Hints" section in diagram test editor
# 5. Add hints using "Add Hint" button (max 5)
# 6. Drag hints to reorder
# 7. Save diagram test
# 8. Verify hints are persisted on page reload
```

### 5. Test Hint Disclosure Flow (Student)

```bash
# 1. Navigate to: http://localhost:3001/labs
# 2. Open a published lab with diagram test containing hints
# 3. Start the diagram test (Student view)
# 4. Look for "Hints Available" section above diagram editor
# 5. Click "Show Hint 1" button
# 6. Verify hint 1 is revealed
# 7. Click "Show Hint 2" button
# 8. Verify hint 2 is revealed (hint 1 still visible)
# 9. Continue until all hints revealed
# 10. Verify "No more hints available" message appears
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 16)                       │
│                 http://localhost:3001                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Instructor: Diagram Test Editor Page                     │
│     └─ apps/web/app/labs/[id]/pages/[pageId]/page.tsx       │
│        └─ NEW: HintsEditor component                         │
│                                                               │
│  2. Student: StudentTestRunner Component                     │
│     └─ apps/web/components/Lab/StudentTestRunner.tsx         │
│        └─ NEW: HintsDisclosure component                     │
│                                                               │
│  3. Shared Types                                             │
│     └─ packages/core-types/src/index.d.ts                    │
│        └─ UPDATED: DiagramTest with hints?: string[]         │
│                                                               │
│  4. API Client                                               │
│     └─ apps/web/apis/lab.api.ts                              │
│        └─ UPDATED: CreateDiagramTestRequest with hints       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │ HTTP/REST API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Express.js v5)                     │
│                 http://localhost:4444                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/v1/lab/:labId/pages/:pageId/diagram-test         │
│     ├─ Validates hints (max 5, each ≤500 chars)             │
│     ├─ Filters empty/duplicate hints                         │
│     ├─ Saves DiagramTest with hints array                    │
│     └─ Returns DiagramTest with hints                        │
│                                                               │
│  GET /api/v1/lab/:labId/pages/:pageId                        │
│     ├─ Retrieves LabPage with DiagramTest                    │
│     ├─ Includes hints in response if present                 │
│     └─ Returns DiagramTest (with or without hints)           │
│                                                               │
│  DELETE /api/v1/lab/:labId/pages/:pageId/diagram-test       │
│     └─ Deletes entire DiagramTest (including hints)          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                             ▲
                             │ MongoDB Driver
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│                   localhost:27017                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collection: diagram_tests                                   │
│     ├─ _id: ObjectId                                         │
│     ├─ labPageId: ObjectId                                   │
│     ├─ prompt: String                                        │
│     ├─ expectedDiagramState: Mixed                           │
│     ├─ architectureType: String                              │
│     ├─ hints: [String] (NEW - optional)                      │
│     ├─ createdAt: Date                                       │
│     └─ updatedAt: Date                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### New/Modified Files

```text
# Frontend
apps/web/
├── components/
│   └── Lab/
│       ├── HintsEditor.tsx             # NEW: Instructor hint management UI
│       ├── HintsDisclosure.tsx         # NEW: Student hint reveal UI
│       └── StudentTestRunner.tsx       # MODIFIED: Integrate HintsDisclosure
├── app/
│   └── labs/
│       └── [id]/
│           └── pages/
│               └── [pageId]/
│                   └── page.tsx         # MODIFIED: Add HintsEditor
└── apis/
    └── lab.api.ts                       # MODIFIED: Add hints to request types

# Shared Types
packages/core-types/
└── src/
    └── index.d.ts                       # MODIFIED: Add hints?: string[] to DiagramTest

# Backend (separate repository - reference only)
backend/
├── models/
│   └── DiagramTest.js                   # MODIFIED: Add hints field to schema
├── controllers/
│   └── diagramTestController.js         # MODIFIED: Validate and handle hints
├── validators/
│   └── diagramTestValidator.js          # MODIFIED: Add hints validation rules
└── routes/
    └── labRoutes.js                     # NO CHANGE: Existing endpoints handle hints

# Documentation
specs/001-diagram-quiz-hints/
├── plan.md                              # This implementation plan
├── spec.md                              # Feature specification
├── research.md                          # Research findings (Phase 0)
├── data-model.md                        # Data model (Phase 1)
├── quickstart.md                        # This file (Phase 1)
├── contracts/
│   └── diagram-test-hints-api.json      # API contract (Phase 1)
└── tasks.md                             # Task breakdown (Phase 2 - future)
```

---

## Component Specifications

### 1. HintsEditor Component (Instructor UI)

**Location**: `apps/web/components/Lab/HintsEditor.tsx`

**Purpose**: Allow instructors to add, edit, reorder, and delete hints in diagram test editor.

**Key Features**:
- Drag-and-drop reordering with `@dnd-kit/sortable`
- Inline text editing with Mantine `TextInput`
- Character counter (max 500 chars per hint)
- Add/delete hint buttons
- Max 5 hints enforcement
- Real-time validation (duplicates, empty hints)

**Props**:
```typescript
interface HintsEditorProps {
  hints: string[];           // Current hints array
  onUpdate: (hints: string[]) => void;  // Callback when hints change
  disabled?: boolean;        // Disable editing (e.g., during save)
}
```

**Example Usage**:
```tsx
<HintsEditor
  hints={diagramTestData?.hints || []}
  onUpdate={(updatedHints) => {
    setDiagramTestData({ ...diagramTestData, hints: updatedHints });
  }}
  disabled={saving}
/>
```

---

### 2. HintsDisclosure Component (Student UI)

**Location**: `apps/web/components/Lab/HintsDisclosure.tsx`

**Purpose**: Progressive hint disclosure for students during quiz attempts.

**Key Features**:
- Mantine `Accordion` for revealed hints
- "Show Next Hint" button with remaining count
- Track revealed hints count
- Emit hint reveal events to parent
- Responsive design (mobile-friendly)

**Props**:
```typescript
interface HintsDisclosureProps {
  hints: string[];           // All available hints
  onHintRevealed?: (count: number) => void;  // Optional callback for tracking
}
```

**Example Usage**:
```tsx
{diagramTest?.hints && diagramTest.hints.length > 0 && (
  <Paper p="md" withBorder mb="md">
    <HintsDisclosure
      hints={diagramTest.hints}
      onHintRevealed={(count) => {
        setRevealedHintsCount(count);
        console.log(`Student revealed ${count} hints`);
      }}
    />
  </Paper>
)}
```

---

## API Integration Examples

### Instructor: Create Diagram Test with Hints

```typescript
// In LabPageEditorPage component
const handleSaveDiagramTest = async () => {
  try {
    const response = await labApi.saveDiagramTest(labId, pageId, {
      prompt: "Design a 3-tier web application architecture",
      expectedDiagramState: {
        shapes: [...], // Diagram shapes
        connections: [...] // Connections between shapes
      },
      architectureType: "AWS",
      hints: [
        "Start with the presentation layer components",
        "Consider where your application data will be stored",
        "Think about how the layers communicate securely"
      ]
    });
    
    notifications.show({
      title: 'Success',
      message: 'Diagram test saved with hints',
      color: 'green'
    });
  } catch (error) {
    notifications.show({
      title: 'Error',
      message: error.message,
      color: 'red'
    });
  }
};
```

### Instructor: Update Hints Only

```typescript
const handleUpdateHints = async (newHints: string[]) => {
  try {
    await labApi.saveDiagramTest(labId, pageId, {
      ...existingDiagramTestData, // Keep existing prompt, state, etc.
      hints: newHints // Update only hints
    });
  } catch (error) {
    console.error('Failed to update hints:', error);
  }
};
```

### Instructor: Remove All Hints

```typescript
const handleRemoveAllHints = async () => {
  try {
    await labApi.saveDiagramTest(labId, pageId, {
      ...existingDiagramTestData,
      hints: undefined // Remove hints
    });
  } catch (error) {
    console.error('Failed to remove hints:', error);
  }
};
```

### Student: Load Diagram Test with Hints

```typescript
// In StudentTestRunner component
useEffect(() => {
  const loadDiagramTest = async () => {
    const response = await labApi.getLabPage(labId, pageId);
    const { diagramTest } = response.data;
    
    setDiagramTestData(diagramTest);
    
    if (diagramTest?.hints && diagramTest.hints.length > 0) {
      console.log(`${diagramTest.hints.length} hints available`);
      // Show HintsDisclosure component
    } else {
      console.log('No hints for this test');
      // Don't show hints UI
    }
  };
  
  loadDiagramTest();
}, [labId, pageId]);
```

### Student: Submit Test with Hint Usage (P3 Feature - Future)

```typescript
const handleSubmitTest = async () => {
  const submission = {
    diagramAnswer: studentDiagram,
    hintsRevealed: revealedHintsCount, // P3: Track hint usage
    hintIndices: Array.from({ length: revealedHintsCount }, (_, i) => i)
  };
  
  await onSubmit(submission);
};
```

---

## Data Model Quick Reference

### DiagramTest Entity (Extended)

```typescript
interface DiagramTest {
  id: string;                     // UUID
  labPageId: string;              // UUID
  prompt: string;                 // Test instructions
  expectedDiagramState: object;   // Correct diagram JSON
  architectureType: string;       // AWS | Azure | GCP | Common | Hybrid
  hints?: string[];               // NEW: Optional hints (max 5)
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `hints` array length | ≤ 5 | "Maximum 5 hints allowed" |
| Each hint length | 1-500 chars | "Each hint must be 1-500 characters" |
| Duplicate hints | Not allowed | "Duplicate hints are not allowed" |
| Empty hints | Filtered out | (No error, silently removed) |

---

## Testing Checklist

### Unit Tests (Future)

- [ ] HintsEditor component renders correctly
- [ ] HintsEditor allows adding hints (up to 5)
- [ ] HintsEditor prevents adding 6th hint
- [ ] HintsEditor allows deleting hints
- [ ] HintsEditor allows reordering hints via drag-and-drop
- [ ] HintsEditor validates hint length (500 chars max)
- [ ] HintsEditor detects duplicate hints
- [ ] HintsDisclosure component renders hints correctly
- [ ] HintsDisclosure reveals hints progressively
- [ ] HintsDisclosure tracks revealed count
- [ ] Backend validates hints array (max 5)
- [ ] Backend validates each hint (1-500 chars)
- [ ] Backend filters empty/whitespace hints
- [ ] Backend rejects duplicate hints

### Integration Tests (Future)

- [ ] Instructor creates diagram test with hints → hints saved to DB
- [ ] Instructor updates hints → changes persisted
- [ ] Instructor deletes all hints → hints removed from DB
- [ ] Student loads test with hints → hints displayed in UI
- [ ] Student reveals hints progressively → state tracked
- [ ] Student loads test without hints → no hints UI shown
- [ ] Existing diagram tests without hints → continue to work

### Manual Testing (Immediate)

**Instructor Flow**:
1. Create new lab and page
2. Add diagram test with 3 hints
3. Save and reload page → verify hints persist
4. Reorder hints via drag-and-drop
5. Save and reload → verify new order persists
6. Delete middle hint
7. Save and reload → verify hint removed
8. Try adding 6th hint → verify button disabled/error shown
9. Try adding duplicate hint → verify warning shown
10. Delete all hints → verify no hints UI in student view

**Student Flow**:
1. Open published lab with diagram test containing hints
2. Verify "Hints Available" section visible
3. Verify hint count displayed (e.g., "3 hints available")
4. Click "Show Hint 1" → verify hint 1 revealed
5. Click "Show Hint 2" → verify hint 2 revealed, hint 1 still visible
6. Click "Show Hint 3" → verify hint 3 revealed, all hints visible
7. Verify "No more hints" message or button disabled
8. Open lab without hints → verify no hints UI shown

---

## Common Issues & Solutions

### Issue: Hints not persisting after save

**Cause**: Frontend not sending `hints` in request payload.

**Solution**: Ensure `hints` field is included in `CreateDiagramTestRequest`:
```typescript
await labApi.saveDiagramTest(labId, pageId, {
  // ... other fields
  hints: hintsArray // Make sure this is included
});
```

---

### Issue: "Maximum 5 hints allowed" error when saving

**Cause**: Trying to save more than 5 hints.

**Solution**: Validate hints count before submission:
```typescript
if (hints.length > 5) {
  notifications.show({
    title: 'Error',
    message: 'Maximum 5 hints allowed',
    color: 'red'
  });
  return;
}
```

---

### Issue: Duplicate hints not detected

**Cause**: Frontend validation missing or case-sensitivity issue.

**Solution**: Add duplicate check:
```typescript
const hasDuplicates = (hints: string[]) => {
  const trimmed = hints.map(h => h.trim());
  return new Set(trimmed).size !== trimmed.length;
};

if (hasDuplicates(hints)) {
  // Show warning
}
```

---

### Issue: Empty hints saved to database

**Cause**: Frontend not filtering empty strings before submission.

**Solution**: Sanitize hints before save:
```typescript
const sanitizeHints = (hints: string[]): string[] => {
  return hints
    .map(h => h.trim())
    .filter(h => h.length > 0);
};

const cleanedHints = sanitizeHints(hints);
```

---

### Issue: Hints UI not showing for student

**Cause**: Conditional rendering missing or incorrect.

**Solution**: Ensure proper condition:
```tsx
{diagramTest?.hints && diagramTest.hints.length > 0 && (
  <HintsDisclosure hints={diagramTest.hints} />
)}
```

---

### Issue: Drag-and-drop not working in HintsEditor

**Cause**: `@dnd-kit` not installed or configured incorrectly.

**Solution**: Ensure dependencies installed:
```bash
pnpm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## Performance Considerations

### Database Queries

- **No additional queries**: Hints are part of DiagramTest document, loaded with existing queries.
- **No indexes needed**: Hints are not searchable/filterable fields.

### API Response Size

- **Minimal impact**: 5 hints × 500 chars max = 2.5KB additional per test.
- **Acceptable**: Within normal API response sizes.

### Client-Side Rendering

- **Low complexity**: Simple array map, no heavy computations.
- **Minimal re-renders**: State changes only on hint reveal actions.

---

## Next Steps

After completing this feature:

1. **Phase 2: Task Breakdown** (`/speckit.tasks` command)
   - Generate detailed task list for implementation
   - Prioritize tasks by user story (P1 → P2 → P3)

2. **Phase 3: Implementation** (`/speckit.implement` command)
   - Execute tasks in dependency order
   - Test each component incrementally

3. **Phase 4: P3 Features** (Future)
   - Implement hint usage tracking (StudentDiagramTestSubmission entity)
   - Build instructor analytics dashboard
   - Add aggregated hint statistics

---

## Resources

### Documentation
- Feature Spec: `specs/001-diagram-quiz-hints/spec.md`
- Research: `specs/001-diagram-quiz-hints/research.md`
- Data Model: `specs/001-diagram-quiz-hints/data-model.md`
- API Contract: `specs/001-diagram-quiz-hints/contracts/diagram-test-hints-api.json`

### Code References
- Existing DiagramTest: `packages/core-types/src/index.d.ts`
- Lab API Client: `apps/web/apis/lab.api.ts`
- Diagram Test Editor: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- Student Test Runner: `apps/web/components/Lab/StudentTestRunner.tsx`

### External Libraries
- Mantine UI: https://mantine.dev/
- @dnd-kit: https://docs.dndkit.com/
- React 19: https://react.dev/

---

## Support

For questions or issues:
1. Check this quickstart guide
2. Review research.md for technical decisions
3. Consult data-model.md for schema details
4. Check API contract for endpoint specifications

**Status**: Ready for Phase 2 (Task Generation) ✅
