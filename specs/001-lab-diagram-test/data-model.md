# Data Model: Lab Diagram Tests

## Entities

### Lab

Represents a learning module.

-   `id`: Unique identifier (UUID)
-   `title`: Title of the lab (String)
-   `status`: 'draft' or 'published' (String)
-   `createdAt`: Timestamp
-   `updatedAt`: Timestamp

### LabPage

A page or step within a lab.

-   `id`: Unique identifier (UUID)
-   `labId`: Foreign key to the Lab entity (UUID)
-   `pageNumber`: Order of the page within the lab (Integer)
-   `pageType`: 'question' or 'diagram' (String)
-   `createdAt`: Timestamp
-   `updatedAt`: Timestamp

### Question

A standard question on a lab page.

-   `id`: Unique identifier (UUID)
-   `labPageId`: Foreign key to the LabPage entity (UUID)
-   `questionType`: 'mcq' or 'text' (String)
-   `prompt`: The question text (String)
-   `options`: For MCQ, a list of possible answers (Array of Strings)
-   `correctAnswer`: The correct answer (String or Array of Strings)
-   `createdAt`: Timestamp
-   `updatedAt`: Timestamp

### DiagramTest

An interactive diagramming exercise on a lab page.

-   `id`: Unique identifier (UUID)
-   `labPageId`: Foreign key to the LabPage entity (UUID)
-   `initialState`: The initial state of the diagram (JSON)
-   `solution`: The solution to the diagram test (JSON)
--   `createdAt`: Timestamp
-   `updatedAt`: Timestamp

### DiagramShape

A graphical element for diagram tests.

-   `id`: Unique identifier (UUID)
-   `name`: Name of the shape (String)
-   `category`: 'common', 'aws', 'gcp', 'azure', etc. (String)
-   `svg`: The SVG representation of the shape (String)
-   `createdAt`: Timestamp
-   `updatedAt`: Timestamp
