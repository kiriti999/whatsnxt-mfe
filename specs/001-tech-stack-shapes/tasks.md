---
description: "Task list for implementing tech stack shapes with multi-select architecture type dropdown"
---

# Tasks: Tech Stack Shape Library with Multi-Select Architecture Types

**Input**: Design documents from `/specs/001-tech-stack-shapes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested for this feature. Focus is on implementation and manual visual testing.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `apps/web/utils/`, `apps/web/components/`, `apps/web/types/`
- **Shape Libraries**: `apps/web/utils/shape-libraries/`
- **Components**: `apps/web/components/Lab/`, `apps/web/components/architecture-lab/`
- **API Routes**: `apps/web/app/api/lab/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verify development environment

- [X] T001 Verify Node.js 24 LTS installed and pnpm 9+ available in environment
- [X] T002 Install dependencies if needed using `pnpm install` from repository root
- [X] T003 [P] Review existing shape library pattern in apps/web/utils/shape-libraries/kubernetes-d3-shapes.ts
- [X] T004 [P] Review shape registry structure in apps/web/utils/shape-libraries/index.ts
- [X] T005 [P] Extract official brand SVG paths from sources listed in research.md (Next.js, React, Node.js, Docker, MongoDB)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create tech-stack-d3-shapes.ts file in apps/web/utils/shape-libraries/ with TechStackShapeDefinition interface
- [X] T007 Define TECH_STACK_COLORS constant object with official brand colors in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T008 Initialize techStackD3Shapes export as empty Record<string, TechStackShapeDefinition> in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T009 Import techStackD3Shapes and TechStackShapeDefinition in apps/web/utils/shape-libraries/index.ts
- [X] T010 Add TechStackShapeDefinition to ArchitectureShapeDefinition union type in apps/web/utils/shape-libraries/index.ts
- [X] T011 Add 'TechStack' to ArchitectureType union type in apps/web/utils/shape-libraries/index.ts
- [X] T012 Add TechStack entry to ARCHITECTURE_LIBRARIES object in apps/web/utils/shape-libraries/index.ts
- [X] T013 Add TechStack metadata entry to getArchitectureMetadata function in apps/web/utils/shape-libraries/index.ts with name 'Tech Stack', color '#5C7CFA', description 'Modern web development technology shapes'
- [X] T014 Export techStackD3Shapes and TechStackShapeDefinition from apps/web/utils/shape-libraries/index.ts
- [X] T015 Add architectureTypes field (string array) to Lab interface in apps/web/types/lab.ts for multi-select support
- [X] T016 Run TypeScript type check to verify registry integration: `pnpm run check-types` from apps/web

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Core Tech Stack Shapes (Priority: P1) 🎯 MVP

**Goal**: Implement the 5 most commonly used modern web development stack shapes (Next.js, React, Node.js, Docker, MongoDB) to enable instructors to create modern web application architecture diagrams

**Independent Test**: Create a new lab with "Tech Stack" architecture type, verify all 5 shapes appear in the shape library panel, drag each shape onto the canvas, verify brand-accurate colors and proper rendering, save diagram and reload to verify persistence

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement React shape render function with atom logo (nucleus + 3 elliptical orbits) in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #61DAFB
- [X] T018 [P] [US1] Implement Next.js shape render function with geometric design in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using colors #000000 and #FFFFFF
- [X] T019 [P] [US1] Implement Node.js shape render function with hexagon in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #339933
- [X] T020 [P] [US1] Implement Docker shape render function with whale and containers in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #2496ED with width 100px height 80px
- [X] T021 [P] [US1] Implement MongoDB shape render function with leaf logo in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #00684A
- [X] T022 [US1] Add all 5 shape definitions (react, nextjs, nodejs, docker, mongodb) to techStackD3Shapes export object in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T023 [US1] Run TypeScript compilation check: `pnpm run check-types` from apps/web directory
- [ ] T024 [US1] Start dev server with `pnpm run dev` from repository root and verify server starts on port 3001
- [ ] T025 [US1] Manual test: Navigate to lab creation page and verify "Tech Stack" appears in architecture type dropdown
- [ ] T026 [US1] Manual test: Select "Tech Stack" and verify all 5 shapes appear in shape library panel with correct names (React, Next.js, Node.js, Docker, MongoDB)
- [ ] T027 [US1] Manual test: Drag React shape onto canvas and verify atom logo renders with #61DAFB cyan blue color
- [ ] T028 [US1] Manual test: Drag Next.js shape onto canvas and verify geometric design renders with black/white colors
- [ ] T029 [US1] Manual test: Drag Node.js shape onto canvas and verify hexagon renders with #339933 green color
- [ ] T030 [US1] Manual test: Drag Docker shape onto canvas and verify whale with containers renders with #2496ED blue color
- [ ] T031 [US1] Manual test: Drag MongoDB shape onto canvas and verify leaf logo renders with #00684A green color
- [ ] T032 [US1] Manual test: Resize each shape from 50% to 200% and verify SVG scales cleanly without pixelation
- [ ] T033 [US1] Manual test: Connect React shape to Node.js shape with arrow and verify connection renders correctly showing frontend-backend relationship
- [ ] T034 [US1] Manual test: Create diagram with all 5 shapes positioned in full-stack architecture (React → Node.js → MongoDB), save it, reload page, and verify shapes persist with correct positions and styling
- [ ] T035 [US1] Manual test: Verify Docker shape can be resized larger to visually contain other shapes (e.g., resize to 150x120 to wrap React + Node.js shapes inside)
- [ ] T036 [US1] Manual test: Test shape operations - move, delete, copy - and verify all work correctly with tech stack shapes

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - instructors can create complete 5-tier web application architecture diagrams using Tech Stack shapes

---

## Phase 4: User Story 2 - AI & Agent Shapes (Priority: P2)

**Goal**: Implement AI and MCP agent shapes to enable instructors to design AI-powered application architectures and show how AI components interact with traditional application services

**Independent Test**: Verify AI and MCP agent shapes appear alongside core tech shapes in "Tech Stack" library, drag them onto canvas, verify they can be used to diagram AI workflows (User → React → Node.js → MCP Agent → AI Service), confirm shapes are visually distinct with appropriate iconography (robot for agent, neural network for AI)

### Implementation for User Story 2

- [X] T037 [P] [US2] Implement MCP Agent shape render function with robot/bot iconography in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #6C757D (neutral gray) with default size 80x80
- [X] T038 [P] [US2] Implement AI shape render function with neural network or brain outline in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts using color #7950F2 (purple) with default size 80x80
- [X] T039 [US2] Add both shape definitions (mcpagent, ai) to techStackD3Shapes export object in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T040 [US2] Run TypeScript compilation check: `pnpm run check-types` from apps/web directory
- [ ] T041 [US2] Manual test: Reload lab creation page and verify "Tech Stack" now shows 7 shapes total (5 core + 2 AI)
- [ ] T042 [US2] Manual test: Drag MCP Agent shape onto canvas and verify robot/bot icon renders with gray color and clear agent styling
- [ ] T043 [US2] Manual test: Drag AI shape onto canvas and verify neural network or brain icon renders with purple color
- [ ] T044 [US2] Manual test: Create AI application workflow diagram: User → React → Node.js → MCP Agent → AI Service, verify connections show clear relationships between traditional services and AI services
- [ ] T045 [US2] Manual test: Create multi-agent system diagram with multiple MCP Agent shapes in orchestration pattern (e.g., agent chain, parallel agents), verify shapes are positioned clearly
- [ ] T046 [US2] Manual test: Save AI architecture diagram and reload to verify MCP Agent and AI shapes persist correctly

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - instructors can create both traditional web app diagrams and AI-powered application architectures

---

## Phase 5: User Story 3 - Shape Consistency and Brand Accuracy (Priority: P3)

**Goal**: Ensure shapes match official branding and visual style of each technology for professional appearance and immediate recognition, improving learning by matching what students see in official documentation

**Independent Test**: Compare rendered shapes against official logos from each technology's brand guidelines (Next.js, React, Node.js, Docker, MongoDB) using color picker tools and side-by-side visual inspection. Success means shapes are recognizable and color-accurate (95% color match, 90% recognition rate without labels)

### Implementation for User Story 3

- [ ] T047 [P] [US3] Review React shape against official React logo at https://react.dev/ and adjust atom proportions/orbital angles if needed in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T048 [P] [US3] Review Next.js shape against official Next.js logo at https://nextjs.org/ and adjust geometric design if needed in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T049 [P] [US3] Review Node.js shape against official Node.js logo at https://nodejs.org/ and adjust hexagon proportions if needed in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T050 [P] [US3] Review Docker shape against official Docker logo at https://www.docker.com/ and adjust whale/container proportions if needed in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T051 [P] [US3] Review MongoDB shape against official MongoDB logo at https://www.mongodb.com/brand-resources and adjust leaf shape if needed in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T052 [P] [US3] Add stroke attributes (2px) to all shapes for contrast and definition in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T053 [P] [US3] Verify stroke colors are slightly darker than fill colors (e.g., React fill #61DAFB, stroke #4A9EC9) in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [ ] T054 [US3] Manual test: Use browser color picker to verify React shape color matches #61DAFB with 95% accuracy
- [ ] T055 [US3] Manual test: Use browser color picker to verify Node.js shape color matches #339933 with 95% accuracy
- [ ] T056 [US3] Manual test: Use browser color picker to verify MongoDB shape color matches #00684A with 95% accuracy
- [ ] T057 [US3] Manual test: Use browser color picker to verify Docker shape color matches #2496ED with 95% accuracy
- [ ] T058 [US3] Manual test: Place all 7 shapes on canvas side-by-side with official logos in browser tabs and verify visual match (shapes recognizable at first glance)
- [ ] T059 [US3] Manual test: Test contrast on both light and dark canvas backgrounds - verify all shapes have sufficient contrast (WCAG AA minimum 3:1 for graphics)
- [ ] T060 [US3] Manual test: Zoom canvas to 50%, 100%, 150%, 200% and verify all shapes maintain crisp edges and visual quality at all zoom levels
- [ ] T061 [US3] User acceptance test: Show shapes to 3+ developers/instructors without labels and verify 90% can identify each technology correctly

**Checkpoint**: All user stories should now be independently functional with professional, brand-accurate shapes that match official guidelines

---

## Phase 6: Multi-Select Architecture Dropdown (Foundational for Mixed Diagrams)

**Goal**: Enable instructors to select multiple architecture types simultaneously (e.g., Tech Stack + AWS + Kubernetes) and display shapes from all selected types in the shape library panel

**Independent Test**: Open lab creation form, select "Tech Stack" + "AWS" + "Kubernetes" from multi-select dropdown, verify all three types' shapes appear in library panel with section headers, drag shapes from different architectures onto same canvas, save and reload to verify mixed-architecture diagram persists correctly

**⚠️ Note**: This phase enables mixing architecture types, which is critical for real-world diagrams but not blocking for basic Tech Stack shape functionality

### Implementation for Multi-Select Dropdown

- [X] T062 [P] Import MultiSelect component from @mantine/core in apps/web/components/Lab/LabForm.tsx
- [X] T063 [P] Replace Select with MultiSelect component for architecture type selection in apps/web/components/Lab/LabForm.tsx
- [X] T064 [P] Update state management to handle architectureTypes array instead of single architectureType string in apps/web/components/Lab/LabForm.tsx
- [X] T065 [P] Add MultiSelect props: searchable, clearable, placeholder "Select architecture types", description "Select one or more architecture types for this lab" in apps/web/components/Lab/LabForm.tsx
- [X] T066 Update DiagramEditor props interface to accept architectureTypes array instead of single architectureType in apps/web/components/architecture-lab/DiagramEditor.tsx
- [X] T067 Implement shape fetching logic to get shapes from all selected architecture types using flatMap in apps/web/components/architecture-lab/DiagramEditor.tsx
- [X] T068 Add section headers for each architecture type in shape library panel rendering in apps/web/components/architecture-lab/DiagramEditor.tsx
- [X] T069 Implement normalization function getArchitectureTypesArray() to handle backward compatibility (convert single type to array) in apps/web/components/architecture-lab/DiagramEditor.tsx
- [X] T070 Update LabForm to call normalization function when loading existing labs in apps/web/components/Lab/LabForm.tsx
- [X] T071 Update form submission to send architectureTypes array in request body in apps/web/components/Lab/LabForm.tsx
- [X] T072 Run TypeScript type check: `pnpm run check-types` from apps/web directory

### Backend API Updates for Multi-Select

- [ ] T073 Update lab creation endpoint to accept architectureTypes array in request body in apps/web/app/api/lab/create/route.ts
- [ ] T074 Add validation logic: max 10 architecture types, filter to valid types only in apps/web/app/api/lab/create/route.ts
- [ ] T075 Add normalization logic: if architectureTypes empty but architectureConfig.type present, wrap in array for backward compatibility in apps/web/app/api/lab/create/route.ts
- [ ] T076 Update lab update endpoint to accept architectureTypes array in request body in apps/web/app/api/lab/[id]/route.ts
- [ ] T077 Add same validation and normalization logic to update endpoint in apps/web/app/api/lab/[id]/route.ts
- [ ] T078 Update lab GET endpoint to return architectureTypes array in response in apps/web/app/api/lab/[id]/route.ts
- [ ] T079 Add MongoDB schema field architectureTypes as array of strings with max length 10 validation in apps/web/models/lab.model.ts (or equivalent model file)

### Multi-Select Testing

- [ ] T080 Manual test: Start dev server and navigate to lab creation page
- [ ] T081 Manual test: Verify architecture type field shows MultiSelect component with search functionality
- [ ] T082 Manual test: Select "Tech Stack" from dropdown and verify 7 tech stack shapes appear in shape panel
- [ ] T083 Manual test: Add "AWS" to selection and verify AWS shapes now appear below tech stack shapes with section header "Amazon Web Services"
- [ ] T084 Manual test: Add "Kubernetes" to selection and verify Kubernetes shapes appear with section header "Kubernetes"
- [ ] T085 Manual test: Verify section headers appear as bold text separating each architecture type's shapes
- [ ] T086 Manual test: Verify selected types show as chips above shape panel or in dropdown
- [ ] T087 Manual test: Drag React shape (Tech Stack), EC2 shape (AWS), and Pod shape (Kubernetes) onto same canvas and verify all render correctly
- [ ] T088 Manual test: Connect shapes from different architectures (React → EC2 → Pod) and verify connections work
- [ ] T089 Manual test: Save mixed-architecture diagram and verify it saves without errors
- [ ] T090 Manual test: Reload page and verify all 3 architecture types are still selected in dropdown
- [ ] T091 Manual test: Verify all shapes from all 3 types appear in their original positions
- [ ] T092 Manual test: Remove one architecture type from dropdown and verify its shapes disappear from library panel but shapes already on canvas remain
- [ ] T093 Manual test: Test backward compatibility: Load an old lab with single architectureConfig.type and verify it displays correctly (single type converted to array)
- [ ] T094 Manual test: Edit old lab, add another architecture type, save, and verify it now uses architectureTypes array

**Checkpoint**: Multi-select architecture dropdown should be fully functional - instructors can create mixed-architecture diagrams (Tech Stack + AWS + Kubernetes + Azure + GCP) in any combination

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [X] T095 [P] Add inline code comments explaining complex SVG path logic in all shape render functions in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T096 [P] Verify all color constants are defined at function start for consistency in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T097 [P] Verify all shapes use relative positioning (width/height percentages, not absolute coordinates) in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts
- [X] T098 Run code formatter: `pnpm run format` from repository root (if format script exists)
- [X] T099 Run final TypeScript compilation check: `pnpm run check-types` from apps/web
- [X] T100 Remove any console.log statements or debug code from all modified files
- [X] T101 Update agent context: Run `.specify/scripts/bash/update-agent-context.sh copilot` from repository root
- [ ] T102 Performance test: Create diagram with 50+ shapes (mix of tech stack and other architectures) and verify load time < 2 seconds
- [ ] T103 Performance test: Measure individual shape render time and verify each shape renders in < 50ms
- [ ] T104 Edge case test: Verify no shape ID collisions occur when mixing tech stack shapes with AWS, Azure, Kubernetes, GCP shapes (all tech stack IDs have 'tech-' prefix)
- [ ] T105 Edge case test: Test zoom to 50% and verify shapes remain crisp with no pixelation
- [ ] T106 Edge case test: Test zoom to 200% and verify shapes scale correctly without distortion
- [ ] T107 Edge case test: Test with very large Docker container (200x150) containing 5+ other shapes and verify visual containment works
- [ ] T108 Accessibility test: Use color contrast checker on all shapes against white background and verify WCAG AA minimum (3:1 for graphics)
- [ ] T109 Accessibility test: Test shapes on dark canvas background (if supported) and verify contrast is sufficient
- [X] T110 Review quickstart.md implementation guide and verify all steps match actual implementation in apps/web/utils/shape-libraries/tech-stack-d3-shapes.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - MVP of core shapes
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion - Can run in parallel with US1 but typically follows for incremental delivery
- **User Story 3 (Phase 5)**: Depends on US1 and US2 completion (needs shapes implemented before brand accuracy review)
- **Multi-Select Dropdown (Phase 6)**: Depends on Foundational phase completion - Can run in parallel with user stories but provides cross-cutting feature
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP delivery point**
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1 (independent shapes) but typically follows US1 for incremental delivery
- **User Story 3 (P3)**: Depends on US1 and US2 (needs shapes implemented before brand accuracy refinement)
- **Multi-Select Feature**: Independent of user stories - enhances all architectures not just Tech Stack

### Within Each User Story

- **User Story 1**: Shape implementations (T017-T021) can run in parallel, then integration (T022), then testing (T023-T036) sequential
- **User Story 2**: Shape implementations (T037-T038) in parallel, then integration (T039), then testing (T040-T046) sequential
- **User Story 3**: All brand accuracy reviews (T047-T053) can run in parallel, then testing (T054-T061) sequential
- **Multi-Select**: Frontend changes (T062-T072) mostly sequential due to dependencies, Backend changes (T073-T079) mostly sequential, Testing (T080-T094) sequential

### Parallel Opportunities

- All Setup tasks (T003, T004, T005) marked [P] can run in parallel
- Shape render function implementations can run in parallel within each user story (T017-T021 in US1, T037-T038 in US2)
- Brand accuracy reviews can run in parallel (T047-T053 in US3)
- MultiSelect component changes (T062-T065) can run in parallel with backend API changes (T073-T079) if different developers
- Documentation and code cleanup tasks (T095-T097) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all core shape implementations together:
Task: "Implement React shape render function in tech-stack-d3-shapes.ts"
Task: "Implement Next.js shape render function in tech-stack-d3-shapes.ts"
Task: "Implement Node.js shape render function in tech-stack-d3-shapes.ts"
Task: "Implement Docker shape render function in tech-stack-d3-shapes.ts"
Task: "Implement MongoDB shape render function in tech-stack-d3-shapes.ts"

# Then integrate all at once:
Task: "Add all 5 shape definitions to techStackD3Shapes export"

# Then test sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T016) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T017-T036) - 5 core shapes
4. **STOP and VALIDATE**: Test User Story 1 independently (T024-T036)
5. Deploy/demo if ready - instructors can create full-stack web app diagrams

**MVP Delivery**: At this point, instructors can create modern web application architecture diagrams using React, Next.js, Node.js, Docker, and MongoDB shapes.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T016)
2. Add User Story 1 → Test independently (T017-T036) → Deploy/Demo (**MVP!**)
3. Add User Story 2 → Test independently (T037-T046) → Deploy/Demo (AI capabilities)
4. Add User Story 3 → Test independently (T047-T061) → Deploy/Demo (Brand polish)
5. Add Multi-Select → Test independently (T062-T094) → Deploy/Demo (Mixed diagrams)
6. Polish → Final validation (T095-T110) → Production release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T016)
2. Once Foundational is done:
   - **Developer A**: User Story 1 - Core shapes (T017-T036)
   - **Developer B**: User Story 2 - AI shapes (T037-T046)
   - **Developer C**: Multi-Select dropdown (T062-T094)
3. **Developer A** completes first → Delivers MVP
4. **Developer B** completes next → Enhances with AI
5. **Developer C** completes → Enables mixed architectures
6. **All developers**: User Story 3 brand accuracy review together (T047-T061)
7. **All developers**: Polish and testing together (T095-T110)

---

## Notes

- **[P] tasks** = different files, no dependencies - can parallelize safely
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **No automated tests** required per feature specification - manual visual testing only
- Verify shapes render correctly after each implementation task
- Commit after each logical group of tasks (e.g., after completing all shapes in a user story)
- Stop at any checkpoint to validate story independently
- **Multi-select dropdown** is additive - doesn't break existing single-architecture functionality
- **Backward compatibility** maintained - old labs with single type still work
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Success Criteria Validation

After completing all tasks, verify:

- ✅ **SC-001**: Instructors can create 5-tier web app diagram (frontend, backend, database, containerization, framework) using only tech stack shapes in under 3 minutes
- ✅ **SC-002**: All 7 tech stack shapes render correctly on first load with no visual artifacts
- ✅ **SC-003**: Shape colors match official brand guidelines with 95% accuracy (verified with color picker)
- ✅ **SC-004**: Students can identify each technology by shape without labels with 90% accuracy
- ✅ **SC-005**: Diagrams with tech stack shapes load and render in under 2 seconds for up to 50 shapes
- ✅ **SC-006**: Zero shape collision errors when tech stack shapes used with AWS, Azure, Kubernetes, GCP shapes
- ✅ **SC-006a**: Instructors can select multiple architecture types (Tech Stack + AWS + Kubernetes) and see all shapes in library panel within 2 seconds
- ✅ **SC-007**: Tech stack shapes maintain visual quality when scaled from 50% to 200% of default size
- ✅ **SC-008**: 95% of instructors successfully create first tech stack diagram without documentation

---

## Completion Criteria

Feature is complete when:

- ✅ All 7 shapes (React, Next.js, Node.js, Docker, MongoDB, MCP Agent, AI) render correctly with brand-accurate colors
- ✅ Shapes appear in "Tech Stack" dropdown option
- ✅ MultiSelect dropdown allows selecting multiple architecture types simultaneously
- ✅ Shape library panel displays shapes from all selected types with section headers
- ✅ All shape operations work (drag, resize, move, connect, delete)
- ✅ Mixed-architecture diagrams work (Tech Stack + AWS + Kubernetes + Azure + GCP in any combination)
- ✅ Diagrams save and reload with multiple architecture types correctly
- ✅ Backward compatibility: Old labs with single architecture type still load correctly
- ✅ No TypeScript errors in compilation
- ✅ Performance targets met (<50ms per shape render, <2s load for 50 shapes)
- ✅ Agent context updated with new feature information

---

## Total Task Summary

- **Setup**: 5 tasks (T001-T005)
- **Foundational**: 11 tasks (T006-T016) - **BLOCKS ALL STORIES**
- **User Story 1**: 20 tasks (T017-T036) - **MVP**
- **User Story 2**: 10 tasks (T037-T046)
- **User Story 3**: 15 tasks (T047-T061)
- **Multi-Select**: 33 tasks (T062-T094)
- **Polish**: 16 tasks (T095-T110)
- **TOTAL**: 110 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run simultaneously
**Independent Test Criteria**: Each user story phase includes specific manual tests for validation
**Suggested MVP Scope**: Setup + Foundational + User Story 1 = 36 tasks = Core value delivery
