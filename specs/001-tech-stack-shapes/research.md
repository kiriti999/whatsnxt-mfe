# Research: Tech Stack Shape Library

**Feature**: 001-tech-stack-shapes  
**Date**: 2025-12-18 (Updated)  
**Phase**: 0 - Outline & Research

## Critical Clarifications (Added 2025-12-18)

### Multi-Select Architecture Type Dropdown

**Key Requirement Update**: The Architecture Type dropdown must support multi-select functionality, allowing instructors to select multiple architecture types simultaneously (e.g., Tech Stack + AWS + Kubernetes).

**Impact**: This changes the original assumption of single architecture type selection and requires:
1. Updating Lab data model to store array of architecture types
2. Modifying Architecture Type dropdown component to MultiSelect
3. Shape library panel must display shapes from all selected types
4. Backend API must handle array of architecture types

See Tasks 7-9 below for detailed research on these multi-select requirements.

## Research Tasks

### Task 1: SVG Path Data for Technology Logos

**Question**: Where can we obtain brand-accurate SVG path data for Next.js, React, Node.js, Docker, MongoDB, MCP agent, and AI shapes?

**Findings**:
- **Official Sources**: 
  - Next.js: Official website provides SVG logo at https://nextjs.org/ (black/white design)
  - React: Official SVG available from React docs (atom logo, #61DAFB blue)
  - Node.js: Official branding guidelines with SVG (hexagon, #339933 green)
  - Docker: Official media kit with whale logo SVG (#2496ED blue)
  - MongoDB: Official brand resources with leaf logo (#00684A green)
  
- **Alternative Sources**:
  - Simple Icons project (https://simpleicons.org/) provides standardized SVG paths for popular brands
  - Diagrams.net library has pre-built shapes that can be adapted
  - Browser dev tools can extract SVG paths from official websites

- **For Abstract Concepts**:
  - MCP agent: No official logo (abstract concept). Use generic bot/robot icon (e.g., from Tabler icons already in project)
  - AI: Generic AI/brain/circuit icon from existing icon library

**Decision**: Use official SVG sources where available. For MCP agent and AI, use Tabler icons from existing `@tabler/icons-react` dependency (already in package.json). Simplify complex SVG paths to essential features for performance.

**Rationale**: Official sources ensure brand accuracy. Simplifying paths reduces SVG complexity for faster rendering while maintaining recognizability.

**Alternatives Considered**:
- Creating shapes from scratch: Rejected due to brand accuracy requirements and time investment
- Using PNG/raster images: Rejected because SVG is required for scaling and D3.js integration

---

### Task 2: D3.js Best Practices for Shape Rendering

**Question**: What are the best practices for creating performant, reusable D3.js shape definitions following the existing pattern?

**Findings from existing kubernetes-d3-shapes.ts**:
- **Structure**: Each shape is an object with `id`, `name`, `type`, `width`, `height`, and `render` function
- **Render Function Signature**: `(g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void`
- **Pattern**: Append SVG elements (path, rect, circle) to the provided `g` (group) selection
- **Performance Techniques**:
  - Use path data strings for complex shapes (fewer DOM elements)
  - Use `cx` and `cy` calculations based on width/height for responsive sizing
  - Apply colors directly as fill/stroke attributes
  - Use relative positioning (percentages of width/height) for scalability

**Best Practices**:
1. Define color constants at function start for consistency
2. Calculate center point (`cx = width / 2, cy = height / 2`)
3. Use relative coordinates (e.g., `cx + width * 0.4`) for scaling
4. Keep path definitions clean with template literals
5. Minimize DOM operations - create paths instead of multiple primitives when possible
6. Add stroke for visual definition and depth

**Decision**: Follow existing kubernetes-d3-shapes.ts pattern exactly. Each shape will have render function that appends SVG paths to the provided group selection.

**Rationale**: Established pattern ensures consistency, maintainability, and compatibility with existing canvas system.

**Alternatives Considered**:
- Component-based approach: Rejected because existing system uses functional pattern
- Canvas API instead of SVG: Rejected because system is SVG-based and requires vector scalability

---

### Task 3: Shape Registry Integration Pattern

**Question**: How do we register the new TechStack architecture type in the shape library system?

**Findings**: Need to examine `apps/web/utils/shape-libraries/index.ts` to understand the registry structure.

**Expected Pattern** (based on feature spec):
- `ARCHITECTURE_LIBRARIES` object maps architecture type keys to shape collections
- Each entry includes metadata (name, display name, description)
- `getAvailableArchitectures()` function reads from this registry
- Architecture type dropdown populates from registry

**Decision**: Add new entry to `ARCHITECTURE_LIBRARIES` object:
```typescript
TechStack: {
  name: 'Tech Stack',
  shapes: techStackD3Shapes,
  description: 'Modern web development technologies',
  // additional metadata as needed
}
```

**Rationale**: Follows established pattern for AWS, Azure, Kubernetes, GCP. Minimal changes to existing code.

**Alternatives Considered**:
- Separate registry file: Rejected because centralized registry is more maintainable
- Dynamic loading: Rejected because static imports ensure type safety

---

### Task 4: Brand Color Accuracy

**Question**: What are the exact hex color codes for each technology's official branding?

**Findings**:
- **React**: #61DAFB (cyan/light blue) - official React brand color
- **Next.js**: #000000 (black) with #FFFFFF (white) accents - official Next.js branding
- **Node.js**: #339933 (green) - official Node.js brand color
- **Docker**: #2496ED (blue) - official Docker brand color
- **MongoDB**: #00684A (green) or #13AA52 (leaf logo variant) - official MongoDB colors
- **MCP Agent**: No official branding - use neutral #6C757D (gray) or #5C7CFA (blue) from Mantine
- **AI**: No specific branding - use #7950F2 (purple) or gradient for futuristic look

**Decision**: Use exact official brand colors. For abstract concepts (MCP agent, AI), use complementary colors from Mantine color palette that don't conflict with other shapes.

**Rationale**: Brand accuracy is a P3 acceptance criterion. Using official colors ensures immediate recognition and professional appearance.

**Alternatives Considered**:
- Single color scheme for all shapes: Rejected because brand recognition is important
- Custom colors: Rejected because official colors are specified in requirements

---

### Task 5: Accessibility and Contrast Requirements

**Question**: How do we ensure shapes meet WCAG AA contrast requirements on both light and dark backgrounds?

**Findings**:
- **WCAG AA Requirement**: Contrast ratio of at least 4.5:1 for normal text, 3:1 for large text and graphics
- **Shape Challenge**: Shapes need to work on both light and dark canvas backgrounds
- **Existing Pattern**: Existing shapes use strokes to add definition and contrast

**Best Practices**:
1. Add stroke to all shapes (typically 2px)
2. Use slightly darker stroke than fill for depth
3. For light-colored shapes, ensure stroke provides contrast against white background
4. For dark-colored shapes, ensure they work on both backgrounds

**Decision**: All shapes will include stroke attributes. Light shapes (white/yellow) will have darker strokes. Dark shapes will include lighter accent elements or multi-tone rendering for depth.

**Rationale**: Strokes add visual definition and improve contrast on varied backgrounds without requiring background detection logic.

**Alternatives Considered**:
- Dynamic color adjustment based on background: Rejected as too complex and outside scope
- Outline-only shapes: Rejected because brand colors should be prominent

---

### Task 6: Container Shape Pattern (Docker)

**Question**: How should Docker container shape handle wrapping/containing other shapes?

**Findings from spec**:
- FR-013 requires Docker container to be resizable to "visually contain other shapes"
- This is a visual containment (layout suggestion), not programmatic parent-child relationship

**Existing Pattern Review Needed**: Check if kubernetes-d3-shapes.ts has similar container patterns (e.g., namespace, cluster)

**Decision**: Docker shape will be rendered as a larger rectangular container with Docker whale logo in corner/header. Size can be manually adjusted using existing resize functionality. No special containment logic needed - visual positioning is handled by existing canvas drag-and-drop.

**Rationale**: Keeps implementation simple. Containment is visual metaphor, not functional requirement. Existing canvas system already supports shape layering and positioning.

**Alternatives Considered**:
- Programmatic parent-child relationships: Rejected as out of scope and complex
- Auto-resize to fit children: Rejected as beyond existing shape library capabilities

---

### Task 7: Multi-Select Architecture Dropdown Implementation (NEW)

**Question**: How should the Architecture Type dropdown be modified to support multi-select while maintaining UX clarity?

**Findings**:
- Current implementation uses Mantine `<Select>` component (single-select)
- Mantine provides `<MultiSelect>` component with built-in chip display for selected values
- Example in LabForm.tsx shows consistent Mantine UI patterns throughout codebase
- Multi-select allows selecting multiple architecture types simultaneously

**Decision**: Replace `<Select>` with Mantine `<MultiSelect>` component

**Implementation Pattern**:
```typescript
// Before (single-select):
<Select
  data={getAvailableArchitectures()}
  value={architectureType}
  onChange={setArchitectureType}
/>

// After (multi-select):
<MultiSelect
  data={getAvailableArchitectures()}
  value={architectureTypes}  // string[]
  onChange={setArchitectureTypes}
  placeholder="Select architecture types"
  searchable
  clearable
/>
```

**Rationale**: 
- Native Mantine component ensures UI consistency
- Built-in chip display clearly shows all selected architecture types
- Standard React controlled component pattern
- Existing pattern in codebase for multi-value inputs

**Alternatives Considered**:
- Custom multi-select: More work, inconsistent with design system
- Checkbox list: Takes more vertical space, less compact
- Multiple single dropdowns: Confusing UX, unclear how many to show

---

### Task 8: Shape Library Panel with Multiple Architecture Types (NEW)

**Question**: When multiple architecture types are selected (e.g., Tech Stack + AWS + Kubernetes), how should shapes be displayed in the shape library panel?

**Findings**:
- Shape library panel currently calls `getArchitectureShapes(architectureType)` for single type
- Returns array of shapes that are rendered in a scrollable panel
- No grouping or categorization currently exists in UI

**Decision**: Concatenate shapes from all selected types with section headers

**Implementation Approach**:
```typescript
// Generate grouped shape list
const shapesWithHeaders = selectedArchitectureTypes.flatMap(archType => {
  const shapes = getArchitectureShapes(archType);
  return [
    { type: 'header', name: getArchitectureMetadata(archType).name },
    ...shapes.map(shape => ({ type: 'shape', data: shape }))
  ];
});
```

**Rationale**:
- Maintains flat list structure for easy scrolling
- Section headers provide visual grouping
- Simple implementation using flatMap
- Consistent with current UI patterns

**Alternatives Considered**:
- Tabs for each architecture type: Forces switching between types, can't see all at once
- Accordion/collapsible sections: Adds interaction complexity, harder to scan
- Grouped grid: Complex layout, harder to implement with D3 canvas

---

### Task 9: Data Model for Multiple Architecture Types (NEW)

**Question**: How should the Lab schema store multiple architecture types (currently single string field)?

**Findings**:
- Current Lab type has `architectureConfig: { type: string }` field
- MongoDB supports both string and array storage natively
- Need backward compatibility for existing labs with single architecture type

**Decision**: Change field type to `string | string[]` with migration support

**Migration Strategy**:
1. Frontend: Accept both `string | string[]`, normalize to array for rendering
2. Backend: Update Lab schema to allow both types
3. API: When saving, allow both formats (single string → wrap in array)
4. No forced migration - existing labs continue working with single type

**Type Definition**:
```typescript
interface Lab {
  // ... other fields
  architectureConfig?: {
    type?: string | string[];  // Union type for backward compatibility
    diagram?: string;
  };
  // Alternative: Add new field to avoid confusion
  architectureTypes?: string[];  // Preferred approach
}
```

**Rationale**:
- Supports both single and multiple architecture types (backward compatible)
- TypeScript union type provides type safety
- MongoDB handles arrays efficiently with indexing support
- Frontend can normalize single → array for consistent processing

**Alternatives Considered**:
- Always array (break compatibility): Forces migration of existing labs
- Separate field `architectureTypes: string[]`: Creates dual-field pattern but clearer semantics
- JSON string: Poor queryability, loses type safety

**Recommended Approach**: Use new `architectureTypes?: string[]` field, deprecate old `architectureConfig.type` field gracefully.

---

## Summary of Key Decisions

1. **SVG Sources**: Official logos from brand websites, simplified for performance. Tabler icons for abstract concepts.
2. **D3.js Pattern**: Follow kubernetes-d3-shapes.ts exactly - functional render pattern with relative positioning.
3. **Registry**: Add TechStack entry to ARCHITECTURE_LIBRARIES in index.ts.
4. **Colors**: Use exact official brand hex codes. Mantine colors for abstract shapes.
5. **Accessibility**: Include strokes on all shapes for contrast and definition.
6. **Docker Container**: Standard shape with resize capability. Visual containment only.
7. **Multi-Select Dropdown**: Use Mantine MultiSelect component for architecture type selection. *(NEW)*
8. **Shape Panel Layout**: Flat list with section headers when multiple architecture types selected. *(NEW)*
9. **Data Model**: Add `architectureTypes: string[]` field to Lab type, maintain backward compatibility. *(NEW)*

## Impact Analysis of Multi-Select Feature

**Components Requiring Changes**:
- `apps/web/components/Lab/LabForm.tsx` - Replace Select with MultiSelect
- `apps/web/components/architecture-lab/DiagramEditor.tsx` - Handle array of architecture types
- `apps/web/components/architecture-lab/ShapePreview.tsx` - Render shapes from multiple types
- `apps/web/types/lab.ts` - Add `architectureTypes?: string[]` field
- `apps/web/app/api/lab/[...routes]` - Handle array in API endpoints

**No Changes Needed**:
- Shape library files (tech-stack-d3-shapes.ts, index.ts) - Architecture-agnostic
- Backend schema - MongoDB supports arrays natively
- Canvas rendering - Works with shapes from any architecture type

**Testing Strategy**:
- Unit tests: Shape rendering (tech-stack-shapes.test.ts)
- Integration tests: Multi-select dropdown + shape panel interaction
- E2E tests: Create lab with mixed architecture types (Tech Stack + AWS + Kubernetes)

## Next Steps (Phase 1)

1. Examine existing index.ts structure to confirm registry pattern
2. Create data-model.md with ShapeDefinition interface details
3. Create contracts/ with TypeScript interfaces
4. Create quickstart.md with implementation guide
5. Update agent context with technology additions
