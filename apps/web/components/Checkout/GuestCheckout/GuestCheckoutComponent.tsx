"use client"

import React, { FC, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from 'react-hook-form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack, LoadingOverlay,
  Box,
  Grid
} from '@mantine/core';
import { GoogleButton } from '@whatsnxt/core-ui/src/GoogleButton';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { CartAPI } from '../../../apis/v1/cart/cart';
import { AuthAPI } from '../../../apis/v1/auth';
import { useMutation } from '@tanstack/react-query';
import styles from './GuestCheckout.module.css';
import useAuth from '../../../hooks/Authentication/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthContext } from '../../../context/Authentication/AuthContext';
import { IconLogin } from '@tabler/icons-react';
import { PageBanner } from '@whatsnxt/core-ui';
import { checkSuccessResponse, fetchUser, getCookieAccessToken, getErrorMessageFromResponse } from '../../../utils/commonHelper';

interface IFormData {
  email: string;
  name: string;
  password: string;
  terms: boolean;
  otp?: string;
}

type GuestCheckoutComponentProps = {
  // Define your component props here
};

export const GuestCheckoutComponent: FC<GuestCheckoutComponentProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('returnto') || '/';
  const [otpSent, setOtpSent] = useState(false);
  const { login } = useAuth()
  const [type, toggle] = useToggle(['register', 'login'] as const);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<IFormData>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      otp: '',
      terms: true,
    },
  });
  const dispatch = useDispatch();
  const isRegisterForm = type === 'register'

  useEffect(() => {
    if (!isRegisterForm) {
      setOtpSent(false)
    }
    reset()
  }, [isRegisterForm])

  const { setUser } = useContext(AuthContext); // Use setUser from AuthContext

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = getCookieAccessToken();
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Update AuthContext with the fetched user
        router.push(redirectUrl)
      }
    };
    fetchUser();
  }, [setUser]);

  const fetchCartInfo = async () => {
    const cartRes = await CartAPI.fetch();

    if (cartRes.cart) {
      dispatch({ type: 'UPDATE_CART', data: cartRes.cart });
    } else {
      await CartAPI.createCart();
    }
  };

  const otpSendHandler = useMutation(
    {
      mutationFn: async (formData: any) => await AuthAPI.otp(formData),
      onSuccess: (response: any) => {
        if (checkSuccessResponse(response)) {
          setOtpSent(true);
          notifications.show({
            position: 'bottom-right',
            title: 'Registration',
            message: 'OTP sent to your email address',
            color: 'green',
          });
          return;
        }
        notifications.show({
          position: 'bottom-right',
          title: 'Registration',
          message: 'Error on sending otp, try again!',
          color: 'red',
        });


      },
      onError: (error) => {
        notifications.show({
          position: 'bottom-right',
          title: 'Registration',
          message: getErrorMessageFromResponse(error) ? getErrorMessageFromResponse(error) : 'Error on sending otp, try again!',
          color: 'red',
        });
      },
    }
  );

  const registerHandler = useMutation(
    {
      mutationFn: async (formData: any) => await AuthAPI.createAccount(formData),
      onSuccess: async (response: any) => {
        if (checkSuccessResponse(response)) {
          const getToken = await getCookieAccessToken()
          notifications.show({
            position: 'bottom-right',
            title: 'Authentication Success',
            message: 'User registered successfully',
            color: 'green',
          });
          const userObject = await fetchUser(getToken);
          dispatch({ type: 'UPDATE_USER_INFO', data: userObject });
          dispatch({ type: 'UPDATE_USER_TOKEN', data: getToken });
          await login(userObject, false)
          router.push(redirectUrl);
        }

        // on error we will reset the form
        setOtpSent(false)
        reset({
          otp: '',
        });


      },
      onError: (error) => {

        // on error we will reset the form
        setOtpSent(false)
        reset({
          otp: '',
        });

        // error messages 
        if (getErrorMessageFromResponse(error)) {
          // setError('otp', { type: 'manual', message: getErrorMessageFromResponse(error) })

          notifications.show({
            position: 'bottom-right',
            title: 'Authentication Error',
            message: getErrorMessageFromResponse(error),
            color: 'red',
          });
        }
      },
    }
  );

  const loginHandler = useMutation(
    {
      mutationFn: async (formData: any) => await AuthAPI.login(formData),
      onSuccess: async (response: any) => {
        if (checkSuccessResponse(response)) {
          const getToken = await getCookieAccessToken()
          dispatch({ type: 'UPDATE_USER_TOKEN', data: getToken });
          const userObject = await fetchUser(getToken);
          dispatch({ type: 'UPDATE_USER_INFO', data: userObject });
          await fetchCartInfo();
          await login(userObject);
          router.push(redirectUrl);
        }

      },
      onError: (error) => {
        notifications.show({
          position: 'bottom-right',
          title: 'Authentication Error',
          message: getErrorMessageFromResponse(error),
          color: 'red',
        });
        setError('email', { type: 'manual', message: 'Unable to login' });
      },
    }
  );

  const onSubmit = async (formData: IFormData) => {

    if (!isRegisterForm) {
      loginHandler.mutate(formData)
    }

    if (isRegisterForm) {

      if (!otpSent) {
        otpSendHandler.mutate(formData)
        return;
      }

      registerHandler.mutate(formData)
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to the backend's Google OAuth endpoint
    const googleLoginUrl = `${process.env.NEXT_PUBLIC_BFF_HOST_GOOGLE_API}/login`;
    window.location.href = googleLoginUrl;
  };

  return (
    <Paper radius="md" p="xl" withBorder shadow="xl" w="100%" maw={500}>
      <Stack>
        <Group>
          <Grid>
            <IconLogin />
            <Text size='sm' my={0} ml={'0.2rem'}>
              {isRegisterForm && "Returning customer?"}
            </Text>
            <Anchor component="button" type="button" onClick={() => toggle()} size="md" ml={'0.2rem'}>
              {isRegisterForm
                ? <Text size='sm'>Click here to login</Text>
                : <Text size='sm'>Don't have an account? Register</Text>}
            </Anchor>
          </Grid>

        </Group>
      </Stack>

      {/* <Text size="xl" className="fs-4" fw={800}>{upperFirst(type)}</Text> */}
      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl" onClick={handleGoogleLogin}>Google</GoogleButton>
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />
      <Box pos="relative">
        <LoadingOverlay visible={registerHandler.isPending || otpSendHandler.isPending || loginHandler.isPending} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} />
        <form onSubmit={handleSubmit(onSubmit)} className='pb-10'>
          <Stack>
            {isRegisterForm && (
              <TextInput
                label="Name"
                placeholder="Your name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 3, message: 'Name should include at least 3 characters' },
                  validate: value => !/^\d/.test(value) || 'Name should not start with a number'
                })}
                error={errors.name && errors.name.message}
                radius="md"
              />
            )}

            <TextInput
              disabled={isRegisterForm && otpSent}
              label="Email"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
              error={errors.email && errors.email.message}
              radius="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password should include at least 6 characters' } })}
              error={errors.password && errors.password.message}
              radius="md"
            />

            {(otpSent && isRegisterForm) && (
              <PasswordInput
                label="OTP"
                placeholder="Enter OTP"
                {...register('otp', { required: 'OTP is required' })}
                error={errors.otp && errors.otp.message}
                radius="md"
              />
            )}

            {!isRegisterForm && (
              <div className="d-flex align-items-center justify-content-between">
                <Checkbox classNames={{ icon: styles.checkboxIcon }} label="Remember me" radius="xs" />
                <Anchor size='sm' component={Link} href="/reset-password">
                  Forgot password?
                </Anchor>
              </div>
            )}

            {isRegisterForm && (
              <div>
                <Checkbox
                  label="I accept terms and conditions"
                  classNames={{ icon: styles.checkboxIcon }}
                  {...register('terms', { required: 'You must accept terms and conditions' })}
                  error={errors.terms && errors.terms.message}
                />
              </div>
            )}
          </Stack>

          <Group justify="space-between" mt="xl">
            <Button disabled={otpSendHandler.isPending || registerHandler.isPending} loading={otpSendHandler.isPending || registerHandler.isPending} type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Box>

    </Paper>
  );
};
