
import React from 'react';
import { Container, Grid, Card, Text, Badge, Button, Group, Stack, Title, GridCol, CardSection } from '@mantine/core';
import { IconEye, IconShoppingCart } from '@tabler/icons-react';

interface CourseData {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    image: string;
}

const courses: CourseData[] = [
    {
        id: '1',
        title: 'AI in Everyday Life',
        subtitle: 'AI in Everyday Life',
        description: 'A comprehensive guide to understanding and leveraging artificial intelligence in daily life and work.',
        level: 'Beginner',
        image: '/teacher.png'
    },
    {
        id: '2',
        title: 'AI in Business',
        subtitle: 'AI in Business',
        description: 'A comprehensive guide to implementing AI technologies in business environments to drive growth, efficiency, and innovation.',
        level: 'Intermediate',
        image: '/teacher.png'
    },
    {
        id: '3',
        title: 'AI in Sales',
        subtitle: 'AI in Sales',
        description: 'Master the use of AI technologies to transform your sales process, improve customer interactions, and close more deals.',
        level: 'Intermediate',
        image: '/teacher.png'
    },
    {
        id: '4',
        title: 'AI in Local Government',
        subtitle: 'AI in Local Government',
        description: 'Learn how to leverage AI technologies to transform public services, improve citizen engagement, and increase operational efficiency.',
        level: 'Intermediate',
        image: '/teacher.png'
    },
    {
        id: '5',
        title: 'AI for Human Resources',
        subtitle: 'AI for Human Resources',
        description: 'Leverage AI to transform HR processes, optimize talent management, and build future-ready workforce strategies.',
        level: 'Intermediate',
        image: '/teacher.png'
    },
    {
        id: '5',
        title: 'AI for App Development',
        subtitle: 'AI for App Development',
        description: 'Leverage AI to create websites, mobile apps, and fullstack applications',
        level: 'Intermediate',
        image: '/teacher.png'
    }
];

function CourseCard({ course }: { course: CourseData }) {
    const getBadgeColor = (level: string) => {
        switch (level) {
            case 'Beginner':
                return 'green';
            case 'Intermediate':
                return 'blue';
            case 'Advanced':
                return 'red';
            default:
                return 'gray';
        }
    };

    return (
        <Card
            py={0}
            shadow="sm"
            radius="md"
            withBorder
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <CardSection
                style={{
                    height: 200,
                    background: `linear-gradient(135deg, #2e3440 0%, #3b4252 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                <Text size="xl" fw={600} c="white" ta="center">
                    {course.title}
                </Text>
            </CardSection>

            <Stack gap="sm" style={{ flex: 1, padding: '1rem 0' }}>
                <Group justify="apart" align="flex-start">
                    <Title order={4} c="white" style={{ flex: 1 }}>
                        {course.subtitle}
                    </Title>
                    <Badge color={getBadgeColor(course.level)} variant="filled" size="sm">
                        {course.level}
                    </Badge>
                </Group>

                <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                    {course.description}
                </Text>

                <Group gap="xs" style={{ marginTop: 'auto' }}>
                    <Button
                        variant="outline"
                        leftSection={<IconEye size={16} />}
                        color="gray"
                        size="sm"
                        style={{ flex: 1 }}
                    >
                        Preview
                    </Button>
                    <Button
                        leftSection={<IconShoppingCart size={16} />}
                        color="green"
                        size="sm"
                        style={{ flex: 1 }}
                    >
                        Get Access
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}

function LearnAI() {
    return (
        <Container size="xl" py="xl">
            <Title order={1} ta="center" mb="xl" c="#3a3c3e">
                Learn AI
            </Title>
            <Title order={5} ta="center" mb="md" c="#3a3c3e">
                Expand your AI knowledge with our comprehensive self-guided courses
            </Title>

            <Grid>
                {courses.map((course) => (
                    <GridCol key={course.id} span={{ base: 12, sm: 6, md: 4 }}>
                        <CourseCard course={course} />
                    </GridCol>
                ))}
            </Grid>
        </Container>
    );
}

export default LearnAI;
