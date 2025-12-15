'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Box, TextInput, Textarea, Select } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import labApi from '@/apis/lab.api';
import useAuth from '@/hooks/Authentication/useAuth';

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

function LabCreationPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const isTrainer = isAuthenticated && user?.role === 'trainer';
  const instructorId = user?._id || '';

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
        instructorId
      });
      const newLab = response.data;
      notifications.show({
        title: 'Success',
        message: `Lab "${newLab.name}" created successfully!`,
        color: 'green',
      });
      router.push(`/labs/${newLab.id}`);
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

  if (!isAuthenticated) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="md">Create Lab</Title>
        <Box c="red">Please log in to create labs.</Box>
      </Container>
    );
  }

  if (!isTrainer) {
    return (
      <Container size="lg" py="xl">
        <Title order={1} mb="md">Create Lab</Title>
        <Box c="red">Only trainers can create labs.</Box>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">Create New Lab</Title>
      <Box maw={600} mx="auto">
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
            <Button variant="default" onClick={() => router.push('/labs')}>Cancel</Button>
            <Button type="submit">Create Lab</Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
}

export default LabCreationPage;