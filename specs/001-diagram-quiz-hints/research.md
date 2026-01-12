# Research: Diagram Quiz Hints System

**Branch**: `001-diagram-quiz-hints`  
**Date**: 2025-01-20  
**Purpose**: Resolve technical unknowns and establish implementation patterns

---

## 1. Extending DiagramTest Data Model

### Current State
The existing `DiagramTest` interface (packages/core-types/src/index.d.ts) contains:
```typescript
export interface DiagramTest extends BaseEntity {
  labPageId: string;
  prompt: string;
  expectedDiagramState: Record<string, any>;
  architectureType: string;
}
```

### Decision: Add Hints as Array Field
Add a `hints` field to store ordered hint strings directly on the DiagramTest entity.

### Rationale
- **Simplicity**: Hints are tightly coupled to diagram tests (1:1 relationship)
- **No additional collections**: Avoids creating a separate Hints table/collection
- **Order preservation**: Array naturally maintains hint sequence
- **MongoDB compatibility**: Arrays are first-class citizens in MongoDB
- **Type safety**: TypeScript array provides compile-time validation

### Implementation Approach
```typescript
export interface DiagramTest extends BaseEntity {
  labPageId: string;
  prompt: string;
  expectedDiagramState: Record<string, any>;
  architectureType: string;
  hints?: string[]; // New field: ordered array of hint texts (max 5)
}
```

### Alternatives Considered
1. **Separate Hints Collection**: More normalized but adds complexity
   - Rejected: Over-engineering for simple text storage
2. **Hints as Object with Metadata**: `{ text: string; order: number; id: string }[]`
   - Rejected: Array index provides order, no need for explicit ordering
3. **Store hints in Question entity**: Wrong entity, diagram tests are separate
   - Rejected: Violates domain separation

---

## 2. Progressive Hint Disclosure UI Pattern

### Research Question
What's the best UX pattern for revealing hints one at a time without overwhelming students?

### Decision: Accordion-Style Progressive Disclosure with Mantine

**Pattern**: Use Mantine's `Accordion` component with controlled state to show hints sequentially.

### Rationale
- **Mantine Accordion**: Already in tech stack, designed for progressive disclosure
- **Controlled state**: Track `revealedHintsCount` to limit what's accessible
- **Visual feedback**: Each hint is a separate accordion item with clear numbering
- **Accessibility**: Mantine components are ARIA-compliant out of the box
- **Cognitive load**: Students see only revealed hints + next available hint button

### Implementation Approach
```tsx
// Component state
const [revealedHintsCount, setRevealedHintsCount] = useState(0);

// Render logic
<Stack>
  <Accordion value={null}> {/* Controlled, initially collapsed */}
    {hints.slice(0, revealedHintsCount).map((hint, index) => (
      <Accordion.Item key={index} value={`hint-${index}`}>
        <Accordion.Control>Hint {index + 1}</Accordion.Control>
        <Accordion.Panel>{hint}</Accordion.Panel>
      </Accordion.Item>
    ))}
  </Accordion>
  
  {revealedHintsCount < hints.length && (
    <Button 
      variant="light" 
      onClick={() => setRevealedHintsCount(prev => prev + 1)}
    >
      Show Hint {revealedHintsCount + 1} ({hints.length - revealedHintsCount} remaining)
    </Button>
  )}
</Stack>
```

### Alternatives Considered
1. **Modal-based disclosure**: Show each hint in a modal
   - Rejected: Disruptive to workflow, hides previously revealed hints
2. **Tooltip-style hints**: Hover to reveal
   - Rejected: Not mobile-friendly, no clear progression tracking
3. **Tabs for each hint**: Switch between hints
   - Rejected: Doesn't prevent viewing unrevealed hints
4. **Custom component from scratch**: Build bespoke hint revealer
   - Rejected: Mantine Accordion already provides needed functionality

---

## 3. Hint Management in Instructor UI

### Research Question
How should instructors add, edit, reorder, and delete hints in the diagram test editor?

### Decision: Inline Editable List with Drag-and-Drop Reordering

**Pattern**: Use Mantine's `TextInput` in a list with drag handles for reordering.

### Rationale
- **Inline editing**: Immediate feedback, no modal dialogs
- **Visual ordering**: Drag-and-drop is intuitive for sequencing
- **Mantine components**: Consistent with existing UI (`@mantine/core`)
- **@dnd-kit/sortable**: Accessible, performant drag-and-drop library (already used in project via Mantine)
- **Character limit indicator**: Real-time feedback on hint length

### Implementation Approach
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Hint item component
const HintItem = ({ hint, index, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: hint.id });
  
  return (
    <Group ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <ActionIcon {...attributes} {...listeners}><IconGripVertical /></ActionIcon>
      <TextInput
        placeholder={`Hint ${index + 1}`}
        value={hint.text}
        onChange={(e) => onUpdate(index, e.target.value)}
        style={{ flex: 1 }}
        maxLength={500}
        rightSection={<Text size="xs" c="dimmed">{hint.text.length}/500</Text>}
      />
      <ActionIcon onClick={() => onDelete(index)}><IconTrash /></ActionIcon>
    </Group>
  );
};

// Parent component
<Stack>
  <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={hints.map((h, i) => ({ ...h, id: i }))} strategy={verticalListSortingStrategy}>
      {hints.map((hint, index) => (
        <HintItem key={index} hint={hint} index={index} onUpdate={updateHint} onDelete={deleteHint} />
      ))}
    </SortableContext>
  </DndContext>
  
  {hints.length < 5 && (
    <Button onClick={addHint} leftSection={<IconPlus />}>
      Add Hint ({5 - hints.length} remaining)
    </Button>
  )}
</Stack>
```

### Alternatives Considered
1. **Modal-based editing**: Click to open hint editor
   - Rejected: Disrupts flow, harder to see all hints at once
2. **Simple up/down arrow buttons**: Click to reorder
   - Rejected: Less intuitive than drag-and-drop, more clicks needed
3. **No reordering**: Add/delete only
   - Rejected: Violates FR-015 requirement for reordering
4. **Separate hints page**: Navigate to hints management screen
   - Rejected: Adds navigation complexity, separates hints from test context

---

## 4. Tracking Hint Usage (Phase 3 - P3 Priority)

### Research Question
How should we track which hints students revealed and when?

### Decision: Extend Student Quiz Attempt with Hint Metadata

**Pattern**: Add hint usage tracking to submission/attempt data structure.

### Rationale
- **Minimal schema changes**: Piggyback on existing attempt/submission logic
- **Historical data**: Preserve what hints were available at attempt time
- **Analytics-ready**: Easy to aggregate for instructor insights
- **Privacy-preserving**: No real-time tracking, only on submission

### Implementation Approach
```typescript
// Extend submission interface
interface DiagramTestSubmission {
  labId: string;
  pageId: string;
  studentId: string;
  diagramAnswer: any;
  score: number;
  passed: boolean;
  createdAt: Date;
  // New fields for P3
  hintsRevealed?: number; // Count of hints accessed
  hintIndices?: number[]; // Which specific hints (0-indexed)
  totalHintsAvailable?: number; // For historical context
}
```

### Storage Strategy
- Track in `StudentTestRunner` component state during quiz
- Include in submission payload when student submits
- Backend stores in submission/attempt collection (future implementation)

### Alternatives Considered
1. **Real-time hint view tracking**: Log each hint reveal to backend
   - Rejected: Unnecessary API calls, privacy concerns
2. **No tracking**: Just show hints, don't record usage
   - Rejected: Violates FR-012 and FR-013 requirements
3. **Client-side only tracking**: Store in localStorage
   - Rejected: Not persistent, no instructor visibility
4. **Separate hint_usage collection**: Dedicated table
   - Rejected: Over-engineering, denormalized submission data sufficient

---

## 5. Backend API Design Patterns

### Research Question
Should hints be managed via separate endpoints or bundled with diagram test CRUD?

### Decision: Bundle Hints with DiagramTest Endpoints

**Pattern**: Include hints in existing DiagramTest create/update payloads.

### Rationale
- **Atomic operations**: Hints and tests are created/updated together
- **Fewer endpoints**: Simpler API surface
- **Transactional integrity**: MongoDB transaction ensures hints + test saved together
- **Existing patterns**: Matches how Questions are handled in the codebase
- **REST alignment**: Hints are attributes of DiagramTest resource

### API Modifications Required

#### 1. Update `POST /api/v1/lab/:labId/pages/:pageId/diagram-test`
```typescript
// Request body (extends CreateDiagramTestRequest)
{
  prompt: string;
  expectedDiagramState: {...};
  architectureType: string;
  hints?: string[]; // NEW: Array of hint texts (max 5)
}
```

#### 2. Update `GET /api/v1/lab/:labId/pages/:pageId`
```typescript
// Response includes hints in diagramTest object
{
  data: {
    id: string;
    labId: string;
    pageNumber: number;
    hasDiagramTest: boolean;
    diagramTest?: {
      id: string;
      prompt: string;
      expectedDiagramState: {...};
      architectureType: string;
      hints?: string[]; // NEW: Included in response
    }
  }
}
```

#### 3. Validation Rules (Backend)
- `hints` array max length: 5
- Each hint string max length: 500 characters
- Trim whitespace, reject empty strings
- Optional field (can be undefined or empty array)

### Alternatives Considered
1. **Separate endpoints**: `POST /diagram-test/:id/hints`
   - Rejected: Adds complexity, requires multiple requests
2. **GraphQL mutations**: Use GraphQL instead of REST
   - Rejected: Project uses REST, no GraphQL infrastructure
3. **Patch endpoint for hints only**: `PATCH /diagram-test/:id/hints`
   - Rejected: Unnecessary granularity, hints are lightweight

---

## 6. Best Practices for Hint Content

### Research Question
What guidance should we provide instructors for writing effective hints?

### Decision: Add Instructional Tooltip with Best Practices

**Guidance to Display**:
1. **Start general, get specific**: First hint should be broad, later hints more detailed
2. **Don't give away the answer**: Hints should guide, not solve
3. **One concept per hint**: Focus each hint on a single insight
4. **Keep it concise**: Aim for 1-2 sentences per hint
5. **Consider prerequisite knowledge**: Assume students understand basic concepts

### Implementation
- Add `<Tooltip>` next to "Add Hint" button with icon button
- Show best practices in accordion/collapsible section in editor
- Include example hints (good vs. bad)

### Example Good vs. Bad Hints
**Bad Hint**: "Put EC2 in the VPC and connect it to RDS"  
**Good Hint 1**: "Think about which compute service would host the application"  
**Good Hint 2**: "The database should be in a private subnet for security"  
**Good Hint 3**: "Don't forget to configure the security group to allow database traffic"

---

## 7. Empty Hints Validation

### Research Question
How should the system handle hints that are empty, whitespace-only, or duplicates?

### Decision: Multi-Layer Validation with User Feedback

**Validation Rules**:
1. **Frontend validation** (immediate feedback):
   - Trim whitespace on blur
   - Disable save if hint is empty after trim
   - Show warning if hint is duplicate
   - Character counter shows 0/500 for empty hints

2. **Backend validation** (data integrity):
   - Filter out empty/whitespace-only hints before saving
   - Return error if duplicate hints exist
   - Enforce max 5 hints
   - Enforce max 500 chars per hint

### Implementation
```typescript
// Frontend validation
const sanitizeHints = (hints: string[]): string[] => {
  return hints
    .map(h => h.trim())
    .filter(h => h.length > 0)
    .filter((h, index, arr) => arr.indexOf(h) === index); // Remove duplicates
};

// Backend validation (in controller)
const validateHints = (hints?: string[]): string[] | undefined => {
  if (!hints || hints.length === 0) return undefined;
  
  const sanitized = hints
    .map(h => h.trim())
    .filter(h => h.length > 0 && h.length <= 500);
  
  if (sanitized.length !== new Set(sanitized).size) {
    throw new ValidationError('Duplicate hints are not allowed');
  }
  
  if (sanitized.length > 5) {
    throw new ValidationError('Maximum 5 hints allowed');
  }
  
  return sanitized.length > 0 ? sanitized : undefined;
};
```

### Alternatives Considered
1. **Allow duplicates**: Let instructors add same hint multiple times
   - Rejected: Confusing for students, wastes reveal opportunities
2. **Backend-only validation**: No frontend feedback
   - Rejected: Poor UX, delayed error feedback
3. **Auto-merge similar hints**: Use fuzzy matching to detect near-duplicates
   - Rejected: Over-engineering, instructors should control content

---

## 8. Hint Persistence During Quiz Session

### Research Question
If a student leaves the quiz and comes back, should revealed hints remain visible?

### Decision: Session-Based Persistence with Component State

**Pattern**: Track revealed hints in component state, no persistence across page reloads.

### Rationale
- **Simplicity**: No need for backend session storage or localStorage
- **Fair testing**: Student must re-reveal hints if they navigate away
- **Prevents gaming**: Can't reload to "reset" difficulty
- **Aligns with quiz semantics**: New attempt = fresh start

### Implementation
```typescript
// In StudentTestRunner component
const [revealedHintsCount, setRevealedHintsCount] = useState(0);

// Reset on page load/mount (no persistence)
useEffect(() => {
  setRevealedHintsCount(0);
}, []);

// Track for submission (P3 feature)
const handleSubmit = async () => {
  const submission = {
    // ... other fields
    hintsRevealed: revealedHintsCount,
    hintIndices: Array.from({ length: revealedHintsCount }, (_, i) => i),
  };
  await onSubmit(submission);
};
```

### Alternatives Considered
1. **LocalStorage persistence**: Save revealed hints to browser
   - Rejected: Students could manipulate localStorage
2. **Backend session tracking**: Store hint state server-side
   - Rejected: Adds complexity, requires session management
3. **Always show all hints**: No progressive disclosure
   - Rejected: Violates FR-008 and FR-009 requirements
4. **Cookie-based persistence**: Store in cookies
   - Rejected: Similar issues to localStorage, can be cleared

---

## 9. Integration with Existing StudentTestRunner Component

### Research Question
How should hints be integrated into the existing StudentTestRunner component?

### Decision: Add Hints Section to Diagram Test Tab

**Pattern**: Insert hints UI between diagram prompt and diagram editor in the "Diagram Test" tab.

### Current StudentTestRunner Structure
- Tabs: "Questions" and "Diagram Test"
- Diagram Test tab shows: prompt, then DiagramEditor
- Questions tab shows: paginated questions with radio buttons

### Proposed Modification
```tsx
// In StudentTestRunner component, Diagram Test tab
<Tabs.Panel value="diagram">
  <Stack>
    {/* Existing prompt */}
    <Text size="lg" fw={500}>{diagramTest.prompt}</Text>
    
    {/* NEW: Hints section */}
    {diagramTest.hints && diagramTest.hints.length > 0 && (
      <Paper p="md" withBorder>
        <HintsDisclosure 
          hints={diagramTest.hints}
          onHintRevealed={(count) => setRevealedHintsCount(count)}
        />
      </Paper>
    )}
    
    {/* Existing diagram editor */}
    <DiagramEditor
      architectureType={diagramTest.architectureType}
      initialState={jumbledDiagram}
      onChange={setStudentDiagram}
      readOnly={isSubmitted}
    />
  </Stack>
</Tabs.Panel>
```

### Component Breakdown
Create new component: `HintsDisclosure.tsx`
- Props: `hints: string[]`, `onHintRevealed: (count: number) => void`
- Responsibilities: Render hints, track reveals, emit count to parent
- Location: `apps/web/components/Lab/HintsDisclosure.tsx`

### Alternatives Considered
1. **Separate hints tab**: Third tab just for hints
   - Rejected: Adds navigation complexity, separates hints from context
2. **Sidebar hints panel**: Fixed side panel with hints
   - Rejected: Takes up screen real estate, not mobile-friendly
3. **Floating hint button**: Click to reveal in overlay
   - Rejected: Modal-style UX disrupts workflow
4. **Integrated in DiagramEditor**: Hints inside editor component
   - Rejected: Violates separation of concerns, editor should be pure diagram UI

---

## 10. Migration Strategy for Existing Diagram Tests

### Research Question
What happens to existing diagram tests in production when hints field is added?

### Decision: Optional Field with Backward Compatibility

**Strategy**: 
- Make `hints` field optional in TypeScript and MongoDB schema
- Existing tests continue to work without hints (no hint UI displayed)
- No data migration required

### Implementation
```typescript
// TypeScript (core-types)
export interface DiagramTest extends BaseEntity {
  // ... existing fields
  hints?: string[]; // Optional, undefined for existing tests
}

// MongoDB Schema (backend)
const DiagramTestSchema = new Schema({
  // ... existing fields
  hints: {
    type: [String],
    required: false,
    default: undefined, // Explicitly undefined, not []
    validate: {
      validator: (arr: string[]) => !arr || arr.length <= 5,
      message: 'Maximum 5 hints allowed'
    }
  }
});
```

### Frontend Handling
```tsx
// Instructor editor: Show "Add Hints" section for all tests
{canEdit && (
  <HintsEditor 
    hints={diagramTest?.hints || []} 
    onUpdate={handleHintsUpdate}
  />
)}

// Student runner: Only show hints UI if hints exist
{diagramTest?.hints && diagramTest.hints.length > 0 && (
  <HintsDisclosure hints={diagramTest.hints} />
)}
```

### Data Migration NOT Required
- No existing data needs updating
- Tests without hints: `hints` field is `undefined` (not stored)
- Tests with hints: `hints` field is `string[]`
- MongoDB stores only defined fields (schema-flexible)

### Alternatives Considered
1. **Require hints for all tests**: Mandate minimum 1 hint
   - Rejected: Violates FR-006 (optional hints requirement)
2. **Default empty array**: `hints: []` for old tests
   - Rejected: Empty array vs. undefined has semantic difference
3. **Migration script**: Update all existing tests with hints: []
   - Rejected: Unnecessary database write for no functional change
4. **Version field**: Add `hintsVersion` to track schema
   - Rejected: Over-engineering, optional field handles versioning naturally

---

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| **Data Model** | Add `hints?: string[]` to DiagramTest | Simple, type-safe, MongoDB-compatible |
| **Student UI** | Mantine Accordion with progressive disclosure | Accessible, familiar, controls cognitive load |
| **Instructor UI** | Drag-and-drop sortable list with inline editing | Intuitive reordering, immediate feedback |
| **Hint Tracking (P3)** | Extend submission with hintsRevealed metadata | Analytics-ready, minimal schema changes |
| **API Design** | Bundle hints with DiagramTest endpoints | Atomic operations, fewer endpoints |
| **Validation** | Multi-layer (frontend + backend) | Data integrity + good UX |
| **Session Persistence** | Component state only, no cross-page persistence | Simpler, fairer testing |
| **Integration** | Embed hints in StudentTestRunner diagram tab | Contextual, no extra navigation |
| **Migration** | Optional field, backward compatible | No migration needed, graceful degradation |
| **Best Practices** | Tooltip guidance for instructors | Educational, non-intrusive |

---

## Technologies Confirmed

| Technology | Purpose | Already in Stack? |
|------------|---------|-------------------|
| **TypeScript** | Type safety | ✅ Yes |
| **Mantine UI** | UI components (Accordion, TextInput, Button) | ✅ Yes |
| **@dnd-kit** | Drag-and-drop for reordering | ✅ Yes (via Mantine) |
| **MongoDB** | Data persistence | ✅ Yes |
| **Express.js v5** | Backend API | ✅ Yes |
| **React 19** | Component framework | ✅ Yes |
| **Next.js 16** | Web framework | ✅ Yes |

**No new dependencies required** ✅

---

## Next Steps

1. **Phase 1**: Create data model document (`data-model.md`)
2. **Phase 1**: Generate API contracts (`contracts/`)
3. **Phase 1**: Create quickstart guide (`quickstart.md`)
4. **Phase 1**: Update agent context with findings
5. **Phase 2**: Generate task breakdown (`tasks.md`)

**Research Complete** ✅
