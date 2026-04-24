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
import { useCallback, useEffect, useState } from "react";
import BlogContent from "../../../components/Blog/Content/Blog";
import StickyHeader from "../../../components/Blog/Content/StickyHeader";
import SidebarPost from "../../../components/Blog/sidebar";
import SidebarHeadings from "../../../components/Blog/sidebar-headings";
import useAuth from "../../../hooks/Authentication/useAuth";

const initialProps = {
  title: "",
  description: "",
  categoryName: [],
  tutorial: false,
};

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

export interface PostSlugResponse {
  _id: string;
  title: string;
  slug: string;
  description: string;
  contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL";
  lexicalState?: Record<string, any> | null;
  categoryId: string;
  categoryName: string;
  timeToRead: string;
  imageUrl: string;
  pngImageUrl: string;
  subCategory: string | null;
  nestedSubCategory: string | null;
  published: boolean;
  listed: boolean;
  tutorial?: any;
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
}

interface BlogContentDetailsProps {
  details: PostSlugResponse;
}

function BlogContentDetails({ details }: BlogContentDetailsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [contentId, setContentId] = useState("");
  const [item, setItem] = useState(initialProps) as any;
  console.log("🚀 :: BlogContentDetails :: item:", item);
  const [itemHeadings, setItemHeadings] = useState<
    { ref: HTMLElement; text: string; id: string }[]
  >([]);
  const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{
    id: number;
    items: CommentNode[];
  }>({
    id: 1,
    items: [],
  });
  const [views, setViews] = useState(0);
  const { user } = useAuth();
  const email = user?.email;
  const userId = user?._id;

  const onHeadingsExtracted = useCallback(
    (headings: { ref: HTMLElement; text: string; id: string }[]) => {
      setItemHeadings(headings);
    },
    [],
  );

  const setActiveHeading = useCallback((headingRef: HTMLElement) => {
    setActiveHeadingRef(headingRef);
  }, []);

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

  const [url, setUrl] = useState<string>("");

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

  return (
    <Container fluid>
      <Box>
        {loading ? (
          <SkeletonBlogContent />
        ) : (
          <>
            {itemHeadings.length > 0 && isMobile && (
              <StickyHeader titles={itemHeadings} />
            )}
            <Box>
              <Grid gutter={"xl"}>
                <GridCol span={{ base: 12, md: 9 }}>
                  <Stack gap="md">
                    <BlogContent
                      url={url}
                      views={views}
                      title={item.title}
                      thumbnailUrn={item.imageUrl}
                      pngImageUrl={item.pngImageUrl}
                      updatedAt={item.updatedAt}
                      timeToRead={item.timeToRead}
                      loading={loading}
                      contentFormat={item.contentFormat}
                      description={item.description}
                      onHeadingsExtracted={onHeadingsExtracted}
                      setActiveHeading={setActiveHeading}
                    />

                    {/* Comments Paper */}
                    <Paper radius="xs">
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

                <GridCol span={{ base: 12, md: 3 }}>
                  <Box pos="sticky" top={100}>
                    <Box>
                      <SidebarPost />
                    </Box>
                    {!isMobile && itemHeadings.length > 0 && (
                      <Box mt="xl">
                        <SidebarHeadings
                          headings={itemHeadings}
                          activeHeadingRef={activeHeadingRef}
                        />
                      </Box>
                    )}
                  </Box>
                </GridCol>
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
}

export default BlogContentDetails;
