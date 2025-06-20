'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text, Title, Group, Card, Stack, Grid, Radio, NumberInput, Button } from '@mantine/core';
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
				<Stack>
					<div>
						<Title order={5}>Your selected course type</Title>
						<Controller
							name="courseType"
							control={control}
							render={({ field }) => (
								<Radio.Group
									value={field.value}
									onChange={(value) => {
										setCourseType(value);
										field.onChange(value);
									}}
								>
									<Grid>
										<Grid.Col span={3}>
											<Radio
												value="paid"
												disabled={true}
												label={<Title order={6}>Paid Course</Title>}
											/>
										</Grid.Col>
										<Grid.Col span={3}>
											<Radio
												value="free"
												disabled={true}
												label={<Title order={6}>Free Course</Title>}
											/>
										</Grid.Col>
									</Grid>
								</Radio.Group>
							)}
						/>
					</div>

					{courseType === 'paid' && (
						<>
							<Title order={5}>Select paid type</Title>
							<Controller
								name="paidType"
								control={control}
								rules={validationOptions.paidType}
								render={({ field }) => (
									<Radio.Group {...field}>
										<Grid>
											<Grid.Col span={3}>
												<Radio
													value="video"
													label={<Title order={6}>Video</Title>}
													checked={true}
												/>
											</Grid.Col>
											<Grid.Col span={3}>
												<Radio
													value="live"
													label={<Title order={6}>Live</Title>}
												/>
											</Grid.Col>
										</Grid>
									</Radio.Group>
								)}
							/>
							{!!paidType && (
								<Grid gutter="md">
									<Grid.Col span={4}>
										<Controller
											name="price"
											control={control}
											rules={validationOptions.price}
											render={({ field }) => (
												<NumberInput
													{...field}
													label={<Title order={6}>Price</Title>}
													placeholder="Enter course price"
													min={0}
												/>
											)}
										/>
										{errors?.price && (
											<Text c="red" size="md">
												price must be greater than 0
											</Text>
										)}
									</Grid.Col>
									{paidType === 'live' && (
										<Grid.Col span={4}>
											<Controller
												name="lessons"
												control={control}
												rules={validationOptions.lessons}
												render={({ field }) => (
													<NumberInput
														{...field}
														label={<Title order={6}>Number of live training classes</Title>}
														placeholder="Number of live training classes"
														min={0}
													/>
												)}
											/>
											{errors?.lessons && (
												<Text c="red" size="md">
													Number of classes must be greater than 0
												</Text>
											)}
										</Grid.Col>
									)}
								</Grid>
							)}
						</>
					)}

					{courseType === 'free' ? (
						<Text c="orange" size="md" mb="sm">
							Move to the next section
						</Text>
					) : (
						<Group>
							<Button type="submit" disabled={disabledButton} mt="md" loading={loading}>
								Save
							</Button>
						</Group>
					)}
				</Stack>
			</form>
		</Card>
	)
}

export default PriceInformationForm;
