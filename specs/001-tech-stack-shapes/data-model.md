# Data Model: Tech Stack Shape Library

**Feature**: 001-tech-stack-shapes  
**Date**: 2025-12-16  
**Phase**: 1 - Design & Contracts

## Entity: TechStackShapeDefinition

**Description**: TypeScript interface defining the structure of a tech stack shape. Extends the existing ShapeDefinition pattern from generic-d3-shapes.ts.

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier for the shape | Must be prefixed with `tech-` (e.g., `tech-react`, `tech-nodejs`) to avoid collisions |
| `name` | string | Yes | Human-readable display name | Must match technology name (e.g., "React", "Node.js", "Docker") |
| `type` | string | Yes | Lookup key for the shape | Lowercase version of name (e.g., "react", "nodejs", "docker") |
| `width` | number | Yes | Default width in pixels | Must be positive integer, typically 80 |
| `height` | number | Yes | Default height in pixels | Must be positive integer, typically 80 |
| `render` | function | Yes | D3.js render function | Must accept (g, width, height) parameters and append SVG elements to group |

**Relationships**: N/A (code-based entity)

**State Transitions**: N/A (immutable shape definitions)

**Example**:
```typescript
{
  id: 'tech-react',
  name: 'React',
  type: 'react',
  width: 80,
  height: 80,
  render: (g, width = 80, height = 80) => {
    // D3.js SVG rendering logic
    const color = '#61DAFB';
    const cx = width / 2;
    const cy = height / 2;
    // ... append paths, circles, etc.
  }
}
```

---

## Entity: Tech Stack Shapes Collection

**Description**: Record (dictionary) mapping shape keys to TechStackShapeDefinition objects. Exported as `techStackD3Shapes`.

**Structure**:
```typescript
Record<string, TechStackShapeDefinition>
```

**Keys**: Lowercase technology names (e.g., "react", "nextjs", "nodejs", "docker", "mongodb", "mcpagent", "ai")

**Values**: TechStackShapeDefinition objects

**Count**: 7 shapes (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI)

**Example**:
```typescript
export const techStackD3Shapes: Record<string, TechStackShapeDefinition> = {
  react: { id: 'tech-react', name: 'React', type: 'react', width: 80, height: 80, render: ... },
  nextjs: { id: 'tech-nextjs', name: 'Next.js', type: 'nextjs', width: 80, height: 80, render: ... },
  // ... 5 more shapes
};
```

---

## Entity: Architecture Registry Entry

**Description**: Entry in ARCHITECTURE_LIBRARIES registry that maps "TechStack" key to the tech stack shapes collection.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Key | string | Yes | "TechStack" (architecture type identifier) |
| Value | Record<string, TechStackShapeDefinition> | Yes | techStackD3Shapes collection |

**Metadata** (from getArchitectureMetadata):

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name: "Tech Stack" |
| `color` | string | Brand color: "#5C7CFA" (blue, distinct from other architectures) |
| `description` | string | "Modern web development technology shapes" |

**Integration Point**: apps/web/utils/shape-libraries/index.ts

**Example**:
```typescript
export const ARCHITECTURE_LIBRARIES: Record<string, Record<string, ArchitectureShapeDefinition>> = {
  AWS: awsD3Shapes,
  Azure: azureD3Shapes,
  GCP: gcpD3Shapes,
  Kubernetes: kubernetesD3Shapes,
  Generic: genericD3Shapes,
  TechStack: techStackD3Shapes, // NEW ENTRY
};
```

---

## Shape-Specific Entities

### React Shape
- **ID**: `tech-react`
- **Color**: `#61DAFB` (official React cyan)
- **Visual Elements**: Atom logo with nucleus and orbiting electrons
- **Dimensions**: 80x80px default
- **Key Features**: Circular nucleus, 3 elliptical orbits

### Next.js Shape
- **ID**: `tech-nextjs`
- **Color**: `#000000` (black) with `#FFFFFF` (white) accents
- **Visual Elements**: "N" logo or triangle geometric design
- **Dimensions**: 80x80px default
- **Key Features**: Bold geometric shape, high contrast black/white

### Node.js Shape
- **ID**: `tech-nodejs`
- **Color**: `#339933` (official Node.js green)
- **Visual Elements**: Hexagon shape
- **Dimensions**: 80x80px default
- **Key Features**: Six-sided hexagon matching Node.js branding

### Docker Shape
- **ID**: `tech-docker`
- **Color**: `#2496ED` (official Docker blue)
- **Visual Elements**: Whale with container blocks on top
- **Dimensions**: 90x80px default (slightly wider)
- **Key Features**: Whale body, container stack, can be resized larger for containment metaphor

### MongoDB Shape
- **ID**: `tech-mongodb`
- **Color**: `#00684A` (official MongoDB green)
- **Visual Elements**: Leaf logo
- **Dimensions**: 80x80px default
- **Key Features**: Curved leaf shape, organic design

### MCP Agent Shape
- **ID**: `tech-mcpagent`
- **Color**: `#6C757D` (neutral gray) or `#5C7CFA` (Mantine blue)
- **Visual Elements**: Robot/bot icon (from Tabler icons or simplified)
- **Dimensions**: 80x80px default
- **Key Features**: Abstract bot representation, head with antenna or similar

### AI Shape
- **ID**: `tech-ai`
- **Color**: `#7950F2` (purple) or gradient
- **Visual Elements**: Brain/circuit/neural network icon
- **Dimensions**: 80x80px default
- **Key Features**: Connected nodes or brain outline, futuristic appearance

---

## Type System Updates

### New Type Export
```typescript
// In apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
export interface TechStackShapeDefinition {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  render: (g: d3.Selection<SVGGElement, unknown, null, undefined>, width: number, height: number) => void;
}
```

### Updated Union Type
```typescript
// In apps/web/utils/shape-libraries/index.ts
export type ArchitectureShapeDefinition = 
  | ShapeDefinition 
  | AWSShapeDefinition
  | AzureShapeDefinition
  | GCPShapeDefinition
  | KubernetesShapeDefinition
  | TechStackShapeDefinition; // NEW
```

### Updated Architecture Type
```typescript
// In apps/web/utils/shape-libraries/index.ts
export type ArchitectureType = 'AWS' | 'Azure' | 'GCP' | 'Kubernetes' | 'Generic' | 'TechStack'; // NEW
```

---

## Data Flow

1. **Shape Registration**: `techStackD3Shapes` exported from `tech-stack-d3-shapes.ts`
2. **Registry Import**: `index.ts` imports and adds to `ARCHITECTURE_LIBRARIES`
3. **Architecture Selection**: UI dropdown populated by `getAvailableArchitectures()` includes "TechStack"
4. **Shape Loading**: When "TechStack" selected, `getArchitectureShapes('TechStack')` returns array of 7 shapes
5. **Shape Rendering**: Canvas system calls `shape.render(g, width, height)` for each shape placed on canvas
6. **Persistence**: Canvas saves shape references (id, position, size) to database/storage
7. **Reload**: On diagram load, shape registry resolves IDs back to shape definitions for rendering

---

## Validation Rules

**Shape ID Uniqueness**: All shape IDs must be unique across all architecture libraries. Prefix `tech-` ensures no collisions.

**Color Contrast**: All shapes must have stroke or multi-tone rendering to meet WCAG AA contrast requirements (3:1 for graphics).

**Performance**: Each render function must execute in <50ms. Use optimized SVG path strings, minimize DOM operations.

**Scalability**: Shapes must render correctly from 50% to 200% of default size without distortion. Use relative positioning (percentages of width/height).

**Type Safety**: All shape definitions must conform to TechStackShapeDefinition interface. TypeScript compiler enforces this.
