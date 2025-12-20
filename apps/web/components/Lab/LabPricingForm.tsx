"use client";

import React, { useState } from "react";
import {
  Radio,
  Group,
  NumberInput,
  Stack,
  Text,
  Paper,
  Button,
  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface LabPricingFormProps {
  initialPricing?: {
    purchaseType: "free" | "paid";
    price?: number;
  };
  labId?: string;
  onSave?: (pricing: { purchaseType: "free" | "paid"; price?: number }) => void;
  onChange?: (pricing: { purchaseType: "free" | "paid"; price?: number }) => void;
  disabled?: boolean;
}

export const LabPricingForm: React.FC<LabPricingFormProps> = ({
  initialPricing,
  labId,
  onSave,
  onChange,
  disabled = false,
}) => {
  const [purchaseType, setPurchaseType] = useState<"free" | "paid">(
    initialPricing?.purchaseType || "free"
  );
  const [price, setPrice] = useState<number | undefined>(
    initialPricing?.price
  );
  const [loading, setLoading] = useState(false);
  const [showFreeToPaidModal, setShowFreeToPaidModal] = useState(false);
  const [pendingPurchaseType, setPendingPurchaseType] = useState<"free" | "paid" | null>(null);

  const handlePurchaseTypeChange = (value: string) => {
    const newType = value as "free" | "paid";
    
    // If changing from free to paid, show confirmation dialog
    if (initialPricing?.purchaseType === "free" && newType === "paid" && labId) {
      setPendingPurchaseType(newType);
      setShowFreeToPaidModal(true);
      return;
    }
    
    setPurchaseType(newType);
    
    const newPricing = {
      purchaseType: newType,
      price: newType === "paid" ? price : undefined,
    };
    
    if (onChange) {
      onChange(newPricing);
    }
  };

  const confirmFreeToPaidConversion = () => {
    if (pendingPurchaseType) {
      setPurchaseType(pendingPurchaseType);
      
      const newPricing = {
        purchaseType: pendingPurchaseType,
        price: pendingPurchaseType === "paid" ? price : undefined,
      };
      
      if (onChange) {
        onChange(newPricing);
      }
    }
    
    setShowFreeToPaidModal(false);
    setPendingPurchaseType(null);
  };

  const cancelFreeToPaidConversion = () => {
    setShowFreeToPaidModal(false);
    setPendingPurchaseType(null);
  };

  const handlePriceChange = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    setPrice(isNaN(numValue) ? undefined : numValue);
    
    if (onChange) {
      onChange({
        purchaseType,
        price: isNaN(numValue) ? undefined : numValue,
      });
    }
  };

  const validatePrice = (): boolean => {
    if (purchaseType === "paid") {
      if (!price || price < 10 || price > 100000) {
        notifications.show({
          title: "Invalid Price",
          message: "Price must be between ₹10 and ₹100,000",
          color: "red",
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validatePrice()) {
      return;
    }

    setLoading(true);
    try {
      const pricingData = {
        purchaseType,
        price: purchaseType === "paid" ? price : undefined,
      };

      if (onSave) {
        await onSave(pricingData);
      }

      notifications.show({
        title: "Success",
        message: "Pricing saved successfully",
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Failed to save pricing",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Text size="md" fw={600} mb="xs">
              Lab Pricing
            </Text>
            <Text size="sm" c="dimmed">
              Set how students will access this lab
            </Text>
          </div>

          <Radio.Group
            value={purchaseType}
            onChange={handlePurchaseTypeChange}
            name="purchaseType"
            label="Access Type"
            required
          >
            <Group mt="xs">
              <Radio
                value="free"
                label="Free Access"
                description="Students can access this lab for free"
                disabled={disabled}
              />
              <Radio
                value="paid"
                label="Paid Access"
                description="Students must purchase to access"
                disabled={disabled}
              />
            </Group>
          </Radio.Group>

          {purchaseType === "paid" && (
            <NumberInput
              label="Price (₹)"
              placeholder="Enter price in INR"
              value={price}
              onChange={handlePriceChange}
              min={10}
              max={100000}
              step={10}
              prefix="₹"
              thousandSeparator=","
              required
              disabled={disabled}
              description="Minimum ₹10, Maximum ₹100,000"
              error={
                price !== undefined && (price < 10 || price > 100000)
                  ? "Price must be between ₹10 and ₹100,000"
                  : undefined
              }
            />
          )}

          {onSave && labId && (
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={disabled || (purchaseType === "paid" && !price)}
            >
              Save Pricing
            </Button>
          )}
        </Stack>
      </Paper>

      <Modal
        opened={showFreeToPaidModal}
        onClose={cancelFreeToPaidConversion}
        title="Confirm Free to Paid Conversion"
        centered
      >
        <Stack gap="md">
          <Text>
            You are about to change this lab from <strong>free</strong> to <strong>paid</strong>.
          </Text>
          <Text size="sm" c="dimmed">
            Students who have already accessed this lab will retain their access for free (grandfathered).
            Only new students will need to purchase the lab.
          </Text>
          <Text size="sm" fw={500}>
            Are you sure you want to proceed?
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={cancelFreeToPaidConversion}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={confirmFreeToPaidConversion}
            >
              Confirm Conversion
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default LabPricingForm;
