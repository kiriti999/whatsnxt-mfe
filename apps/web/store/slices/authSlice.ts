import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthAPI } from '../../apis/v1/auth';

const initialState = {
  email: '',
  loading: true,
  error: '',
};

const signup = createAsyncThunk(
  'signup',
  async (payload: any) => await AuthAPI.createAccount(payload),
);
const logout = createAsyncThunk(
  'logout',
  async () => await AuthAPI.logout(),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder: { addCase: any }) => {
    builder
      .addCase(signup.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        signup.fulfilled,
        (
          state: { email: any; loading: boolean; error: string },
          action: { payload: { email: string } },
        ) => {
          state.email = action.payload.email;
          localStorage.setItem('email', action.payload.email);
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        signup.rejected,
        (
          state: { loading: boolean; email: string; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.email = '';
          state.error = action.error.message;
        },
      )
      .addCase(logout.pending, (state: { loading: boolean }) => {
        state.loading = true;
      })
      .addCase(
        logout.fulfilled,
        (
          state: { email: any; loading: boolean; error: string },
          action: { payload: { email: any } },
        ) => {
          state.email = action.payload.email;
          localStorage.removeItem('email');
          state.loading = false;
          state.error = '';
        },
      )
      .addCase(
        logout.rejected,
        (
          state: { loading: boolean; email: string; error: any },
          action: { error: { message: any } },
        ) => {
          state.loading = false;
          state.email = '';
          state.error = action.error.message;
        },
      );
  },
});
export const authReducer = authSlice.reducer;
