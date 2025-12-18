# Implementation Plan: Tech Stack Shape Library

**Branch**: `001-tech-stack-shapes` | **Date**: 2025-12-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tech-stack-shapes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add 7 new SVG shapes (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI) to the existing shape library system following the established D3.js pattern (kubernetes-d3-shapes.ts). Register these as a new top-level "Tech Stack" architecture type in the multi-select Architecture Type dropdown, enabling instructors to mix Tech Stack shapes with AWS, Azure, Kubernetes, and GCP shapes in the same diagram. Shapes will be brand-accurate, scalable SVG paths that integrate seamlessly with the existing diagram canvas.

## Technical Context

**Language/Version**: TypeScript 5.8.2, Node.js >=18  
**Primary Dependencies**: D3.js (for SVG rendering), React 19, Next.js 16, Mantine UI  
**Storage**: MongoDB (Lab masterGraph JSON field stores diagram state)  
**Testing**: NEEDS CLARIFICATION (existing test framework not identified in codebase)  
**Target Platform**: Web browser (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (monorepo with apps/web)  
**Performance Goals**: <2s diagram load time for 50 shapes, <100ms shape render time, 60fps canvas interactions  
**Constraints**: Brand-accurate colors (WCAG AA contrast), SVG scalability 50-200% without pixelation, unique shape IDs to avoid collisions  
**Scale/Scope**: 7 new shapes (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI), multi-select dropdown for architecture types, mixed-architecture diagrams (Tech Stack + AWS + Kubernetes)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (No constitution file exists yet - project is establishing patterns)

**Analysis**:
- Constitution template file exists but has not been customized for this project
- No specific constraints or gates defined
- This feature follows existing architectural patterns (kubernetes-d3-shapes.ts, azure-d3-shapes.ts precedent)
- No complexity violations detected: adding shapes to an established system following proven patterns

**Re-evaluation after Phase 1**: ✅ PASSED
- Design adheres to existing codebase conventions (ShapeDefinition interface, ARCHITECTURE_LIBRARIES registry pattern, D3.js rendering approach)
- Multi-select architecture dropdown follows Mantine UI patterns already in codebase
- Backward compatibility maintained with union type `string | string[]` approach
- No architectural deviations or complexity introduced

## Project Structure

### Documentation (this feature)

```text
specs/001-tech-stack-shapes/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/
├── utils/
│   └── shape-libraries/
│       ├── tech-stack-d3-shapes.ts       # NEW: 7 tech stack shapes
│       └── index.ts                      # MODIFIED: Add TechStack to ARCHITECTURE_LIBRARIES
├── components/
│   ├── Lab/
│   │   └── LabForm.tsx                   # MODIFIED: Multi-select dropdown support
│   └── architecture-lab/
│       ├── DiagramEditor.tsx             # MODIFIED: Handle multiple architecture types
│       └── ShapePreview.tsx              # May need updates for multi-arch rendering
├── types/
│   └── lab.ts                            # MODIFIED: architectureType field (string → string[])
└── app/
    └── api/
        └── lab/
            └── [...routes...]            # MODIFIED: Handle array architectureType

tests/
└── shape-libraries/
    └── tech-stack-shapes.test.ts         # NEW: Shape rendering tests
```

**Structure Decision**: Web application monorepo. The feature extends the existing shape library system under `apps/web/utils/shape-libraries/`. Multi-select dropdown requires updates to the Lab type definition, LabForm component, DiagramEditor, and backend API routes to handle arrays of architecture types instead of single values. No new directories needed - all changes extend existing modules following established patterns.

## Complexity Tracking

> **No violations** - This section is intentionally empty.

This feature extends the existing shape library system following established patterns (kubernetes-d3-shapes.ts, azure-d3-shapes.ts, etc.). No architectural complexity or deviations from existing conventions are introduced. All changes are additive or follow existing refactor patterns (single → multi-select dropdown).
