import { SkeletonCardContent } from '@whatsnxt/core-ui';
import React from 'react';
import { PostGrid } from './PostGrid';
import { ContentItem } from './interface';

// ✅ Simplified - uses unified ContentCard
export const DashboardPostGrid: React.FC<{
    data: ContentItem[];
    isLoading: boolean;
    isFetching: boolean;
    hasNextPage: boolean;
    onInfiniteScroll: () => void;
}> = (props) => (
    <PostGrid
        {...props}
        SkeletonComponent={SkeletonCardContent}
        containerProps={{
            justify: 'flex-start',
            gap: 'xl',
            wrap: 'wrap',
            px: 'md'
        }}
    />
);
