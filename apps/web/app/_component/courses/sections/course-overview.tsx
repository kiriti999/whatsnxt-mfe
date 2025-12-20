import { Title } from '@mantine/core';
import HtmlParser from '../../../../components/Common/HtmlParse';
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

const CourseOverview = ({ courseName, overview }) => {
  return (
    <>
      {/* Include the content styles */}
      <style>{codeBlockStyles}</style>
      <div className={`rte ${styles['courses-overview']} mb-2`}>
        <Title order={3}>{courseName}</Title>
        <Title order={4}>Overview</Title>
        {/* TODO: Add line clamp */}
        <HtmlParser content={overview} withOptions />
      </div >
    </>
  );
};

export default CourseOverview;
