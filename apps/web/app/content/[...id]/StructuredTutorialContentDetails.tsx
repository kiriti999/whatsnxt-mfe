'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box, Container, Grid, GridCol, Stack, Title, Paper } from '@mantine/core';
import { SkeletonBlogContent } from '@whatsnxt/core-ui';

import BlogComment from '@whatsnxt/blogcomments/src';
import { CommentContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-context';
import { CommentReplyContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-reply-context';
import useCommentHandlers from '@whatsnxt/blogcomments/src/hooks/useCommentHandlers';

import SidebarHeadings from '../../../components/Blog/sidebar-headings';
import SidebarPost from '../../../components/Blog/sidebar';
import BlogContent from '../../../components/Blog/Content/Blog';
import { StickyTutorialFooter } from '../../../components/Blog/Content/Tutorial/StickyTutorialFooter';
import { MCQPost } from '../../../components/Quiz/MCQPost';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { TutorialSidebarState } from '../../../store/slices/tutorialSidebarSlice';
import useAuth from '../../../hooks/Authentication/useAuth';
import type { SidebarPost as SidebarPostType } from '../../../apis/v1/blog/structuredTutorialApi';

interface StructuredTutorialContentDetailsProps {
    details: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        imageUrl?: string;
        contentFormat?: 'HTML' | 'MARKDOWN' | 'LEXICAL';
        lexicalState?: Record<string, any> | null;
        timeToRead?: string;
        updatedAt?: string;
        postType?: 'CONTENT' | 'MCQ';
        mcqData?: {
            question: string;
            options: Array<{
                id: string;
                label: string;
                text: string;
                isCorrect: boolean;
            }>;
            explanation: string;
            difficulty: 'EASY' | 'MEDIUM' | 'HARD';
        };
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
    tutorialId,
}: StructuredTutorialContentDetailsProps) {
    const [loading, setLoading] = useState(true);
    const [contentId, setContentId] = useState('');
    const [item, setItem] = useState(details);
    const [comments, setComments] = useState<{ id: number; items: CommentNode[] }>({
        id: 1,
        items: [],
    });
    const [url, setUrl] = useState<string>('');
    const sidebarCache = useSelector((state: RootState) => (state.tutorialSidebar as unknown as TutorialSidebarState).cache);

    const [itemHeadings, setItemHeadings] = useState<
        { ref: HTMLElement; text: string; id: string }[]
    >([]);
    const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(null);
    const [prevPost, setPrevPost] = useState<{ label: string; href: string } | null>(null);
    const [nextPost, setNextPost] = useState<{ label: string; href: string } | null>(null);

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

    useEffect(() => {
        const fetchNavigation = async () => {
            if (!tutorialId || !details.slug) return;

            const sidebarData = sidebarCache[tutorialId];

            if (sidebarData) {
                const allPosts: SidebarPostType[] = sidebarData.sections.flatMap(section => section.posts);
                const currentSlug = details.slug;

                const currentIndex = allPosts.findIndex(post => post.slug === currentSlug);

                const tutorialSlug = sidebarData.tutorialSlug;

                if (currentIndex !== -1) {
                    if (currentIndex > 0) {
                        const prev = allPosts[currentIndex - 1];
                        setPrevPost({
                            label: prev.title,
                            href: `/content/${tutorialSlug}/${prev.slug}`,
                        });
                    } else {
                        setPrevPost(null);
                    }

                    if (currentIndex < allPosts.length - 1) {
                        const next = allPosts[currentIndex + 1];
                        setNextPost({
                            label: next.title,
                            href: `/content/${tutorialSlug}/${next.slug}`,
                        });
                    } else {
                        setNextPost(null);
                    }
                } else {
                    // Check if we are on the tutorial root page
                    if (currentSlug === tutorialSlug && allPosts.length > 0) {
                        const firstPost = allPosts[0];
                        setNextPost({
                            label: firstPost.title,
                            href: `/content/${tutorialSlug}/${firstPost.slug}`,
                        });
                        setPrevPost(null);
                    }
                }
            }
        };

        fetchNavigation();
    }, [tutorialId, details.slug, sidebarCache]);

    return (
        <Container fluid>
            <Box>
                {loading ? (
                    <SkeletonBlogContent />
                ) : (
                    <Box>
                        <Grid>
                            {/* Main Content */}
                            <GridCol span={{ base: 12, md: 9 }}>
                                <Stack gap="md">
                                    {/* Content Paper */}
                                    <Box px="xl">
                                        {item.postType === 'MCQ' && item.mcqData ? (
                                            <MCQPost
                                                postId={item._id}
                                                title={item.title}
                                                mcqData={item.mcqData}
                                                questionNumber={1}
                                            />
                                        ) : (
                                            <BlogContent
                                                url={url}
                                                views={0}
                                                title={item.title}
                                                thumbnailUrn={item.imageUrl || ''}
                                                updatedAt={item.updatedAt || ''}
                                                timeToRead={item.timeToRead || ''}
                                                loading={loading}
                                                contentFormat={(item.contentFormat || 'HTML') as 'HTML' | 'LEXICAL'}
                                                description={item.description}
                                                lexicalState={item.lexicalState}
                                                onHeadingsExtracted={onHeadingsExtracted}
                                                setActiveHeading={setActiveHeading}
                                            />
                                        )}
                                    </Box>

                                    <StickyTutorialFooter prev={prevPost} next={nextPost} />

                                    {/* Comments Paper */}
                                    <Paper withBorder p="xl" radius="xs">
                                        <Stack gap="md">
                                            <Title order={4}>Comments</Title>
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
                                    </Paper>
                                </Stack>
                            </GridCol>

                            {/* Right Sidebar - Headings & Popular Posts */}
                            <GridCol span={{ base: 12, md: 3 }}>
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
                    </Box>
                )}
            </Box>
        </Container >
    );
}
