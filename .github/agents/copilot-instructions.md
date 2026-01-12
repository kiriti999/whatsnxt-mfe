# whatsnxt-mfe Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-15

## Active Technologies
- TypeScript (Node.js 24 LTS), React 19, Next.js 16 + Next.js 16, React 19, Mantine UI 8.3, Express.js 5.0, MongoDB 7.0, Redux Toolkit 2.8 (001-lab-monetization)
- MongoDB 7.0 (existing database with Labs, Courses, Users collections) (001-lab-monetization)
- TypeScript 5.8.2 with Node.js 24.11.0 (LTS) + Express.js 5.0.0, Mongoose 7.6.10, Razorpay 2.9.0, Next.js 16.0.7, React 19.1.0, Mantine UI (001-lab-monetization)
- MongoDB 7.0 with mongoose ODM (001-lab-monetization)
- TypeScript 5.8.2, Node.js 24 LTS + Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10, Express.js v5 (backend), @whatsnxt/http-client (HTTP communication) (001-streamline-lab-creation)
- MongoDB (backend API at localhost:4444), existing Lab and LabPage collections (001-streamline-lab-creation)
- TypeScript 5.8.2, React 19.1.0, Next.js 16.0.7 (App Router) + Mantine UI v8.3.10 (components, notifications, modals), styled-components v6.1.19, custom HttpClient for API calls (002-auto-show-question-form)
- REST API backend (`labApi.getLabPageById`, `labApi.saveQuestion`) - no direct client-side storage (002-auto-show-question-form)
- TypeScript 5.8.2, Node.js 24 LTS + Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10, @whatsnxt/http-client (workspace), @whatsnxt/core-types (workspace) (003-auto-page-creation)
- Backend PostgreSQL (via Express.js v5 BFF at apps/whatsnxt-bff) (003-auto-page-creation)
- TypeScript 5.8.2, Node.js 22.12.0 (runtime), React 19.1.0 (004-page-editor-pagination)
- Existing PostgreSQL database via Express.js v5 backend APIs (no schema changes required) (004-page-editor-pagination)
- TypeScript 5.x (Frontend: Next.js 16 / React 19, Backend: Express.js 5 + Node.js 20+) (001-clone-lab-to-edit)
- MongoDB 7.x with Mongoose ODM (separate collections: lab_diagram_tests, lab_pages, questions, diagram_tests) (001-clone-lab-to-edit)

- TypeScript, Node.js 24.12.0 LTS + Next.js 16, React 19, Mantine UI, Express.js 5, D3.js, MongoDB (001-lab-diagram-test)
- MongoDB (Lab, LabPage, Question, DiagramTest, DiagramShape models) (001-lab-diagram-test)
- TypeScript 5.8.2 + Node.js ≥18 + D3.js (d3), Next.js 16.0.7, React 19.1.0, Mantine UI 8.1.2 (001-tech-stack-shapes)
- N/A (shape definitions are code-based TypeScript modules) (001-tech-stack-shapes)
- TypeScript 5.8.2, Node.js >=18 + D3.js (for SVG rendering), React 19, Next.js 16, Mantine UI (001-tech-stack-shapes)
- MongoDB (Lab masterGraph JSON field stores diagram state) (001-tech-stack-shapes)

- TypeScript 5.x + Node.js 24.12.0 LTS + Next.js 16, React 19, Mantine UI, Express.js 5, D3.js, MongoDB (001-lab-diagram-test)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x + Node.js 24.12.0 LTS: Follow standard conventions

## Recent Changes
- 001-clone-lab-to-edit: Added TypeScript 5.x (Frontend: Next.js 16 / React 19, Backend: Express.js 5 + Node.js 20+)
- 001-diagram-quiz-hints: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 004-page-editor-pagination: Added TypeScript 5.8.2, Node.js 22.12.0 (runtime), React 19.1.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
