# Quickstart Guide: Streamline Lab Creation Flow

**Feature Branch**: `001-streamline-lab-creation`  
**Date**: 2026-01-11  
**Status**: Implementation Ready

## Overview

This guide provides developers with everything needed to implement the streamlined lab creation flow. The feature automatically creates a default page when instructors create a new lab and immediately redirects them to the page editor.

---

## Prerequisites

- Node.js 24 LTS installed
- MongoDB running (localhost:27017 or configured)
- Backend API running (localhost:4444)
- pnpm 10+ installed
- Repository cloned and dependencies installed

---

## Quick Start (5 minutes)

### 1. Checkout Feature Branch
```bash
cd /path/to/whatsnxt-mfe
git checkout 001-streamline-lab-creation
pnpm install
```

### 2. Start Backend API
```bash
# Backend runs separately at localhost:4444
# Ensure backend service is running before frontend development
```

### 3. Start Frontend Development Server
```bash
pnpm dev
# Frontend runs at http://localhost:3001
```

### 4. Test Lab Creation Flow
```bash
# 1. Navigate to: http://localhost:3001/lab/create
# 2. Fill out lab form (name, type, architecture)
# 3. Submit form
# 4. Verify redirect to page editor: /labs/[id]/pages/[pageId]
# 5. Click "Back to Lab" button
# 6. Verify lab detail page shows default page
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                 │
│                     http://localhost:3001                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. LabForm Component                                        │
│     └─ Submits lab data                                      │
│                                                               │
│  2. Next.js API Route (/api/lab/create)                      │
│     └─ Forwards request to backend                           │
│                                                               │
│  3. Receives response with lab + defaultPageId               │
│     └─ Redirects to: /labs/{id}/pages/{defaultPageId}       │
│                                                               │
│  4. Page Editor (LabPageEditorPage)                          │
│     └─ Instructor adds questions/diagrams                    │
│                                                               │
│  5. "Back to Lab" button                                     │
│     └─ Navigates to: /labs/{id}                              │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js v5)                 │
│                     http://localhost:4444                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/v1/labs                                           │
│     ├─ Start MongoDB transaction                             │
│     ├─ Create Lab document                                   │
│     ├─ Create LabPage document (pageNumber: 1)              │
│     ├─ Commit transaction                                    │
│     └─ Return lab with defaultPageId                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Database                          │
│                  localhost:27017/whatsnxt-local              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Collections:                                                │
│    - labs (Lab documents)                                    │
│    - labPages (LabPage documents)                            │
│                                                               │
│  Transaction: Atomic lab + page creation                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Backend Changes (apps/whatsnxt-bff)

#### ☐ 1. Update Lab Service
**File**: `apps/whatsnxt-bff/app/services/lab.service.js`

**Add method**:
```javascript
/**
 * Create lab with default page in atomic transaction
 * @param {Object} labData - Lab creation data
 * @returns {Object} Lab with defaultPageId
 */
async function createLabWithDefaultPage(labData) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Create lab
    const [lab] = await Lab.create([{
      ...labData,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    }], { session });
    
    // Create default page
    const [defaultPage] = await LabPage.create([{
      labId: lab.id,
      pageNumber: 1,
      hasQuestion: false,
      hasDiagramTest: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { session });
    
    await session.commitTransaction();
    
    return {
      ...lab.toObject(),
      defaultPageId: defaultPage.id
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { createLabWithDefaultPage };
```

#### ☐ 2. Update Lab Routes
**File**: `apps/whatsnxt-bff/app/routes/lab.routes.js`

**Modify POST /labs endpoint**:
```javascript
const { createLabWithDefaultPage } = require('../services/lab.service');

router.post('/labs', async (req, res) => {
  try {
    const labData = req.body;
    
    // Validate required fields
    if (!labData.name || !labData.labType || !labData.architectureType) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields: name, labType, architectureType',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Create lab with default page
    const lab = await createLabWithDefaultPage(labData);
    
    return res.status(201).json({
      message: 'Lab created successfully',
      data: lab
    });
  } catch (error) {
    console.error('Lab creation error:', error);
    return res.status(500).json({
      error: 'Transaction Failed',
      message: 'Failed to create lab and default page. Please try again.',
      code: 'TRANSACTION_FAILED',
      details: {
        operation: 'create_lab_with_page',
        reason: error.message
      }
    });
  }
});
```

#### ☐ 3. Add Unit Tests
**File**: `apps/whatsnxt-bff/app/tests/lab.service.test.js`

```javascript
describe('Lab Service - createLabWithDefaultPage', () => {
  it('should create lab and default page atomically', async () => {
    const labData = {
      name: 'Test Lab',
      labType: 'diagram-test',
      architectureType: 'AWS',
      instructorId: 'instructor-uuid'
    };
    
    const result = await createLabWithDefaultPage(labData);
    
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('defaultPageId');
    expect(result.name).toBe('Test Lab');
    
    // Verify page exists
    const page = await LabPage.findById(result.defaultPageId);
    expect(page.pageNumber).toBe(1);
    expect(page.labId).toBe(result.id);
  });
  
  it('should rollback if page creation fails', async () => {
    // Mock LabPage.create to fail
    jest.spyOn(LabPage, 'create').mockRejectedValue(new Error('Page creation failed'));
    
    await expect(createLabWithDefaultPage(labData)).rejects.toThrow();
    
    // Verify no lab was created
    const labCount = await Lab.countDocuments({ name: 'Test Lab' });
    expect(labCount).toBe(0);
  });
});
```

---

### Frontend Changes (apps/web)

#### ☐ 1. Update API Client
**File**: `apps/web/apis/lab.api.ts`

**Modify createLab to handle defaultPageId**:
```typescript
// Type already expects defaultPageId in response
// No changes needed to labApi.createLab method
// Response already typed to include defaultPageId
```

#### ☐ 2. Update LabForm Component
**File**: `apps/web/components/Lab/LabForm.tsx`

**Modify onSubmit handler** (lines 122-182):
```typescript
const onSubmit = async (data: Lab, status: 'DRAFT' | 'PUBLISHED') => {
  setIsSubmitting(true);
  try {
    // ... existing validation ...
    
    const url = initialData?.id ? `/api/lab/${initialData.id}` : '/api/lab/create';
    const method = initialData?.id ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to ${initialData ? 'update' : 'create'} lab`);
    }
    
    const result = await response.json();
    
    notifications.show({
      title: 'Success',
      message: `Lab ${initialData ? 'updated' : 'created'} successfully`,
      color: 'green',
    });
    
    // NEW: Redirect to page editor if creating new lab
    if (!initialData && result.data.defaultPageId) {
      router.push(`/labs/${result.data.id}/pages/${result.data.defaultPageId}`);
    } else {
      // Edit mode: stay on labs list
      router.push('/labs');
    }
  } catch (error) {
    notifications.show({
      title: 'Error',
      message: `Failed to ${initialData ? 'update' : 'create'} lab`,
      color: 'red',
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

#### ☐ 3. Update Next.js API Route
**File**: `apps/web/app/api/lab/create/route.ts`

**Ensure response includes defaultPageId**:
```typescript
export async function POST(request: Request) {
  try {
    const body: Lab = await request.json();
    
    // ... existing validation ...
    
    const savedLab = await createLab(body);
    
    if (!savedLab) {
      throw new Error('Failed to create lab in backend');
    }
    
    // Response now includes defaultPageId from backend
    return NextResponse.json({ 
      success: true, 
      data: savedLab  // Contains defaultPageId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lab:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

#### ☐ 4. Verify Page Editor Navigation
**File**: `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`

**Verify "Back to Lab" button exists** (around line 200+):
```typescript
<Button 
  variant="default"
  onClick={() => router.push(`/labs/${labId}`)}
>
  Back to Lab
</Button>
```

**No changes needed** - button already exists

#### ☐ 5. Add Frontend Tests
**File**: `apps/web/__tests__/lab-creation-flow.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LabForm from '@/components/Lab/LabForm';

describe('Lab Creation Flow', () => {
  it('should redirect to page editor after lab creation', async () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }));
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'lab-123',
            defaultPageId: 'page-456'
          }
        })
      })
    );
    
    render(<LabForm />);
    
    await userEvent.type(screen.getByLabelText('Lab Title'), 'Test Lab');
    await userEvent.click(screen.getByText('Publish Lab'));
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/labs/lab-123/pages/page-456');
    });
  });
});
```

---

### Shared Types Updates

#### ☐ 1. Update Lab Type (if needed)
**File**: `packages/core-types/src/Lab.ts`

**Verify Lab interface includes optional defaultPageId**:
```typescript
export interface Lab extends BaseEntity {
  id: string;
  name: string;
  description?: string;
  labType: string;
  architectureType: string;
  instructorId: string;
  status: 'draft' | 'published';
  pricing?: any;
  associatedCourses?: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Optional: Only present in creation response
  defaultPageId?: string;
}
```

---

## Testing Strategy

### Manual Testing Checklist

#### ☐ Test 1: Happy Path - Lab Creation
1. Navigate to http://localhost:3001/lab/create
2. Fill form: Name="Test Lab", Type="diagram-test", Architecture="AWS"
3. Click "Publish Lab"
4. **Verify**: Redirected to `/labs/[id]/pages/[pageId]`
5. **Verify**: Page editor loads with empty page
6. **Verify**: Can add question or diagram test
7. Click "Back to Lab"
8. **Verify**: Lab detail page shows lab info
9. **Verify**: "Tests" tab shows default page (pageNumber: 1)

#### ☐ Test 2: Transaction Rollback
1. Simulate page creation failure (e.g., database constraint violation)
2. Submit lab creation form
3. **Verify**: Error notification shown
4. **Verify**: No lab created in database
5. **Verify**: No orphaned page in database

#### ☐ Test 3: Edit Existing Lab
1. Navigate to edit page for existing lab
2. Modify lab details
3. Click "Save Changes"
4. **Verify**: No redirect to page editor (stays on labs list)
5. **Verify**: Lab updates successfully

#### ☐ Test 4: Direct URL Access
1. Create a lab (get lab ID)
2. Directly navigate to `/labs/[id]`
3. **Verify**: Lab detail page shown (no redirect)
4. **Verify**: All pages visible in tests tab

#### ☐ Test 5: Concurrent Requests
1. Rapidly click "Publish Lab" multiple times
2. **Verify**: Only one lab created
3. **Verify**: Submit button disabled after first click

---

### Automated Testing Commands

```bash
# Run backend unit tests
cd apps/whatsnxt-bff
npm test -- lab.service.test.js

# Run frontend unit tests
cd apps/web
pnpm test -- lab-creation-flow.test.tsx

# Run integration tests
pnpm test:integration

# Run all tests
pnpm test
```

---

## Troubleshooting

### Issue: Transaction timeout
**Symptom**: "Transaction Failed" error after 30 seconds

**Solution**:
1. Check MongoDB connection: `mongosh --eval "db.adminCommand('ping')"`
2. Verify MongoDB version supports transactions (4.0+)
3. Increase timeout in backend: `session.startTransaction({ maxTimeMS: 60000 })`

### Issue: Redirect not working
**Symptom**: Form submission succeeds but no redirect

**Solution**:
1. Check browser console for errors
2. Verify `defaultPageId` in API response: Inspect network tab
3. Verify router.push() is called: Add console.log before redirect
4. Check Next.js routing: Ensure page exists at target URL

### Issue: Orphaned labs without pages
**Symptom**: Labs exist but have no pages in database

**Solution**:
1. Verify transactions are enabled: `session.startTransaction()` called
2. Check MongoDB replica set: Transactions require replica set
3. Run cleanup script to add default pages to existing labs

### Issue: 403 Forbidden on lab creation
**Symptom**: "Only instructors can create labs" error

**Solution**:
1. Verify JWT token includes correct role
2. Check authentication middleware
3. Ensure user has 'trainer' or 'instructor' role

---

## Performance Benchmarks

Expected performance metrics:

| Operation | Target | Typical |
|-----------|--------|---------|
| Lab creation API call | <500ms | ~300ms |
| Page editor load | <2s | ~1.5s |
| Total time to editor | <5s | ~3s |
| Transaction overhead | <50ms | ~30ms |

---

## Rollback Plan

If issues occur in production:

1. **Revert backend changes**:
   ```bash
   git revert <commit-hash>
   # Redeploy backend
   ```

2. **Revert frontend changes**:
   ```bash
   git revert <commit-hash>
   # Redeploy frontend
   ```

3. **No database migration needed** - existing data unaffected

4. **Labs created during feature deployment**:
   - Will have default pages (safe)
   - Can be manually managed if feature is reverted

---

## Resources

- **Feature Spec**: `specs/001-streamline-lab-creation/spec.md`
- **Data Model**: `specs/001-streamline-lab-creation/data-model.md`
- **API Contract**: `specs/001-streamline-lab-creation/contracts/create-lab-api.json`
- **Research**: `specs/001-streamline-lab-creation/research.md`
- **Mantine Notifications**: https://mantine.dev/others/notifications/
- **MongoDB Transactions**: https://www.mongodb.com/docs/manual/core/transactions/

---

## Next Steps

After completing implementation:

1. ☐ Run all tests (unit + integration)
2. ☐ Test manually with checklist above
3. ☐ Request code review from team
4. ☐ Update agent context with new patterns
5. ☐ Merge to main branch
6. ☐ Deploy to staging environment
7. ☐ Perform smoke tests in staging
8. ☐ Deploy to production
9. ☐ Monitor error rates and performance

---

**Questions?** Contact the team or refer to the research document for technical details.
