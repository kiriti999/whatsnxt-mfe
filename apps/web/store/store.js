import { configureStore } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { cartReducer } from './slices/cartSlice';
import { categoryReducer } from './slices/categorySlice';
import { sidebarReducer } from './slices/sidebarSlice';
import { userReducer } from './slices/userSlice';

const store = configureStore({
    reducer: {
        cart: cartReducer,
        sidebar: sidebarReducer,
        category: categoryReducer,
        user: userReducer
    },
    devTools: true
})

const makeStore = () => store;
export const wrapper = createWrapper(makeStore);
export default store;