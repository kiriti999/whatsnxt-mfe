// components/Consulting/sections/ExpertiseSection.tsx

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
    Button,
    ThemeIcon,
    Progress
} from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';

interface Skill {
    name: string;
    level: number;
}

interface ExpertiseSectionProps {
    expertise: Skill[];
}

export function ExpertiseSection({ expertise }: ExpertiseSectionProps) {
    return (
        <Box className="expertise-section" py={80}>
            <Container size="xl">
                <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="xl">
                            <Badge
                                size="lg"
                                variant="light"
                                color="grape"
                                className="section-badge"
                            >
                                Technical Expertise
                            </Badge>
                            <Title
                                order={2}
                                size="2.5rem"
                                fw={600}
                                className="section-title"
                            >
                                Deep Technical Knowledge Across the Stack
                            </Title>
                            <Text size="lg" c="dimmed">
                                Our consultants bring years of hands-on experience across modern technologies,
                                architectures, and development practices.
                            </Text>

                            <Stack gap="md">
                                {expertise.map((skill, index) => (
                                    <Paper
                                        key={index}
                                        p="md"
                                        radius="md"
                                        className="skill-card"
                                    >
                                        <Group justify="apart" mb="xs">
                                            <Text size="sm" fw={500} c="white">{skill.name}</Text>
                                            <Text size="sm" fw={700} c="blue.4">{skill.level}%</Text>
                                        </Group>
                                        <Progress
                                            value={skill.level}
                                            size="sm"
                                            radius="xl"
                                            className="skill-progress"
                                        />
                                    </Paper>
                                ))}
                            </Stack>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Card
                            shadow="xl"
                            radius="lg"
                            p="xl"
                            className="cta-card gradient-card"
                        >
                            <Stack gap="xl">
                                <Group>
                                    <ThemeIcon
                                        size={50}
                                        radius="lg"
                                        variant="gradient"
                                        gradient={{ from: 'blue', to: 'grape' }}
                                    >
                                        <IconRocket size={25} />
                                    </ThemeIcon>
                                    <div>
                                        <Title order={3} c="white">
                                            Ready to Transform?
                                        </Title>
                                        <Text c="dimmed">
                                            Let's discuss your technical challenges
                                        </Text>
                                    </div>
                                </Group>
                                <Text c="dimmed">
                                    Schedule a free consultation to explore how we can help accelerate
                                    your development capabilities and achieve your technical goals.
                                </Text>
                                <Button
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'grape' }}
                                    size="md"
                                    fullWidth
                                    className="cta-button"
                                >
                                    Schedule Consultation
                                </Button>
                            </Stack>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}