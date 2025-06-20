import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { trainerContactedPaymentAPI } from "../apis/v1/trainer-contacted-payment";
import { razorPaymentAPI } from "../apis/v1/payment/razorpay";
import { mailAPI } from "../apis/v1/mail";

type PROPS = {
    trainerName: string;
    paymentId: string;
    buyerEmail: string;
    refetchQuery: () => void;
    setContactDetailsOpened?: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useTrainerContactedRefund({
    trainerName,
    paymentId,
    buyerEmail,
    refetchQuery,
    setContactDetailsOpened
}: PROPS) {
    const [isRefundLoading, setIsRefundLoading] = useState(false);

    const handleRefund = async (reasons: Array<string>, message = '') => {
        if (reasons.length === 0) {
            return;
        }
        setIsRefundLoading(true);

        try {
            if (paymentId) {
                const { data: paymentDetails } = await razorPaymentAPI.getPaymentDetailsById(paymentId);
                console.log(paymentDetails, 'paymentDetails');

                if (paymentDetails.status === "captured") {
                    const { data: refundData } = await razorPaymentAPI.refundPayment(paymentDetails.id, paymentDetails.amount);
                    console.log(refundData, 'refundData');
                    await Promise.all([
                        trainerContactedPaymentAPI.updateOrder(
                            paymentDetails.order_id,
                            {
                                status: 'refunded',
                                refund_status: refundData.status,
                                refund_message: message,
                                refund_reasons: reasons,
                                amount_paid: paymentDetails.amount - refundData.amount,
                                amount_refunded: refundData.amount,
                            }
                        ),
                        mailAPI.sendContactDetailsRefundMail({
                            trainerName,
                            reason: message,
                            buyerEmail,
                            amount: refundData.amount,
                        })
                    ])
                } else {
                    throw new Error(`payment can't be refunded, because the status is not captured!`);
                }
            } else {
                throw new Error('paymentId is undefined!')
            }

            refetchQuery(); // refetch hasAlreadyPurcahsed query
            notifications.show({
                title: 'Refund success',
                color: 'green',
                message: 'Refund has been done successfully!',
            })
        } catch (error) {
            notifications.show({
                title: 'Refund error',
                color: 'red',
                message: error.message || 'Refund has been failed!',
            })
        } finally {
            setContactDetailsOpened(false);
            setIsRefundLoading(false);
        }
    }

    return { handleRefund, isRefundLoading };
}
