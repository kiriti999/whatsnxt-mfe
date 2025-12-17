import styled from 'styled-components';
import { CommentContainerProps } from '../types/CommentConnector.types';

export const CommentContainer = styled.div<CommentContainerProps>`
  .connector-with-input-${props => props.commentId},
  .connector-without-input-${props => props.commentId} {
    height: fit-content;
    position: relative;
  }

  .connector-with-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 15px;
    top: 48px;
    bottom: ${({ commentHeight }) => `-${66}px`};
    width: 2px;
    background: #bbaaaa96;
  }

  .connector-without-input-${props => props.commentId}::after {
    content: "";
    position: absolute;
    inset-inline-start: 15px;
    top: 31px;
    bottom: ${({ commentHeight }) => `-${48}px`};
    width: 1.5px;
    background: #bbaaaa96;
  }

  .child-comment-connector {
    height: fit-content;
    position: relative;
  }

  .child-comment-connector::before {
    content: "";
    position: absolute;
    top: -1px;
    left: ${({ isMobile }) => (isMobile ? "-30px" : "-17px")};
    height: 18px;
    width: 17px;
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
    margin: 1rem 0;
    margin-left: 1rem;
    width: fit-content;
  }

  .view-all-comment:hover {
    color: #fe4a55;
  }

  .comment-thread {
    padding-left: 32px;
    margin: 0.5rem 0;
  }

  .comment-input-btn {
    border-radius: 20px !important;
    padding: 4px 13px !important;
    font-size: 14px !important;
  }

  .comment-input-submit-btn {
    background-color: #fe4a55;
    color: white;
    border-color: #fe4a55;
  }

  .send-comment-container {
    position: absolute;
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
    margin-left: 1rem !important;
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
    scrollbar-width: thin;
    scrollbar-color: #8d8d8d36 transparent;
  }

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
    border-color: #fe4a55 !important;
  }

  @media only screen and (max-width: 767px) {
    .comment-thread {
      padding-left: 50px;
      margin-top: 1rem;
    }
    .child-connector input {
      height: 30px !important;
      margin-left: 0.5rem;
    }

    .child-comment-connector::before {
      content: "";
      position: absolute;
      inset-inline-start: -35px;
      top: -1px;
      height: 18px;
      width: 35px;
      -webkit-border-start: 1.5px solid #bbaaaa96;
      border-inline-start: 1.5px solid #bbaaaa96;
      border-bottom: 1.5px solid #bbaaaa96;
      background: transparent;
      border-end-start-radius: 10px;
    }

    .input-comments {
      width: 95%;
    }

    .comment-input-container {
      width: 96%;
    }
  }
`;
