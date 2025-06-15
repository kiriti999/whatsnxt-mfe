
// @ts-nocheck
import React from 'react';
import { Collapse, Text } from '@mantine/core';


const CommentCollapse = ({ handleViewAllReplies, isOpen, isChildComment, children, numOfReplies }: any) => {
  if (!isChildComment) {
    return <></>;
  }

  return (
    <>
      {numOfReplies > 0 && (
        <div
          onClick={handleViewAllReplies}
          className="view-all-comment d-flex align-items-center gap-1"
        >
          <Text size="xs">
            {isOpen
              ? "Hide replies"
              : numOfReplies > 1
                ? `View ${numOfReplies} replies`
                : numOfReplies === 1
                  ? "View 1 reply"
                  : "View all replies"}
          </Text>
        </div>
      )}
      {isOpen && (
        <Collapse in={isOpen}>{children}</Collapse>
      )}
    </>
  );
};

export default CommentCollapse;
