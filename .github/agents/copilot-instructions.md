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
- 002-auto-show-question-form: Added TypeScript 5.8.2, React 19.1.0, Next.js 16.0.7 (App Router) + Mantine UI v8.3.10 (components, notifications, modals), styled-components v6.1.19, custom HttpClient for API calls
- 001-streamline-lab-creation: Added TypeScript 5.8.2, Node.js 24 LTS + Next.js 16.0.7, React 19.1.0, Mantine UI 8.3.10, Express.js v5 (backend), @whatsnxt/http-client (HTTP communication)
- 001-lab-monetization: Added TypeScript 5.8.2 with Node.js 24.11.0 (LTS) + Express.js 5.0.0, Mongoose 7.6.10, Razorpay 2.9.0, Next.js 16.0.7, React 19.1.0, Mantine UI


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
