'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Container, Grid, GridCol, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { SkeletonBlogContent } from '@whatsnxt/core-ui';

import BlogComment from '@whatsnxt/blogcomments/src';
import { CommentContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-context';
import { CommentReplyContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-reply-context';
import useCommentHandlers from '@whatsnxt/blogcomments/src/hooks/useCommentHandlers';

import SidebarHeadings from '../../../components/Blog/sidebar-headings';
import SidebarPost from '../../../components/Blog/sidebar';
import BlogContent from '../../../components/Blog/Content/Blog';
import useAuth from '../../../hooks/Authentication/useAuth';

interface StructuredTutorialContentDetailsProps {
    details: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        imageUrl?: string;
        contentFormat?: string;
        timeToRead?: string;
        updatedAt?: string;
    };
    tutorialId: string;
}

interface CommentNode {
    id: string;
    text: string;
    email: string;
    parents: string[];
    items: CommentNode[];
    likes: number;
    dislikes: number;
    hasLiked: boolean;
    hasDisliked: boolean;
    hasFlagged: boolean;
    author: string;
    updatedAt: string;
    totalReply: number;
}

export default function StructuredTutorialContentDetails({
    details,
}: StructuredTutorialContentDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [contentId, setContentId] = useState('');
    const [item, setItem] = useState(details);
    const [comments, setComments] = useState<{ id: number; items: CommentNode[] }>({
        id: 1,
        items: [],
    });
    const [url, setUrl] = useState<string>('');

    const [itemHeadings, setItemHeadings] = useState<
        { ref: HTMLElement; text: string; id: string }[]
    >([]);
    const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(null);

    const { user } = useAuth();
    const email = user?.email;
    const userId = user?._id;

    const {
        handleInsertNode,
        handleEditNode,
        handleDeleteNode,
        handleComments,
        handleSubComment,
    } = useCommentHandlers({
        contentId,
        comments,
        setComments,
    });

    const onHeadingsExtracted = useCallback(
        (headings: { ref: HTMLElement; text: string; id: string }[]) => {
            setItemHeadings(headings);
        },
        []
    );

    const setActiveHeading = useCallback((headingRef: HTMLElement) => {
        setActiveHeadingRef(headingRef);
    }, []);

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    useEffect(() => {
        if (details._id) {
            setItem(details);
            setContentId(details._id);
            setLoading(false);
        }
    }, [details._id]);

    const currentPostSlug = details.slug;

    return (
        <Container fluid>
            <Box>
                {loading ? (
                    <SkeletonBlogContent />
                ) : (
                    <Box>
                        <Grid gutter="xl">
                            {/* Main Content */}
                            <GridCol span={{ base: 12, md: 9 }}>
                                <BlogContent
                                    url={url}
                                    views={0}
                                    title={item.title}
                                    thumbnailUrn={item.imageUrl || ''}
                                    updatedAt={item.updatedAt || ''}
                                    timeToRead={item.timeToRead || ''}
                                    loading={loading}
                                    contentFormat={(item.contentFormat || 'HTML') as 'HTML' | 'MARKDOWN'}
                                    description={item.description}
                                    onHeadingsExtracted={onHeadingsExtracted}
                                    setActiveHeading={setActiveHeading}
                                />
                            </GridCol>

                            {/* Right Sidebar - Headings & Popular Posts */}
                            <GridCol span={{ base: 12, md: 2.5 }}>
                                <Box pos="sticky" top={80}>
                                    {itemHeadings.length > 0 && (
                                        <Box mb="lg">
                                            <SidebarHeadings
                                                headings={itemHeadings}
                                                activeHeadingRef={activeHeadingRef}
                                            />
                                        </Box>
                                    )}
                                    <SidebarPost />
                                </Box>
                            </GridCol>
                        </Grid>

                        {/* Comments */}
                        <Container fluid>
                            <Stack my="xl">
                                <CommentReplyContextProvider
                                    email={email}
                                    contentId={contentId}
                                    handleComments={handleComments}
                                    comments={comments}
                                >
                                    <CommentContextProvider>
                                        <BlogComment
                                            userId={userId}
                                            email={email}
                                            comment={comments}
                                            item={item}
                                            root={true}
                                            rootDepth={1}
                                            contentId={contentId}
                                            handleInsertNode={handleInsertNode}
                                            handleEditNode={handleEditNode}
                                            handleDeleteNode={handleDeleteNode}
                                            handleComments={handleComments}
                                            handleSubComment={handleSubComment}
                                        />
                                    </CommentContextProvider>
                                </CommentReplyContextProvider>
                            </Stack>
                        </Container>
                    </Box>
                )}
            </Box>
        </Container >
    );
}
