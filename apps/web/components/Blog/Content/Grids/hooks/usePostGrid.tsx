import React from 'react';
import { ContentItem } from '../interface';

// ✅ Hook for common logic with proper typing
export const usePostGrid = (queryResult: any, options: {
    currentSelectedTag?: string;
    currentArticles?: ContentItem[];
} = {}) => {
    const { currentSelectedTag, currentArticles } = options;
    const { data, isLoading, isFetching, hasNextPage, fetchNextPage } = queryResult;

    const flatData = React.useMemo((): ContentItem[] => (
        currentSelectedTag ? (currentArticles || []) :
            data ? data?.pages?.flatMap((page: any) => page.data || []) : []
    ), [currentArticles, currentSelectedTag, data]);

    const onInfiniteScroll = () => {
        fetchNextPage();
    };

    return {
        data: flatData,
        isLoading,
        isFetching,
        hasNextPage,
        onInfiniteScroll,
    };
};
