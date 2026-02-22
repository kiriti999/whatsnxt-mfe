"use client";

import { Box, Title } from "@mantine/core";
import type { Dispatch, SetStateAction } from "react";
import { lazy, Suspense, useRef } from "react";
import {
  useAddIdsToHeadings,
  useContentRefAndHeadings,
  useHandleScroll,
  useLexicalHeadings,
} from "../../../../hooks/useToc";
import { syntaxHighlightingTheme } from "../../../RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme";

// Lazy load LexicalEditor only on client
const LexicalEditor = lazy(() =>
  import("../../../StructuredTutorial/Editor/LexicalEditor").then((mod) => ({
    default: mod.LexicalEditor,
  })),
);

type PROPS = {
  isTutorial: boolean;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
  onHeadingsExtracted: any;
  setActiveHeading: (headingRef: HTMLElement) => void;
  tutorials: Array<any>;
  loading: boolean;
};

// Combine base paragraph styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base styles for paragraphs */
  .rte p, #blog-content p {
    margin-bottom: 0px;
  }

  /* Prevent AI-generated content from overflowing horizontally */
  .rte,
  .rte * {
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .rte svg {
    max-width: 100%;
    height: auto;
    overflow: hidden;
  }

  /* Force theme-aware text colors on content (overrides AI-generated inline styles) */
  .rte h1,
  .rte h2,
  .rte h3,
  .rte h4,
  .rte h5,
  .rte h6 {
    color: light-dark(#221638, var(--mantine-color-white)) !important;
  }

  .rte p,
  .rte li,
  .rte ul,
  .rte ol,
  .rte td,
  .rte th,
  .rte blockquote,
  .rte summary,
  .rte details {
    color: light-dark(rgba(0, 0, 0, 0.85), rgba(255, 255, 255, 0.9)) !important;
  }

  .rte strong,
  .rte b {
    color: light-dark(rgba(0, 0, 0, 0.95), rgba(255, 255, 255, 1)) !important;
  }

  ${syntaxHighlightingTheme}
`;

const TutorialContent = (props: PROPS) => {
  const {
    isTutorial,
    active,
    setActive,
    tutorials,
    onHeadingsExtracted,
    setActiveHeading,
    loading,
  } = props;
  const tutorial = tutorials[active];
  const { description, title, lexicalState } = tutorial || {};

  const lexicalContainerRef = useRef<HTMLDivElement>(null);
  const { containerRef } = useAddIdsToHeadings(description);
  const contentRef = useContentRefAndHeadings(
    loading,
    description,
    onHeadingsExtracted,
  );

  useHandleScroll(contentRef, setActiveHeading);

  // Extract headings from Lexical editor after it renders (async/lazy-loaded)
  useLexicalHeadings(lexicalContainerRef, !!lexicalState, onHeadingsExtracted);

  return (
    <>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>

      <Box mb="md" ref={!lexicalState ? contentRef : undefined}>
        <Title order={4} mt={"0.33rem"} mb={"xl"}>
          {isTutorial ? title : ""}
        </Title>

        {tutorial && (
          <div className="rte text-wrap">
            {lexicalState ? (
              <div ref={lexicalContainerRef}>
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
              <div ref={containerRef} />
            )}
          </div>
        )}
      </Box>
    </>
  );
};

export default TutorialContent;
