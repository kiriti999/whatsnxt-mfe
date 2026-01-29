'use client';

import React, { ReactNode } from 'react';
import { AppShell, Burger, rem } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import NestedSidebar from '../../components/Blog/NestedSidebar';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  // Only show sidebar on non-listing pages (slugs)
  // Assuming listing page is exactly '/blogs'
  const showSidebar = pathname !== '/blogs';

  return (
    <AppShell
      navbar={{
        width: {
          base: 320,  // Mobile
          sm: 280,    // Small tablet
          md: 320,    // Tablet
          lg: 350,    // Desktop
          xl: 400     // Large desktop
        },
        breakpoint: 'md',
        collapsed: { mobile: !opened, desktop: !showSidebar },
      }}
      // Fixed layout: Sidebar behind header (padded internally), Main below header.
      styles={{
        root: {
          position: 'relative',
        },
        navbar: {
          // Sidebar takes full height, sits behind header (z-index < Header)
          position: 'fixed',
          top: 0,
          height: '100vh',
          zIndex: 99,
          // Background handled in component
        },
        main: {
          // Push main content down to clear header
          paddingTop: isMobile ? '60px' : '75px',
          paddingBottom: 'var(--mantine-spacing-xl)',
          // Horizontal padding handled by AppShell or margins if needed
        }
      }}
      padding="md"
    >
      {isMobile && showSidebar && (
        <AppShell.Header>
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            style={{ margin: '1rem' }}
            aria-label="Toggle navigation"
          />
        </AppShell.Header>
      )}

      {/* Always render Navbar component, AppShell handles collapsing */}
      <AppShell.Navbar p={0}>
        <NestedSidebar
          contentType="blog"
          variant="accordion"
          showHeader={true}
          showControls={true}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
