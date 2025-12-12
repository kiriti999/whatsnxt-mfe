# Research: Lab Diagram Tests

## Decision: Backend Integration Point

**Decision**: A new application, `apps/whatsnxt-bff`, will be created within the monorepo to house the backend APIs for the Lab Diagram Tests feature.

**Rationale**: The existing `apps` directory does not contain a service named `whatsnxt-bff`. To adhere to the user's explicit instruction that "All the api's must be created and handled in whatsnxt-bff", and given the repeated instruction to "Please continue" when asked for clarification on its location, the most logical path is to scaffold this new application. This allows for a dedicated backend for BFF responsibilities while maintaining the monorepo structure.

**Alternatives considered**:
-   **Using an existing application as BFF**: Not feasible as no `whatsnxt-bff` was found.
-   **Creating a separate `lab-api` application**: This was the initial approach but was superseded by the user's clarification.

## Research Task: `whatsnxt-bff` Internal Structure, Middleware, and Data Layer

**Objective**: Determine the internal directory structure and conventions for adding new routes, controllers, services, models, and middleware, and the setup for the data layer within the `apps/whatsnxt-bff` application. This is crucial for consistency and proper integration.

**Assumed Structure (based on common Express.js conventions and project context)**:
-   **Routes**: `apps/whatsnxt-bff/src/routes`
-   **Controllers**: `apps/whatsnxt-bff/src/controllers`
-   **Services**: `apps/whatsnxt-bff/src/services`
-   **Models**: `apps/whatsnxt-bff/src/models`
-   **Middleware**: `apps/whatsnxt-bff/src/middleware`
-   **Config**: `apps/whatsnxt-bff/src/config` (for database connection, environment variables)

**Assumed Middleware Practices (based on project constitution and common BFF patterns)**:
-   **Authentication/Authorization**: Assuming token-based authentication (e.g., JWT) is used with a dedicated middleware for validation.
-   **Logging**: Assuming Winston for structured logging is set up and new routes should integrate with it (e.g., via a logging middleware).
-   **Error Handling**: Assuming a global error handling middleware that utilizes custom error classes from `@whatsnxt/errors` is in place.

**Assumed Data Layer Setup**:
-   A new Mongoose configuration for MongoDB will be created within `apps/whatsnxt-bff/src/config/db.ts` to manage the database connection. This will mirror the setup previously used for `apps/lab-api`.