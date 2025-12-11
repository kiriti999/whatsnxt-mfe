# Implementation Plan: Lab Diagram Tests

**Branch**: `001-lab-diagram-test` | **Date**: 2025-12-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-lab-diagram-test/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature will allow instructors to create labs that contain both standard questions (MCQ, text) and interactive diagramming exercises. The lab creation process will be a step-by-step form. Each step can be a question or a diagram test. The work will be saved as a draft automatically. Finally, the instructor can publish the lab.

## Technical Context

**Language/Version**: TypeScript
**Primary Dependencies**: Next.js, React, Mantine UI
**Storage**: [NEEDS CLARIFICATION: The specific database to be used is not specified.]
**Testing**: Vitest
**Target Platform**: Web
**Project Type**: Web application
**Performance Goals**: Page loads < 500ms
**Constraints**: SOLID principles, max cyclomatic complexity of 5
**Scale/Scope**: Used by a few hundred instructors to create labs for a few thousand students.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality**: All code MUST adhere to SOLID principles and have a maximum cyclomatic complexity of 5.
- **UI**: UI MUST be built using Mantine UI, be responsive and accessible. CSS classes MUST be used over Mantine style attributes.
- **Performance**: All features MUST meet defined performance goals.
- **Architecture**: The project MUST use a Turbo monorepo structure with shared packages for reusable components and types.
- **Tech Stack**: Next.js 16+, React 19, Node.js 24 LTS, pnpm 10+, Webpack, Express.js v5, Axios, Winston, Vitest, Docker with Node Alpine.

## Project Structure

### Documentation (this feature)

```text
specs/001-lab-diagram-test/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
└── web/
    ├── app/
    │   └── lab/
    │       └── [id]/
    │           └── page.tsx # Existing lab page to be modified
    └── components/
        └── architecture-lab/ # New components for diagram editor will be added here

packages/
└── diagram-shapes/ # New package for shared diagram shapes
    ├── src/
    │   ├── common/ # Common shapes
    │   └── aws/ # Example of architecture-specific shapes
    └── index.ts
```

**Structure Decision**: The feature will be implemented within the existing Next.js application (`apps/web`). A new package (`diagram-shapes`) will be created to store the reusable diagram shapes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |