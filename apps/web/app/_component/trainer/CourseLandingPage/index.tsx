"use client";

import React, { useEffect } from 'react';
import { Grid, Container, LoadingOverlay } from '@mantine/core';
import Dashboard from '../../../../components/Trainer/Dashboard';
import { DashboardContextProvider } from '../../../../context/DashboardContext';
import Main from './Main';
import { useDisclosure } from '@mantine/hooks';

type Course = {
    imageUrl?: File | string;
    overview: string;
    course_preview_video: string;
    topics?: string;
    languages: string[];
    categoryName: string;
    subCategoryName?: string;
    nestedSubCategoryName?: string;
};

type CourseWithSections = {
    _id?: string;
    courseName: string;
    languageIds: any[]
} & Course;

type CourseLandingPageProps = {
    id?: string;
    courseData?: {
        courseWithSections: CourseWithSections;
    };
};

const CourseLandingPage: React.FC<CourseLandingPageProps> = ({ id, courseData }) => {
    const [isVisible, { open, close }] = useDisclosure(true);

    useEffect(() => {
        close();
    }, [close]);

    return (
        <DashboardContextProvider>
            <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <div className="pb-100">
                <Container mb="xl" fluid px={'10%'}>
                    <Grid>
                        <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                            <Dashboard id={id} open={open} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                            <Main courseId={id} courseWithSections={courseData?.courseWithSections} />
                        </Grid.Col>
                    </Grid>
                </Container>
            </div>
        </DashboardContextProvider>
    );
}

export default CourseLandingPage;