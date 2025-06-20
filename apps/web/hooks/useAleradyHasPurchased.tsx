import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./Authentication/useAuth";
import { trainerContactedPaymentAPI } from "../apis/v1/trainer-contacted-payment";

export default function useAlreadyHasPurchased(trainerId: string) {
    const { user } = useAuth();
    const userId = user?._id;
    const buyerEmail = user?.email;
    const buyerName = user?.name;

    if (!userId) {
        return { notLoggedIn: true };
    }

    const payload = useMemo(() => ({
        name: 'Whatsnxt',
        description: 'Whatsnxt trainer contact purchase',
        amount: '100',
        userId,
        trainerId,
        buyerEmail,
        buyerName
    }), [userId, trainerId, buyerEmail, buyerName])

    const { data: hasPurchased, refetch: refetchQuery } = useQuery({
        queryKey: ['hasPurchased', trainerId, userId],
        queryFn: async () => {
            const { data } = await trainerContactedPaymentAPI.userAlreadyPurchased(trainerId, userId);
            return data?.hasPurchased || false;
        }
    });

    return { payload, hasPurchased, refetchQuery, userId, buyerEmail }
}
