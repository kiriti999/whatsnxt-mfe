/**
 * ViewUsageButton Component
 * Feature: 002-reusable-sections
 * Task: T073 [US7]
 * 
 * Button that opens the SectionUsageModal to display section usage statistics.
 * Can be placed in section library views, section cards, or detail pages.
 */

'use client';

import React from 'react';
import { Button, ActionIcon, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChartBar, IconEye } from '@tabler/icons-react';
import { SectionUsageModal } from './SectionUsageModal';

interface ViewUsageButtonProps {
  sectionId: string;
  sectionTitle: string;
  variant?: 'button' | 'icon';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  compact?: boolean;
}

/**
 * ViewUsageButton - Opens modal to view section usage statistics
 * 
 * Features:
 * - Opens SectionUsageModal
 * - Can be rendered as button or icon
 * - Shows where section is used
 * 
 * Usage:
 * ```tsx
 * <ViewUsageButton
 *   sectionId={section._id}
 *   sectionTitle={section.title}
 *   variant="icon"
 *   size="sm"
 * />
 * ```
 */
export const ViewUsageButton: React.FC<ViewUsageButtonProps> = ({
  sectionId,
  sectionTitle,
  variant = 'button',
  size = 'sm',
  compact = false,
}) => {
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  if (variant === 'icon') {
    return (
      <>
        <Tooltip label="View usage statistics">
          <ActionIcon
            onClick={openModal}
            size={size}
            variant="subtle"
            color="gray"
          >
            <IconChartBar size={16} />
          </ActionIcon>
        </Tooltip>

        <SectionUsageModal
          opened={modalOpened}
          onClose={closeModal}
          sectionId={sectionId}
          sectionTitle={sectionTitle}
        />
      </>
    );
  }

  return (
    <>
      <Button
        onClick={openModal}
        leftSection={<IconEye size={16} />}
        variant="light"
        size={size}
        compact={compact}
      >
        View Usage
      </Button>

      <SectionUsageModal
        opened={modalOpened}
        onClose={closeModal}
        sectionId={sectionId}
        sectionTitle={sectionTitle}
      />
    </>
  );
};
