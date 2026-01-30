/**
 * Posts API Client
 * Feature: 002-reusable-sections
 * Tasks: T049, T095, T096
 * 
 * API client for post management with section support.
 * Handles post creation with section assignment, reassignment, and deletion.
 */

import { httpClient } from '@whatsnxt/http-client';

const BASE_PATH = '/api/v1';

export interface Post {
  _id: string;
  title: string;
  slug: string;
  contentType: 'blog' | 'tutorial';
  contentId: string;
  sectionId: string | null; // null = orphaned post
  sectionOrder: number;
  body?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  contentType: 'blog' | 'tutorial';
  contentId: string;
  sectionId?: string; // Optional - if provided, post is assigned to section
  sectionOrder?: number; // Optional - defaults to end of section
  body?: string;
  status?: string;
}

export interface ReassignPostRequest {
  sectionId: string;
  sectionOrder?: number; // Optional - defaults to end of section
}

export interface OrphanedPost {
  _id: string;
  title: string;
  slug: string;
  contentId: string;
  sectionId: null;
  createdAt: string;
}

/**
 * Posts API for section-aware post management
 */
export const PostsAPI = {
  /**
   * Create a new post (optionally assigned to a section)
   * POST /api/v1/posts
   */
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    const response = await httpClient.post(`${BASE_PATH}/posts`, data);
    return response.data.data;
  },

  /**
   * Get orphaned posts for a specific content
   * GET /api/v1/content/{contentId}/orphaned-posts
   */
  getOrphanedPosts: async (contentId: string): Promise<{
    posts: OrphanedPost[];
    total: number;
  }> => {
    const response = await httpClient.get(
      `${BASE_PATH}/content/${contentId}/orphaned-posts`
    );
    return {
      posts: response.data.data,
      total: response.data.total,
    };
  },

  /**
   * Reassign an orphaned post to a section
   * POST /api/v1/posts/{postId}/reassign
   */
  reassignPost: async (
    postId: string,
    data: ReassignPostRequest
  ): Promise<Post> => {
    const response = await httpClient.post(
      `${BASE_PATH}/posts/${postId}/reassign`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a post (typically orphaned posts)
   * DELETE /api/v1/posts/{postId}
   */
  deletePost: async (postId: string): Promise<{ success: boolean }> => {
    const response = await httpClient.delete(`${BASE_PATH}/posts/${postId}`);
    return response.data;
  },

  /**
   * Get posts for a specific section in a content
   * (This is for display purposes - posts nested under sections)
   */
  getPostsBySection: async (
    contentId: string,
    sectionId: string
  ): Promise<Post[]> => {
    const response = await httpClient.get(`${BASE_PATH}/posts`, {
      params: {
        contentId,
        sectionId,
        sortBy: 'sectionOrder',
        sortOrder: 'asc',
      },
    });
    return response.data.data;
  },

  /**
   * Update post order within a section (drag-and-drop)
   * PATCH /api/v1/posts/{postId}/reorder
   */
  reorderPost: async (
    postId: string,
    newOrder: number
  ): Promise<Post> => {
    const response = await httpClient.patch(
      `${BASE_PATH}/posts/${postId}/reorder`,
      { sectionOrder: newOrder }
    );
    return response.data.data;
  },

  /**
   * Bulk reassign multiple posts to a section
   * POST /api/v1/posts/bulk-reassign
   */
  bulkReassignPosts: async (
    postIds: string[],
    sectionId: string
  ): Promise<{ success: boolean; count: number }> => {
    const response = await httpClient.post(`${BASE_PATH}/posts/bulk-reassign`, {
      postIds,
      sectionId,
    });
    return response.data;
  },

  /**
   * Bulk delete multiple posts
   * POST /api/v1/posts/bulk-delete
   */
  bulkDeletePosts: async (
    postIds: string[]
  ): Promise<{ success: boolean; count: number }> => {
    const response = await httpClient.post(`${BASE_PATH}/posts/bulk-delete`, {
      postIds,
    });
    return response.data;
  },
};
