# Data Model: Lab Diagram Tests

This document outlines the data model for the Lab Diagram Tests feature, detailing key entities, their attributes, and relationships. All entities are identified by UUIDs.

## Entities

### Lab

Represents a learning module containing one or more pages.

-   **id**: `UUID` (Primary Key)
-   **status**: `String` (Enum: 'draft', 'published')
-   **name**: `String` (Required - Lab title)
-   **description**: `String` (Optional - Lab description)
-   **labType**: `String` (Required - Category/type of the lab, e.g., 'Cloud Computing', 'Networking', 'Security')
-   **architectureType**: `String` (Required - Architecture platform, e.g., 'AWS', 'Azure', 'GCP', 'Common', 'Hybrid')
-   **instructorId**: `UUID` (Foreign Key to Instructor entity, not defined here)
-   **createdAt**: `Date`
-   **updatedAt**: `Date`

**Relationships**:
-   One-to-many with `LabPage` (a Lab can have multiple LabPages).

**Validation Rules**:
-   `name` must be non-empty
-   `labType` must be non-empty
-   `architectureType` must be non-empty
-   At least one `LabPage` with valid tests must exist before publishing

### LabPage

A step or a page within a lab.

-   **id**: `UUID` (Primary Key)
-   **labId**: `UUID` (Foreign Key to `Lab`)
-   **pageNumber**: `Number` (Order of the page within the lab)
-   **hasQuestion**: `Boolean` (Indicates if the page contains a Question)
-   **hasDiagramTest**: `Boolean` (Indicates if the page contains a DiagramTest)
-   **createdAt**: `Date`
-   **updatedAt**: `Date`

**Relationships**:
-   Many-to-one with `Lab` (a LabPage belongs to one Lab).
-   One-to-one with `Question` (a LabPage can have one Question).
-   One-to-one with `DiagramTest` (a LabPage can have one DiagramTest).

**Validation Rules**:
-   At least one of `hasQuestion` or `hasDiagramTest` must be `true`
-   If `hasQuestion` is `true`, a valid `Question` entity must be associated
-   If `hasDiagramTest` is `true`, a valid `DiagramTest` entity must be associated
-   Empty questions or empty diagram tests must not be saved

### Question

A standard question, with types like "Multiple Choice" or "Text".

-   **id**: `UUID` (Primary Key)
-   **labPageId**: `UUID` (Foreign Key to `LabPage`)
-   **type**: `String` (Enum: 'Multiple Choice', 'Text')
-   **questionText**: `String` (Required)
-   **options**: `Array` of `String` (For Multiple Choice questions, Optional)
-   **correctAnswer**: `String` (For Text questions) or `Array` of `String` (For Multiple Choice questions, storing selected options IDs/values)
-   **createdAt**: `Date`
-   **updatedAt**: `Date`

**Relationships**:
-   Many-to-one with `LabPage` (a Question belongs to one LabPage).

**Validation Rules**:
-   `questionText` must be non-empty
-   If `type` is 'Multiple Choice', `options` array must contain at least 2 options
-   If `type` is 'Multiple Choice', `correctAnswer` must be one or more of the provided options
-   Empty questions must not be saved to database

### DiagramTest

An interactive diagramming exercise.

-   **id**: `UUID` (Primary Key)
-   **labPageId**: `UUID` (Foreign Key to `LabPage`)
-   **prompt**: `String` (Required - Instructions for the diagram test)
-   **expectedDiagramState**: `JSON` (Required - Representing the correct diagram state/solution)
-   **architectureType**: `String` (Required - e.g., 'AWS', 'Azure', 'GCP', 'Common', 'Hybrid')
-   **createdAt**: `Date`
-   **updatedAt**: `Date`

**Relationships**:
-   Many-to-one with `LabPage` (a DiagramTest belongs to one LabPage).
-   Many-to-many with `DiagramShape` (a DiagramTest uses multiple DiagramShapes).

**Validation Rules**:
-   `prompt` must be non-empty
-   `expectedDiagramState` must be a valid JSON object with at least one shape
-   `architectureType` must be non-empty
-   Empty diagram tests must not be saved to database
-   The diagram must contain at least one shape to be considered valid

### DiagramShape

A graphical element used in a diagram test, categorized by architecture type.

-   **id**: `UUID` (Primary Key)
-   **name**: `String` (Required - e.g., 'EC2 Instance', 'Virtual Network')
-   **type**: `String` (Required - e.g., 'compute', 'network', 'storage', 'database', 'security')
-   **architectureType**: `String` (Required - e.g., 'AWS', 'Azure', 'GCP', 'Common', 'Hybrid')
-   **svgPath**: `String` (Required - SVG path data for rendering the shape)
-   **metadata**: `JSON` (Optional - Additional properties like size, color, connection points, default dimensions)
-   **createdAt**: `Date`
-   **updatedAt**: `Date`

**Relationships**:
-   Many-to-many with `DiagramTest` (a DiagramShape can be used in multiple DiagramTests).

**Implementation Notes**:
-   Common shapes (architectureType = 'Common') must be isolated in a shared package (e.g., `@whatsnxt/diagram-shapes-common`)
-   Architecture-specific shapes must be isolated in separate files based on architecture type:
  - AWS shapes in `@whatsnxt/diagram-shapes-aws` or similar structure
  - Azure shapes in `@whatsnxt/diagram-shapes-azure` or similar structure
  - GCP shapes in `@whatsnxt/diagram-shapes-gcp` or similar structure
-   This separation supports maintainability and follows SOLID principles (Single Responsibility Principle)