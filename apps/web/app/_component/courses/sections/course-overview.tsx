import { Title, Box, Paper } from '@mantine/core';
import { LexicalEditor } from '../../../../components/StructuredTutorial/Editor/LexicalEditor';
import blogStyles from '../../../../components/Blog/Content/BlogContent.module.css';

const CourseOverview = ({ courseName, overview }) => {
  return (
    <>
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
          <Box className={`${blogStyles.content} rte`}>
            <LexicalEditor value={overview} readOnly={true} />
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default CourseOverview;
