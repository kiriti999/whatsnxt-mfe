// middleware.ts - Enhanced with Google login success handling
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
  '/consulting',
  '/learn-ai'
];

// Dynamic routes that should be public (prefix matching)
const dynamicPublicRoutes = [
  '/content/',
  '/courses/',
  '/~partytown/',
  '/trainer-details/',
  '/interview/',
];

// Routes that should be statically generated (no auth in layout)
const staticRoutes = [
  '/',
  '/about',
  '/blogs',
  '/tutorials',
  '/courses',
  '/search-trainers',
  '/search-trainer',
  '/become-a-trainer',
  '/shipping-and-delivery',
  '/privacy-policy',
  '/refund-policy',
  '/terms-of-service',
  '/contact-us',
  '/search',
  '/course-search',
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
  const isStaticPublic = publicRoutes.some(route =>
    new RegExp(`^${route.replace(/\/$/, '')}/?$`).test(pathname)
  );

  const isDynamicPublic = dynamicPublicRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isCoursesDynamicRoute = /^\/courses\/[a-zA-Z0-9-]+\/?$/.test(pathname);
  const isInterviewDynamicRoute = /^\/interview\/[a-zA-Z0-9-]+\/?$/.test(pathname);
  const isTrainerDetailsRoute = /^\/trainer-details\/[a-zA-Z0-9-]+\/?$/.test(pathname);

  return isStaticPublic || isDynamicPublic || isCoursesDynamicRoute ||
    isInterviewDynamicRoute || isTrainerDetailsRoute;
};

// Helper function to check if route should be static
const isStaticRoute = (pathname: string): boolean => {
  // Check exact matches
  if (staticRoutes.includes(pathname)) {
    return true;
  }

  // Check dynamic patterns that should be static
  const staticPatterns = [
    /^\/courses\/[^\/]+$/,        // /courses/[courseId]
    /^\/content\/[^\/]+$/,        // /content/[contentId]
    /^\/trainer-details\/[^\/]+$/, // /trainer-details/[trainerId]
    /^\/interview\/[^\/]+$/,      // /interview/[interviewId]
  ];

  return staticPatterns.some(pattern => pattern.test(pathname));
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

// NEW: Helper function to check if this is a Google login callback
const isGoogleLoginCallback = (req: NextRequest): boolean => {
  const url = req.nextUrl;

  // Check if this is authentication page with Google success/error parameters
  if (url.pathname === '/authentication' || url.pathname === '/auth/authentication') {
    const googleParam = url.searchParams.get('google');
    return googleParam === 'success' || googleParam === 'error';
  }

  return false;
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

  console.log('Middleware processing:', req.method, pathname, req.nextUrl.search);

  const token = getAuthToken(req);
  const isPublic = isPublicRoute(pathname);
  const isAuth = isAuthRoute(pathname);
  const isStatic = isStaticRoute(pathname);
  const isGoogleCallback = isGoogleLoginCallback(req);

  // Create response with custom headers
  const response = NextResponse.next();

  // Add pathname to headers so layout can detect route type
  response.headers.set('x-pathname', pathname);
  response.headers.set('x-is-static', isStatic.toString());
  response.headers.set('x-is-public', isPublic.toString());

  // IMPORTANT: Allow Google login callbacks to proceed even if user is authenticated
  if (isGoogleCallback) {
    console.log('Google login callback detected, allowing through:', pathname, req.nextUrl.search);
    return response;
  }

  // For static routes, allow through without auth checks
  if (isStatic) {
    console.log('Static route, allowing through:', pathname);
    return response;
  }

  // Allow access to public routes without authentication
  if (isPublic && !token) {
    console.log('Public route access granted:', pathname);
    return response;
  }

  // Redirect unauthenticated users to authentication page
  if (!token && !isPublic) {
    console.log('Redirecting to authentication:', pathname);
    const authUrl = new URL('/authentication', req.url);
    authUrl.searchParams.set('returnto', pathname);
    return NextResponse.redirect(authUrl);
  }

  // Redirect authenticated users away from auth pages (EXCEPT Google callbacks)
  if (token && isAuth && !isGoogleCallback) {
    console.log('Authenticated user accessing auth route, redirecting home:', pathname);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow authenticated users to access any route
  if (token) {
    console.log('Authenticated access granted:', pathname);
    return response;
  }

  // Fallback: redirect to authentication
  console.log('Fallback redirect to authentication:', pathname);
  const authUrl = new URL('/authentication', req.url);
  authUrl.searchParams.set('returnto', pathname);
  return NextResponse.redirect(authUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|fonts|images|icons|.*\\..*).*)',
  ],
};