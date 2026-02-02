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
  Paper
} from "@mantine/core";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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
      notifications.show({
        title: "Success",
        message: "Question deleted successfully.",
        color: "green",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      notifications.show({
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
        <Text align="center" c="dimmed" my="xl">No questions available.</Text>
      ) : (
        <Stack gap="xs">
          {questions.map((item) => (
            <Card key={item._id} withBorder radius="md" padding="md">
              {/* Action buttons in a row above the question */}
              {/* Header: Question Text + Action Buttons */}
              <Flex justify="space-between" align="flex-start" mb="md" gap="md">
                <Text size="sm" fw={700} style={{ textAlign: "justify", flex: 1 }} c="gray">
                  {item?.questionUpdated}
                </Text>

                <Flex gap="xs" style={{ flexShrink: 0 }}>
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


              </Flex>

              {/* Answer section */}
              <Paper withBorder p="sm" radius="xs" style={{ overflowX: "auto" }} shadow='none'>
                <Text c="gray">
                  {item?.answerUpdated}
                </Text>
              </Paper>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default QuestionTable;