// packages/types/src/LabPricing.ts

export type PurchaseType = 'free' | 'paid';
export type Currency = 'INR';

export interface LabPricing {
  purchaseType: PurchaseType;
  price?: number; // Required if purchaseType === 'paid'
  currency: Currency;
  updatedAt: Date;
  updatedBy: string; // Instructor ID
}

export interface SetPricingRequest {
  purchaseType: PurchaseType;
  price?: number;
}

export interface PricingValidationError {
  valid: boolean;
  error?: string;
}
