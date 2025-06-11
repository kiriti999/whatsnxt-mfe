import {
    IconThumbUp,
    IconThumbDown,
    IconThumbUpFilled,
    IconThumbDownFilled,
    IconEdit,
    IconTrash,
} from "@tabler/icons-react";
import styles from '../../Comments/style.module.css';
import style from "../style.module.css";
import { useState } from 'react';
import { Button } from '@mantine/core';
import { CourseFeedbackAPI } from '../../../api/v1/courses/feedback/feedback';

function CommentActions({
    comment,
    onDeleteComment,
    onEditComment,
    userId,
    commentId,
    editMode,
    setEditMode,
    inputRef,
}) {
    const [commentLikeCount, setCommentLikeCount] = useState<number>(comment.likes);
    const [commentDisLikeCount, setCoommentDislikeCount] = useState<number>(comment.dislikes);
    const [hasLiked, setHasLiked] = useState(comment.likedBy.some(item => item === userId));
    const [hasDisliked, setHasDisliked] = useState(comment.disLikedBy.some(item => item === userId));

    const likeComment = async () => {
        const data = await CourseFeedbackAPI.toggleLike({ id: commentId, userId });
        updateLikesAndDisLike(data);
    };

    const dislikeComment = async () => {
        const data = await CourseFeedbackAPI.toggleDislike({ id: commentId, userId });
        updateLikesAndDisLike(data);
    };

    const updateLikesAndDisLike = (data) => {
        if (!data) return;
        setCommentLikeCount(data.data.likes);
        setHasLiked(data?.data.likedBy.some(item => item === userId));
        setCoommentDislikeCount(data?.data.dislikes);
        setHasDisliked(data?.data.disLikedBy.some(item => item === userId));
    };

    const deleteComment = async () => {
        const data = await CourseFeedbackAPI.deleteComment({ commentId });
        onDeleteComment(commentId);
    };

    const setEdit = () => {
        setEditMode(true);
        const editableElement = inputRef?.current;

        setTimeout(() => {
            editableElement.focus();
            const range = document.createRange();
            range.selectNodeContents(editableElement);
            range.collapse(false); // false to collapse at the end
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }, 100);
    };

    return (
        <div className="d-flex mt-2 align-items-center gap-3">
            {editMode ? (
                <>
                    <form onSubmit={onEditComment}>
                        <Button type="submit" className={style["update-review-btn"]} size='sm'>
                            save
                        </Button>
                    </form>
                    <Button size='sm'
                        type="button"
                        color="gray"
                        className="btn mx-1 comment-input-btn"
                        onClick={(e: any) => {
                            e.preventDefault();
                            if (inputRef.current) {
                                inputRef.current.innerText = comment.content;
                            }
                            setEditMode(false);
                        }}
                    >
                        cancel
                    </Button>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        className={`btn ${styles['review-options']}`}
                        onClick={likeComment}
                    >
                        <span className="d-flex align-items-center gap-1">
                            {hasLiked ? <IconThumbUpFilled size={20} /> : <IconThumbUp size={20} />}
                            <strong>{commentLikeCount || ''}</strong>
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`btn ${styles['review-options']} `}
                        onClick={dislikeComment}
                    >
                        <span className="d-flex align-items-center gap-1">
                            {hasDisliked ? <IconThumbDownFilled size={20} /> : <IconThumbDown size={20} />}
                            <strong>{commentDisLikeCount || ''}</strong>
                        </span>
                    </button>
                    {userId === comment.author && comment.is_editable && (
                        <span className="d-flex align-items-center">
                            <IconEdit
                                className="mx-2"
                                size={18}
                                onClick={setEdit}
                                role="button"
                            />
                            <IconTrash
                                className="mx-2"
                                size={18}
                                onClick={deleteComment}
                                role="button"
                            />
                        </span>
                    )}
                </>
            )}
        </div>
    );
}

export default CommentActions;