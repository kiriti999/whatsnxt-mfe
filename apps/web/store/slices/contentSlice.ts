import { createSlice, createAsyncThunk, PayloadAction, Reducer } from '@reduxjs/toolkit';
import { ContentAPI } from '../../apis/v1/blog';
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
}

export interface ApiResponse<T> {
  data?: {
    posts?: T[];
    totalRecords?: number;
  };
  posts?: T[];
  totalRecords?: number;
  success?: boolean;
  message?: string;
}

export interface ContentState {
  articles: ContentItem[];
  tutorials: ContentItem[];
  currentTag: string | null;
  totalCount: number;
  loading: boolean;
  error: string;
}

// Initial state with proper typing
const initialState: ContentState = {
  articles: [],
  tutorials: [],
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

// Async thunks with proper typing
export const getPosts = createAsyncThunk<
  ApiResponse<ContentItem>,
  PostsParams
>(
  'content/getPosts',
  async ({ start = 1, limit = 10, type = 'both' }, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getPosts(start, limit, type);
      console.log(' response:', response)
      return response;
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

export const getTutorials = createAsyncThunk<
  ContentItem[] | ApiResponse<ContentItem>,
  TutorialsParams
>(
  'content/getTutorials',
  async ({ start = 1, limit = 10, type = 'tutorial' }, { rejectWithValue }) => {
    try {
      const response = await ContentAPI.getTutorials(start, limit, type);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch tutorials');
    }
  },
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

        // Extract articles from different possible response structures
        const articles = Array.isArray(payload) ? payload : [];
        console.log(' .addCase :: articles:', articles);
        const totalRecords = articles.length || 0;

        state.articles = Array.isArray(articles) ? articles : [];
        state.totalCount = totalRecords;
        state.loading = false;
        state.error = '';
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.loading = false;
        state.articles = [];
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch posts';
      })

      // Handle getPostsByCategory
      .addCase(getPostsByCategory.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getPostsByCategory.fulfilled, (state, action) => {
        state.articles = Array.isArray(action.payload) ? action.payload : [];
        state.loading = false;
        state.error = '';
      })
      .addCase(getPostsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.articles = [];
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch posts by category';
      })

      // Handle getTutorials
      .addCase(getTutorials.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getTutorials.fulfilled, (state, action) => {
        const payload = action.payload;

        // Handle different response structures
        let tutorialsData: ContentItem[] = [];
        let totalRecords = 0;

        if (Array.isArray(payload)) {
          // Direct array response
          tutorialsData = payload;
          totalRecords = payload.length;
        } else if (payload?.data?.posts) {
          // Nested response structure
          tutorialsData = payload.data.posts;
          totalRecords = payload.data.totalRecords || tutorialsData.length;
        } else if (payload?.posts) {
          // Flat response structure
          tutorialsData = payload.posts;
          totalRecords = payload.totalRecords || tutorialsData.length;
        }

        state.tutorials = tutorialsData;
        state.articles = tutorialsData; // Also update articles for unified access
        state.totalCount = totalRecords;
        state.loading = false;
        state.error = '';
      })
      .addCase(getTutorials.rejected, (state, action) => {
        state.loading = false;
        state.tutorials = [];
        state.articles = [];
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch tutorials';
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

// Remove the separate ContentRootState and use generic selectors
// Selectors with proper typing using generic RootState
export const selectArticles = (state: { content: ContentState }) =>
  state.content.articles;

export const selectTutorials = (state: { content: ContentState }) =>
  state.content.tutorials;

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
  state.content.tutorials.find(tutorial => tutorial.slug === slug);

// Helper functions for components (updated to work with any state structure)
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

// Default export with explicit type annotation
const reducer: Reducer<ContentState> = contentSlice.reducer;
export default reducer;