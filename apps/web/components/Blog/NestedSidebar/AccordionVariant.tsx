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
  searchQuery?: string;
}

export const AccordionVariant: React.FC<AccordionVariantProps> = ({ contentType, searchQuery = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const activeItemRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const { tree, loading, error, expandedSections } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  // Filter tree based on search query
  const filteredTree = React.useMemo(() => {
    if (!searchQuery.trim()) return tree;

    const lowerQuery = searchQuery.toLowerCase();

    const filterSection = (section: Section): Section | null => {
      // Check if current section matches
      const matchesTitle = section.title.toLowerCase().includes(lowerQuery);

      // Check posts
      const matchingPosts = section.posts?.filter(post =>
        post.title.toLowerCase().includes(lowerQuery)
      ) || [];

      // Check children recursively
      const matchingChildren = section.children?.map(child => filterSection(child)).filter((child): child is Section => child !== null) || [];

      // If section matches, or has matching posts or children, return it (with filtered children/posts)
      if (matchesTitle || matchingPosts.length > 0 || matchingChildren.length > 0) {
        return {
          ...section,
          posts: matchesTitle ? section.posts : matchingPosts, // If matched by title, keep all posts? Or just matching? Usually matching + section title matching means show section. Let's show filtered posts unless title matches. 
          // Actually if title matches, user might want to see full content. But standard filter often filters children too.
          // Let's stick to strict filtering: show items that match OR are children of matches? 
          // If "Web Dev" matches, show all its posts? Yes usually.
          // For now: strict filter on leaf nodes preferred? 
          // Let's go with: 
          // If title matches, include it (and potentially all children/posts? No, that can be noisy).
          // Let's filter inputs:
          // 1. Post matches.
          // 2. Child Section matches.
          // 3. Current Section Title matches -> Keep section, but maybe still filter children?

          // Let's try: Include section if:
          // - Title matches OR
          // - Has matching posts OR
          // - Has matching children.

          // What about the content of the returned section?
          // If title matches, maybe we should show all children?
          // Let's do simple recursive filter. Only showing matching items.
          posts: matchingPosts,
          children: matchingChildren
        };
      }

      // Special case: If Title matches, maybe we should return the original section (with all children)?
      // For a "Search", usually we want to drill down to specific results.
      // So filtering children is better.
      // But if I search "Web", I see "Web Development". I expect to see its contents.
      if (matchesTitle) {
        return section; // Return full section if it matches title? 
        // If I return full section, 'filterSection' recursion stops for this branch. 
        // Which means I see everything under "Web Development". This mimics Algomaster behavior effectively?
      }

      return null;
    };

    return tree.map(filterSection).filter((s): s is Section => s !== null);
  }, [tree, searchQuery]);

  // Auto-expand filtered results
  useEffect(() => {
    if (searchQuery.trim() && filteredTree.length > 0) {
      // Expand all sections in filtered tree
      const getAllIds = (sections: Section[]): string[] => {
        let ids: string[] = [];
        sections.forEach(s => {
          ids.push(s._id);
          if (s.children) ids = [...ids, ...getAllIds(s.children)];
        });
        return ids;
      };
      // Dispatch action to expand these IDs? 
      // We need a way to setExpandedSections. 
      // Existing 'toggleSection' toggles one. 
      // 'autoExpandToSection' expands path to one.
      // We might need a loop or new action. 
      // For now, let's rely on user expanding, OR assuming flat list if filtered?
      // Usually search results are expanded.
      // Let's simply force sections to be expanded in rendering if strict search?
      // Or just let user click. 
      // Let's assume user wants to see results.
    }
  }, [filteredTree, searchQuery]);

  // Override render to force expand if searching?
  // Or just pass filteredTree to render.

  // ... (Keep existing useEffects for logging, loadStorage, pathname autoExpand)

  useEffect(() => {
    dispatch(loadExpandedSectionsFromStorage());
  }, [dispatch]);

  // Auto-expand to current section based on pathname (Only if no search)
  useEffect(() => {
    if (!searchQuery && pathname && tree.length > 0) {
      // ... (existing logic)
      const pathParts = pathname.split('/');
      const sectionIndex = pathParts.indexOf('section');

      if (sectionIndex !== -1 && pathParts[sectionIndex + 1]) {
        const sectionSlug = pathParts[sectionIndex + 1];
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
  }, [pathname, tree, dispatch, searchQuery]); // Added searchQuery dep

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
    return pathname.includes(`/section/${section.slug}`);
  };

  // Recursively render sections with proper expansion state
  const renderSection = (section: Section, depth: number = 0) => {
    const isExpanded = searchQuery ? true : expandedSections.includes(section._id); // Always expand if searching
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

  // Loading state (existing)
  if (loading && tree.length === 0) {
    // ...
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

  // Error state (existing)
  if (error) {
    // ...
    return (
      <Box className={styles.emptyState}>
        <Text size="sm" c="red">
          {error}
        </Text>
      </Box>
    );
  }

  // Empty state (existing)
  if (tree.length === 0) {
    // ...
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
        {filteredTree.length > 0 ? (
          filteredTree.map((section) => renderSection(section, 0))
        ) : (
          <Text size="sm" c="dimmed" ta="center" mt="md">No results found</Text>
        )}
      </Stack>
    </Box>
  );
};

export default AccordionVariant;
