import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CategoryAPI } from '../../api/v1/blog/categoryApi';

export interface BlogCategory {
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface CategoryStoreState {
  categories: BlogCategory[];
  loading: boolean;
  error: string;
}

const initialState: CategoryStoreState = {
  categories: [],
  loading: true,
  error: '',
};

export const getCategories = createAsyncThunk(
  'categories',
  async () => await CategoryAPI.getCategories(),
);

export const getArticleCountByCategory = createAsyncThunk(
  'getArticleCountByCategory',
  async () => await CategoryAPI.getArticleCountByCategory(),
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
          state.categories = action.payload;
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
          state.categories = [];
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
          state: { categories: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          state.categories = action.payload;
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getArticleCountByCategory.rejected,
        (
          state: { loading: boolean; categories: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.categories = [];
          state.error = action.error.message;
        },
      );
  },
});
export const blogCategoryReducer = blogCategorySlice.reducer;
