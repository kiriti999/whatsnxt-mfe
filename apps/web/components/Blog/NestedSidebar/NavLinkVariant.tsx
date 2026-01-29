'use client';

import React, { useEffect } from 'react';
import { Box, Stack, Text, Loader, Center, NavLink } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as TablerIcons from '@tabler/icons-react';
import { RootState, AppDispatch } from '../../../store/store';
import { loadExpandedSectionsFromStorage } from '../../../store/slices/nestedSidebarSlice';
import { Section } from '../../../apis/v1/sidebar/sectionsApi';
import styles from './styles.module.css';

interface NavLinkVariantProps {
  contentType: 'blog' | 'tutorial';
}

export const NavLinkVariant: React.FC<NavLinkVariantProps> = ({ contentType }) => {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();

  const { tree, loading, error } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  // Load expanded sections from localStorage on mount
  useEffect(() => {
    dispatch(loadExpandedSectionsFromStorage());
  }, [dispatch]);

  // Get icon component from Tabler icons
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;

    const iconComponentName = `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    const IconComponent = (TablerIcons as any)[iconComponentName];

    return IconComponent ? <IconComponent size={18} stroke={1.5} /> : null;
  };

  // Check if a section is currently active based on pathname
  const isSectionActive = (section: Section): boolean => {
    if (!pathname) return false;
    return pathname.includes(`/section/${section.slug}`);
  };

  // Flatten the tree structure for NavLink display (all sections visible at once)
  const flattenSections = (sections: Section[], depth: number = 0): Array<{ section: Section; depth: number }> => {
    return sections.reduce((acc, section) => {
      acc.push({ section, depth });

      if (section.children && section.children.length > 0) {
        acc.push(...flattenSections(section.children, depth + 1));
      }

      return acc;
    }, [] as Array<{ section: Section; depth: number }>);
  };

  const flatSections = flattenSections(tree);

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
    <Box className={styles.navlinkVariant}>
      <Stack gap={2}>
        {flatSections.map(({ section, depth }) => {
          const icon = getIconComponent(section.iconName);
          const isActive = isSectionActive(section);
          const sectionUrl = `/${contentType}s/section/${section.slug}`;
          const indentLevel = depth * 20; // 20px per level

          return (
            <Box
              key={section._id}
              className={depth > 0 ? styles.navlinkNested : styles.navlinkSection}
              style={{ marginLeft: `${indentLevel}px` }}
            >
              <NavLink
                component={Link}
                href={sectionUrl}
                label={
                  <>
                    <Text size="sm" truncate>
                      {section.title}
                    </Text>
                    {section.postCount > 0 && (
                      <Text size="xs" c="dimmed" ml="auto">
                        ({section.postCount})
                      </Text>
                    )}
                  </>
                }
                leftSection={icon}
                active={isActive}
                className={styles.sectionItem}
                data-depth={depth}
              />
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default NavLinkVariant;
