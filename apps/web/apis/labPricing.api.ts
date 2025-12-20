/**
 * Lab Pricing API Client
 * Handles all API calls for lab pricing and purchase operations
 */

const LAB_API_BASE = process.env.NEXT_PUBLIC_BFF_HOST_LAB_API;

export interface PricingData {
  purchaseType: "free" | "paid";
  price?: number;
}

export interface PurchaseInitiateResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  labTitle: string;
}

export interface VerifyPurchaseData {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface AccessCheckResponse {
  hasAccess: boolean;
  reason?: "free" | "purchased" | "course_enrollment";
}

/**
 * Get lab pricing information
 */
export async function getLabPricing(labId: string): Promise<any> {
  const response = await fetch(`${LAB_API_BASE}/labs/${labId}/pricing`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch lab pricing");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Set or update lab pricing
 */
export async function setLabPricing(
  labId: string,
  pricing: PricingData
): Promise<any> {
  const response = await fetch(`${LAB_API_BASE}/labs/${labId}/pricing`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(pricing),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update pricing");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Initiate lab purchase
 */
export async function initiatePurchase(
  labId: string
): Promise<PurchaseInitiateResponse> {
  const response = await fetch(
    `${LAB_API_BASE}/labs/${labId}/purchase/initiate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to initiate purchase");
  }

  const data = await response.json();
  return data.data;
}

/**
 * Verify purchase after payment
 */
export async function verifyPurchase(
  labId: string,
  verifyData: VerifyPurchaseData
): Promise<any> {
  const response = await fetch(
    `${LAB_API_BASE}/labs/${labId}/purchase/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(verifyData),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to verify purchase");
  }

  const data = await response.json();
  return data;
}

/**
 * Check if user has access to a lab
 */
export async function checkLabAccess(labId: string): Promise<AccessCheckResponse> {
  const response = await fetch(`${LAB_API_BASE}/labs/${labId}/access`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to check lab access");
  }

  const data = await response.json();
  return data.data;
}
