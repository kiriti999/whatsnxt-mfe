"use client"
// Force refresh
import React, { useState } from 'react';
// Refactored to remove Table dependency
import coursesStyles from '../../../components/Courses/Course.module.css';
import { useQuery } from '@tanstack/react-query';
import { TrainerAPI } from '../../../apis/v1/courses/trainer/trainer';
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { ActionIcon, Box, Button, Center, Collapse, Grid, Group, Loader, Pagination, Select, TextInput, Tooltip, Menu, Container, GridCol, Title, Text, Badge, Paper, Stack } from '@mantine/core';
import { CourseAPI } from '../../../apis/v1/courses/course/course';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconChevronUp, IconEye, IconEyeOff, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import CourseDeleteModal from './course-delete-model';
import ActionButtons from './CourseHistoryActionButtonsMobile'; // Import the new component

// Add proper types for video and section
interface Video {
  _id: string;
  name: string;
  isPublish: boolean; // Make sure this is included
}

interface Section {
  _id: string;
  sectionTitle: string;
  videos: Video[];
}

interface Course {
  _id: string;
  title?: string;
  courseName?: string;
  slug: string;
  status: string;
  sections: Section[];
}

interface courseResponseType {
  isLoading: boolean;
  refetch: () => void;
  data: { courseList: Course[], totalCount: number };
}

const CourseHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [expandedCourse, setExpandedCourse] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<Record<string, boolean>>({});

  const [courseDelId, setCourseDelId] = useState('');
  const [public_id, setPublicId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});
  const [courseSlugs, setCourseSlugs] = useState<Record<string, string>>({});
  const [courseStatuses, setCourseStatuses] = useState<Record<string, string>>({});

  // useState to track course status sorting
  const [courseStatusSort, setCourseStatusSort] = useState('')

  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSetCourseTitle = (courseId: string, newTitle: string) => {
    setCourseTitles((prev) => ({
      ...prev,
      [courseId]: newTitle,
    }));
  };

  const handleSetCourseSlug = (courseId: string, newSlug: string) => {
    setCourseSlugs((prev) => ({
      ...prev,
      [courseId]: newSlug,
    }));
  };

  const handleSetCourseStatus = (courseId: string, newStatus: string) => {
    setCourseStatuses((prev) => ({
      ...prev,
      [courseId]: newStatus,
    }));
  };

  // Create a loading state and debounce it
  const { isLoading, data, refetch }: courseResponseType = useQuery({
    queryKey: ['trainer-course-history', currentPage, debouncedSearch, courseStatusSort],
    queryFn: async () => {
      const response = await TrainerAPI.courseHistory(currentPage, null, debouncedSearch, courseStatusSort);
      return {
        courseList: response.data?.courses || [],
        totalCount: response.data?.total || 0
      };
    },
    staleTime: 1000 * 30, // 30 seconds
  });

  const toggleCourse = (courseId: string | number) => {
    setExpandedCourse((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }))
  }

  const toggleSection = (sectionId: string | number) => {
    setExpandedSection((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const handleCourseDeleteClick = (courseId: string, courseImagePublicId: string) => {
    setPublicId(courseImagePublicId);
    setCourseDelId(courseId);
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
  }

  const handleCourseDeleteSuccess = () => {
    refetch();
  }

  const handlePaginationChange = (e: any) => {
    setCurrentPage(e);
  };

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.currentTarget.value);
    setCurrentPage(1);
  };

  // Course Status
  const courseStatusArray = [
    {
      label: "Last updated",
      value: "updatedAt",
    },
    {
      label: 'draft',
      value: 'draft',
    },
    {
      label: 'pending_review',
      value: 'pending_review',
    },
    {
      label: 'published',
      value: 'published',
    },
    {
      label: 'approved',
      value: 'approved',
    },
    {
      label: 'rejected',
      value: 'rejected',
    }
  ]

  // Handle status sorting
  const handleStatusChange = (value: string) => {
    setCourseStatusSort(value)
    refetch();
  }

  const publishVideo = async (videoId: string, sectionId: string, isPublish: boolean) => {
    const payload = { isPublish: !isPublish };
    const response = await CourseAPI.publishVideo(sectionId, videoId, payload);

    const message = isPublish ? 'Video unpublished successfully' : 'Video published successfully';
    if (response.status === 200) {
      notifications.show({
        position: 'bottom-right',
        title: 'Publish success',
        message: message,
        color: 'green',
      });
    }
    refetch();
  };

  const publishAllVideosInSection = async (sectionId: string, isPublish: boolean) => {
    const payload = { isPublish: !isPublish };
    const response = await CourseAPI.publishAllVideosInSection(sectionId, payload);

    const message = isPublish ? 'All videos unpublished successfully' : 'All videos published successfully';
    if (response.status === 200) {
      notifications.show({
        position: 'bottom-right',
        title: 'Publish success',
        message: message,
        color: 'green',
      });
    }
    refetch();
  };

  // Modified to use the new ActionButtons component
  const tableColumns = React.useMemo(() => [
    {
      header: 'Title',
      accessor: (row: Course) => (
        <Link href={`/courses/${courseSlugs[row._id] ?? row.slug}`}>
          {courseTitles[row._id] ?? row?.courseName ?? row?.title}
        </Link>
      ),
    },
    {
      header: 'Status',
      accessor: (row: Course) => (
        <>
          {courseStatuses[row._id] ?? row.status}
        </>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Course) =>
        <ActionButtons
          row={row}
          handleCourseDeleteClick={handleCourseDeleteClick}
          courseStatuses={courseStatuses}
          handleSetCourseTitle={handleSetCourseTitle}
          handleSetCourseSlug={handleSetCourseSlug}
          handleSetCourseStatus={handleSetCourseStatus}
        />
    },
    {
      header: '',
      accessor: (row: Course) =>
        <ActionIcon onClick={() => { toggleCourse(row._id) }} variant="filled" color="red" radius="md" size="sm">
          {expandedCourse[row._id] ?
            <IconChevronUp size={14} />
            :
            <IconChevronDown size={14} />
          }
        </ActionIcon>
    }
  ], [courseTitles, courseSlugs, courseStatuses, expandedCourse]);

  // Fixed renderVideoActions function with proper typing and null checks
  const renderVideoActions = (video: Video, sectionId: string) => {
    // Add safety check for isPublish property
    const isPublish = video.isPublish ?? false;

    if (!isMobile) {
      return (
        <Tooltip fz={'xs'}
          label={isPublish ? "Unpublish" : "Publish"}
          position="bottom"
          withArrow
        >
          <ActionIcon
            onClick={() => { publishVideo(video._id, sectionId, isPublish); }}
            radius="md"
            size="sm"
            variant="outline"
            color={isPublish ? "blue" : "red"}
          >
            {isPublish ? <IconEye size={16} /> : <IconEyeOff size={14} />}
          </ActionIcon>
        </Tooltip>
      );
    }

    // Mobile version with menu
    return (
      <Menu position="bottom-end" withArrow>
        <Menu.Target>
          <ActionIcon variant="outline" size="md">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={isPublish ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            onClick={() => { publishVideo(video._id, sectionId, isPublish); }}
            color={isPublish ? "red" : "blue"}
          >
            <Group align="center" >
              <span>{isPublish ? "Unpublish" : "Publish"}</span>
            </Group>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  };

  return (
    <div className={`${coursesStyles['courses-area']} courses-section pb-70`}>
      <Container size={'xl'} mt="3em">
        <Grid>
          <GridCol span={12} >
            <Title order={4}>Create or Edit the course</Title>
            <Grid my={'xs'} justify="space-between" grow>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="md"
                  radius="sm"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  size="md"
                  radius="sm"
                  placeholder="Sort by"
                  clearable={true}
                  data={courseStatusArray}
                  onChange={(value) => {
                    handleStatusChange(value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Button size="md" c={'white'} component={Link} href={'/trainer/course/create-course-name'} fullWidth leftSection={<IconPlus size={16} />} >New Course</Button>
              </Grid.Col>
            </Grid>

            {/* Header Row */}
            <Paper p="md" mb="sm" withBorder>
              <Grid align="center" gutter="xs">
                <GridCol span={6}>
                  <Text fw={700} fz="sm" tt="uppercase" c="dimmed">Title</Text>
                </GridCol>
                <GridCol span={2}>
                  <Text fw={700} fz="sm" tt="uppercase" c="dimmed">Status</Text>
                </GridCol>
                <GridCol span={3}>
                  <Text fw={700} fz="sm" tt="uppercase" c="dimmed">Actions</Text>
                </GridCol>
                <GridCol span={1} style={{ textAlign: 'center' }}>
                  <Box w={20} />
                </GridCol>
              </Grid>
            </Paper>

            {/* Content List */}
            <Stack gap="xs">
              {isLoading ? (
                <Center py="xl">
                  <Loader size="lg" />
                </Center>
              ) : (
                data?.courseList && data?.courseList.length > 0 ? (
                  data?.courseList.map((row: Course) => (
                    <Paper key={row._id} withBorder shadow="sm" radius="md" style={{ overflow: "hidden" }}>
                      {/* Course Row */}
                      <Box p="md">
                        <Grid align="center" gutter="xs">
                          <GridCol span={6}>
                            <Link
                              href={`/courses/${courseSlugs[row._id] ?? row.slug}`}
                              style={{
                                fontWeight: 500,
                                fontSize: '1.03rem',
                                color: 'inherit',
                                textDecoration: 'none',
                                display: 'block',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                lineHeight: 1.4
                              }}
                            >
                              <Text
                                fw={500}
                                lineClamp={2}
                                style={{
                                  wordBreak: 'break-word',
                                  overflowWrap: 'break-word',
                                  fontSize: 'clamp(0.875rem, 2vw, 1rem)'
                                }}
                              >
                                {courseTitles[row._id] ?? row?.courseName ?? row?.title}
                              </Text>
                            </Link>
                          </GridCol>
                          <GridCol span={2}>
                            <Badge
                              variant="outline"
                              color={(courseStatuses[row._id] ?? row.status) === 'published' ? 'green' : 'yellow'}
                            >
                              {courseStatuses[row._id] ?? row.status}
                            </Badge>
                          </GridCol>
                          <GridCol span={3}>
                            <ActionButtons
                              row={row}
                              handleCourseDeleteClick={handleCourseDeleteClick}
                              courseStatuses={courseStatuses}
                              handleSetCourseTitle={handleSetCourseTitle}
                              handleSetCourseSlug={handleSetCourseSlug}
                              handleSetCourseStatus={handleSetCourseStatus}
                            />
                          </GridCol>
                          <GridCol span={1} style={{ textAlign: 'center' }}>
                            {row?.sections?.length > 0 && (
                              <ActionIcon
                                onClick={() => toggleCourse(row._id)}
                                variant="subtle"
                                color="gray"
                              >
                                {expandedCourse[row._id] ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                              </ActionIcon>
                            )}
                          </GridCol>
                        </Grid>
                      </Box>

                      {/* Sections List */}
                      <Collapse in={expandedCourse[row._id]}>
                        <Box py="xs" className="bg-default-hover">
                          {row?.sections?.map((section) => (
                            <React.Fragment key={section._id}>
                              <Box p="sm" className="border-top-default">
                                <Grid align="center" gutter="xs">
                                  <GridCol span={6}>
                                    <Group gap="xs" pl="md">
                                      <Text size="sm" fw={500} c="dimmed">Section:</Text>
                                      <Text size="sm" fw={600}>{section.sectionTitle}</Text>
                                    </Group>
                                  </GridCol>
                                  <GridCol span={2}>
                                    {/* Placeholder for Section Status if needed */}
                                  </GridCol>
                                  <GridCol span={3}>
                                    {section?.videos?.length > 0 && (
                                      <Group gap="xs">
                                        {section?.videos?.length > 0 && (
                                          isMobile ? (
                                            <Menu position="bottom-end" withArrow>
                                              <Menu.Target>
                                                <ActionIcon variant="subtle" size="sm">
                                                  <IconDotsVertical size={16} />
                                                </ActionIcon>
                                              </Menu.Target>
                                              <Menu.Dropdown>
                                                <Menu.Item
                                                  leftSection={
                                                    section?.videos.filter((x: Video) => x.isPublish).length !== section?.videos.length ?
                                                      <IconEye size={16} /> :
                                                      <IconEyeOff size={16} />
                                                  }
                                                  onClick={() => {
                                                    section?.videos.filter((x: Video) => x.isPublish).length !== section?.videos.length
                                                      ? publishAllVideosInSection(section._id, false)
                                                      : publishAllVideosInSection(section._id, true);
                                                  }}
                                                >
                                                  {section?.videos.filter((x: Video) => x.isPublish).length !== section?.videos.length ? "Publish All" : "Unpublish All"}
                                                </Menu.Item>
                                              </Menu.Dropdown>
                                            </Menu>
                                          ) : (
                                            <Tooltip label="Publish/Unpublish All">
                                              <ActionIcon
                                                onClick={() => {
                                                  section?.videos.filter((x: Video) => x.isPublish).length !== section?.videos.length
                                                    ? publishAllVideosInSection(section._id, false)
                                                    : publishAllVideosInSection(section._id, true);
                                                }}
                                                variant="light"
                                                color="blue"
                                                size="sm"
                                              >
                                                {section?.videos.filter((x: Video) => x.isPublish).length !== section?.videos.length ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                                              </ActionIcon>
                                            </Tooltip>
                                          )
                                        )}
                                      </Group>
                                    )}
                                  </GridCol>
                                  <GridCol span={1} style={{ textAlign: 'center' }}>
                                    {section?.videos?.length > 0 && (
                                      <ActionIcon
                                        onClick={() => toggleSection(section._id)}
                                        variant="subtle"
                                        size="sm"
                                        color="gray"
                                      >
                                        {expandedSection[section._id] ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                      </ActionIcon>
                                    )}
                                  </GridCol>
                                </Grid>
                              </Box>

                              {/* Lectures List */}
                              <Collapse in={expandedSection[section._id]}>
                                <Stack gap={0}>
                                  {section?.videos?.map((video, idx) => (
                                    <Box key={video._id} p="sm" pl="48px" className="border-top-default">
                                      <Grid align="center" gutter="xs">
                                        <GridCol span={6}>
                                          <Group gap="xs">
                                            <Text size="xs" c="dimmed">{idx + 1}.</Text>
                                            <Text size="sm">{video.name}</Text>
                                          </Group>
                                        </GridCol>
                                        <GridCol span={2}>
                                          {video.isPublish ? (
                                            <Badge size="xs" color="green" variant="dot">Published</Badge>
                                          ) : (
                                            <Badge size="xs" color="gray" variant="dot">Draft</Badge>
                                          )}
                                        </GridCol>
                                        <GridCol span={3}>
                                          {renderVideoActions(video, section._id)}
                                        </GridCol>
                                        <GridCol span={1}>
                                        </GridCol>
                                      </Grid>
                                    </Box>
                                  ))}
                                </Stack>
                              </Collapse>
                            </React.Fragment>
                          ))}
                        </Box>
                      </Collapse>
                    </Paper>
                  ))
                ) : (
                  <Center p="xl"><Text c="dimmed">No data available</Text></Center>
                )
              )}
            </Stack>

            <Box display={"flex"} style={{ justifyContent: "end" }}>
              <Pagination
                value={currentPage}
                onChange={handlePaginationChange}
                total={Math.ceil((data?.totalCount || 0) / 10)}
                mt="md"
                radius="md"
              />
            </Box>

            <CourseDeleteModal
              courseId={courseDelId}
              public_id={public_id}
              isModalOpen={isModalOpen}
              modalClose={handleModalClose}
              handleDeleteSuccess={handleCourseDeleteSuccess}
            />
          </GridCol>
        </Grid>
      </Container>
    </div>
  );
};

export default CourseHistory;