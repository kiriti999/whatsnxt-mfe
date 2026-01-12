'use client';

import { Modal, Button, Text, Group } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import labApi from '@/apis/lab.api';

/**
 * RepublishModal Component
 *
 * Confirmation modal for republishing a draft clone back to the original published lab.
 * Warns instructors that this will replace the original lab content.
 *
 * Phase 2: Skeleton component
 * Phase 4: Full implementation with mutation, cache invalidation, and redirect
 */

interface RepublishModalProps {
  labId: string;
  opened: boolean;
  onClose: () => void;
  onSuccess?: (updatedLabId: string) => void;
  onError?: (error: Error) => void;
}

export const RepublishModal: React.FC<RepublishModalProps> = ({
  labId,
  opened,
  onClose,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    // TODO: Implement republish mutation in Phase 4 (User Story 2)
    console.log('[RepublishModal] Republish confirmed for lab:', labId);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000); // Temporary mock
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Confirm Republish" centered>
      <Text size="sm" mb="md">
        ⚠️ <strong>Warning:</strong> This will replace the original published lab with your
        edited draft. Student progress on unchanged questions will be preserved.
      </Text>

      <Text size="sm" mb="lg" c="dimmed">
        This action cannot be undone. Are you sure you want to proceed?
      </Text>

      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={handleConfirm}
          loading={isLoading}
          disabled={isLoading}
        >
          Confirm Republish
        </Button>
      </Group>
    </Modal>
  );
};

export default RepublishModal;
