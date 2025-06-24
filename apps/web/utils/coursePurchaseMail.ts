import { PaymentDetails } from '@whatsnxt/core-util/src/Types/RazorPay';
import { mailAPI } from '../apis/v1/mail';
import { notifications } from '@mantine/notifications';

export const sendPurchaseMail = async (paymentDetails: PaymentDetails, cartItems) => {
    try {
        await mailAPI.sendCoursePurchaseMail({
            ...paymentDetails,
            cartItems,
            // gstRate: '18%',
        });
    } catch (mailError) {
        console.error('Error sending purchase mail:', mailError);
        notifications.show({
            position: 'bottom-right',
            title: 'Error',
            message: 'Purchase mail could not be sent. Please check your inbox later',
            color: 'red',
        });
    }
};