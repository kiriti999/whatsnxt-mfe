import type { Dispatch, SetStateAction } from 'react';
import { Box, Title } from '@mantine/core';
import { useAddIdsToHeadings, useContentRefAndHeadings, useHandleScroll } from '../../../../hooks/useToc';
import TutorialNavButtons from './NavButtons';

type PROPS = {
  isTutorial: boolean;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
  onHeadingsExtracted: any;
  setActiveHeading: (headingRef: HTMLElement) => void;
  tutorials: Array<any>;
  loading: boolean;
}

// Add styles for both Markdown and HTML content
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
    border-radius: 0 !important;
    font-size: 0.9em !important;
    line-height: 1.6 !important;
    white-space: pre !important;
    display: block !important;
    -moz-tab-size: 2 !important;
    -o-tab-size: 2 !important;
    tab-size: 2 !important;
  }

  /* ALL standalone code elements - treat as code blocks (this includes HTML content) */
  code,
  #blog-content code,
  .rte code,
  [class*="rte"] code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, 'Courier New', monospace !important;
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
    padding: 0.2em !important;
    display: block !important;
    overflow-x: auto !important;
    border: 0.5px dotted #333 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    font-size: 0.9em !important;
    line-height: 1.6 !important;
    white-space: pre !important;
    -moz-tab-size: 2 !important;
    -o-tab-size: 2 !important;
    tab-size: 2 !important;
  }

  /* Override: Code elements that should remain inline (very short, single-word code) */
  /* We'll identify inline code by checking if it's very short or in specific contexts */
  span code,
  strong code,
  em code,
  a code {
    background-color: #f5f5f5 !important;
    color: #333 !important;
    padding: 0.2em 0.4em !important;
    margin: 0 !important;
    display: inline !important;
    border-radius: 4px !important;
    font-size: 0.85em !important;
    white-space: nowrap !important;
    border: 1px solid #ddd !important;
    box-shadow: none !important;
  }

  /* Special handling: if code contains multiple lines or is very long, force block display */
  code[data-language],
  .language-javascript,
  .language-html,
  .language-css,
  .language-json,
  .language-python,
  .language-java,
  .language-cpp,
  .language-c {
    display: block !important;
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
  }
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
  const { description, title } = tutorials[active];

  const { containerRef } = useAddIdsToHeadings(description);
  const contentRef = useContentRefAndHeadings(
    loading,
    description,
    onHeadingsExtracted,
  );

  useHandleScroll(contentRef, setActiveHeading);

  return (
    <>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>

      <Box mb='md' ref={contentRef}>
        <Title order={4} mt={'0.33rem'} mb={'xl'}>
          {isTutorial ? title : ''}
        </Title>
        {isTutorial && (
          <TutorialNavButtons
            setActive={setActive}
            active={active}
            tutorials={tutorials}
          />
        )}
        {tutorials[active] && (
          <div className="rte text-wrap" ref={containerRef} />
        )}
      </Box>
    </>
  );
};

export default TutorialContent;
