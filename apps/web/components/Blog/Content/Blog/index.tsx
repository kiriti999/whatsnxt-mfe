import React, { useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import {
  useAddIdsToHeadings,
  useContentRefAndHeadings,
  useHandleScroll,
} from '../../../../hooks/useToc';
import { Title, Text, Flex, Box } from '@mantine/core';
import { ShareOptions } from '@whatsnxt/core-ui';
import useAuth from '../../../../hooks/Authentication/useAuth';
import { LexicalEditor } from '../../../StructuredTutorial/Editor/LexicalEditor';
import styles from '../BlogContent.module.css';


interface BlogContentProps {
  url: string;
  views: any;
  title: string;
  thumbnailUrn: string;
  timeToRead: string;
  updatedAt: string;
  loading: boolean;
  description: string;
  contentFormat?: 'HTML' | 'JSON'; // Optional prop to specify content format
  onHeadingsExtracted: (
    headings: { ref: Element; text: string; id: string }[]
  ) => void;
  setActiveHeading: (headingRef: Element) => void;
}

// Format date to human-readable format like "October 13, 2025"
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

const BlogContent = ({
  url,
  views,
  title,
  thumbnailUrn,
  timeToRead,
  updatedAt,
  loading,
  description,
  contentFormat = 'HTML', // Default to HTML if not specified
  onHeadingsExtracted,
  setActiveHeading,
}: BlogContentProps) => {

  const { user } = useAuth();

  // Handle different content formats
  // No longer using mdRef as MARKDOWN support is removed

  // For HTML content, use existing hooks
  const { containerRef } = useAddIdsToHeadings(
    contentFormat === 'HTML' ? description : ''
  );

  const onHeadingsExtractedCallback = useCallback(
    (headings) => {
      // Don't filter out first heading
      onHeadingsExtracted(headings);
    },
    [onHeadingsExtracted]
  );

  const contentRef = useContentRefAndHeadings(
    loading,
    description,
    onHeadingsExtractedCallback
  );

  useHandleScroll(contentRef, setActiveHeading);

  return (
    <div>
      {loading ? (
        <Skeleton count={30} height={50} />
      ) : (
        <Box ref={contentRef} id="blog-content" mt="lg">
          <Title order={4} id="blog-title">
            {title}
          </Title>
          <Flex align="center" gap="xs" mb="xl">
            <Text size="0.9rem" c="#6B6B6B" p="0.2rem" style={{ border: '1px dotted gray' }}>
              {timeToRead || '1 min read'}
            </Text>
            <Text size="0.4rem" c="#6B6B6B" p="0.4rem" style={{ border: '1px dotted gray' }}>
              Last updated: {formatDate(updatedAt)}
            </Text>
            <ShareOptions
              url={url}
              title={title}
              thumbnailUrn={thumbnailUrn}
              email={user?.email}
              description={description}
            />
          </Flex>

          {/* Conditionally render content based on format */}
          {(contentFormat === 'JSON' || (typeof description === 'string' && description.trim().startsWith('{"root"'))) ? (
            <div className={`${styles.content} rte text-wrap`} ref={contentRef}>
              <LexicalEditor
                value={description}
                readOnly={true}
                onChange={() => { }}
              />
            </div>
          ) : (
            <div
              className={`${styles.content} rte text-wrap`}
              ref={containerRef}
            /* HTML content is injected by useAddIdsToHeadings */
            />
          )}
        </Box>
      )}
    </div>
  );
};

export default BlogContent;