import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
  Avatar,
  Badge,
  Rating,
  Card,
  Text,
  Box,
  Group,
  Anchor,
} from '@mantine/core';

function CourseCard({ course }) {
  const discountedPrice = course?.discount > 0
    ? course.price - (course.price * course.discount) / 100
    : course.price;

  return (
    <Box mb={'md'}>
      <Card shadow="sm" padding={0} radius="md" withBorder>
        <Card.Section>
          <Link href={`/courses/${course.slug}`} style={{ display: 'block' }}>
            {course.imageUrl ? (
              <Image
                width={500}
                height={300}
                src={course.imageUrl}
                alt={course.courseName}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
            ) : (
              <Box p="xl" ta="center">
                <Avatar variant="light" radius="xl" size="md" mx="auto" />
              </Box>
            )}
          </Link>
        </Card.Section>

        <Box p="sm">
          <Text
            fw="bold"
            size="sm"
            lineClamp={1}
            mb="xs"
            title={course.courseName}
          >
            <Anchor
              component={Link}
              href={`/courses/${course.slug}`}
              c="inherit"
              td="none"
            >
              {course.courseName.length > 47
                ? `${course.courseName.slice(0, 47)}...`
                : course.courseName
              }
            </Anchor>
          </Text>

          <Group justify="space-between" align="center" mb="xs">
            <Box>
              {course?.discount > 0 ? (
                <Group gap="xs" align="center">
                  <Text fw="bold" size="sm">
                    ₹{discountedPrice}
                  </Text>
                  <Text
                    size="xs"
                    td="line-through"
                    c="dimmed"
                  >
                    ₹{course.price}
                  </Text>
                  <Text fw="bold" size="xs" c="green">
                    ({course.discount}%)
                  </Text>
                </Group>
              ) : (
                <Text fw="bold" size="sm">
                  ₹{course.price}
                </Text>
              )}
            </Box>

            {course?.purchaseCount > 0 && (
              <Badge color="yellow" size="sm">
                Best Seller
              </Badge>
            )}
          </Group>

          <Rating
            defaultValue={course.rating}
            fractions={2}
            size="xs"
            readOnly
          />
        </Box>
      </Card>
    </Box>
  );
}

export default CourseCard;