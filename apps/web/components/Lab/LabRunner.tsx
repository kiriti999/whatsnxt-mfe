'use client';

import React, { useState } from 'react';
import {
  Container,
  Title,
  Text,
  Paper,
  Group,
  Button,
  Radio,
  Stack,
  Textarea,
  Code,
  Progress,
  Badge,
  ThemeIcon,
  Divider,
  Box,
} from '@mantine/core';
import { IconCheck, IconChevronLeft, IconChevronRight, IconCode, IconBrain } from '@tabler/icons-react';
import { Lab, Question } from '../../types/lab';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface LabRunnerProps {
  lab: Lab;
}

export const LabRunner: React.FC<LabRunnerProps> = ({ lab }) => {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, boolean | null>>({});

  const currentQuestion = lab.questions?.[currentQuestionIndex];
  const totalQuestions = lab.questions?.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  if (!currentQuestion) {
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" ta="center">
          <Title order={2} mb="md">No Questions Available</Title>
          <Text c="dimmed" mb="xl">
            This lab does not have any questions yet.
          </Text>
          <Button onClick={() => router.push('/labs')}>Back to Labs</Button>
        </Paper>
      </Container>
    );
  }


  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    // Reset check status when answer changes
    if (checkedAnswers[currentQuestion.id] !== undefined) {
      setCheckedAnswers((prev) => {
        const newState = { ...prev };
        delete newState[currentQuestion.id];
        return newState;
      });
    }
  };

  const handleCheckAnswer = () => {
    const userAnswer = answers[currentQuestion.id];
    if (!userAnswer) {
      notifications.show({
        title: 'No Answer Selected',
        message: 'Please select or enter an answer before checking.',
        color: 'yellow',
      });
      return;
    }

    const isCorrect = userAnswer === currentQuestion.correctAnswer;

    setCheckedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: isCorrect,
    }));

    if (isCorrect) {
      notifications.show({
        title: 'Correct!',
        message: 'Great job! Your answer is correct.',
        color: 'green',
      });
    } else {
      notifications.show({
        title: 'Incorrect',
        message: 'That is not quite right. Try again!',
        color: 'red',
      });
    }
  };

  const calculateScore = () => {
    let correctCount = 0;
    lab.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / totalQuestions) * 100);
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

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    // Here you would typically send the answers to the backend
    // For now, we'll just show a success message
    notifications.show({
      title: 'Lab Completed',
      message: `You have successfully completed the lab! Your score: ${score}%`,
      color: 'green',
    });

    // Optional: Redirect after delay
    setTimeout(() => {
      router.push('/labs');
    }, 5000);
  };

  const renderQuestionInput = (question: Question) => {
    const answer = answers[question.id] || '';

    switch (question.type) {
      case 'multiple-choice':
        return (
          <Radio.Group
            value={answer}
            onChange={handleAnswerChange}
            name={`question-${question.id}`}
          >
            <Stack mt="xs">
              {question.options?.map((option, index) => (
                <Radio key={index} value={option} label={option} />
              ))}
            </Stack>
          </Radio.Group>
        );
      case 'coding':
        return (
          <Stack>
            {question.codeSnippet && (
              <Paper withBorder p="md" bg="dark.8" c="white">
                <Code block color="dark.8">{question.codeSnippet}</Code>
              </Paper>
            )}
            <Textarea
              placeholder="Write your code here..."
              minRows={10}
              value={answer}
              onChange={(event) => handleAnswerChange(event.currentTarget.value)}
              styles={{ input: { fontFamily: 'monospace' } }}
            />
          </Stack>
        );
      case 'text':
      default:
        return (
          <Textarea
            placeholder="Type your answer here..."
            minRows={4}
            value={answer}
            onChange={(event) => handleAnswerChange(event.currentTarget.value)}
          />
        );
    }
  };

  if (isSubmitted) {
    const score = calculateScore();
    return (
      <Container size="sm" py="xl">
        <Paper withBorder p="xl" radius="md" ta="center">
          <ThemeIcon color={score >= 70 ? 'green' : 'orange'} size={60} radius="xl" mb="md">
            <IconCheck size={40} />
          </ThemeIcon>
          <Title order={2} mb="md">Lab Completed!</Title>
          <Text size="xl" fw={700} c={score >= 70 ? 'green' : 'orange'} mb="sm">
            Score: {score}%
          </Text>
          <Text c="dimmed" mb="xl">
            You have answered all {totalQuestions} questions.
          </Text>
          <Button onClick={() => router.push('/labs')}>Back to Labs</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="lg">
        <div>
          <Title order={2}>{lab.title}</Title>
          <Badge color="blue" variant="light" mt="xs">
            {lab.type}
          </Badge>
        </div>
        <Group>
          <Text fw={500} size="sm">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
        </Group>
      </Group>

      <Progress value={progress} mb="xl" size="sm" radius="xl" />

      <Paper withBorder p="xl" radius="md" mb="xl">
        <Group mb="md" justify="space-between">
          <Group>
            <ThemeIcon variant="light" size="lg">
              {currentQuestion.type === 'coding' ? <IconCode size={20} /> : <IconBrain size={20} />}
            </ThemeIcon>
            <Text size="lg" fw={600}>
              {currentQuestion.text}
            </Text>
          </Group>
          {checkedAnswers[currentQuestion.id] !== undefined && (
            <Badge color={checkedAnswers[currentQuestion.id] ? 'green' : 'red'}>
              {checkedAnswers[currentQuestion.id] ? 'Correct' : 'Incorrect'}
            </Badge>
          )}
        </Group>

        <Divider mb="lg" />

        <Box mb="xl">
          {renderQuestionInput(currentQuestion)}
        </Box>

        <Group justify="space-between" mt="xl">
          <Button
            variant="default"
            leftSection={<IconChevronLeft size={16} />}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Group>
            <Button
              variant="light"
              color="blue"
              onClick={handleCheckAnswer}
              disabled={!answers[currentQuestion.id] || checkedAnswers[currentQuestion.id] === true}
            >
              Check Answer
            </Button>
            {currentQuestionIndex === totalQuestions - 1 ? (
              <Button
                rightSection={<IconCheck size={16} />}
                onClick={handleSubmit}
                disabled={Object.keys(answers).length !== totalQuestions}
              >
                Submit Lab
              </Button>
            ) : (
              <Button
                rightSection={<IconChevronRight size={16} />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Group>
        </Group>
      </Paper>
    </Container>
  );
};
