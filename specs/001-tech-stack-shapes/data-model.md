# Data Model: Tech Stack Shape Library

**Feature**: 001-tech-stack-shapes  
**Date**: 2025-12-18  
**Phase**: 1 - Design & Contracts

---

## Entity: ShapeDefinition

**Purpose**: Defines the structure and rendering logic for a single technology shape in the D3.js-based diagram system.

**Interface** (TypeScript):
```typescript
interface TechStackShapeDefinition {
  id: string;          // Unique identifier (e.g., 'tech-react')
  name: string;        // Display name (e.g., 'React')
  type: string;        // Lookup key (e.g., 'react')
  width: number;       // Default width in pixels (typically 80)
  height: number;      // Default height in pixels (typically 80)
  render: (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => void;           // D3.js rendering function
}
```

**Validation Rules**:
- `id` must be unique across all shape libraries with `tech-` prefix pattern
- `name` must be non-empty string (1-50 characters)
- `type` must be lowercase alphanumeric with hyphens
- `width` and `height` must be positive integers (10-500 pixels)

---

## Entity: Lab (Modified)

**Purpose**: Represents a lab assignment with diagram configuration, now supporting multiple architecture types.

**Schema Changes** (TypeScript):
```typescript
interface Lab {
  // ... existing fields
  
  // NEW: Multi-select architecture types field
  architectureTypes?: string[];  // ['TechStack', 'AWS', 'Kubernetes']
  
  // DEPRECATED: Old single architecture type field (keep for backward compat)
  architectureConfig?: {
    type?: string;
    diagram?: string;
  };
  
  masterGraph?: any;  // JSON structure containing nodes, edges, positions
}
```

**Validation Rules**:
- `architectureTypes` must be array of valid architecture type strings
- Valid values: `['AWS', 'Azure', 'GCP', 'Kubernetes', 'TechStack', 'Generic']`
- Maximum 10 architecture types per lab

---

## Shape Inventory (Tech Stack Library)

| Shape ID | Name | Type Key | Brand Color | Default Size |
|----------|------|----------|-------------|--------------|
| `tech-react` | React | `react` | `#61DAFB` | 80x80 |
| `tech-nextjs` | Next.js | `nextjs` | `#000000` | 80x80 |
| `tech-nodejs` | Node.js | `nodejs` | `#339933` | 80x80 |
| `tech-docker` | Docker | `docker` | `#2496ED` | 100x80 |
| `tech-mongodb` | MongoDB | `mongodb` | `#00684A` | 80x80 |
| `tech-mcp-agent` | MCP Agent | `mcp-agent` | `#6366F1` | 80x80 |
| `tech-ai` | AI | `ai` | `#7C3AED` | 80x80 |
