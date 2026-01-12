'use client';

import { Button } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import labApi from '@/apis/lab.api';

/**
 * CloneLabButton Component
 *
 * Allows instructors to clone a published lab to an editable draft version.
 * Displays loading state during clone operation and redirects to draft edit page on success.
 *
 * T031-T034: Full implementation with mutation, error handling, and redirect
 */

interface CloneLabButtonProps {
  labId: string;
  onSuccess?: (clonedLabId: string) => void;
  onError?: (error: Error) => void;
}

export const CloneLabButton: React.FC<CloneLabButtonProps> = ({
  labId,
  onSuccess,
  onError,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // T032: TanStack Query mutation for clone operation
  const cloneMutation = useMutation({
    mutationFn: () => labApi.cloneLab(labId),
    onSuccess: (response) => {
      const clonedLabId = response.data.lab.id;

      // Invalidate queries to refresh lab lists
      queryClient.invalidateQueries({ queryKey: ['labs'] });

      // Show success notification
      notifications.show({
        title: 'Lab Cloned Successfully',
        message: 'Cloned',
        color: 'green',
      });

      // T033: Redirect to draft lab detail page (Tests & Questions tab)
      router.push(`/labs/${clonedLabId}?tab=tests`);

      // Call custom success callback
      if (onSuccess) {
        onSuccess(clonedLabId);
      }
    },
    onError: (error: any) => {
      console.error('[CloneLabButton] Clone failed:', error);

      // T034: Error handling with toast notifications
      const errorCode = error?.response?.data?.code;
      const errorMessage = error?.response?.data?.message || 'Failed to clone lab. Please try again.';

      // Handle duplicate draft clone (409 Conflict)
      if (errorCode === 'DUPLICATE_DRAFT_CLONE') {
        const existingDraftId = error?.response?.data?.context?.existingDraftId;
        notifications.show({
          title: 'Draft Already Exists',
          message: existingDraftId
            ? 'You already have a draft clone of this lab. Redirecting...'
            : 'A draft clone already exists for this lab.',
          color: 'orange',
        });

        // Redirect to existing draft
        if (existingDraftId) {
          setTimeout(() => router.push(`/labs/${existingDraftId}?tab=tests`), 1500);
        }
        return;
      }

      // Handle forbidden (403)
      if (errorCode === 'CLONE_FORBIDDEN') {
        notifications.show({
          title: 'Clone Forbidden',
          message: errorMessage,
          color: 'red',
        });
        return;
      }

      // Generic error notification
      notifications.show({
        title: 'Clone Failed',
        message: errorMessage,
        color: 'red',
      });

      // Call custom error callback
      if (onError) {
        onError(error);
      }
    },
  });

  return (
    <Button
      onClick={() => cloneMutation.mutate()}
      loading={cloneMutation.isPending}
      variant="filled"
      color="blue"
      disabled={cloneMutation.isPending}
    >
      Clone to Edit
    </Button>
  );
};

export default CloneLabButton;
