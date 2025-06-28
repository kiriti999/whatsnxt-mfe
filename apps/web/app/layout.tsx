// layout.tsx - CLEANED VERSION (remove unnecessary scripts)
// Global Styles
import "./globals.css"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React, { ReactNode } from 'react'
import { Nunito } from "next/font/google"
import { cookies } from "next/headers";
import { Metadata } from "next";
import { fetchUser } from '../utils/commonHelper';
import dynamic from 'next/dynamic';
import Script from 'next/script';

const nunito = Nunito({
  subsets: ["latin"],
  weight: ['200', '300', '400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  variable: '--font-nunito',
});

const getAuthData = async () => {
  const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN;

  const cookieStore = await cookies();
  const token = cookieStore.get(tokenKeyName);

  if (token) {
    try {
      const user = await fetchUser(token.value);
      console.log('getAuthData :: fetchUser response:', user);

      if (!user) {
        console.log('getAuthData :: user is null, returning null');
        return null;
      }

      if (user?.isAuthenticated) {
        return user;
      }

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
  metadataBase: new URL("https://whatsnxt.in"),
  title: {
    default: "whatsnxt - Online skill development & learning provider",
    template: "%s | whatsnxt"
  },
  description: "whatsnxt - Video courses and digital learning through articles and series on different categories. Facilitate learning through trainer search and connect",
  applicationName: "whatsnxt",
  authors: [{ name: "whatsnxt Team" }],
  generator: "Next.js",
  keywords: ["online learning", "skill development", "courses", "tutorials", "training"],
  creator: "whatsnxt",
  publisher: "whatsnxt",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://whatsnxt.in',
    siteName: 'whatsnxt',
    title: "whatsnxt - Online skill development & learning provider",
    description: "whatsnxt - Video courses and digital learning through articles and series on different categories. Facilitate learning through trainer search and connect",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'whatsnxt - Online Learning Platform',
        type: 'image/jpeg',
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: "whatsnxt - Online skill development & learning provider",
    description: "whatsnxt - Video courses and digital learning through articles and series on different categories. Facilitate learning through trainer search and connect",
    images: ['/twitter-image.jpg'],
    creator: '@whatsnxt',
  },

  alternates: {
    canonical: "https://whatsnxt.in",
    languages: {
      'en-US': '/en-US',
      'hi-IN': '/hi-IN',
    },
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'whatsnxt',
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },

  category: 'education',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  manifest: '/manifest.json',
}

// Dynamic import for providers
const Providers = dynamic(() => import('../components/AppProvider/AppProvider'), {
  ssr: true,
  loading: () => null
});

async function RootLayout({ children }: { children: ReactNode }) {

  const userData = await getAuthData();
  console.log('RootLayout :: userData:', userData)

  return (
    <html lang="en" className={`${nunito.variable} ${nunito.className}`}>
      <head>
        <link rel="preload" href="/bootstrap.min.css" />
        {/* Resource hints for actual services you use */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://api.cloudinary.com" />

        {/* FIXED: Use your actual Algolia App ID */}
        <link rel="preconnect" href="https://PG9F4BSTTH-dsn.algolia.net" />

        {/* DNS prefetch */}
        <link rel="dns-prefetch" href="//whatsnxt.in" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//checkout.razorpay.com" />

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className="antialiased">
        <Providers user={userData}>
          {children}
        </Providers>

        {/* Keep only essential scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <Script
              id="gtag-base"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="gtag-config"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_title: document.title,
                  page_location: window.location.href,
                  anonymize_ip: true,
                  allow_google_signals: false,
                  allow_ad_personalization_signals: false
                });
              `,
              }}
            />

            {/* Service Worker - optional, remove if you don't have one */}
            <Script
              id="sw-register"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration.scope);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
              }}
            />
          </>
        )}

        {/* REMOVED: Algolia and Razorpay script tags - use npm packages instead */}

      </body>
    </html>
  )
}

export default RootLayout