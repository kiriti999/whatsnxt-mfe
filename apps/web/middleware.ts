import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/authentication',
  '/reset-password',
  '/set-password',
  '/courses',
  '/courses/',
  '/search-trainers',
  '/cart',
  '/checkout/user-checkout',
  '/search-trainer',
  'become-a-trainer',
  '/checkout/guest-checkout',
  '/shipping-and-delivery',
  '/privacy-policy', // Privacy Policy link
  '/refund-policy', // Refund Policy link
  '/terms-of-service', // Terms & Conditions link (assuming it's mapped to /terms-of-service)
  '/about', // About page link
  '/contact-us', // Contact page link
  '/~partytown',
  '/algolia-search',
  '/interview/'
];

const dynamicPublicRoutes = ['/courses/', '/~partytown/', '/trainer-details', '/interview'];
const authenticationRoutes = ['/authentication', '/reset-password'];


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log('Request method:', req.method, 'Pathname:', pathname);

  const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN;
  let token = req.cookies.has(tokenKeyName) ? req.cookies.get(tokenKeyName).value : null;

  const isDynamicPublicRoute = dynamicPublicRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => new RegExp(`^${route}$`).test(pathname));

  // Adjust for dynamic routes (e.g., /courses/[slug])
  const isCoursesDynamicRoute = /^\/courses\/[a-zA-Z0-9-]+$/.test(pathname);

  // If no token and accessing a public route, allow access
  if (!token && (isPublicRoute || isDynamicPublicRoute || isCoursesDynamicRoute)) {
    return NextResponse.next();
  }

  // If no token and accessing a private route, redirect to auth
  if (!token) {
    return NextResponse.redirect(new URL(authenticationRoutes[0], req.url));
  }

  // If token exists and user is trying to access the auth route, redirect to home
  if (token && authenticationRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If token exists and accessing any route, allow access
  if (token) {
    return NextResponse.next();
  }

  // Default response if no conditions are met
  return NextResponse.redirect(new URL(authenticationRoutes[0], req.url));
}

export const config = {
  /*
 * Match all request paths except for the ones starting with:
 * - api (API routes)
 * - _next/static (static files)
 * - _next/image (image optimization files)
 * - favicon.ico (favicon file)
 *  - fonts (fonts file)
 */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|fonts).*)'], // Apply the middleware globally
};
