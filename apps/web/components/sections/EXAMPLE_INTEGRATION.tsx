/**
 * Example Content Editor Page
 * Demonstrates ContentSectionManager integration
 * 
 * This file shows how to integrate section management into
 * tutorial/blog editing workflows.
 */

'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Stack,
  Paper,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Divider,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContentSectionManager } from '@/components/sections/ContentSectionManager';

// Mock content data - replace with actual API calls
interface ContentForm {
  title: string;
  description: string;
  category: string;
}

export default function ExampleContentEditor() {
  // In a real app, these would come from:
  // - contentId: URL params or route state
  // - trainerId: Auth context
  // - contentType: Route or state
  const [contentId] = useState('tutorial_example_123');
  const [trainerId] = useState('trainer_example_456');
  const [contentType] = useState<'blog' | 'tutorial'>('tutorial');
  const [isEditing] = useState(true);

  const form = useForm<ContentForm>({
    initialValues: {
      title: 'Introduction to React',
      description: 'Learn the basics of React development',
      category: 'web-development',
    },
  });

  const handleSave = (values: ContentForm) => {
    console.log('Saving content:', values);
    // Implement actual save logic here
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>Edit Tutorial</Title>

        <form onSubmit={form.onSubmit(handleSave)}>
          <Stack gap="lg">
            {/* Basic Content Fields */}
            <Paper shadow="xs" p="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={600} size="sm">Basic Information</Text>
                <Divider />
                
                <TextInput
                  label="Tutorial Title"
                  placeholder="Enter tutorial title"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Description"
                  placeholder="Brief description of the tutorial"
                  minRows={3}
                  {...form.getInputProps('description')}
                />

                <Select
                  label="Category"
                  placeholder="Select category"
                  data={[
                    { value: 'web-development', label: 'Web Development' },
                    { value: 'mobile-development', label: 'Mobile Development' },
                    { value: 'data-science', label: 'Data Science' },
                  ]}
                  {...form.getInputProps('category')}
                />
              </Stack>
            </Paper>

            {/* Section Management - The New Feature! */}
            <ContentSectionManager
              contentId={contentId}
              contentType={contentType}
              trainerId={trainerId}
              isEditing={isEditing}
              showPostCounts={true}
            />

            {/* Save Button */}
            <Group justify="flex-end">
              <Button variant="subtle">Cancel</Button>
              <Button type="submit">Save Tutorial</Button>
            </Group>
          </Stack>
        </form>

        {/* Developer Notes */}
        <Paper shadow="xs" p="md" radius="md" withBorder bg="gray.0">
          <Stack gap="xs">
            <Text fw={600} size="sm">Integration Notes:</Text>
            <Text size="xs" c="dimmed">
              1. Replace mock IDs with actual data from routes/auth
            </Text>
            <Text size="xs" c="dimmed">
              2. Get contentId from: useSearchParams().get('id') or route state
            </Text>
            <Text size="xs" c="dimmed">
              3. Get trainerId from: useAuth().user.trainerId or session
            </Text>
            <Text size="xs" c="dimmed">
              4. Set isEditing based on create vs edit mode
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
