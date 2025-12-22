"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionIcon, Text, Checkbox, Skeleton, Title, Tooltip, Grid, Stack, Box, Flex, Group, ThemeIcon, Paper, Card, Button } from '@mantine/core';
import { elapsedTime } from '../../utils/elapsedTime';
import { handleRefresh, handleRead, handleDelete, handleSelectAll, handleClick } from './handler';
import { TrainerAPI } from '../../apis/v1/courses/trainer/trainer';

import {
  IconRefresh,
  IconReceipt,
  IconTrash,
  IconMail,
  IconEye,
  IconSquareCheck,
  IconSquare
} from "@tabler/icons-react";
import Pagination from '../pagination/pagination';
import sanitizeHtml from 'sanitize-html';

const fetchNotificationsData = async (page: number) => {
  const { data } = await TrainerAPI.getNotification(page);
  return data;
};

const NotificationsHeader = ({ totalUnseen, onRefresh, onRead, onDelete, onSelectAll, isAllSelected }) => (
  <Group justify="space-between" mb="lg" px="xs">
    <Group gap="xs">
      <ThemeIcon variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} size="lg" radius="md">
        <IconMail size={20} />
      </ThemeIcon>
      <Title order={4} fw={700}>
        Notifications
        {totalUnseen > 0 && (
          <Text span c="indigo" inherit ml={6} fz="lg">
            ({totalUnseen} New)
          </Text>
        )}
      </Title>
    </Group>

    <Group gap="xs">
      <Tooltip label='Refresh'>
        <ActionIcon variant="light" color="gray" onClick={onRefresh} size="lg" radius="md">
          <IconRefresh size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label='Mark as read'>
        <ActionIcon variant="light" color="indigo" onClick={onRead} size="lg" radius="md">
          <IconReceipt size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label='Delete'>
        <ActionIcon variant="light" color="red" onClick={onDelete} size="lg" radius="md">
          <IconTrash size={20} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={isAllSelected ? 'Deselect All' : 'Select All'}>
        <ActionIcon
          variant={isAllSelected ? "filled" : "light"}
          color="blue"
          onClick={onSelectAll}
          size="lg"
          radius="md"
        >
          {isAllSelected ? <IconSquareCheck size={20} /> : <IconSquare size={20} />}
        </ActionIcon>
      </Tooltip>
    </Group>
  </Group>
);

const NotificationItem = ({ notification, isSelected, onClick, onCheckboxChange }) => (
  <Paper
    withBorder
    p="md"
    radius="md"
    onClick={onClick}
    style={{
      cursor: 'pointer',
      backgroundColor: notification?.seen
        ? 'var(--mantine-color-body)'
        : 'var(--mantine-color-indigo-0)',
      borderColor: isSelected
        ? 'var(--mantine-color-indigo-5)'
        : 'var(--mantine-color-default-border)',
      transition: 'all 0.2s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      if (!isSelected) e.currentTarget.style.borderColor = 'var(--mantine-color-indigo-3)';
    }}
    onMouseLeave={(e) => {
      if (!isSelected) e.currentTarget.style.borderColor = 'var(--mantine-color-default-border)';
    }}
  >
    {/* Active indicator strip for unseen items */}
    {!notification?.seen && (
      <Box
        pos="absolute"
        left={0}
        top={0}
        bottom={0}
        w={4}
        bg="indigo"
      />
    )}

    <Grid align="center" gutter="sm">
      <Grid.Col span="content">
        <Checkbox
          checked={isSelected}
          onChange={onCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          size="md"
        />
      </Grid.Col>

      <Grid.Col span="content">
        <ThemeIcon
          size={40}
          radius="xl"
          variant={notification?.seen ? "light" : "filled"}
          color={notification?.seen ? "gray" : "indigo"}
        >
          {notification?.seen ? <IconEye size={20} /> : <IconMail size={20} />}
        </ThemeIcon>
      </Grid.Col>

      <Grid.Col span="auto">
        <Stack gap={4}>
          <Text size="sm" c={notification?.seen ? "dimmed" : "indigo"} fw={700}>
            {elapsedTime(notification.createdAt)}
          </Text>
          <Text
            size="sm"
            c="text"
            lineClamp={2}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(decodeURI(notification.message)),
            }}
          />
        </Stack>
      </Grid.Col>
    </Grid>
  </Paper>
);

const NotificationsList = ({ notifications, selected, onNotificationClick, onCheckboxChange }) => (
  <Stack gap="sm">
    {notifications.map((notification: any, index: React.Key) => (
      <NotificationItem
        key={index}
        notification={notification}
        isSelected={selected.includes(index)}
        onClick={() => onNotificationClick(index)}
        onCheckboxChange={() => onCheckboxChange(index)}
      />
    ))}
  </Stack>
);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalUnseen, setTotalUnseen] = useState(0);
  const [selected, setSelected] = useState([]);
  const [nPages, setnPages] = useState(0);

  const loadNotifications = async (pageToLoad) => {
    try {
      setLoading(true);
      const data = await fetchNotificationsData(pageToLoad);
      setNotifications(data.notifications);
      setTotalUnseen(data.totalUnseen);
      setnPages(Math.ceil(data.total / 5));
      setLoading(false);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(page);
  }, [page]);


  return (
    <Box p={{ base: 'md', md: 'xl' }} style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card shadow="sm" radius="lg" p="xl" withBorder>
        <NotificationsHeader
          totalUnseen={totalUnseen}
          onRefresh={() => handleRefresh(setNotifications, setLoading, setPage, setSelected, fetchNotificationsData, setTotalUnseen)}
          onRead={() => handleRead(selected, notifications, setNotifications, setTotalUnseen, setSelected)}
          onDelete={() => handleDelete(selected, notifications, setNotifications, setTotalUnseen, setSelected)}
          onSelectAll={() => handleSelectAll(selected, notifications, setSelected)}
          isAllSelected={selected.length === notifications.length && notifications.length > 0}
        />

        <Box mih={400}>
          {loading ? (
            <Stack>
              {[...Array(5).keys()].map(i => (
                <Skeleton key={i} width="100%" height={80} radius="md" animate />
              ))}
            </Stack>
          ) : notifications.length > 0 ? (
            <>
              <NotificationsList
                notifications={notifications}
                selected={selected}
                onNotificationClick={(index) => handleClick(index, setSelected)}
                onCheckboxChange={(index) => handleClick(index, setSelected)}
              />
              <Box mt="xl">
                <Pagination
                  nPages={nPages}
                  currentPage={page}
                  setCurrentPage={setPage}
                />
              </Box>
            </>
          ) : (
            <Flex
              direction="column"
              align="center"
              justify="center"
              h={400}
              gap="lg"
            >
              <Box className="floating-animation">
                <Image
                  src="https://ik.imagekit.io/freecodez/bell.webp"
                  alt="empty-notification"
                  width={150}
                  height={150}
                  style={{ filter: 'drop-shadow(0px 10px 10px rgba(0,0,0,0.1))' }}
                />
              </Box>

              <div style={{ textAlign: 'center' }}>
                <Title order={4} c="dark.3" mb={5}>No Notifications Yet</Title>
                <Text c="dimmed" size="md">
                  You're all caught up! Check back later for updates.
                </Text>
                <Button
                  mt="lg"
                  variant="light"
                  color="indigo"
                  onClick={() => loadNotifications(1)}
                  leftSection={<IconRefresh size={18} />}
                >
                  Refresh Notifications
                </Button>
              </div>
            </Flex>
          )}
        </Box>
      </Card>
    </Box>
  );
};


export default Notifications;
