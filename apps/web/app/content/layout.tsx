'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { AppShell, Burger, Box, ActionIcon, Affix, Drawer } from '@mantine/core';
import { IconLayoutSidebarRightCollapse, IconList } from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { usePathname } from 'next/navigation';
import NestedSidebar from '../../components/Blog/NestedSidebar';

interface ContentLayoutProps {
  children: ReactNode;
}

export default function ContentLayout({ children }: ContentLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [desktopOpened, setDesktopOpened] = useState(true);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const pathname = usePathname();

  // Determine content type - default to blog since /content/ primarily serves blog posts
  // If the post is a tutorial, it will be indicated in the data
  const [contentType, setContentType] = useState<'blog' | 'tutorial'>('blog');

  const toggleDesktop = () => setDesktopOpened((o) => !o);

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
        collapsed: { mobile: true, desktop: !desktopOpened }, // Use Drawer for mobile, so always collapsed in AppShell
      }}
      header={{ height: 0 }} // Remove header height
      padding="md"
    >
      {/* Mobile Sidebar - Drawer */}
      <Drawer
        opened={opened && !!isMobile}
        onClose={close}
        size="65%"
        withCloseButton={false}
        padding={0}
        zIndex={10000}
        hiddenFrom="md" // Ensure it doesn't show on desktop by accident
        styles={{
          body: { height: '100%', padding: 0 },
          content: { backgroundColor: 'var(--mantine-color-body)' }
        }}
      >
        <NestedSidebar
          contentType={contentType}
          variant="accordion"
          showHeader={true}
          showControls={true}
          onCollapse={close}
          isMobile={true}
        />
      </Drawer>

      {/* Mobile Sidebar Toggle - Floating Button */}
      {isMobile && !opened && (
        <Affix position={{ top: 80, left: 16 }} zIndex={98}>
          <ActionIcon
            onClick={toggle}
            size="lg"
            radius="md"
            variant="default"
            aria-label="Toggle navigation"
            style={{
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              border: '1px solid var(--mantine-color-gray-3)'
            }}
          >
            <IconList size={20} />
          </ActionIcon>
        </Affix>
      )}

      {/* Button to re-open sidebar on desktop when collapsed */}
      {!isMobile && !desktopOpened && (
        <Box
          style={{
            position: 'fixed',
            top: '100px', // Below global header
            left: 0,
            zIndex: 100,
            backgroundColor: 'var(--mantine-color-body)',
            borderTopRightRadius: '4px',
            borderBottomRightRadius: '4px',
            border: '1px solid var(--mantine-color-gray-3)',
            borderLeft: 'none',
            padding: '4px',
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          }}
        >
          <ActionIcon
            variant="subtle"
            onClick={toggleDesktop}
            size="md"
            aria-label="Open sidebar"
          >
            <IconLayoutSidebarRightCollapse size={20} />
          </ActionIcon>
        </Box>
      )}

      <AppShell.Navbar style={{ zIndex: 101 }}>
        {!isMobile && (
          <NestedSidebar
            contentType={contentType}
            variant="accordion"
            showHeader={true}
            showControls={true}
            onCollapse={toggleDesktop}
            isMobile={false}
          />
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
