"use client"

import React, { useState } from 'react';
import { type CourseType } from '@whatsnxt/core-util';
import { Box, Button, Flex, Modal, Textarea } from '@mantine/core';
import { notifications } from "@mantine/notifications";
import { CourseBuilderAPI } from "../../../../api/v1/courses/course-builder/course-builder-api"
import { useRouter } from 'next/navigation';

export default function CourseApproval({ course }: CourseProps) {
    const router = useRouter();
    const [opened, setOpened] = useState(false);
    const handleApprove = async () => {
        try {
            await CourseBuilderAPI.updateCourseStatusApproved(course?._id).then((res) => {
                notifications.show({
                    position: 'bottom-left',
                    color: 'green',
                    title: 'Course approved succesfully',
                    message: 'Course status updated',
                });
                router.push("/admin/course-review-request");
            })
        } catch (error) {
            console.log("error approvin course", error.message);
            notifications.show({
                position: 'bottom-left',
                color: 'red',
                title: 'Unable to update course status, Please try again later.',
                message: '',
            });
        }
    }

    const handleReject = async (event) => {
        event.preventDefault();
        try {
            if (event.target.reject_reason.value) {
                await CourseBuilderAPI.updateCourseStatusRejected(course?._id, event.target.reject_reason.value).then((res) => {
                    setOpened(false);
                    notifications.show({
                        position: 'bottom-left',
                        color: 'green',
                        title: 'Course rejected succesfully',
                        message: 'Course status updated',
                    });
                    router.push("/admin/course-review-request");
                })
            } else {
                notifications.show({
                    position: 'bottom-left',
                    color: 'red',
                    title: 'Please specify reject reason',
                    message: 'Reject reason is required',
                })
            }
        } catch (error) {
            console.log("error rejecting course", error.message);
            notifications.show({
                position: 'bottom-left',
                color: 'red',
                title: 'Unable to update course status, Please try again later.',
                message: '',
            })
        }
    }
    return (
        <Box mt={'xl'}>
            <Flex gap={'xs'}>
                <Button color="green" onClick={handleApprove}>Approve</Button>
                <Button color="red" onClick={() => setOpened(true)}>Reject</Button>
            </Flex>
            <Modal opened={opened} onClose={() => setOpened(false)} title="Reject Course">
                <form className='' onSubmit={handleReject}>
                    <Textarea
                        label="Reject Reason"
                        placeholder="Specify reject reason"
                        name='reject_reason'
                        required
                    />
                    <Button color='red' type='submit' className='mt-2'>Reject Course</Button>
                </form>
            </Modal>
        </Box>
    );
}

type CourseProps = {
    course: CourseType;
}