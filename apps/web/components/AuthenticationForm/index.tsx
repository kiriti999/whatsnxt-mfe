"use client"
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useToggle, upperFirst } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import {
  TextInput,
  PasswordInput,
  Text,
  Paper,
  Group,
  PaperProps,
  Button,
  Divider,
  Checkbox,
  Anchor,
  Stack,
  LoadingOverlay,
  Box,
  Container,
  Title,
  Alert,
  rem
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconCheck } from '@tabler/icons-react';
import { GoogleButton } from '@whatsnxt/core-ui/src/GoogleButton';
import Link from 'next/link';
import { CartAPI } from '../../apis/v1/cart/cart';
import { AuthAPI } from '../../apis/v1/auth';
import { useMutation } from '@tanstack/react-query';
import useAuth from '../../hooks/Authentication/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkSuccessResponse, fetchUser, getErrorMessageFromResponse } from '../../utils/commonHelper';

// Import RTK actions
import { updateCart, addToCart } from '../../store/slices/cartSlice';
import { updateUserInfo } from '../../store/slices/userSlice';

interface IFormData {
  email: string;
  name: string;
  password: string;
  terms: boolean;
  otp?: string;
}

// Global flag to prevent multiple Google auth processing
let isGoogleAuthProcessing = false;

export function AuthenticationForm(props: PaperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('returnto') || '/';
  const [otpSent, setOtpSent] = useState(false);
  const { login, user } = useAuth();
  const [type, toggle] = useToggle(['login', 'register'] as const);
  const dispatch = useDispatch();
  const isRegisterForm = type === 'register';
  const [hasProcessedGoogle, setHasProcessedGoogle] = useState(false);
  const processedRef = useRef(false); // Ref to track processing across re-renders

  const form = useForm<IFormData>({
    initialValues: {
      email: '',
      name: '',
      password: '',
      otp: '',
      terms: false,
    },
    validate: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
      },
      name: (value) => {
        if (isRegisterForm) {
          if (!value) return 'Name is required';
          if (value.length < 3) return 'Name should include at least 3 characters';
          if (/^\d/.test(value)) return 'Name should not start with a number';
        }
        return null;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password should include at least 6 characters';
        return null;
      },
      otp: (value) => {
        if (otpSent && isRegisterForm && !value) return 'OTP is required';
        return null;
      },
      terms: (value) => {
        if (isRegisterForm && !value) return 'You must accept terms and conditions';
        return null;
      },
    },
  });

  // FIXED: Handle Google auth with multiple safeguards
  useEffect(() => {
    console.log('🔍 Google auth handler useEffect triggered');

    const googleStatus = searchParams.get('google');
    const error = searchParams.get('error');

    console.log('🔍 googleStatus:', googleStatus);
    console.log('🔍 Global flag:', isGoogleAuthProcessing);
    console.log('🔍 Local state:', hasProcessedGoogle);
    console.log('🔍 Ref state:', processedRef.current);

    // Multiple safeguards to prevent double processing
    if (hasProcessedGoogle || processedRef.current || isGoogleAuthProcessing) {
      console.log('🔍 Already processed Google auth, skipping');
      return;
    }

    // Handle Google login error
    if (googleStatus === 'error') {
      console.log('🔴 Google login error detected');

      // Set all flags
      setHasProcessedGoogle(true);
      processedRef.current = true;
      isGoogleAuthProcessing = true;

      notifications.show({
        title: 'Login Failed',
        message: 'Google authentication failed. Please try again.',
        color: 'red',
      });

      // Clean up URL
      cleanupUrl();

      // Reset flags after processing
      setTimeout(() => {
        isGoogleAuthProcessing = false;
      }, 1000);

      return;
    }

    // Handle Google login success
    if (googleStatus === 'success') {
      console.log('🟢 Google login success detected');

      // Set all flags immediately
      setHasProcessedGoogle(true);
      processedRef.current = true;
      isGoogleAuthProcessing = true;

      // Show success notification
      notifications.show({
        title: 'Welcome!',
        message: 'Successfully logged in with Google',
        color: 'green',
      });

      // Clean up URL
      cleanupUrl();

      // Check if user is already authenticated
      if (user?.isAuthenticated) {
        console.log('🟢 User is already authenticated, redirecting immediately');

        // Reset global flag and redirect
        setTimeout(() => {
          isGoogleAuthProcessing = false;
          router.push(redirectUrl);
        }, 1000);
      } else {
        console.log('🟢 User not yet authenticated, forcing page refresh');

        // Force a page refresh to get the updated user data from server
        setTimeout(() => {
          isGoogleAuthProcessing = false;
          window.location.href = redirectUrl;
        }, 1000);
      }
    }

    function cleanupUrl() {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('google');
      cleanUrl.searchParams.delete('error');
      cleanUrl.searchParams.delete('message');
      window.history.replaceState({}, '', cleanUrl.toString());
      console.log('🔍 URL cleaned up to:', cleanUrl.toString());
    }

  }, [searchParams, user, redirectUrl, hasProcessedGoogle, router]);

  // Separate effect for normal authenticated user redirect
  useEffect(() => {
    const googleStatus = searchParams.get('google');

    // Only redirect if user is authenticated AND not processing Google auth AND no Google params
    if (user?.isAuthenticated && !googleStatus && !hasProcessedGoogle && !processedRef.current) {
      console.log('🔍 Normal authenticated user redirect to:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl, searchParams, hasProcessedGoogle]);

  // Reset processing flag when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔍 Component unmounting, resetting flags');
      isGoogleAuthProcessing = false;
      processedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isRegisterForm) {
      setOtpSent(false);
    }
    form.reset();
  }, [isRegisterForm]);

  const fetchCartInfo = async () => {
    try {
      const cartRes = await CartAPI.fetch();
      const localCarts = localStorage.getItem("cart");

      if (cartRes.cart) {
        // Update cart with server data
        dispatch(updateCart({
          cartItems: cartRes.cart.cartItems || [],
          discount: cartRes.cart.discount || 0
        }));

        if (localCarts) {
          const localCartObj = JSON.parse(localCarts) as { cartItems: any[] };

          // Loop through localStorage items and add them to user's cart
          localCartObj.cartItems.forEach(item => {
            // Exclude course if already in user's cart
            const itemExists = cartRes.cart.cartItems.some(cartItem => item.id === cartItem.id);
            if (itemExists) return;

            // Clean up the item data and add to cart
            const courseObj = {
              ...item,
              id: item.id.replace("price_", ""),
              price: item.total_cost || item.price || 0,
              quantity: item.quantity || 1
            };

            dispatch(addToCart(courseObj));
          });
        }
        return;
      }

      // No cart exists, create one
      await CartAPI.createCart();

      if (localCarts) {
        const localCartObj = JSON.parse(localCarts) as { cartItems: any[] };

        // Loop through localStorage and add items to new cart
        localCartObj.cartItems.forEach(item => {
          const courseObj = {
            ...item,
            id: item.id.replace("price_", ""),
            price: item.total_cost || item.price || 0,
            quantity: item.quantity || 1
          };

          dispatch(addToCart(courseObj));
        });
      }
    } catch (error) {
      console.error('Error fetching cart info:', error);
    }
  };

  const otpSendHandler = useMutation({
    mutationFn: async (formData: any) => await AuthAPI.otp(formData),
    onSuccess: (response: any) => {
      if (checkSuccessResponse(response)) {
        setOtpSent(true);
        notifications.show({
          title: 'OTP Sent',
          message: 'Please check your email for the verification code',
          color: 'green',
          icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
        });
        return;
      }
      notifications.show({
        title: 'Error',
        message: 'Failed to send OTP. Please try again.',
        color: 'red',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: getErrorMessageFromResponse(error) || 'Failed to send OTP. Please try again.',
        color: 'red',
      });
    },
  });

  const registerHandler = useMutation({
    mutationFn: async (formData: any) => await AuthAPI.createAccount(formData),
    onSuccess: async (response: any) => {
      if (checkSuccessResponse(response)) {
        notifications.show({
          title: 'Registration Successful',
          message: 'Please log in to continue',
          color: 'green',
          autoClose: 5000,
        });

        form.reset();
        toggle();
      }
    },
    onError: (error) => {
      // Clear only the OTP field while keeping other form data
      form.setFieldValue('otp', '');

      const errorMessage = getErrorMessageFromResponse(error);
      if (errorMessage) {
        form.setFieldError('otp', errorMessage);
        notifications.show({
          title: 'Registration Failed',
          message: errorMessage,
          color: 'red',
        });
      }
    },
  });

  const loginHandler = useMutation({
    mutationFn: async (formData: any) => await AuthAPI.login(formData),
    onSuccess: async (response: any) => {
      if (checkSuccessResponse(response)) {
        const token = response.token;
        const userObject = await fetchUser(token);

        // Update Redux state with user info
        dispatch(updateUserInfo(userObject));

        // Login through auth context
        await login(userObject);

        // Fetch and merge cart info
        await fetchCartInfo();

        // Redirect to intended page
        router.push(redirectUrl);
      }
    },
    onError: (error) => {
      const errorMessage = getErrorMessageFromResponse(error);
      notifications.show({
        title: 'Login Failed',
        message: errorMessage || 'Invalid credentials',
        color: 'red',
      });
      form.setFieldError('email', 'Please check your credentials');
    },
  });

  const handleSubmit = async (values: IFormData) => {
    if (!isRegisterForm) {
      loginHandler.mutate(values);
    } else {
      if (!otpSent) {
        otpSendHandler.mutate(values);
        return;
      }
      registerHandler.mutate(values);
    }
  };

  const handleResendOTP = () => {
    otpSendHandler.mutate(form.values);
  };

  const handleGoogleLogin = () => {
    // Add returnto parameter to the Google login URL
    const returnto = encodeURIComponent(redirectUrl);
    const googleLoginUrl = `${process.env.NEXT_PUBLIC_BFF_HOST_GOOGLE_API}/login?returnto=${returnto}`;
    window.location.href = googleLoginUrl;
  };

  const isLoading = registerHandler.isPending || otpSendHandler.isPending || loginHandler.isPending;

  return (
    <Container size={420} my={40}>
      <Paper radius="md" p="xl" withBorder shadow="lg" {...props}>
        <Title order={2} ta="center" fw={900} mb="md">
          {upperFirst(type)}
        </Title>

        <Group grow mb="md">
          <GoogleButton
            radius="xl"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            variant="default"
            size="md"
          >
            Continue with Google
          </GoogleButton>
        </Group>

        <Divider label="Or continue with email" labelPosition="center" my="lg" />

        <Box pos="relative">
          <LoadingOverlay
            visible={isLoading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {isRegisterForm && (
                <TextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  radius="md"
                  size="md"
                  disabled={otpSent}
                  {...form.getInputProps('name')}
                />
              )}

              <TextInput
                label="Email Address"
                placeholder="your@email.com"
                radius="md"
                size="md"
                disabled={isRegisterForm && otpSent}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                radius="md"
                size="md"
                {...form.getInputProps('password')}
              />

              {otpSent && isRegisterForm && (
                <>
                  <PasswordInput
                    label="Verification Code"
                    placeholder="Enter the 6-digit code"
                    radius="md"
                    size="md"
                    {...form.getInputProps('otp')}
                  />

                  <Alert icon={<IconInfoCircle size="1rem" />} color="blue" variant="light">
                    <Text size="sm">
                      Didn't receive the code?{' '}
                      <Anchor
                        component="button"
                        type="button"
                        onClick={handleResendOTP}
                        disabled={otpSendHandler.isPending}
                      >
                        {otpSendHandler.isPending ? 'Sending...' : 'Resend OTP'}
                      </Anchor>
                    </Text>
                  </Alert>
                </>
              )}

              {!isRegisterForm && (
                <Group justify="space-between">
                  <Checkbox label="Remember me" />
                  <Anchor component={Link} href="/reset-password" size="sm">
                    Forgot password?
                  </Anchor>
                </Group>
              )}

              {isRegisterForm && (
                <Checkbox
                  label="I agree to the terms and conditions"
                  {...form.getInputProps('terms', { type: 'checkbox' })}
                />
              )}

              <Button
                type="submit"
                fullWidth
                radius="md"
                size="md"
                loading={isLoading}
                disabled={isLoading}
              >
                {isRegisterForm && !otpSent ? 'Send Verification Code' : upperFirst(type)}
              </Button>

              <Text c="dimmed" size="sm" ta="center">
                {isRegisterForm ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Anchor
                  component="button"
                  type="button"
                  onClick={() => toggle()}
                  size="sm"
                >
                  {isRegisterForm ? 'Sign in' : 'Create account'}
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}