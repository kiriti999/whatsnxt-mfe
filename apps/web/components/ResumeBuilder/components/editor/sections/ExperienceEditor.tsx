"use client";

import {
    TextInput,
    SimpleGrid,
    Stack,
    Title,
    Button,
    Paper,
    Group,
    ActionIcon,
    Checkbox,
    Textarea,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { ExperienceItem } from "../../../types";

export function ExperienceEditor() {
    const { resume, addExperience, updateExperience, removeExperience } = useResumeStore();

    const handleAdd = () => {
        const item: ExperienceItem = {
            id: crypto.randomUUID(),
            company: "",
            position: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
        };
        addExperience(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Experience</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Experience
                </Button>
            </Group>

            {resume.experience.map((item) => (
                <ExperienceItemEditor
                    key={item.id}
                    item={item}
                    onUpdate={(patch) => updateExperience(item.id, patch)}
                    onRemove={() => removeExperience(item.id)}
                />
            ))}

            {resume.experience.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No experience added yet. Click "Add Experience" to get started.
                </Paper>
            )}
        </Stack>
    );
}

function ExperienceItemEditor({
    item,
    onUpdate,
    onRemove,
}: {
    item: ExperienceItem;
    onUpdate: (patch: Partial<ExperienceItem>) => void;
    onRemove: () => void;
}) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={6}>
                        {item.position || item.company || "New Experience"}
                    </Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <TextInput
                        label="Position"
                        placeholder="Software Engineer"
                        value={item.position}
                        onChange={(e) => onUpdate({ position: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Company"
                        placeholder="Acme Inc."
                        value={item.company}
                        onChange={(e) => onUpdate({ company: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Location"
                        placeholder="San Francisco, CA"
                        value={item.location}
                        onChange={(e) => onUpdate({ location: e.currentTarget.value })}
                    />
                    <div />
                    <TextInput
                        label="Start Date"
                        placeholder="Jan 2022"
                        value={item.startDate}
                        onChange={(e) => onUpdate({ startDate: e.currentTarget.value })}
                    />
                    <TextInput
                        label="End Date"
                        placeholder="Present"
                        value={item.endDate}
                        disabled={item.current}
                        onChange={(e) => onUpdate({ endDate: e.currentTarget.value })}
                    />
                </SimpleGrid>
                <Checkbox
                    label="I currently work here"
                    checked={item.current}
                    onChange={(e) =>
                        onUpdate({
                            current: e.currentTarget.checked,
                            endDate: e.currentTarget.checked ? "Present" : item.endDate,
                        })
                    }
                />
                <Textarea
                    label="Description"
                    placeholder="Describe your key responsibilities and achievements..."
                    minRows={3}
                    autosize
                    value={item.description}
                    onChange={(e) => onUpdate({ description: e.currentTarget.value })}
                />
            </Stack>
        </Paper>
    );
}
