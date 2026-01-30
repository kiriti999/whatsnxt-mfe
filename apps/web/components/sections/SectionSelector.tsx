/**
 * SectionSelector Component
 * Feature: 002-reusable-sections
 * Tasks: T138, T144 - Form Integration
 * 
 * Simplified section selector for blog/tutorial forms.
 * Allows selecting existing section OR creating new section inline.
 * Passes selected sectionId back to parent form.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  Group,
  Button,
  Select,
  Text,
  Badge,
  Loader,
  Alert,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconLink, IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SectionsAPI, Section } from '../../apis/v1/sidebar/sectionsApi';
import { CreateSectionModal } from './CreateSectionModal';

interface SectionSelectorProps {
  contentType: 'blog' | 'tutorial';
  trainerId: string;
  selectedSectionId: string | null;
  onSectionChange: (sectionId: string | null) => void;
  disabled?: boolean;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({
  contentType,
  trainerId,
  selectedSectionId,
  onSectionChange,
  disabled = false,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

  // Fetch available sections
  useEffect(() => {
    if (trainerId) {
      fetchSections();
    }
  }, [trainerId, contentType]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await SectionsAPI.getByTrainer(trainerId, contentType);
      setSections(response);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load available sections',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSectionCreated = (newSection: Section) => {
    closeCreateModal();
    setSections((prev) => [...prev, newSection]);
    onSectionChange(newSection._id);
    notifications.show({
      title: 'Section Created',
      message: `Section "${newSection.title}" has been created and selected`,
      color: 'green',
    });
  };

  const sectionOptions = sections.map((section) => ({
    value: section._id,
    label: section.title,
  }));

  // Add "None" option at the beginning
  const selectOptions = [
    { value: '', label: '(None - No section)' },
    ...sectionOptions,
  ];

  return (
    <>
      <Paper p="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <IconLink size={20} />
              <Text size="sm" fw={500}>
                Section Assignment
              </Text>
              <Badge size="sm" variant="light" color="gray">
                Optional
              </Badge>
            </Group>
            
            {loading && <Loader size="sm" />}
          </Group>

          <Text size="xs" c="dimmed">
            Organize this post into a section. Sections help group related content together.
          </Text>

          <Select
            placeholder="Select a section (optional)"
            data={selectOptions}
            value={selectedSectionId || ''}
            onChange={(value) => onSectionChange(value || null)}
            disabled={disabled || loading}
            searchable
            clearable
            nothingFoundMessage="No sections found"
          />

          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={openCreateModal}
              disabled={disabled}
            >
              Create New Section
            </Button>
            
            {sections.length === 0 && !loading && (
              <Text size="xs" c="dimmed">
                <IconInfoCircle size={14} style={{ verticalAlign: 'middle' }} /> No sections yet. Create your first one!
              </Text>
            )}
          </Group>

          {selectedSectionId && (
            <Alert color="blue" variant="light">
              This post will be organized into the selected section
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Create Section Modal */}
      <CreateSectionModal
        opened={createModalOpened}
        onClose={closeCreateModal}
        contentType={contentType}
        trainerId={trainerId}
        onSectionCreated={handleSectionCreated}
      />
    </>
  );
};
