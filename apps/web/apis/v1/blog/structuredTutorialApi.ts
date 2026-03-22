import { articleApiClient } from "@whatsnxt/core-util";

// ============ Types ============

export interface CloudinaryAsset {
    public_id: string;
    url: string;
    secure_url: string;
    resource_type: string;
    format?: string;
}

export interface StructuredTutorial {
    _id: string;
    id?: string;
    title: string;
    slug: string;
    description?: string;
    lexicalState?: any;
    contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL" | "JSON";
    imageUrl?: string;
    icon?: string;
    userId: string;
    published: boolean;
    listed: boolean;
    isPremium?: boolean;
    sectionIds: TutorialSection[];
    cloudinaryAssets?: CloudinaryAsset[];
    categoryId?: string;
    categoryName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TutorialSection {
    _id: string;
    id?: string;
    title: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    icon?: string;
    order: number;
    structuredTutorialId: string;
    postIds: TutorialPost[];
    sourceId?: string;
    isReused: boolean;
    isFreePreview?: boolean;
    cloudinaryAssets?: CloudinaryAsset[];
    createdAt: string;
    updatedAt: string;
}

export interface TutorialPost {
    _id: string;
    id?: string;
    title: string;
    slug: string;
    description?: string;
    lexicalState?: any;
    content?: {
        lexicalState?: any;
        plainText?: string;
        exportFormats?: {
            html?: string;
        };
    };
    contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL" | "JSON";
    order: number;
    sectionId: string;
    sourceId?: string;
    isReused: boolean;
    cloudinaryAssets?: CloudinaryAsset[];
    postType?: "CONTENT" | "MCQ";
    mcqData?: {
        question: string;
        options: Array<{
            id: string;
            label: string;
            text: string;
            isCorrect: boolean;
        }>;
        explanation: string;
        difficulty: "EASY" | "MEDIUM" | "HARD";
    };
    createdAt: string;
    updatedAt: string;
}

export interface SidebarTree {
    tutorialId: string;
    tutorialTitle: string;
    tutorialSlug: string;
    isPremium?: boolean;
    sections: SidebarSection[];
}

export interface SidebarSection {
    id: string;
    title: string;
    slug: string;
    icon: string;
    order: number;
    isFreePreview?: boolean;
    posts: SidebarPost[];
}

export interface SidebarPost {
    id: string;
    title: string;
    slug: string;
    order: number;
    postType?: "CONTENT" | "MCQ";
}

export interface PaginatedResponse<T> {
    tutorials: T[];
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    newTutorialId?: string; // Returned when operation creates a draft copy
    newSectionId?: string; // Returned when operation creates a section in draft copy
}

// ============ API Client ============

export const StructuredTutorialAPI = {
    // ========== Tutorial CRUD ==========

    create: async (payload: {
        title: string;
        description?: string;
        imageUrl?: string;
        icon?: string;
        categoryId?: string;
        categoryName?: string;
        cloudinaryAssets?: CloudinaryAsset[];
    }): Promise<ApiResponse<StructuredTutorial>> => {
        const { data } = await articleApiClient.post(
            "/structured-tutorial",
            payload,
        );
        return data;
    },

    getAll: async (
        page = 1,
        limit = 10,
        published?: boolean,
    ): Promise<ApiResponse<PaginatedResponse<StructuredTutorial>>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (published !== undefined) {
            params.append("published", published.toString());
        }
        const { data } = await articleApiClient.get(
            `/structured-tutorial?${params.toString()}`,
        );
        return data;
    },

    getById: async (id: string): Promise<ApiResponse<StructuredTutorial>> => {
        const { data } = await articleApiClient.get(`/structured-tutorial/${id}`);
        return data;
    },

    getBySlug: async (slug: string): Promise<ApiResponse<StructuredTutorial>> => {
        const { data } = await articleApiClient.get(
            `/structured-tutorial/slug/${slug}`,
        );
        return data;
    },

    update: async (
        id: string,
        payload: Partial<{
            title: string;
            description: string;
            imageUrl: string;
            icon: string;
            categoryId: string;
            categoryName: string;
            subCategory: string;
            nestedSubCategory: string;
            isPremium: boolean;
            cloudinaryAssets: CloudinaryAsset[];
        }>,
    ): Promise<ApiResponse<StructuredTutorial>> => {
        const { data } = await articleApiClient.put(
            `/structured-tutorial/${id}`,
            payload,
        );
        return data;
    },

    delete: async (id: string): Promise<ApiResponse<null>> => {
        const { data } = await articleApiClient.delete(
            `/structured-tutorial/${id}`,
        );
        return data;
    },

    publish: async (
        id: string,
        published: boolean,
    ): Promise<ApiResponse<StructuredTutorial>> => {
        const { data } = await articleApiClient.patch(
            `/structured-tutorial/${id}/publish`,
            { published },
        );
        return data;
    },

    // ========== Section CRUD ==========

    createSection: async (
        tutorialId: string,
        payload: {
            title: string;
            description?: string;
            imageUrl?: string;
            icon?: string;
            cloudinaryAssets?: CloudinaryAsset[];
        },
    ): Promise<ApiResponse<TutorialSection>> => {
        const { data } = await articleApiClient.post(
            `/structured-tutorial/${tutorialId}/section`,
            payload,
        );
        return data;
    },

    getSections: async (
        tutorialId: string,
    ): Promise<ApiResponse<TutorialSection[]>> => {
        const { data } = await articleApiClient.get(
            `/structured-tutorial/${tutorialId}/section`,
        );
        return data;
    },

    updateSection: async (
        tutorialId: string,
        sectionId: string,
        payload: Partial<{
            title: string;
            description: string;
            imageUrl: string;
            icon: string;
            cloudinaryAssets: CloudinaryAsset[];
        }>,
    ): Promise<ApiResponse<TutorialSection>> => {
        const { data } = await articleApiClient.put(
            `/structured-tutorial/${tutorialId}/section/${sectionId}`,
            payload,
        );
        return data;
    },

    deleteSection: async (
        tutorialId: string,
        sectionId: string,
    ): Promise<ApiResponse<null>> => {
        const { data } = await articleApiClient.delete(
            `/structured-tutorial/${tutorialId}/section/${sectionId}`,
        );
        return data;
    },

    reuseSection: async (
        tutorialId: string,
        sourceSectionId: string,
    ): Promise<ApiResponse<TutorialSection>> => {
        const { data } = await articleApiClient.post(
            `/structured-tutorial/${tutorialId}/section/${sourceSectionId}/reuse`,
            {},
        );
        return data;
    },

    // ========== Post CRUD ==========

    createPost: async (
        sectionId: string,
        payload: {
            title: string;
            description?: string;
            contentFormat?: "HTML" | "MARKDOWN" | "LEXICAL" | "JSON";
            cloudinaryAssets?: CloudinaryAsset[];
        },
    ): Promise<ApiResponse<TutorialPost>> => {
        const { data } = await articleApiClient.post(
            `/structured-tutorial/section/${sectionId}/post`,
            payload,
        );
        return data;
    },

    getPosts: async (sectionId: string): Promise<ApiResponse<TutorialPost[]>> => {
        const { data } = await articleApiClient.get(
            `/structured-tutorial/section/${sectionId}/post`,
        );
        return data;
    },

    getPostById: async (
        sectionId: string,
        postId: string,
    ): Promise<ApiResponse<TutorialPost>> => {
        const { data } = await articleApiClient.get(
            `/structured-tutorial/section/${sectionId}/post/${postId}`,
        );
        return data;
    },

    updatePost: async (
        sectionId: string,
        postId: string,
        payload: Partial<{
            title: string;
            description: string;
            contentFormat: "HTML" | "MARKDOWN" | "LEXICAL" | "JSON";
            cloudinaryAssets: CloudinaryAsset[];
        }>,
    ): Promise<ApiResponse<TutorialPost>> => {
        const { data } = await articleApiClient.put(
            `/structured-tutorial/section/${sectionId}/post/${postId}`,
            payload,
        );
        return data;
    },

    deletePost: async (
        sectionId: string,
        postId: string,
    ): Promise<ApiResponse<null>> => {
        const { data } = await articleApiClient.delete(
            `/structured-tutorial/section/${sectionId}/post/${postId}`,
        );
        return data;
    },

    reusePost: async (
        sectionId: string,
        sourcePostId: string,
    ): Promise<ApiResponse<TutorialPost>> => {
        const { data } = await articleApiClient.post(
            `/structured-tutorial/section/${sectionId}/post/${sourcePostId}/reuse`,
            {},
        );
        return data;
    },

    // ========== Sidebar ==========

    getSidebar: async (tutorialId: string): Promise<ApiResponse<SidebarTree>> => {
        const { data } = await articleApiClient.get(
            `/structured-tutorial/${tutorialId}/sidebar`,
        );
        return data;
    },

    // ========== Reuse Lists ==========

    getAvailableSections: async (
        excludeTutorialId?: string,
    ): Promise<ApiResponse<TutorialSection[]>> => {
        const params = excludeTutorialId
            ? `?excludeTutorialId=${excludeTutorialId}`
            : "";
        const { data } = await articleApiClient.get(
            `/structured-tutorial/reuse/sections${params}`,
        );
        return data;
    },

    getAvailablePosts: async (
        excludeSectionId?: string,
    ): Promise<ApiResponse<TutorialPost[]>> => {
        const params = excludeSectionId
            ? `?excludeSectionId=${excludeSectionId}`
            : "";
        const { data } = await articleApiClient.get(
            `/structured-tutorial/reuse/posts${params}`,
        );
        return data;
    },
};

export default StructuredTutorialAPI;
