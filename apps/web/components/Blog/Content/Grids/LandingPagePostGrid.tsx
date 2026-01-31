import { SkeletonCardContent } from '@whatsnxt/core-ui';
import React from 'react';
import { ContentItem } from './interface';
import { PostGrid } from './PostGrid';

// ✅ Simplified - no need for separate card components anymore
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
        SkeletonComponent={SkeletonCardContent}
    />
);