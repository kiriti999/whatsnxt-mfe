"use client";

import {
    Accordion,
    Anchor,
    Badge,
    Button,
    Container,
    SimpleGrid,
    Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCrown } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { premiumAPI } from "../../apis/v1/premium";
import useAuth from "../../hooks/Authentication/useAuth";
import styles from "./premium.module.css";

/** Plan feature item */
interface PlanFeature {
    text: string;
}

/** Pricing plan definition */
interface PricingPlan {
    name: string;
    planKey: "monthly" | "annual" | "lifetime";
    duration: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    features: PlanFeature[];
    badge?: string;
    badgeColor?: string;
    highlighted: boolean;
    ctaLabel: string;
}

const PLANS: PricingPlan[] = [
    {
        name: "Monthly",
        planKey: "monthly",
        duration: "1 month access",
        price: 499,
        features: [
            { text: "Full access to all premium tutorials" },
            // { text: 'Full access to Guided Practice' },
            { text: "New content released regularly" },
            { text: "Limited access to AI Tutor" },
            { text: "One-time payment (no auto-renewal)" },
        ],
        highlighted: false,
        ctaLabel: "Get Monthly",
    },
    {
        name: "Annual",
        planKey: "annual",
        duration: "1 year access",
        price: 2999,
        originalPrice: 5988,
        discount: "50% OFF",
        features: [
            { text: "Everything in Monthly" },
            { text: "Save 50% compared to Monthly" },
            { text: "Unlimited access to AI Tutor" },
            { text: "One-time payment (no auto-renewal)" },
            { text: "Upgrade to Lifetime anytime" },
        ],
        badge: "Popular",
        badgeColor: "green",
        highlighted: true,
        ctaLabel: "Get Annual",
    },
    {
        name: "Lifetime",
        planKey: "lifetime",
        duration: "Forever access",
        price: 4999,
        originalPrice: 11976,
        discount: "60% OFF",
        features: [
            { text: "Everything in Annual" },
            { text: "Pay once, access forever" },
            { text: "All future premium content included" },
        ],
        badge: "Best Value",
        badgeColor: "green",
        highlighted: true,
        ctaLabel: "Get Lifetime",
    },
];

const FAQ_ITEMS = [
    {
        question: "What is WhatsnXT Premium?",
        answer:
            "WhatsnXT Premium gives you unlimited access to all premium structured tutorials, guided practice labs and AI-powered learning tools.",
    },
    {
        question: "What is included in WhatsnXT Premium?",
        answer:
            "Premium includes access to all premium structured tutorials, hands-on guided practice, AI Tutor for personalized help, and exclusive content released regularly.",
    },
    {
        question: "What happens when my access expires?",
        answer:
            "When your Monthly or Annual plan expires, you lose access to premium content. You can resubscribe anytime to resume. Lifetime plans never expire.",
    },
    {
        question: "Do you offer refunds?",
        answer:
            "We do not offer refunds for structured tutorials. You can explore the free content first, and upgrade if the learning style and quality match what youre looking for.",
    },
    {
        question: "How often is new content added?",
        answer:
            "We regularly update our platform with new problems, solutions, and learning materials. We also incorporate feedback from our community to improve existing content.",
    },
    {
        question: "Can I share my account with others?",
        answer:
            "No, each premium subscription is for individual use only. Sharing account credentials is a violation of our terms of service.",
    },
    {
        question: "How is WhatsnXT different from other platforms?",
        answer:
            "WhatsnXT combines structured tutorials with hands-on guided practice labs and an AI Tutor — all in one integrated platform. Our content is curated by industry trainers and designed for real-world application.",
    },
];

/** Renders a single feature line item with checkmark */
function FeatureItem({ text }: PlanFeature) {
    return (
        <li className={styles.featureItem}>
            <IconCheck size={16} className={styles.featureIcon} />
            <span>{text}</span>
        </li>
    );
}

/** Renders one pricing card */
function PricingCard({
    plan,
    onSubscribe,
    subscribing,
}: {
    plan: PricingPlan;
    onSubscribe: (planKey: string) => void;
    subscribing: boolean;
}) {
    const cardClasses = `${styles.pricingCard} ${plan.highlighted ? styles.pricingCardHighlighted : ""}`;
    const buttonClasses = `${styles.ctaButton} ${plan.highlighted ? styles.ctaButtonHighlighted : styles.ctaButtonDefault}`;

    return (
        <div className={cardClasses}>
            {plan.badge && (
                <Badge
                    className={styles.ribbonBadge}
                    color={plan.badgeColor}
                    variant="filled"
                    size="md"
                >
                    {plan.badge}
                </Badge>
            )}

            <div className={styles.planTitle}>{plan.name}</div>
            <div className={styles.planDuration}>{plan.duration}</div>

            {plan.discount && (
                <div className={styles.discountLabel}>{plan.discount}</div>
            )}

            <div className={styles.priceWrapper}>
                <span className={styles.price}>
                    ₹{plan.price.toLocaleString("en-IN")}
                </span>
                {plan.originalPrice && (
                    <span className={styles.originalPrice}>
                        ₹{plan.originalPrice.toLocaleString("en-IN")}
                    </span>
                )}
            </div>

            <ul className={styles.featuresList}>
                {plan.features.map((feature) => (
                    <FeatureItem key={feature.text} text={feature.text} />
                ))}
            </ul>

            <Button
                className={buttonClasses}
                radius="md"
                size="md"
                loading={subscribing}
                onClick={() => onSubscribe(plan.planKey)}
            >
                {plan.ctaLabel}
            </Button>
        </div>
    );
}

export default function PremiumPage() {
    const { user, isAuthenticated } = useAuth();
    const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);

    const verifyAndComplete = useCallback(
        async (
            planKey: string,
            response: {
                razorpay_payment_id: string;
                razorpay_order_id: string;
                razorpay_signature: string;
            },
        ) => {
            try {
                await premiumAPI.verifySubscription(
                    planKey,
                    response.razorpay_order_id,
                    response.razorpay_payment_id,
                    response.razorpay_signature,
                );
                notifications.show({
                    title: "Welcome to Premium!",
                    message: "Your subscription is now active. Enjoy unlimited access.",
                    color: "green",
                });
            } catch {
                notifications.show({
                    title: "Verification failed",
                    message:
                        "Payment was received but verification failed. Contact support@whatsnxt.in.",
                    color: "red",
                });
            }
            setSubscribingPlan(null);
        },
        [],
    );

    const openRazorpayModal = useCallback(
        (
            orderData: { orderId: string; amount: number; currency?: string },
            planKey: string,
        ) => {
            const planLabel =
                PLANS.find((p) => p.planKey === planKey)?.name ?? planKey;

            const rzp = new window.Razorpay({
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY as string,
                order_id: orderData.orderId,
                amount: orderData.amount,
                currency: orderData.currency || "INR",
                name: "WhatsNxt Premium",
                description: `${planLabel} Subscription`,
                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    await verifyAndComplete(planKey, response);
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                theme: { color: "#12b886" },
                modal: {
                    ondismiss: () => setSubscribingPlan(null),
                },
            });

            rzp.on("payment.failed", () => {
                notifications.show({
                    title: "Payment failed",
                    message: "The payment could not be processed. Please try again.",
                    color: "red",
                });
                setSubscribingPlan(null);
            });

            rzp.open();
        },
        [user, verifyAndComplete],
    );

    const handleSubscribe = useCallback(
        async (planKey: string) => {
            if (!isAuthenticated) {
                notifications.show({
                    title: "Sign in required",
                    message: "Please sign in to subscribe.",
                    color: "yellow",
                });
                return;
            }

            setSubscribingPlan(planKey);
            try {
                const { data: orderData } =
                    await premiumAPI.initiateSubscription(planKey);

                if (!window.Razorpay) {
                    notifications.show({
                        title: "Payment system loading",
                        message: "Please wait a moment and try again.",
                        color: "yellow",
                    });
                    setSubscribingPlan(null);
                    return;
                }

                openRazorpayModal(orderData, planKey);
            } catch {
                notifications.show({
                    title: "Something went wrong",
                    message: "Could not initiate payment. Please try again.",
                    color: "red",
                });
                setSubscribingPlan(null);
            }
        },
        [isAuthenticated, openRazorpayModal],
    );

    return (
        <Container size="xl" className={styles.premiumPage}>
            {/* Hero */}
            <div className={styles.hero}>
                <Badge
                    color="green"
                    variant="light"
                    size="lg"
                    mb="md"
                    leftSection={<IconCrown size={14} />}
                >
                    Upgrade to Premium
                </Badge>
                <h1 className={styles.heroTitle}>
                    Unlock your full learning potential
                </h1>
                <p className={styles.heroSubtitle}>
                    Get unlimited access to all premium tutorials, guided practice, and
                    AI-powered learning tools.
                </p>
            </div>

            {/* Pricing cards */}
            <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3 }}
                spacing="xl"
                className={styles.pricingGrid}
            >
                {PLANS.map((plan) => (
                    <PricingCard
                        key={plan.name}
                        plan={plan}
                        onSubscribe={handleSubscribe}
                        subscribing={subscribingPlan === plan.planKey}
                    />
                ))}
            </SimpleGrid>

            {/* Support text */}
            <Text className={styles.supportText}>
                If you face any issues with payment, please reach out at{" "}
                <Anchor
                    href="mailto:support@whatsnxt.in"
                    className={styles.supportLink}
                >
                    support@whatsnxt.in
                </Anchor>
            </Text>

            {/* FAQ */}
            <div className={styles.faqSection}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                <Accordion variant="separated" radius="md">
                    {FAQ_ITEMS.map((item) => (
                        <Accordion.Item key={item.question} value={item.question}>
                            <Accordion.Control>
                                <Text fw={500}>{item.question}</Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Text size="sm" c="dimmed">
                                    {item.answer}
                                </Text>
                            </Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>

            {/* Bottom banner */}
            <div className={styles.bottomBanner}>
                <Text size="sm" c="dimmed">
                    All plans include access to premium content, priority support, and
                    regular updates.
                </Text>
                <Text size="sm" c="dimmed">
                    Questions? Email us at{" "}
                    <Anchor
                        href="mailto:support@whatsnxt.in"
                        className={styles.supportLink}
                    >
                        support@whatsnxt.in
                    </Anchor>
                </Text>
            </div>
        </Container>
    );
}
