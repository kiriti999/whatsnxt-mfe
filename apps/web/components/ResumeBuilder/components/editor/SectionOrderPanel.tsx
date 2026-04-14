"use client";

import { Stack, Title, Paper, Group, Switch, Text } from "@mantine/core";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { useResumeStore } from "../../store";
import type { SectionConfig } from "../../types";

export function SectionOrderPanel() {
    const { resume, updateSectionOrder, toggleSectionVisibility } = useResumeStore();
    const sections = resume.sectionOrder;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || !sections[oldIndex]) return;

        const reordered = [...sections];
        const moved = reordered.splice(oldIndex, 1)[0];
        if (!moved) return;
        reordered.splice(newIndex, 0, moved);
        updateSectionOrder(reordered);
    };

    return (
        <Stack gap="sm" p="lg">
            <Title order={5}>Section Order</Title>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {sections.map((section) => (
                        <SortableSectionItem
                            key={section.id}
                            section={section}
                            onToggle={() => toggleSectionVisibility(section.id)}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </Stack>
    );
}

function SortableSectionItem({
    section,
    onToggle,
}: {
    section: SectionConfig;
    onToggle: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: section.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Paper ref={setNodeRef} style={style} p="xs" withBorder>
            <Group justify="space-between">
                <Group gap="xs">
                    <div
                        {...attributes}
                        {...listeners}
                        style={{ cursor: "grab", display: "flex", alignItems: "center" }}
                    >
                        <IconGripVertical size={16} color="gray" />
                    </div>
                    <Text size="sm" opacity={section.visible ? 1 : 0.5}>
                        {section.title}
                    </Text>
                </Group>
                <Switch
                    size="xs"
                    checked={section.visible}
                    onChange={onToggle}
                    aria-label={`Toggle ${section.title} visibility`}
                />
            </Group>
        </Paper>
    );
}
