"use client";

import React, { useState, useEffect } from "react";
import { Button, Badge, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconLock, IconLockOpen, IconSchool } from "@tabler/icons-react";
import { LabPurchaseButton } from "./LabPurchaseButton";

interface LabAccessButtonProps {
  labId: string;
  labTitle: string;
  pricing?: {
    purchaseType: "free" | "paid";
    price?: number;
  };
  onAccessGranted?: () => void;
}

export const LabAccessButton: React.FC<LabAccessButtonProps> = ({
  labId,
  labTitle,
  pricing,
  onAccessGranted,
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [accessReason, setAccessReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [labId]);

  const checkAccess = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BFF_HOST_LAB_API}/labs/${labId}/access`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success) {
        setHasAccess(data.data.hasAccess);
        setAccessReason(data.data.reason);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLab = () => {
    if (onAccessGranted) {
      onAccessGranted();
    }
  };

  const handlePurchaseComplete = () => {
    checkAccess();
    if (onAccessGranted) {
      onAccessGranted();
    }
  };

  if (loading) {
    return (
      <Button loading size="lg">
        Checking access...
      </Button>
    );
  }

  // Free lab - always show access button
  if (pricing?.purchaseType === "free") {
    return (
      <Stack gap="xs">
        <Button
          leftSection={<IconLockOpen size={18} />}
          onClick={handleStartLab}
          size="lg"
          color="green"
        >
          Start Lab (Free)
        </Button>
        <Text size="sm" c="dimmed" ta="center">
          This lab is free for all students
        </Text>
      </Stack>
    );
  }

  // User has access - show start button with reason badge
  if (hasAccess) {
    return (
      <Stack gap="xs">
        <Button
          leftSection={<IconLockOpen size={18} />}
          onClick={handleStartLab}
          size="lg"
          color="green"
        >
          Start Lab
        </Button>
        {accessReason === "purchased" && (
          <Badge color="blue" variant="light" size="sm">
            Purchased
          </Badge>
        )}
        {accessReason === "course_enrollment" && (
          <Badge
            color="teal"
            variant="light"
            size="sm"
            leftSection={<IconSchool size={14} />}
          >
            Included in Course
          </Badge>
        )}
      </Stack>
    );
  }

  // Paid lab - no access - show purchase button
  if (pricing?.purchaseType === "paid" && pricing.price) {
    return (
      <Stack gap="xs">
        <LabPurchaseButton
          labId={labId}
          labTitle={labTitle}
          price={pricing.price}
          onPurchaseComplete={handlePurchaseComplete}
        />
        <Text size="sm" c="dimmed" ta="center">
          One-time purchase for lifetime access
        </Text>
      </Stack>
    );
  }

  // No pricing configured
  return (
    <Button
      leftSection={<IconLock size={18} />}
      disabled
      size="lg"
      color="gray"
    >
      Pricing Not Configured
    </Button>
  );
};

export default LabAccessButton;
