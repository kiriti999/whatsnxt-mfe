import { FC } from 'react';
import { StructuredData } from './StructuredData';
import { generateCourseSchema, Course } from '../../utils/structuredData';
import React from 'react';

interface CourseStructuredDataProps {
    course: Course;
}

export const CourseStructuredData: FC<CourseStructuredDataProps> = ({ course }) => {
    const schema = generateCourseSchema(course);
    return <StructuredData data={schema} />;
};