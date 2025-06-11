"use client"
import { ContentAPI } from '@/api/index';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { ContentType } from '../ContentComponent';
import { DashboardPostGrid } from '../Grids/DashboardPostGrid';
import { usePostGrid } from '../Grids/hooks/usePostGrid';
import { ContentItem } from '../Grids/interface';

interface PostPage {
    totalRecords: number;
    posts: ContentItem[];
    // Add other fields that your API returns
}

export const DashboardContent: React.FC<{ type: ContentType }> = ({ type }) => {
    const searchParams = useSearchParams();
    const statusParam = searchParams.get('status');

    // Map URL status to filter value
    const getFilterFromStatus = (status: string | null): 'all' | 'draft' | 'published' => {
        switch (status) {
            case 'drafts':
                return 'draft';
            case 'published':
                return 'published';
            case 'all':
            default:
                return 'all';
        }
    };

    const [filter, setFilter] = React.useState<'all' | 'draft' | 'published'>(() =>
        getFilterFromStatus(statusParam)
    );
    const [search, setSearch] = React.useState('');

    // Update filter when URL changes
    React.useEffect(() => {
        const newFilter = getFilterFromStatus(statusParam);
        setFilter(newFilter);
    }, [statusParam]);

    const queryResult = useInfiniteQuery<PostPage>({
        queryKey: ['myContent', type, filter, search],
        queryFn: async ({ pageParam }: { pageParam: unknown }) => {

            const page = (pageParam as number) || 1;

            switch (filter) {
                case 'draft':
                    return ContentAPI.getMyDrafts(page, 10, search);
                case 'published':
                    return ContentAPI.getMyPublishedPosts(page, 10, type, search);
                default:
                    return ContentAPI.getMyAllContent(page, 10, type, search);
            }
        },
        // ✅ Required: Define how to get the next page
        getNextPageParam: (lastPage, allPages) => {
            const { totalRecords } = lastPage;
            const currentCount = allPages.length * 10; // pageSize = 10
            return currentCount < totalRecords ? allPages.length + 1 : undefined;
        },
        // ✅ Required: Set initial page parameter
        initialPageParam: 1,
        // Optional: Additional configurations
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: true, // Always enabled for dashboard
    });
    console.log(' queryResult:', queryResult)

    const postGridProps = usePostGrid(queryResult);
    console.log(' postGridProps:', postGridProps)

    return (
        <div>
            <DashboardPostGrid {...postGridProps} />
        </div>
    );
};