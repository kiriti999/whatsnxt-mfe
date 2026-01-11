# API Contracts: Auto-Create Page After 3 Questions

**Feature**: 003-auto-page-creation  
**Date**: 2025-01-17  
**Status**: Complete

## Overview

This feature **does not introduce new API endpoints**. It leverages existing Lab API endpoints that are already implemented in the backend (`apps/whatsnxt-bff`). This document serves as a contract reference for the existing endpoints used by the auto-page-creation feature.

All API endpoints follow the existing backend architecture:
- **Base URL**: `${NEXT_PUBLIC_BFF_HOST_LAB_API}` (environment variable)
- **Authentication**: Required (session-based, validated by backend middleware)
- **Authorization**: Instructor must own the lab to create pages or save questions
- **Content-Type**: `application/json`
- **Error Format**: Standard HTTP status codes + JSON error response

---

## Existing Endpoints Used

### 1. Create Lab Page
**Endpoint**: `POST /labs/:labId/pages`
**Purpose**: Creates a new page within a draft lab

**Request**: Empty object `{}`
**Response**: Page object with auto-generated page number

### 2. Save Question
**Endpoint**: `POST /labs/:labId/pages/:pageId/question`
**Purpose**: Creates or updates a question on a lab page

**Request**: Question data with optional `questionId` for edits
**Response**: Complete question object

### 3. Get Lab Page by ID
**Endpoint**: `GET /labs/:labId/pages/:pageId`
**Purpose**: Fetches page with populated question data

**Response**: Page object with nested question object

---

## Frontend Integration

Uses existing `labApi` from `apps/web/apis/lab.api.ts`:
- `labApi.createLabPage(labId, {})`
- `labApi.saveQuestion(labId, pageId, data)`
- `labApi.getLabPageById(labId, pageId)`

**No new API methods needed** - Feature reuses existing infrastructure.

For detailed API schemas, request/response examples, and error handling, see the research.md and data-model.md documents.
