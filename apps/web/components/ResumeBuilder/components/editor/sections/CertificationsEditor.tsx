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
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { useResumeStore } from "../../../store";
import type { CertificationItem } from "../../../types";

export function CertificationsEditor() {
    const { resume, addCertification, updateCertification, removeCertification } =
        useResumeStore();

    const handleAdd = () => {
        const item: CertificationItem = {
            id: crypto.randomUUID(),
            name: "",
            issuer: "",
            issueDate: "",
            expiryDate: "",
            credentialId: "",
            credentialUrl: "",
        };
        addCertification(item);
    };

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Title order={4}>Certifications</Title>
                <Button leftSection={<IconPlus size={16} />} size="xs" onClick={handleAdd}>
                    Add Certification
                </Button>
            </Group>

            {resume.certifications.map((item) => (
                <CertificationItemEditor
                    key={item.id}
                    item={item}
                    onUpdate={(patch) => updateCertification(item.id, patch)}
                    onRemove={() => removeCertification(item.id)}
                />
            ))}

            {resume.certifications.length === 0 && (
                <Paper p="xl" ta="center" c="dimmed" withBorder>
                    No certifications added yet. Click "Add Certification" to get started.
                </Paper>
            )}
        </Stack>
    );
}

function CertificationItemEditor({
    item,
    onUpdate,
    onRemove,
}: {
    item: CertificationItem;
    onUpdate: (patch: Partial<CertificationItem>) => void;
    onRemove: () => void;
}) {
    return (
        <Paper p="md" withBorder>
            <Stack gap="sm">
                <Group justify="space-between">
                    <Title order={6}>{item.name || "New Certification"}</Title>
                    <ActionIcon variant="subtle" color="red" onClick={onRemove} title="Remove">
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                    <TextInput
                        label="Certification Name"
                        placeholder="AWS Solutions Architect"
                        value={item.name}
                        onChange={(e) => onUpdate({ name: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Issuer"
                        placeholder="Amazon Web Services"
                        value={item.issuer}
                        onChange={(e) => onUpdate({ issuer: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Issue Date"
                        placeholder="Jan 2023"
                        value={item.issueDate}
                        onChange={(e) => onUpdate({ issueDate: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Expiry Date"
                        placeholder="Jan 2026"
                        value={item.expiryDate}
                        onChange={(e) => onUpdate({ expiryDate: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Credential ID"
                        placeholder="ABC123XYZ"
                        value={item.credentialId}
                        onChange={(e) => onUpdate({ credentialId: e.currentTarget.value })}
                    />
                    <TextInput
                        label="Credential URL"
                        placeholder="https://verify.example.com/..."
                        value={item.credentialUrl}
                        onChange={(e) => onUpdate({ credentialUrl: e.currentTarget.value })}
                    />
                </SimpleGrid>
            </Stack>
        </Paper>
    );
}
