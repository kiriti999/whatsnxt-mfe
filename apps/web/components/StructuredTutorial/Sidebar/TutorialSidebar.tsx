'use client';

import React, { useState, useEffect } from 'react';
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
    Title,
    ScrollArea,
} from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import {
    IconChevronDown,
    IconChevronRight,
    IconFolder,
    IconFile,
    IconBook,
} from '@tabler/icons-react';
import { SidebarTree, SidebarSection, SidebarPost } from '../../../apis/v1/blog/structuredTutorialApi';

interface TutorialSidebarProps {
    sidebarData: SidebarTree;
    currentPostSlug?: string;
}

export function TutorialSidebar({ sidebarData, currentPostSlug }: TutorialSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Auto-expand section containing current post
    useEffect(() => {
        if (currentPostSlug && sidebarData.sections) {
            sidebarData.sections.forEach((section) => {
                const hasCurrentPost = section.posts.some((post) => post.slug === currentPostSlug);
                if (hasCurrentPost) {
                    setExpandedSections((prev) => new Set([...prev, section.id]));
                }
            });
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

    if (!sidebarData || !sidebarData.sections) {
        return null;
    }

    return (
        <Paper
            withBorder
            p="md"
            style={{
                position: 'sticky',
                top: '80px',
                maxHeight: 'calc(100vh - 100px)',
            }}
        >
            <Stack gap="sm">
                {/* Tutorial Header */}
                <Group gap="xs" mb="xs">
                    <ThemeIcon variant="light" size="lg" color="green">
                        <IconBook size={18} />
                    </ThemeIcon>
                    <Box style={{ flex: 1 }}>
                        <Text size="sm" fw={700} lineClamp={2}>
                            {sidebarData.tutorialTitle}
                        </Text>
                    </Box>
                </Group>

                <ScrollArea.Autosize mah="calc(100vh - 200px)">
                    <Stack gap={4}>
                        {sidebarData.sections.map((section, sectionIndex) => {
                            const isExpanded = expandedSections.has(section.id);
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
