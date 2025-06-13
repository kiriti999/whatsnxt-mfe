import { EnhancedCourse, SortOption } from './types';

export function sortCourses(courses: EnhancedCourse[], sortBy: string): EnhancedCourse[] {
    return [...courses].sort((a, b) => {
        switch (sortBy as SortOption) {
            case 'popularity':
                return b.popularity - a.popularity;
            case 'latest':
                return new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf();
            case 'low-high':
                return a.price! - b.price!;
            case 'high-low':
                return b.price! - a.price!;
            default:
                return 0;
        }
    });
}