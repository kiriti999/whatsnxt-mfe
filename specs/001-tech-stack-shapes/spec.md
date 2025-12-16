# Feature Specification: Tech Stack Shape Library

**Feature Branch**: `001-tech-stack-shapes`  
**Created**: 2025-12-16  
**Status**: Draft  
**Input**: User description: "Add new SVG shapes to the shape library system similar to kubernetes-d3-shapes.ts for Next.js, Docker, React, Node.js, MongoDB, MCP agent, and AI"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Core Tech Stack Shapes (Priority: P1)

An instructor creating a modern full-stack web application architecture lab needs to use common technology shapes (Next.js, React, Node.js, Docker, MongoDB) in the diagram canvas to represent their application stack. They can select these shapes from the shape library and drag them onto the canvas to build diagrams showing how different technologies connect.

**Why this priority**: These 5 technologies (Next.js, React, Node.js, Docker, MongoDB) represent the most commonly used modern web development stack and provide immediate value. The system already supports AWS, Azure, Kubernetes, and GCP shapes, so tech stack shapes fill a critical gap for application architecture diagrams.

**Independent Test**: Can be fully tested by creating a new lab with a custom "Tech Stack" architecture type, verifying all 5 shapes appear in the shape library panel, and dragging each shape onto the canvas. Delivers value by enabling instructors to create modern web application architecture diagrams.

**Acceptance Scenarios**:

1. **Given** an instructor is creating a lab diagram, **When** they select "Tech Stack" from the architecture type dropdown, **Then** they see shapes for Next.js, React, Node.js, Docker, and MongoDB in the shape library panel
2. **Given** the Tech Stack architecture is selected, **When** the instructor drags a Next.js shape onto the canvas, **Then** the shape renders with proper styling consistent with the Next.js brand (black/white color scheme)
3. **Given** shapes are on the canvas, **When** the instructor connects a React shape to a Node.js shape with an arrow, **Then** the connection clearly shows the frontend-backend relationship
4. **Given** a Docker shape is placed on the canvas, **When** the instructor resizes it to contain other shapes, **Then** the Docker container shape expands to show it contains the wrapped applications
5. **Given** a diagram is saved with Tech Stack shapes, **When** the lab is loaded again or viewed by students, **Then** all shapes render correctly with their original positions and connections

---

### User Story 2 - AI & Agent Shapes (Priority: P2)

An instructor designing an AI-powered application architecture needs to represent AI services and MCP (Model Context Protocol) agents in their diagram. They can use AI and MCP agent shapes to show how AI components interact with traditional application services.

**Why this priority**: AI and MCP agents are increasingly important in modern applications but less universally needed than the core web stack. This enables cutting-edge architecture diagrams for AI/ML courses.

**Independent Test**: Can be fully tested by adding AI and MCP agent shapes to the existing Tech Stack library, verifying they appear alongside other shapes, and confirming they can be used to diagram AI workflows (e.g., User → React → Node.js → MCP Agent → AI Service).

**Acceptance Scenarios**:

1. **Given** an instructor is creating an AI application lab, **When** they select "Tech Stack" architecture type, **Then** they see AI and MCP agent shapes available in addition to the core tech shapes
2. **Given** an MCP agent shape is on the canvas, **When** the instructor styles it or adds labels, **Then** the shape clearly represents an agent/bot with appropriate iconography (e.g., robot or assistant symbol)
3. **Given** an AI shape is connected to backend services, **When** the diagram is rendered, **Then** the relationship between traditional services and AI services is visually clear
4. **Given** multiple MCP agent shapes are used, **When** they are positioned in a workflow, **Then** instructors can show agent orchestration patterns (e.g., agent chains, multi-agent systems)

---

### User Story 3 - Shape Consistency and Brand Accuracy (Priority: P3)

Instructors and students viewing diagrams expect shapes to match the official branding and visual style of each technology (e.g., React's blue atom logo, MongoDB's green leaf, Docker's blue whale). The system should render shapes that are professionally styled and immediately recognizable.

**Why this priority**: While functional shapes work, brand-accurate shapes improve learning by matching what students see in official documentation. This is important for polish but not blocking for core functionality.

**Independent Test**: Can be tested by comparing rendered shapes against official logos from each technology's brand guidelines (Next.js, React, Node.js, Docker, MongoDB, AI icons). Success means shapes are recognizable and color-accurate.

**Acceptance Scenarios**:

1. **Given** a React shape is rendered, **When** an instructor views it on the canvas, **Then** it displays the React atom logo in #61DAFB (React blue) color
2. **Given** a Next.js shape is rendered, **When** viewed, **Then** it shows the Next.js logo with proper black/white coloring and geometric design
3. **Given** a MongoDB shape is rendered, **When** viewed, **Then** it displays the MongoDB leaf logo in #00684A (MongoDB green)
4. **Given** a Docker shape is rendered, **When** viewed, **Then** it shows the Docker whale with containers in #2496ED (Docker blue)
5. **Given** a Node.js shape is rendered, **When** viewed, **Then** it displays the Node.js hexagon in #339933 (Node.js green)
6. **Given** all shapes are placed on a canvas, **When** zoomed or resized, **Then** SVG paths scale cleanly without pixelation or distortion

---

### Edge Cases

- What happens when an instructor selects "Tech Stack" but the shape library fails to load (e.g., network error, missing shape definition)? System should show a clear error message and fallback to generic shapes or previous architecture type.
- How does the system handle very large Docker container shapes that need to wrap multiple inner shapes? Container should auto-resize or provide manual resize handles.
- What if a technology doesn't have official brand guidelines (e.g., "MCP agent" is abstract)? Use a generic agent/bot icon with neutral colors that fit the overall design system.
- How are shapes positioned when first dragged to canvas? Should snap to grid or place at exact cursor position? Follow existing shape library behavior for consistency.
- What happens if two shapes have overlapping names or IDs? System should enforce unique IDs (e.g., 'tech-react', 'tech-nodejs') to avoid collisions with existing shape libraries.
- How does the system handle color contrast for accessibility? All shapes should have sufficient contrast between foreground and background colors (WCAG AA standard minimum).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide SVG shape definitions for Next.js, Docker, React, Node.js, MongoDB, MCP agent, and AI technologies
- **FR-002**: System MUST render each shape using D3.js following the same pattern as kubernetes-d3-shapes.ts (ShapeDefinition interface with id, name, type, width, height, and render function)
- **FR-003**: System MUST register all tech stack shapes in a centralized shape library registry accessible via `getAvailableArchitectures()` or similar function
- **FR-004**: System MUST display tech stack shapes in the shape library panel when "Tech Stack" (or appropriate category name) architecture type is selected
- **FR-005**: Users MUST be able to drag tech stack shapes from the shape library onto the diagram canvas
- **FR-006**: System MUST render shapes with brand-accurate colors matching official technology logos (React blue #61DAFB, MongoDB green #00684A, Docker blue #2496ED, Node.js green #339933, Next.js black/white)
- **FR-007**: System MUST support shape resizing while maintaining aspect ratio and SVG path integrity (no pixelation)
- **FR-008**: System MUST allow shapes to be connected with arrows/lines to show relationships between technologies
- **FR-009**: System MUST persist shape positions, sizes, and connections when diagrams are saved and reloaded
- **FR-010**: System MUST provide unique shape IDs prefixed with category to avoid collisions (e.g., 'tech-react', 'tech-nodejs', 'tech-docker')
- **FR-011**: System MUST follow the existing shape library file structure pattern (apps/web/utils/shape-libraries/[category]-d3-shapes.ts)
- **FR-012**: System MUST support both light and dark canvas backgrounds with sufficient color contrast (WCAG AA minimum)
- **FR-013**: System MUST allow Docker container shapes to be resized larger to visually contain other shapes representing containerized apps
- **FR-014**: System MUST display shape tooltips showing the technology name when users hover over shapes in the library panel or on the canvas

### Key Entities *(include if feature involves data)*

- **Tech Stack Shape Definition**: Represents a single technology shape with properties:
  - `id` (string): Unique identifier (e.g., 'tech-react')
  - `name` (string): Display name (e.g., 'React')
  - `type` (string): Lookup key (e.g., 'react')
  - `width` (number): Default width in pixels (typically 80)
  - `height` (number): Default height in pixels (typically 80)
  - `render` (function): D3.js function that draws SVG paths and elements

- **Shape Library Registry Entry**: Maps architecture type to shape collection:
  - Architecture type key (e.g., 'TechStack')
  - Shape collection (Record<string, ShapeDefinition>)
  - Metadata (name, color theme, description)

- **Canvas Shape Instance**: Represents a placed shape on the diagram canvas:
  - Reference to shape definition (by ID)
  - Position (x, y coordinates)
  - Size (width, height, may differ from default)
  - Connections (array of connections to other shapes)
  - Rotation and styling properties

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Instructors can create a complete 5-tier web application architecture diagram (frontend, backend, database, containerization, framework) using only tech stack shapes in under 3 minutes
- **SC-002**: All 7 tech stack shapes (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI) render correctly on first load with no visual artifacts or missing elements
- **SC-003**: Shape colors match official brand guidelines with 95% accuracy when compared side-by-side with official logos (verified through visual inspection or color picker tools)
- **SC-004**: Students can identify each technology by its shape without reading labels with 90% accuracy (shapes are immediately recognizable)
- **SC-005**: Diagrams containing tech stack shapes load and render in under 2 seconds for diagrams with up to 50 shapes
- **SC-006**: Zero shape collision errors occur when tech stack shapes are used alongside existing AWS, Azure, Kubernetes, and GCP shapes in the same diagram
- **SC-007**: Tech stack shapes maintain visual quality (crisp edges, no pixelation) when scaled from 50% to 200% of default size
- **SC-008**: 95% of instructors successfully create their first tech stack diagram without requiring documentation or support (measured through user testing)

## Assumptions

- The existing shape library infrastructure (kubernetes-d3-shapes.ts, azure-d3-shapes.ts, etc.) provides a stable pattern that can be replicated for tech stack shapes
- SVG shape designs and brand guidelines for Next.js, React, Node.js, Docker, and MongoDB are publicly accessible and can be referenced from official sources or diagrams.net
- The diagrams.net platform uses SVG paths that can be adapted to D3.js rendering patterns
- The current diagram canvas system supports drag-and-drop, resizing, connecting, and persisting shapes without requiring infrastructure changes
- Instructors creating labs will need to represent modern web application stacks and will benefit from technology-specific shapes beyond generic rectangles/circles
- The shape registry system (ARCHITECTURE_LIBRARIES in index.ts) can be extended with a new "TechStack" category without breaking existing functionality
- Standard web browser SVG rendering is sufficient for all target shapes (no special rendering engine required)
- Users have basic familiarity with the technologies represented (shapes serve as visual aids, not educational content about the technologies themselves)

## Scope

### In Scope

- Creating 7 new SVG shape definitions (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI)
- Following the existing ShapeDefinition interface and D3.js rendering pattern
- Registering shapes in the centralized shape library registry
- Supporting drag-and-drop from shape library panel to canvas
- Ensuring brand-accurate colors for each technology
- Supporting standard shape operations (resize, move, connect, delete)
- Making shapes discoverable through architecture type dropdown
- Documentation of shape IDs, names, and visual characteristics

### Out of Scope

- Creating shapes for technologies beyond the 7 specified (e.g., Vue.js, Angular, PostgreSQL, Redis)
- Modifying the core diagram canvas rendering engine or interaction system
- Creating custom shape behaviors beyond what existing shapes support (e.g., animated shapes, interactive shapes)
- Implementing automatic layout or shape arrangement algorithms
- Creating shape templates or pre-built architecture patterns
- Adding educational content or documentation about the technologies themselves
- Supporting custom user-created shapes or shape uploads
- Mobile/touch-specific shape interactions (follows existing mobile support)
- Real-time collaborative editing of shapes
- Version control or history tracking for shape changes

## Dependencies

### Existing System Components

- **Shape Library Infrastructure**: Relies on apps/web/utils/shape-libraries/ directory structure and existing shape definition patterns
- **D3.js Library**: All shapes use D3.js for SVG rendering (current version in package.json)
- **Shape Registry**: Depends on ARCHITECTURE_LIBRARIES object and getAvailableArchitectures() function in index.ts
- **Diagram Canvas**: Requires existing canvas drag-and-drop, selection, and manipulation functionality
- **Architecture Type Dropdown**: Needs dropdown component that populates from getAvailableArchitectures()
- **Lab Creation/Edit Pages**: Shape selection appears in lab configuration pages (/lab/create, /labs/[id])

### External Resources

- **Official Logo/Brand Guidelines**: Requires access to official SVG assets or brand guidelines from:
  - Next.js: https://nextjs.org/
  - React: https://react.dev/
  - Node.js: https://nodejs.org/
  - Docker: https://www.docker.com/
  - MongoDB: https://www.mongodb.com/
- **Diagrams.net Reference**: May reference https://app.diagrams.net/ for SVG shape inspiration and design patterns
- **SVG Path Tools**: May use online tools or browser dev tools for extracting/analyzing SVG paths

### Integration Points

- **Shape Library Registry** (apps/web/utils/shape-libraries/index.ts): Must add TechStack to ARCHITECTURE_LIBRARIES and update getArchitectureMetadata()
- **Lab Architecture Type Field**: Database field that stores selected architecture type (e.g., 'AWS', 'Azure', 'TechStack')
- **Diagram Canvas Renderer**: Component that reads shape definitions and renders them on canvas using D3.js
- **Shape Library Panel UI**: Panel component that displays available shapes filtered by architecture type
