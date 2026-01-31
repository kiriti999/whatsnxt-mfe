'use client';
import { useEffect, useState, useCallback } from 'react';
import { AnalyticsAPI } from '../../../apis/v1/blog/analyticsApi';
import SidebarPost from '../../../components/Blog/sidebar';
import BlogComment from '@whatsnxt/blogcomments/src';
import { CommentContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-context';
import { CommentReplyContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-reply-context';
import BlogContent from '../../../components/Blog/Content/Blog';
import SidebarHeadings from '../../../components/Blog/sidebar-headings';
import StickyHeader from '../../../components/Blog/Content/StickyHeader';
import { SkeletonBlogContent } from '@whatsnxt/core-ui';
import useAuth from '../../../hooks/Authentication/useAuth';
import { Box, Container, Grid, GridCol, Stack } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { calculateTotalViews } from '../../../utils/pageViews';
import useCommentHandlers from '@whatsnxt/blogcomments/src/hooks/useCommentHandlers';

const initialProps = {
  title: '',
  description: '',
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
  categoryId: string;
  categoryName: string;
  timeToRead: string;
  imageUrl: string;
  subCategory: string | null;
  nestedSubCategory: string | null;
  published: boolean;
  listed: boolean;
  tutorial?: any
}

interface BlogContentDetailsProps {
  details: PostSlugResponse;
}

async function fetchViews() {
  return await AnalyticsAPI.fetchViews();
}

function BlogContentDetails({ details }: BlogContentDetailsProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [contentId, setContentId] = useState('');
  const [item, setItem] = useState(initialProps) as any;
  const [itemHeadings, setItemHeadings] = useState<
    { ref: HTMLElement; text: string; id: string }[]
  >([]);
  const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ id: number; items: CommentNode[] }>({
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
    []
  );

  const setActiveHeading = useCallback((headingRef: HTMLElement) => {
    setActiveHeadingRef(headingRef);
  }, []);

  const {
    handleInsertNode,
    handleEditNode,
    handleDeleteNode,
    handleComments,
    handleSubComment
  } = useCommentHandlers({
    contentId,
    comments,
    setComments
  });

  const [url, setUrl] = useState<string>('');

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

  // analytics
  // useEffect(() => {
  //   (async () => {
  //     const totalViews = await calculateTotalViews(fetchViews, pathName);
  //     setViews(totalViews);
  //   })();
  // }, [pathName]);

  return (
    <Container fluid>
      <Box>
        {loading ? (
          <SkeletonBlogContent />
        ) : (
          <>
            {itemHeadings.length > 0 && isMobile && <StickyHeader titles={itemHeadings} />}
            <Box>
              <Grid gutter={'xl'}>
                {!isMobile && itemHeadings.length > 0 && (
                  <GridCol span={{ base: 12, md: 2.2 }} mb={'xl'}>
                    <Box pos="sticky" top={0}>
                      <SidebarHeadings
                        headings={itemHeadings}
                        activeHeadingRef={activeHeadingRef}
                      />
                    </Box>
                  </GridCol>
                )}
                <GridCol span={itemHeadings.length > 0 ? { base: 12, md: 7.3 } : { base: 12, md: 9 }} >
                  <BlogContent
                    url={url}
                    views={views}
                    title={item.title}
                    thumbnailUrn={item.imageUrl}
                    updatedAt={item.updatedAt}
                    timeToRead={item.timeToRead}
                    loading={loading}
                    contentFormat={item.contentFormat}
                    description={item.description}
                    onHeadingsExtracted={onHeadingsExtracted}
                    setActiveHeading={setActiveHeading}
                  />
                </GridCol>

                <GridCol span={itemHeadings.length > 0 ? { base: 12, md: 2.5 } : { base: 12, md: 3 }}>
                  <Box pos="sticky" top={0}>
                    <Box mt={itemHeadings.length > 1 ? 'lg' : 0}>
                      <SidebarPost />
                    </Box>
                  </Box>
                </GridCol>
              </Grid>

              <Container fluid>
                <Stack my={'xl'}>
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
          </>
        )}
      </Box>
    </Container>
  );
}

export default BlogContentDetails;
