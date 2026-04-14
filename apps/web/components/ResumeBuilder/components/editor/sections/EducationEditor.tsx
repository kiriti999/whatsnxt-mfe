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
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { EducationItem } from "../../../types";

export function EducationEditor() {
    const { resume, addEducation, updateEducation, removeEducation } = useResumeStore();

    const handleAdd = () => {
        const item: EducationItem = {
            id: crypto.randomUUID(),
            institution: "",
            degree: "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
            description: "",
        };
        addEducation(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Education</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Education
                </Button>
            </Group>

            {resume.education.map((item) => (
                <EducationItemEditor
                    key={item.id}
                    item={item}
                    onUpdate={(patch) => updateEducation(item.id, patch)}
                    onRemove={() => removeEducation(item.id)}
                />
            ))}

            {resume.education.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No education added yet. Click "Add Education" to get started.
                </Paper>
            )}
        </Stack>
    );
}

function EducationItemEditor({
    item,
    onUpdate,
    onRemove,
}: {
    item: EducationItem;
    onUpdate: (patch: Partial<EducationItem>) => void;
    onRemove: () => void;
}) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={6}>
                        {item.institution || item.degree || "New Education"}
                    </Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <TextInput
                        label="Institution"
                        placeholder="University of California"
                        value={item.institution}
                        onChange={(e) => onUpdate({ institution: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Degree"
                        placeholder="Bachelor of Science"
                        value={item.degree}
                        onChange={(e) => onUpdate({ degree: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Field of Study"
                        placeholder="Computer Science"
                        value={item.field}
                        onChange={(e) => onUpdate({ field: e.currentTarget.value })}
                    />
                    <TextInput
                        label="GPA"
                        placeholder="3.8/4.0"
                        value={item.gpa}
                        onChange={(e) => onUpdate({ gpa: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Start Date"
                        placeholder="Sep 2018"
                        value={item.startDate}
                        onChange={(e) => onUpdate({ startDate: e.currentTarget.value })}
                    />
                    <TextInput
                        label="End Date"
                        placeholder="Jun 2022"
                        value={item.endDate}
                        onChange={(e) => onUpdate({ endDate: e.currentTarget.value })}
                    />
                </SimpleGrid>
                <Textarea
                    label="Description"
                    placeholder="Relevant coursework, honors, activities..."
                    minRows={2}
                    autosize
                    value={item.description}
                    onChange={(e) => onUpdate({ description: e.currentTarget.value })}
                />
            </Stack>
        </Paper>
    );
}
