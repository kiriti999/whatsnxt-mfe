'use client';

import { Button } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import labApi from '@/apis/lab.api';

/**
 * CloneLabButton Component
 *
 * Allows instructors to clone a published lab to an editable draft version.
 * Displays loading state during clone operation and redirects to draft edit page on success.
 *
 * Phase 2: Skeleton component
 * Phase 3: Full implementation with mutation, error handling, and redirect
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
  const [isLoading, setIsLoading] = useState(false);

  const handleClone = () => {
    setIsLoading(true);
    // TODO: Implement clone mutation in Phase 3 (User Story 1)
    console.log('[CloneLabButton] Clone button clicked for lab:', labId);
    setTimeout(() => setIsLoading(false), 1000); // Temporary mock
  };

  return (
    <Button
      onClick={handleClone}
      loading={isLoading}
      variant="filled"
      color="blue"
      disabled={isLoading}
    >
      Clone to Edit
    </Button>
  );
};

export default CloneLabButton;
