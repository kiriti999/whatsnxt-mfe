import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Anchor, Divider, LoadingOverlay, Tooltip } from '@mantine/core';
import {
  Card,
  Text,
  Badge,
  Group,
} from '@mantine/core';

function CourseCard({ course }: ICourseCard) {
  const [loading, setLoading] = useState(false);

  const handleNavigation = () => {
    setLoading(true);
  };

  const limitWords = (text: string, maxWords: number) => {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
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

      {/* course Card */}
      {course && (
        <Tooltip label={course.courseName} position="bottom">
          <Anchor component={Link} href={`/content/${course.slug}`}>
            <Card padding="xs" radius="md" withBorder onClick={handleNavigation}>
              <Card.Section>
                <Image priority
                  src={course.imageUrl}
                  alt={course.courseName}
                  width={300}
                  height={200}
                  sizes="(max-width: 480px) 300px, (max-width: 768px) 280px, 300px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAEQMhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyEH4Wan6hxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGxggbFdA0s5uGx=="
                />
              </Card.Section>
              <Card.Section>
                <Divider my={0} />
              </Card.Section>
              <Group justify="space-between" mt="md" mb="sm">
                <Badge color="pink">{course.categoryName}</Badge>
              </Group>
              <Text size="sm" mb="sm" lineClamp={2}>
                {course.courseName}
              </Text>
            </Card>
          </Anchor>
        </Tooltip>
      )}
    </>
  )
}

interface ICourseCard {
  course: {
    courseName: string;
    slug: string;
    categoryName: string;
    imageUrl: string;
    listed: boolean;
  };
}

export default CourseCard;