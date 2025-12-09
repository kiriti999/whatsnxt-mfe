import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Divider, LoadingOverlay } from '@mantine/core';
import {
  Card,
  Text,
  Badge,
  Group,
} from '@mantine/core';
import { useState } from 'react';

function TutorialCard({ tutorial }: ITutorialCard) {
  const [loading, setLoading] = useState(false);

  const handleNavigation = () => {
    setLoading(true);
  };

  return (
    <>
      {/* Overlay Loader */}
      {loading && (
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
      )}

      {tutorial && (
        <Anchor component={Link} href={`/content/${tutorial.slug}`}>
          <Card px={'xs'} py={0} radius="md" withBorder onClick={handleNavigation}>
            <Card.Section>
              <Image priority
                src={tutorial?.imageUrl}
                alt={tutorial.title}
                width={300}
                height={200}
                sizes="(max-width: 480px) 300px, (max-width: 768px) 280px, 300px"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAEQMhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEH4Wan6hxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGx=="
              />
            </Card.Section>
            <Card.Section>
              <Divider my={0} />
            </Card.Section>
            <Group justify="space-between" mt="md" mb="sm">
              <Badge color="pink">{tutorial.categoryName}</Badge>
            </Group>
            <Text size="sm" mb="sm" lineClamp={2}>
              {tutorial.title}
            </Text>
          </Card>
        </Anchor>
      )}
    </>
  )
}

// Added proper TypeScript interface
interface ITutorialCard {
  tutorial: {
    title: string;
    slug: string;
    categoryName: string;
    imageUrl: string;
    listed: boolean;
  };
}

export default TutorialCard;