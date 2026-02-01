'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Stack,
    Text,
    NavLink,
    ThemeIcon,
    Collapse,
    Group,
    Badge,
    ScrollArea,
    ActionIcon,
    TextInput,
    Divider,
} from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import {
    IconChevronDown,
    IconChevronRight,
    IconFolder,
    IconFile,
    IconBook,
    IconLayoutSidebarLeftCollapse,
    IconSearch,
    IconChevronsDown,
    IconChevronsUp,
} from '@tabler/icons-react';
import { SidebarTree, SidebarSection, SidebarPost } from '../../../apis/v1/blog/structuredTutorialApi';

interface TutorialSidebarProps {
    sidebarData: SidebarTree;
    currentPostSlug?: string;
    onCollapse?: () => void;
    isMobile?: boolean;
}

export function TutorialSidebar({ sidebarData, currentPostSlug, onCollapse, isMobile = false }: TutorialSidebarProps) {
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    // Filter sections based on search query
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return sidebarData.sections;

        const lowerQuery = searchQuery.toLowerCase();

        return sidebarData.sections
            .map((section) => {
                // Check if section title matches
                const sectionMatches = section.title.toLowerCase().includes(lowerQuery);

                // Filter posts that match
                const matchingPosts = section.posts.filter((post) =>
                    post.title.toLowerCase().includes(lowerQuery)
                );

                // If section title matches, return section with all posts
                if (sectionMatches) {
                    return section;
                }

                // If any posts match, return section with only matching posts
                if (matchingPosts.length > 0) {
                    return {
                        ...section,
                        posts: matchingPosts,
                    };
                }

                return null;
            })
            .filter((section): section is SidebarSection => section !== null);
    }, [sidebarData.sections, searchQuery]);

    // Auto-expand filtered sections when searching
    useEffect(() => {
        if (searchQuery.trim() && filteredSections.length > 0) {
            const allFilteredIds = filteredSections.map((section) => section.id);
            setExpandedSections(new Set(allFilteredIds));
        }
    }, [searchQuery, filteredSections]);

    // Auto-expand section containing current post
    useEffect(() => {
        if (currentPostSlug && sidebarData?.sections) {
            const activeSection = sidebarData.sections.find(section =>
                section.posts.some(post => post.slug === currentPostSlug)
            );

            if (activeSection) {
                setExpandedSections(prev => {
                    const next = new Set(prev);
                    next.add(activeSection.id);
                    return next;
                });
            }
        }
    }, [currentPostSlug, sidebarData]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }
            return next;
        });
    };

    const navigateToPost = (post: SidebarPost, section: SidebarSection) => {
        // Navigate to the post page with tutorial context
        // Post slug is usually 'tutorial-post', we want '/content/tutorial/post'
        let shortSlug = post.slug;
        const prefix = `${sidebarData.tutorialSlug}-`;
        if (shortSlug.startsWith(prefix)) {
            shortSlug = shortSlug.slice(prefix.length);
        }
        const postUrl = `/content/${sidebarData.tutorialSlug}/${shortSlug}`;

        router.push(postUrl);
    };

    const toggleAllSections = () => {
        if (allSectionsExpanded) {
            // Collapse all
            setExpandedSections(new Set());
        } else {
            // Expand all
            const allIds = new Set<string>();
            sidebarData?.sections?.forEach(section => allIds.add(section.id));
            setExpandedSections(allIds);
        }
    };

    const allSectionsExpanded = sidebarData?.sections?.every(section => expandedSections.has(section.id)) ?? false;

    if (!sidebarData || !sidebarData.sections) {
        return null;
    }

    return (
        <Paper
            withBorder={false}
            p="md"
            style={{
                position: 'sticky',
                top: '80px',
                maxHeight: 'calc(100vh - 100px)',
            }}
        >
            <Stack gap="sm">
                {/* Tutorial Header */}
                <Group gap="xs" mb="xs" justify="space-between">
                    <Group gap="xs" style={{ flex: 1 }}>
                        <ThemeIcon variant="light" size="lg" color="green">
                            <IconBook size={18} />
                        </ThemeIcon>
                        <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={700} lineClamp={2}>
                                {sidebarData.tutorialTitle}
                            </Text>
                        </Box>
                    </Group>
                    <Group gap={4}>
                        <ActionIcon
                            variant="subtle"
                            size="sm"
                            onClick={toggleAllSections}
                            aria-label={allSectionsExpanded ? "Collapse all sections" : "Expand all sections"}
                            title={allSectionsExpanded ? "Collapse all" : "Expand all"}
                        >
                            {allSectionsExpanded ? <IconChevronsUp size={18} /> : <IconChevronsDown size={18} />}
                        </ActionIcon>
                        {onCollapse && (
                            <ActionIcon
                                variant="subtle"
                                size="sm"
                                onClick={onCollapse}
                                aria-label="Collapse sidebar"
                            >
                                <IconLayoutSidebarLeftCollapse size={20} />
                            </ActionIcon>
                        )}
                    </Group>
                </Group>

                {/* Search Input */}
                <TextInput
                    placeholder="Search topics..."
                    leftSection={<IconSearch size={14} />}
                    size="xs"
                    radius="md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    styles={{ input: { backgroundColor: 'var(--mantine-color-default)' } }}
                />

                <Divider />

                <ScrollArea.Autosize mah="calc(100vh - 200px)">
                    <Stack gap={4}>
                        {filteredSections.map((section, sectionIndex) => {
                            const isExpanded = searchQuery ? true : expandedSections.has(section.id);
                            const hasCurrentPost = section.posts.some((post) => post.slug === currentPostSlug);

                            return (
                                <Box key={section.id}>
                                    {/* Section Header */}
                                    <NavLink
                                        label={
                                            <Group gap="xs" wrap="nowrap">
                                                <Text size="sm" fw={600} lineClamp={1}>
                                                    {section.title}
                                                </Text>
                                                <Badge size="xs" variant="light" color="gray">
                                                    {section.posts.length}
                                                </Badge>
                                            </Group>
                                        }
                                        leftSection={
                                            <ThemeIcon variant="light" size="sm" color={hasCurrentPost ? 'green' : 'gray'}>
                                                <IconFolder size={14} />
                                            </ThemeIcon>
                                        }
                                        rightSection={
                                            isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />
                                        }
                                        onClick={() => toggleSection(section.id)}
                                        active={hasCurrentPost}
                                        styles={{
                                            root: {
                                                borderRadius: 'var(--mantine-radius-sm)',
                                            },
                                        }}
                                    />

                                    {/* Posts */}
                                    <Collapse in={isExpanded}>
                                        <Stack gap={2} pl="md" mt={4}>
                                            {section.posts.map((post, postIndex) => {
                                                const isActive = post.slug === currentPostSlug;

                                                return (
                                                    <NavLink
                                                        key={post.id}
                                                        label={
                                                            <Text size="xs" lineClamp={1}>
                                                                {post.title}
                                                            </Text>
                                                        }
                                                        leftSection={
                                                            <ThemeIcon variant="subtle" size="xs" color={isActive ? 'green' : 'gray'}>
                                                                <IconFile size={12} />
                                                            </ThemeIcon>
                                                        }
                                                        onClick={() => navigateToPost(post, section)}
                                                        active={isActive}
                                                        styles={{
                                                            root: {
                                                                borderRadius: 'var(--mantine-radius-xs)',
                                                                paddingTop: 6,
                                                                paddingBottom: 6,
                                                            },
                                                        }}
                                                    />
                                                );
                                            })}
                                        </Stack>
                                    </Collapse>
                                </Box>
                            );
                        })}
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Paper>
    );
}

export default TutorialSidebar;
