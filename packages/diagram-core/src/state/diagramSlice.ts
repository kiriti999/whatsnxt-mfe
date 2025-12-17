import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Shape {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    properties: Record<string, any>;
}

export interface DiagramState {
    shapes: Record<string, Shape>;
}

const initialState: DiagramState = {
    shapes: {},
};

const diagramSlice = createSlice({
    name: 'diagram',
    initialState,
    reducers: {
        addShape: (state, action: PayloadAction<Shape>) => {
            state.shapes[action.payload.id] = action.payload;
        },
        removeShape: (state, action: PayloadAction<string>) => {
            delete state.shapes[action.payload];
        },
        updateShape: (state, action: PayloadAction<{ id: string; changes: Partial<Shape> }>) => {
            const { id, changes } = action.payload;
            if (state.shapes[id]) {
                state.shapes[id] = { ...state.shapes[id], ...changes };
            }
        },
    },
});

export const { addShape, removeShape, updateShape } = diagramSlice.actions;
export const diagramReducer = diagramSlice.reducer;

// Selectors
export const selectShapes = (state: { diagram: DiagramState }) => state.diagram.shapes;
