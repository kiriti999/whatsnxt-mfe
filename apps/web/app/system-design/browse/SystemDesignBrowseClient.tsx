"use client";

import {
    Badge,
    Button,
    Group,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    UnstyledButton,
} from "@mantine/core";
import { IconServer2 } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

export type BrowseCourse = {
    _id: string;
    title: string;
    slug: string;
    category: string;
    topics?: string[];
    companies?: { name: string; logoUrl?: string }[];
    difficulty?: string;
    interviewFrequency?: string;
};

export function SystemDesignBrowseClient({
    initialCourses,
    initialFilters,
}: {
    initialCourses: BrowseCourse[];
    initialFilters: { topic?: string; company?: string; difficulty?: string };
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [topic, setTopic] = useState(initialFilters.topic || "");
    const [company, setCompany] = useState(initialFilters.company || "");
    const [difficulty, setDifficulty] = useState<string | null>(initialFilters.difficulty || null);

    const applyFilters = useCallback(() => {
        const q = new URLSearchParams();
        if (topic.trim()) q.set("topic", topic.trim());
        if (company.trim()) q.set("company", company.trim());
        if (difficulty) q.set("difficulty", difficulty);
        startTransition(() => {
            router.push(`/system-design/browse?${q.toString()}`);
        });
    }, [topic, company, difficulty, router]);

    const courses = useMemo(() => initialCourses || [], [initialCourses]);

    return (
        <Stack gap="md">
            <Paper withBorder p="md" radius="md">
                <Stack gap="sm">
                    <Group grow align="flex-end">
                        <TextInput label="Topic contains" placeholder="load-balancing" value={topic} onChange={(e) => setTopic(e.currentTarget.value)} />
                        <TextInput label="Company contains" placeholder="Amazon" value={company} onChange={(e) => setCompany(e.currentTarget.value)} />
                        <Select
                            label="Difficulty"
                            placeholder="Any"
                            clearable
                            data={[
                                { value: "easy", label: "Easy" },
                                { value: "medium", label: "Medium" },
                                { value: "hard", label: "Hard" },
                            ]}
                            value={difficulty}
                            onChange={setDifficulty}
                        />
                    </Group>
                    <Button loading={isPending} onClick={applyFilters} w="fit-content">
                        Apply filters
                    </Button>
                </Stack>
            </Paper>

            {courses.length === 0 ? (
                <Text c="dimmed">No published courses match these filters.</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                    {courses.map((c) => (
                        <UnstyledButton
                            key={c._id}
                            component={Link}
                            href={`/content/system-design/${c.slug}`}
                            style={{ textAlign: "left" }}
                        >
                            <Paper withBorder p="md" radius="md" h="100%" shadow="sm">
                                <Group gap="xs" mb="xs">
                                    <IconServer2 size={16} color="var(--mantine-color-blue-6)" />
                                    <Text size="xs" c="blue" fw={700} tt="uppercase">
                                        {c.category}
                                    </Text>
                                </Group>
                                <Title order={5}>{c.title}</Title>
                                <Group gap={6} mt="xs">
                                    {c.difficulty ? (
                                        <Badge size="xs" variant="light" color="grape">
                                            {c.difficulty}
                                        </Badge>
                                    ) : null}
                                    {c.interviewFrequency ? (
                                        <Badge size="xs" variant="outline" color="gray">
                                            freq: {c.interviewFrequency}
                                        </Badge>
                                    ) : null}
                                </Group>
                                {c.topics && c.topics.length > 0 && (
                                    <Group gap={4} mt="sm">
                                        {c.topics.slice(0, 4).map((t) => (
                                            <Badge key={t} size="xs" variant="dot" color="cyan">
                                                {t}
                                            </Badge>
                                        ))}
                                        {c.topics.length > 4 ? (
                                            <Text size="xs" c="dimmed">
                                                +{c.topics.length - 4}
                                            </Text>
                                        ) : null}
                                    </Group>
                                )}
                            </Paper>
                        </UnstyledButton>
                    ))}
                </SimpleGrid>
            )}
        </Stack>
    );
}
