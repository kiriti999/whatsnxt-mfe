import http from "@whatsnxt/http-client";

export interface SectionAttempt {
    key: string;
    title: string;
    content: string;
    score: number | null;
    feedback: string;
    passed: boolean;
    evaluated: boolean;
}

export interface DiagramAttempt {
    key: string;
    title: string;
    content: string;
    score: number | null;
    feedback: string;
    passed: boolean;
    evaluated: boolean;
}

export interface PracticeAttempt {
    _id: string;
    courseId: string;
    userId: string;
    sections: SectionAttempt[];
    diagrams: DiagramAttempt[];
    overallScore: number | null;
    status: "in-progress" | "completed";
    passingScore: number;
    createdAt: string;
    updatedAt: string;
}

export interface EvaluationResult {
    score: number;
    feedback: string;
    passed: boolean;
}

export const PracticeAPI = {
    getOrCreate: async (
        courseId: string,
    ): Promise<{ message: string; data: PracticeAttempt }> => {
        return http.post(`/practice/${courseId}`, {});
    },

    getAttempt: async (
        courseId: string,
    ): Promise<{ data: PracticeAttempt }> => {
        return http.get(`/practice/${courseId}`);
    },

    saveSection: async (
        courseId: string,
        sectionKey: string,
        content: string,
    ): Promise<{ message: string; data: PracticeAttempt }> => {
        return http.put(`/practice/${courseId}/section`, { sectionKey, content });
    },

    evaluateSection: async (
        courseId: string,
        sectionKey: string,
        aiModel?: string,
        modelVersion?: string,
    ): Promise<{ message: string; data: EvaluationResult }> => {
        return http.post(`/practice/${courseId}/evaluate-section`, {
            sectionKey,
            aiModel,
            modelVersion,
        });
    },

    saveDiagram: async (
        courseId: string,
        diagramKey: string,
        content: string,
    ): Promise<{ message: string; data: PracticeAttempt }> => {
        return http.put(`/practice/${courseId}/diagram`, { diagramKey, content });
    },

    evaluateDiagram: async (
        courseId: string,
        diagramKey: string,
        aiModel?: string,
        modelVersion?: string,
    ): Promise<{ message: string; data: EvaluationResult }> => {
        return http.post(`/practice/${courseId}/evaluate-diagram`, {
            diagramKey,
            aiModel,
            modelVersion,
        });
    },
};
