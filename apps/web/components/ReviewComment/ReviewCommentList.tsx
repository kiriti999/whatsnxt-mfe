import { FormEvent, useRef, useState } from "react";
import { formatRelativeTime, FormatText } from "../Comments/helper"
import CommentActions from "./actions/CommentActions"
import { useRouter } from "next/navigation";
import React from 'react';
import { Avatar, Flex } from "@mantine/core";
import { CourseFeedbackAPI } from '../../apis/v1/courses/feedback/feedback';

function ReviewCommentList({
    comment,
    email,
    userId,
    setComments
}) {
    const inputRef = useRef(null) as any;
    const [editMode, setEditMode] = useState(false);
    const router = useRouter();
    const removeComment = (id: string) => {
        setComments(prevState => prevState.filter(item => item._id !== id))
    }

    const onEditComment = async (event: FormEvent) => {
        event.preventDefault();
        if (!email) {
            router.push('/auth/authentication');
            return;
        }

        const updatedComment = await CourseFeedbackAPI.updateComment({
            content: inputRef.current.innerText,
            commentId: comment._id
        })

        setComments(prevState => {
            if (prevState._id === comment._id) {
                return { ...prevState, content: updatedComment?.content }
            } else {
                return prevState
            }
        })

        setEditMode(false);
    }

    return (
        <div key={comment?._id}>
            <div className="review-heading comment-heading mt-2">
                <div className="review-profile">
                    <Avatar color="#fe4a55">{(comment.email || email)?.charAt(0)?.toUpperCase() || '?'}</Avatar>
                </div>

                <Flex align="center" gap="sm">
                    <b>{comment?.email || email || 'Author'}</b>
                    <p style={{ opacity: '0.6' }}>
                        {formatRelativeTime(comment?.updatedAt)}
                    </p>
                </Flex>

            </div>
            <div contentEditable={editMode} ref={inputRef} suppressContentEditableWarning={editMode} style={{ wordWrap: 'break-word' }}>
                {FormatText(comment?.content)}
            </div>
            <CommentActions
                comment={comment}
                onEditComment={onEditComment}
                onDeleteComment={removeComment}
                userId={userId}
                commentId={comment._id}
                editMode={editMode}
                setEditMode={setEditMode}
                inputRef={inputRef}
            />
        </div>
    )
}

export default ReviewCommentList