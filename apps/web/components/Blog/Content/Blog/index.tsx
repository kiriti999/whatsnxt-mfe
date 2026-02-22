"use client";

import { Box, Flex, Paper, Text, Title } from "@mantine/core";
import { ShareOptions } from "@whatsnxt/core-ui";
import React, { lazy, Suspense, useCallback, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import useAuth from "../../../../hooks/Authentication/useAuth";
import {
  useAddIdsToHeadings,
  useContentRefAndHeadings,
  useHandleScroll,
  useLexicalHeadings,
} from "../../../../hooks/useToc";
import { syntaxHighlightingTheme } from "../../../RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme";

const LexicalEditor = lazy(() =>
  import("../../../StructuredTutorial/Editor/LexicalEditor").then((mod) => ({
    default: mod.LexicalEditor,
  })),
);

interface BlogContentProps {
  url: string;
  views: any;
  title: string;
  thumbnailUrn: string;
  timeToRead: string;
  updatedAt: string;
  loading: boolean;
  description: string;
  contentFormat?: "HTML" | "LEXICAL" | "JSON";
  lexicalState?: Record<string, any> | null;
  onHeadingsExtracted: (
    headings: { ref: Element; text: string; id: string }[],
  ) => void;
  setActiveHeading: (headingRef: Element) => void;
}

// Combine base paragraph styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base styles for paragraphs */
  .rte p, #blog-content p {
    margin-bottom: 0px;
  }

  /* Force theme-aware text colors on blog content (overrides AI-generated inline styles) */
  #blog-content .rte h1,
  #blog-content .rte h2,
  #blog-content .rte h3,
  #blog-content .rte h4,
  #blog-content .rte h5,
  #blog-content .rte h6 {
    color: light-dark(#221638, var(--mantine-color-white)) !important;
  }

  #blog-content .rte p,
  #blog-content .rte li,
  #blog-content .rte ul,
  #blog-content .rte ol,
  #blog-content .rte td,
  #blog-content .rte th,
  #blog-content .rte blockquote,
  #blog-content .rte summary,
  #blog-content .rte details {
    color: light-dark(rgba(0, 0, 0, 0.85), rgba(255, 255, 255, 0.9)) !important;
  }

  #blog-content .rte strong,
  #blog-content .rte b {
    color: light-dark(rgba(0, 0, 0, 0.95), rgba(255, 255, 255, 1)) !important;
  }

  .rte blockquote, 
  #blog-content blockquote,
  .lexical-quote {
    border-left: 4px solid #ced4da !important;
    padding-left: 1.25rem !important;
    margin: 1.5rem 0 !important;
    font-style: italic !important;
    color: #495057 !important;
    border-left-color: #b9bac5 !important;
    background-color: transparent !important;
  }

  [data-mantine-color-scheme='dark'] .rte blockquote, 
  [data-mantine-color-scheme='dark'] #blog-content blockquote,
  [data-mantine-color-scheme='dark'] .lexical-quote {
    border-left-color: #ccc843 !important;
    color: #ced4da !important;
  }

  /* Collapsible & Layout dark mode overrides */
  [data-mantine-color-scheme='dark'] .lexical-collapsible-container {
    border-color: #495057 !important;
  }
  
  [data-mantine-color-scheme='dark'] .lexical-collapsible-title {
    background-color: #2c2e33 !important;
    color: #e9ecef !important;
  }
  
  [data-mantine-color-scheme='dark'] .lexical-collapsible-content {
    border-top-color: #495057 !important;
    color: #ced4da !important;
  }
  
  [data-mantine-color-scheme='dark'] .lexical-layout-item {
    border-color: #495057 !important;
    color: #ced4da !important;
  }

  [data-mantine-color-scheme='dark'] .lexical-date {
    background-color: #1a1b1e !important;
    color: #4dadf7 !important;
  }

  /* Blog content paper - no border on mobile */
  .blog-content-paper {
    border: none;
  }

  @media (min-width: 48em) {
    .blog-content-paper {
      border: 1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
    }
  }

  ${syntaxHighlightingTheme}
`;

// Format date to human-readable format like "October 13, 2025"
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const BlogContent = ({
  url,
  title,
  thumbnailUrn,
  timeToRead,
  updatedAt,
  loading,
  description,
  contentFormat = "HTML",
  lexicalState,
  onHeadingsExtracted,
  setActiveHeading,
}: BlogContentProps) => {
  const { user } = useAuth();

  // Handle different content formats
  const lexicalContainerRef = useRef<HTMLDivElement>(null);

  // For HTML content, use existing hooks
  const { containerRef } = useAddIdsToHeadings(
    contentFormat === "HTML" || contentFormat === "JSON" ? description : "",
  );

  const onHeadingsExtractedCallback = useCallback(
    (headings) => {
      // Don't filter out first heading
      onHeadingsExtracted(headings);
    },
    [onHeadingsExtracted],
  );

  const contentRef = useContentRefAndHeadings(
    loading,
    description,
    onHeadingsExtractedCallback,
  );

  useHandleScroll(contentRef, setActiveHeading);

  // Extract headings from Lexical editor after it renders (async/lazy-loaded)
  useLexicalHeadings(
    lexicalContainerRef,
    contentFormat === "LEXICAL" && !!lexicalState,
    onHeadingsExtractedCallback,
  );

  return (
    <div>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>

      {loading ? (
        <Skeleton count={30} height={50} />
      ) : (
        <Box ref={contentRef} id="blog-content">
          <Title order={4} id="blog-title">
            {title}
          </Title>
          <Flex align="center" gap="xs" mb="xl">
            <Text
              size="0.9rem"
              c="light-dark(rgba(0,0,0,0.6), rgba(255,255,255,0.75))"
              px="0.4rem"
              py="0.2rem"
              style={{
                border:
                  "1px dotted light-dark(rgba(0,0,0,0.3), rgba(255,255,255,0.4))",
              }}
            >
              {timeToRead || "1 min read"}
            </Text>
            <Text
              size="0.9rem"
              c="light-dark(rgba(0,0,0,0.6), rgba(255,255,255,0.75))"
              px="0.4rem"
              py="0.2rem"
              style={{
                border:
                  "1px dotted light-dark(rgba(0,0,0,0.3), rgba(255,255,255,0.4))",
              }}
            >
              Updated: {formatDate(updatedAt)}
            </Text>
            <ShareOptions
              url={url}
              title={title}
              thumbnailUrn={thumbnailUrn}
              email={user?.email}
              description={description}
            />
          </Flex>

          <Paper
            px={{ base: "xs", sm: "xl" }}
            radius="xs"
            className="blog-content-paper"
          >
            {/* Conditionally render content based on format */}
            {contentFormat === "LEXICAL" && lexicalState ? (
              <div className="rte text-wrap" ref={lexicalContainerRef}>
                <Suspense fallback={<div>Loading editor...</div>}>
                  <LexicalEditor
                    value={
                      typeof lexicalState === "string"
                        ? lexicalState
                        : JSON.stringify(lexicalState)
                    }
                    readOnly={true}
                  />
                </Suspense>
              </div>
            ) : (
              <div
                className="rte text-wrap"
                ref={containerRef}
              /* HTML content is injected by useAddIdsToHeadings */
              />
            )}
          </Paper>
        </Box>
      )}
    </div>
  );
};

export default BlogContent;
