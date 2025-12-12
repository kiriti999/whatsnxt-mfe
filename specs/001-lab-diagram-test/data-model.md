# Data Model: Lab Diagram Tests

This document outlines the key entities and their relationships for the Lab Diagram Test feature, designed for a MongoDB NoSQL database, and integrated within the `apps/whatsnxt-bff` application.

## Entities

### Lab

Represents a learning module containing one or more pages.

-   **`_id`**: ObjectId (Primary Key)
-   **`title`**: String (Required)
    -   *Validation*: Cannot be empty, max 255 characters.
-   **`description`**: String (Optional)
-   **`status`**: Enum (String) - "draft", "published" (Required)
    -   *Default*: "draft"
-   **`creatorId`**: String (Required) - ID of the instructor who created the lab.
-   **`createdAt`**: Date (Required)
-   **`updatedAt`**: Date (Required)
-   **`publishedVersionId`**: ObjectId (Optional)
    -   *Relationship*: Self-reference to the `_id` of the published `Lab` document when this `Lab` is a draft version of a previously published one.
-   **`pages`**: Array of ObjectId (Required)
    -   *Relationship*: One-to-many reference to `LabPage` documents. (Assuming `LabPage`s will be in a separate collection for scalability).

**State Transitions**:
-   `draft` -> `published`
-   Editing a `published` lab creates a new `draft` lab, linking back to the original `publishedVersionId`.

### LabPage

A step or a page within a lab.

-   **`_id`**: ObjectId (Primary Key)
-   **`labId`**: ObjectId (Required)
    -   *Relationship*: Many-to-one reference to `Lab` document.
-   **`pageNumber`**: Number (Required)
    -   *Validation*: Must be a positive integer, unique within a `labId`.
-   **`type`**: Enum (String) - "question", "diagram", "mixed" (Required)
-   **`title`**: String (Optional)
-   **`questions`**: Array of Embedded Document (Optional)
    -   *Relationship*: Embedded one-to-many `Question` documents.
    -   *Validation*: Required if `type` is "question" or "mixed".
-   **`diagram`**: Embedded Document (Optional)
    -   *Relationship*: Embedded one-to-one `DiagramTest` document.
    -   *Validation*: Required if `type` is "diagram" or "mixed".

### Question

Represents a standard question, embedded within a `LabPage`.

-   **`_id`**: ObjectId (Primary Key, unique within `LabPage` array)
-   **`questionText`**: String (Required)
    -   *Validation*: Cannot be empty.
-   **`type`**: Enum (String) - "MCQ", "Text" (Required)
-   **`options`**: Array of String (Optional)
    -   *Validation*: Required if `type` is "MCQ", must have at least 2 options.
-   **`correctAnswer`**: String or Array of String (Required)
    -   *Validation*: For "MCQ", must match one or more of the `options`. For "Text", any string.

### DiagramTest

Represents an interactive diagramming exercise, embedded within a `LabPage`.

-   **`_id`**: ObjectId (Primary Key, unique within `LabPage` array)
-   **`initialDiagramState`**: Object (JSON) (Required)
    -   Stores the initial configuration of shapes and connections when the test starts.
-   **`expectedDiagramState`**: Object (JSON) (Required)
    -   Stores the desired final configuration for automated grading.
-   **`paletteCategory`**: String (Required)
    -   *Example*: "AWS", "Generic". Defines which set of shapes are available in the palette.

### DiagramShape (Conceptual / within DiagramTest.initialDiagramState and expectedDiagramState)

Represents a single graphical element within a diagram. This will likely be part of the `initialDiagramState` and `expectedDiagramState` JSON objects.

-   **`id`**: String (Unique identifier for the shape within the diagram)
-   **`type`**: String (e.g., "AWS_EC2", "Generic_Box", "Line")
-   **`position`**: Object (`{x: Number, y: Number}`)
-   **`size`**: Object (`{width: Number, height: Number}`)
-   **`properties`**: Object (JSON, e.g., `text: "Server"`, `color: "#FFFFFF"`, `instanceType: "t2.micro"`)
-   **`connections`**: Array of Object (e.g., `[{from: "shapeA", to: "shapeB", type: "arrow"}]`)

## Relationships & Validation Summary

-   **Lab <-> LabPage**: One-to-many (via `Lab.pages` array of ObjectIds and `LabPage.labId`).
    -   `LabPage.pageNumber` must be unique per `labId`.
-   **LabPage <-> Question**: Embedded one-to-many.
    -   `Question` data is directly part of the `LabPage` document.
-   **LabPage <-> DiagramTest**: Embedded one-to-one.
    -   `DiagramTest` data is directly part of the `LabPage` document.
-   **Lab Status**: Enforced through `status` field and `publishedVersionId`.
-   All required fields must be present and pass type/format validation.
-   String lengths for `title`, `description`, `questionText` should have reasonable limits.
