import React, { memo } from 'react';
import { NavLink, Collapse, Box, Group, Text } from '@mantine/core';
import { IconChevronRight, IconChevronDown, IconFileText } from '@tabler/icons-react';
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
  forceExpand?: boolean;
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
  forceExpand = false,
}) => {
  const hasChildSections = section.children && section.children.length > 0;
  const hasPosts = section.posts && section.posts.length > 0;
  const hasContent = hasChildSections || hasPosts;

  const indentLevel = depth * 16; // 16px per level

  // ... (rest of getting icon)

  // URL for the section 
  const sectionUrl = hasContent ? '#' : `/${contentType}s/section/${section.slug}`;

  const handleClick = (e: React.MouseEvent) => {
    if (hasContent && variant === 'accordion' && !forceExpand) {
      // For accordion variant, clicking the whole row toggles expansion if it has content
      // Disable toggle if forceExpand is active (search mode)
      e.preventDefault();
      onToggle(section._id);
    }
  };

  const chevronIcon = isExpanded || forceExpand ? (
    <IconChevronDown size={16} stroke={1.5} />
  ) : (
    <IconChevronRight size={16} stroke={1.5} />
  );

  return (
    <Box className={styles.sectionItemWrapper}>
      <NavLink
        component={hasContent && variant === 'accordion' && !forceExpand ? 'button' : Link}
        href={hasContent && variant === 'accordion' && !forceExpand ? undefined : sectionUrl}
        // ... (label)
        label={
          <Group gap="xs" wrap="nowrap">
            {/* icon rendering */}
            {section.iconName && (TablerIcons as any)[`Icon${section.iconName.charAt(0).toUpperCase()}${section.iconName.slice(1)}`] ?
              React.createElement((TablerIcons as any)[`Icon${section.iconName.charAt(0).toUpperCase()}${section.iconName.slice(1)}`], { size: 18, stroke: 1.5 }) : null}
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
        leftSection={hasContent ? chevronIcon : <Box w={16} />}
        active={isActive}
        onClick={handleClick}
        className={styles.sectionItem}
        style={{ paddingLeft: `${12 + indentLevel}px` }}
        data-depth={depth}
        data-active={isActive}
      />

      {/* Render children and posts recursively if expanded */}
      {hasContent && variant === 'accordion' && (isExpanded || forceExpand) && (
        <Collapse in={isExpanded || forceExpand}>
          <Box className={styles.childrenContainer}>
            {/* Render nested sections first */}
            {section.children?.map((childSection) => {
              const childIsExpanded = expandedSections.includes(childSection._id);
              const childIsActive = pathname.includes(`/section/${childSection.slug}`);

              return (
                <SectionItem
                  key={childSection._id}
                  section={childSection}
                  isExpanded={childIsExpanded || forceExpand}
                  isActive={childIsActive}
                  onToggle={onToggle}
                  contentType={contentType}
                  depth={depth + 1}
                  variant={variant}
                  expandedSections={expandedSections}
                  pathname={pathname}
                  forceExpand={forceExpand}
                />
              );
            })}

            {/* Render posts ... */}
            {section.posts?.map((post) => {
              // ...
              const isPostActive = pathname.includes(`/content/${post.slug}`) || pathname.includes(`/${post.slug}`);
              const postIndentLevel = (depth + 1) * 16;
              return (
                <NavLink
                  key={post._id}
                  component={Link}
                  href={`/content/${post.slug}`}
                  // ...
                  label={
                    <Text size="sm" truncate>
                      {post.title}
                    </Text>
                  }
                  leftSection={<IconFileText size={16} stroke={1.5} className={styles.icon} />}
                  active={isPostActive}
                  className={styles.sectionItem}
                  style={{
                    paddingLeft: `${12 + postIndentLevel}px`,
                    fontSize: '0.9rem'
                  }}
                  data-depth={depth + 1}
                  data-type="post"
                  data-active={isPostActive}
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
