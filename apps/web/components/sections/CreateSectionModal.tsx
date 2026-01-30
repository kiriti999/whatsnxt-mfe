/**
 * CreateSectionModal Component
 * Feature: 002-reusable-sections
 * Task: T031
 * 
 * Modal component for creating new reusable sections during tutorial/blog editing.
 * Automatically assigns trainerId from current user and optionally links to current content.
 */

'use client';

import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Switch,
  Text,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { SectionsAPI, SectionCreateInput } from '../../apis/v1/sidebar/sectionsApi';
import { SectionLinksAPI } from '../../apis/v1/sidebar/sectionLinksApi';
import { IconPicker } from '../../app/admin/sidebar-management/components/IconPicker';

interface CreateSectionModalProps {
  opened: boolean;
  onClose: () => void;
  contentType: 'blog' | 'tutorial';
  trainerId: string;
  contentId?: string; // If provided, will auto-link after creation
  onSectionCreated?: (sectionId: string) => void;
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  opened,
  onClose,
  contentType,
  trainerId,
  contentId,
  onSectionCreated,
}) => {
  const [creating, setCreating] = useState(false);

  const form = useForm<Omit<SectionCreateInput, 'trainerId'> & { autoLink: boolean }>({
    initialValues: {
      title: '',
      description: '',
      iconName: '',
      contentType,
      isVisible: true,
      autoLink: !!contentId, // Default to true if contentId is provided
    },
    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title is required';
        }
        if (value.length < 3) {
          return 'Title must be at least 3 characters';
        }
        if (value.length > 100) {
          return 'Title must be 100 characters or less';
        }
        return null;
      },
      description: (value) => {
        if (value && value.length > 500) {
          return 'Description must be 500 characters or less';
        }
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setCreating(true);
    try {
      // Create section with trainerId
      const sectionInput: SectionCreateInput = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        iconName: values.iconName || undefined,
        contentType: values.contentType,
        isVisible: values.isVisible,
        trainerId, // Auto-assigned from current user
      };

      const newSection = await SectionsAPI.createSection(sectionInput);

      notifications.show({
        title: 'Success',
        message: `Section "${newSection.title}" created successfully`,
        color: 'green',
      });

      // Auto-link to content if requested and contentId is available
      if (values.autoLink && contentId) {
        try {
          await SectionLinksAPI.createLink({
            sectionId: newSection._id,
            contentId,
            contentType,
          });

          notifications.show({
            title: 'Success',
            message: `Section linked to current ${contentType}`,
            color: 'green',
          });
        } catch (linkError) {
          console.error('Failed to auto-link section:', linkError);
          notifications.show({
            title: 'Warning',
            message: 'Section created but linking failed. You can link it manually.',
            color: 'yellow',
          });
        }
      }

      // Reset form and close
      form.reset();
      onClose();

      // Notify parent
      if (onSectionCreated) {
        onSectionCreated(newSection._id);
      }
    } catch (error: any) {
      console.error('Failed to create section:', error);
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to create section. Please try again.',
        color: 'red',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title="Create New Section"
      size="md"
      closeOnClickOutside={!creating}
      closeOnEscape={!creating}
    >
      <LoadingOverlay visible={creating} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Section Title"
            placeholder="e.g., Introduction, Getting Started, Advanced Topics"
            required
            {...form.getInputProps('title')}
            data-autofocus
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Brief description of what this section covers..."
            minRows={3}
            maxRows={5}
            {...form.getInputProps('description')}
          />

          <IconPicker
            value={form.values.iconName}
            onChange={(iconName) => form.setFieldValue('iconName', iconName)}
            label="Icon (Optional)"
          />

          <Switch
            label="Make section visible in library"
            description="Visible sections can be found and linked by other trainers"
            {...form.getInputProps('isVisible', { type: 'checkbox' })}
          />

          {contentId && (
            <Switch
              label={`Link to current ${contentType} after creation`}
              description="Automatically add this section to the current content"
              {...form.getInputProps('autoLink', { type: 'checkbox' })}
            />
          )}

          <Text size="xs" c="dimmed">
            This section will be created in your personal library and can be reused across multiple {contentType}s.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleCancel} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" loading={creating} leftSection={<IconPlus size={16} />}>
              Create Section
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default CreateSectionModal;
