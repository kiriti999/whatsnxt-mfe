'use client';

import React, { useEffect } from 'react';
import { Box, Stack, Text, Loader, Center, NavLink } from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
// Import specific icons instead of * to avoid HMR/Turbopack issues
// Ideally, we should dynamically import these or have a dedicated icon map file.
// For now, importing a common set to resolve the build error.
import {
  IconHome, IconBrandReact, IconBrandVue, IconBrandAngular, IconBrandNodejs,
  IconBrandPython, IconDatabase, IconServer, IconCloud, IconDeviceMobile,
  IconCode, IconBook, IconArticle, IconTerminal, IconSettings, IconCircle
} from '@tabler/icons-react';
import { RootState, AppDispatch } from '../../../store/store';
import { loadExpandedSectionsFromStorage } from '../../../store/slices/nestedSidebarSlice';
import { Section } from '../../../apis/v1/sidebar/sectionsApi';
import styles from './styles.module.css';

// Map of available icons
const ICON_MAP: Record<string, any> = {
  Home: IconHome,
  BrandReact: IconBrandReact,
  BrandVue: IconBrandVue,
  BrandAngular: IconBrandAngular,
  BrandNodejs: IconBrandNodejs,
  BrandPython: IconBrandPython,
  Database: IconDatabase,
  Server: IconServer,
  Cloud: IconCloud,
  DeviceMobile: IconDeviceMobile,
  Code: IconCode,
  Book: IconBook,
  Article: IconArticle,
  Terminal: IconTerminal,
  Settings: IconSettings,
  Circle: IconCircle
};

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

    // Normalize name (e.g. "home" -> "Home")
    // If input is "IconHome", strip "Icon" prefix
    const cleanName = iconName.replace(/^Icon/, '');
    // Ensure first char is uppercase
    const key = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const IconComponent = ICON_MAP[key] || ICON_MAP['Circle']; // Fallback to Circle

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
