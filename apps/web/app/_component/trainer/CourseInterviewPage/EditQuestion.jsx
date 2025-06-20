import { useState, useEffect } from "react";
import { Button, TextInput, Textarea, Group, Loader, Box } from "@mantine/core";
import { interviewAPI } from "../../../../apis/v1/courses/interview/interview";
import { showNotification } from "@mantine/notifications";

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
      <Textarea
        label="Edit Answer"
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        autosize
        minRows={3}
        mb="md"
      />
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
