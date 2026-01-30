/**
 * UnlinkConfirmationModal Component
 * Feature: 002-reusable-sections
 * Task: T040, T043
 * 
 * Modal component for confirming section unlink from content.
 * Shows impact preview (number of posts that will be orphaned).
 * 
 * Complex Business Logic (Unlinking):
 * When unlinking a section from content:
 * 1. Deletes the SectionLink record (removes association)
 * 2. Backend orphans all posts: UPDATE posts SET sectionId=NULL WHERE sectionId=X AND contentId=Y
 * 3. Returns count of orphaned posts in response
 * 4. Posts remain in content but appear in "Unassigned Posts" view
 * 5. Trainer can later reassign or delete orphaned posts
 * 
 * The section itself is NOT deleted - only the link is removed.
 * The section can be relinked later, but posts won't auto-reassign.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Button,
  Stack,
  Group,
  Alert,
  Badge,
  LoadingOverlay,
  List,
} from '@mantine/core';
import { IconAlertTriangle, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SectionLinksAPI } from '../../apis/v1/sidebar/sectionLinksApi';

interface UnlinkConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  sectionLinkId: string;
  sectionTitle: string;
  contentType: 'blog' | 'tutorial';
  onUnlinkSuccess?: (orphanedCount: number) => void;
}

export const UnlinkConfirmationModal: React.FC<UnlinkConfirmationModalProps> = ({
  opened,
  onClose,
  sectionLinkId,
  sectionTitle,
  contentType,
  onUnlinkSuccess,
}) => {
  const [unlinking, setUnlinking] = useState(false);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [loadingPostCount, setLoadingPostCount] = useState(false);

  // Fetch post count when modal opens
  useEffect(() => {
    if (opened && sectionLinkId) {
      fetchPostCount();
    }
  }, [opened, sectionLinkId]);

  const fetchPostCount = async () => {
    setLoadingPostCount(true);
    try {
      // This would ideally be a dedicated endpoint to get post count
      // For now, we'll set it to null and show a generic warning
      // TODO: Implement GET /api/v1/section-links/{linkId}/post-count endpoint
      setPostCount(null);
    } catch (error) {
      console.error('Failed to fetch post count:', error);
      setPostCount(null);
    } finally {
      setLoadingPostCount(false);
    }
  };

  const handleUnlink = async () => {
    setUnlinking(true);
    try {
      const result = await SectionLinksAPI.deleteLink(sectionLinkId);
      
      const orphanedCount = result?.orphanedCount || 0;

      notifications.show({
        title: 'Section Unlinked',
        message: orphanedCount > 0 
          ? `${orphanedCount} post(s) moved to "Unassigned Posts"` 
          : 'Section unlinked successfully',
        color: orphanedCount > 0 ? 'yellow' : 'green',
      });

      onClose();

      if (onUnlinkSuccess) {
        onUnlinkSuccess(orphanedCount);
      }
    } catch (error: any) {
      console.error('Failed to unlink section:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to unlink section. Please try again.',
        color: 'red',
      });
    } finally {
      setUnlinking(false);
    }
  };

  const handleCancel = () => {
    if (!unlinking) {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title="Unlink Section"
      size="md"
      closeOnClickOutside={!unlinking}
      closeOnEscape={!unlinking}
    >
      <LoadingOverlay visible={unlinking} />

      <Stack gap="md">
        <Text size="sm">
          Are you sure you want to unlink the section{' '}
          <Text component="span" fw={600}>
            "{sectionTitle}"
          </Text>{' '}
          from this {contentType}?
        </Text>

        <Alert 
          icon={<IconAlertTriangle size={20} />} 
          title="What will happen" 
          color="yellow"
          variant="light"
        >
          <Stack gap="xs">
            <Text size="sm">
              The section will be removed from this {contentType}'s sidebar.
            </Text>
            
            {loadingPostCount ? (
              <Text size="sm" c="dimmed">
                Checking for posts...
              </Text>
            ) : postCount !== null && postCount > 0 ? (
              <Text size="sm" fw={500}>
                <Badge color="yellow" size="sm" mr="xs">{postCount}</Badge>
                post(s) will be moved to "Unassigned Posts"
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                Any posts in this section will be moved to "Unassigned Posts"
              </Text>
            )}
            
            <Text size="sm">
              The section will remain in your section library and can be linked to other {contentType}s.
            </Text>
          </Stack>
        </Alert>

        <Alert color="blue" variant="light">
          <Text size="sm" fw={500}>
            Note: This does not delete the section or its posts
          </Text>
          <List size="sm" mt="xs" spacing="xs">
            <List.Item>The section remains in your library for reuse</List.Item>
            <List.Item>Posts can be reassigned to other sections</List.Item>
            <List.Item>Other {contentType}s using this section are unaffected</List.Item>
          </List>
        </Alert>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleCancel} disabled={unlinking}>
            Cancel
          </Button>
          <Button 
            color="red" 
            loading={unlinking} 
            leftSection={<IconTrash size={16} />}
            onClick={handleUnlink}
          >
            Unlink Section
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default UnlinkConfirmationModal;
