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

// Dark theme code block styles that handle both Markdown and HTML content properly
const codeBlockStyles = `
  /* Base styles for paragraphs */
  .rte p, #blog-content p {
    margin-bottom: 0px;
  }

  /* Code blocks - Dark theme styling for ALL code elements */
  pre,
  #blog-content pre,
  .rte pre,
  [class*="rte"] pre {
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    border-radius: 8px !important;
    padding: 1.5em !important;
    margin: 1.5em 0 !important;
    overflow-x: auto !important;
    border: 1px solid #333 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  }

  /* Code inside pre blocks */
  pre code,
  #blog-content pre code,
  .rte pre code,
  [class*="rte"] pre code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
    background-color: transparent !important;
    color: inherit !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    border-radius: 8px !important;
    line-height: 1.6 !important;
    white-space: pre !important;
    display: block !important;
    overflow-x: visible !important;
    -moz-tab-size: 2 !important;
    -o-tab-size: 2 !important;
    tab-size: 2 !important;
  }

  /* ALL standalone code elements - Remove individual scrolling completely */
  code,
  #blog-content code,
  .rte code,
  [class*="rte"] code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    padding: 0.4em 0.8em !important;
    display: block !important;
    overflow: visible !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    border: 1px solid #333 !important;
    border-radius: 0 !important; /* Removed border radius */
    line-height: 1.4 !important;
    white-space: pre !important;
    word-wrap: break-word !important;
    word-break: normal !important;
    -moz-tab-size: 2 !important;
    -o-tab-size: 2 !important;
    tab-size: 2 !important;
    box-shadow: none !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* Create visual connection between consecutive code blocks */
  code + code,
  #blog-content code + code,
  .rte code + code,
  [class*="rte"] code + code {
    border-top: none !important;
    margin-top: -1px !important;
    border-radius: 0 !important; /* Ensure no border radius on connected blocks */
  }

  /* Override for inline code that should stay inline */
  span code,
  strong code,
  em code,
  a code {
    background-color: #f5f5f5 !important;
    color: #333 !important;
    padding: 0.2em 0.4em !important;
    margin: 0 !important;
    display: inline !important;
    border-radius: 4px !important; /* Keep small radius for inline code */
    font-size: 0.85em !important;
    white-space: nowrap !important;
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    overflow: visible !important;
    word-wrap: normal !important;
    word-break: normal !important;
  }

  /* Ensure the container can handle wide content */
  .rte,
  #blog-content {
    overflow-x: auto !important;
    max-width: 100% !important;
  }

  /* Special handling for language-specific code blocks */
  code[data-language],
  code[class*="language-"] {
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    border: 1px solid #333 !important;
    border-radius: 0 !important; /* Removed border radius */
    padding: 1em !important;
    margin: 0.5em 0 !important;
  }
`;

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
              {timeToRead}
            </Text>
            <Text size="0.9rem" c="#6B6B6B" p="0.2rem" style={{ border: '1px dotted gray' }}>
              posted on {updatedAt}
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