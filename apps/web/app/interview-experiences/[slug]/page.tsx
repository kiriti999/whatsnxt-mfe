import { Anchor, Avatar, Badge, Container, Divider, Group, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchInterviewExperienceBySlug } from "../../../fetcher/interviewExperienceServerQuery";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function InterviewExperienceDetailPage(props: PageProps) {
    const { slug } = await props.params;
    const doc = await fetchInterviewExperienceBySlug(slug);
    if (!doc) notFound();

    return (
        <Container size="md" py="xl">
            <Paper withBorder p="xl" radius="md" shadow="xs">
                <Stack gap="md">
                    <Group>
                        <Avatar src={doc.companyLogoUrl || undefined} size="lg" radius="md">
                            {doc.companyName?.slice(0, 1)}
                        </Avatar>
                        <div>
                            <Title order={3}>{doc.title}</Title>
                            <Text size="sm" c="dimmed">
                                {doc.companyName}
                                {doc.role ? ` · ${doc.role}` : ""}
                            </Text>
                        </div>
                    </Group>
                    {doc.tags?.length ? (
                        <Group gap="xs">
                            {doc.tags.map((t: string) => (
                                <Badge key={t} variant="light" color="indigo">
                                    {t}
                                </Badge>
                            ))}
                        </Group>
                    ) : null}
                    <Divider />
                    <Text component="pre" style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }} size="sm">
                        {doc.body}
                    </Text>
                    {doc.relatedCourseSlugs?.length ? (
                        <>
                            <Divider label="Related system design courses" />
                            <Group gap="xs">
                                {doc.relatedCourseSlugs.map((s: string) => (
                                    <Anchor key={s} component={Link} href={`/content/system-design/${s}`} size="sm">
                                        {s}
                                    </Anchor>
                                ))}
                            </Group>
                        </>
                    ) : null}
                    <Anchor component={Link} href="/interview-experiences" size="sm">
                        ← All experiences
                    </Anchor>
                </Stack>
            </Paper>
        </Container>
    );
}
