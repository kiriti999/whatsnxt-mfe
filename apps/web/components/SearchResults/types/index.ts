import { CourseType } from '@whatsnxt/core-util';

export interface EnhancedCourse extends CourseType {
    popularity: number;
}

export interface SearchResultsProps {
    coursesPopularity: Array<{ courseId: string; count: number }>;
}


export type SortOption = 'popularity' | 'latest' | 'low-high' | 'high-low';

export const SORT_OPTIONS = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'latest', label: 'Latest' },
    { value: 'low-high', label: 'Price: Low to High' },
    { value: 'high-low', label: 'Price: High to Low' },
] as const;
