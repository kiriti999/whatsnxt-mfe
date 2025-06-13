"use client"
import React, { useState, useEffect } from 'react';
import coursesStyles from '../../../components/Courses/Course.module.css';
import { useQuery } from '@tanstack/react-query';
import { TrainerAPI } from '../../../api/v1/courses/trainer/trainer';
import { useDebouncedValue } from '@mantine/hooks';
import Link from 'next/link';
import { ActionIcon, Box, Button, Center, Collapse, Grid, Group, Loader, Pagination, Select, Table, TextInput, Tooltip, Menu } from '@mantine/core';
import { CourseAPI } from '../../../api/v1/courses/course/course';
import { notifications } from '@mantine/notifications';
import { IconChevronDown, IconChevronUp, IconEye, IconEyeOff, IconPlus, IconDotsVertical } from '@tabler/icons-react';
import CourseDeleteModal from './course-delete-model';
import ActionButtons from './CourseHistoryActionButtonsMobile'; // Import the new component

interface courseResponseType {
  isLoading: boolean;
  refetch: () => void;
  data: { courseList: [], totalCount: number };
}

const CourseHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [expandedCourse, setExpandedCourse] = useState({});
  const [expandedSection, setExpandedSection] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const [courseDelId, setCourseDelId] = useState('');
  const [publicId, setPublicId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});
  const [courseSlugs, setCourseSlugs] = useState<Record<string, string>>({});
  const [courseStatuses, setCourseStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check if we're on the client-side
    if (typeof window !== 'undefined') {
      // Define mobile breakpoint
      const checkIfMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Set initial value
      checkIfMobile();

      // Add event listener for window resize
      window.addEventListener('resize', checkIfMobile);

      // Clean up
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

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
    queryKey: ['trainer-course-history', currentPage, debouncedSearch],
    queryFn: async () => {
      const response = await TrainerAPI.courseHistory(currentPage, null, debouncedSearch);
      return {
        courseList: response.data?.courses || [],
        totalCount: response.data?.total || 0
      };
    },
    staleTime: 0,
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

  const publishVideo = async (videoId: String, sectionId: String, isPublish: Boolean) => {
    const payload = { isPublish: !isPublish };
    const response = await CourseAPI.publishVideo(sectionId, videoId, payload);

    let message = isPublish ? 'Video unpublished successfully' : 'Video published successfully';
    if (response.status === 200) {
      notifications.show({
        position: 'bottom-left',
        title: 'Publish success',
        message: message,
        color: 'green',
      });
    }
    refetch();
  };

  const publishAllVideosInSection = async (sectionId: String, isPublish: Boolean) => {
    const payload = { isPublish: !isPublish };
    const response = await CourseAPI.publishAllVideosInSection(sectionId, payload);

    let message = isPublish ? 'All videos unpublished successfully' : 'All videos published successfully';
    if (response.status === 200) {
      notifications.show({
        position: 'bottom-left',
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
      accessor: (row: { _id: string | number; slug: any; courseName: any; title: any; }) => (
        <Link href={`/courses/${courseSlugs[row._id] ?? row.slug}`}>
          {courseTitles[row._id] ?? row?.courseName ?? row?.title}
        </Link>
      ),
    },
    {
      header: 'Status',
      accessor: (row: { _id: string | number; status: any; }) => (
        <>
          {courseStatuses[row._id] ?? row.status}
        </>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) =>
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
      accessor: (row: { _id: string | number; }) =>
        <ActionIcon onClick={() => { toggleCourse(row._id) }} variant="filled" color="red" radius="md" size="sm">
          {expandedCourse[row._id] ?
            <IconChevronUp size={14} />
            :
            <IconChevronDown size={14} />
          }
        </ActionIcon>
    }
  ], [courseTitles, courseSlugs, courseStatuses, isMobile]);

  // For section level videos, we can also use a mobile-friendly approach
  const renderVideoActions = (video: { isPublish: Boolean; _id: String; }, sectionId: String) => {
    if (!isMobile) {
      return (
        <Tooltip fz={'xs'}
          label={video.isPublish ? "Unpublish" : "Publish"}
          position="bottom"
          withArrow
        >
          <ActionIcon
            onClick={() => { publishVideo(video._id, sectionId, video.isPublish); }}
            radius="md"
            size="sm"
            variant="filled"
            color={video.isPublish ? "red" : "blue"}
          >
            {video.isPublish ? <IconEyeOff size={14} /> : <IconEye size={16} />}
          </ActionIcon>
        </Tooltip>
      );
    }

    // Mobile version with menu
    return (
      <Menu position="bottom-end" withArrow>
        <Menu.Target>
          <ActionIcon variant="subtle" size="md">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={video.isPublish ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            onClick={() => { publishVideo(video._id, sectionId, video.isPublish); }}
            color={video.isPublish ? "red" : "blue"}
          >
            <Group align="center" >
              <span>{video.isPublish ? "Unpublish" : "Publish"}</span>
            </Group>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    );
  };

  return (
    <div className={`${coursesStyles['courses-area']} courses-section pb-70`}>
      <div className="container">
        <div className="row">
          <div className="col-md-12 col-lg-12 mt-3">

            <Grid mb={'xs'} justify="space-between" grow>
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
                  data={[]}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Button size="md" c={'white'} component={Link} href={'/trainer/course/create-course-name'} fullWidth leftSection={<IconPlus size={16} />} >New Course</Button>
              </Grid.Col>
            </Grid>

            <Table withTableBorder={false} className='my-course-table'>
              <thead>
                <tr>
                  {tableColumns.map((column, index) => (
                    <th key={`${column.header}-${index}`}>{column.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={tableColumns.length}>
                      <Center style={{ flexDirection: "column", padding: '20px 0' }}>
                        <Loader size="lg" />
                      </Center>
                    </td>
                  </tr>
                ) : (
                  data?.courseList && data?.courseList.length > 0 ? data?.courseList.map((row: any) => (
                    <React.Fragment key={row._id}>
                      <tr>
                        {tableColumns.map((column, index) => (
                          <td key={`${column.header}-${index}`}>
                            {typeof column.accessor === 'function'
                              ? column.accessor(row)
                              : row[column.accessor]}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td colSpan={tableColumns.length}>
                          <Collapse in={expandedCourse[row._id]} style={{ marginLeft: 20 }}>
                            {row?.sections?.length > 0 && (
                              <Table withTableBorder={false} className='my-course-table' >
                                <thead>
                                  <tr>
                                    <th key={Math.random()}>Section Title</th>
                                    <th key={Math.random()}>Actions</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {row?.sections?.map((item: any) => (
                                    <React.Fragment key={item._id}>
                                      <tr>
                                        {item?.videos?.length > 0 && <td>{item.sectionTitle}</td>}
                                        <td>
                                          {item?.videos?.length > 0 && (
                                            isMobile ? (
                                              <Menu position="bottom-end" withArrow>
                                                <Menu.Target>
                                                  <ActionIcon variant="subtle" size="md">
                                                    <IconDotsVertical size={16} />
                                                  </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                  <Menu.Item
                                                    leftSection={
                                                      item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length ?
                                                        <IconEye size={16} /> :
                                                        <IconEyeOff size={16} />
                                                    }
                                                    onClick={() => {
                                                      item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length
                                                        ? publishAllVideosInSection(item._id, false)
                                                        : publishAllVideosInSection(item._id, true);
                                                    }}
                                                    color={
                                                      item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length
                                                        ? "blue"
                                                        : "red"
                                                    }
                                                  >
                                                    <Group align="center" >
                                                      <span>
                                                        {item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length ?
                                                          "Publish All" :
                                                          "Unpublish All"}
                                                      </span>
                                                    </Group>
                                                  </Menu.Item>
                                                </Menu.Dropdown>
                                              </Menu>
                                            ) : (
                                              <Tooltip fz={'xs'}
                                                label={
                                                  item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length
                                                    ? "Publish All"
                                                    : "Unpublish All"
                                                }
                                                position="bottom"
                                                withArrow
                                              >
                                                <ActionIcon
                                                  onClick={() => {
                                                    item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length
                                                      ? publishAllVideosInSection(item._id, false)
                                                      : publishAllVideosInSection(item._id, true);
                                                  }}
                                                  radius="md"
                                                  size="sm"
                                                  variant="filled"
                                                  color={
                                                    item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length
                                                      ? "blue"
                                                      : "red"
                                                  }
                                                >
                                                  {item?.videos.filter((x: { isPublish: any; }) => x.isPublish).length !== item?.videos.length ? (
                                                    <IconEye size={14} />
                                                  ) : (
                                                    <IconEyeOff size={14} />
                                                  )}
                                                </ActionIcon>
                                              </Tooltip>
                                            )
                                          )}
                                        </td>

                                        {item?.videos?.length > 0 && <td>
                                          <ActionIcon onClick={() => { toggleSection(item._id) }} size="sm" variant="filled" color="red" radius="md">
                                            {expandedSection[item._id] ?
                                              <IconChevronUp size={14} />
                                              :
                                              <IconChevronDown size={14} />
                                            }
                                          </ActionIcon>
                                        </td>}
                                      </tr>
                                      <tr>
                                        <td colSpan={3}>
                                          <Collapse in={expandedSection[item._id]} style={{ marginLeft: 20 }}>
                                            {item?.videos?.length > 0 && (
                                              <Table withTableBorder={false} className='my-course-table'>
                                                <thead>
                                                  <tr>
                                                    <th key={Math.random()}>Lecture Title</th>
                                                    <th key={Math.random()}>Actions</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {item?.videos?.map((video: { _id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: number) => (
                                                    <tr key={video._id}>
                                                      <td>{i + 1}. {video.name}</td>
                                                      <td>
                                                        {renderVideoActions(video, item._id)}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </Table>
                                            )}
                                          </Collapse>
                                        </td>
                                      </tr>
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </Table>
                            )}
                          </Collapse>
                        </td>
                      </tr>
                    </React.Fragment>
                  )) : (
                    <tr>
                      <td colSpan={tableColumns.length}>
                        <Center>No data available</Center>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </Table>

            <Box display={"flex"} style={{ justifyContent: "end" }}>
              <Pagination
                value={currentPage}
                onChange={handlePaginationChange}
                total={Math.ceil(data?.totalCount / 10)}
                mt="md"
                radius="md"
              />
            </Box>

            <CourseDeleteModal
              courseId={courseDelId}
              courseImagePublicId={publicId}
              isModalOpen={isModalOpen}
              modalClose={handleModalClose}
              handleDeleteSuccess={handleCourseDeleteSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHistory;