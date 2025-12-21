'use client';

import React, { useState, useEffect } from 'react';
import { Container, Title, Button, Group, Box, Paper, Text, Pagination, ActionIcon, Badge, Progress, Stack, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { IconEdit, IconTrophy, IconListCheck, IconSchema, IconCloud, IconBrandDocker, IconSchool } from '@tabler/icons-react';
import { Lab } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';
import useAuth from '@/hooks/Authentication/useAuth';

interface LabWithProgress extends Lab {
  progress?: {
    totalPages: number;
    passedPages: number;
    percentage: number;
  };
  questionCount?: number;
  diagramTestCount?: number;
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
      {/* Hero Overview Section */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, 15px); }
          100% { transform: translate(0, 0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          transition: transform 0.2s ease;
          box-shadow: var(--mantine-shadow-md);
        }
      `}</style>
      <Paper
        p="xl"
        mb={50}
        radius="lg"
        bg="var(--mantine-color-gray-0)"
        style={{ border: '1px solid var(--mantine-color-gray-2)', position: 'relative', overflow: 'hidden' }}
      >
        {/* Animated Background Elements */}
        <Box style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }}>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="5%" cy="10%" r="50" fill="var(--mantine-color-blue-1)" className="animate-float" style={{ opacity: 0.5 }} />
            <circle cx="95%" cy="80%" r="70" fill="var(--mantine-color-cyan-1)" className="animate-float-delayed" style={{ opacity: 0.5 }} />
            <rect x="80%" y="10%" width="60" height="60" rx="10" fill="var(--mantine-color-grape-1)" className="animate-float-slow" style={{ opacity: 0.3, transform: 'rotate(45deg)' }} />
            <path d="M0,100 Q50,150 100,100 T200,100" fill="none" stroke="var(--mantine-color-indigo-1)" strokeWidth="2" style={{ transform: 'translate(10%, 60%) scale(2)', opacity: 0.2 }} />
          </svg>
        </Box>

        <Stack align="center" ta="center" mb="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Badge size="lg" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>PRACTICAL LEARNING</Badge>
          <Title order={1} style={{ fontSize: '2rem' }}>
            Master Tech & Creative Diagrams
          </Title>
          <Text size="lg" c="dimmed" maw={700}>
            Explore our comprehensive labs designed for both technical professionals and students.
            From certification prep to creative learning.
          </Text>
        </Stack>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Card 1: Cloud Architecture */}
          <Paper p="lg" radius="md" withBorder shadow="sm" className="card-hover">
            <ThemeIcon size={48} radius="md" variant="light" color="blue" mb="md">
              <IconCloud size={28} />
            </ThemeIcon>
            <Title order={4} mb="xs">Cloud Architecture</Title>
            <Text size="sm" c="dimmed" mb="md">
              Prepare for technical exams and master architecture on major cloud platforms.
            </Text>
            <Group gap="xs">
              <Badge variant="outline" color="orange">AWS</Badge>
              <Badge variant="outline" color="blue">Azure</Badge>
              <Badge variant="outline" color="red">GCP</Badge>
            </Group>
          </Paper>

          {/* Card 2: DevOps & Containers */}
          <Paper p="lg" radius="md" withBorder shadow="sm" className="card-hover">
            <ThemeIcon size={48} radius="md" variant="light" color="cyan" mb="md">
              <IconBrandDocker size={28} />
            </ThemeIcon>
            <Title order={4} mb="xs">DevOps & Containers</Title>
            <Text size="sm" c="dimmed" mb="md">
              Hands-on labs for container orchestration and modern DevOps practices.
            </Text>
            <Group gap="xs">
              <Badge variant="outline" color="cyan">Docker</Badge>
              <Badge variant="outline" color="indigo">Kubernetes</Badge>
            </Group>
          </Paper>

          {/* Card 3: Education & Creativity */}
          <Paper p="lg" radius="md" withBorder shadow="sm" className="card-hover">
            <ThemeIcon size={48} radius="md" variant="light" color="green" mb="md">
              <IconSchool size={28} />
            </ThemeIcon>
            <Title order={4} mb="xs">Interactive Education</Title>
            <Text size="sm" c="dimmed" mb="md">
              Engaging diagram tests and quizzes suitable for schooling kids and learners.
            </Text>
            <Group gap="xs">
              <Badge variant="outline" color="green">Diagram Quiz</Badge>
              <Badge variant="outline" color="teal">Visual Learning</Badge>
            </Group>
          </Paper>
        </div>
      </Paper>

      <Group justify="space-between" mb="xl">
        <Title order={3}>All Available Labs</Title>
        {isTrainer && (
          <Button
            onClick={() => router.push('/lab/create')}
            leftSection={<IconEdit size={16} />}
          >
            Create New Lab
          </Button>
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

                    {/* Lab Statistics */}
                    <Group gap="sm" mb="sm">
                      <Badge
                        variant="light"
                        color="blue"
                        size="sm"
                        leftSection={<IconListCheck size={12} />}
                      >
                        {lab.questionCount || 0} Questions
                      </Badge>
                      <Badge
                        variant="light"
                        color="violet"
                        size="sm"
                        leftSection={<IconSchema size={12} />}
                      >
                        {lab.diagramTestCount || 0} Diagram Quizzes
                      </Badge>
                    </Group>

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
                      <Text size="xs" c="orange" mb="xs">{lab.status.toUpperCase()}</Text>

                      {/* Lab Statistics */}
                      <Group gap="sm">
                        <Badge
                          variant="light"
                          color="blue"
                          size="sm"
                          leftSection={<IconListCheck size={12} />}
                        >
                          {(lab as any).questionCount || 0} Questions
                        </Badge>
                        <Badge
                          variant="light"
                          color="violet"
                          size="sm"
                          leftSection={<IconSchema size={12} />}
                        >
                          {(lab as any).diagramTestCount || 0} Diagram Quizzes
                        </Badge>
                      </Group>
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