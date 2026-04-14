"use client";

import { Stack, Title, SimpleGrid, Paper, Text, Group, Badge } from "@mantine/core";
import { useResumeStore } from "../../store";
import { TEMPLATES } from "../../types";

export function TemplateSelector() {
    const { resume, setTemplateId } = useResumeStore();

    return (
        <Stack gap="sm" p="lg" pb={0}>
            <Title order={5}>Template</Title>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                {TEMPLATES.map((template) => (
                    <Paper
                        key={template.id}
                        p="sm"
                        withBorder
                        onClick={() => setTemplateId(template.id)}
                        style={{
                            cursor: "pointer",
                            borderColor:
                                resume.templateId === template.id
                                    ? "var(--mantine-primary-color-filled)"
                                    : undefined,
                            borderWidth: resume.templateId === template.id ? 2 : 1,
                        }}
                    >
                        <Group gap="xs">
                            <div
                                style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 4,
                                    background: template.accentColor,
                                }}
                            />
                            <Text size="sm" fw={600}>
                                {template.name}
                            </Text>
                        </Group>
                        <Text size="xs" c="dimmed" mt={4}>
                            {template.description}
                        </Text>
                        {resume.templateId === template.id && (
                            <Badge size="xs" mt="xs">
                                Active
                            </Badge>
                        )}
                    </Paper>
                ))}
            </SimpleGrid>
        </Stack>
    );
}
