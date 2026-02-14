import { useState } from "react";
import { Button, TextInput, Group, Loader, Box, Text, Flex } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { interviewAPI } from "../../../../apis/v1/courses/interview/interview";
import { AISuggestionButton } from "../../../../components/Common/AISuggestionButton";
import dynamic from "next/dynamic";

const LexicalEditor = dynamic(
  () => import("../../../../components/StructuredTutorial/Editor/LexicalEditor").then(mod => ({ default: mod.LexicalEditor })),
  { ssr: false }
);

const EditQuestion = ({ questionData, onUpdate, onCancel }) => {
  const [questionText, setQuestionText] = useState(questionData.questionUpdated);
  const [answerText, setAnswerText] = useState(questionData.answerUpdated);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedQuestion = {
        question: questionText,
        answer: answerText,
      };
      await interviewAPI.updateQuestion(questionData._id, updatedQuestion); // Call the update API
      onUpdate(); // Refresh the questions list
      showNotification({
        title: "Success",
        message: "Question updated successfully.",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating question:", error);
      showNotification({
        title: "Error",
        message: "Failed to update the question. Please try again.",
        color: "red",
      });
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <Box>
      <TextInput
        label="Edit Question"
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        mb="md"
      />
      <Box mb="md" mt="xs">
        <Flex align="center" gap={4} mb="xs">
          <Text size="sm" fw={500}>Edit Answer</Text>
          <AISuggestionButton
            prompt={() => questionText}
            onSuggestion={(text) => setAnswerText(text)}
          />
        </Flex>
        <LexicalEditor
          value={answerText}
          onChange={(state) => setAnswerText(state)}
          placeholder="Edit your answer..."
        />
      </Box>
      <Group position="apart">
        <Button color="green" onClick={handleUpdate} disabled={isUpdating}>
          {isUpdating ? <Loader color="white" size="sm" /> : "Save"}
        </Button>
        <Button color="red" onClick={onCancel}>
          Cancel
        </Button>
      </Group>
    </Box>
  );
};

export default EditQuestion;
