import React, { useState } from 'react';
import { deleteIndex, indexRecord } from '@whatsnxt/core-util';
import { ActionIcon, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CourseAPI } from '../../api/v1/courses/course/course';
import { IconEyeOff, IconEye } from '@tabler/icons-react';

const CoursePublishButton = ({
    _id,
    status,
    setCourseStatus,
    courseStatus,
    setCourseTitle,
    setCourseSlug
}) => {
    const effectiveStatus = courseStatus || status;
    const [loading, setLoading] = useState(false);

    const handlePublish = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = {
                publish: effectiveStatus !== 'published',
            };

            const response = await CourseAPI.publishCourse(_id, payload);

            if (response.status === 200) {
                // Update parent state for this specific course
                setCourseTitle(response.data.course.courseName);
                setCourseSlug(response.data.course.slug);
                setCourseStatus(response.data.status);

                if (response.data.status === 'published') {
                    // Index into Algolia if publishing
                    const record = {
                        objectID: response.data.course._id,
                        title: response.data.course.courseName,
                        slug: response.data.course.slug,
                        overview: response.data.course.overview,
                        topics: response.data.course.topics,
                        price: response.data.course.price,
                        purchaseCount: response.data.course.purchaseCount,
                        courseType: response.data.course.courseType,
                        rating: response.data.course.rating,
                        published: response.data.course.published,
                        courseImageUrl: response.data.course.courseImageUrl,
                        coverPhoto: response.data.course.coverPhoto,
                        course_preview_video: '',
                        duration: response.data.course.duration,
                        lessons: response.data.course.lessons,
                        access: null,
                        categoryName: response.data.course.categoryName,
                        userId: response.data.course.userId,
                        createdAt: response.data.course.createdAt,
                        updatedAt: response.data.course.updatedAt,
                    };
                    console.log(' handlePublish :: record:', record)
                    await indexRecord(record, 'course');
                    notifications.show({
                        position: 'bottom-right',
                        title: 'Course Published successfully',
                        message: 'Published',
                        color: 'green',
                    });
                } else {
                    // Remove from Algolia if unpublishing
                    await deleteIndex(_id, 'course');
                    notifications.show({
                        position: 'bottom-right',
                        title: 'Course Unpublished successfully',
                        message: 'UnPublished',
                        color: 'green',
                    });
                }
            }
        } catch (error) {
            console.log('CoursePublishButton.js:: handlePublish:: error:', error);
            notifications.show({
                position: 'bottom-right',
                title: 'Course Publish Failed',
                message: 'Unable to publish',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tooltip
            label={effectiveStatus === 'published' ? 'UnPublish' : 'Publish'}
            position="bottom"
            withArrow
            fz="xs"
        >
            <ActionIcon
                onClick={handlePublish}
                radius="md"
                size="sm"
                variant="outline"
                disabled={
                    effectiveStatus === 'pending_review' ||
                    effectiveStatus === 'rejected' ||
                    effectiveStatus === 'draft'
                }
                loading={loading}
                color={effectiveStatus === 'published' ? 'blue' : 'red'}
            >
                {effectiveStatus === 'published' ? (
                    <IconEye size={14} />
                ) : (
                    <IconEyeOff size={14} />
                )}
            </ActionIcon>
        </Tooltip>
    );
};

export default CoursePublishButton;
