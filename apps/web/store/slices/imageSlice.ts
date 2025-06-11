import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  image: '',
  loading: true,
  error: '',
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    storeImage: (state, action) => {
      state.image = action.payload;
    },
  },
});
export const { storeImage } = imageSlice.actions;
export const imageReducer = imageSlice.reducer;
