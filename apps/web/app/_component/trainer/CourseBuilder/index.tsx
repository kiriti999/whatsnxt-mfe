"use client";

import React, { useEffect } from "react";
import { Container, Grid, LoadingOverlay } from "@mantine/core";
import Curriculum from "./Curriculum";
import type { CourseBuilderProps } from '../types';
import Dashboard from "../../../../components/Trainer/Dashboard";
import { DashboardContextProvider } from "../../../../context/DashboardContext";
import { useDisclosure } from "@mantine/hooks";

const CourseBuilder: React.FC<CourseBuilderProps> = ({ id, courseData }) => {
    const [isVisible, { open, close }] = useDisclosure(true);

    useEffect(() => {
        close()
    }, [])
    
    return (
        <DashboardContextProvider>
            <LoadingOverlay visible={isVisible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Container mb="xl" fluid px={"10%"}>
                <Grid>
                    <Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
                        <Dashboard id={id} open={open} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
                        {/* Parent Box to contain all sections and "+ Section" button */}
                        <Curriculum courseId={id} courseWithSections={courseData?.courseWithSections} />
                    </Grid.Col>
                </Grid>
            </Container>
        </DashboardContextProvider>
    );
};

export default CourseBuilder;
