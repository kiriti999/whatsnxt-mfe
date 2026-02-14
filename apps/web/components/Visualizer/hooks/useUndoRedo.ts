'use client';

import { useCallback, useRef, useState } from 'react';
import type { DiagramData } from '../types';

const MAX_HISTORY = 50;

/**
 * Custom hook for undo/redo functionality on DiagramData.
 * Maintains a history stack of immutable snapshots.
 */
export function useUndoRedo(initialData: DiagramData | null) {
    const [history, setHistory] = useState<DiagramData[]>(initialData ? [initialData] : []);
    const [pointer, setPointer] = useState(initialData ? 0 : -1);

    const canUndo = pointer > 0;
    const canRedo = pointer < history.length - 1;
    const current = pointer >= 0 ? history[pointer] : null;

    /** Push a new snapshot to the stack (discards any forward history). */
    const pushState = useCallback((data: DiagramData) => {
        setHistory((prev) => {
            const newHistory = prev.slice(0, pointer + 1);
            newHistory.push(structuredClone(data));
            if (newHistory.length > MAX_HISTORY) newHistory.shift();
            return newHistory;
        });
        setPointer((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    }, [pointer]);

    const undo = useCallback((): DiagramData | null => {
        if (!canUndo) return current;
        const newPointer = pointer - 1;
        setPointer(newPointer);
        return history[newPointer];
    }, [canUndo, pointer, history, current]);

    const redo = useCallback((): DiagramData | null => {
        if (!canRedo) return current;
        const newPointer = pointer + 1;
        setPointer(newPointer);
        return history[newPointer];
    }, [canRedo, pointer, history, current]);

    /** Reset with new data (clears history). */
    const reset = useCallback((data: DiagramData) => {
        setHistory([structuredClone(data)]);
        setPointer(0);
    }, []);

    return { current, canUndo, canRedo, pushState, undo, redo, reset };
}
