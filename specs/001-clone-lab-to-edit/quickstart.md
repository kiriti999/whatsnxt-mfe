# Quickstart Guide: Clone Published Lab to Edit

**Feature**: 001-clone-lab-to-edit  
**Date**: 2025-01-17  
**For**: Developers implementing and testing the clone/republish feature

## Overview

This guide helps developers set up their local environment, understand the feature implementation, and test the clone-and-republish workflow.

---

## 1. Prerequisites

### Required Software
- **Node.js**: 20+ (LTS)
- **pnpm**: 10+
- **MongoDB**: 7.x (local or Docker)
- **Git**: Latest version

### Required Access
- Clone access to `whatsnxt-mfe` repository (frontend)
- Clone access to `whatsnxt-bff` repository (backend)
- Local MongoDB instance or connection string

---

## 2. Initial Setup

### 2.1 Clone Repositories

```bash
# Frontend repository
cd ~/projects
git clone https://github.com/your-org/whatsnxt-mfe.git
cd whatsnxt-mfe
git checkout -b 001-clone-lab-to-edit

# Backend repository (separate location)
cd ~/projects
git clone https://github.com/your-org/whatsnxt-bff.git
cd whatsnxt-bff
git checkout -b 001-clone-lab-to-edit
```

### 2.2 Install Dependencies

```bash
# Frontend
cd ~/projects/whatsnxt-mfe
pnpm install

# Backend
cd ~/projects/whatsnxt-bff
pnpm install
```

### 2.3 Environment Configuration

**Backend** (`whatsnxt-bff/.env`):
```bash
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/whatsnxt-dev

# Authentication
JWT_SECRET=your-jwt-secret-here

# Server
PORT=3001
NODE_ENV=development

# Logging
LOG_LEVEL=debug
```

**Frontend** (`whatsnxt-mfe/apps/web/.env.local`):
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Authentication
NEXT_PUBLIC_AUTH_DOMAIN=dev.whatsnxt.com
```

### 2.4 Start MongoDB

**Option A: Local Install**
```bash
mongod --dbpath ~/data/db
```

**Option B: Docker**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

---

## 3. Seed Test Data

### 3.1 Create Test Instructor User

```bash
cd ~/projects/whatsnxt-bff
node scripts/seed-test-user.js
# Output: Created user with ID: instructor-001
```

### 3.2 Create Published Lab with Content

```bash
# Run seed script to create a published lab with:
# - 5 pages
# - 20 questions (4 per page)
# - 2 diagram tests
# - Hints on diagram tests

node scripts/seed-test-lab.js --instructorId=instructor-001 --pages=5 --questions=20
# Output: Created lab with ID: lab-abc-123 (published)
```

**Expected Database State**:
```
lab_diagram_tests: 1 document (lab-abc-123, status: published)
lab_pages: 5 documents
questions: 20 documents
diagram_tests: 2 documents
```

---

## 4. Running the Application

### 4.1 Start Backend Server

```bash
cd ~/projects/whatsnxt-bff
pnpm dev
# Server running on http://localhost:3001
```

**Verify Backend**:
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"2025-01-17T10:00:00Z"}
```

### 4.2 Start Frontend Dev Server

```bash
cd ~/projects/whatsnxt-mfe
pnpm dev
# Next.js running on http://localhost:3000
```

**Verify Frontend**:
- Navigate to: http://localhost:3000
- Login with test instructor credentials
- Navigate to: http://localhost:3000/labs

---

## 5. Testing the Clone Workflow

### 5.1 Clone a Published Lab (API)

```bash
# Get JWT token (replace with your auth flow)
export TOKEN="your-jwt-token-here"

# Clone the published lab
curl -X POST http://localhost:3001/api/labs/lab-abc-123/clone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (201 Created):
{
  "success": true,
  "data": {
    "lab": {
      "id": "lab-xyz-789",
      "status": "draft",
      "name": "AWS Basics",
      "clonedFromLabId": "lab-abc-123",
      "createdAt": "2025-01-17T10:30:00Z"
    },
    "metadata": {
      "pageCount": 5,
      "questionCount": 20,
      "diagramTestCount": 2
    }
  }
}
```

### 5.2 Verify Clone in Database

```bash
# Connect to MongoDB
mongosh whatsnxt-dev

# Check cloned lab
db.lab_diagram_tests.findOne({ id: "lab-xyz-789" })
# Should have: status: "draft", clonedFromLabId: "lab-abc-123"

# Check cloned pages
db.lab_pages.find({ labId: "lab-xyz-789" }).count()
# Should return: 5

# Check cloned questions
db.questions.find({ labId: "lab-xyz-789" }).count()
# Should return: 20
```

### 5.3 Attempt Duplicate Clone (Should Fail)

```bash
# Try to clone the same lab again
curl -X POST http://localhost:3001/api/labs/lab-abc-123/clone \
  -H "Authorization: Bearer $TOKEN"

# Expected Response (409 Conflict):
{
  "success": false,
  "error": {
    "code": "DUPLICATE_CLONE",
    "message": "A draft clone already exists for this lab.",
    "details": {
      "existingDraftId": "lab-xyz-789",
      "existingDraftUrl": "/labs/lab-xyz-789/edit"
    }
  }
}
```

---

## 6. Testing the Republish Workflow

### 6.1 Edit the Draft Clone

```bash
# Update a question in the draft (simulate instructor editing)
mongosh whatsnxt-dev

db.questions.updateOne(
  { labId: "lab-xyz-789", questionText: /What is AWS/ },
  { $set: { questionText: "What is Amazon Web Services (AWS)?" } }
)
```

### 6.2 Republish the Draft

```bash
# Republish the draft to replace the original
curl -X POST http://localhost:3001/api/labs/lab-xyz-789/republish \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Expected Response (200 OK):
{
  "success": true,
  "data": {
    "lab": {
      "id": "lab-abc-123",  // Original lab ID (preserved)
      "status": "published",
      "name": "AWS Basics",
      "clonedFromLabId": null,  // No longer a clone
      "updatedAt": "2025-01-17T11:00:00Z"
    },
    "metadata": {
      "questionsPreserved": 19,  // 19 unchanged questions kept same ID
      "questionsNew": 1  // 1 edited question got new ID
    }
  }
}
```

### 6.3 Verify Republish in Database

```bash
mongosh whatsnxt-dev

# Original lab should be updated
db.lab_diagram_tests.findOne({ id: "lab-abc-123" })
# Should have: status: "published", updatedAt: recent timestamp

# Draft should be deleted
db.lab_diagram_tests.findOne({ id: "lab-xyz-789" })
# Should return: null

# Check question count (should still be 20)
db.questions.find({ labId: "lab-abc-123" }).count()
# Should return: 20

# Verify edited question has updated text
db.questions.findOne({ labId: "lab-abc-123", questionText: /Amazon Web Services/ })
# Should exist with new text
```

---

## 7. Testing Student Progress Preservation

### 7.1 Simulate Student Submissions

```bash
# Create student submission for question that will remain unchanged
mongosh whatsnxt-dev

db.student_submissions.insertOne({
  id: "sub-001",
  studentId: "student-001",
  questionId: "q1-unchanged",  // This question won't be edited
  answer: "Amazon Web Services",
  isCorrect: true,
  submittedAt: new Date()
})
```

### 7.2 Clone and Republish

```bash
# 1. Clone the lab (creates draft with new question IDs)
curl -X POST http://localhost:3001/api/labs/lab-abc-123/clone -H "Authorization: Bearer $TOKEN"

# 2. Don't edit the question (keep it identical)

# 3. Republish (should preserve question ID for unchanged questions)
curl -X POST http://localhost:3001/api/labs/lab-xyz-789/republish -H "Authorization: Bearer $TOKEN"
```

### 7.3 Verify Progress Preserved

```bash
mongosh whatsnxt-dev

# Check if student submission still references valid question
db.student_submissions.aggregate([
  { $match: { id: "sub-001" } },
  {
    $lookup: {
      from: "questions",
      localField: "questionId",
      foreignField: "id",
      as: "question"
    }
  }
])

# Should return submission with populated question (progress preserved)
```

---

## 8. Testing UI Components (Frontend)

### 8.1 Clone Button

1. Navigate to: `http://localhost:3000/labs/lab-abc-123`
2. Look for **"Clone to Edit"** button (only visible to lab owner)
3. Click button → Should show loading state
4. After success → Should redirect to `/labs/lab-xyz-789/edit`

### 8.2 Republish Modal

1. Navigate to draft lab: `http://localhost:3000/labs/lab-xyz-789/edit`
2. Click **"Publish"** button
3. Should show confirmation modal:
   - Title: "Republish Lab?"
   - Message: "This will replace the original published lab. Students will see the updated content."
   - Buttons: "Cancel" and "Confirm Republish"
4. Click **"Confirm Republish"**
5. Should redirect to original lab: `/labs/lab-abc-123`

### 8.3 Draft Indicator

1. Navigate to published lab with active draft: `http://localhost:3000/labs/lab-abc-123`
2. Should display badge: **"Draft in Progress"**
3. Click badge → Should link to draft: `/labs/lab-xyz-789/edit`

---

## 9. Testing Error Scenarios

### 9.1 Unauthorized Clone Attempt

```bash
# Try to clone another instructor's lab
curl -X POST http://localhost:3001/api/labs/other-instructor-lab/clone \
  -H "Authorization: Bearer $TOKEN"

# Expected: 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to clone this lab."
  }
}
```

### 9.2 Clone Non-Existent Lab

```bash
curl -X POST http://localhost:3001/api/labs/invalid-lab-id/clone \
  -H "Authorization: Bearer $TOKEN"

# Expected: 404 Not Found
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Lab not found with ID: invalid-lab-id"
  }
}
```

### 9.3 Republish Non-Clone Lab

```bash
# Try to republish a lab that wasn't cloned
curl -X POST http://localhost:3001/api/labs/lab-original/republish \
  -H "Authorization: Bearer $TOKEN"

# Expected: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "NOT_A_CLONE",
    "message": "Cannot republish: This lab is not a clone."
  }
}
```

---

## 10. Running Tests

### 10.1 Backend Unit Tests

```bash
cd ~/projects/whatsnxt-bff
pnpm test app/services/LabCloneService.test.ts
# Should run ~15 unit tests (clone logic, ID generation, validation)

pnpm test app/services/LabService.test.ts
# Should run ~10 tests (republish logic, question matching)
```

### 10.2 Backend Integration Tests

```bash
cd ~/projects/whatsnxt-bff
pnpm test:integration app/tests/integration/lab-clone.test.ts
# Should run ~8 integration tests (full clone workflow with MongoDB)

pnpm test:integration app/tests/integration/lab-republish.test.ts
# Should run ~6 integration tests (full republish workflow)
```

### 10.3 Frontend Component Tests

```bash
cd ~/projects/whatsnxt-mfe/apps/web
pnpm test components/Lab/CloneLabButton.test.tsx
# Should run ~5 component tests (button render, click handler, loading state)

pnpm test components/Lab/RepublishModal.test.tsx
# Should run ~7 component tests (modal, confirmation, cancel, submit)
```

---

## 11. Common Issues and Solutions

### Issue 1: "Transaction timeout" error during clone

**Cause**: Large lab with 100+ pages taking >30 seconds

**Solution**: Increase transaction timeout in LabCloneService
```typescript
const session = await mongoose.startSession({
  defaultTransactionOptions: {
    maxCommitTimeMS: 60000  // 60 seconds
  }
});
```

### Issue 2: Student progress not preserved after republish

**Cause**: Question text has minor whitespace differences

**Solution**: Normalize whitespace in matching algorithm
```typescript
const normalizedText = questionText.trim().replace(/\s+/g, ' ');
```

### Issue 3: Duplicate clone error even after deleting draft

**Cause**: Draft still exists in database (soft delete?)

**Solution**: Ensure hard delete in republish operation
```typescript
await LabModel.deleteOne({ id: draftLabId }, { session });
```

### Issue 4: Frontend shows stale data after republish

**Cause**: TanStack Query cache not invalidated

**Solution**: Invalidate cache on republish success
```typescript
queryClient.invalidateQueries(['labs', originalLabId]);
```

---

## 12. Development Workflow

### Typical Feature Development Flow

1. **Start Backend**: `cd whatsnxt-bff && pnpm dev`
2. **Start Frontend**: `cd whatsnxt-mfe && pnpm dev`
3. **Make Code Changes**:
   - Backend: Edit files in `app/services/`, `app/routes/`
   - Frontend: Edit files in `apps/web/components/Lab/`
4. **Test Manually**: Use curl or UI to verify changes
5. **Run Tests**: `pnpm test` (backend) or `pnpm test` (frontend)
6. **Commit Changes**: `git add . && git commit -m "feat: implement clone button"`
7. **Push to Branch**: `git push origin 001-clone-lab-to-edit`

### Debugging Tips

**Backend**:
- Use Winston logs: `logger.debug('Clone operation started', { labId })`
- Enable MongoDB query logging: `mongoose.set('debug', true)`
- Use VS Code debugger with breakpoints in services

**Frontend**:
- Use React DevTools to inspect component state
- Check Network tab for API request/response
- Use TanStack Query DevTools to inspect cache

**Database**:
- Use MongoDB Compass GUI to browse collections
- Use `mongosh` CLI for quick queries
- Enable MongoDB profiling for slow queries

---

## 13. Next Steps After Setup

1. ✅ Verify all tests pass: `pnpm test`
2. ✅ Test clone workflow manually (API + UI)
3. ✅ Test republish workflow manually (API + UI)
4. ✅ Review code for constitution compliance
5. ✅ Create PR with feature branch
6. ✅ Request code review from team

---

## 14. References

- **Feature Spec**: `specs/001-clone-lab-to-edit/spec.md`
- **Implementation Plan**: `specs/001-clone-lab-to-edit/plan.md`
- **Research**: `specs/001-clone-lab-to-edit/research.md`
- **Data Model**: `specs/001-clone-lab-to-edit/data-model.md`
- **API Contracts**: `specs/001-clone-lab-to-edit/contracts/`
- **Constitution**: `.specify/memory/constitution.md`

---

## 15. Getting Help

- **Slack Channel**: #whatsnxt-dev
- **Team Lead**: @tech-lead
- **Documentation**: https://docs.whatsnxt.com
- **GitHub Issues**: https://github.com/your-org/whatsnxt-mfe/issues

---

**Last Updated**: 2025-01-17  
**Maintained By**: WhatsNxt Engineering Team
