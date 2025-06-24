// Define currency type based on what Razorpay accepts
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD' | 'SGD' | 'AED';

export type SharedArgs = {
    amount: string;
    amount_paid?: string;
    gstAmount?: string;
    gstRate?: string;
    userId?: string,
    trainerId?: string,
    buyerEmail?: string;
    buyerName?: string;
}

export type Payload = {
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

export type HandleResponseArgs = {
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

export type UseRazorProps = {
    verifyPayment?: (orderId: string, verificationDetails: RazorpayResponse) => Promise<any> | any,
    processPayment: (paymentDetails: PaymentDetails) => Promise<void> | void,
}