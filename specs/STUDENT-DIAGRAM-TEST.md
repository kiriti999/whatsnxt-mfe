# Student Diagram Test - User Story

**Feature**: Student Diagram Reconstruction Test  
**Created**: 2025-12-15  
**Status**: Specification  
**Related**: `/specs/001-lab-diagram-test/spec.md`, `/specs/LAB-DIAGRAM-EDITOR-INTEGRATION.md`

---

## Overview

Students taking a diagram test must reconstruct the architecture by re-arranging jumbled shapes and recreating connections. This feature uses the existing `jumbleGraph` function to randomize shape positions and remove all connections (arrows/links), creating a puzzle-like learning experience.

---

## User Story 11 - Student Reconstructs Architecture Diagram (Priority: P1)

**As a** student taking a lab test,  
**I want to** see jumbled architecture shapes without connections and reconstruct the correct diagram,  
**So that** I can learn architecture patterns by actively building them rather than passively viewing them.

### Why this priority
This is a core learning objective - students learn by doing. The reconstruction process reinforces understanding of component relationships and architecture patterns.

### Business Value
- **Active Learning**: Students engage with content rather than memorizing
- **Pattern Recognition**: Students learn to identify correct architecture patterns
- **Hands-On Experience**: Simulates real-world architecture design decisions
- **Assessment**: Provides measurable learning outcomes

---

## Acceptance Scenarios

### Scenario 1: Student Views Jumbled Diagram
**Given** a student opens a diagram test  
**When** the page loads  
**Then** they should see:
- All shapes from the instructor's diagram
- Shapes placed randomly in a grid layout
- NO arrows/links between shapes (all connections removed)
- At least one nested shape moved outside its original container (Group/Zone/Pool)
- All shapes within viewport boundaries (no scrolling required)

### Scenario 2: Instructor Views Original Diagram
**Given** an instructor opens a diagram test (preview mode or grading)  
**When** the page loads  
**Then** they should see:
- The original diagram exactly as created
- All shapes in their original positions
- All connections/arrows intact
- All nested shapes in their correct containers

### Scenario 3: Student Reconstructs Diagram
**Given** a student views the jumbled shapes  
**When** they interact with the diagram  
**Then** they should be able to:
- Drag shapes to new positions
- Create links between shapes by clicking source then target
- Move shapes into container shapes (Group/Zone/Pool)
- Undo/redo their actions (Ctrl+Z / Ctrl+Y)
- Zoom and pan for better view

### Scenario 4: Student Submits Diagram
**Given** a student has reconstructed the diagram  
**When** they click "Submit Answer"  
**Then** the system should:
- Compare their diagram to the master diagram
- Calculate a score based on correct connections
- Display feedback showing correct vs incorrect connections
- Save their submission to the database

### Scenario 5: Nested Shape Extraction
**Given** the instructor's diagram has shapes inside containers (Group/Zone/Pool)  
**When** the diagram is jumbled for the student  
**Then** at least one nested shape should:
- Be extracted from its container
- Be placed outside in the random grid
- Be identifiable by the student as needing repositioning

### Scenario 6: Shape Preservation
**Given** the instructor's diagram has specific shape properties (size, color, label, type)  
**When** the diagram is jumbled  
**Then** all shape properties should be preserved except:
- X position (randomized)
- Y position (randomized)
- Parent container (nested shapes moved out)
- Links are removed entirely

---

## Functional Requirements

### FR-S01: Jumbling Algorithm ✅ **IMPLEMENTED**
The system MUST use the `jumbleGraph` function from `apps/web/utils/lab-utils.ts` to:
- Remove all links (connections/arrows) from the diagram
- Randomize shape positions in a grid layout
- Keep shapes within viewport (900x600 with 50px padding)
- Preserve shape properties (size, color, label, type)
- Ensure no overlapping shapes

**Location**: `apps/web/utils/lab-utils.ts:99-160`

### FR-S02: Nested Shape Extraction
The system MUST extract at least one nested shape from container shapes:
- Identify shapes with `parent` property pointing to Group/Zone/Pool
- Select at least 1 nested shape randomly
- Remove its parent reference
- Place it in the randomized grid along with other shapes

**Implementation Required**: New function `extractNestedShapes(graphJson)`

### FR-S03: Role-Based Diagram Display
The system MUST display different diagrams based on user role:
- **Student**: Jumbled diagram (randomized positions, no links)
- **Instructor**: Original diagram (as created)

**Implementation Required**: Role detection and conditional rendering

### FR-S04: Student Interaction
The system MUST allow students to:
- Drag shapes to any position
- Create links by selecting source then target shape
- Move shapes into containers (Group/Zone/Pool)
- Delete links they created
- Undo/redo their actions
- Zoom and pan the canvas

**Implementation Required**: Enable DiagramEditor in student mode

### FR-S05: Diagram Validation ✅ **IMPLEMENTED**
The system MUST use the `validateGraph` function to:
- Compare student diagram to master diagram
- Count correct connections (links)
- Calculate score as percentage: `(correctLinks / totalLinks) * 100`
- Return pass/fail status (100% = pass)
- Provide detailed feedback

**Location**: `apps/web/utils/lab-utils.ts:162-199`

### FR-S06: Submission Storage
The system MUST save student submissions:
- Store student diagram JSON (nodes + links)
- Store submission timestamp
- Store calculated score
- Store pass/fail status
- Link to student ID and lab/page ID

**Implementation Required**: New API endpoint and database model

### FR-S07: Visual Feedback
The system MUST provide visual feedback:
- Highlight correct connections in green
- Highlight incorrect connections in red
- Show missing connections as dashed lines
- Display score prominently
- Show congratulatory message on 100% score

**Implementation Required**: Grading visualization layer

---

## Technical Specifications

### Data Models

#### StudentSubmission (New Model)
```typescript
interface StudentSubmission {
  id: string; // UUID
  studentId: string; // User ID
  labId: string; // Lab ID
  pageId: string; // Page ID
  diagramTestId: string; // DiagramTest ID
  submittedDiagram: {
    nodes: NodeType[];
    links: LinkType[];
  };
  score: number; // 0-100
  passed: boolean; // true if score === 100
  correctLinks: number;
  totalLinks: number;
  submittedAt: Date;
  timeSpentSeconds: number; // Optional: track time spent
}
```

### API Endpoints

#### GET `/api/labs/:labId/pages/:pageId/diagram-test/jumbled`
Get jumbled diagram for student to solve

**Response**:
```json
{
  "prompt": "Reconstruct the AWS 3-tier architecture",
  "jumbledDiagram": {
    "nodes": [...], // Randomized positions, no parent refs
    "links": [] // Empty - student must recreate
  },
  "totalLinks": 8 // For UI to show progress
}
```

#### POST `/api/labs/:labId/pages/:pageId/diagram-test/submit`
Submit student's diagram for grading

**Request**:
```json
{
  "studentId": "student-uuid",
  "studentDiagram": {
    "nodes": [...],
    "links": [...]
  },
  "timeSpentSeconds": 420
}
```

**Response**:
```json
{
  "score": 87.5,
  "passed": false,
  "correctLinks": 7,
  "totalLinks": 8,
  "feedback": "7/8 correct connections",
  "incorrectLinks": [
    { "source": "node1", "target": "node2", "reason": "Wrong connection" }
  ],
  "missingLinks": [
    { "source": "node3", "target": "node4", "reason": "Connection missing" }
  ]
}
```

#### GET `/api/labs/:labId/pages/:pageId/diagram-test/original`
Get original diagram (instructor view only)

**Response**:
```json
{
  "prompt": "AWS 3-tier architecture",
  "originalDiagram": {
    "nodes": [...], // Original positions and parents
    "links": [...] // All connections
  }
}
```

### Utility Functions

#### extractNestedShapes (New)
```typescript
/**
 * Extract at least one nested shape from containers
 * @param graphJson - Original diagram JSON
 * @returns Modified JSON with extracted shapes
 */
export const extractNestedShapes = (graphJson: any) => {
  const modified = JSON.parse(JSON.stringify(graphJson));
  const nestedShapes = modified.nodes.filter(n => n.parent);
  
  if (nestedShapes.length > 0) {
    // Extract at least 1 random nested shape
    const countToExtract = Math.max(1, Math.floor(nestedShapes.length * 0.3));
    const shuffled = nestedShapes.sort(() => Math.random() - 0.5);
    
    shuffled.slice(0, countToExtract).forEach(shape => {
      delete shape.parent; // Remove parent reference
    });
  }
  
  return modified;
};
```

#### enhancedJumbleGraph (Enhancement)
```typescript
/**
 * Enhanced jumble function that also extracts nested shapes
 * @param graphJson - Original diagram JSON
 * @returns Jumbled diagram with extracted nested shapes
 */
export const enhancedJumbleGraph = (graphJson: any) => {
  // First extract nested shapes
  const withExtracted = extractNestedShapes(graphJson);
  
  // Then jumble positions and remove links
  return jumbleGraph(withExtracted);
};
```

### Component Integration

#### Student Diagram Test View
**Location**: `apps/web/app/labs/[id]/pages/[pageId]/take/page.tsx` (New)

```typescript
'use client';

const StudentDiagramTestPage = ({ params }) => {
  const [jumbledDiagram, setJumbledDiagram] = useState(null);
  const [currentDiagram, setCurrentDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch jumbled diagram
    labApi.getJumbledDiagram(params.id, params.pageId)
      .then(data => {
        setJumbledDiagram(data.jumbledDiagram);
        setCurrentDiagram(data.jumbledDiagram);
      })
      .finally(() => setLoading(false));
  }, [params.id, params.pageId]);
  
  const handleSubmit = async () => {
    const result = await labApi.submitDiagramTest({
      studentId: getCurrentStudentId(),
      labId: params.id,
      pageId: params.pageId,
      studentDiagram: currentDiagram,
      timeSpentSeconds: calculateTimeSpent()
    });
    
    // Show results
    showGradingModal(result);
  };
  
  return (
    <Container>
      <Title>Reconstruct the Architecture</Title>
      <Text>{prompt}</Text>
      
      <DiagramEditor
        initialGraph={jumbledDiagram}
        onChange={setCurrentDiagram}
        mode="student" // Enable all editing features
        readOnly={false}
      />
      
      <Button onClick={handleSubmit}>Submit Answer</Button>
    </Container>
  );
};
```

#### Instructor Preview Mode
**Location**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` (Enhancement)

```typescript
// In Diagram Test tab
const userRole = getCurrentUserRole(); // 'instructor' or 'student'

const diagramToShow = userRole === 'instructor' 
  ? originalDiagram // Show as created
  : enhancedJumbleGraph(originalDiagram); // Jumble for preview

<DiagramEditor
  initialGraph={diagramToShow}
  onChange={handleDiagramChange}
  mode={userRole}
  readOnly={userRole === 'student'} // Students can't edit in preview
/>
```

---

## User Experience Flow

### Student Journey

1. **Navigate to Lab**
   - Student clicks on published lab from dashboard
   - Views lab pages list

2. **Start Diagram Test**
   - Clicks on page with diagram test
   - Sees prompt: "Reconstruct the AWS 3-tier architecture"
   - Timer starts (optional)

3. **View Jumbled Diagram**
   - Sees all shapes scattered randomly
   - No connections visible
   - Notices some shapes should be inside containers

4. **Reconstruct Architecture**
   - Drags shapes to logical positions
   - Creates links between components
   - Moves shapes into containers (VPC, subnets, etc.)
   - Uses undo/redo as needed

5. **Submit Answer**
   - Reviews diagram one last time
   - Clicks "Submit Answer"
   - Confirmation dialog appears

6. **View Results**
   - Sees score immediately (e.g., 87.5%)
   - Correct connections shown in green
   - Incorrect connections shown in red
   - Missing connections shown as dashed lines
   - Detailed feedback provided

7. **Retry or Continue**
   - If passed (100%): Move to next page
   - If failed: Option to retry or review feedback

### Instructor Journey

1. **Create Diagram Test**
   - Uses DiagramEditor to create architecture
   - All shapes positioned correctly
   - All connections drawn
   - Saves as expected diagram

2. **Preview Student View**
   - Toggle to "Student Preview" mode
   - Sees jumbled version
   - Confirms it's solvable
   - Returns to edit mode

3. **Review Student Submissions**
   - Views list of student submissions
   - Sees scores for each student
   - Can view side-by-side comparison:
     - Expected diagram (left)
     - Student's diagram (right)
   - Can provide manual feedback if needed

---

## Validation Rules

### Diagram Submission Validation

1. **At least one link created**: Student must attempt connections
2. **All shapes present**: No shapes can be deleted
3. **Shapes within bounds**: All shapes must be visible in viewport
4. **Valid links**: Links must connect valid nodes

### Scoring Rules

1. **Connection Accuracy**: Primary metric
   - Each correct connection: +points
   - Total score: (correct / expected) * 100

2. **Position Accuracy**: Optional future enhancement
   - Measure distance from expected position
   - Give partial credit for proximity

3. **Nesting Accuracy**: Optional future enhancement
   - Check if shapes are in correct containers
   - Give points for correct parent-child relationships

---

## Success Criteria

### SC-S01: Jumbling Works Correctly
- All links removed from student view ✅
- Shapes randomized in grid layout ✅
- At least one nested shape extracted ⚠️ (needs implementation)
- All shapes visible without scrolling ✅

### SC-S02: Role-Based Display Works
- Instructors see original diagram
- Students see jumbled diagram
- Same component, different data

### SC-S03: Student Can Reconstruct
- Drag shapes works
- Create links works
- Move into containers works
- Undo/redo works

### SC-S04: Grading is Accurate
- Score calculation matches `validateGraph` function ✅
- Correct connections identified properly ✅
- Feedback is clear and actionable

### SC-S05: Performance is Acceptable
- Jumbling completes in < 100ms
- Grading completes in < 500ms
- Diagram loads in < 2 seconds

---

## Implementation Plan

### Phase 1: Backend (Week 1)
- [ ] Create `StudentSubmission` model
- [ ] Add `extractNestedShapes` function to lab-utils.ts
- [ ] Add `enhancedJumbleGraph` function
- [ ] Create API endpoint: GET `/jumbled`
- [ ] Create API endpoint: POST `/submit`
- [ ] Create API endpoint: GET `/original`
- [ ] Add role detection middleware

### Phase 2: Frontend (Week 2)
- [ ] Create student diagram test page
- [ ] Integrate DiagramEditor in student mode
- [ ] Add submission UI
- [ ] Create grading results modal
- [ ] Add visual feedback (green/red/dashed lines)
- [ ] Add timer (optional)

### Phase 3: Instructor Features (Week 3)
- [ ] Add preview toggle in diagram test tab
- [ ] Create submissions list view
- [ ] Create side-by-side comparison view
- [ ] Add manual feedback option
- [ ] Add analytics (average score, time spent, etc.)

### Phase 4: Testing & Polish (Week 4)
- [ ] Unit tests for jumbling functions
- [ ] Unit tests for grading functions
- [ ] Integration tests for submission flow
- [ ] E2E tests for complete student journey
- [ ] Performance optimization
- [ ] Accessibility audit

---

## Open Questions

1. **Partial Credit**: Should students get partial credit for close-enough connections?
2. **Time Limit**: Should there be a time limit per diagram test?
3. **Attempts**: How many attempts should students get? Unlimited or limited?
4. **Hints**: Should there be a hint system (show one correct connection)?
5. **Position Scoring**: Should position accuracy contribute to score, or only connections?
6. **Container Scoring**: Should nesting shapes correctly contribute to score?

---

## Related Documentation

- Main Spec: `/specs/001-lab-diagram-test/spec.md`
- DiagramEditor Integration: `/specs/LAB-DIAGRAM-EDITOR-INTEGRATION.md`
- Constitution: `/constitution.md` (Section on D3.js)
- Existing Functions: `/apps/web/utils/lab-utils.ts`

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-15 | 1.0 | Initial specification | System |

---

**Status**: Ready for Implementation  
**Priority**: P1 - Core Learning Feature  
**Estimated Effort**: 4 weeks (1 backend, 2 frontend, 1 testing)
