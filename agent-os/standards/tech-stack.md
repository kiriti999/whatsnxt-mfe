# Tech Stack

## Core Frameworks
- **Next.js**: 16.0.7 (React Framework)
- **React**: 19.1.0
- **TypeScript**: 5.8.2
- **Node.js**: >=18

## State Management
- **Global Store**: Redux Toolkit (`@reduxjs/toolkit`) + `next-redux-wrapper`
- **Server State / Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Immutable Updates**: Immer (built into Redux Toolkit)

## UI & Styling
- **Component Library**: Mantine (implied by `postcss-preset-mantine` and usage patterns)
- **Styling**: Styled-components, CSS modules, or Mantine styles (Project uses `styled-components` v6.1.19 and `postcss-preset-mantine`)
- **Icons**: Tabler Icons (`@tabler/icons-react`)
- **Rich Text Editor**: Tiptap (Headless wrapper for ProseMirror)

## Build & Monorepo
- **Monorepo Manager**: TurboRepo (`turbo`)
- **Package Manager**: pnpm

## Development Tools
- **Linting**: ESLint (v9)
- **Formatting**: Prettier
- **Bundler**: Webpack (Next.js default)
- **Performance**: `@vercel/speed-insights`, `@next/bundle-analyzer`
- **Partytown**: Third-party script offloading

## SaaS Integrations
- **Search**: Algolia
- **Analytics**: Google Analytics / Vercel Analytics
