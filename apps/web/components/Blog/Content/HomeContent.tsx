import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ContentAPI } from '../../../apis/v1/blog/contentApi';
import { RootState } from '../../../store/store';
import { useSelector } from 'react-redux';
import { 
    selectCurrentTag, 
    selectArticles 
} from '../../../store/slices/contentSlice';
import { usePostGrid } from './Grids/hooks/usePostGrid';
import { LandingPagePostGrid } from './Grids/LandingPagePostGrid';

/* eslint-disable-next-line */
type ContentType = "blog" | "tutorial" | "both";
/* eslint-disable-next-line */
interface ContentProps {
    type: ContentType;
}

interface Post {
    id: string;
    title: string;
    tutorial?: any;  // Replace 'any' with the actual type if known
    blog?: any;  // Replace 'any' with the actual type if known
}

interface PostPage {
    totalRecords: number;
    posts: Post[];
}

function HomeContent(props: ContentProps) {
    const { type } = props;
    
    // Use proper selectors instead of direct state access
    const currentSelectedTag = useSelector(selectCurrentTag);
    const currentArticles = useSelector(selectArticles);

    const queryResult = useInfiniteQuery<PostPage>({
        queryKey: ['/blog-tutorial/lists', type],
        queryFn: ({ pageParam = 1 }: any) => ContentAPI.getPosts(pageParam, 10, type),
        getNextPageParam: (lastPage, allPages) => {
            const { totalRecords } = lastPage;
            const nextOffset = allPages.length * 10;
            return nextOffset < totalRecords ? allPages.length + 1 : undefined;
        },
        initialPageParam: undefined
    });

    const postGridProps = usePostGrid(queryResult, {
        currentSelectedTag,
        currentArticles
    });

    return (
        <LandingPagePostGrid
            {...postGridProps}
            currentSelectedTag={currentSelectedTag}
        />
    );
}

export default HomeContent;