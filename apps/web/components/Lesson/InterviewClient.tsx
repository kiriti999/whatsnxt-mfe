'use client'
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Flex,
  TextInput,
  Button,
  Pagination,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMediaQuery } from "@mantine/hooks";
import { interviewAPI } from "../../apis/v1/courses/interview/interview";
import Question from './question';

const InterviewClient = ({ course, pageLimit = 2 }) => {
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQuestions = async (page = 1, query = "") => {
    try {
      const response = await interviewAPI.getQuestionsByCourse(course._id, page, pageLimit, query);
      setQuestions(response.data.questions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching questions:", error);
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

  return (
    <Box>
      <Flex mb="md" gap="md" direction="column">
        <Box>
          <Flex gap="md">
            <TextInput
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              flex={1}
            />
            <Button
              leftSection={<IconSearch size={16} />}
              onClick={handleSearch}
            >
              Search
            </Button>
          </Flex>
        </Box>

        {questions.length === 0 ? (
          <Box ta="center">No questions available.</Box>
        ) : (
          <Flex direction="column" gap="xl">
            {questions.map((item) => (
              <React.Fragment key={item._id}>
                <Question
                  slug={item.slug}
                  courseSlug={course.slug}
                  questionUpdated={item.questionUpdated}
                  question={item.question}
                  answerUpdated={item.answerUpdated}
                  answer={item.answer}
                />
              </React.Fragment>
            ))}
          </Flex>
        )}

        <Flex justify='center'>
          <Pagination
            value={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            color="blue"
            size="sm"
            mt="md"
          />
        </Flex>
      </Flex>
    </Box>
  );
};

export default InterviewClient;
