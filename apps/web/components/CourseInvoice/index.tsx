import { Anchor, Box, Container, Divider, Grid, GridCol, Group, Table, Text, Title } from "@mantine/core";

const CourseInvoice = ({ order }) => {
    const date = new Date(order.created_at * 1000);

    // Get local date in YYYY-MM-DD format
    const formattedDate = date.toLocaleDateString();

    // Convert amounts to display format
    const formatAmount = (amount) => {
        // Check if amount is in paisa/subunits (needs division by 100)
        const isInSubunits = amount > 1000 && String(amount).length > 4;
        const value = isInSubunits ? (amount / 100) : amount;
        return value.toFixed(2);
    };

    // Check if GST is available
    const hasGST = order.gstAmount && order.gstAmount > 0;

    // Get subtotal and GST
    const subtotal = hasGST ? (order.subtotal || (order.amount - order.gstAmount)) : order.amount;
    const gstAmount = hasGST ? order.gstAmount : 0;
    const totalAmount = order.amount;

    return (
        <Container mb={2}>
            <Title order={1} mb="md">Invoice</Title>
            <Text size="sm" mb="xl">Invoice for Cart - {formattedDate}</Text>

            {/* Company and Order Info */}
            <Grid mb="xl">
                <GridCol span={6}>
                    <Box>
                        <Title order={4}>Whats Nxt</Title>
                        <Text size="sm">
                            Plot 14 1st floor Jupiter colony, Karkhana, Hyderabad, India
                        </Text>
                        <Anchor href="https://www.whatsnxt.in" size="sm">whatsnxt.in</Anchor>
                    </Box>
                </GridCol>
                <GridCol span={6} style={{ textAlign: 'right' }}>
                    <Box>
                        <Text>Date: <strong>{formattedDate}</strong></Text>
                        <Text>Order #: <strong>{order.receipt}</strong></Text>
                        <Text>Currency: <strong>{order.currency}</strong></Text>
                        {hasGST && (
                            <Text>GST Rate: <strong>{order.gstRate}</strong></Text>
                        )}
                    </Box>
                </GridCol>
            </Grid>

            {/* Sold To */}
            <Box mb="xl">
                <Text fw={700}>Sold To:</Text>
                <Text>{order.buyer || "Student"}</Text>
            </Box>

            {/* Table for Items */}
            <Table striped highlightOnHover mb={0}>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Ordered</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {order.courseInfo && order.courseInfo.map((item) => (
                        <tr key={item._id || item.courseId}>
                            <td>{item.courseName}</td>
                            <td>{formattedDate}</td>
                            <td>{order.quantity || 1}</td>
                            <td>₹{item.price}</td>
                            <td>₹{item.total_cost || item.price}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Divider mb={'lg'} />
            {/* Totals */}
            <Box style={{ textAlign: 'right' }} mb="xl">
                <Group justify="flex-end" gap="md">
                    <Text m={0} size='sm'>Subtotal:</Text>
                    <Text size='sm'>₹{formatAmount(subtotal)}</Text>
                </Group>

                {/* Show GST if available */}
                {hasGST && (
                    <Group justify="flex-end" gap="md">
                        <Text m={0} size='sm'>GST ({order.gstRate}):</Text>
                        <Text size='sm'>₹{formatAmount(gstAmount)}</Text>
                    </Group>
                )}

                {/* Only show tax line if no GST and tax exists */}
                {!hasGST && (
                    <Group justify="flex-end" gap="md">
                        <Text size='sm'>Tax*:</Text>
                        <Text size='sm'>₹0.00</Text>
                    </Group>
                )}

                <Group justify="flex-end" gap="md" mt="xs">
                    <Text m={0} size='sm'>Total Paid:</Text>
                    <Text size='sm'><b>₹{formatAmount(totalAmount)}</b></Text>
                </Group>
            </Box>

            {hasGST && (
                <Box mb="md">
                    {/* <Text size="xs">*GST Registration Number: 36AABCW6430A1Z8</Text> */}
                </Box>
            )}

            <Text size="xs" my="sm">
                If you have any questions about this invoice please contact our <Anchor href="/contact-us">support team</Anchor>.
            </Text>
        </Container>
    );
};

export default CourseInvoice;