import React from 'react';
import { Box } from '@mantine/core';
import TopCourses from '../../../components/TopCourses/TopCourses';
import { CourseType } from '@whatsnxt/core-util';

interface SimilarCoursesProps {
    courses: CourseType[];
}

const SimilarCourses: React.FC<SimilarCoursesProps> = ({ courses }) => {
    if (!courses || courses.length === 0) return null;

    return (
        <Box mt={50}>
            <TopCourses
                courses={courses}
                total={courses.length}
                title="You Might Also Like"
            />
        </Box>
    );
};

export default SimilarCourses;
