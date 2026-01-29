# Project Structure

## Monorepo Layout (Turbo)
This project is a monorepo managed by TurboRepo and pnpm.

### `apps/`
Contains the deployable applications.
- **`apps/web`**: The main Next.js application.
  - `app/`: Next.js App Router directory.
  - `components/`: Application-specific UI components.
  - `store/`: Redux store configuration and slices.
  - `public/`: Static assets.

### `packages/`
Contains shared internal packages used by apps.
- **`@repo/eslint-config`**: Shared ESLint configuration.
- **`@repo/typescript-config`**: Shared TypeScript configuration.
- **`@whatsnxt/core-ui`**: Shared UI component library.
- **`@whatsnxt/core-util`**: Shared utility functions.
- **`@whatsnxt/comments`**: Comments feature package.
- **`@whatsnxt/blogcomments`**: Blog specific comments package.

## Key Configuration Files
- `turbo.json`: Defines the task pipeline (build, lint, dev).
- `pnpm-workspace.yaml`: Defines the workspace root and members.
- `package.json`: Root dependencies and scripts.

## Adding New Packages
When creating a new shared package:
1. Create a folder in `packages/`.
2. Initialize `package.json` with the name `@whatsnxt/<package-name>`.
3. Add it to `pnpm-workspace.yaml` (if not covered by wildcard).
4. Run `pnpm install`.
