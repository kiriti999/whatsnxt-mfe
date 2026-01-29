'use client';

import React, { useEffect } from 'react';
import {
  Box,
  TextInput,
  Textarea,
  Select,
  Switch,
  Button,
  Group,
  Stack,
  NumberInput,
  Paper,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPicker } from './IconPicker';
import { Section, SectionCreateInput, SectionUpdateInput } from '../../../../apis/v1/sidebar/sectionsApi';

interface SectionFormProps {
  section?: Section | null;
  contentType: 'blog' | 'tutorial';
  parentSections: Section[];
  onSubmit: (data: SectionCreateInput | SectionUpdateInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const SectionForm: React.FC<SectionFormProps> = ({
  section,
  contentType,
  parentSections,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const isEdit = !!section;

  const form = useForm<SectionCreateInput>({
    initialValues: {
      title: section?.title || '',
      slug: section?.slug || '',
      description: section?.description || '',
      iconName: section?.iconName || '',
      contentType: section?.contentType || contentType,
      parentId: section?.parentId || undefined,
      order: section?.order || 0,
      isVisible: section?.isVisible ?? true,
    },
    validate: {
      title: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Title is required';
        }
        if (value.length > 100) {
          return 'Title must be 100 characters or less';
        }
        return null;
      },
      slug: (value) => {
        if (value && value.length > 0) {
          if (value.length > 150) {
            return 'Slug must be 150 characters or less';
          }
          if (!/^[a-z0-9-]+$/.test(value)) {
            return 'Slug must contain only lowercase letters, numbers, and hyphens';
          }
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

  // Auto-generate slug from title if slug is empty
  const handleTitleChange = (value: string) => {
    form.setFieldValue('title', value);
    
    if (!isEdit && !form.values.slug) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 150);
      
      form.setFieldValue('slug', autoSlug);
    }
  };

  const handleSubmit = (values: SectionCreateInput) => {
    // Clean up empty strings
    const cleanedValues = {
      ...values,
      slug: values.slug?.trim() || undefined,
      description: values.description?.trim() || undefined,
      iconName: values.iconName?.trim() || undefined,
      parentId: values.parentId || undefined,
    };

    onSubmit(cleanedValues);
  };

  // Filter parent sections to prevent circular references and depth violations
  const getAvailableParents = () => {
    if (!parentSections || parentSections.length === 0) return [];

    // If editing, exclude self and descendants
    if (isEdit && section) {
      const excludeIds = new Set<string>([section._id]);
      
      // Find all descendants
      const findDescendants = (sec: Section) => {
        if (sec.children) {
          sec.children.forEach(child => {
            excludeIds.add(child._id);
            findDescendants(child);
          });
        }
      };
      findDescendants(section);

      // Only show sections with depth < 3 (to allow max depth of 4)
      return parentSections
        .filter(s => !excludeIds.has(s._id) && s.depth < 3)
        .map(s => ({
          value: s._id,
          label: `${'  '.repeat(s.depth)}${s.title} (depth: ${s.depth})`,
        }));
    }

    // Only show sections with depth < 3
    return parentSections
      .filter(s => s.depth < 3)
      .map(s => ({
        value: s._id,
        label: `${'  '.repeat(s.depth)}${s.title} (depth: ${s.depth})`,
      }));
  };

  return (
    <Paper shadow="sm" p="xl" radius="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Title order={3}>
            {isEdit ? 'Edit Section' : 'Create New Section'}
          </Title>

          <TextInput
            label="Title"
            placeholder="Enter section title"
            required
            {...form.getInputProps('title')}
            onChange={(e) => handleTitleChange(e.target.value)}
          />

          <TextInput
            label="Slug"
            placeholder="auto-generated-from-title"
            description="Leave empty for auto-generation. Only lowercase letters, numbers, and hyphens."
            {...form.getInputProps('slug')}
          />

          <Textarea
            label="Description"
            placeholder="Optional section description"
            minRows={3}
            maxRows={6}
            {...form.getInputProps('description')}
          />

          <Select
            label="Content Type"
            placeholder="Select content type"
            data={[
              { value: 'blog', label: 'Blog' },
              { value: 'tutorial', label: 'Tutorial' },
            ]}
            required
            disabled={isEdit}
            {...form.getInputProps('contentType')}
          />

          <Select
            label="Parent Section"
            placeholder="None (top-level section)"
            description="Optional. Select a parent section to create a subsection."
            data={getAvailableParents()}
            clearable
            searchable
            {...form.getInputProps('parentId')}
          />

          <Box>
            <Title order={5} mb="xs">
              Icon
            </Title>
            <IconPicker
              value={form.values.iconName}
              onChange={(iconName) => form.setFieldValue('iconName', iconName)}
              error={form.errors.iconName as string}
            />
          </Box>

          <NumberInput
            label="Display Order"
            placeholder="0"
            description="Lower numbers appear first"
            min={0}
            {...form.getInputProps('order')}
          />

          <Switch
            label="Visible"
            description="Show this section in the sidebar"
            {...form.getInputProps('isVisible')}
            checked={form.values.isVisible}
          />

          <Group justify="flex-end" mt="xl">
            <Button
              variant="subtle"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {isEdit ? 'Update Section' : 'Create Section'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default SectionForm;
