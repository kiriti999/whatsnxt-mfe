// Global Styles
import "./globals.css"
import '../styles/bootstrap.min.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

import React, { ReactNode } from 'react'
import { Nunito } from "next/font/google"
import { cookies } from "next/headers";
import { fetchUser } from "../utils/Utils"
import { Metadata } from "next";
import Providers from '../components/StateWrappers/StateWrappers'

const nunito = Nunito({
  subsets: ["latin"],
  weight: ['200', '300', '400', '600', '700', '900'], // Specify the weights you're using
  style: ['normal', 'italic'], // Specify if you're using normal/italic styles
  display: 'swap' // Optional: improve font rendering performance
});

const getUser = async () => {
  const tokenKeyName = process.env.NEXT_PUBLIC_COOKIES_ACCESS_TOKEN;

  const cookieStore = await cookies();
  const token = cookieStore.get(tokenKeyName); // Safely access the token

  let pageProps = {} as any;

  // Fetch user data if the token exists
  if (token) {
    const user = await fetchUser(token.value);

    if (!user || !user.active) {
      // destroyCookie(ctx, tokenKeyName); // Destroy the token cookie if the user is not active
    }
    pageProps.user = user; // Add user data to pageProps
  }

  return { pageProps };
};

export const metadata: Metadata = {
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
  const { pageProps } = await getUser()

  return (
    <html lang='en' className={nunito.className}>
      <body>
        <Providers user={pageProps.user}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout