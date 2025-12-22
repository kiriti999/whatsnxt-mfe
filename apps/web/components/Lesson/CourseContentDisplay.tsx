'use client';

import { useState } from 'react';
import {
    Accordion,
    Anchor,
    Box,
    Card,
    Divider,
    Group,
    Stack,
    Tabs,
    Text,
    Title,
    useMantineColorScheme,
} from '@mantine/core';
import { IconExternalLink, IconFileText, IconPlus, IconMinus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { CourseContentAPI, CourseContentSection } from '../../apis/v1/courses/course-content/course-content-api';
import HtmlParser from '../Common/HtmlParse';
import styles from './CourseContentDisplay.module.css';

interface CourseContentDisplayProps {
    courseId: string;
}

/**
 * Displays structured course content in the About tab for students
 * Similar to AWS training courses with sections, comparisons, collapsibles, and resources
 */
const CourseContentDisplay = ({ courseId }: CourseContentDisplayProps) => {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const { data: sections = [], isLoading } = useQuery({
        queryKey: ['courseContentPublic', courseId],
        queryFn: () => CourseContentAPI.getCourseContent(courseId),
        enabled: !!courseId,
        staleTime: 0, // Always fetch fresh data
        gcTime: 0, // Don't cache results
    });

    if (isLoading) {
        return (
            <Box py="xl">
                <Text c="dimmed">Loading content...</Text>
            </Box>
        );
    }

    if (sections.length === 0) {
        return null;
    }

    return (
        <Stack gap="xl" className={styles.contentContainer}>
            {sections.map((section) => (
                <ContentSection key={section._id} section={section} isDark={isDark} />
            ))}
        </Stack>
    );
};

interface ContentSectionProps {
    section: CourseContentSection;
    isDark: boolean;
}

const ContentSection = ({ section, isDark }: ContentSectionProps) => {
    return (
        <Box className={styles.section}>
            {/* Section Title */}
            <Title order={3} className={styles.sectionTitle} mb="md">
                {section.title}
            </Title>

            {/* Overview */}
            {section.overview && (
                <Box className={styles.overview} mb="xl">
                    <HtmlParser content={section.overview} withOptions />
                </Box>
            )}

            {/* Comparisons (Tabbed Content) */}
            {section.comparisons?.tabs?.length > 0 && (
                <ComparisonTabs
                    title={section.comparisons.title}
                    description={section.comparisons.description}
                    tabs={section.comparisons.tabs}
                    isDark={isDark}
                />
            )}

            {/* Collapsibles (Accordion) */}
            {section.collapsibles?.items?.length > 0 && (
                <CollapsibleSection
                    title={section.collapsibles.title}
                    description={section.collapsibles.description}
                    items={section.collapsibles.items}
                    isDark={isDark}
                />
            )}

            {/* Additional Resources */}
            {section.additionalResources?.items?.length > 0 && (
                <ResourcesSection
                    title={section.additionalResources.title}
                    items={section.additionalResources.items}
                    isDark={isDark}
                />
            )}
        </Box>
    );
};

interface ComparisonTabsProps {
    title: string;
    description: string;
    tabs: Array<{ tabTitle: string; content: string; order: number }>;
    isDark: boolean;
}

const ComparisonTabs = ({ title, description, tabs, isDark }: ComparisonTabsProps) => {
    const sortedTabs = [...tabs].sort((a, b) => a.order - b.order);

    return (
        <Box className={styles.comparisonSection} mb="xl">
            {title && (
                <Title order={4} className={styles.subSectionTitle} mb="sm">
                    {title}
                </Title>
            )}
            {description && (
                <Text size="sm" c="dimmed" mb="md">
                    {description}
                </Text>
            )}
            <Text size="sm" mb="md">
                To learn more, choose each of the following tabs.
            </Text>

            <Card withBorder className={styles.tabsCard} p={0}>
                <Tabs defaultValue={sortedTabs[0]?.tabTitle} variant="outline">
                    <Tabs.List className={styles.tabsList}>
                        {sortedTabs.map((tab) => (
                            <Tabs.Tab
                                key={tab.tabTitle}
                                value={tab.tabTitle}
                                className={styles.tab}
                            >
                                {tab.tabTitle.toUpperCase()}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>

                    {sortedTabs.map((tab) => (
                        <Tabs.Panel key={tab.tabTitle} value={tab.tabTitle} p="lg">
                            <HtmlParser content={tab.content} withOptions />
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </Card>
        </Box>
    );
};

interface CollapsibleSectionProps {
    title: string;
    description: string;
    items: Array<{ title: string; content: string; order: number; _id?: string }>;
    isDark: boolean;
}

const CollapsibleSection = ({ title, description, items, isDark }: CollapsibleSectionProps) => {
    const [openedItems, setOpenedItems] = useState<string[]>([]);
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    const toggleItem = (itemId: string) => {
        setOpenedItems((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    };

    return (
        <Box className={styles.collapsibleSection} mb="xl">
            {title && (
                <Title order={4} className={styles.subSectionTitle} mb="sm">
                    {title}
                </Title>
            )}
            {description && (
                <Text size="sm" c="dimmed" mb="md">
                    {description}
                </Text>
            )}
            {items.length > 1 && (
                <Text size="sm" mb="md">
                    To learn more, expand each of the following {items.length} categories.
                </Text>
            )}

            <Stack gap={0}>
                {sortedItems.map((item, index) => {
                    const itemId = item._id || `item-${index}`;
                    const isOpen = openedItems.includes(itemId);

                    return (
                        <Card
                            key={itemId}
                            className={`${styles.collapsibleItem} ${isOpen ? styles.collapsibleItemOpen : ''}`}
                            withBorder
                            radius={0}
                            style={{
                                borderTop: index === 0 ? undefined : 'none',
                                borderLeft: isOpen ? `4px solid var(--mantine-color-blue-6)` : undefined,
                            }}
                        >
                            <Group
                                justify="space-between"
                                className={styles.collapsibleHeader}
                                onClick={() => toggleItem(itemId)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Title order={5} fw={600}>
                                    {item.title}
                                </Title>
                                <Box className={styles.collapsibleIcon}>
                                    {isOpen ? <IconMinus size={20} /> : <IconPlus size={20} />}
                                </Box>
                            </Group>

                            {isOpen && (
                                <Box className={styles.collapsibleContent} mt="md">
                                    <HtmlParser content={item.content} withOptions />
                                </Box>
                            )}
                        </Card>
                    );
                })}
            </Stack>
        </Box>
    );
};

interface ResourcesSectionProps {
    title: string;
    items: Array<{
        title: string;
        description: string;
        url: string;
        resourceType: 'link' | 'text';
        order: number;
    }>;
    isDark: boolean;
}

const ResourcesSection = ({ title, items, isDark }: ResourcesSectionProps) => {
    const sortedItems = [...items].sort((a, b) => a.order - b.order);

    return (
        <Box className={styles.resourcesSection} mb="xl">
            {title && (
                <Title order={4} className={styles.subSectionTitle} mb="md">
                    {title}
                </Title>
            )}

            <Stack gap="sm">
                {sortedItems.map((resource, index) => (
                    <Card key={index} withBorder className={styles.resourceCard} p="md">
                        <Group gap="sm" align="flex-start">
                            {resource.resourceType === 'link' ? (
                                <IconExternalLink size={20} className={styles.resourceIcon} />
                            ) : (
                                <IconFileText size={20} className={styles.resourceIcon} />
                            )}
                            <Box style={{ flex: 1 }}>
                                {resource.resourceType === 'link' && resource.url ? (
                                    <Anchor
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.resourceLink}
                                    >
                                        {resource.title}
                                    </Anchor>
                                ) : (
                                    <Text fw={600}>{resource.title}</Text>
                                )}
                                {resource.description && (
                                    <Text size="sm" c="dimmed" mt={4}>
                                        {resource.description}
                                    </Text>
                                )}
                            </Box>
                        </Group>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default CourseContentDisplay;
