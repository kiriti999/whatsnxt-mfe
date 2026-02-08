"use client";

import React, { useEffect } from 'react';
import { Grid, Container } from '@mantine/core';
import { FullPageOverlay } from '@/components/Common/FullPageOverlay';
import Dashboard from '../../../../components/Trainer/Dashboard';
import { DashboardContextProvider } from '../../../../context/DashboardContext';
import PriceInformationForm from './PriceInformationForm';
import { useDisclosure } from '@mantine/hooks';

type CourseWithSections = {
	_id?: string;
	courseType?: string;
	price?: number;
	paidType?: 'video' | 'live';
};

type PricingPageProps = {
	id?: string;
	courseData?: {
		courseWithSections: CourseWithSections;
	};
};

const PricingInformation: React.FC<PricingPageProps> = ({ id, courseData }) => {
	const [isVisible, { open, close }] = useDisclosure(true);

	useEffect(() => {
		close()
	}, [])

	return (
		<DashboardContextProvider>
			<FullPageOverlay visible={isVisible} />
			<Container mb="xl" fluid px={'10%'} mt={80}>
				<Grid>
					<Grid.Col span={{ base: 12, md: 4, lg: 3 }}>
						<Dashboard id={id} open={open} />
					</Grid.Col>
					<Grid.Col span={{ base: 12, md: 8, lg: 9 }}>
						<PriceInformationForm courseId={id} courseWithSections={courseData?.courseWithSections} />
					</Grid.Col>
				</Grid>
			</Container>
		</DashboardContextProvider>
	);
}

export default PricingInformation;
