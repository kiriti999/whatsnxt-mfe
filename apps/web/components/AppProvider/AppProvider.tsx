"use client"

import { JSX, ReactNode, useState, useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import NextTopLoader from 'nextjs-toploader';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import Layout from '../Layout';
import FilterStore from '../../context/filterStore';
import { store } from '../../store/store';
import { IconAddressBook, IconBell, IconBook2, IconCertificate, IconFlask, IconHistoryToggle, IconPasswordUser, IconPencil, IconUserEdit } from '@tabler/icons-react';
import { CourseManageContextProvider } from '../../context/CourseManageContext';
import { AuthProvider } from '../../context/Authentication/AuthContext';
import React from 'react';
import { User } from '../Navbar/types';
import { ModalsProvider } from '@mantine/modals';
import SearchProvider from '../../context/SearchContext';

// Component to initialize cart on client side
const CartInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Dynamic import to avoid circular dependencies
      import('../../store/slices/cartSlice').then(({ loadCart }) => {
        dispatch(loadCart());
      }).catch(console.error);
    }
  }, [dispatch]);

  return null;
};

export default function AppProvider({ children, user }: { children: ReactNode, user: User }): JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 5 * 60 * 1000,
          },
        },
      }),
  );

  const domain = process.env.NEXT_PUBLIC_MFE_HOST;

  const isStudent = user?.role === 'student';

  const theme = createTheme({
    /** Put your mantine theme override here */

  });

  const headerProps = {
    links: [
      { title: 'Home', url: `${domain}/`, linkType: '_self' },
      { title: 'Blogs', url: `${domain}/blogs`, linkType: '_self' },
      { title: 'Tutorials', url: `${domain}/tutorials`, linkType: '_self' },
      { title: 'Learn AI', url: `${domain}/learn-ai`, linkType: '_self' },
      { title: 'Courses', url: `${domain}/courses`, linkType: '_self' },
    ],
    loginMenuLinks: [
      { title: 'My Courses', url: `${domain}/my-courses`, icon: IconCertificate },
      { title: 'Write', url: `${domain}/form`, icon: IconPencil },
      // Hide Create Lab for students
      ...(!isStudent ? [{ title: 'Create Lab', url: `${domain}/lab/create`, icon: IconFlask }] : []),
      {
        title: 'Profile',
        url: ``,
        children: [
          { title: 'Profile Info', url: `${domain}/user/my-profile`, icon: IconAddressBook },
          { title: 'Edit Password', url: `${domain}/user/edit-password`, icon: IconPasswordUser },
        ]
      },
      {
        title: 'Article',
        url: '',
        children: [
          { title: 'History', url: `${domain}/history/table`, icon: IconAddressBook },
          { title: 'My articles', url: `${domain}/content/my-dashboard?status=all`, icon: IconAddressBook },
          { title: 'Draft articles', url: `${domain}/content/my-dashboard?status=draft`, icon: IconUserEdit },
          { title: 'Published articles', url: `${domain}/content/my-dashboard?status=published`, icon: IconPasswordUser },
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
      <CartInitializer />
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider userData={user}>
            <FilterStore>
              <Notifications position="top-left" zIndex={1000} />
              <ModalsProvider>
                <SearchProvider>
                  <Layout {...headerProps}>
                    <CourseManageContextProvider>
                      {children}
                    </CourseManageContextProvider>
                  </Layout>
                </SearchProvider>
              </ModalsProvider>
              <NextTopLoader
                color="red"
                height={2}
                shadow="none"
                showSpinner={false}
              />
            </FilterStore>
          </AuthProvider>
        </QueryClientProvider>
      </MantineProvider>
    </Provider>
  )
}