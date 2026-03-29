import { Anchor, Badge, Pagination, Table, Title } from "@mantine/core";
import { useState } from "react";
import type { CoursePurchaseItem } from "../../apis/v1/premium";

const PAGE_SIZE = 5;

interface CoursePurchaseTableProps {
    purchases: CoursePurchaseItem[];
}

const CoursePurchaseTable = ({ purchases }: CoursePurchaseTableProps) => {
    const [activePage, setActivePage] = useState(1);
    const domain = process.env.NEXT_PUBLIC_MFE_HOST;

    const paginatedData = (purchases || []).slice(
        (activePage - 1) * PAGE_SIZE,
        activePage * PAGE_SIZE,
    );

    if (!purchases || purchases.length === 0) {
        return null;
    }

    const getCourseInfo = (purchase: CoursePurchaseItem) => {
        if (
            typeof purchase.courseId === "object" &&
            purchase.courseId !== null
        ) {
            return {
                title: purchase.courseId.title,
                slug: purchase.courseId.slug,
            };
        }
        return { title: "System Design Course", slug: "" };
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    const formatAmount = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

    return (
        <>
            <Title order={5} mt="xl" mb="sm">
                System Design Course Purchases
            </Title>
            <Table highlightOnHover striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ textAlign: "left" }}>Course</Table.Th>
                        <Table.Th style={{ textAlign: "left" }}>Date</Table.Th>
                        <Table.Th style={{ textAlign: "right" }}>Amount Paid</Table.Th>
                        <Table.Th style={{ textAlign: "left" }}>Status</Table.Th>
                        <Table.Th style={{ textAlign: "left" }}>Transaction ID</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {paginatedData.map((purchase) => {
                        const { title, slug } = getCourseInfo(purchase);
                        return (
                            <Table.Tr key={purchase._id}>
                                <Table.Td style={{ verticalAlign: "middle" }}>
                                    {slug ? (
                                        <Anchor
                                            href={`${domain}/content/system-design/${slug}`}
                                            target="_blank"
                                        >
                                            {title}
                                        </Anchor>
                                    ) : (
                                        title
                                    )}
                                </Table.Td>
                                <Table.Td style={{ verticalAlign: "middle" }}>
                                    {formatDate(purchase.createdAt)}
                                </Table.Td>
                                <Table.Td
                                    style={{ verticalAlign: "middle", textAlign: "right" }}
                                >
                                    {formatAmount(purchase.amountPaid)}
                                </Table.Td>
                                <Table.Td style={{ verticalAlign: "middle" }}>
                                    <Badge color="green" variant="light">
                                        {purchase.status}
                                    </Badge>
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        verticalAlign: "middle",
                                        fontFamily: "monospace",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    {purchase.transactionId}
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
            {purchases.length > PAGE_SIZE && (
                <Pagination
                    total={Math.ceil(purchases.length / PAGE_SIZE)}
                    value={activePage}
                    onChange={setActivePage}
                    my="md"
                />
            )}
        </>
    );
};

export default CoursePurchaseTable;
