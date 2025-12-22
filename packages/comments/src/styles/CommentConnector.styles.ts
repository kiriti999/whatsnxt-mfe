import styled from 'styled-components';
import { CommentContainerProps } from '../types';

export const CommentContainer = styled.div<CommentContainerProps>`
  .connector-with-input-${props => props.commentId},
  .connector-without-input-${props => props.commentId} {
    height: fit-content;
    position: relative;
  }

  .connector-with-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 14px;
    top: 32px;
    bottom: ${({ $commentHeight }) => `-${66}px`};
    width: 2px;
    background: #bbaaaa96;
  }

  .connector-without-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 14px;
    top: 27px;
    left: 14px;
    bottom: ${({ $commentHeight }) => `-${55}px`};
    width: 1.5px;
    background: #bbaaaa96;
  }

  .comment-content-wrapper {
    margin-left: 36px;
  }

  .child-comment-connector {
    height: fit-content;
    position: relative;
  }

  .child-comment-connector::before {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ isMobile }) => (isMobile ? "-21px" : "-14px")};
    height: 14px;
    width: ${({ isMobile }) => (isMobile ? "21px" : "15px")};
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
    margin-left: 36px;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    width:fit-content
  }

  .view-all-comment.load-more {
    margin-left: 36px;
    margin-top: 1rem;
    font-size: 14px;
  }

  .view-all-comment:hover {
    color: #fe4a55;
  }

  .comment-thread {
    padding-left: 28px;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
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
    right: 1.5rem;
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