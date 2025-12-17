# Quickstart Guide: Lab Diagram Tests Feature

This guide provides a quick overview for developers to get started with the Lab Diagram Tests feature.

## 1. Overview

The Lab Diagram Tests feature allows instructors to create interactive labs combining traditional questions with diagram-based exercises. This involves modifications to both the frontend (Next.js) and backend (Express.js) services, along with new data models and APIs.

## 2. Key Components

-   **Frontend (`apps/web`)**: Implements the UI for creating and interacting with labs, including question editors and a diagram editor with a shape palette.
-   **Backend (`apps/whatsnxt-bff`)**: Provides REST APIs for managing labs, lab pages, questions, diagram tests, and diagram shapes. Interacts with MongoDB for data persistence.
-   **Data Model**: Defined in `specs/001-lab-diagram-test/data-model.md`. Key entities include `Lab`, `LabPage`, `Question`, `DiagramTest`, and `DiagramShape`, all identified by UUIDs.
-   **API Contracts**: Defined in `specs/001-lab-diagram-test/contracts/lab_api.json` (OpenAPI 3.0 specification).

## 3. Local Setup

Assuming you have the monorepo set up and `pnpm` installed:

1.  **Start Backend**:
    Navigate to `apps/whatsnxt-bff` and start the Express.js server.
    ```bash
    cd apps/whatsnxt-bff
    pnpm install
    pnpm dev # Or your equivalent start command
    ```
    Ensure MongoDB is running and accessible as configured in `apps/whatsnxt-bff/config/`.

2.  **Start Frontend**:
    Navigate to `apps/web` and start the Next.js application.
    ```bash
    cd apps/web
    pnpm install
    pnpm dev # Or your equivalent start command
    ```

## 4. API Endpoints (Refer to `lab_api.json` for full details)

Base URL: `/api/v1`

-   `POST /labs`: Create a new lab.
-   `GET /labs`: Get a list of labs.
-   `GET /labs/{labId}`: Get a specific lab.
-   `PUT /labs/{labId}`: Update a lab.
-   `POST /labs/{labId}/pages`: Create a new page for a lab.
-   `GET /labs/{labId}/pages/{pageId}`: Get a specific lab page.
-   `PUT /labs/{labId}/pages/{pageId}`: Update a lab page.
-   `POST /labs/{labId}/publish`: Publish a lab.
-   `GET /diagram-shapes`: Get available diagram shapes.

## 5. Frontend Development Notes

-   **Components**: Look into `apps/web/components` for UI elements related to lab creation, question editing, and diagram interactions.
-   **State Management**: Understand how lab creation state is managed (e.g., in `apps/web/store`).
-   **API Integration**: Use the `axios` client from `@whatsnxt/http-client` for all API calls. Refer to `apps/web/fetcher` or `apps/web/apis` for existing patterns.

## 6. Backend Development Notes

-   **Models**: New Mongoose models for `Lab`, `LabPage`, `Question`, `DiagramTest`, `DiagramShape` will be located in `apps/whatsnxt-bff/app/models/`.
-   **Services**: Business logic for labs and related entities will be in `apps/whatsnxt-bff/app/services/`.
-   **Routes**: API endpoint definitions will be in `apps/whatsnxt-bff/app/routes/`.
-   **Error Handling**: Utilize custom error classes from `@whatsnxt/errors` and Winston for structured logging.
-   **Security**: Implement OAuth2/OIDC for authentication and RBAC for authorization.

## 7. Testing

-   All new tests MUST be written using Vitest.
-   Unit tests for backend services and models: `apps/whatsnxt-bff/app/tests/unit`.
-   Integration tests for API endpoints: `apps/whatsnxt-bff/app/tests/integration`.
-   Frontend tests: `apps/web/__tests__`.

This guide should help you quickly navigate and contribute to the Lab Diagram Tests feature.