"use client";

import {
    Box,
    Button,
    Center,
    Container,
    Grid,
    GridCol,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconLock } from "@tabler/icons-react";

import BlogComment from "@whatsnxt/blogcomments/src";
import { CommentContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-context";
import { CommentReplyContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-reply-context";
import useCommentHandlers from "@whatsnxt/blogcomments/src/hooks/useCommentHandlers";
import { SkeletonBlogContent } from "@whatsnxt/core-ui";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { SidebarPost as SidebarPostType } from "../../../apis/v1/blog/structuredTutorialApi";
import BlogContent from "../../../components/Blog/Content/Blog";
import { StickyTutorialFooter } from "../../../components/Blog/Content/Tutorial/StickyTutorialFooter";
import SidebarPost from "../../../components/Blog/sidebar";
import SidebarHeadings from "../../../components/Blog/sidebar-headings";
import { MCQPost } from "../../../components/Quiz/MCQPost";
import useAuth from "../../../hooks/Authentication/useAuth";
import type { TutorialSidebarState } from "../../../store/slices/tutorialSidebarSlice";
import type { RootState } from "../../../store/store";

interface StructuredTutorialContentDetailsProps {
    details: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        imageUrl?: string;
        contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL";
        lexicalState?: Record<string, any> | null;
        timeToRead?: string;
        updatedAt?: string;
        postType?: "CONTENT" | "MCQ";
        mcqData?: {
            question: string;
            options: Array<{
                id: string;
                label: string;
                text: string;
                isCorrect: boolean;
            }>;
            explanation: string;
            difficulty: "EASY" | "MEDIUM" | "HARD";
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
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [loading, setLoading] = useState(true);
    const [contentId, setContentId] = useState("");
    const [item, setItem] = useState(details);
    const [comments, setComments] = useState<{
        id: number;
        items: CommentNode[];
    }>({
        id: 1,
        items: [],
    });
    const [url, setUrl] = useState<string>("");
    const sidebarCache = useSelector(
        (state: RootState) =>
            (state.tutorialSidebar as unknown as TutorialSidebarState).cache,
    );

    const [itemHeadings, setItemHeadings] = useState<
        { ref: HTMLElement; text: string; id: string }[]
    >([]);
    const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(
        null,
    );
    const [prevPost, setPrevPost] = useState<{
        label: string;
        href: string;
    } | null>(null);
    const [nextPost, setNextPost] = useState<{
        label: string;
        href: string;
    } | null>(null);

    /** Check if the current post is in a locked (non-preview) section of a premium tutorial */
    const isContentLocked = useMemo(() => {
        const sidebarData = sidebarCache[tutorialId];
        if (!sidebarData?.isPremium) return false;

        const currentSection = sidebarData.sections.find((section) =>
            section.posts.some((post) => post.slug === details.slug),
        );

        if (!currentSection) return false;
        return !currentSection.isFreePreview;
    }, [sidebarCache, tutorialId, details.slug]);

    /** Check if the next post is in a locked section */
    const isNextPostLocked = useMemo(() => {
        const sidebarData = sidebarCache[tutorialId];
        if (!sidebarData?.isPremium) return false;
        if (!nextPost) return false;

        // Find which section the next post belongs to
        const nextSlug = nextPost.href.split("/").pop() || "";
        const nextSection = sidebarData.sections.find((section) =>
            section.posts.some(
                (post) => post.slug === nextSlug || nextPost.href.endsWith(post.slug),
            ),
        );

        if (!nextSection) return false;
        return !nextSection.isFreePreview;
    }, [sidebarCache, tutorialId, nextPost]);

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
        [],
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
                const allPosts: SidebarPostType[] = sidebarData.sections.flatMap(
                    (section) => section.posts,
                );
                const currentSlug = details.slug;

                const currentIndex = allPosts.findIndex(
                    (post) => post.slug === currentSlug,
                );

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
                                    <Box px={isMobile ? "0" : "xl"}>
                                        {isContentLocked ? (
                                            <Center py={80}>
                                                <Stack align="center" gap="md" maw={420}>
                                                    <IconLock
                                                        size={48}
                                                        color="var(--mantine-color-yellow-6)"
                                                    />
                                                    <Title order={3} ta="center">
                                                        Premium Content
                                                    </Title>
                                                    <Text c="dimmed" ta="center">
                                                        This section is part of our premium content. Upgrade
                                                        your plan to unlock all tutorials and guided
                                                        practice.
                                                    </Text>
                                                    <Button
                                                        component={Link}
                                                        href="/premium"
                                                        color="green"
                                                        radius="md"
                                                        size="md"
                                                    >
                                                        Upgrade to Premium
                                                    </Button>
                                                </Stack>
                                            </Center>
                                        ) : item.postType === "MCQ" && item.mcqData ? (
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
                                                thumbnailUrn={item.imageUrl || ""}
                                                updatedAt={item.updatedAt || ""}
                                                timeToRead={item.timeToRead || ""}
                                                loading={loading}
                                                contentFormat={
                                                    (item.contentFormat || "HTML") as "HTML" | "LEXICAL"
                                                }
                                                description={item.description}
                                                lexicalState={item.lexicalState}
                                                onHeadingsExtracted={onHeadingsExtracted}
                                                setActiveHeading={setActiveHeading}
                                            />
                                        )}
                                    </Box>
                                    <StickyTutorialFooter
                                        prev={prevPost}
                                        next={
                                            nextPost
                                                ? { ...nextPost, isLocked: isNextPostLocked }
                                                : null
                                        }
                                    />

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
        </Container>
    );
}
