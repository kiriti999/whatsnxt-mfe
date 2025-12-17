import React, { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useCommentExpandTracker } from './contexts/comment-context';
import { useNestedCommentLoadTracker } from './contexts/comment-reply-context';
import { CommentContainer } from './styles/CommentConnector.styles';
import { CommentConnectorProps } from './types/CommentConnector.types';


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
    <CommentContainer commentId={commentId} commentHeight={commentContainerHeight} ref={commentRef} isMobile={isMobile}>
      {children}
    </CommentContainer>
  );
};

export default CommentConnector;
