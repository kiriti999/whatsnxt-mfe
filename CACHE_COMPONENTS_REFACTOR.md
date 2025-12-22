# Cache Components Refactoring Guide

## Current Status
`cacheComponents` is **disabled** due to incompatibility with routes using `cookies()` during server-side rendering.

## Problem
Next.js 16's `cacheComponents` feature conflicts with:
1. **Server pages** that call functions using `cookies()` (e.g., `serverFetcher`)
2. **Dynamic routes** without proper static generation hints
3. **API routes** with route segment configs (`dynamic`, `runtime`)

## Solution: Refactor to Enable Cache Components

### Step 1: Refactor serverFetcher
**Current Issue**: `serverFetcher.ts` uses `cookies()` which makes all pages using it dynamic.

**Solution**: Create separate fetchers for public vs. authenticated requests:

```typescript
// packages/fetcher/publicFetcher.ts (NEW)
// For public data that can be cached
export const publicFetcher = async (BASEURL: string, URL: string, options: FetcherOptions = {}) => {
    const fetchOptions: RequestInit = {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        cache: options.cache || 'force-cache', // DEFAULT TO CACHE
        next: options.next,
    };

    if (options.method === 'POST' || options.method === 'PUT') {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(`${BASEURL}${URL}`, fetchOptions);
    return await response.json();
};

// packages/fetcher/serverFetcher.ts (KEEP FOR AUTH)
// Only for authenticated requests
'use cache' // <-- Add this directive
export const serverFetcher = async (...) => {
    const cookieStore = await cookies();
    // ... existing code
};
```

### Step 2: Refactor Lab Routes
**Files to update**:
- `apps/web/app/lab/[id]/page.tsx`
- `apps/web/app/lab/edit/[id]/page.tsx`

**Current**:
```typescript
export default async function LabPage({ params }) {
  const lab = await fetchLabById(id); // Uses serverFetcher with cookies
  // ...
}
export const dynamic = 'force-dynamic';
```

**Refactored** (Option A - Client-side):
```typescript
// Convert to client component that fetches on mount
'use client';
export default function LabPage({ params }) {
  const [lab, setLab] = useState(null);
  
  useEffect(() => {
    fetch(`/api/lab/${id}`).then(/* ... */);
  }, [id]);
  // ...
}
```

**Refactored** (Option B - Split Concerns):
```typescript
'use cache' // Cache the public parts
async function getPublicLabData(id: string) {
  return publicFetcher(BASEURL, `/labs/${id}/public`);
}

export default async function LabPage({ params }) {
  const publicData = await getPublicLabData(id);
  
  return (
    <Suspense fallback={<Loading />}>
      <LabContent publicData={publicData} id={id} />
    </Suspense>
  );
}
```

### Step 3: Update API Routes
**File**: `apps/web/app/api/lab/list/route.ts`

**Current Issue**: Tries to prerender during build

**Solution**: API routes are inherently dynamic - remove ALL route segment configs:
```typescript
// ❌ Remove these:
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// ✅ Just export handlers:
export async function GET() {
  const cookieStore = await cookies(); // This makes it dynamic automatically
  // ...
}
```

### Step 4: Fix Search Page
**File**: `apps/web/app/search/[query]/page.tsx`

**Current**:
```typescript
export const dynamic = 'force-dynamic';
```

**Solution**: Client component is already inside Suspense, so remove the config:
```typescript
// Remove: export const dynamic = 'force-dynamic';
// The client component handles its own state
```

### Step 5: Enable cacheComponents
**File**: `apps/web/next.config.ts`

After refactoring above files:
```typescript
experimental: {
    cacheComponents: true, // ✅ Re-enable
    authInterrupts: true,
},
```

## Benefits After Refactoring

1. **Static pages cached**: Public routes can be prerendered
2. **Component-level caching**: Use `'use cache'` directive for granular control
3. **Better performance**: Separate public/private data fetching
4. **Smaller bundles**: Cached components can be optimized

## Implementation Checklist

- [ ] Create `publicFetcher.ts` for unauthenticated requests
- [ ] Refactor `labServerQuery.ts` to use `publicFetcher` for public lab data
- [ ] Convert lab detail pages to client components OR split public/private concerns
- [ ] Remove route segment configs from API routes (they're auto-dynamic)
- [ ] Remove `dynamic = 'force-dynamic'` from search page
- [ ] Enable `cacheComponents: true` in next.config.ts
- [ ] Test build with `pnpm build`
- [ ] Test runtime behavior in production mode

## Testing
```bash
# Build and check for prerendering errors
pnpm build

# Check which routes are static vs dynamic
# Look for:
# ○ (Static)  - Prerendered
# ƒ (Dynamic) - Server-rendered on demand
# In build output

# Test in production mode
pnpm build && pnpm start
```

## References
- [Next.js 16 Caching Guide](https://nextjs.org/docs/app/guides/caching)
- [Cache Components RFC](https://github.com/vercel/next.js/discussions/54075)
- [Cookies and Dynamic Rendering](https://nextjs.org/docs/app/api-reference/functions/cookies)
