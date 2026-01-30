/**
 * SectionDeleteConfirmModal Component
 * Feature: 002-reusable-sections
 * Task: T107
 * 
 * Confirmation modal for section deletion with impact preview.
 * Shows:
 * - List of affected content (tutorials/blogs where section is linked)
 * - Count of posts that will become orphaned
 * - Warning if section is used in multiple places
 * - Explicit confirmation required
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Alert,
  Loader,
  Center,
  Table,
  Badge,
  Divider,
  Checkbox,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconTrash,
  IconFileText,
  IconLink,
} from '@tabler/icons-react';
import xior from 'xior';

const apiClient = xior.create({
  baseURL: process.env.NEXT_PUBLIC_BFF_HOST || 'http://localhost:4444',
  withCredentials: true,
});

interface AffectedContent {
  contentId: string;
  contentTitle: string;
  contentType: 'blog' | 'tutorial';
  orphanedPostsCount: number;
}

interface DeleteImpact {
  sectionId: string;
  sectionTitle: string;
  totalLinks: number;
  totalOrphanedPosts: number;
  affectedContent: AffectedContent[];
}

interface SectionDeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
  onConfirmDelete: () => void;
}

export const SectionDeleteConfirmModal: React.FC<SectionDeleteConfirmModalProps> = ({
  opened,
  onClose,
  sectionId,
  sectionTitle,
  onConfirmDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState<DeleteImpact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (opened) {
      fetchDeleteImpact();
      setConfirmChecked(false);
    }
  }, [opened, sectionId]);

  const fetchDeleteImpact = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ success: boolean; data: DeleteImpact }>(
        `/api/v1/sections/${sectionId}/delete-impact`
      );
      setImpact(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch delete impact:', err);
      setError(
        err?.response?.data?.message ||
          'Failed to load impact preview. You can still proceed with deletion.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onConfirmDelete();
      onClose();
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!deleting) {
      setConfirmChecked(false);
      onClose();
    }
  };

  const renderImpactPreview = () => {
    if (loading) {
      return (
        <Center py="xl">
          <Stack gap="xs" align="center">
            <Loader size="md" />
            <Text size="sm" c="dimmed">
              Analyzing impact...
            </Text>
          </Stack>
        </Center>
      );
    }

    if (error) {
      return (
        <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light">
          <Text size="sm">{error}</Text>
        </Alert>
      );
    }

    if (!impact) {
      return null;
    }

    const isHighImpact = impact.totalLinks >= 5 || impact.totalOrphanedPosts >= 10;

    return (
      <Stack gap="md">
        {/* Summary */}
        <Group gap="md">
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Affected Content
            </Text>
            <Badge size="lg" color="blue" variant="light">
              {impact.totalLinks}
            </Badge>
          </Stack>
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              Posts to Unassign
            </Text>
            <Badge size="lg" color="orange" variant="light">
              {impact.totalOrphanedPosts}
            </Badge>
          </Stack>
        </Group>

        {/* High Impact Warning */}
        {isHighImpact && (
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="filled"
          >
            <Text size="sm" fw={600}>
              High Impact Deletion
            </Text>
            <Text size="xs" mt={4}>
              This section is widely used. Consider transferring ownership instead of
              deleting.
            </Text>
          </Alert>
        )}

        {/* Affected Content Table */}
        {impact.affectedContent.length > 0 && (
          <>
            <Divider />
            <div>
              <Group gap="xs" mb="xs">
                <IconLink size={16} />
                <Text size="sm" fw={600}>
                  Where This Section Is Used
                </Text>
              </Group>
              <Table striped highlightOnHover size="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Orphaned Posts</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {impact.affectedContent.map((content) => (
                    <Table.Tr key={content.contentId}>
                      <Table.Td>
                        <Text size="sm">{content.contentTitle}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          color={content.contentType === 'blog' ? 'blue' : 'green'}
                          variant="light"
                        >
                          {content.contentType}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          color={
                            content.orphanedPostsCount > 0 ? 'orange' : 'gray'
                          }
                          variant="light"
                        >
                          {content.orphanedPostsCount}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </>
        )}

        {/* What Will Happen */}
        <Alert icon={<IconFileText size={16} />} color="blue" variant="light">
          <Text size="sm" fw={600} mb={4}>
            What will happen:
          </Text>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
            <li>
              Section <strong>"{sectionTitle}"</strong> will be permanently deleted
            </li>
            <li>
              All <strong>{impact.totalLinks}</strong> link{impact.totalLinks !== 1 ? 's' : ''}{' '}
              to this section will be removed
            </li>
            {impact.totalOrphanedPosts > 0 ? (
              <li>
                <strong>{impact.totalOrphanedPosts}</strong> post
                {impact.totalOrphanedPosts !== 1 ? 's' : ''} will become unassigned (can be
                reassigned later)
              </li>
            ) : (
              <li>No posts will be affected (section is empty)</li>
            )}
            <li>This action cannot be undone</li>
          </ul>
        </Alert>
      </Stack>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconTrash size={20} color="red" />
          <Text fw={600}>Confirm Section Deletion</Text>
        </Group>
      }
      size="lg"
      closeOnClickOutside={!deleting}
      closeOnEscape={!deleting}
    >
      <Stack gap="md">
        <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
          <Text size="sm">
            You are about to permanently delete the section{' '}
            <strong>"{sectionTitle}"</strong>.
          </Text>
        </Alert>

        {renderImpactPreview()}

        <Divider />

        {/* Confirmation Checkbox */}
        <Checkbox
          checked={confirmChecked}
          onChange={(event) => setConfirmChecked(event.currentTarget.checked)}
          label={
            <Text size="sm">
              I understand this action is permanent and cannot be undone
            </Text>
          }
          disabled={deleting}
        />

        {/* Action Buttons */}
        <Group justify="flex-end" gap="xs">
          <Button variant="subtle" onClick={handleClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="red"
            leftSection={<IconTrash size={16} />}
            onClick={handleConfirmDelete}
            disabled={!confirmChecked}
            loading={deleting}
          >
            Delete Section
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
