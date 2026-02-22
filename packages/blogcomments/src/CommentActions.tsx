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
    IconFlag,
} from '@tabler/icons-react';
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
}: any) => {
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
            <Flex align={'center'} mt={5} gap={'md'}>
                {editMode ? (
                    <>
                        <form onSubmit={handleSubmit(onAddComment)}>
                            <Button type="submit" radius={'xl'} size='xs'>
                                save
                            </Button>
                        </form>
                        <Button
                            type="button"
                            color="gray"
                            radius={'xl'}
                            size='xs'
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
                            <ActionIcon onClick={likeComment} variant='transparent' size='sm'>
                                {comment.hasLiked ? (
                                    <IconThumbUpFilled size={15} />
                                ) : (
                                    <IconThumbUp size={15} />
                                )}
                            </ActionIcon>
                            <Text size='xs'>{comment.likes || ''}</Text>
                        </Group>

                        <Group gap={'0.2rem'}>
                            <ActionIcon onClick={dislikeComment} variant='transparent' size='sm'>
                                {comment.hasDisliked ? (
                                    <IconThumbDownFilled size={15} />
                                ) : (
                                    <IconThumbDown size={15} />
                                )}
                            </ActionIcon>
                            <Text size='xs'>{comment.dislikes || ''}</Text>
                        </Group>


                        <Menu trigger="hover" openDelay={100} closeDelay={400} position="top" styles={{ dropdown: { zIndex: 199 } }}>
                            <Menu.Target>
                                <Button variant="transparent" p={0}>
                                    <IconDotsVertical size={15} />
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {!comment.hasFlagged && (
                                    <Menu.Item onClick={() => {
                                        reportComment();
                                    }}>
                                        <Flex gap={4}>
                                            <IconFlag size={15} />
                                            Report
                                        </Flex>
                                    </Menu.Item>
                                )}
                                {email === comment.email && (
                                    <>
                                        <Menu.Item onClick={onEditComment}>
                                            <Flex gap={4}>
                                                <IconEdit size={15} />
                                                Edit
                                            </Flex>
                                        </Menu.Item>
                                        <Menu.Item onClick={() => setIsDeleteModalOpen(true)}>
                                            <Flex gap={4}>
                                                <IconTrash size={15} />
                                                Delete
                                            </Flex>
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )
                }
            </Flex>
        </>
    );
};

export default CommentActions;
