// packages/types/src/Purchase.ts

export type PurchaseStatus = 'completed' | 'refunded';
export type PurchaseReason = 'purchase' | 'free_to_paid_conversion';

export interface PurchaseMetadata {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  reason?: PurchaseReason;
  convertedBy?: string; // Instructor ID
  convertedAt?: Date;
}

export interface LabPurchase {
  _id: string;
  studentId: string;
  labId: string;
  purchaseDate: Date;
  transactionId: string;
  amountPaid: number;
  currency: 'INR';
  status: PurchaseStatus;
  metadata: PurchaseMetadata;
}

export interface InitiatePurchaseRequest {
  labId: string;
}

export interface InitiatePurchaseResponse {
  orderId: string;
  amount: number;
  currency: 'INR';
  key: string;
  labTitle: string;
}

export interface VerifyPurchaseRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPurchaseResponse {
  success: boolean;
  message: string;
  purchase?: LabPurchase;
}

export interface AccessCheckResponse {
  hasAccess: boolean;
  reason?: 'free' | 'purchased' | 'course_enrollment';
  message?: string;
}
