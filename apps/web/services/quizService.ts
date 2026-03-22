import { articleApiClient } from '@whatsnxt/core-util';

export interface MCQOption {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
}

export interface MCQData {
    question: string;
    options: MCQOption[];
    explanation: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface CreateMCQPostRequest {
    title: string;
    description?: string;
    question: string;
    options: MCQOption[];
    explanation?: string;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    cloudinaryAssets?: any[];
}

export interface SubmitAnswerRequest {
    selectedOptionId: string;
}

export interface SubmitAnswerResponse {
    isCorrect: boolean;
    correctOptionId: string;
    explanation: string;
    attempts: number;
}

export interface QuizProgressResponse {
    totalQuizzes: number;
    correctAnswers: number;
    progress: string;
    percentage: number;
}

export interface UserQuizAnswerResponse {
    selectedOptionId: string;
    isCorrect: boolean;
    attempts: number;
    completedAt: string;
}

/**
 * Create an MCQ post
 */
export const createMCQPost = async (
    sectionId: string,
    data: CreateMCQPostRequest
): Promise<any> => {
    const response = await articleApiClient.post(
        `/structured-tutorial/section/${sectionId}/post/mcq`,
        data
    );
    return response.data;
};

/**
 * Update an existing MCQ post
 */
export const updateMCQPost = async (
    sectionId: string,
    postId: string,
    data: CreateMCQPostRequest
): Promise<any> => {
    const response = await articleApiClient.put(
        `/structured-tutorial/section/${sectionId}/post/${postId}`,
        {
            title: data.title,
            mcqData: {
                question: data.question,
                options: data.options,
                explanation: data.explanation || '',
                difficulty: data.difficulty || 'MEDIUM',
            },
        }
    );
    return response.data;
};

/**
 * Submit an answer to a quiz
 */
export const submitQuizAnswer = async (
    postId: string,
    data: SubmitAnswerRequest,
    token?: string | null
): Promise<SubmitAnswerResponse> => {
    const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

    const response = await articleApiClient.post(
        `/structured-tutorial/quiz/${postId}/submit`,
        data,
        config
    );
    return response.data.data;
};

/**
 * Get quiz progress for a tutorial
 */
export const getQuizProgress = async (
    tutorialId: string,
    token?: string | null
): Promise<QuizProgressResponse> => {
    const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

    const response = await articleApiClient.get(
        `/structured-tutorial/quiz/progress/${tutorialId}`,
        config
    );
    return response.data.data;
};

/**
 * Get user's answer for a specific quiz
 */
export const getUserQuizAnswer = async (
    postId: string,
    token?: string | null
): Promise<UserQuizAnswerResponse | null> => {
    const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

    const response = await articleApiClient.get(
        `/structured-tutorial/quiz/${postId}/user-answer`,
        config
    );
    return response.data.data;
};
