'use client';

import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextInput,
  Button,
  Group,
  ActionIcon,
  Text,
  Paper,
  Tooltip,
  Alert,
  Box,
} from '@mantine/core';
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconInfoCircle,
  IconBulb,
} from '@tabler/icons-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HintsEditorProps {
  hints: string[];
  onUpdate: (hints: string[]) => void;
  disabled?: boolean;
}

interface SortableHintItemProps {
  hint: string;
  index: number;
  onUpdate: (index: number, value: string) => void;
  onDelete: (index: number) => void;
  disabled?: boolean;
}

const SortableHintItem: React.FC<SortableHintItemProps> = ({
  hint,
  index,
  onUpdate,
  onDelete,
  disabled,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `hint-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const charCount = hint.length;
  const isOverLimit = charCount > 500;

  return (
    <Group ref={setNodeRef} style={style} gap="xs" align="flex-start">
      <ActionIcon
        {...attributes}
        {...listeners}
        variant="subtle"
        color="gray"
        style={{ cursor: disabled ? 'not-allowed' : 'grab', marginTop: '8px' }}
        disabled={disabled}
      >
        <IconGripVertical size={16} />
      </ActionIcon>

      <Box style={{ flex: 1 }}>
        <TextInput
          placeholder={`Hint ${index + 1}`}
          value={hint}
          onChange={(e) => onUpdate(index, e.target.value)}
          disabled={disabled}
          maxLength={500}
          error={isOverLimit ? 'Hint must be 500 characters or less' : undefined}
          styles={{
            input: {
              paddingRight: '60px',
            },
          }}
        />
        <Text size="xs" c={isOverLimit ? 'red' : 'dimmed'} ta="right" mt={4}>
          {charCount}/500
        </Text>
      </Box>

      <ActionIcon
        onClick={() => onDelete(index)}
        color="red"
        variant="subtle"
        disabled={disabled}
        style={{ marginTop: '8px' }}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
};

/**
 * HintsEditor Component
 * 
 * Allows instructors to add, edit, reorder, and delete hints for diagram tests.
 * 
 * Features:
 * - Add up to 5 hints
 * - Drag-and-drop reordering
 * - Character counter (max 500 per hint)
 * - Real-time validation
 * - Duplicate detection
 * - Empty hint filtering
 */
export const HintsEditor: React.FC<HintsEditorProps> = ({
  hints,
  onUpdate,
  disabled = false,
}) => {
  const [localHints, setLocalHints] = useState<string[]>(hints || []);
  const [duplicateIndices, setDuplicateIndices] = useState<number[]>([]);

  useEffect(() => {
    setLocalHints(hints || []);
  }, [hints]);

  // Detect duplicates
  useEffect(() => {
    const duplicates: number[] = [];
    const seen = new Map<string, number>();

    localHints.forEach((hint, index) => {
      const trimmed = hint.trim();
      if (trimmed.length > 0) {
        if (seen.has(trimmed)) {
          duplicates.push(index);
          duplicates.push(seen.get(trimmed)!);
        } else {
          seen.set(trimmed, index);
        }
      }
    });

    setDuplicateIndices([...new Set(duplicates)]);
  }, [localHints]);

  const handleAdd = () => {
    if (localHints.length < 5) {
      const updated = [...localHints, ''];
      setLocalHints(updated);
      onUpdate(updated);
    }
  };

  const handleUpdate = (index: number, value: string) => {
    const updated = [...localHints];
    updated[index] = value;
    setLocalHints(updated);
    onUpdate(updated);
  };

  const handleDelete = (index: number) => {
    const updated = localHints.filter((_, i) => i !== index);
    setLocalHints(updated);
    onUpdate(updated);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().replace('hint-', ''));
      const newIndex = parseInt(over.id.toString().replace('hint-', ''));

      const updated = arrayMove(localHints, oldIndex, newIndex);
      setLocalHints(updated);
      onUpdate(updated);
    }
  };

  const hasDuplicates = duplicateIndices.length > 0;
  const hasOverLimitHints = localHints.some((h) => h.length > 500);
  const canAddMore = localHints.length < 5;

  return (
    <Paper withBorder p="md" radius="md">
      <Group mb="md" justify="space-between">
        <Group gap="xs">
          <IconBulb size={20} color="#fab005" />
          <Text fw={600}>Hints</Text>
          <Tooltip
            label="Add progressive hints to help students. Start general and get more specific."
            multiline
            w={300}
          >
            <ActionIcon variant="subtle" color="gray" size="sm">
              <IconInfoCircle size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Text size="sm" c="dimmed">
          {localHints.length} / 5 hints
        </Text>
      </Group>

      {hasDuplicates && (
        <Alert color="orange" title="Duplicate Hints Detected" mb="md" icon={<IconInfoCircle />}>
          Some hints have identical text. Each hint should be unique to provide distinct guidance.
        </Alert>
      )}

      <Stack gap="md" mb="md">
        {localHints.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={localHints.map((_, i) => `hint-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {localHints.map((hint, index) => (
                <SortableHintItem
                  key={`hint-${index}`}
                  hint={hint}
                  index={index}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  disabled={disabled}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <Text size="sm" c="dimmed" ta="center" py="md">
            No hints added yet. Click "Add Hint" to create your first hint.
          </Text>
        )}
      </Stack>

      <Button
        leftSection={<IconPlus size={16} />}
        onClick={handleAdd}
        disabled={!canAddMore || disabled}
        variant="light"
        fullWidth
      >
        {canAddMore
          ? `Add Hint (${5 - localHints.length} remaining)`
          : 'Maximum 5 hints reached'}
      </Button>

      {localHints.length > 0 && (
        <Alert color="blue" mt="md" icon={<IconInfoCircle />} title="Best Practices">
          <Text size="sm">
            • Start with general hints, then get more specific
            <br />
            • Don&apos;t give away the answer directly
            <br />
            • Keep hints concise (1-2 sentences)
            <br />• Drag hints to reorder them
          </Text>
        </Alert>
      )}
    </Paper>
  );
};

export default HintsEditor;
