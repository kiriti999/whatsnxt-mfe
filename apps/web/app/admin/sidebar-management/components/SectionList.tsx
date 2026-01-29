'use client';

import React from 'react';
import {
  Box,
  Table,
  Group,
  Text,
  ActionIcon,
  Badge,
  Tooltip,
  Stack,
  Loader,
  Center,
} from '@mantine/core';
import { IconEdit, IconTrash, IconEye, IconEyeOff, IconGripVertical } from '@tabler/icons-react';
import * as TablerIcons from '@tabler/icons-react';
import { Section } from '../../../../apis/v1/sidebar/sectionsApi';

interface SectionListProps {
  sections: Section[];
  loading?: boolean;
  onEdit: (section: Section) => void;
  onDelete: (section: Section) => void;
  onToggleVisibility?: (section: Section) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  loading = false,
  onEdit,
  onDelete,
  onToggleVisibility,
}) => {
  // Get icon component
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    
    const iconComponentName = `Icon${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;
    const IconComponent = (TablerIcons as any)[iconComponentName];
    
    return IconComponent ? <IconComponent size={18} stroke={1.5} /> : null;
  };

  // Render sections recursively with indentation
  const renderSection = (section: Section, depth: number = 0) => {
    const indent = depth * 24; // 24px per level
    const icon = getIconComponent(section.iconName);

    const rows = [
      <Table.Tr key={section._id}>
        <Table.Td>
          <Group gap="xs" style={{ paddingLeft: `${indent}px` }}>
            {depth > 0 && (
              <Text c="dimmed" size="xs">
                {'└─'}
              </Text>
            )}
            {icon}
            <Text fw={depth === 0 ? 600 : 400} size="sm">
              {section.title}
            </Text>
          </Group>
        </Table.Td>

        <Table.Td>
          <Text size="sm" c="dimmed" style={{ fontFamily: 'monospace' }}>
            {section.slug}
          </Text>
        </Table.Td>

        <Table.Td>
          <Badge color={section.contentType === 'blog' ? 'blue' : 'green'} size="sm">
            {section.contentType}
          </Badge>
        </Table.Td>

        <Table.Td>
          <Text size="sm" ta="center">
            {section.depth}
          </Text>
        </Table.Td>

        <Table.Td>
          <Text size="sm" ta="center">
            {section.order}
          </Text>
        </Table.Td>

        <Table.Td>
          <Text size="sm" ta="center">
            {section.postCount}
          </Text>
        </Table.Td>

        <Table.Td>
          <Group gap="xs" justify="center">
            {section.isVisible ? (
              <Tooltip label="Visible">
                <IconEye size={18} color="green" />
              </Tooltip>
            ) : (
              <Tooltip label="Hidden">
                <IconEyeOff size={18} color="gray" />
              </Tooltip>
            )}
          </Group>
        </Table.Td>

        <Table.Td>
          <Group gap="xs" justify="center" wrap="nowrap">
            <Tooltip label="Edit">
              <ActionIcon
                variant="subtle"
                size="sm"
                onClick={() => onEdit(section)}
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>

            {onToggleVisibility && (
              <Tooltip label={section.isVisible ? 'Hide' : 'Show'}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={() => onToggleVisibility(section)}
                >
                  {section.isVisible ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label="Delete">
              <ActionIcon
                variant="subtle"
                size="sm"
                color="red"
                onClick={() => onDelete(section)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    ];

    // Recursively render children
    if (section.children && section.children.length > 0) {
      section.children.forEach(child => {
        rows.push(...renderSection(child, depth + 1));
      });
    }

    return rows;
  };

  if (loading) {
    return (
      <Center py="xl">
        <Stack align="center" gap="md">
          <Loader size="md" />
          <Text size="sm" c="dimmed">
            Loading sections...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (sections.length === 0) {
    return (
      <Box p="xl" ta="center">
        <Text size="sm" c="dimmed">
          No sections found. Create your first section to get started.
        </Text>
      </Box>
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Slug</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Depth</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Order</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Posts</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sections.map(section => renderSection(section, 0))}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

export default SectionList;
