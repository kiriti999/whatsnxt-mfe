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

  const handlePurchaseTypeChange = (value: string) => {
    const newType = value as "free" | "paid";
    setPurchaseType(newType);
    
    const newPricing = {
      purchaseType: newType,
      price: newType === "paid" ? price : undefined,
    };
    
    if (onChange) {
      onChange(newPricing);
    }
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
    <Paper shadow="sm" p="md" withBorder>
      <Stack gap="md">
        <div>
          <Text size="lg" fw={600} mb="xs">
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
  );
};

export default LabPricingForm;
