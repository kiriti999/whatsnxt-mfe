import React, { useState } from 'react';
import { ActionIcon, Group, Menu, Tooltip } from '@mantine/core';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import CoursePublishButton from '../../../components/Courses/CoursePublishButton';

// Custom component that shows a three-dot menu on mobile and individual buttons on desktop
const ActionButtons = ({
  row,
  handleCourseDeleteClick,
  courseStatuses,
  handleSetCourseTitle,
  handleSetCourseSlug,
  handleSetCourseStatus
}) => {
  const [opened, setOpened] = useState(false);

  // Using Mantine's useMediaQuery hook for responsive design
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Desktop view - show all buttons
  if (!isMobile) {
    return (
      <Group>
        <CoursePublishButton
          _id={row._id}
          status={row.status}
          courseStatus={courseStatuses[row._id]}
          setCourseTitle={(newTitle) => handleSetCourseTitle(row._id, newTitle)}
          setCourseSlug={(newSlug) => handleSetCourseSlug(row._id, newSlug)}
          setCourseStatus={(newStatus) => handleSetCourseStatus(row._id, newStatus)}
        />
        <Tooltip fz={'xs'} label="Edit">
          <ActionIcon
            radius="md"
            size="sm"
            variant="filled"
            c={'white'}
            component={Link}
            href={`/trainer/course/course-builder/${row._id}`}
          >
            <IconEdit size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip fz={'xs'} label="Delete">
          <ActionIcon
            radius="md"
            size="sm"
            variant="filled"
            color="red"
            onClick={() => handleCourseDeleteClick(row._id, row.courseImagePublicId)}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    );
  }

  // Mobile view - show three dots menu
  return (
    <Menu opened={opened} onChange={setOpened} position="bottom-end" withArrow arrowPosition="center">
      <Menu.Target>
        <ActionIcon
          radius="md"
          size="md"
          variant="subtle"
          color="gray"
        >
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component="div"
        >
          <Group align="center" >
            <span>Publish</span>
            <CoursePublishButton
              _id={row._id}
              status={row.status}
              courseStatus={courseStatuses[row._id]}
              setCourseTitle={(newTitle) => handleSetCourseTitle(row._id, newTitle)}
              setCourseSlug={(newSlug) => handleSetCourseSlug(row._id, newSlug)}
              setCourseStatus={(newStatus) => handleSetCourseStatus(row._id, newStatus)}
            />
          </Group>
        </Menu.Item>

        <Menu.Item
          rightSection={<IconEdit size={16} />}
          component={Link}
          href={`/trainer/course/course-builder/${row._id}`}
        >
          <Group align="center" >
            <span>Edit</span>
          </Group>
        </Menu.Item>

        <Menu.Item
          rightSection={<IconTrash size={16} />}
          color="red"
          onClick={() => handleCourseDeleteClick(row._id, row.courseImagePublicId)}
        >
          <Group align="center" >
            <span>Delete</span>
          </Group>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ActionButtons;