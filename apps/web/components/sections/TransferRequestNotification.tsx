/**
 * TransferRequestNotification Component
 * Feature: 002-reusable-sections
 * Task: T091
 * 
 * Component for displaying real-time notifications when a user receives a transfer request.
 * Can be integrated with WebSocket or polling mechanisms for live updates.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Notification, Group, Text, Button, Stack } from '@mantine/core';
import { IconTransfer, IconX } from '@tabler/icons-react';
import type { SectionOwnershipTransferWithDetails } from '@whatsnxt/core-types';

interface TransferRequestNotificationProps {
  transfer: SectionOwnershipTransferWithDetails;
  onView?: (transferId: string) => void;
  onDismiss?: (transferId: string) => void;
  autoHideDuration?: number; // milliseconds, 0 = no auto-hide
}

export const TransferRequestNotification: React.FC<
  TransferRequestNotificationProps
> = ({ transfer, onView, onDismiss, autoHideDuration = 10000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration]);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.(transfer._id);
  };

  const handleView = () => {
    onView?.(transfer._id);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Notification
      icon={<IconTransfer size={18} />}
      color="blue"
      title="New Transfer Request"
      onClose={handleDismiss}
      withCloseButton
      styles={{
        root: {
          position: 'fixed',
          top: 70,
          right: 20,
          zIndex: 1000,
          minWidth: 350,
          maxWidth: 400,
        },
      }}
    >
      <Stack gap="xs">
        <Text size="sm">
          <strong>{transfer.fromTrainer.name}</strong> wants to transfer ownership of{' '}
          <strong>"{transfer.section.title}"</strong> to you.
        </Text>

        {transfer.message && (
          <Text size="xs" c="dimmed" style={{ fontStyle: 'italic' }}>
            "{transfer.message}"
          </Text>
        )}

        <Group gap="xs" mt="xs">
          <Button size="xs" variant="filled" onClick={handleView}>
            View Request
          </Button>
          <Button size="xs" variant="subtle" onClick={handleDismiss}>
            Later
          </Button>
        </Group>
      </Stack>
    </Notification>
  );
};

/**
 * TransferRequestNotificationContainer Component
 * 
 * Container component for managing multiple transfer request notifications.
 * Handles polling for new requests and displaying them as notifications.
 */

interface TransferRequestNotificationContainerProps {
  trainerId: string;
  pollingInterval?: number; // milliseconds, 0 = no polling
  onViewRequest?: (transferId: string) => void;
}

export const TransferRequestNotificationContainer: React.FC<
  TransferRequestNotificationContainerProps
> = ({ trainerId, pollingInterval = 30000, onViewRequest }) => {
  const [notifications, setNotifications] = useState<
    SectionOwnershipTransferWithDetails[]
  >([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (pollingInterval > 0) {
      // Initial fetch
      checkForNewRequests();

      // Set up polling
      const interval = setInterval(() => {
        checkForNewRequests();
      }, pollingInterval);

      return () => clearInterval(interval);
    }
  }, [trainerId, pollingInterval]);

  const checkForNewRequests = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getPendingRequests } = await import(
        '../../apis/v1/sidebar/sectionOwnershipApi'
      );
      const requests = await getPendingRequests(trainerId);

      // Filter out dismissed requests and already shown notifications
      const newRequests = requests.filter(
        (req) =>
          !dismissedIds.has(req._id) &&
          !notifications.some((notif) => notif._id === req._id)
      );

      if (newRequests.length > 0) {
        setNotifications((prev) => [...prev, ...newRequests]);
      }
    } catch (error) {
      console.error('Failed to check for new transfer requests:', error);
    }
  };

  const handleDismiss = (transferId: string) => {
    setDismissedIds((prev) => new Set(prev).add(transferId));
    setNotifications((prev) => prev.filter((notif) => notif._id !== transferId));
  };

  const handleView = (transferId: string) => {
    handleDismiss(transferId);
    onViewRequest?.(transferId);
  };

  return (
    <>
      {notifications.map((transfer) => (
        <TransferRequestNotification
          key={transfer._id}
          transfer={transfer}
          onView={handleView}
          onDismiss={handleDismiss}
        />
      ))}
    </>
  );
};
