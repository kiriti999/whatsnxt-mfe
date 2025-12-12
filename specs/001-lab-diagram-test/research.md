# Research Findings: Lab Diagram Tests Feature

**Date**: 2025-12-12
**Feature Branch**: `001-lab-diagram-test`

## Executive Summary

This document contains research findings from analyzing the existing codebase to prepare for implementing the Lab Diagram Tests feature. The research focused on understanding current implementations, identifying reusable components, and planning necessary changes.

**Critical Finding**: The entire frontend API layer (`apps/web/apis/lab.api.ts`) is currently a **mock implementation**, which violates the constitutional requirement of "NO mock data or APIs". This must be completely rewritten before any frontend development proceeds.

---

## 1. Frontend - Labs Page (`apps/web/app/labs/page.tsx`)

### Current Implementation

**Components Found**:
- `LabCreator` - Inline component for creating new labs
- `LabsPage` - Main page component

**Current Functionality**:
- Simple form with `name` and `description` fields only
- Uses Mantine UI components consistently
- Fetches labs via `labApi.getLabs()`
- Displays labs in a simple list with "View/Edit" button
- **Missing**: pagination, filtering by status, delete functionality
- **Missing Fields**: `labType` and `architectureType` not present

### Changes Required

1. Add `labType` and `architectureType` fields (required)
2. Convert LabCreator to modal dialog
3. Implement draft management with pagination (3 per page)
4. Sort drafts by createdAt descending
5. Add LabCard component with Edit/Delete buttons
6. Change edit route to `/lab/create?id=${labId}`

### Reusable Code
- Mantine UI patterns work well
- Form validation with `useForm`
- Notification system
- API error handling structure

---

## 2. Frontend - Lab Creation Page (`apps/web/app/lab/create/page.tsx`)

### Current Implementation

**Current Issues**:
- Creates lab on page load (should receive labId from route)
- Has mock fallback when API fails (violates constitution)
- No validation before save
- No "Save as Draft" button
- No lab metadata form
- API endpoints don't match specification

### Changes Required

1. Add LabMetadataForm component at top
2. Add Back button to navigate to Labs page
3. Implement PageValidator utility
4. Add "Save as Draft", "Next", and "Publish" buttons
5. Load draft data from URL query parameter
6. Remove mock fallback completely
7. Fix API endpoints to match spec

### Reusable Code
- Stepper pattern for multi-step workflow
- Existing QuestionEditor and diagram components
- Loading overlay pattern

---

## 3. API Client (`apps/web/apis/lab.api.ts`) - CRITICAL ISSUE

### Current Implementation

**CRITICAL**: **ENTIRE FILE IS MOCK IMPLEMENTATION**

The file contains:
- `mockApiClient` that simulates API calls with setTimeout
- Hardcoded mock data for labs, pages, and shapes
- No real HTTP requests
- **Violates constitution**: "NO mock data or APIs"

### Required Action

**COMPLETE REWRITE REQUIRED**

1. Remove all mock implementations
2. Import real HTTP client: `import http from '@whatsnxt/http-client'`
3. Import constants: `import { API_ENDPOINTS } from '@whatsnxt/constants'`
4. Implement real API calls for:
   - `getLabs(status, page, limit)` with pagination
   - `createLab(data)` with labType and architectureType
   - `getLabById(labId)`
   - `updateLab(labId, data)`
   - `deleteLab(labId)` - NEW
   - `publishLab(labId)`
   - All LabPage operations
   - `getDiagramShapes(architectureType?)`

5. Add proper type safety using `@whatsnxt/core-types`
6. Implement error handling with `@whatsnxt/errors`

**Priority**: Must be done immediately after backend APIs are ready

---

## 4. Type Definitions (`packages/core-types/src/index.d.ts`)

### Current Implementation

**Missing Fields**:
- `Lab` interface missing `labType` and `architectureType`

### Changes Required

1. Update Lab interface:
   ```typescript
   export interface Lab extends BaseEntity {
     status: 'draft' | 'published';
     name: string;
     description?: string;
     labType: string;  // NEW - required
     architectureType: string;  // NEW - required
     instructorId: string;
   }
   ```

2. Add PaginatedResponse type:
   ```typescript
   export interface PaginatedResponse<T> {
     data: T[];
     pagination: {
       page: number;
       limit: number;
       totalItems: number;
       totalPages: number;
     };
   }
   ```

3. Add CreateLabRequest and UpdateLabRequest types

**Priority**: HIGH - Blocks all development

---

## 5. HTTP Client (`packages/http-client/src/index.ts`)

### Current Implementation

**Status**: ✅ Good foundation exists

**Features**:
- HttpClient class wrapping axios
- Type-safe methods with generics
- Configurable headers and base URL
- Returns response.data directly

### Enhancements Needed

1. Add retry logic with exponential backoff
2. Enhance error interceptor to map HTTP status codes
3. Add request interceptor for auth tokens
4. Configure timeout

**Priority**: MEDIUM - Can enhance later

---

## 6. Backend Structure (`apps/whatsnxt-bff`)

### Key Findings

**Directory Structure**: ✅ Well-organized
```
app/
├── controllers/
├── errors/
├── middleware/
├── models/
├── routes/
├── services/
└── tests/
```

**JavaScript Files**: Found 20+ .js files in `utils/` directory
- **Action Required**: Convert to TypeScript (Task T016)
- **Estimated Time**: 6 hours

**Existing Infrastructure**:
- TypeScript configured ✅
- Vitest configured ✅
- Express.js server ✅
- MongoDB connection ✅

### Files to Create

**Models**:
- Lab.ts, LabPage.ts, Question.ts, DiagramTest.ts, DiagramShape.ts

**Services**:
- LabService.ts, LabPageService.ts, ValidationService.ts, PaginationService.ts, DiagramShapeService.ts

**Routes**:
- labs.ts, labPages.ts, diagramShapes.ts

**Middleware**:
- validation.ts, rbac.ts

---

## 7. Missing Packages

### Need to Verify/Create

1. **`@whatsnxt/errors`**: Check if exists, create if missing
2. **`@whatsnxt/constants`**: Check if exists, create if missing
3. **Diagram Shape Packages** (NEW - all need creation):
   - `@whatsnxt/diagram-shapes-common`
   - `@whatsnxt/diagram-shapes-aws`
   - `@whatsnxt/diagram-shapes-azure`
   - `@whatsnxt/diagram-shapes-gcp`

---

## 8. Risk Assessment

### High Priority Risks

| Risk | Impact | Mitigation | Timeline Impact |
|------|--------|------------|-----------------|
| Mock API Removal | Critical | Complete rewrite after backend ready | 3-4 hours |
| TypeScript Conversion | High | Convert incrementally, test thoroughly | 6 hours |
| Missing Backend | Critical | Backend must be implemented first | 30-40 hours |

### Medium Priority Risks

| Risk | Impact | Mitigation | Timeline Impact |
|------|--------|------------|-----------------|
| Shape Package Creation | Medium | Use placeholder shapes initially | 16-20 hours |
| Validation Complexity | Medium | Thorough testing, clear errors | Accounted for |

---

## 9. Implementation Recommendations

### Critical Path

**Must complete in order**:
1. Update types with labType/architectureType (T013-T015)
2. Convert TypeScript files (T016)
3. Build backend models, services, routes (T019-T042)
4. Write backend tests (T043-T050)
5. Remove mock API, implement real client (T062)
6. Build frontend components (T063-T093)

### Can Parallelize

- Diagram shape packages (T051-T060) while backend is in progress
- Frontend component design while backend APIs being built
- Tests can be written in parallel with implementation

### Quick Wins (Week 1)

1. **Update Type Definitions** (1-2 hours) - Unblocks everything
2. **Create @whatsnxt/constants Package** (1 hour) - Unblocks API client
3. **Setup Backend File Structure** (2 hours) - Clarifies structure

---

## 10. Success Criteria Validation

| Criterion | Status | Notes |
|-----------|--------|-------|
| SC-001: Labs page <2s | ⚠️ At Risk | Need pagination, DB indexes |
| SC-002: Draft pagination | ❌ Not Implemented | Need LabsList component |
| SC-003: Lab creation <3s | ⚠️ At Risk | Need to optimize API |
| SC-007: Validation errors | ❌ Not Implemented | Need PageValidator |
| SC-008: Empty tests prevented | ❌ Not Implemented | Need multi-layer validation |
| SC-013: No mock data | ❌ **FAILING** | lab.api.ts is 100% mock |

**Critical Gap**: SC-013 (No mock data) is currently failing and must be addressed.

---

## 11. Files Requiring Modification

### Frontend

**Major Refactors**:
- `apps/web/app/labs/page.tsx` - Add pagination, drafts, labType/architectureType
- `apps/web/app/lab/create/page.tsx` - Add metadata form, validation, proper routing
- `apps/web/apis/lab.api.ts` - **COMPLETE REWRITE** to remove mocks

**New Components** (12 files):
- LabCard, LabsList, CreateLabModal, DeleteLabDialog
- LabMetadataForm, DiagramTestToggle, PageNavigator
- PageValidator utility
- labPage.api.ts, diagramShape.api.ts

### Backend

**New Files** (15 files):
- 5 Models (Lab, LabPage, Question, DiagramTest, DiagramShape)
- 5 Services (Lab, LabPage, Validation, Pagination, DiagramShape)
- 3 Routes (labs, labPages, diagramShapes)
- 2 Middleware (validation, rbac)

**Convert from JS to TS**: ~20 files in `app/utils/`

### Packages

**Modify**:
- `packages/core-types/src/index.d.ts` - Add labType, architectureType, PaginatedResponse
- `packages/diagram-core/src/index.ts` - Add ShapeRegistry

**Create** (4-6 new packages):
- diagram-shapes-common, diagram-shapes-aws, diagram-shapes-azure, diagram-shapes-gcp
- errors (if missing), constants (if missing)

---

## 12. Blockers and Dependencies

### Current Blockers

1. **No Backend APIs** (CRITICAL)
   - Lab APIs don't exist yet
   - Frontend cannot be tested
   - **Resolution**: Implement backend first (Phases 2-4)

2. **Mock API in Use** (CRITICAL)
   - Violates constitution
   - Cannot proceed with frontend
   - **Resolution**: Remove after backend ready

3. **Missing Type Fields** (HIGH)
   - labType and architectureType not in types
   - **Resolution**: Update types first (Task T013)

### External Dependencies

- MongoDB connection working ✅
- OAuth2/OIDC system functional (need to verify)
- Winston logger configured (need to verify)
- Environment variables set (need to verify)

---

## 13. Timeline Estimate

### Phase Breakdown

| Phase | Tasks | Hours | Weeks (40h) |
|-------|-------|-------|-------------|
| 0: Research | T001-T009 | 12 | 0.3 |
| 1: Design | T010-T012 | 10 | 0.25 |
| 2: Backend Types/Models | T013-T023 | 20 | 0.5 |
| 3: Backend Services | T024-T028 | 15 | 0.4 |
| 4: Backend Routes | T029-T042 | 28 | 0.7 |
| 5: Backend Tests | T043-T050 | 18 | 0.45 |
| 6: Shape Packages | T051-T060 | 26 | 0.65 |
| 7: Labs Page Frontend | T061-T072 | 28 | 0.7 |
| 8: Lab Creation Frontend | T073-T093 | 47 | 1.2 |
| 9: Integration/Testing | T094-T108 | 30 | 0.75 |
| 10: Docs/Deployment | T109-T122 | 26 | 0.65 |

**Total**: ~260 hours (~6.5 weeks at 40 hours/week)

**With 20% buffer**: ~312 hours (~7.8 weeks)

---

## Conclusion

### Summary

The codebase has a solid foundation with good patterns, but requires significant work:

**Strengths**:
- ✅ Good UI component patterns with Mantine
- ✅ TypeScript partially adopted
- ✅ Monorepo well-organized
- ✅ HTTP client ready

**Critical Issues**:
1. ❌ **Entire API layer is mock** - Violates constitution
2. ❌ **Missing labType/architectureType** - Blocks all work
3. ❌ **No backend APIs** - Must implement first
4. ❌ **No validation** - Core requirement missing

### Recommendation

**DO NOT** attempt frontend work until:
1. Backend APIs implemented and tested
2. Mock API completely removed
3. Types updated with required fields

**Follow This Sequence**:
1. Update types (1-2 hours)
2. Convert to TypeScript (6 hours)
3. Build complete backend (40+ hours)
4. Remove mocks from frontend API (3 hours)
5. Build frontend components (75+ hours)

**Estimated Total**: ~220-260 hours (~5.5-6.5 weeks)

---

**Research Completed**: 2025-12-12
**Next Action**: Update task list and begin Phase 1 (Design Documents)
**Critical Next Step**: Task T013 - Update Lab interface with labType and architectureType
