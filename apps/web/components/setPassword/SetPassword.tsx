"use client"

import React, { useEffect } from 'react';
import {
  Paper,
  Title,
  Button,
  Container,
  PasswordInput, Stack, LoadingOverlay,
  Box
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'
import { useDisclosure } from '@mantine/hooks';
import classes from './SetPassword.module.css';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { ProfileAPI } from '../../api/v1/user/profile';

const SetPassword = () => {
  const [visible, { open, close }] = useDisclosure(false);
  const [passwordVisible, { toggle: passwordToggle }] = useDisclosure(false);
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    resetOptions: {
      keepDirtyValues: true, // user-interacted input will be retained
      keepErrors: true, // input errors will be retained with value update
    },
  });

  const validationOptions = {
    password: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters long',
      },
    },
    confirmPassword: {
      required: 'Confirm password is required',
      validate: (value: string, { password }: { password: string }) =>
        value === password || 'Passwords do not match',
    },
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const id = urlParams.get('id');

    if (!token || !id) {
      router.push('/authentication');
    }
  }, []);

  const setPasswordHandler = useMutation(
    {
      mutationFn: async (payload: any) => await await ProfileAPI.setPassword(payload),
      onSuccess: async (response: any) => {
        close()
        notifications.show({
          position: 'bottom-left',
          title: 'Reset Password Success',
          message: response?.data?.message || 'Password Reset Successfully',
          color: 'green',
        });
        router.push('/auth/authentication');
      },
      onError: (error: any) => {
        close()
        notifications.show({
          position: 'bottom-left',
          title: 'Reset Password Error',
          message: error?.response?.data?.error || 'An error occurred while processing your request. Please try again later',
          color: 'red',
        });
      },
    }
  );

  const setPassword = async (payload: any) => {
    // get id and token from the route 
    const urlParams = new URLSearchParams(window.location.search);
    payload.token = urlParams.get('token');
    payload.id = urlParams.get('id');
    open()
    setPasswordHandler.mutate(payload)
  };



  return (
    <div>
      <Container size={460} my={30}>
        <Title className={classes.title} ta="center">
          Reset your password
        </Title>
        <Box pos="relative">
          <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
          <form onSubmit={handleSubmit(setPassword)}>
            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
              <Stack>
                <PasswordInput
                  required
                  error={errors.password?.message}
                  {...register('password', validationOptions.password)}
                  label="Password"
                  visible={passwordVisible}
                  onVisibilityChange={passwordToggle}
                />
                <PasswordInput
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', validationOptions.confirmPassword)}
                  label="Confirm password"
                  visible={passwordVisible}
                  onVisibilityChange={passwordToggle}
                />
                <Button type='submit' className={classes.control}>Set password</Button>
              </Stack>
            </Paper>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default SetPassword;
