import React, { memo } from 'react';
import { NavLink, Collapse, Box, Group, Text } from '@mantine/core';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import Link from 'next/link';
import { Section } from '../../../apis/v1/sidebar/sectionsApi';
import styles from './styles.module.css';

interface SectionItemProps {
  section: Section;
  isExpanded: boolean;
  isActive: boolean;
  onToggle: (sectionId: string) => void;
  contentType: 'blog' | 'tutorial';
  depth?: number;
  variant?: 'accordion' | 'navlink';
  expandedSections?: string[];
  pathname?: string;
}

export const SectionItem: React.FC<SectionItemProps> = memo(({
  section,
  isExpanded,
  isActive,
  onToggle,
  contentType,
  depth = 0,
  variant = 'accordion',
  expandedSections = [],
  pathname = '',
}) => {
  const hasChildren = section.children && section.children.length > 0;
  const indentLevel = depth * 16; // 16px per level

  // Get icon component from Tabler icons
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    
    // Convert icon name to PascalCase for Tabler icons (e.g., "folder" -> "IconFolder")
    const iconComponentName = `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    const IconComponent = (TablerIcons as any)[iconComponentName];
    
    return IconComponent ? <IconComponent size={18} stroke={1.5} /> : null;
  };

  const icon = getIconComponent(section.iconName);

  // URL for the section - typically navigates to first post or section page
  const sectionUrl = `/${contentType}s/section/${section.slug}`;

  const handleClick = (e: React.MouseEvent) => {
    if (hasChildren && variant === 'accordion') {
      // For accordion variant, clicking the whole row toggles expansion
      e.preventDefault();
      onToggle(section._id);
    }
    // For navlink variant or sections without children, let the Link handle navigation
  };

  const chevronIcon = isExpanded ? (
    <IconChevronDown size={16} stroke={1.5} />
  ) : (
    <IconChevronRight size={16} stroke={1.5} />
  );

  return (
    <Box className={styles.sectionItemWrapper}>
      <NavLink
        component={hasChildren && variant === 'accordion' ? 'button' : Link}
        href={hasChildren && variant === 'accordion' ? undefined : sectionUrl}
        label={
          <Group gap="xs" wrap="nowrap">
            {icon}
            <Text size="sm" truncate>
              {section.title}
            </Text>
            {section.postCount > 0 && (
              <Text size="xs" c="dimmed" className={styles.postCount}>
                ({section.postCount})
              </Text>
            )}
          </Group>
        }
        leftSection={hasChildren ? chevronIcon : <Box w={16} />}
        active={isActive}
        onClick={handleClick}
        className={styles.sectionItem}
        style={{ paddingLeft: `${12 + indentLevel}px` }}
        data-depth={depth}
      />

      {/* Render children recursively if expanded */}
      {hasChildren && variant === 'accordion' && (
        <Collapse in={isExpanded}>
          <Box className={styles.childrenContainer}>
            {section.children?.map((childSection) => {
              const childIsExpanded = expandedSections.includes(childSection._id);
              const childIsActive = pathname.includes(`/section/${childSection.slug}`);
              
              return (
                <SectionItem
                  key={childSection._id}
                  section={childSection}
                  isExpanded={childIsExpanded}
                  isActive={childIsActive}
                  onToggle={onToggle}
                  contentType={contentType}
                  depth={depth + 1}
                  variant={variant}
                  expandedSections={expandedSections}
                  pathname={pathname}
                />
              );
            })}
          </Box>
        </Collapse>
      )}
    </Box>
  );
});

SectionItem.displayName = 'SectionItem';

export default SectionItem;
