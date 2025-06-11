'use client';

import {
	LoadingOverlay,
	Text,
	TextInput,
	Button,
	Stack,
	Title,
	Group,
	Select,
	Box,
	MultiSelect,
	FileInput
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import CourseUploadAssetProgress from "../../../../components/Courses/CourseUploadAssetProgress";
import { TiptapManageContextProvider } from "../../../../context/TiptapManageContext";
import { RichTextEditor } from '../../../../components/RichTextEditor';
import { CategoriesAPI } from '../../../../api/v1/courses/categories';
import { LanguageAPI } from '../../../../api/v1/language';
import { getUploadedAssets } from '../../../../utils/worker/workerWithLocalStorage';
import { deleteDataWebWorker } from '../../../../components/RichTextEditor/common';
import { useDashboardContext } from '../../../../context/DashboardContext';
import { handleCategoryChange, handleLandingPageSubmit, handleSubCategoryChange } from './actions';
import { useRouter } from "next/navigation";
import { IconUpload } from '@tabler/icons-react';

const INIT_COURSE = {
	overview: '',
	courseImagePreview: null,
	course_preview_video: '',
	imageAttributes: {},
};

const Main = ({ courseWithSections, courseId }) => {
	console.log(' Main :: courseWithSections:', courseWithSections)
	const router = useRouter();
	const [course] = useState(INIT_COURSE);
	const [imageUploading, setImageUploading] = useState(false);
	const [isAssetsUploading, setIsAssetsUploading] = useState(false);
	const [visible, { open, close }] = useDisclosure(false);
	const [coursePreviewVideo, setCoursePreviewVideo] = useState(course.course_preview_video || '');
	const [disabledButton, setDisabledButton] = useState(true);
	const [subCategories, setSubCategories] = useState([]);
	const [nestedSubCategories, setNestedSubCategories] = useState([]);
	const [courseImage, setCourseImage] = useState<File | null>(null);

	const { data: languages } = useQuery({
		queryKey: ['languages'],
		queryFn: async () => {
			const { data } = await LanguageAPI.getAll();
			return data || [];
		}
	});

	const { data: categories } = useQuery({
		queryKey: ['categories'],
		queryFn: async () => {
			const { data } = await CategoriesAPI.getCategories();
			return data?.categories || [];
		},
	});

	const { isFetching, data: categoryData } = useQuery({
		queryKey: ['category'],
		queryFn: async () => {
			const { data } = await CategoriesAPI.getCategory({ categoryName: courseWithSections.categoryName });
			return data?.category;
		},
	});

	const { setEnabledSections } = useDashboardContext();

	useEffect(() => {
		setEnabledSections(prev => {
			const temp = new Set(prev);
			temp.add(1);
			temp.add(2);
			temp.add(3);
			temp.add(4);

			return temp
		})
	}, [])

	// delete ids on unload
	useEffect(() => {
		return () => {
			// calls on unload
			deleteUnusedAssets()
		}
	}, [])

	const deleteUnusedAssets = useCallback(async () => {
		if (getUploadedAssets() && getUploadedAssets().length > 0) {
			await deleteDataWebWorker({ assetsList: getUploadedAssets() })
		}
	}, [])

	const {
		handleSubmit,
		setValue,
		control,
		watch,
		formState: { errors, isValid, isDirty },
	} = useForm({
		mode: 'onChange',
		defaultValues: {
			course_preview_video: courseWithSections?.course_preview_video || '',
			overview: courseWithSections?.overview || '',
			topics: courseWithSections?.topics || '',
			languages: courseWithSections?.languageIds?.map(lang => lang.abbr) || [],
			categoryName: courseWithSections?.categoryName || '',
			subCategoryName: courseWithSections?.subCategoryName || '',
			nestedSubCategoryName: courseWithSections?.nestedSubCategoryName || '',
			courseImagePreview: ''
		},
		resetOptions: {
			keepDirtyValues: true,
			keepErrors: true,
		},
	});

	// Watch fields to update button state
	const overviewValue = watch('overview');
	const categoryValue = watch('categoryName');
	const subCategoryValue = watch('subCategoryName');

	const validationOptions = {
		languages: {
			required: 'language field is required!',
		},
		categoryName: {
			required: 'category field is required!',
		},
		subCategoryName: {
			required: 'subcategory field is required!'
		},
		courseImage: {
			required: !courseId ? 'course image is required!' : false
		}
	};

	useEffect(() => {
		if (!isFetching && categoryData) {
			setSubCategories(categoryData.subcategories || []);
		}
	}, [categoryData, isFetching])

	useEffect(() => {
		if (subCategories.length > 0 && subCategoryValue) {
			const match = subCategories.find(item => item.name === subCategoryValue);
			setNestedSubCategories(match?.subcategories || []);
		} else {
			setNestedSubCategories([])
		}
	}, [subCategoryValue, subCategories])

	useEffect(() => {
		const isOverviewEmpty = !overviewValue || overviewValue.replace(/<[^>]*>/g, '').trim() === '';
		setDisabledButton(!isDirty || !isValid || isOverviewEmpty || imageUploading || isAssetsUploading || !categoryValue);
	}, [overviewValue, categoryValue, imageUploading, isAssetsUploading, isValid, isDirty]);

	// Add this useEffect to set the image preview for existing courses
	useEffect(() => {
		if (courseId && courseWithSections?.courseImageUrl) {
			// Set the image preview for existing courses
			setImagePreview(courseWithSections.courseImageUrl as string);
		}
	}, [courseId, courseWithSections]);

	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const handleImageChange = (file: File | null) => {
		setCourseImage(file);

		if (file) {
			const fileReader = new FileReader();
			fileReader.onload = (e) => {
				setImagePreview(e.target?.result as string); // Set image preview
			};
			fileReader.readAsDataURL(file); // Read the file as a data URL
		} else {
			setImagePreview(null); // Reset preview if no file is selected
		}
	};

	// Prepare options for Select components
	const languageOptions = languages && Array.isArray(languages)
		? languages.map(({ abbr, name }) => ({ value: abbr, label: name }))
		: [];

	const categoryOptions = categories && Array.isArray(categories)
		? categories.map(({ categoryName, subcategories }) => ({
			label: categoryName,
			value: categoryName,
			subcategories
		}))
		: [];

	const subCategoryOptions = subCategories && Array.isArray(subCategories)
		? subCategories.map(({ name, subcategories }) => ({
			label: name,
			value: name,
			subcategories
		}))
		: [];

	const nestedSubCategoryOptions = nestedSubCategories && Array.isArray(nestedSubCategories)
		? nestedSubCategories.map(({ name }) => ({
			label: name,
			value: name
		}))
		: [];

	return (
		<TiptapManageContextProvider isAssetsUploading={isAssetsUploading} setIsAssetsUploading={setIsAssetsUploading} courseId={courseId}>
			<CourseUploadAssetProgress />
			<div style={{ position: 'relative' }} className="border-box">
				<LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
				<form onSubmit={handleSubmit((payload) => handleLandingPageSubmit({
					data: payload,
					courseId,
					router,
					setImageUploading,
					courseImagePreview: courseImage || undefined,
					imageAttributes: course.imageAttributes
				}, open, close))}>
					<Stack m={'lg'}>
						<Title order={5} className='required'>Course Overview</Title>
						<Controller
							name="overview"
							control={control}
							render={({ field }) => (
								<RichTextEditor content={field.value} onChange={field.onChange} />
							)}
						/>
						{errors.overview && (
							<Text c="red">{errors.overview.message as string}</Text>
						)}

						<Title order={5}>Course Description (optional)</Title>
						<Controller
							name="topics"
							control={control}
							render={({ field }) => (
								<RichTextEditor content={field.value} onChange={field.onChange} />
							)}
						/>

						{errors.topics && (
							<Text c="red">{errors.topics.message as string}</Text>
						)}

						<Controller
							name="course_preview_video"
							control={control}
							render={({ field }) => (
								<TextInput
									label={<Title order={5}>Course video preview url</Title>}
									placeholder="https://www.youtube.com"
									value={coursePreviewVideo}
									onChange={(e) => {
										setCoursePreviewVideo(e.target.value);
										setValue('course_preview_video', e.target.value);
										field.onChange(e.target.value);
									}}
								/>
							)}
						/>

						{errors.course_preview_video && (
							<Text c="red">{errors.course_preview_video.message as string}</Text>
						)}

						{/* Basic Info Section */}
						<Title order={5}>Basic info</Title>
						<Group grow>
							{languageOptions.length > 0 && (
								<Box mb={`${errors?.languages ? '' : 'lg'}`}>
									<Controller
										name="languages"
										control={control}
										rules={validationOptions.languages}
										render={({ field }) => (
											<MultiSelect
												label="Language"
												placeholder="Select languages"
												data={languageOptions}
												{...field}
												required
											/>
										)}
									/>
									{errors?.languages && <Text c="red" size="md">{errors?.languages.message as string}</Text>}
								</Box>
							)}

							{categoryOptions.length > 0 && (
								<Box mb={`${errors?.categoryName ? '' : 'lg'}`}>
									<Controller
										name="categoryName"
										control={control}
										rules={validationOptions.categoryName}
										render={({ field }) => (
											<Select
												label="Category"
												placeholder="Select Category"
												data={categoryOptions}
												{...field}
												onChange={(value, option) => {
													field.onChange(value);
													handleCategoryChange({ option, setSubCategories, setValue });
												}}
												required
											/>
										)}
									/>
									{errors?.categoryName && <Text c="red" size="md">{errors?.categoryName.message as string}</Text>}
								</Box>
							)}

							{categoryValue && subCategoryOptions.length > 0 && (
								<Box mb={`${errors?.subCategoryName ? '' : 'lg'}`}>
									<Controller
										name="subCategoryName"
										control={control}
										rules={validationOptions.subCategoryName}
										render={({ field }) => (
											<Select
												label="Subcategory"
												placeholder="Select Subcategory"
												data={subCategoryOptions}
												{...field}
												onChange={(value, option) => {
													field.onChange(value);
													handleSubCategoryChange({ option, setNestedSubCategories, setValue });
												}}
												required
											/>
										)}
									/>
									{errors?.subCategoryName && <Text c="red" size="md">{errors?.subCategoryName?.message as string}</Text>}
								</Box>
							)}

							{nestedSubCategoryOptions.length > 0 && (
								<Box mb={`${errors?.nestedSubCategoryName ? '' : 'lg'}`}>
									<Controller
										name="nestedSubCategoryName"
										control={control}
										render={({ field }) => (
											<Select
												label="NestedSubcategory (optional)"
												placeholder="Select NestedSubcategory"
												data={nestedSubCategoryOptions}
												{...field}
											/>
										)}
									/>
									{errors?.nestedSubCategoryName && <Text c="red" size="md">{errors?.nestedSubCategoryName?.message as string}</Text>}
								</Box>
							)}
						</Group>

						<Controller
							name="courseImagePreview"
							control={control}
							rules={validationOptions.courseImage}
							render={({ field }) => (
								<FileInput
									clearable
									label={<Title order={5} className={!courseId ? 'required' : ''}>Course Image</Title>}
									placeholder="Select course image"
									leftSection={<IconUpload size={16} />}
									value={courseImage}
									onChange={(e) => {
										handleImageChange(e);
										field.onChange(e);
									}}
									accept=".png,.jpg,.jpeg"
								/>
							)}
						/>
						{errors.courseImagePreview && <Text c="red" size="md" mb={0}>{errors.courseImagePreview?.message as string}</Text>}

						{/* Course Image Technical Requirements */}
						<Box mt="lg" style={{ textAlign: 'left' }}>
							<Title order={5}>Course Image Requirements</Title>
							<Text size="sm" mt="xs">
								<strong>Image formats:</strong> The file format must be .jpg, .jpeg, or .png.
							</Text>
							<Text size="sm" mt="xs">
								<strong>Image dimensions:</strong> Always design your course image at the following pixel dimensions. The image design needs to be within the content safe area for maximum visibility.
							</Text>
							<Text size="sm" mt="xs">
								<strong>Minimum required dimensions:</strong> 750 × 422 pixels
							</Text>
							<Text size="sm" mt="xs">
								<strong>Maximum required dimensions:</strong> 6000 × 6000 pixels
							</Text>
						</Box>

						{/* Image Preview */}
						{imagePreview && (
							<Box mt="md">
								<Title order={5}>Image Preview:</Title>
								<img
									src={imagePreview}
									alt="Course Preview"
									className='image-preview'
								/>
							</Box>
						)}

						<Group>
							<Button type="submit" variant='outline' disabled={disabledButton} mt="md">
								Save
							</Button>
						</Group>
					</Stack>
				</form>
			</div>
		</TiptapManageContextProvider>)
}

export default Main;