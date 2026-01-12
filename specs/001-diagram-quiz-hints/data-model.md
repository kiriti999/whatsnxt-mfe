# Data Model: Diagram Quiz Hints System

**Branch**: `001-diagram-quiz-hints`  
**Date**: 2025-01-20  
**Purpose**: Define data entities, attributes, relationships, and validation rules for the hints feature

---

## Overview

This document extends the existing Lab Diagram Tests data model to support instructor-provided hints for diagram quizzes. The primary change is adding a `hints` field to the existing `DiagramTest` entity.

**Key Principle**: Backward compatibility - existing diagram tests without hints continue to function unchanged.

---

## Entities

### DiagramTest (Extended)

An interactive diagramming exercise with optional hints for students.

#### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| **id** | UUID | Yes | Primary key | Auto-generated |
| **labPageId** | UUID | Yes | Foreign key to LabPage | Must reference valid LabPage |
| **prompt** | String | Yes | Instructions for the diagram test | Non-empty, max 2000 chars |
| **expectedDiagramState** | JSON | Yes | Correct diagram solution | Valid JSON with ≥1 shape |
| **architectureType** | String | Yes | Architecture platform | One of: AWS, Azure, GCP, Common, Hybrid |
| **hints** | String[] | **No** | Ordered array of hint texts | Max 5 items, each ≤500 chars |
| **createdAt** | Date | Yes | Creation timestamp | Auto-generated |
| **updatedAt** | Date | Yes | Last update timestamp | Auto-updated |

#### New Field Details: `hints`

**Purpose**: Store instructor-provided clues to help students solve the diagram quiz.

**Type**: Array of strings (`string[]`)

**Optionality**: Optional (undefined for tests without hints)

**Constraints**:
- **Max array length**: 5 hints per diagram test
- **Max string length**: 500 characters per hint
- **Min string length**: 1 character (after trimming whitespace)
- **Uniqueness**: No duplicate hints within same test
- **Order**: Array index represents reveal sequence (0 = first hint)

**Default**: `undefined` (not an empty array)

**Null Handling**: 
- `undefined`: No hints (don't show hint UI to students)
- `[]`: Empty array treated as undefined (no hints)
- `["hint1", "hint2"]`: Valid hints array

#### Validation Rules

**Extended from existing DiagramTest rules**:

1. **Existing validations** (unchanged):
   - `prompt` must be non-empty
   - `expectedDiagramState` must be valid JSON with ≥1 shape
   - `architectureType` must be non-empty
   - Empty diagram tests must not be saved

2. **New hint-specific validations**:
   - If `hints` is defined, it must be an array
   - If `hints` array is non-empty:
     - Maximum 5 elements
     - Each element must be a string
     - Each string max 500 characters
     - Each string min 1 character (after trim)
     - No duplicate strings (case-sensitive)
   - Empty/whitespace-only hints must be filtered out
   - If all hints are empty after filtering, set `hints` to `undefined`

#### Relationships

- **Many-to-one** with `LabPage` (unchanged)
- **Many-to-many** with `DiagramShape` (unchanged)

#### State Transitions

Hints can be added/modified at any time during diagram test lifecycle:

```
DiagramTest Created (no hints)
  ↓
hints = undefined
  ↓
Instructor adds hints → hints = ["hint1", "hint2", ...]
  ↓
Instructor reorders hints → hints array reordered
  ↓
Instructor deletes all hints → hints = undefined
  ↓
Instructor adds hints again → hints = ["new hint1", ...]
```

---

### StudentDiagramTestSubmission (New Entity - Phase 3)

**Note**: This entity is for the P3 "Hint Usage Tracking" feature and is NOT part of MVP (P1/P2).

Tracks student submissions for diagram tests, including hint usage analytics.

#### Attributes

| Attribute | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| **id** | UUID | Yes | Primary key | Auto-generated |
| **studentId** | UUID | Yes | Foreign key to Student/User | Must reference valid user |
| **labId** | UUID | Yes | Foreign key to Lab | Must reference valid lab |
| **pageId** | UUID | Yes | Foreign key to LabPage | Must reference valid page |
| **diagramTestId** | UUID | Yes | Foreign key to DiagramTest | Must reference valid test |
| **diagramAnswer** | JSON | Yes | Student's diagram solution | Valid JSON structure |
| **score** | Number | Yes | Calculated score (0-100) | 0 ≤ score ≤ 100 |
| **passed** | Boolean | Yes | Whether student passed | Derived from score ≥ threshold |
| **hintsRevealed** | Number | No | Count of hints accessed | 0 ≤ hintsRevealed ≤ totalHintsAvailable |
| **hintIndices** | Number[] | No | Which hints were revealed (0-indexed) | Valid array indices |
| **totalHintsAvailable** | Number | No | Hints available at submission time | Snapshot for historical data |
| **createdAt** | Date | Yes | Submission timestamp | Auto-generated |

#### Validation Rules

1. `hintsRevealed` cannot exceed `totalHintsAvailable`
2. `hintIndices` array length must equal `hintsRevealed`
3. `hintIndices` values must be `< totalHintsAvailable`
4. If no hints exist on test, all hint fields should be `undefined`

#### Relationships

- **Many-to-one** with `DiagramTest`
- **Many-to-one** with `Student/User`
- **Many-to-one** with `LabPage`
- **Many-to-one** with `Lab`

---

## Updated Entity Relationship Diagram

```
┌─────────────┐
│     Lab     │
│ (unchanged) │
└──────┬──────┘
       │ 1
       │
       │ *
┌──────▼──────┐
│   LabPage   │
│ (unchanged) │
└──────┬──────┘
       │ 1
       │
       │ 1
┌──────▼──────────────┐
│   DiagramTest       │
│                     │
│ + hints?: string[]  │◄───────┐ NEW FIELD
└─────────┬───────────┘        │
          │ *                  │
          │                    │
          │ *                  │
┌─────────▼────────────┐       │
│   DiagramShape       │       │
│   (unchanged)        │       │
└──────────────────────┘       │
                               │
                               │ (P3 only)
                               │
          ┌────────────────────┘
          │ *
┌─────────▼───────────────────────────┐
│ StudentDiagramTestSubmission (P3)   │
│                                     │
│ + hintsRevealed?: number            │
│ + hintIndices?: number[]            │
│ + totalHintsAvailable?: number      │
└─────────────────────────────────────┘
```

---

## MongoDB Schema Updates

### DiagramTest Collection

**Change Type**: Field addition (backward compatible)

```javascript
// MongoDB Schema (Mongoose)
const DiagramTestSchema = new Schema({
  labPageId: {
    type: Schema.Types.ObjectId,
    ref: 'LabPage',
    required: true
  },
  prompt: {
    type: String,
    required: true,
    maxlength: 2000,
    trim: true
  },
  expectedDiagramState: {
    type: Schema.Types.Mixed,
    required: true,
    validate: {
      validator: (state) => {
        return state && state.shapes && state.shapes.length > 0;
      },
      message: 'Expected diagram state must contain at least one shape'
    }
  },
  architectureType: {
    type: String,
    required: true,
    enum: ['AWS', 'Azure', 'GCP', 'Common', 'Hybrid']
  },
  
  // ========== NEW FIELD ==========
  hints: {
    type: [String],
    required: false,
    default: undefined, // Explicitly undefined, not []
    validate: [
      {
        validator: (arr) => !arr || arr.length <= 5,
        message: 'Maximum 5 hints allowed'
      },
      {
        validator: (arr) => {
          if (!arr || arr.length === 0) return true;
          // Each hint max 500 chars
          return arr.every(hint => hint.length > 0 && hint.length <= 500);
        },
        message: 'Each hint must be 1-500 characters'
      },
      {
        validator: (arr) => {
          if (!arr || arr.length === 0) return true;
          // No duplicates
          const uniqueHints = new Set(arr);
          return uniqueHints.size === arr.length;
        },
        message: 'Duplicate hints are not allowed'
      }
    ]
  }
  // ================================
}, {
  timestamps: true // Auto createdAt/updatedAt
});

// Pre-save hook to clean hints
DiagramTestSchema.pre('save', function(next) {
  if (this.hints) {
    // Trim and filter empty hints
    const cleanedHints = this.hints
      .map(h => h.trim())
      .filter(h => h.length > 0);
    
    this.hints = cleanedHints.length > 0 ? cleanedHints : undefined;
  }
  next();
});
```

### StudentDiagramTestSubmission Collection (P3 Only)

**Change Type**: New collection

```javascript
// MongoDB Schema (Mongoose) - FOR P3 IMPLEMENTATION
const StudentDiagramTestSubmissionSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  labId: {
    type: Schema.Types.ObjectId,
    ref: 'Lab',
    required: true
  },
  pageId: {
    type: Schema.Types.ObjectId,
    ref: 'LabPage',
    required: true
  },
  diagramTestId: {
    type: Schema.Types.ObjectId,
    ref: 'DiagramTest',
    required: true
  },
  diagramAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  
  // Hint tracking fields
  hintsRevealed: {
    type: Number,
    required: false,
    min: 0,
    validate: {
      validator: function(val) {
        return !val || val <= (this.totalHintsAvailable || 0);
      },
      message: 'hintsRevealed cannot exceed totalHintsAvailable'
    }
  },
  hintIndices: {
    type: [Number],
    required: false
  },
  totalHintsAvailable: {
    type: Number,
    required: false,
    min: 0,
    max: 5
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for analytics queries
StudentDiagramTestSubmissionSchema.index({ diagramTestId: 1, createdAt: -1 });
StudentDiagramTestSubmissionSchema.index({ studentId: 1, labId: 1 });
```

---

## TypeScript Type Definitions

### Core Types Package Update

**File**: `packages/core-types/src/index.d.ts`

```typescript
// Extend existing DiagramTest interface
export interface DiagramTest extends BaseEntity {
  labPageId: string;
  prompt: string;
  expectedDiagramState: Record<string, any>;
  architectureType: string;
  hints?: string[]; // NEW: Optional array of hint texts (max 5)
}

// New interface for P3 feature
export interface StudentDiagramTestSubmission extends BaseEntity {
  studentId: string;
  labId: string;
  pageId: string;
  diagramTestId: string;
  diagramAnswer: Record<string, any>;
  score: number;
  passed: boolean;
  hintsRevealed?: number; // P3: Count of hints accessed
  hintIndices?: number[]; // P3: Which hints (0-indexed)
  totalHintsAvailable?: number; // P3: Snapshot of available hints
}
```

### API Request/Response Types

**File**: `apps/web/apis/lab.api.ts`

```typescript
// Extend existing CreateDiagramTestRequest
export interface CreateDiagramTestRequest {
  prompt: string;
  expectedDiagramState: {
    shapes: Array<{
      shapeId: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      rotation?: number;
      label?: string;
      metadata?: Record<string, any>;
    }>;
    connections?: Array<{
      id: string;
      sourceShapeId: string;
      targetShapeId: string;
      type?: string;
      label?: string;
      metadata?: Record<string, any>;
    }>;
    metadata?: Record<string, any>;
  };
  architectureType: string;
  hints?: string[]; // NEW: Optional hints array
}

// New interface for P3 submission
export interface SubmitDiagramTestRequest {
  diagramAnswer: any;
  hintsRevealed?: number; // P3: Hint usage tracking
  hintIndices?: number[]; // P3: Which hints were revealed
}
```

---

## Validation Summary

### Frontend Validation (Immediate Feedback)

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| `hints` array length | ≤ 5 | "Maximum 5 hints allowed" |
| Individual hint length | 1-500 chars (after trim) | "Hint must be 1-500 characters" |
| Duplicate hints | No duplicates | "This hint already exists" |
| Empty hints | Filter before save | (No error, silently remove) |

### Backend Validation (Data Integrity)

| Field | Validation Rule | HTTP Status | Error Message |
|-------|-----------------|-------------|---------------|
| `hints` type | Must be array or undefined | 400 | "hints must be an array" |
| `hints` length | ≤ 5 | 400 | "Maximum 5 hints allowed" |
| Hint string length | Each 1-500 chars | 400 | "Each hint must be 1-500 characters" |
| Duplicate hints | No duplicates | 400 | "Duplicate hints are not allowed" |
| Empty array | Convert to undefined | 200 | (No error, save as undefined) |

---

## Migration Plan

### Phase 1: Schema Update (Backward Compatible)

**Action**: Add optional `hints` field to DiagramTest schema.

**Impact**: None - existing documents continue to work without the field.

**Steps**:
1. Update Mongoose schema with `hints` field (optional)
2. Deploy backend with new schema
3. Verify existing diagram tests still load correctly
4. No data migration script needed (optional field)

**Rollback**: Remove `hints` field from schema (safe - no data loss).

### Phase 2: Type Definition Update

**Action**: Update TypeScript types in `@whatsnxt/core-types`.

**Impact**: None - optional field doesn't break existing code.

**Steps**:
1. Add `hints?: string[]` to `DiagramTest` interface
2. Rebuild shared package
3. Update dependent packages

**Rollback**: Remove `hints` from interface.

### Phase 3: API Update (Backward Compatible)

**Action**: Extend existing endpoints to accept/return hints.

**Impact**: Existing API clients continue to work (hints are optional).

**Steps**:
1. Update `POST /api/v1/lab/:labId/pages/:pageId/diagram-test` to accept `hints`
2. Update `GET /api/v1/lab/:labId/pages/:pageId` to return `hints`
3. Add validation middleware for hints
4. Test with and without hints in payload

**Rollback**: Remove hints handling from controllers.

### Phase 4: UI Update (Feature Flag Optional)

**Action**: Add hint management UI for instructors.

**Impact**: None - only visible in editor for diagram tests.

**Steps**:
1. Add `HintsEditor` component to page editor
2. Update form submission to include hints
3. Test hint addition/editing/deletion/reordering

**Rollback**: Hide `HintsEditor` component (data persists but invisible).

### Phase 5: Student UI Update

**Action**: Add hint disclosure UI for students.

**Impact**: None - only visible when hints exist.

**Steps**:
1. Add `HintsDisclosure` component to StudentTestRunner
2. Conditional rendering (only if `diagramTest.hints?.length > 0`)
3. Test progressive disclosure

**Rollback**: Remove `HintsDisclosure` rendering.

---

## Data Access Patterns

### Instructor Use Cases

#### 1. Create Diagram Test with Hints
```typescript
// Frontend
const createDiagramTest = async () => {
  await labApi.saveDiagramTest(labId, pageId, {
    prompt: "Design a 3-tier architecture",
    expectedDiagramState: {...},
    architectureType: "AWS",
    hints: [
      "Start with the presentation layer",
      "Don't forget the database tier",
      "Use security groups for network isolation"
    ]
  });
};
```

#### 2. Update Hints on Existing Test
```typescript
// Frontend (same endpoint, PUT/PATCH operation)
const updateHints = async () => {
  await labApi.saveDiagramTest(labId, pageId, {
    // ... existing fields
    hints: updatedHintsArray
  });
};
```

#### 3. Remove All Hints
```typescript
// Frontend
const removeHints = async () => {
  await labApi.saveDiagramTest(labId, pageId, {
    // ... existing fields
    hints: undefined // or omit the field
  });
};
```

### Student Use Cases

#### 1. Load Diagram Test with Hints
```typescript
// Frontend
const loadPage = async () => {
  const response = await labApi.getLabPage(labId, pageId);
  const { diagramTest } = response.data;
  
  if (diagramTest?.hints && diagramTest.hints.length > 0) {
    // Show hints UI
    setHintsAvailable(diagramTest.hints);
  }
};
```

#### 2. Reveal Hint Progressively
```typescript
// Frontend (component state, no API call)
const revealNextHint = () => {
  if (revealedCount < hints.length) {
    setRevealedCount(prev => prev + 1);
  }
};
```

#### 3. Submit Test with Hint Usage (P3)
```typescript
// Frontend
const submitTest = async () => {
  await labApi.submitDiagramTest(labId, pageId, {
    diagramAnswer: studentDiagram,
    hintsRevealed: revealedHintsCount,
    hintIndices: Array.from({ length: revealedHintsCount }, (_, i) => i)
  });
};
```

---

## Performance Considerations

### Database Impact

- **Storage**: ~50-500 bytes per hint (text strings)
- **Index impact**: None (hints are not indexed)
- **Query impact**: None (hints loaded with DiagramTest, no additional queries)

### API Response Size

- **Without hints**: No change to response size
- **With 5 hints**: +500-2500 bytes per test (negligible)
- **Pagination**: Not needed (max 5 hints per test)

### Client-Side Rendering

- **Component complexity**: Low (simple array map)
- **Re-renders**: Minimal (controlled by `revealedHintsCount` state)
- **Memory**: Negligible (<5KB for 5 hints)

---

## Edge Cases and Error Handling

### 1. Instructor Deletes Test with Hints

**Scenario**: Instructor deletes a diagram test that has hints.

**Behavior**: Entire DiagramTest document deleted (including hints).

**No orphaned data**: Hints are part of the document, not separate collection.

### 2. Instructor Clones/Duplicates Lab

**Scenario**: Lab with diagram tests containing hints is duplicated.

**Behavior**: Hints are copied along with test (part of document structure).

**Implementation**: Ensure clone/duplicate logic includes all DiagramTest fields.

### 3. Student Views Old Test Version

**Scenario**: Instructor changes hints after student starts quiz.

**Behavior**: Student sees hints from their session start (loaded at component mount).

**No real-time updates**: Hints are static once quiz loaded.

### 4. Max Hints Exceeded

**Scenario**: Client sends 6 hints in request.

**Backend Behavior**:
- Validation middleware returns 400 error
- Error message: "Maximum 5 hints allowed"
- No partial save

**Frontend Behavior**:
- Disable "Add Hint" button when count = 5
- Prevent submission with >5 hints

### 5. All Hints Are Empty Strings

**Scenario**: Instructor submits hints array: `["", "  ", ""]`

**Backend Behavior**:
- Pre-save hook trims and filters
- Result: `hints = undefined` (no valid hints)
- Save succeeds with no hints

**Frontend Behavior**:
- Validation prevents submission of empty hints
- (But backend handles it gracefully if bypassed)

### 6. Duplicate Hints Submitted

**Scenario**: Instructor submits: `["Hint 1", "Hint 2", "Hint 1"]`

**Backend Behavior**:
- Validation fails
- Returns 400: "Duplicate hints are not allowed"

**Frontend Behavior**:
- Real-time duplicate detection with warning
- Prevent submission if duplicates exist

### 7. Very Long Hint Text

**Scenario**: Instructor submits 600-character hint.

**Backend Behavior**:
- Validation fails
- Returns 400: "Each hint must be 1-500 characters"

**Frontend Behavior**:
- TextInput maxLength=500 enforces limit
- Character counter shows 500/500
- (But backend validates in case of bypassed client)

---

## Backward Compatibility Checklist

- ✅ Existing diagram tests without hints continue to work
- ✅ No required schema changes (optional field only)
- ✅ No data migration needed
- ✅ Existing API clients not affected (hints are optional)
- ✅ Student UI gracefully handles tests without hints (no hint UI shown)
- ✅ Instructor UI allows adding hints to old tests
- ✅ MongoDB documents without `hints` field are valid
- ✅ TypeScript types use optional property (`hints?`)

---

## Future Enhancements (Not in Scope)

### Rich Text Hints
- **Idea**: Support markdown or HTML in hints (e.g., bold, links, code blocks)
- **Impact**: Would require sanitization, rendering changes
- **Complexity**: Medium

### Hint Effectiveness Analytics
- **Idea**: Track which hints are most helpful (student feedback)
- **Impact**: Requires additional data collection, analytics dashboard
- **Complexity**: High

### Conditional Hints
- **Idea**: Show different hints based on student's diagram state
- **Impact**: Requires diagram state analysis, hint routing logic
- **Complexity**: Very High

### Hint Penalties
- **Idea**: Reduce score for each hint revealed
- **Impact**: Requires grading algorithm changes, configurable penalties
- **Complexity**: Medium

### AI-Generated Hints
- **Idea**: Auto-suggest hints based on diagram test prompt
- **Impact**: Requires AI integration, prompt engineering
- **Complexity**: Very High

---

## Summary

This data model extends the existing `DiagramTest` entity with an optional `hints` field, maintaining full backward compatibility. The design prioritizes simplicity, using an array of strings rather than a separate collection. Validation is enforced at multiple layers to ensure data integrity and good UX. The model supports all functional requirements (FR-001 through FR-017) while remaining extensible for future P3 hint tracking features.

**Status**: Ready for Phase 1 (API contract generation) ✅
