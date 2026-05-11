import { Container, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { fetchPublishedSystemDesigns } from "../../../fetcher/systemDesignServerQuery";
import { SystemDesignBrowseClient } from "./SystemDesignBrowseClient";

interface PageProps {
    searchParams: Promise<{ topic?: string; company?: string; difficulty?: string }>;
}

export default async function SystemDesignBrowsePage(props: PageProps) {
    const sp = await props.searchParams;
    const courses = await fetchPublishedSystemDesigns(60, {
        topic: sp.topic,
        company: sp.company,
        difficulty: sp.difficulty,
    });

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg" mb="xl">
                <Title order={2}>System design library</Title>
                <Text c="dimmed" maw={720}>
                    Filter published courses by topic tag, company, or difficulty. Tags are set by authors in the
                    system design editor.
                </Text>
                <Group gap="md">
                    <Link href="/system-design/topics">Topic map</Link>
                    <Link href="/interview-experiences">Interview experiences</Link>
                </Group>
            </Stack>
            <SystemDesignBrowseClient initialCourses={courses} initialFilters={sp} />
        </Container>
    );
}
