/**
 * OrphanedPostsView Component
 * Feature: 002-reusable-sections
 * Task: T097, T099, T100
 * 
 * Component for managing orphaned posts (posts without section assignment).
 * Features:
 * - List of orphaned posts with reassign dropdown and delete button
 * - Bulk reassign functionality (select multiple posts, reassign to same section)
 * - Bulk delete functionality (select multiple, delete all)
 * - Empty state when no orphaned posts
 * 
 * Complex Business Logic (Orphaning):
 * When a section is unlinked from content (via DELETE /section-links/{id}):
 * 1. Backend executes: UPDATE posts SET sectionId=NULL WHERE contentId=X AND sectionId=Y
 * 2. Posts lose their section assignment but remain in the content
 * 3. Posts appear here as "orphaned" until trainer reassigns or deletes them
 * 
 * Reassignment Logic:
 * - Validates target section is linked to same content (prevents invalid assignments)
 * - Updates sectionId and recalculates sectionOrder within new section
 * - Individual or bulk reassignment supported
 * 
 * Deletion Logic:
 * - Permanent deletion (no soft delete)
 * - Individual or bulk deletion with confirmation
 * - Cannot be undone - user must explicitly confirm
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Select,
  ActionIcon,
  Checkbox,
  Alert,
  Badge,
  Divider,
  LoadingOverlay,
  Table,
  Modal,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconTrash,
  IconArrowRight,
  IconRefresh,
  IconSelect,
  IconSelectAll,
  IconInbox,
} from '@tabler/icons-react';
import { PostsAPI, OrphanedPost } from '../../apis/v1/sidebar/postsApi';
import type { Section } from '../../apis/v1/sidebar/sectionsApi';

interface OrphanedPostsViewProps {
  contentId: string;
  contentType: 'blog' | 'tutorial';
  linkedSections: Section[]; // Sections linked to this content
  onPostsUpdated?: () => void;
}

export const OrphanedPostsView: React.FC<OrphanedPostsViewProps> = ({
  contentId,
  contentType,
  linkedSections,
  onPostsUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [orphanedPosts, setOrphanedPosts] = useState<OrphanedPost[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());
  const [bulkReassignSectionId, setBulkReassignSectionId] = useState<string>('');
  const [bulkDeleteModalOpened, setBulkDeleteModalOpened] = useState(false);
  const [processingBulk, setProcessingBulk] = useState(false);

  useEffect(() => {
    fetchOrphanedPosts();
  }, [contentId]);

  const fetchOrphanedPosts = async () => {
    setLoading(true);
    try {
      const { posts } = await PostsAPI.getOrphanedPosts(contentId);
      setOrphanedPosts(posts);
      setSelectedPostIds(new Set()); // Clear selection after fetch
    } catch (error) {
      console.error('Failed to fetch orphaned posts:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load orphaned posts',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReassignPost = async (postId: string, sectionId: string) => {
    try {
      await PostsAPI.reassignPost(postId, { sectionId });
      notifications.show({
        title: 'Post Reassigned',
        message: 'Post has been successfully reassigned to the section',
        color: 'green',
      });
      await fetchOrphanedPosts();
      onPostsUpdated?.();
    } catch (error: any) {
      console.error('Failed to reassign post:', error);
      notifications.show({
        title: 'Reassign Failed',
        message: error?.response?.data?.message || 'Failed to reassign post',
        color: 'red',
      });
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${postTitle}"?`)) {
      return;
    }

    try {
      await PostsAPI.deletePost(postId);
      notifications.show({
        title: 'Post Deleted',
        message: 'Post has been permanently deleted',
        color: 'orange',
      });
      await fetchOrphanedPosts();
      onPostsUpdated?.();
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      notifications.show({
        title: 'Delete Failed',
        message: error?.response?.data?.message || 'Failed to delete post',
        color: 'red',
      });
    }
  };

  const handleBulkReassign = async () => {
    if (selectedPostIds.size === 0) {
      notifications.show({
        title: 'No Posts Selected',
        message: 'Please select at least one post to reassign',
        color: 'yellow',
      });
      return;
    }

    if (!bulkReassignSectionId) {
      notifications.show({
        title: 'No Section Selected',
        message: 'Please select a section to reassign posts to',
        color: 'yellow',
      });
      return;
    }

    setProcessingBulk(true);
    try {
      const result = await PostsAPI.bulkReassignPosts(
        Array.from(selectedPostIds),
        bulkReassignSectionId
      );

      notifications.show({
        title: 'Bulk Reassign Complete',
        message: `Successfully reassigned ${result.count} post${result.count !== 1 ? 's' : ''}`,
        color: 'green',
      });

      setBulkReassignSectionId('');
      await fetchOrphanedPosts();
      onPostsUpdated?.();
    } catch (error: any) {
      console.error('Failed to bulk reassign posts:', error);
      notifications.show({
        title: 'Bulk Reassign Failed',
        message: error?.response?.data?.message || 'Failed to reassign posts',
        color: 'red',
      });
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.size === 0) {
      return;
    }

    setProcessingBulk(true);
    try {
      const result = await PostsAPI.bulkDeletePosts(Array.from(selectedPostIds));

      notifications.show({
        title: 'Bulk Delete Complete',
        message: `Successfully deleted ${result.count} post${result.count !== 1 ? 's' : ''}`,
        color: 'orange',
      });

      setBulkDeleteModalOpened(false);
      await fetchOrphanedPosts();
      onPostsUpdated?.();
    } catch (error: any) {
      console.error('Failed to bulk delete posts:', error);
      notifications.show({
        title: 'Bulk Delete Failed',
        message: error?.response?.data?.message || 'Failed to delete posts',
        color: 'red',
      });
    } finally {
      setProcessingBulk(false);
    }
  };

  const togglePostSelection = (postId: string) => {
    const newSelection = new Set(selectedPostIds);
    if (newSelection.has(postId)) {
      newSelection.delete(postId);
    } else {
      newSelection.add(postId);
    }
    setSelectedPostIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPostIds.size === orphanedPosts.length) {
      setSelectedPostIds(new Set());
    } else {
      setSelectedPostIds(new Set(orphanedPosts.map((p) => p._id)));
    }
  };

  const sectionOptions = linkedSections.map((section) => ({
    value: section._id,
    label: section.title,
  }));

  // Empty state
  if (!loading && orphanedPosts.length === 0) {
    return (
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Stack gap="md" align="center" py="xl">
          <IconInbox size={64} color="gray" opacity={0.3} />
          <Text size="lg" fw={500} c="dimmed">
            No Unassigned Posts
          </Text>
          <Text size="sm" c="dimmed" ta="center">
            All posts are assigned to sections. Posts will appear here when sections are
            unlinked.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <Text fw={600} size="lg">
              Unassigned Posts
            </Text>
            <Badge color="orange" variant="light">
              {orphanedPosts.length}
            </Badge>
          </Group>
          <Button
            size="xs"
            variant="subtle"
            leftSection={<IconRefresh size={14} />}
            onClick={fetchOrphanedPosts}
            loading={loading}
          >
            Refresh
          </Button>
        </Group>

        {/* Warning Alert */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Text size="sm">
            These posts lost their section assignment when sections were unlinked. Reassign
            them to a section or delete them permanently.
          </Text>
        </Alert>

        {/* Bulk Actions */}
        {orphanedPosts.length > 0 && (
          <>
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <Checkbox
                    checked={selectedPostIds.size === orphanedPosts.length}
                    indeterminate={
                      selectedPostIds.size > 0 &&
                      selectedPostIds.size < orphanedPosts.length
                    }
                    onChange={toggleSelectAll}
                    label={
                      <Text size="sm" fw={500}>
                        {selectedPostIds.size > 0
                          ? `${selectedPostIds.size} selected`
                          : 'Select all'}
                      </Text>
                    }
                  />
                </Group>

                {selectedPostIds.size > 0 && (
                  <Group gap="xs">
                    <Select
                      placeholder="Reassign to..."
                      data={sectionOptions}
                      value={bulkReassignSectionId}
                      onChange={(value) => setBulkReassignSectionId(value || '')}
                      style={{ width: 200 }}
                      size="xs"
                      clearable
                    />
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconArrowRight size={14} />}
                      onClick={handleBulkReassign}
                      disabled={!bulkReassignSectionId || processingBulk}
                      loading={processingBulk}
                    >
                      Reassign
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => setBulkDeleteModalOpened(true)}
                      disabled={processingBulk}
                    >
                      Delete
                    </Button>
                  </Group>
                )}
              </Group>
            </Stack>
            <Divider />
          </>
        )}

        {/* Posts Table */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}></Table.Th>
              <Table.Th>Post Title</Table.Th>
              <Table.Th style={{ width: 250 }}>Reassign To</Table.Th>
              <Table.Th style={{ width: 60 }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orphanedPosts.map((post) => (
              <Table.Tr key={post._id}>
                <Table.Td>
                  <Checkbox
                    checked={selectedPostIds.has(post._id)}
                    onChange={() => togglePostSelection(post._id)}
                  />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {post.title}
                  </Text>
                  <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                    {post.slug}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Select
                    placeholder="Select section..."
                    data={sectionOptions}
                    size="xs"
                    onChange={(value) => {
                      if (value) {
                        handleReassignPost(post._id, value);
                      }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleDeletePost(post._id, post.title)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        opened={bulkDeleteModalOpened}
        onClose={() => !processingBulk && setBulkDeleteModalOpened(false)}
        title="Confirm Bulk Delete"
        size="sm"
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Text size="sm">
              You are about to permanently delete <strong>{selectedPostIds.size}</strong>{' '}
              post{selectedPostIds.size !== 1 ? 's' : ''}. This action cannot be undone.
            </Text>
          </Alert>

          <Group justify="flex-end" gap="xs">
            <Button
              variant="subtle"
              onClick={() => setBulkDeleteModalOpened(false)}
              disabled={processingBulk}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={16} />}
              onClick={handleBulkDelete}
              loading={processingBulk}
            >
              Delete {selectedPostIds.size} Post{selectedPostIds.size !== 1 ? 's' : ''}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};
