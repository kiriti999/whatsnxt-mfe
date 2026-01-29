'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Select,
  Button,
  Group,
  Stack,
  Text,
  NumberInput,
  Paper,
  Title,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../../store/store';
import { fetchSections } from '../../../../store/slices/nestedSidebarSlice';
import { articleApiClient } from '@whatsnxt/core-util';

interface PostAssignmentProps {
  postId: string;
  postTitle: string;
  contentType: 'blog' | 'tutorial';
  currentSectionId?: string;
  currentSectionOrder?: number;
  onAssigned?: () => void;
  onCancel?: () => void;
}

export const PostAssignment: React.FC<PostAssignmentProps> = ({
  postId,
  postTitle,
  contentType,
  currentSectionId,
  currentSectionOrder,
  onAssigned,
  onCancel,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sections, loading } = useSelector((state: RootState) => state.nestedSidebar);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    initialValues: {
      sectionId: currentSectionId || '',
      sectionOrder: currentSectionOrder || 0,
    },
    validate: {
      sectionId: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please select a section';
        }
        return null;
      },
      sectionOrder: (value) => {
        if (value < 0) {
          return 'Order must be a non-negative number';
        }
        return null;
      },
    },
  });

  // Load sections on mount
  useEffect(() => {
    dispatch(fetchSections(contentType));
  }, [dispatch, contentType]);

  // Get sections as dropdown options
  const getSectionOptions = () => {
    const flattenSections = (sectionList: typeof sections, depth: number = 0): Array<{ value: string; label: string }> => {
      return sectionList.reduce((acc, section) => {
        const indent = '  '.repeat(depth);
        acc.push({
          value: section._id,
          label: `${indent}${section.title}`,
        });

        if (section.children && section.children.length > 0) {
          acc.push(...flattenSections(section.children, depth + 1));
        }

        return acc;
      }, [] as Array<{ value: string; label: string }>);
    };

    return flattenSections(sections);
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);

    try {
      // Call API to assign post to section
      const response = await articleApiClient.patch(`/sidebar/posts/${postId}/assign`, {
        sectionId: values.sectionId,
        sectionOrder: values.sectionOrder,
      });

      if (response.data?.success) {
        notifications.show({
          title: 'Success',
          message: 'Post assigned to section successfully',
          color: 'green',
        });

        if (onAssigned) {
          onAssigned();
        }
      } else {
        throw new Error('Failed to assign post');
      }
    } catch (err: any) {
      console.error('Post assignment error:', err);
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to assign post to section',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    setSubmitting(true);

    try {
      // Call API to unassign post from section
      const response = await articleApiClient.patch(`/sidebar/posts/${postId}/unassign`);

      if (response.data?.success) {
        notifications.show({
          title: 'Success',
          message: 'Post unassigned from section successfully',
          color: 'green',
        });

        form.reset();

        if (onAssigned) {
          onAssigned();
        }
      } else {
        throw new Error('Failed to unassign post');
      }
    } catch (err: any) {
      console.error('Post unassignment error:', err);
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to unassign post from section',
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && sections.length === 0) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="sm" />
          <Text size="sm" c="dimmed">
            Loading sections...
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={4}>
            Assign Post to Section
          </Title>

          <Text size="sm" c="dimmed">
            Post: <strong>{postTitle}</strong>
          </Text>

          <Select
            label="Section"
            placeholder="Select a section"
            description="Choose which section this post belongs to"
            data={getSectionOptions()}
            searchable
            required
            {...form.getInputProps('sectionId')}
          />

          <NumberInput
            label="Display Order"
            placeholder="0"
            description="Order within the section (lower numbers appear first)"
            min={0}
            {...form.getInputProps('sectionOrder')}
          />

          <Group justify="space-between" mt="md">
            <Group>
              {currentSectionId && (
                <Button
                  variant="subtle"
                  color="red"
                  onClick={handleUnassign}
                  loading={submitting}
                >
                  Unassign
                </Button>
              )}
            </Group>

            <Group>
              {onCancel && (
                <Button
                  variant="subtle"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                loading={submitting}
              >
                Assign
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default PostAssignment;
