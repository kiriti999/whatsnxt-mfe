import { SkeletonCardContent } from '@whatsnxt/core-ui';
import React from 'react';
import BlogCard from '../../Cards/Blog';
import TutorialCard from '../../Cards/Tutorial';
import { ContentItem } from './interface';
import { PostGrid } from './PostGrid';

// ✅ Context-specific components with proper typing
export const LandingPagePostGrid: React.FC<{
    data: ContentItem[];
    isLoading: boolean;
    isFetching: boolean;
    hasNextPage: boolean;
    onInfiniteScroll: () => void;
    currentSelectedTag?: string;
}> = (props) => (
    <PostGrid
        {...props}
        BlogCardComponent={BlogCard}
        TutorialCardComponent={TutorialCard}
        SkeletonComponent={SkeletonCardContent}
        containerProps={{
            justify: 'center',
            gap: 'xl',
            wrap: 'wrap',
            px: 'sm'
        }}
    />
);