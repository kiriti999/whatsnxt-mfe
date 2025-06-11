import React, { createContext, useContext, useState, type PropsWithChildren } from 'react';
import type { CommentContextValue } from '../types';

// Create the context with a default value
const CommentContext = createContext<CommentContextValue | undefined>(undefined);

// Create the context provider
const CommentContextProvider = ({ children }: PropsWithChildren) => {
    const [showInput, setShowInput] = useState<{ [key: number]: boolean }>({ 1: false });
    const [isOpen, setIsOpen] = useState<{ [key: number]: boolean }>({ 1: false });
    const [isEdit, setIsEdit] = useState<{ [key: number]: boolean }>({ 1: false });
    const [heightCalculateFlag, setHeightCalculateFlag] = useState(false)

    const handleHeightCalculation = () => setHeightCalculateFlag(prev => !prev)

    const setCommentExpand = (id: number, value: boolean, type: 'E' | 'I' | 'O' = 'I') => {
        if (type === 'I') {
            setShowInput(prev => ({ ...prev, [id]: value }));
        }
        if (type === 'O') {
            setIsOpen(prev => ({ ...prev, [id]: value }));
        }
        if (type === 'E') {
            setIsEdit(prev => ({ ...prev, [id]: value }));
        }
    };

    const getCommentExpand = (id: number, type: 'E' | 'I' | 'O' = 'E'): boolean => {
        if (type === 'I') {
            return showInput[id] ?? false;
        }
        if (type === 'O') {
            return isOpen[id] ?? false;
        }
        if (type === 'E') {
            return isEdit[id] ?? false;
        }
        return false;
    };

    return (
        <CommentContext.Provider value={{ heightCalculateFlag, handleHeightCalculation, isEdit, setCommentExpand, getCommentExpand, showInput, isCollepseOpen: isOpen }}>
            {children}
        </CommentContext.Provider>
    );
};


// Create the custom hook to use the context
const useCommentExpandTracker = (): CommentContextValue => {
    const context = useContext(CommentContext);
    if (context === undefined) {
        throw new Error('useCommentExpandTracker must be used within a CommentContextProvider');
    }
    return context;
};

export { CommentContext, CommentContextProvider, useCommentExpandTracker };
