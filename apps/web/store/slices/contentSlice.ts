import { createSlice, createAsyncThunk, PayloadAction, Reducer } from '@reduxjs/toolkit';
import { ContentAPI } from '../../apis/v1/blog';
import { StructuredTutorialAPI, StructuredTutorial } from '../../apis/v1/blog/structuredTutorialApi';
import { ContentType } from '../../types/form';

// Define proper types
export interface ContentItem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryName: string;
  imageUrl: string;
  author: string;
  updatedAt: string;
  tutorial: boolean;
  listed: boolean;
  isStructured?: boolean; // Added flag
  subCategory?: string;
  nestedSubCategory?: string;
}

// Clean, consistent API response interface
export interface ApiResponse<T> {
  data: T[];           // Array of items for current page
  totalCount: number;  // Total count across all pages
  currentPage?: number;
  limit?: number;
}

// Legacy response interface for backward compatibility
export interface LegacyApiResponse<T> {
  posts?: T[];
  totalRecords?: number;
  success?: boolean;
  message?: string;
}

export interface ContentState {
  articles: ContentItem[];
  tutorials: ContentItem[];
  structuredTutorials: StructuredTutorial[]; // New state
  currentTag: string | null;
  totalCount: number;
  loading: boolean;
  error: string;
}

// Initial state with proper typing
const initialState: ContentState = {
  articles: [],
  tutorials: [],
  structuredTutorials: [],
  currentTag: null,
  totalCount: 0,
  loading: false,
  error: '',
};

// Type for async thunk parameters
interface PostsParams {
  start?: number;
  limit?: number;
  type?: ContentType | string;
}

interface TutorialsParams {
  start?: number;
  limit?: number;
  type?: string | ContentType;
}

interface StructuredTutorialsParams {
  page?: number;
  limit?: number;
  published?: boolean;
}

// Async thunks with proper typing
export const getPosts = createAsyncThunk<
  ApiResponse<ContentItem>,
  PostsParams
>(
  'content/getPosts',
  async ({ start = 1, limit = 10, type = 'both' }, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getPosts(start, limit, type);

      // Ensure response matches ApiResponse<ContentItem>
      return {
        data: response.data || [],
        totalCount: response.totalCount || 0,
        currentPage: response.currentPage || start,
        limit: response.limit || limit
      };

    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch posts');
    }
  },
);

export const getPostsByCategory = createAsyncThunk<
  ContentItem[],
  string
>(
  'content/getPostsByCategory',
  async (categoryName: string, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getPostsByCategory(categoryName);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch posts by category');
    }
  },
);

export const getPostsBySubCategory = createAsyncThunk<
  ContentItem[],
  string
>(
  'content/getPostsBySubCategory',
  async (subCategoryName: string, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getPostsBySubCategory(subCategoryName);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch posts by subcategory');
    }
  },
);

export const getTutorials = createAsyncThunk<
  ApiResponse<ContentItem>,
  TutorialsParams
>(
  'content/getTutorials',
  async ({ start = 1, limit = 10, type = 'tutorial' }, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getTutorials(start, limit, type);

      // Handle different response structures and normalize to ApiResponse
      if (Array.isArray(response)) {
        // Direct array response
        return {
          data: response,
          totalCount: response.length,
          currentPage: start,
          limit: limit
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Already in correct format
        return response;
      } else if (response.posts && Array.isArray(response.posts)) {
        // Legacy format
        return {
          data: response.posts,
          totalCount: response.totalRecords || response.posts.length,
          currentPage: start,
          limit: limit
        };
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch tutorials');
    }
  },
);

// New Thunk for Structured Tutorials
export const getStructuredTutorials = createAsyncThunk<
  ApiResponse<StructuredTutorial>,
  StructuredTutorialsParams
>(
  'content/getStructuredTutorials',
  async ({ page = 1, limit = 10, published = true }, { rejectWithValue }) => {
    try {
      const response = await StructuredTutorialAPI.getAll(page, limit, published);

      if (response.success && response.data) {
        return {
          data: response.data.tutorials,
          totalCount: response.data.totalRecords,
          currentPage: response.data.currentPage,
          limit: limit
        };
      }
      throw new Error(response.message || 'Failed to fetch structured tutorials');
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch structured tutorials');
    }
  }
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSelectTag: (state, action: PayloadAction<string | null>) => {
      state.currentTag = action.payload;
    },
    clearError: (state) => {
      state.error = '';
    },
    resetContent: (state) => {
      state.articles = [];
      state.tutorials = [];
      state.structuredTutorials = [];
      state.currentTag = null;
      state.totalCount = 0;
      state.loading = false;
      state.error = '';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getPosts
      .addCase(getPosts.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        const payload = action.payload;

        // Payload is guaranteed to be ApiResponse<ContentItem>
        state.articles = payload.data || [];
        state.totalCount = payload.totalCount || 0;
        state.loading = false;
        state.error = '';
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.articles = [];
        state.totalCount = 0;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch posts';
      })

      // Handle getPostsByCategory
      .addCase(getPostsByCategory.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getPostsByCategory.fulfilled, (state, action) => {
        state.articles = Array.isArray(action.payload) ? action.payload : [];
        state.totalCount = state.articles.length; // For category-based, use actual length
        state.loading = false;
        state.error = '';
      })
      .addCase(getPostsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.articles = [];
        state.totalCount = 0;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch posts by category';
      })

      // Handle getPostsBySubCategory
      .addCase(getPostsBySubCategory.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getPostsBySubCategory.fulfilled, (state, action) => {
        state.articles = Array.isArray(action.payload) ? action.payload : [];
        state.totalCount = state.articles.length;
        state.loading = false;
        state.error = '';
      })
      .addCase(getPostsBySubCategory.rejected, (state, action) => {
        state.loading = false;
        state.articles = [];
        state.totalCount = 0;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch posts by subcategory';
      })

      // Handle getTutorials
      .addCase(getTutorials.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getTutorials.fulfilled, (state, action) => {
        const payload = action.payload;
        // Payload is guaranteed to be ApiResponse<ContentItem>
        state.tutorials = payload.data || [];
        state.articles = payload.data || []; // Update articles for unified access
        state.totalCount = payload.totalCount || 0;
        state.loading = false;
        state.error = '';
      })
      .addCase(getTutorials.rejected, (state, action) => {
        state.loading = false;
        state.tutorials = [];
        state.articles = [];
        state.totalCount = 0;
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch tutorials';
      })

      // Handle getStructuredTutorials
      .addCase(getStructuredTutorials.pending, (state) => {
        // We don't necessarily want to trigger global loading if we are fetching in parallel? 
        // Or we do. Let's keep it consistent.
        state.loading = true;
        state.error = '';
      })
      .addCase(getStructuredTutorials.fulfilled, (state, action) => {
        const payload = action.payload;
        state.structuredTutorials = payload.data || [];
        // Note: Total count here overrides existing count which might be issue if mixed.
        // But for now Component usually displays one or the other.
        state.loading = false;
        state.error = '';
      })
      .addCase(getStructuredTutorials.rejected, (state, action) => {
        state.loading = false;
        state.structuredTutorials = [];
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch structured tutorials';
      });
  },
});

// Export actions
export const {
  setSelectTag,
  clearError,
  resetContent,
  setLoading,
  setError
} = contentSlice.actions;

// Export reducer with explicit type annotation
export const contentReducer: Reducer<ContentState> = contentSlice.reducer;

// Selectors with proper typing using generic RootState
export const selectArticles = (state: { content: ContentState }) =>
  state.content.articles;

export const selectTutorials = (state: { content: ContentState }) =>
  state.content.tutorials;

export const selectStructuredTutorials = (state: { content: ContentState }) =>
  state.content.structuredTutorials;

export const selectCurrentTag = (state: { content: ContentState }) =>
  state.content.currentTag;

export const selectTotalCount = (state: { content: ContentState }) =>
  state.content.totalCount;

export const selectContentLoading = (state: { content: ContentState }) =>
  state.content.loading;

export const selectContentError = (state: { content: ContentState }) =>
  state.content.error;

// Helper selectors
export const selectListedArticles = (state: { content: ContentState }) =>
  state.content.articles.filter(article => article.listed);

export const selectArticlesByCategory = (state: { content: ContentState }, categoryName: string) =>
  state.content.articles.filter(article => article.categoryName === categoryName);

export const selectTutorialsByCategory = (state: { content: ContentState }, categoryName: string) =>
  state.content.tutorials.filter(tutorial => tutorial.categoryName === categoryName);

export const selectContentById = (state: { content: ContentState }, id: string) =>
  state.content.articles.find(article => article._id === id) ||
  state.content.tutorials.find(tutorial => tutorial._id === id);

export const selectContentBySlug = (state: { content: ContentState }, slug: string) =>
  state.content.articles.find(article => article.slug === slug) ||
  state.content.tutorials.find(tutorial => tutorial.slug === slug) ||
  state.content.structuredTutorials.find(t => t.slug === slug); // Added lookup

// Helper functions for components
export const isContentLoading = (state: any): boolean => {
  return state?.content?.loading || false;
};

export const getContentError = (state: any): string => {
  return state?.content?.error || '';
};

export const getContentArticles = (state: any): ContentItem[] => {
  return state?.content?.articles || [];
};

export const getContentTutorials = (state: any): ContentItem[] => {
  return state?.content?.tutorials || [];
};

// Default export
const reducer: Reducer<ContentState> = contentSlice.reducer;
export default reducer;