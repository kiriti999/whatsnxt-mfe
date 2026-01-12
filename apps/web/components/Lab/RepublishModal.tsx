'use client';

import { Modal, Button, Text, Group } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import labApi from '@/apis/lab.api';

/**
 * RepublishModal Component
 *
 * Confirmation modal for republishing a draft clone back to the original published lab.
 * Warns instructors that this will replace the original lab content.
 *
 * T062-T068: Full implementation with mutation, cache invalidation, and redirect
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
  const router = useRouter();
  const queryClient = useQueryClient();

  // T065: TanStack Query mutation for republish operation
  const republishMutation = useMutation({
    mutationFn: () => labApi.republishLab(labId),
    onSuccess: (response) => {
      const updatedLabId = response.data.lab.id;
      
      // T067: Invalidate TanStack Query cache for original lab
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['lab', updatedLabId] });
      
      // Show success notification
      notifications.show({
        title: 'Lab Republished Successfully',
        message: 'Original lab updated. Redirecting...',
        color: 'green',
      });

      // Close modal
      onClose();

      // T066: Redirect to original published lab
      router.push(`/labs/${updatedLabId}`);

      // Call custom success callback
      if (onSuccess) {
        onSuccess(updatedLabId);
      }
    },
    onError: (error: any) => {
      console.error('[RepublishModal] Republish failed:', error);

      // T068: Error handling with toast notifications
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message || 'Failed to republish lab. Please try again.';

      // Handle NOT_A_CLONE error (400)
      if (errorCode === 'NOT_A_CLONE') {
        notifications.show({
          title: 'Republish Failed',
          message: 'This lab is not a clone and cannot be republished.',
          color: 'red',
        });
        onClose();
        return;
      }

      // Generic error notification
      notifications.show({
        title: 'Republish Failed',
        message: errorMessage,
        color: 'red',
      });

      // Call custom error callback
      if (onError) {
        onError(error);
      }
    },
  });

  const handleConfirm = () => {
    republishMutation.mutate();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Confirm Republish" centered>
      {/* T063: Warning message */}
      <Text size="sm" mb="md">
        ⚠️ <strong>Warning:</strong> This will replace the original published lab with your
        edited draft. Student progress on unchanged questions will be preserved.
      </Text>

      <Text size="sm" mb="lg" c="dimmed">
        This action cannot be undone. Are you sure you want to proceed?
      </Text>

      {/* T064: Cancel and Confirm buttons */}
      <Group justify="flex-end">
        <Button 
          variant="default" 
          onClick={onClose} 
          disabled={republishMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          variant="filled"
          color="blue"
          onClick={handleConfirm}
          loading={republishMutation.isPending}
          disabled={republishMutation.isPending}
        >
          Confirm Republish
        </Button>
      </Group>
    </Modal>
  );
};

export default RepublishModal;
