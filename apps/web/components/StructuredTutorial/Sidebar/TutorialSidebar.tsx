'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Paper,
    Stack,
    Text,
    Collapse,
    Group,
    ScrollArea,
    ActionIcon,
    TextInput,
    Divider,
} from '@mantine/core';
import { useRouter } from 'next/navigation';
import {
    IconChevronDown,
    IconChevronRight,
    IconLayoutSidebarLeftCollapse,
    IconSearch,
    IconChevronsDown,
    IconChevronsUp,
} from '@tabler/icons-react';
import { useClickOutside } from '@mantine/hooks';
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

    const ref = useClickOutside(() => {
        if (isMobile && onCollapse) {
            onCollapse();
        }
    });

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
            ref={ref}
            withBorder={false}
            p={0}
            style={{
                position: 'sticky',
                top: '80px',
                maxHeight: 'calc(100vh - 100px)',
                backgroundColor: 'transparent',
            }}
        >
            <Stack gap={0}>
                {/* Tutorial Header */}
                <Box px="md" py="md">
                    <Group gap="xs" mb="xs" justify="space-between">
                        <Box style={{ flex: 1 }}>
                            <Text size="sm" fw={700} lineClamp={2} c="bright">
                                {sidebarData.tutorialTitle}
                            </Text>
                        </Box>
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
                </Box>

                {/* Search Input */}
                <Box px="md" pb="md">
                    <TextInput
                        placeholder="Search topics..."
                        leftSection={<IconSearch size={16} />}
                        size="md"
                        radius="xs"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        styles={{
                            input: {
                                backgroundColor: 'var(--mantine-color-default)',
                                border: '1px solid var(--mantine-color-default-border)',
                            }
                        }}
                    />
                </Box>

                <Divider />

                <ScrollArea.Autosize mah="calc(100vh - 280px)">
                    <Stack gap={0} py="xs">
                        {filteredSections.map((section, sectionIndex) => {
                            const isExpanded = searchQuery ? true : expandedSections.has(section.id);
                            const hasCurrentPost = section.posts.some((post) => post.slug === currentPostSlug);

                            return (
                                <Box key={section.id}>
                                    {/* Section Header */}
                                    <Box
                                        px="md"
                                        py="xs"
                                        onClick={() => toggleSection(section.id)}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                        className="section-header-hover"
                                    >
                                        <Group gap="sm" wrap="nowrap" justify="space-between">
                                            <Text size="xs" fw={600} lineClamp={2} c="bright" style={{ flex: 1 }}>
                                                {section.title}
                                            </Text>
                                            <Group gap="xs" wrap="nowrap">
                                                <Text size="xs" c="dimmed">
                                                    0/{section.posts.length}
                                                </Text>
                                                {isExpanded ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
                                            </Group>
                                        </Group>
                                    </Box>

                                    {/* Posts */}
                                    <Collapse in={isExpanded}>
                                        <Stack gap={0}>
                                            {section.posts.map((post, postIndex) => {
                                                const isActive = post.slug === currentPostSlug;

                                                return (
                                                    <Box
                                                        key={post.id}
                                                        px="md"
                                                        py="xs"
                                                        pl="lg"
                                                        onClick={() => navigateToPost(post, section)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            backgroundColor: isActive ? 'var(--mantine-primary-color-light)' : 'transparent',
                                                            borderLeft: isActive ? '3px solid var(--mantine-primary-color-filled)' : '3px solid transparent',
                                                            transition: 'all 0.15s ease',
                                                        }}
                                                        className="post-item-hover"
                                                    >
                                                        <Text
                                                            size="xs"
                                                            fw={isActive ? 600 : 400}
                                                            lineClamp={2}
                                                            c={isActive ? 'cyan.6' : 'bright'}
                                                        >
                                                            {post.title}
                                                        </Text>
                                                    </Box>
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

            <style>{`
                .section-header-hover:hover {
                    background-color: var(--mantine-color-default-hover);
                }
                .post-item-hover:hover {
                    background-color: var(--mantine-color-default-hover);
                }
            `}</style>
        </Paper>
    );
}

export default TutorialSidebar;
