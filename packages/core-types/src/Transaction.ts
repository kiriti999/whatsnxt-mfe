// packages/core-types/src/Transaction.ts

export type TransactionType = 'purchase_attempt' | 'purchase_success' | 'purchase_failed';
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export interface GatewayResponse {
  orderId?: string;
  paymentId?: string;
  errorCode?: string;
  errorDescription?: string;
  raw: Record<string, any>;
}

export interface ClientContext {
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface Transaction {
  _id: string;
  studentId: string;
  labId: string;
  timestamp: Date;
  type: TransactionType;
  amount: number;
  currency: 'INR';
  status: TransactionStatus;
  gatewayResponse: GatewayResponse;
  clientContext?: ClientContext;
}
