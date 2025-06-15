import { useCallback } from 'react';
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import { notifications } from '@mantine/notifications';
import { razorPaymentAPI } from '../../../apps/web/api/v1/payment/razorpay';

// Define currency type based on what Razorpay accepts
type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'AED';

type SharedArgs = {
    amount: string;
    amount_paid?: string;
    gstAmount?: string;
    gstRate?: string;
    userId?: string,
    trainerId?: string,
    buyerEmail?: string;
    buyerName?: string;
}

type Payload = {
    currency?: CurrencyCode; // Changed from string to CurrencyCode
    name: string;
    description: string;
    gstAmount?: string;
    prefill?: Record<string, unknown>;
    notes?: string; // Changed to string to match RazorpayOrderOptions
    theme?: Record<string, unknown>;
} & SharedArgs

export type RazorpayResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
};

type HandleResponseArgs = {
    response: RazorpayResponse,
} & SharedArgs

export type PaymentDetails = {
    orderId: string;
    paymentId: string;
    method: string;
    gstAmount?: string;
    gstRate?: string;
    bank?: string;
    wallet?: string;
    cardNetwork?: string;
    cardLast4?: string;
} & SharedArgs

type UseRazorProps = {
    verifyPayment?: (orderId: string, verificationDetails: RazorpayResponse) => Promise<any> | any,
    processPayment: (paymentDetails: PaymentDetails) => Promise<void> | void,
}

export const useRazorPayment = ({ processPayment, verifyPayment = () => ({ status: 200 }) }: UseRazorProps) => {
    const { error, isLoading, Razorpay } = useRazorpay();

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
                    console.log(data, 'razor_paymentDetails');

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
                        gstRate: '18%',
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
        if (!Razorpay) {
            notifications.show({
                position: 'bottom-right',
                title: 'Payment Error',
                message: 'Razorpay is not loaded',
                color: 'red',
            });
            return;
        }

        try {
            // Convert amount to number if it's a string
            const amountInPaise = typeof payload.amount === 'string'
                ? parseInt(payload.amount)
                : payload.amount;

            const options: RazorpayOrderOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string, // Use NEXT_PUBLIC_ prefix
                order_id: orderId,
                amount: amountInPaise,
                currency: payload.currency || 'INR',
                name: payload.name,
                description: payload.description,
                image: process.env.NEXT_PUBLIC_RAZORPAY_LOGO,
                handler: (response) => handleRazorpayResponse({
                    response,
                    amount: payload.amount,
                    amount_paid: payload.amount,
                    gstAmount: payload.gstAmount,
                    userId: payload.userId,
                    trainerId: payload.trainerId,
                    buyerEmail: payload.buyerEmail,
                    buyerName: payload.buyerName
                }),
                prefill: payload.prefill as {
                    name?: string;
                    email?: string;
                    contact?: string;
                },
                notes: payload.notes || '', // Changed to string
                theme: payload.theme ? {
                    color: (payload.theme as any).color || '#3399cc'
                } : { color: '#3399cc' },
                modal: {
                    ondismiss: () => {
                        console.log('Payment modal dismissed by user.');
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

            const rzpay = new Razorpay(options);

            // Handle payment failure
            rzpay.on('payment.failed', (response: any) => {
                console.error('Payment failed:', response);
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
            close();
            notifications.show({
                position: 'bottom-right',
                title: 'Payment Error',
                message: 'Error occurred during payment',
                color: 'red',
            });
        }
    }, [Razorpay, handleRazorpayResponse]);

    return { makePayment, isLoading, error };
}