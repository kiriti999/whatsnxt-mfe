"use client";

import {
    ActionIcon,
    Box,
    Collapse,
    Divider,
    Group,
    Paper,
    ScrollArea,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import {
    IconChevronDown,
    IconChevronRight,
    IconChevronsDown,
    IconChevronsUp,
    IconEye,
    IconLayoutSidebarLeftCollapse,
    IconLock,
    IconSearch,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
    SidebarPost,
    SidebarSection,
    SidebarTree,
} from "../../../apis/v1/blog/structuredTutorialApi";

interface TutorialSidebarProps {
    sidebarData: SidebarTree;
    currentPostSlug?: string;
    onCollapse?: () => void;
    isMobile?: boolean;
    hasUserAccess?: boolean;
    accessChecked?: boolean;
}

export function TutorialSidebar({
    sidebarData,
    currentPostSlug,
    onCollapse,
    isMobile = false,
    hasUserAccess = false,
    accessChecked = true,
}: TutorialSidebarProps) {
    const router = useRouter();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(),
    );
    const [searchQuery, setSearchQuery] = useState("");

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
                    post.title.toLowerCase().includes(lowerQuery),
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
            const activeSection = sidebarData.sections.find((section) =>
                section.posts.some((post) => post.slug === currentPostSlug),
            );

            if (activeSection) {
                setExpandedSections((prev) => {
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

    const navigateToPost = (post: SidebarPost) => {
        // Always navigate to the post — the content page shows PremiumPaywall when locked
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
            sidebarData?.sections?.forEach((section) => {
                allIds.add(section.id);
            });
            setExpandedSections(allIds);
        }
    };

    const allSectionsExpanded =
        sidebarData?.sections?.every((section) =>
            expandedSections.has(section.id),
        ) ?? false;

    if (!sidebarData || !sidebarData.sections) {
        return null;
    }

    return (
        <Paper
            ref={ref}
            withBorder={false}
            p={0}
            style={{
                position: "sticky",
                top: "80px",
                maxHeight: "calc(100vh - 100px)",
                backgroundColor: "transparent",
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
                                aria-label={
                                    allSectionsExpanded
                                        ? "Collapse all sections"
                                        : "Expand all sections"
                                }
                                title={allSectionsExpanded ? "Collapse all" : "Expand all"}
                            >
                                {allSectionsExpanded ? (
                                    <IconChevronsUp size={18} />
                                ) : (
                                    <IconChevronsDown size={18} />
                                )}
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
                                backgroundColor: "var(--mantine-color-default)",
                                border: "1px solid var(--mantine-color-default-border)",
                            },
                        }}
                    />
                </Box>

                <Divider />

                <ScrollArea.Autosize mah="calc(100vh - 280px)">
                    <Stack gap={0} py="xs">
                        {filteredSections.map((section) => {
                            const isExpanded = searchQuery
                                ? true
                                : expandedSections.has(section.id);

                            return (
                                <Box key={section.id}>
                                    {/* Section Header */}
                                    <Box
                                        px="md"
                                        py="xs"
                                        onClick={() => toggleSection(section.id)}
                                        style={{
                                            cursor: "pointer",
                                            transition: "background-color 0.15s ease",
                                        }}
                                        className="section-header-hover"
                                    >
                                        <Group gap="sm" wrap="nowrap" justify="space-between">
                                            <Text
                                                size="xs"
                                                fw={600}
                                                lineClamp={2}
                                                c="bright"
                                                style={{ flex: 1 }}
                                            >
                                                {section.title}
                                            </Text>
                                            <Group gap="xs" wrap="nowrap">
                                                {sidebarData.isPremium && accessChecked && !hasUserAccess &&
                                                    (section.isFreePreview ? (
                                                        <IconEye
                                                            size={14}
                                                            color="var(--mantine-color-teal-6)"
                                                            aria-label="Free preview"
                                                        />
                                                    ) : (
                                                        <IconLock
                                                            size={14}
                                                            color="var(--mantine-color-yellow-6)"
                                                            aria-label="Premium only"
                                                        />
                                                    ))}
                                                <Text size="xs" c="dimmed">
                                                    0/{section.posts.length}
                                                </Text>
                                                {isExpanded ? (
                                                    <IconChevronDown size={16} />
                                                ) : (
                                                    <IconChevronRight size={16} />
                                                )}
                                            </Group>
                                        </Group>
                                    </Box>

                                    {/* Posts */}
                                    <Collapse in={isExpanded}>
                                        <Stack gap={0}>
                                            {section.posts.map((post) => {
                                                const isActive = post.slug === currentPostSlug;
                                                const isSectionLocked =
                                                    sidebarData.isPremium && !section.isFreePreview && accessChecked && !hasUserAccess;

                                                return (
                                                    <Box
                                                        key={post.id}
                                                        px="md"
                                                        py="xs"
                                                        pl="lg"
                                                        onClick={() => navigateToPost(post)}
                                                        style={{
                                                            cursor: "pointer",
                                                            backgroundColor: isActive
                                                                ? "var(--mantine-primary-color-light)"
                                                                : "transparent",
                                                            borderLeft: isActive
                                                                ? "3px solid var(--mantine-primary-color-filled)"
                                                                : "3px solid transparent",
                                                            transition: "all 0.15s ease",
                                                            opacity: isSectionLocked ? 0.5 : 1,
                                                        }}
                                                        className="post-item-hover"
                                                    >
                                                        <Group gap={6} wrap="nowrap">
                                                            {isSectionLocked && (
                                                                <IconLock
                                                                    size={12}
                                                                    color="var(--mantine-color-yellow-6)"
                                                                />
                                                            )}
                                                            <Text
                                                                size="xs"
                                                                fw={isActive ? 600 : 400}
                                                                lineClamp={2}
                                                                c={isActive ? "cyan.6" : "bright"}
                                                            >
                                                                {post.title}
                                                            </Text>
                                                        </Group>
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
