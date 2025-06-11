import { getCookie } from 'cookies-next';
import { AuthenticatedUserType } from './authTypes';

// Fetch user from cookies
export const fetchUserFromCookies = (): AuthenticatedUserType | null => {
  const storedUser = getCookie(process.env.NEXT_PUBLIC_COOKIES_USER || '');
  return storedUser ? JSON.parse(storedUser as string) : null;
};

// Check if access token exists
export const isAuthenticated = (): boolean => {
  const isAuthenticated = getCookie(process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN as string);
  return !!isAuthenticated;
};

// Initialize user authentication from cookies
export const initAuthFromCookies = (): AuthenticatedUserType | null => {
  const user = fetchUserFromCookies();
  return user ? user : null;
};
