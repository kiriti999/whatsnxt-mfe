/**
 * SectionWithPosts Component
 * Feature: 002-reusable-sections
 * Task: T050 [US4]
 * 
 * Displays a section with its nested posts in a sidebar.
 * Shows posts grouped under their sections with proper hierarchy.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Group,
  Text,
  Badge,
  Collapse,
  ActionIcon,
  Tooltip,
  Paper,
  UnstyledButton,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronRight,
  IconGripVertical,
} from '@tabler/icons-react';
import { PostsAPI, type Post } from '../../apis/v1/sidebar/postsApi';
import { AddPostButton } from './AddPostButton';

interface SectionWithPostsProps {
  sectionId: string;
  sectionTitle: string;
  sectionIcon?: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  isEditing?: boolean; // Show edit controls
  showAddButton?: boolean; // Show "Add Post" button
  onPostsChanged?: () => void;
}

/**
 * SectionWithPosts - Section header with collapsible posts list
 * 
 * Features:
 * - Collapsible section with posts
 * - Post count badge
 * - Add post button (when editing)
 * - Nested post display with links
 * 
 * Usage:
 * ```tsx
 * <SectionWithPosts
 *   sectionId={section._id}
 *   sectionTitle={section.title}
 *   contentId={tutorialId}
 *   contentType="tutorial"
 *   isEditing={true}
 *   showAddButton={true}
 *   onPostsChanged={() => refetch()}
 * />
 * ```
 */
export const SectionWithPosts: React.FC<SectionWithPostsProps> = ({
  sectionId,
  sectionTitle,
  sectionIcon,
  contentId,
  contentType,
  isEditing = false,
  showAddButton = false,
  onPostsChanged,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sectionId, contentId]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await PostsAPI.getPostsBySection(contentId, sectionId);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAdded = () => {
    fetchPosts();
    if (onPostsChanged) {
      onPostsChanged();
    }
  };

  return (
    <Box>
      {/* Section Header */}
      <Paper
        p="xs"
        withBorder
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            {isEditing && (
              <IconGripVertical
                size={16}
                style={{ cursor: 'grab', color: 'var(--mantine-color-gray-5)' }}
              />
            )}
            
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronRight size={16} />
              )}
            </ActionIcon>

            <Text fw={500} size="sm">
              {sectionTitle}
            </Text>
          </Group>

          <Badge size="sm" variant="light">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </Badge>
        </Group>
      </Paper>

      {/* Posts List */}
      <Collapse in={expanded}>
        <Box pl="xl" pt="xs">
          <Stack gap="xs">
            {loading && (
              <Text size="sm" c="dimmed">
                Loading posts...
              </Text>
            )}

            {!loading && posts.length === 0 && (
              <Text size="sm" c="dimmed">
                No posts in this section yet
              </Text>
            )}

            {!loading && posts.map((post, index) => (
              <Paper
                key={post._id}
                p="xs"
                withBorder
                style={{
                  borderLeft: '3px solid var(--mantine-color-blue-6)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  {isEditing && (
                    <IconGripVertical
                      size={14}
                      style={{ cursor: 'grab', color: 'var(--mantine-color-gray-5)' }}
                    />
                  )}
                  
                  <Text size="sm" style={{ flex: 1 }}>
                    {post.title}
                  </Text>
                  
                  <Badge size="xs" variant="light" color="gray">
                    {index + 1}
                  </Badge>
                </Group>
              </Paper>
            ))}

            {/* Add Post Button */}
            {showAddButton && isEditing && (
              <Box mt="xs">
                <AddPostButton
                  sectionId={sectionId}
                  sectionTitle={sectionTitle}
                  contentId={contentId}
                  contentType={contentType}
                  onPostAdded={handlePostAdded}
                  variant="button"
                  size="xs"
                  compact
                />
              </Box>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
};
