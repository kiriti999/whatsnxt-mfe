"use client";

import { createTheme, MantineProvider, Modal } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import {
  IconAddressBook,
  IconBell,
  IconCertificate,
  IconFileDescription,
  IconFlask,
  IconHistoryToggle,
  IconPalette,
  IconPasswordUser,
  IconPencil,
  IconRocket,
  IconUserEdit,
} from "@tabler/icons-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NextTopLoader from "nextjs-toploader";
import React, { type JSX, type ReactNode, useEffect, useState } from "react";
import { Provider, useDispatch } from "react-redux";
import { AIConfigProvider } from "../../context/AIConfigContext";
import { AuthProvider } from "../../context/Authentication/AuthContext";
import FilterStore from "../../context/filterStore";
import SearchProvider from "../../context/SearchContext";
import { store } from "../../store/store";
import Layout from "../Layout";
import type { User } from "../Navbar/types";

// Component to initialize cart on client side
const CartInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Dynamic import to avoid circular dependencies
      import("../../store/slices/cartSlice")
        .then(({ loadCart }) => {
          dispatch(loadCart());
        })
        .catch(console.error);
    }
  }, [dispatch]);

  return null;
};

export default function AppProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}): JSX.Element {
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

  const isStudent = user?.role === "student";

  const theme = createTheme({
    // Use system fonts - remove custom font family from theme
    primaryColor: "cyan",
    colors: {
      // Custom cyan/teal palette for brand identity - modern, energetic, professional
      cyan: [
        "#ecfeff", // 0 - lightest
        "#cffafe", // 1
        "#a5f3fc", // 2
        "#67e8f9", // 3
        "#22d3ee", // 4
        "#06b6d4", // 5 - base
        "#0891b2", // 6
        "#0e7490", // 7
        "#155e75", // 8
        "#164e63", // 9 - darkest
      ],
    },
    fontSizes: {
      xs: "0.75rem", // 12px (was 14px)
      sm: "0.875rem", // 14px (was 16px)
      md: "1rem", // 16px (was 18px)
      lg: "1.125rem", // 18px (was 20px)
      xl: "1.25rem", // 20px (was 24px)
    },
    breakpoints: {
      xs: "36em", // 576px
      sm: "48em", // 768px
      md: "62em", // 992px
      lg: "75em", // 1200px
      xl: "88em", // 1408px
    },
    components: {
      Modal: Modal.extend({
        defaultProps: {
          zIndex: 1000000,
        },
      }),
    },
  });

  const headerProps = {
    links: [
      { title: "Home", url: `${domain}/`, linkType: "_self" },
      { title: "Reads", url: `${domain}/reads`, linkType: "_self" },
      { title: "Courses", url: `${domain}/courses`, linkType: "_self" },
      { title: "Labs", url: `${domain}/labs`, linkType: "_self" },
    ],
    loginMenuLinks: [
      {
        title: "My Courses",
        url: `${domain}/my-courses`,
        icon: IconCertificate,
      },
      { title: "Write", url: `${domain}/form`, icon: IconPencil },
      // Hide Create Lab for students
      ...(!isStudent
        ? [
          {
            title: "Create Lab",
            url: `${domain}/lab/create`,
            icon: IconFlask,
          },
        ]
        : []),
      {
        title: "Resume Builder",
        url: `${domain}/resume-builder`,
        icon: IconFileDescription,
      },
      // Show Become a Trainer for non-admin and non-trainer users
      ...(user?.role !== "admin" && user?.role !== "trainer"
        ? [
          {
            title: "Become a Trainer",
            url: `${domain}/become-a-trainer`,
            icon: IconUserEdit,
          },
        ]
        : []),
      {
        title: "Profile",
        url: ``,
        children: [
          {
            title: "Profile Info",
            url: `${domain}/user/my-profile`,
            icon: IconAddressBook,
          },
          {
            title: "Edit Password",
            url: `${domain}/user/edit-password`,
            icon: IconPasswordUser,
          },
        ],
      },
      {
        title: "Content",
        url: "",
        children: [
          {
            title: "History",
            url: `${domain}/history/table`,
            icon: IconHistoryToggle,
          },
          ...(user?.role === "admin" || user?.email === "kiriti.k999@gmail.com"
            ? [
              {
                title: "Programmatic SEO",
                url: `${domain}/form/auto-create/dashboard`,
                icon: IconRocket,
              },
            ]
            : []),
          {
            title: "My Diagrams",
            url: `${domain}/form/diagrams`,
            icon: IconPalette,
          },
        ],
      },
      // { title: 'My Bookings', url: `${domain}/my-bookings`, icon: IconBook2 },
      {
        title: "Notifications",
        url: `${domain}/notifications`,
        icon: IconBell,
      },
      {
        title: "Purchase History",
        url: `${domain}/purchase-history`,
        icon: IconHistoryToggle,
      },
    ],
    copyRight: "whatsnxt 2024. All rights reserved",
  };

  return (
    <Provider store={store}>
      <CartInitializer />
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider userData={user}>
            <AIConfigProvider isAuthenticated={!!user?.isAuthenticated}>
              <FilterStore>
                <Notifications position="top-left" zIndex={1000} />
                <ModalsProvider>
                  <SearchProvider>
                    <Layout {...headerProps}>{children}</Layout>
                  </SearchProvider>
                </ModalsProvider>
                <NextTopLoader
                  color="red"
                  height={2}
                  shadow="none"
                  showSpinner={false}
                />
              </FilterStore>
            </AIConfigProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MantineProvider>
    </Provider>
  );
}
