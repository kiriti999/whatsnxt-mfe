/**
 * TransferRequestsPanel Component
 * Feature: 002-reusable-sections
 * Task: T089
 * 
 * Panel component for displaying and managing section ownership transfer requests.
 * Shows both incoming requests (to accept/decline) and outgoing requests (to cancel).
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Card,
  Divider,
  LoadingOverlay,
  Alert,
  Tabs,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconInbox,
  IconSend,
  IconCheck,
  IconX,
  IconTrash,
  IconAlertCircle,
  IconClock,
} from '@tabler/icons-react';
import {
  getPendingRequests,
  getSentRequests,
  acceptTransfer,
  declineTransfer,
  cancelTransfer,
} from '../../apis/v1/sidebar/sectionOwnershipApi';
import type { SectionOwnershipTransferWithDetails } from '@whatsnxt/core-types';

interface TransferRequestsPanelProps {
  trainerId: string;
  onTransferAccepted?: (sectionId: string) => void;
  onTransferDeclined?: (transferId: string) => void;
  onTransferCancelled?: (transferId: string) => void;
}

export const TransferRequestsPanel: React.FC<TransferRequestsPanelProps> = ({
  trainerId,
  onTransferAccepted,
  onTransferDeclined,
  onTransferCancelled,
}) => {
  const [loading, setLoading] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<
    SectionOwnershipTransferWithDetails[]
  >([]);
  const [sentRequests, setSentRequests] = useState<
    SectionOwnershipTransferWithDetails[]
  >([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [trainerId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const [received, sent] = await Promise.all([
        getPendingRequests(trainerId),
        getSentRequests(trainerId),
      ]);
      setReceivedRequests(received);
      // Filter sent requests to only show pending ones
      setSentRequests(sent.filter((req) => req.status === 'pending'));
    } catch (error) {
      console.error('Failed to fetch transfer requests:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load transfer requests',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (transfer: SectionOwnershipTransferWithDetails) => {
    setProcessingId(transfer._id);
    try {
      await acceptTransfer(transfer._id);
      notifications.show({
        title: 'Transfer Accepted',
        message: `You are now the owner of "${transfer.section.title}"`,
        color: 'green',
      });
      onTransferAccepted?.(transfer.sectionId);
      await fetchRequests();
    } catch (error: any) {
      console.error('Failed to accept transfer:', error);
      notifications.show({
        title: 'Accept Failed',
        message: error?.response?.data?.message || 'Failed to accept transfer',
        color: 'red',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (transfer: SectionOwnershipTransferWithDetails) => {
    setProcessingId(transfer._id);
    try {
      await declineTransfer(transfer._id);
      notifications.show({
        title: 'Transfer Declined',
        message: `Transfer request for "${transfer.section.title}" has been declined`,
        color: 'orange',
      });
      onTransferDeclined?.(transfer._id);
      await fetchRequests();
    } catch (error: any) {
      console.error('Failed to decline transfer:', error);
      notifications.show({
        title: 'Decline Failed',
        message: error?.response?.data?.message || 'Failed to decline transfer',
        color: 'red',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (transfer: SectionOwnershipTransferWithDetails) => {
    setProcessingId(transfer._id);
    try {
      await cancelTransfer(transfer._id);
      notifications.show({
        title: 'Transfer Cancelled',
        message: `Transfer request for "${transfer.section.title}" has been cancelled`,
        color: 'blue',
      });
      onTransferCancelled?.(transfer._id);
      await fetchRequests();
    } catch (error: any) {
      console.error('Failed to cancel transfer:', error);
      notifications.show({
        title: 'Cancel Failed',
        message: error?.response?.data?.message || 'Failed to cancel transfer',
        color: 'red',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderReceivedRequests = () => {
    if (receivedRequests.length === 0) {
      return (
        <Alert icon={<IconInbox size={16} />} color="gray" variant="light">
          No pending transfer requests
        </Alert>
      );
    }

    return (
      <Stack gap="md">
        {receivedRequests.map((request) => (
          <Card key={request._id} shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="sm">
                    {request.section.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {request.section.contentType}
                  </Text>
                </div>
                <Badge color="blue" variant="light" leftSection={<IconClock size={12} />}>
                  Pending
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                From: <strong>{request.fromTrainer.name}</strong> ({request.fromTrainer.email})
              </Text>

              {request.message && (
                <Paper p="xs" bg="gray.0" radius="sm">
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {request.message}
                  </Text>
                </Paper>
              )}

              <Text size="xs" c="dimmed">
                Requested {formatDate(request.requestedAt)}
              </Text>

              <Group justify="flex-end" gap="xs" mt="xs">
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  leftSection={<IconX size={14} />}
                  onClick={() => handleDecline(request)}
                  loading={processingId === request._id}
                  disabled={processingId !== null}
                >
                  Decline
                </Button>
                <Button
                  size="xs"
                  color="green"
                  leftSection={<IconCheck size={14} />}
                  onClick={() => handleAccept(request)}
                  loading={processingId === request._id}
                  disabled={processingId !== null}
                >
                  Accept Transfer
                </Button>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  };

  const renderSentRequests = () => {
    if (sentRequests.length === 0) {
      return (
        <Alert icon={<IconSend size={16} />} color="gray" variant="light">
          No pending outgoing requests
        </Alert>
      );
    }

    return (
      <Stack gap="md">
        {sentRequests.map((request) => (
          <Card key={request._id} shadow="sm" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between">
                <div>
                  <Text fw={600} size="sm">
                    {request.section.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {request.section.contentType}
                  </Text>
                </div>
                <Badge color="blue" variant="light" leftSection={<IconClock size={12} />}>
                  Awaiting Response
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                To: <strong>{request.toTrainer.name}</strong> ({request.toTrainer.email})
              </Text>

              {request.message && (
                <Paper p="xs" bg="gray.0" radius="sm">
                  <Text size="sm" c="dimmed">
                    Your message:
                  </Text>
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {request.message}
                  </Text>
                </Paper>
              )}

              <Text size="xs" c="dimmed">
                Sent {formatDate(request.requestedAt)}
              </Text>

              <Group justify="flex-end" mt="xs">
                <Tooltip label="Cancel transfer request">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleCancel(request)}
                    loading={processingId === request._id}
                    disabled={processingId !== null}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
    <Paper shadow="sm" p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />

      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Transfer Requests
          </Text>
          {(receivedRequests.length > 0 || sentRequests.length > 0) && (
            <Button size="xs" variant="subtle" onClick={fetchRequests}>
              Refresh
            </Button>
          )}
        </Group>

        <Tabs defaultValue="received">
          <Tabs.List>
            <Tabs.Tab
              value="received"
              leftSection={<IconInbox size={16} />}
              rightSection={
                receivedRequests.length > 0 ? (
                  <Badge size="sm" circle>
                    {receivedRequests.length}
                  </Badge>
                ) : null
              }
            >
              Received
            </Tabs.Tab>
            <Tabs.Tab
              value="sent"
              leftSection={<IconSend size={16} />}
              rightSection={
                sentRequests.length > 0 ? (
                  <Badge size="sm" circle color="gray">
                    {sentRequests.length}
                  </Badge>
                ) : null
              }
            >
              Sent
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="received" pt="md">
            {renderReceivedRequests()}
          </Tabs.Panel>

          <Tabs.Panel value="sent" pt="md">
            {renderSentRequests()}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
};
