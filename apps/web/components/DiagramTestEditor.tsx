'use client';

import React, { useState, useEffect } from 'react';
import { Box, Select, Button, Group, Title, Text, SegmentedControl, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DiagramTest, DiagramShape } from '@whatsnxt/core-types';
import labApi from '../apis/lab.api';

interface DiagramTestEditorProps {
  initialDiagramTest?: Partial<DiagramTest>;
  onSave: (diagramTest: Partial<DiagramTest>) => void;
  onCancel: () => void;
}

const DiagramTestEditor: React.FC<DiagramTestEditorProps> = ({ initialDiagramTest, onSave, onCancel }) => {
  const [architectureType, setArchitectureType] = useState(initialDiagramTest?.architectureType || 'Common');
  const [availableShapes, setAvailableShapes] = useState<DiagramShape[]>([]);
  const [prompt, setPrompt] = useState(initialDiagramTest?.prompt || '');
  const [expectedDiagramState, setExpectedDiagramState] = useState(initialDiagramTest?.expectedDiagramState || {});

  useEffect(() => {
    labApi.getDiagramShapes(architectureType).then(setAvailableShapes);
  }, [architectureType]);

  const handleSave = () => {
    if (!prompt || !architectureType) {
      notifications.show({
        title: 'Validation Error',
        message: 'Prompt and Architecture Type are required.',
        color: 'red',
      });
      return;
    }
    onSave({ prompt, architectureType, expectedDiagramState });
    notifications.show({
      title: 'Success',
      message: 'Diagram test saved successfully!',
      color: 'green',
    });
  };

  return (
    <Box maw={800} mx="auto">
      <Title order={3} mb="md">{initialDiagramTest?.id ? 'Edit Diagram Test' : 'Add New Diagram Test'}</Title>

      <Textarea
        label="Prompt for Diagram Test"
        placeholder="e.g., Draw a simple AWS VPC with an EC2 instance."
        value={prompt}
        onChange={(event) => setPrompt(event.currentTarget.value)}
        mb="md"
        required
      />

      <Select
        label="Architecture Type"
        placeholder="Select architecture type"
        data={['AWS', 'Azure', 'GCP', 'Common']}
        value={architectureType}
        onChange={(value: string | null) => setArchitectureType(value || 'Common')}
        mb="md"
        required
      />

      <Title order={4} size="sm" mt="md" mb="xs">Available Shapes ({architectureType})</Title>
      <Group mb="xl">
        {availableShapes.map(shape => (
          <Button key={shape.id} variant="outline" size="xs">
            {shape.name} (SVG Placeholder)
          </Button>
        ))}
        {availableShapes.length === 0 && <Text c="dimmed">No shapes available for this architecture type.</Text>}
      </Group>

      <Box p="md" style={{ border: '1px dashed grey', minHeight: 200 }}>
        <Text c="dimmed">Diagram Editor Playground (Placeholder)</Text>
        {/* Here would be the actual diagramming canvas */}
        <Text>{JSON.stringify(expectedDiagramState)}</Text>
      </Box>

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Diagram Test</Button>
      </Group>
    </Box>
  );
};

export default DiagramTestEditor;
