import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { cartReducer } from './slices/cartSlice';
import { categoryReducer } from './slices/categorySlice';
import { sidebarReducer } from './slices/sidebarSlice';
import { userReducer } from './slices/userSlice';
import { authReducer } from './slices/authSlice';
import { contentReducer } from './slices/contentSlice';
import { blogCategoryReducer } from './slices/blogCategorySlice';
import { blogSidebarReducer } from './slices/blogSidebarSlice';
import { imageReducer } from './slices/imageSlice';

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        sidebar: sidebarReducer,
        category: categoryReducer,
        user: userReducer,

        auth: authReducer,
        content: contentReducer,
        blogSidebar: blogSidebarReducer,
        blogCategory: blogCategoryReducer,
        image: imageReducer,
    },
    devTools: true
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const makeStore = () => store;
export const wrapper = createWrapper(makeStore);