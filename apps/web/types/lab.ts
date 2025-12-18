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

    masterGraph?: any; // D3 Graph JSON

    architectureConfig?: {
        type: 'fullstack' | 'aws' | 'docker' | 'react' | 'nextjs' | 'kubernetes';
        diagram?: string; // Legacy or specific URL
    };

    // Multi-select architecture types support (new field)
    architectureTypes?: string[];

    kubernetesConfig?: {
        clusterVersion?: string;
        nodes?: number;
        tools?: string[]; // e.g., 'kubectl', 'helm'
    };

    questions: Question[];
    practiceTest: PracticeTestConfig;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
    status: 'DRAFT' | 'PUBLISHED';
}
