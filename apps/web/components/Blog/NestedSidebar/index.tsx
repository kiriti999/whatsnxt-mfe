'use client';

import React, { useEffect } from 'react';
import { Box, Title, Group, ActionIcon, Tooltip, Divider, TextInput } from '@mantine/core';
import { IconSearch, IconLayoutSidebarLeftCollapse, IconX } from '@tabler/icons-react';
import { setContentType, fetchSectionTree } from '@/store/slices/nestedSidebarSlice';
import { AppDispatch, RootState } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import AccordionVariant from './AccordionVariant';
import NavLinkVariant from './NavLinkVariant';
import styles from './styles.module.css';

interface NestedSidebarProps {
  contentType: 'blog' | 'tutorial';
  variant?: 'accordion' | 'navlink';
  showHeader?: boolean;
  showControls?: boolean;
  onCollapse?: () => void;
  isMobile?: boolean;
}

export const NestedSidebar: React.FC<NestedSidebarProps> = ({
  contentType,
  variant = 'accordion',
  showHeader = true,
  showControls = true,
  onCollapse,
  isMobile = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, tree } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  // Debug logging
  // ... (keeping debug logs)

  // Set content type and fetch sections on mount
  useEffect(() => {
    dispatch(setContentType(contentType));
    // Fetch only if tree is empty to prevent infinite loops or redundant fetches if persisted
    if (tree.length === 0) {
      dispatch(fetchSectionTree(contentType));
    }
  }, [dispatch, contentType]);

  // Refresh sections
  const handleRefresh = () => {
    dispatch(fetchSectionTree(contentType));
  };


  return (
    <Box className={styles.sidebarContainer}>
      {showHeader && (
        <>
          <Box className={styles.sidebarHeader}>
            <Group justify="space-between" wrap="nowrap">
              <Title order={4} size="h5">
                {contentType === 'blog' ? 'Blog' : 'Tutorials'}
              </Title>

              {showControls && (
                <Group gap="xs">
                  {onCollapse && (
                    <Tooltip label={isMobile ? "Close sidebar" : "Collapse sidebar"}>
                      <ActionIcon
                        variant="subtle"
                        size="sm"
                        onClick={onCollapse}
                        aria-label={isMobile ? "Close sidebar" : "Collapse sidebar"}
                      >
                        {isMobile ? <IconX size={20} /> : <IconLayoutSidebarLeftCollapse size={18} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Group>
            <Box mt="md">
              <TextInput
                placeholder="Search topics..."
                leftSection={<IconSearch size={14} />}
                size="xs"
                radius="md"
                styles={{ input: { backgroundColor: 'var(--mantine-color-default)' } }}
              />
            </Box>
          </Box>
          <Divider />
        </>
      )}

      <Box className={styles.sidebarContent}>
        {variant === 'accordion' ? (
          <AccordionVariant contentType={contentType} />
        ) : (
          <NavLinkVariant contentType={contentType} />
        )}
      </Box>
    </Box>
  );
};

export default NestedSidebar;
