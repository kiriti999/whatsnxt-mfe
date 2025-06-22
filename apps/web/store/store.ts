import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { cartReducer } from './slices/cartSlice';
import { categoryReducer } from './slices/categorySlice';
import { sidebarReducer } from './slices/sidebarSlice';
import { userReducer } from './slices/userSlice';
import { authReducer } from './slices/authSlice';
import { contentReducer } from './slices/contentSlice';
import { blogCategoryReducer } from './slices/blogCategorySlice';
import { blogSidebarReducer } from './slices/blogSidebarSlice';
import { imageReducer } from './slices/imageSlice';

// Create the store configuration
const makeStore = () =>
    configureStore({
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
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    // Ignore these action types for serialization checks
                    ignoredActions: [HYDRATE],
                },
            }),
    });

// Export store type
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;

// Create wrapper
export const wrapper = createWrapper<AppStore>(makeStore, {
    debug: process.env.NODE_ENV === 'development',
});

// For legacy compatibility (if needed)
export const store = makeStore();