/**
 * SectionTransferModal Component
 * Feature: 002-reusable-sections
 * Task: T087
 * 
 * Modal for initiating section ownership transfer to another trainer.
 * Includes trainer selector with search and optional message field.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Textarea,
  Button,
  Stack,
  Group,
  Select,
  Text,
  LoadingOverlay,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTransfer, IconAlertCircle } from '@tabler/icons-react';
import { initiateTransfer } from '../../apis/v1/sidebar/sectionOwnershipApi';
import { TrainerAPI } from '../../apis/v1/courses/trainer/trainer';

interface SectionTransferModalProps {
  opened: boolean;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
  currentTrainerId: string;
  onTransferInitiated?: () => void;
}

interface Trainer {
  _id: string;
  name: string;
  email: string;
}

export const SectionTransferModal: React.FC<SectionTransferModalProps> = ({
  opened,
  onClose,
  sectionId,
  sectionTitle,
  currentTrainerId,
  onTransferInitiated,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm({
    initialValues: {
      toTrainerId: '',
      message: '',
    },
    validate: {
      toTrainerId: (value) => {
        if (!value) {
          return 'Please select a trainer';
        }
        if (value === currentTrainerId) {
          return 'Cannot transfer to yourself';
        }
        return null;
      },
      message: (value) => {
        if (value && value.length > 500) {
          return 'Message must be 500 characters or less';
        }
        return null;
      },
    },
  });

  // Fetch trainers on mount
  useEffect(() => {
    if (opened) {
      fetchTrainers();
    }
  }, [opened]);

  const fetchTrainers = async () => {
    setLoadingTrainers(true);
    try {
      const response = await TrainerAPI.getTrainers();
      if (response.data?.success && response.data?.data) {
        // Filter out current trainer
        const filteredTrainers = response.data.data.filter(
          (t: Trainer) => t._id !== currentTrainerId
        );
        setTrainers(filteredTrainers);
      }
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load trainers list',
        color: 'red',
      });
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleSearchTrainers = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 2) {
      fetchTrainers();
      return;
    }

    setLoadingTrainers(true);
    try {
      const response = await TrainerAPI.searchTrainers(1, query);
      if (response.data?.success && response.data?.data) {
        const filteredTrainers = response.data.data.filter(
          (t: Trainer) => t._id !== currentTrainerId
        );
        setTrainers(filteredTrainers);
      }
    } catch (error) {
      console.error('Failed to search trainers:', error);
    } finally {
      setLoadingTrainers(false);
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);

    try {
      await initiateTransfer(sectionId, {
        sectionId,
        toTrainerId: values.toTrainerId,
        message: values.message || undefined,
      });

      notifications.show({
        title: 'Transfer Request Sent',
        message: `Ownership transfer request for "${sectionTitle}" has been sent successfully`,
        color: 'green',
      });

      form.reset();
      onTransferInitiated?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to initiate transfer:', error);
      
      const errorMessage = error?.response?.data?.message || 
        'Failed to initiate transfer. Please try again.';

      notifications.show({
        title: 'Transfer Failed',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      form.reset();
      setSearchQuery('');
      onClose();
    }
  };

  // Convert trainers to select options
  const trainerOptions = trainers.map((trainer) => ({
    value: trainer._id,
    label: `${trainer.name} (${trainer.email})`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconTransfer size={20} />
          <Text fw={600}>Transfer Section Ownership</Text>
        </Group>
      }
      size="md"
      closeOnClickOutside={!submitting}
      closeOnEscape={!submitting}
    >
      <LoadingOverlay visible={submitting} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            You are about to transfer ownership of <strong>"{sectionTitle}"</strong> to
            another trainer. The transfer requires acceptance from the recipient.
          </Alert>

          <Select
            label="Select Trainer"
            placeholder="Search and select a trainer..."
            data={trainerOptions}
            searchable
            nothingFoundMessage={loadingTrainers ? 'Loading...' : 'No trainers found'}
            onSearchChange={handleSearchTrainers}
            disabled={submitting || loadingTrainers}
            required
            {...form.getInputProps('toTrainerId')}
          />

          <Textarea
            label="Message (Optional)"
            placeholder="Add a message to the transfer request..."
            description="This message will be visible to the recipient"
            minRows={3}
            maxRows={5}
            disabled={submitting}
            {...form.getInputProps('message')}
          />

          <Alert color="yellow" variant="light">
            <Text size="sm">
              <strong>Note:</strong> Once the transfer is accepted:
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                <li>The new owner will have full control over the section</li>
                <li>You will lose the ability to edit or delete this section</li>
                <li>All existing links to tutorials/blogs will remain active</li>
              </ul>
            </Text>
          </Alert>

          <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              leftSection={<IconTransfer size={16} />}
              loading={submitting}
              color="blue"
            >
              Send Transfer Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
