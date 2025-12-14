'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Button,
  Group,
  Box,
  Paper,
  Text,
  TextInput,
  Select,
  Stack,
  Divider,
  Switch,
  ActionIcon,
  Tabs,
  Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash } from '@tabler/icons-react';
import labApi from '@/apis/lab.api';

interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options: string;
  correctAnswer: string;
}

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'True/False', label: 'True/False' },
  { value: 'Fill in the blank', label: 'Fill in the blank' },
];

const LabPageEditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const labId = params.id as string;
  const pageId = params.pageId as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [enablePracticeTest, setEnablePracticeTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Diagram test state
  const [architectureType, setArchitectureType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [expectedDiagramState, setExpectedDiagramState] = useState<any>(null);

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      const response = await labApi.getLabPageById(labId, pageId);
      const pageData = response.data;

      // If page has a question, populate the form
      if (pageData.question) {
        const q = pageData.question;
        setQuestions([{
          id: '1',
          questionText: q.questionText || '',
          type: q.type || 'MCQ',
          options: q.options ? q.options.map((opt: any) => opt.text).join(', ') : '',
          correctAnswer: q.correctAnswer || '',
        }]);
      }

      // If page has a diagram test, populate the form
      if (pageData.diagramTest) {
        const dt = pageData.diagramTest;
        setPrompt(dt.prompt || '');
        setArchitectureType(dt.architectureType || '');
        setExpectedDiagramState(dt.expectedDiagramState || null);
      }
    } catch (error: any) {
      console.error('Failed to load page data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      type: 'MCQ',
      options: '',
      correctAnswer: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSaveQuestions = async () => {
    if (questions.length === 0) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please add at least one question',
        color: 'red',
      });
      return;
    }

    // Validate the first question (we'll save only the first one for now)
    const question = questions[0];

    if (!question.questionText.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Question text is required',
        color: 'red',
      });
      return;
    }

    if (question.type === 'MCQ' && !question.options.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Options are required for Multiple Choice questions',
        color: 'red',
      });
      return;
    }

    if (!question.correctAnswer.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Correct answer is required',
        color: 'red',
      });
      return;
    }

    setSaving(true);
    try {
      // Parse options from comma-separated string
      const optionsArray = question.type === 'MCQ'
        ? question.options.split(',').map((opt) => ({ text: opt.trim() })).filter((opt) => opt.text)
        : [];

      await labApi.saveQuestion(labId, pageId, {
        type: question.type,
        questionText: question.questionText.trim(),
        options: optionsArray,
        correctAnswer: question.correctAnswer.trim(),
      });

      notifications.show({
        title: 'Success',
        message: 'Question saved successfully!',
        color: 'green',
      });

      // Navigate back to lab detail page
      router.push(`/labs/${labId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save question.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to save question:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiagramTest = async () => {
    // Validation
    if (!architectureType) {
      notifications.show({
        title: 'Validation Error',
        message: 'Architecture type is required',
        color: 'red',
      });
      return;
    }

    if (!prompt || prompt.trim().length < 10) {
      notifications.show({
        title: 'Validation Error',
        message: 'Prompt must be at least 10 characters',
        color: 'red',
      });
      return;
    }

    if (prompt.trim().length > 2000) {
      notifications.show({
        title: 'Validation Error',
        message: 'Prompt cannot exceed 2000 characters',
        color: 'red',
      });
      return;
    }

    // For now, use a placeholder diagram state until we build the interactive editor
    const diagramStateToSave = expectedDiagramState || {
      shapes: [],
      connections: [],
      metadata: {}
    };

    setSaving(true);
    try {
      await labApi.saveDiagramTest(labId, pageId, {
        prompt: prompt.trim(),
        expectedDiagramState: diagramStateToSave,
        architectureType: architectureType,
      });

      notifications.show({
        title: 'Success',
        message: 'Diagram test saved successfully!',
        color: 'green',
      });

      // Navigate back to lab detail page
      router.push(`/labs/${labId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save diagram test.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to save diagram test:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" onClick={() => router.push(`/labs/${labId}`)}>
          ← Back to Lab
        </Button>
        <Group>
          <Button variant="outline" onClick={() => router.push(`/labs/${labId}`)}>
            Cancel
          </Button>
          <Button onClick={handleSaveQuestions} loading={saving}>
            Save Questions
          </Button>
        </Group>
      </Group>

      <Paper shadow="sm" p="xl" withBorder>
        <Tabs defaultValue="question-test">
          <Tabs.List>
            <Tabs.Tab value="question-test">Question Test</Tabs.Tab>
            <Tabs.Tab value="diagram-test">Diagram Test</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="question-test" pt="md">
            <Stack gap="xl">
              {/* Add Question Button */}
              {questions.length === 0 && (
                <Button
                  variant="outline"
                  fullWidth
                  size="lg"
                  onClick={addQuestion}
                  leftSection="+"
                >
                  Add Question
                </Button>
              )}

          {/* Questions Section */}
          {questions.length > 0 && (
            <>
              <Divider label="Questions" labelPosition="center" />

              <Stack gap="xl">
                {questions.map((question, index) => (
                  <Paper key={question.id} p="lg" withBorder>
                    <Group justify="space-between" mb="md">
                      <Text fw={600}>
                        Question {index + 1} <span style={{ color: 'red' }}>*</span>
                      </Text>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>

                    <Stack gap="md">
                      <TextInput
                        placeholder="Enter question text"
                        value={question.questionText}
                        onChange={(e) =>
                          updateQuestion(question.id, 'questionText', e.target.value)
                        }
                        required
                      />

                      <Select
                        label="Question Type"
                        data={QUESTION_TYPES}
                        value={question.type}
                        onChange={(value) =>
                          updateQuestion(question.id, 'type', value || 'MCQ')
                        }
                        required
                      />

                      {question.type === 'MCQ' && (
                        <Box>
                          <Text size="sm" fw={500} mb={4}>
                            Options (comma separated)
                          </Text>
                          <Text size="xs" c="dimmed" mb={8}>
                            Enter options separated by commas
                          </Text>
                          <TextInput
                            placeholder="Option 1, Option 2, Option 3"
                            value={question.options}
                            onChange={(e) =>
                              updateQuestion(question.id, 'options', e.target.value)
                            }
                            required
                          />
                        </Box>
                      )}

                      <TextInput
                        label="Correct Answer / Solution"
                        placeholder="Enter correct answer"
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(question.id, 'correctAnswer', e.target.value)
                        }
                        required
                      />
                    </Stack>
                  </Paper>
                ))}

                <Button
                  variant="outline"
                  fullWidth
                  onClick={addQuestion}
                  leftSection="+"
                >
                  Add Question
                </Button>
              </Stack>
            </>
          )}

              {/* Practice Test Configuration */}
              <Divider label="Practice Test Configuration" labelPosition="center" />

              <Group>
                <Switch
                  checked={enablePracticeTest}
                  onChange={(event) => setEnablePracticeTest(event.currentTarget.checked)}
                  label="Enable Practice Test"
                />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="diagram-test" pt="md">
            <Stack gap="md">
              <Select
                label="Architecture Type"
                placeholder="Select architecture type"
                data={['AWS', 'Azure', 'GCP', 'Hybrid', 'On-Premise']}
                value={architectureType}
                onChange={(value) => setArchitectureType(value || '')}
                required
              />

              <Textarea
                label="Prompt"
                description="Instructions for students (10-2000 characters)"
                placeholder="Describe what diagram students should create..."
                minLength={10}
                maxLength={2000}
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />

              <Box>
                <Text size="sm" fw={500} mb={8}>Diagram Editor</Text>
                <Paper withBorder p="xl" style={{ minHeight: 400, backgroundColor: '#f8f9fa' }}>
                  <Text c="dimmed" ta="center">
                    Interactive diagram editor will be implemented here.
                    Students will drag and drop shapes to create architecture diagrams.
                  </Text>
                </Paper>
              </Box>

              <Group justify="flex-end">
                <Button variant="outline" onClick={() => router.push(`/labs/${labId}`)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDiagramTest} loading={saving}>
                  Save Diagram Test
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default LabPageEditorPage;
