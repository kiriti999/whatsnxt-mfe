"use client";

import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  Progress,
  Radio,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBrain,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconLock,
  IconTopologyStarRing3,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { jumbleGraph, validateGraph } from "@/utils/lab-utils";
import DiagramEditor from "../architecture-lab/DiagramEditor";
import HintsDisclosure from "./HintsDisclosure";

interface Question {
  id: string;
  questionText: string;
  type: "MCQ" | "True/False" | "Fill in the blank";
  options: { text: string }[];
  correctAnswer: string;
  isPreview?: boolean;
}

interface DiagramTest {
  id: string;
  prompt: string;
  architectureTypes?: string[]; // Derived from lab categories
  expectedDiagramState: any;
  hints?: string[]; // Optional array of hints for progressive disclosure
  isPreview?: boolean;
}

interface StudentTestRunnerProps {
  labId: string;
  pageId: string;
  questions: Question[];
  diagramTest?: DiagramTest;
  isPreviewMode?: boolean;
  onSubmit: (submission: {
    questionAnswers?: Record<string, string>;
    diagramAnswer?: any;
    score: number;
    passed: boolean;
  }) => Promise<void>;
}

export const StudentTestRunner: React.FC<StudentTestRunnerProps> = ({
  labId,
  pageId,
  questions: allQuestions,
  diagramTest: rawDiagramTest,
  isPreviewMode = false,
  onSubmit,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>("questions");

  // In preview mode, only show preview-marked content
  const questions = isPreviewMode
    ? allQuestions.filter((q) => q.isPreview)
    : allQuestions;
  const diagramTest = isPreviewMode
    ? rawDiagramTest?.isPreview
      ? rawDiagramTest
      : undefined
    : rawDiagramTest;

  // Question test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, string>
  >({});

  // Diagram test state
  const [jumbledDiagram, setJumbledDiagram] = useState<any>(null);
  const [studentDiagram, setStudentDiagram] = useState<any>(null);
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);

  // Overall state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalPassed, setFinalPassed] = useState(false);

  // Phase 3: Track preview engagement on first mount only
  const previewTracked = React.useRef(false);
  useEffect(() => {
    if (!isPreviewMode || previewTracked.current) return;
    previewTracked.current = true;
    const gtagFn =
      typeof window !== "undefined"
        ? ((window as Record<string, unknown>).gtag as
          | ((...args: unknown[]) => void)
          | undefined)
        : undefined;
    if (gtagFn) {
      gtagFn("event", "preview_test_started", {
        lab_id: labId,
        page_id: pageId,
        preview_questions: questions.length,
        has_preview_diagram: !!diagramTest,
      });
    }
    const key = `preview_engagement_${labId}`;
    const existing = parseInt(localStorage.getItem(key) ?? "0", 10);
    localStorage.setItem(key, String(existing + 1));
  }, [diagramTest, isPreviewMode, labId, pageId, questions.length]);

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const hasQuestions = totalQuestions > 0;
  const hasDiagramTest = !!diagramTest;

  // Initialize jumbled diagram
  useEffect(() => {
    if (diagramTest?.expectedDiagramState) {
      const jumbled = jumbleGraph(diagramTest.expectedDiagramState);
      setJumbledDiagram(jumbled);
      setStudentDiagram(jumbled);
    }
  }, [diagramTest]);

  // Set initial tab
  useEffect(() => {
    if (hasQuestions) {
      setActiveTab("questions");
    } else if (hasDiagramTest) {
      setActiveTab("diagram");
    }
  }, [hasQuestions, hasDiagramTest]);

  const handleAnswerChange = (value: string) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const calculateQuestionScore = () => {
    if (totalQuestions === 0) return 100;

    let correctCount = 0;
    questions.forEach((q) => {
      if (questionAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / totalQuestions) * 100);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      let questionScore = 100;
      let diagramScore = 100;
      let diagramValidation: any = null;

      // Calculate question score
      if (hasQuestions) {
        // Check if all questions are answered
        const unansweredCount = questions.filter(
          (q) => !questionAnswers[q.id],
        ).length;
        if (unansweredCount > 0) {
          notifications.show({
            title: "Incomplete Test",
            message: `Please answer all ${unansweredCount} remaining question(s)`,
            color: "orange",
          });
          setSubmitting(false);
          return;
        }
        questionScore = calculateQuestionScore();
      }

      // Validate diagram if present
      if (hasDiagramTest && diagramTest?.expectedDiagramState) {
        diagramValidation = validateGraph(
          diagramTest.expectedDiagramState,
          studentDiagram,
        );
        diagramScore = diagramValidation.score;
      }

      // Calculate overall score (average if both tests exist)
      let overallScore: number;
      if (hasQuestions && hasDiagramTest) {
        overallScore = Math.round((questionScore + diagramScore) / 2);
      } else if (hasQuestions) {
        overallScore = questionScore;
      } else {
        overallScore = diagramScore;
      }

      const passed = overallScore === 100;

      setFinalScore(overallScore);
      setFinalPassed(passed);
      setIsSubmitted(true);

      // Submit to backend
      await onSubmit({
        questionAnswers: hasQuestions ? questionAnswers : undefined,
        diagramAnswer: hasDiagramTest ? studentDiagram : undefined,
        score: overallScore,
        passed,
      });

      notifications.show({
        title: passed ? "Test Passed!" : "Test Completed",
        message: `Your score: ${overallScore}%${diagramValidation ? ` (${diagramValidation.details})` : ""}`,
        color: passed ? "green" : "orange",
      });
    } catch (error: any) {
      console.error("Failed to submit test:", error);
      notifications.show({
        title: "Submission Failed",
        message:
          error?.message || "Failed to submit your test. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" ta="center">
          <ThemeIcon
            color={finalPassed ? "green" : "orange"}
            size={60}
            radius="xl"
            mb="md"
          >
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={2} mb="md">
            {finalPassed ? "Congratulations!" : "Test Completed"}
          </Title>
          <Text size="xl" fw={700} c={finalPassed ? "green" : "orange"} mb="sm">
            Score: {finalScore}%
          </Text>
          <Text c="dimmed" mb="xl">
            {isPreviewMode
              ? "This was a free preview. Purchase the lab to access all tests and track your progress!"
              : finalPassed
                ? "You have successfully passed this test!"
                : "You need 100% to pass. Review the material and try again."}
          </Text>
          <Group justify="center">
            <Button onClick={() => router.push(`/labs/${labId}`)}>
              {isPreviewMode ? "Back to Lab" : "Back to Lab"}
            </Button>
            {isPreviewMode && (
              <Button
                variant="filled"
                color="orange"
                onClick={() => router.push(`/labs/${labId}?tab=details`)}
              >
                Get Full Access
              </Button>
            )}
            {!finalPassed && !isPreviewMode && (
              <Button variant="light" onClick={() => window.location.reload()}>
                Retry Test
              </Button>
            )}
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="md">
      <Paper withBorder p="lg" radius="md">
        {/* Phase 2: Enhanced preview banner with content summary and Get Full Access CTA */}
        {isPreviewMode && (
          <Paper
            p="md"
            mb="md"
            radius="sm"
            withBorder
            style={{
              borderColor: "var(--mantine-color-orange-outline)",
              background: "var(--mantine-color-orange-light)",
            }}
          >
            <Group
              justify="space-between"
              align="flex-start"
              wrap="wrap"
              gap="sm"
            >
              <Group gap="sm" align="flex-start">
                <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                  <IconEye size={18} />
                </ThemeIcon>
                <Box>
                  <Text size="sm" fw={700} c="orange">
                    Free Preview Mode
                  </Text>
                  <Text size="xs" c="dimmed">
                    You&apos;re previewing a sample of this lab&apos;s tests for
                    free.
                  </Text>
                </Box>
              </Group>
              <Button
                size="xs"
                color="orange"
                variant="filled"
                leftSection={<IconLock size={12} />}
                onClick={() => router.push(`/labs/${labId}?tab=details`)}
              >
                Get Full Access
              </Button>
            </Group>
            <Group gap="xl" mt="sm" ml={46}>
              {questions.length > 0 && (
                <Group gap={4}>
                  <ThemeIcon
                    color="green"
                    variant="light"
                    size="xs"
                    radius="xl"
                  >
                    <IconBrain size={8} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    {questions.length} preview question
                    {questions.length !== 1 ? "s" : ""}
                  </Text>
                </Group>
              )}
              {diagramTest && (
                <Group gap={4}>
                  <ThemeIcon color="blue" variant="light" size="xs" radius="xl">
                    <IconTopologyStarRing3 size={8} />
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    Diagram test included
                  </Text>
                </Group>
              )}
            </Group>
          </Paper>
        )}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            {hasQuestions && (
              <Tabs.Tab value="questions" leftSection={<IconBrain size={16} />}>
                Questions ({totalQuestions})
              </Tabs.Tab>
            )}
            {hasDiagramTest && (
              <Tabs.Tab
                value="diagram"
                leftSection={<IconTopologyStarRing3 size={16} />}
              >
                Diagram Test
              </Tabs.Tab>
            )}
          </Tabs.List>

          {hasQuestions && (
            <Tabs.Panel value="questions">
              {currentQuestion && (
                <>
                  <Progress
                    value={((currentQuestionIndex + 1) / totalQuestions) * 100}
                    mb="lg"
                    size="sm"
                    radius="xl"
                  />

                  <Group justify="space-between" mb="md">
                    <Text fw={500}>
                      Question {currentQuestionIndex + 1} of {totalQuestions}
                    </Text>
                    <Badge color="blue">{currentQuestion.type}</Badge>
                  </Group>

                  <Text size="lg" fw={600} mb="md">
                    {currentQuestion.questionText}
                  </Text>

                  <Divider mb="lg" />

                  <Box mb="xl">
                    <Radio.Group
                      value={questionAnswers[currentQuestion.id] || ""}
                      onChange={handleAnswerChange}
                    >
                      <Stack>
                        {currentQuestion.options?.map((option, index) => (
                          <Radio
                            key={index}
                            value={option.text}
                            label={option.text}
                          />
                        ))}
                      </Stack>
                    </Radio.Group>
                  </Box>

                  <Group justify="space-between">
                    <Button
                      variant="default"
                      leftSection={<IconChevronLeft size={16} />}
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                    >
                      Previous
                    </Button>

                    {currentQuestionIndex === totalQuestions - 1 ? (
                      hasDiagramTest ? (
                        <Button onClick={() => setActiveTab("diagram")}>
                          Continue to Diagram Test
                        </Button>
                      ) : (
                        <Button
                          rightSection={<IconCheck size={16} />}
                          onClick={handleSubmit}
                          loading={submitting}
                        >
                          Submit Test
                        </Button>
                      )
                    ) : (
                      <Button
                        rightSection={<IconChevronRight size={16} />}
                        onClick={handleNext}
                      >
                        Next
                      </Button>
                    )}
                  </Group>
                </>
              )}
            </Tabs.Panel>
          )}

          {hasDiagramTest && (
            <Tabs.Panel value="diagram">
              <Stack>
                <Text size="lg" fw={600} mb="md">
                  {diagramTest?.prompt ||
                    "Reconstruct the architecture diagram"}
                </Text>

                <Text size="sm" c="dimmed" mb="md">
                  Drag the shapes to their correct positions and create
                  connections between them. All connections from the original
                  diagram have been removed.
                </Text>

                {/* Hints Section - Only show if hints exist */}
                {diagramTest?.hints && diagramTest.hints.length > 0 && (
                  <HintsDisclosure
                    hints={diagramTest.hints}
                    onHintRevealed={(count) => {
                      setRevealedHintsCount(count);
                      console.log(`Student revealed ${count} hints`);
                    }}
                  />
                )}

                <Box
                  style={{
                    height: "600px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                >
                  {jumbledDiagram && (
                    <DiagramEditor
                      architectureTypes={
                        diagramTest?.architectureTypes || ["Generic"]
                      }
                      initialGraph={jumbledDiagram}
                      onGraphChange={setStudentDiagram}
                      mode="student"
                    />
                  )}
                </Box>

                <Group justify="space-between" mt="lg">
                  {hasQuestions && (
                    <Button
                      variant="default"
                      onClick={() => setActiveTab("questions")}
                    >
                      Back to Questions
                    </Button>
                  )}
                  <Button
                    rightSection={<IconCheck size={16} />}
                    onClick={handleSubmit}
                    loading={submitting}
                    ml="auto"
                  >
                    Submit Test
                  </Button>
                </Group>
              </Stack>
            </Tabs.Panel>
          )}
        </Tabs>
      </Paper>
    </Container>
  );
};
