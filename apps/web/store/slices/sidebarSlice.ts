import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SidebarAPI } from '../../api/v1';

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
      listed: false,
      published: false
    },
  ],
  loading: true,
  error: '',
};

export const getPopular = createAsyncThunk(
  'blog/popular',
  async () => {
    const data = await SidebarAPI.getPopular()
    return data;
  },
);

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(getPopular.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        getPopular.fulfilled,
        (
          state: { articles: any; loading: boolean; error: string },
          action: { payload: any },
        ) => {
          console.log(' sidebar action:', action)
          state.articles = action.payload;
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        getPopular.rejected,
        (
          state: { loading: boolean; articles: never[]; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.articles = [];
          state.error = action.error.message;
        },
      );
  },
});
export const sidebarReducer = sidebarSlice.reducer;
