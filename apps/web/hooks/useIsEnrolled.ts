import { useQuery } from "@tanstack/react-query";
import { CoursesEnrolledAPI } from "../apis/v1/courses/enrolled/enrolled";

export function useIsEnrolled(courseId: string) {
    const { data: isEnrolled, isLoading: isFetching, refetch } = useQuery({
        queryKey: ['isEnrolled', courseId],
        queryFn: async () => {
            if (!courseId) return false;
            try {
                const response = await CoursesEnrolledAPI.isEnrolled({ courseId });
                if (response?.data?.message === "useIsEnrolled:: No authorization token") {
                    return false;
                }
                return response.data;
            } catch (error) {
                console.log("Error fetching enrollment status:", error);
                return false;
            }
        },
        // Ensure it refetches when needed
        staleTime: 0,
        // Don't refetch on window focus as it can be disruptive
        refetchOnWindowFocus: false,
        // Only run the query if courseId exists
        enabled: !!courseId
    });

    return {
        isEnrolled: !!isEnrolled,
        isFetching,
        refetch
    };
}