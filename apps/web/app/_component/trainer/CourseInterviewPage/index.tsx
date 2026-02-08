"use client";

import React, { useEffect } from 'react';
import { Grid, Container } from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import Dashboard from '../../../../components/Trainer/Dashboard';
import { DashboardContextProvider } from '../../../../context/DashboardContext';
import InterviewSection from './InterviewSection';
import { useDisclosure } from '@mantine/hooks';

type Props = {
	id?: string;
	courseType?: string;
	courseName?: string;
	teacherName?: string;
};

const CourseInterviewPage: React.FC<Props> = ({ id, courseType: cType, courseName, teacherName }) => {
	const [isVisible, { open, close }] = useDisclosure(true);

	useEffect(() => {
		close()
	}, []);
	
	return (
		<DashboardContextProvider>
			<FullPageOverlay visible={isVisible} />
			<Container mb="xl" fluid px={'10%'} mt={80}>
				<Grid>
					<Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
						<Dashboard open={open} close={close} id={id} courseName={courseName} teacherName={teacherName} />
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
						<InterviewSection cType={cType} courseId={id} />
					</Grid.Col>
				</Grid>
			</Container>
		</DashboardContextProvider>
	);
}

export default CourseInterviewPage;
