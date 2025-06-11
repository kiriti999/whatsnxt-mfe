import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SidebarAPI } from '../../api/v1/sidebarApi';

const initialState = {
    articles: [{
        _id: "",
        title: "",
        slug: "",
        description: "",
        categoryName: "",
        categoryImage: "",
        author: "",
        updatedAt: ""
    }],
    loading: true,
    error: ''
};

const getPopular =
    createAsyncThunk('blog/popular', async () => await SidebarAPI.getPopular());

const sidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {},
    extraReducers: (builder: any) => {
        builder
            .addCase(getPopular.pending, (state: { loading: boolean; }) => {
                state.loading = true;
            })
            .addCase(getPopular.fulfilled, (state: { articles: any; loading: boolean; error: string; }, action: { payload: any; }) => {
                state.articles = action.payload;
                state.loading = false;
                state.error = '';
            })
            .addCase(getPopular.rejected, (state: { loading: boolean; articles: never[]; error: any; }, action: { error: { message: any; }; }) => {
                state.loading = false;
                state.articles = [];
                state.error = action.error.message
            })
    },
});
export const sidebarReducer = sidebarSlice.reducer