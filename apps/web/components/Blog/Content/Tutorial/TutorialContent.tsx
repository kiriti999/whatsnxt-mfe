'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, lazy, Suspense } from 'react';
import { Box, Title } from '@mantine/core';
import { useAddIdsToHeadings, useContentRefAndHeadings, useHandleScroll } from '../../../../hooks/useToc';
import { syntaxHighlightingTheme } from '../../../RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme';

// Lazy load LexicalEditor only on client
const LexicalEditor = lazy(() => 
  import('../../../StructuredTutorial/Editor/LexicalEditor').then(mod => ({ 
    default: mod.LexicalEditor 
  }))
);

type PROPS = {
  isTutorial: boolean;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
  onHeadingsExtracted: any;
  setActiveHeading: (headingRef: HTMLElement) => void;
  tutorials: Array<any>;
  loading: boolean;
}

// Combine base paragraph styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base styles for paragraphs */
  .rte p, #blog-content p {
    margin-bottom: 0px;
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

  // Extract headings from LexicalEditor when it renders
  useEffect(() => {
    if (!loading && lexicalContainerRef.current && lexicalState) {
      const headings = Array.from(
        lexicalContainerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6'),
      ).map((heading) => ({
        ref: heading,
        text: heading.textContent || '',
        id: heading.textContent?.toLowerCase().replace(/\s+/g, '_') || '',
      }));
      headings.shift();
      onHeadingsExtracted(headings);
    }
  }, [loading, lexicalState, onHeadingsExtracted]);

  return (
    <>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>

      <Box mb='md' ref={!lexicalState ? contentRef : undefined}>
        <Title order={4} mt={'0.33rem'} mb={'xl'}>
          {isTutorial ? title : ''}
        </Title>

        {tutorial && (
          <div className="rte text-wrap">
            {lexicalState ? (
              <div ref={lexicalContainerRef}>
                <Suspense fallback={<div>Loading editor...</div>}>
                  <LexicalEditor
                    value={typeof lexicalState === 'string' ? lexicalState : JSON.stringify(lexicalState)}
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
