'use client';
import { useEffect, useState, useCallback } from 'react';
import SidebarHeadings from '../../../components/Blog/sidebar-headings';
import { AnalyticsAPI } from '../../../apis/v1/blog/analyticsApi';
import SidebarPost from '../../../components/Blog/sidebar-post';
import GooglePageViews from '../../../components/Blog/Content/GooglePageViews';
import TutorialContent from '../../../components/Blog/Content/Tutorial/TutorialContent';
import { TutorialArticle } from '../../../types/contentDetails';
import { ShareOptions } from '@whatsnxt/core-ui';
import { SkeletonBlogContent } from '@whatsnxt/core-ui';
import { Text, Box, Container, Group, Stack, Grid, GridCol, Title, Paper } from '@mantine/core';
import useAuth from '../../../hooks/Authentication/useAuth';
import { useMediaQuery } from '@mantine/hooks';
import useCommentHandlers from '@whatsnxt/blogcomments/src/hooks/useCommentHandlers';
import BlogComment from '@whatsnxt/blogcomments/src';
import { CommentReplyContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-reply-context';
import { CommentContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-context';
import { StickyTutorialFooter } from '../../../components/Blog/Content/Tutorial/StickyTutorialFooter';
import StickyHeader from '../../../components/Blog/Content/StickyHeader';

const initialProps = {
  title: '',
  description: '',
  categoryName: [],
  tutorial: false,
};

async function fetchViews() {
  return await AnalyticsAPI.fetchViews();
}

function TutorialContentDetails({ details }: any) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [item, setItem] = useState(initialProps) as any;
  const [tutorials, setTutorials] = useState<TutorialArticle[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  const [contentId, setContentId] = useState('');
  const [comments, setComments] = useState<any>({
    id: 1,
    items: [],
  });
  const [views, setViews] = useState(0);
  const { user } = useAuth();
  const email = user?.email || '';
  const userId = user?._id;

  const [activeHeadingRef, setActiveHeadingRef] = useState<HTMLElement | null>(
    null
  );
  const [itemHeadings, setItemHeadings] = useState<{
    ref: HTMLElement;
    text: string;
    id: string
  }[]>([]);

  const onHeadingsExtracted = useCallback(
    (headings: { ref: HTMLElement; text: string; id: string }[]) => {
      setItemHeadings(headings);
    }, []);

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
      const { _id, tutorials } = details;
      setItem(details);
      setContentId(_id);
      setTutorials(tutorials);
      setLoading(false);
    }
  }, [details._id]);

  const prevPost = active > 0 ? {
    label: tutorials[active - 1]?.title,
    onClick: () => setActive(active - 1)
  } : null;

  const nextPost = active < tutorials.length - 1 ? {
    label: tutorials[active + 1]?.title,
    onClick: () => setActive(active + 1)
  } : null;

  return (
    <Container fluid>
      <Box>
        {loading ? (
          <div className="">
            <SkeletonBlogContent />
          </div>
        ) : (
          <Box>
            {itemHeadings.length > 0 && isMobile && <StickyHeader titles={itemHeadings} />}
            <Grid mb={'5rem'}>
              {!isMobile && (
                <GridCol span={{ base: 12, md: 2.2 }}>
                  <Box
                    pos="sticky"
                    top={100}
                    style={{
                      maxHeight: 'calc(100vh - 100px)',
                      overflowY: 'auto'
                    }}
                  >
                    {itemHeadings.length > 0 && (
                      <SidebarHeadings
                        headings={itemHeadings}
                        activeHeadingRef={activeHeadingRef}
                        // @ts-ignore
                        activeHeadingId={activeHeadingRef?.id}
                      />
                    )}
                  </Box>
                </GridCol>
              )}


              <GridCol span={{ base: 12, md: 7.5 }} mx="auto">
                <Stack gap="md">
                  {/* Content Paper */}
                  <Paper withBorder p="xl" radius="xs">
                    <TutorialContent
                      active={active}
                      setActive={setActive}
                      isTutorial={true}
                      loading={loading}
                      tutorials={tutorials}
                      onHeadingsExtracted={onHeadingsExtracted}
                      setActiveHeading={setActiveHeading}
                    />

                    <Stack m={0}>
                      <ShareOptionsWithViews
                        url={url}
                        views={views}
                        title={item.title}
                        thumbnailUrn={item.imageUrl}
                        description={item.description}
                        email={email}
                      />
                    </Stack>
                  </Paper>

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
                            setComments={setComments}
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

              {/* show this col on tablet and desktop */}
              {/* show this col on tablet and desktop */}
              <GridCol span={{ base: 12, md: 2.3 }} mb={'xl'}> {/* Reverted span to 2.3 */}
                <Box
                  pos="sticky"
                  top={100}
                  style={{
                    maxHeight: 'calc(100vh - 100px)',
                    overflowY: 'auto'
                  }}
                >
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

interface ShareOptionsWithViewsProps {
  url: string;
  views: number;
  title?: string;
  thumbnailUrn?: string;
  description?: string;
  email?: string;
}

const ShareOptionsWithViews: React.FC<ShareOptionsWithViewsProps> = ({ url, views, title, thumbnailUrn, description, email }) => {
  return (
    <Box my="md">
      <Text size="md" mb="sm" c="inherit">
        Share this tutorial:
      </Text>
      <Group justify="space-between">
        <Group gap="xs">
          <ShareOptions
            url={url}
            title={title}
            thumbnailUrn={thumbnailUrn || ''}
            description={description}
            email={email}
          />
        </Group>
        <GooglePageViews views={views} />
      </Group>
    </Box>
  );
};

export default TutorialContentDetails;
