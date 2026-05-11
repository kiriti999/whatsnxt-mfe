import { Anchor, Badge, Container, Divider, Group, List, Paper, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import { FAANG_SYSTEM_DESIGN_PILLARS } from "../../../lib/faangSystemDesignTopics";

export default function SystemDesignTopicsPage() {
    return (
        <Container size="lg" py="xl">
            <Stack gap="md" mb="xl">
                <Title order={2}>FAANG-style system design topic map</Title>
                <Text c="dimmed" maw={800}>
                    These pillars mirror what large tech companies probe in system design interviews. Each tag links to
                    the browse view filtered by that topic slug — tag your courses in the editor so they appear here.
                </Text>
                <Anchor component={Link} href="/system-design/browse" fw={600}>
                    Open full browse →
                </Anchor>
                <Anchor component={Link} href="/interview-experiences" fw={600}>
                    Read interview experiences →
                </Anchor>
            </Stack>

            <Stack gap="xl">
                {FAANG_SYSTEM_DESIGN_PILLARS.map((pillar) => (
                    <Paper key={pillar.id} withBorder p="lg" radius="md" shadow="xs">
                        <Stack gap="sm">
                            <Title order={4}>{pillar.title}</Title>
                            <Text size="sm" c="dimmed">
                                {pillar.description}
                            </Text>
                            <Divider />
                            <List spacing="xs" size="sm" withPadding>
                                {pillar.topics.map((t) => (
                                    <List.Item key={t.id}>
                                        <Group gap="xs" wrap="wrap">
                                            <Anchor component={Link} href={`/system-design/browse?topic=${encodeURIComponent(t.id)}`} fw={600}>
                                                {t.label}
                                            </Anchor>
                                            <Text c="dimmed" span>
                                                — {t.blurb}
                                            </Text>
                                            <Badge size="xs" variant="light" color="cyan">
                                                tag: {t.id}
                                            </Badge>
                                        </Group>
                                    </List.Item>
                                ))}
                            </List>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}
