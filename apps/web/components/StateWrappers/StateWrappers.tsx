"use client"

import { JSX, ReactNode, useState } from 'react';
import { Provider } from 'react-redux';
import NextTopLoader from 'nextjs-toploader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, DEFAULT_THEME, MantineProvider, TypographyStylesProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Layout from '../Layout';
import FilterStore from '../../context/filterStore';
import store from '../../store/store';
import { IconAddressBook, IconBell, IconBook2, IconCertificate, IconHistoryToggle, IconPasswordUser, IconUserEdit } from '@tabler/icons-react';
import { CourseManageContextProvider } from '../../context/CourseManageContext';
import { AuthProvider } from '../../context/Authentication/AuthContext';
import React from 'react';
import { User } from '../Navbar/types';
import { ModalsProvider } from '@mantine/modals';

const theme = createTheme({
  fontFamily: `Roboto, ${DEFAULT_THEME.fontFamily}`,
})

export default function CoursesMicrofrontend({ children, user }: { children: ReactNode, user: User }): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  const domain = process.env.NEXT_PUBLIC_MFE_HOST;

  const headerProps = {
    logo: 'https://res.cloudinary.com/cloudinary999/image/upload/v1713640702/whatsnxt/logo.png',
    links: [
      { title: 'Home', url: `${domain}/`, linkType: '_self' },
      { title: 'Courses', url: `${domain}/courses`, linkType: '_self' },
      { title: 'Blogs', url: `https://blog.whatsnxt.in/blogs`, linkType: '_blank' },
      { title: 'Tutorials', url: `https://blog.whatsnxt.in/tutorials`, linkType: '_blank' },
    ],
    loginMenuLinks: [
      { title: 'My Courses', url: `${domain}/my-courses`, icon: IconCertificate },
      {
        title: 'Profile',
        url: ``,
        children: [
          { title: 'Profile Info', url: `${domain}/user/my-profile`, icon: IconAddressBook },
          { title: 'Edit Profile', url: `${domain}/user/edit-profile`, icon: IconUserEdit },
          { title: 'Edit Password', url: `${domain}/user/edit-password`, icon: IconPasswordUser },
        ]
      },
      { title: 'My Bookings', url: `${domain}/my-bookings`, icon: IconBook2 },
      { title: 'Notifications', url: `${domain}/notifications`, icon: IconBell },
      { title: 'Purchase History', url: `${domain}/purchase-history`, icon: IconHistoryToggle },
    ],
    copyRight: 'whatsnxt 2024. All rights reserved'
  };

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider userData={user}>
          <FilterStore>
            <MantineProvider theme={DEFAULT_THEME}>
              <Notifications position="top-left" zIndex={1000} />
              <TypographyStylesProvider>
                <ModalsProvider>
                  <Layout user={user} {...headerProps}>
                    <CourseManageContextProvider>
                      {children}
                    </CourseManageContextProvider>
                  </Layout>
                </ModalsProvider>
              </TypographyStylesProvider>
              <NextTopLoader
                color="red"
                height={2}
                shadow="none"
                showSpinner={false}
              />
            </MantineProvider>
          </FilterStore>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}