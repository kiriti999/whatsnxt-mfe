import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ContentAPI } from '../../../apis/v1/blog/contentApi';
import { StructuredTutorialAPI } from '../../../apis/v1/blog/structuredTutorialApi';
import { useSelector } from 'react-redux';
import {
    selectCurrentTag,
    selectArticles
} from '../../../store/slices/contentSlice';
import { LandingPagePostGrid } from './Grids/LandingPagePostGrid';

 
type ContentType = "blog" | "tutorial" | "both";
 
interface ContentProps {
    type: ContentType;
}

interface Post {
    id: string;
    title: string;
    tutorial?: any;
    blog?: any;
    isStructured?: boolean;
}

interface PostPage {
    totalRecords: number;
    posts: Post[];
}

function HomeContent(props: ContentProps) {
    const { type } = props;

    const currentSelectedTag = useSelector(selectCurrentTag);
    const currentArticles = useSelector(selectArticles);

    // Fetch regular posts (blogs + tutorials)
    const postsQuery = useInfiniteQuery<PostPage>({
        queryKey: ['/blog-tutorial/lists', type],
        queryFn: async ({ pageParam = 1 }: any) => {
            const response = await ContentAPI.getPosts(pageParam, 10, type);
            console.log('🔍 ContentAPI.getPosts response:', response);

            // Backend returns: { data: [], totalCount, currentPage, limit }
            // Frontend expects: { posts: [], totalRecords }
            if (response && response.data) {
                return {
                    posts: response.data,
                    totalRecords: response.totalCount || 0
                };
            }
            // Fallback if structure is different
            return { totalRecords: 0, posts: [] };
        },
        getNextPageParam: (lastPage, allPages) => {
            const { totalRecords } = lastPage;
            const nextOffset = allPages.length * 10;
            return nextOffset < totalRecords ? allPages.length + 1 : undefined;
        },
        initialPageParam: undefined
    });
    console.log('🚀 :: HomeContent :: postsQuery:', postsQuery)

    // Fetch structured tutorials
    const structuredTutorialsQuery = useInfiniteQuery({
        queryKey: ['/structured-tutorials/lists'],
        queryFn: async ({ pageParam = 1 }: any) => {
            const response = await StructuredTutorialAPI.getAll(pageParam, 10, true);
            console.log('🔍 StructuredTutorialAPI.getAll response:', response);

            // StructuredTutorialAPI returns { success, data: { tutorials, totalRecords, ... } }
            if (response.success && response.data) {
                return {
                    totalRecords: response.data.totalRecords,
                    posts: response.data.tutorials.map(t => ({
                        ...t,
                        id: t._id,
                        isStructured: true
                    }))
                };
            }
            return { totalRecords: 0, posts: [] };
        },
        getNextPageParam: (lastPage, allPages) => {
            const { totalRecords } = lastPage;
            const nextOffset = allPages.length * 10;
            return nextOffset < totalRecords ? allPages.length + 1 : undefined;
        },
        initialPageParam: undefined
    });
    console.log('🚀 :: HomeContent :: structuredTutorialsQuery:', structuredTutorialsQuery)

    // Combine data from both queries
    const combinedData = React.useMemo(() => {
        const regularPosts = postsQuery.data?.pages.flatMap(page => page.posts) || [];
        const structuredPosts = structuredTutorialsQuery.data?.pages.flatMap(page => page.posts) || [];

        console.log('🔍 regularPosts:', regularPosts);
        console.log('🔍 structuredPosts:', structuredPosts);

        // Interleave or combine as needed - here we put structured tutorials first
        return [...structuredPosts, ...regularPosts] as any[];
    }, [postsQuery.data, structuredTutorialsQuery.data]);
    console.log('🚀 :: HomeContent :: combinedData:', combinedData)

    // Combined loading and fetching states
    const isLoading = postsQuery.isLoading || structuredTutorialsQuery.isLoading;
    const isFetching = postsQuery.isFetching || structuredTutorialsQuery.isFetching;
    const hasNextPage = postsQuery.hasNextPage || structuredTutorialsQuery.hasNextPage;

    const handleInfiniteScroll = () => {
        if (postsQuery.hasNextPage && !postsQuery.isFetching) {
            postsQuery.fetchNextPage();
        }
        if (structuredTutorialsQuery.hasNextPage && !structuredTutorialsQuery.isFetching) {
            structuredTutorialsQuery.fetchNextPage();
        }
    };

    return (
        <LandingPagePostGrid
            data={combinedData}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={hasNextPage || false}
            onInfiniteScroll={handleInfiniteScroll}
            currentSelectedTag={currentSelectedTag}
        />
    );
}

export default HomeContent;