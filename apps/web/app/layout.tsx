// layout.tsx - Updated version
// Global Styles
import "./globals.css"
import '../styles/bootstrap.min.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React, { ReactNode } from 'react'
import { Nunito } from "next/font/google"
import { cookies } from "next/headers";
import { Metadata } from "next";
import Providers from '../components/AppProvider/AppProvider'
import { fetchUser } from '../utils/commonHelper';

const nunito = Nunito({
  subsets: ["latin"],
  weight: ['200', '300', '400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const getAuthData = async () => {
  const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN;

  const cookieStore = await cookies();
  const token = cookieStore.get(tokenKeyName);

  if (token) {
    try {
      const user = await fetchUser(token.value);
      console.log('getAuthData :: fetchUser response:', user);

      // FIXED: Check for user existence and isAuthenticated instead of user.active
      if (!user) {
        console.log('getAuthData :: user is null, returning null');
        return null;
      }

      // If fetchUser already returned isAuthenticated: true, use it directly
      if (user?.isAuthenticated) {
        return user;
      }

      // Otherwise, add isAuthenticated: true (fallback for older responses)
      const authenticatedUser = {
        ...user,
        isAuthenticated: true
      };
      console.log('getAuthData :: returning authenticated user:', authenticatedUser);
      return authenticatedUser;

    } catch (error) {
      console.error('getAuthData :: error fetching user:', error);
      return null;
    }
  } else {
    console.log('getAuthData :: no token, returning null');
    return null;
  }
};

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
  },
  metadataBase: new URL("https://whatsnxt.in"),
  title: "whatsnxt edu - Online skill development and learning provider",
  description: "whatsnxt edu - Online skill development and learning provider",
  openGraph: {
    title: "whatsnxt edu - Online skill development and learning provider",
    description: "whatsnxt edu - Online skill development and learning provider"
  },
  twitter: {
    description: "whatsnxt edu - Online skill development and learning provider"
  },
  alternates: {
    canonical: "https://whatsnxt.in",
  }
}

async function RootLayout({ children }: { children: ReactNode }) {
  const userData = await getAuthData(); // Get user data directly
  console.log('RootLayout :: userData:', userData)

  return (
    <html lang="en" className={nunito.className}>
      <body>
        <Providers user={userData}> {/* Pass user prop directly */}
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout