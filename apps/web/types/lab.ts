export type QuestionType = 'multiple-choice' | 'coding' | 'text';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    options?: string[]; // For multiple-choice
    correctAnswer?: string;
    codeSnippet?: string; // For coding questions
    hint?: string;
}

export interface PracticeTestConfig {
    enabled: boolean;
    timeLimitMinutes?: number;
    passingScorePercentage?: number;
    shuffleQuestions?: boolean;
}

export type LabType = 'programming' | 'cloud' | 'framework' | 'architecture';

export interface Lab {
    id?: string;
    title: string;
    description: string;
    type: LabType;

    // Specific configurations based on type
    language?: string; // For type 'programming' (e.g., 'python', 'javascript')

    cloudConfig?: {
        platform: 'aws' | 'docker' | 'kubernetes';
        region?: string; // e.g. for AWS
        services?: string[]; // e.g. for AWS (EC2, S3)
    };

    frameworkConfig?: {
        framework: 'motia' | 'nextjs' | 'monorepo';
        version?: string;
    };

    architectureConfig?: {
        type: 'fullstack';
        diagram?: string; // URL or definition
    };

    kubernetesConfig?: {
        clusterVersion?: string;
        nodes?: number;
        tools?: string[]; // e.g., 'kubectl', 'helm'
    };

    questions: Question[];
    practiceTest: PracticeTestConfig;
    createdAt?: Date;
    updatedAt?: Date;
}
