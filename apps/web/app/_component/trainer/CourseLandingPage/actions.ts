import { type Dispatch, type SetStateAction } from "react";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { notifications } from "@mantine/notifications";
import { CourseBuilderAPI } from "../../../../api/v1/courses/course-builder/course-builder-api";
import { extractCloudinaryLinksFromContent, extractPublicIdsAndTypeFromLinks, extractPublicIdsFromLinks } from "../../../../components/RichTextEditor/common";
import { getImageAsData, uploadToCloudinary } from "../../../../utils/image-upload";
import { removeUploadedAssetsList } from "../../../../utils/worker/workerWithLocalStorage";
import { revalidate } from "../../../../server-actions";

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

const cloudinaryImageUploadCleanup = ({ overview, topics }) => {
    const cloudinaryLinksOverview = extractCloudinaryLinksFromContent(overview);
    const cloudinaryLinksTopics = extractCloudinaryLinksFromContent(topics);
    const usedPublicIdsInEditor = extractPublicIdsFromLinks([...cloudinaryLinksOverview, ...cloudinaryLinksTopics]);
    removeUploadedAssetsList(usedPublicIdsInEditor);
    return extractPublicIdsAndTypeFromLinks([...cloudinaryLinksOverview, ...cloudinaryLinksTopics]);
};

const handleProfilePhotoUpload = async ({ courseImageUrl, imageAttributes, setImageUploading }) => {
    let secure_url = '';
    setImageUploading(true);

    if (courseImageUrl) {
        const base64Data = await getImageAsData(courseImageUrl);
        const cloudinary = await uploadToCloudinary(base64Data);
        secure_url = cloudinary?.secure_url;
        imageAttributes = { public_id: cloudinary?.public_id };
    }

    setImageUploading(false);
    return secure_url;
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
    { data, courseId, setImageUploading, courseImagePreview, imageAttributes, router },
    open,
    close
) => {
    try {
        open()
        let courseImageUrl = '';
        let courseImagePublicId = '';
        if (courseImagePreview) {
            const cloudinary = await uploadToCloudinary(courseImagePreview, courseId);
            console.log("🚀 ~ cloudinary:", cloudinary)
            courseImageUrl = cloudinary?.secure_url
            courseImagePublicId = cloudinary?.public_id;
            courseImageUrl = courseImageUrl.replace(/^http:\/\//i, 'https://');
        }

        const cloudinaryAssets = cloudinaryImageUploadCleanup({ overview: data.overview, topics: data.topics });

        const payload: any = {
            ...data,
            cloudinaryAssets,
        };

        // Only include image fields if we're uploading a new image
        if (courseImagePreview) {
            payload.courseImageUrl = courseImageUrl;
            payload.courseImagePublicId = courseImagePublicId;
        }

        const response = await CourseBuilderAPI.updateCourseLandingPageDetails(courseId, payload);
        if (response.status === 'updated') {
            notifications.show({
                position: 'bottom-left',
                title: 'Course Updated',
                message: response.message,
                color: 'green',
            });
            await revalidate(`/trainer/course/course-landing-page/${courseId}`);
            router.push(`/trainer/course/course-interview-page/${courseId}`);
        }
    } catch (err) {
        notifications.show({
            position: 'bottom-left',
            title: 'Course Error',
            message: err?.response?.data || 'Course failed to update',
            color: 'red',
        });
    } finally {
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
