# Docker Build Fix for Monorepo Workspace Dependencies

## Problem
The Docker build was failing with:
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

This happened because:
1. The app uses pnpm workspaces with `workspace:*` protocol for internal packages
2. npm doesn't understand the `workspace:*` protocol
3. The Dockerfile was trying to use `npm install` inside the container

## Solution
Updated the Docker build to:
1. **Use pnpm** instead of npm (pnpm handles workspace: protocol)
2. **Build from monorepo root** to have access to all workspace packages
3. **Multi-stage build** for optimal image size

## Changes Made

### 1. Updated `Dockerfile.prod`
- Changed from single-stage to multi-stage build
- Installed pnpm using corepack
- Copies workspace configuration from monorepo root
- Uses `pnpm install --filter whatsnxt-bff` to resolve dependencies

### 2. Updated `docker-compose-prod.yml`
- Changed build context from `.` to `../..` (monorepo root)
- This allows Dockerfile to access workspace files

## How It Works

```dockerfile
# Stage 1: Install dependencies
FROM node:24.11.0-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages/
COPY apps/whatsnxt-bff/package.json ./apps/whatsnxt-bff/
RUN pnpm install --filter whatsnxt-bff --prod --frozen-lockfile

# Stage 2: Build application
FROM node:24.11.0-alpine AS build
COPY --from=deps /monorepo ./
COPY apps/whatsnxt-bff ./apps/whatsnxt-bff/
RUN pnpm run build

# Stage 3: Production runtime
FROM node:24.11.0-alpine AS production
COPY --from=build /monorepo/apps/whatsnxt-bff/dist ./dist
COPY --from=build /monorepo/apps/whatsnxt-bff/node_modules ./node_modules
CMD ["npm", "run", "pm2-prod"]
```

## Usage

### Build and run:
```bash
cd apps/whatsnxt-bff
npm run docker-prod
```

Or manually:
```bash
# From monorepo root
docker build -f apps/whatsnxt-bff/Dockerfile.prod -t whatsnxt:prod .

# Or using docker-compose
cd apps/whatsnxt-bff
docker compose -f docker-compose-prod.yml build node
```

## Benefits

1. **✅ Resolves workspace dependencies** - pnpm understands `workspace:*`
2. **✅ Smaller image size** - Multi-stage build excludes dev dependencies
3. **✅ Faster builds** - Dependency layer cached separately
4. **✅ Type-safe** - Includes TypeScript compilation
5. **✅ Production-ready** - Only includes necessary runtime files

## Troubleshooting

### If build still fails:

1. **Clear Docker cache**:
   ```bash
   docker builder prune -a
   ```

2. **Verify pnpm-lock.yaml is up to date**:
   ```bash
   cd /Users/arjun/whatsnxt-mfe
   pnpm install
   ```

3. **Check workspace packages exist**:
   ```bash
   ls packages/constants
   ls packages/core-types
   ls packages/errors
   ls packages/http-client
   ```

4. **Build with verbose output**:
   ```bash
   docker build -f apps/whatsnxt-bff/Dockerfile.prod --progress=plain -t whatsnxt:prod .
   ```

## Alternative: Using npm with resolved dependencies

If you prefer to stick with npm, you can use `pnpm pack` to create tarballs:

```bash
# In each workspace package
cd packages/constants && pnpm pack
cd packages/core-types && pnpm pack
# etc...

# Then update package.json to use file: protocol
"dependencies": {
  "@whatsnxt/constants": "file:../../packages/constants/whatsnxt-constants-1.0.0.tgz"
}
```

But pnpm is the recommended approach for monorepos.
