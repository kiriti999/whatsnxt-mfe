import React from 'react';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Stack,
    Grid,
    Badge,
    Box,
    Paper,
    ThemeIcon,
    SimpleGrid,
    Progress
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

interface TrainingTopic {
    name: string;
    popularity: number;
    icon: any;
}

interface TrainingSectionProps {
    trainingTopics: TrainingTopic[];
}

export function TrainingSection({ trainingTopics }: TrainingSectionProps) {
    const benefits = [
        "Customized curriculum based on your tech stack",
        "Hands-on workshops and practical exercises",
        "Progress tracking and skill assessments",
        "Ongoing mentorship and support"
    ];

    return (
        <Box className="training-section" py={80}>
            <Container size="xl">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Stack gap="xl">
                            <Badge
                                size="lg"
                                variant="light"
                                color="orange"
                                className="section-badge"
                            >
                                Corporate Training
                            </Badge>
                            <Title
                                order={2}
                                size="2.5rem"
                                fw={600}
                                className="section-title"
                            >
                                Empower Your Development Teams
                            </Title>
                            <Text size="lg" c="dimmed">
                                Our comprehensive training programs are designed to upskill your development teams
                                with the latest technologies and industry best practices.
                            </Text>

                            <Stack gap="sm">
                                {benefits.map((benefit, index) => (
                                    <Group key={index} gap="sm">
                                        <ThemeIcon size="sm" color="green" variant="light">
                                            <IconCheck size={12} />
                                        </ThemeIcon>
                                        <Text c="white">{benefit}</Text>
                                    </Group>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 7 }}>
                        <Card
                            shadow="lg"
                            radius="lg"
                            p="xl"
                            className="training-topics-card"
                        >
                            <Stack gap="lg">
                                <Title order={3} ta="center" mb="md" c="white">
                                    Popular Training Topics
                                </Title>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                    {trainingTopics.map((topic, index) => (
                                        <Paper
                                            key={index}
                                            p="lg"
                                            radius="md"
                                            className="topic-card"
                                        >
                                            <Group mb="md">
                                                <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                                                    <topic.icon size={20} />
                                                </ThemeIcon>
                                                <Text fw={500} c="white" size="sm" style={{ flex: 1 }}>
                                                    {topic.name}
                                                </Text>
                                            </Group>
                                            <Group gap="xs">
                                                <Progress
                                                    value={topic.popularity}
                                                    size="xs"
                                                    radius="xl"
                                                    style={{ flex: 1 }}
                                                    className="topic-progress"
                                                />
                                                <Text size="xs" fw={600} c="blue.4">
                                                    {topic.popularity}%
                                                </Text>
                                            </Group>
                                        </Paper>
                                    ))}
                                </SimpleGrid>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}