import { useState } from "react";
import { Button, TextInput, Textarea, Title, Group, Loader, Box, Text, Stack, Flex, Anchor, Modal, Alert, Select } from "@mantine/core";
import { interviewAPI } from "../../../../apis/v1/courses/interview/interview";
import { showNotification } from "@mantine/notifications";
import styles from './AddQuestionStyle.module.css'
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";

const AddQuestion = ({ onAddQuestion, courseId }) => {
  const [questionText, setQuestionText] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [apiKeyModalOpened, { open: openApiKeyModal, close: closeApiKeyModal }] = useDisclosure(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const [selectedAI, setSelectedAI] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const fetchSuggestion = async () => {
    if (!questionText.trim()) {
      notifications.show({
        position: 'bottom-right',
        color: 'orange',
        title: 'Empty Question',
        message: 'Please enter a question first',
      });
      return;
    }

    setIsFetching(true);
    try {
      const response = await interviewAPI.getSuggestionByAI({
        question: questionText,
        aiModel: selectedAI,
        modelVersion: selectedModel
      });
      
      if (response.status === 200 && response.data?.suggestion) {
        setSuggestion(response.data.suggestion);
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'Success',
          message: `AI suggestions loaded successfully using ${response.data.model || selectedAI}`,
        });
      } else {
        // Non-200 response, show modal
        const errorMsg = response.data?.message || response.data?.error || 'API request failed. Please provide your API key.';
        setApiKeyError(errorMsg);
        openApiKeyModal();
      }
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      
      // Extract error message from various possible locations
      let errorMessage = 'Failed to fetch AI suggestions. Please provide your API key.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Only override with generic messages if no specific backend message was provided
      if (!error?.response?.data?.message && !error?.response?.data?.error) {
        if (error?.response?.status === 429) {
          errorMessage = 'API rate limit exceeded. Please provide your own API key to continue.';
        } else if (error?.response?.status === 401) {
          errorMessage = error?.message || 'Authentication failed. Please provide a valid API key.';
        } else if (error?.response?.status === 500 && !error?.message) {
          errorMessage = 'Server error. The API account may be inactive or have billing issues. Please provide your own API key.';
        }
      }
      
      setApiKeyError(errorMessage);
      openApiKeyModal();
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
    if (!apiKey.trim()) {
      setApiKeyError('Please enter a valid API key');
      return;
    }

    try {
      const response = await interviewAPI.saveApiKey({ 
        apiKey, 
        aiModel: selectedAI,
        modelVersion: selectedModel 
      });
      if (response.status === 200 || response.status === 201) {
        notifications.show({
          position: 'bottom-right',
          color: 'green',
          title: 'API Key Saved',
          message: response.data?.message || 'Your API key has been saved successfully',
        });
        setApiKey('');
        setApiKeyError('');
        closeApiKeyModal();
        
        // Retry fetching suggestion
        fetchSuggestion();
      } else {
        const errorMsg = response.data?.message || response.data?.error || 'Failed to save API key';
        setApiKeyError(errorMsg);
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      
      let errorMessage = 'Failed to save API key. Please try again.';
      
      // Prioritize backend error messages
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
        // Only add helpful context for route not found, don't replace the message
        if (error.message.includes('Route') && error.message.includes('not found')) {
          errorMessage = `${error.message}. Please contact support.`;
        }
      }
      
      // Only use generic messages if no backend message is available
      if (!error?.response?.data?.message && !error?.response?.data?.error && !error?.message) {
        if (error?.response?.status === 404) {
          errorMessage = 'API endpoint not found. This feature may not be available yet.';
        } else if (error?.response?.status === 401) {
          errorMessage = 'Invalid API key. Please check and try again.';
        }
      }
      
      setApiKeyError(errorMessage);
    }
  };

  const handleCancel = () => {
    setQuestionText("");
    setSuggestion("");
    onAddQuestion(null);
  };

  return (
    <Box>
      {/* API Key Modal */}
      <Modal
        opened={apiKeyModalOpened}
        onClose={closeApiKeyModal}
        title="Configure AI Assistant"
        centered
        size="lg"
      >
        <Stack gap="md">
          {apiKeyError && (
            <Alert color="red" variant="light">
              {apiKeyError}
            </Alert>
          )}
          
          <Text size="sm" fw={500}>
            Add your own AI API key securely to overcome rate limits and get better performance.
          </Text>

          <Select
            label="Select AI Provider"
            placeholder="Choose AI provider"
            value={selectedAI}
            onChange={(value) => {
              setSelectedAI(value || 'openai');
              // Set default model for each provider
              if (value === 'openai') setSelectedModel('gpt-4o');
              else if (value === 'anthropic') setSelectedModel('claude-3-5-sonnet-20241022');
              else if (value === 'gemini') setSelectedModel('gemini-1.5-flash');
            }}
            data={[
              { value: 'openai', label: 'OpenAI (ChatGPT)' },
              { value: 'anthropic', label: 'Anthropic (Claude)' },
              { value: 'gemini', label: 'Google (Gemini)' },
            ]}
          />

          <Select
            label="Select Model Version"
            placeholder="Choose model"
            value={selectedModel}
            onChange={(value) => setSelectedModel(value || 'gpt-4o')}
            data={
              selectedAI === 'openai' ? [
                { value: 'gpt-4o', label: 'GPT-4o (Latest)' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster)' },
                { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
                { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Cheapest)' },
              ] : selectedAI === 'anthropic' ? [
                { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)' },
                { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
                { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' },
              ] : [
                { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
                { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Advanced)' },
                { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash (Experimental)' },
              ]
            }
          />

          {selectedAI === 'openai' && (
            <Text size="xs" c="dimmed">
              Get your key: <Anchor href="https://platform.openai.com/api-keys" target="_blank">OpenAI API Keys</Anchor>
            </Text>
          )}
          {selectedAI === 'anthropic' && (
            <Text size="xs" c="dimmed">
              Get your key: <Anchor href="https://console.anthropic.com/settings/keys" target="_blank">Anthropic API Keys</Anchor>
            </Text>
          )}
          {selectedAI === 'gemini' && (
            <Text size="xs" c="dimmed">
              Get your key: <Anchor href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</Anchor>
            </Text>
          )}

          <TextInput
            label="Your API Key"
            placeholder={`Paste your ${selectedAI === 'openai' ? 'sk-...' : selectedAI === 'anthropic' ? 'sk-ant-...' : 'AI...'} key here`}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setApiKeyError('');
            }}
            error={apiKeyError}
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={closeApiKeyModal}>
              Cancel
            </Button>
            <Button onClick={saveApiKey} disabled={!apiKey.trim()}>
              Save Configuration
            </Button>
          </Group>
        </Stack>
      </Modal>

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
    </Box>
  );
};

export default AddQuestion;
