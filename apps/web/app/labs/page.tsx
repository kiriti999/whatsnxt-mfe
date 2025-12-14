'use client';

import React, { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Box, Paper, Text, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { Lab } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';

// TODO: Get instructorId from authentication context
const TEMP_INSTRUCTOR_ID = 'temp-instructor-id';

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

const LabCreator = ({ onCreateSuccess }: { onCreateSuccess: (lab: Lab) => void }) => {
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

  const handleSubmit = async (values: { name: string; description: string; labType: string; architectureType: string }) => {
    try {
      const response = await labApi.createLab({
        ...values,
        instructorId: TEMP_INSTRUCTOR_ID
      });
      const newLab = response.data;
      notifications.show({
        title: 'Success',
        message: `Lab "${newLab.name}" created successfully!`,
        color: 'green',
      });
      form.reset();
      onCreateSuccess(newLab);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create lab.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to create lab:', error);
    }
  };

  return (
    <Box maw={600} mx="auto">
      <Title order={2} mb="md">Create New Lab</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Lab Name"
          placeholder="e.g., AWS Cloud Fundamentals"
          {...form.getInputProps('name')}
          required
          mb="md"
        />
        <Textarea
          label="Description"
          placeholder="Brief description of the lab"
          {...form.getInputProps('description')}
          mb="md"
        />
        <Select
          label="Lab Type"
          placeholder="Select lab type"
          data={LAB_TYPES}
          {...form.getInputProps('labType')}
          required
          mb="md"
        />
        <Select
          label="Architecture Type"
          placeholder="Select architecture type"
          data={ARCHITECTURE_TYPES}
          {...form.getInputProps('architectureType')}
          required
          mb="md"
        />
        <Group justify="flex-end" mt="xl">
          <Button type="submit">Create Lab</Button>
        </Group>
      </form>
    </Box>
  );
};

const LabsPage = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLabs = async () => {
    setLoading(true);
    try {
      const response = await labApi.getDraftLabs(TEMP_INSTRUCTOR_ID, 1);
      setLabs(response.data);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load labs.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to load labs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleLabCreated = (newLab: Lab) => {
    setLabs((prev) => [...prev, newLab]);
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading labs...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>My Labs</Title>
      </Group>

      <Box mb="xl">
        <LabCreator onCreateSuccess={handleLabCreated} />
      </Box>

      {labs.length === 0 ? (
        <Text>No labs created yet. Start by creating one!</Text>
      ) : (
        <Paper shadow="sm" p="md" withBorder>
          <Title order={3} mb="md">Existing Labs</Title>
          {labs.map((lab) => (
            <Paper key={lab.id} shadow="xs" p="md" withBorder mb="sm">
              <Group justify="space-between">
                <Box>
                  <Text fw={700}>{lab.name}</Text>
                  <Text size="sm" c="dimmed">{lab.description || 'No description'}</Text>
                  <Text size="xs" c="blue">{lab.status.toUpperCase()}</Text>
                </Box>
                <Button size="sm" onClick={() => router.push(`/labs/${lab.id}`)}>
                  View/Edit
                </Button>
              </Group>
            </Paper>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default LabsPage;