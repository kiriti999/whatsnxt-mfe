import { useState } from 'react';
import ReactPlayer from 'react-player';
import { Avatar, Box, Group, Paper, Tabs, Text, Title } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks';
import styles from './lesson.module.css';
import HtmlParser from '../Common/HtmlParse';
import Syllabus from './syllabus';
import Discussion from './discussion';
import LectureLinks from './LectureLinks'
import useAuth from '../../hooks/Authentication/useAuth';
import { useQuery } from '@tanstack/react-query';
import { CoursesEnrolledAPI } from '../../apis/v1/courses/enrolled/enrolled';
import UserFeedBack from './userFeedBack';
import InterviewClient from './InterviewClient';
import { CourseFeedbackAPI } from '../../apis/v1/courses/feedback/feedback';
import CourseContentDisplay from './CourseContentDisplay';
import { lexicalToHtml } from '../../utils/lexicalToHtml';

/**
 * Convert content to HTML for rendering.
 * Handles both Lexical JSON and legacy HTML content.
 */
const toRenderedHtml = (content: string): string => {
    if (!content) return '';
    try {
        const parsed = JSON.parse(content);
        if (parsed?.root) {
            return lexicalToHtml(parsed);
        }
    } catch {
        // Not JSON — treat as HTML
    }
    return content;
};



const LessonPlayer = ({ lessonId, course, courseOverview, videoUrl = '', sections, courseSlug }) => {
    console.log('🚀 :: LessonPlayer :: course:', course)

    const authorName = course?.trainerInfo?.name;
    const authorDesignation = course.trainerInfo?.designation;
    const authorAvatar = course.trainerInfo?.trainerProfilePhoto;
    const about = course.trainerInfo?.about;

    const [activeTab, setActiveTab] = useState<string | null>('about');
    const isDesktop = useMediaQuery('(min-width: 992px)');
    const { user } = useAuth();


    const { data: review = null, isPending } = useQuery({
        queryKey: ["reviews", course._id, user?._id],
        queryFn: () => CourseFeedbackAPI.getUserReviewOnCourse(course._id, user?._id)
    })

    // Assume video URLs come from the sections prop
    const videoUrls = sections.flatMap((section) => section.videos.map((video) => video.videoUrl));
    console.log('🚀 :: LessonPlayer :: videoUrls:', videoUrls)
    const lessonIds = sections.flatMap((section) => section.videos.map((video) => video._id));
    const lectureLinks = sections.flatMap((section) => section.videos.map((video) => video.lectureLinks));
    const [currentVideoIndex, setCurrentVideoIndex] = useState(
        Math.max(0, videoUrls.indexOf(videoUrl))
    );

    // State for maintaing video auto starts
    const [play, setPlay] = useState<boolean>(false)

    const handleVideoEnd = async () => {
        await CoursesEnrolledAPI.updateCourseProgress({
            userId: user?._id,
            courseId: course._id,
            lessonId: lessonIds[currentVideoIndex]
        })
        if (currentVideoIndex + 1 < videoUrls.length) {
            setCurrentVideoIndex(currentVideoIndex + 1);
        } else {
            console.log('All videos completed!');
        }
    };

    return (
        <div className={`${styles['left-side']}`}>
            {lessonId === 'review' && !isPending ? (
                <Box h={500}>
                    <UserFeedBack courseId={course._id} userId={user._id} reviewComment={review} />
                </Box>
            ) : (
                <Paper withBorder>
                    <ReactPlayer
                        url={videoUrls[currentVideoIndex]} // Dynamically update the video URL
                        light={videoUrls[currentVideoIndex]?.includes('youtube.com') || videoUrls[currentVideoIndex]?.includes('youtu.be') ? true : videoUrls[currentVideoIndex] + "&poster=true"}
                        playing={play}
                        onClickPreview={() => { setPlay(true) }}
                        width="100%"
                        height="500px"
                        controls={true}
                        volume={1}
                        autoPlay
                        onEnded={handleVideoEnd} // Trigger next video on end
                    />
                </Paper>
            )}
            <Tabs value={activeTab} defaultValue={activeTab} keepMounted={false} onChange={setActiveTab} className={styles['tabs']}>
                <Tabs.List>
                    <Tabs.Tab value="about" fw={600}>About</Tabs.Tab>
                    {!isDesktop && <Tabs.Tab value="syllabus" fw={600}>Syllabus</Tabs.Tab>}
                    {lessonId !== 'review' && <Tabs.Tab value="discussions" fw={600}>Discussions</Tabs.Tab>}
                    <Tabs.Tab value="interview" fw={600}>Interview</Tabs.Tab>
                    {lectureLinks?.[currentVideoIndex]?.length > 0 &&
                        <Tabs.Tab value="links" fw={600}>Links</Tabs.Tab>
                    }
                </Tabs.List>
                <Tabs.Panel value="about" className={styles['tabs-panel']}>

                    <Title order={4}>About Course</Title>
                    {/* TODO: Add line clamp */}
                    <HtmlParser content={toRenderedHtml(courseOverview)} withOptions />

                    {/* Structured Course Content - Sections, Comparisons, Collapsibles, Resources */}
                    <CourseContentDisplay courseId={course.courseId || course._id} />
                </Tabs.Panel>
                {!isDesktop && (
                    <Tabs.Panel value="syllabus" className={styles['tabs-panel']}>
                        <Syllabus sections={sections} courseSlug={courseSlug} />
                    </Tabs.Panel>
                )}
                <Tabs.Panel value="interview" className={styles['tabs-panel']}>
                    <InterviewClient course={course} />
                </Tabs.Panel>
                <Tabs.Panel value="discussions" className={styles['tabs-panel']}>
                    <Discussion lessonId={lessonId} />
                </Tabs.Panel>
                {lectureLinks?.[currentVideoIndex]?.length > 0 &&
                    <>
                        <Tabs.Panel value="links" className={styles['tabs-panel']}>
                            <LectureLinks linkAr={lectureLinks?.[currentVideoIndex]} />
                        </Tabs.Panel>
                    </>
                }
            </Tabs>
        </div>
    );
};


export default LessonPlayer;
