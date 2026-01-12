'use client';

import React, { useState } from 'react';
import { Stack, Button, Accordion, Text, Paper, Badge, Group } from '@mantine/core';
import { IconBulb, IconLock } from '@tabler/icons-react';

interface HintsDisclosureProps {
  hints: string[];
  onHintRevealed?: (count: number) => void;
}

/**
 * HintsDisclosure Component
 * 
 * Progressive disclosure UI for students to reveal hints one at a time.
 * Uses Mantine Accordion for displaying revealed hints.
 * 
 * Features:
 * - Show hints progressively (one at a time)
 * - Keep previously revealed hints visible
 * - Display remaining hint count
 * - Emit hint reveal events to parent
 */
export const HintsDisclosure: React.FC<HintsDisclosureProps> = ({
  hints,
  onHintRevealed,
}) => {
  const [revealedCount, setRevealedCount] = useState(0);

  if (!hints || hints.length === 0) {
    return null;
  }

  const handleRevealNext = () => {
    const newCount = revealedCount + 1;
    setRevealedCount(newCount);
    onHintRevealed?.(newCount);
  };

  const remainingCount = hints.length - revealedCount;
  const allRevealed = revealedCount >= hints.length;

  return (
    <Paper withBorder p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
      <Group mb="sm" justify="space-between">
        <Group gap="xs">
          <IconBulb size={20} color="#fab005" />
          <Text fw={600} size="sm">
            Hints Available
          </Text>
        </Group>
        <Badge color="blue" variant="light">
          {revealedCount} / {hints.length} revealed
        </Badge>
      </Group>

      {revealedCount > 0 && (
        <Accordion 
          multiple 
          defaultValue={hints.slice(0, revealedCount).map((_, i) => `hint-${i}`)}
          mb="md"
        >
          {hints.slice(0, revealedCount).map((hint, index) => (
            <Accordion.Item key={index} value={`hint-${index}`}>
              <Accordion.Control icon={<IconBulb size={16} />}>
                Hint {index + 1}
              </Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {hint}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}

      {!allRevealed ? (
        <Button
          variant="light"
          leftSection={<IconBulb size={16} />}
          onClick={handleRevealNext}
          fullWidth
        >
          Show Hint {revealedCount + 1} ({remainingCount} remaining)
        </Button>
      ) : (
        <Group gap="xs" justify="center">
          <IconLock size={16} color="#868e96" />
          <Text size="sm" c="dimmed">
            All hints revealed
          </Text>
        </Group>
      )}
    </Paper>
  );
};

export default HintsDisclosure;
