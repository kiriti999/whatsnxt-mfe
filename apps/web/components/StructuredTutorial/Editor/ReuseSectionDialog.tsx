'use client';

import React, { useState, useEffect } from 'react';
import {
    Modal,
    Stack,
    TextInput,
    Button,
    Group,
    Text,
    Paper,
    Badge,
    Loader,
    Center,
} from '@mantine/core';
import { IconSearch, IconCopy, IconFolder } from '@tabler/icons-react';
import { StructuredTutorialAPI, TutorialSection } from '../../../apis/v1/blog/structuredTutorialApi';
import { notifications } from '@mantine/notifications';

interface ReuseSectionDialogProps {
    opened: boolean;
    onClose: () => void;
    onReuse: (sectionId: string) => Promise<void>;
    excludeTutorialId?: string;
}

export const ReuseSectionDialog: React.FC<ReuseSectionDialogProps> = ({
    opened,
    onClose,
    onReuse,
    excludeTutorialId,
}) => {
    const [sections, setSections] = useState<TutorialSection[]>([]);
    const [filteredSections, setFilteredSections] = useState<TutorialSection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [reusing, setReusing] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            fetchAvailableSections();
        }
    }, [opened, excludeTutorialId]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredSections(sections);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredSections(
                sections.filter(
                    (section) =>
                        section.title.toLowerCase().includes(query) ||
                        section.description?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, sections]);

    const fetchAvailableSections = async () => {
        setLoading(true);
        try {
            const response = await StructuredTutorialAPI.getAvailableSections(excludeTutorialId);
            if (response.success) {
                setSections(response.data);
                setFilteredSections(response.data);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to load available sections',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReuse = async (sectionId: string) => {
        setReusing(sectionId);
        try {
            await onReuse(sectionId);
            notifications.show({
                title: 'Success',
                message: 'Section copied successfully',
                color: 'green',
            });
            onClose();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to copy section',
                color: 'red',
            });
        } finally {
            setReusing(null);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Reuse Section from Another Tutorial"
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    placeholder="Search sections..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {loading ? (
                    <Center p="xl">
                        <Loader />
                    </Center>
                ) : filteredSections.length === 0 ? (
                    <Center p="xl">
                        <Text c="dimmed">No sections found</Text>
                    </Center>
                ) : (
                    <Stack gap="xs" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredSections.map((section) => (
                            <Paper key={section._id} p="md" withBorder>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap="xs" style={{ flex: 1 }}>
                                        <Group gap="xs">
                                            <IconFolder size={18} />
                                            <Text fw={500}>{section.title}</Text>
                                            <Badge size="sm" variant="light">
                                                {Array.isArray(section.postIds) ? section.postIds.length : 0} posts
                                            </Badge>
                                        </Group>
                                        {section.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {section.description}
                                            </Text>
                                        )}
                                        {section.structuredTutorialId && typeof section.structuredTutorialId === 'object' && (
                                            <Text size="xs" c="dimmed">
                                                From: {(section.structuredTutorialId as any).title || 'Unknown Tutorial'}
                                            </Text>
                                        )}
                                    </Stack>
                                    <Button
                                        size="sm"
                                        leftSection={<IconCopy size={16} />}
                                        onClick={() => handleReuse(section._id)}
                                        loading={reusing === section._id}
                                    >
                                        Copy
                                    </Button>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Modal>
    );
};
