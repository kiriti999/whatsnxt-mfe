# Architecture & HLD/LLD Teaching Feature Proposal

## 1. Technology Selection: JointJS vs. D3.js

For building an interactive diagram editor where users can drag, drop, and connect shapes (BPMN or custom), **JointJS** is the superior choice over D3.js.

*   **JointJS**: Built specifically for diagramming. It provides out-of-the-box support for:
    *   Drag-and-drop interactions.
    *   Link creation (arrows) with validation (e.g., allow/disallow connections).
    *   Serialization (Export to JSON / Import from JSON).
    *   Pre-defined shapes (BPMN, UML, Standard).
    *   Event handling for specific element interactions.

*   **D3.js**: A low-level visualization library. While powerful, building a "drag-and-drop editor" with connection lines, ports, and state management would require writing a massive amount of boilerplate code from scratch.

**Recommendation:** Use **JointJS** (specifically the open-source Core version). It integrates well with React and handles the heavy lifting of the diagram state.

---

## 2. Feature Workflow

### Phase 1: Instructor Mode (The Architect)
*   **Goal**: Create the "Master Solution" diagram.
*   **Interface**: A full canvas editor.
*   **Actions**:
    *   Drag shapes (Database, Load Balancer, Server, User, etc.) from a palette.
    *   Connect shapes using arrows (Edges) to define data flow.
    *   Label shapes (e.g., "Primary DB", "Auth Service").
    *   **Save**: Serializes the graph (Nodes + Links) to JSON and saves it to the DB as the "Answer Key".

### Phase 2: Student Mode (The Lab)
*   **Goal**: Reconstruct the architecture.
*   **Interface**: A canvas with "Jumbled" or "Disconnected" components.
*   **Initialization**:
    *   The system loads the "Answer Key" JSON.
    *   **Jumbling Logic**:
        *   **Option A (Scramble):** Randomize the `x, y` coordinates of all nodes on the canvas.
        *   **Option B (Palette):** Place all nodes back into a "staging area" or sidebar, requiring the student to drag them onto the canvas.
    *   **Disconnecting**: Remove all `Links` (Arrows) from the graph, or perhaps keep them but disconnect one end (harder). *Recommendation: Remove all links to force the student to understand the flow.*
*   **Actions**:
    *   Move nodes to logical positions (e.g., Load Balancer in front of Servers).
    *   Draw links between nodes to establish flow.
    *   Click "Validate / Submit".

### Phase 3: Validation Logic
*   **How it works**: Compare the Student's Graph with the Master Graph.
*   **Criteria**:
    1.  **Connections (Critical):** Does `Node A` connect to `Node B`?
    2.  **Directionality:** Is the arrow pointing the right way?
    3.  **Positioning (Optional):** Is the Database roughly "below" or "behind" the server? (Usually better to validate connections rather than exact pixels).

---

## 3. Data Model (Schema)

You will need a schema to store these diagrams.

**Collection: `ArchitectureLabs`**

```json
{
  "_id": "ObjectId",
  "title": "AWS 3-Tier Architecture",
  "description": "Reconstruct a standard 3-tier web app architecture.",
  "difficulty": "Medium",
  "masterGraph": {
    // This is the direct JSON export from JointJS
    "cells": [
      {
        "type": "standard.Rectangle",
        "id": "node-1",
        "position": { "x": 100, "y": 100 },
        "attrs": { "label": { "text": "Load Balancer" } }
      },
      {
        "type": "standard.Link",
        "id": "link-1",
        "source": { "id": "node-1" },
        "target": { "id": "node-2" }
      }
    ]
  },
  "config": {
    "allowExtraLinks": false, // If true, extra wrong links reduce score but don't fail
    "checkPositions": false   // If true, validate relative positioning
  }
}
```

---

## 4. Implementation Strategy

### A. Dependencies
Install JointJS and its types.
```bash
npm install jointjs backbone jquery dagre graphlib
npm install --save-dev @types/jointjs @types/backbone
```
*(Note: JointJS depends on Backbone and jQuery, which is old-school but required for the core library).*

### B. Component Structure (React)

1.  **`DiagramEditor.tsx`** (Admin)
    *   Wraps the JointJS `Paper` and `Graph`.
    *   Includes a `Stencil` (Sidebar) for dragging new shapes.
    *   Handles "Save" by calling `graph.toJSON()`.

2.  **`DiagramLab.tsx`** (Student)
    *   Accepts `labId` prop.
    *   Fetches `masterGraph`.
    *   **`prepareLab()` function**:
        *   Clones `masterGraph`.
        *   Iterates through `cells`:
            *   If it's a `Link`, remove it.
            *   If it's an `Element` (Shape), assign a random `position` within bounds.
    *   Renders the "Jumbled" graph.
    *   **`validate()` function**:
        *   Get current `studentGraph.toJSON()`.
        *   Compare the set of `(sourceId, targetId)` pairs in Student Graph vs. Master Graph.
        *   Provide feedback (e.g., "3/5 connections correct").

### C. Validation Algorithm (Simplified)

```typescript
function validateLab(masterGraph: any, studentGraph: any) {
    const masterLinks = masterGraph.cells.filter(c => c.type === 'standard.Link');
    const studentLinks = studentGraph.cells.filter(c => c.type === 'standard.Link');

    let correctLinks = 0;

    // Create a set of "SourceID->TargetID" strings for O(1) lookup
    const masterConnections = new Set(
        masterLinks.map(l => `${l.source.id}->${l.target.id}`)
    );

    studentLinks.forEach(link => {
        const connectionKey = `${link.source.id}->${link.target.id}`;
        if (masterConnections.has(connectionKey)) {
            correctLinks++;
        }
    });

    const score = (correctLinks / masterLinks.length) * 100;
    return { score, passed: score === 100 };
}
```

---

## 5. Next Steps
1.  **Setup JointJS Wrapper**: Create a reusable React component that initializes a JointJS Paper.
2.  **Create "Editor" Page**: Allow creating and saving a simple diagram.
3.  **Create "Lab" Page**: Implement the loading and "jumbling" logic.
