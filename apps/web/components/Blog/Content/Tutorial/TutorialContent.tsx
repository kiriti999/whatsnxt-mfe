import type { Dispatch, SetStateAction } from 'react';
import { Box, Title } from '@mantine/core';
import { useAddIdsToHeadings, useContentRefAndHeadings, useHandleScroll } from '../../../../hooks/useToc';
import { LexicalEditor } from '../../../StructuredTutorial/Editor/LexicalEditor';
import styles from '../BlogContent.module.css';

type PROPS = {
  isTutorial: boolean;
  active: number;
  setActive: Dispatch<SetStateAction<number>>;
  onHeadingsExtracted: any;
  setActiveHeading: (headingRef: HTMLElement) => void;
  tutorials: Array<any>;
  loading: boolean;
}

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
      <Box mb='md' ref={contentRef}>
        <Title order={4} mt={'0.33rem'} mb={'xl'}>
          {isTutorial ? title : ''}
        </Title>

        {tutorials[active] && (tutorials[active].contentFormat === 'JSON' || (typeof tutorials[active].description === 'string' && tutorials[active].description.trim().startsWith('{'))) ? (
          <div className={`${styles.content} rte text-wrap`} ref={contentRef}>
            <LexicalEditor
              value={tutorials[active].description}
              readOnly={true}
              onChange={() => { }}
            />
          </div>
        ) : (
          <div className={`${styles.content} rte text-wrap`} ref={containerRef} />
        )}

      </Box>
    </>
  );
};

export default TutorialContent;
