"use client";

import {
    Badge,
    Box,
    Button,
    Container,
    Group,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
    UnstyledButton,
} from "@mantine/core";
import { IconArrowRight, IconServer2 } from "@tabler/icons-react";
import Link from "next/link";
import styles from "./TopSystemDesign.module.css";

interface SystemDesignItem {
    _id: string;
    title: string;
    slug: string;
    category: string;
    sections: { key: string; title: string }[];
    diagrams: { key: string; title: string }[];
    status: string;
    difficulty?: string;
    topics?: string[];
}

interface TopSystemDesignProps {
    systemDesigns: SystemDesignItem[];
}

const MAX_ITEMS = 8;

const TopSystemDesign = ({ systemDesigns }: TopSystemDesignProps) => {
    if (!systemDesigns || systemDesigns.length === 0) return null;

    const visible = systemDesigns.slice(0, MAX_ITEMS);

    return (
        <Box className={styles.section} my="4.5rem">
            <Container size="xl">
                {/* Mobile header */}
                <Stack align="center" gap={4} mb="xl" hiddenFrom="sm">
                    <Group gap={6}>
                        <IconServer2 size={12} color="var(--mantine-color-blue-6)" />
                        <Text size="xs" fw={700} tt="uppercase" c="blue" style={{ letterSpacing: "0.08em" }}>
                            Interview Prep
                        </Text>
                    </Group>
                    <Title order={5} ta="center" fw={700}>
                        System Design
                    </Title>
                    <Group gap="xs">
                        <Button
                            component={Link}
                            href="/system-design/browse"
                            variant="light"
                            color="blue"
                            size="xs"
                            rightSection={<IconArrowRight size={13} />}
                        >
                            Browse
                        </Button>
                        <Button
                            component={Link}
                            href="/system-design/topics"
                            variant="subtle"
                            color="blue"
                            size="xs"
                        >
                            Topics
                        </Button>
                        <Button
                            component={Link}
                            href="/history/table"
                            variant="subtle"
                            color="blue"
                            size="xs"
                            rightSection={<IconArrowRight size={13} />}
                        >
                            View all
                        </Button>
                    </Group>
                </Stack>

                {/* Desktop header */}
                <Box pos="relative" mb="xl" visibleFrom="sm">
                    <Stack align="center" gap={2}>
                        <Group gap={6}>
                            <IconServer2 size={12} color="var(--mantine-color-blue-6)" />
                            <Text
                                size="xs"
                                fw={700}
                                tt="uppercase"
                                c="blue"
                                style={{ letterSpacing: "0.08em" }}
                            >
                                Interview Prep
                            </Text>
                        </Group>
                        <Title order={5} ta="center" fw={700}>
                            System Design
                        </Title>
                    </Stack>
                    <Group gap="xs" pos="absolute" right={0} top="50%" style={{ transform: "translateY(-50%)" }}>
                        <Button component={Link} href="/system-design/browse" variant="light" color="blue" size="xs">
                            Browse
                        </Button>
                        <Button component={Link} href="/system-design/topics" variant="subtle" color="blue" size="xs">
                            Topics
                        </Button>
                        <Button
                            component={Link}
                            href="/history/table"
                            variant="subtle"
                            color="blue"
                            size="xs"
                            rightSection={<IconArrowRight size={13} />}
                        >
                            View all
                        </Button>
                    </Group>
                </Box>

                <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {visible.map((item) => (
                        <UnstyledButton
                            key={item._id}
                            className={styles.card}
                            component={Link}
                            href={`/content/system-design/${item.slug}`}
                        >
                            <div className={styles.cardTop}>
                                <ThemeIcon size={28} radius="md" variant="light" color="blue">
                                    <IconServer2 size={16} />
                                </ThemeIcon>
                                <Text size="xs" fw={600} c="blue">
                                    {item.category}
                                </Text>
                            </div>

                            <div className={styles.cardBody}>
                                <Text className={styles.cardName}>{item.title}</Text>
                                <Group gap={4} mt={4}>
                                    {item.difficulty ? (
                                        <Badge size="xs" variant="light" color="grape">
                                            {item.difficulty}
                                        </Badge>
                                    ) : null}
                                    <Badge size="xs" variant="light" color="gray">
                                        {item.sections?.length || 0} sections
                                    </Badge>
                                    <Badge size="xs" variant="light" color="gray">
                                        {item.diagrams?.length || 0} diagrams
                                    </Badge>
                                </Group>
                                {item.topics && item.topics.length > 0 && (
                                    <Group gap={4} mt={6}>
                                        {item.topics.slice(0, 3).map((t) => (
                                            <Badge key={t} size="xs" variant="dot" color="cyan">
                                                {t}
                                            </Badge>
                                        ))}
                                    </Group>
                                )}
                            </div>

                            <div className={styles.cardFooter}>
                                <Text size="xs" c="dimmed">
                                    System Design
                                </Text>
                                <Text size="xs" c="blue" fw={600}>
                                    Read →
                                </Text>
                            </div>
                        </UnstyledButton>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
};

export default TopSystemDesign;
