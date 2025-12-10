import React, { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ActionIcon, Indicator, rem } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { TrainerAPI } from '../../../apis/v1/courses/trainer/trainer';

type NavbarNotificationProps = {
  user: any;
  iconSize?: number | string;
  buttonSize?: string;
}

export const NavbarNotification: FC<NavbarNotificationProps> = ({ user, iconSize = 24, buttonSize = "lg" }) => {

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
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <ActionIcon
      component={Link}
      href="/notifications"
      variant="transparent"
      size={buttonSize}
      style={{
        color: 'var(--mantine-color-text)',
        overflow: 'visible'
      }}
    >
      <Indicator
        inline
        label={data?.totalUnseen || 0}
        size={16}
        offset={-4}
        color="red"
        radius="xl"
        disabled={!data?.totalUnseen}
        withBorder
        styles={{ indicator: { padding: '0 6px' } }}
      >
        <IconBell stroke={1.5} style={{ width: rem(iconSize), height: rem(iconSize) }} />
      </Indicator>
    </ActionIcon>
  );
};
