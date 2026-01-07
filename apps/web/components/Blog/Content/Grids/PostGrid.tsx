import React from 'react';
import { Container, Flex, FlexProps } from '@mantine/core';
import { InfiniteScrollComponent } from '@whatsnxt/core-util';
import { SkeletonCardContent } from '@whatsnxt/core-ui';
import TutorialCard from '../../Cards/Tutorial';
import BlogCard from '../../Cards/Blog';
import { ContentItem, IBlogCard, ITutorialCard } from './interface';


interface PostGridProps {
    // Required props
    data: ContentItem[];
    isLoading: boolean;
    isFetching: boolean;
    hasNextPage: boolean;
    onInfiniteScroll: () => void;

    // Optional props with defaults
    currentSelectedTag?: string;
    containerProps?: FlexProps;
    showInfiniteScroll?: boolean;

    // Component overrides - now properly typed
    BlogCardComponent?: React.ComponentType<IBlogCard>;
    TutorialCardComponent?: React.ComponentType<ITutorialCard>;
    SkeletonComponent?: React.ComponentType;
}

// ✅ Base reusable component with better name
export const PostGrid: React.FC<PostGridProps> = ({
    data,
    isLoading,
    isFetching,
    hasNextPage,
    onInfiniteScroll,
    currentSelectedTag,
    containerProps = {
        justify: 'center',
        gap: 'xl',
        wrap: 'wrap',
        px: 'sm'
    },
    showInfiniteScroll = true,
    BlogCardComponent = BlogCard,
    TutorialCardComponent = TutorialCard,
    SkeletonComponent = SkeletonCardContent,
}) => {
    const content = (
        <Flex {...containerProps}>
            {isLoading ? (
                <SkeletonComponent />
            ) : (
                data && data.length > 0 &&
                data.map((item: ContentItem, i: number) => (
                    <div key={item._id || item.id || i}>
                        {item?.tutorial ? (
                            <TutorialCardComponent tutorial={item} />
                        ) : (
                            <BlogCardComponent blog={item} />
                        )}
                    </div>
                ))
            )}
        </Flex>
    );

    if (!showInfiniteScroll) {
        return content;
    }

    return (
        <Container fluid my={'5rem'}>
            <InfiniteScrollComponent
                isLoading={isFetching}
                isScrollCompleted={!hasNextPage && !currentSelectedTag}
                onViewPortCallback={onInfiniteScroll}
            >
                {content}
            </InfiniteScrollComponent>
        </Container>
    );
};