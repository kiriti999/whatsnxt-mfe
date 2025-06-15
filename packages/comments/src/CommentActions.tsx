import React, { useState } from 'react';
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
}) => {
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
            <Flex align={'center'} mt={2} gap={'sm'}>
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
                        {rootDepth < 5 && comment.totalReply <= 0 && (
                            <Button variant="transparent" onClick={handleReplyBtn} px={0}>
                                <Title c={'blue'} order={6} fz='xs'>Reply</Title>
                            </Button>
                        )}

                        <Group gap={'0.2rem'}>
                            <ActionIcon onClick={likeComment} variant='transparent'>
                                {comment.hasLiked ? (
                                    <IconThumbUpFilled size={18} />
                                ) : (
                                    <IconThumbUp size={18} />
                                )}
                            </ActionIcon>
                            <Text size='xs'>{comment.likes || ''}</Text>
                        </Group>

                        <Group gap={'0.2rem'}>
                            <ActionIcon onClick={dislikeComment} variant='transparent'>
                                {comment.hasDisliked ? (
                                    <IconThumbDownFilled size={18} />
                                ) : (
                                    <IconThumbDown size={18} />
                                )}
                            </ActionIcon>
                            <Text size='xs'>{comment.dislikes || ''}</Text>
                        </Group>

                        <Menu trigger="hover" openDelay={100} closeDelay={400} position="top" styles={{ dropdown: { zIndex: 199 } }}>
                            <Menu.Target>
                                <Button variant="transparent" p={0}>
                                    <IconDotsVertical size={18} />
                                </Button>
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
            </Flex >
        </>
    );
};

export default CommentActions;
