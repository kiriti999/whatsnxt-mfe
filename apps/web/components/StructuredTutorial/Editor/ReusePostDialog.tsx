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
    Loader,
    Center,
} from '@mantine/core';
import { IconSearch, IconCopy, IconFile } from '@tabler/icons-react';
import { StructuredTutorialAPI, TutorialPost } from '../../../apis/v1/blog/structuredTutorialApi';
import { notifications } from '@mantine/notifications';

interface ReusePostDialogProps {
    opened: boolean;
    onClose: () => void;
    onReuse: (postId: string) => Promise<void>;
    excludeSectionId?: string;
}

export const ReusePostDialog: React.FC<ReusePostDialogProps> = ({
    opened,
    onClose,
    onReuse,
    excludeSectionId,
}) => {
    const [posts, setPosts] = useState<TutorialPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<TutorialPost[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [reusing, setReusing] = useState<string | null>(null);

    useEffect(() => {
        if (opened) {
            fetchAvailablePosts();
        }
    }, [opened, excludeSectionId]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredPosts(posts);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredPosts(
                posts.filter(
                    (post) =>
                        post.title.toLowerCase().includes(query) ||
                        post.description?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, posts]);

    const fetchAvailablePosts = async () => {
        setLoading(true);
        try {
            const response = await StructuredTutorialAPI.getAvailablePosts(excludeSectionId);
            if (response.success) {
                setPosts(response.data);
                setFilteredPosts(response.data);
            }
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to load available posts',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReuse = async (postId: string) => {
        setReusing(postId);
        try {
            await onReuse(postId);
            notifications.show({
                title: 'Success',
                message: 'Post copied successfully',
                color: 'green',
            });
            onClose();
        } catch (error) {
            notifications.show({
                title: 'Error',
                message: 'Failed to copy post',
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
            title="Reuse Post from Another Section"
            size="lg"
        >
            <Stack gap="md">
                <TextInput
                    placeholder="Search posts..."
                    leftSection={<IconSearch size={16} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {loading ? (
                    <Center p="xl">
                        <Loader />
                    </Center>
                ) : filteredPosts.length === 0 ? (
                    <Center p="xl">
                        <Text c="dimmed">No posts found</Text>
                    </Center>
                ) : (
                    <Stack gap="xs" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredPosts.map((post) => (
                            <Paper key={post._id} p="md" withBorder>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap="xs" style={{ flex: 1 }}>
                                        <Group gap="xs">
                                            <IconFile size={18} />
                                            <Text fw={500}>{post.title}</Text>
                                        </Group>
                                        {post.description && (
                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                {post.description}
                                            </Text>
                                        )}
                                        {post.sectionId && typeof post.sectionId === 'object' && (
                                            <Stack gap={4}>
                                                <Text size="xs" c="dimmed">
                                                    Section: {(post.sectionId as any).title || 'Unknown'}
                                                </Text>
                                                {(post.sectionId as any).structuredTutorialId &&
                                                    typeof (post.sectionId as any).structuredTutorialId === 'object' && (
                                                        <Text size="xs" c="dimmed">
                                                            Tutorial: {((post.sectionId as any).structuredTutorialId as any).title || 'Unknown'}
                                                        </Text>
                                                    )}
                                            </Stack>
                                        )}
                                    </Stack>
                                    <Button
                                        size="sm"
                                        leftSection={<IconCopy size={16} />}
                                        onClick={() => handleReuse(post._id)}
                                        loading={reusing === post._id}
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
