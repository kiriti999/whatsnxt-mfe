'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Grid, Group, Radio, Stack, Title, Text as MantineText, useMantineColorScheme } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, useForm } from "react-hook-form";
import { CourseBuilderAPI } from "../../../../apis/v1/courses/course-builder/course-builder-api";
import { useDashboardContext } from "../../../../context/DashboardContext";
import { revalidate } from "../../../../server-actions";

type Payload = {
	courseType: string;
};

type Props = {
	courseId: string;
	cType: string;
};

const CourseTypeForm = ({ courseId, cType }: Props) => {
	const [loading, setLoading] = useState(false);
	const [disabledButton, setDisabledButton] = useState(true);
	const [courseType, setCourseType] = useState(cType);
	const { enabledSections, setEnabledSections } = useDashboardContext();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const CURRENT_PAGE_PATH = useMemo(() => `/trainer/course/course-type-information/${courseId}`, [courseId]);
	const NEXT_PAGE_PATH = useMemo(() => `/trainer/course/pricing-information/${courseId}`, [courseId]);
	const router = useRouter();

	const { handleSubmit, control, formState: { isValid, isDirty } } = useForm({
		mode: 'onChange',
		defaultValues: {
			courseType,
		},
	});

	useEffect(() => {
		setDisabledButton(!isValid || !isDirty);
	}, [isValid, isDirty]);

	useEffect(() => {
		// enable timeline next section when this condition is true
		if (cType !== "false") {
			setEnabledSections(prev => {
				const temp = new Set(prev);
				if (!temp.has(1)) {
					temp.add(1);
				}
				return temp;
			})
		}
	}, [cType]);

	const handleCourseTypeSubmit = async (payload: Payload) => {
		try {
			setLoading(true)
			const response = await CourseBuilderAPI.updateCourseType(courseId, payload);

			if (response.courseType) {
				notifications.show({
					position: 'bottom-right',
					title: 'Course Type Updated',
					message: 'Course Type successfully updated.',
					color: 'green',
				});

				// revalidate current path to get updated courseType and navigate to the next page
				await revalidate(CURRENT_PAGE_PATH);
				await revalidate(NEXT_PAGE_PATH);
				router.push(NEXT_PAGE_PATH);

				// Update the courseData with the response's updated course
				console.log('Course type updated successfully:', response.courseType);
			}
		} catch (error) {
			notifications.show({
				position: 'bottom-right',
				title: 'Course Type Updated',
				message: 'Something went wrong',
				color: 'red',
			});
			console.error('Error updating course type:', error);
		} finally {
			setLoading(false)
		}
	};

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<form onSubmit={handleSubmit(handleCourseTypeSubmit)}>
				<Stack>
					<Title order={4} mb="md">Select your course type</Title>
					<Controller
						name="courseType"
						control={control}
						rules={{ required: 'courseType is required' }}
						render={({ field }) => (
							<Grid gutter="md">
								{['paid', 'free'].map((type) => {
									const isSelected = field.value === type;
									return (
										<Grid.Col span={{ base: 12, sm: 6 }} key={type}>
											<Card
												shadow={isSelected ? "md" : "xs"}
												radius="md"
												withBorder
												style={{
													cursor: 'pointer',
													borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
													backgroundColor: isSelected
														? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
														: (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'),
													transition: 'all 0.2s ease'
												}}
												onClick={() => {
													setCourseType(type);
													field.onChange(type);
												}}
											>
												<Group justify="space-between" align="start" mb="xs">
													<Title order={5} style={{ textTransform: 'capitalize' }}>
														{type} Course
													</Title>
													<Radio
														checked={isSelected}
														onChange={() => { }}
														value={type}
														tabIndex={-1}
														style={{ pointerEvents: 'none' }}
													/>
												</Group>
												<MantineText
													size="sm"
													c={isSelected ? "white" : (isDark ? "gray.4" : "dimmed")}
												>
													{type === 'paid'
														? "Earn money by selling your expertise. Set a price and get paid for every student."
														: "Attract a larger audience by offering free content. Great for building your reputation."}
												</MantineText>
											</Card>
										</Grid.Col>
									);
								})}
							</Grid>
						)}
					/>

					<Group justify="flex-end">
						<Button type="submit" disabled={disabledButton} mt="md" loading={loading}>
							Save
						</Button>
					</Group>
				</Stack>
			</form>
		</Card>
	)
}

export default CourseTypeForm