"use client";

import {
    Button,
    Card,
    Container,
    Group,
    List,
    Modal,
    rem,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        Razorpay: any;
    }
}

const plans = [
    {
        tier: "starter",
        title: "Starter",
        price: 4999,
        description: "Perfect for single deployments",
        features: [
            "1 Deployment License",
            "Standard Support",
            "Lifetime Validity",
            "Basic Updates",
        ],
        color: "blue",
    },
    {
        tier: "pro",
        title: "Pro",
        price: 14999,
        description: "Best for growing agencies",
        features: [
            "3 Deployment Licenses",
            "Priority Support",
            "Lifetime Validity",
            "Advanced features",
        ],
        color: "grape",
        highlight: true,
    },
    {
        tier: "enterprise",
        title: "Enterprise",
        price: 49999,
        description: "For large scale needs",
        features: [
            "Unlimited Deployments",
            "Dedicated Support",
            "Lifetime Validity",
            "Custom Branding",
        ],
        color: "dark",
    },
];

export default function CuratedReelsPricingPage() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState<string | null>(null);
    const [customerDetails, setCustomerDetails] = useState({
        name: "",
        email: "",
    });
    const [showModal, setShowModal] = useState<string | null>(null); // tier name
    const [pendingPurchase, setPendingPurchase] = useState<{
        tier: string;
        details: { name: string; email: string };
    } | null>(null);
    const hasProcessedParams = useRef(false);

    const processPurchase = useCallback(
        async (tier: string, details: { name: string; email: string }) => {
            setLoading(tier);
            const plan = plans.find((p) => p.tier === tier);

            try {
                // 1. Initiate Order on Backend
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/curatedreels/orders`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount: plan?.price,
                            tier: tier,
                            customerDetails: details,
                        }),
                    },
                );

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || "Failed to create order");
                }

                // 2. Load Razorpay
                if (!window.Razorpay) {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.async = true;
                    document.body.appendChild(script);
                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                }

                // 3. Open Razorpay
                const options = {
                    key: data.key,
                    amount: data.order.amount,
                    currency: data.order.currency,
                    name: "CuratedReels License",
                    description: `${plan?.title} License`,
                    order_id: data.order.id,
                    prefill: {
                        name: details.name,
                        email: details.email,
                    },
                    handler: () => {
                        notifications.show({
                            title: "Payment Successful!",
                            message: "Your license key will be emailed to you shortly.",
                            color: "green",
                            autoClose: 10000,
                        });
                        setShowModal(null);
                        setCustomerDetails({ name: "", email: "" });
                    },
                    theme: {
                        color: "#3399cc",
                    },
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } catch (error: unknown) {
                const errorMessage =
                    error instanceof Error ? error.message : "Purchase failed";
                console.error("Purchase error:", error);
                notifications.show({
                    title: "Purchase Failed",
                    message: errorMessage,
                    color: "red",
                });
            } finally {
                setLoading(null);
            }
        },
        [],
    );

    // Read query params on mount
    useEffect(() => {
        if (hasProcessedParams.current) return;

        const tier = searchParams.get("tier");
        const name = searchParams.get("name");
        const email = searchParams.get("email");

        if (tier && name && email) {
            hasProcessedParams.current = true;
            setCustomerDetails({ name, email });
            setShowModal(tier);
            setPendingPurchase({ tier, details: { name, email } });
        } else if (tier) {
            setShowModal(tier);
            if (name) setCustomerDetails((prev) => ({ ...prev, name }));
            if (email) setCustomerDetails((prev) => ({ ...prev, email }));
        }
    }, [searchParams]);

    // Process pending purchase
    useEffect(() => {
        if (pendingPurchase) {
            const timer = setTimeout(() => {
                processPurchase(pendingPurchase.tier, pendingPurchase.details);
                setPendingPurchase(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [pendingPurchase, processPurchase]);

    const handleBuyClick = (tier: string) => {
        setShowModal(tier);
    };

    const initiatePurchase = async (tier: string) => {
        if (!customerDetails.name || !customerDetails.email) {
            notifications.show({
                title: "Missing Details",
                message: "Please enter your name and email",
                color: "red",
            });
            return;
        }

        await processPurchase(tier, customerDetails);
    };

    return (
        <Container size="lg" py="xl">
            <Stack align="center" mb={50}>
                <Title order={1}>CuratedReels Licenses</Title>
                <Text c="dimmed" size="lg" ta="center" maw={600}>
                    Deploy your own white-labeled CuratedReels platform. One-time payment,
                    lifetime license.
                </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
                {plans.map((plan) => (
                    <Card
                        key={plan.tier}
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{
                            borderColor: plan.highlight
                                ? "var(--mantine-color-grape-6)"
                                : undefined,
                            borderWidth: plan.highlight ? 2 : 1,
                        }}
                    >
                        <Stack justify="space-between" h="100%">
                            <div>
                                <Group justify="space-between" mb="xs">
                                    <Text fw={700} size="xl" tt="uppercase" c={plan.color}>
                                        {plan.title}
                                    </Text>
                                    {plan.highlight && (
                                        <Text
                                            size="xs"
                                            fw={700}
                                            bg="grape"
                                            c="white"
                                            px={8}
                                            py={4}
                                            style={{ borderRadius: 4 }}
                                        >
                                            POPULAR
                                        </Text>
                                    )}
                                </Group>

                                <Title order={2} mb="md">
                                    ₹{plan.price.toLocaleString("en-IN")}
                                </Title>
                                <Text c="dimmed" mb="md" size="sm">
                                    {plan.description}
                                </Text>

                                <List
                                    spacing="sm"
                                    size="sm"
                                    center
                                    icon={
                                        <ThemeIcon color={plan.color} size={20} radius="xl">
                                            <IconCheck style={{ width: rem(12), height: rem(12) }} />
                                        </ThemeIcon>
                                    }
                                >
                                    {plan.features.map((feature) => (
                                        <List.Item key={feature}>{feature}</List.Item>
                                    ))}
                                </List>
                            </div>

                            <Button
                                fullWidth
                                mt="md"
                                size="md"
                                color={plan.color}
                                variant={plan.highlight ? "filled" : "outline"}
                                onClick={() => handleBuyClick(plan.tier)}
                            >
                                Buy Now
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>

            <Modal
                opened={!!showModal}
                onClose={() => setShowModal(null)}
                title="Enter Details"
            >
                <Stack>
                    <TextInput
                        label="Name"
                        placeholder="Your Name"
                        value={customerDetails.name}
                        onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, name: e.target.value })
                        }
                    />
                    <TextInput
                        label="Email"
                        placeholder="your@email.com"
                        value={customerDetails.email}
                        onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, email: e.target.value })
                        }
                    />
                    <Button
                        loading={loading === showModal}
                        onClick={() => showModal && initiatePurchase(showModal)}
                        fullWidth
                    >
                        Proceed to Payment
                    </Button>
                </Stack>
            </Modal>
        </Container>
    );
}
