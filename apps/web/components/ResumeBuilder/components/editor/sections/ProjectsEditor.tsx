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
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { ProjectItem } from "../../../types";

export function ProjectsEditor() {
    const { resume, addProject, updateProject, removeProject } = useResumeStore();

    const handleAdd = () => {
        const item: ProjectItem = {
            id: crypto.randomUUID(),
            name: "",
            url: "",
            startDate: "",
            endDate: "",
            description: "",
            technologies: [],
        };
        addProject(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Projects</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Project
                </Button>
            </Group>

            {resume.projects.map((item) => (
                <ProjectItemEditor
                    key={item.id}
                    item={item}
                    onUpdate={(patch) => updateProject(item.id, patch)}
                    onRemove={() => removeProject(item.id)}
                />
            ))}

            {resume.projects.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No projects added yet. Click "Add Project" to showcase your work.
                </Paper>
            )}
        </Stack>
    );
}

function ProjectItemEditor({
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
                    <Title order={6}>{item.name || "New Project"}</Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <TextInput
                        label="Project Name"
                        placeholder="My Awesome Project"
                        value={item.name}
                        onChange={(e) => onUpdate({ name: e.currentTarget.value })}
                    />
                    <TextInput
                        label="URL"
                        placeholder="https://github.com/user/project"
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
                        onChange={(e) => onUpdate({ endDate: e.currentTarget.value })}
                    />
                </SimpleGrid>
                <Textarea
                    label="Description"
                    placeholder="What does this project do? What problems does it solve?"
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
