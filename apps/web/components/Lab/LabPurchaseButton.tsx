"use client";

import React, { useState } from "react";
import { Button, Modal, Text, Stack, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";

interface LabPurchaseButtonProps {
  labId: string;
  labTitle: string;
  price: number;
  onPurchaseComplete?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const LabPurchaseButton: React.FC<LabPurchaseButtonProps> = ({
  labId,
  labTitle,
  price,
  onPurchaseComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const initiatePurchase = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BFF_HOST_LAB_API}/labs/${labId}/purchase/initiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to initiate purchase");
      }

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Open Razorpay payment modal
      const options = {
        key: data.data.key,
        amount: data.data.amount * 100, // Convert to paise
        currency: data.data.currency,
        name: "WhatsNxt",
        description: `Purchase: ${data.data.labTitle}`,
        order_id: data.data.orderId,
        handler: async (response: any) => {
          await verifyPayment(response);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            notifications.show({
              title: "Payment Cancelled",
              message: "You cancelled the payment process",
              color: "yellow",
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error("Error initiating purchase:", error);
      notifications.show({
        title: "Purchase Failed",
        message: error.message || "Failed to initiate purchase",
        color: "red",
      });
      setLoading(false);
    }
  };

  const verifyPayment = async (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const verifyResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BFF_HOST_LAB_API}/labs/${labId}/purchase/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        }
      );

      const data = await verifyResponse.json();

      if (!data.success) {
        throw new Error(data.message || "Payment verification failed");
      }

      notifications.show({
        title: "Purchase Successful!",
        message: "You now have access to this lab",
        color: "green",
        icon: <IconCheck size={18} />,
      });

      if (onPurchaseComplete) {
        onPurchaseComplete();
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      notifications.show({
        title: "Verification Failed",
        message: error.message || "Failed to verify payment. Please contact support.",
        color: "red",
      });
      setLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    setShowConfirmation(true);
  };

  const confirmPurchase = () => {
    setShowConfirmation(false);
    initiatePurchase();
  };

  return (
    <>
      <Button
        leftSection={<IconShoppingCart size={18} />}
        onClick={handlePurchaseClick}
        loading={loading}
        size="lg"
        color="blue"
      >
        Purchase for ₹{price.toLocaleString("en-IN")}
      </Button>

      <Modal
        opened={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Purchase"
        centered
      >
        <Stack gap="md">
          <Text>
            You are about to purchase access to <strong>{labTitle}</strong>
          </Text>
          <Text size="lg" fw={600}>
            Amount: ₹{price.toLocaleString("en-IN")}
          </Text>
          <Text size="sm" c="dimmed">
            You will be redirected to Razorpay to complete the payment.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowConfirmation(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={confirmPurchase} loading={loading}>
              Proceed to Payment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default LabPurchaseButton;
