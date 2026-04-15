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
    Textarea,
    TagsInput,
    Checkbox,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { ProjectItem } from "../../../types";

export function AdditionalExperienceEditor() {
    const { resume, addAdditionalExperience, updateAdditionalExperience, removeAdditionalExperience } =
        useResumeStore();

    const handleAdd = () => {
        const item: ProjectItem = {
            id: crypto.randomUUID(),
            name: "",
            url: "",
            startDate: "",
            endDate: "",
            current: false,
            description: "",
            technologies: [],
        };
        addAdditionalExperience(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Additional Experience</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Item
                </Button>
            </Group>

            {resume.additionalExperience.map((item) => (
                <AdditionalExpItemEditor
                    key={item.id}
                    item={item}
                    onUpdate={(patch) => updateAdditionalExperience(item.id, patch)}
                    onRemove={() => removeAdditionalExperience(item.id)}
                />
            ))}

            {resume.additionalExperience.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No items added yet. Click "Add Item" to add side projects or personal work.
                </Paper>
            )}
        </Stack>
    );
}

function AdditionalExpItemEditor({
    item,
    onUpdate,
    onRemove,
}: {
    item: ProjectItem;
    onUpdate: (patch: Partial<ProjectItem>) => void;
    onRemove: () => void;
}) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={6}>{item.name || "New Item"}</Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <TextInput
                        label="Name"
                        placeholder="Project or Side Work"
                        value={item.name}
                        onChange={(e) => onUpdate({ name: e.currentTarget.value })}
                    />
                    <TextInput
                        label="URL"
                        placeholder="https://example.com"
                        value={item.url}
                        onChange={(e) => onUpdate({ url: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Start Date"
                        placeholder="Jan 2023"
                        value={item.startDate}
                        onChange={(e) => onUpdate({ startDate: e.currentTarget.value })}
                    />
                    <TextInput
                        label="End Date"
                        placeholder="Mar 2023"
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
                    placeholder="Describe this experience..."
                    minRows={3}
                    autosize
                    value={item.description}
                    onChange={(e) => onUpdate({ description: e.currentTarget.value })}
                />
                <TagsInput
                    label="Technologies"
                    placeholder="Type a technology and press Enter"
                    value={item.technologies}
                    onChange={(technologies) => onUpdate({ technologies })}
                />
            </Stack>
        </Paper>
    );
}
