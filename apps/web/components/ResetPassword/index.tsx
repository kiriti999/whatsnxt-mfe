"use client"

import React from 'react';
import {
    Paper,
    Title,
    Text,
    TextInput,
    Button,
    Container,
    Group,
    Anchor,
    Center,
    Box,
    LoadingOverlay,
} from '@mantine/core';
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form';
import { useDisclosure } from '@mantine/hooks';
import classes from './ResetPassword.module.css';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { ProfileAPI } from '../../apis/v1/profile/profile';



const ResetPassword = () => {
    const router = useRouter()
    const [visible, { open, close }] = useDisclosure(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            email: '',
        },
        resetOptions: {
            keepDirtyValues: true, // user-interacted input will be retained
            keepErrors: true, // input errors will be retained with value update
        },
    });

    const validationOptions = {
        email: {
            required: 'Email is required',
            pattern: {
                value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                message: 'Email is not valid.',
            },
        },
    };

    const resetPasswordHandler = useMutation(
        {
            mutationFn: async (payload: any) => await ProfileAPI.resetPasswordRequest(payload),
            onSuccess: async (response: any) => {
                close()
                notifications.show({
                    position: 'bottom-right',
                    title: 'Reset Password Success',
                    message: response.data.message || '',
                    color: 'green',
                });
            },
            onError: (error: any) => {
                close()
                notifications.show({
                    position: 'bottom-right',
                    title: 'Reset Password Error',
                    message: error?.response?.data?.error || 'An error occurred while processing your request. Please try again later',
                    color: 'red',
                });
            },
        }
    );

    const resetPassword = async (payload: any, e: any) => {
        e.preventDefault();
        open()
        resetPasswordHandler.mutate(payload)
    };

    return (
        <div className="pb-100">
            <Container size={460} my={30}>
                <Title className={classes.title} ta="center">
                    Forgot your password?
                </Title>
                <Text c="dimmed" fz="sm" ta="center">
                    Enter your email to get a reset link
                </Text>
                <Box pos="relative">
                    <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
                    <form onSubmit={handleSubmit(resetPassword)}>
                        <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
                            <TextInput error={errors.email?.message && 'Invalid email'}  {...register('email', validationOptions.email)} label="Your email" placeholder="me@gmail.com" required />
                            <Group justify="space-between" mt="lg" className={classes.controls}>
                                <Anchor c="dimmed" size="sm" className={classes.control}>
                                    <Center inline onClick={() => { router.push('/authentication') }}>
                                        {/* <FaArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={'1.5'} /> */}
                                        <Box ml={5}>Back to the login page</Box>
                                    </Center>
                                </Anchor>
                                <Button type='submit' className={classes.control}>Reset password</Button>
                            </Group>
                        </Paper>
                    </form>
                </Box>




            </Container>
        </div>
    );
};

export default ResetPassword;
