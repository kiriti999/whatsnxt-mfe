'use client'
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Flex,
  TextInput,
  Button,
  Pagination,
  Text,
  Stack,
  ThemeIcon,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSearch, IconMessageQuestion, IconSparkles } from "@tabler/icons-react";
import { interviewAPI } from "../../apis/v1/courses/interview/interview";
import Question from './question';

const InterviewClient = ({ course, pageLimit = 5 }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const fetchQuestions = async (page = 1, query = "") => {
    try {
      setIsSearching(true);
      const response = await interviewAPI.getQuestionsByCourse(course._id, page, pageLimit, query);
      setQuestions(response.data.questions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (course._id) {
      fetchQuestions(currentPage, searchQuery);
    }
  }, [course._id, currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions(1, searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Stack gap="xl">
      {/* Enhanced Search Section */}
      <Card
        radius="lg"
        p="lg"
        withBorder
        style={{
          background: isDark
            ? 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-7) 100%)'
            : 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-white) 100%)',
          borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-blue-1)',
        }}
      >
        <Flex gap="md" align="center">
          <TextInput
            placeholder="Search interview questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            leftSection={<IconSearch size={18} style={{ opacity: 0.6 }} />}
            radius="xl"
            size="md"
            flex={1}
            styles={{
              input: {
                background: isDark ? 'var(--mantine-color-dark-7)' : 'white',
                border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-3)'}`,
                '&:focus': {
                  borderColor: 'var(--mantine-color-blue-5)',
                },
              },
            }}
          />
          <Button
            leftSection={<IconSearch size={18} />}
            onClick={handleSearch}
            loading={isSearching}
            radius="xl"
            size="md"
            variant="gradient"
            gradient={{ from: 'blue.5', to: 'blue.7', deg: 135 }}
            style={{
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
            }}
          >
            Search
          </Button>
        </Flex>
      </Card>

      {/* Questions List or Empty State */}
      {questions.length === 0 ? (
        <Card
          radius="lg"
          p="xl"
          withBorder
          style={{
            background: isDark
              ? 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-7) 100%)'
              : 'linear-gradient(135deg, var(--mantine-color-gray-0) 0%, var(--mantine-color-white) 100%)',
            borderColor: isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)',
            textAlign: 'center',
          }}
        >
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon
              size={80}
              radius="xl"
              variant="light"
              color="blue"
              style={{
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
              }}
            >
              <IconMessageQuestion size={40} stroke={1.5} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700} c={isDark ? 'white' : 'dark.7'}>
                No questions available
              </Text>
              <Text size="sm" c="dimmed" mt="xs" maw={400} mx="auto">
                Interview questions for this course will appear here.
                Check back later for practice questions and answers.
              </Text>
            </Box>
            <Flex gap="xs" align="center" mt="sm">
              <IconSparkles size={16} style={{ color: 'var(--mantine-color-yellow-5)' }} />
              <Text size="xs" c="dimmed">
                Questions are added regularly based on course content
              </Text>
            </Flex>
          </Stack>
        </Card>
      ) : (
        <Stack gap="lg">
          {questions.map((item) => (
            <Question
              key={item._id}
              slug={item.slug}
              courseSlug={course.slug}
              questionUpdated={item.questionUpdated}
              question={item.question}
              answerUpdated={item.answerUpdated}
              answer={item.answer}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify='center' mt="lg">
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            color="blue"
            size="md"
            radius="xl"
            withEdges
            styles={{
              control: {
                fontWeight: 600,
                transition: 'all 0.2s ease',
                '&[data-active]': {
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                },
              },
            }}
          />
        </Flex>
      )}
    </Stack>
  );
};

export default InterviewClient;
