'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Define the mapping between paths and index types
const PATH_TO_INDEX_MAP = {
    '/blogs': 'blog',
    '/tutorials': 'tutorial',
    '/': 'course',
    '/courses': 'course',
} as const;

// Helper function to determine index type from pathname
function getIndexTypeFromPath(pathname: string): string {
    // Check exact matches first
    if (pathname in PATH_TO_INDEX_MAP) {
        return PATH_TO_INDEX_MAP[pathname as keyof typeof PATH_TO_INDEX_MAP];
    }

    // Check if pathname starts with any of our defined paths
    for (const [path, indexType] of Object.entries(PATH_TO_INDEX_MAP)) {
        if (path !== '/' && pathname.startsWith(path)) {
            return indexType;
        }
    }

    // Default to course index for root paths
    return 'course';
}

interface SearchContextType {
    indexType: string;
    pathname: string;
    setIndexType: (type: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
    children: ReactNode;
}

export default function SearchProvider({ children }: SearchProviderProps) {
    const pathname = usePathname();
    const [indexType, setIndexType] = useState<string>('course');

    useEffect(() => {
        const newIndexType = getIndexTypeFromPath(pathname);
        setIndexType(newIndexType);
    }, [pathname]);

    const value = {
        indexType,
        pathname,
        setIndexType,
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
}

// Custom hook to use the search context
export function useSearchContext() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearchContext must be used within a SearchProvider');
    }
    return context;
}

// Convenience hook for just getting the index type
export function useIndexType() {
    const { indexType } = useSearchContext();
    return indexType;
}