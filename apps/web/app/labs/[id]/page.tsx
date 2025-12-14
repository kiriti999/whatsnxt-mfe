'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Button,
  Group,
  Box,
  Paper,
  Text,
  Tabs,
  LoadingOverlay,
  Badge,
  Stack,
  TextInput,
  Textarea,
  Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Lab, LabPage } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';

const LAB_TYPES = [
  'Cloud Computing',
  'Networking',
  'Cybersecurity',
  'Database Management',
  'DevOps & Automation',
  'Software Architecture',
  'System Design',
];

const ARCHITECTURE_TYPES = ['AWS', 'Azure', 'GCP', 'Hybrid', 'On-Premise'];

const LabDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;

  const [lab, setLab] = useState<Lab | null>(null);
  const [pages, setPages] = useState<LabPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      labType: '',
      architectureType: '',
    },
    validate: {
      name: (value) => (value ? null : 'Lab name is required'),
      labType: (value) => (value ? null : 'Lab type is required'),
      architectureType: (value) => (value ? null : 'Architecture type is required'),
    },
  });

  const fetchLabData = async () => {
    setLoading(true);
    try {
      const response = await labApi.getLabById(labId);
      const labData = response.data;
      setLab(labData);
      setPages(labData.pages || []);

      // Populate form with lab data
      form.setValues({
        name: labData.name,
        description: labData.description || '',
        labType: labData.labType,
        architectureType: labData.architectureType,
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load lab.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to load lab:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) {
      fetchLabData();
    }
  }, [labId]);

  const handleUpdateLab = async (values: any) => {
    try {
      const response = await labApi.updateLab(labId, values);
      setLab(response.data);
      setIsEditing(false);
      notifications.show({
        title: 'Success',
        message: 'Lab updated successfully!',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update lab.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to update lab:', error);
    }
  };

  const handleCreatePage = async () => {
    try {
      const response = await labApi.createLabPage(labId, {
        pageNumber: pages.length + 1,
        hasQuestion: false,
        hasDiagramTest: false,
      });
      setPages([...pages, response.data]);
      notifications.show({
        title: 'Success',
        message: 'Page created successfully!',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create page.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to create page:', error);
    }
  };

  const handlePublishLab = async () => {
    try {
      const response = await labApi.publishLab(labId);
      setLab(response.data);
      notifications.show({
        title: 'Success',
        message: 'Lab published successfully!',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to publish lab.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to publish lab:', error);
    }
  };

  const handleDeleteLab = async () => {
    if (!confirm('Are you sure you want to delete this lab? This action cannot be undone.')) {
      return;
    }

    try {
      await labApi.deleteLab(labId);
      notifications.show({
        title: 'Success',
        message: 'Lab deleted successfully!',
        color: 'green',
      });
      router.push('/labs');
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete lab.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to delete lab:', error);
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={loading} />
      </Container>
    );
  }

  if (!lab) {
    return (
      <Container size="lg" py="xl">
        <Text>Lab not found.</Text>
      </Container>
    );
  }

  const isPublished = lab.status === 'published';
  const canEdit = lab.status === 'draft';

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Group>
          <Button variant="subtle" onClick={() => router.push('/labs')}>
            ← Back to Labs
          </Button>
          <Badge color={isPublished ? 'green' : 'gray'} size="lg">
            {lab.status.toUpperCase()}
          </Badge>
        </Group>
        <Group>
          {canEdit && (
            <>
              <Button variant="outline" color="red" onClick={handleDeleteLab}>
                Delete Lab
              </Button>
              <Button color="blue" onClick={handlePublishLab}>
                Publish Lab
              </Button>
            </>
          )}
        </Group>
      </Group>

      <Tabs defaultValue="details">
        <Tabs.List>
          <Tabs.Tab value="details">Lab Details</Tabs.Tab>
          <Tabs.Tab value="tests">Tests & Questions ({pages.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="details" pt="md">
          <Paper shadow="sm" p="xl" withBorder>
            {isEditing ? (
              <form onSubmit={form.onSubmit(handleUpdateLab)}>
                <Stack>
                  <TextInput
                    label="Lab Name"
                    placeholder="e.g., AWS Cloud Fundamentals"
                    {...form.getInputProps('name')}
                    required
                  />
                  <Textarea
                    label="Description"
                    placeholder="Brief description of the lab"
                    {...form.getInputProps('description')}
                  />
                  <Select
                    label="Lab Type"
                    placeholder="Select lab type"
                    data={LAB_TYPES}
                    {...form.getInputProps('labType')}
                    required
                  />
                  <Select
                    label="Architecture Type"
                    placeholder="Select architecture type"
                    data={ARCHITECTURE_TYPES}
                    {...form.getInputProps('architectureType')}
                    required
                  />
                  <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </Group>
                </Stack>
              </form>
            ) : (
              <Stack>
                <Box>
                  <Text size="sm" c="dimmed">Name</Text>
                  <Title order={3}>{lab.name}</Title>
                </Box>
                <Box>
                  <Text size="sm" c="dimmed">Description</Text>
                  <Text>{lab.description || 'No description'}</Text>
                </Box>
                <Group>
                  <Box>
                    <Text size="sm" c="dimmed">Lab Type</Text>
                    <Badge size="lg">{lab.labType}</Badge>
                  </Box>
                  <Box>
                    <Text size="sm" c="dimmed">Architecture Type</Text>
                    <Badge size="lg" color="blue">{lab.architectureType}</Badge>
                  </Box>
                </Group>
                {canEdit && (
                  <Group justify="flex-end" mt="md">
                    <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
                  </Group>
                )}
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="tests" pt="md">
          <Stack>
            {canEdit && (
              <Group justify="space-between" mb="md">
                <Box>
                  <Title order={4}>Tests & Questions</Title>
                  <Text size="sm" c="dimmed">
                    Each page can have a question test (MCQ, True/False, Fill in blank) and/or a diagram test
                  </Text>
                </Box>
                <Button onClick={handleCreatePage} leftSection="+" size="md">
                  Add New Page
                </Button>
              </Group>
            )}

            {pages.length === 0 ? (
              <Paper shadow="sm" p="xl" withBorder>
                <Stack align="center" gap="md">
                  <Text size="xl" c="dimmed">No pages yet</Text>
                  <Text c="dimmed" ta="center">
                    Create your first page to start adding questions and diagram tests
                  </Text>
                  {canEdit && (
                    <Button onClick={handleCreatePage} size="lg">
                      Create First Page
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : (
              <Stack gap="md">
                {pages.map((page, index) => (
                  <Paper key={page.id} shadow="sm" p="lg" withBorder>
                    <Group justify="space-between" align="flex-start" mb="md">
                      <Box>
                        <Group gap="sm" mb="xs">
                          <Text fw={700} size="lg">Page {page.pageNumber}</Text>
                          {page.hasQuestion && (
                            <Badge size="md" color="green" variant="light">
                              Question Test
                            </Badge>
                          )}
                          {page.hasDiagramTest && (
                            <Badge size="md" color="blue" variant="light">
                              Diagram Test
                            </Badge>
                          )}
                          {!page.hasQuestion && !page.hasDiagramTest && (
                            <Badge size="md" color="gray" variant="light">
                              No Tests
                            </Badge>
                          )}
                        </Group>
                      </Box>
                      <Button
                        variant="filled"
                        size="sm"
                        onClick={() => router.push(`/labs/${labId}/pages/${page.id}`)}
                      >
                        {page.hasQuestion || page.hasDiagramTest ? 'Edit Tests' : 'Add Tests'}
                      </Button>
                    </Group>

                    <Stack gap="sm">
                      {page.hasQuestion ? (
                        <Paper bg="green.0" p="md" radius="sm">
                          <Group gap="xs">
                            <Text size="sm" fw={600} c="green.9">✓ Question Test</Text>
                            <Text size="sm" c="dimmed">configured and ready</Text>
                          </Group>
                        </Paper>
                      ) : (
                        <Paper bg="gray.0" p="md" radius="sm" style={{ border: '1px dashed #dee2e6' }}>
                          <Group gap="xs">
                            <Text size="sm" c="dimmed">○ Question Test</Text>
                            <Text size="sm" c="dimmed">not configured</Text>
                          </Group>
                        </Paper>
                      )}

                      {page.hasDiagramTest ? (
                        <Paper bg="blue.0" p="md" radius="sm">
                          <Group gap="xs">
                            <Text size="sm" fw={600} c="blue.9">✓ Diagram Test</Text>
                            <Text size="sm" c="dimmed">configured and ready</Text>
                          </Group>
                        </Paper>
                      ) : (
                        <Paper bg="gray.0" p="md" radius="sm" style={{ border: '1px dashed #dee2e6' }}>
                          <Group gap="xs">
                            <Text size="sm" c="dimmed">○ Diagram Test</Text>
                            <Text size="sm" c="dimmed">not configured</Text>
                          </Group>
                        </Paper>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {canEdit && pages.length > 0 && (
              <Paper shadow="sm" p="lg" withBorder bg="blue.0" mt="md">
                <Group gap="sm">
                  <Text size="lg">💡</Text>
                  <Box style={{ flex: 1 }}>
                    <Text fw={600} mb={4}>Publishing Requirement</Text>
                    <Text size="sm" c="dimmed">
                      At least one page must have a question test or diagram test before you can publish this lab.
                    </Text>
                  </Box>
                </Group>
              </Paper>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default LabDetailPage;
