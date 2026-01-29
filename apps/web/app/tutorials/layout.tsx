'use client';

import React, { ReactNode } from 'react';
import { AppShell, Burger } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import NestedSidebar from '../../components/Blog/NestedSidebar';

interface TutorialLayoutProps {
  children: ReactNode;
}

export default function TutorialLayout({ children }: TutorialLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
        collapsed: { mobile: !opened, desktop: false },
      }}
      header={{ height: isMobile ? 60 : 0 }}
      padding="md"
    >
      {isMobile && (
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

      <AppShell.Navbar>
        <NestedSidebar 
          contentType="tutorial" 
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
