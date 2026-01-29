'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Select,
  Modal,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { IconPlus } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../../store/store';
import {
  fetchSectionTree,
  createSection,
  updateSection,
  deleteSection,
  setContentType,
} from '../../../store/slices/nestedSidebarSlice';
import { Section, SectionCreateInput, SectionUpdateInput } from '../../../apis/v1/sidebar/sectionsApi';
import SectionList from './components/SectionList';
import SectionForm from './components/SectionForm';

export default function SidebarManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const { tree, sections, loading, error, contentType } = useSelector(
    (state: RootState) => state.nestedSidebar
  );

  // Load sections on mount and when content type changes
  useEffect(() => {
    dispatch(fetchSectionTree(contentType));
  }, [dispatch, contentType]);

  const handleContentTypeChange = (value: string | null) => {
    if (value === 'blog' || value === 'tutorial') {
      dispatch(setContentType(value));
    }
  };

  const handleCreateNew = () => {
    setEditingSection(null);
    open();
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    open();
  };

  const handleDelete = (section: Section) => {
    // Check if section has children or posts
    const hasChildren = section.children && section.children.length > 0;
    const hasPosts = section.postCount > 0;

    if (hasChildren || hasPosts) {
      let message = 'This section cannot be deleted because it ';
      const reasons = [];
      
      if (hasChildren) {
        reasons.push(`has ${section.children!.length} subsection(s)`);
      }
      if (hasPosts) {
        reasons.push(`contains ${section.postCount} post(s)`);
      }
      
      message += reasons.join(' and ') + '.';
      message += ' Please remove or reassign them first.';

      notifications.show({
        title: 'Cannot Delete Section',
        message,
        color: 'orange',
      });
      return;
    }

    // Show confirmation dialog
    modals.openConfirmModal({
      title: 'Delete Section',
      children: (
        <>
          Are you sure you want to delete the section <strong>{section.title}</strong>?
          This action cannot be undone.
        </>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await dispatch(deleteSection(section._id)).unwrap();
          
          notifications.show({
            title: 'Success',
            message: 'Section deleted successfully',
            color: 'green',
          });

          // Refresh the tree
          dispatch(fetchSectionTree(contentType));
        } catch (err: any) {
          notifications.show({
            title: 'Error',
            message: err.message || 'Failed to delete section',
            color: 'red',
          });
        }
      },
    });
  };

  const handleToggleVisibility = async (section: Section) => {
    try {
      await dispatch(updateSection({
        id: section._id,
        input: { isVisible: !section.isVisible }
      })).unwrap();

      notifications.show({
        title: 'Success',
        message: `Section ${section.isVisible ? 'hidden' : 'shown'} successfully`,
        color: 'green',
      });

      // Refresh the tree
      dispatch(fetchSectionTree(contentType));
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to update section visibility',
        color: 'red',
      });
    }
  };

  const handleSubmit = async (data: SectionCreateInput | SectionUpdateInput) => {
    try {
      if (editingSection) {
        // Update existing section
        await dispatch(updateSection({
          id: editingSection._id,
          input: data as SectionUpdateInput
        })).unwrap();

        notifications.show({
          title: 'Success',
          message: 'Section updated successfully',
          color: 'green',
        });
      } else {
        // Create new section
        await dispatch(createSection(data as SectionCreateInput)).unwrap();

        notifications.show({
          title: 'Success',
          message: 'Section created successfully',
          color: 'green',
        });
      }

      // Refresh the tree
      dispatch(fetchSectionTree(contentType));

      // Close modal
      close();
    } catch (err: any) {
      notifications.show({
        title: 'Error',
        message: err.message || `Failed to ${editingSection ? 'update' : 'create'} section`,
        color: 'red',
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    close();
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Paper shadow="xs" p="md" radius="md">
          <Group justify="space-between" wrap="nowrap">
            <Title order={2}>Sidebar Management</Title>
            
            <Group>
              <Select
                placeholder="Select content type"
                data={[
                  { value: 'blog', label: 'Blog' },
                  { value: 'tutorial', label: 'Tutorial' },
                ]}
                value={contentType}
                onChange={handleContentTypeChange}
                style={{ width: 150 }}
              />
              
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleCreateNew}
              >
                Create Section
              </Button>
            </Group>
          </Group>
        </Paper>

        <SectionList
          sections={tree}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
        />

        <Modal
          opened={opened}
          onClose={handleCancel}
          title={editingSection ? 'Edit Section' : 'Create New Section'}
          size="lg"
        >
          <SectionForm
            section={editingSection}
            contentType={contentType}
            parentSections={sections}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Modal>
      </Stack>
    </Container>
  );
}
