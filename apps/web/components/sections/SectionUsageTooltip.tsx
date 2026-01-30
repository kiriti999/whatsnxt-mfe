/**
 * SectionUsageTooltip Component
 * Feature: 002-reusable-sections
 * Task: T075 [US7]
 * 
 * Hover tooltip that displays section usage statistics.
 * Shows usage count and can be attached to any section display.
 */

'use client';

import React, { useState } from 'react';
import { Tooltip, Badge, Group, Text, Stack } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';

interface SectionUsageTooltipProps {
  usageCount: number;
  children: React.ReactElement;
  showBadge?: boolean; // Show inline badge with usage count
}

/**
 * SectionUsageTooltip - Displays usage stats on hover
 * 
 * Features:
 * - Shows usage count in tooltip
 * - Optional inline badge
 * - Lightweight alternative to full modal
 * 
 * Usage:
 * ```tsx
 * <SectionUsageTooltip usageCount={section.usageCount} showBadge>
 *   <Button>Section Name</Button>
 * </SectionUsageTooltip>
 * ```
 */
export const SectionUsageTooltip: React.FC<SectionUsageTooltipProps> = ({
  usageCount,
  children,
  showBadge = false,
}) => {
  const getTooltipLabel = () => {
    if (usageCount === 0) {
      return 'Not used anywhere';
    }
    return `Used in ${usageCount} ${usageCount === 1 ? 'place' : 'places'}`;
  };

  const getUsageColor = () => {
    if (usageCount === 0) return 'gray';
    if (usageCount >= 10) return 'red';
    if (usageCount >= 5) return 'yellow';
    return 'blue';
  };

  if (showBadge) {
    return (
      <Group gap="xs" wrap="nowrap">
        {children}
        <Tooltip label={getTooltipLabel()} position="top">
          <Badge
            size="sm"
            variant="light"
            color={getUsageColor()}
            leftSection={<IconChartBar size={12} />}
          >
            {usageCount}
          </Badge>
        </Tooltip>
      </Group>
    );
  }

  return (
    <Tooltip
      label={getTooltipLabel()}
      position="top"
      withArrow
    >
      {children}
    </Tooltip>
  );
};

/**
 * SectionUsageInfo - Inline info display (no tooltip wrapper)
 * Shows usage count with icon
 */
export const SectionUsageInfo: React.FC<{
  usageCount: number;
  size?: 'xs' | 'sm' | 'md';
}> = ({ usageCount, size = 'sm' }) => {
  const getUsageColor = () => {
    if (usageCount === 0) return 'gray';
    if (usageCount >= 10) return 'red';
    if (usageCount >= 5) return 'yellow';
    return 'blue';
  };

  const getUsageText = () => {
    if (usageCount === 0) return 'Not used';
    return `Used in ${usageCount} ${usageCount === 1 ? 'place' : 'places'}`;
  };

  return (
    <Group gap={4}>
      <IconChartBar size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
      <Text size={size} c={getUsageColor()}>
        {getUsageText()}
      </Text>
    </Group>
  );
};
