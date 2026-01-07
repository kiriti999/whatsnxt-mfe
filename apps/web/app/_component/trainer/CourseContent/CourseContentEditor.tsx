'use client';

import { useState, useEffect } from 'react';
import {
    Accordion,
    ActionIcon,
    Box,
    Button,
    Card,
    Group,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
    Tabs,
    Divider,
    LoadingOverlay,
} from '@mantine/core';
import {
    IconPlus,
    IconTrash,
    IconEdit,
    IconDeviceFloppy,
    IconX,
    IconLink,
    IconChevronDown,
    IconChevronUp,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { RichTextEditor } from '../../../../components/RichTextEditor';
import { CourseContentAPI, CourseContentSection } from '../../../../apis/v1/courses/course-content/course-content-api';
import { TiptapManageContextProvider } from '../../../../context/TiptapManageContext';
import { useDashboardContext } from '../../../../context/DashboardContext';
import styles from './CourseContent.module.css';

interface CourseContentEditorProps {
    courseId: string;
}

const CourseContentEditor = ({ courseId }: CourseContentEditorProps) => {
    const queryClient = useQueryClient();
    const [isAssetsUploading, setIsAssetsUploading] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const { setEnabledSections } = useDashboardContext();

    // Enable navigation to other steps
    useEffect(() => {
        setEnabledSections(prev => {
            const temp = new Set(prev);
            temp.add(1);
            temp.add(2);
            temp.add(3); // Course Content (current)
            temp.add(4); // Landing Page
            return temp;
        });
    }, [setEnabledSections]);

    // Fetch course content
    const { data: sections = [], isLoading } = useQuery({
        queryKey: ['courseContent', courseId],
        queryFn: () => CourseContentAPI.getCourseContent(courseId),
        enabled: !!courseId,
    });

    // Create section mutation
    const createSectionMutation = useMutation({
        mutationFn: (data: Partial<CourseContentSection>) =>
            CourseContentAPI.createContentSection(courseId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
            notifications.show({
                title: 'Success',
                message: 'Content section created',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Failed to create section',
                color: 'red',
            });
        },
    });

    // Update section mutation
    const updateSectionMutation = useMutation({
        mutationFn: ({ sectionId, data }: { sectionId: string; data: Partial<CourseContentSection> }) =>
            CourseContentAPI.updateContentSection(sectionId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
            notifications.show({
                title: 'Success',
                message: 'Content section updated',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Failed to update section',
                color: 'red',
            });
        },
    });

    // Delete section mutation
    const deleteSectionMutation = useMutation({
        mutationFn: (sectionId: string) => CourseContentAPI.deleteContentSection(sectionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseContent', courseId] });
            notifications.show({
                title: 'Success',
                message: 'Content section deleted',
                color: 'green',
            });
        },
        onError: () => {
            notifications.show({
                title: 'Error',
                message: 'Failed to delete section',
                color: 'red',
            });
        },
    });

    const handleAddSection = () => {
        createSectionMutation.mutate({
            title: 'Topic',
            overview: '',
        });
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    return (
        <TiptapManageContextProvider
            isAssetsUploading={isAssetsUploading}
            setIsAssetsUploading={setIsAssetsUploading}
            courseId={courseId}
        >
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <LoadingOverlay visible={isLoading} />

                <Accordion defaultValue="course-content">
                    <Accordion.Item value="course-content">
                        <Accordion.Control>
                            <Title order={4}>Course Content</Title>
                            <Text size="sm" c="dimmed" mt={4}>
                                Create structured content for your course including sections, comparisons, and collapsibles
                            </Text>
                        </Accordion.Control>

                        <Accordion.Panel>
                            <Stack gap="md">
                                {sections.map((section, index) => (
                                    <ContentSectionEditor
                                        key={section._id}
                                        section={section}
                                        courseId={courseId}
                                        isExpanded={expandedSections.includes(section._id!)}
                                        onToggle={() => toggleSection(section._id!)}
                                        onUpdate={(data) =>
                                            updateSectionMutation.mutate({ sectionId: section._id!, data })
                                        }
                                        onDelete={() => deleteSectionMutation.mutate(section._id!)}
                                        isAssetsUploading={isAssetsUploading}
                                        setIsAssetsUploading={setIsAssetsUploading}
                                    />
                                ))}

                                <Card shadow="sm" padding="md" radius="md" withBorder>
                                    <Button
                                        variant="outline"
                                        leftSection={<IconPlus size={16} />}
                                        onClick={handleAddSection}
                                        loading={createSectionMutation.isPending}
                                        fullWidth
                                    >
                                        Add Content Section
                                    </Button>
                                </Card>
                            </Stack>
                        </Accordion.Panel>
                    </Accordion.Item>
                </Accordion>
            </Card>
        </TiptapManageContextProvider>
    );
};

interface ContentSectionEditorProps {
    section: CourseContentSection;
    courseId: string;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (data: Partial<CourseContentSection>) => void;
    onDelete: () => void;
    isAssetsUploading: boolean;
    setIsAssetsUploading: (value: boolean) => void;
}

const ContentSectionEditor = ({
    section,
    courseId,
    isExpanded,
    onToggle,
    onUpdate,
    onDelete,
    isAssetsUploading,
    setIsAssetsUploading,
}: ContentSectionEditorProps) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [title, setTitle] = useState(section.title);
    const [overview, setOverview] = useState(section.overview);
    const [activeTab, setActiveTab] = useState<string | null>('overview');

    // Comparisons state
    const [comparisonsTitle, setComparisonsTitle] = useState(section.comparisons?.title || '');
    const [comparisonsDesc, setComparisonsDesc] = useState(section.comparisons?.description || '');
    const [tabs, setTabs] = useState(section.comparisons?.tabs || []);

    // Collapsibles state
    const [collapsiblesTitle, setCollapsiblesTitle] = useState(section.collapsibles?.title || '');
    const [collapsiblesDesc, setCollapsiblesDesc] = useState(section.collapsibles?.description || '');
    const [collapsibleItems, setCollapsibleItems] = useState(section.collapsibles?.items || []);

    // Resources state
    const [resourcesTitle, setResourcesTitle] = useState(section.additionalResources?.title || '');
    const [resources, setResources] = useState(section.additionalResources?.items || []);

    const handleSaveTitle = () => {
        onUpdate({ title });
        setIsEditingTitle(false);
    };

    const handleSaveOverview = () => {
        onUpdate({ overview });
    };

    const handleSaveComparisons = () => {
        onUpdate({
            comparisons: {
                title: comparisonsTitle,
                description: comparisonsDesc,
                tabs,
            },
        });
    };

    const handleSaveCollapsibles = () => {
        onUpdate({
            collapsibles: {
                title: collapsiblesTitle,
                description: collapsiblesDesc,
                items: collapsibleItems,
            },
        });
    };

    const handleSaveResources = () => {
        onUpdate({
            additionalResources: {
                title: resourcesTitle,
                items: resources,
            },
        });
    };

    const addComparisonTab = () => {
        const newTab = {
            tabTitle: 'New Tab',
            content: '',
            order: tabs.length,
        };
        setTabs([...tabs, newTab]);
    };

    const updateComparisonTab = (index: number, field: string, value: string) => {
        const updated = [...tabs];
        updated[index] = { ...updated[index], [field]: value };
        setTabs(updated);
    };

    const removeComparisonTab = (index: number) => {
        setTabs(tabs.filter((_, i) => i !== index));
    };

    const addCollapsibleItem = () => {
        const newItem = {
            title: 'Collapsible Topic Title',
            content: '',
            order: collapsibleItems.length,
        };
        setCollapsibleItems([...collapsibleItems, newItem]);
    };

    const updateCollapsibleItem = (index: number, field: string, value: string) => {
        const updated = [...collapsibleItems];
        updated[index] = { ...updated[index], [field]: value };
        setCollapsibleItems(updated);
    };

    const removeCollapsibleItem = (index: number) => {
        setCollapsibleItems(collapsibleItems.filter((_, i) => i !== index));
    };

    const addResource = () => {
        const newResource = {
            title: 'Link Title',
            description: '',
            url: '',
            resourceType: 'link' as const,
            order: resources.length,
        };
        setResources([...resources, newResource]);
    };

    const updateResource = (index: number, field: string, value: string) => {
        const updated = [...resources];
        updated[index] = { ...updated[index], [field]: value };
        setResources(updated);
    };

    const removeResource = (index: number) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    return (
        <Card shadow="sm" radius="md" withBorder className={styles.sectionCard}>
            <Group justify="space-between" mb="md">
                <Group>
                    {isEditingTitle ? (
                        <Group>
                            <TextInput
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                size="sm"
                                style={{ minWidth: 200 }}
                            />
                            <Tooltip label="Save title">
                                <ActionIcon variant="filled" color="blue" onClick={handleSaveTitle}>
                                    <IconDeviceFloppy size={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Cancel">
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => {
                                        setTitle(section.title);
                                        setIsEditingTitle(false);
                                    }}
                                >
                                    <IconX size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    ) : (
                        <Group>
                            <Title order={5}>{section.title}</Title>
                            <Tooltip label="Edit title">
                                <ActionIcon variant="subtle" onClick={() => setIsEditingTitle(true)}>
                                    <IconEdit size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    )}
                </Group>

                <Group>
                    <Tooltip label="Delete section">
                        <ActionIcon variant="subtle" color="red" onClick={onDelete}>
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Tooltip>
                    <ActionIcon variant="subtle" onClick={onToggle}>
                        {isExpanded ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                    </ActionIcon>
                </Group>
            </Group>

            {isExpanded && (
                <Tabs value={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Tab value="overview">Overview</Tabs.Tab>
                        <Tabs.Tab value="comparisons">Comparisons</Tabs.Tab>
                        <Tabs.Tab value="collapsibles">Collapsibles</Tabs.Tab>
                        <Tabs.Tab value="resources">Additional Resources</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="overview" pt="md">
                        <Stack gap="md">
                            <RichTextEditor content={overview} onChange={setOverview} />
                            <Group justify="flex-end">
                                <Button onClick={handleSaveOverview} disabled={isAssetsUploading}>
                                    Save Overview
                                </Button>
                            </Group>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="comparisons" pt="md">
                        <Stack gap="md">
                            <TextInput
                                label="Comparison Section Title"
                                value={comparisonsTitle}
                                onChange={(e) => setComparisonsTitle(e.target.value)}
                                placeholder="e.g., Deployment models for cloud computing"
                            />
                            <TextInput
                                label="Description"
                                value={comparisonsDesc}
                                onChange={(e) => setComparisonsDesc(e.target.value)}
                                placeholder="Brief description of this comparison section"
                            />

                            <Divider label="Comparison Tabs" labelPosition="center" />

                            {tabs.map((tab, index) => (
                                <Card key={index} withBorder p="sm">
                                    <Group justify="space-between" mb="sm">
                                        <TextInput
                                            value={tab.tabTitle}
                                            onChange={(e) => updateComparisonTab(index, 'tabTitle', e.target.value)}
                                            placeholder="Tab Title"
                                            style={{ flex: 1 }}
                                        />
                                        <ActionIcon color="red" variant="subtle" onClick={() => removeComparisonTab(index)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                    <RichTextEditor
                                        content={tab.content}
                                        onChange={(value) => updateComparisonTab(index, 'content', value)}
                                    />
                                </Card>
                            ))}

                            <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={addComparisonTab}>
                                Add Comparison Tab
                            </Button>

                            <Group justify="flex-end">
                                <Button onClick={handleSaveComparisons} disabled={isAssetsUploading}>
                                    Save Comparisons
                                </Button>
                            </Group>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="collapsibles" pt="md">
                        <Stack gap="md">
                            <TextInput
                                label="Collapsibles Section Title"
                                value={collapsiblesTitle}
                                onChange={(e) => setCollapsiblesTitle(e.target.value)}
                                placeholder="e.g., Benefits of cloud computing"
                            />
                            <TextInput
                                label="Description"
                                value={collapsiblesDesc}
                                onChange={(e) => setCollapsiblesDesc(e.target.value)}
                                placeholder="Brief description of this section"
                            />

                            <Divider label="Collapsible Items" labelPosition="center" />

                            {collapsibleItems.map((item, index) => (
                                <Card key={index} withBorder p="sm">
                                    <Group justify="space-between" mb="sm">
                                        <TextInput
                                            value={item.title}
                                            onChange={(e) => updateCollapsibleItem(index, 'title', e.target.value)}
                                            placeholder="Item Title"
                                            style={{ flex: 1 }}
                                        />
                                        <ActionIcon color="red" variant="subtle" onClick={() => removeCollapsibleItem(index)}>
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                    <RichTextEditor
                                        content={item.content}
                                        onChange={(value) => updateCollapsibleItem(index, 'content', value)}
                                    />
                                </Card>
                            ))}

                            <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={addCollapsibleItem}>
                                Add Collapsible Item
                            </Button>

                            <Group justify="flex-end">
                                <Button onClick={handleSaveCollapsibles} disabled={isAssetsUploading}>
                                    Save Collapsibles
                                </Button>
                            </Group>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="resources" pt="md">
                        <Stack gap="md">
                            <TextInput
                                label="Resources Section Title"
                                value={resourcesTitle}
                                onChange={(e) => setResourcesTitle(e.target.value)}
                                placeholder="e.g., Additional Resources"
                            />

                            <Divider label="Resources" labelPosition="center" />

                            {resources.map((resource, index) => (
                                <Card key={index} withBorder p="sm">
                                    <Stack gap="sm">
                                        <Group justify="space-between">
                                            <TextInput
                                                label="Title"
                                                value={resource.title}
                                                onChange={(e) => updateResource(index, 'title', e.target.value)}
                                                placeholder="Resource title"
                                                style={{ flex: 1 }}
                                            />
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                mt={24}
                                                onClick={() => removeResource(index)}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                        <TextInput
                                            label="Description"
                                            value={resource.description}
                                            onChange={(e) => updateResource(index, 'description', e.target.value)}
                                            placeholder="Brief description"
                                        />
                                        {resource.resourceType === 'link' && (
                                            <TextInput
                                                label="URL"
                                                leftSection={<IconLink size={16} />}
                                                value={resource.url}
                                                onChange={(e) => updateResource(index, 'url', e.target.value)}
                                                placeholder="https://example.com"
                                            />
                                        )}
                                    </Stack>
                                </Card>
                            ))}

                            <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={addResource}>
                                Add Resource
                            </Button>

                            <Group justify="flex-end">
                                <Button onClick={handleSaveResources} disabled={isAssetsUploading}>
                                    Save Resources
                                </Button>
                            </Group>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            )}
        </Card>
    );
};

export default CourseContentEditor;
