import http from '@whatsnxt/http-client';

export interface LabPurchase {
    _id: string;
    labId: string;
    purchaseDate: string;
    amountPaid: number;
    currency: string;
    transactionId: string;
    status: string;
    metadata: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
    };
    labTitle: string;
    labType?: string;
}

export interface LabPurchasesResponse {
    success: boolean;
    data: LabPurchase[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface RefundRequest {
    reasons: string[];
    message?: string;
    refundId: string;
    refundAmount: number;
    refundStatus: string;
}

export const labPurchaseAPI = {
    /**
     * Get user's lab purchases for purchase history
     * @param userId - User ID
     * @param page - Page number (optional, default 1)
     * @param pageSize - Page size (optional, default 10)
     */
    getUserLabPurchases: async function (
        userId: string,
        page: number = 1,
        pageSize: number = 10
    ): Promise<{ data: LabPurchasesResponse }> {
        const response = await http.get<LabPurchasesResponse>(
            `/labs/purchases/user/${userId}?page=${page}&pageSize=${pageSize}`
        );
        return { data: response };
    },

    /**
     * Request a refund for a lab purchase
     * @param labId - Lab ID
     * @param refundData - Refund request data
     */
    requestRefund: async function (
        labId: string,
        refundData: RefundRequest
    ): Promise<{ success: boolean; message: string }> {
        const response = await http.post<{ success: boolean; message: string }>(
            `/labs/${labId}/refund`,
            refundData
        );
        return response;
    },
};

