"use client";

import {
    Box,
    Container,
    Grid,
    GridCol,
    Paper,
    Stack,
    Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

import BlogComment from "@whatsnxt/blogcomments/src";
import { CommentContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-context";
import { CommentReplyContextProvider } from "@whatsnxt/blogcomments/src/contexts/comment-reply-context";
import useCommentHandlers from "@whatsnxt/blogcomments/src/hooks/useCommentHandlers";
import { SkeletonBlogContent } from "@whatsnxt/core-ui";
import { articleApiClient } from "@whatsnxt/core-util";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { SidebarPost as SidebarPostType } from "../../../apis/v1/blog/structuredTutorialApi";
import { premiumAPI } from "../../../apis/v1/premium";
import BlogContent from "../../../components/Blog/Content/Blog";
import { StickyTutorialFooter } from "../../../components/Blog/Content/Tutorial/StickyTutorialFooter";
import SidebarPost from "../../../components/Blog/sidebar";
import SidebarHeadings from "../../../components/Blog/sidebar-headings";
import { PremiumPaywall } from "../../../components/Premium/PremiumPaywall";
import { MCQPost } from "../../../components/Quiz/MCQPost";
import useAuth from "../../../hooks/Authentication/useAuth";
import {
    setUserAccess,
    type TutorialSidebarState,
} from "../../../store/slices/tutorialSidebarSlice";
import type { RootState } from "../../../store/store";

interface StructuredTutorialContentDetailsProps {
    details: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        imageUrl?: string;
        contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL";
        lexicalState?: Record<string, unknown> | null;
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
    const router = useRouter();
    const dispatch = useDispatch();
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
    const reduxUserAccess = useSelector(
        (state: RootState) =>
            (state.tutorialSidebar as unknown as TutorialSidebarState).userAccess,
    );
    const [hasUserAccess, setHasUserAccess] = useState(
        () => reduxUserAccess[tutorialId] === true,
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

    /** Whether the backend access check has completed (prevents false lock flash on refresh) */
    const [accessChecked, setAccessChecked] = useState(
        () => reduxUserAccess[tutorialId] !== undefined,
    );

    /** Fetch user's premium access for this tutorial — runs immediately on mount */
    useEffect(() => {
        if (hasUserAccess) {
            setAccessChecked(true);
            return;
        }
        let cancelled = false;
        const check = async () => {
            try {
                const response = await premiumAPI.checkAccess(tutorialId);
                if (cancelled) return;
                const granted = response?.data?.hasAccess === true;
                if (granted) setHasUserAccess(true);
                dispatch(setUserAccess({ tutorialId, hasAccess: granted }));
            } catch {
                if (!cancelled)
                    dispatch(setUserAccess({ tutorialId, hasAccess: false }));
            } finally {
                if (!cancelled) setAccessChecked(true);
            }
        };
        check();
        return () => {
            cancelled = true;
        };
    }, [tutorialId, dispatch, hasUserAccess]);

    /** Keep local state in sync when Redux access changes (e.g. purchase on another post) */
    useEffect(() => {
        if (reduxUserAccess[tutorialId]) {
            setHasUserAccess(true);
        }
    }, [reduxUserAccess, tutorialId]);

    /** Re-fetch content client-side when SSR returned redacted premium content */
    useEffect(() => {
        if (!hasUserAccess) return;
        const contentIsRedacted =
            (details as Record<string, unknown>).isLocked === true ||
            (!details.lexicalState && !details.description);
        if (!contentIsRedacted) return;

        let cancelled = false;
        const refetchContent = async () => {
            try {
                const pathParts = window.location.pathname
                    .replace(/^\/content\//, "")
                    .split("/");
                if (pathParts.length < 2) return;
                const [tutorialSlug, postSlug] = pathParts;
                const { data: res } = await articleApiClient.get(
                    `/content/${tutorialSlug}/${postSlug}`,
                );
                if (cancelled || !res?.success || !res.data) return;
                setItem((prev) => ({ ...prev, ...res.data }));
            } catch {
                // Content stays as-is; paywall will handle
            }
        };
        refetchContent();
        return () => {
            cancelled = true;
        };
    }, [hasUserAccess, details]);

    /** Check if the current post is in a locked (non-preview) section of a premium tutorial */
    const isContentLocked = useMemo(() => {
        if (hasUserAccess) return false;
        if (!accessChecked) return false; // Don't show paywall until access check completes
        const sidebarData = sidebarCache[tutorialId];
        if (!sidebarData?.isPremium) return false;

        const currentSection = sidebarData.sections.find((section) =>
            section.posts.some((post) => post.slug === details.slug),
        );

        if (!currentSection) return false;
        return !currentSection.isFreePreview;
    }, [hasUserAccess, accessChecked, sidebarCache, tutorialId, details.slug]);

    /** Check if the next post is in a locked section */
    const isNextPostLocked = useMemo(() => {
        if (hasUserAccess) return false;
        if (!accessChecked) return false;
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
    }, [hasUserAccess, accessChecked, sidebarCache, tutorialId, nextPost]);

    /** Show inline paywall when user clicks "Purchase to Continue" in footer */
    const [showPaywall, setShowPaywall] = useState(false);

    const handlePurchaseClick = useCallback(() => {
        setShowPaywall(true);
        // Scroll to bottom where the paywall will render
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 100);
    }, []);

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
    }, [details]);

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
        <Container fluid mb={'7rem'}>
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
                                            <PremiumPaywall
                                                tutorialId={tutorialId}
                                                tutorialTitle={sidebarCache[tutorialId]?.tutorialTitle}
                                                onAccessGranted={() => {
                                                    setHasUserAccess(true);
                                                    dispatch(
                                                        setUserAccess({ tutorialId, hasAccess: true }),
                                                    );
                                                    router.refresh();
                                                }}
                                            />
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
                                        onPurchaseClick={handlePurchaseClick}
                                    />

                                    {/* Inline paywall when next section is locked */}
                                    {showPaywall && isNextPostLocked && (
                                        <PremiumPaywall
                                            tutorialId={tutorialId}
                                            tutorialTitle={sidebarCache[tutorialId]?.tutorialTitle}
                                            onAccessGranted={() => {
                                                setHasUserAccess(true);
                                                dispatch(
                                                    setUserAccess({ tutorialId, hasAccess: true }),
                                                );
                                                setShowPaywall(false);
                                                router.refresh();
                                            }}
                                        />
                                    )}

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
