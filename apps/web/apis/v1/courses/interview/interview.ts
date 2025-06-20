import { courseApiClient } from '@whatsnxt/core-util';

export const interviewAPI = {
  saveApiKey: async function (apiKey) {
    const response = await courseApiClient.post('/interview/saveKey', { apiKey });
    return response;
  },

  getSuggestionByChatGpt: async function (question) {
    const response = await courseApiClient.post('/interview/suggestionByChatGpt', question);
    return response;
  },

  getSuggestionByGemini: async function (question) {
    const response = await courseApiClient.post('/interview/suggestionByGemini', question);
    return response;
  },

  getQuestionsByCourse: async function (courseId, page = 1, limit = 10, searchQuery = "") {
    const response = await courseApiClient.get(`/interview/course/${courseId}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`);
    return response;
  },

  createQuestion: async function (question) {
    const response = await courseApiClient.post('/interview', question);
    return response;
  },

  updateQuestion: async function (questionId, questionData) {
    const response = await courseApiClient.put(`/interview/${questionId}`, questionData);
    return response;
  },

  deleteQuestion: async function (questionId) {
    const response = await courseApiClient.delete(`/interview/${questionId}`);
    return response;
  },
};