import React from 'react';
import { Grid } from '@mantine/core';
import { CourseCard } from './CourseCard';
import { EnhancedCourse } from './types';

interface SearchResultsGridProps {
    courses: EnhancedCourse[];
}

export function SearchResultsGrid({ courses }: SearchResultsGridProps) {
    return (
        <Grid gutter={{ base: "md", sm: "lg" }}>
            {courses.map((course) => (
                <Grid.Col
                    key={course.objectID}
                    span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                >
                    <CourseCard course={course} />
                </Grid.Col>
            ))}
        </Grid>
    );
}