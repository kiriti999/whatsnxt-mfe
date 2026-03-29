"use client";

import {
    Box,
    Button,
    Center,
    Divider,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCrown, IconLock } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { premiumAPI } from "../../apis/v1/premium";
import useAuth from "../../hooks/Authentication/useAuth";
import styles from "./PremiumPaywall.module.css";

interface PremiumPaywallProps {
    tutorialId: string;
    tutorialTitle?: string;
    contentType?: "tutorial" | "course";
    onAccessGranted?: () => void;
}

/**
 * Paywall component shown when premium content is locked.
 * Offers dual CTA: one-off tutorial purchase (₹199) or subscription link.
 */
export function PremiumPaywall({
    tutorialId,
    tutorialTitle,
    contentType = "tutorial",
    onAccessGranted,
}: PremiumPaywallProps) {
    const { user, isAuthenticated } = useAuth();
    const [purchasing, setPurchasing] = useState(false);
    const label = contentType === "course" ? "course" : "tutorial";

    const handleBuyTutorial = useCallback(async () => {
        if (!isAuthenticated) {
            notifications.show({
                title: "Sign in required",
                message: `Please sign in to purchase this ${label}.`,
                color: "yellow",
            });
            return;
        }

        setPurchasing(true);
        try {
            const initiatePurchase = contentType === "course"
                ? premiumAPI.initiateCoursePurchase
                : premiumAPI.initiateTutorialPurchase;
            const { data: orderData } = await initiatePurchase(tutorialId);

            if (!window.Razorpay) {
                notifications.show({
                    title: "Payment system loading",
                    message: "Please wait a moment and try again.",
                    color: "yellow",
                });
                setPurchasing(false);
                return;
            }

            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string,
                order_id: orderData.orderId,
                amount: orderData.amount,
                currency: orderData.currency || "INR",
                name: "WhatsNxt",
                description: tutorialTitle
                    ? `Unlock: ${tutorialTitle}`
                    : `${label.charAt(0).toUpperCase()}${label.slice(1)} Purchase`,
                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    try {
                        const verifyPurchase = contentType === "course"
                            ? premiumAPI.verifyCoursePurchase
                            : premiumAPI.verifyTutorialPurchase;
                        await verifyPurchase(
                            tutorialId,
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                        );
                        notifications.show({
                            title: "Purchase successful!",
                            message: `You now have access to this ${label}.`,
                            color: "green",
                        });
                        onAccessGranted?.();
                    } catch {
                        notifications.show({
                            title: "Verification failed",
                            message:
                                "Payment was made but verification failed. Contact support.",
                            color: "red",
                        });
                    }
                    setPurchasing(false);
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: { color: "#12b886" },
                modal: {
                    ondismiss: () => {
                        setPurchasing(false);
                    },
                },
            });

            rzp.on("payment.failed", () => {
                notifications.show({
                    title: "Payment failed",
                    message: "The payment could not be processed. Please try again.",
                    color: "red",
                });
                setPurchasing(false);
            });

            rzp.open();
        } catch (error: unknown) {
            const status = (error as { response?: { status?: number } })?.response?.status;
            if (status === 409) {
                notifications.show({
                    title: "Already purchased",
                    message: `You already have access to this ${label}.`,
                    color: "green",
                });
                onAccessGranted?.();
            } else {
                notifications.show({
                    title: "Error",
                    message: "Could not initiate purchase. Please try again.",
                    color: "red",
                });
            }
            setPurchasing(false);
        }
    }, [isAuthenticated, tutorialId, tutorialTitle, contentType, label, user, onAccessGranted]);

    return (
        <Center py={60}>
            <Box className={styles.paywallWrapper}>
                <Paper className={styles.paywallCard} p="xl">
                    <Stack align="center" gap="md">
                        <IconLock size={44} className={styles.lockIcon} />
                        <Title order={3} ta="center">
                            Premium Content
                        </Title>
                        <Text c="dimmed" ta="center" size="sm">
                            This {label} is part of our premium content. Unlock it with a
                            one-time purchase or subscribe for full access to all {label}s.
                        </Text>

                        {/* One-off purchase CTA */}
                        <Button
                            fullWidth
                            size="md"
                            radius="md"
                            className={styles.buyButton}
                            loading={purchasing}
                            onClick={handleBuyTutorial}
                        >
                            Buy this {label} — ₹199
                        </Button>

                        <Divider
                            label="or"
                            labelPosition="center"
                            className={styles.dividerText}
                            w="100%"
                        />

                        {/* Subscription CTA */}
                        <Button
                            fullWidth
                            variant="default"
                            size="md"
                            radius="md"
                            className={styles.subscribeButton}
                            component={Link}
                            href="/premium"
                            leftSection={<IconCrown size={18} />}
                        >
                            Subscribe from ₹499/month
                        </Button>

                        <Text size="xs" c="dimmed" ta="center">
                            Subscribers get unlimited access to all premium {label}s.
                        </Text>
                    </Stack>
                </Paper>
            </Box>
        </Center>
    );
}

export default PremiumPaywall;
