# Implementation Plan: Tech Stack Shape Library

**Branch**: `001-tech-stack-shapes` | **Date**: 2025-12-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-tech-stack-shapes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add 7 new SVG shape definitions (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI) to the shape library system following the existing kubernetes-d3-shapes.ts pattern. Shapes will use D3.js for rendering, include brand-accurate colors, and integrate with the existing shape registry to enable instructors to create modern web application architecture diagrams.

## Technical Context

**Language/Version**: TypeScript 5.8.2 + Node.js ≥18  
**Primary Dependencies**: D3.js (d3), Next.js 16.0.7, React 19.1.0, Mantine UI 8.1.2  
**Storage**: N/A (shape definitions are code-based TypeScript modules)  
**Testing**: Existing test framework (needs identification - vitest/jest)  
**Target Platform**: Web browser (Next.js web application)  
**Project Type**: Web application with monorepo structure (apps/web)  
**Performance Goals**: Shapes must render in <50ms, support canvas with 50+ shapes loading in <2s  
**Constraints**: SVG paths must scale cleanly 50%-200%, maintain WCAG AA color contrast, brand color accuracy  
**Scale/Scope**: 7 new shape definitions, 1 new shape library file, registry integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)
✅ **I. Code Quality and SOLID Principles**: Feature adds shape definitions with render functions. Each shape will be a separate object with single responsibility. Complexity will be kept under 5.

✅ **III. User Experience Consistency**: Feature uses existing Mantine UI infrastructure. No new UI components required. Shapes render within existing canvas system.

✅ **IV. Performance Requirements**: Shapes must render in <50ms, meet performance goals for 50+ shapes loading in <2s. Will use efficient D3.js SVG rendering patterns from existing shapes.

✅ **V. Monorepo Architecture**: Feature adds files to existing `apps/web/utils/shape-libraries/` following established patterns. Uses TypeScript, Next.js 16, React 19. No monorepo structure changes.

✅ **VI. API Communication Standards - D3.js Requirement**: Feature MUST use D3.js for all shape rendering (already required by constitution). Follows existing kubernetes-d3-shapes.ts pattern.

✅ **VII. Documentation Standards**: Feature includes HLD/LLD in spec.md. Shape definitions are self-documenting code following ShapeDefinition interface.

✅ **IX. Error Handling Standards**: No custom errors needed. Shape rendering uses existing error handling patterns.

✅ **X. Code Maintainability Standards**: Will use constants for colors and dimensions. May need to add shape-related constants to `@whatsnxt/constants` if not present.

✅ **XI. Real Data and API Standards**: Feature adds code-based shape definitions. No mock data or APIs involved.

**Initial Result**: ✅ ALL GATES PASSED - No violations detected. Ready for Phase 0 research.

---

### Post-Design Check (After Phase 1)

✅ **I. Code Quality and SOLID Principles**: 
- Design maintains single responsibility: one render function per shape
- Each shape is independent and self-contained
- Cyclomatic complexity <5: render functions are straightforward SVG append operations
- **VERIFIED**: Design adheres to SOLID principles

✅ **III. User Experience Consistency**: 
- No new UI components created
- Uses existing Mantine UI dropdown and shape library panel
- Follows existing interaction patterns (drag, resize, connect)
- **VERIFIED**: Consistent with existing UX

✅ **IV. Performance Requirements**: 
- Target: <50ms per shape render (documented in contracts/TechStackShapeDefinition.ts)
- Target: <2s for 50 shapes (documented in quickstart.md)
- Uses efficient D3.js path-based rendering (fewer DOM elements)
- **VERIFIED**: Performance targets documented and achievable

✅ **V. Monorepo Architecture**: 
- Single file addition: `tech-stack-d3-shapes.ts`
- Minimal changes to registry: `index.ts`
- Uses TypeScript 5.8.2, Next.js 16, React 19
- No workspace structure changes
- **VERIFIED**: Follows monorepo patterns

✅ **VI. API Communication Standards - D3.js Requirement**: 
- All shapes use D3.js render pattern: `g.append('path')`, `g.append('circle')`, etc.
- Follows existing kubernetes-d3-shapes.ts D3 pattern exactly
- **VERIFIED**: D3.js used for all rendering

✅ **VII. Documentation Standards**: 
- HLD/LLD in spec.md
- data-model.md created with entity definitions
- contracts/ created with TypeScript interfaces
- quickstart.md created with implementation guide
- **VERIFIED**: Complete documentation provided

✅ **IX. Error Handling Standards**: 
- Shape rendering is deterministic (no error conditions)
- Uses existing canvas error handling
- No custom errors needed
- **VERIFIED**: No error handling violations

✅ **X. Code Maintainability Standards**: 
- Color constants defined: `TECH_STACK_COLORS` in TechStackShapeDefinition.ts
- Validation constants defined: `SHAPE_VALIDATION` in TechStackShapeDefinition.ts
- No string literals for brand colors (all use constants)
- **VERIFIED**: Maintainability standards met

✅ **XI. Real Data and API Standards**: 
- Feature is code-based shape definitions
- No APIs or mock data involved
- Shapes render actual SVG paths
- **VERIFIED**: No mock data violations

**Post-Design Result**: ✅ ALL GATES PASSED - Design is compliant with constitution. Ready for implementation (Phase 2).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/web/utils/shape-libraries/
├── tech-stack-d3-shapes.ts     # NEW: 7 tech stack shape definitions (Next.js, Docker, React, Node.js, MongoDB, MCP agent, AI)
├── index.ts                    # MODIFIED: Register TechStack architecture type in ARCHITECTURE_LIBRARIES
├── kubernetes-d3-shapes.ts     # EXISTING: Reference pattern for shape structure
├── aws-d3-shapes.ts           # EXISTING
├── azure-d3-shapes.ts         # EXISTING
├── gcp-d3-shapes.ts           # EXISTING
└── generic-d3-shapes.ts       # EXISTING

apps/web/types/
└── shapes.ts                   # EXISTING: ShapeDefinition interface (verify location)

specs/001-tech-stack-shapes/
├── plan.md                     # This file
├── research.md                 # Phase 0 output
├── data-model.md              # Phase 1 output
├── quickstart.md              # Phase 1 output
└── contracts/                 # Phase 1 output (shape interface contracts)
```

**Structure Decision**: Single file addition pattern. This feature adds one new shape library file (`tech-stack-d3-shapes.ts`) and modifies the registry (`index.ts`). Follows established pattern from kubernetes/aws/azure/gcp shape libraries. No new directories or packages required.

## Complexity Tracking

> **No violations found - section not applicable**

All constitution gates passed. No complexity justification required.

---

## Phase Completion Summary

### ✅ Phase 0: Outline & Research (COMPLETED)

**Output**: `research.md`

Research resolved all technical unknowns from the Technical Context section:
- SVG path data sources identified (official brand websites + Tabler icons)
- D3.js best practices confirmed (follow kubernetes-d3-shapes.ts pattern)
- Shape registry integration pattern documented
- Brand color hex codes verified
- Accessibility approach defined (strokes for contrast)
- Docker container pattern decided (visual containment via resize)

**Key Decisions**:
1. Use official SVG sources, simplified for performance
2. Follow kubernetes-d3-shapes.ts D3.js pattern exactly
3. Add TechStack entry to ARCHITECTURE_LIBRARIES
4. Use exact official brand hex codes
5. Include strokes on all shapes for accessibility
6. Docker shape supports visual containment via manual resize

---

### ✅ Phase 1: Design & Contracts (COMPLETED)

**Outputs**:
- `data-model.md` - Entity definitions for shape structures
- `contracts/TechStackShapeDefinition.ts` - TypeScript interface contract
- `contracts/RegistryIntegration.ts` - Registry integration specification
- `quickstart.md` - Implementation guide with step-by-step instructions
- Agent context updated via `update-agent-context.sh copilot`

**Design Artifacts**:
1. **Data Model**: Defined TechStackShapeDefinition interface with all 7 shape specifications
2. **Contracts**: Complete TypeScript contracts with validation rules and color constants
3. **Registry Integration**: Documented exact changes needed for index.ts
4. **Quickstart**: 4-6 hour implementation guide with troubleshooting

**Constitution Re-Check**: ✅ All gates passed post-design. Design is constitution-compliant.

---

### ⏸️ Phase 2: Task Breakdown (NOT COMPLETED - Out of Scope)

**Note**: Phase 2 (detailed task breakdown in `tasks.md`) is handled by the `/speckit.tasks` command, which is separate from this planning workflow.

The `/speckit.plan` command ends after Phase 1 design artifacts are complete. Implementation planning is now ready for task generation.

---

## Next Steps

1. **Run `/speckit.tasks`** command to generate detailed task breakdown in `tasks.md`
2. **Implementation**: Follow `quickstart.md` to implement tech-stack-d3-shapes.ts
3. **Testing**: Manual visual testing as per quickstart.md checklist
4. **Review**: Code review focusing on constitution compliance
5. **Merge**: Merge to main after approval

---

## Deliverables Summary

| Artifact | Status | Location |
|----------|--------|----------|
| Feature Spec | ✅ Existing | specs/001-tech-stack-shapes/spec.md |
| Implementation Plan | ✅ Complete | specs/001-tech-stack-shapes/plan.md |
| Research Document | ✅ Complete | specs/001-tech-stack-shapes/research.md |
| Data Model | ✅ Complete | specs/001-tech-stack-shapes/data-model.md |
| TypeScript Contracts | ✅ Complete | specs/001-tech-stack-shapes/contracts/*.ts |
| Quickstart Guide | ✅ Complete | specs/001-tech-stack-shapes/quickstart.md |
| Agent Context | ✅ Updated | .github/agents/copilot-instructions.md |
| Task Breakdown | ⏸️ Pending | Run `/speckit.tasks` to generate |

---

**Planning Workflow Status**: ✅ COMPLETE  
**Branch**: `001-tech-stack-shapes`  
**Constitution Compliance**: ✅ VERIFIED  
**Ready for Task Generation**: Yes  
**Estimated Implementation Time**: 4-6 hours
