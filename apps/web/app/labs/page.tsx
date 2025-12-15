'use client';

import React, { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Box, Paper, Text, Pagination, ActionIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';
import { IconEye, IconEdit } from '@tabler/icons-react';
import { Lab } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';
import useAuth from '@/hooks/Authentication/useAuth';

const LabsPage = () => {
  const [publishedLabs, setPublishedLabs] = useState<Lab[]>([]);
  const [draftLabs, setDraftLabs] = useState<Lab[]>([]);
  const [publishedPage, setPublishedPage] = useState(1);
  const [draftPage, setDraftPage] = useState(1);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [draftTotal, setDraftTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const isTrainer = isAuthenticated && user?.role === 'trainer';
  const instructorId = user?._id || '';
  const pageSize = 3;

  const fetchPublishedLabs = async (page: number) => {
    try {
      const response: any = await labApi.getPublishedLabs(page);
      setPublishedLabs(response.data);
      setPublishedTotal(response.total || 0);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load published labs.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to load published labs:', error);
    }
  };

  const fetchDraftLabs = async (page: number) => {
    if (!instructorId || !isTrainer) {
      setDraftLabs([]);
      setDraftTotal(0);
      return;
    }

    try {
      const response = await labApi.getDraftLabs(instructorId, page);
      setDraftLabs(response.data);
      setDraftTotal(response.total || 0);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load draft labs.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to load draft labs:', error);
    }
  };

  useEffect(() => {
    const loadLabs = async () => {
      setLoading(true);
      await fetchPublishedLabs(publishedPage);

      // Only fetch draft labs if user is authenticated as trainer with valid ID
      if (isTrainer && instructorId) {
        await fetchDraftLabs(draftPage);
      } else {
        setDraftLabs([]);
        setDraftTotal(0);
      }

      setLoading(false);
    };

    loadLabs();
  }, [isAuthenticated, instructorId, isTrainer, publishedPage, draftPage]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading labs...</Text>
      </Container>
    );
  }

  console.log('publishedLabs', publishedLabs)

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Title order={1}>Labs</Title>
        {isTrainer && (
          <Button onClick={() => router.push('/lab/create')}>Create New Lab</Button>
        )}
      </Group>

      {/* Published Labs Section */}
      <Box mb="xl">
        <Title order={2} mb="md">Published Labs</Title>
        {publishedLabs.length === 0 ? (
          <Text c="dimmed">No published labs available.</Text>
        ) : (
          <>
            {publishedLabs.map((lab) => (
              <Paper key={lab.id} shadow="xs" p="md" withBorder mb="sm">
                <Group justify="space-between">
                  <Box>
                    <Text fw={700}>{lab.name}</Text>
                    <Text size="sm" c="dimmed">{lab.description || 'No description'}</Text>
                    <Text size="xs" c="green">{lab.status.toUpperCase()}</Text>
                  </Box>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => router.push(`/labs/${lab.id}`)}
                    title="View Lab"
                  >
                    <IconEye size={18} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
            {Math.ceil(publishedTotal / pageSize) > 1 && (
              <Pagination
                total={Math.ceil(publishedTotal / pageSize)}
                value={publishedPage}
                onChange={setPublishedPage}
                mt="md"
              />
            )}
          </>
        )}
      </Box>

      {/* Draft Labs Section - Only for trainers */}
      {isTrainer && (
        <Box>
          <Title order={2} mb="md">My Draft Labs</Title>
          {draftLabs.length === 0 ? (
            <Text c="dimmed">No draft labs. Create one to get started!</Text>
          ) : (
            <>
              {draftLabs.map((lab) => (
                <Paper key={lab.id} shadow="xs" p="md" withBorder mb="sm">
                  <Group justify="space-between">
                    <Box>
                      <Text fw={700}>{lab.name}</Text>
                      <Text size="sm" c="dimmed">{lab.description || 'No description'}</Text>
                      <Text size="xs" c="orange">{lab.status.toUpperCase()}</Text>
                    </Box>
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => router.push(`/labs/${lab.id}`)}
                      title="Edit Lab"
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
              {Math.ceil(draftTotal / pageSize) > 1 && (
                <Pagination
                  total={Math.ceil(draftTotal / pageSize)}
                  value={draftPage}
                  onChange={setDraftPage}
                  mt="md"
                />
              )}
            </>
          )}
        </Box>
      )}
    </Container>
  );
};

export default LabsPage;