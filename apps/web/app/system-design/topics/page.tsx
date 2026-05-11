import {
    Badge,
    Container,
    Divider,
    Group,
    List,
    ListItem,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { TextNavLink } from "../../../components/TextNavLink";
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
                <TextNavLink href="/system-design/browse">Open full browse →</TextNavLink>
                <TextNavLink href="/interview-experiences">Read interview experiences →</TextNavLink>
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
                                    <ListItem key={t.id}>
                                        <Group gap="xs" wrap="wrap">
                                            <TextNavLink href={`/system-design/browse?topic=${encodeURIComponent(t.id)}`}>
                                                {t.label}
                                            </TextNavLink>
                                            <Text c="dimmed" span>
                                                — {t.blurb}
                                            </Text>
                                            <Badge size="xs" variant="light" color="cyan">
                                                tag: {t.id}
                                            </Badge>
                                        </Group>
                                    </ListItem>
                                ))}
                            </List>
                        </Stack>
                    </Paper>
                ))}
            </Stack>
        </Container>
    );
}
