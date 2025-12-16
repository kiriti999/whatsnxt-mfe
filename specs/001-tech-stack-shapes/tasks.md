---
description: "Task list for tech stack shapes feature implementation"
---

# Tasks: Tech Stack Shape Library

**Input**: Design documents from `/specs/001-tech-stack-shapes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature uses manual visual testing (no automated test tasks included). Focus is on visual accuracy and integration with existing canvas system.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `apps/web/utils/shape-libraries/` for shape definitions
- **Registry**: `apps/web/utils/shape-libraries/index.ts` for registration
- Monorepo structure with Next.js 16, React 19, TypeScript 5.8.2, D3.js

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verify development environment

- [ ] T001 Verify Node.js 24 LTS installed and pnpm 9+ available in environment
- [ ] T002 Install dependencies if needed using `pnpm install` from repository root
- [ ] T003 [P] Review existing shape library pattern in apps/web/utils/shape-libraries/kubernetes-d3-shapes.ts
- [ ] T004 [P] Review shape registry structure in apps/web/utils/shape-libraries/index.ts
- [ ] T005 [P] Extract official brand SVG paths from sources listed in research.md (Next.js, React, Node.js, Docker, MongoDB)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create tech-stack-d3-shapes.ts file in apps/web/utils/shape-libraries/ with TechStackShapeDefinition interface
- [ ] T007 Define TECH_STACK_COLORS constant object with official brand colors in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T008 Initialize techStackD3Shapes export as empty Record<string, TechStackShapeDefinition> in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T009 Import techStackD3Shapes and TechStackShapeDefinition in apps/web/utils/shape-libraries/index.ts
- [ ] T010 Add TechStackShapeDefinition to ArchitectureShapeDefinition union type in apps/web/utils/shape-libraries/index.ts
- [ ] T011 Add 'TechStack' to ArchitectureType union type in apps/web/utils/shape-libraries/index.ts
- [ ] T012 Add TechStack entry to ARCHITECTURE_LIBRARIES in apps/web/utils/shape-libraries/index.ts
- [ ] T013 Add TechStack metadata to getArchitectureMetadata function in apps/web/utils/shape-libraries/index.ts
- [ ] T014 Export techStackD3Shapes and TechStackShapeDefinition from apps/web/utils/shape-libraries/index.ts
- [ ] T015 Run TypeScript type check to verify registry integration: `pnpm run check-types` from apps/web

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Tech Stack Shapes (Priority: P1) 🎯 MVP

**Goal**: Implement the 5 most commonly used modern web development stack shapes (Next.js, React, Node.js, Docker, MongoDB) to enable instructors to create modern web application architecture diagrams

**Independent Test**: Create a new lab with "Tech Stack" architecture type, verify all 5 shapes appear in the shape library panel, drag each shape onto the canvas, verify brand-accurate colors and proper rendering, save diagram and reload to verify persistence

### Implementation for User Story 1

- [ ] T016 [P] [US1] Implement React shape render function with atom logo (nucleus + 3 elliptical orbits) in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #61DAFB
- [ ] T017 [P] [US1] Implement Next.js shape render function with geometric design in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using colors #000000 and #FFFFFF
- [ ] T018 [P] [US1] Implement Node.js shape render function with hexagon in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #339933
- [ ] T019 [P] [US1] Implement Docker shape render function with whale and containers in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #2496ED with width 90px
- [ ] T020 [P] [US1] Implement MongoDB shape render function with leaf logo in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #00684A
- [ ] T021 [US1] Add all 5 shape definitions to techStackD3Shapes export object in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T022 [US1] Run TypeScript compilation check: `pnpm run check-types` from apps/web directory
- [ ] T023 [US1] Start dev server with `pnpm run dev` from repository root and verify server starts on port 3001
- [ ] T024 [US1] Manual test: Navigate to lab creation page and verify "Tech Stack" appears in architecture type dropdown
- [ ] T025 [US1] Manual test: Select "Tech Stack" and verify all 5 shapes appear in shape library panel with correct names
- [ ] T026 [US1] Manual test: Drag React shape onto canvas and verify atom logo renders with #61DAFB blue color
- [ ] T027 [US1] Manual test: Drag Next.js shape onto canvas and verify geometric design renders with black/white colors
- [ ] T028 [US1] Manual test: Drag Node.js shape onto canvas and verify hexagon renders with #339933 green color
- [ ] T029 [US1] Manual test: Drag Docker shape onto canvas and verify whale with containers renders with #2496ED blue color
- [ ] T030 [US1] Manual test: Drag MongoDB shape onto canvas and verify leaf logo renders with #00684A green color
- [ ] T031 [US1] Manual test: Resize each shape from 50% to 200% and verify SVG scales cleanly without pixelation
- [ ] T032 [US1] Manual test: Connect React shape to Node.js shape with arrow and verify connection renders correctly
- [ ] T033 [US1] Manual test: Create diagram with all 5 shapes, save it, reload page, and verify shapes persist with correct positions and styling
- [ ] T034 [US1] Manual test: Verify Docker shape can be resized larger to visually contain other shapes (e.g., resize to wrap React + Node.js shapes)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - instructors can create complete 5-tier web application architecture diagrams

---

## Phase 4: User Story 2 - AI & Agent Shapes (Priority: P2)

**Goal**: Implement AI and MCP agent shapes to enable instructors to design AI-powered application architectures and show how AI components interact with traditional application services

**Independent Test**: Verify AI and MCP agent shapes appear alongside core tech shapes in "Tech Stack" library, drag them onto canvas, verify they can be used to diagram AI workflows (User → React → Node.js → MCP Agent → AI Service), confirm shapes are visually distinct with appropriate iconography

### Implementation for User Story 2

- [ ] T035 [P] [US2] Implement MCP Agent shape render function with robot/bot icon in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #6C757D (neutral gray)
- [ ] T036 [P] [US2] Implement AI shape render function with neural network/brain icon in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #7950F2 (purple)
- [ ] T037 [US2] Add MCP Agent and AI shape definitions to techStackD3Shapes export object in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T038 [US2] Run TypeScript compilation check: `pnpm run check-types` from apps/web directory
- [ ] T039 [US2] Start dev server with `pnpm run dev` and verify server starts
- [ ] T040 [US2] Manual test: Select "Tech Stack" architecture type and verify MCP Agent and AI shapes appear in shape library panel alongside core shapes
- [ ] T041 [US2] Manual test: Drag MCP Agent shape onto canvas and verify robot/bot icon renders with #6C757D gray color
- [ ] T042 [US2] Manual test: Drag AI shape onto canvas and verify neural network/brain icon renders with #7950F2 purple color
- [ ] T043 [US2] Manual test: Create AI workflow diagram (React → Node.js → MCP Agent → AI) with connections and verify visual clarity
- [ ] T044 [US2] Manual test: Create multi-agent system with 3+ MCP Agent shapes and verify shapes are distinguishable
- [ ] T045 [US2] Manual test: Save diagram with AI and agent shapes, reload, and verify persistence

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - instructors can create both traditional web stack diagrams and AI-powered application architectures

---

## Phase 5: User Story 3 - Shape Consistency and Brand Accuracy (Priority: P3)

**Goal**: Ensure all shapes match official branding and visual style of each technology to improve learning by matching what students see in official documentation - shapes should be immediately recognizable and color-accurate

**Independent Test**: Compare rendered shapes against official logos from each technology's brand guidelines (Next.js, React, Node.js, Docker, MongoDB, AI icons), verify 95% color accuracy using color picker tools, confirm shapes are recognizable without reading labels (90% accuracy in user testing)

### Implementation for User Story 3

- [ ] T046 [P] [US3] Compare React shape against official React logo at https://react.dev/ and adjust paths if needed for accuracy in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T047 [P] [US3] Compare Next.js shape against official Next.js logo at https://nextjs.org/ and adjust paths if needed for accuracy in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T048 [P] [US3] Compare Node.js shape against official Node.js logo at https://nodejs.org/ and adjust paths if needed for accuracy in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T049 [P] [US3] Compare Docker shape against official Docker logo and adjust paths if needed for accuracy in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T050 [P] [US3] Compare MongoDB shape against official MongoDB logo and adjust paths if needed for accuracy in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T051 [US3] Add stroke attributes to all shapes for better contrast and depth following WCAG AA guidelines in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T052 [US3] Verify all color constants match official brand guidelines using color picker tool on official logos
- [ ] T053 [US3] Manual test: Place all 7 shapes on canvas side-by-side with official logos open in browser tabs for visual comparison
- [ ] T054 [US3] Manual test: Verify React atom logo matches official design (3 elliptical orbits at 60° intervals, nucleus at center)
- [ ] T055 [US3] Manual test: Verify Next.js geometric design matches official logo styling (high contrast black/white)
- [ ] T056 [US3] Manual test: Verify Node.js hexagon matches official logo proportions and green shade
- [ ] T057 [US3] Manual test: Verify Docker whale with containers matches official logo design and blue shade
- [ ] T058 [US3] Manual test: Verify MongoDB leaf matches official logo curves and green shade
- [ ] T059 [US3] Manual test: Zoom canvas to 50% and verify all shapes remain crisp (SVG scaling works correctly)
- [ ] T060 [US3] Manual test: Zoom canvas to 200% and verify no pixelation or distortion on any shape
- [ ] T061 [US3] Manual test: Test shapes on both light and dark canvas backgrounds and verify sufficient contrast (WCAG AA minimum 3:1)
- [ ] T062 [US3] Manual test: Show shapes to 5+ users without labels and measure recognition rate (target: 90%+ recognize each technology)

**Checkpoint**: All user stories should now be independently functional with professionally styled, brand-accurate shapes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T063 [P] Add JSDoc comments to each shape render function explaining the visual design in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T064 [P] Verify cyclomatic complexity <5 for all render functions using code analysis or manual review
- [ ] T065 Performance test: Create diagram with 50+ tech stack shapes and verify load time <2s
- [ ] T066 Performance test: Measure individual shape render time and verify <50ms per shape (use browser performance tools)
- [ ] T067 Integration test: Create diagram mixing tech stack shapes with AWS, Azure, and Kubernetes shapes and verify no ID collisions
- [ ] T068 Integration test: Verify all shape operations work correctly (drag, resize, move, rotate, connect, delete, copy, paste)
- [ ] T069 Edge case test: Verify shape library loads correctly when network is slow or offline (shapes are code-based, not remote assets)
- [ ] T070 Edge case test: Test with very small canvas (mobile viewport) and verify shapes are still usable
- [ ] T071 Edge case test: Test with very large canvas (4K display) and verify shapes scale appropriately
- [ ] T072 [P] Run final TypeScript compilation: `pnpm run check-types` from apps/web
- [ ] T073 [P] Run Prettier formatting: `pnpm run format` from repository root if format command exists
- [ ] T074 Update agent context by running `.specify/scripts/bash/update-agent-context.sh copilot` from repository root
- [ ] T075 Run quickstart.md validation: Execute all steps in specs/001-tech-stack-shapes/quickstart.md and verify completion criteria met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - MVP scope
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 (adds new shapes alongside existing)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Refinement of US1 & US2 shapes (but could be done in parallel with different team member)

### Within Each User Story

- Models/definitions before implementation
- Implementation before testing
- Core implementation before integration testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel (different review tasks)
- **Phase 3 (US1)**: T016-T020 can run in parallel (different shape files, independent implementations)
- **Phase 4 (US2)**: T035-T036 can run in parallel (different shape files)
- **Phase 5 (US3)**: T046-T050 can run in parallel (different shape refinements)
- **Phase 6**: T063, T064, T072, T073 can run in parallel (different files/concerns)
- **If team has multiple developers**: US1, US2, and US3 can be worked on in parallel after Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# Launch all shape implementations together:
Task T016: "Implement React shape render function with atom logo in tech-stack-d3-shapes.ts"
Task T017: "Implement Next.js shape render function with geometric design in tech-stack-d3-shapes.ts"
Task T018: "Implement Node.js shape render function with hexagon in tech-stack-d3-shapes.ts"
Task T019: "Implement Docker shape render function with whale in tech-stack-d3-shapes.ts"
Task T020: "Implement MongoDB shape render function with leaf in tech-stack-d3-shapes.ts"

# All 5 shapes can be implemented by different developers simultaneously
# Each shape is independent and adds to the same export object
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (5 core tech stack shapes)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - instructors can now create modern web application architecture diagrams

**MVP Scope**: Just User Story 1 provides immediate value for the most common use case (Next.js, React, Node.js, Docker, MongoDB stack)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 → Test independently → Deploy/Demo (AI capabilities added)
4. Add User Story 3 → Test independently → Deploy/Demo (Polish and brand accuracy)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (T016-T034)
   - Developer B: User Story 2 (T035-T045)
   - Developer C: User Story 3 (T046-T062)
3. Stories complete and integrate independently
4. All converge for Phase 6: Polish

---

## Implementation Summary

### Total Tasks: 75
- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (User Story 1 - P1)**: 19 tasks (MVP scope)
- **Phase 4 (User Story 2 - P2)**: 11 tasks
- **Phase 5 (User Story 3 - P3)**: 17 tasks
- **Phase 6 (Polish)**: 13 tasks

### Task Count Per User Story
- **User Story 1 (Core Tech Stack Shapes)**: 19 tasks - highest priority, most commonly needed shapes
- **User Story 2 (AI & Agent Shapes)**: 11 tasks - adds cutting-edge AI capabilities
- **User Story 3 (Brand Accuracy)**: 17 tasks - polish and professional appearance

### Parallel Opportunities Identified
- Phase 1: 3 parallel tasks (review tasks)
- Phase 3 (US1): 5 parallel tasks (shape implementations)
- Phase 4 (US2): 2 parallel tasks (shape implementations)
- Phase 5 (US3): 5 parallel tasks (shape refinements)
- Phase 6: 4 parallel tasks (documentation, formatting)
- **User stories can run in parallel after Phase 2**: 3 developers can work simultaneously on US1, US2, US3

### Independent Test Criteria

**User Story 1**: Create lab with "Tech Stack" architecture, verify 5 shapes load, drag all shapes onto canvas, verify colors match brands, save and reload diagram → Success if all shapes persist correctly

**User Story 2**: Verify AI and MCP agent shapes appear in library, create AI workflow diagram (User → React → Node.js → MCP Agent → AI), verify visual clarity → Success if workflow is clear and shapes are distinguishable

**User Story 3**: Compare all shapes side-by-side with official logos, use color picker to verify hex codes, test 50%-200% zoom, show to users for recognition test → Success if 95% color accuracy and 90% recognition rate achieved

### Suggested MVP Scope

**MVP = User Story 1 Only** (Tasks T001-T034)
- Estimated time: 3-4 hours
- Delivers: 5 most commonly used tech stack shapes (Next.js, React, Node.js, Docker, MongoDB)
- Value: Enables instructors to create complete modern web application architecture diagrams
- Independently testable and deployable
- Addresses primary user need stated in feature request

**Post-MVP Additions**:
- User Story 2 (AI shapes): 1-1.5 hours
- User Story 3 (Brand polish): 1-1.5 hours
- Phase 6 (Polish): 0.5-1 hour
- **Total estimate**: 4-6 hours for complete feature

---

## Format Validation

✅ All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
✅ Task IDs are sequential (T001-T075)
✅ [P] marker present on parallelizable tasks
✅ [Story] labels present on all user story phase tasks (US1, US2, US3)
✅ Exact file paths included in all implementation tasks
✅ Setup and Foundational phases have no story labels (correct)
✅ Polish phase has no story labels (correct)

---

## Notes

- All tasks are immediately executable by an LLM with the provided context from spec.md, plan.md, data-model.md, contracts/, research.md, and quickstart.md
- Manual testing approach is appropriate for visual shapes feature (verifying brand accuracy, colors, and rendering)
- Each user story is independently completable and testable
- MVP delivers core value (5 most common tech stack shapes)
- Commit after each user story phase or logical group of tasks
- Stop at any checkpoint to validate story independently before proceeding
- D3.js pattern from kubernetes-d3-shapes.ts provides clear reference for implementation
- All shapes use official brand colors from research.md
- Performance targets clearly defined (50ms per shape, 2s for 50 shapes)
