import { useQuery } from '@tanstack/react-query';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { algoliaSearchByKeyword, type CourseType } from '@whatsnxt/core-util';
import { EnhancedCourse, SearchResultsProps } from '../types';

export function useSearchResults(coursesPopularity: SearchResultsProps['coursesPopularity']) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { push } = useRouter();

    const searchQuery = searchParams.get("q") || "";
    const sortQuery = searchParams.get("sort") || "popularity";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const { data, isLoading, error } = useQuery({
        queryKey: ["search", searchQuery, currentPage],
        queryFn: async () => {
            const result = await algoliaSearchByKeyword<CourseType>(
                process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME as string,
                searchQuery,
                currentPage - 1,
                20,
            );

            const enhancedCourses: EnhancedCourse[] = result.hits.map((course) => ({
                ...course,
                popularity: coursesPopularity.find(p => p.courseId === course.objectID)?.count ?? 0
            }));

            return {
                courses: enhancedCourses,
                totalPages: result.nbPages
            };
        },
        enabled: !!searchQuery,
    });

    const handleSortChange = (value: string | null) => {
        if (!value) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        params.set("page", "1");
        push(`${pathname}?${params.toString()}`);
    };

    const handlePagination = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        push(`${pathname}?${params.toString()}`);
    };

    return {
        data,
        isLoading,
        error,
        searchQuery,
        sortQuery,
        currentPage,
        handleSortChange,
        handlePagination
    };
}