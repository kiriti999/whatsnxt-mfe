/**
 * PendingTransfersBadge Component
 * Feature: 002-reusable-sections
 * Task: T090
 * 
 * Notification badge for displaying pending transfer requests count.
 * Can be integrated into user menu, dashboard, or navigation header.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Indicator,
  ActionIcon,
  Menu,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  Divider,
  Tooltip,
} from '@mantine/core';
import { IconBell, IconTransfer, IconInbox } from '@tabler/icons-react';
import { getPendingRequests } from '../../apis/v1/sidebar/sectionOwnershipApi';
import type { SectionOwnershipTransferWithDetails } from '@whatsnxt/core-types';

interface PendingTransfersBadgeProps {
  trainerId: string;
  onViewAllClick?: () => void;
  onRequestClick?: (transferId: string) => void;
  pollingInterval?: number; // milliseconds, 0 = no auto-refresh
  variant?: 'icon' | 'button' | 'badge-only';
}

export const PendingTransfersBadge: React.FC<PendingTransfersBadgeProps> = ({
  trainerId,
  onViewAllClick,
  onRequestClick,
  pollingInterval = 60000, // Default: 1 minute
  variant = 'icon',
}) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<
    SectionOwnershipTransferWithDetails[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);

  useEffect(() => {
    fetchPendingCount();

    if (pollingInterval > 0) {
      const interval = setInterval(fetchPendingCount, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [trainerId, pollingInterval]);

  const fetchPendingCount = async () => {
    try {
      const requests = await getPendingRequests(trainerId);
      setPendingRequests(requests);
      setPendingCount(requests.length);
    } catch (error) {
      console.error('Failed to fetch pending transfers count:', error);
    }
  };

  const handleMenuOpen = () => {
    setMenuOpened(true);
    fetchPendingCount(); // Refresh when menu opens
  };

  const handleRequestClick = (transferId: string) => {
    setMenuOpened(false);
    onRequestClick?.(transferId);
  };

  const handleViewAll = () => {
    setMenuOpened(false);
    onViewAllClick?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Badge-only variant
  if (variant === 'badge-only') {
    if (pendingCount === 0) return null;
    return (
      <Badge color="red" size="sm" circle>
        {pendingCount}
      </Badge>
    );
  }

  // Icon or Button variant with dropdown menu
  const trigger =
    variant === 'icon' ? (
      <Tooltip label={`${pendingCount} pending transfer request${pendingCount !== 1 ? 's' : ''}`}>
        <Indicator
          disabled={pendingCount === 0}
          label={pendingCount}
          size={16}
          color="red"
          offset={4}
        >
          <ActionIcon variant="subtle" color="gray" size="lg">
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </Tooltip>
    ) : (
      <Button
        variant="subtle"
        leftSection={<IconTransfer size={16} />}
        rightSection={
          pendingCount > 0 ? (
            <Badge color="red" size="sm" circle>
              {pendingCount}
            </Badge>
          ) : null
        }
      >
        Transfers
      </Button>
    );

  return (
    <Menu
      opened={menuOpened}
      onChange={setMenuOpened}
      onOpen={handleMenuOpen}
      width={350}
      position="bottom-end"
      shadow="md"
    >
      <Menu.Target>{trigger}</Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between">
            <Text size="sm" fw={600}>
              Transfer Requests
            </Text>
            {pendingCount > 0 && (
              <Badge color="red" size="sm">
                {pendingCount}
              </Badge>
            )}
          </Group>
        </Menu.Label>

        {pendingCount === 0 ? (
          <Stack gap="md" p="md" align="center">
            <IconInbox size={48} color="gray" opacity={0.3} />
            <Text size="sm" c="dimmed" ta="center">
              No pending transfer requests
            </Text>
          </Stack>
        ) : (
          <>
            <Divider />
            <Stack gap={0} style={{ maxHeight: 300, overflowY: 'auto' }}>
              {pendingRequests.slice(0, 5).map((request) => (
                <Menu.Item
                  key={request._id}
                  onClick={() => handleRequestClick(request._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Stack gap={4}>
                    <Group justify="space-between">
                      <Text size="sm" fw={500} lineClamp={1}>
                        {request.section.title}
                      </Text>
                      <Badge size="xs" color="blue" variant="light">
                        {request.section.contentType}
                      </Badge>
                    </Group>
                    <Text size="xs" c="dimmed">
                      From: {request.fromTrainer.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDate(request.requestedAt)}
                    </Text>
                  </Stack>
                </Menu.Item>
              ))}
            </Stack>
            {pendingCount > 5 && (
              <>
                <Divider />
                <Menu.Item>
                  <Text size="xs" c="dimmed" ta="center">
                    +{pendingCount - 5} more requests
                  </Text>
                </Menu.Item>
              </>
            )}
            <Divider />
            <Menu.Item onClick={handleViewAll}>
              <Text size="sm" ta="center" fw={500} c="blue">
                View All Requests
              </Text>
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

/**
 * Simple count-only badge for minimal UI integration
 */
export const PendingTransfersCount: React.FC<{
  trainerId: string;
  pollingInterval?: number;
}> = ({ trainerId, pollingInterval = 60000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const requests = await getPendingRequests(trainerId);
        setCount(requests.length);
      } catch (error) {
        console.error('Failed to fetch pending transfers count:', error);
      }
    };

    fetchCount();

    if (pollingInterval > 0) {
      const interval = setInterval(fetchCount, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [trainerId, pollingInterval]);

  if (count === 0) return null;

  return (
    <Badge color="red" size="sm" circle>
      {count}
    </Badge>
  );
};
