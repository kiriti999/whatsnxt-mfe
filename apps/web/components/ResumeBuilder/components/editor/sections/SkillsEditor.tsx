"use client";

import {
    TextInput,
    Stack,
    Title,
    Button,
    Paper,
    Group,
    ActionIcon,
    TagsInput,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { SkillCategory } from "../../../types";

export function SkillsEditor() {
    const { resume, addSkillCategory, updateSkillCategory, removeSkillCategory } =
        useResumeStore();

    const handleAdd = () => {
        const category: SkillCategory = {
            id: crypto.randomUUID(),
            name: "",
            skills: [],
        };
        addSkillCategory(category);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Skills</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Category
                </Button>
            </Group>

            {resume.skills.map((category) => (
                <SkillCategoryEditor
                    key={category.id}
                    category={category}
                    onUpdate={(patch) => updateSkillCategory(category.id, patch)}
                    onRemove={() => removeSkillCategory(category.id)}
                />
            ))}

            {resume.skills.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No skills added yet. Click "Add Category" to organize your skills.
                </Paper>
            )}
        </Stack>
    );
}

function SkillCategoryEditor({
    category,
    onUpdate,
    onRemove,
}: {
    category: SkillCategory;
    onUpdate: (patch: Partial<SkillCategory>) => void;
    onRemove: () => void;
}) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={6}>{category.name || "New Category"}</Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <TextInput
                    label="Category Name"
                    placeholder="Programming Languages"
                    value={category.name}
                    onChange={(e) => onUpdate({ name: e.currentTarget.value })}
                />
                <TagsInput
                    label="Skills"
                    placeholder="Type a skill and press Enter"
                    value={category.skills}
                    onChange={(skills) => onUpdate({ skills })}
                />
            </Stack>
        </Paper>
    );
}
