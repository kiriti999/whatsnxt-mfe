'use client';

import React, { useEffect } from 'react';
import { Box, Title, Group, ActionIcon, Tooltip, Divider, TextInput } from '@mantine/core';
import { IconRefresh, IconChevronUp, IconChevronDown, IconSearch } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import {
  fetchSectionTree,
  setContentType,
  expandAll,
  collapseAll,
} from '../../../store/slices/nestedSidebarSlice';
import AccordionVariant from './AccordionVariant';
import NavLinkVariant from './NavLinkVariant';
import styles from './styles.module.css';

interface NestedSidebarProps {
  contentType: 'blog' | 'tutorial';
  variant?: 'accordion' | 'navlink';
  showHeader?: boolean;
  showControls?: boolean;
}

export const NestedSidebar: React.FC<NestedSidebarProps> = ({
  contentType,
  variant = 'accordion',
  showHeader = true,
  showControls = true,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, tree } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  // Debug logging
  useEffect(() => {
    console.log('[NestedSidebar] Component mounted', { contentType, variant, loading, error, treeLength: tree.length });
  }, []);

  useEffect(() => {
    console.log('[NestedSidebar] State updated', { loading, error, treeLength: tree.length });
  }, [loading, error, tree]);

  // Set content type and fetch sections on mount
  useEffect(() => {
    console.log('[NestedSidebar] Setting content type and fetching tree:', contentType);
    dispatch(setContentType(contentType));
    dispatch(fetchSectionTree(contentType));
  }, [dispatch, contentType]);

  // Refresh sections
  const handleRefresh = () => {
    dispatch(fetchSectionTree(contentType));
  };

  // Expand all sections
  const handleExpandAll = () => {
    dispatch(expandAll());
  };

  // Collapse all sections
  const handleCollapseAll = () => {
    dispatch(collapseAll());
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
                  <Tooltip label="Expand all">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={handleExpandAll}
                      aria-label="Expand all sections"
                    >
                      <IconChevronDown size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Collapse all">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={handleCollapseAll}
                      aria-label="Collapse all sections"
                    >
                      <IconChevronUp size={16} />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="Refresh">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={handleRefresh}
                      loading={loading}
                      aria-label="Refresh sections"
                    >
                      <IconRefresh size={16} />
                    </ActionIcon>
                  </Tooltip>
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
