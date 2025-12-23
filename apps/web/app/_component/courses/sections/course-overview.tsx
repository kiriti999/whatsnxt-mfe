import { Title, Box, Paper, Text } from '@mantine/core';
import HtmlParser from '../../../../components/Common/HtmlParse';

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

      <Box mb="xl">
        {/* Course Title */}
        <Title
          order={1}
          size="h2"
          fw={700}
          mb="lg"
          style={{
            lineHeight: 1.3
          }}
        >
          {courseName}
        </Title>

        {/* Overview Section */}
        <Paper
          p="md"
          radius="md"
          withBorder
          style={{
            borderColor: 'var(--mantine-color-gray-3)'
          }}
        >
          <Title
            order={4}
            size="h5"
            fw={600}
            mb="sm"
            c="dimmed"
          >
            Overview
          </Title>
          <Box className="rte">
            <HtmlParser content={overview} withOptions />
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default CourseOverview;
