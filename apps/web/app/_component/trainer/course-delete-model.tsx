"use client"
import React from 'react';
import { Button, Flex, Modal, Text } from '@mantine/core';
import { CourseBuilderAPI } from '../../../api/v1/courses/course-builder/course-builder-api';
import { notifications } from '@mantine/notifications';
import { deleteAssetWebWorker } from '../../../utils/worker/assetManager';

interface CourseDeleteModaProps {
    courseId: string;
    courseImagePublicId: string;
    isModalOpen: boolean;
    modalClose: any;
    handleDeleteSuccess: any;
}

const CourseDeleteModal = ({ courseId, isModalOpen, modalClose, handleDeleteSuccess, courseImagePublicId }: CourseDeleteModaProps) => {
    console.log(' CourseDeleteModal :: courseImagePublicId:', courseImagePublicId)

    const handleCourseDeleteConfirm = async () => {
        modalClose();
        const { success } = await deleteAssetWebWorker({
            assetsList: [{ publicId: courseImagePublicId, type: 'image' }],
        });

        if (success) {
            try {
                await CourseBuilderAPI.deleteCourse(courseId);
                notifications.show({
                    position: 'bottom-right',
                    title: 'Course deleted',
                    message: 'Course deleted successfully',
                    color: 'green',
                });
                // refetch();
                handleDeleteSuccess();
            } catch (err) {
                notifications.show({
                    position: 'bottom-right',
                    title: 'Course not deleted',
                    message: err?.response?.data?.message,
                    color: 'red',
                });
            }
            finally {
                modalClose();
            }
        } else {
            notifications.show({
                position: 'bottom-right',
                title: 'Course image',
                message: 'Failed to delete course image from cloudinay',
                color: 'red',
            });
            modalClose();
        }
    }
    return (
        <Modal opened={isModalOpen} onClose={modalClose} size="auto" title="Confirm Delete">
            <Text>Are you sure you want to delete this course? This will delete all lectures, its videos, interviews etc</Text>

            <Flex mt="xl" gap={'xl'}>
                <Button color='orange' onClick={modalClose} fullWidth>No</Button>
                <Button color='red' onClick={handleCourseDeleteConfirm} fullWidth>Yes</Button>
            </Flex>
        </Modal>
    );
};
export default CourseDeleteModal;