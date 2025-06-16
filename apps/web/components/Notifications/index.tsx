"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { ActionIcon, Text, Checkbox, Skeleton, Title, Tooltip } from '@mantine/core';
import styles from './notifications.module.css';
import { elapsedTime } from '../../utils/elapsedTime';
import { handleRefresh, handleRead, handleDelete, handleSelectAll, handleClick } from './handler';
import { TrainerAPI } from '../../api/v1/courses/trainer/trainer';

import {
  IconRefresh,
  IconReceipt,
  IconTrash,
  IconMail,
  IconEye
} from "@tabler/icons-react";
import Pagination from '../pagination/pagination';
import { useDOMPurify } from '../../hooks/useDompurify';
// import DOMPurify from 'isomorphic-dompurify';

const DOMPurify = useDOMPurify();

const fetchNotificationsData = async (page: number) => {
  const { data } = await TrainerAPI.getNotification(page);
  return data;
};

const NotificationsHeader = ({ totalUnseen, onRefresh, onRead, onDelete, onSelectAll, isAllSelected }) => (
  <div className={styles.header}>
    <div>
      <Title order={4} className='m-0'><IconMail /> Notifications {totalUnseen > 0 && <span>({totalUnseen})</span>}</Title>
    </div>
    <div>
      <Tooltip label='Refresh'><ActionIcon variant="filled" onClick={onRefresh}><IconRefresh /></ActionIcon></Tooltip>
      <Tooltip label='Mark as read'><ActionIcon variant="filled" color="indigo" onClick={onRead}><IconReceipt /></ActionIcon></Tooltip>
      <Tooltip label='Delete'><ActionIcon variant="filled" color="red" onClick={onDelete}><IconTrash /></ActionIcon></Tooltip>
      <Checkbox ml={'sm'} onChange={onSelectAll} checked={isAllSelected} />
    </div>
  </div>
);

const NotificationItem = ({ notification, isSelected, onClick, onCheckboxChange }) => (
  <li className='d-flex align-items-center gap-2'>
    <div
      className={`${styles.notification} ${!notification?.seen && styles.unseen} ${isSelected && styles.selected}`}
      onClick={onClick}
    >
      <div className={styles.icon}>
        {notification?.seen ? <IconEye /> : <IconMail />}
      </div>
      <div className={styles.content}>
        <p className='m-0'><strong>{elapsedTime(notification.createdAt)}</strong></p>
        <Text
          lineClamp={3}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(decodeURI(notification.message)),
          }}
        />
      </div>
    </div>
    <Checkbox onChange={onCheckboxChange} checked={isSelected} />
  </li>
);

const NotificationsList = ({ notifications, selected, onNotificationClick, onCheckboxChange }) => (
  <ul>
    {notifications.map((notification: any, index: React.Key) => (
      <NotificationItem
        key={index}
        notification={notification}
        isSelected={selected.includes(index)}
        onClick={() => onNotificationClick(index)} // Passing index properly
        onCheckboxChange={() => onCheckboxChange(index)} // Passing index properly
      />
    ))}
  </ul>
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
    <div className='p-2'>
      <div className={styles.container}>
        <NotificationsHeader
          totalUnseen={totalUnseen}
          onRefresh={() => handleRefresh(setNotifications, setLoading, setPage, setSelected, fetchNotificationsData, setTotalUnseen)}
          onRead={() => handleRead(selected, notifications, setNotifications, setTotalUnseen, setSelected)} // Pass required args
          onDelete={() => handleDelete(selected, notifications, setNotifications, setTotalUnseen, setSelected)} // Pass required args
          onSelectAll={() => handleSelectAll(selected, notifications, setSelected)} // Pass required args
          isAllSelected={selected.length === notifications.length}
        />
        <div className={styles.notifications}>
          <NotificationsList
            notifications={notifications}
            selected={selected}
            onNotificationClick={(index) => handleClick(index, setSelected)} // Pass the required args
            onCheckboxChange={(index) => handleClick(index, setSelected)} // Pass the required args
          />

          <div className="col-lg-12 col-md-12">
            <Pagination
              nPages={nPages}
              currentPage={page}
              setCurrentPage={setPage}
            />
          </div>
          {notifications.length === 0 && !loading && (
            <div>
              <div className='text-center'>
                <Image
                  src="https://ik.imagekit.io/freecodez/bell.webp"
                  width={300}
                  height={300}
                  alt='empty-notification'
                  style={{ height: 'auto', width: '200px' }}
                />
              </div>
              <h4 className='text-center'>No Notification Yet</h4>
              <p className='text-center'>You have no notification right now, come back later.</p>
            </div>
          )}
        </div>
        {loading && (
          <div className='p-3'>
            {[...Array(5).keys()].map(i => <Skeleton key={i} width="100%" height={50} radius="sm" my={5} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
