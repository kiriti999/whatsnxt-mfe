import React from 'react';
import {
    Container,
    Title,
    Text,
    Button,
    Group,
    Stack,
    Grid,
    Badge,
    Box,
    Paper,
    ThemeIcon,
    SimpleGrid,
    Center,
    Avatar
} from '@mantine/core';
import { IconArrowRight, IconCode } from '@tabler/icons-react';

interface HeroSectionProps {
    stats: Array<{
        number: string;
        label: string;
        icon: any;
    }>;
}

export function HeroSection({ stats }: HeroSectionProps) {
    return (
        <Box className="hero-section">
            <Container size="xl" py={100}>
                <Grid align="center" gutter={60}>
                    <Grid.Col span={{ base: 12, lg: 8 }}>
                        <Stack gap="xl">
                            <Badge
                                size="lg"
                                variant="light"
                                color="blue"
                                className="hero-badge"
                            >
                                🚀 Software Engineering Consulting
                            </Badge>

                            <Title
                                order={1}
                                size="4rem"
                                fw={900}
                                className="hero-title"
                            >
                                Elevate Your Technical Excellence
                            </Title>

                            <Text size="xl" className="hero-description">
                                Transform your development capabilities with expert consulting in
                                <Text component="span" fw={600} c="blue.4"> software architecture</Text>,
                                <Text component="span" fw={600} c="grape.4"> skill development</Text>, and
                                <Text component="span" fw={600} c="teal.4"> corporate training</Text>.
                            </Text>

                            <Group gap="lg">
                                <Button
                                    size="lg"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'grape' }}
                                    rightSection={<IconArrowRight size={18} />}
                                    className="cta-button"
                                >
                                    Get Started
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    color="white"
                                    className="outline-button"
                                >
                                    View Our Work
                                </Button>
                            </Group>

                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="xl">
                                {stats.map((stat, index) => (
                                    <Paper
                                        key={index}
                                        p="md"
                                        className="stat-card"
                                    >
                                        <ThemeIcon size="lg" variant="light" color="blue" mb="xs" mx="auto">
                                            <stat.icon size={20} />
                                        </ThemeIcon>
                                        <Text size="xl" fw={700} c="white" ta="center">
                                            {stat.number}
                                        </Text>
                                        <Text size="sm" c="dimmed" ta="center">
                                            {stat.label}
                                        </Text>
                                    </Paper>
                                ))}
                            </SimpleGrid>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, lg: 4 }}>
                        <Center>
                            <Avatar
                                size={250}
                                className="hero-avatar"
                            >
                                <IconCode size={120} color="white" />
                            </Avatar>
                        </Center>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}