# API Contracts: Auto-Show Question Form

**Date**: 2025-01-21  
**Feature**: 002-auto-show-question-form  

---

## Summary

**No new API contracts or changes to existing contracts are required for this feature.**

This feature is a **pure frontend enhancement** that modifies only the UI behavior of the page editor component. All backend interactions remain identical to the current implementation.

---

## Existing API Contracts Used (No Changes)

### 1. Get Page Data

**Endpoint**: `GET /labs/{labId}/pages/{pageId}`

**Purpose**: Load page data including questions to determine if page is empty

**Request**:
- Path Parameters:
  - `labId` (string, required): Lab identifier
  - `pageId` (string, required): Page identifier

**Response** (200 OK):
```json
{
  "id": "string",
  "labId": "string",
  "questions": [
    {
      "id": "string",
      "questionText": "string",
      "type": "MCQ | True/False | Fill in the blank",
      "options": "string",
      "correctAnswer": "string"
    }
  ]
}
```

**Feature Usage**: 
- Called on page load (existing behavior)
- Used to determine `questions.length === 0` for auto-show logic
- No changes to request or response format

---

### 2. Save Question

**Endpoint**: `POST /labs/{labId}/pages/{pageId}/questions`

**Purpose**: Save a new question (same behavior whether auto-displayed or manually opened)

**Request**:
- Path Parameters:
  - `labId` (string, required)
  - `pageId` (string, required)
- Body:
```json
{
  "questionText": "string",
  "type": "MCQ | True/False | Fill in the blank",
  "options": "string",
  "correctAnswer": "string"
}
```

**Response** (201 Created):
```json
{
  "id": "string",
  "questionText": "string",
  "type": "MCQ | True/False | Fill in the blank",
  "options": "string",
  "correctAnswer": "string"
}
```

**Feature Usage**:
- Called when user saves from auto-displayed form
- Identical behavior to saving from manually opened form
- No changes to request or response format

---

## Why No Contract Changes Are Needed

1. **Empty State Detection**: The `GET /labs/{labId}/pages/{pageId}` endpoint already returns the full question list. Checking `questions.length === 0` on the client is sufficient.

2. **Form Submission**: The auto-displayed form uses the exact same save logic as the manually opened form. The backend doesn't need to know how the form was opened.

3. **Cancel Behavior**: Cancel is a client-side action that doesn't require backend communication.

4. **State Management**: The `isFormCancelled` flag is purely client-side and never sent to the backend.

---

## Contract Verification Checklist

- ✅ No new endpoints needed
- ✅ No modifications to existing request formats
- ✅ No modifications to existing response formats
- ✅ No changes to authentication/authorization
- ✅ No changes to error handling
- ✅ No changes to rate limiting or quotas

---

## Future Considerations (Out of Scope)

If future iterations need to track user behavior or analytics:

**Potential Future Endpoint** (NOT in this feature):
```
POST /labs/{labId}/pages/{pageId}/analytics
Body: { event: "question_form_auto_displayed", timestamp: "ISO8601" }
```

**Rationale for excluding**: 
- Analytics tracking is out of scope (per spec.md line 117)
- Current feature focuses on UX improvement only
- Can be added later without breaking changes

---

## Summary

**Contract Changes**: None  
**Backend Work Required**: None  
**Frontend-Only Feature**: Yes ✅

This document exists for completeness and to explicitly confirm that no API contract changes are part of this feature scope.
