import { Container, Group, Stack, Text, Title } from "@mantine/core";
import { TextNavLink } from "../../../components/TextNavLink";
import { fetchPublishedSystemDesigns } from "../../../fetcher/systemDesignServerQuery";
import { SystemDesignBrowseClient } from "./SystemDesignBrowseClient";

/** Query-string filters must hit the server each request (avoid stale cached empty lists). */
export const dynamic = "force-dynamic";

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
                    <TextNavLink href="/system-design/topics">Topic map</TextNavLink>
                    <TextNavLink href="/courses">Browse courses</TextNavLink>
                    <TextNavLink href="/interview-experiences">Interview experiences</TextNavLink>
                    <TextNavLink href="/labs">Hands-on labs</TextNavLink>
                </Group>
            </Stack>
            <SystemDesignBrowseClient initialCourses={courses} initialFilters={sp} />
        </Container>
    );
}
