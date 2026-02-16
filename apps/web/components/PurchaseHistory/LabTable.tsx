import { useState } from "react";
import {
    Button,
    Group,
    Pagination,
    Badge,
    Text,
    Title,
    Divider,
    Paper,
    Box,
    ActionIcon,
    Modal,
    Stack,
} from "@mantine/core";
import { IconEye, IconReceipt, IconArrowBack } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { LabPurchase } from "@/apis/v1/labPurchases";
import Refund from "@/components/Refund";
import useLabRefund from "../../hooks/useLabRefund";

const PAGE_SIZE = 6;

interface LabTableProps {
    purchases: LabPurchase[];
    totalCount: number;
    onRefundSuccess?: () => void;
}

/**
 * Check if lab purchase is eligible for refund (within 24 hours)
 */
function isLabRefundEligible(purchaseDate: string): boolean {
    const refundWindowHours = 24;
    const purchaseTime = new Date(purchaseDate).getTime();
    const currentTime = new Date().getTime();
    const hoursSincePurchase = (currentTime - purchaseTime) / (1000 * 3600);
    return hoursSincePurchase <= refundWindowHours;
}

/**
 * Get time remaining for refund eligibility
 */
function getTimeRemaining(purchaseDate: string): string {
    const refundWindowHours = 24;
    const purchaseTime = new Date(purchaseDate).getTime();
    const currentTime = new Date().getTime();
    const hoursSincePurchase = (currentTime - purchaseTime) / (1000 * 3600);
    const hoursRemaining = refundWindowHours - hoursSincePurchase;

    if (hoursRemaining <= 0) return "Expired";
    if (hoursRemaining < 1) return `${Math.ceil(hoursRemaining * 60)}m remaining`;
    return `${Math.floor(hoursRemaining)}h ${Math.ceil((hoursRemaining % 1) * 60)}m remaining`;
}

interface LabCardProps {
    purchase: LabPurchase;
    onRefundClick: () => void;
}

const LabCard = ({ purchase, onRefundClick }: LabCardProps) => {
    const router = useRouter();
    const isEligibleForRefund = isLabRefundEligible(purchase.purchaseDate);
    const timeRemaining = getTimeRemaining(purchase.purchaseDate);

    const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <Paper shadow="xs" p="md" withBorder>
            <Group justify="space-between" align="flex-start">
                <Box style={{ flex: 1 }}>
                    <Group mb="xs">
                        <Text fw={700}>{purchase.labTitle || 'Unknown Lab'}</Text>
                        {purchase.labType && (
                            <Badge size="sm" variant="light" color="grape">
                                {purchase.labType}
                            </Badge>
                        )}
                    </Group>
                    <Group gap="lg" mb="xs">
                        <Text size="sm" c="dimmed">
                            Purchased: {formattedDate}
                        </Text>
                        <Text size="sm" fw={600} c="teal">
                            ₹{purchase.amountPaid}
                        </Text>
                    </Group>
                    {isEligibleForRefund && (
                        <Badge size="xs" variant="light" color="orange">
                            Refund: {timeRemaining}
                        </Badge>
                    )}
                </Box>
                <Group gap="xs">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => router.push(`/labs/${purchase.labId}`)}
                        title="View Lab"
                    >
                        <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        component="a"
                        href={`/purchase-history/lab-invoice/${purchase.transactionId}`}
                        target="_blank"
                        title="Invoice"
                    >
                        <IconReceipt size={18} />
                    </ActionIcon>
                    {isEligibleForRefund && (
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={onRefundClick}
                            title="Request Refund"
                        >
                            <IconArrowBack size={18} />
                        </ActionIcon>
                    )}
                </Group>
            </Group>
        </Paper>
    );
};

const LabTable = ({ purchases, totalCount, onRefundSuccess }: LabTableProps) => {
    const [activePage, setActivePage] = useState(1);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<LabPurchase | null>(null);

    const paginatedData = (purchases || []).slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

    const handleRefundClick = (purchase: LabPurchase) => {
        setSelectedPurchase(purchase);
        setIsRefundModalOpen(true);
    };

    const { handleRefund, isRefundLoading } = useLabRefund({
        purchase: selectedPurchase,
        setIsRefundModalOpen,
        onSuccess: onRefundSuccess,
    });

    if (purchases.length === 0) {
        return null;
    }

    return (
        <>
            <Title order={5} mt="xl" mb="md">Lab Purchases</Title>
            <Divider my="sm" />

            <Stack gap="sm">
                {paginatedData?.map((item) => (
                    <LabCard
                        key={item._id}
                        purchase={item}
                        onRefundClick={() => handleRefundClick(item)}
                    />
                ))}
            </Stack>

            {Math.ceil(totalCount / PAGE_SIZE) > 1 && (
                <Pagination
                    total={Math.ceil(totalCount / PAGE_SIZE)}
                    value={activePage}
                    onChange={setActivePage}
                    my="md"
                />
            )}

            {/* Refund Modal */}
            <Modal
                opened={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                title={<Title order={4}>Lab Refund Request</Title>}
                size="lg"
            >
                {selectedPurchase && (
                    <Box mb="md">
                        <Text size="sm" c="dimmed">Lab:</Text>
                        <Text fw={600}>{selectedPurchase.labTitle}</Text>
                        <Text size="sm" c="dimmed" mt="xs">Amount:</Text>
                        <Text fw={600} c="teal">₹{selectedPurchase.amountPaid}</Text>
                        <Divider my="md" />
                        <Badge color="orange" size="sm" mb="md">
                            You have 24 hours from purchase to request a refund
                        </Badge>
                    </Box>
                )}
                <Refund
                    handleRefund={handleRefund}
                    isRefundLoading={isRefundLoading}
                    refundWindowText="You have 24 hours to make a refund after purchase"
                />
            </Modal>
        </>
    );
};

export default LabTable;
