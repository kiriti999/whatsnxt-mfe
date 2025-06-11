import { useState } from "react";
import { Button, TextInput, Textarea, Title, Group, Loader, Box, Text, Stack, Flex, Anchor } from "@mantine/core";
import { interviewAPI } from "../../../../api/v1/courses/interview/interview";
import { showNotification } from "@mantine/notifications";
import styles from './AddQuestionStyle.module.css'
import { notifications } from "@mantine/notifications";

const AddQuestion = ({ onAddQuestion, courseId }) => {
  const [questionText, setQuestionText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const fetchSuggestion = async () => {
    setIsFetching(true);
    try {
      const response = await interviewAPI.getSuggestionByChatGpt({ question: questionText });
      setSuggestion(response.data?.suggestion || "No suggestion available.");
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion("Failed to fetch suggestion.");
    } finally {
      setIsFetching(false);
    }
  };

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

  const saveApiKey = async () => {
    try {
      console.log(' saveApiKey :: apiKey', apiKey)
      const response = await interviewAPI.saveApiKey(apiKey);
      if (response.status === 200) {
        setApiKey('')
        notifications.show({
          position: 'bottom-left',
          color: 'green',
          title: 'Key saved succesfully',
          message: 'Key saved',
        });
      }
    } catch (error) {
      console.log(' saveApiKey :: error:', error)
    }
  }

  const handleCancel = () => {
    setQuestionText("");
    setSuggestion("");
    onAddQuestion(null);
  };

  return (
    <Box>
      <TextInput
        label={<Title order={5}>Enter Your Question</Title>}
        placeholder="Type your question here..."
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        mb="md"
      />

      <Button color="blue" onClick={fetchSuggestion} mb="md">
        {isFetching ? <Loader color="rgba(255, 255, 255, 1)" size="sm" /> : "Get AI Suggestions"}
      </Button>

      <Textarea
        label={<Title order={5}>Answer</Title>}
        placeholder="Suggestions will appear here..."
        value={suggestion}
        onChange={(e) => setSuggestion(e.target.value)}
        autosize
        minRows={3}
        mb="md"
      />

      <Group position="apart">
        <Button color="green" onClick={handleSave}>
          Save
        </Button>
        <Button color="red" onClick={handleCancel}>
          Cancel
        </Button>
      </Group>

      <Stack className={styles.chatgptKeyContainer} gap={0}>
        <Text className={styles.chatgptText}>Add your own ChatGPT key securely to overcome API limits.</Text>
        <Text className={styles.chatgptText}>Go to <Anchor href="https://openai.com/" target='_blank'>Open API</Anchor> and create an account.</Text>
        <Text className={styles.chatgptText}>Navigate to <Anchor href='https://platform.openai.com/signup/' target='_blank'>API Keys</Anchor> and generate a key.</Text>
        <Text className={styles.chatgptText}>Save the key securely.</Text>

        <Title className={styles.chatgptTitle} order={6}>
          Your API key:
        </Title>

        <Flex className={styles.chatgptFlex}>
          <TextInput placeholder="Paste your key here" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Button onClick={saveApiKey} disabled={apiKey === ''}>Save</Button>
        </Flex>
      </Stack>
    </Box>
  );
};

export default AddQuestion;
