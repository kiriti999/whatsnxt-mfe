# WhatsNxt MFE - Turborepo Monorepo

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: Main [Next.js](https://nextjs.org/) application
- `@repo/typescript-config`: Shared TypeScript configurations
- UI packages: `@whatsnxt/core-ui`, `@whatsnxt/comments`, `@whatsnxt/blogcomments`
- Utility packages: `@whatsnxt/core-util`, `@whatsnxt/http-client`, `@whatsnxt/constants`

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has the following tools configured:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [Biome](https://biomejs.dev/) for fast linting and code formatting
- [Mantine UI](https://mantine.dev/) for component library
- [Turbo](https://turborepo.com/) for monorepo management

### Commands

```sh
pnpm dev           # Run development server
pnpm build         # Build all apps and packages
pnpm lint          # Check linting and formatting
pnpm lint:fix      # Fix linting and formatting issues
pnpm format        # Format all code
pnpm check-types   # Run TypeScript type checking
```

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
