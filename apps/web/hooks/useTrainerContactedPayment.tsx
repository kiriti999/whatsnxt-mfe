import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { type PaymentDetails, useRazorPayment, type RazorpayResponse } from "@whatsnxt/core-util/src/RazorPayment";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import { trainerContactedPaymentAPI } from "../api/v1/trainer-contacted-payment";
import { mailAPI } from "../api/v1/mail";
import useAlreadyHasPurchased from "./useAleradyHasPurchased";
import { updateContactedStudents } from "../app/_component/trainer/TrainerDetails/actions";
import { revalidate } from "../server-actions";

export default function useTrainerContactedPayment(trainerId: string, returnto: string, refetchGetPayment: () => void) {
    const [isVisible, { open, close }] = useDisclosure(false);
    const [payNowModalOpened, setPayNowModalOpened] = useState(false);
    const [contactDetailsOpened, setContactDetailsOpened] = useState(false);
    const router = useRouter();

    const { payload, hasPurchased, refetchQuery, notLoggedIn, userId, buyerEmail } = useAlreadyHasPurchased(trainerId);

    if (notLoggedIn) {
        return {
            notLoggedIn,
            payNowModalOpened,
            setPayNowModalOpened,
            handlePayment: () => router.push(`/authentication?returnto=${returnto}`)
        }
    }

    const verifyPayment = async (orderId: string, verificationDetails: RazorpayResponse) => {
        try {
            return await trainerContactedPaymentAPI.verifyPayment(orderId, verificationDetails);
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error; // Propagate the error to handle in the main logic
        }
    };

    const processPayment = async (paymentDetails: PaymentDetails) => {
        console.log(paymentDetails, 'paymentDetails77')
        try {
            open();
            await Promise.all([
                trainerContactedPaymentAPI.updateOrder(paymentDetails.orderId, paymentDetails),
                mailAPI.sendTrainerContactedMail(paymentDetails)
            ])
            refetchQuery(); // refetch hasAlreadyPurcahsed query
            refetchGetPayment(); // refetch get payment query
            // this action is responsible for adding student to contactedStudents array
            await updateContactedStudents(payload.trainerId, payload.userId)
            await revalidate(`/trainer-details/${trainerId}`)
        } catch (error) {
            console.error('Error during contacted payment update or mail operation:', error);
            notifications.show({
                position: 'bottom-right',
                title: 'API error',
                message: 'Error while updating contacted students or sending purchase mail',
                color: 'red'
            })
        } finally {
            setContactDetailsOpened(true);
            close();
        };
    }

    // Destructure the makePayment function from the returned object
    const { makePayment, isLoading, error } = useRazorPayment({ processPayment, verifyPayment });

    const handlePayment = useCallback(async () => {
        setPayNowModalOpened(false);
        open();

        try {
            const response = await trainerContactedPaymentAPI.createOrder(payload);
            const { order } = response.data;

            // Now call makePayment as a function
            makePayment(order.id, payload, close);
        } catch (err) {
            close();
            notifications.show({
                position: 'bottom-right',
                title: 'API error',
                message: 'trainerContactedPayment API failed',
                color: 'red',
            });
        }
    }, [makePayment, open, close, payload]); // Added makePayment and payload to dependencies

    return {
        isVisible,
        payNowModalOpened,
        setPayNowModalOpened,
        contactDetailsOpened,
        setContactDetailsOpened,
        handlePayment,
        hasPurchased,
        buyerEmail,
        refetchQuery,
        isLoading, // You might want to expose these for UI states
        error,
    };
}