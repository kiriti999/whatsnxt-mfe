# Runtime Testing Guide: Page Editor Pagination

**Feature**: 004-page-editor-pagination  
**Date**: 2025-01-17  
**Status**: Implementation complete, awaiting runtime validation

---

## Overview

This document provides a comprehensive testing checklist for validating the pagination feature in the page editor. All core functionality has been implemented and build-verified, but requires manual runtime testing to ensure correct behavior with real backend data.

---

## Prerequisites

Before testing, ensure:
- ✅ Backend API is running and accessible
- ✅ Backend returns `totalPages` field in lab responses
- ✅ At least one lab exists with multiple pages (use feature 003 auto-page-creation)
- ✅ User is authenticated as an instructor/trainer
- ✅ Browser DevTools are available for performance/accessibility testing

---

## Test Suite 1: Basic Pagination Display (US1)

### Test 1.1: Single-Page Lab (Pagination Hidden)
**Steps:**
1. Navigate to a lab with only 1 page
2. Open page editor: `/labs/:labId/pages/:pageId`

**Expected:**
- ❌ Pagination controls should NOT be visible
- ✅ Editor loads normally without pagination

**Acceptance Criteria:**
- No "Page X of Y" indicator displayed
- No pagination controls visible

---

### Test 1.2: Multi-Page Lab (Pagination Visible)
**Steps:**
1. Create a lab with 3 pages (via auto-page-creation or manual creation)
2. Navigate to page 2: `/labs/:labId/pages/:page2Id`

**Expected:**
- ✅ Pagination controls visible at top of editor
- ✅ Displays "Page 2 of 3"
- ✅ Pagination appears within 1 second of page load

**Acceptance Criteria:**
- SC-001: Page position identified within 1 second
- SC-004: Current page visually distinguishable (active state)

---

## Test Suite 2: Page Navigation (US2)

### Test 2.1: Navigate to Different Page
**Steps:**
1. Open multi-page lab (e.g., 5 pages)
2. Click page number "3" in pagination controls

**Expected:**
- ✅ URL changes to `/labs/:labId/pages/:page3Id`
- ✅ Page content updates to show page 3 questions
- ✅ Pagination indicator updates to "Page 3 of 5"
- ✅ Navigation completes in <500ms

**Acceptance Criteria:**
- SC-002: Navigation completes in <500ms (measure with Network tab)
- No errors in console
- Smooth transition without flicker

---

### Test 2.2: Rapid Navigation Clicks (Debounce Test)
**Steps:**
1. Open multi-page lab
2. Rapidly click page numbers 2, 3, 4, 5 in quick succession

**Expected:**
- ✅ Only the last clicked page loads (debouncing prevents intermediate navigations)
- ✅ No race conditions or stale state
- ✅ Final page displayed correctly

**Acceptance Criteria:**
- Debounced navigation works (300ms delay)
- No navigation errors

---

### Test 2.3: Navigation Error Handling
**Steps:**
1. Disconnect network or block backend API
2. Click a page number

**Expected:**
- ✅ Error notification appears: "Unable to load page. Please try again."
- ✅ User remains on current page
- ✅ Pagination controls remain functional

**Acceptance Criteria:**
- SC-006: Navigation errors show clear messaging

---

## Test Suite 3: Auto-Page-Creation Integration (US3)

### Test 3.1: Pagination Updates After New Page Creation
**Steps:**
1. Create a lab with 1 page
2. Add 3 questions to trigger auto-page-creation (feature 003)
3. Observe pagination after redirect to new page

**Expected:**
- ✅ After question save, user redirected to page 2
- ✅ Pagination appears (was hidden before)
- ✅ Displays "Page 2 of 2"
- ✅ Update completes within 1 second

**Acceptance Criteria:**
- SC-003: Pagination updates within 1 second after auto-creation
- SC-011: Pagination state accurate after auto-page-creation
- No flickering during transition

---

## Test Suite 4: Button States (US4)

### Test 4.1: First Page Boundary
**Steps:**
1. Navigate to page 1 of multi-page lab
2. Observe pagination buttons

**Expected:**
- ✅ "Previous" button is disabled (grayed out, cursor not-allowed)
- ✅ "Next" button is enabled
- ✅ Clicking disabled "Previous" has no effect

**Acceptance Criteria:**
- Disabled buttons don't trigger navigation
- Visual feedback clear (opacity, cursor)

---

### Test 4.2: Last Page Boundary
**Steps:**
1. Navigate to last page of multi-page lab (e.g., page 5 of 5)
2. Observe pagination buttons

**Expected:**
- ✅ "Next" button is disabled
- ✅ "Previous" button is enabled
- ✅ Clicking disabled "Next" has no effect

**Acceptance Criteria:**
- Boundary detection works correctly

---

## Test Suite 5: Mobile Responsiveness (US5)

### Test 5.1: Mobile Layout (320px - 767px)
**Steps:**
1. Open DevTools → Device Toolbar
2. Select iPhone SE (375px width)
3. Navigate to multi-page lab editor

**Expected:**
- ✅ Pagination controls adapt to mobile size (`size="sm"`)
- ✅ Fewer visible page numbers (ellipsis for >3 pages)
- ✅ Touch targets ≥44x44 pixels
- ✅ No horizontal scrolling
- ✅ Layout stacks vertically if needed

**Acceptance Criteria:**
- SC-008: Mobile layout works without breaking
- SC-009: Touch targets ≥44x44px

---

### Test 5.2: Tablet Layout (768px - 1023px)
**Steps:**
1. Set viewport to 768px (iPad)
2. Navigate to multi-page lab editor

**Expected:**
- ✅ Pagination controls use medium size
- ✅ More visible page numbers than mobile
- ✅ Layout horizontal (side-by-side)

---

### Test 5.3: Desktop Layout (1024px+)
**Steps:**
1. Set viewport to 1920px (desktop)
2. Navigate to multi-page lab editor

**Expected:**
- ✅ Pagination controls use medium size (`size="md"`)
- ✅ Maximum visible page numbers
- ✅ Optimal spacing and layout

---

## Test Suite 6: Keyboard Navigation & Accessibility (US6)

### Test 6.1: Tab Navigation
**Steps:**
1. Navigate to multi-page lab editor
2. Press **Tab** repeatedly to cycle through pagination controls

**Expected:**
- ✅ Focus moves through all page number buttons
- ✅ Focus indicators visible (outline/border)
- ✅ Focus skips disabled buttons

**Acceptance Criteria:**
- SC-007: Keyboard navigation works for all controls

---

### Test 6.2: Enter Key Activation
**Steps:**
1. Tab to a page number button
2. Press **Enter** key

**Expected:**
- ✅ Navigates to selected page
- ✅ Same behavior as mouse click

---

### Test 6.3: Arrow Key Navigation
**Steps:**
1. Focus on a page number button
2. Press **Left/Right Arrow** keys

**Expected:**
- ✅ Focus moves to adjacent page numbers (Mantine default behavior)
- ✅ Wraps around at boundaries (optional)

---

### Test 6.4: Screen Reader Compatibility
**Steps:**
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Navigate to pagination controls

**Expected:**
- ✅ Announces "Page navigation"
- ✅ Announces each page number
- ✅ Indicates current page clearly
- ✅ WCAG 2.1 Level AA compliant

**Tools:**
- Lighthouse (Chrome DevTools → Audits)
- axe DevTools (browser extension)

**Acceptance Criteria:**
- Lighthouse Accessibility Score ≥90
- No critical axe violations

---

## Test Suite 7: Performance Testing

### Test 7.1: Navigation Speed (SC-002)
**Steps:**
1. Open DevTools → Network tab
2. Enable "Slow 3G" throttling
3. Click a page number

**Expected:**
- ✅ Navigation completes in <500ms even on throttled connection
- ✅ Loading indicator appears during navigation

**Measurement:**
- Use "Timing" tab in Network panel
- Measure time from click to page render

---

### Test 7.2: Initial Render Performance
**Steps:**
1. Open DevTools → React DevTools → Profiler
2. Navigate to multi-page lab editor
3. Record render performance

**Expected:**
- ✅ Pagination renders in <100ms
- ✅ No unnecessary re-renders
- ✅ No layout shift (CLS = 0)

---

## Test Suite 8: Edge Cases

### Test 8.1: Labs with >7 Pages (Ellipsis Pagination)
**Steps:**
1. Create lab with 10 pages
2. Navigate to page 5

**Expected:**
- ✅ Ellipsis (...) appears between page numbers
- ✅ Shows pages: 1 ... 4 5 6 ... 10 (example)
- ✅ Can still navigate to any page

---

### Test 8.2: Browser Back/Forward Buttons
**Steps:**
1. Navigate page 1 → page 2 → page 3
2. Click browser **Back** button twice

**Expected:**
- ✅ Returns to page 1
- ✅ Pagination indicator updates correctly
- ✅ URL matches page state

**Acceptance Criteria:**
- SC-012: Browser back/forward works correctly

---

### Test 8.3: Deleted Page Handling (Pending Backend Implementation)
**Steps:**
1. Navigate to page 3 of 5
2. Backend deletes page 3 (via admin action)
3. User tries to navigate or refresh

**Expected:**
- ✅ Redirects to nearest valid page (page 2 or 4)
- ✅ Shows notification: "Page no longer exists"
- ✅ Pagination updates to show 4 total pages

**Status:** ⚠️ Requires backend support for deletion handling

---

## Test Suite 9: Integration Testing

### Test 9.1: Pagination + Auto-Page-Creation (Combined)
**Steps:**
1. Start with 1-page lab
2. Add questions to trigger auto-page-creation
3. Navigate back to page 1 via pagination
4. Add more questions on page 1
5. Verify pagination updates

**Expected:**
- ✅ Pagination appears after first auto-creation
- ✅ Navigation works between pages
- ✅ Pagination refreshes when new pages added
- ✅ No conflicts between features

---

## Accessibility Audit Checklist

### Lighthouse Audit
**Steps:**
1. Open Chrome DevTools → Lighthouse
2. Select "Accessibility" category
3. Run audit on page editor

**Target Metrics:**
- ✅ Accessibility Score: ≥90/100
- ✅ Best Practices Score: ≥90/100
- ✅ No critical issues

### axe DevTools Audit
**Steps:**
1. Install axe DevTools browser extension
2. Run scan on page editor
3. Review issues

**Target:**
- ✅ 0 critical issues
- ✅ 0 serious issues
- ⚠️ Minor issues acceptable (with justification)

---

## Performance Benchmarks

### Target Metrics (from spec.md)
- ✅ **SC-001**: Page position identified ≤1 second
- ✅ **SC-002**: Navigation completes ≤500ms
- ✅ **SC-003**: Pagination updates after auto-creation ≤1 second
- ✅ **SC-009**: Touch targets ≥44x44 pixels
- ⏳ **SC-010**: 95% navigation success rate (requires user testing)

### Measurement Tools
- Chrome DevTools Network tab (navigation speed)
- React DevTools Profiler (render performance)
- Lighthouse (overall performance)
- Real User Monitoring (production metrics)

---

## Known Issues to Test

1. **Backend totalPages Field**: Verify backend returns this field consistently
2. **Page Mapping Race Condition**: Test rapid page creation scenarios
3. **Deleted Page Handling**: Verify graceful degradation if page ID invalid
4. **URL State Sync**: Ensure URL always matches pagination state

---

## Sign-Off Checklist

### Before Marking Feature Complete
- [ ] All Test Suite 1-6 tests pass (core functionality)
- [ ] Performance benchmarks met (SC-001, SC-002, SC-003)
- [ ] Accessibility audit passes (Lighthouse ≥90, axe 0 critical)
- [ ] Mobile responsiveness verified on real devices
- [ ] Integration with auto-page-creation validated
- [ ] Edge cases handled gracefully
- [ ] No console errors or warnings
- [ ] Backend API compatibility confirmed
- [ ] User acceptance testing completed

### Documentation Sign-Off
- [ ] Implementation summary reviewed
- [ ] All tasks.md items marked complete
- [ ] Known limitations documented
- [ ] Deployment checklist complete

---

## Post-Testing Actions

### If Tests Pass
1. Mark remaining tasks (T059, T063-T066, T068-T069) as complete
2. Update IMPLEMENTATION_SUMMARY.md with test results
3. Create pull request with test evidence
4. Request code review from team
5. Merge to main branch
6. Deploy to staging environment
7. Conduct final UAT (User Acceptance Testing)

### If Tests Fail
1. Document failing tests in GitHub issues
2. Assign priority labels (P0 for blockers, P1 for critical)
3. Create hotfix branch for urgent issues
4. Re-test after fixes applied

---

## Contact

**Feature Owner**: Speckit Implementation Agent  
**Testing Lead**: (To be assigned)  
**QA Engineer**: (To be assigned)  
**Date Created**: 2025-01-17

---

**Happy Testing! 🚀**
