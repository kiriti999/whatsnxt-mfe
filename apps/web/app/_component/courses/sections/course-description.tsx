import { Accordion, Title } from '@mantine/core'
import HtmlParser from '../../../../components/Common/HtmlParse'
import styles from '../../../../components/Courses/Course.module.css';
import { syntaxHighlightingTheme } from '../../../../components/RichTextEditor/extensions/CodeHighlight/syntaxHighlightingTheme';
import { lexicalToHtml } from '../../../../utils/lexicalToHtml';

// Combine base code block styles with comprehensive syntax highlighting theme
const codeBlockStyles = `
  /* Base code block styles */
  .rte p {
    margin-bottom: 0px;
  }

  ${syntaxHighlightingTheme}
`;

/**
 * Convert content to HTML for rendering.
 * Handles both Lexical JSON and legacy HTML content.
 */
const toRenderedHtml = (content: string): string => {
    if (!content) return '';
    try {
        const parsed = JSON.parse(content);
        if (parsed?.root) {
            return lexicalToHtml(parsed);
        }
    } catch {
        // Not JSON — treat as HTML
    }
    return content;
};


const CourseDescription = ({ courseTopics }) => {
    const renderedContent = toRenderedHtml(courseTopics);
    return (
        <>
            {/* Include the content styles */}
            <style> {codeBlockStyles}</style >
            <div className={`rte ${styles['courses-overview']}`}>
                <div style={{ display: 'contents' }}>
                    <Accordion variant="default" defaultValue="description" transitionDuration={250}>
                        <Accordion.Item value="description" p={0}>
                            <Accordion.Control p={0}>
                                <Title order={3}>Description</Title>
                            </Accordion.Control>
                            <Accordion.Panel>
                                {/* TODO: Add line clamp */}
                                <HtmlParser content={renderedContent} withOptions />
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        </>
    )
}

export default CourseDescription;
