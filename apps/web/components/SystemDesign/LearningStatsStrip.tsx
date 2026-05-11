"use client";

import { Container, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconChartBar, IconMessages, IconServer2 } from "@tabler/icons-react";

export type SystemDesignPublicStats = {
    publishedCourses: number;
    publishedInterviewExperiences: number;
    completedPracticeSessions: number;
};

export function LearningStatsStrip({ stats }: { stats: SystemDesignPublicStats }) {
    const items = [
        {
            label: "Published system design courses",
            value: stats.publishedCourses,
            icon: IconServer2,
            color: "blue" as const,
        },
        {
            label: "Interview experiences",
            value: stats.publishedInterviewExperiences,
            icon: IconMessages,
            color: "indigo" as const,
        },
        {
            label: "Completed practice sessions",
            value: stats.completedPracticeSessions,
            icon: IconChartBar,
            color: "teal" as const,
        },
    ];

    return (
        <Container size="xl" px={{ base: "md", sm: "lg" }} mb="lg">
            <Paper withBorder radius="md" p={{ base: "sm", sm: "md" }} shadow="xs">
                {/* Equal-width columns so the middle stat is truly centered vs siblings */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={{ base: "lg", sm: "xl" }} verticalSpacing={{ base: "md", sm: 0 }}>
                    {items.map((it) => (
                        <Group
                            key={it.label}
                            gap="sm"
                            wrap="nowrap"
                            justify={{ base: "flex-start", sm: "center" }}
                            align="center"
                            miw={0}
                        >
                            <ThemeIcon variant="light" color={it.color} size="lg" radius="md" flex="0 0 auto">
                                <it.icon size={18} />
                            </ThemeIcon>
                            <Stack gap={0} miw={0} style={{ flex: "1 1 auto" }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700} lh={1.3}>
                                    {it.label}
                                </Text>
                                <Title order={3} lh={1.2}>
                                    {it.value.toLocaleString()}
                                </Title>
                            </Stack>
                        </Group>
                    ))}
                </SimpleGrid>
            </Paper>
        </Container>
    );
}
