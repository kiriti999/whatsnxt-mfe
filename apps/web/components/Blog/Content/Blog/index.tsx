import React, { useCallback } from 'react';
import Skeleton from 'react-loading-skeleton';
import {
  useAddIdsToHeadings,
  useContentRefAndHeadings,
  useHandleScroll,
} from '../../../../hooks/useToc';
import { Title, Text, Flex, Box } from '@mantine/core';
import { ShareOptions } from '@whatsnxt/core-ui';
import GooglePageViews from '../GooglePageViews';
import useAuth from '../../../../hooks/Authentication/useAuth';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import { syntaxHighlightingTheme } from '../../../RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme';

interface BlogContentProps {
  url: string;
  views: any;
  title: string;
  thumbnailUrn: string;
  timeToRead: string;
  updatedAt: string;
  loading: boolean;
  description: string;
  contentFormat?: 'MARKDOWN' | 'HTML'; // Optional prop to specify content format
  onHeadingsExtracted: (
    headings: { ref: Element; text: string; id: string }[]
  ) => void;
  setActiveHeading: (headingRef: Element) => void;
}

// Combine base paragraph styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base styles for paragraphs */
  .rte p, #blog-content p {
    margin-bottom: 0px;
  }

  .rte blockquote, 
  #blog-content blockquote,
  .lexical-quote {
    border-left: 4px solid #ced4da !important;
    padding-left: 1.25rem !important;
    margin: 1.5rem 0 !important;
    font-style: italic !important;
    color: #495057 !important;
    background-color: transparent !important;
  }

  ${syntaxHighlightingTheme}
`;

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
  const mdRef = useRef<HTMLDivElement>(null);

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

  // For Markdown content, extract headings after render
  useEffect(() => {
    if (contentFormat === 'MARKDOWN' && !loading && mdRef.current) {
      // Wait for markdown to render fully
      setTimeout(() => {
        const headings = Array.from(
          mdRef.current?.querySelectorAll('h1, h2, h3, h4, h5, h6') || []
        ).map((heading, index) => {
          // Add ID if it doesn't exist
          if (!heading.id) {
            const headingText = heading.textContent || `heading-${index}`;
            const headingId = headingText
              .toLowerCase()
              .replace(/[^\w\s]/g, '')
              .replace(/\s+/g, '_');
            heading.id = headingId;
          }

          return {
            ref: heading,
            text: heading.textContent || '',
            id: heading.id
          };
        });

        onHeadingsExtractedCallback(headings);
      }, 100);
    }
  }, [contentFormat, loading, description, onHeadingsExtractedCallback]);

  // Handle scroll events for Markdown content
  useEffect(() => {
    if (contentFormat === 'MARKDOWN') {
      const handleScroll = () => {
        if (!mdRef.current) return;

        const contentTop = mdRef.current.getBoundingClientRect().top;
        const headings = mdRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');

        let closestHeading = null;
        let closestHeadingDistance = Number.MAX_VALUE;

        headings.forEach((heading) => {
          const { top } = heading.getBoundingClientRect();
          const relativeTop = top - contentTop;

          if (relativeTop >= 0 && relativeTop < closestHeadingDistance) {
            closestHeadingDistance = relativeTop;
            closestHeading = heading;
          }
        });

        if (closestHeading) {
          setActiveHeading(closestHeading);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [contentFormat, setActiveHeading]);

  return (
    <div>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>

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
            {/* <GooglePageViews views={views} /> */}
          </Flex>

          {/* Conditionally render content based on format */}
          {contentFormat === 'MARKDOWN' ? (
            <div className="rte text-wrap" ref={mdRef}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {description}
              </ReactMarkdown>
            </div>
          ) : (
            <div
              className="rte text-wrap"
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