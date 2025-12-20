import { useState } from "react";
import Link from "next/link";
import { Anchor, Button, Group, Pagination, Table } from "@mantine/core";
import { getPaymentType } from "./helper";

const PAGE_SIZE = 3;

const TeacherTable = ({ payments, totalCount }) => {
    const [activePage, setActivePage] = useState(1);
    const paginatedData = (payments || []).slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
    const domain = process.env.NEXT_PUBLIC_MFE_HOST;

    if (payments.length === 0) {
        return <></>;
    }

    return (
        <>
            <Table highlightOnHover striped>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th style={{ textAlign: 'left' }}>Trainer contact viewed</Table.Th>
                        <Table.Th style={{ textAlign: 'left' }}>Date</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Total Price</Table.Th>
                        <Table.Th style={{ textAlign: 'left' }}>Payment Type</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {paginatedData?.map((item) => {
                        const { cardNetwork, cardLast4, method, bank, wallet } = item;
                        const formatedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        const paymentType = getPaymentType({ cardNetwork, cardLast4, method, bank, wallet });
                        return (
                            <Table.Tr key={item._id}>
                                <Table.Td style={{ verticalAlign: 'middle' }}>
                                    <Anchor href={`${domain}/trainer-details/${item.trainerInfo?._id || ''}`} target="_blank">
                                        {item.trainerInfo?.name || 'N/A'}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td style={{ verticalAlign: 'middle' }}>{formatedDate}</Table.Td>
                                <Table.Td style={{ verticalAlign: 'middle', textAlign: 'right' }}>₹{item.cost / 100}</Table.Td>
                                <Table.Td style={{ verticalAlign: 'middle' }}>{paymentType}</Table.Td>
                                <Table.Td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                                    <Group justify="flex-end">
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            component="a"
                                            target="_blank"
                                            href={`/purchase-history/teacher-contacted-invoice/${item.orderId}`}
                                        >
                                            Invoice
                                        </Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </Table.Tbody>
            </Table>
            <Pagination
                total={Math.ceil(totalCount / PAGE_SIZE)}
                value={activePage}
                onChange={setActivePage}
                my="md"
            />
        </>
    )
};

export default TeacherTable;
