import { useEffect, useState } from "react";
import { Button, Box, Pagination, TextInput, Flex, MediaQuery, Group } from "@mantine/core";
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
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {editingQuestion ? (
        <EditQuestion
          questionData={editingQuestion}
          onUpdate={handleUpdate}
          onCancel={handleCancelEdit}
        />
      ) : isAddingQuestion ? (
        <AddQuestion onAddQuestion={handleAddQuestion} courseId={courseId} />
      ) : (
        <>
          <Box mb="md">
            <Button
              variant="outline"
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsAddingQuestion(true)}
              mb="sm"
            >
              Add Question
            </Button>

            <Group position="apart" align="flex-end" spacing="xs" sx={(theme) => ({
              flexDirection: 'row',
              [theme.fn.smallerThan('sm')]: {
                flexDirection: 'column',
                alignItems: 'stretch',
              }
            })}>
              <TextInput
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={(theme) => ({
                  flexGrow: 1,
                  marginBottom: theme.spacing.xs,
                  [theme.fn.smallerThan('sm')]: {
                    width: '100%',
                  }
                })}
              />
              <Button
                leftSection={<IconSearch size={16} />}
                onClick={handleSearch}
                sx={(theme) => ({
                  [theme.fn.smallerThan('sm')]: {
                    width: '100%',
                  }
                })}
              >
                Search
              </Button>
            </Group>

            <Box mt="md">
              <QuestionTable
                questions={questions}
                refreshQuestions={refreshQuestions}
                onEdit={handleEditQuestion}
              />
            </Box>

            <Flex justify='center' mt="md">
              <Pagination
                page={currentPage}
                onChange={setCurrentPage}
                total={totalPages}
                color="blue"
                size="sm"
              />
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

export default InterviewSection;