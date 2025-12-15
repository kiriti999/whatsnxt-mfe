# Feature Specification: Integrate DiagramEditor into Diagram Test Tab

**Feature ID**: LAB-DIAGRAM-EDITOR-INTEGRATION  
**Date**: 2025-12-15  
**Status**: Specification  
**Priority**: High

---

## 1. Overview

### 1.1 Purpose
Integrate the existing `DiagramEditor.tsx` component (which uses D3.js) into the Diagram Test tab of the lab page editor, allowing instructors to create expected diagrams that students will need to replicate.

### 1.2 Current State
- Diagram Test tab has a placeholder canvas with drag-and-drop shapes panel
- DiagramEditor component exists at `apps/web/components/architecture-lab/DiagramEditor.tsx`
- DiagramEditor is fully functional with D3.js, supports drag-drop, linking, and exports diagram JSON
- Backend has DiagramTest model with `expectedDiagramState` field

### 1.3 Desired State
- Diagram Test tab uses DiagramEditor component in instructor mode
- Instructors can create diagrams with shapes and connections
- Diagram state is saved to `expectedDiagramState` in backend
- Architecture type from dropdown filters available shapes in DiagramEditor

---

## 2. Technical Requirements

### 2.1 Component Integration

**File to Modify**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Remove**:
- Custom shapes panel (lines 775-843)
- Placeholder canvas (lines 845-874)
- Shape loading logic specific to custom implementation

**Add**:
- Import DiagramEditor component
- Replace placeholder with DiagramEditor component
- Connect DiagramEditor to state management

### 2.2 DiagramEditor Props

```typescript
interface DiagramEditorProps {
    initialGraph?: any;           // Load existing diagram from backend
    mode: 'instructor' | 'student'; // Use 'instructor' mode
    onGraphChange?: (json: any) => void; // Capture diagram changes
    className?: string;
}
```

**Usage**:
```tsx
<DiagramEditor
  initialGraph={expectedDiagramState}
  mode="instructor"
  onGraphChange={(graphJson) => {
    setExpectedDiagramState(graphJson);
  }}
  className="diagram-editor-container"
/>
```

### 2.3 State Management

**Current State Variables**:
```typescript
const [architectureType, setArchitectureType] = useState('');
const [prompt, setPrompt] = useState('');
const [expectedDiagramState, setExpectedDiagramState] = useState<any>(null);
```

**Remove** (no longer needed):
```typescript
const [availableShapes, setAvailableShapes] = useState<any[]>([]);
const [loadingShapes, setLoadingShapes] = useState(false);
```

**Keep**:
- `architectureType` - Still needed for filtering shapes in DiagramEditor
- `prompt` - Still needed for test instructions
- `expectedDiagramState` - Will store diagram JSON from DiagramEditor

### 2.4 Architecture Type Integration

DiagramEditor uses `architecturalShapes` from `utils/lab-utils`:
```typescript
// apps/web/utils/lab-utils.ts
export const architecturalShapes: Record<string, ShapeConfig> = {
  // AWS shapes
  'aws-ec2': { label: 'EC2', category: 'aws', color: '#FF9900', ... },
  'aws-s3': { label: 'S3', category: 'aws', color: '#569A31', ... },
  // Azure shapes
  'azure-vm': { label: 'Azure VM', category: 'azure', color: '#0078D4', ... },
  // etc...
}
```

**Implementation**:
1. DiagramEditor already filters shapes by category
2. Pass `architectureType` to filter shapes (if needed)
3. Or use existing category-based filtering in DiagramEditor

---

## 3. Implementation Steps

### Step 1: Import DiagramEditor
```typescript
import DiagramEditor from '@/components/architecture-lab/DiagramEditor';
```

### Step 2: Remove Unused Code
- Remove `availableShapes` state
- Remove `loadingShapes` state
- Remove `loadShapes()` function
- Remove shapes loading useEffect
- Remove custom shapes panel JSX
- Remove placeholder canvas JSX

### Step 3: Update Diagram Test Tab JSX
**Replace**:
```tsx
<Box>
  <Text size="sm" fw={500} mb={8}>Diagram Editor</Text>
  <Text size="xs" c="dimmed" mb={8}>
    Drag shapes onto the canvas to create your expected diagram
  </Text>
  
  <Group align="flex-start" gap="md">
    {/* Shapes Panel - REMOVE */}
    {/* Canvas - REMOVE */}
  </Group>
</Box>
```

**With**:
```tsx
<Box>
  <Text size="sm" fw={500} mb={8}>Diagram Editor</Text>
  <Text size="xs" c="dimmed" mb={8}>
    Create the expected diagram that students should replicate
  </Text>
  
  <DiagramEditor
    initialGraph={expectedDiagramState}
    mode="instructor"
    onGraphChange={(graphJson) => {
      setExpectedDiagramState(graphJson);
      console.log('Diagram updated:', graphJson);
    }}
    className="lab-diagram-editor"
  />
</Box>
```

### Step 4: Load Existing Diagram
In `fetchPageData()`, when loading page with diagram test:
```typescript
if (pageData.diagramTest) {
  setArchitectureType(pageData.diagramTest.architectureType || '');
  setPrompt(pageData.diagramTest.prompt || '');
  setExpectedDiagramState(pageData.diagramTest.expectedDiagramState || null);
}
```

### Step 5: Save Diagram Test
In `handleSaveDiagramTest()`:
```typescript
const handleSaveDiagramTest = async () => {
  if (!architectureType) {
    notifications.show({
      title: 'Validation Error',
      message: 'Please select an architecture type',
      color: 'red',
    });
    return;
  }

  if (!prompt || prompt.length < 10) {
    notifications.show({
      title: 'Validation Error',
      message: 'Prompt must be at least 10 characters',
      color: 'red',
    });
    return;
  }

  if (!expectedDiagramState || !expectedDiagramState.nodes || expectedDiagramState.nodes.length === 0) {
    notifications.show({
      title: 'Validation Error',
      message: 'Please create a diagram with at least one shape',
      color: 'red',
    });
    return;
  }

  setSaving(true);
  try {
    await labApi.saveDiagramTest(labId, pageId, {
      architectureType,
      prompt,
      expectedDiagramState, // This is the diagram JSON from DiagramEditor
    });

    notifications.show({
      title: 'Success',
      message: 'Diagram test saved successfully!',
      color: 'green',
    });

    router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save diagram test.';
    notifications.show({
      title: 'Error',
      message: errorMessage,
      color: 'red',
    });
    console.error('Failed to save diagram test:', error);
  } finally {
    setSaving(false);
  }
};
```

---

## 4. Data Flow

### 4.1 Diagram JSON Structure
DiagramEditor exports this format:
```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "aws-ec2",
      "x": 100,
      "y": 100,
      "label": "Web Server",
      "category": "aws"
    },
    {
      "id": "node-2",
      "type": "aws-rds",
      "x": 300,
      "y": 100,
      "label": "Database",
      "category": "aws"
    }
  ],
  "links": [
    {
      "source": "node-1",
      "target": "node-2"
    }
  ]
}
```

### 4.2 Backend Storage
```typescript
// Backend: apps/whatsnxt-bff/app/models/lab/DiagramTest.ts
expectedDiagramState: {
  type: Schema.Types.Mixed, // Stores the diagram JSON
  required: true,
}
```

### 4.3 API Call
```typescript
// Frontend: apps/web/apis/lab.api.ts
saveDiagramTest: (labId: string, pageId: string, data: CreateDiagramTestRequest) =>
  http.post<{ message: string; data: DiagramTest }>(
    `/labs/${labId}/pages/${pageId}/diagram-test`,
    data
  )
```

---

## 5. UI/UX Changes

### 5.1 Before (Current)
```
┌─────────────────────────────────────────────┐
│ Architecture Type: [Dropdown]               │
│ Prompt: [Textarea]                          │
│                                             │
│ Diagram Editor                              │
│ ┌──────────┬────────────────────────────┐  │
│ │ Shapes   │ Empty Canvas                │  │
│ │ Panel    │ "Drag shapes here..."       │  │
│ │          │                             │  │
│ └──────────┴────────────────────────────┘  │
│                                             │
│ [Cancel] [Save Diagram Test]                │
└─────────────────────────────────────────────┘
```

### 5.2 After (With DiagramEditor)
```
┌─────────────────────────────────────────────┐
│ Architecture Type: [Dropdown]               │
│ Prompt: [Textarea]                          │
│                                             │
│ Diagram Editor                              │
│ ┌──────────────────────────────────────┐   │
│ │ [Shape Buttons] [Link] [Delete]      │   │
│ │ ──────────────────────────────────── │   │
│ │                                      │   │
│ │    [D3.js SVG Canvas]                │   │
│ │    • Drag shapes from toolbar        │   │
│ │    • Move shapes                      │   │
│ │    • Connect shapes                   │   │
│ │    • Edit labels                      │   │
│ │                                      │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ [Cancel] [Save Diagram Test]                │
└─────────────────────────────────────────────┘
```

### 5.3 DiagramEditor Features (Already Implemented)
- ✅ Shape toolbar with AWS/Azure/GCP shapes
- ✅ Drag and drop shapes onto canvas
- ✅ Move shapes around
- ✅ Connect shapes with links
- ✅ Edit shape labels (double-click)
- ✅ Delete shapes and links
- ✅ Zoom and pan canvas
- ✅ Undo/Redo (Ctrl+Z / Ctrl+Y)
- ✅ Export diagram as JSON
- ✅ D3.js powered rendering

---

## 6. Validation Rules

### 6.1 Save Validation
Before saving diagram test:
1. **Architecture Type**: Required, must be selected
2. **Prompt**: Required, minimum 10 characters, maximum 2000 characters
3. **Diagram**: Required, must have at least 1 node/shape
4. **Diagram Structure**: Must be valid JSON with nodes array

### 6.2 Error Messages
```typescript
// No architecture type
"Please select an architecture type"

// Prompt too short
"Prompt must be at least 10 characters"

// Empty diagram
"Please create a diagram with at least one shape"

// Invalid diagram structure
"Invalid diagram structure. Please ensure the diagram has been created correctly."
```

---

## 7. Testing Checklist

### 7.1 Functional Tests
- [ ] DiagramEditor loads in Diagram Test tab
- [ ] Can add shapes from toolbar
- [ ] Can drag shapes around canvas
- [ ] Can connect shapes with links
- [ ] Can edit shape labels
- [ ] Can delete shapes and links
- [ ] Can undo/redo actions
- [ ] Can zoom and pan
- [ ] Save Diagram Test saves to backend
- [ ] Saved diagram loads correctly on page reload
- [ ] Architecture type filters work (if implemented)

### 7.2 Validation Tests
- [ ] Cannot save without architecture type
- [ ] Cannot save without prompt
- [ ] Cannot save with empty diagram
- [ ] Error messages display correctly

### 7.3 Integration Tests
- [ ] Diagram state persists to database
- [ ] Diagram loads from database correctly
- [ ] Back navigation works
- [ ] Cancel button works
- [ ] Tab switching preserves diagram state

---

## 8. Dependencies

### 8.1 Required Packages
```json
{
  "d3": "^7.9.0",
  "@types/d3": "^7.4.3"
}
```

### 8.2 Existing Components
- ✅ `DiagramEditor.tsx` - Already exists and functional
- ✅ `utils/lab-utils.ts` - Contains shape definitions
- ✅ `apis/lab.api.ts` - Contains saveDiagramTest API

### 8.3 Backend Support
- ✅ DiagramTest model with expectedDiagramState field
- ✅ POST `/labs/:labId/pages/:pageId/diagram-test` endpoint
- ✅ Validation for diagram test data

---

## 9. Success Criteria

### 9.1 Feature Complete When:
1. ✅ DiagramEditor component renders in Diagram Test tab
2. ✅ Instructors can create diagrams with multiple shapes
3. ✅ Diagrams can be saved to backend with all data
4. ✅ Saved diagrams load correctly when page is revisited
5. ✅ All validation rules are enforced
6. ✅ Error handling works for all failure cases
7. ✅ Navigation (back, cancel) works correctly
8. ✅ No console errors or warnings

### 9.2 Performance Criteria
- DiagramEditor renders in < 1 second
- Diagram operations (add, move, link) are instant (< 100ms)
- Save operation completes in < 3 seconds

---

## 10. Implementation Notes

### 10.1 Architecture Type Filtering
DiagramEditor currently has all shapes in toolbar. If architecture-specific filtering is needed:

**Option 1**: Filter in DiagramEditor component
```typescript
// Pass architectureType as prop
<DiagramEditor
  architectureType={architectureType}
  // ...other props
/>

// In DiagramEditor, filter shapes:
const filteredShapes = Object.entries(architecturalShapes)
  .filter(([key, shape]) => 
    !architectureType || 
    shape.category === architectureType.toLowerCase()
  );
```

**Option 2**: Keep all shapes available (current behavior)
- Instructors can use any shape
- Architecture type is just metadata for the test

### 10.2 Diagram Comparison (Future)
When students take the test, their diagram will be compared to `expectedDiagramState`:
- Compare node positions (with tolerance)
- Compare connections
- Compare labels
- Calculate similarity score

---

## 11. Migration Path

### 11.1 Remove Old Implementation
1. Remove shape loading from API
2. Remove custom shapes panel
3. Remove placeholder canvas
4. Remove drag-and-drop handlers

### 11.2 Add New Implementation
1. Import DiagramEditor
2. Add DiagramEditor to JSX
3. Connect to state management
4. Update save handler
5. Test thoroughly

### 11.3 Backwards Compatibility
- Existing diagram tests will load (if any)
- New format is compatible with backend model
- No database migration needed

---

## 12. Documentation Updates

### 12.1 User Documentation
- Update instructor guide with DiagramEditor usage
- Add screenshots of diagram creation
- Document keyboard shortcuts (Ctrl+Z, etc.)

### 12.2 Developer Documentation
- Update component integration docs
- Document diagram JSON format
- Add API usage examples

---

## 13. Future Enhancements

### 13.1 Phase 2 Features
- [ ] Export diagram as image (PNG/SVG)
- [ ] Import diagram from file
- [ ] Template diagrams (pre-built examples)
- [ ] Collaborative editing (real-time)
- [ ] Version history

### 13.2 Student Features
- [ ] Student diagram comparison view
- [ ] Hints/guidance during test
- [ ] Auto-save student progress
- [ ] Feedback on diagram correctness

---

## Appendix A: Code Snippets

### A.1 Complete Diagram Test Tab (After Integration)
```tsx
<Tabs.Panel value="diagram-test" pt="md">
  <Stack gap="md">
    {/* Back to Tests & Questions Button */}
    <Group justify="flex-start">
      <Button
        variant="subtle"
        onClick={handleBackToTestsAndQuestions}
        leftSection="←"
      >
        Back to Tests & Questions
      </Button>
    </Group>

    <Select
      label="Architecture Type"
      placeholder="Select architecture type"
      data={['AWS', 'Azure', 'GCP', 'Hybrid', 'On-Premise']}
      value={architectureType}
      onChange={(value) => setArchitectureType(value || '')}
      required
    />

    <Textarea
      label="Prompt"
      description="Instructions for students (10-2000 characters)"
      placeholder="Describe what diagram students should create..."
      minLength={10}
      maxLength={2000}
      rows={4}
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      required
    />

    <Box>
      <Text size="sm" fw={500} mb={8}>Diagram Editor</Text>
      <Text size="xs" c="dimmed" mb={8}>
        Create the expected diagram that students should replicate
      </Text>
      
      <DiagramEditor
        initialGraph={expectedDiagramState}
        mode="instructor"
        onGraphChange={(graphJson) => {
          setExpectedDiagramState(graphJson);
        }}
        className="lab-diagram-editor"
      />
    </Box>

    <Group justify="flex-end">
      <Button variant="outline" onClick={handleBackToTestsAndQuestions}>
        Cancel
      </Button>
      <Button onClick={handleSaveDiagramTest} loading={saving}>
        Save Diagram Test
      </Button>
    </Group>
  </Stack>
</Tabs.Panel>
```

---

**End of Specification**
