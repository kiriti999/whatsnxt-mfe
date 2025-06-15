'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IconShoppingCart, IconTags } from '@tabler/icons-react';
import styles from './CoursesDetailsSidebar.module.css';
import useAuth from '../../hooks/Authentication/useAuth';
import { CoursesEnrolledAPI } from '../../api/v1/courses/enrolled/enrolled';
import NavigateButton from './NavigateButton';

const ActionButtons = ({
    add,
    addToCartClick,
    isEnrolled,
    userId,
    courseId,
    courseType,
    courseSlug,
    sectionId,
    lessonId,
    open
}) => {
    const router = useRouter();
    const { user } = useAuth();
    const lessonUrl = `/courses/${courseSlug}/section/${sectionId}/lesson/${lessonId}`;

    const isFreeCourse = courseType === 'free';
    const isPaidCourse = courseType === 'paid';
    const unPurchasedCourse = isPaidCourse && !isEnrolled
    const isNotEnrolledIntoFreeCourse = isFreeCourse && !isEnrolled

    const queryClient = useQueryClient();

    const handleEnroll = useMutation({
        mutationFn: async (payload: any) => {
            if (!isEnrolled.data) {
                return await CoursesEnrolledAPI.createEnrolled(payload);
            }
        },
        onSuccess: (response) => {
            notifications.show({
                position: 'bottom-right',
                title: 'Course enrolling',
                message: response?.data || 'Enrolled successfully',
                color: 'green',
            });
            // This will force a refetch of the enrollment status
            queryClient.invalidateQueries({ queryKey: ['isEnrolled', courseId] });
        },
        onError: (error: any) => {
            console.log('Course Enrollment: ActionButtons :: error:', error);
            notifications.show({
                position: 'bottom-right',
                title: 'Course enrollment failed',
                message: error?.response?.data || 'Enrollment failed',
                color: 'red',
            });
        }
    });


    if (!user) {
        return (
            <div className={styles['btn-box']}>
                <NavigateButton
                    url={`/authentication?returnto=/courses/${courseSlug}`}
                    text='Enroll to the course'
                    open={open}
                />
            </div>
        )
    }

    if (user && user._id === userId) {
        return (
            <div className={styles['btn-box']}>
                <button onClick={() => router.push('/my-courses')} className={`${styles['default-btn']} default-btn`}>
                    <IconShoppingCart /> View My Courses
                </button>
            </div>
        )
    }

    if (unPurchasedCourse) {
        return (
            <div className={styles['btn-box']}>
                {add ? (
                    <NavigateButton
                        url='/cart'
                        text='View Cart'
                        icon={<IconTags />}
                        open={open}
                    />
                ) : (
                    <Button
                        color="red"
                        className={`${styles['default-btn']}`}
                        onClick={addToCartClick}
                        leftSection={<IconTags />}
                        fullWidth
                        radius="md"
                        size="lg"
                    >
                        Add to cart
                    </Button>
                )}
            </div>
        )
    }

    if (isNotEnrolledIntoFreeCourse) {
        return (
            <div className={styles['btn-box']}>
                <Button
                    color="red"
                    className={`${styles['default-btn']}`}
                    fullWidth
                    radius="md"
                    size="lg"
                    onClick={() => handleEnroll.mutate({ courseId, email: user.email, cost: 0 })}
                >
                    Enroll to the course
                </Button>
            </div>
        )
    }

    if (user && !isEnrolled) {
        return (
            <div className={styles['btn-box']}>
                {add ? (
                    <NavigateButton
                        text='View Cart'
                        url='/cart'
                        icon={<IconTags />}
                        open={open}
                    />
                ) : (
                    <Button
                        color="red"
                        className={`${styles['default-btn']}`}
                        onClick={addToCartClick}
                        leftSection={<IconTags />}
                        fullWidth
                        radius="md"
                        size="lg"
                    >
                        Add to cart
                    </Button>
                )}
            </div>
        )
    }

    if (user && isEnrolled) {
        return (
            <div className={styles['btn-box']}>
                <NavigateButton
                    text='Go to the course'
                    url={lessonUrl}
                    open={open}
                />
            </div>
        )
    }
}

export default ActionButtons
