/**
 * DraggableSectionsList Component
 * Feature: 002-reusable-sections
 * Tasks: T065, T066, T067, T068 [US6]
 * 
 * Drag-and-drop reorderable list of sections within a tutorial/blog.
 * Updates section order field when sections are reordered.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Group,
  Text,
  Paper,
  Badge,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from '@mantine/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconUnlink, IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SectionLinksAPI } from '../../apis/v1/sidebar/sectionLinksApi';
import type { SectionLinkWithDetails } from '../../types/sectionLink';

interface DraggableSectionsListProps {
  sections: SectionLinkWithDetails[];
  contentId: string;
  contentType: 'blog' | 'tutorial';
  onSectionsReordered?: (sections: SectionLinkWithDetails[]) => void;
  onUnlinkSection?: (linkId: string, title: string) => void;
  isEditing?: boolean;
}

/**
 * DraggableSectionItem - Individual sortable section item
 */
interface DraggableSectionItemProps {
  section: SectionLinkWithDetails;
  index: number;
  isEditing: boolean;
  onUnlink: (linkId: string, title: string) => void;
}

const DraggableSectionItem: React.FC<DraggableSectionItemProps> = ({
  section,
  index,
  isEditing,
  onUnlink,
}) => {
  const [expanded, setExpanded] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      p="md"
      withBorder
      {...attributes}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
          {isEditing && (
            <div
              {...listeners}
              style={{
                cursor: 'grab',
                touchAction: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconGripVertical size={18} style={{ color: 'var(--mantine-color-gray-5)' }} />
            </div>
          )}

          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
          </ActionIcon>

          <Box style={{ flex: 1 }}>
            <Text fw={500} size="sm">
              {section.section.title}
            </Text>
            {section.section.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {section.section.description}
              </Text>
            )}
          </Box>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Badge size="sm" variant="light" color="gray">
            {index + 1}
          </Badge>

          {section.postCount !== undefined && section.postCount > 0 && (
            <Badge size="sm" variant="light" color="blue">
              {section.postCount} {section.postCount === 1 ? 'post' : 'posts'}
            </Badge>
          )}

          {isEditing && (
            <Tooltip label="Unlink section">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => onUnlink(section._id, section.section.title)}
              >
                <IconUnlink size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Paper>
  );
};

/**
 * DraggableSectionsList - Drag-and-drop sortable sections list
 * 
 * Features:
 * - Drag-and-drop reordering (T065)
 * - Optimistic UI updates (T066)
 * - API sync on drop (T067)
 * - Loading indicator during reorder (T068)
 * - Rollback on error (T066)
 * 
 * Usage:
 * ```tsx
 * <DraggableSectionsList
 *   sections={linkedSections}
 *   contentId={tutorialId}
 *   contentType="tutorial"
 *   onSectionsReordered={(reordered) => setLinkedSections(reordered)}
 *   onUnlinkSection={(linkId, title) => handleUnlink(linkId, title)}
 *   isEditing={true}
 * />
 * ```
 */
export const DraggableSectionsList: React.FC<DraggableSectionsListProps> = ({
  sections: initialSections,
  contentId,
  contentType,
  onSectionsReordered,
  onUnlinkSection,
  isEditing = false,
}) => {
  const [sections, setSections] = useState<SectionLinkWithDetails[]>(initialSections);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local state when props change
  useEffect(() => {
    setSections(initialSections);
  }, [initialSections]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sections.findIndex((s) => s._id === active.id);
    const newIndex = sections.findIndex((s) => s._id === over.id);

    // T066: Optimistic update - update UI immediately
    const reorderedSections = arrayMove(sections, oldIndex, newIndex);
    setSections(reorderedSections);

    // Notify parent component
    if (onSectionsReordered) {
      onSectionsReordered(reorderedSections);
    }

    // T068: Show loading indicator
    setIsReordering(true);

    try {
      // T067: Call API to persist new order
      await SectionLinksAPI.updateLinkOrder(active.id as string, { order: newIndex });

      notifications.show({
        title: 'Success',
        message: 'Section order updated',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Failed to reorder section:', error);

      // T066: Rollback on error
      setSections(initialSections);
      if (onSectionsReordered) {
        onSectionsReordered(initialSections);
      }

      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to reorder section',
        color: 'red',
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleUnlinkSection = (linkId: string, title: string) => {
    if (onUnlinkSection) {
      onUnlinkSection(linkId, title);
    }
  };

  if (sections.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No sections linked yet
      </Text>
    );
  }

  return (
    <Box pos="relative">
      {/* T068: Loading overlay during reorder */}
      <LoadingOverlay
        visible={isReordering}
        overlayProps={{ blur: 1 }}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s._id)}
          strategy={verticalListSortingStrategy}
          disabled={!isEditing}
        >
          <Box>
            {sections.map((section, index) => (
              <Box key={section._id} mb="xs">
                <DraggableSectionItem
                  section={section}
                  index={index}
                  isEditing={isEditing}
                  onUnlink={handleUnlinkSection}
                />
              </Box>
            ))}
          </Box>
        </SortableContext>
      </DndContext>
    </Box>
  );
};
