/**
 * DraggablePostsList Component
 * Feature: 002-reusable-sections
 * Task: T051 [US4]
 * 
 * Drag-and-drop reorderable list of posts within a section.
 * Updates sectionOrder field when posts are reordered.
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Group,
  Text,
  Paper,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PostsAPI, type Post } from '../../apis/v1/sidebar/postsApi';

interface DraggablePostsListProps {
  posts: Post[];
  sectionId: string;
  onPostsReordered?: (posts: Post[]) => void;
  onPostDeleted?: (postId: string) => void;
  allowDelete?: boolean;
}

/**
 * DraggablePostItem - Individual sortable post item
 */
interface DraggablePostItemProps {
  post: Post;
  index: number;
  allowDelete: boolean;
  onDelete: (postId: string) => void;
}

const DraggablePostItem: React.FC<DraggablePostItemProps> = ({
  post,
  index,
  allowDelete,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      p="xs"
      withBorder
      {...attributes}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
          <div
            {...listeners}
            style={{
              cursor: 'grab',
              touchAction: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <IconGripVertical size={16} style={{ color: 'var(--mantine-color-gray-5)' }} />
          </div>

          <Text size="sm" style={{ flex: 1 }}>
            {post.title}
          </Text>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Badge size="xs" variant="light" color="gray">
            {index + 1}
          </Badge>

          {allowDelete && (
            <Tooltip label="Delete post">
              <ActionIcon
                size="sm"
                variant="subtle"
                color="red"
                onClick={() => onDelete(post._id)}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Paper>
  );
};

/**
 * DraggablePostsList - Drag-and-drop sortable posts list
 * 
 * Features:
 * - Drag-and-drop reordering
 * - Optimistic UI updates
 * - API sync on drop
 * - Rollback on error
 * 
 * Usage:
 * ```tsx
 * <DraggablePostsList
 *   posts={posts}
 *   sectionId={sectionId}
 *   onPostsReordered={(reorderedPosts) => setPosts(reorderedPosts)}
 *   allowDelete={true}
 * />
 * ```
 */
export const DraggablePostsList: React.FC<DraggablePostsListProps> = ({
  posts: initialPosts,
  sectionId,
  onPostsReordered,
  onPostDeleted,
  allowDelete = false,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local state when props change
  React.useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = posts.findIndex((p) => p._id === active.id);
    const newIndex = posts.findIndex((p) => p._id === over.id);

    // Optimistic update
    const reorderedPosts = arrayMove(posts, oldIndex, newIndex);
    setPosts(reorderedPosts);

    // Notify parent
    if (onPostsReordered) {
      onPostsReordered(reorderedPosts);
    }

    // Sync with API
    setIsReordering(true);
    try {
      await PostsAPI.reorderPost(active.id as string, newIndex);
      
      notifications.show({
        title: 'Success',
        message: 'Post order updated',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Failed to reorder post:', error);
      
      // Rollback on error
      setPosts(initialPosts);
      if (onPostsReordered) {
        onPostsReordered(initialPosts);
      }

      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to reorder post',
        color: 'red',
      });
    } finally {
      setIsReordering(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await PostsAPI.deletePost(postId);
      
      // Update local state
      const updatedPosts = posts.filter((p) => p._id !== postId);
      setPosts(updatedPosts);
      
      if (onPostDeleted) {
        onPostDeleted(postId);
      }

      notifications.show({
        title: 'Success',
        message: 'Post deleted',
        color: 'green',
      });
    } catch (error: any) {
      console.error('Failed to delete post:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.message || 'Failed to delete post',
        color: 'red',
      });
    }
  };

  if (posts.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        No posts in this section
      </Text>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={posts.map((p) => p._id)}
        strategy={verticalListSortingStrategy}
      >
        <Box style={{ opacity: isReordering ? 0.7 : 1, pointerEvents: isReordering ? 'none' : 'auto' }}>
          {posts.map((post, index) => (
            <Box key={post._id} mb="xs">
              <DraggablePostItem
                post={post}
                index={index}
                allowDelete={allowDelete}
                onDelete={handleDeletePost}
              />
            </Box>
          ))}
        </Box>
      </SortableContext>
    </DndContext>
  );
};
