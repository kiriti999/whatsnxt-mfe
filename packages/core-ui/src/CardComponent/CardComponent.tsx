import React from 'react';
import { Anchor, Card, Group, Text, Tooltip } from '@mantine/core';
import Link from 'next/link';
import { IconPhotoVideo, IconUserCheck } from '@tabler/icons-react';

export const CardComponent = ({ image, courseName, link, paidType, children }: ICardComponentProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" h={"100%"} withBorder pt={0}>
      <Card.Section style={{ overflow: 'hidden' }}>
        <Anchor component={Link} href={link} display={"block"} h={'100%'} style={{ position: "relative" }}>
          {image}
        </Anchor>
      </Card.Section>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Anchor component={Link} href={link} underline='never' style={{ textDecoration: 'none' }}>
          <Text fw={500} className="my-3" lineClamp={2} size='0.95rem' c={'black'}>
            {courseName}
          </Text>
        </Anchor>
        {paidType && (
          <Tooltip label={paidType === 'video' ? 'Video course' : 'Live training'}>
            <Group>
              {paidType === 'video' ? <IconPhotoVideo /> : <IconUserCheck />}
            </Group>
          </Tooltip>
        )}
      </div>
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