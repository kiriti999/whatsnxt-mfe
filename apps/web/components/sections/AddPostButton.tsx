/**
 * AddPostButton Component
 * Feature: 002-reusable-sections
 * Task: T047 [US4]
 * 
 * Button component that appears under each section in the tutorial sidebar.
 * Opens a modal/form to create a new post assigned to the specific section.
 */

'use client';

import React from 'react';
import { Button, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { CreatePostInSectionModal } from './CreatePostInSectionModal';

interface AddPostButtonProps {
  sectionId: string;
  sectionTitle: string;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  onPostAdded?: () => void;
  variant?: 'button' | 'icon'; // Display as button or icon
  size?: 'xs' | 'sm' | 'md' | 'lg';
  compact?: boolean;
}

/**
 * AddPostButton - Shows an "Add Post" action under a section
 * 
 * Usage:
 * ```tsx
 * <AddPostButton
 *   sectionId={section._id}
 *   sectionTitle={section.title}
 *   contentId={tutorialId}
 *   contentType="tutorial"
 *   onPostAdded={() => refetch()}
 * />
 * ```
 */
export const AddPostButton: React.FC<AddPostButtonProps> = ({
  sectionId,
  sectionTitle,
  contentId,
  contentType,
  onPostAdded,
  variant = 'button',
  size = 'sm',
  compact = false,
}) => {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const handlePostCreated = () => {
    closeModal();
    if (onPostAdded) {
      onPostAdded();
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip label={`Add post to ${sectionTitle}`} position="right">
          <ActionIcon
            onClick={openModal}
            size={size}
            variant="subtle"
            color="blue"
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
        
        <CreatePostInSectionModal
          opened={modalOpened}
          onClose={closeModal}
          contentId={contentId}
          contentType={contentType}
          preSelectedSectionId={sectionId}
          onPostCreated={handlePostCreated}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={openModal}
        leftSection={<IconPlus size={16} />}
        variant="light"
        size={size}
        compact={compact}
        fullWidth
      >
        Add Post
      </Button>
      
      <CreatePostInSectionModal
        opened={modalOpened}
        onClose={closeModal}
        contentId={contentId}
        contentType={contentType}
        preSelectedSectionId={sectionId}
        onPostCreated={handlePostCreated}
      />
    </>
  );
};
