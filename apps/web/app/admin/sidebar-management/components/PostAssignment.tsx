'use client';

import React from 'react';
import PostAssignment from './PostAssignment';

interface PostAssignmentWrapperProps {
  postId: string;
  postTitle: string;
  contentType: 'blog' | 'tutorial';
  currentSectionId?: string;
  currentSectionOrder?: number;
  onAssigned?: () => void;
  onCancel?: () => void;
}

/**
 * Wrapper component for PostAssignment to be used in admin interfaces
 * This can be embedded in blog/tutorial edit forms
 */
export const PostAssignmentWrapper: React.FC<PostAssignmentWrapperProps> = (props) => {
  return <PostAssignment {...props} />;
};

export default PostAssignmentWrapper;
