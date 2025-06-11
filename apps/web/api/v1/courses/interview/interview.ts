import { bffApiClient } from '@whatsnxt/core-util';

export const interviewAPI = {
  saveApiKey: async function (apiKey) {
    const response = await bffApiClient.post('/interview/saveKey', { apiKey });
    return response;
  },

  getSuggestionByChatGpt: async function (question) {
    const response = await bffApiClient.post('/interview/suggestionByChatGpt', question);
    return response;
  },

  getSuggestionByGemini: async function (question) {
    const response = await bffApiClient.post('/interview/suggestionByGemini', question);
    return response;
  },

  getQuestionsByCourse: async function (courseId, page = 1, limit = 10, searchQuery = "") {
    const response = await bffApiClient.get(`/interview/course/${courseId}?page=${page}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`);
    return response;
  },

  createQuestion: async function (question) {
    const response = await bffApiClient.post('/interview', question);
    return response;
  },

  updateQuestion: async function (questionId, questionData) {
    const response = await bffApiClient.put(`/interview/${questionId}`, questionData);
    return response;
  },

  deleteQuestion: async function (questionId) {
    const response = await bffApiClient.delete(`/interview/${questionId}`);
    return response;
  },
};