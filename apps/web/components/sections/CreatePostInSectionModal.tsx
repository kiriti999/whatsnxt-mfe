/**
 * CreatePostInSectionModal Component
 * Feature: 002-reusable-sections
 * Task: T048 [US4]
 * 
 * Modal for creating a new post with section assignment.
 * Shows a section selector dropdown with only linked sections.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  LoadingOverlay,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';
import { PostsAPI, type CreatePostRequest } from '../../apis/v1/sidebar/postsApi';
import { SectionLinksAPI } from '../../apis/v1/sidebar/sectionLinksApi';
import type { SectionLinkWithDetails } from '../../types/sectionLink';

interface CreatePostInSectionModalProps {
  opened: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'blog' | 'tutorial';
  preSelectedSectionId?: string; // If opened from a specific section
  onPostCreated?: () => void;
}

/**
 * CreatePostInSectionModal - Modal for creating posts with section assignment
 * 
 * Features:
 * - Title and body input
 * - Section selector (only shows linked sections)
 * - Optional section assignment (can create without section = orphaned)
 * - Pre-selects section if opened from AddPostButton
 * 
 * Usage:
 * ```tsx
 * const [opened, { open, close }] = useDisclosure(false);
 * 
 * <CreatePostInSectionModal
 *   opened={opened}
 *   onClose={close}
 *   contentId={tutorialId}
 *   contentType="tutorial"
 *   preSelectedSectionId={sectionId}
 *   onPostCreated={() => refetchPosts()}
 * />
 * ```
 */
export const CreatePostInSectionModal: React.FC<CreatePostInSectionModalProps> = ({
  opened,
  onClose,
  contentId,
  contentType,
  preSelectedSectionId,
  onPostCreated,
}) => {
  const [linkedSections, setLinkedSections] = useState<SectionLinkWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<{
    title: string;
    body: string;
    sectionId: string;
  }>({
    initialValues: {
      title: '',
      body: '',
      sectionId: preSelectedSectionId || '',
    },
    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title is required';
        }
        if (value.length < 3) {
          return 'Title must be at least 3 characters';
        }
        if (value.length > 200) {
          return 'Title must be less than 200 characters';
        }
        return null;
      },
    },
  });

  // Fetch linked sections when modal opens
  useEffect(() => {
    if (opened && contentId) {
      fetchLinkedSections();
    }
  }, [opened, contentId]);

  // Update pre-selected section when it changes
  useEffect(() => {
    if (preSelectedSectionId) {
      form.setFieldValue('sectionId', preSelectedSectionId);
    }
  }, [preSelectedSectionId]);

  const fetchLinkedSections = async () => {
    setLoading(true);
    try {
      const links = await SectionLinksAPI.getLinksWithDetails(contentId);
      setLinkedSections(links);
    } catch (error) {
      console.error('Failed to fetch linked sections:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load sections',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);

    try {
      const postData: CreatePostRequest = {
        title: values.title,
        body: values.body,
        contentId,
        contentType,
        // Only include sectionId if a section is selected
        ...(values.sectionId && { sectionId: values.sectionId }),
      };

      await PostsAPI.createPost(postData);

      notifications.show({
        title: 'Success',
        message: values.sectionId
          ? 'Post created and assigned to section'
          : 'Post created (unassigned)',
        color: 'green',
        icon: <IconCheck />,
      });

      form.reset();
      onClose();
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to create post',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Convert linked sections to select options
  const sectionOptions = linkedSections.map((link) => ({
    value: link.section._id,
    label: link.section.title,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create New Post"
      size="lg"
    >
      <LoadingOverlay visible={loading} />
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Post Title"
            placeholder="Enter post title..."
            required
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Post Body"
            placeholder="Enter post content..."
            minRows={6}
            {...form.getInputProps('body')}
          />

          <Select
            label="Assign to Section"
            placeholder={
              linkedSections.length === 0
                ? 'No sections linked yet'
                : 'Select a section (optional)'
            }
            data={sectionOptions}
            searchable
            clearable
            disabled={linkedSections.length === 0}
            {...form.getInputProps('sectionId')}
          />

          {linkedSections.length === 0 && (
            <Text size="sm" c="dimmed">
              No sections are linked to this {contentType}. 
              You can create the post without a section (it will be orphaned),
              or link sections first.
            </Text>
          )}

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
            >
              Create Post
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
