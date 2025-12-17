import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { razorPaymentAPI } from '../../../apps/web/apis/v1/payment/razorpay';
import { UseRazorProps, HandleResponseArgs, Payload } from './Types/RazorPay';

// Declare Razorpay type for window object
declare global {
    interface Window {
        Razorpay: any;
    }
}

export const useRazorPayment = ({ processPayment, verifyPayment = () => ({ status: 200 }) }: UseRazorProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRazorpayReady, setIsRazorpayReady] = useState(false);

    // Check if Razorpay script is loaded
    useEffect(() => {
        const checkRazorpay = () => {
            if (typeof window !== 'undefined' && window.Razorpay) {
                setIsRazorpayReady(true);
            }
        };

        // Check immediately
        checkRazorpay();

        // Poll for Razorpay to be available
        const interval = setInterval(() => {
            if (window.Razorpay) {
                setIsRazorpayReady(true);
                clearInterval(interval);
            }
        }, 100);

        // Cleanup after 10 seconds
        const timeout = setTimeout(() => {
            clearInterval(interval);
            if (!window.Razorpay) {
                console.error('Razorpay script failed to load');
            }
        }, 10000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const handleRazorpayResponse = useCallback(
        async (
            { response, amount, gstAmount, userId, trainerId, buyerEmail, buyerName }: HandleResponseArgs
        ) => {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

            if (!(razorpay_payment_id && razorpay_order_id && razorpay_signature)) {
                return notifications.show({
                    position: 'bottom-right',
                    title: 'Payment Failed',
                    message: 'Payment verification failed',
                    color: 'red',
                });
            }

            try {
                const { status } = await verifyPayment(razorpay_order_id, {
                    razorpay_payment_id,
                    razorpay_order_id,
                    razorpay_signature,
                });

                if (status === 200) {
                    // Fetch payment details
                    const { data } = await razorPaymentAPI.getPaymentDetailsById(razorpay_payment_id);

                    // call processPayment
                    await processPayment({
                        orderId: razorpay_order_id,
                        paymentId: razorpay_payment_id,
                        userId,
                        trainerId,
                        buyerEmail,
                        buyerName,
                        amount,
                        amount_paid: amount,
                        gstAmount,
                        method: data?.method,
                        bank: data?.bank,
                        wallet: data?.wallet,
                        cardNetwork: data?.card?.network,
                        cardLast4: data?.card?.last4
                    });
                } else {
                    notifications.show({
                        position: 'bottom-right',
                        title: 'Payment Failed',
                        message: 'Payment verification failed',
                        color: 'red',
                    })
                }
            } catch (error) {
                console.error('Error handling payment response:', error);
                notifications.show({
                    position: 'bottom-right',
                    title: 'Payment Failed',
                    message: 'An error occurred during payment processing',
                    color: 'red',
                })
            }
        },
        [processPayment, verifyPayment]
    );

    const makePayment = useCallback((
        orderId: string,
        payload: Payload,
        close: () => void,
    ) => {
        // Check if Razorpay is available
        if (typeof window === 'undefined' || !window.Razorpay) {
            notifications.show({
                position: 'bottom-right',
                title: 'Payment System Not Ready',
                message: 'Please wait a moment and try again. The payment system is still loading.',
                color: 'yellow',
            });
            close();
            return;
        }

        try {
            setIsLoading(true);

            // Convert amount to number if it's a string
            const amountInPaise = typeof payload.amount === 'string'
                ? parseInt(payload.amount)
                : payload.amount;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string,
                order_id: orderId,
                amount: amountInPaise,
                currency: payload.currency || 'INR',
                name: payload.name,
                description: payload.description,
                image: process.env.NEXT_PUBLIC_RAZORPAY_LOGO,
                handler: async (response: any) => {
                    await handleRazorpayResponse({
                        response,
                        amount: payload.amount,
                        amount_paid: payload.amount,
                        gstAmount: payload.gstAmount,
                        userId: payload.userId,
                        trainerId: payload.trainerId,
                        buyerEmail: payload.buyerEmail,
                        buyerName: payload.buyerName
                    });
                    setIsLoading(false);
                },
                prefill: {
                    name: payload.prefill?.name || '',
                    email: payload.prefill?.email || '',
                    contact: payload.prefill?.contact || '',
                },
                notes: payload.notes || {},
                theme: {
                    color: payload.theme?.color || '#3399cc'
                },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal dismissed by user.');
                        setIsLoading(false);
                        close();
                        notifications.show({
                            position: 'bottom-right',
                            title: 'Payment Cancelled',
                            message: 'Payment was cancelled by the user.',
                            color: 'yellow',
                        });
                    }
                }
            };

            const rzpay = new window.Razorpay(options);

            // Handle payment failure
            rzpay.on('payment.failed', (response: any) => {
                console.error('Payment failed:', response);
                setIsLoading(false);
                close();
                notifications.show({
                    position: 'bottom-right',
                    title: 'Payment Failed',
                    message: response.error?.description || 'Payment failed',
                    color: 'red',
                });
            });

            rzpay.open();
        }
        catch (error) {
            console.error('Error occurred during payment:', error);
            setIsLoading(false);
            close();
            notifications.show({
                position: 'bottom-right',
                title: 'Payment Error',
                message: 'Error occurred during payment',
                color: 'red',
            });
        }
    }, [handleRazorpayResponse]);


    return { makePayment, isLoading: isLoading || !isRazorpayReady, error: null };
}
