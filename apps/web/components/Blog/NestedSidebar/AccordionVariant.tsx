'use client';

import React, { useEffect, useRef } from 'react';
import { Box, Stack, Text, Loader, Center } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import { useMediaQuery } from '@mantine/hooks';
import { RootState, AppDispatch } from '../../../store/store';
import {
  toggleSection,
  autoExpandToSection,
  loadExpandedSectionsFromStorage,
} from '../../../store/slices/nestedSidebarSlice';
import { Section } from '../../../apis/v1/sidebar/sectionsApi';
import SectionItem from './SectionItem';
import styles from './styles.module.css';

interface AccordionVariantProps {
  contentType: 'blog' | 'tutorial';
}

export const AccordionVariant: React.FC<AccordionVariantProps> = ({ contentType }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const activeItemRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { tree, loading, error, expandedSections } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  useEffect(() => {
    console.log('AccordionVariant debug:', {
      treeLength: tree.length,
      tree: JSON.stringify(tree.map(s => ({
        title: s.title,
        id: s._id,
        postsCount: s.posts?.length,
        childrenCount: s.children?.length
      }))),
      expandedSections
    });
  }, [tree, expandedSections]);

  // Load expanded sections from localStorage on mount
  useEffect(() => {
    dispatch(loadExpandedSectionsFromStorage());
  }, [dispatch]);

  // Auto-expand to current section based on pathname
  useEffect(() => {
    if (pathname && tree.length > 0) {
      // Extract section slug from pathname
      // Example: /blogs/section/getting-started/my-post -> getting-started
      const pathParts = pathname.split('/');
      const sectionIndex = pathParts.indexOf('section');

      if (sectionIndex !== -1 && pathParts[sectionIndex + 1]) {
        const sectionSlug = pathParts[sectionIndex + 1];

        // Find section by slug in tree
        const findSectionBySlug = (sections: Section[], slug: string): Section | null => {
          for (const section of sections) {
            if (section.slug === slug) {
              return section;
            }
            if (section.children && section.children.length > 0) {
              const found = findSectionBySlug(section.children, slug);
              if (found) return found;
            }
          }
          return null;
        };

        const currentSection = findSectionBySlug(tree, sectionSlug);
        if (currentSection) {
          dispatch(autoExpandToSection(currentSection._id));
        }
      }
    }
  }, [pathname, tree, dispatch]);

  // Scroll to active item on mobile devices
  useEffect(() => {
    if (isMobile && activeItemRef.current) {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300); // Wait for expand animation
    }
  }, [isMobile, expandedSections]);

  const handleToggle = (sectionId: string) => {
    dispatch(toggleSection(sectionId));
  };

  // Check if a section is currently active based on pathname
  const isSectionActive = (section: Section): boolean => {
    if (!pathname) return false;

    // Check if pathname contains the section slug
    return pathname.includes(`/section/${section.slug}`);
  };

  // Recursively render sections with proper expansion state
  const renderSection = (section: Section, depth: number = 0) => {
    const isExpanded = expandedSections.includes(section._id);
    const isActive = isSectionActive(section);

    return (
      <Box key={section._id} ref={isActive ? activeItemRef : null}>
        <SectionItem
          section={section}
          isExpanded={isExpanded}
          isActive={isActive}
          onToggle={handleToggle}
          contentType={contentType}
          depth={depth}
          variant="accordion"
          expandedSections={expandedSections}
          pathname={pathname}
        />
      </Box>
    );
  };

  // Loading state
  if (loading && tree.length === 0) {
    return (
      <Center className={styles.loadingSkeleton} py="xl">
        <Stack align="center" gap="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading sections...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (error) {
    return (
      <Box className={styles.emptyState}>
        <Text size="sm" c="red">
          {error}
        </Text>
      </Box>
    );
  }

  // Empty state
  if (tree.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Text size="sm" c="dimmed">
          No sections available
        </Text>
      </Box>
    );
  }

  return (
    <Box className={styles.accordionVariant}>
      <Stack gap="xs">
        {tree.map((section) => renderSection(section, 0))}
      </Stack>
    </Box>
  );
};

export default AccordionVariant;
