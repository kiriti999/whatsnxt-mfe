import React from 'react';
import { Container, Flex, FlexProps } from '@mantine/core';
import { InfiniteScrollComponent } from '@whatsnxt/core-util';
import { SkeletonCardContent } from '@whatsnxt/core-ui';
import ContentCard from '../../Cards/ContentCard';
import { ContentItem } from './interface';


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

    // Component override for skeleton
    SkeletonComponent?: React.ComponentType;
}

// ✅ Simplified component using unified ContentCard
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
    SkeletonComponent = SkeletonCardContent,
}) => {
    const content = (
        <Flex {...containerProps}>
            {isLoading ? (
                <SkeletonComponent />
            ) : (
                data && data.length > 0 &&
                data.map((item: ContentItem, i: number) => (
                    <ContentCard key={item._id || item.id || i} content={item} />
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