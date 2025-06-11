export type PaymentButtonProps = {
    amount: string;
    loading: boolean;
    cartItems: any[]; // Assuming cartItems is an array of objects
    onClearCart: () => void;
    open: () => void,
    close: () => void,
};

export type RazorpayOptions = {
    key: string;
    order_id: string;
    amount: string;
    currency: string;
    name: string;
    description?: string;
    buyerEmail: string;
    receipt: string;
    image?: string;
    handler: (response: RazorpayResponse) => void;
    prefill: RazorpayPrefill;
    notes: RazorpayNotes;
    theme: RazorpayTheme;
};

export type RazorpayResponse = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
};

export type RazorpayPrefill = {
    name: string;
    email: string;
    contact: string;
};

export type RazorpayNotes = {
    address?: string;
};

export type RazorpayTheme = {
    color: string;
};