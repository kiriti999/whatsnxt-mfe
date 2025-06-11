import { Accordion, Title } from '@mantine/core'
import HtmlParser from '../../../../components/Common/HtmlParse'
import styles from '../../../../components/Courses/Course.module.css';

// Add styles for both Markdown and HTML content
const codeBlockStyles = `
  /* Base code block styles */
  .rte p {
    margin-bottom: 0px;
  }

  .rte code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    direction: ltr;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    line-height: 1.5;
    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;
    background-color: #f5f5f5;
    border-radius: 4px;
    padding: 0.5em;
    overflow-x: auto;
    font-size: 0.8em;
    white-space: pre !important;
  }
  
  /* Preserve spacing in code blocks */
  .rte code {
    tab-size: 4;
  }
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
