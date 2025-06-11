import { SkeletonCardContent } from '@whatsnxt/core-ui';
import React from 'react';
import BlogCard from '../../Cards/Blog';
import TutorialCard from '../../Cards/Tutorial';
import { PostGrid } from './PostGrid';
import { IBlogCard, ITutorialCard, ContentItem } from './interface';


// ✅ Alternative: Create type-safe wrapper functions
const TypeSafeBlogCard: React.FC<IBlogCard> = ({ blog }) => (
    <BlogCard blog={blog} />
);

const TypeSafeTutorialCard: React.FC<ITutorialCard> = ({ tutorial }) => (
    <TutorialCard tutorial={tutorial} />
);

export const DashboardPostGrid: React.FC<{
    data: ContentItem[];
    isLoading: boolean;
    isFetching: boolean;
    hasNextPage: boolean;
    onInfiniteScroll: () => void;
}> = (props) => (
    <PostGrid
        {...props}
        BlogCardComponent={TypeSafeBlogCard}
        TutorialCardComponent={TypeSafeTutorialCard}
        SkeletonComponent={SkeletonCardContent}
        containerProps={{
            justify: 'flex-start',
            gap: 'md',
            wrap: 'wrap',
            px: 'md'
        }}
    />
);
