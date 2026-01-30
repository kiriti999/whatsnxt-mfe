/**
 * SectionOwnershipActions Component
 * Feature: 002-reusable-sections
 * Task: T088, T092, T108, T109
 * 
 * Component for section ownership-related actions including:
 * - Transfer Ownership button (T088)
 * - Ownership validation UI (T092)
 * - Edit/Delete button state based on ownership
 * - Section deletion with impact preview (T108)
 * - High usage warning before deletion (T109)
 * 
 * Complex Business Logic:
 * 1. Ownership Validation: Only section owner or admin can edit/delete
 * 2. Transfer Initiation: Only owner can initiate ownership transfer
 * 3. Delete Impact Analysis: Checks usage count before showing delete modal
 * 4. High Usage Warning: Shows warning if section used in 3+ places
 * 5. Cascade Deletion: Backend handles deletion of section links and orphaning posts
 */

'use client';

import React, { useState } from 'react';
import { Group, Button, ActionIcon, Tooltip, Badge, Text, Modal, Stack, Alert } from '@mantine/core';
import { IconTransfer, IconEdit, IconTrash, IconLock, IconAlertTriangle } from '@tabler/icons-react';
import { SectionTransferModal } from './SectionTransferModal';
import { SectionDeleteConfirmModal } from './SectionDeleteConfirmModal';
import { SectionsAPI } from '../../apis/v1/sidebar/sectionsApi';
import { notifications } from '@mantine/notifications';
import type { Section } from '../../apis/v1/sidebar/sectionsApi';

interface SectionOwnershipActionsProps {
  section: Section;
  currentTrainerId: string;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTransferInitiated?: () => void;
  variant?: 'buttons' | 'icons'; // Display as buttons or icon actions
  showOwnerBadge?: boolean; // Show owner badge if current user is not owner
}

export const SectionOwnershipActions: React.FC<SectionOwnershipActionsProps> = ({
  section,
  currentTrainerId,
  isAdmin = false,
  onEdit,
  onDelete,
  onTransferInitiated,
  variant = 'buttons',
  showOwnerBadge = true,
}) => {
  const [transferModalOpened, setTransferModalOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [showHighUsageWarning, setShowHighUsageWarning] = useState(false);
  const [usageCount, setUsageCount] = useState<number>(0);

  const isOwner = section.trainerId === currentTrainerId;
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;
  const canTransfer = isOwner; // Only owner can initiate transfer

  const handleTransferClick = () => {
    if (canTransfer) {
      setTransferModalOpened(true);
    }
  };

  const handleEdit = () => {
    if (canEdit && onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    if (canDelete && onDelete) {
      // T109: Check usage count and show warning if high
      checkUsageAndShowDeleteModal();
    }
  };

  /**
   * T109: Check usage and show appropriate modal/warning
   * Business Logic:
   * - Fetches usage statistics (number of content items using this section)
   * - If used in 3+ places, shows high-impact warning first
   * - Otherwise, proceeds directly to delete confirmation modal
   * - Gracefully handles API errors by allowing deletion anyway
   */
  const checkUsageAndShowDeleteModal = async () => {
    try {
      // Fetch usage stats to determine impact
      const usage = await SectionsAPI.getUsageDetails(section._id);
      setUsageCount(usage.totalLinks);
      
      // High usage threshold: 3+ content items
      // Shows warning to consider alternatives (transfer, unlink instead)
      if (usage.totalLinks >= 3) {
        setShowHighUsageWarning(true);
      } else {
        // Low usage - proceed directly to delete modal
        setShowHighUsageWarning(false);
        setDeleteModalOpened(true);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      // Still allow deletion even if usage check fails
      // Better UX than blocking user due to API error
      setShowHighUsageWarning(false);
      setDeleteModalOpened(true);
    }
  };

  const handleProceedWithDelete = () => {
    setShowHighUsageWarning(false);
    setDeleteModalOpened(true);
  };

  const handleCancelDelete = () => {
    setShowHighUsageWarning(false);
  };

  /**
   * T108: Confirm and execute section deletion
   * Business Logic:
   * - Calls backend DELETE endpoint which handles cascade deletion:
   *   1. Deletes all SectionLink records (unlinks from content)
   *   2. Sets sectionId=null on all posts (orphaning)
   *   3. Deletes the Section record
   * - All operations wrapped in backend transaction for atomicity
   * - Shows success/error notifications
   * - Calls parent onDelete callback to refresh UI
   */
  const handleConfirmDelete = async () => {
    try {
      await SectionsAPI.deleteSection(section._id);
      notifications.show({
        title: 'Section Deleted',
        message: `Section "${section.title}" has been permanently deleted`,
        color: 'green',
      });
      setDeleteModalOpened(false);
      onDelete?.();
    } catch (error: any) {
      console.error('Failed to delete section:', error);
      notifications.show({
        title: 'Delete Failed',
        message: error?.response?.data?.message || 'Failed to delete section',
        color: 'red',
      });
      throw error; // Re-throw so modal can handle loading state
    }
  };

  // Buttons variant
  if (variant === 'buttons') {
    return (
      <>
        <Group gap="xs">
          {!isOwner && showOwnerBadge && (
            <Tooltip label={`Owned by another trainer${isAdmin ? ' (You have admin access)' : ''}`}>
              <Badge
                color={isAdmin ? 'blue' : 'gray'}
                variant="light"
                leftSection={<IconLock size={12} />}
              >
                {isAdmin ? 'Admin Access' : 'Not Owner'}
              </Badge>
            </Tooltip>
          )}

          {onEdit && (
            <Tooltip
              label={!canEdit ? 'You do not have permission to edit this section' : 'Edit section'}
            >
              <span>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<IconEdit size={14} />}
                  onClick={handleEdit}
                  disabled={!canEdit}
                >
                  Edit
                </Button>
              </span>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip
              label={
                !canDelete ? 'You do not have permission to delete this section' : 'Delete section'
              }
            >
              <span>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={handleDelete}
                  disabled={!canDelete}
                >
                  Delete
                </Button>
              </span>
            </Tooltip>
          )}

          {canTransfer && (
            <Tooltip label="Transfer ownership to another trainer">
              <Button
                size="xs"
                variant="light"
                color="blue"
                leftSection={<IconTransfer size={14} />}
                onClick={handleTransferClick}
              >
                Transfer Ownership
              </Button>
            </Tooltip>
          )}
        </Group>

        <SectionTransferModal
          opened={transferModalOpened}
          onClose={() => setTransferModalOpened(false)}
          sectionId={section._id}
          sectionTitle={section.title}
          currentTrainerId={currentTrainerId}
          onTransferInitiated={onTransferInitiated}
        />

        {/* T109: High Usage Warning Banner */}
        {showHighUsageWarning && (
          <Modal
            opened={showHighUsageWarning}
            onClose={handleCancelDelete}
            title={
              <Group gap="xs">
                <IconAlertTriangle size={20} color="orange" />
                <Text fw={600}>High Usage Warning</Text>
              </Group>
            }
            size="md"
          >
            <Stack gap="md">
              <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
                <Text size="sm" fw={600} mb={4}>
                  This section is widely used!
                </Text>
                <Text size="sm">
                  This section is linked to <strong>{usageCount}</strong> piece(s) of content.
                  Deleting it will affect multiple tutorials/blogs and unassign all posts within.
                </Text>
              </Alert>

              <Text size="sm" c="dimmed">
                Consider these alternatives before deleting:
              </Text>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
                <li>Transfer ownership to another trainer instead</li>
                <li>Unlink the section from specific content instead of deleting</li>
                <li>Archive or hide the section for future reference</li>
              </ul>

              <Group justify="flex-end" gap="xs" mt="md">
                <Button variant="subtle" onClick={handleCancelDelete}>
                  Cancel
                </Button>
                <Button color="orange" onClick={handleProceedWithDelete}>
                  Proceed with Deletion
                </Button>
              </Group>
            </Stack>
          </Modal>
        )}

        {/* T108: Delete Confirmation Modal with Impact Preview */}
        <SectionDeleteConfirmModal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          sectionId={section._id}
          sectionTitle={section.title}
          onConfirmDelete={handleConfirmDelete}
        />
      </>
    );
  }

  // Icons variant
  return (
    <>
      <Group gap={4}>
        {!isOwner && showOwnerBadge && (
          <Tooltip label={`Owned by another trainer${isAdmin ? ' (Admin)' : ''}`}>
            <ActionIcon
              variant="transparent"
              color={isAdmin ? 'blue' : 'gray'}
              size="sm"
            >
              <IconLock size={16} />
            </ActionIcon>
          </Tooltip>
        )}

        {onEdit && (
          <Tooltip
            label={!canEdit ? 'No edit permission' : 'Edit'}
          >
            <span>
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={handleEdit}
                disabled={!canEdit}
                size="sm"
              >
                <IconEdit size={16} />
              </ActionIcon>
            </span>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip
            label={!canDelete ? 'No delete permission' : 'Delete'}
          >
            <span>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={handleDelete}
                disabled={!canDelete}
                size="sm"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </span>
          </Tooltip>
        )}

        {canTransfer && (
          <Tooltip label="Transfer ownership">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={handleTransferClick}
              size="sm"
            >
              <IconTransfer size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <SectionTransferModal
        opened={transferModalOpened}
        onClose={() => setTransferModalOpened(false)}
        sectionId={section._id}
        sectionTitle={section.title}
        currentTrainerId={currentTrainerId}
        onTransferInitiated={onTransferInitiated}
      />

      {/* T109: High Usage Warning Banner (same for icons variant) */}
      {showHighUsageWarning && (
        <Modal
          opened={showHighUsageWarning}
          onClose={handleCancelDelete}
          title={
            <Group gap="xs">
              <IconAlertTriangle size={20} color="orange" />
              <Text fw={600}>High Usage Warning</Text>
            </Group>
          }
          size="md"
        >
          <Stack gap="md">
            <Alert icon={<IconAlertTriangle size={16} />} color="orange" variant="light">
              <Text size="sm" fw={600} mb={4}>
                This section is widely used!
              </Text>
              <Text size="sm">
                This section is linked to <strong>{usageCount}</strong> piece(s) of content.
                Deleting it will affect multiple tutorials/blogs and unassign all posts within.
              </Text>
            </Alert>

            <Text size="sm" c="dimmed">
              Consider these alternatives before deleting:
            </Text>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.875rem' }}>
              <li>Transfer ownership to another trainer instead</li>
              <li>Unlink the section from specific content instead of deleting</li>
              <li>Archive or hide the section for future reference</li>
            </ul>

            <Group justify="flex-end" gap="xs" mt="md">
              <Button variant="subtle" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button color="orange" onClick={handleProceedWithDelete}>
                Proceed with Deletion
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {/* T108: Delete Confirmation Modal with Impact Preview (same for icons variant) */}
      <SectionDeleteConfirmModal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        sectionId={section._id}
        sectionTitle={section.title}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
};

/**
 * Hook to check section ownership
 */
export const useSectionOwnership = (
  section: Section | null | undefined,
  currentTrainerId: string,
  isAdmin: boolean = false
) => {
  if (!section) {
    return {
      isOwner: false,
      canEdit: false,
      canDelete: false,
      canTransfer: false,
    };
  }

  const isOwner = section.trainerId === currentTrainerId;

  return {
    isOwner,
    canEdit: isOwner || isAdmin,
    canDelete: isOwner || isAdmin,
    canTransfer: isOwner,
  };
};
