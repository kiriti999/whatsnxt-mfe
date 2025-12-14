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
      </Paper>
    </Container>
  );
};

export default LabPageEditorPage;
