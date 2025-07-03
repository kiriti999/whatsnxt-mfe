import { type Dispatch, type SetStateAction } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { notifications } from "@mantine/notifications";
import { CourseBuilderAPI } from "../../../../apis/v1/courses/course-builder/course-builder-api";
import { extractCloudinaryLinksFromContent, extractPublicIdsAndTypeFromLinks, extractPublicIdsFromLinks } from "../../../../components/RichTextEditor/common";
import { removeAssetFromLocalStoragesList } from "../../../../utils/worker/localStorageHandler";
import { revalidate } from "../../../../server-actions";
import { uploadImage } from '../../../../components/Blog/Form/util';

type Payload = {
    courseImagePreview?: File | string;
    overview: string;
    course_preview_video: string;
    topics?: string;
    languages: string[];
    categoryName: string;
    subCategoryName?: string;
    nestedSubCategoryName?: string;
};

const extractCloudAssetsToSave = ({ overview, topics }) => {
    const cloudinaryLinksOverview = extractCloudinaryLinksFromContent(overview);
    const cloudinaryLinksTopics = extractCloudinaryLinksFromContent(topics);
    const usedPublicIdsInEditor = extractPublicIdsFromLinks([...cloudinaryLinksOverview, ...cloudinaryLinksTopics]);
    return { cloudinaryLinksOverview, cloudinaryLinksTopics, usedPublicIdsInEditor }
};

interface HandleLandingPageSubmitParams {
    data: Payload;
    courseId: string;
    setImageUploading: Dispatch<SetStateAction<boolean>>;
    courseImagePreview: File | string;
    imageAttributes: Record<string, any>;
    router: AppRouterInstance;
}

type HandleLandingPageSubmit = (
    params: HandleLandingPageSubmitParams,
    open: () => void,
    close: () => void
) => Promise<void>;


export const handleLandingPageSubmit: HandleLandingPageSubmit = async (
    { data, courseId, setImageUploading, courseImagePreview, router },
    open,
    close
) => {
    try {
        open()
        let imageUrl = '';
        let courseImagePublicId = '';

        // Extract existing cloudinary assets first
        const { cloudinaryLinksOverview, cloudinaryLinksTopics, usedPublicIdsInEditor } = extractCloudAssetsToSave({ overview: data.overview, topics: data.topics });
        let cloudinaryAssets = extractPublicIdsAndTypeFromLinks([...cloudinaryLinksOverview, ...cloudinaryLinksTopics]);

        // Handle course image upload using the new uploadImage function
        if (courseImagePreview) {
            // Set uploading state if available
            setImageUploading?.(true);

            try {
                const bffApiUrl = process.env.NEXT_PUBLIC_BFF_HOST_IMAGEKIT_API;
                const { secure_url, updatedAssets } = await uploadImage(
                    courseImagePreview,
                    cloudinaryAssets,
                    courseId, // Using courseId as folder name
                    false, // addToLocalStorage - adjust based on your needs
                    bffApiUrl
                );

                if (secure_url) {
                    imageUrl = secure_url.replace(/^http:\/\//i, 'https://');
                    // Extract public_id from the updated assets
                    const uploadedAsset = updatedAssets[updatedAssets.length - 1];
                    courseImagePublicId = uploadedAsset?.public_id || '';
                    cloudinaryAssets = updatedAssets;
                }
            } finally {
                setImageUploading?.(false);
            }
        }

        // Remove from local storage before saving into db
        removeAssetFromLocalStoragesList(usedPublicIdsInEditor);

        const payload: any = {
            ...data,
            cloudinaryAssets,
        };

        // Only include image fields if we're uploading a new image
        if (courseImagePreview && imageUrl) {
            payload.imageUrl = imageUrl;
            payload.courseImagePublicId = courseImagePublicId;
        }

        const response = await CourseBuilderAPI.updateCourseLandingPageDetails(courseId, payload);
        if (response.status === 'updated') {
            notifications.show({
                position: 'bottom-right',
                title: 'Course Updated',
                message: response.message,
                color: 'green',
            });
            await revalidate(`/trainer/course/course-landing-page/${courseId}`);
            router.push(`/trainer/course/course-interview-page/${courseId}`);
        }
    } catch (err) {
        console.error('Course update error:', err);
        notifications.show({
            position: 'bottom-right',
            title: 'Course Error',
            message: err?.response?.data || err?.message || 'Course failed to update',
            color: 'red',
        });
    } finally {
        setImageUploading?.(false);
        close()
    }
};

export const handleCategoryChange = ({ option, setSubCategories, setValue }) => {
    if (option.subcategories) {
        setSubCategories(option.subcategories);
        setValue('subCategoryName', null);
    }
}

export const handleSubCategoryChange = ({ option, setNestedSubCategories, setValue }) => {
    if (option.subcategories) {
        setNestedSubCategories(option.subcategories);
        setValue('nestedSubCategoryName', null);
    }
}
