'use client';

import React, { useEffect } from 'react';
import { Container, Grid, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Dashboard from '../../../../components/Trainer/Dashboard';
import { DashboardContextProvider } from '../../../../context/DashboardContext';
import CourseContentEditor from './CourseContentEditor';

interface CourseContentPageProps {
    id: string;
    courseData: any;
}

const CourseContentPage: React.FC<CourseContentPageProps> = ({ id, courseData }) => {
    const [isVisible, { open, close }] = useDisclosure(true);

    useEffect(() => {
        close();
    }, []);

    return (
        <DashboardContextProvider>
            <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
            <Container mb="xl" fluid px="10%" mt={80}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Dashboard id={id} open={open} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        <CourseContentEditor courseId={id} />
                    </Grid.Col>
                </Grid>
            </Container>
        </DashboardContextProvider>
    );
};

export default CourseContentPage;
