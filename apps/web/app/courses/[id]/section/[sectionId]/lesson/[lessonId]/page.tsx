import { notFound } from 'next/navigation';
import Lesson from '../../../../../../../components/Lesson';
import { fetchCourseBySlug, fetchVideosBySection } from '../../../../../../../fetcher/courseServerQuery';

type LessonPageParams = {
    id: string; // Course slug
    sectionId: string;
    lessonId: string;
};

type LessonPageProps = {
    params: Promise<LessonPageParams>;
};


export default async function LessonPage({ params }: LessonPageProps) {
    try {
        const resolvedParams = await params;
        const { id: courseSlug, sectionId, lessonId } = resolvedParams;

        // Validate parameters - check for 'undefined' string (from invalid URLs)
        if (!sectionId || sectionId === 'undefined' || !lessonId || lessonId === 'undefined') {
            console.error('Invalid section or lesson ID');
            return notFound();
        }

        // Fetch course by slug
        const course = await fetchCourseBySlug(courseSlug);
        if (!course) {
            console.error('Course not found');
            return notFound();
        }

        // Special case: 'review' lessonId is for the Rate & Review page
        const isReview = lessonId === 'review';

        let currentLesson = null;
        if (!isReview) {
            // Fetch videos by section
            const videos = await fetchVideosBySection(sectionId);
            if (!videos || !Array.isArray(videos) || videos.length === 0) {
                console.error('No videos found for the section');
                return notFound();
            }

            // Find the current lesson
            currentLesson = videos.find((item) => item._id === lessonId);
            if (!currentLesson) {
                console.error('Lesson not found');
                return notFound();
            }
        }

        // Render the Lesson component
        return (
            <Lesson
                sections={course.sections}
                courseOverview={course.overview}
                courseSlug={course.slug}
                lesson={currentLesson}
                lessonId={lessonId}
                course={course}
            />
        );
    } catch (error) {
        console.error('An error occurred in LessonPage:', error);
        return notFound();
    }
}
