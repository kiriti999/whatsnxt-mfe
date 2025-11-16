import { Accordion, Title } from '@mantine/core'
import HtmlParser from '../../../../components/Common/HtmlParse'
import styles from '../../../../components/Courses/Course.module.css';
import { syntaxHighlightingTheme } from '../../../../components/RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme';

// Combine base code block styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base code block styles */
  .rte p {
    margin-bottom: 0px;
  }

  ${syntaxHighlightingTheme}
`;


const CourseDescription = ({ courseTopics }) => {
    return (
        <>
            {/* Include the content styles */}
            <style> {codeBlockStyles}</style >
            <div className={`rte ${styles['courses-overview']} my-4 px-0`}>
                <div style={{ display: 'contents' }}>
                    <Accordion variant="default" defaultValue="description" transitionDuration={250}>
                        <Accordion.Item value="description" p={0}>
                            <Accordion.Control p={0}>
                                <Title order={3}>Description</Title>
                            </Accordion.Control>
                            <Accordion.Panel>
                                {/* TODO: Add line clamp */}
                                <HtmlParser content={courseTopics} withOptions />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        </>
    )
}

export default CourseDescription;
