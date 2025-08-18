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
	FileInput,
	Alert,
	Loader
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { useDisclosure } from '@mantine/hooks';
import CourseUploadAssetProgress from "../../../../components/Courses/CourseUploadAssetProgress";
import { TiptapManageContextProvider } from "../../../../context/TiptapManageContext";
import { RichTextEditor } from '../../../../components/RichTextEditor';
import { CategoriesAPI } from '../../../../apis/v1/courses/categories';
import { LanguageAPI } from '../../../../apis/v1/language';
import { getAssetFromLocalStorage } from '../../../../utils/worker/localStorageHandler';
import { useDashboardContext } from '../../../../context/DashboardContext';
import { handleCategoryChange, handleLandingPageSubmit, handleSubCategoryChange } from './actions';
import { useRouter } from "next/navigation";
import { IconUpload, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { unifiedDeleteWebWorker } from '../../../../utils/worker/assetManager';
import { useImageSafety } from '../../../../hooks/useImageSafety';

const INIT_COURSE = {
	overview: '',
	courseImagePreview: null,
	course_preview_video: '',
	imageAttributes: {},
};

const Main = ({ courseWithSections, courseId }) => {
	// console.log(' Main :: courseWithSections:', courseWithSections)
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
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [validationSuccess, setValidationSuccess] = useState<string | null>(null);

	// Image safety hook
	const {
		scanImageClientSide,
		preloadModel,
		isScanning,
		isModelLoading,
		error: scanError,
		clearError
	} = useImageSafety();

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

	// Preload AI model on component mount for better UX
	useEffect(() => {
		preloadModel().catch(console.warn);
	}, [preloadModel]);

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
		try {
			const storedAssets = getAssetFromLocalStorage();

			// Early return if no assets to clean up
			if (!storedAssets?.length) {
				return;
			}
			const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
			console.log(`Cleaning up ${storedAssets.length} unused assets`);
			await unifiedDeleteWebWorker({ assetsList: storedAssets, clearLocalStorage: true, bffApiUrl });


		} catch (error) {
			console.error('Failed to delete unused assets:', error);

		}
	}, []);

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

	// Format file size for display
	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	// Validate image dimensions
	const validateImageDimensions = (file: File): Promise<boolean> => {
		return new Promise((resolve) => {
			const img = document.createElement('img');
			const url = URL.createObjectURL(file);

			img.onload = () => {
				URL.revokeObjectURL(url);
				const minWidth = 750, minHeight = 422;
				const maxWidth = 6000, maxHeight = 6000;

				const isValidMin = img.width >= minWidth && img.height >= minHeight;
				const isValidMax = img.width <= maxWidth && img.height <= maxHeight;

				if (!isValidMin) {
					setValidationError(
						`Image dimensions too small. Min: ${minWidth}x${minHeight}px, Actual: ${img.width}x${img.height}px`
					);
				} else if (!isValidMax) {
					setValidationError(
						`Image dimensions too large. Max: ${maxWidth}x${maxHeight}px, Actual: ${img.width}x${img.height}px`
					);
				}

				resolve(isValidMin && isValidMax);
			};

			img.onerror = () => {
				URL.revokeObjectURL(url);
				setValidationError('Invalid image file');
				resolve(false);
			};

			img.src = url;
		});
	};

	// Comprehensive file validation
	const validateFile = async (file: File): Promise<boolean> => {
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];

		// Check file type
		if (!allowedTypes.includes(file.type)) {
			setValidationError(`Unsupported file format. Supported: ${allowedTypes.join(', ')}`);
			return false;
		}

		// Check file size
		if (file.size > maxSize) {
			setValidationError(
				`File too large: ${formatFileSize(file.size)}. Maximum allowed: ${formatFileSize(maxSize)}`
			);
			return false;
		}

		// Check image dimensions
		const dimensionsValid = await validateImageDimensions(file);
		return dimensionsValid;
	};

	const handleImageChange = async (file: File | null) => {
		// Clear previous states
		setValidationError(null);
		setValidationSuccess(null);
		clearError();

		if (!file) {
			setCourseImage(null);
			setImagePreview(null);
			return;
		}

		try {
			console.log('🔍 Starting validation and safety scan for:', file.name);

			// Step 1: Basic file validation
			const isValidFile = await validateFile(file);
			if (!isValidFile) {
				return; // Error already set by validateFile
			}

			// Step 2: Safety scanning
			console.log('🔍 Running AI safety scan...');
			const safetyResult = await scanImageClientSide(file);

			if (!safetyResult.safe) {
				setValidationError(
					`Image blocked by AI safety scan: ${safetyResult.blockedReasons.join(', ')}`
				);
				console.error('❌ Image failed safety check:', safetyResult);
				return;
			}

			// Step 3: All checks passed - set the image
			console.log('✅ Image passed all validation checks');
			setCourseImage(file);
			setValidationSuccess(`Image validated successfully (${formatFileSize(file.size)})`);

			// Step 4: Create preview
			const fileReader = new FileReader();
			fileReader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			fileReader.readAsDataURL(file);

		} catch (error) {
			console.error('❌ Image validation failed:', error);
			setValidationError(
				`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
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
		setDisabledButton(
			!isDirty ||
			!isValid ||
			isOverviewEmpty ||
			imageUploading ||
			isAssetsUploading ||
			!categoryValue ||
			isScanning ||
			isModelLoading ||
			(validationError !== null) ||
			(scanError !== null)
		);
	}, [overviewValue, categoryValue, imageUploading, isAssetsUploading, isValid, isDirty, isScanning, isModelLoading, validationError, scanError]);

	// Add this useEffect to set the image preview for existing courses
	useEffect(() => {
		if (courseId && courseWithSections?.imageUrl) {
			// Set the image preview for existing courses
			setImagePreview(courseWithSections.imageUrl as string);
		}
	}, [courseId, courseWithSections]);

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

						{/* Course Image Upload */}
						<Controller
							name="courseImagePreview"
							control={control}
							rules={validationOptions.courseImage}
							render={({ field }) => (
								<div>
									<FileInput
										clearable
										label={<Title order={5} className={!courseId ? 'required' : ''}>Course Image</Title>}
										placeholder={
											isScanning ? "🔍 Scanning image..." :
												isModelLoading ? "🤖 Loading AI model..." :
													"Select course image"
										}
										leftSection={
											isScanning || isModelLoading ? (
												<Loader size={16} />
											) : (
												<IconUpload size={16} />
											)
										}
										value={courseImage}
										onChange={(e) => {
											handleImageChange(e);
											field.onChange(e);
										}}
										accept=".png,.jpg,.jpeg"
										disabled={isScanning || isModelLoading}
									/>

									{/* Status messages */}
									{(validationError || scanError) && (
										<Alert
											icon={<IconAlertCircle size={16} />}
											color="red"
											mt="xs"
											variant="light"
										>
											{validationError || scanError}
										</Alert>
									)}

									{validationSuccess && !validationError && !scanError && (
										<Alert
											icon={<IconCheck size={16} />}
											color="green"
											mt="xs"
											variant="light"
										>
											{validationSuccess}
										</Alert>
									)}

									{/* Scanning status */}
									{isScanning && (
										<Group gap="xs" mt="xs">
											<Loader size="xs" />
											<Text size="xs" c="blue">
												Running AI safety scan...
											</Text>
										</Group>
									)}

									{/* Model loading status */}
									{isModelLoading && (
										<Group gap="xs" mt="xs">
											<Loader size="xs" />
											<Text size="xs" c="gray">
												Loading AI model in browser...
											</Text>
										</Group>
									)}
								</div>
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
							<Text size="sm" mt="xs">
								<strong>File size:</strong> Maximum 5MB
							</Text>
							<Text size="sm" mt="xs" c="blue">
								<strong>AI Safety:</strong> All images are automatically scanned for inappropriate content before upload.
							</Text>
						</Box>

						{/* Image Preview */}
						{imagePreview && !validationError && !scanError && (
							<Box mt="md">
								<Title order={5}>Image Preview:</Title>
								<img
									src={imagePreview}
									alt="Course Preview"
									className='image-preview'
									style={{
										borderRadius: '8px',
										border: '1px solid #e9ecef',
										maxWidth: '300px',
										maxHeight: '200px',
										objectFit: 'cover'
									}}
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