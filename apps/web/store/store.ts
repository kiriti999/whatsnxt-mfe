import { configureStore, ThunkAction, Action, Reducer } from '@reduxjs/toolkit';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import { DiagramState } from 'diagram-core';

// Synchronous store creation for immediate use
const makeStore = () => {
    // Import reducers directly - adjust based on your actual exports
    const cartSlice = require('./slices/cartSlice');
    const categorySlice = require('./slices/categorySlice');
    const sidebarSlice = require('./slices/sidebarSlice');
    const userSlice = require('./slices/userSlice');
    const authSlice = require('./slices/authSlice');
    const contentSlice = require('./slices/contentSlice');
    const blogCategorySlice = require('./slices/blogCategorySlice');
    const blogSidebarSlice = require('./slices/blogSidebarSlice');
    const imageSlice = require('./slices/imageSlice');
    const nestedSidebarSlice = require('./slices/nestedSidebarSlice');
    const { diagramReducer } = require('diagram-core');

    // Extract reducers - try both default and named exports
    const cartReducer = cartSlice.default || cartSlice.cartReducer;
    const categoryReducer = categorySlice.default || categorySlice.categoryReducer;
    const sidebarReducer = sidebarSlice.default || sidebarSlice.sidebarReducer;
    const userReducer = userSlice.default || userSlice.userReducer;
    const authReducer = authSlice.default || authSlice.authReducer;
    const contentReducer = contentSlice.default || contentSlice.contentReducer;
    const blogCategoryReducer = blogCategorySlice.default || blogCategorySlice.blogCategoryReducer;
    const blogSidebarReducer = blogSidebarSlice.default || blogSidebarSlice.blogSidebarReducer;
    const imageReducer = imageSlice.default || imageSlice.imageReducer;
    const nestedSidebarReducer = nestedSidebarSlice.default || nestedSidebarSlice.nestedSidebarReducer;

    return configureStore({
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
            nestedSidebar: nestedSidebarReducer,
            diagram: diagramReducer as Reducer<DiagramState>,
        },
        devTools: process.env.NODE_ENV !== 'production',
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: {
                    ignoredActions: [HYDRATE],
                },
            }),
    });
};

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

// For legacy compatibility - lazy initialization
let _store: AppStore | null = null;
export const store = (() => {
    if (!_store) {
        _store = makeStore();
    }
    return _store;
})();