import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SidebarTree } from "../../apis/v1/blog/structuredTutorialApi";

export interface TutorialSidebarState {
    cache: Record<string, SidebarTree>;
    userAccess: Record<string, boolean>;
}

const initialState: TutorialSidebarState = {
    cache: {},
    userAccess: {},
};

const tutorialSidebarSlice = createSlice({
    name: "tutorialSidebar",
    initialState,
    reducers: {
        setSidebarCache: (
            state,
            action: PayloadAction<{ tutorialId: string; data: SidebarTree }>,
        ) => {
            state.cache[action.payload.tutorialId] = action.payload.data;
        },
        setUserAccess: (
            state,
            action: PayloadAction<{ tutorialId: string; hasAccess: boolean }>,
        ) => {
            state.userAccess[action.payload.tutorialId] = action.payload.hasAccess;
        },
    },
});

export const { setSidebarCache, setUserAccess } = tutorialSidebarSlice.actions;
export const tutorialSidebarReducer = tutorialSidebarSlice.reducer;
