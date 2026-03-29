import http from "@whatsnxt/http-client";

// ── Types ────────────────────────────────────────────────────────

export interface PremiumPlan {
    plan: "monthly" | "annual" | "lifetime";
    price: number;
    duration: string;
    currency: string;
}

export interface PlansResponse {
    success: boolean;
    data: {
        subscriptionPlans: PremiumPlan[];
        tutorialOneOffPrice: number;
        currency: string;
    };
}

export interface RazorpayOrderData {
    orderId: string;
    amount: number;
    currency: string;
    plan?: string;
    tutorialId?: string;
}

export interface PremiumAccessResult {
    hasAccess: boolean;
    reason: "subscription" | "purchase" | "free" | "none";
    isFreePreview?: boolean;
}

export interface PremiumStatusData {
    isActive: boolean;
    plan: string | null;
    expiresAt: string | null;
    purchasedTutorialIds: string[];
}

export interface TutorialPurchaseItem {
    _id: string;
    tutorialId: {
        _id: string;
        title: string;
        slug: string;
    } | string;
    amountPaid: number;
    currency: string;
    status: string;
    transactionId: string;
    createdAt: string;
}

export interface CoursePurchaseItem {
    _id: string;
    courseId: {
        _id: string;
        title: string;
        slug: string;
    } | string;
    amountPaid: number;
    currency: string;
    status: string;
    transactionId: string;
    createdAt: string;
}

export interface PurchaseHistoryData {
    subscriptions: Array<{
        plan: string;
        status: string;
        amountPaid: number;
        startDate: string;
        expiresAt: string | null;
    }>;
    tutorialPurchases: TutorialPurchaseItem[];
    coursePurchases: CoursePurchaseItem[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// ── API Client ───────────────────────────────────────────────────

export const premiumAPI = {
    /** Get available subscription plans (public) */
    getPlans: async (): Promise<PlansResponse> => {
        return http.get<PlansResponse>("/premium/plans");
    },

    /** Initiate subscription purchase — returns Razorpay order */
    initiateSubscription: async (
        plan: string,
    ): Promise<ApiResponse<RazorpayOrderData>> => {
        return http.post<ApiResponse<RazorpayOrderData>>(
            "/premium/subscribe/initiate",
            { plan },
        );
    },

    /** Verify subscription payment */
    verifySubscription: async (
        plan: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return http.post<ApiResponse<{ success: boolean }>>(
            "/premium/subscribe/verify",
            { plan, razorpayOrderId, razorpayPaymentId, razorpaySignature },
        );
    },

    /** Initiate one-off tutorial purchase — returns Razorpay order */
    initiateTutorialPurchase: async (
        tutorialId: string,
    ): Promise<ApiResponse<RazorpayOrderData>> => {
        return http.post<ApiResponse<RazorpayOrderData>>(
            `/premium/tutorial/${tutorialId}/purchase/initiate`,
        );
    },

    /** Verify one-off tutorial purchase */
    verifyTutorialPurchase: async (
        tutorialId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return http.post<ApiResponse<{ success: boolean }>>(
            `/premium/tutorial/${tutorialId}/purchase/verify`,
            { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        );
    },

    /** Check access for a specific tutorial */
    checkAccess: async (
        tutorialId: string,
    ): Promise<ApiResponse<PremiumAccessResult>> => {
        return http.get<ApiResponse<PremiumAccessResult>>(
            `/premium/access/${tutorialId}`,
        );
    },

    /** Initiate one-off course purchase — returns Razorpay order */
    initiateCoursePurchase: async (
        courseId: string,
    ): Promise<ApiResponse<RazorpayOrderData>> => {
        return http.post<ApiResponse<RazorpayOrderData>>(
            `/premium/course/${courseId}/purchase/initiate`,
        );
    },

    /** Verify one-off course purchase */
    verifyCoursePurchase: async (
        courseId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string,
    ): Promise<ApiResponse<{ success: boolean }>> => {
        return http.post<ApiResponse<{ success: boolean }>>(
            `/premium/course/${courseId}/purchase/verify`,
            { razorpayOrderId, razorpayPaymentId, razorpaySignature },
        );
    },

    /** Check access for a specific course */
    checkCourseAccess: async (
        courseId: string,
    ): Promise<ApiResponse<PremiumAccessResult>> => {
        return http.get<ApiResponse<PremiumAccessResult>>(
            `/premium/course-access/${courseId}`,
        );
    },

    /** Get user's premium subscription status */
    getStatus: async (): Promise<ApiResponse<PremiumStatusData>> => {
        return http.get<ApiResponse<PremiumStatusData>>("/premium/status");
    },

    /** Get user's purchase history */
    getPurchases: async (): Promise<ApiResponse<PurchaseHistoryData>> => {
        return http.get<ApiResponse<PurchaseHistoryData>>("/premium/purchases");
    },
};
