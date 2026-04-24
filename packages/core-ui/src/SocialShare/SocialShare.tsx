import React, { FC } from 'react';
import { ActionIcon, Group, Paper, Text } from '@mantine/core';

import {
  IconCopy,
  IconBrandWhatsapp,
  IconShare,
} from "@tabler/icons-react";
import { notifications } from '@mantine/notifications';
import Link from 'next/link';

type SocialShareProps = {
  // Define your component props here
  url: string
}

export const SocialShare: FC<SocialShareProps> = ({ url }) => {
  return (

    <Paper
      p="xs"
      radius="md"
      withBorder
      mt="md"
      style={{
        borderColor: 'var(--mantine-color-gray-3)'
      }}
    >
      <Group gap="md" justify="center" align="center">
        <Group gap="xs">
          <IconShare size={20} />
          <Text fw={600} size="sm">Share this course</Text>
        </Group>

        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            radius="md"
            onClick={(event) => {
              event.preventDefault();
              navigator.clipboard.writeText(url);
              notifications.show({
                position: 'bottom-right',
                title: 'Link Copied',
                message: 'Course link copied to clipboard!',
                color: 'green'
              });
            }}
            title="Copy link"
          >
            <IconCopy size={20} stroke={1.5} />
          </ActionIcon>

          <ActionIcon
            component={Link}
            href={`https://wa.me/?text=${encodeURIComponent(url)}`}
            target="_blank"
            variant="subtle"
            color="teal"
            size="xl"
            radius="md"
            title="Share on WhatsApp"
          >
            <IconBrandWhatsapp size={20} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
};
