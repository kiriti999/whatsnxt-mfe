import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Stack, Text, Textarea, Title } from '@mantine/core';
import { useCommentExpandTracker } from './contexts/comment-context';
import CommentCollapse from './Collapse';
import CommentConnector from './Connector';
import CommentActions from './CommentActions';
import { FormatCommentText, formatRelativeTime } from './helpers';
import { getReactionActions, useAddComment, useDeleteComment, useEditComment } from './actions';

const BlogComment = ({
    userId,
    email,
    comment,
    setComments,
    contentId,
    root = false,
    rootDepth,
    handleComments,
    handleSubComment,
    handleInsertNode,
    handleEditNode,
    handleDeleteNode
}: any) => {
    const { setCommentExpand, getCommentExpand, handleHeightCalculation } = useCommentExpandTracker();

    const commentId = comment?.id || '1';
    const [initiallyLoaded, setInitiallyLoaded] = useState(root);
    const [range, setRange] = useState({
        offset: root ? 5 : 3,
        limit: root ? 10 : 6,
    });
    const connectorElementRef = useRef(null);
    const isChildComment = !root && comment?.totalReply > 0;
    const editMode = getCommentExpand(commentId, 'E');
    const inputRef = useRef(null) as any;

    const onEditComment = useEditComment({ email, commentId, setCommentExpand, inputRef });
    const onDeleteComment = useDeleteComment({ email, handleDeleteNode, contentId, commentId });
    const { likeComment, dislikeComment, reportComment } = getReactionActions({
        email,
        handleEditNode,
        comment,
        setComments
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            comment: '',
        },
        resetOptions: {
            keepDirtyValues: false, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
    });

    const onAddComment = useAddComment({
        email,
        contentId,
        commentId,
        editMode,
        inputRef,
        handleEditNode,
        handleInsertNode,
        setCommentExpand,
        totalReply: comment.totalReply,
        reset,
        root
    });

    const validationOptions = {
        comment: {
            required: 'Input filed is required',
            minLength: {
                value: 2,
                message: 'Min 2 Characters required',
            },
        },
    };

    useEffect(() => {
        inputRef?.current?.focus();
    }, [getCommentExpand(commentId, 'E')]);

    const handleReplyBtn = () => {
        setCommentExpand(commentId, !getCommentExpand(commentId, 'I'), 'I');
    };

    const handleViewAllReplies = () => {
        setCommentExpand(commentId, !getCommentExpand(commentId, 'O'), 'O');

        if (!initiallyLoaded) {
            setInitiallyLoaded(true);
            handleSubComment(contentId, comment.id, 0, 5, email);
        }
    };

    const loadMore = () => {
        handleComments(
            contentId,
            comment.parents,
            range.offset,
            range.limit,
            email
        ).then((comments: any[]) => {
            if (comments.length === 0) return;
            setRange((prev) => ({
                offset: prev.offset + 5,
                limit: prev.limit + 5,
            }));
        }).then(() => {
            handleHeightCalculation()
        });
    };

    return (
        <div>
            {comment && <CommentConnector commentId={commentId} commentItems={comment.items} connectorElementRef={connectorElementRef} name={comment.name}>
                <>
                    <div>
                        {comment.id == 1 ? (
                            <div className="mtb-20">
                                <form onSubmit={handleSubmit(onAddComment)}>
                                    <Textarea
                                        autosize
                                        minRows={2}
                                        {...register('comment', validationOptions.comment)}
                                        withAsterisk
                                        placeholder="Use @username to tag someone"
                                    />
                                    {errors.comment && (
                                        <Text size="sm" c={'red'}>
                                            {errors.comment.message}
                                        </Text>
                                    )}
                                    <div className="d-flex justify-content-end">
                                        <Button disabled={!!errors.comment?.message} type="submit" mt="5" size='xs'>
                                            Submit
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div
                                className={`${comment.items?.length > 0
                                    ? `connector-${getCommentExpand(commentId, 'O') ? 'without' : ''}-input-${commentId}`
                                    : ''
                                    } ${comment.parents && comment.parents.length > 1 ? 'child-comment-connector ' : ''}`}
                            >
                                <div className="review-heading comment-heading">
                                    <div className="review-profile">
                                        <div className="review-avatar review-avatar-circle">
                                            {(comment.email || email)?.charAt(0)?.toUpperCase()}
                                        </div>
                                    </div>

                                    <Stack gap={0} mb={'xs'} mt={'sm'}>
                                        <Title size='xs' m={0} order={6} fz={12.5}>{(comment.email || email)?.split('@')[0]}</Title>
                                        <Text size='xs' style={{ opacity: '0.6' }} m={0}>
                                            {formatRelativeTime(comment?.updatedAt)}
                                        </Text>
                                    </Stack>
                                </div>
                                <div className="review-rating comment-name">
                                    <div contentEditable={editMode} ref={inputRef} suppressContentEditableWarning={editMode} key={comment.id} style={{ wordWrap: 'break-word' }}>
                                        <Text size='sm'>{FormatCommentText(comment.name)}</Text>
                                    </div>
                                    <CommentActions
                                        email={email}
                                        comment={comment}
                                        commentId={commentId}
                                        editMode={editMode}
                                        handleSubmit={handleSubmit}
                                        handleReplyBtn={handleReplyBtn}
                                        onEditComment={onEditComment}
                                        onDeleteComment={onDeleteComment}
                                        onAddComment={onAddComment}
                                        likeComment={likeComment}
                                        dislikeComment={dislikeComment}
                                        reportComment={reportComment}
                                        rootDepth={rootDepth}
                                        setCommentExpand={setCommentExpand}
                                        inputRef={inputRef}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`${root ? '' : 'comment-thread'}`}>
                        {getCommentExpand(commentId, 'I') && (
                            <div className="mtb-20">
                                <div style={{ position: 'relative' }}>
                                    <form onSubmit={handleSubmit(onAddComment)}>
                                        <div className={`comment-input-container ${!!errors.comment?.message ? 'comment-input-validation' : ''} `}>
                                            <Textarea
                                                variant="unstyled"
                                                autoFocus
                                                autosize
                                                {...register('comment', validationOptions.comment)}
                                                className="form-control input-comments"
                                                placeholder="Your comment here. Use @username to tag someone"
                                            />
                                            {!!errors.comment?.message && (
                                                <span className='error-text-reply-input'>
                                                    {errors.comment.message}
                                                </span>
                                            )}
                                            <div className="d-flex justify-content-end gap-1 mt-1 send-comment-container">
                                                <Button disabled={!!errors.comment?.message} type="submit" color="red" radius="lg" size='xs'>
                                                    Submit
                                                </Button>
                                                <Button type="button" color="blue" radius="lg" onClick={() => setCommentExpand(commentId, false, 'I')} size='xs'>
                                                    cancel
                                                </Button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                        <div>
                            <>
                                <CommentCollapse
                                    handleViewAllReplies={handleViewAllReplies}
                                    numOfReplies={comment.totalReply}
                                    commentParents={comment.parents}
                                    isOpen={getCommentExpand(commentId, 'O')}
                                    setIsOpen={setCommentExpand}
                                    commentId={commentId}
                                    isChildComment={isChildComment}
                                >
                                    <>
                                        {comment && comment?.items && comment?.items.map((item: any) => (
                                            <BlogComment
                                                userId={userId}
                                                email={email}
                                                rootDepth={rootDepth + 1}
                                                index={null}
                                                key={item.id}
                                                comment={item}
                                                setComments={setComments}
                                                contentId={contentId}
                                                handleInsertNode={handleInsertNode}
                                                handleEditNode={handleEditNode}
                                                handleDeleteNode={handleDeleteNode}
                                                handleComments={handleComments}
                                                handleSubComment={handleSubComment}
                                            />
                                        ))}
                                        {comment.items?.length && comment.totalReply && comment.totalReply > comment.items?.length && (
                                            <div style={{ marginLeft: '4rem', marginTop: '2rem', fontSize: '15px' }} onClick={loadMore} className="view-all-comment">
                                                Load more comments
                                            </div>
                                        )}
                                    </>
                                </CommentCollapse>
                                <div ref={connectorElementRef} key={commentId}>
                                    {comment.items && comment.items.slice(0, isChildComment ? 0 : comment.items?.length).map((item: any, index: number) => (
                                        <BlogComment
                                            userId={userId}
                                            email={email}
                                            rootDepth={rootDepth + 1}
                                            index={index}
                                            key={item.id}
                                            comment={item}
                                            setComments={setComments}
                                            contentId={contentId}
                                            handleInsertNode={handleInsertNode}
                                            handleEditNode={handleEditNode}
                                            handleDeleteNode={handleDeleteNode}
                                            handleComments={handleComments}
                                            handleSubComment={handleSubComment}
                                        />
                                    ))}
                                </div>
                            </>

                            {!isChildComment && comment?.items?.length === 5 && (
                                <div style={{ marginLeft: '4rem', marginTop: '2rem', fontSize: '15px' }} onClick={loadMore} className="view-all-comment">
                                    Load more comments
                                </div>
                            )}
                        </div>
                    </div>
                </>
            </CommentConnector>
            }
        </div>
    );
};

export default BlogComment;
