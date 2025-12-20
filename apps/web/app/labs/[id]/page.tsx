'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Pagination,
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Lab, LabPage } from '@whatsnxt/core-types';
import labApi from '@/apis/lab.api';
import { getAvailableArchitectures } from '@/utils/shape-libraries';
import { LabAccessButton } from '@/components/Lab/LabAccessButton';
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

// Get architecture types dynamically from centralized registry
const ARCHITECTURE_TYPES = getAvailableArchitectures();

const LabDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  // Get URL params for tab and page
  const urlTab = searchParams.get('tab');
  const urlPage = searchParams.get('page');

  const [lab, setLab] = useState<Lab | null>(null);
  const [pages, setPages] = useState<LabPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string | null>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [requiresAccess, setRequiresAccess] = useState(false);

  // Derived values (must come after state declarations)
  const isTrainer = isAuthenticated && user?.role === 'trainer';
  const isOwner = isTrainer && lab?.instructorId === user?._id;

  const PAGES_PER_PAGE = 3;

  // Update state when URL params change
  useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
    if (urlPage) {
      setCurrentPage(parseInt(urlPage, 10));
    }
  }, [urlTab, urlPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
      
      // Check if access is required (returned from backend)
      const accessRequired = (response as any).requiresAccess || false;
      setRequiresAccess(accessRequired);
      
      // Debug logging
      console.log('[Lab Access Debug]', {
        labId,
        labStatus: labData.status,
        requiresAccess: accessRequired,
        userRole: user?.role,
        isAuthenticated,
        pricing: labData.pricing,
        pagesCount: labData.pages?.length || 0,
      });
      
      // Set pages - backend already filtered them if access is required
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

  const handleDeletePage = async (pageId: string, pageNumber: number) => {
    if (!confirm(`Are you sure you want to delete Page ${pageNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      await labApi.deleteLabPage(labId, pageId);
      setPages(pages.filter(p => p.id !== pageId));
      notifications.show({
        title: 'Success',
        message: 'Page deleted successfully!',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete page.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to delete page:', error);
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

  // Derived values after lab is loaded
  const isPublished = lab.status === 'published';
  const canEdit = lab.status === 'draft';
  const isStudent = isAuthenticated && user?.role === 'student';
  // Show purchase button when: published + student + requires access
  const canViewAccess = isPublished && isStudent && requiresAccess;
  // Can view tests when: owner OR (student AND has access = not requiring access)
  const canViewTests = isOwner || (isStudent && !requiresAccess);

  // Debug logging for access control
  console.log('[Access Control Debug]', {
    isPublished,
    isStudent,
    isOwner,
    isTrainer,
    requiresAccess,
    canViewAccess,
    canViewTests,
    userRole: user?.role,
  });

  // Search and filter pages based on questions
  const filteredPages = pages.filter(page => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();

    // Search in page number
    if (page.pageNumber.toString().includes(query)) return true;

    // Search in questions
    if (page.questions && page.questions.length > 0) {
      return page.questions.some((question: any) =>
        question.questionText?.toLowerCase().includes(query) ||
        question.type?.toLowerCase().includes(query) ||
        question.correctAnswer?.toLowerCase().includes(query) ||
        (question.options && JSON.stringify(question.options).toLowerCase().includes(query))
      );
    }

    // Search in diagram test
    if (page.diagramTest) {
      return (
        page.diagramTest.prompt?.toLowerCase().includes(query) ||
        page.diagramTest.architectureType?.toLowerCase().includes(query)
      );
    }

    return false;
  });

  // Pagination calculations (on filtered pages)
  const totalPages = Math.ceil(filteredPages.length / PAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * PAGES_PER_PAGE;
  const endIndex = startIndex + PAGES_PER_PAGE;
  const paginatedPages = filteredPages.slice(startIndex, endIndex);

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

      {/* Access/Purchase Section for Students */}
      {canViewAccess && (
        <Paper shadow="sm" p="xl" withBorder mb="xl" bg="blue.0">
          <Stack align="center" gap="md">
            <Title order={3}>Access This Lab</Title>
            <LabAccessButton
              labId={labId}
              labTitle={lab.name}
              pricing={lab.pricing}
              onAccessGranted={() => {
                // Refresh lab data first to get updated access status
                fetchLabData();
                
                // Navigate to first page if lab has pages
                if (pages.length > 0) {
                  const firstPage = pages[0];
                  router.push(`/labs/${labId}/pages/${firstPage.id}`);
                } else {
                  notifications.show({
                    title: 'Lab Has No Content',
                    message: 'This lab does not have any pages yet. Please contact the instructor.',
                    color: 'yellow',
                  });
                }
              }}
            />
          </Stack>
        </Paper>
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
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
                  <Title order={5}>{lab.name}</Title>
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
                    <Button size='xs' onClick={() => setIsEditing(true)}>Edit Details</Button>
                  </Group>
                )}
              </Stack>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="tests" pt="md">
          {!canViewTests && isPublished && isStudent && requiresAccess ? (
            <Paper shadow="sm" p="xl" withBorder bg="yellow.0">
              <Stack align="center" gap="md">
                <Text size="xl" fw={600}>🔒 Access Required</Text>
                <Text c="dimmed" ta="center" size="lg">
                  You need to purchase this lab or enroll in a course to view tests and questions.
                </Text>
                <LabAccessButton
                  labId={labId}
                  labTitle={lab.name}
                  pricing={lab.pricing}
                  onAccessGranted={() => {
                    fetchLabData();
                  }}
                />
              </Stack>
            </Paper>
          ) : (
          <Stack>
            {canEdit && (
              <Group justify="space-between" mb="md">
                <Box>
                  <Title order={4}>Tests & Questions</Title>
                  <Text size="sm" c="dimmed">
                    {searchQuery
                      ? `Showing ${filteredPages.length} of ${pages.length} pages`
                      : 'Each page can have a question test (MCQ, True/False, Fill in blank) and/or a diagram test'
                    }
                  </Text>
                </Box>
                <Button onClick={handleCreatePage} leftSection="+" size="sm">
                  Add New Page
                </Button>
              </Group>
            )}

            {/* Search Bar */}
            {pages.length > 0 && (
              <TextInput
                placeholder="Search questions and tests across all pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
                rightSection={
                  searchQuery && (
                    <ActionIcon
                      variant="subtle"
                      onClick={() => setSearchQuery('')}
                      size="sm"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  )
                }
                size="md"
                mb="md"
              />
            )}

            {pages.length === 0 ? (
              <Paper shadow="sm" p="xl" withBorder>
                <Stack align="center" gap="md">
                  <Text size="xl" c="dimmed">No pages yet</Text>
                  <Text c="dimmed" ta="center">
                    Create your first page to start adding questions and diagram tests
                  </Text>
                  {canEdit && (
                    <Button onClick={handleCreatePage} size="xs">
                      Create First Page
                    </Button>
                  )}
                </Stack>
              </Paper>
            ) : filteredPages.length === 0 ? (
              <Paper shadow="sm" p="xl" withBorder bg="gray.0">
                <Stack align="center" gap="md">
                  <IconSearch size={48} color="gray" />
                  <Text size="xl" c="dimmed">No results found</Text>
                  <Text c="dimmed" ta="center">
                    No pages match your search "{searchQuery}"
                  </Text>
                  <Button variant="subtle" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </Stack>
              </Paper>
            ) : (
              <Stack gap="md">
                {paginatedPages.map((page, index) => (
                  <Paper key={page.id} shadow="sm" p="lg" withBorder>
                    <Group justify="space-between" align="flex-start" mb="md">
                      <Box>
                        <Group gap="sm" mb="xs">
                          <Text fw={700} size="md">Page {page.pageNumber}</Text>
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
                      <Group gap="sm">
                        {lab?.status === 'published' && (page.hasQuestion || page.hasDiagramTest) && (
                          <Button
                            variant="filled"
                            size="sm"
                            onClick={() => router.push(`/labs/${labId}/pages/${page.id}?returnPage=${currentPage}`)}
                          >
                            View Tests
                          </Button>
                        )}
                        {lab?.status !== 'published' && (
                          <Button
                            variant="filled"
                            size="xs"
                            onClick={() => router.push(`/labs/${labId}/pages/${page.id}?returnPage=${currentPage}`)}
                          >
                            {page.hasQuestion || page.hasDiagramTest ? 'Edit Tests' : 'Add Tests'}
                          </Button>
                        )}
                      </Group>
                    </Group>

                    <Stack gap="sm">
                      {page.hasQuestion ? (
                        <Paper bg="green.0" p="md" radius="sm">
                          <Stack gap="sm">
                            <Text size="sm" fw={600} c="green.9" mb={0}>✓ Question Test</Text>
                            {page.question?.questionText && (
                              <Text size="sm" c="green.8" lineClamp={2} pl="md">
                                {page.question.questionText}
                              </Text>
                            )}
                          </Stack>
                        </Paper>
                      ) : (
                        <Paper bg="gray.0" p="md" radius="sm" style={{ border: '1px dashed #dee2e6' }}>
                          <Stack gap="sm">
                            <Text size="sm" c="dimmed" mb={0}>○ Question Test</Text>
                            <Text size="sm" c="dimmed" pl="md">not configured</Text>
                          </Stack>
                        </Paper>
                      )}

                      {page.hasDiagramTest ? (
                        <Paper bg="blue.0" p="md" radius="sm">
                          <Stack gap="sm">
                            <Text size="sm" fw={600} c="blue.9" mb={0}>✓ Diagram Test</Text>
                            {page.diagramTest?.architectureType && (
                              <Text size="sm" c="blue.8" pl="md">
                                Architecture: {page.diagramTest.architectureType}
                              </Text>
                            )}
                          </Stack>
                        </Paper>
                      ) : (
                        <Paper bg="gray.0" p="md" radius="sm" style={{ border: '1px dashed #dee2e6' }}>
                          <Stack gap="sm">
                            <Text size="sm" c="dimmed" mb={0}>○ Diagram Test</Text>
                            <Text size="sm" c="dimmed" pl="md">not configured</Text>
                          </Stack>
                        </Paper>
                      )}
                    </Stack>
                  </Paper>
                ))}

                {totalPages > 1 && (
                  <Group justify="center" mt="lg">
                    <Pagination
                      total={totalPages}
                      value={currentPage}
                      onChange={setCurrentPage}
                      size="md"
                    />
                  </Group>
                )}
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
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};

export default LabDetailPage;
