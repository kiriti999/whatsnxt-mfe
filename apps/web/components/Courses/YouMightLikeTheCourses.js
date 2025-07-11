import React from 'react';
import Link from 'next/link';
import {
  Anchor,
  Box,
  Title,
  Container,
  Grid,
  Card,
  Text,
  Group,
  Avatar,
  ActionIcon,
  Badge
} from '@mantine/core';
import { IconHeart, IconNote, IconUsers } from '@tabler/icons-react';
import Image from 'next/image';

const YouMightLikeTheCourses = () => {
  const coursesData = [
    {
      id: 1,
      image: "/images/courses/courses1.jpg",
      price: "$39",
      authorImage: "/images/user1.jpg",
      authorName: "Alex Morgan",
      title: "The Data Science Course 2020: Complete Data Science Bootcamp",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
      lessons: 15,
      students: 145
    },
    {
      id: 2,
      image: "/images/courses/courses2.jpg",
      price: "$49",
      authorImage: "/images/user2.jpg",
      authorName: "Sarah Taylor",
      title: "Java Programming MasterclassName for Software Developers",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
      lessons: 20,
      students: 100
    },
    {
      id: 3,
      image: "/images/courses/courses3.jpg",
      price: "$59",
      authorImage: "/images/user3.jpg",
      authorName: "David Warner",
      title: "Deep Learning A-Z™: Hands-On Artificial Neural Networks",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.",
      lessons: 20,
      students: 150
    }
  ];

  return (
    <Box bg="#f8f9f8" py="xl">
      <Container>
        <Box mw={720} mx="auto" mb={55} ta="center">
          <Title mw={615} mb={0} mx="auto" size="xl" fw={800} order={2}>
            More Courses You Might Like
          </Title>
        </Box>

        <Grid>
          {coursesData.map((course, index) => (
            <Grid.Col
              key={course.id}
              span={{ base: 12, md: 6, lg: 4 }}
              offset={{ base: 0, md: index === 2 ? 3 : 0, lg: 0 }}
            >
              <Card shadow="sm" padding={0} radius="md" withBorder>
                <Card.Section pos="relative">
                  <Anchor
                    component={Link}
                    href="/single-courses-1"
                    style={{ display: 'block' }}
                  >
                    <Image
                      width={500}
                      height={300}
                      src={course.image}
                      alt="course image"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  </Anchor>

                  <ActionIcon
                    variant="white"
                    size="lg"
                    radius="xl"
                    pos="absolute"
                    top={15}
                    right={15}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    <IconHeart size={18} />
                  </ActionIcon>

                  <Badge
                    size="lg"
                    pos="absolute"
                    bottom={15}
                    left={15}
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  >
                    {course.price}
                  </Badge>
                </Card.Section>

                <Box p="md">
                  <Group mb="sm" gap="sm">
                    <Avatar
                      src={course.authorImage}
                      size="sm"
                      radius="xl"
                    />
                    <Text size="sm" c="dimmed">
                      {course.authorName}
                    </Text>
                  </Group>

                  <Title order={3} size="md" mb="sm" lineClamp={2}>
                    <Anchor
                      component={Link}
                      href="/single-courses-1"
                      c="inherit"
                      td="none"
                    >
                      {course.title}
                    </Anchor>
                  </Title>

                  <Text size="sm" c="dimmed" mb="md" lineClamp={3}>
                    {course.description}
                  </Text>

                  <Group justify="space-between" align="center">
                    <Group gap="xs" align="center">
                      <IconNote size={16} />
                      <Text size="sm">{course.lessons} Lessons</Text>
                    </Group>
                    <Group gap="xs" align="center">
                      <IconUsers size={16} />
                      <Text size="sm">{course.students} Students</Text>
                    </Group>
                  </Group>
                </Box>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default YouMightLikeTheCourses;