import { createSlice, createAsyncThunk, PayloadAction, Reducer, createSelector } from '@reduxjs/toolkit';
import { CategoryAPI } from '../../apis/v1/blog/categoryApi';

export interface BlogCategory {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface CategoryStoreState {
  categories: BlogCategory[];      // ← For getCategories API
  categoryCount: BlogCategory[];   // ← For getArticleCountByCategory API
  loading: boolean;
  error: string;
}

// This interface matches what PopularTag component expects
export interface IMemoStore {
  categoryCount: BlogCategory[];
  loading: boolean;
  error: string;
}

const initialState: CategoryStoreState = {
  categories: [],      // ← For getCategories API
  categoryCount: [],   // ← For getArticleCountByCategory API
  loading: false,      // ← Changed from true to false for better UX
  error: '',
};

// Properly typed async thunks
export const getCategories = createAsyncThunk<
  BlogCategory[],
  void
>(
  'blogCategory/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryAPI.getCategories();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch categories');
    }
  },
);

export const getArticleCountByCategory = createAsyncThunk<
  BlogCategory[],
  void
>(
  'blogCategory/getArticleCountByCategory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await CategoryAPI.getArticleCountByCategory();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to fetch article counts');
    }
  },
);

const blogCategorySlice = createSlice({
  name: 'blogCategory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = '';
    },
    resetCategories: (state) => {
      state.categories = [];
      state.categoryCount = [];
      state.loading = false;
      state.error = '';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle getCategories
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;  // ← Goes to categories field
        state.loading = false;
        state.error = '';
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.categories = [];  // ← Reset categories field
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch categories';
      })

      // Handle getArticleCountByCategory
      .addCase(getArticleCountByCategory.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(getArticleCountByCategory.fulfilled, (state, action) => {
        state.categoryCount = action.payload;  // ← Goes to categoryCount field
        state.loading = false;
        state.error = '';
      })
      .addCase(getArticleCountByCategory.rejected, (state, action) => {
        state.loading = false;
        state.categoryCount = [];  // ← Reset categoryCount field
        state.error = (action.payload as string) || action.error.message || 'Failed to fetch article counts';
      });
  },
});

// Export actions
export const { clearError, resetCategories, setLoading } = blogCategorySlice.actions;

// Export reducer with explicit type annotation
export const blogCategoryReducer: Reducer<CategoryStoreState> = blogCategorySlice.reducer;

// Selectors
export const selectCategories = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.categories;

export const selectCategoryCount = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.categoryCount;

export const selectBlogCategoryLoading = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.loading;

export const selectBlogCategoryError = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.error;

// Properly memoized selector for IMemoStore format (prevents unnecessary re-renders)
export const selectIMemoStore = createSelector(
  [selectCategoryCount, selectBlogCategoryLoading, selectBlogCategoryError],
  (categoryCount, loading, error): IMemoStore => ({
    categoryCount,
    loading,
    error,
  })
);

// Helper selectors
export const selectActiveCategoryCount = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.categoryCount.filter(category => category.count > 0);

export const selectCategoryByName = (state: { blogCategory: CategoryStoreState }, categoryName: string) =>
  state.blogCategory.categories.find(category => category.categoryName === categoryName);

export const selectTotalArticleCount = (state: { blogCategory: CategoryStoreState }) =>
  state.blogCategory.categoryCount.reduce((total, category) => total + category.count, 0);

// Default export with explicit type annotation (only once!)
const reducer: Reducer<CategoryStoreState> = blogCategorySlice.reducer;
export default reducer;