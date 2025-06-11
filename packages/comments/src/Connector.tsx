import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useCommentExpandTracker } from './contexts/comment-context';
import { useNestedCommentLoadTracker } from './contexts/comment-reply-context';
import type { CommentConnectorProps, CommentContainerProps } from './types';
import { useMediaQuery } from '@mantine/hooks';

const CommentConnector = ({
  commentId,
  commentItems,
  connectorElementRef,
  name,
  children
}: CommentConnectorProps) => {
  const { isEdit, showInput, isCollepseOpen, heightCalculateFlag } = useCommentExpandTracker();
  const nestedCommentesLoaded = useNestedCommentLoadTracker()
  const [commentContainerHeight, setCommentContainerHeight] = useState(0);
  const commentRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');


  useEffect(() => {
    if (commentRef.current && connectorElementRef.current) {
      const firstElementRect = commentRef.current.getBoundingClientRect();
      const targetElementRect = connectorElementRef.current.getBoundingClientRect();

      // Normalize the top coordinates
      const normalizedFirstElementTop = firstElementRect.height;
      const normalizedTargetElementTop = targetElementRect.height;

      // Calculate the difference using the normalized coordinates
      const difference = Math.abs(normalizedFirstElementTop - normalizedTargetElementTop);

      setCommentContainerHeight(difference)
    }

  }, [isEdit, showInput, isCollepseOpen, commentItems, nestedCommentesLoaded, heightCalculateFlag]);

  return (
    <CommentContainer commentId={commentId} $commentHeight={commentContainerHeight} ref={commentRef} isMobile={isMobile}>
      {children}
    </CommentContainer>
  );
};

const CommentContainer = styled.div<CommentContainerProps>`
  .connector-with-input-${props => props.commentId},
  .connector-without-input-${props => props.commentId} {
    height: fit-content;
    position: relative;
  }

  .connector-with-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 23px;
    top: 48px;
    bottom: ${({ $commentHeight }) => `-${66}px`};
    width: 2px;
    background: #bbaaaa96;
  }

  .connector-without-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 23px;
    top: 31px;
    left: 15px;
    bottom: ${({ $commentHeight }) => `-${48}px`};
    width: 1.5px;
    background: #bbaaaa96;
  }

  .review-rating.comment-name {
    margin-left:3rem;
  }

  .child-comment-connector {
    height: fit-content;
    position: relative;
  }

  .child-comment-connector::before {
    content: "";
    position: absolute;
    top: -1px;
    left: ${({ isMobile }) => (isMobile ? "-20px" : "-17px")};
    height: 18px;
    width: 19px;
    -webkit-border-start: 1.5px solid #bbaaaa96;
    border-inline-start: 1.5px solid #bbaaaa96;
    border-bottom: 1.5px solid #bbaaaa96;
    background: transparent;
    border-end-start-radius: 10px;
  }

  .child-connector input {
    height: 35px !important;
    margin-left: 1.2rem;
  }

  .view-all-comment {
    font-size: 14px;
    line-height: 24px;
    font-weight: 600;
    color: #606060;
    cursor: pointer;
    margin-left: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    width:fit-content
  }

  .view-all-comment.load-more {
    margin-left: 4rem;
    margin-top: 2rem;
    font-size: 15px;
  }

  .view-all-comment:hover {
    color: #fe4a55;
  }

  .comment-thread {
    padding-left: 32px;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .comment-input-btn {
    border-radius: 20px !important;
    padding: 4px 13px !important;
    font-size: 14px !important;
  }

  .comment-input-submit-btn {
    background-color:#fe4a55;
    color:"white";
    border-color:#fe4a55;
  }

  .send-comment-container {
    position:absolute;
    right: 0.5rem;
    top: 74%;
    transform: translateY(-50%);
  }
  .error-text-reply-input {
      font-size: 13px;
      top: 93px;
      position: absolute;
      color: red;
  }

  .message-validation-comment-input {
    margin-left: 1rem !important
  }

  .input-comments {
    outline: none;
    border-radius: 10px;
    font-size: 14px;
    border: none;
    width: 100%;
    height: 47px; 
    overflow-y: auto; 
    resize: none;
    background-color: transparent;
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: #8d8d8d36 transparent; /* For Firefox */
  }

  /* For Chrome, Edge, and Safari */
  .input-comments::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .input-comments::-webkit-scrollbar-thumb {
    background-color: #8d8d8d36;
    border-radius: 5px;
  }

  .input-comments::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .comment-input-container {
    outline: none;
    border-radius: 5px;
    font-size: 14px;
    border: 1px solid #ced4da !important;
    padding: 5px 1px 34px 6px;
    width: 98.3%;
    margin-left: 0.8rem;
    height: 93px; 
  }

  .comment-input-validation {
    border-color:#fe4a55 !important
  }

  @media only screen and (max-width: 767px) {
    .comment-thread {
      padding-left: 35px;
      margin-top: 1rem;
    }
    .child-connector input {
      height: 30px !important;
      margin-left: 0.5rem;
    }

    .input-comments {
       width: 95%;
    }

    .comment-input-container {
       width: 96%;
    }
  }
`;

export default CommentConnector;
