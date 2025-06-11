import { useState } from "react";
import { Anchor, Button, Group, Pagination, Table } from "@mantine/core";
import { getPaymentType } from "./helper";

const PAGE_SIZE = 3;

const CourseTable = ({ orders, totalCount }) => {
    const [activePage, setActivePage] = useState(1);
    const paginatedData = (orders || []).slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
    const domain = process.env.NEXT_PUBLIC_MFE_HOST;


    if (orders.length === 0) {
        return <div>No orders found.</div>;
    }

    return (
        <>
            <Table highlightOnHover striped>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Date</th>
                        <th>Total Price</th>
                        <th>Payment Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData?.map((item) => {
                        const { cardNetwork, cardLast4, method, bank, wallet } = item;
                        const formatedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });
                        const paymentType = getPaymentType({ cardNetwork, cardLast4, method, bank, wallet });
                        const courseSlug = item.courseInfo?.[0]?.courseId?.slug

                        return (
                            <Table.Tr key={item._id}>
                                <Table.Td>
                                    <Anchor
                                        href={`${domain}/courses/${(courseSlug) || ''}`}
                                        target="_blank"
                                    >
                                        {item.courseInfo?.[0]?.courseId?.courseName || 'N/A'}
                                    </Anchor>
                                </Table.Td>
                                <Table.Td>{formatedDate}</Table.Td>
                                <Table.Td>₹{item.cost / 100}</Table.Td>
                                <Table.Td>{paymentType}</Table.Td>
                                <Table.Td>
                                    <Group>
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            component="a"
                                            target="_blank"
                                            href={`/purchase-history/course-invoice/${item.orderId}`}
                                        >
                                            Invoice
                                        </Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        )
                    })}
                </tbody>
            </Table>
            <Pagination
                total={Math.ceil(totalCount / PAGE_SIZE)}
                value={activePage}
                onChange={setActivePage}
                my="md"
            />
        </>
    )
}

export default CourseTable;
