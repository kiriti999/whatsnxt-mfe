/**
 * SectionUsageModal Component
 * Feature: 002-reusable-sections
 * Task: T072 [US7]
 * 
 * Modal displaying where a section is being used.
 * Shows usage count and list of tutorials/blogs using this section.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  LoadingOverlay,
  ScrollArea,
  Anchor,
  Button,
  Alert,
  Divider,
  Skeleton,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconExternalLink,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SectionsAPI } from '../../apis/v1/sidebar/sectionsApi';

interface SectionUsage {
  contentId: string;
  contentType: 'blog' | 'tutorial';
  contentTitle: string;
  contentSlug?: string;
}

interface SectionUsageModalProps {
  opened: boolean;
  onClose: () => void;
  sectionId: string;
  sectionTitle: string;
}

/**
 * SectionUsageModal - Display section usage statistics
 * 
 * Features:
 * - Usage count display
 * - List of all content using this section
 * - Links to view each content
 * - Warning if section is widely used
 * 
 * Usage:
 * ```tsx
 * const [opened, { open, close }] = useDisclosure(false);
 * 
 * <SectionUsageModal
 *   opened={opened}
 *   onClose={close}
 *   sectionId={section._id}
 *   sectionTitle={section.title}
 * />
 * ```
 */
export const SectionUsageModal: React.FC<SectionUsageModalProps> = ({
  opened,
  onClose,
  sectionId,
  sectionTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [usageData, setUsageData] = useState<{
    count: number;
    usedIn: SectionUsage[];
  } | null>(null);

  useEffect(() => {
    if (opened && sectionId) {
      fetchUsageData();
    }
  }, [opened, sectionId]);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const data = await SectionsAPI.getUsageStats(sectionId);
      setUsageData({
        count: data.usageCount,
        usedIn: data.usedIn,
      });
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load usage statistics',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsageData(null);
    onClose();
  };

  const getContentTypeColor = (type: 'blog' | 'tutorial') => {
    return type === 'tutorial' ? 'blue' : 'green';
  };

  const getContentTypeIcon = (type: 'blog' | 'tutorial') => {
    return type === 'tutorial' ? '📚' : '✍️';
  };

  const getContentLink = (usage: SectionUsage) => {
    const baseUrl = usage.contentType === 'tutorial' ? '/tutorials' : '/blogs';
    return usage.contentSlug
      ? `${baseUrl}/${usage.contentSlug}`
      : `${baseUrl}/${usage.contentId}`;
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Usage Statistics: ${sectionTitle}`}
      size="lg"
    >
      <Stack gap="md" pos="relative">
        {/* T120: Loading Skeletons for Usage Stats */}
        {loading && (
          <Stack gap="md">
            <Group gap="md">
              <Skeleton height={48} width={48} circle />
              <Stack gap={4}>
                <Skeleton height={24} width={200} />
                <Skeleton height={16} width={300} />
              </Stack>
            </Group>
            <Divider />
            <Stack gap="xs">
              {[1, 2, 3].map((i) => (
                <Paper key={i} p="md" withBorder>
                  <Group justify="space-between">
                    <Stack gap={4}>
                      <Skeleton height={18} width="60%" />
                      <Skeleton height={14} width="40%" />
                    </Stack>
                    <Skeleton height={24} width={60} />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Usage Summary */}
        {!loading && usageData && (
          <>
            <Group gap="md">
              <Badge size="xl" variant="filled" color="blue">
                {usageData.count}
              </Badge>
              <div>
                <Text size="lg" fw={600}>
                  {usageData.count === 0
                    ? 'Not used anywhere'
                    : `Used in ${usageData.count} ${usageData.count === 1 ? 'place' : 'places'}`}
                </Text>
                <Text size="sm" c="dimmed">
                  {usageData.count === 0
                    ? 'This section is not linked to any content yet'
                    : 'This section is linked to the following content'}
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Warning for widely used sections */}
            {usageData.count >= 5 && (
              <Alert
                icon={<IconAlertTriangle size={16} />}
                color="yellow"
                variant="light"
              >
                This section is widely used. Changes to this section will affect{' '}
                <strong>{usageData.count}</strong> {usageData.count === 1 ? 'item' : 'items'}.
              </Alert>
            )}

            {/* Empty state */}
            {usageData.count === 0 && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  This section is not being used anywhere. You can safely delete it or link it to content.
                </Text>
              </Alert>
            )}

            {/* Usage list */}
            {usageData.count > 0 && (
              <ScrollArea h={300} type="scroll">
                <Stack gap="xs">
                  {usageData.usedIn.map((usage, index) => (
                    <Paper key={index} p="md" withBorder>
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" style={{ flex: 1 }}>
                          <Text size="lg">
                            {getContentTypeIcon(usage.contentType)}
                          </Text>
                          <div style={{ flex: 1 }}>
                            <Text fw={500} size="sm">
                              {usage.contentTitle}
                            </Text>
                            <Badge
                              size="xs"
                              variant="dot"
                              color={getContentTypeColor(usage.contentType)}
                            >
                              {usage.contentType}
                            </Badge>
                          </div>
                        </Group>
                        <Anchor
                          href={getContentLink(usage)}
                          target="_blank"
                          size="sm"
                        >
                          <Group gap={4}>
                            View
                            <IconExternalLink size={14} />
                          </Group>
                        </Anchor>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </ScrollArea>
            )}
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
