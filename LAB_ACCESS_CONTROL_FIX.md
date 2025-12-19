# Lab Access Control Fix

**Date:** 2025-12-18
**Issue:** Students were able to see lab details and Tests & Questions tab without purchasing paid labs.

## Problem
The lab monetization system was implemented, but access control was not enforced on the frontend and backend endpoints. Students could view:
1. Lab details page with full information
2. Tests & Questions tab with all page content
3. Individual page details including questions and diagram tests

This bypassed the purchase requirement for paid labs.

## Solution Implemented

### Backend Changes

#### 1. Enhanced Lab Detail Endpoint (`lab.routes.ts`)
- **Endpoint:** `GET /api/v1/labs/:labId`
- **Changes:**
  - Added access control check for published labs when user is a student
  - If student lacks access, return sanitized lab data (pages array emptied)
  - Include `requiresAccess: true` flag in response
  - Uses `accessControlService.canAccessLab()` to verify purchase/enrollment

```typescript
// If it's a published lab and user is a student, check access
if (lab.status === 'published' && userRole === 'student' && userId) {
  const accessResult = await accessControlService.canAccessLab(userId, labId);
  
  if (!accessResult.hasAccess) {
    // Return lab details but hide pages and sensitive content
    const sanitizedLab = {
      ...lab,
      pages: [], // Hide pages
    };
    return res.status(HTTP_STATUS.OK).json({ 
      data: sanitizedLab,
      requiresAccess: true,
      accessReason: accessResult.reason,
    });
  }
}
```

#### 2. Protected Page Detail Endpoint (`labpage.routes.ts`)
- **Endpoint:** `GET /api/v1/labs/:labId/pages/:pageId`
- **Changes:**
  - Check lab status first
  - If published lab and user is student, verify access
  - Return 403 Forbidden if access denied with clear message

```typescript
// If it's a published lab and user is a student, check access
if (lab.status === 'published' && userRole === 'student' && userId) {
  const accessResult = await accessControlService.canAccessLab(userId, labId);
  
  if (!accessResult.hasAccess) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: "You do not have access to this lab. Please purchase or enroll in a course to access.",
      reason: accessResult.reason,
      requiresAccess: true,
    });
  }
}
```

### Frontend Changes

#### 3. Lab Detail Page (`apps/web/app/labs/[id]/page.tsx`)
- **Added State Variable:**
  - `requiresAccess`: Boolean from backend indicating access is required

- **Enhanced `fetchLabData()`:**
  - Check for `requiresAccess` flag in backend response
  - Backend already filters pages array if access is denied

- **Simplified Access Control Logic:**
  - `canViewAccess = isPublished && isStudent && requiresAccess`
    - Shows purchase button ONLY when student needs to purchase
  - `canViewTests = isOwner || (isStudent && !requiresAccess)`
    - Shows tests when owner OR when student has access (requiresAccess is false)

- **Tests Tab Protection:**
  - Display "Access Required" message when student lacks access
  - Show purchase button in blocked state
  - Hide all page content until access granted

```typescript
// Simplified logic - single source of truth from backend
const canViewAccess = isPublished && isStudent && requiresAccess;
const canViewTests = isOwner || (isStudent && !requiresAccess);

// In Tests tab:
{!canViewTests && isPublished && isStudent && requiresAccess ? (
  <Paper shadow="sm" p="xl" withBorder bg="yellow.0">
    <Stack align="center" gap="md">
      <Text size="xl" fw={600}>🔒 Access Required</Text>
      <Text c="dimmed" ta="center" size="lg">
        You need to purchase this lab or enroll in a course to view tests and questions.
      </Text>
      <LabAccessButton
        labId={labId}
        labTitle={lab.name}
        pricing={lab.pricing}
        onAccessGranted={() => {
          fetchLabData();
        }}
      />
    </Stack>
  </Paper>
) : (
  // Show tests content
)}
```

#### 4. Page Detail View (`apps/web/app/labs/[id]/pages/[pageId]/page.tsx`)
- **Enhanced Error Handling:**
  - Detect 403 access control errors
  - Show appropriate notification (yellow for access error, red for other errors)
  - Auto-redirect students back to lab detail page after 2 seconds

```typescript
const isAccessError = error?.response?.status === 403 || error?.response?.data?.requiresAccess;

if (isAccessError && isStudent) {
  setTimeout(() => {
    router.push(`/labs/${labId}?tab=details`);
  }, 2000);
}
```

## Access Control Flow

### For Free Labs
1. Student visits lab detail page
2. Backend checks: `pricing.purchaseType === 'free'`
3. Access granted automatically
4. Student sees all content

### For Paid Labs (Not Purchased)
1. Student visits lab detail page
2. Backend detects: published lab + student role + no purchase
3. Backend returns: lab info with `pages: []` and `requiresAccess: true`
4. Frontend hides Tests tab content
5. Frontend shows purchase button
6. Student attempts to view page directly → 403 error → redirect

### For Paid Labs (Purchased)
1. Student visits lab detail page
2. Backend checks purchases via `accessControlService.canAccessLab()`
3. Purchase found → access granted
4. Student sees all content

### For Instructors/Owners
- No access control applied
- Full access to draft and published labs they own

## Files Modified

### Backend
1. `apps/whatsnxt-bff/app/routes/lab.routes.ts`
   - Added imports for accessControlService
   - Enhanced GET /:labId endpoint with access control

2. `apps/whatsnxt-bff/app/routes/labpage.routes.ts`
   - Added imports for accessControlService and Lab model
   - Enhanced GET /:labId/pages/:pageId endpoint with access control

### Frontend
1. `apps/web/app/labs/[id]/page.tsx`
   - Added access state management
   - Protected Tests & Questions tab
   - Enhanced access button visibility logic

2. `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
   - Enhanced error handling for access control
   - Auto-redirect on access denial

## Testing Checklist

- [ ] Student viewing free lab → no purchase button, sees all content
- [ ] Student viewing paid lab (not purchased) → purchase button visible, tests blocked
- [ ] Student viewing paid lab (purchased) → no purchase button, sees all content
- [ ] Student trying direct page URL (not purchased) → 403 error + redirect
- [ ] Instructor viewing own draft lab → edit buttons visible, full access
- [ ] Instructor viewing own published lab → no purchase button, full access
- [ ] Purchase flow → access granted immediately, purchase button disappears
- [ ] Non-student users (guests) → no purchase button on published labs

## Access Control Truth Table

| User Role   | Lab Status  | Has Purchase | requiresAccess | canViewAccess | canViewTests |
|-------------|-------------|--------------|----------------|---------------|--------------|
| Student     | Published   | No (Paid)    | true           | true ✓        | false        |
| Student     | Published   | Yes          | false          | false         | true ✓       |
| Student     | Published   | N/A (Free)   | false          | false         | true ✓       |
| Instructor  | Published   | N/A (Owner)  | false          | false         | true ✓       |
| Instructor  | Draft       | N/A (Owner)  | false          | false         | true ✓       |
| Guest       | Published   | No           | N/A            | false         | false        |

## Security Notes

1. **Defense in Depth:** Access control enforced at multiple layers:
   - Backend API endpoints (primary protection)
   - Frontend UI (user experience)
   - Direct URL access blocked

2. **Consistent Checking:** Same `accessControlService.canAccessLab()` used throughout:
   - Lab detail endpoint
   - Page detail endpoint
   - Purchase verification endpoint

3. **Instructor Bypass:** Instructors always have access to their own labs regardless of status

4. **Course Enrollment:** Placeholder exists for future course-based access (currently returns false)

## Future Enhancements

1. Add access control to test submission endpoints
2. Implement course enrollment access path
3. Add rate limiting to prevent access check abuse
4. Consider WebSocket real-time access updates
5. Add analytics for access denial events
