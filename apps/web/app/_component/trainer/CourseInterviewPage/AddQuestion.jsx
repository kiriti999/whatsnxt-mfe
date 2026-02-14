import { useState } from "react";
import { Button, Title, Group, Box, Text, Flex } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AISuggestionButton } from "../../../../components/Common/AISuggestionButton";
import dynamic from "next/dynamic";

const LexicalEditor = dynamic(
  () => import("../../../../components/StructuredTutorial/Editor/LexicalEditor").then(mod => ({ default: mod.LexicalEditor })),
  { ssr: false }
);

const AddQuestion = ({ onAddQuestion, courseId }) => {
  const [questionText, setQuestionText] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const handleSave = async () => {
    const newQuestion = {
      question: questionText,
      answer: suggestion,
      courseId,
    };
    try {
      await onAddQuestion(newQuestion); // Call the parent method to handle API and refresh
      setQuestionText("");
      setSuggestion("");
      showNotification({
        title: "Success",
        message: "Question added successfully.",
        color: "green",
      });
    } catch (error) {
      console.error("Error adding question:", error);
      showNotification({
        title: "Error",
        message: "Failed to add the question. Please try again.",
        color: "red",
      });
    }
  };

  const handleCancel = () => {
    setQuestionText("");
    setSuggestion("");
    onAddQuestion(null);
  };

  return (
    <Box>
      <Box mb="md">
        <Flex align="center" gap={4} mb="xs">
          <Title order={5}>Enter Your Question</Title>
          <AISuggestionButton
            prompt={() => questionText}
            onSuggestion={(text) => setQuestionText(text)}
          />
        </Flex>
        <LexicalEditor
          value={questionText}
          onChange={(state) => setQuestionText(state)}
          placeholder="Type your question here..."
        />
      </Box>

      <Box mb="md">
        <Flex align="center" gap={4} mb="xs">
          <Title order={5}>Answer</Title>
          <AISuggestionButton
            prompt={() => `Provide a detailed interview answer for the following question: ${questionText}`}
            onSuggestion={(text) => setSuggestion(text)}
          />
        </Flex>
        <LexicalEditor
          value={suggestion}
          onChange={(state) => setSuggestion(state)}
          placeholder="Answer will appear here..."
        />
      </Box>

      <Group position="apart">
        <Button color="green" onClick={handleSave}>
          Save
        </Button>
        <Button color="red" onClick={handleCancel}>
          Cancel
        </Button>
      </Group>
    </Box>
  );
};

export default AddQuestion;
