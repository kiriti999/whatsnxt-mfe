# Task Generation Summary: Diagram Quiz Hints System

**Generated**: 2025-01-20  
**Feature Branch**: `001-diagram-quiz-hints`  
**Total Tasks**: 69 tasks

---

## Task Breakdown by Phase

| Phase | Description | Task Range | Count | MVP? |
|-------|-------------|------------|-------|------|
| **Phase 1** | Setup | T001-T004 | 4 | ✅ Yes |
| **Phase 2** | Foundational | T005-T011 | 7 | ✅ Yes |
| **Phase 3** | US4: Optional Hints (P1) | T012-T016 | 5 | ✅ Yes |
| **Phase 4** | US1: Single Hint (P1) | T017-T027 | 11 | ✅ Yes |
| **Phase 5** | US2: Multi-Hint (P2) | T028-T043 | 16 | ⚠️ Enhanced |
| **Phase 6** | Polish & Cross-Cutting | T044-T057 | 14 | ⚠️ Quality |
| **Phase 7** | US3: Tracking (P3) | T058-T069 | 12 | ❌ Future |

---

## MVP Scope Definition

### Minimal MVP (27 tasks)
- Phase 1: Setup (4 tasks)
- Phase 2: Foundational (7 tasks)
- Phase 3: US4 - Optional Hints (5 tasks)
- Phase 4: US1 - Single Hint (11 tasks)

**Delivers**: Backward-compatible single hint feature

### Enhanced MVP (57 tasks)
- Minimal MVP (27 tasks)
- Phase 5: US2 - Multi-Hint (16 tasks)
- Phase 6: Polish (14 tasks)

**Delivers**: Production-ready multi-hint progressive disclosure with quality improvements

### Full Feature (69 tasks)
- Enhanced MVP (57 tasks)
- Phase 7: US3 - Hint Tracking (12 tasks)

**Delivers**: Complete feature with analytics and hint usage tracking

---

## Tasks by User Story Priority

### P1 Priority (Critical - MVP)
- **US4: Optional Hints** - 5 tasks (T012-T016)
  - Ensures backward compatibility
  - Tests work without hints
  
- **US1: Single Hint** - 11 tasks (T017-T027)
  - Core hint functionality
  - Instructor adds one hint
  - Student reveals one hint
  - End-to-end persistence

**P1 Total**: 16 tasks + 11 foundational = **27 tasks for MVP**

### P2 Priority (Enhanced Features)
- **US2: Multi-Hint Progressive Disclosure** - 16 tasks (T028-T043)
  - Up to 5 hints per quiz
  - Drag-and-drop reordering
  - Sequential revelation
  - Duplicate detection
  - Best practices guidance

**P2 Total**: 16 tasks (depends on US1 completion)

### P3 Priority (Analytics - Future)
- **US3: Hint Usage Tracking** - 12 tasks (T058-T069)
  - New entity: StudentDiagramTestSubmission
  - Track hints revealed per student
  - Instructor analytics dashboard
  - Aggregate statistics

**P3 Total**: 12 tasks (implement after P1/P2 validation in production)

---

## Parallel Execution Opportunities

### Tasks Marked [P] (Can Run in Parallel)

**Phase 1 - Setup**: All 4 tasks can run in parallel (T001-T004)

**Phase 2 - Foundational**:
- T005, T006, T007, T008 can run in parallel (different files)
- T009 depends on T007 (schema must exist)
- T010 depends on T009 (endpoints must be updated)

**Phase 3 - US4**:
- T012, T013 can run in parallel (different files)

**Phase 4 - US1**:
- T017, T018 can run in parallel (creating separate components)

**Phase 5 - US2**:
- T028, T029 can run in parallel (different features in HintsEditor)

**Phase 6 - Polish**: All 14 tasks marked [P] can run in parallel

**Phase 7 - US3**:
- T058, T059 can run in parallel (schema creation)
- T063, T064, T065 can run in parallel (different views)

---

## File Change Summary

### New Files Created (8 files)
1. `apps/web/components/Lab/HintsEditor.tsx` - Instructor hint management UI
2. `apps/web/components/Lab/HintsDisclosure.tsx` - Student hint reveal UI
3. `backend/models/StudentDiagramTestSubmission.js` - P3: Tracking entity (future)

### Modified Files (6 files)
1. `packages/core-types/src/index.d.ts` - Add hints?: string[] to DiagramTest
2. `apps/web/apis/lab.api.ts` - Add hints to CreateDiagramTestRequest
3. `backend/models/DiagramTest.js` - Add hints field to schema
4. `backend/controllers/lab/diagramTestController.js` - Handle hints in create/update
5. `apps/web/app/labs/[id]/pages/[pageId]/page.tsx` - Integrate HintsEditor
6. `apps/web/components/Lab/StudentTestRunner.tsx` - Integrate HintsDisclosure

---

## Independent Test Criteria

### US4: Optional Hints (P1)
✅ Create diagram quiz without hints → no hint UI for students  
✅ Load existing diagram tests → continue to function normally  
✅ Backward compatibility verified

### US1: Single Hint (P1)
✅ Create quiz with 1 hint in editor → hint persists after reload  
✅ As student, reveal single hint → hint displays correctly  
✅ Edit hint as instructor → changes persist  
**Delivers value**: Basic hint support working end-to-end

### US2: Multi-Hint (P2)
✅ Create quiz with 3-5 hints → all hints saved  
✅ Reorder hints via drag-and-drop → new order persists  
✅ As student, reveal hints sequentially → previous hints remain visible  
✅ Reveal all hints → "no more hints" message appears  
**Delivers value**: Pedagogically sound progressive disclosure

### US3: Tracking (P3 - Future)
⏳ Solve quiz with 2 hints → submission records hintsRevealed=2  
⏳ Instructor views analytics → sees hint usage per student  
⏳ Aggregate stats → average hints used, percentage using hints  
**Delivers value**: Insights into learning behavior

---

## Implementation Strategy Recommendation

### Week 1: MVP Foundation (27 tasks)
**Days 1-2**: Phase 1 (Setup) + Phase 2 (Foundational)  
**Days 3-4**: Phase 3 (US4 - Optional Hints)  
**Days 4-5**: Phase 4 (US1 - Single Hint)  
**End of Week**: Working MVP with single-hint support

### Week 2: Enhanced Features (30 tasks)
**Days 1-3**: Phase 5 (US2 - Multi-Hint Progressive Disclosure)  
**Days 4-5**: Phase 6 (Polish & Quality)  
**End of Week**: Production-ready multi-hint system

### Future: Analytics (12 tasks)
**After P1/P2 Validation**: Phase 7 (US3 - Tracking)  
**Duration**: 3-5 days  
**Deliverable**: Complete feature with analytics

---

## Validation Checklist

### Format Validation ✅
- [x] All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description`
- [x] All task IDs are sequential (T001-T069)
- [x] All user story tasks have [Story] label (US1, US2, US3, US4)
- [x] All parallelizable tasks marked with [P]
- [x] All tasks include exact file paths

### Completeness Validation ✅
- [x] All user stories from spec.md covered (US1, US2, US3, US4)
- [x] All entities from data-model.md addressed (DiagramTest extended, StudentDiagramTestSubmission for P3)
- [x] All API contracts from contracts/ implemented (hints field in create/get endpoints)
- [x] Setup phase includes environment verification
- [x] Foundational phase blocks all user stories (schema + types + API)
- [x] Each user story has independent test criteria
- [x] Polish phase addresses quality concerns

### Priority Validation ✅
- [x] P1 tasks in MVP scope (US4 + US1)
- [x] P2 tasks in enhanced scope (US2)
- [x] P3 tasks marked as future (US3)
- [x] MVP delivers immediate value (backward-compatible single hint)
- [x] Each phase builds on previous (incremental delivery)

---

## Next Steps

1. **Review tasks.md** - Validate task breakdown with team
2. **Start Phase 1** - Setup and environment verification
3. **Complete Foundational** - CRITICAL: Blocks all user stories
4. **MVP First** - US4 + US1 (27 tasks) for immediate value
5. **Iterate** - Add US2 after MVP validation
6. **Future Work** - US3 (tracking) after P1/P2 in production

---

**Generated by**: /speckit.tasks command  
**Status**: ✅ Ready for implementation  
**Tasks File**: `specs/001-diagram-quiz-hints/tasks.md`
