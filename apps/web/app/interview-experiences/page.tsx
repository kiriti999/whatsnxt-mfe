import { Avatar, Badge, Container, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { TextNavLink } from "../../components/TextNavLink";
import { fetchPublishedInterviewExperiences } from "../../fetcher/interviewExperienceServerQuery";

export default async function InterviewExperiencesListPage() {
    const items = await fetchPublishedInterviewExperiences(48);

    return (
        <Container size="xl" py="xl">
            <Stack gap="md" mb="xl">
                <Title order={2}>Interview experiences</Title>
                <Text c="dimmed" maw={720}>
                    Real-style interview write-ups tagged by company and round type. Pair with{" "}
                    <TextNavLink href="/system-design/topics" fw="inherit">
                        the topic map
                    </TextNavLink>{" "}
                    and{" "}
                    <TextNavLink href="/system-design/browse" fw="inherit">
                        course browse
                    </TextNavLink>
                    .
                </Text>
            </Stack>

            {items.length === 0 ? (
                <Text c="dimmed">No published experiences yet.</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                    {items.map((row: { _id: string; slug: string; title: string; companyName: string; companyLogoUrl?: string; role?: string; tags?: string[] }) => (
                        <Link key={row._id} href={`/interview-experiences/${row.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <Paper withBorder radius="md" p="md" h="100%" shadow="xs">
                                <Group align="flex-start" wrap="nowrap" gap="sm">
                                    <Avatar src={row.companyLogoUrl || undefined} radius="sm" size="md">
                                        {row.companyName?.slice(0, 1)}
                                    </Avatar>
                                    <Stack gap={4} style={{ minWidth: 0 }}>
                                        <Text fw={700} size="sm" lineClamp={2}>
                                            {row.title}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {row.companyName}
                                            {row.role ? ` · ${row.role}` : ""}
                                        </Text>
                                        {row.tags && row.tags.length > 0 && (
                                            <Group gap={4}>
                                                {row.tags.slice(0, 4).map((t) => (
                                                    <Badge key={t} size="xs" variant="light">
                                                        {t}
                                                    </Badge>
                                                ))}
                                            </Group>
                                        )}
                                    </Stack>
                                </Group>
                            </Paper>
                        </Link>
                    ))}
                </SimpleGrid>
            )}
        </Container>
    );
}
