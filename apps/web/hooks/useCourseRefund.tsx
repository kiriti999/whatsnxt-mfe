import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { mailAPI } from "../api/v1/mail";
import { orderAPI } from "../api/v1/orders";
import { razorPaymentAPI } from "../api/v1/payment/razorpay";
import { CoursesEnrolledAPI } from "../api/v1/courses/enrolled/enrolled";
import { revalidate } from "../server-actions";
import isRefundEligible from "../utils/isRefundEligible";

type PROPS = {
    courseId: string;
    courseName: string;
    userId: string;
    buyerEmail: string;
    setIsRefundModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function useCourseRefund({
    userId,
    buyerEmail,
    courseId,
    courseName,
    setIsRefundModalOpen,
}: PROPS) {
    const [isRefundLoading, setIsRefundLoading] = useState(false);
    console.log(courseId, 'courseId');
    console.log(userId, 'userId');

    const { data } = useQuery({
        queryKey: [userId, courseId],
        queryFn: async () => {
            const response = await orderAPI.getPaidOrderByCourseId(userId, courseId);
            return response.data;
        },
    });
    console.log(data, 'paid order');

    const manyCourses = data?.courseInfo.length > 1;
    const currentCourse = data?.courseInfo?.find(course => course.courseId?._id === courseId);
    const refundAmount = currentCourse?.total_cost * 100;

    const isRefundEligable = isRefundEligible(data?.updatedAt);

    const handleRefund = async (reasons: Array<string>, message = '') => {
        if (reasons.length === 0) {
            return;
        }
        setIsRefundLoading(true);

        try {
            if (data?.paymentId) {
                const { data: paymentDetails } = await razorPaymentAPI.getPaymentDetailsById(data.paymentId);
                console.log(paymentDetails, 'paymentDetails');

                if (paymentDetails.status === "captured" || paymentDetails.status === "refunded") {
                    const { data: refundData } = await razorPaymentAPI.refundPayment(
                        paymentDetails.id,
                        refundAmount
                    );
                    console.log(refundData, 'refundData');

                    await Promise.all([
                        orderAPI.updateOrder(
                            paymentDetails.order_id,
                            {
                                status: manyCourses ? 'partial_refunded' : 'refunded',
                                refund_status: refundData.status,
                                refund_reasons: reasons,
                                refund_message: message,
                                amount_paid: paymentDetails.amount - paymentDetails.amount_refunded - refundData.amount,
                                amount_refunded: paymentDetails.amount_refunded + refundData.amount,
                                courseId,
                            }
                        ),
                        CoursesEnrolledAPI.deleteEnrolled(courseId),
                        mailAPI.sendCourseRefundMail({ reasons, message, courseName, buyerEmail, refundAmount: refundData.amount })
                    ])
                } else {
                    throw new Error(`payment can't be refunded, because the status is not captured!`);
                }
            } else {
                throw new Error('paymentId is undefined!')
            }
            console.log(data, 'response data');

            await revalidate('/my-courses');
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
            setIsRefundLoading(false);
            setIsRefundModalOpen(false);
        }
    }

    return { handleRefund, isRefundLoading, isRefundEligable };
};
