'use client';
import { useEffect, useState, useCallback } from 'react';
import SidebarHeadings from '../../../components/Blog/sidebar-headings';
import { AnalyticsAPI } from '../../../apis/v1/blog/analyticsApi';
import { usePathname } from 'next/navigation';
import SidebarPost from '../../../components/Blog/sidebar-post';
import ClipboardCopy from '@whatsnxt/core-ui/src/ShareOptions/ClipBoardCopy';
import WhatsappShare from '@whatsnxt/core-ui/src/ShareOptions/WhatsappShare';
import GooglePageViews from '../../../components/Blog/Content/GooglePageViews';
import TutorialContent from '../../../components/Blog/Content/Tutorial/TutorialContent';
import { TutorialArticle } from '../../../types/contentDetails';
import FacebookShare from '@whatsnxt/core-ui/src/ShareOptions/FacebookShare';
import { SkeletonBlogContent } from '@whatsnxt/core-ui';
import { Text, Box, Container, Group, Stack, Grid, GridCol, Title, Divider } from '@mantine/core';
import TutorialsToc from '../TutorialToc';
import useAuth from '../../../hooks/Authentication/useAuth';
import { useMediaQuery } from '@mantine/hooks';
import useCommentHandlers from '@whatsnxt/blogcomments/src/hooks/useCommentHandlers';
import BlogComment from '@whatsnxt/blogcomments/src';
import { CommentReplyContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-reply-context';
import { CommentContextProvider } from '@whatsnxt/blogcomments/src/contexts/comment-context';

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

  const pathName = usePathname();

  //TODO: Move Fetch views to server side rendering if possible
  // useEffect(() => {
  //   (async () => {
  //     const resViews = await fetchViews();
  //     let totalViews = 0;
  //     for (let i = 0; i < resViews.rows.length; i++) {
  //       const row = resViews.rows[i];
  //       const dimension = row.dimensionValues[0].value;
  //       const metric = parseInt(row.metricValues[0].value);
  //       const pathname = pathName;
  //       if (dimension.endsWith(pathname)) {
  //         totalViews += metric;
  //       }
  //     }
  //
  //     setViews(totalViews);
  //   })();
  // }, [pathName]);

  const navigateTutorial = (i: number) => {
    return () => {
      setActive(i);
    };
  };

  return (
    <Container fluid>
      <Box>
        {loading ? (
          <div className="">
            <SkeletonBlogContent />
          </div>
        ) : (
          <Box>
            <Grid mb={'5rem'}>
              {!isMobile && (
                <GridCol span={{ base: 12, md: 2.2 }}>
                  <div className='position-sticky top-0'>
                    <Title order={4} mt={'0.33rem'} mb={'xl'}>{item.title}</Title>
                    <TutorialsToc tutorials={tutorials} active={active} navigateTutorial={navigateTutorial} />
                  </div>
                </GridCol>
              )}

              {/* show this col on mobile size */}
              <div className='d-block d-lg-none p-2'>
                <SidebarHeadings
                  headings={itemHeadings}
                  activeHeadingRef={activeHeadingRef}
                />
              </div>

              <GridCol span={{ base: 12, md: 7.5 }} mx="auto">
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
                  <ShareOptions url={url} views={views} />
                </Stack>

                <Stack m={0} gap="md">
                  <Divider />
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

              </GridCol>

              {/* show this col on tablet and desktop */}
              <GridCol span={{ base: 12, md: 2.3 }} mb={'xl'}>
                <div className='d-none d-lg-block position-sticky top-0'>
                  <SidebarHeadings
                    headings={itemHeadings}
                    activeHeadingRef={activeHeadingRef}
                  />
                  <Box>
                    <SidebarPost />
                  </Box>
                </div>
              </GridCol>
            </Grid>
          </Box>
        )}
      </Box>
    </Container >
  );
}

interface ShareOptionsProps {
  url: string;
  views: number;
}

const ShareOptions: React.FC<ShareOptionsProps> = ({ url, views }) => {
  return (
    <Box my="md">
      <Text size="md" mb="sm" c="inherit">
        Share this tutorial:
      </Text>
      <Group justify="space-between">
        <Group gap="xs">
          <WhatsappShare url={url} />
          <FacebookShare url={url} />
          <ClipboardCopy url={url} />
        </Group>
        <GooglePageViews views={views} />
      </Group>
    </Box>
  );
};

export default TutorialContentDetails;
