# Quickstart Guide: Tech Stack Shape Library Implementation

**Feature**: 001-tech-stack-shapes  
**Date**: 2025-12-18 (Updated with Multi-Select)  
**Estimated Time**: 6-8 hours (includes multi-select dropdown feature)

## Prerequisites

- Node.js 24 LTS installed
- pnpm 9+ installed
- TypeScript 5.8.2 knowledge
- D3.js basics (existing shape libraries provide reference)
- Access to whatsnxt-mfe repository

## Overview

This feature adds 7 new technology shapes (Next.js, React, Node.js, Docker, MongoDB, MCP agent, AI) to the shape library system and enables multi-select architecture type dropdown. Implementation follows the established pattern from kubernetes-d3-shapes.ts.

**Key Changes**:
1. Create tech-stack-d3-shapes.ts with 7 shapes
2. Register TechStack in ARCHITECTURE_LIBRARIES
3. Replace single-select architecture dropdown with MultiSelect
4. Update Lab data model to support array of architecture types
5. Modify shape library panel to display shapes from multiple selected types

## Step 1: Create Tech Stack Shapes File (2-3 hours)

### Location
`apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts`

### Structure
```typescript
/**
 * Tech Stack D3 Shape Library
 * Professional D3.js implementations of modern web technology shapes
 * Based on official brand guidelines where available
 */

import * as d3 from 'd3';

export interface TechStackShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}

export const techStackD3Shapes: Record<string, TechStackShapeDefinition> = {
  react: {
    id: 'tech-react',
    name: 'React',
    type: 'react',
    width: 80,
    height: 80,
    render: (g, width = 80, height = 80) => {
      // Implementation here
    }
  },
  // ... 6 more shapes
};
```

### Implementation Checklist

For each shape, implement the render function using this pattern:

1. **Define colors** (from brand guidelines)
   ```typescript
   const primaryColor = '#61DAFB'; // Official React blue
   const strokeColor = '#4A9EC9'; // Slightly darker for stroke
   ```

2. **Calculate center point** (for responsive positioning)
   ```typescript
   const cx = width / 2;
   const cy = height / 2;
   ```

3. **Use relative positioning** (percentages of width/height)
   ```typescript
   const radius = width * 0.4; // 40% of width
   const offset = height * 0.2; // 20% of height
   ```

4. **Append SVG elements** to the group
   ```typescript
   g.append('circle')
     .attr('cx', cx)
     .attr('cy', cy)
     .attr('r', radius)
     .attr('fill', primaryColor)
     .attr('stroke', strokeColor)
     .attr('stroke-width', 2);
   ```

5. **Keep complexity low** (cyclomatic complexity < 5)
   - Each shape render function should be straightforward
   - No conditional logic if possible
   - Extract helper functions if needed

### Shape-Specific Implementation Notes

**React (Atom Logo)**:
- Nucleus: Small circle at center
- Orbits: 3 ellipses rotated at 60° intervals
- Use `g.append('ellipse')` with `transform` attribute for rotation

**Next.js (Geometric N)**:
- Option A: Triangle/geometric design
- Option B: Stylized "N" letterform
- High contrast: black fill with white accents

**Node.js (Hexagon)**:
- Use path data for 6-sided polygon
- Center point calculation is key
- Official green: #339933

**Docker (Whale with Containers)**:
- Whale body: Rounded shape at bottom
- Container blocks: Small rectangles on top
- Make slightly wider (90px) for better proportions

**MongoDB (Leaf)**:
- Curved leaf shape using path data
- Official green: #00684A
- Can use bezier curves for organic shape

**MCP Agent (Robot Icon)**:
- Simple bot representation
- Option: Use Tabler icon paths (project already has @tabler/icons-react)
- Neutral gray: #6C757D

**AI (Neural Network)**:
- Connected nodes or brain outline
- Purple theme: #7950F2
- Abstract representation, not brand-specific

### Reference Pattern

Look at `kubernetes-d3-shapes.ts` for complete examples:
- Lines 24-80: Pod shape (hexagon with inner elements)
- Lines 86-150: Deployment shape (multiple hexagons)

## Step 2: Register in Index (15 minutes)

### Location
`apps/web/utils/shape-libraries/index.ts`

### Changes Required

1. **Add import** (line ~15):
```typescript
import { techStackD3Shapes, TechStackShapeDefinition } from './tech-stack-d3-shapes';
```

2. **Update union type** (line ~20):
```typescript
export type ArchitectureShapeDefinition = 
  | ShapeDefinition 
  | AWSShapeDefinition
  | AzureShapeDefinition
  | GCPShapeDefinition
  | KubernetesShapeDefinition
  | TechStackShapeDefinition; // ADD THIS LINE
```

3. **Update ArchitectureType** (line ~30):
```typescript
export type ArchitectureType = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack'; // ADD TechStack
```

4. **Add to registry** (line ~43):
```typescript
export const ARCHITECTURE_LIBRARIES: Record<string, Record<string, ArchitectureShapeDefinition>> = {
  AWS: awsD3Shapes,
  Azure: azureD3Shapes,
  GCP: gcpD3Shapes,
  Kubernetes: kubernetesD3Shapes,
  Generic: genericD3Shapes,
  TechStack: techStackD3Shapes, // ADD THIS LINE
};
```

5. **Add metadata** (line ~118):
```typescript
export const getArchitectureMetadata = (architectureType: string) => {
  const metadata: Record<string, { name: string; color: string; description: string }> = {
    AWS: { /* ... */ },
    Azure: { /* ... */ },
    GCP: { /* ... */ },
    Kubernetes: { /* ... */ },
    Generic: { /* ... */ },
    TechStack: { // ADD THIS ENTRY
      name: 'Tech Stack',
      color: '#5C7CFA',
      description: 'Modern web development technology shapes',
    },
  };
  
  return metadata[architectureType] || { /* ... */ };
};
```

6. **Add to exports** (line ~154):
```typescript
export { awsD3Shapes, azureD3Shapes, gcpD3Shapes, kubernetesD3Shapes, genericD3Shapes, techStackD3Shapes }; // Add techStackD3Shapes
export type { AWSShapeDefinition, AzureShapeDefinition, GCPShapeDefinition, KubernetesShapeDefinition, ShapeDefinition, TechStackShapeDefinition }; // Add TechStackShapeDefinition
```

## Step 4: Update Lab Type Definition (15 minutes)

### Location
`apps/web/types/lab.ts`

### Changes Required

Add new `architectureTypes` field to Lab interface:

```typescript
export interface Lab {
  // ... existing fields
  
  /**
   * NEW: Multi-select architecture types
   * Replaces single architectureConfig.type field
   */
  architectureTypes?: string[];
  
  /**
   * LEGACY: Keep for backward compatibility
   */
  architectureConfig?: {
    type?: string;
    diagram?: string;
  };
  
  // ... other fields
}
```

## Step 5: Update Architecture Dropdown to MultiSelect (30 minutes)

### Location
`apps/web/components/Lab/LabForm.tsx`

### Changes Required

1. **Import MultiSelect** (add to existing imports):
```typescript
import { MultiSelect } from '@mantine/core';
```

2. **Update state management**:
```typescript
// BEFORE (single-select):
const architectureType = watch('architectureConfig.type');

// AFTER (multi-select):
const architectureTypes = watch('architectureTypes') || [];
```

3. **Replace Select with MultiSelect** (find architecture type dropdown):
```typescript
// BEFORE:
<Select
  label="Architecture Type"
  data={getAvailableArchitectures()}
  value={architectureType}
  onChange={(value) => setValue('architectureConfig.type', value)}
/>

// AFTER:
<MultiSelect
  label="Architecture Types"
  description="Select one or more architecture types for this lab"
  data={getAvailableArchitectures()}
  value={architectureTypes}
  onChange={(value) => setValue('architectureTypes', value)}
  placeholder="Select architecture types"
  searchable
  clearable
/>
```

### Similar Changes Required In:
- `apps/web/components/architecture-lab/ArchitectureLabClient.tsx`
- `apps/web/app/lab/create/page.tsx`
- `apps/web/app/lab/[id]/page.tsx`

## Step 6: Update DiagramEditor for Multi-Select (45 minutes)

### Location
`apps/web/components/architecture-lab/DiagramEditor.tsx`

### Changes Required

1. **Accept array of architecture types**:
```typescript
interface DiagramEditorProps {
  // BEFORE:
  // architectureType?: string;
  
  // AFTER:
  architectureTypes?: string[];
  // ... other props
}
```

2. **Fetch shapes from all selected types**:
```typescript
// BEFORE:
const shapes = getArchitectureShapes(architectureType);

// AFTER:
const shapesGrouped = (architectureTypes || ['Generic']).flatMap(type => {
  const shapes = getArchitectureShapes(type);
  const metadata = getArchitectureMetadata(type);
  return [
    { type: 'header', name: metadata.name, key: `header-${type}` },
    ...shapes.map(shape => ({ type: 'shape', data: shape, key: shape.id }))
  ];
});
```

3. **Render shape panel with headers**:
```typescript
{shapesGrouped.map((item) => {
  if (item.type === 'header') {
    return (
      <Text key={item.key} fw={700} size="sm" mt="md" mb="xs">
        {item.name}
      </Text>
    );
  }
  
  return (
    <ShapeItem
      key={item.key}
      shape={item.data}
      onDragStart={(e) => handleShapeDragStart(e, item.data)}
    />
  );
})}
```

## Step 7: Update Backend API (30 minutes)

### Location
`apps/web/app/api/lab/create/route.ts` and `apps/web/app/api/lab/[id]/route.ts`

### Changes Required

1. **Accept architectureTypes in request body**:
```typescript
const body = await req.json();

// Normalize to array
let architectureTypes = body.architectureTypes;
if (!architectureTypes?.length && body.architectureConfig?.type) {
  architectureTypes = [body.architectureConfig.type];
}
if (!architectureTypes?.length) {
  architectureTypes = ['Generic'];
}

// Validate
const validTypes = getAvailableArchitectures();
architectureTypes = architectureTypes.filter(type => validTypes.includes(type));
```

2. **Save to database**:
```typescript
const lab = new Lab({
  ...body,
  architectureTypes, // Save normalized array
  // Keep architectureConfig for backward compat (optional)
});

await lab.save();
```

3. **Update MongoDB schema** (if using Mongoose):
```typescript
// In lab.model.ts or similar:
const labSchema = new Schema({
  // ... existing fields
  
  architectureTypes: {
    type: [String],
    required: false,
    validate: {
      validator: (arr) => arr.length <= 10,
      message: 'Maximum 10 architecture types allowed'
    }
  },
  
  // Keep for backward compatibility
  architectureConfig: {
    type: { type: String },
    diagram: String
  }
});
```

## Step 8: Build and Test (30 minutes)

### TypeScript Compilation
```bash
cd apps/web
pnpm run check-types
```

Expected: No TypeScript errors.

### Dev Server
```bash
cd /Users/arjun/whatsnxt-mfe
pnpm run dev
```

Expected: Server starts on port 3001.

### Manual Testing Checklist

1. **Architecture Dropdown**
   - [ ] Navigate to lab creation/edit page
   - [ ] Open architecture type dropdown
   - [ ] Verify "Tech Stack" appears in list

2. **Shape Library Panel**
   - [ ] Select "Tech Stack" from dropdown
   - [ ] Verify 7 shapes appear in shape library panel
   - [ ] Verify shape names: React, Next.js, Node.js, Docker, MongoDB, MCP Agent, AI

3. **Shape Rendering**
   - [ ] Drag React shape onto canvas
   - [ ] Verify shape renders with correct blue color (#61DAFB)
   - [ ] Repeat for all 7 shapes
   - [ ] Verify each shape has correct brand colors

4. **Multi-Select Functionality** ✨ NEW
   - [ ] Select multiple architecture types (e.g., Tech Stack + AWS)
   - [ ] Verify shape panel shows shapes from both types
   - [ ] Verify section headers appear (e.g., "Tech Stack", "AWS")
   - [ ] Verify chips display selected types above shape panel
   - [ ] Drag shapes from different architectures onto same canvas
   - [ ] Verify mixed-architecture diagram saves correctly
   - [ ] Reload page and verify all architecture types load correctly

5. **Shape Operations**
   - [ ] Resize a shape - verify it scales correctly
   - [ ] Move a shape - verify position updates
   - [ ] Connect two shapes with arrow - verify connection draws
   - [ ] Delete a shape - verify it removes

6. **Persistence**
   - [ ] Create diagram with tech stack shapes
   - [ ] Save diagram
   - [ ] Reload page
   - [ ] Verify shapes appear in correct positions with correct styling

7. **Edge Cases**
   - [ ] Zoom canvas to 50% - verify shapes remain crisp (SVG scaling)
   - [ ] Zoom canvas to 200% - verify no pixelation
   - [ ] Place 50+ shapes on canvas - verify performance (<2s load time)
   - [ ] Mix tech stack shapes with AWS/Kubernetes shapes - verify no ID collisions
   - [ ] Test backward compatibility: Load old lab with single architectureConfig.type
   - [ ] Verify old lab displays correctly with single type converted to array

## Step 9: Update Agent Context (5 minutes)

```bash
cd /Users/arjun/whatsnxt-mfe
.specify/scripts/bash/update-agent-context.sh copilot
```

This updates `.copilot/context/implementation-plan.md` with the new tech stack shapes feature information.

## Troubleshooting

### TypeScript Error: "Property 'TechStack' does not exist"
- **Cause**: Missing registry entry
- **Fix**: Verify step 2.4 - TechStack added to ARCHITECTURE_LIBRARIES

### Shape Not Rendering
- **Cause**: Error in render function
- **Fix**: Check browser console for errors. Verify D3 syntax.
- **Debug**: Add `console.log('Rendering shape', width, height)` at start of render function

### Shape Colors Wrong
- **Cause**: Incorrect color constants
- **Fix**: Verify hex codes against official brand guidelines (see research.md)

### Shape Distorted When Resized
- **Cause**: Using absolute coordinates instead of relative
- **Fix**: Use percentages of width/height (e.g., `width * 0.5` not `40`)

### Multi-Select Not Working
- **Cause**: Component not imported or wrong value type
- **Fix**: Verify `import { MultiSelect } from '@mantine/core'` and value is array

### Backward Compatibility Issues
- **Cause**: Old labs not loading correctly
- **Fix**: Add normalization function in DiagramEditor to convert single type to array

### Performance Issues
- **Cause**: Too many DOM elements or complex paths
- **Fix**: Simplify SVG paths. Use single path with multiple segments instead of many elements.

## Performance Targets

- Each shape render function: <50ms
- 50 shapes on canvas load: <2s total
- No memory leaks (shapes properly cleaned up on delete)

## Code Quality Checklist

- [ ] TypeScript strict mode passes
- [ ] All render functions have cyclomatic complexity < 5
- [ ] Colors defined as constants (not magic strings)
- [ ] Shapes use relative positioning (width/height percentages)
- [ ] All shapes include stroke for contrast
- [ ] Code formatted with Prettier
- [ ] No console.log statements in production code
- [ ] Comments explain complex SVG path logic

## Testing Strategy

Since this feature adds visual shapes, testing is primarily manual:

1. **Visual Inspection**: Compare rendered shapes to official logos side-by-side
2. **Interaction Testing**: Verify drag, resize, connect operations
3. **Persistence Testing**: Save and reload diagrams
4. **Cross-Architecture Testing**: Mix with existing shapes
5. **Performance Testing**: Load 50+ shapes and measure time

Automated testing (if desired):
- Unit tests for shape data structure (id, name, type present)
- Integration tests for registry functions (getArchitectureShapes returns 7)
- Snapshot tests for SVG output (render to string, compare)

## Completion Criteria

Feature is complete when:
- ✅ All 7 shapes render correctly with brand-accurate colors
- ✅ Shapes appear in "Tech Stack" dropdown option
- ✅ MultiSelect dropdown allows selecting multiple architecture types
- ✅ Shape panel displays shapes from all selected types with section headers
- ✅ All shape operations work (drag, resize, move, connect, delete)
- ✅ Mixed-architecture diagrams work (Tech Stack + AWS + Kubernetes)
- ✅ Diagrams save and reload with multiple architecture types
- ✅ Backward compatibility: Old labs with single type still load correctly
- ✅ No TypeScript errors
- ✅ Performance targets met (<50ms render, <2s load)
- ✅ Agent context updated

## Resources

- **D3.js Documentation**: https://d3js.org/
- **SVG Path Reference**: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
- **Brand Guidelines**:
  - React: https://react.dev/
  - Next.js: https://nextjs.org/
  - Node.js: https://nodejs.org/
  - Docker: https://www.docker.com/company/newsroom/media-resources
  - MongoDB: https://www.mongodb.com/brand-resources
- **Existing Shape Libraries**: `apps/web/utils/shape-libraries/kubernetes-d3-shapes.ts`

## Next Steps (Phase 2 - NOT in this command)

After Phase 1 artifacts are complete:
1. `/speckit.tasks` command generates detailed task breakdown
2. Implementation begins following tasks.md
3. Code review and testing
4. Merge to main branch
