# Coding Conventions

## General
- **Language**: TypeScript is strictly required for all new code. Avoid `any` types; use `unknown` if necessary.
- **Functional Components**: Use functional components with Hooks. Class components are discouraged.
- **Server vs Client Components**: Explicitly mark Client Components with `'use client'` at the top of the file when using React hooks or interactivity. Default to Server Components where possible.
- **Coding standards**: Cyclomatic complexity should be less than 6 for .ts files and less than 10 for .tsx files. Always follow solid principles and best design patterns.

## File Naming
- **Components**: PascalCase (e.g., `MyComponent.tsx`)
- **Utilities/Hooks**: camelCase (e.g., `useCustomHook.ts`, `formatDate.ts`)
- **Folders**: kebab-case for structural folders, PascalCase for component folders (if using index files).

## State Management
- **Server State**: Use TanStack Query for all API data fetching. Avoid storing server response data in Redux unless it is needed globally across many unrelated components.
- **Client State**: Use Redux for complex, cross-component client-side state. Use local `useState` for component-level state.

## Styling
- **Mantine**: Prefer Mantine components and styled-system props for layout (e.g., `Stack`, `Group`, `Grid`).
- **Responsive Design**: Use Mantine's `em` or `rem` based breakpoints.

## Code Quality
- **Linting**: Run `pnpm lint` before committing.
- **Formatting**: Run `pnpm prettier` or ensure editor auto-formatting is enabled.
- **Imports**: Use absolute imports where configured (e.g., `@/components/...`).
