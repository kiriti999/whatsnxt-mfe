import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CategoryAPI } from '../../api/v1/blog/categoryApi';

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

const initialState: CategoryStoreState = {
  categories: [],      // ← For getCategories API
  categoryCount: [],   // ← For getArticleCountByCategory API
  loading: true,
  error: '',
};

export const getCategories = createAsyncThunk(
  'categories',
  async () => await CategoryAPI.getCategories(),
);

export const getArticleCountByCategory = createAsyncThunk(
  'getArticleCountByCategory',
  async () => {
    const data = await CategoryAPI.getArticleCountByCategory()
    return data;
  },
);

export const blogCategorySlice = createSlice({
  name: 'blogCategory',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(getCategories.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        getCategories.fulfilled,
        (
          state: { categories: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          state.categories = action.payload;  // ← Goes to categories field
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getCategories.rejected,
        (
          state: { loading: boolean; categories: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.categories = [];  // ← Reset categories field
          state.error = action.error.message;
        },
      )
      .addCase(
        getArticleCountByCategory.pending,
        (state: { loading: boolean }) => {
          state.loading = true;
        },
      )
      .addCase(
        getArticleCountByCategory.fulfilled,
        (
          state: { categoryCount: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          state.categoryCount = action.payload;  // ← Goes to categoryCount field
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getArticleCountByCategory.rejected,
        (
          state: { loading: boolean; categoryCount: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.categoryCount = [];  // ← Reset categoryCount field
          state.error = action.error.message;
        },
      );
  },
});

export const blogCategoryReducer = blogCategorySlice.reducer;