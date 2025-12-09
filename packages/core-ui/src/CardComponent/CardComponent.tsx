import React from 'react';
import { Anchor, Card, Flex, Group, Text, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { IconPhotoVideo, IconUserCheck } from '@tabler/icons-react';

export const CardComponent = ({ image, courseName, link, paidType, children }: ICardComponentProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" h={"100%"} withBorder pt={0} style={{ display: 'flex', flexDirection: 'column' }}>
      <Card.Section style={{ overflow: 'hidden' }}>
        <Anchor component={Link} href={link} display={"block"} h={'100%'} style={{ position: "relative" }}>
          {image}
        </Anchor>
      </Card.Section>
      <Flex justify="space-between" align="center" h={55} mt="sm">
        <Anchor component={Link} href={link} underline='never' style={{ textDecoration: 'none', flex: 1 }}>
          <Text fw={500} lineClamp={2} c="var(--mantine-color-text)" title={courseName}>
            {courseName}
          </Text>
        </Anchor>
        {paidType && (
          <Tooltip label={paidType === 'video' ? 'Video course' : 'Live training'}>
            <Group ml="xs">
              {paidType === 'video' ? <IconPhotoVideo /> : <IconUserCheck />}
            </Group>
          </Tooltip>
        )}
      </Flex>
      {children}
    </Card >
  );
};

interface ICardComponentProps {
  courseName: string;
  link: string;
  image: React.ReactNode;
  paidType?: 'video' | 'live';
  children: React.ReactNode;
}