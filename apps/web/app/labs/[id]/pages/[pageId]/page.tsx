'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
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
  Pagination,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconSearch, IconX } from '@tabler/icons-react';
import labApi from '@/apis/lab.api';
import DiagramEditor from '@/components/architecture-lab/DiagramEditor';

interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'True/False' | 'Fill in the blank';
  options: string;
  correctAnswer: string;
  isEditing?: boolean;
  isSaved?: boolean;
}

const QUESTION_TYPES = [
  { value: 'MCQ', label: 'Multiple Choice' },
  { value: 'True/False', label: 'True/False' },
  { value: 'Fill in the blank', label: 'Fill in the blank' },
];

const LabPageEditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const labId = params.id as string;
  const pageId = params.pageId as string;
  const returnPage = searchParams.get('returnPage') || '1';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [enablePracticeTest, setEnablePracticeTest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [labStatus, setLabStatus] = useState<'draft' | 'published'>('draft');

  const QUESTIONS_PER_PAGE = 3;

  // Diagram test state
  const [architectureType, setArchitectureType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [expectedDiagramState, setExpectedDiagramState] = useState<any>(null);

  const isPublished = labStatus === 'published';


  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    setLoading(true);
    try {
      // Fetch lab status
      const labResponse = await labApi.getLabById(labId);
      setLabStatus(labResponse.data.status || 'draft');

      const response = await labApi.getLabPageById(labId, pageId);
      const pageData = response.data;

      // If page has questions, populate the form
      if (pageData.questions && pageData.questions.length > 0) {
        const loadedQuestions = pageData.questions.map((q: any) => {
          // Backend stores as 'MCQ', 'True/False', 'Fill in the blank' (same as frontend)
          return {
            id: q.id || Date.now().toString(),
            questionText: q.questionText || '',
            type: q.type as 'MCQ' | 'True/False' | 'Fill in the blank',
            options: q.options ? q.options.map((opt: any) => opt.text).join(', ') : '',
            correctAnswer: q.correctAnswer || '',
            isEditing: false,
            isSaved: true,
          };
        });

        setQuestions(loadedQuestions);
      }

      // If page has a diagram test, populate the form
      if (pageData.diagramTest) {
        const dt = pageData.diagramTest;
        setPrompt(dt.prompt || '');
        setArchitectureType(dt.architectureType || '');

        // Transform backend format (shapes/connections) to DiagramEditor format (nodes/links)
        if (dt.expectedDiagramState) {
          console.log('Loading diagram state from backend:', dt.expectedDiagramState);
          const transformedState = {
            nodes: (dt.expectedDiagramState.shapes || []).map((shape: any) => {
              console.log('Transforming shape:', shape);
              return {
                id: shape.shapeId,
                shapeId: shape.shapeId,
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                rotation: shape.rotation || 0,
                label: shape.label || '',
                // Restore ALL rendering properties from metadata
                type: shape.metadata?.type,
                fill: shape.metadata?.fill,
                stroke: shape.metadata?.stroke,
                strokeWidth: shape.metadata?.strokeWidth,
                strokeDashArray: shape.metadata?.strokeDashArray,
                pathData: shape.metadata?.pathData,
                rx: shape.metadata?.rx,
                metadata: shape.metadata || {},
              };
            }),
            links: (dt.expectedDiagramState.connections || []).map((conn: any) => ({
              id: conn.id,
              source: conn.sourceShapeId,
              target: conn.targetShapeId,
              type: conn.type || 'arrow',
              label: conn.label || '',
              waypoints: conn.metadata?.waypoints || [],
            })),
          };
          console.log('Transformed state for DiagramEditor:', transformedState);
          setExpectedDiagramState(transformedState);
        } else {
          setExpectedDiagramState(null);
        }
      }
    } catch (error: any) {
      console.error('Failed to load page data:', error);
      // Show error notification
      notifications.show({
        title: 'Error Loading Page',
        message: error?.response?.data?.message || error?.message || 'Failed to load page data. Please ensure the lab and page exist.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    // Check if we've reached the limit
    if (questions.length >= 30) {
      notifications.show({
        title: 'Limit Reached',
        message: 'Maximum 30 questions allowed per page',
        color: 'orange',
      });
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: '',
      type: 'MCQ',
      options: '',
      correctAnswer: '',
      isEditing: true,
      isSaved: false,
    };
    setQuestions([...questions, newQuestion]);
    // Navigate to last page if adding would overflow current page
    const newTotalPages = Math.ceil((questions.length + 1) / QUESTIONS_PER_PAGE);
    setCurrentPage(newTotalPages);
  };

  const removeQuestion = async (id: string, isSaved: boolean) => {
    if (confirm('Are you sure you want to delete this question?')) {
      if (isSaved) {
        // If question is saved on backend, delete it from backend
        try {
          await labApi.deleteQuestion(labId, pageId, id);
          notifications.show({
            title: 'Success',
            message: 'Question deleted successfully!',
            color: 'green',
          });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete question.';
          notifications.show({
            title: 'Error',
            message: errorMessage,
            color: 'red',
          });
          console.error('Failed to delete question:', error);
          return;
        }
      }

      // Remove from local state
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const updateQuestion = (id: string, field: keyof Question, value: string | boolean) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const toggleEditQuestion = (id: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, isEditing: !q.isEditing } : q))
    );
  };

  const saveIndividualQuestion = async (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Validation
    if (!question.questionText.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Question text is required',
        color: 'red',
      });
      return;
    }

    if (question.questionText.trim().length < 5) {
      notifications.show({
        title: 'Validation Error',
        message: 'Question text must be at least 10 characters',
        color: 'red',
      });
      return;
    }

    if (question.questionText.trim().length > 1000) {
      notifications.show({
        title: 'Validation Error',
        message: 'Question text cannot exceed 1000 characters',
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

    if (question.type === 'MCQ') {
      const optionsArray = question.options.split(',').map((opt) => opt.trim()).filter((opt) => opt);
      if (optionsArray.length < 2) {
        notifications.show({
          title: 'Validation Error',
          message: 'MCQ questions must have at least 2 options',
          color: 'red',
        });
        return;
      }
    }

    if (!question.correctAnswer.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Correct answer is required',
        color: 'red',
      });
      return;
    }

    setSavingQuestionId(questionId);
    try {
      // Parse options from comma-separated string
      let optionsArray: any[] = [];

      if (question.type === 'MCQ') {
        optionsArray = question.options.split(',').map((opt) => ({ text: opt.trim() })).filter((opt) => opt.text);
      } else if (question.type === 'True/False') {
        optionsArray = [{ text: 'True' }, { text: 'False' }];
      }

      // Backend expects 'MCQ', 'True/False', or 'Fill in the blank' (same as frontend)
      const response = await labApi.saveQuestion(labId, pageId, {
        type: question.type, // Send type as-is, no conversion needed
        questionText: question.questionText.trim(),
        options: optionsArray,
        correctAnswer: question.correctAnswer.trim(),
        questionId: question.isSaved ? question.id : undefined, // Include questionId if updating
      });

      // Update question state with the returned ID and mark as saved
      setQuestions(
        questions.map((q) =>
          q.id === questionId
            ? { ...q, id: response.data.id, isEditing: false, isSaved: true }
            : q
        )
      );

      notifications.show({
        title: 'Success',
        message: 'Question saved successfully!',
        color: 'green',
      });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save question.';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
      console.error('Failed to save question:', error);
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleBackToTestsAndQuestions = () => {
    router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
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

    // Validate diagram is not empty (T089) - REMOVED
    // Allow saving empty diagrams for future editing

    setSaving(true);
    try {
      console.log('Saving diagram state:', expectedDiagramState);

      // Transform DiagramEditor format (nodes/links) to backend format (shapes/connections)
      // Handle empty diagram case
      const transformedDiagramState = {
        shapes: expectedDiagramState?.nodes?.map((node: any) => {
          console.log('Saving node:', node);
          return {
            shapeId: node.shapeId || node.id,
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            rotation: node.rotation || 0,
            label: node.label || '',
            metadata: {
              // Store ALL node properties needed for rendering
              type: node.type,
              fill: node.fill,
              stroke: node.stroke,
              strokeWidth: node.strokeWidth,
              strokeDashArray: node.strokeDashArray,
              pathData: node.pathData,
              rx: node.rx,
              ...node.metadata,
            },
          };
        }) || [],
        connections: expectedDiagramState?.links?.map((link: any) => ({
          id: link.id || `${link.source}-${link.target}`,
          sourceShapeId: link.source,
          targetShapeId: link.target,
          type: link.type || 'arrow',
          label: link.label || '',
          metadata: { waypoints: link.waypoints || [] },
        })) || [],
        metadata: {},
      };

      console.log('Transformed diagram state for backend:', transformedDiagramState);

      await labApi.saveDiagramTest(labId, pageId, {
        prompt: prompt.trim(),
        expectedDiagramState: transformedDiagramState,
        architectureType: architectureType,
      });

      notifications.show({
        title: 'Success',
        message: 'Diagram test saved successfully!',
        color: 'green',
      });

      // Navigate back to lab detail page with tab and page params
      router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save diagram test.';
      const details = error?.response?.data?.errors || error?.response?.data?.details;

      notifications.show({
        title: 'Error',
        message: details ? `${errorMessage}: ${JSON.stringify(details)}` : errorMessage,
        color: 'red',
        autoClose: 8000,
      });
      console.error('Failed to save diagram test:', error);
      console.error('Error details:', error?.response?.data);
    } finally {
      setSaving(false);
    }
  };


  const handleDeleteDiagramTest = async () => {
    if (!confirm('Are you sure you want to delete this diagram test? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await labApi.deleteDiagramTest(labId, pageId);

      notifications.show({
        title: 'Success',
        message: 'Diagram test deleted successfully!',
        color: 'green',
      });

      // Navigate back to lab detail page
      router.push(`/labs/${labId}?tab=tests&page=${returnPage}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete diagram test.';

      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  // Search and filter questions
  const filteredQuestions = questions.filter(question => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      question.questionText.toLowerCase().includes(query) ||
      question.type.toLowerCase().includes(query) ||
      question.correctAnswer.toLowerCase().includes(query) ||
      (question.options && question.options.toLowerCase().includes(query))
    );
  });

  // Pagination calculations (on filtered questions)
  const totalPages = Math.ceil(filteredQuestions.length / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <Button variant="subtle" onClick={handleBackToTestsAndQuestions}>
          ← Back to Lab
        </Button>
        <Group>
          <Button variant="outline" onClick={handleBackToTestsAndQuestions}>
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
              {/* Back to Tests & Questions Button */}
              <Group justify="flex-start">
                <Button
                  variant="subtle"
                  onClick={handleBackToTestsAndQuestions}
                  leftSection="←"
                >
                  Back to Tests & Questions
                </Button>
              </Group>

              {/* Questions Section Header with Add Button */}
              {!isPublished && (
                <Group justify="space-between" align="center">
                  <Box>
                    <Text size="lg" fw={600}>
                      Questions ({filteredQuestions.length}/{questions.length})
                    </Text>
                    <Text size="sm" c="dimmed">
                      {searchQuery ? `Showing ${filteredQuestions.length} of ${questions.length} questions` : 'Add up to 30 questions for this page'}
                    </Text>
                  </Box>
                  <Button
                    variant="outline"
                    onClick={addQuestion}
                    leftSection="+"
                    disabled={questions.length >= 30}
                  >
                    Add Question
                  </Button>
                </Group>
              )}

              {/* Search Bar */}
              {questions.length > 0 && (
                <TextInput
                  placeholder="Search questions by text, type, answer, or options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    searchQuery && (
                      <ActionIcon
                        variant="subtle"
                        onClick={() => setSearchQuery('')}
                        size="sm"
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    )
                  }
                  size="md"
                />
              )}

              {/* Questions List */}
              {questions.length === 0 ? (
                <Paper shadow="sm" p="xl" withBorder bg="gray.0">
                  <Stack align="center" gap="md">
                    <Text size="xl" c="dimmed">No questions yet</Text>
                    <Text c="dimmed" ta="center">
                      Click "Add Question" above to create your first question
                    </Text>
                  </Stack>
                </Paper>
              ) : filteredQuestions.length === 0 ? (
                <Paper shadow="sm" p="xl" withBorder bg="gray.0">
                  <Stack align="center" gap="md">
                    <IconSearch size={48} color="gray" />
                    <Text size="xl" c="dimmed">No questions found</Text>
                    <Text c="dimmed" ta="center">
                      No questions match your search "{searchQuery}"
                    </Text>
                    <Button variant="subtle" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <>
                  <Stack gap="xl">
                    {paginatedQuestions.map((question, index) => {
                      // Calculate the actual question number from the original list
                      const originalIndex = questions.findIndex(q => q.id === question.id);
                      const questionNumber = originalIndex + 1;
                      const isEditable = !isPublished && (question.isEditing || !question.isSaved);
                      return (
                        <Paper key={question.id} p="lg" withBorder>
                          <Group justify="space-between" mb="md">
                            <Group gap="xs">
                              <Text fw={600}>
                                Question {questionNumber}
                              </Text>
                              {question.isSaved && (
                                <Badge size="sm" color="green" variant="light">
                                  Saved
                                </Badge>
                              )}
                            </Group>
                            <Group gap="xs">
                              {!isPublished && question.isSaved && !question.isEditing && (
                                <Button
                                  size="xs"
                                  variant="subtle"
                                  onClick={() => toggleEditQuestion(question.id)}
                                >
                                  Edit
                                </Button>
                              )}
                              {!isPublished && (
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() => removeQuestion(question.id, question.isSaved || false)}
                                  title="Delete Question"
                                >
                                  <IconTrash size={18} />
                                </ActionIcon>
                              )}
                            </Group>
                          </Group>

                          <Stack gap="md">
                            <Textarea
                              label="Question Text"
                              placeholder="Enter question text (minimum 10 characters)"
                              value={question.questionText}
                              onChange={(e) =>
                                updateQuestion(question.id, 'questionText', e.target.value)
                              }
                              required
                              disabled={!isEditable}
                              minRows={2}
                              description="Must be unique within this lab - less than 85% similar to other questions (10-1000 characters)"
                            />

                            <Select
                              label="Question Type"
                              data={QUESTION_TYPES}
                              value={question.type}
                              onChange={(value) =>
                                updateQuestion(question.id, 'type', value || 'MCQ')
                              }
                              required
                              disabled={!isEditable}
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
                                  disabled={!isEditable}
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
                              disabled={!isEditable}
                            />

                            {isEditable && (
                              <Group justify="flex-end" mt="sm">
                                {question.isSaved && (
                                  <Button
                                    variant="subtle"
                                    size="sm"
                                    onClick={() => toggleEditQuestion(question.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => saveIndividualQuestion(question.id)}
                                  loading={savingQuestionId === question.id}
                                >
                                  Save Question
                                </Button>
                              </Group>
                            )}
                          </Stack>
                        </Paper>
                      );
                    })}

                    {totalPages > 1 && (
                      <Group justify="center">
                        <Pagination
                          total={totalPages}
                          value={currentPage}
                          onChange={setCurrentPage}
                          size="md"
                        />
                      </Group>
                    )}
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
              {/* Back to Tests & Questions Button */}
              <Group justify="flex-start">
                <Button
                  variant="subtle"
                  onClick={handleBackToTestsAndQuestions}
                  leftSection="←"
                >
                  Back to Tests & Questions
                </Button>
              </Group>

              <Select
                label="Architecture Type"
                placeholder="Select architecture type"
                data={['AWS', 'Azure', 'GCP', 'Hybrid', 'On-Premise']}
                value={architectureType}
                onChange={(value) => setArchitectureType(value || '')}
                required
                disabled={isPublished}
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
                disabled={isPublished}
              />

              <Box>
                <Text size="sm" fw={500} mb={8}>Diagram Editor</Text>
                <Text size="xs" c="dimmed" mb={8}>
                  Drag shapes onto the canvas to create your expected diagram
                </Text>

                <Group align="flex-start" gap="md">
                  {/* Canvas - DiagramEditor */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    {!architectureType ? (
                      <Paper
                        withBorder
                        p="xl"
                        style={{
                          minHeight: 400,
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text c="dimmed" ta="center" size="sm">
                          Select an architecture type to enable diagram editor
                        </Text>
                      </Paper>
                    ) : (
                      <DiagramEditor
                        initialGraph={expectedDiagramState}
                        mode={isPublished ? "student" : "instructor"}
                        architectureType={architectureType}
                        onGraphChange={(graph) => {
                          setExpectedDiagramState(graph);
                        }}
                        className="diagram-editor"
                      />
                    )}
                  </Box>
                </Group>
              </Box>

              <Group justify="space-between">
                {!isPublished && (
                  <Group>
                    <Button
                      variant="subtle"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={handleDeleteDiagramTest}
                      loading={saving}
                    >
                      Delete Test
                    </Button>
                  </Group>
                )}

                {!isPublished && (
                  <Group>
                    <Button variant="outline" onClick={() => router.push(`/labs/${labId}`)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveDiagramTest} loading={saving}>
                      Save Diagram Test
                    </Button>
                  </Group>
                )}

                {isPublished && (
                  <Button variant="outline" onClick={() => router.push(`/labs/${labId}`)}>
                    Back to Lab
                  </Button>
                )}
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </Container>
  );
};

export default LabPageEditorPage;
