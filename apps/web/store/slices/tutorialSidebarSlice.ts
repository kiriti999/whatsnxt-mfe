import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SidebarTree } from '../../apis/v1/blog/structuredTutorialApi';

export interface TutorialSidebarState {
    cache: Record<string, SidebarTree>;
}

const initialState: TutorialSidebarState = {
    cache: {},
};

const tutorialSidebarSlice = createSlice({
    name: 'tutorialSidebar',
    initialState,
    reducers: {
        setSidebarCache: (state, action: PayloadAction<{ tutorialId: string; data: SidebarTree }>) => {
            state.cache[action.payload.tutorialId] = action.payload.data;
        },
    },
});

export const { setSidebarCache } = tutorialSidebarSlice.actions;
export const tutorialSidebarReducer = tutorialSidebarSlice.reducer;
