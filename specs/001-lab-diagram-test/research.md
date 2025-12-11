# Research: Lab Diagram Tests

## Decision: Database Selection

**Decision**: Use PostgreSQL as the database for storing lab data.

**Rationale**: PostgreSQL is a powerful, open-source object-relational database system with over 30 years of active development that has earned it a strong reputation for reliability, feature robustness, and performance. It is a good choice for this project as it can handle the structured data of labs, pages, questions, and diagram tests effectively. It also has good support in the Node.js ecosystem with libraries like `pg`.

**Alternatives considered**:

-   **MongoDB**: A NoSQL database that could also be a good choice, especially if the data model is expected to be very flexible. However, the data model for labs seems to be well-structured, so a relational database like PostgreSQL is a safe and robust choice.
-   **SQLite**: A lightweight, file-based database. While it would be simple to set up, it may not be suitable for a production application with multiple users and concurrent writes.
