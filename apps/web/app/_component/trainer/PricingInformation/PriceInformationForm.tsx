'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text, Title, Group, Card, Stack, Grid, Radio, NumberInput, Button, Box, Badge, useMantineColorScheme } from '@mantine/core';
import { IconVideo, IconBroadcast, IconChevronRight } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Controller, useForm } from 'react-hook-form';
import { CourseBuilderAPI } from '../../../../apis/v1/courses/course-builder/course-builder-api';
import { useDashboardContext } from '../../../../context/DashboardContext';
import { revalidate } from '../../../../server-actions';

type Payload = {
	courseType: 'paid' | 'free';
	paidType: 'video' | 'live';
	price: number;
	lessons?: number;
};

const PriceInformationForm = ({ courseId, courseWithSections }) => {
	const [loading, setLoading] = useState(false);
	const [disabledButton, setDisabledButton] = useState(true);
	const [courseType, setCourseType] = useState(courseWithSections.courseType);
	const { setEnabledSections } = useDashboardContext();
	const { colorScheme } = useMantineColorScheme();
	const isDark = colorScheme === 'dark';

	const CURRENT_PAGE_PATH = useMemo(() => `/trainer/course/pricing-information/${courseId}`, [courseId]);
	const NEXT_PAGE_PATH = useMemo(() => `/trainer/course/course-builder/${courseId}`, [courseId]);
	const router = useRouter();

	const { handleSubmit, control, watch, formState: { isValid, isDirty, errors } } = useForm({
		mode: 'onChange',
		defaultValues: {
			courseType: courseWithSections.courseType,
			paidType: courseWithSections.paidType || null,
			price: courseWithSections.price || null,
			lessons: courseWithSections.lessons,
		},
	});

	const paidType = watch('paidType');

	const validationOptions = {
		price: {
			validate: (value) => {
				if (courseType === 'paid') {
					return value > 0;
				}
			},
		},
		paidType: { required: 'paidType field is required!' },
		lessons: {
			validate: (value) => value > 0,
		},
	};

	useEffect(() => {
		setDisabledButton(!isValid || !isDirty);
	}, [isValid, isDirty]);

	useEffect(() => {
		const { price, courseType } = courseWithSections;
		// if the current condition is true, enable timline next section, otherwise it is disabled
		if (courseType === 'free' || price) {
			setEnabledSections(prev => {
				const temp = new Set(prev);
				if (!temp.has(2)) {
					temp.add(1);
					temp.add(2);
				}
				return temp;
			})
		}
	}, [courseWithSections.courseType, courseWithSections.price])

	const handlePriceInfoSubmit = async (payload: Payload) => {
		try {
			setLoading(true)
			await CourseBuilderAPI.updateCoursePricing(courseId, payload);
			notifications.show({
				position: 'bottom-right',
				title: 'Price info Update',
				message: 'Course price successfully updated.',
				color: 'green',
			});

			// revalidate current path to get updated courseType
			await revalidate(CURRENT_PAGE_PATH);
			router.push(NEXT_PAGE_PATH);

			console.log('Course pricing updated successfully:', payload);
			// Optional: Display success notification or update UI
		} catch (error) {
			console.error('Error updating course pricing:', error);
			// Optional: Display error notification
			notifications.show({
				position: 'bottom-right',
				title: 'Price info Update',
				message: 'Something went wrong.',
				color: 'gred',
			});
		} finally {
			setLoading(false)
		}
	};

	return (
		<Card shadow="sm" padding="lg" radius="md" withBorder>
			<form onSubmit={handleSubmit(handlePriceInfoSubmit)}>
				<Stack gap="xl">
					<Box>
						<Title order={4} mb="md">Your selected course type</Title>
						<Controller
							name="courseType"
							control={control}
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
													padding="md"
													style={{
														borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
														backgroundColor: isSelected
															? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
															: (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'),
														opacity: isSelected ? 1 : 0.7,
														cursor: 'default'
													}}
												>
													<Group justify="space-between" align="start">
														<Title order={5} style={{ textTransform: 'capitalize' }}>
															{type} Course
														</Title>
														{isSelected && <Badge color="blue" variant="light">Selected</Badge>}
													</Group>
												</Card>
											</Grid.Col>
										);
									})}
								</Grid>
							)}
						/>
					</Box>

					{courseType === 'paid' && (
						<Box>
							<Title order={4} mb="md">Select paid type</Title>
							<Controller
								name="paidType"
								control={control}
								rules={validationOptions.paidType}
								render={({ field }) => (
									<Grid gutter="md">
										{['video', 'live'].map((type) => {
											const isSelected = field.value === type;
											return (
												<Grid.Col span={{ base: 12, sm: 6 }} key={type}>
													<Card
														shadow={isSelected ? "md" : "xs"}
														radius="md"
														withBorder
														padding="md"
														style={{
															cursor: 'pointer',
															borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
															backgroundColor: isSelected
																? (isDark ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-blue-0)')
																: (isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)'),
															transition: 'all 0.2s ease'
														}}
														onClick={() => field.onChange(type)}
													>
														<Group justify="space-between" align="center">
															<Group>
																{type === 'video'
																	? <IconVideo size={24} color={isSelected ? "white" : undefined} />
																	: <IconBroadcast size={24} color={isSelected ? "white" : undefined} />
																}
																<Box>
																	<Text
																		fw={600}
																		style={{ textTransform: 'capitalize' }}
																		c={isSelected ? "white" : undefined}
																	>
																		{type} Course
																	</Text>
																	<Text
																		size="xs"
																		c={isSelected ? "white" : (isDark ? "gray.4" : "dimmed")}
																	>
																		{type === 'video' ? 'Pre-recorded video lessons' : 'Live interactive sessions'}
																	</Text>
																</Box>
															</Group>
															<Radio
																checked={isSelected}
																onChange={() => { }}
																value={type}
																tabIndex={-1}
																style={{ pointerEvents: 'none' }}
															/>
														</Group>
													</Card>
												</Grid.Col>
											);
										})}
									</Grid>
								)}
							/>

							{!!paidType && (
								<Grid gutter="md" mt="md">
									<Grid.Col span={{ base: 12, sm: 6 }}>
										<Controller
											name="price"
											control={control}
											rules={validationOptions.price}
											render={({ field }) => (
												<NumberInput
													{...field}
													label="Price"
													placeholder="0.00"
													min={0}
													leftSection="$"
													size="md"
													radius="md"
												/>
											)}
										/>
										{errors?.price && (
											<Text c="red" size="sm" mt={4}>
												Price must be greater than 0
											</Text>
										)}
									</Grid.Col>

									{paidType === 'live' && (
										<Grid.Col span={{ base: 12, sm: 6 }}>
											<Controller
												name="lessons"
												control={control}
												rules={validationOptions.lessons}
												render={({ field }) => (
													<NumberInput
														{...field}
														label="Number of live classes"
														placeholder="e.g. 10"
														min={0}
														size="md"
														radius="md"
													/>
												)}
											/>
											{errors?.lessons && (
												<Text c="red" size="sm" mt={4}>
													Number of classes must be greater than 0
												</Text>
											)}
										</Grid.Col>
									)}
								</Grid>
							)}
						</Box>
					)}

					<Group justify="flex-end" mt="md">
						{courseType === 'free' ? (
							<Button
								onClick={() => router.push(NEXT_PAGE_PATH)}
								rightSection={<IconChevronRight size={18} />}
							>
								Continue to Next Section
							</Button>
						) : (
							<Button
								type="submit"
								disabled={disabledButton}
								loading={loading}
							>
								Save Changes
							</Button>
						)}
					</Group>
				</Stack>
			</form>
		</Card>
	)
}

export default PriceInformationForm;
