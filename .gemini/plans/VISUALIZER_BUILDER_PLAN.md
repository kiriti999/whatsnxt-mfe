# 🎨 Visualizer Builder — Implementation Plan

> **Goal:** Add an AI-powered "Visualizer Builder" to the `/form` page that lets users describe a concept in natural language and have AI generate beautiful, exportable architectural diagrams.

---

## 📋 Table of Contents

1. [Overview & Vision](#1-overview--vision)
2. [Diagram Types](#2-diagram-types)
3. [User Flow](#3-user-flow)
4. [Architecture](#4-architecture)
5. [Frontend (MFE) Changes](#5-frontend-mfe-changes)
6. [Backend (BFF) Changes](#6-backend-bff-changes)
7. [AI Prompt Engineering](#7-ai-prompt-engineering)
8. [Export System](#8-export-system)
9. [Phased Delivery](#9-phased-delivery)
10. [File-Level Breakdown](#10-file-level-breakdown)

---

## 1. Overview & Vision

The Visualizer Builder allows users to:
- Select a **diagram type** from a curated set of architectural diagram categories
- Provide a **natural language prompt** describing what they want to visualize
- AI generates a **structured diagram definition** (nodes, edges, labels, colors)
- The diagram is rendered interactively on a **canvas**
- Users can **export** the result as SVG, PNG, or GIF

### Key Design Principles
- **AI-First**: The user describes what they want; AI figures out the layout
- **Editable**: Users can tweak the generated diagram before exporting
- **Beautiful**: Diagrams should look like the reference images (colorful cards, clean layouts, architectural icons)
- **Exportable**: High-quality image exports in multiple formats

---

## 2. Diagram Types

### Core Types (Phase 1)

| # | Type | Description | Example (from reference images) |
|---|------|-------------|---------------------------------|
| 1 | **Step Content Diagram** | Sequential steps with descriptions, numbered cards | "10 Coding Best Practices" (checkmark/cross cards) |
| 2 | **Flow Diagram** | Directional flow with nodes and arrows | "Load Balancing types" (Round Robin, Least Connections, etc.) |
| 3 | **Architecture Diagram** | System components with connections | Kubernetes concepts (Pods, ReplicaSets, Deployments) |
| 4 | **Comparison Grid** | Side-by-side or grid comparison of concepts | "Stateful vs Stateless Applications" |
| 5 | **Concept Explainer** | Central concept with supporting sub-concepts | "What is Idempotency?" with strategy cards |
| 6 | **Pattern Catalog** | Grid of related patterns with icons and descriptions | "System Design Patterns" (12 patterns grid) |

### Additional Types (Phase 2)

| # | Type | Description |
|---|------|-------------|
| 7 | **Sequence Diagram** | Timeline-based interactions between actors (Client → Server → DB) |
| 8 | **Mind Map** | Radial/tree structure for brainstorming topics |
| 9 | **Timeline** | Chronological events along a horizontal/vertical axis |
| 10 | **Data Flow Diagram** | How data moves through a system (ETL, pipelines) |
| 11 | **Entity Relationship Diagram** | Database schema visualization |
| 12 | **Network Topology** | Infrastructure/network layout |

---

## 3. User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     /form page                               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ Blog Post│ │ Tutorial │ │  Structured  │ │ Visualizer │ │
│  │          │ │          │ │  Tutorial    │ │  Builder 🎨│ │
│  └──────────┘ └──────────┘ └──────────────┘ └─────┬──────┘ │
└───────────────────────────────────────────────────┬─────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                /form/visualizer                              │
│                                                              │
│  Step 1: Choose Diagram Type                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Step Content │ │ Flow Diagram │ │ Architecture │        │
│  │    Diagram   │ │              │ │   Diagram    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ Comparison   │ │   Concept    │ │   Pattern    │        │
│  │    Grid      │ │  Explainer   │ │   Catalog    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────┬──────────────────────────────────────┘
                       │ Select type
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Describe Your Visual                                │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Prompt: "Create a diagram showing 8 types of load    │ │
│  │  balancing strategies: Round Robin, Least Connections, │ │
│  │  Weighted Round Robin, ..."                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Optional] Additional context:                              │
│  - Color theme: Blue / Dark / Pastel / Custom               │
│  - Layout: Grid / Vertical / Horizontal                     │
│  - Style: Minimal / Detailed / Infographic                  │
│                                                              │
│  [ Generate Diagram ✨ ]                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ AI generates
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Preview & Edit                                      │
│                                                              │
│  ┌─────────────────────────────────────────────────┐        │
│  │                                                 │        │
│  │           [Live Diagram Canvas]                  │        │
│  │         (SVG rendered with D3.js)               │        │
│  │                                                 │        │
│  └─────────────────────────────────────────────────┘        │
│                                                              │
│  Toolbar: [Zoom+] [Zoom-] [Reset] [Undo] [Redo]            │
│                                                              │
│  Edit Panel:                                                 │
│  - Edit node labels                                          │
│  - Change colors                                             │
│  - Add/remove nodes                                          │
│  - Regenerate ↻                                              │
│                                                              │
│  [ Export as SVG ] [ Export as PNG ] [ Export as GIF ]       │
│  [ Save to History ]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (MFE)                         │
│                                                          │
│  ContentTypeForm ──→ VisualizerBuilder page              │
│                      │                                   │
│                      ├── DiagramTypePicker                │
│                      ├── PromptInput + Options            │
│                      ├── DiagramCanvas (D3.js / SVG)     │
│                      ├── EditPanel (sidebar)              │
│                      └── ExportToolbar                    │
│                                                          │
│  APIs: visualizerApi.ts ───────────────────────────────► │
└──────────────────────────────┬───────────────────────────┘
                               │ HTTP
                               ▼
┌──────────────────────────────────────────────────────────┐
│                    Backend (BFF)                          │
│                                                          │
│  Routes: visualizer.routes.ts                            │
│  Controller: visualizerController.ts                     │
│  Service: visualizerService.ts                           │
│     │                                                    │
│     ├── Uses: aiService.ts (OpenAI / Anthropic / Gemini) │
│     ├── Prompt templates per diagram type                 │
│     └── Structured output parsing (JSON schema)          │
│                                                          │
│  Model: visualizerSchema.ts (save/history)               │
│  Export: visualizerExportService.ts (SVG→PNG, SVG→GIF)   │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack Choices

| Layer | Technology | Reason |
|-------|-----------|--------|
| Diagram Rendering | **D3.js** (already installed) | Full control over SVG output, project already uses it for DiagramEditor |
| AI Generation | **Existing aiService** (OpenAI/Anthropic/Gemini) | Already integrated with user configs, API key management |
| SVG Export | **Native SVG serialization** | SVG is generated directly, trivial to export |
| PNG Export | **html-to-image** or **canvas API** | Convert SVG to canvas, then to PNG blob |
| GIF Export | **gif.js** (optional, Phase 2) | Frame-by-frame capture for animated diagrams |
| UI Framework | **Mantine** (already used) | Consistent with existing app design |
| State Management | **React state + context** | Simple enough; no Redux needed |

---

## 5. Frontend (MFE) Changes

### 5.1 Add Visualizer Card to `/form` page

**File:** `apps/web/components/Blog/ContentTypeForm/index.tsx`

Add a 4th card to the `contentTypes` array:

```typescript
{
    href: '/form/visualizer',
    icon: IconPalette, // or IconChartDots3
    title: 'Visualizer Builder',
    description: 'Create stunning architectural diagrams with AI assistance',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    color: '#fa709a'
}
```

Grid changes from `cols={{ base: 1, sm: 2, md: 3 }}` to `cols={{ base: 1, sm: 2, md: 4 }}` (or keep 2-per-row on md for better readability).

### 5.2 New Page Route

**File:** `apps/web/app/form/visualizer/page.tsx`

```typescript
import { VisualizerBuilder } from '../../../components/Visualizer/VisualizerBuilder';

export default function VisualizerPage() {
    return <VisualizerBuilder />;
}
```

### 5.3 New Components

| Component | File | Purpose |
|-----------|------|---------|
| `VisualizerBuilder` | `components/Visualizer/VisualizerBuilder.tsx` | Main orchestrator (state machine: type→prompt→preview) |
| `DiagramTypePicker` | `components/Visualizer/DiagramTypePicker.tsx` | Grid of diagram type cards with icons & previews |
| `PromptInput` | `components/Visualizer/PromptInput.tsx` | Textarea + options (theme, layout, style) |
| `DiagramCanvas` | `components/Visualizer/DiagramCanvas.tsx` | D3.js SVG rendering engine |
| `DiagramEditPanel` | `components/Visualizer/DiagramEditPanel.tsx` | Right sidebar for tweaking nodes, colors, labels |
| `ExportToolbar` | `components/Visualizer/ExportToolbar.tsx` | Export buttons (SVG, PNG, GIF) + save to history |
| `DiagramRenderer` | `components/Visualizer/renderers/index.ts` | Registry of renderers per diagram type |
| `StepContentRenderer` | `components/Visualizer/renderers/StepContentRenderer.tsx` | Renders numbered step cards |
| `FlowDiagramRenderer` | `components/Visualizer/renderers/FlowDiagramRenderer.tsx` | Renders flow charts with arrows |
| `ArchitectureRenderer` | `components/Visualizer/renderers/ArchitectureRenderer.tsx` | Renders system architecture diagrams |
| `ComparisonGridRenderer` | `components/Visualizer/renderers/ComparisonGridRenderer.tsx` | Renders comparison tables/grids |
| `ConceptExplainerRenderer` | `components/Visualizer/renderers/ConceptExplainerRenderer.tsx` | Renders concept breakdown diagrams |
| `PatternCatalogRenderer` | `components/Visualizer/renderers/PatternCatalogRenderer.tsx` | Renders grid of pattern cards |

### 5.4 New API Client

**File:** `apps/web/apis/v1/visualizer/index.ts`

```typescript
const visualizerApi = {
    generateDiagram: (payload: GenerateDiagramPayload) =>
        http.post('/api/v1/visualizer/generate', payload),
    
    saveDiagram: (payload: SaveDiagramPayload) =>
        http.post('/api/v1/visualizer/save', payload),
    
    getUserDiagrams: () =>
        http.get('/api/v1/visualizer/list'),
    
    getDiagram: (id: string) =>
        http.get(`/api/v1/visualizer/${id}`),
    
    deleteDiagram: (id: string) =>
        http.delete(`/api/v1/visualizer/${id}`),
    
    exportDiagram: (id: string, format: 'svg' | 'png' | 'gif') =>
        http.get(`/api/v1/visualizer/${id}/export/${format}`, { responseType: 'blob' }),
};
```

---

## 6. Backend (BFF) Changes

### 6.1 New Files

| File | Purpose |
|------|---------|
| `app/models/visualizerSchema.ts` | Mongoose schema for saved diagrams |
| `app/services/visualizerService.ts` | Core business logic: AI prompt → structured JSON → validation |
| `app/services/visualizerExportService.ts` | Server-side SVG → PNG conversion (using sharp or puppeteer) |
| `app/controllers/visualizerController.ts` | Request handling, validation, response formatting |
| `app/routes/visualizer.routes.ts` | Express routes for visualizer endpoints |
| `app/utils/visualizerPrompts.ts` | Prompt templates per diagram type |

### 6.2 Data Model

**File:** `app/models/visualizerSchema.ts`

```typescript
const VisualizerSchema = new Schema({
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title:          { type: String, required: true },
    diagramType:    { type: String, enum: [
        'step-content', 'flow-diagram', 'architecture',
        'comparison-grid', 'concept-explainer', 'pattern-catalog',
        'sequence-diagram', 'mind-map', 'timeline',
        'data-flow', 'er-diagram', 'network-topology'
    ], required: true },
    prompt:         { type: String, required: true },
    options: {
        theme:      { type: String, default: 'default' },
        layout:     { type: String, default: 'auto' },
        style:      { type: String, default: 'detailed' },
    },
    diagramData:    { type: Schema.Types.Mixed, required: true }, // The structured JSON
    svgContent:     { type: String },     // Cached SVG string
    thumbnailUrl:   { type: String },     // Thumbnail for listing
    published:      { type: Boolean, default: false },
    aiModel:        { type: String },     // Which AI model was used
}, { timestamps: true });
```

### 6.3 AI-Generated Diagram Data Schema

The AI will return a structured JSON that the frontend renderers consume:

```typescript
// Common base for all diagram types
interface DiagramData {
    title: string;
    subtitle?: string;
    backgroundColor: string;
    nodes: DiagramNode[];
    edges?: DiagramEdge[];
    layout: 'grid' | 'horizontal' | 'vertical' | 'radial' | 'free';
    gridColumns?: number;
}

interface DiagramNode {
    id: string;
    label: string;
    description?: string;
    type: 'card' | 'icon' | 'box' | 'circle' | 'diamond' | 'actor';
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    style: {
        backgroundColor: string;
        borderColor: string;
        textColor: string;
        fontSize?: number;
        borderRadius?: number;
        gradient?: string;
    };
    icon?: string;           // Icon identifier
    badge?: string;          // e.g., "✓" or "✗" or a number
    badgeColor?: string;
    children?: DiagramNode[]; // For hierarchical diagrams
    metadata?: Record<string, any>; // Extra info per node
}

interface DiagramEdge {
    id: string;
    source: string;          // Node ID
    target: string;          // Node ID
    label?: string;
    style: {
        strokeColor: string;
        strokeWidth: number;
        strokeDash?: string;
        arrowHead: boolean;
    };
}
```

### 6.4 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/visualizer/generate` | Generate diagram from prompt (AI call) |
| `POST` | `/api/v1/visualizer/save` | Save diagram to user's history |
| `GET` | `/api/v1/visualizer/list` | Get user's saved diagrams |
| `GET` | `/api/v1/visualizer/:id` | Get single diagram |
| `PUT` | `/api/v1/visualizer/:id` | Update diagram (after edits) |
| `DELETE` | `/api/v1/visualizer/:id` | Delete diagram |
| `GET` | `/api/v1/visualizer/:id/export/:format` | Export as SVG/PNG |
| `POST` | `/api/v1/visualizer/regenerate` | Regenerate with modified prompt |

---

## 7. AI Prompt Engineering

### Per-Diagram-Type Prompt Templates

Each diagram type has a specialized system prompt that instructs the AI to generate the correct JSON structure.

**Example: Step Content Diagram Prompt**

```
You are an expert infographic designer. Given a topic, generate a structured JSON
representing a "Step Content Diagram" — a grid of numbered cards, each with a title,
description, and visual indicator (checkmark/cross/icon).

Requirements:
- Generate {n} cards arranged in a {columns}x{rows} grid
- Each card must have: id, label (title), description, badge (✓, ✗, or number),
  and style (backgroundColor, textColor, borderColor)
- Use a cohesive color palette based on the theme: {theme}
- Descriptions should be concise (max 2 sentences)
- Return ONLY valid JSON matching this schema: {schema}

Topic: {user_prompt}
```

**Example: Flow Diagram Prompt**

```
You are an expert system design visualizer. Given a description, generate a structured
JSON for a "Flow Diagram" showing directional flow between components.

Requirements:
- Identify all entities/actors and create nodes for them
- Create edges showing the direction of data/request flow
- Include labels on edges describing what flows between nodes
- Position nodes logically (left-to-right or top-to-bottom)
- Use icons where appropriate: server, database, user, load-balancer, etc.
- Use the color theme: {theme}
- Return ONLY valid JSON matching this schema: {schema}

Description: {user_prompt}
```

### AI Response Validation

The service will:
1. Parse the AI response as JSON
2. Validate against the `DiagramData` schema (using Zod or joi)
3. Auto-fix common issues (missing positions → auto-layout, missing colors → defaults)
4. Return structured errors if the response is malformed, with retry logic

---

## 8. Export System

### SVG Export
- Direct: The canvas renders SVG natively, serialize with `XMLSerializer`
- Add metadata (title, author, date) to SVG comments

### PNG Export
- Use `html-to-image` library (already proven approach)
- Or use Canvas API: draw SVG onto `<canvas>`, call `toBlob('image/png')`
- Support resolution options: 1x, 2x, 4x

### GIF Export (Phase 2 — for animated diagrams)
- Use `gif.js` or `modern-gif` library
- Capture frame-by-frame as nodes animate in
- Useful for "step-by-step reveal" animations

### Server-Side Export (optional)
- For high-quality exports, use `sharp` (SVG→PNG) on the server
- Useful for generating thumbnails for saved diagrams

---

## 9. Phased Delivery

### Phase 1: Foundation (MVP) 🎯
**Estimated effort: ~3-4 days**

- [x] Create implementation plan (this document)
- [ ] Add "Visualizer Builder" card to `/form` page
- [ ] Create `/form/visualizer` page with DiagramTypePicker
- [ ] Implement **Step Content Diagram** type (end-to-end)
  - PromptInput component
  - BFF: visualizer generate endpoint (uses existing aiService)
  - Prompt template for step-content type
  - StepContentRenderer (D3.js SVG)
  - SVG + PNG export
- [ ] Implement **Flow Diagram** type (end-to-end)
  - FlowDiagramRenderer
  - Prompt template for flow diagrams

### Phase 2: More Diagram Types ✅
**Estimated effort: ~3-4 days**

- [x] Architecture Diagram renderer + prompt
- [x] Comparison Grid renderer + prompt
- [x] Concept Explainer renderer + prompt
- [x] Pattern Catalog renderer + prompt

### Phase 3: Edit & Polish ✅
**Estimated effort: ~2-3 days**

- [x] DiagramEditPanel (edit labels, colors, add/remove nodes)
- [x] Undo/Redo for edits
- [x] Zoom & pan controls
- [x] Save to history (MongoDB model + CRUD)
- [x] User's diagram gallery view

### Phase 4: Advanced Features
**Estimated effort: ~3-4 days**

- [ ] Sequence Diagram, Mind Map, Timeline types
- [ ] GIF export (animated reveal)
- [ ] Template library (pre-made diagram templates)
- [ ] Share/embed diagrams
- [ ] Server-side PNG generation (for thumbnails)

---

## 10. File-Level Breakdown

### Frontend (whatsnxt-mfe)

```
apps/web/
├── app/form/
│   └── visualizer/
│       └── page.tsx                              ← NEW page route
│
├── apis/v1/
│   └── visualizer/
│       └── index.ts                              ← NEW API client
│
├── components/
│   ├── Blog/ContentTypeForm/
│   │   └── index.tsx                             ← MODIFY (add 4th card)
│   │
│   └── Visualizer/                               ← NEW directory
│       ├── VisualizerBuilder.tsx                  ← Main orchestrator
│       ├── DiagramTypePicker.tsx                  ← Type selection grid
│       ├── PromptInput.tsx                        ← AI prompt input + options
│       ├── DiagramCanvas.tsx                      ← D3.js SVG canvas wrapper
│       ├── DiagramEditPanel.tsx                   ← Node/edge editor sidebar
│       ├── ExportToolbar.tsx                      ← Export buttons
│       ├── visualizer.module.css                  ← Styles
│       ├── types.ts                               ← TypeScript interfaces
│       └── renderers/
│           ├── index.ts                           ← Renderer registry
│           ├── StepContentRenderer.tsx            ← Numbered step cards
│           ├── FlowDiagramRenderer.tsx            ← Flow chart with arrows
│           ├── ArchitectureRenderer.tsx           ← System architecture
│           ├── ComparisonGridRenderer.tsx          ← Side-by-side comparison
│           ├── ConceptExplainerRenderer.tsx        ← Concept breakdown
│           └── PatternCatalogRenderer.tsx          ← Pattern grid
│
└── types/
    └── visualizer.ts                              ← Shared type definitions
```

### Backend (whatsnxt-bff)

```
app/
├── models/
│   └── visualizerSchema.ts                       ← NEW Mongoose model
│
├── services/
│   ├── visualizerService.ts                      ← NEW core service
│   └── visualizerExportService.ts                ← NEW export utilities
│
├── controllers/
│   └── visualizerController.ts                   ← NEW controller
│
├── routes/
│   └── visualizer.routes.ts                      ← NEW routes
│
└── utils/
    └── visualizerPrompts.ts                      ← NEW prompt templates
```

---

## 11. Key Decisions & Tradeoffs

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering engine | D3.js (not Mermaid, not Excalidraw) | Already installed, full SVG control, matches existing DiagramEditor pattern |
| AI output format | Structured JSON (not SVG directly) | Enables editing, re-rendering, and format-agnostic export |
| Client vs server rendering | Client-side D3 | Instant preview, no server roundtrip for re-renders |
| Export method | Client-side SVG serialization + canvas for PNG | Faster, no server dependency for basic exports |
| State management | React useState + useReducer | Feature is self-contained, no global state needed |

---

## 12. Dependencies to Install

### Frontend
- `html-to-image` — for PNG export from SVG (if not already present)
- No other new dependencies needed (D3, Mantine, Tabler Icons all present)

### Backend  
- `zod` — for AI response validation (if not already present)
- `sharp` — for server-side PNG generation (optional, Phase 4)

---

## 13. Questions/Decisions for Discussion

1. **Grid layout on `/form`**: With 4 cards, should we keep `md: 3` (3 columns) or switch to `md: 4` (or `md: 2` for 2×2)? go with 2x2
2. **Save & history**: Should visualizer diagrams appear in the existing History table alongside blogs/tutorials, or have their own section? lets add a table in history page to see to diagrams list
3. **AI model default**: Use the same user-configured AI settings, or default to a specific model for diagram generation? Use the same user-configured AI settings
4. **Authentication**: The `/form` page already requires auth — should we keep that for visualizer too? (Assumed yes) Yes
5. **Theme presets**: How many color theme presets should we offer? (Proposed: Default Blue, Dark Mode, Pastel, Vibrant, Monochrome) 5-8
