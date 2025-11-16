import type { Dispatch, SetStateAction } from 'react';
import { Box, Title } from '@mantine/core';
import { useAddIdsToHeadings, useContentRefAndHeadings, useHandleScroll } from '../../../../hooks/useToc';
import TutorialNavButtons from './NavButtons';
import { syntaxHighlightingTheme } from '../../../RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme';

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
