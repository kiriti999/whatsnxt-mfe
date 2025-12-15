# Student Test Mode Implementation - Summary

## What Was Implemented

### 1. Frontend Components

#### StudentTestRunner Component (`apps/web/components/Lab/StudentTestRunner.tsx`)
- Unified test runner for both question tests and diagram tests
- Handles question navigation with Previous/Next buttons
- Shows jumbled diagrams for diagram tests (uses `jumbleGraph` utility)
- Calculates scores for both test types
- Submits answers to backend
- Shows completion screen with score and pass/fail status
- Supports retry for failed tests

### 2. Backend API

#### Student Submission Model (`apps/whatsnxt-bff/app/models/lab/StudentSubmission.ts`)
- Stores student submissions with:
  - Student ID, Lab ID, Page ID
  - Question answers (key-value map)
  - Diagram answer (nodes and links)
  - Score (0-100)
  - Pass/fail status
  - Submission timestamp
- Compound indexes for efficient queries
- Static methods for finding submissions and calculating progress

#### API Endpoints (`apps/whatsnxt-bff/app/routes/lab.routes.ts`)
- `POST /api/v1/lab/:labId/pages/:pageId/submit` - Submit student test
- `GET /api/v1/lab/:labId/pages/:pageId/submission` - Get previous submission

#### Lab Service Methods (`apps/whatsnxt-bff/app/services/lab/LabService.ts`)
- `submitTest()` - Creates/updates student submission
- `getStudentSubmission()` - Retrieves student's previous submission
- `getStudentProgress()` - Calculates student progress in a lab

### 3. Frontend Integration

#### Modified Page Component (`apps/web/app/labs/[id]/pages/[pageId]/page.tsx`)
- Added user role detection (student vs trainer)
- Conditional rendering:
  - Students see `StudentTestRunner` for published labs
  - Trainers see editor mode
- Added `handleStudentSubmit()` function to submit tests
- Transforms question/diagram data for StudentTestRunner

#### API Client (`apps/web/apis/lab.api.ts`)
- Added `submitTest()` method
- Added `getSubmission()` method

#### Next.js API Route (`apps/web/app/api/lab/[id]/pages/[pageId]/submit/route.ts`)
- Forwards submission requests to backend
- Handles both POST (submit) and GET (retrieve) requests

### 4. Existing Features Used

#### Utilities (`apps/web/utils/lab-utils.ts`)
- `jumbleGraph()` - Randomizes shape positions, removes all links
- `validateGraph()` - Compares student diagram to master, calculates score

## How It Works

### Student Flow

1. **Login**: Student logs in with role = 'student'
2. **View Lab**: Student navigates to published lab
3. **Start Test**: Student opens a page with tests
4. **Take Test**: 
   - For questions: Answer multiple choice questions, navigate with Previous/Next
   - For diagrams: Reconstruct architecture by dragging shapes and creating connections
5. **Submit**: Student clicks "Submit Test"
6. **Scoring**:
   - Question score: % of correct answers
   - Diagram score: % of correct connections (via `validateGraph`)
   - Overall score: Average of both (if both exist)
7. **Result**: 
   - Pass: score === 100%
   - Fail: score < 100%, option to retry
8. **Storage**: Submission saved to database with timestamp

### Trainer Flow

1. **Create Test**: Trainer creates questions and diagram test
2. **Publish Lab**: Trainer publishes lab (makes it available to students)
3. **View Mode**: Trainer can view published tests but cannot edit
4. **Future**: View student submissions and scores (not yet implemented)

## Key Features

- **Jumbled Diagrams**: All connections removed, shapes randomized
- **Scoring**: Automatic scoring based on correct answers/connections
- **Pass Criteria**: 100% score required to pass
- **Retry**: Students can retry failed tests
- **Persistence**: Submissions stored in database
- **Role-Based**: Different views for students vs trainers
- **Real-time Validation**: Immediate feedback on submission

## Testing Checklist

- [ ] Student can login with role='student'
- [ ] Student sees StudentTestRunner for published labs
- [ ] Questions display correctly with options
- [ ] Diagram test shows jumbled shapes (no connections)
- [ ] Student can drag shapes and create connections
- [ ] Previous/Next navigation works for questions
- [ ] Submit button disabled until all questions answered
- [ ] Score calculation is correct
- [ ] Pass/fail status displays correctly
- [ ] Submission saved to database
- [ ] Retry button works for failed tests
- [ ] Trainer sees view-only mode for published labs
- [ ] Trainer can still edit draft labs

## Future Enhancements

1. **Nested Shape Extraction**: Extract shapes from containers (Group/Zone/Pool)
2. **Position Scoring**: Award partial credit for shape placement
3. **Time Tracking**: Record time spent on tests
4. **Attempt Limits**: Limit number of retry attempts
5. **Progress Dashboard**: Show student progress across all labs
6. **Leaderboard**: Compare scores with other students
7. **Feedback System**: Allow trainers to provide manual feedback
8. **Analytics**: Track common mistakes, completion rates, etc.

## Files Modified/Created

### Created:
- `apps/web/components/Lab/StudentTestRunner.tsx`
- `apps/web/app/api/lab/[id]/pages/[pageId]/submit/route.ts`
- `apps/whatsnxt-bff/app/models/lab/StudentSubmission.ts`

### Modified:
- `apps/web/app/labs/[id]/pages/[pageId]/page.tsx`
- `apps/web/apis/lab.api.ts`
- `apps/whatsnxt-bff/app/routes/lab.routes.ts`
- `apps/whatsnxt-bff/app/services/lab/LabService.ts`

## Database Schema

```typescript
StudentSubmission {
  studentId: ObjectId (ref: users)
  labId: ObjectId (ref: labs)
  pageId: ObjectId (ref: labPages)
  questionAnswers: Map<string, string>
  diagramAnswer: { nodes: [], links: [] }
  score: Number (0-100)
  passed: Boolean
  submittedAt: Date
  timeSpentSeconds: Number (optional)
}
```

## API Endpoints

```
POST /api/v1/lab/:labId/pages/:pageId/submit
Body: {
  studentId, questionAnswers, diagramAnswer, score, passed
}
Response: { message, data: submission }

GET /api/v1/lab/:labId/pages/:pageId/submission?studentId=xxx
Response: { message, data: submission }
```

