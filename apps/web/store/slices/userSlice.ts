import { createSlice, PayloadAction, Reducer } from '@reduxjs/toolkit';

// Types
export interface UserState {
    userToken: string | null;
    userObject: any | null; // You can define a more specific User interface here
}

// Initial state
const initialState: UserState = {
    userToken: null,
    userObject: null
};

// User slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUserInfo: (state, action: PayloadAction<any>) => {
            state.userObject = action.payload;
        },

        setUserToken: (state, action: PayloadAction<string>) => {
            state.userToken = action.payload;
        },

        setUser: (state, action: PayloadAction<{ userToken?: string; userObject?: any }>) => {
            if (action.payload.userToken !== undefined) {
                state.userToken = action.payload.userToken;
            }
            if (action.payload.userObject !== undefined) {
                state.userObject = action.payload.userObject;
            }
        },

        logout: (state) => {
            state.userToken = null;
            state.userObject = null;
        }
    }
});

// Export actions
export const {
    updateUserInfo,
    setUserToken,
    setUser,
    logout
} = userSlice.actions;

// Export reducer with explicit type annotation
export const userReducer: Reducer<UserState> = userSlice.reducer;

// Selectors
export const selectUserToken = (state: { user: UserState }): string | null =>
    state.user.userToken;

export const selectUserObject = (state: { user: UserState }): any | null =>
    state.user.userObject;

export const selectIsAuthenticated = (state: { user: UserState }): boolean =>
    !!state.user.userToken;

// Default export
const reducer: Reducer<UserState> = userSlice.reducer;
export default reducer;