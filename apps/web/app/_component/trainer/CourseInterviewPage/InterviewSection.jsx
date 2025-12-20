import { useEffect, useState } from "react";
import { Button, Box, Pagination, TextInput, Flex, MediaQuery, Group, Paper, Grid } from "@mantine/core";
import { interviewAPI } from "../../../../apis/v1/courses/interview/interview";
import QuestionTable from "./QuestionTable";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import { useDashboardContext } from "../../../../context/DashboardContext";
import { IconPlus, IconSearch } from "@tabler/icons-react";

const InterviewSection = ({ cType, courseId }) => {
  const { setEnabledSections, setEnabledReview } = useDashboardContext();
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setEnabledReview(true);
  }, [setEnabledReview]);

  useEffect(() => {
    setEnabledSections((prev) => {
      const updatedSections = new Set(prev);
      [1, 2, 3, 4].forEach((section) => updatedSections.add(section));
      return updatedSections;
    });
  }, [setEnabledSections]);

  const fetchQuestions = async (page = 1, query = "") => {
    try {
      const response = await interviewAPI.getQuestionsByCourse(courseId, page, 5, query);
      setQuestions(response.data.questions);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions(1, searchQuery);
  }

  useEffect(() => {
    if (courseId) {
      fetchQuestions(currentPage, searchQuery);
    }
  }, [courseId, currentPage]);

  const refreshQuestions = () => {
    fetchQuestions(currentPage, searchQuery);
  };

  const handleAddQuestion = async (question) => {
    if (question) {
      try {
        await interviewAPI.createQuestion(question);
        refreshQuestions();
      } catch (error) {
        console.error("Error adding question:", error);
      }
    }
    setIsAddingQuestion(false);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
  };

  const handleUpdate = () => {
    setEditingQuestion(null);
    refreshQuestions();
  };

  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  return (
    <Box w="100%">
      {editingQuestion ? (
        <EditQuestion
          questionData={editingQuestion}
          onUpdate={handleUpdate}
          onCancel={handleCancelEdit}
        />
      ) : isAddingQuestion ? (
        <AddQuestion onAddQuestion={handleAddQuestion} courseId={courseId} />
      ) : (
        <Paper shadow="sm" radius="md" withBorder p="lg">
          <Group justify="space-between" mb="md">
            <Button
              variant="filled"
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsAddingQuestion(true)}
            >
              Add Question
            </Button>
          </Group>

          <Grid align="flex-end" mb="md">
            <Grid.Col span={{ base: 12, sm: 10 }}>
              <TextInput
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftSection={<IconSearch size={16} />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 2 }}>
              <Button
                onClick={handleSearch}
                fullWidth
              >
                Search
              </Button>
            </Grid.Col>
          </Grid>

          <Box mt="md">
            <QuestionTable
              questions={questions}
              refreshQuestions={refreshQuestions}
              onEdit={handleEditQuestion}
            />
          </Box>

          <Flex justify='center' mt="xl">
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              color="blue"
              size="sm"
              radius="md"
              withEdges
            />
          </Flex>
        </Paper>
      )}
    </Box>
  );
};

export default InterviewSection;