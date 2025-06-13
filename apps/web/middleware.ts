// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/blogs',
  '/tutorials',
  '/auth/authentication',
  '/authentication',
  '/reset-password',
  '/set-password',
  '/auth/google',
  '/courses',
  '/courses/',
  '/search-trainers',
  '/search-trainer',
  '/cart',
  '/checkout/user-checkout',
  '/checkout/guest-checkout',
  '/become-a-trainer',
  '/shipping-and-delivery',
  '/privacy-policy',
  '/refund-policy',
  '/terms-of-service',
  '/contact-us',
  '/~partytown',
  '/content/search',
  '/search',
  '/course-search',
];

// Dynamic routes that should be public (prefix matching)
const dynamicPublicRoutes = [
  '/content/',
  '/courses/',
  '/~partytown/',
  '/trainer-details/',
  '/interview/',
];

// Authentication routes (redirect authenticated users away from these)
const authenticationRoutes = [
  '/auth/authentication',
  '/authentication',
  '/reset-password',
  '/set-password',
  '/category-dashboard',
  '/categories',
];

// Helper function to check if route is public
const isPublicRoute = (pathname: string): boolean => {
  // Check exact match for static public routes
  const isStaticPublic = publicRoutes.some(route =>
    new RegExp(`^${route.replace(/\/$/, '')}/?$`).test(pathname)
  );

  // Check dynamic public routes
  const isDynamicPublic = dynamicPublicRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check specific dynamic patterns
  const isCoursesDynamicRoute = /^\/courses\/[a-zA-Z0-9-]+\/?$/.test(pathname);
  const isInterviewDynamicRoute = /^\/interview\/[a-zA-Z0-9-]+\/?$/.test(pathname);
  const isTrainerDetailsRoute = /^\/trainer-details\/[a-zA-Z0-9-]+\/?$/.test(pathname);

  return isStaticPublic || isDynamicPublic || isCoursesDynamicRoute ||
    isInterviewDynamicRoute || isTrainerDetailsRoute;
};

// Helper function to get token from cookies
const getAuthToken = (req: NextRequest): string | null => {
  const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN;

  if (!tokenKeyName) {
    console.warn('NEXT_PUBLIC_COOKIES_ACCESS_TOKEN environment variable is not set');
    return null;
  }

  return req.cookies.has(tokenKeyName) ? req.cookies.get(tokenKeyName)?.value || null : null;
};

// Helper function to check if route is authentication related
const isAuthRoute = (pathname: string): boolean => {
  return authenticationRoutes.some(route =>
    new RegExp(`^${route.replace(/\/$/, '')}/?$`).test(pathname)
  );
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for certain file types and API routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/fonts/') ||
    pathname.includes('/images/') ||
    pathname.includes('/icons/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf')
  ) {
    return NextResponse.next();
  }

  console.log('Middleware processing:', req.method, pathname);

  const token = getAuthToken(req);
  const isPublic = isPublicRoute(pathname);
  const isAuth = isAuthRoute(pathname);

  // Allow access to public routes without authentication
  if (isPublic && !token) {
    console.log('Public route access granted:', pathname);
    return NextResponse.next();
  }

  // Redirect unauthenticated users to authentication page
  if (!token && !isPublic) {
    console.log('Redirecting to authentication:', pathname);
    const authUrl = new URL('/auth/authentication', req.url);
    // Preserve the intended destination
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // Redirect authenticated users away from auth pages
  if (token && isAuth) {
    console.log('Authenticated user accessing auth route, redirecting home:', pathname);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow authenticated users to access any route
  if (token) {
    console.log('Authenticated access granted:', pathname);
    return NextResponse.next();
  }

  // Fallback: redirect to authentication
  console.log('Fallback redirect to authentication:', pathname);
  const authUrl = new URL('/auth/authentication', req.url);
  authUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(authUrl);
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - fonts (font files)
   * - images (image files)
   * - icons (icon files)
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|images|icons|.*\\..*).*)',
  ],
};