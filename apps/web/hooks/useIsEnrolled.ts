import { useQuery } from "@tanstack/react-query";
import useAuth from "./Authentication/useAuth";
import { CoursesEnrolledAPI } from "../apis/v1/courses/enrolled/enrolled";

export function useIsEnrolled(courseId: string) {
    const { user } = useAuth();
    const isAuthenticated = !!user;

    const { data: isEnrolled, isLoading: isFetching, refetch } = useQuery({
        queryKey: ['isEnrolled', courseId, user?._id],
        queryFn: async () => {
            if (!courseId || !user?._id) return false;
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
        // Only run the query if courseId exists AND user is logged in
        enabled: !!courseId && isAuthenticated
    });

    return {
        isEnrolled: isAuthenticated ? !!isEnrolled : false,
        isFetching,
        refetch
    };
}