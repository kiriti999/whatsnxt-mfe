'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Grid, Group, Radio, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, useForm } from "react-hook-form";
import { CourseBuilderAPI } from "../../../../api/v1/courses/course-builder/course-builder-api";
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
					<div>
						<Title order={5}>Select your course type</Title>
						<Controller
							name="courseType"
							control={control}
							rules={{ required: 'courseType is required' }}
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
											<Radio value="paid" label="Paid Course" />
										</Grid.Col>
										<Grid.Col span={3}>
											<Radio value="free" label="Free Course" />
										</Grid.Col>
									</Grid>
								</Radio.Group>
							)}
						/>
					</div>

					<Group>
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