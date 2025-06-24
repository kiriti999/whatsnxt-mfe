import React, { FC, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRazorPayment } from '@whatsnxt/core-util/src/RazorPayment';
import { PaymentDetails } from '@whatsnxt/core-util/src/Types/RazorPay';
import { notifications } from '@mantine/notifications';
import { Button, Text, Box, Group, Stack } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { orderAPI } from '../../../apis/v1/orders';

import useAuth from '../../../hooks/Authentication/useAuth';
import { PaymentButtonProps, RazorpayResponse } from '../types';
import { revalidate } from '../../../server-actions';
import styles from './PaymentButton.module.css';
import { sendPurchaseMail } from '../../../utils/coursePurchaseMail';

// GST rate constant
const GST_RATE = 0; // 18%

const showErrorNotification = (message: string) => {
  notifications.show({
    position: 'bottom-right',
    title: 'Error',
    message,
    color: 'red',
  });
};

export const PaymentButton: FC<PaymentButtonProps> = ({
  amount,
  loading,
  cartItems,
  onClearCart,
  open,
  close,
}) => {
  const { user } = useAuth();

  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    _id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Calculate base amount and GST
  const baseAmount = Number(amount);
  const gstAmount = baseAmount * GST_RATE;
  const totalAmount = baseAmount + gstAmount;

  useEffect(() => {
    if (user) {
      setUserInfo({ ...user });
    }
  }, [user]);

  const preparePayload = useCallback(() => {
    const courseInfo = cartItems.map((item) => ({
      courseId: item.id,
      courseName: item.courseName,
      price: item.total_cost || 0,
      total_cost: item.total_cost + (item.total_cost * GST_RATE) || 0,
    }));

    const payload = {
      name: 'Whatsnxt',
      description: 'Whatsnxt course purchase',
      userId: userInfo._id || null,
      buyerEmail: userInfo.email,
      buyerName: userInfo.name,
      // Use totalAmount (base + GST) for payment
      amount: String(Math.round(Number(totalAmount) * 100)), // Convert amount to integer (subunits)
      gstAmount: String(Math.round(Number(gstAmount) * 100)),
      courseInfo,
      notes: {
        address: userInfo?.address,
        gstDetails: `GST (0%): ₹${gstAmount.toFixed(2)}`,
      },
      prefill: {
        name: userInfo.name,
        email: userInfo?.email,
        contact: userInfo?.phone,
      },
    };

    return payload;
  }, [cartItems, userInfo, gstAmount, totalAmount]);

  const verifyPayment = async (orderId: string, verificationDetails: RazorpayResponse) => {
    try {
      return await orderAPI.verifyPayment(orderId, verificationDetails);
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error; // Propagate the error to handle in the main logic
    }
  };

  const processPayment = async (paymentDetails: PaymentDetails) => {
    try {
      open();
      onClearCart();

      // Save payment first
      const response = await orderAPI.savePayment({
        ...paymentDetails,
        cartItems,
        // gstRate: '18%',
      });

      // Revalidate cache
      cartItems.forEach(async (item) => await revalidate(`/courses/${item.slug}`));
      await revalidate('/my-courses');

      // Navigate to success page
      router.replace('/checkout/success');

      if (response.status === 200) {
        // Send mail after payment is processed
        await sendPurchaseMail(paymentDetails, cartItems);
      }

    } catch (error) {
      console.error('Error during payment or mail operation:', error);
      close();
      showErrorNotification('Error while processing payment or sending purchase mail');
    }
  };

  // FIX: Destructure the object returned by useRazorPayment
  const { makePayment, isLoading: razorPayLoading, error: razorPayError } = useRazorPayment({
    verifyPayment,
    processPayment
  });

  const handlePayment = useCallback(async () => {
    if (!user) {
      router.push("/authentication?returnto=/checkout/user-checkout");
      return;
    }
    open();

    const apiPayload = preparePayload();

    // Create a separate payload for makePayment that matches the Payload type
    const razorpayPayload = {
      name: apiPayload.name,
      userId: apiPayload.userId,
      buyerEmail: apiPayload.buyerEmail,
      buyerName: apiPayload.buyerName,
      description: apiPayload.description,
      amount: apiPayload.amount,
      gstAmount: apiPayload.gstAmount,
      courseInfo: apiPayload.courseInfo,
      // Convert notes object to string for Razorpay
      notes: `Address: ${apiPayload.notes.address || 'N/A'}, ${apiPayload.notes.gstDetails}`,
      prefill: apiPayload.prefill,
    };

    try {
      const response = await orderAPI.createOrder(apiPayload)

      const { order } = response.data;
      // Pass the properly typed payload to makePayment
      makePayment(order.id, razorpayPayload, close)
    } catch (err) {
      showErrorNotification('createOrder api failed');
      close();
    }

  }, [preparePayload, makePayment, user, router, open, close]);

  return (
    <div className={styles['payment-box']}>
      {/* Add price breakdown section */}
      <Box mb="md">
        <Stack>
          <Group justify="space-between" w="100%">
            <Text size="sm" c="dimmed" m={0}>GST (0%):</Text>
            <Text size="sm">₹{gstAmount.toFixed(2)}</Text>
          </Group>
          <Group justify="space-between" w="100%">
            <Text size="md" c="dimmed" m={0} fw={700}>Total Amount:</Text>
            <Text size="md" fw={700}>₹{totalAmount.toFixed(2)}</Text>
          </Group>
        </Stack>
      </Box>

      <Button color='red' size='md'
        className={`mt-3 ${loading ? 'no-click' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          handlePayment();
        }}
        leftSection={<IconShoppingCart />}
        disabled={loading}
      >
        Make Payment (₹{totalAmount.toFixed(2)})
      </Button>

      {/* Optional: Display razor pay error if needed */}
      {razorPayError && (
        <Text size="sm" c="red" mt="xs">
          {razorPayError}
        </Text>
      )}
    </div>
  );
};