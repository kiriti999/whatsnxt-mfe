import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { razorPaymentAPI } from "../apis/v1/payment/razorpay";
import { labPurchaseAPI, type LabPurchase } from "../apis/v1/labPurchases";
import { revalidate } from "../server-actions";

type Props = {
    purchase: LabPurchase | null;
    setIsRefundModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess?: () => void;
};

export default function useLabRefund({
    purchase,
    setIsRefundModalOpen,
    onSuccess,
}: Props) {
    const [isRefundLoading, setIsRefundLoading] = useState(false);

    const handleRefund = async (reasons: Array<string>, message = '') => {
        if (!purchase) {
            notifications.show({
                title: 'Refund error',
                color: 'red',
                message: 'No purchase selected for refund',
            });
            return;
        }

        if (reasons.length === 0) {
            return;
        }

        setIsRefundLoading(true);

        try {
            // Get payment details from Razorpay
            const paymentId = purchase.metadata?.razorpayPaymentId;

            if (!paymentId) {
                throw new Error('Payment ID not found for this purchase');
            }

            const { data: paymentDetails } = await razorPaymentAPI.getPaymentDetailsById(paymentId);
            console.log(paymentDetails, 'paymentDetails');

            if (paymentDetails.status === "captured" || paymentDetails.status === "refunded") {
                // Calculate refund amount (in paise)
                const refundAmount = purchase.amountPaid * 100;

                const { data: refundData } = await razorPaymentAPI.refundPayment(
                    paymentDetails.id,
                    refundAmount
                );
                console.log(refundData, 'refundData');

                // Update the lab purchase status
                await labPurchaseAPI.requestRefund(purchase.labId, {
                    reasons,
                    message,
                    refundId: refundData.id,
                    refundAmount: refundData.amount,
                    refundStatus: refundData.status,
                });

                notifications.show({
                    title: 'Refund success',
                    color: 'green',
                    message: 'Your lab refund has been processed successfully!',
                });

                // Revalidate and call success callback
                await revalidate('/purchase-history');
                onSuccess?.();
            } else {
                throw new Error(`Payment can't be refunded because the status is: ${paymentDetails.status}`);
            }
        } catch (error: any) {
            console.error('Lab refund error:', error);
            notifications.show({
                title: 'Refund error',
                color: 'red',
                message: error.message || 'Failed to process refund. Please try again.',
            });
        } finally {
            setIsRefundLoading(false);
            setIsRefundModalOpen(false);
        }
    };

    return { handleRefund, isRefundLoading };
}
