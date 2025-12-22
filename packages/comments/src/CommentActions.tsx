import React, { useState, RefObject } from 'react';
import { ActionIcon, Button, Menu, Title, Text, Group, Flex } from '@mantine/core';
import {
    IconThumbUp,
    IconThumbDown,
    IconThumbUpFilled,
    IconThumbDownFilled,
    IconDotsVertical,
    IconEdit,
    IconTrash,
    IconFlag
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import DeleteConfirmationModal from './modals/DeleteConfirmation';
import DiscardModal from './modals/Discard';

interface CommentData {
    name: string;
    email: string;
    hasLiked: boolean;
    hasDisliked: boolean;
    hasFlagged: boolean;
    likes: number;
    dislikes: number;
    totalReply: number;
}

interface CommentActionsProps {
    email: string;
    comment: CommentData;
    commentId: number;
    editMode: boolean;
    handleSubmit: (fn: (data: unknown) => void) => (e: React.FormEvent) => void;
    handleReplyBtn: () => void;
    onEditComment: (e?: React.MouseEvent | React.FormEvent) => void;
    onDeleteComment: () => void;
    onAddComment: (data: unknown) => void;
    likeComment: () => void;
    dislikeComment: () => void;
    reportComment: () => void;
    rootDepth: number;
    setCommentExpand: (id: number, value: boolean, type?: 'E' | 'I' | 'O') => void;
    inputRef: RefObject<HTMLDivElement | null>;
}

const CommentActions = ({
    email,
    comment,
    commentId,
    editMode,
    handleSubmit,
    handleReplyBtn,
    onEditComment,
    onDeleteComment,
    onAddComment,
    likeComment,
    dislikeComment,
    reportComment,
    rootDepth,
    setCommentExpand,
    inputRef,
}: CommentActionsProps) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

    function onCommentDiscard() {
        if (inputRef.current) {
            inputRef.current.innerText = comment.name;
        }
        setCommentExpand(commentId, false, 'E');
        setIsDiscardModalOpen(false);
    }

    return (
        <>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                setIsOpen={setIsDeleteModalOpen}
                onDeleteComment={onDeleteComment}
            />
            <DiscardModal
                isOpen={isDiscardModalOpen}
                setIsOpen={setIsDiscardModalOpen}
                onCommentDiscard={onCommentDiscard}
            />
            <Flex align={'center'} mt={4} gap={8}>
                {editMode ? (
                    <>
                        <form onSubmit={handleSubmit(onAddComment)}>
                            <Button type="submit" radius={'xl'} size='xs'>
                                save
                            </Button>
                        </form>
                        <Button size='xs'
                            type="button"
                            color="gray"
                            radius={'xl'}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsDiscardModalOpen(true);
                            }}
                        >
                            cancel
                        </Button>
                    </>
                ) : (
                    <>
                        {/* Like/Dislike group */}
                        <Group gap={2}>
                            <ActionIcon onClick={likeComment} variant='transparent' size="sm">
                                {comment.hasLiked ? (
                                    <IconThumbUpFilled size={16} />
                                ) : (
                                    <IconThumbUp size={16} />
                                )}
                            </ActionIcon>
                            {comment.likes > 0 && <Text size='xs' c="dimmed">{comment.likes}</Text>}
                            <ActionIcon onClick={dislikeComment} variant='transparent' size="sm">
                                {comment.hasDisliked ? (
                                    <IconThumbDownFilled size={16} />
                                ) : (
                                    <IconThumbDown size={16} />
                                )}
                            </ActionIcon>
                            {comment.dislikes > 0 && <Text size='xs' c="dimmed">{comment.dislikes}</Text>}
                        </Group>

                        {/* Reply button */}
                        {rootDepth < 5 && comment.totalReply <= 0 && (
                            <Button variant="transparent" onClick={handleReplyBtn} px={4} py={0} size="xs">
                                <Text c={'blue'} fz='xs' fw={600}>Reply</Text>
                            </Button>
                        )}

                        {/* More actions menu */}
                        <Menu trigger="hover" openDelay={100} closeDelay={400} position="top" styles={{ dropdown: { zIndex: 199 } }}>
                            <Menu.Target>
                                <ActionIcon variant="transparent" size="sm">
                                    <IconDotsVertical size={16} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {!comment.hasFlagged && (
                                    <Menu.Item onClick={() => {
                                        reportComment();
                                        notifications.show({
                                            position: 'bottom-right',
                                            title: 'Comment flagged',
                                            message: 'Comment has been reported',
                                            color: 'green',
                                        })
                                    }}>
                                        <IconFlag size={16} /> Report
                                    </Menu.Item>
                                )}
                                {email === comment.email && (
                                    <>
                                        <Menu.Item onClick={onEditComment}>
                                            <IconEdit size={16} /> Edit
                                        </Menu.Item>
                                        <Menu.Item onClick={() => setIsDeleteModalOpen(true)}>
                                            <IconTrash size={16} /> Delete
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )}
            </Flex>
        </>
    );
};

export default CommentActions;
