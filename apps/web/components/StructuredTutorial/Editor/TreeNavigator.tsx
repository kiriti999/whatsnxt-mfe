'use client';

import React from 'react';
import {
    Box,
    Stack,
    Group,
    Text,
    ActionIcon,
    Tooltip,
    Badge,
    Paper,
    UnstyledButton,
} from '@mantine/core';
import {
    IconBook,
    IconFolder,
    IconFile,
    IconPlus,
    IconTrash,
    IconCopy,
    IconChevronDown,
    IconChevronRight,
    IconLink,
    IconCircleDot,
} from '@tabler/icons-react';
import { TreeNode, SelectedNode } from './types';

interface TreeNavigatorProps {
    tutorialTitle: string;
    sections: TreeNode[];
    selectedNode: SelectedNode;
    expandedNodes: Set<string>;
    onSelectNode: (node: SelectedNode) => void;
    onToggleExpand: (nodeId: string) => void;
    onAddSection: () => void;
    onAddPost: (sectionId: string) => void;
    onAddMCQ: (sectionId: string) => void;
    onDeleteSection: (sectionId: string) => void;
    onDeletePost: (sectionId: string, postId: string) => void;
    onReuseSection: () => void;
    onReusePost: (sectionId: string) => void;
    isPublished?: boolean;
}

export const TreeNavigator: React.FC<TreeNavigatorProps> = ({
    tutorialTitle,
    sections,
    selectedNode,
    expandedNodes,
    onSelectNode,
    onToggleExpand,
    onAddSection,
    onAddPost,
    onAddMCQ,
    onDeleteSection,
    onDeletePost,
    onReuseSection,
    onReusePost,
    isPublished,
}) => {
    const isSelected = (type: string, id: string | null) => {
        return selectedNode.type === type && selectedNode.id === id;
    };

    return (
        <Box h="100%" style={{ overflowY: 'auto' }}>
            <Stack gap="xs" p="md">
                {/* Tutorial Root Node */}
                <Paper
                    p="sm"
                    withBorder
                    style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected('tutorial', null) ? 'var(--mantine-color-blue-0)' : undefined,
                    }}
                    onClick={() => onSelectNode({ type: 'tutorial', id: null })}
                >
                    <Group justify="space-between">
                        <Group gap="xs">
                            <IconBook size={20} />
                            <Text fw={600}>{tutorialTitle || 'New Tutorial'}</Text>
                            {isPublished && (
                                <Badge size="sm" color="green" variant="light">
                                    Published
                                </Badge>
                            )}
                        </Group>
                    </Group>
                </Paper>

                {/* Sections */}
                <Stack gap="xs" ml="md">
                    {sections.map((section, sectionIndex) => (
                        <Box key={section.id || sectionIndex}>
                            {/* Section Node */}
                            <Paper
                                p="sm"
                                withBorder
                                style={{
                                    backgroundColor: isSelected('section', section.id)
                                        ? 'var(--mantine-color-blue-0)'
                                        : undefined,
                                }}
                            >
                                <Group justify="space-between" wrap="nowrap">
                                    <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleExpand(section.id);
                                            }}
                                        >
                                            {expandedNodes.has(section.id) ? (
                                                <IconChevronDown size={16} />
                                            ) : (
                                                <IconChevronRight size={16} />
                                            )}
                                        </ActionIcon>
                                        <UnstyledButton
                                            onClick={() => onSelectNode({ type: 'section', id: section.id })}
                                            style={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Group gap="xs" wrap="nowrap">
                                                <IconFolder size={18} />
                                                <Text fw={500} truncate>
                                                    {section.title}
                                                </Text>
                                                <Badge size="sm" variant="light">
                                                    {section.children?.length || 0} posts
                                                </Badge>
                                                {section.isReused && (
                                                    <Tooltip label="Reused section">
                                                        <IconLink size={14} />
                                                    </Tooltip>
                                                )}
                                            </Group>
                                        </UnstyledButton>
                                    </Group>
                                    <Group gap={4} wrap="nowrap">
                                        <Tooltip label="Add Content Post">
                                            <ActionIcon
                                                size="sm"
                                                color="teal"
                                                variant="subtle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddPost(section.id);
                                                }}
                                            >
                                                <IconPlus size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Add MCQ Quiz">
                                            <ActionIcon
                                                size="sm"
                                                color="violet"
                                                variant="subtle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddMCQ(section.id);
                                                }}
                                            >
                                                <IconCircleDot size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Reuse Post">
                                            <ActionIcon
                                                size="sm"
                                                color="blue"
                                                variant="subtle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReusePost(section.id);
                                                }}
                                            >
                                                <IconCopy size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label="Delete Section">
                                            <ActionIcon
                                                size="sm"
                                                color="red"
                                                variant="subtle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteSection(section.id);
                                                }}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Group>
                            </Paper>

                            {/* Posts under this section */}
                            {expandedNodes.has(section.id) && section.children && (
                                <Stack gap="xs" ml="xl" mt="xs">
                                    {section.children.map((post, postIndex) => (
                                        <Paper
                                            key={post.id || postIndex}
                                            p="sm"
                                            withBorder
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected('post', post.id)
                                                    ? 'var(--mantine-color-blue-0)'
                                                    : undefined,
                                            }}
                                            onClick={() =>
                                                onSelectNode({
                                                    type: 'post',
                                                    id: post.id,
                                                    sectionId: section.id,
                                                })
                                            }
                                        >
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                                                    <IconFile size={16} />
                                                    <Text size="sm" truncate>
                                                        {post.title}
                                                    </Text>
                                                    {post.isReused && (
                                                        <Tooltip label="Reused post">
                                                            <IconLink size={12} />
                                                        </Tooltip>
                                                    )}
                                                </Group>
                                                <Tooltip label="Delete Post">
                                                    <ActionIcon
                                                        size="sm"
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeletePost(section.id, post.id);
                                                        }}
                                                    >
                                                        <IconTrash size={14} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </Group>
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    ))}

                    {/* Add Section Button */}
                    <Group gap="xs">
                        <Tooltip label="Add New Section">
                            <ActionIcon variant="light" color="blue" onClick={onAddSection}>
                                <IconPlus size={18} />
                            </ActionIcon>
                        </Tooltip>
                        <Text size="sm" c="dimmed">
                            Add Section
                        </Text>
                        <Tooltip label="Reuse Section from Another Tutorial">
                            <ActionIcon variant="light" color="teal" onClick={onReuseSection}>
                                <IconCopy size={18} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Stack>
            </Stack>
        </Box>
    );
};
