import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ContentAPI } from '../../apis/v1/blog';

const initialState = {
  articles: [
    {
      _id: '',
      title: '',
      slug: '',
      description: '',
      categoryName: '',
      imageUrl: '',
      author: '',
      updatedAt: '',
      tutorial: false,
      listed: false
    },
  ],
  tutorials: [], // Added missing tutorials property
  currentTag: null,
  totalCount: 0,
  loading: true,
  error: '',
};

export const getPosts: any = createAsyncThunk(
  'blog/posts',
  async ({ start = 1, limit = 10, type = 'both' }: any) => {
    return await ContentAPI.getPosts(start, limit, type);
  },
);

export const getPostsByCategory = createAsyncThunk(
  'category/posts/category',
  async (categoryName: string) =>
    await ContentAPI.getPostsByCategory(categoryName),
);

export const getTutorials: any = createAsyncThunk(
  'tutorial/getTutorials',
  async ({ start = 1, limit = 10, type = 'tutorial' }: any) => {
    return await ContentAPI.getTutorials(start, limit, type);
  },
);

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setSelectTag: (state, action) => {
      state.currentTag = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    builder
      .addCase(getPosts.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        getPosts.fulfilled,
        (
          state: { totalCount: any, articles: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          state.articles = action.payload?.data?.posts || action.payload || [];
          state.totalCount = action.payload?.data?.totalRecords || action.payload?.totalRecords || 0;
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getPosts.rejected,
        (
          state: { loading: boolean; articles: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.articles = [];
          state.error = action.error.message;
        },
      )
      .addCase(getPostsByCategory.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        getPostsByCategory.fulfilled,
        (
          state: { articles: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          state.articles = action.payload as any;
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getPostsByCategory.rejected,
        (
          state: { loading: boolean; articles: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.articles = [];
          state.error = action.error.message;
        },
      )
      .addCase(getTutorials.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        getTutorials.fulfilled,
        (
          state: { tutorials: any; articles: any; totalCount: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          console.log('getTutorials fulfilled - action.payload:', action.payload);

          // The payload is already an array of tutorials
          const tutorialsData = Array.isArray(action.payload) ? action.payload : [];
          const totalRecords = tutorialsData.length; // Use array length as totalRecords

          console.log('Setting tutorials data:', tutorialsData);
          console.log('Setting totalRecords:', totalRecords);

          state.tutorials = tutorialsData;
          state.articles = tutorialsData; // Also update articles for unified access
          state.totalCount = totalRecords;
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getTutorials.rejected,
        (
          state: { loading: boolean; tutorials: never[]; articles: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.tutorials = [];
          state.articles = [];
          state.error = action.error.message;
        },
      );
  },
});

export const { setSelectTag } = contentSlice.actions;
export const contentReducer = contentSlice.reducer;