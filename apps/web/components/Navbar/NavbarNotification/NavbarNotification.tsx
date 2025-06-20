import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import styles from './NavbarNotification.module.css';
import { Anchor } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { TrainerAPI } from '../../../apis/v1/courses/trainer/trainer';

type NavbarNotificationProps = {
  user: any
}

export const NavbarNotification: FC<NavbarNotificationProps> = ({ user }) => {

  if (!user) {
    return null;
  }

  const { data } = useQuery({
    queryKey: ['navbar-notifications-icon'],
    queryFn: async () => {
      if (!user) return false;

      const response = await TrainerAPI.getNotification()
      return response.data;
    },
  });

  return (
    <div className={styles['option-item']}>
      <div className={styles['notification-btn']}>
        <Anchor component={Link} href="/notifications">
          <IconBell stroke={2} />
          <span className={styles['notification-item-count']}>{data?.totalUnseen}</span>
        </Anchor>
      </div>
    </div>
  );
};


