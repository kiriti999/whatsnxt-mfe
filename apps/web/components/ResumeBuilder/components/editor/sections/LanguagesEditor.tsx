"use client";

import {
    TextInput,
    Stack,
    Title,
    Button,
    Paper,
    Group,
    ActionIcon,
    Select,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { LanguageItem, LanguageProficiency } from "../../../types";

const PROFICIENCY_OPTIONS = [
    { value: "native", label: "Native" },
    { value: "fluent", label: "Fluent" },
    { value: "advanced", label: "Advanced" },
    { value: "intermediate", label: "Intermediate" },
    { value: "beginner", label: "Beginner" },
];

export function LanguagesEditor() {
    const { resume, addLanguage, updateLanguage, removeLanguage } = useResumeStore();

    const handleAdd = () => {
        const item: LanguageItem = {
            id: crypto.randomUUID(),
            name: "",
            proficiency: "intermediate",
        };
        addLanguage(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Languages</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Language
                </Button>
            </Group>

            {resume.languages.map((item) => (
                <Paper key={item.id} p="md" withBorder>
                    <Group align="end">
                        <TextInput
                            label="Language"
                            placeholder="English"
                            value={item.name}
                            onChange={(e) =>
                                updateLanguage(item.id, { name: e.currentTarget.value })
                            }
                            style={{ flex: 1 }}
                        />
                        <Select
                            label="Proficiency"
                            data={PROFICIENCY_OPTIONS}
                            value={item.proficiency}
                            onChange={(val) =>
                                updateLanguage(item.id, {
                                    proficiency: (val as LanguageProficiency) ?? "intermediate",
                                })
                            }
                            style={{ width: 160 }}
                        />
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => removeLanguage(item.id)}
                            title="Remove"
                            mb={2}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                </Paper>
            ))}

            {resume.languages.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No languages added yet. Click "Add Language" to get started.
                </Paper>
            )}
        </Stack>
    );
}
