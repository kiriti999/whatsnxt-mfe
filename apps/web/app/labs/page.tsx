'use client';

import React, { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Box, Paper, Text, Pagination, ActionIcon, Badge, Progress, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrophy } from '@tabler/icons-react';
import { Lab } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';
import useAuth from '@/hooks/Authentication/useAuth';

interface LabWithProgress extends Lab {
  progress?: {
    totalPages: number;
    passedPages: number;
    percentage: number;
  };
}

const LabsPage = () => {
  const [publishedLabs, setPublishedLabs] = useState<LabWithProgress[]>([]);
  const [draftLabs, setDraftLabs] = useState<Lab[]>([]);
  const [publishedPage, setPublishedPage] = useState(1);
  const [draftPage, setDraftPage] = useState(1);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [draftTotal, setDraftTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const isTrainer = isAuthenticated && user?.role === 'trainer';
  const isStudent = isAuthenticated && user?.role !== 'trainer';
  const studentId = user?._id || '';
  const instructorId = user?._id || '';
  const pageSize = 6;

  const fetchPublishedLabs = async (page: number) => {
    try {
      const response: any = await labApi.getPublishedLabs(page);
      const labs = response.data;

      // Fetch progress for each lab if user is a student
      if (isStudent && studentId) {
        const labsWithProgress = await Promise.all(
          labs.map(async (lab: Lab) => {
            try {
              const progressResponse = await labApi.getStudentProgress(lab.id, studentId);
              return {
                ...lab,
                progress: progressResponse.data,
              };
            } catch (error) {
              // If no progress found, continue without progress data
              return lab;
            }
          })
        );
        setPublishedLabs(labsWithProgress);
      } else {
        setPublishedLabs(labs);
      }

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
  }, [isAuthenticated, instructorId, isTrainer, isStudent, studentId, publishedPage, draftPage]);

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
        <Title order={4}>Labs</Title>
        {isTrainer && (
          <Button onClick={() => router.push('/lab/create')}>Create New Lab</Button>
        )}
      </Group>

      {/* Published Labs Section */}
      <Box mb="xl">
        {publishedLabs.length === 0 ? (
          <Text c="dimmed">No published labs available.</Text>
        ) : (
          <>
            {publishedLabs.map((lab) => (
              <Paper key={lab.id} shadow="xs" p="md" withBorder mb="sm">
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Group mb="xs">
                      <Text fw={700}>{lab.name}</Text>
                      {lab.progress && lab.progress.percentage === 100 && (
                        <Badge color="teal" size="sm" leftSection={<IconTrophy size={12} />}>
                          Completed
                        </Badge>
                      )}
                    </Group>
                    <Text size="sm" c="dimmed" mb="sm">{lab.description || 'No description'}</Text>

                    {/* Show progress for students */}
                    {isStudent && lab.progress && lab.progress.totalPages > 0 && (
                      <Stack gap="xs">
                        <Group gap="xs">
                          <Text size="sm" fw={500}>
                            Progress: {lab.progress.passedPages}/{lab.progress.totalPages} pages
                          </Text>
                          <Text size="sm" fw={700} c={lab.progress.percentage === 100 ? 'teal' : 'blue'}>
                            {lab.progress.percentage}%
                          </Text>
                        </Group>
                        <Progress
                          value={lab.progress.percentage}
                          color={lab.progress.percentage === 100 ? 'teal' : 'blue'}
                          size="sm"
                          radius="xl"
                        />
                      </Stack>
                    )}
                  </Box>
                  <Button
                    variant="filled"
                    color="orange"
                    size="xs"
                    onClick={() => router.push(`/labs/${lab.id}`)}
                  >
                    Access Now
                  </Button>
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
          <Title order={4} mb="md">My Draft Labs</Title>
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