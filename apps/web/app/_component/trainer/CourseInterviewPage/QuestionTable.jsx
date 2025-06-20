import React, { useState } from "react";
import {
  Tooltip,
  ActionIcon,
  Box,
  Loader,
  Stack,
  Flex,
  Text,
  Card,
} from "@mantine/core";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Enables GitHub-style markdown

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { interviewAPI } from "../../../../apis/v1/courses/interview/interview";

const QuestionTable = ({ questions, refreshQuestions, onEdit }) => {
  const [loadingId, setLoadingId] = useState(null);

  // Media query hooks to detect device type
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleDelete = async (questionId) => {
    setLoadingId(questionId);
    try {
      await interviewAPI.deleteQuestion(questionId);
      refreshQuestions();
      showNotification({
        title: "Success",
        message: "Question deleted successfully.",
        color: "green",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      showNotification({
        title: "Error",
        message: "Failed to delete the question. Please try again.",
        color: "red",
      });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box mt="md">
      {questions.length === 0 ? (
        <Box align="center">No questions available.</Box>
      ) : (
        <Stack gap="xs">
          {questions.map((item) => (
            <Card key={item._id} withBorder radius="md" padding="md">
              {/* Action buttons in a row above the question */}
              <Flex justify="flex-end" mb="xs" gap="xs">
                <Tooltip label="Edit Question" withArrow>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="md"
                    aria-label="Edit Question"
                    onClick={() => onEdit(item)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete Question" withArrow>
                  <ActionIcon
                    variant="light"
                    color="red"
                    size="md"
                    aria-label="Delete Question"
                    onClick={() => handleDelete(item._id)}
                  >
                    {loadingId === item._id ? <Loader size="xs" /> : <IconTrash size={16} />}
                  </ActionIcon>
                </Tooltip>
              </Flex>

              {/* Question text */}
              <Box mb="md">
                <Text size="sm" fw={700} style={{ textAlign: "justify" }}>
                  {item?.questionUpdated}
                </Text>
              </Box>

              {/* Answer section */}
              <Box
                sx={{
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                  overflowX: "auto",
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item?.answerUpdated}
                </ReactMarkdown>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionTable;